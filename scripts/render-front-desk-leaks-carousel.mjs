import { chromium } from 'playwright'
import path from 'node:path'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.resolve(__dirname, '..')
const outDir = path.join(root, 'public/social-assets/carousel/front-desk-leaks')

const slides = [
  {
    eyebrow: 'EMC2Ops',
    kicker: 'Property managers',
    title: 'Your leasing team is not slow.',
    titleAccent: 'Your handoffs are leaking.',
    body: 'Most “response time” problems are really workflow gaps between calls, texts, maintenance requests, and the CRM.',
    footer: 'Swipe for the 5 leaks to fix first',
    visual: 'flow',
  },
  {
    eyebrow: 'Leak 01',
    kicker: 'Missed calls',
    title: 'A missed call becomes a cold lead.',
    body: 'If the first useful reply waits until someone checks voicemail, your best prospects are already booking tours somewhere else.',
    footer: 'Fix: instant text-back + qualification',
    visual: 'phone',
  },
  {
    eyebrow: 'Leak 02',
    kicker: 'After hours',
    title: 'The office closes. Demand does not.',
    body: 'Evening and weekend inquiries need a useful next step: confirm intent, collect basics, answer FAQs, and route hot leads.',
    footer: 'Fix: after-hours AI front desk',
    visual: 'moon',
  },
  {
    eyebrow: 'Leak 03',
    kicker: 'Maintenance',
    title: 'Half-formed requests create double work.',
    body: '“The sink is broken” is not enough. Your team still has to chase urgency, photos, access notes, unit details, and vendor routing.',
    footer: 'Fix: structured intake before dispatch',
    visual: 'wrench',
  },
  {
    eyebrow: 'Leak 04',
    kicker: 'CRM updates',
    title: 'If it is not logged, it did not happen.',
    body: 'When follow-up depends on memory, sticky notes, or “I’ll update it later,” leads stall and owners ask for status twice.',
    footer: 'Fix: automatic CRM notes + task handoff',
    visual: 'cards',
  },
  {
    eyebrow: 'Leak 05',
    kicker: 'Escalations',
    title: 'Every request should know where to go.',
    body: 'The goal is not to automate everything. The goal is to route routine work fast and escalate exceptions clearly.',
    footer: 'Fix: rules, owners, and escalation paths',
    visual: 'route',
  },
  {
    eyebrow: 'The framework',
    kicker: 'Start here',
    title: 'Automate the first 3 minutes.',
    body: '1. Acknowledge\n2. Qualify\n3. Route\n4. Log\n5. Escalate when needed',
    footer: 'Small workflow. Big operational relief.',
    visual: 'checklist',
  },
  {
    eyebrow: 'EMC2Ops',
    kicker: 'Done-for-you AI front desk',
    title: 'Want fewer dropped conversations?',
    body: 'We install missed-call recovery, leasing follow-up, maintenance intake, and CRM logging workflows for property managers.',
    footer: 'Book a 15-minute workflow audit',
    visual: 'cta',
  },
]

function visualMarkup(type) {
  const commonDots = '<span></span><span></span><span></span>'
  const markup = {
    cards: `<div class="mini-board">${commonDots}<strong></strong><strong></strong><strong></strong></div>`,
    checklist: `<div class="check-stack"><i></i><i></i><i></i><i></i><i></i></div>`,
    cta: `<div class="orbital"><span></span><span></span><span></span><b></b></div>`,
    flow: `<div class="flow"><i></i><i></i><i></i><b></b></div>`,
    moon: `<div class="moon"><span></span><i></i></div>`,
    phone: `<div class="phone"><span></span><span></span><span></span></div>`,
    route: `<div class="route">${commonDots}<b></b></div>`,
    wrench: `<div class="wrench"><span></span><b></b></div>`,
  }

  return markup[type] || markup.flow
}

function slideHtml(slide, index) {
  return `
    <section class="slide">
      <div class="chrome">
        <div class="top">
          <span>${slide.eyebrow}</span>
          <span>${String(index + 1).padStart(2, '0')} / ${String(slides.length).padStart(2, '0')}</span>
        </div>
        <div class="copy">
          <p class="kicker">${slide.kicker}</p>
          <h1>${slide.title}${slide.titleAccent ? `<em>${slide.titleAccent}</em>` : ''}</h1>
          <p class="body">${slide.body.replaceAll('\n', '<br>')}</p>
        </div>
        <div class="visual-wrap">${visualMarkup(slide.visual)}</div>
        <div class="footer">${slide.footer}</div>
      </div>
    </section>
  `
}

function pageHtml(slide, index) {
  return `
  <!doctype html>
  <html>
    <head>
      <meta charset="utf-8">
      <style>
        @font-face { font-family: InterVar; src: local("Inter"); }
        * { box-sizing: border-box; }
        body {
          margin: 0;
          background: #0b0c0a;
          color: #f5f7fb;
          font-family: InterVar, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
        }
        .slide {
          height: 1080px;
          overflow: hidden;
          position: relative;
          width: 1080px;
        }
        .slide::before {
          background:
            radial-gradient(circle at 10% 12%, rgba(247, 201, 72, 0.18), transparent 25%),
            radial-gradient(circle at 88% 20%, rgba(70, 230, 176, 0.16), transparent 28%),
            linear-gradient(180deg, #0b0c0a 0%, #12130f 52%, #080906 100%);
          content: "";
          inset: 0;
          position: absolute;
        }
        .slide::after {
          background-image:
            linear-gradient(rgba(255, 255, 255, 0.05) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255, 255, 255, 0.05) 1px, transparent 1px);
          background-size: 54px 54px;
          content: "";
          inset: 0;
          mask-image: linear-gradient(to bottom, rgba(0,0,0,0.7), transparent 72%);
          position: absolute;
        }
        .chrome {
          background: linear-gradient(180deg, rgba(255,255,255,.07), rgba(255,255,255,.025));
          border: 1px solid rgba(255, 255, 255, 0.12);
          box-shadow: 0 24px 70px rgba(0,0,0,.38);
          display: grid;
          grid-template-rows: auto 1fr auto auto;
          height: calc(100% - 72px);
          inset: 36px;
          padding: 42px;
          position: absolute;
          width: calc(100% - 72px);
          z-index: 1;
        }
        .top, .footer {
          align-items: center;
          display: flex;
          font-size: 24px;
          font-weight: 900;
          justify-content: space-between;
          letter-spacing: 0;
          text-transform: uppercase;
        }
        .top span:first-child {
          align-items: center;
          color: #f5f7fb;
          display: inline-flex;
          gap: 12px;
        }
        .top span:first-child::before {
          background: linear-gradient(135deg, #f7c948, #46e6b0);
          color: #07100d;
          content: "E";
          display: grid;
          font-size: 24px;
          font-weight: 950;
          height: 42px;
          place-items: center;
          width: 42px;
        }
        .top span:last-child,
        .footer {
          color: #b8bcae;
        }
        .copy {
          align-self: end;
          max-width: 820px;
          padding-bottom: 28px;
        }
        .kicker {
          align-items: center;
          background: rgba(247,201,72,.08);
          border: 1px solid rgba(247,201,72,.28);
          color: #ffe49a;
          display: inline-flex;
          font-size: 30px;
          font-weight: 850;
          min-height: 54px;
          margin: 0 0 24px;
          padding: 0 18px;
        }
        h1 {
          color: #f5f7fb;
          font-size: 80px;
          font-weight: 980;
          letter-spacing: 0;
          line-height: 0.92;
          margin: 0;
          text-wrap: balance;
        }
        h1 em {
          background: linear-gradient(90deg, #fff, #f7c948 46%, #46e6b0);
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
          display: block;
          font-style: normal;
        }
        .body {
          color: #b8bcae;
          font-size: 32px;
          font-weight: 760;
          line-height: 1.17;
          margin: 34px 0 0;
          max-width: 780px;
        }
        .visual-wrap {
          align-items: center;
          display: flex;
          height: 260px;
          justify-content: flex-end;
          margin: 8px 0 22px;
          position: relative;
        }
        .footer {
          background: rgba(70,230,176,.08);
          border: 1px solid rgba(70,230,176,.24);
          color: #f5f7fb;
          min-height: 76px;
          padding: 0 28px;
        }
        .phone,
        .mini-board,
        .check-stack,
        .route,
        .flow,
        .moon,
        .wrench,
        .orbital {
          filter: drop-shadow(0 24px 42px rgba(0, 0, 0, 0.38));
          position: relative;
        }
        .phone {
          background: #151511;
          border: 7px solid #1c1c16;
          height: 220px;
          padding: 34px 22px;
          width: 148px;
        }
        .phone span {
          background: rgba(255,255,255,.14);
          display: block;
          height: 28px;
          margin-bottom: 18px;
          position: relative;
        }
        .phone span::after {
          background: #ff6b6b;
          border: 5px solid #151511;
          border-radius: 999px;
          content: "";
          height: 28px;
          position: absolute;
          right: -18px;
          top: -12px;
          width: 28px;
        }
        .flow {
          height: 230px;
          width: 430px;
        }
        .flow i {
          background: #ff6b6b;
          border-radius: 999px;
          height: 42px;
          left: 0;
          position: absolute;
          width: 42px;
        }
        .flow i:nth-child(1) { top: 22px; }
        .flow i:nth-child(2) { top: 92px; }
        .flow i:nth-child(3) { top: 162px; }
        .flow i::after {
          border-top: 4px dashed rgba(70,230,176,.56);
          content: "";
          left: 52px;
          position: absolute;
          top: 20px;
          width: 250px;
        }
        .flow b {
          background: #46e6b0;
          height: 128px;
          position: absolute;
          right: 0;
          top: 54px;
          width: 128px;
        }
        .flow b::after,
        .route b::after,
        .orbital b::after {
          color: #07100d;
          content: "✓";
          font-size: 84px;
          font-weight: 950;
          left: 26px;
          position: absolute;
          top: 4px;
        }
        .moon {
          background: #151511;
          border: 1px solid rgba(255,255,255,.12);
          height: 210px;
          overflow: hidden;
          width: 210px;
        }
        .moon span {
          background: #f7c948;
          border-radius: 999px;
          height: 122px;
          left: 42px;
          position: absolute;
          top: 38px;
          width: 122px;
        }
        .moon i {
          background: #151511;
          border-radius: 999px;
          height: 122px;
          left: 72px;
          position: absolute;
          top: 28px;
          width: 122px;
        }
        .wrench {
          height: 210px;
          width: 260px;
        }
        .wrench span {
          background: #ff6b6b;
          height: 78px;
          left: 10px;
          position: absolute;
          top: 40px;
          transform: rotate(-18deg);
          width: 160px;
        }
        .wrench b {
          background: #46e6b0;
          height: 72px;
          position: absolute;
          right: 8px;
          top: 110px;
          transform: rotate(-18deg);
          width: 180px;
        }
        .mini-board {
          background: rgba(8,11,16,.75);
          border: 1px solid rgba(255,255,255,.1);
          display: grid;
          gap: 16px;
          grid-template-columns: repeat(3, 1fr);
          height: 220px;
          padding: 24px;
          width: 360px;
        }
        .mini-board span,
        .mini-board strong {
          background: rgba(255,255,255,.06);
          border: 1px solid rgba(255,255,255,.1);
          display: block;
        }
        .mini-board span::before,
        .mini-board strong::before {
          background: #46e6b0;
          content: "";
          display: block;
          height: 18px;
          margin: 18px;
          width: 18px;
        }
        .route {
          height: 230px;
          width: 420px;
        }
        .route span {
          background: #ff6b6b;
          height: 46px;
          left: 0;
          position: absolute;
          width: 46px;
        }
        .route span:nth-child(1) { top: 30px; }
        .route span:nth-child(2) { top: 100px; }
        .route span:nth-child(3) { top: 170px; }
        .route span::after {
          background: rgba(70,230,176,.36);
          content: "";
          height: 5px;
          left: 66px;
          position: absolute;
          top: 22px;
          width: 240px;
        }
        .route b {
          background: #46e6b0;
          height: 116px;
          position: absolute;
          right: 0;
          top: 57px;
          width: 116px;
        }
        .check-stack {
          display: grid;
          gap: 14px;
          width: 390px;
        }
        .check-stack i {
          background: rgba(255,255,255,.06);
          border: 1px solid rgba(255,255,255,.1);
          height: 38px;
          position: relative;
        }
        .check-stack i::before {
          background: #46e6b0;
          color: #07100d;
          content: "✓";
          font-size: 24px;
          font-style: normal;
          font-weight: 950;
          height: 38px;
          left: 0;
          line-height: 38px;
          position: absolute;
          text-align: center;
          top: 0;
          width: 48px;
        }
        .orbital {
          border: 5px dashed rgba(70,230,176,.42);
          border-radius: 999px;
          height: 230px;
          width: 230px;
        }
        .orbital span {
          background: #ff6b6b;
          border: 8px solid #0b0c0a;
          border-radius: 999px;
          height: 46px;
          position: absolute;
          width: 46px;
        }
        .orbital span:nth-child(1) { left: 8px; top: 26px; }
        .orbital span:nth-child(2) { right: -10px; top: 82px; }
        .orbital span:nth-child(3) { bottom: 20px; left: 42px; }
        .orbital b {
          background: #46e6b0;
          border-radius: 999px;
          height: 112px;
          left: 52px;
          position: absolute;
          top: 52px;
          width: 112px;
        }
        .orbital b::after {
          font-size: 72px;
          left: 23px;
          top: 1px;
        }
      </style>
    </head>
    <body>${slideHtml(slide, index)}</body>
  </html>
  `
}

function contactSheetHtml() {
  const images = slides
    .map((_, index) => {
      const bytes = readFileSync(path.join(outDir, `slide-${index + 1}.png`)).toString('base64')

      return `<img src="data:image/png;base64,${bytes}">`
    })
    .join('')

  return `
  <!doctype html>
  <html>
    <head>
      <style>
        body {
          background: #111;
          display: grid;
          gap: 18px;
          grid-template-columns: repeat(4, 270px);
          margin: 0;
          padding: 24px;
          width: max-content;
        }
        img { display: block; height: 270px; width: 270px; }
      </style>
    </head>
    <body>${images}</body>
  </html>
  `
}

const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 1080, height: 1080 }, deviceScaleFactor: 1 })

for (const [index, slide] of slides.entries()) {
  await page.setContent(pageHtml(slide, index), { waitUntil: 'load' })
  await page.screenshot({
    path: path.join(outDir, `slide-${index + 1}.png`),
    type: 'png',
  })
}

await page.setViewportSize({ width: 1176, height: 606 })
await page.setContent(contactSheetHtml(), { waitUntil: 'load' })
await page.screenshot({
  path: path.join(outDir, 'contact-sheet.png'),
  type: 'png',
})

await browser.close()

console.log(`Rendered ${slides.length} slides to ${outDir}`)
