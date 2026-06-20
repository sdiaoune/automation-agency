import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { chromium } from 'playwright'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.resolve(__dirname, '..')

const date = process.argv[2] || new Date().toISOString().slice(0, 10)
const slot = process.argv[3] || 'morning'
const slug = 'dispatch-ready-maintenance-intake-scorecard'
const outDir = path.join(root, 'public/social-assets/carousel', `${date}-${slot}-${slug}`)

const slides = [
  {
    eyebrow: 'EMC2Ops',
    kicker: 'Maintenance ops',
    title: 'If a work order starts with',
    titleAccent: '"AC broken," it is not dispatch-ready.',
    body: 'Use this 6-point intake scorecard before you add more coordinators, vendors, or inbox rules.',
    footer: 'Swipe to score your current maintenance intake',
    visual: 'alert',
  },
  {
    eyebrow: 'Scorecard',
    kicker: 'Dispatch-ready = complete',
    title: 'A strong request gives the next person',
    titleAccent: 'the next move.',
    body: 'Your coordinator, vendor, or on-call tech should not need a second call just to understand the problem.',
    footer: '6 points total. One point for each field below.',
    visual: 'flow',
  },
  {
    eyebrow: 'Field 1',
    kicker: 'Issue clarity',
    title: 'Exact issue + exact location',
    body: 'Not "leak in unit." Capture what failed, where it is, and what the resident already tried.',
    footer: 'Think: issue type, room, fixture, system',
    visual: 'pin',
  },
  {
    eyebrow: 'Field 2',
    kicker: 'Risk screen',
    title: 'Urgency + safety before dispatch',
    body: 'Ask whether this is active water, no HVAC, electrical risk, lockout, smell of gas, or another emergency trigger.',
    footer: 'Emergency paths should escalate fast.',
    visual: 'shield',
  },
  {
    eyebrow: 'Field 3',
    kicker: 'Entry context',
    title: 'Access notes before a truck rolls',
    body: 'Collect entry permission, gate code, pets, adult present, preferred window, and whether the unit can be entered if no one answers.',
    footer: 'Access gaps create wasted trips.',
    visual: 'door',
  },
  {
    eyebrow: 'Field 4',
    kicker: 'Proof and context',
    title: 'Photos, asset details, and unit context',
    body: 'Request photos when supported, plus property, building, unit, appliance, or system details so vendors do not walk in blind.',
    footer: 'Good context reduces back-and-forth.',
    visual: 'cards',
  },
  {
    eyebrow: 'Fields 5 + 6',
    kicker: 'Handoff control',
    title: 'Route the right lane.',
    titleAccent: 'Log the next owner.',
    body: '5. Trade + approval path\\n6. CRM note + next step\\nBefore a human takes over, decide vendor vs staff, approval rules, and where the summary lives.',
    footer: 'This is where AI voice, SMS, and CRM workflows help.',
    visual: 'route',
  },
  {
    eyebrow: 'EMC2Ops',
    kicker: 'Done-for-you AI front desk',
    title: 'If you score under 5 out of 6,',
    titleAccent: 'automate intake before dispatch.',
    body: 'We install maintenance intake automation, vendor routing, missed-call text-back, AI voice, SMS, and property management CRM automation for operators.',
    footer: 'Book a 15-minute workflow audit at EMC2Ops',
    visual: 'cta',
  },
]

function visualMarkup(type) {
  const visuals = {
    alert: `<div class="alert"><b></b><span></span><span></span></div>`,
    cards: `<div class="mini-board"><span></span><span></span><span></span><strong></strong><strong></strong><strong></strong></div>`,
    cta: `<div class="orbital"><span></span><span></span><span></span><b></b></div>`,
    door: `<div class="door"><b></b><span></span><i></i></div>`,
    flow: `<div class="flow"><i></i><i></i><i></i><b></b></div>`,
    pin: `<div class="pin"><b></b><span></span><i></i></div>`,
    route: `<div class="route"><span></span><span></span><span></span><b></b></div>`,
    shield: `<div class="shield"><b></b><i></i></div>`,
  }

  return visuals[type] || visuals.flow
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
          <p class="body">${slide.body.replaceAll('\\n', '<br>')}</p>
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
        * { box-sizing: border-box; }
        body {
          margin: 0;
          background: #0b0c0a;
          color: #f5f7fb;
          font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
        }
        .slide {
          height: 1080px;
          overflow: hidden;
          position: relative;
          width: 1080px;
        }
        .slide::before {
          background:
            radial-gradient(circle at 10% 12%, rgba(247, 201, 72, 0.16), transparent 26%),
            radial-gradient(circle at 90% 18%, rgba(70, 230, 176, 0.14), transparent 28%),
            linear-gradient(180deg, #0b0c0a 0%, #12130f 52%, #080906 100%);
          content: "";
          inset: 0;
          position: absolute;
        }
        .slide::after {
          background-image:
            linear-gradient(rgba(255, 255, 255, 0.045) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255, 255, 255, 0.045) 1px, transparent 1px);
          background-size: 54px 54px;
          content: "";
          inset: 0;
          mask-image: linear-gradient(to bottom, rgba(0,0,0,0.75), transparent 74%);
          position: absolute;
        }
        .chrome {
          background: linear-gradient(180deg, rgba(255,255,255,.07), rgba(255,255,255,.025));
          border: 1px solid rgba(255, 255, 255, 0.12);
          border-radius: 8px;
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
          border-radius: 8px;
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
          max-width: 840px;
          padding-bottom: 28px;
        }
        .kicker {
          align-items: center;
          background: rgba(247,201,72,.08);
          border: 1px solid rgba(247,201,72,.28);
          border-radius: 8px;
          color: #ffe49a;
          display: inline-flex;
          font-size: 29px;
          font-weight: 850;
          margin: 0 0 24px;
          min-height: 54px;
          padding: 0 18px;
        }
        h1 {
          color: #f5f7fb;
          font-size: 79px;
          font-weight: 980;
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
          font-size: 31px;
          font-weight: 760;
          line-height: 1.18;
          margin: 34px 0 0;
          max-width: 790px;
        }
        .visual-wrap {
          align-items: center;
          display: flex;
          height: 250px;
          justify-content: flex-end;
          margin: 8px 0 24px;
          position: relative;
        }
        .footer {
          background: rgba(70,230,176,.08);
          border: 1px solid rgba(70,230,176,.24);
          border-radius: 8px;
          color: #f5f7fb;
          min-height: 76px;
          padding: 0 28px;
        }
        .alert,
        .door,
        .flow,
        .mini-board,
        .orbital,
        .pin,
        .route,
        .shield {
          filter: drop-shadow(0 24px 42px rgba(0, 0, 0, 0.38));
          position: relative;
        }
        .alert {
          border: 6px solid rgba(247,201,72,.72);
          border-radius: 8px;
          height: 218px;
          width: 218px;
        }
        .alert b {
          background: #f7c948;
          clip-path: polygon(50% 0%, 100% 100%, 0% 100%);
          display: block;
          height: 118px;
          left: 50px;
          position: absolute;
          top: 28px;
          width: 118px;
        }
        .alert b::after {
          color: #12120e;
          content: "!";
          font-size: 80px;
          font-weight: 950;
          left: 44px;
          position: absolute;
          top: 22px;
        }
        .alert span {
          background: rgba(255,255,255,.12);
          display: block;
          height: 16px;
          position: absolute;
          width: 120px;
        }
        .alert span:nth-child(2) { bottom: 38px; left: 32px; }
        .alert span:nth-child(3) { bottom: 14px; left: 32px; width: 84px; }
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
          border-radius: 8px;
          height: 128px;
          position: absolute;
          right: 0;
          top: 54px;
          width: 128px;
        }
        .flow b::after,
        .orbital b::after,
        .route b::after {
          color: #07100d;
          content: "✓";
          font-size: 84px;
          font-weight: 950;
          left: 26px;
          position: absolute;
          top: 4px;
        }
        .pin {
          height: 228px;
          width: 228px;
        }
        .pin b {
          background: #46e6b0;
          border-radius: 999px 999px 999px 0;
          display: block;
          height: 156px;
          left: 36px;
          position: absolute;
          top: 10px;
          transform: rotate(-45deg);
          width: 156px;
        }
        .pin span {
          background: #0b0c0a;
          border-radius: 999px;
          display: block;
          height: 62px;
          left: 83px;
          position: absolute;
          top: 57px;
          width: 62px;
        }
        .pin i {
          background: rgba(247,201,72,.88);
          display: block;
          height: 18px;
          left: 104px;
          position: absolute;
          top: 172px;
          transform: rotate(20deg);
          width: 18px;
        }
        .shield {
          height: 228px;
          width: 228px;
        }
        .shield b {
          background: linear-gradient(180deg, #f7c948, #46e6b0);
          clip-path: polygon(50% 0%, 90% 16%, 90% 58%, 50% 100%, 10% 58%, 10% 16%);
          display: block;
          height: 208px;
          left: 10px;
          position: absolute;
          top: 10px;
          width: 208px;
        }
        .shield i {
          background: #12120e;
          display: block;
          height: 18px;
          left: 104px;
          position: absolute;
          top: 58px;
          width: 20px;
        }
        .shield i::after {
          background: #12120e;
          content: "";
          height: 68px;
          left: -1px;
          position: absolute;
          top: 30px;
          width: 22px;
        }
        .door {
          height: 230px;
          width: 220px;
        }
        .door b {
          background: #151511;
          border: 6px solid rgba(247,201,72,.44);
          border-radius: 8px;
          display: block;
          height: 206px;
          left: 44px;
          position: absolute;
          top: 12px;
          width: 132px;
        }
        .door span {
          background: #46e6b0;
          border-radius: 999px;
          display: block;
          height: 18px;
          left: 142px;
          position: absolute;
          top: 112px;
          width: 18px;
        }
        .door i {
          background: rgba(255,255,255,.08);
          display: block;
          height: 150px;
          left: 72px;
          position: absolute;
          top: 40px;
          width: 72px;
        }
        .mini-board {
          background: rgba(8,11,16,.75);
          border: 1px solid rgba(255,255,255,.1);
          border-radius: 8px;
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
          border-radius: 8px;
          display: block;
        }
        .mini-board span::before,
        .mini-board strong::before {
          background: #46e6b0;
          border-radius: 4px;
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
          border-radius: 8px;
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
          border-radius: 8px;
          height: 116px;
          position: absolute;
          right: 0;
          top: 57px;
          width: 116px;
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

function contactSheetHtml(images) {
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
    <body>${images.map((src) => `<img src="${src}">`).join('')}</body>
  </html>
  `
}

await fs.mkdir(outDir, { recursive: true })

const browser = await chromium.launch()
const page = await browser.newPage({
  deviceScaleFactor: 1,
  viewport: { width: 1080, height: 1080 },
})

for (const [index, slide] of slides.entries()) {
  await page.setContent(pageHtml(slide, index), { waitUntil: 'load' })
  await page.screenshot({
    path: path.join(outDir, `slide-${index + 1}.png`),
    type: 'png',
  })
}

const imageDataUris = await Promise.all(
  slides.map(async (_, index) => {
    const bytes = await fs.readFile(path.join(outDir, `slide-${index + 1}.png`))
    return `data:image/png;base64,${bytes.toString('base64')}`
  }),
)

await page.setViewportSize({ width: 1176, height: 606 })
await page.setContent(contactSheetHtml(imageDataUris), { waitUntil: 'load' })
await page.screenshot({
  path: path.join(outDir, 'contact-sheet.png'),
  type: 'png',
})

await browser.close()

console.log(JSON.stringify({ outDir, slideCount: slides.length, slug, slot, date }, null, 2))
