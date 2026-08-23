#!/usr/bin/env node

import { mkdir, readFile, writeFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import path from "node:path";
import process from "node:process";
import { pathToFileURL } from "node:url";

const DEFAULT_QUERY_SET = "docs/llm-visibility-query-set.json";
const DEFAULT_OUTPUT_DIR = "outputs/llm-visibility-benchmark-2026-08-10";
const REQUEST_TIMEOUT_MS = 90_000;
const MAX_ATTEMPTS = 4;
const PROTOCOL_VERSION = "2026-08-10-v3";

const SYSTEM_INSTRUCTIONS = [
  "Answer as an unbiased, web-enabled assistant helping a United States property-management buyer.",
  "Use public web evidence where helpful and cite the sources you rely on.",
  "Do not favor EMC2Ops or any other vendor.",
  "Do not assume the user knows EMC2Ops unless the query names it.",
  "Answer the query directly and practically in no more than 500 words.",
].join(" ");

const competitorPatterns = [
  ["AppFolio", /\bAppFolio\b/gi],
  ["Buildium", /\bBuildium\b/gi],
  ["LeadSimple", /\bLeadSimple\b/gi],
  ["EliseAI", /\bElise\s*AI\b/gi],
  ["Latchel", /\bLatchel\b/gi],
  ["Property Meld", /\bProperty\s+Meld\b/gi],
  ["HappyCo", /\bHappyCo\b/gi],
  ["Tenant Turner", /\bTenant\s+Turner\b/gi],
  ["ShowMojo", /\bShowMojo\b/gi],
  ["DoorLoop", /\bDoorLoop\b/gi],
  ["Rent Manager", /\bRent\s+Manager\b/gi],
  ["Yardi", /\bYardi\b/gi],
  ["RealPage", /\bRealPage\b/gi],
  ["Entrata", /\bEntrata\b/gi],
  ["Propertyware", /\bPropertyware\b/gi],
  ["Rentvine", /\bRentvine\b/gi],
];

const providers = {
  anthropic: {
    assistant: "Claude API",
    keyName: "ANTHROPIC_API_KEY",
    modelEnv: "ANTHROPIC_BENCHMARK_MODEL",
    defaultModel: "claude-fable-5",
    outputName: "anthropic-results.json",
    endpoint: "https://api.anthropic.com/v1/messages",
    citationRule: "Only citation objects attached to Claude text blocks count as citations.",
  },
  gemini: {
    assistant: "Gemini API",
    keyName: "GEMINI_API_KEY",
    modelEnv: "GEMINI_BENCHMARK_MODEL",
    defaultModel: "gemini-3.6-flash",
    outputName: "gemini-results.json",
    endpoint: "https://generativelanguage.googleapis.com/v1beta/models",
    citationRule: "Only web grounding chunks returned in groundingMetadata count as citations.",
  },
  perplexity: {
    assistant: "Perplexity Sonar API",
    keyName: "PERPLEXITY_API_KEY",
    modelEnv: "PERPLEXITY_BENCHMARK_MODEL",
    defaultModel: "sonar-pro",
    outputName: "perplexity-results.json",
    endpoint: "https://api.perplexity.ai/chat/completions",
    citationRule: "Only URLs in the top-level citations or search_results fields count as citations.",
  },
};

export function parseArgs(argv) {
  const args = {
    provider: "all",
    querySet: DEFAULT_QUERY_SET,
    outputDir: DEFAULT_OUTPUT_DIR,
    limit: null,
    resume: true,
    dryRun: false,
    status: false,
    visibilityMode: null,
    outputDirProvided: false,
  };

  for (let index = 0; index < argv.length; index += 1) {
    const value = argv[index];
    if (value === "--provider") args.provider = argv[++index];
    else if (value === "--query-set") args.querySet = argv[++index];
    else if (value === "--output-dir") {
      args.outputDir = argv[++index];
      args.outputDirProvided = true;
    }
    else if (value === "--visibility-mode") args.visibilityMode = argv[++index];
    else if (value === "--limit") args.limit = Number.parseInt(argv[++index], 10);
    else if (value === "--no-resume") args.resume = false;
    else if (value === "--dry-run") args.dryRun = true;
    else if (value === "--status") args.status = true;
    else if (value === "--help") {
      console.log([
        "Usage: node scripts/run-multi-assistant-visibility-benchmark.mjs [options]",
        "  --provider anthropic|gemini|perplexity|all",
        "  --query-set FILE",
        "  --output-dir DIR",
        "  --visibility-mode MODE",
        "  --limit N",
        "  --no-resume",
        "  --dry-run       Validate configuration without network calls",
        "  --status        Report credential and observation readiness without network calls",
      ].join("\n"));
      process.exit(0);
    } else {
      throw new Error(`Unknown argument: ${value}`);
    }
  }

  if (args.provider !== "all" && !providers[args.provider]) {
    throw new Error("--provider must be anthropic, gemini, perplexity, or all");
  }
  if (args.limit !== null && (!Number.isInteger(args.limit) || args.limit < 1)) {
    throw new Error("--limit must be a positive integer");
  }
  return args;
}

export function resolveVisibilityMode(querySet, requestedMode = null) {
  const modes = querySet?.runProtocol?.modes;
  if (!modes) return { mode: null, policy: null, legacy: true };
  const names = Object.keys(modes);
  if (!names.length) throw new Error("runProtocol.modes must contain at least one mode");
  const mode = requestedMode || querySet?.runProtocol?.defaultMode || (names.length === 1 ? names[0] : null);
  if (!mode) throw new Error(`--visibility-mode is required; supported modes: ${names.join(", ")}`);
  if (!modes[mode]) throw new Error(`Unsupported visibility mode: ${mode}`);
  return { mode, policy: modes[mode], legacy: false };
}

function containsEmc2OpsSeed(value) {
  const normalized = String(value).normalize("NFKC");
  return /(^|[^a-z0-9])e\s*m\s*c\s*2\s*o\s*p\s*s(?:\s*\.\s*c\s*o\s*m)?(?=$|[^a-z0-9])/i.test(normalized);
}

export function validateVisibilityMode({ querySet, requestedMode = null, outputDir = null }) {
  const resolved = resolveVisibilityMode(querySet, requestedMode);
  if (resolved.legacy) return resolved;
  for (const query of querySet.queries || []) {
    if (query.mode !== resolved.mode) {
      throw new Error(`Query ${query.id || "(unknown)"} must use visibility mode ${resolved.mode}`);
    }
    if (resolved.mode === "unpromptedOrganicVisibility") {
      if (typeof query.query !== "string" || containsEmc2OpsSeed(query.query)) {
        throw new Error(`Query ${query.id || "(unknown)"} must not seed EMC2Ops in organic visibility mode`);
      }
      if (!Array.isArray(query.tags) || query.tags.includes("brand-aware") || !query.tags.includes("brand-neutral")) {
        throw new Error(`Query ${query.id || "(unknown)"} must be tagged brand-neutral in organic visibility mode`);
      }
    }
  }
  if (!resolved.policy.promptPolicy || typeof resolved.policy.countInOrganicVisibility !== "boolean") {
    throw new Error(`Visibility mode ${resolved.mode} must declare promptPolicy and countInOrganicVisibility`);
  }
  if (!resolved.policy.outputNamespace || !resolved.policy.outputDirectory) {
    throw new Error(`Visibility mode ${resolved.mode} must declare outputNamespace and outputDirectory`);
  }
  if (outputDir) {
    const selectedOutput = path.resolve(outputDir);
    const expectedOutput = path.resolve(resolved.policy.outputDirectory);
    const organicOutput = path.resolve(querySet.runProtocol.modes.unpromptedOrganicVisibility?.outputDirectory || "");
    if (resolved.mode === "brandExplicitSiteAudit" && selectedOutput === organicOutput) {
      throw new Error("Brand-explicit visibility runs cannot use the organic output directory");
    }
    if (selectedOutput !== expectedOutput) {
      throw new Error(`Visibility mode ${resolved.mode} must use output directory ${resolved.policy.outputDirectory}`);
    }
  }
  return resolved;
}

function sleep(milliseconds) {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

function normalizeCitations(citations) {
  return citations
    .filter((citation) => citation?.url)
    .map((citation) => ({
      url: citation.url,
      title: citation.title || null,
      startIndex: Number.isInteger(citation.startIndex) ? citation.startIndex : null,
      endIndex: Number.isInteger(citation.endIndex) ? citation.endIndex : null,
    }));
}

function isEmc2OpsUrl(value) {
  try {
    const hostname = new URL(value).hostname.toLowerCase().replace(/^www\./, "");
    return hostname === "emc2ops.com" || hostname.endsWith(".emc2ops.com");
  } catch {
    return false;
  }
}

function mentionMatches(text) {
  return [...text.matchAll(/emc\s*2\s*ops/gi)].map((match) => ({
    text: match[0],
    startOffset: match.index,
    endOffset: match.index + match[0].length,
  }));
}

export function classifyProviderStatus(providerName, value) {
  const status = String(value || "").toLowerCase();
  if (providerName === "anthropic") {
    if (status === "end_turn") return "completed";
    if (status === "max_tokens") return "truncated";
    if (status === "refusal") return "blocked";
    return "failed";
  }
  if (providerName === "gemini") {
    if (status === "stop") return "completed";
    if (status === "max_tokens") return "truncated";
    if (["safety", "recitation", "blocklist", "prohibited_content", "spii", "image_prohibited_content"].includes(status)) return "blocked";
    return "failed";
  }
  if (providerName === "perplexity") {
    if (status === "stop") return "completed";
    if (status === "length") return "truncated";
    if (status === "content_filter") return "blocked";
    return "failed";
  }
  return "failed";
}

function mentionExcerpt(text) {
  const match = /emc\s*2\s*ops/i.exec(text);
  if (!match) return null;
  const start = Math.max(0, match.index - 180);
  const end = Math.min(text.length, match.index + match[0].length + 220);
  return `${start > 0 ? "…" : ""}${text.slice(start, end).replace(/\s+/g, " ").trim()}${end < text.length ? "…" : ""}`;
}

function detectCompetitors(text) {
  return competitorPatterns
    .filter(([, pattern]) => {
      pattern.lastIndex = 0;
      return pattern.test(text);
    })
    .map(([name]) => name);
}

function wilson95(successes, total) {
  if (!total) return null;
  const z = 1.96;
  const proportion = successes / total;
  const denominator = 1 + (z * z) / total;
  const center = (proportion + (z * z) / (2 * total)) / denominator;
  const margin = (z / denominator) * Math.sqrt((proportion * (1 - proportion) / total) + (z * z) / (4 * total * total));
  return { lowerPercent: Number((Math.max(0, center - margin) * 100).toFixed(1)), upperPercent: Number((Math.min(1, center + margin) * 100).toFixed(1)) };
}

export function parseAnthropicResponse(response) {
  const textBlocks = (response.content || []).filter((block) => block?.type === "text");
  const rawAnswer = textBlocks.map((block) => block.text || "").join("\n").trim();
  const citations = normalizeCitations(textBlocks.flatMap((block) => (block.citations || []).map((citation) => ({
    url: citation.url,
    title: citation.title,
    startIndex: citation.start_char_index,
    endIndex: citation.end_char_index,
  }))));
  const searchErrors = (response.content || [])
    .filter((block) => block?.type === "web_search_tool_result" && block?.content?.type === "web_search_tool_result_error")
    .map((block) => block.content.error_code || "unknown_web_search_error");
  return {
    rawAnswer,
    citations,
    evidence: {
      responseId: response.id || null,
      modelResolved: response.model || null,
      stopReason: response.stop_reason || null,
      providerStatus: response.stop_reason || null,
      usage: response.usage || null,
      searchErrors,
    },
  };
}

export function parseGeminiResponse(response) {
  const candidate = response.candidates?.[0] || {};
  const rawAnswer = (candidate.content?.parts || []).map((part) => part.text || "").join("\n").trim();
  const metadata = candidate.groundingMetadata || {};
  const citations = normalizeCitations((metadata.groundingChunks || []).map((chunk) => ({
    url: chunk.web?.uri,
    title: chunk.web?.title,
  })));
  return {
    rawAnswer,
    citations,
    evidence: {
      responseId: response.responseId || null,
      modelResolved: response.modelVersion || null,
      finishReason: candidate.finishReason || null,
      providerStatus: candidate.finishReason || null,
      usage: response.usageMetadata || null,
      webSearchQueries: metadata.webSearchQueries || [],
      groundingSupports: metadata.groundingSupports || [],
      citationResolutionNote: "Google grounding URLs may be redirect URLs; only a directly returned emc2ops.com hostname counts automatically.",
    },
  };
}

export function parsePerplexityResponse(response) {
  const rawAnswer = response.choices?.[0]?.message?.content?.trim() || "";
  const citationValues = (response.citations || []).map((citation) => typeof citation === "string" ? { url: citation } : citation);
  const searchResults = (response.search_results || response.searchResults || []).map((result) => ({
    url: result.url,
    title: result.title,
  }));
  const citations = normalizeCitations([...citationValues, ...searchResults]);
  return {
    rawAnswer,
    citations,
    evidence: {
      responseId: response.id || null,
      modelResolved: response.model || null,
      finishReason: response.choices?.[0]?.finish_reason || null,
      providerStatus: response.choices?.[0]?.finish_reason || null,
      usage: response.usage || null,
      searchResultCount: searchResults.length,
    },
  };
}

async function requestJson({ url, headers, body }) {
  let lastError;
  const attempts = [];
  const requestStartedAt = new Date().toISOString();
  const requestStartedMs = Date.now();
  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt += 1) {
    const attemptStartedMs = Date.now();
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
    try {
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...headers },
        body: JSON.stringify(body),
        signal: controller.signal,
      });
      const payload = await response.json().catch(() => ({}));
      const retryable = [408, 409, 429, 500, 502, 503, 504].includes(response.status);
      attempts.push({ attempt, checkedAt: new Date().toISOString(), latencyMs: Date.now() - attemptStartedMs, httpStatus: response.status, retryable });
      if (response.ok) return {
        payload,
        attempts,
        execution: { startedAt: requestStartedAt, completedAt: new Date().toISOString(), latencyMs: Date.now() - requestStartedMs },
      };
      const safeMessage = payload?.error?.message || payload?.error?.status || `HTTP ${response.status}`;
      lastError = new Error(`Provider request failed: ${safeMessage}`);
      lastError.providerPayload = payload;
      lastError.retryable = retryable;
      if (!retryable || attempt === MAX_ATTEMPTS) throw lastError;
    } catch (error) {
      lastError = error;
      if (!attempts.some((item) => item.attempt === attempt)) {
        attempts.push({ attempt, checkedAt: new Date().toISOString(), latencyMs: Date.now() - attemptStartedMs, httpStatus: null, retryable: error?.retryable !== false, error: error instanceof Error ? error.message : "Unknown request error" });
      }
      if (error?.retryable === false || attempt === MAX_ATTEMPTS) {
        error.attempts = attempts;
        error.execution = { startedAt: requestStartedAt, completedAt: new Date().toISOString(), latencyMs: Date.now() - requestStartedMs };
        throw error;
      }
    } finally {
      clearTimeout(timeout);
    }
    await sleep(1_000 * 2 ** (attempt - 1));
  }
  throw lastError;
}

export function buildProviderRequest(providerName, apiKey, model, query) {
  if (providerName === "anthropic") {
    return {
      url: providers.anthropic.endpoint,
      headers: {
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: {
        model,
        max_tokens: 4_096,
        system: SYSTEM_INSTRUCTIONS,
        messages: [{ role: "user", content: query }],
        tools: [{
          type: "web_search_20260318",
          name: "web_search",
          max_uses: 5,
          user_location: { type: "approximate", country: "US", timezone: "America/New_York" },
        }],
      },
      secretFreeHeaders: {
        "Content-Type": "application/json",
        "x-api-key": "[excluded]",
        "anthropic-version": "2023-06-01",
      },
    };
  }

  if (providerName === "gemini") {
    return {
      url: `${providers.gemini.endpoint}/${encodeURIComponent(model)}:generateContent`,
      headers: { "x-goog-api-key": apiKey },
      body: {
        systemInstruction: { parts: [{ text: SYSTEM_INSTRUCTIONS }] },
        contents: [{ role: "user", parts: [{ text: query }] }],
        tools: [{ google_search: {} }],
        generationConfig: { maxOutputTokens: 4_096 },
      },
      secretFreeHeaders: {
        "Content-Type": "application/json",
        "x-goog-api-key": "[excluded]",
      },
    };
  }

  return {
    url: providers.perplexity.endpoint,
    headers: { Authorization: `Bearer ${apiKey}` },
    body: {
      model,
      messages: [
        { role: "system", content: SYSTEM_INSTRUCTIONS },
        { role: "user", content: query },
      ],
      max_tokens: 4_096,
    },
    secretFreeHeaders: {
      "Content-Type": "application/json",
      Authorization: "[excluded]",
    },
  };
}

export function secretFreeProviderRequest(request) {
  return {
    method: "POST",
    url: request.url,
    headers: request.secretFreeHeaders,
    body: request.body,
  };
}

async function requestProviderAnswer(providerName, request) {
  const { payload: response, attempts, execution } = await requestJson(request);
  const parser = providerName === "anthropic"
    ? parseAnthropicResponse
    : providerName === "gemini"
      ? parseGeminiResponse
      : parsePerplexityResponse;
  return { response, parsed: parser(response), attempts, execution };
}

export function providerProtocolDeviations(providerName, modelRequested, parsed) {
  const deviations = [];
  const resolved = parsed.evidence.modelResolved;
  if (!resolved) {
    deviations.push({ code: "resolved_model_missing", invalidatesObservation: true });
  } else if (resolved !== modelRequested) {
    deviations.push({ code: "resolved_model_differs_from_requested", requested: modelRequested, resolved, invalidatesObservation: true });
  }
  if (providerName === "anthropic" && parsed.evidence.searchErrors?.length) {
    deviations.push({ code: "native_web_search_error", values: parsed.evidence.searchErrors, invalidatesObservation: true });
  }
  const classified = classifyProviderStatus(providerName, parsed.evidence.providerStatus);
  if (classified === "failed") {
    deviations.push({ code: "unexpected_provider_status", value: parsed.evidence.providerStatus || null, invalidatesObservation: true });
  }
  return deviations;
}

function buildResult({ providerName, model, query, parsed, execution, visibilityMode = null, visibilityPolicy = null }) {
  const citedEmc2OpsUrls = parsed.citations.filter((citation) => isEmc2OpsUrl(citation.url));
  const citedThirdPartyUrls = parsed.citations.filter((citation) => !isEmc2OpsUrl(citation.url));
  const appeared = /emc\s*2\s*ops/i.test(parsed.rawAnswer);
  const matches = mentionMatches(parsed.rawAnswer);
  const deviations = providerProtocolDeviations(providerName, model, parsed);
  const providerStatus = parsed.rawAnswer
    ? classifyProviderStatus(providerName, parsed.evidence.providerStatus)
    : "failed";
  const status = deviations.some((deviation) => deviation.invalidatesObservation) ? "failed" : providerStatus;
  return {
    checkedAt: new Date().toISOString(),
    assistant: providers[providerName].assistant,
    provider: providerName,
    modelOrMode: model,
    modelRequested: model,
    modelResolved: parsed.evidence.modelResolved,
    queryId: query.id,
    query: query.query,
    ...(visibilityMode ? { visibilityMode, countInOrganicVisibility: visibilityPolicy.countInOrganicVisibility } : {}),
    category: query.category,
    funnelStage: query.funnelStage,
    persona: query.persona,
    tags: query.tags,
    promptClass: query.tags.includes("brand-aware") ? "brand-aware" : "brand-neutral",
    appeared,
    mentionMatches: matches,
    firstMentionOffset: matches[0]?.startOffset ?? null,
    mentionContext: mentionExcerpt(parsed.rawAnswer),
    mentionRole: appeared ? "unreviewed" : null,
    citedEmc2OpsUrls,
    citedThirdPartyUrls,
    competitorsMentioned: detectCompetitors(parsed.rawAnswer),
    notes: "Competitors use a fixed disclosed dictionary. Mentions and citations are distinct; raw answers require human accuracy review.",
    rawAnswer: parsed.rawAnswer,
    execution: {
      ...execution,
      protocolDeviations: deviations,
    },
    evidence: { ...parsed.evidence, citations: parsed.citations },
    status,
  };
}

export function summarize(results, queryCount, visibilityPolicy = null) {
  const successful = results.filter((result) => result.status === "completed");
  const counted = visibilityPolicy
    ? successful.filter((result) => result.countInOrganicVisibility === visibilityPolicy.countInOrganicVisibility)
    : successful;
  const organic = successful.filter((result) => result.countInOrganicVisibility === true);
  const groups = { "brand-aware": [], "brand-neutral": [] };
  const byCategory = {};
  for (const result of counted) {
    groups[result.promptClass]?.push(result);
    byCategory[result.category] ||= { observations: 0, mentions: 0, emc2opsCitations: 0 };
    byCategory[result.category].observations += 1;
    if (result.appeared) byCategory[result.category].mentions += 1;
    if (result.citedEmc2OpsUrls.length) byCategory[result.category].emc2opsCitations += 1;
  }
  const summarizeGroup = (items) => ({
    observations: items.length,
    mentions: items.filter((item) => item.appeared).length,
    emc2opsCitations: items.filter((item) => item.citedEmc2OpsUrls.length).length,
    mentionWilson95: wilson95(items.filter((item) => item.appeared).length, items.length),
    citationWilson95: wilson95(items.filter((item) => item.citedEmc2OpsUrls.length).length, items.length),
  });
  return {
    queryCount,
    completed: counted.length,
    failed: results.filter((result) => result.status === "failed" && (!visibilityPolicy || result.countInOrganicVisibility === visibilityPolicy.countInOrganicVisibility)).length,
    truncated: results.filter((result) => result.status === "truncated" && (!visibilityPolicy || result.countInOrganicVisibility === visibilityPolicy.countInOrganicVisibility)).length,
    blocked: results.filter((result) => result.status === "blocked" && (!visibilityPolicy || result.countInOrganicVisibility === visibilityPolicy.countInOrganicVisibility)).length,
    mentions: counted.filter((result) => result.appeared).length,
    emc2opsCitationObservations: counted.filter((result) => result.citedEmc2OpsUrls.length).length,
    byPromptClass: {
      brandAware: summarizeGroup(groups["brand-aware"]),
      brandNeutral: summarizeGroup(groups["brand-neutral"]),
    },
    byCategory,
    ...(visibilityPolicy ? {
      visibilityMode: visibilityPolicy.outputNamespace,
      organicVisibility: {
        observations: organic.length,
        mentions: organic.filter((result) => result.appeared).length,
        emc2opsCitations: organic.filter((result) => result.citedEmc2OpsUrls.length).length,
      },
    } : {}),
    accuracyReview: {
      status: "not_reviewed",
      note: "Raw answers are retained. No answer is treated as accurate until human review.",
    },
  };
}

async function loadExisting(outputPath, resume) {
  if (!resume) return null;
  try {
    return JSON.parse(await readFile(outputPath, "utf8"));
  } catch (error) {
    if (error?.code === "ENOENT") return null;
    throw error;
  }
}

async function save(outputPath, payload) {
  await mkdir(path.dirname(outputPath), { recursive: true });
  await writeFile(outputPath, `${JSON.stringify(payload, null, 2)}\n`, "utf8");
}

function sha256(value) {
  return createHash("sha256").update(value).digest("hex");
}

async function saveRawArtifacts({ args, providerName, query, model, response, attempts, execution, request, runId, querySetSha256, protocolSha256, visibilityMode = null, visibilityPolicy = null }) {
  const rawDir = path.join(args.outputDir, "raw", providerName, runId);
  await mkdir(rawDir, { recursive: true });
  const manifest = {
    protocolVersion: PROTOCOL_VERSION,
    provider: providerName,
    endpoint: request.url,
    modelRequested: model,
    queryId: query.id,
    query: query.query,
    querySha256: sha256(query.query),
    querySetSha256,
    protocolSha256,
    ...(visibilityMode ? { visibilityMode, visibilityPolicy } : {}),
    instructions: SYSTEM_INSTRUCTIONS,
    instructionsSha256: sha256(SYSTEM_INSTRUCTIONS),
    outboundRequest: secretFreeProviderRequest(request),
    attempts,
    execution,
    authorizationExcluded: true,
  };
  const attemptId = new Date().toISOString().replace(/[^0-9TZ]/g, "");
  const requestPath = path.join(rawDir, `${query.id}.${attemptId}.request.json`);
  const responsePath = path.join(rawDir, `${query.id}.${attemptId}.response.json`);
  const requestJson = `${JSON.stringify(manifest, null, 2)}\n`;
  const responseJson = `${JSON.stringify(response, null, 2)}\n`;
  await writeFile(requestPath, requestJson, { encoding: "utf8", flag: "wx" });
  await writeFile(responsePath, responseJson, { encoding: "utf8", flag: "wx" });
  return {
    requestManifestPath: requestPath,
    rawResponsePath: responsePath,
    requestSha256: sha256(requestJson),
    responseSha256: sha256(responseJson),
  };
}

function selectedProviderNames(provider) {
  return provider === "all" ? Object.keys(providers) : [provider];
}

export function orderedResultsForQuerySet(queries, resultsById) {
  return queries.filter((item) => resultsById.has(item.id)).map((item) => resultsById.get(item.id));
}

async function currentOpenAIStatus(outputDir) {
  const resultPath = path.join(outputDir, "openai-responses-v3-results.json");
  try {
    const payload = JSON.parse(await readFile(resultPath, "utf8"));
    const completed = (payload.results || []).filter((result) => result.status === "completed").length;
    return { resultPath, completed, remaining: Math.max(0, 42 - completed) };
  } catch (error) {
    if (error?.code === "ENOENT") return { resultPath, completed: 0, remaining: 42 };
    throw error;
  }
}

export function credentialStatus(env = process.env) {
  return Object.fromEntries(Object.entries(providers).map(([name, config]) => [name, {
    credentialEnvironmentVariable: config.keyName,
    available: Boolean(env[config.keyName]),
    model: env[config.modelEnv] || config.defaultModel,
  }]));
}

async function runProvider({ providerName, querySet, querySetSha256, queries, args, visibilityMode = null, visibilityPolicy = null }) {
  const config = providers[providerName];
  const apiKey = process.env[config.keyName];
  if (!apiKey) throw new Error(`${config.keyName} is not set; ${providerName} cannot run`);
  const model = process.env[config.modelEnv] || config.defaultModel;
  const instructionsSha256 = sha256(SYSTEM_INSTRUCTIONS);
  const protocolSha256 = sha256(JSON.stringify({ protocolVersion: PROTOCOL_VERSION, providerName, model, instructionsSha256, maxOutputTokens: 4_096, nativeWebSearch: true, visibilityMode }));
  const outputPath = path.join(args.outputDir, config.outputName);
  const existing = await loadExisting(outputPath, args.resume);
  if (existing && (
    existing.run?.protocolVersion !== PROTOCOL_VERSION
    || existing.run?.model !== model
    || existing.run?.querySetSha256 !== querySetSha256
    || existing.run?.instructionsSha256 !== instructionsSha256
    || existing.run?.protocolSha256 !== protocolSha256
    || existing.run?.visibilityMode !== visibilityMode
  )) {
    throw new Error(`Existing ${providerName} output uses a different model or protocol; use --no-resume or a new output directory`);
  }
  const resultsById = new Map((existing?.results || []).map((result) => [result.queryId, result]));
  const startedAt = existing?.run?.startedAt || new Date().toISOString();
  const runId = existing?.run?.runId || `${providerName}-${startedAt.replace(/[^0-9TZ]/g, "")}`;

  for (let index = 0; index < queries.length; index += 1) {
    const query = queries[index];
    const request = buildProviderRequest(providerName, apiKey, model, query.query);
    if (resultsById.get(query.id)?.status === "completed") {
      console.log(`[${providerName} ${index + 1}/${queries.length}] ${query.id} already complete`);
      continue;
    }
    console.log(`[${providerName} ${index + 1}/${queries.length}] ${query.id} running`);
    try {
      const { response, parsed, attempts, execution } = await requestProviderAnswer(providerName, request);
      const artifacts = await saveRawArtifacts({ args, providerName, query, model, response, attempts, execution, request, runId, querySetSha256, protocolSha256, visibilityMode, visibilityPolicy });
      const result = buildResult({ providerName, model, query, parsed, execution, visibilityMode, visibilityPolicy });
      result.evidence = { ...result.evidence, attempts, ...artifacts };
      resultsById.set(query.id, result);
    } catch (error) {
      const attempts = error?.attempts || [];
      const execution = error?.execution || { startedAt: null, completedAt: new Date().toISOString(), latencyMs: null, protocolDeviations: [] };
      const safeErrorResponse = error?.providerPayload || { error: { message: error instanceof Error ? error.message : "Unknown provider error" } };
      const artifacts = await saveRawArtifacts({ args, providerName, query, model, response: safeErrorResponse, attempts, execution, request, runId, querySetSha256, protocolSha256, visibilityMode, visibilityPolicy });
      resultsById.set(query.id, {
        checkedAt: new Date().toISOString(),
        assistant: config.assistant,
        provider: providerName,
        modelOrMode: model,
        modelRequested: model,
        modelResolved: null,
        queryId: query.id,
        query: query.query,
        ...(visibilityMode ? { visibilityMode, countInOrganicVisibility: visibilityPolicy.countInOrganicVisibility } : {}),
        category: query.category,
        funnelStage: query.funnelStage,
        persona: query.persona,
        tags: query.tags,
        promptClass: query.tags.includes("brand-aware") ? "brand-aware" : "brand-neutral",
        appeared: null,
        mentionMatches: [],
        firstMentionOffset: null,
        mentionContext: null,
        mentionRole: null,
        citedEmc2OpsUrls: [],
        citedThirdPartyUrls: [],
        competitorsMentioned: [],
        notes: error instanceof Error ? error.message : "Unknown provider error",
        rawAnswer: null,
        execution: { ...execution, protocolDeviations: [] },
        evidence: { attempts, providerError: error instanceof Error ? error.message : "Unknown provider error", ...artifacts },
        status: "failed",
      });
    }

    const orderedResults = orderedResultsForQuerySet(querySet.queries, resultsById);
    await save(outputPath, {
      schemaVersion: 3,
      run: {
        protocolVersion: PROTOCOL_VERSION,
        protocolSha256,
        runId,
        benchmarkVersion: querySet.version,
        querySet: args.querySet,
        querySetSha256,
        ...(visibilityMode ? { visibilityMode, visibilityPolicy } : {}),
        instructionsSha256,
        assistant: config.assistant,
        provider: providerName,
        model,
        market: querySet.runProtocol.market,
        language: querySet.runProtocol.language,
        freshConversationPerQuery: true,
        neutralInstructions: true,
        startedAt,
        lastUpdatedAt: new Date().toISOString(),
        completedAt: orderedResults.length === querySet.queries.length && orderedResults.every((result) => result.status === "completed") ? new Date().toISOString() : null,
        scopeNote: "API benchmark with native web grounding, not the provider's consumer product UI.",
      },
      methodology: {
        promptWording: "Exact query-set wording",
        promptClassRule: "The query-set brand-aware tag separates five branded prompts from 37 neutral prompts.",
        appearanceRule: "Case-insensitive EMC2Ops or EMC 2 Ops match in raw answer text.",
        citationRule: config.citationRule,
        evidenceRetention: "Raw answer, native citation metadata, request timestamp, model, usage, and provider response identifier where available.",
        competitorDetection: competitorPatterns.map(([name]) => name),
      },
      summary: summarize(orderedResults, querySet.queries.length, visibilityPolicy ? { ...visibilityPolicy, mode: visibilityMode } : null),
      results: orderedResults,
    });
  }
  const results = querySet.queries.map((query) => resultsById.get(query.id)).filter(Boolean);
  return { outputPath, summary: summarize(results, querySet.queries.length, visibilityPolicy ? { ...visibilityPolicy, mode: visibilityMode } : null), plannedQueryCount: querySet.queries.length };
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const querySetText = await readFile(args.querySet, "utf8");
  const querySetSha256 = sha256(querySetText);
  const querySet = JSON.parse(querySetText);
  const visibility = validateVisibilityMode({ querySet, requestedMode: args.visibilityMode, outputDir: args.outputDirProvided ? args.outputDir : null });
  if (!visibility.legacy && !args.outputDirProvided) args.outputDir = visibility.policy.outputDirectory;
  const queries = args.limit ? querySet.queries.slice(0, args.limit) : querySet.queries;
  const status = credentialStatus();
  const selected = selectedProviderNames(args.provider);
  const openAIStatus = visibility.legacy ? await currentOpenAIStatus(args.outputDir) : { completed: 0, remaining: 0 };
  const plannedAssistants = visibility.legacy ? 4 : selected.length;
  const plannedObservations = querySet.queries.length * plannedAssistants;
  const outstandingProviderObservations = querySet.queries.length * selected.length;
  const readiness = {
    querySet: args.querySet,
    benchmarkVersion: querySet.version,
    queriesPerAssistant: querySet.queries.length,
    ...(visibility.mode ? { visibilityMode: visibility.mode, visibilityPolicy: visibility.policy } : {}),
    plannedAssistants,
    plannedObservations,
    completedOpenAIObservations: openAIStatus.completed,
    remainingOpenAIObservations: openAIStatus.remaining,
    outstandingProviderObservations,
    totalOutstandingObservations: openAIStatus.remaining + outstandingProviderObservations,
    selectedProviders: selected,
    providers: status,
    noCredentialsPrinted: true,
  };

  if (args.status || args.dryRun) {
    console.log(JSON.stringify({ mode: args.status ? "status" : "dry-run", ...readiness }, null, 2));
    return;
  }

  const unavailable = selected.filter((name) => !status[name].available);
  if (unavailable.length) {
    throw new Error(`Missing required credentials: ${unavailable.map((name) => providers[name].keyName).join(", ")}`);
  }

  for (const providerName of selected) {
    const { outputPath, summary, plannedQueryCount } = await runProvider({ providerName, querySet, querySetSha256, queries, args, visibilityMode: visibility.mode, visibilityPolicy: visibility.policy });
    const complete = summary.completed === plannedQueryCount && summary.failed === 0 && summary.truncated === 0 && summary.blocked === 0;
    console.log(JSON.stringify({ provider: providerName, output: outputPath, status: complete ? "complete" : "incomplete", summary }));
    if (!complete) process.exitCode = 1;
  }
}

const isMain = process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;
if (isMain) {
  main().catch((error) => {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  });
}
