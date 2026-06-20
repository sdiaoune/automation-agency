import fs from "node:fs/promises";
import { SpreadsheetFile, Workbook } from "@oai/artifact-tool";

const inputPath = "/Users/diaoune/automation-agency/outputs/emc2ops-apollo-candidates-2026-06-18/candidates.json";
const outputDir = "/Users/diaoune/automation-agency/outputs/emc2ops-apollo-candidates-2026-06-18";
const outputPath = `${outputDir}/emc2ops-apollo-enrichment-candidates-2026-06-18.xlsx`;

const rows = JSON.parse(await fs.readFile(inputPath, "utf8"));

const workbook = Workbook.create();
const summary = workbook.worksheets.add("Summary");
const detail = workbook.worksheets.add("40 Candidates");

const updated = rows.filter((row) => row["Dashboard write status"].startsWith("Updated")).length;
const emailReady = rows.filter((row) => row["Email ready"] === "Yes").length;
const unchanged = rows.length - updated;
const noisy = rows.filter((row) => row["Dashboard write status"].includes("noisy")).length;
const uniqueRequests = [...new Set(rows.map((row) => row["Apollo request ID"]).filter(Boolean))].length;

summary.getRange("A1:F1").values = [["EMC2Ops Apollo enrichment candidates", "", "", "", "", ""]];
summary.getRange("A3:B9").values = [
  ["Run date", "2026-06-18"],
  ["Approved scope", "40 people"],
  ["Apollo credits used", 40],
  ["Matched records", 40],
  ["Dashboard records updated", updated],
  ["Email-ready after enrichment", emailReady],
  ["Apollo request IDs", uniqueRequests],
];
summary.getRange("D3:F8").values = [
  ["Status", "Count", "Notes"],
  ["Updated", updated, "Clear person/company match written to dashboard"],
  ["Left unchanged", unchanged, "Already enriched, no safer write needed, or noisy"],
  ["Noisy/ambiguous", noisy, "Not written back"],
  ["Credits remaining from 50 approval", 10, "No extra candidates found locally"],
  ["External outreach", 0, "No emails, calls, sequences, exports, or proposals sent"],
];

const headers = [
  "Candidate #",
  "Company",
  "Stage",
  "Market",
  "Decision maker",
  "Email",
  "Phone",
  "Website",
  "Next follow-up",
  "Apollo request ID",
  "Apollo result",
  "Dashboard write status",
  "Email ready",
  "Source/provenance",
  "Notes excerpt",
  "Prospect ID",
];
const tableRows = rows.map((row) => headers.map((header) => row[header] ?? ""));
detail.getRange("A1:P1").values = [headers];
detail.getRange(`A2:P${rows.length + 1}`).values = tableRows;

// Basic professional formatting. The artifact-tool range API mirrors Excel's
// common presentation properties; keep it conservative for compatibility.
summary.getRange("A1:F1").merge();
summary.getRange("A1").format = {
  font: { bold: true, size: 18, color: "#ffffff" },
  fill: { color: "#1f2937" },
  alignment: { horizontal: "center" },
};
summary.getRange("A3:A9").format = { font: { bold: true }, fill: { color: "#e5e7eb" } };
summary.getRange("D3:F3").format = { font: { bold: true, color: "#ffffff" }, fill: { color: "#374151" } };
summary.getRange("D4:F8").format = { fill: { color: "#f9fafb" } };

detail.getRange("A1:P1").format = {
  font: { bold: true, color: "#ffffff" },
  fill: { color: "#1f2937" },
  alignment: { horizontal: "center" },
};
detail.getRange(`A2:P${rows.length + 1}`).format = {
  alignment: { vertical: "top", wrapText: true },
};

summary.freezePanes.freezeRows(1);
detail.freezePanes.freezeRows(1);
detail.autoFilter = { range: `A1:P${rows.length + 1}` };

const widths = {
  A: 80, B: 230, C: 95, D: 120, E: 260, F: 230, G: 140, H: 240,
  I: 115, J: 170, K: 95, L: 260, M: 90, N: 300, O: 420, P: 270,
};
for (const [col, width] of Object.entries(widths)) {
  detail.getRange(`${col}:${col}`).columnWidthPx = width;
}
summary.getRange("A:A").columnWidthPx = 180;
summary.getRange("B:B").columnWidthPx = 270;
summary.getRange("D:D").columnWidthPx = 180;
summary.getRange("E:E").columnWidthPx = 90;
summary.getRange("F:F").columnWidthPx = 360;

const inspected = await workbook.inspect({
  kind: "table",
  range: "40 Candidates!A1:P6",
  include: "values",
  tableMaxRows: 6,
  tableMaxCols: 16,
});
console.log(inspected.ndjson);

const errors = await workbook.inspect({
  kind: "match",
  searchTerm: "#REF!|#DIV/0!|#VALUE!|#NAME\\?|#N/A",
  options: { useRegex: true, maxResults: 50 },
  summary: "formula error scan",
});
console.log(errors.ndjson);

await fs.mkdir(outputDir, { recursive: true });
const output = await SpreadsheetFile.exportXlsx(workbook);
await output.save(outputPath);
console.log(outputPath);
