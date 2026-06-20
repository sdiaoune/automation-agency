import { chromium } from "@playwright/test";
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const output = path.join(root, "public/blog/social-assets/claude-mythos-property-management-workflows.png");
fs.mkdirSync(path.dirname(output), { recursive: true });

const html = String.raw`<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <style>
      * { box-sizing: border-box; }
      body {
        margin: 0;
        width: 1672px;
        height: 941px;
        overflow: hidden;
        background: #070b10;
        font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      }
      .card {
        position: relative;
        width: 1672px;
        height: 941px;
        color: #f7fbff;
        background:
          radial-gradient(circle at 82% 21%, rgba(69, 214, 192, 0.26), transparent 24%),
          radial-gradient(circle at 78% 78%, rgba(245, 168, 75, 0.18), transparent 25%),
          linear-gradient(135deg, #070b10 0%, #0d1620 52%, #11231f 100%);
      }
      .grid {
        position: absolute;
        inset: 0;
        background-image:
          linear-gradient(rgba(255,255,255,0.055) 1px, transparent 1px),
          linear-gradient(90deg, rgba(255,255,255,0.055) 1px, transparent 1px);
        background-size: 56px 56px;
        mask-image: linear-gradient(90deg, black 0%, rgba(0,0,0,0.9) 45%, transparent 100%);
      }
      .brand {
        position: absolute;
        left: 96px;
        top: 86px;
        display: flex;
        align-items: center;
        gap: 18px;
        font-size: 30px;
        font-weight: 780;
        color: #d8f8f2;
      }
      .mark {
        width: 42px;
        height: 42px;
        border: 3px solid #45d6c0;
        border-radius: 10px;
        transform: rotate(45deg);
        box-shadow: 0 0 28px rgba(69, 214, 192, 0.45);
      }
      .eyebrow {
        position: absolute;
        left: 98px;
        top: 176px;
        color: #f5c471;
        font-size: 28px;
        font-weight: 760;
        letter-spacing: 0;
      }
      .title {
        position: absolute;
        left: 92px;
        top: 238px;
        width: 860px;
        margin: 0;
        font-size: 86px;
        line-height: 0.99;
        letter-spacing: 0;
        font-weight: 850;
      }
      .subtitle {
        position: absolute;
        left: 98px;
        top: 603px;
        width: 780px;
        font-size: 34px;
        line-height: 1.24;
        letter-spacing: 0;
        color: #d9e7ef;
      }
      .workflow {
        position: absolute;
        right: 92px;
        top: 142px;
        width: 500px;
        display: grid;
        gap: 22px;
      }
      .step {
        min-height: 104px;
        padding: 24px 28px;
        border: 1px solid rgba(183, 226, 218, 0.22);
        border-radius: 8px;
        background: rgba(9, 18, 25, 0.76);
        box-shadow: 0 24px 70px rgba(0, 0, 0, 0.25);
      }
      .step strong {
        display: block;
        color: #ffffff;
        font-size: 31px;
        line-height: 1.05;
        letter-spacing: 0;
      }
      .step span {
        display: block;
        margin-top: 9px;
        color: #9fb4c0;
        font-size: 23px;
        line-height: 1.18;
      }
      .footer {
        position: absolute;
        left: 98px;
        bottom: 82px;
        display: flex;
        gap: 18px;
        align-items: center;
        font-size: 26px;
        color: #9fb4c0;
      }
      .dot {
        width: 10px;
        height: 10px;
        border-radius: 999px;
        background: #45d6c0;
      }
    </style>
  </head>
  <body>
    <main class="card">
      <div class="grid"></div>
      <div class="brand"><span class="mark"></span><span>EMC2Ops</span></div>
      <div class="eyebrow">Claude Mythos rumor</div>
      <h1 class="title">Property managers need workflows, not AI hype</h1>
      <p class="subtitle">Mythos-class AI points to triage, routing, verification, and CRM updates for the messy middle of operations.</p>
      <section class="workflow" aria-label="Workflow model">
        <div class="step"><strong>Intake</strong><span>Calls, texts, forms, emails</span></div>
        <div class="step"><strong>Triage</strong><span>Missing fields, urgency, next step</span></div>
        <div class="step"><strong>Handoff</strong><span>Team, vendor, owner, resident</span></div>
        <div class="step"><strong>System update</strong><span>CRM/PMS record and follow-up</span></div>
      </section>
      <div class="footer"><span>AI front desk workflows</span><span class="dot"></span><span>emc2ops.com</span></div>
    </main>
  </body>
</html>`;

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1672, height: 941 }, deviceScaleFactor: 1 });
await page.setContent(html, { waitUntil: "networkidle" });
await page.screenshot({ path: output, type: "png" });
await browser.close();

console.log(output);
