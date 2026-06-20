import { chromium } from "@playwright/test";
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const output = path.join(root, "public/blog/social-assets/claude-fable-5-property-management-use-cases.png");
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
        background: #080b10;
        font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      }
      .card {
        position: relative;
        width: 1672px;
        height: 941px;
        color: #f7fbff;
        background:
          radial-gradient(circle at 82% 20%, rgba(245, 196, 113, 0.22), transparent 24%),
          radial-gradient(circle at 79% 79%, rgba(69, 214, 192, 0.24), transparent 27%),
          linear-gradient(135deg, #080b10 0%, #101923 54%, #12231f 100%);
      }
      .grid {
        position: absolute;
        inset: 0;
        background-image:
          linear-gradient(rgba(255,255,255,0.055) 1px, transparent 1px),
          linear-gradient(90deg, rgba(255,255,255,0.055) 1px, transparent 1px);
        background-size: 56px 56px;
        mask-image: linear-gradient(90deg, black 0%, rgba(0,0,0,0.86) 45%, transparent 100%);
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
        width: 850px;
        margin: 0;
        font-size: 86px;
        line-height: 0.99;
        letter-spacing: 0;
        font-weight: 850;
      }
      .subtitle {
        position: absolute;
        left: 98px;
        top: 601px;
        width: 800px;
        font-size: 34px;
        line-height: 1.24;
        letter-spacing: 0;
        color: #d9e7ef;
      }
      .usecases {
        position: absolute;
        right: 84px;
        top: 132px;
        width: 520px;
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 18px;
      }
      .tile {
        min-height: 132px;
        padding: 24px;
        border: 1px solid rgba(183, 226, 218, 0.22);
        border-radius: 8px;
        background: rgba(9, 18, 25, 0.76);
        box-shadow: 0 24px 70px rgba(0, 0, 0, 0.24);
      }
      .tile strong {
        display: block;
        color: #ffffff;
        font-size: 29px;
        line-height: 1.04;
        letter-spacing: 0;
      }
      .tile span {
        display: block;
        margin-top: 9px;
        color: #9fb4c0;
        font-size: 21px;
        line-height: 1.17;
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
      <div class="eyebrow">Claude Fable 5</div>
      <h1 class="title">10 use cases for property managers</h1>
      <p class="subtitle">Maintenance intake, missed-call recovery, tour scheduling, owner updates, vendor dispatch, and CRM logging.</p>
      <section class="usecases" aria-label="Use cases">
        <div class="tile"><strong>Intake</strong><span>Maintenance and leasing context</span></div>
        <div class="tile"><strong>Routing</strong><span>Staff, vendor, owner, resident</span></div>
        <div class="tile"><strong>Follow-up</strong><span>Tours, renewals, no-shows</span></div>
        <div class="tile"><strong>Logging</strong><span>CRM and PMS records</span></div>
        <div class="tile"><strong>Reports</strong><span>Weekly operating summaries</span></div>
        <div class="tile"><strong>Escalation</strong><span>Human review where it matters</span></div>
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
