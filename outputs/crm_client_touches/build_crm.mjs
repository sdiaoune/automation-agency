import fs from "node:fs/promises";
import { SpreadsheetFile, Workbook } from "@oai/artifact-tool";

const outputDir = new URL(".", import.meta.url).pathname;
const outputPath = `${outputDir}client_touches_crm.xlsx`;

const workbook = Workbook.create();
workbook.worksheets.getItemOrNull?.("Sheet1")?.delete?.();

const dashboard = workbook.worksheets.add("Dashboard");
const contacts = workbook.worksheets.add("Contacts");
const touches = workbook.worksheets.add("Touch Log");
const templates = workbook.worksheets.add("Follow-up Templates");
const lists = workbook.worksheets.add("Lists");

const outreachStart = new Date("2026-06-07T00:00:00");
const today = new Date("2026-06-08T00:00:00");

const contactHeaders = [
  "Contact",
  "Company / Credential",
  "Channel",
  "Initial Touch Date",
  "Last Touch Date",
  "Status",
  "Response Date",
  "Next Follow-up Date",
  "Priority",
  "Owner",
  "Notes",
  "Last Message Snippet",
  "Days Since Last Touch",
  "Next Action",
];

const contactRows = [
  ["Constantinos Giannakis", "", "LinkedIn", outreachStart, today, "Pending Follow-up", "", new Date("2026-06-10T00:00:00"), "Medium", "Diaoune", "", "Thanks for connecting, Constantinos. I'm curious: after a...", "", ""],
  ["Adriana Alfayate LRI", "LRI", "LinkedIn", outreachStart, today, "Pending Follow-up", "", new Date("2026-06-10T00:00:00"), "Medium", "Diaoune", "", "Thanks for connecting, Adriana. I'm curious: after a...", "", ""],
  ["Khristian Cornelius", "", "LinkedIn", outreachStart, today, "Pending Follow-up", "", new Date("2026-06-10T00:00:00"), "Medium", "Diaoune", "", "Thanks for connecting, Khristian. I'm curious: after a...", "", ""],
  ["Korilynne Hodan, CAM", "CAM", "LinkedIn", outreachStart, outreachStart, "Pending Follow-up", "", new Date("2026-06-10T00:00:00"), "Medium", "Diaoune", "", "Thanks for connecting, Korilynne. I'm curious: after a...", "", ""],
  ["Michelle Mgbo", "", "LinkedIn", outreachStart, outreachStart, "Responded", outreachStart, new Date("2026-06-08T00:00:00"), "High", "Diaoune", "Only person who has responded so far. Needs a personalized reply / discovery next step.", "That's exactly what I was wondering. If a follow-up coul...", "", ""],
  ["Ryan Cassidy", "", "LinkedIn", outreachStart, outreachStart, "Pending Follow-up", "", new Date("2026-06-10T00:00:00"), "Medium", "Diaoune", "", "Thanks for connecting, Ryan. I'm curious: after a...", "", ""],
  ["Jessica Coffil, CAM", "CAM", "LinkedIn", outreachStart, outreachStart, "Pending Follow-up", "", new Date("2026-06-10T00:00:00"), "Medium", "Diaoune", "", "Thanks for connecting, Jessica. I'm curious: after a...", "", ""],
  ["Josh Hammer", "", "LinkedIn", outreachStart, outreachStart, "Pending Follow-up", "", new Date("2026-06-10T00:00:00"), "Medium", "Diaoune", "", "Thanks for connecting, Josh. I'm curious: after a...", "", ""],
];

const touchHeaders = ["Date", "Contact", "Channel", "Touch Type", "Direction", "Outcome", "Message / Notes", "Next Step"];
const touchRows = [
  [outreachStart, "Constantinos Giannakis", "LinkedIn", "Connection follow-up", "Outbound", "No response yet", "Thanks for connecting, Constantinos. I'm curious: after a...", "Follow up if no reply by Jun 10."],
  [outreachStart, "Adriana Alfayate LRI", "LinkedIn", "Connection follow-up", "Outbound", "No response yet", "Thanks for connecting, Adriana. I'm curious: after a...", "Follow up if no reply by Jun 10."],
  [outreachStart, "Khristian Cornelius", "LinkedIn", "Connection follow-up", "Outbound", "No response yet", "Thanks for connecting, Khristian. I'm curious: after a...", "Follow up if no reply by Jun 10."],
  [outreachStart, "Korilynne Hodan, CAM", "LinkedIn", "Connection follow-up", "Outbound", "No response yet", "Thanks for connecting, Korilynne. I'm curious: after a...", "Follow up if no reply by Jun 10."],
  [outreachStart, "Michelle Mgbo", "LinkedIn", "Connection follow-up", "Outbound", "Responded", "That's exactly what I was wondering. If a follow-up coul...", "Send personalized reply and book next conversation."],
  [outreachStart, "Ryan Cassidy", "LinkedIn", "Connection follow-up", "Outbound", "No response yet", "Thanks for connecting, Ryan. I'm curious: after a...", "Follow up if no reply by Jun 10."],
  [outreachStart, "Jessica Coffil, CAM", "LinkedIn", "Connection follow-up", "Outbound", "No response yet", "Thanks for connecting, Jessica. I'm curious: after a...", "Follow up if no reply by Jun 10."],
  [outreachStart, "Josh Hammer", "LinkedIn", "Connection follow-up", "Outbound", "No response yet", "Thanks for connecting, Josh. I'm curious: after a...", "Follow up if no reply by Jun 10."],
];

function styleTitle(sheet, range, title) {
  const firstCell = range.split(":")[0];
  sheet.getRange(firstCell).values = [[title]];
  sheet.getRange(range).format = {
    fill: "#164E63",
    font: { name: "Aptos Display", size: 18, color: "#FFFFFF", bold: true },
    horizontalAlignment: "left",
    verticalAlignment: "center",
  };
}

function styleHeader(range) {
  range.format = {
    fill: "#0F766E",
    font: { name: "Aptos", size: 11, color: "#FFFFFF", bold: true },
    horizontalAlignment: "center",
    verticalAlignment: "center",
    wrapText: true,
    borders: { preset: "all", style: "thin", color: "#C7D2FE" },
  };
}

function styleBody(range) {
  range.format = {
    fill: "#FFFFFF",
    font: { name: "Aptos", size: 10, color: "#111827" },
    verticalAlignment: "top",
    wrapText: true,
    borders: { preset: "all", style: "thin", color: "#E5E7EB" },
  };
}

function setWidths(sheet, widths) {
  widths.forEach(([col, width]) => {
    sheet.getRange(`${col}:${col}`).format.columnWidthPx = width;
  });
}

// Contacts
styleTitle(contacts, "A1:N1", "Client Touch CRM - Contacts");
contacts.getRange("A3:N3").values = [contactHeaders];
contacts.getRange("A4:N11").values = contactRows;
contacts.getRange("M4:M11").formulas = contactRows.map((_, i) => [`=IF(E${i + 4}="","",TODAY()-E${i + 4})`]);
contacts.getRange("N4:N11").formulas = contactRows.map((_, i) => {
  const row = i + 4;
  return [`=IF(F${row}="Responded","Reply / book next step",IF(H${row}<TODAY(),"Overdue follow-up",IF(H${row}=TODAY(),"Follow up today",IF(H${row}-TODAY()<=2,"Follow up soon","Monitor"))))`];
});
styleHeader(contacts.getRange("A3:N3"));
styleBody(contacts.getRange("A4:N30"));
contacts.getRange("D4:H30").format.numberFormat = "mmm d, yyyy";
contacts.getRange("M4:M30").format.numberFormat = "0";
setWidths(contacts, [["A", 190], ["B", 160], ["C", 90], ["D", 120], ["E", 120], ["F", 145], ["G", 120], ["H", 140], ["I", 95], ["J", 90], ["K", 280], ["L", 300], ["M", 110], ["N", 160]]);
contacts.getRange("A1:N1").format.rowHeightPx = 34;
contacts.getRange("A3:N3").format.rowHeightPx = 32;
contacts.getRange("A4:N30").format.rowHeightPx = 42;

// Touch Log
styleTitle(touches, "A1:H1", "Touch Log");
touches.getRange("A3:H3").values = [touchHeaders];
touches.getRange("A4:H11").values = touchRows;
styleHeader(touches.getRange("A3:H3"));
styleBody(touches.getRange("A4:H40"));
touches.getRange("A4:A40").format.numberFormat = "mmm d, yyyy";
setWidths(touches, [["A", 115], ["B", 190], ["C", 90], ["D", 150], ["E", 95], ["F", 120], ["G", 360], ["H", 260]]);
touches.getRange("A1:H1").format.rowHeightPx = 34;
touches.getRange("A3:H3").format.rowHeightPx = 32;
touches.getRange("A4:H40").format.rowHeightPx = 42;

// Dashboard
styleTitle(dashboard, "A1:H1", "Client Touch CRM Dashboard");
dashboard.getRange("A2:H2").values = [["Started reaching out on Jun 7, 2026. Michelle Mgbo is the only prospect marked Responded so far.", "", "", "", "", "", "", ""]];
dashboard.getRange("A2:H2").format = { font: { name: "Aptos", size: 10, color: "#475569" }, fill: "#ECFEFF" };
dashboard.getRange("A4:B4").values = [["Metric", "Value"]];
dashboard.getRange("D4:E4").values = [["Status", "Count"]];
dashboard.getRange("A5:A10").values = [["Prospects contacted"], ["Responded"], ["Pending follow-up"], ["Response rate"], ["Follow-ups due today"], ["Overdue follow-ups"]];
dashboard.getRange("B5:B10").formulas = [
  ['=COUNTA(Contacts!A4:A30)'],
  ['=COUNTIF(Contacts!F4:F30,"Responded")'],
  ['=COUNTIF(Contacts!F4:F30,"Pending Follow-up")'],
  ['=IFERROR(B6/B5,0)'],
  ['=COUNTIFS(Contacts!H4:H30,TODAY(),Contacts!F4:F30,"Pending Follow-up")'],
  ['=COUNTIFS(Contacts!H4:H30,"<"&TODAY(),Contacts!F4:F30,"Pending Follow-up")'],
];
dashboard.getRange("D5:D8").values = [["Responded"], ["Pending Follow-up"], ["Follow up today"], ["Overdue"]];
dashboard.getRange("E5:E8").formulas = [
  ['=COUNTIF(Contacts!F4:F30,"Responded")'],
  ['=COUNTIF(Contacts!F4:F30,"Pending Follow-up")'],
  ['=COUNTIFS(Contacts!H4:H30,TODAY(),Contacts!F4:F30,"Pending Follow-up")'],
  ['=COUNTIFS(Contacts!H4:H30,"<"&TODAY(),Contacts!F4:F30,"Pending Follow-up")'],
];
dashboard.getRange("A13:H13").values = [["Action Queue", "", "", "", "", "", "", ""]];
dashboard.getRange("A14:F14").values = [["Contact", "Status", "Last Touch", "Next Follow-up", "Priority", "Next Action"]];
dashboard.getRange("A15:F22").formulas = contactRows.map((_, i) => {
  const row = i + 4;
  return [
    `=Contacts!A${row}`,
    `=Contacts!F${row}`,
    `=Contacts!E${row}`,
    `=Contacts!H${row}`,
    `=Contacts!I${row}`,
    `=Contacts!N${row}`,
  ];
});
styleHeader(dashboard.getRange("A4:B4"));
styleBody(dashboard.getRange("A5:B10"));
styleHeader(dashboard.getRange("D4:E4"));
styleBody(dashboard.getRange("D5:E8"));
dashboard.getRange("A13:H13").format = { fill: "#CCFBF1", font: { name: "Aptos", size: 13, color: "#134E4A", bold: true } };
styleHeader(dashboard.getRange("A14:F14"));
styleBody(dashboard.getRange("A15:F22"));
dashboard.getRange("B8").format.numberFormat = "0.0%";
dashboard.getRange("C4:C10").format.fill = "#F8FAFC";
dashboard.getRange("A5:B10").format.rowHeightPx = 28;
dashboard.getRange("A15:F22").format.rowHeightPx = 34;
dashboard.getRange("C15:D22").format.numberFormat = "mmm d, yyyy";
setWidths(dashboard, [["A", 190], ["B", 110], ["C", 30], ["D", 160], ["E", 90], ["F", 30], ["G", 150], ["H", 150]]);

const chart = dashboard.charts.add("bar", {
  categories: ["Responded", "Pending Follow-up", "Follow up today", "Overdue"],
  series: [{ name: "Prospects", values: [1, 7, 0, 0], fill: { type: "solid", color: "#14B8A6" } }],
});
chart.title = "Outreach Status Snapshot";
chart.position = { left: 510, top: 80, width: 420, height: 240 };

// Templates
styleTitle(templates, "A1:F1", "Follow-up Templates");
templates.getRange("A3:F3").values = [["Stage", "When to Use", "Message Template", "Goal", "Owner Notes", "Use?"]];
templates.getRange("A4:F8").values = [
  ["Responder reply", "Michelle / anyone who replies", "Thanks for the reply, {{first_name}}. Quick question: are missed leasing calls, tenant intake, or stale lead follow-up causing the most friction right now?", "Learn pain and book next step", "Customize with their exact reply before sending.", "Yes"],
  ["No-response follow-up 1", "2-3 days after initial message", "Circling back, {{first_name}}. I help property managers keep leasing and tenant requests from slipping through the cracks with AI voice/SMS workflows. Worth a quick look?", "Restart conversation", "Keep it short and direct.", "Yes"],
  ["No-response follow-up 2", "5-7 days after initial message", "{{first_name}}, should I close the loop here, or would it be useful if I sent a quick example of how the workflow handles missed leasing calls?", "Create either/or response", "Use only after no response to follow-up 1.", "Yes"],
  ["Book meeting", "After positive reply", "Happy to show you. Would tomorrow afternoon or Thursday morning be easier for a 15-minute walkthrough?", "Schedule call", "Offer two clear windows.", "Yes"],
  ["Not now", "Soft no / delayed timing", "Totally fair. I can check back later. Is there a better month to revisit missed-call and tenant-intake automation?", "Get timing", "Log the revisit month in Contacts.", "Yes"],
];
styleHeader(templates.getRange("A3:F3"));
styleBody(templates.getRange("A4:F12"));
setWidths(templates, [["A", 150], ["B", 190], ["C", 520], ["D", 180], ["E", 260], ["F", 70]]);
templates.getRange("A4:F12").format.rowHeightPx = 58;

// Lists / dropdown source sheet
styleTitle(lists, "A1:D1", "CRM Lists");
lists.getRange("A3:D3").values = [["Status", "Priority", "Channel", "Touch Type"]];
lists.getRange("A4:D10").values = [
  ["Pending Follow-up", "High", "LinkedIn", "Connection follow-up"],
  ["Responded", "Medium", "Email", "Reply"],
  ["Meeting Booked", "Low", "Phone", "Discovery call"],
  ["Nurture", "", "SMS", "Follow-up"],
  ["Not Interested", "", "", "Check-in"],
  ["Do Not Contact", "", "", ""],
  ["Closed Won", "", "", ""],
];
styleHeader(lists.getRange("A3:D3"));
styleBody(lists.getRange("A4:D10"));
setWidths(lists, [["A", 170], ["B", 100], ["C", 100], ["D", 170]]);

for (const sheet of [dashboard, contacts, touches, templates, lists]) {
  sheet.showGridlines = false;
}

const inspectDashboard = await workbook.inspect({
  kind: "table",
  range: "Dashboard!A1:H22",
  include: "values,formulas",
  tableMaxRows: 24,
  tableMaxCols: 8,
});
console.log(inspectDashboard.ndjson);

const errors = await workbook.inspect({
  kind: "match",
  searchTerm: "#REF!|#DIV/0!|#VALUE!|#NAME\\?|#N/A",
  options: { useRegex: true, maxResults: 300 },
  summary: "final formula error scan",
});
console.log(errors.ndjson);

await workbook.render({ sheetName: "Dashboard", range: "A1:H24", scale: 1.5 });
await workbook.render({ sheetName: "Contacts", range: "A1:N16", scale: 1.3 });
await workbook.render({ sheetName: "Touch Log", range: "A1:H16", scale: 1.3 });
await workbook.render({ sheetName: "Follow-up Templates", range: "A1:F10", scale: 1.2 });
await workbook.render({ sheetName: "Lists", range: "A1:D12", scale: 1.2 });

await fs.mkdir(outputDir, { recursive: true });
const output = await SpreadsheetFile.exportXlsx(workbook);
await output.save(outputPath);
console.log(outputPath);
