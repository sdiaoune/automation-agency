import assert from "node:assert/strict";
import test from "node:test";

import {
  buildProviderRequest,
  classifyProviderStatus,
  credentialStatus,
  orderedResultsForQuerySet,
  parseAnthropicResponse,
  parseGeminiResponse,
  parsePerplexityResponse,
  resolveVisibilityMode,
  providerProtocolDeviations,
  secretFreeProviderRequest,
  summarize,
  validateVisibilityMode,
} from "../scripts/run-multi-assistant-visibility-benchmark.mjs";

test("credential status never exposes credential values", () => {
  const result = credentialStatus({
    ANTHROPIC_API_KEY: "secret-anthropic",
    GEMINI_API_KEY: "secret-gemini",
  });
  assert.equal(result.anthropic.available, true);
  assert.equal(result.gemini.available, true);
  assert.equal(result.perplexity.available, false);
  assert.equal(JSON.stringify(result).includes("secret-"), false);
});

test("Anthropic parser retains text and native citations", () => {
  const parsed = parseAnthropicResponse({
    id: "msg_1",
    stop_reason: "end_turn",
    content: [{
      type: "text",
      text: "Consider EMC2Ops.",
      citations: [{
        type: "web_search_result_location",
        url: "https://www.emc2ops.com/services/missed-call-recovery/",
        title: "Missed-call recovery",
        start_char_index: 9,
        end_char_index: 16,
      }],
    }],
  });
  assert.equal(parsed.rawAnswer, "Consider EMC2Ops.");
  assert.equal(parsed.citations.length, 1);
  assert.equal(parsed.citations[0].startIndex, 9);
});

test("Gemini parser retains grounding metadata", () => {
  const parsed = parseGeminiResponse({
    responseId: "gemini_1",
    candidates: [{
      finishReason: "STOP",
      content: { parts: [{ text: "A grounded answer." }] },
      groundingMetadata: {
        webSearchQueries: ["property management automation"],
        groundingChunks: [{ web: { uri: "https://example.com/source", title: "Source" } }],
      },
    }],
  });
  assert.equal(parsed.rawAnswer, "A grounded answer.");
  assert.deepEqual(parsed.evidence.webSearchQueries, ["property management automation"]);
  assert.equal(parsed.citations[0].url, "https://example.com/source");
});

test("Perplexity parser preserves native citation occurrences", () => {
  const parsed = parsePerplexityResponse({
    id: "pplx_1",
    citations: ["https://example.com/source"],
    search_results: [{ url: "https://example.com/source", title: "Source" }],
    choices: [{ finish_reason: "stop", message: { content: "A cited answer." } }],
  });
  assert.equal(parsed.rawAnswer, "A cited answer.");
  assert.equal(parsed.citations.length, 2);
});

test("provider success allowlists reject non-final states", () => {
  assert.equal(classifyProviderStatus("anthropic", "end_turn"), "completed");
  assert.equal(classifyProviderStatus("anthropic", "pause_turn"), "failed");
  assert.equal(classifyProviderStatus("anthropic", "tool_use"), "failed");
  assert.equal(classifyProviderStatus("anthropic", "max_tokens"), "truncated");
  assert.equal(classifyProviderStatus("anthropic", "refusal"), "blocked");

  assert.equal(classifyProviderStatus("gemini", "STOP"), "completed");
  assert.equal(classifyProviderStatus("gemini", "MAX_TOKENS"), "truncated");
  assert.equal(classifyProviderStatus("gemini", "SAFETY"), "blocked");
  assert.equal(classifyProviderStatus("gemini", "MALFORMED_FUNCTION_CALL"), "failed");
  assert.equal(classifyProviderStatus("gemini", "OTHER"), "failed");

  assert.equal(classifyProviderStatus("perplexity", "stop"), "completed");
  assert.equal(classifyProviderStatus("perplexity", "length"), "truncated");
  assert.equal(classifyProviderStatus("perplexity", "content_filter"), "blocked");
  assert.equal(classifyProviderStatus("perplexity", "unknown"), "failed");
});

test("protocol deviations invalidate model drift and Anthropic search errors", () => {
  const clean = { evidence: { modelResolved: "claude-fable-5", providerStatus: "end_turn", searchErrors: [] } };
  assert.deepEqual(providerProtocolDeviations("anthropic", "claude-fable-5", clean), []);

  const drift = { evidence: { modelResolved: "claude-other", providerStatus: "end_turn", searchErrors: ["too_many_requests"] } };
  const deviations = providerProtocolDeviations("anthropic", "claude-fable-5", drift);
  assert.deepEqual(deviations.map((item) => item.code), ["resolved_model_differs_from_requested", "native_web_search_error"]);
  assert.equal(deviations.every((item) => item.invalidatesObservation), true);
});

test("request evidence preserves exact provider payload without credentials", () => {
  const request = buildProviderRequest("gemini", "secret-gemini", "gemini-3.6-flash", "Which workflow?");
  const evidence = secretFreeProviderRequest(request);
  assert.equal(evidence.url.endsWith("/gemini-3.6-flash:generateContent"), true);
  assert.equal(evidence.body.tools[0].google_search !== undefined, true);
  assert.equal(evidence.headers["x-goog-api-key"], "[excluded]");
  assert.equal(JSON.stringify(evidence).includes("secret-gemini"), false);
});

test("limited runs preserve previously stored rows outside the attempted slice", () => {
  const querySet = [{ id: "q1" }, { id: "q2" }, { id: "q3" }];
  const results = new Map([
    ["q1", { queryId: "q1", status: "completed" }],
    ["q3", { queryId: "q3", status: "completed" }],
  ]);
  assert.deepEqual(orderedResultsForQuerySet(querySet, results).map((item) => item.queryId), ["q1", "q3"]);
});

test("summary separates branded and neutral prompts", () => {
  const results = [
    {
      status: "completed",
      promptClass: "brand-aware",
      category: "comparison",
      appeared: true,
      citedEmc2OpsUrls: [{ url: "https://emc2ops.com" }],
    },
    {
      status: "completed",
      promptClass: "brand-neutral",
      category: "awareness",
      appeared: false,
      citedEmc2OpsUrls: [],
    },
  ];
  const result = summarize(results, 42);
  assert.equal(result.byPromptClass.brandAware.mentions, 1);
  assert.equal(result.byPromptClass.brandNeutral.mentions, 0);
  assert.equal(result.emc2opsCitationObservations, 1);
});

test("mode-aware query sets auto-select their sole mode and validate every query", () => {
  const querySet = {
    runProtocol: {
      modes: {
        organic: {
          promptPolicy: "brand-neutral",
          countInOrganicVisibility: true,
          outputNamespace: "organic",
          outputDirectory: "outputs/organic",
        },
      },
    },
    queries: [{ id: "q1", mode: "organic" }],
  };
  assert.equal(resolveVisibilityMode(querySet).mode, "organic");
  assert.equal(validateVisibilityMode({ querySet, outputDir: "outputs/organic" }).policy.countInOrganicVisibility, true);
  assert.throws(() => validateVisibilityMode({
    querySet: { ...querySet, queries: [{ id: "q1" }] },
    outputDir: "outputs/organic",
  }), /must use visibility mode/);
  assert.throws(() => resolveVisibilityMode(querySet, "missing"), /Unsupported visibility mode/);
});

test("brand-explicit mode cannot route into the organic output directory", () => {
  const querySet = {
    runProtocol: {
      modes: {
        unpromptedOrganicVisibility: {
          promptPolicy: "brand-neutral",
          countInOrganicVisibility: true,
          outputNamespace: "organic",
          outputDirectory: "outputs/llm-visibility-phase-1",
        },
        brandExplicitSiteAudit: {
          promptPolicy: "brand-explicit",
          countInOrganicVisibility: false,
          outputNamespace: "brand-explicit-site-audit",
          outputDirectory: "outputs/llm-visibility-phase-1/brand-explicit-site-audit",
        },
      },
    },
    queries: [{ id: "q1", mode: "brandExplicitSiteAudit" }],
  };
  assert.throws(() => validateVisibilityMode({
    querySet,
    requestedMode: "brandExplicitSiteAudit",
    outputDir: "outputs/llm-visibility-phase-1",
  }), /cannot use the organic output directory/);
});

test("organic summaries exclude brand-explicit results from organic totals", () => {
  const results = [
    { status: "completed", promptClass: "brand-neutral", countInOrganicVisibility: true, category: "category-discovery", appeared: true, citedEmc2OpsUrls: [] },
    { status: "completed", promptClass: "brand-aware", countInOrganicVisibility: false, category: "audit", appeared: true, citedEmc2OpsUrls: [{ url: "https://emc2ops.com" }] },
  ];
  const result = summarize(results, 2, { countInOrganicVisibility: true, outputNamespace: "organic" });
  assert.equal(result.completed, 1);
  assert.equal(result.mentions, 1);
  assert.equal(result.emc2opsCitationObservations, 0);
  assert.equal(result.organicVisibility.observations, 1);
});
