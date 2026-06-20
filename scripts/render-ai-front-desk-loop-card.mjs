import { chromium } from "@playwright/test";
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const background = path.join(root, "public/blog/social-assets/ai-front-desk-loop-not-chatbot-bg.png");
const output = path.join(root, "public/blog/social-assets/ai-front-desk-loop-not-chatbot.png");
const backgroundDataUri = `data:image/png;base64,${fs.readFileSync(background).toString("base64")}`;

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
        background-image:
          linear-gradient(90deg, rgba(8, 11, 16, 0.96) 0%, rgba(8, 11, 16, 0.88) 34%, rgba(8, 11, 16, 0.18) 72%),
          url("${backgroundDataUri}");
        background-size: cover;
        background-position: center;
        color: #f7fbff;
      }
      .rule {
        position: absolute;
        left: 96px;
        top: 94px;
        width: 116px;
        height: 8px;
        background: #45d6c0;
        border-radius: 999px;
      }
      .brand {
        position: absolute;
        left: 96px;
        top: 128px;
        font-size: 30px;
        font-weight: 750;
        letter-spacing: 0;
        color: #d8f8f2;
      }
      .title {
        position: absolute;
        left: 92px;
        top: 244px;
        width: 770px;
        font-size: 84px;
        line-height: 0.98;
        letter-spacing: 0;
        font-weight: 820;
      }
      .subtitle {
        position: absolute;
        left: 98px;
        top: 595px;
        width: 705px;
        font-size: 34px;
        line-height: 1.22;
        letter-spacing: 0;
        color: #d9e7ef;
      }
      .footer {
        position: absolute;
        left: 98px;
        bottom: 92px;
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
        background: #f5a84b;
      }
    </style>
  </head>
  <body>
    <main class="card">
      <div class="rule"></div>
      <div class="brand">EMC2Ops</div>
      <h1 class="title">The AI Front Desk Is a Loop, Not a Chatbot</h1>
      <p class="subtitle">Response, routing, escalation, and CRM updates for property management teams.</p>
      <div class="footer"><span>Property management automation</span><span class="dot"></span><span>emc2ops.com</span></div>
    </main>
  </body>
</html>`;

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1672, height: 941 }, deviceScaleFactor: 1 });
await page.setContent(html, { waitUntil: "networkidle" });
await page.screenshot({ path: output, type: "png" });
await browser.close();

console.log(output);
