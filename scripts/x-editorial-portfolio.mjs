import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

export const EDITORIAL_VERSION = "x-editorial-v1-2026-07-12";

export const PILLARS = [
  "Leasing response and conversion",
  "Maintenance and resident operations",
  "Workflow design and handoffs",
  "Owner and vendor coordination",
  "CRM/PMS data discipline",
  "Team capacity and human escalation",
  "Operational metrics and economics",
  "Contrarian takes and industry myths",
];

export const FORMATS = [
  "Sharp one-line observation",
  "Contrarian take",
  "Diagnostic question",
  "Micro-checklist",
  "Before-and-after contrast",
  "Workflow teardown",
  "Rule of thumb",
  "If/then operating rule",
  "Short scenario",
  "Myth and reframe",
  "Mini-framework",
  "Cost or bottleneck lens",
];

export const INTENTS = ["insight", "conversation", "soft_promotion"];

export const BATCH_EXPECTATIONS = {
  1: {
    first: 37,
    last: 102,
    count: 66,
    pillars: [12, 9, 11, 8, 7, 6, 6, 7],
    intents: [53, 10, 3],
  },
  2: {
    first: 103,
    last: 168,
    count: 66,
    pillars: [12, 9, 10, 7, 8, 6, 6, 8],
    intents: [53, 10, 3],
  },
  3: {
    first: 169,
    last: 234,
    count: 66,
    pillars: [12, 9, 11, 8, 7, 6, 6, 7],
    intents: [53, 10, 3],
  },
  4: {
    first: 235,
    last: 300,
    count: 66,
    pillars: [12, 9, 10, 7, 8, 6, 6, 8],
    intents: [52, 10, 4],
  },
};

const STOPWORDS = new Set([
  "a",
  "an",
  "and",
  "are",
  "as",
  "at",
  "be",
  "because",
  "but",
  "by",
  "for",
  "from",
  "has",
  "have",
  "if",
  "in",
  "into",
  "is",
  "it",
  "not",
  "of",
  "on",
  "or",
  "our",
  "should",
  "that",
  "the",
  "their",
  "this",
  "to",
  "was",
  "we",
  "when",
  "with",
  "you",
  "your",
]);

const CANONICAL_TOKENS = new Map([
  ["inquiries", "lead"],
  ["inquiry", "lead"],
  ["leads", "lead"],
]);

const CSV_HEADERS = [
  "tweet_number",
  "scheduled_at_eastern",
  "scheduled_at_utc",
  "status",
  "tweet_id",
  "text",
];

export function normalizeText(text) {
  return String(text ?? "")
    .normalize("NFKD")
    .toLowerCase()
    .replace(/[’']/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
    .replace(/\s+/g, " ");
}

export function openingKey(text) {
  const firstSentence = String(text ?? "").split(/[.!?\n]/, 1)[0];
  return normalizeText(firstSentence).split(" ").filter(Boolean).slice(0, 12).join(" ");
}

function meaningfulTokens(text) {
  return normalizeText(text)
    .split(" ")
    .filter((token) => token && !STOPWORDS.has(token))
    .map((token) => CANONICAL_TOKENS.get(token) || token);
}

function frequencyVector(text) {
  const vector = new Map();
  for (const token of meaningfulTokens(text)) {
    vector.set(token, (vector.get(token) || 0) + 1);
  }
  return vector;
}

export function cosineSimilarity(a, b) {
  const aVector = frequencyVector(a);
  const bVector = frequencyVector(b);
  if (aVector.size === 0 || bVector.size === 0) return 0;

  let dot = 0;
  let aMagnitude = 0;
  let bMagnitude = 0;
  for (const value of aVector.values()) aMagnitude += value * value;
  for (const value of bVector.values()) bMagnitude += value * value;
  for (const [token, value] of aVector) dot += value * (bVector.get(token) || 0);

  return dot / (Math.sqrt(aMagnitude) * Math.sqrt(bMagnitude));
}

function ngramSet(text, size) {
  const tokens = normalizeText(text).split(" ").filter(Boolean);
  const result = new Set();
  for (let index = 0; index <= tokens.length - size; index += 1) {
    result.add(tokens.slice(index, index + size).join(" "));
  }
  return result;
}

export function bigramJaccard(a, b) {
  const aSet = ngramSet(a, 2);
  const bSet = ngramSet(b, 2);
  if (aSet.size === 0 || bSet.size === 0) return 0;

  let intersection = 0;
  for (const value of aSet) {
    if (bSet.has(value)) intersection += 1;
  }
  return intersection / (aSet.size + bSet.size - intersection);
}

function countBy(rows, key) {
  const counts = new Map();
  for (const row of rows) {
    const value = row[key];
    counts.set(value, (counts.get(value) || 0) + 1);
  }
  return counts;
}

function expectedCount(expectations, key, values, index) {
  const collection = expectations[key];
  if (Array.isArray(collection)) return collection[index];
  if (collection && typeof collection === "object") return collection[values[index]];
  return undefined;
}

function validateAllocation(errors, rows, expectations, key, values, label) {
  const counts = countBy(rows, key);
  values.forEach((value, index) => {
    const expected = expectedCount(expectations, label, values, index);
    if (expected === undefined) return;
    const actual = counts.get(value) || 0;
    if (actual !== expected) {
      errors.push(`${label} allocation for ${value}: expected ${expected}, found ${actual}`);
    }
  });
}

export function validateBatch(batch, expectations) {
  const errors = [];
  const rows = Array.isArray(batch?.rows) ? batch.rows : [];

  if (rows.length !== expectations.count) {
    errors.push(`batch count: expected ${expectations.count}, found ${rows.length}`);
  }

  const normalizedSeen = new Map();
  const openingSeen = new Map();
  rows.forEach((row, index) => {
    const expectedNumber = expectations.first + index;
    if (row.tweet_number !== expectedNumber) {
      errors.push(`tweet number at index ${index}: expected ${expectedNumber}, found ${row.tweet_number}`);
    }
    if (!String(row.text || "").trim()) errors.push(`tweet ${row.tweet_number} has empty text`);
    if (Array.from(String(row.text || "")).length > 280) {
      errors.push(`tweet ${row.tweet_number} exceeds 280 characters`);
    }
    if (!PILLARS.includes(row.content_pillar)) {
      errors.push(`tweet ${row.tweet_number} has invalid pillar`);
    }
    if (!FORMATS.includes(row.content_format)) {
      errors.push(`tweet ${row.tweet_number} has invalid format`);
    }
    if (!INTENTS.includes(row.content_intent)) {
      errors.push(`tweet ${row.tweet_number} has invalid intent`);
    }
    if (row.content_intent === "conversation" && !String(row.text || "").trim().endsWith("?")) {
      errors.push(`tweet ${row.tweet_number} conversation prompt must end with ?`);
    }

    const normalized = normalizeText(row.text);
    if (normalizedSeen.has(normalized)) {
      errors.push(`normalized duplicate: tweets ${normalizedSeen.get(normalized)} and ${row.tweet_number}`);
    } else {
      normalizedSeen.set(normalized, row.tweet_number);
    }

    const opening = openingKey(row.text);
    if (openingSeen.has(opening)) {
      errors.push(`opening duplicate: tweets ${openingSeen.get(opening)} and ${row.tweet_number}`);
    } else {
      openingSeen.set(opening, row.tweet_number);
    }

    if (index > 0) {
      const previous = rows[index - 1];
      if (previous.content_pillar === row.content_pillar) {
        errors.push(`adjacent pillar: tweets ${previous.tweet_number} and ${row.tweet_number}`);
      }
      if (previous.content_format === row.content_format) {
        errors.push(`adjacent format: tweets ${previous.tweet_number} and ${row.tweet_number}`);
      }
    }
  });

  if (rows.length > 0 && rows.at(-1).tweet_number !== expectations.last) {
    errors.push(`last tweet number: expected ${expectations.last}, found ${rows.at(-1).tweet_number}`);
  }

  validateAllocation(errors, rows, expectations, "content_pillar", PILLARS, "pillars");
  validateAllocation(errors, rows, expectations, "content_intent", INTENTS, "intents");
  return errors;
}

function phraseFrequency(rows, size, minimumExclusive) {
  const counts = new Map();
  for (const row of rows) {
    const phrases = ngramSet(row.text, size);
    for (const phrase of phrases) counts.set(phrase, (counts.get(phrase) || 0) + 1);
  }
  return [...counts]
    .filter(([, count]) => count > minimumExclusive)
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .map(([phrase, count]) => ({ phrase, count }));
}

function phraseUseCount(rows, phrase) {
  const pattern = new RegExp(`\\b${phrase.replace(/\s+/g, "\\s+")}\\b`, "gi");
  return rows.reduce((total, row) => total + (normalizeText(row.text).match(pattern) || []).length, 0);
}

export function validatePortfolio(historyRows, candidateRows) {
  const errors = [];
  const warnings = [];
  const similarityFlags = [];
  const candidates = [...candidateRows].sort((a, b) => a.tweet_number - b.tweet_number);
  const history = Array.isArray(historyRows) ? historyRows : [];
  const byNumber = new Map();

  for (const candidate of candidates) {
    if (byNumber.has(candidate.tweet_number)) {
      errors.push(`duplicate candidate tweet number ${candidate.tweet_number}`);
    }
    byNumber.set(candidate.tweet_number, candidate);
  }

  if (candidates.length === 264) {
    const batchErrors = validateBatch(
      { rows: candidates },
      {
        first: 37,
        last: 300,
        count: 264,
        pillars: [48, 36, 42, 30, 30, 24, 24, 30],
        intents: [211, 40, 13],
      },
    );
    errors.push(...batchErrors);
  }

  const normalizedSeen = new Map();
  const openingSeen = new Map();
  for (const row of history) {
    if (!row?.text || byNumber.has(row.tweet_number)) continue;
    normalizedSeen.set(normalizeText(row.text), row.tweet_number);
    openingSeen.set(openingKey(row.text), row.tweet_number);
  }

  for (const candidate of candidates) {
    const normalized = normalizeText(candidate.text);
    const opening = openingKey(candidate.text);
    if (normalizedSeen.has(normalized)) {
      errors.push(`duplicate text: tweets ${normalizedSeen.get(normalized)} and ${candidate.tweet_number}`);
    } else {
      normalizedSeen.set(normalized, candidate.tweet_number);
    }
    if (openingSeen.has(opening)) {
      errors.push(`duplicate opening: tweets ${openingSeen.get(opening)} and ${candidate.tweet_number}`);
    } else {
      openingSeen.set(opening, candidate.tweet_number);
    }
  }

  for (const phrase of ["our ai", "we build"]) {
    const count = phraseUseCount(candidates, phrase);
    if (count > 3) errors.push(`phrase cap exceeded for "${phrase}": ${count}`);
  }

  const comparisonRows = [
    ...history.filter((row) => row?.text && !byNumber.has(row.tweet_number)),
    ...candidates,
  ];
  for (let aIndex = 0; aIndex < comparisonRows.length; aIndex += 1) {
    const a = comparisonRows[aIndex];
    for (let bIndex = aIndex + 1; bIndex < comparisonRows.length; bIndex += 1) {
      const b = comparisonRows[bIndex];
      if (!byNumber.has(a.tweet_number) && !byNumber.has(b.tweet_number)) continue;
      const cosine = cosineSimilarity(a.text, b.text);
      const jaccard = bigramJaccard(a.text, b.text);
      if (cosine >= 0.78 || jaccard >= 0.55) {
        similarityFlags.push({
          tweets: [a.tweet_number, b.tweet_number],
          cosine: Number(cosine.toFixed(3)),
          bigramJaccard: Number(jaccard.toFixed(3)),
        });
      }
    }
  }

  const phraseReport = {
    bigrams: phraseFrequency(candidates, 2, 12),
    trigrams: phraseFrequency(candidates, 3, 4),
  };
  if (phraseReport.bigrams.length > 0) {
    warnings.push(`${phraseReport.bigrams.length} bigrams exceed 12 uses`);
  }
  if (phraseReport.trigrams.length > 0) {
    warnings.push(`${phraseReport.trigrams.length} trigrams exceed 4 uses`);
  }

  return { errors, warnings, phraseReport, similarityFlags };
}

export function applyPortfolio(schedule, candidateRows, editorialVersion = EDITORIAL_VERSION) {
  const candidateByNumber = new Map();
  for (const candidate of candidateRows) {
    if (candidateByNumber.has(candidate.tweet_number)) {
      throw new Error(`Duplicate candidate tweet number ${candidate.tweet_number}`);
    }
    candidateByNumber.set(candidate.tweet_number, candidate);
  }

  const originalRows = Array.isArray(schedule?.rows) ? schedule.rows : [];
  const originalByNumber = new Map(originalRows.map((row) => [row.tweet_number, row]));
  for (const candidate of candidateRows) {
    const target = originalByNumber.get(candidate.tweet_number);
    if (!target || target.status !== "ready_to_schedule") {
      throw new Error(`Tweet ${candidate.tweet_number} is not ready_to_schedule`);
    }
  }

  const readyRows = originalRows.filter((row) => row.status === "ready_to_schedule");
  if (readyRows.length !== candidateRows.length) {
    throw new Error(`Expected ${readyRows.length} candidates for ready_to_schedule rows, found ${candidateRows.length}`);
  }

  const result = structuredClone(schedule);
  for (const row of result.rows) {
    if (row.status !== "ready_to_schedule") continue;
    const candidate = candidateByNumber.get(row.tweet_number);
    if (!candidate) throw new Error(`Missing candidate for ready_to_schedule tweet ${row.tweet_number}`);
    row.text = candidate.text;
    row.content_pillar = candidate.content_pillar;
    row.content_format = candidate.content_format;
    row.content_intent = candidate.content_intent;
    row.editorial_version = editorialVersion;
  }
  return result;
}

function csvEscape(value) {
  const string = String(value ?? "");
  return /[",\n]/.test(string) ? `"${string.replace(/"/g, '""')}"` : string;
}

export function renderCsv(rows) {
  const lines = [
    CSV_HEADERS.join(","),
    ...rows.map((row) => CSV_HEADERS.map((header) => csvEscape(row[header])).join(",")),
  ];
  return `${lines.join("\n")}\n`;
}

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function loadCandidates(directory) {
  const files = fs
    .readdirSync(directory)
    .filter((file) => /^batch-\d{2}\.json$/.test(file))
    .sort();
  return files.flatMap((file) => readJson(path.join(directory, file)).rows || []);
}

function optionValue(flag) {
  const index = process.argv.indexOf(flag);
  return index === -1 ? "" : process.argv[index + 1] || "";
}

function writeJsonAtomic(filePath, value) {
  const tempPath = `${filePath}.${process.pid}.tmp`;
  fs.writeFileSync(tempPath, `${JSON.stringify(value, null, 2)}\n`, { mode: 0o600 });
  fs.renameSync(tempPath, filePath);
}

function writeTextAtomic(filePath, value) {
  const tempPath = `${filePath}.${process.pid}.tmp`;
  fs.writeFileSync(tempPath, value, { mode: 0o600 });
  fs.renameSync(tempPath, filePath);
}

function printErrors(errors) {
  for (const error of errors) console.error(error);
}

function main() {
  const batchPath = optionValue("--check-batch");
  if (batchPath) {
    const batchNumber = Number(optionValue("--batch-number"));
    const expectations = BATCH_EXPECTATIONS[batchNumber];
    if (!expectations) throw new Error(`Unsupported batch number: ${batchNumber}`);
    const errors = validateBatch(readJson(batchPath), expectations);
    if (errors.length > 0) {
      printErrors(errors);
      process.exitCode = 1;
      return;
    }
    console.log(`Batch ${batchNumber} valid: ${expectations.count} posts; pillars and intents match.`);
    return;
  }

  const portfolioDirectory = optionValue("--check-portfolio") || optionValue("--apply");
  if (!portfolioDirectory) {
    throw new Error("Use --check-batch, --check-portfolio, or --apply");
  }
  const schedulePath = optionValue("--schedule");
  if (!schedulePath) throw new Error("Missing --schedule path");
  const schedule = readJson(schedulePath);
  const candidates = loadCandidates(portfolioDirectory);
  const report = validatePortfolio(schedule.rows || [], candidates);
  const reportPath = optionValue("--report");
  if (reportPath) writeJsonAtomic(reportPath, report);

  const applying = Boolean(optionValue("--apply"));
  if (report.errors.length > 0 || report.similarityFlags.length > 0) {
    printErrors(report.errors);
    if (report.similarityFlags.length > 0) {
      console.error(`${report.similarityFlags.length} unresolved similarity flags`);
    }
    process.exitCode = 1;
    return;
  }

  if (!applying) {
    console.log(`Portfolio valid: ${candidates.length} candidates; 0 errors; 0 unresolved similarity flags.`);
    return;
  }

  const csvPath = optionValue("--csv");
  const backupDirectory = optionValue("--backup-dir");
  if (!csvPath || !backupDirectory) throw new Error("--apply requires --csv and --backup-dir");
  fs.mkdirSync(backupDirectory, { recursive: true });
  const jsonBackup = path.join(backupDirectory, path.basename(schedulePath));
  const csvBackup = path.join(backupDirectory, path.basename(csvPath));
  if (fs.existsSync(jsonBackup) || fs.existsSync(csvBackup)) {
    throw new Error(`Backup files already exist in ${backupDirectory}`);
  }
  fs.copyFileSync(schedulePath, jsonBackup, fs.constants.COPYFILE_EXCL);
  fs.copyFileSync(csvPath, csvBackup, fs.constants.COPYFILE_EXCL);

  const applied = applyPortfolio(schedule, candidates, EDITORIAL_VERSION);
  applied.updated_at = new Date().toISOString();
  writeJsonAtomic(schedulePath, applied);
  writeTextAtomic(csvPath, renderCsv(applied.rows));
  console.log(`Applied ${candidates.length} editorial posts; live schedule and CSV updated atomically.`);
}

const isMain = process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1]);
if (isMain) {
  try {
    main();
  } catch (error) {
    console.error(error instanceof Error ? error.stack || error.message : error);
    process.exitCode = 1;
  }
}
