import { spawnSync } from "node:child_process";
import fs from "node:fs";
import fsp from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const siteUrl = "https://www.emc2ops.com";
const historyPath = path.join(root, ".meta-carousel-post-history.json");
const graphVersionFallback = "v25.0";
const flags = new Set(process.argv.slice(2));
const timezone = "America/New_York";
const slideSize = 1080;

function currentRunDate() {
  const parts = new Intl.DateTimeFormat("en-CA", {
    day: "2-digit",
    month: "2-digit",
    timeZone: timezone,
    year: "numeric",
  }).formatToParts(new Date());

  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return `${values.year}-${values.month}-${values.day}`;
}

const runDate = currentRunDate();

const carousels = [
  {
    slug: "owner-update-triggers",
    topic: "owner update trigger framework",
    hook: "If owners only hear from you when something breaks, fix these 5 update triggers.",
    caption: `What is owner update automation for property managers?
It is a workflow that turns verified leasing, maintenance, renewal, and exception events into owner-ready summaries with approval rules and CRM logging.

Most owner communication gets noisy when the team has to rewrite status from inbox threads, calls, vendor texts, and work orders. Better property management automation uses AI voice, SMS, and CRM workflows to package the right update at the right moment, while keeping judgment-heavy or sensitive messages in staff review.

This framework is useful for owners who need visibility without constant check-ins. It also helps operations teams reduce ad hoc status requests, missed approval moments, and inconsistent owner updates across portfolios.

We build property management automation for teams in Dallas, Houston, Phoenix, Charlotte, Atlanta, Tampa, Orlando, Austin, Nashville, Miami, and remote teams across the U.S.

Book a 15-minute workflow audit: https://www.emc2ops.com/

#PropertyManagementAutomation #OwnerUpdates #AIFrontDesk #CRMWorkflows #PropertyManagement`,
    slides: [
      {
        eyebrow: "EMC2Ops",
        kicker: "Owner comms",
        title: "If owners only hear from you when something breaks,",
        titleAccent: "fix these 5 update triggers.",
        body: "Owner trust usually erodes in the gaps between leasing, maintenance, renewals, and approvals. The fix is a trigger-based update system, not more manual recap work.",
        footer: "Swipe for the owner update framework",
        visual: "owner",
      },
      {
        eyebrow: "Trigger 01",
        kicker: "Leasing movement",
        title: "Send an update when leasing status actually changes.",
        body: "New listing launch, showing velocity, approved application, or a stalled unit are owner-visible events. They should not wait for a monthly recap.",
        footer: "Use verified leasing milestones, not ad hoc summaries",
        visual: "timeline",
      },
      {
        eyebrow: "Trigger 02",
        kicker: "Maintenance exception",
        title: "Owners need the exception path, not every wrench turn.",
        body: "Emergency maintenance, large delays, repeat repairs, or habitability-sensitive issues deserve a clean update with issue, action, cost risk, and next step.",
        footer: "Update on exceptions before owners have to ask",
        visual: "alert",
      },
      {
        eyebrow: "Trigger 03",
        kicker: "Approval threshold",
        title: "Route decisions when spend or policy crosses the line.",
        body: "Once repair cost, make-ready scope, concession requests, or vendor proposals hit the approval threshold, the owner should receive the summary before the workflow stalls.",
        footer: "Approval rules should be explicit by property or owner",
        visual: "route",
      },
      {
        eyebrow: "Trigger 04",
        kicker: "Renewal risk",
        title: "Expiring leases deserve an owner-facing risk summary.",
        body: "Renewal hesitation, notice received, pricing decisions, or likely vacancy should create an update that explains what changed and what decision is needed next.",
        footer: "Renewal risk is better handled early than explained late",
        visual: "score",
      },
      {
        eyebrow: "Trigger 05",
        kicker: "Digest layer",
        title: "Give owners a clean weekly or monthly roll-up from the CRM.",
        body: "The digest should summarize open turns, recent wins, pending approvals, and unresolved risks from the system of record instead of from someone’s memory.",
        footer: "If the CRM is messy, owner updates will be messy too",
        visual: "crm",
      },
      {
        eyebrow: "EMC2Ops",
        kicker: "Workflow audit",
        title: "Want cleaner owner communication?",
        body: "We install done-for-you AI front desk, SMS, and CRM workflows for owner updates, approval routing, maintenance exceptions, and portfolio operations.",
        footer: "Book a 15-minute workflow audit",
        visual: "cta",
      },
    ],
  },
  {
    slug: "vendor-dispatch-approval-map",
    topic: "vendor dispatch approval map",
    hook: "Dispatch slows down when every repair starts from scratch. Use this 5-rule routing map.",
    caption: `What is vendor dispatch automation for property managers?
It is a workflow that takes a dispatch-ready maintenance request, checks trade, approval rules, access context, and next-step ownership, then routes the job into the right vendor and CRM path.

Most vendor delays are not vendor problems first. They are routing problems. When maintenance intake automation, owner approval logic, AI voice, SMS, and property management CRM workflows are disconnected, staff have to rebuild the request before anyone can act.

This dispatch map helps teams tighten vendor handoffs, reduce approval ping-pong, and keep the full work-order context attached from intake through closeout.

We build property management automation for operators in Dallas, Houston, Phoenix, Charlotte, Atlanta, Tampa, Orlando, Austin, Nashville, Miami, and remote teams across the U.S.

Book a 15-minute workflow audit: https://www.emc2ops.com/

#PropertyManagementAutomation #VendorDispatch #MaintenanceAutomation #CRMWorkflows #PropertyManagement`,
    slides: [
      {
        eyebrow: "EMC2Ops",
        kicker: "Vendor ops",
        title: "Dispatch slows down when every repair starts from scratch.",
        titleAccent: "Use this 5-rule routing map.",
        body: "A job should move from intake to vendor with the trade, context, approval path, and next owner already defined. Otherwise the team is re-triaging the same request all day.",
        footer: "Swipe for the vendor dispatch map",
        visual: "route",
      },
      {
        eyebrow: "Rule 01",
        kicker: "Trade match",
        title: "Do not dispatch until the trade is obvious.",
        body: "Plumbing, HVAC, electrical, appliance, general make-ready, and lockout work should not share the same routing path once the request is dispatch-ready.",
        footer: "Wrong trade selection creates the first avoidable delay",
        visual: "issue",
      },
      {
        eyebrow: "Rule 02",
        kicker: "Approval gate",
        title: "The workflow should know when owner approval is required.",
        body: "Cost thresholds, non-routine scope, repeat repairs, or policy-sensitive work should branch into approval before vendor outreach starts.",
        footer: "No approval rule means no predictable dispatch speed",
        visual: "owner",
      },
      {
        eyebrow: "Rule 03",
        kicker: "Access packet",
        title: "Vendors need entry context before they roll.",
        body: "Occupancy status, gate codes, pets, permission windows, resident contact, and any site-specific notes should travel with the dispatch.",
        footer: "If the vendor has to call back for basics, routing failed",
        visual: "access",
      },
      {
        eyebrow: "Rule 04",
        kicker: "Vendor branch",
        title: "Property rules should choose the vendor lane automatically.",
        body: "Preferred vendor lists, property exceptions, warranty paths, and after-hours routing should determine who gets the first dispatch, not whoever staff remembers first.",
        footer: "Good branch logic reduces vendor ping-pong",
        visual: "route",
      },
      {
        eyebrow: "Rule 05",
        kicker: "System of record",
        title: "Dispatch should write back to the CRM immediately.",
        body: "Trade, vendor, assignee, approval status, and next milestone belong in the property management CRM so maintenance, accounting, and owner updates stay aligned.",
        footer: "If the system of record is late, every follow-up is noisy",
        visual: "crm",
      },
      {
        eyebrow: "EMC2Ops",
        kicker: "Workflow audit",
        title: "Want faster dispatch with less backtracking?",
        body: "We install done-for-you maintenance intake automation, approval routing, vendor dispatch, AI voice, SMS, and CRM workflows for property management teams.",
        footer: "Book a 15-minute workflow audit",
        visual: "cta",
      },
    ],
  },
];

function readEnvFile(filePath) {
  if (!fs.existsSync(filePath)) return;

  const raw = fs.readFileSync(filePath, "utf8");
  for (const line of raw.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#") || !trimmed.includes("=")) continue;
    const index = trimmed.indexOf("=");
    const key = trimmed.slice(0, index).trim();
    const value = unquoteEnvValue(trimmed.slice(index + 1).trim());
    if (!process.env[key]) process.env[key] = value;
  }
}

function unquoteEnvValue(value) {
  if (
    (value.startsWith('"') && value.endsWith('"')) ||
    (value.startsWith("'") && value.endsWith("'"))
  ) {
    return value.slice(1, -1);
  }

  return value;
}

function loadEnv() {
  if (!process.env.META_CONNECTIONS_FILE) {
    process.env.META_CONNECTIONS_FILE = path.join(
      root,
      "acquisition-dashboard/.meta-social-connections.json",
    );
  }

  const candidates = [
    path.join(root, ".env"),
    path.join(root, ".env.local"),
    path.join(root, "acquisition-dashboard/.env"),
    path.join(root, "acquisition-dashboard/.env.local"),
  ];

  for (const filePath of candidates) readEnvFile(filePath);
}

function slugDir(carousel) {
  return `${runDate}-${carousel.slug}`;
}

function carouselDir(carousel) {
  return path.join(root, "public/social-assets/carousel", slugDir(carousel));
}

function publicSlideUrl(carousel, index) {
  return `${siteUrl}/social-assets/carousel/${slugDir(carousel)}/slide-${index + 1}.png`;
}

function visualMarkup(type) {
  const dotStack = "<span></span><span></span><span></span>";

  const visuals = {
    access: `<div class="badge-list"><i></i><i></i><i></i><b></b></div>`,
    alert: `<div class="alert-grid"><span></span><span></span><span></span><b></b></div>`,
    branch: `<div class="branch"><i></i><i></i><i></i><span></span><span></span><span></span></div>`,
    crm: `<div class="crm-board">${dotStack}<b></b><b></b></div>`,
    cta: `<div class="cta-ring"><span></span><span></span><span></span><b></b></div>`,
    issue: `<div class="issue-card"><span></span><span></span><i></i></div>`,
    message: `<div class="message-stack"><span></span><span></span><span></span><b></b></div>`,
    owner: `<div class="owner-loop"><span></span><span></span><b></b><i></i></div>`,
    "question-grid": `<div class="question-grid"><span>Move-in</span><span>Unit</span><span>Budget</span><span>Tour</span></div>`,
    route: `<div class="route-board">${dotStack}<b></b></div>`,
    score: `<div class="scorecard"><span></span><span></span><span></span><span></span><span></span></div>`,
    stop: `<div class="stop-rules"><span></span><span></span><span></span><b></b></div>`,
    timeline: `<div class="timeline"><i></i><i></i><i></i><b></b></div>`,
  };

  return visuals[type] || visuals.timeline;
}

function escapeHtml(value) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

function slideHtml(slide, index, total) {
  return `
    <section class="slide">
      <div class="chrome">
        <div class="top">
          <span>${escapeHtml(slide.eyebrow)}</span>
          <span>${String(index + 1).padStart(2, "0")} / ${String(total).padStart(2, "0")}</span>
        </div>
        <div class="copy">
          <p class="kicker">${escapeHtml(slide.kicker)}</p>
          <h1>${escapeHtml(slide.title)}${
            slide.titleAccent ? `<em>${escapeHtml(slide.titleAccent)}</em>` : ""
          }</h1>
          <p class="body">${escapeHtml(slide.body).replaceAll("\n", "<br>")}</p>
        </div>
        <div class="visual-wrap">${visualMarkup(slide.visual)}</div>
        <div class="footer">${escapeHtml(slide.footer)}</div>
      </div>
    </section>
  `;
}

function pageHtml(slide, index, total) {
  return `
  <!doctype html>
  <html>
    <head>
      <meta charset="utf-8">
      <style>
        * { box-sizing: border-box; }
        body {
          margin: 0;
          background: #0b0c0a;
          color: #f5f7fb;
          font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
        }
        .slide {
          width: ${slideSize}px;
          height: ${slideSize}px;
          position: relative;
          overflow: hidden;
          background:
            linear-gradient(180deg, #0b0c0a 0%, #12130f 56%, #090a07 100%);
        }
        .slide::before {
          content: "";
          position: absolute;
          inset: 0;
          background:
            linear-gradient(90deg, rgba(247,201,72,0.08), transparent 32%, transparent 68%, rgba(70,230,176,0.08)),
            repeating-linear-gradient(0deg, rgba(255,255,255,0.04), rgba(255,255,255,0.04) 1px, transparent 1px, transparent 52px),
            repeating-linear-gradient(90deg, rgba(255,255,255,0.04), rgba(255,255,255,0.04) 1px, transparent 1px, transparent 52px);
          opacity: 0.9;
        }
        .slide::after {
          content: "";
          position: absolute;
          inset: 0;
          background:
            radial-gradient(circle at 14% 14%, rgba(247,201,72,0.16), transparent 22%),
            radial-gradient(circle at 86% 18%, rgba(70,230,176,0.16), transparent 24%);
        }
        .chrome {
          position: absolute;
          inset: 36px;
          display: grid;
          grid-template-rows: auto 1fr auto auto;
          padding: 42px;
          background: linear-gradient(180deg, rgba(255,255,255,0.07), rgba(255,255,255,0.025));
          border: 1px solid rgba(255,255,255,0.12);
          border-radius: 8px;
          box-shadow: 0 24px 70px rgba(0,0,0,0.38);
          z-index: 1;
        }
        .top,
        .footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          font-size: 22px;
          font-weight: 900;
          text-transform: uppercase;
          letter-spacing: 0;
        }
        .top span:first-child {
          display: inline-flex;
          align-items: center;
          gap: 12px;
        }
        .top span:first-child::before {
          content: "E";
          width: 38px;
          height: 38px;
          display: grid;
          place-items: center;
          border-radius: 8px;
          background: linear-gradient(135deg, #f7c948, #46e6b0);
          color: #07100d;
          font-size: 21px;
          font-weight: 950;
        }
        .top span:last-child {
          color: #b8bcae;
        }
        .copy {
          align-self: end;
          max-width: 840px;
          padding-bottom: 28px;
        }
        .kicker {
          display: inline-flex;
          align-items: center;
          min-height: 52px;
          margin: 0 0 24px;
          padding: 0 18px;
          border-radius: 8px;
          border: 1px solid rgba(247,201,72,0.28);
          background: rgba(247,201,72,0.08);
          color: #ffe49a;
          font-size: 28px;
          font-weight: 850;
        }
        h1 {
          margin: 0;
          color: #f5f7fb;
          font-size: 74px;
          font-weight: 980;
          line-height: 0.92;
          letter-spacing: 0;
          text-wrap: balance;
        }
        h1 em {
          display: block;
          font-style: normal;
          background: linear-gradient(90deg, #ffffff, #f7c948 44%, #46e6b0);
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
        }
        .body {
          max-width: 800px;
          margin: 30px 0 0;
          color: #d2d7ca;
          font-size: 31px;
          font-weight: 760;
          line-height: 1.18;
        }
        .visual-wrap {
          display: flex;
          align-items: center;
          justify-content: flex-end;
          height: 248px;
          margin: 10px 0 22px;
        }
        .footer {
          min-height: 76px;
          padding: 0 26px;
          border: 1px solid rgba(70,230,176,0.24);
          border-radius: 8px;
          background: rgba(70,230,176,0.08);
          color: #f5f7fb;
        }
        .timeline,
        .message-stack,
        .branch,
        .stop-rules,
        .crm-board,
        .scorecard,
        .issue-card,
        .alert-grid,
        .badge-list,
        .route-board,
        .owner-loop,
        .question-grid,
        .cta-ring {
          position: relative;
          filter: drop-shadow(0 24px 42px rgba(0,0,0,0.38));
        }
        .timeline {
          width: 430px;
          height: 210px;
        }
        .timeline i {
          position: absolute;
          left: 0;
          width: 40px;
          height: 40px;
          border-radius: 999px;
          background: #f7c948;
        }
        .timeline i:nth-child(1) { top: 18px; }
        .timeline i:nth-child(2) { top: 84px; background: #ff8b6b; }
        .timeline i:nth-child(3) { top: 150px; background: #46e6b0; }
        .timeline i::after {
          content: "";
          position: absolute;
          top: 18px;
          left: 52px;
          width: 250px;
          border-top: 4px dashed rgba(70,230,176,0.56);
        }
        .timeline b,
        .route-board b,
        .cta-ring b {
          position: absolute;
          right: 0;
          top: 48px;
          width: 118px;
          height: 118px;
          background: #46e6b0;
          border-radius: 8px;
        }
        .timeline b::after,
        .route-board b::after,
        .cta-ring b::after {
          content: "✓";
          position: absolute;
          left: 26px;
          top: 4px;
          color: #07100d;
          font-size: 80px;
          font-weight: 950;
        }
        .message-stack {
          width: 390px;
          height: 220px;
        }
        .message-stack span {
          position: absolute;
          left: 0;
          right: 88px;
          height: 42px;
          border: 1px solid rgba(255,255,255,0.1);
          background: rgba(255,255,255,0.06);
          border-radius: 8px;
        }
        .message-stack span:nth-child(1) { top: 12px; }
        .message-stack span:nth-child(2) { top: 84px; }
        .message-stack span:nth-child(3) { top: 156px; }
        .message-stack b {
          position: absolute;
          right: 0;
          top: 70px;
          width: 72px;
          height: 72px;
          background: #f7c948;
          border-radius: 8px;
        }
        .message-stack b::after {
          content: "→";
          position: absolute;
          left: 18px;
          top: 4px;
          font-size: 44px;
          font-weight: 900;
          color: #15100a;
        }
        .question-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 14px;
          width: 410px;
        }
        .question-grid span {
          display: grid;
          place-items: center;
          height: 92px;
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 8px;
          background: rgba(255,255,255,0.06);
          color: #f5f7fb;
          font-size: 24px;
          font-weight: 850;
        }
        .question-grid span:nth-child(1),
        .question-grid span:nth-child(4) {
          color: #ffe49a;
          border-color: rgba(247,201,72,0.22);
        }
        .branch {
          width: 430px;
          height: 230px;
        }
        .branch i {
          position: absolute;
          left: 0;
          top: 90px;
          width: 140px;
          height: 44px;
          background: #f7c948;
          border-radius: 8px;
        }
        .branch i::after {
          content: "";
          position: absolute;
          left: 140px;
          top: 20px;
          width: 80px;
          border-top: 4px solid rgba(247,201,72,0.75);
        }
        .branch span {
          position: absolute;
          right: 0;
          width: 170px;
          height: 44px;
          border-radius: 8px;
          background: rgba(255,255,255,0.07);
          border: 1px solid rgba(255,255,255,0.1);
        }
        .branch span:nth-child(4) { top: 18px; }
        .branch span:nth-child(5) { top: 92px; border-color: rgba(70,230,176,0.24); background: rgba(70,230,176,0.12); }
        .branch span:nth-child(6) { top: 166px; }
        .branch span::before {
          content: "";
          position: absolute;
          left: -78px;
          width: 78px;
          border-top: 4px solid rgba(70,230,176,0.48);
        }
        .branch span:nth-child(4)::before { top: 22px; transform: rotate(-18deg); transform-origin: right center; }
        .branch span:nth-child(5)::before { top: 22px; }
        .branch span:nth-child(6)::before { top: 22px; transform: rotate(18deg); transform-origin: right center; }
        .stop-rules {
          width: 392px;
          display: grid;
          gap: 14px;
        }
        .stop-rules span {
          display: block;
          height: 38px;
          border: 1px solid rgba(255,255,255,0.1);
          background: rgba(255,255,255,0.06);
          position: relative;
        }
        .stop-rules span::before {
          content: "";
          position: absolute;
          left: 0;
          top: 0;
          width: 56px;
          height: 100%;
          background: #46e6b0;
        }
        .stop-rules b {
          position: absolute;
          right: -12px;
          top: 68px;
          width: 92px;
          height: 92px;
          border-radius: 999px;
          background: #ff6b6b;
          border: 10px solid #0b0c0a;
        }
        .stop-rules b::after {
          content: "";
          position: absolute;
          inset: 18px;
          background: #0b0c0a;
        }
        .crm-board {
          width: 410px;
          height: 220px;
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 14px;
          padding: 18px;
          background: rgba(8,11,16,0.75);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 8px;
        }
        .crm-board span,
        .crm-board b {
          display: block;
          background: rgba(255,255,255,0.06);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 8px;
        }
        .crm-board span::before,
        .crm-board b::before {
          content: "";
          display: block;
          width: 18px;
          height: 18px;
          margin: 16px;
          background: #46e6b0;
        }
        .scorecard {
          width: 390px;
          display: grid;
          gap: 14px;
        }
        .scorecard span {
          display: block;
          height: 34px;
          border-radius: 999px;
          background: linear-gradient(90deg, #f7c948 0 78px, rgba(255,255,255,0.07) 78px 100%);
          border: 1px solid rgba(255,255,255,0.1);
        }
        .issue-card {
          width: 340px;
          height: 210px;
          border-radius: 8px;
          background: rgba(255,255,255,0.06);
          border: 1px solid rgba(255,255,255,0.1);
          padding: 20px;
        }
        .issue-card span {
          display: block;
          height: 26px;
          background: rgba(255,255,255,0.08);
          margin-bottom: 16px;
        }
        .issue-card span:last-of-type {
          width: 72%;
        }
        .issue-card i {
          position: absolute;
          right: -14px;
          bottom: -14px;
          width: 98px;
          height: 98px;
          background: #46e6b0;
          border-radius: 8px;
        }
        .alert-grid {
          width: 380px;
          height: 220px;
        }
        .alert-grid span {
          position: absolute;
          width: 110px;
          height: 86px;
          border-radius: 8px;
          background: rgba(255,255,255,0.07);
          border: 1px solid rgba(255,255,255,0.1);
        }
        .alert-grid span:nth-child(1) { left: 0; top: 0; }
        .alert-grid span:nth-child(2) { right: 0; top: 0; }
        .alert-grid span:nth-child(3) { left: 64px; bottom: 0; }
        .alert-grid b {
          position: absolute;
          right: 38px;
          bottom: 16px;
          width: 110px;
          height: 110px;
          transform: rotate(45deg);
          background: #ff6b6b;
        }
        .alert-grid b::after {
          content: "!";
          position: absolute;
          left: 38px;
          top: 4px;
          color: #fff8f8;
          font-size: 72px;
          font-weight: 950;
          transform: rotate(-45deg);
        }
        .badge-list {
          width: 380px;
          height: 220px;
        }
        .badge-list i {
          display: block;
          width: 236px;
          height: 34px;
          margin-bottom: 18px;
          background: rgba(255,255,255,0.07);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 8px;
        }
        .badge-list b {
          position: absolute;
          right: 0;
          top: 42px;
          width: 120px;
          height: 120px;
          border-radius: 999px;
          border: 5px dashed rgba(70,230,176,0.4);
        }
        .badge-list b::after {
          content: "↗";
          position: absolute;
          left: 28px;
          top: 8px;
          color: #46e6b0;
          font-size: 62px;
          font-weight: 900;
        }
        .route-board {
          width: 420px;
          height: 220px;
        }
        .route-board span {
          position: absolute;
          left: 0;
          width: 44px;
          height: 44px;
          background: #ff8b6b;
          border-radius: 8px;
        }
        .route-board span:nth-child(1) { top: 26px; }
        .route-board span:nth-child(2) { top: 92px; }
        .route-board span:nth-child(3) { top: 158px; }
        .route-board span::after {
          content: "";
          position: absolute;
          left: 62px;
          top: 20px;
          width: 220px;
          border-top: 4px solid rgba(70,230,176,0.48);
        }
        .owner-loop {
          width: 410px;
          height: 220px;
        }
        .owner-loop span,
        .owner-loop b {
          position: absolute;
          width: 118px;
          height: 82px;
          border-radius: 8px;
          background: rgba(255,255,255,0.07);
          border: 1px solid rgba(255,255,255,0.1);
        }
        .owner-loop span:nth-child(1) { left: 0; top: 26px; }
        .owner-loop span:nth-child(2) { right: 0; top: 26px; }
        .owner-loop b {
          left: 146px;
          bottom: 20px;
          background: rgba(70,230,176,0.12);
          border-color: rgba(70,230,176,0.24);
        }
        .owner-loop i {
          position: absolute;
          inset: 0;
        }
        .owner-loop i::before,
        .owner-loop i::after {
          content: "";
          position: absolute;
          width: 120px;
          height: 120px;
          border: 4px dashed rgba(247,201,72,0.4);
          border-right: none;
          border-bottom: none;
          border-radius: 100px 0 0 0;
        }
        .owner-loop i::before {
          left: 92px;
          top: 0;
          transform: rotate(130deg);
        }
        .owner-loop i::after {
          right: 92px;
          top: 0;
          transform: rotate(-40deg);
        }
        .cta-ring {
          width: 228px;
          height: 228px;
          border-radius: 999px;
          border: 5px dashed rgba(70,230,176,0.42);
        }
        .cta-ring span {
          position: absolute;
          width: 44px;
          height: 44px;
          border-radius: 999px;
          background: #ff6b6b;
          border: 8px solid #0b0c0a;
        }
        .cta-ring span:nth-child(1) { left: 8px; top: 26px; }
        .cta-ring span:nth-child(2) { right: -10px; top: 80px; }
        .cta-ring span:nth-child(3) { left: 40px; bottom: 18px; }
        .cta-ring b {
          left: 52px;
          top: 52px;
          width: 112px;
          height: 112px;
          border-radius: 999px;
        }
        .cta-ring b::after {
          left: 22px;
          top: 0;
          font-size: 72px;
        }
      </style>
    </head>
    <body>${slideHtml(slide, index, total)}</body>
  </html>
  `;
}

async function contactSheetHtml(outDir, count) {
  const images = [];

  for (let index = 0; index < count; index += 1) {
    const bytes = await fsp.readFile(path.join(outDir, `slide-${index + 1}.png`));
    images.push(`<img src="data:image/png;base64,${bytes.toString("base64")}">`);
  }

  return `
  <!doctype html>
  <html>
    <head>
      <style>
        body {
          margin: 0;
          padding: 24px;
          width: max-content;
          display: grid;
          grid-template-columns: repeat(4, 270px);
          gap: 18px;
          background: #111;
        }
        img {
          display: block;
          width: 270px;
          height: 270px;
        }
      </style>
    </head>
    <body>${images.join("")}</body>
  </html>
  `;
}

async function writeJson(filePath, value) {
  await fsp.writeFile(filePath, `${JSON.stringify(value, null, 2)}\n`);
}

async function renderCarousel(carousel) {
  const outDir = carouselDir(carousel);
  await fsp.mkdir(outDir, { recursive: true });

  const browser = await chromium.launch();
  const page = await browser.newPage({
    deviceScaleFactor: 1,
    viewport: { width: slideSize, height: slideSize },
  });

  for (const [index, slide] of carousel.slides.entries()) {
    await page.setContent(pageHtml(slide, index, carousel.slides.length), {
      waitUntil: "load",
    });
    await page.screenshot({
      path: path.join(outDir, `slide-${index + 1}.png`),
      type: "png",
    });
  }

  await page.setViewportSize({ width: 1176, height: 606 });
  await page.setContent(await contactSheetHtml(outDir, carousel.slides.length), {
    waitUntil: "load",
  });
  await page.screenshot({
    path: path.join(outDir, "contact-sheet.png"),
    type: "png",
  });

  await browser.close();

  const metadata = {
    caption: carousel.caption,
    date: runDate,
    hook: carousel.hook,
    slideUrls: carousel.slides.map((_, index) => publicSlideUrl(carousel, index)),
    topic: carousel.topic,
  };

  await writeJson(path.join(outDir, "carousel.json"), metadata);
  return metadata;
}

function deployProduction() {
  const result = spawnSync("npx", ["vercel", "--prod", "--yes"], {
    cwd: root,
    encoding: "utf8",
    stdio: "pipe",
  });

  if (result.status !== 0) {
    throw new Error(
      `Vercel production deploy failed with exit code ${result.status}: ${result.stderr || result.stdout}`,
    );
  }

  const output = `${result.stdout}\n${result.stderr}`;
  const urlMatch = output.match(/https:\/\/[a-zA-Z0-9.-]+\.vercel\.app/g);
  return {
    output: output.trim(),
    url: urlMatch ? urlMatch[urlMatch.length - 1] : null,
  };
}

async function wait(ms) {
  await new Promise((resolve) => setTimeout(resolve, ms));
}

async function verifyImageUrl(url) {
  const response = await fetch(url, {
    headers: { "cache-control": "no-cache" },
  });

  return {
    contentType: response.headers.get("content-type") || "",
    ok: response.ok,
    status: response.status,
  };
}

async function verifyPublicImages(urls) {
  const maxAttempts = 18;

  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    const results = [];
    let allGood = true;

    for (const url of urls) {
      const result = await verifyImageUrl(url);
      results.push({ ...result, url });
      if (!result.ok || !result.contentType.startsWith("image/")) {
        allGood = false;
      }
    }

    if (allGood) return results;
    if (attempt < maxAttempts) await wait(10_000);
  }

  throw new Error(`Slide URLs did not return image responses: ${urls.join(", ")}`);
}

async function loadMetaStore() {
  const module = await import("../acquisition-dashboard/api/meta-store.js");
  return module;
}

async function getMetaConfig() {
  const { getActiveMetaConfig } = await loadMetaStore();
  const config = await getActiveMetaConfig();
  return {
    ...config,
    version: config.version || graphVersionFallback,
  };
}

async function postGraph(pathname, params) {
  const config = await getMetaConfig();
  const body = new URLSearchParams();

  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && value !== "") {
      body.set(key, String(value));
    }
  }

  body.set("access_token", config.pageAccessToken);
  if (config.appSecretProof) body.set("appsecret_proof", config.appSecretProof);

  const response = await fetch(`https://graph.facebook.com/${config.version}/${pathname}`, {
    body,
    method: "POST",
  });
  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data?.error?.message || `Graph API returned ${response.status}.`);
  }

  return data;
}

async function getGraph(pathname, params = {}) {
  const config = await getMetaConfig();
  const query = new URLSearchParams();

  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && value !== "") {
      query.set(key, String(value));
    }
  }

  query.set("access_token", config.pageAccessToken);
  if (config.appSecretProof) query.set("appsecret_proof", config.appSecretProof);

  const response = await fetch(
    `https://graph.facebook.com/${config.version}/${pathname}?${query.toString()}`,
  );
  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data?.error?.message || `Graph API returned ${response.status}.`);
  }

  return data;
}

async function assertMetaReady() {
  const config = await getMetaConfig();
  if (!config.facebookPageId || !config.pageAccessToken || !config.instagramBusinessAccountId) {
    throw new Error("Facebook or Instagram credentials are not configured for this run.");
  }

  const [pageProbe, instagramProbe] = await Promise.all([
    getGraph(config.facebookPageId, { fields: "id,name" }),
    getGraph(config.instagramBusinessAccountId, { fields: "id,username" }),
  ]);

  return {
    instagramAccount: instagramProbe,
    page: pageProbe,
    pageName: config.pageName || pageProbe.name || config.facebookPageId,
    version: config.version,
  };
}

async function waitForInstagramContainer(containerId) {
  for (let attempt = 0; attempt < 24; attempt += 1) {
    const status = await getGraph(containerId, {
      fields: "status,status_code",
    });

    if (status.status_code === "FINISHED") return status;
    if (status.status_code === "ERROR") {
      throw new Error(status.status || "Instagram media processing failed.");
    }

    await wait(2500);
  }

  throw new Error("Instagram media is still processing after the wait window.");
}

async function getInstagramPermalink(mediaId) {
  try {
    const media = await getGraph(mediaId, { fields: "id,permalink" });
    return media.permalink || null;
  } catch {
    return null;
  }
}

async function getFacebookPermalink(postId) {
  try {
    const post = await getGraph(postId, { fields: "id,permalink_url" });
    return post.permalink_url || null;
  } catch {
    return null;
  }
}

async function publishInstagramCarousel(carousel) {
  const config = await getMetaConfig();
  const slideUrls = carousel.slides.map((_, index) => publicSlideUrl(carousel, index));
  const childIds = [];

  for (const imageUrl of slideUrls) {
    const container = await postGraph(`${config.instagramBusinessAccountId}/media`, {
      image_url: imageUrl,
      is_carousel_item: "true",
    });
    await waitForInstagramContainer(container.id);
    childIds.push(container.id);
  }

  const parent = await postGraph(`${config.instagramBusinessAccountId}/media`, {
    caption: carousel.caption,
    children: childIds.join(","),
    media_type: "CAROUSEL",
  });
  await waitForInstagramContainer(parent.id);

  const published = await postGraph(`${config.instagramBusinessAccountId}/media_publish`, {
    creation_id: parent.id,
  });

  return {
    childContainerIds: childIds,
    id: published.id,
    permalink: await getInstagramPermalink(published.id),
  };
}

async function publishFacebookCarousel(carousel) {
  const config = await getMetaConfig();
  const slideUrls = carousel.slides.map((_, index) => publicSlideUrl(carousel, index));
  const photoIds = [];

  for (const imageUrl of slideUrls) {
    const photo = await postGraph(`${config.facebookPageId}/photos`, {
      published: "false",
      url: imageUrl,
    });
    photoIds.push(photo.id);
  }

  const params = { message: carousel.caption };
  photoIds.forEach((photoId, index) => {
    params[`attached_media[${index}]`] = JSON.stringify({ media_fbid: photoId });
  });

  const post = await postGraph(`${config.facebookPageId}/feed`, params);
  const permalink = await getFacebookPermalink(post.id);

  return {
    attachedPhotoIds: photoIds,
    id: post.id,
    permalink,
  };
}

async function readHistory() {
  try {
    const raw = await fsp.readFile(historyPath, "utf8");
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) return { format: "array", posts: parsed };
    if (Array.isArray(parsed?.posts)) return { format: "object", ...parsed };
    return { format: "array", posts: [] };
  } catch (error) {
    if (error?.code === "ENOENT") return { format: "array", posts: [] };
    throw error;
  }
}

async function updateHistory(entries) {
  const history = await readHistory();
  const posts = [...(history.posts || []), ...entries];
  const next =
    history.format === "object"
      ? {
          ...history,
          posts,
        }
      : posts;
  await writeJson(historyPath, next);
}

async function main() {
  loadEnv();

  const metaStatus = await assertMetaReady();
  const rendered = [];

  for (const carousel of carousels) {
    rendered.push(await renderCarousel(carousel));
  }

  let deploy = { output: "Skipped deploy", url: null };
  if (!flags.has("--skip-deploy")) {
    deploy = deployProduction();
  }

  const verification = [];
  if (!flags.has("--skip-verify")) {
    for (const carousel of carousels) {
      verification.push(
        await verifyPublicImages(carousel.slides.map((_, index) => publicSlideUrl(carousel, index))),
      );
    }
  }

  const postResults = [];
  if (!flags.has("--skip-publish")) {
    for (const carousel of carousels) {
      const [instagram, facebook] = await Promise.all([
        publishInstagramCarousel(carousel),
        publishFacebookCarousel(carousel),
      ]);

      postResults.push({
        carousel: carousel.slug,
        facebook,
        instagram,
      });
    }
  }

  if (!flags.has("--skip-publish")) {
    const historyEntries = carousels.map((carousel) => {
      const result = postResults.find((item) => item.carousel === carousel.slug);
      return {
        caption: carousel.caption,
        channels: ["instagram", "facebook"],
        createdAt: new Date().toISOString(),
        date: runDate,
        facebookPermalink: result?.facebook?.permalink || null,
        facebookPostId: result?.facebook?.id || null,
        hook: carousel.hook,
        instagramPermalink: result?.instagram?.permalink || null,
        instagramPostId: result?.instagram?.id || null,
        slideDirectory: carouselDir(carousel),
        slideUrls: carousel.slides.map((_, index) => publicSlideUrl(carousel, index)),
        topic: carousel.topic,
      };
    });

    await updateHistory(historyEntries);
  }

  const summary = {
    deploy,
    historyPath,
    metaStatus,
    postResults,
    rendered,
    runDate,
    verification,
  };

  console.log(JSON.stringify(summary, null, 2));
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});
