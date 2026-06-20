import fs from 'node:fs/promises'
import path from 'node:path'
import { chromium } from 'playwright'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.resolve(__dirname, '..')
const slug = '2026-06-05-morning-first-workflow-scorecard'
const outDir = path.join(root, 'public/social-assets/carousel', slug)

const slides = [
  {
    eyebrow: 'EMC2Ops',
    kicker: 'Property management ops',
    title: 'Your first automation should be boring.',
    body: 'Start with the workflow your team repeats all day: missed-call text-back, leasing follow-up, maintenance intake, or CRM logging.',
    footer: 'Swipe for the 4-question operator test',
    label: '01',
    visual: 'cover',
  },
  {
    eyebrow: 'Question 1',
    kicker: 'Volume',
    title: 'Does this happen every day?',
    body: 'High-volume work is where property management automation pays off first. Think new lead intake, after-hours inquiries, showing reminders, and maintenance request capture.',
    footer: 'If it happens 20+ times a week, keep it on the shortlist',
    label: '02',
    visual: 'volume',
  },
  {
    eyebrow: 'Question 2',
    kicker: 'Predictable start',
    title: 'Is the first reply mostly the same?',
    body: 'If your team opens with the same 3 to 5 questions, an AI front desk for property managers can handle intake by voice or SMS without creating chaos.',
    footer: 'Best fit: qualification, confirmations, FAQs, and basic routing',
    label: '03',
    visual: 'questions',
  },
  {
    eyebrow: 'Question 3',
    kicker: 'Clear outcome',
    title: 'Can the workflow end in one of three states?',
    body: 'Good first automations finish with a clean next step: booked, routed, or logged. If nobody can define the outcome, do not automate it yet.',
    footer: 'Ambiguous processes make bad automations',
    label: '04',
    visual: 'outcomes',
  },
  {
    eyebrow: 'Question 4',
    kicker: 'Safe escalation',
    title: 'Can exceptions reach a human fast?',
    body: 'Keep fair-housing nuance, angry residents, owner approvals, and unusual vendor issues on an escalation path. Automation should narrow the queue, not trap it.',
    footer: 'The handoff rule matters more than the prompt',
    label: '05',
    visual: 'escalation',
  },
  {
    eyebrow: 'Scorecard',
    kicker: 'Save this',
    title: 'Pick the workflow that scores 4 out of 4.',
    body: '1. High volume\n2. Predictable opener\n3. Clear outcome\n4. Human escalation',
    footer: 'Best first bets: missed-call text-back, leasing follow-up, maintenance intake, and CRM updates',
    label: '06',
    visual: 'scorecard',
  },
  {
    eyebrow: 'EMC2Ops',
    kicker: '15-minute workflow audit',
    title: 'Need help choosing the first workflow?',
    body: 'We build done-for-you AI voice, SMS, and CRM workflows for property managers across leasing, tenant intake, maintenance, owner updates, vendor routing, and CRM handoffs.',
    footer: 'Book the audit at EMC2Ops.com',
    label: '07',
    visual: 'cta',
  },
]

function visualMarkup(type) {
  switch (type) {
    case 'cover':
      return `
        <div class="visual-grid">
          <div class="cell cell-accent">Calls</div>
          <div class="cell">Texts</div>
          <div class="cell">CRM</div>
          <div class="cell">Leasing</div>
          <div class="cell cell-green">Maintenance</div>
          <div class="cell">Routing</div>
        </div>
      `
    case 'volume':
      return `
        <div class="meter-stack">
          <div class="meter"><span style="width: 84%"></span></div>
          <div class="meter"><span style="width: 76%"></span></div>
          <div class="meter"><span style="width: 92%"></span></div>
          <div class="meter muted"><span style="width: 38%"></span></div>
        </div>
      `
    case 'questions':
      return `
        <div class="prompt-card">
          <div class="prompt-line">Move date?</div>
          <div class="prompt-line">Unit size?</div>
          <div class="prompt-line">Budget?</div>
          <div class="prompt-line">Tour timing?</div>
        </div>
      `
    case 'outcomes':
      return `
        <div class="outcome-flow">
          <div class="outcome start">Inquiry</div>
          <div class="connector"></div>
          <div class="outcome accent">Booked</div>
          <div class="outcome green">Routed</div>
          <div class="outcome">Logged</div>
        </div>
      `
    case 'escalation':
      return `
        <div class="route-panel">
          <div class="route-line">
            <span class="route-dot route-good"></span>
            <span class="route-bar"></span>
            <span class="route-target">Automation</span>
          </div>
          <div class="route-line">
            <span class="route-dot route-alert"></span>
            <span class="route-bar route-bar-alert"></span>
            <span class="route-target route-target-alert">Human</span>
          </div>
        </div>
      `
    case 'scorecard':
      return `
        <div class="score-panel">
          <div class="score-row"><span>Volume</span><b>YES</b></div>
          <div class="score-row"><span>Predictable</span><b>YES</b></div>
          <div class="score-row"><span>Outcome</span><b>YES</b></div>
          <div class="score-row"><span>Escalation</span><b>YES</b></div>
        </div>
      `
    case 'cta':
      return `
        <div class="cta-ring">
          <div class="cta-core">Audit</div>
        </div>
      `
    default:
      return ''
  }
}

function slideHtml(slide) {
  const bodyHtml = slide.body.includes('\n')
    ? `<ul class="body-list">${slide.body
        .split('\n')
        .map((line) => `<li>${line.replace(/^[0-9]+\.\s*/, '')}</li>`)
        .join('')}</ul>`
    : `<p class="body">${slide.body}</p>`

  return `
    <section class="slide">
      <div class="panel">
        <div class="panel-top">
          <div class="brand-lockup">
            <span class="brand-mark">E</span>
            <span>${slide.eyebrow}</span>
          </div>
          <span class="slide-count">${slide.label} / ${String(slides.length).padStart(2, '0')}</span>
        </div>
        <div class="copy">
          <p class="kicker">${slide.kicker}</p>
          <h1>${slide.title}</h1>
          ${bodyHtml}
        </div>
        <div class="visual-wrap">${visualMarkup(slide.visual)}</div>
        <div class="footer">${slide.footer}</div>
      </div>
    </section>
  `
}

function pageHtml(slide) {
  return `
    <!doctype html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          :root {
            --bg: #0b0c0a;
            --panel: #151511;
            --panel-2: #1c1c16;
            --text: #f5f7fb;
            --muted: #b8bcae;
            --line: rgba(255,255,255,.12);
            --accent: #f7c948;
            --green: #46e6b0;
            --danger: #ff6b6b;
            --ink: #12120e;
            --radius: 8px;
          }

          * { box-sizing: border-box; }
          body {
            margin: 0;
            background:
              linear-gradient(180deg, rgba(255,255,255,.03) 0 1px, transparent 1px 60px),
              linear-gradient(90deg, rgba(255,255,255,.03) 0 1px, transparent 1px 60px),
              linear-gradient(180deg, #0b0c0a 0%, #12130f 48%, #080906 100%);
            color: var(--text);
            font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
          }

          .slide {
            width: 1080px;
            height: 1350px;
            padding: 42px;
          }

          .panel {
            width: 100%;
            height: 100%;
            border: 1px solid var(--line);
            border-radius: var(--radius);
            background:
              linear-gradient(180deg, rgba(255,255,255,.06), rgba(255,255,255,.025)),
              linear-gradient(180deg, rgba(247,201,72,.05), transparent 28%);
            box-shadow: 0 24px 70px rgba(0,0,0,.38);
            padding: 40px;
            display: grid;
            grid-template-rows: auto auto 1fr auto;
            gap: 28px;
          }

          .panel-top,
          .brand-lockup,
          .slide-count {
            display: flex;
            align-items: center;
          }

          .panel-top {
            justify-content: space-between;
            font-size: 24px;
            font-weight: 850;
            letter-spacing: .02em;
            text-transform: uppercase;
          }

          .brand-lockup {
            gap: 12px;
          }

          .brand-mark {
            width: 40px;
            height: 40px;
            display: grid;
            place-items: center;
            border-radius: var(--radius);
            background: linear-gradient(135deg, var(--accent), var(--green));
            color: #07100d;
            font-weight: 950;
          }

          .slide-count {
            color: var(--muted);
          }

          .copy {
            max-width: 860px;
          }

          .kicker {
            display: inline-flex;
            align-items: center;
            min-height: 52px;
            padding: 0 18px;
            margin: 0 0 22px;
            border-radius: var(--radius);
            border: 1px solid rgba(247,201,72,.28);
            background: rgba(247,201,72,.08);
            color: #ffe49a;
            font-size: 28px;
            font-weight: 800;
          }

          h1 {
            margin: 0;
            font-size: 86px;
            line-height: .94;
            font-weight: 950;
            max-width: 920px;
            text-wrap: balance;
          }

          .body,
          .body-list {
            margin: 26px 0 0;
            color: var(--muted);
            font-size: 32px;
            line-height: 1.2;
            font-weight: 720;
            max-width: 820px;
          }

          .body-list {
            list-style: none;
            padding: 0;
          }

          .body-list li {
            display: flex;
            gap: 14px;
            margin-bottom: 12px;
          }

          .body-list li::before {
            content: "•";
            color: var(--green);
            font-weight: 900;
          }

          .visual-wrap {
            align-self: end;
            min-height: 320px;
            display: flex;
            align-items: flex-end;
            justify-content: flex-end;
          }

          .footer {
            min-height: 82px;
            display: flex;
            align-items: center;
            padding: 0 24px;
            border: 1px solid rgba(70,230,176,.24);
            border-radius: var(--radius);
            background: rgba(70,230,176,.08);
            color: var(--text);
            font-size: 24px;
            font-weight: 780;
          }

          .visual-grid {
            width: 430px;
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 14px;
          }

          .cell,
          .prompt-line,
          .outcome,
          .score-row,
          .route-target {
            border: 1px solid var(--line);
            border-radius: var(--radius);
            background: rgba(8,11,16,.78);
          }

          .cell {
            min-height: 92px;
            display: grid;
            place-items: center;
            font-size: 22px;
            font-weight: 800;
            color: var(--text);
          }

          .cell-accent {
            border-color: rgba(247,201,72,.4);
            color: var(--accent);
          }

          .cell-green {
            border-color: rgba(70,230,176,.4);
            color: var(--green);
          }

          .meter-stack {
            width: 460px;
            display: grid;
            gap: 18px;
          }

          .meter {
            height: 48px;
            border: 1px solid var(--line);
            border-radius: var(--radius);
            background: rgba(8,11,16,.78);
            overflow: hidden;
          }

          .meter span {
            display: block;
            height: 100%;
            background: linear-gradient(90deg, var(--accent), var(--green));
          }

          .meter.muted span {
            background: rgba(255,255,255,.2);
          }

          .prompt-card {
            width: 460px;
            display: grid;
            gap: 14px;
          }

          .prompt-line {
            min-height: 64px;
            display: flex;
            align-items: center;
            padding: 0 20px;
            font-size: 24px;
            font-weight: 760;
            color: var(--text);
          }

          .outcome-flow {
            width: 480px;
            display: grid;
            gap: 16px;
          }

          .outcome {
            min-height: 64px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 24px;
            font-weight: 820;
          }

          .outcome.start {
            color: var(--text);
          }

          .outcome.accent {
            color: var(--accent);
            border-color: rgba(247,201,72,.38);
          }

          .outcome.green {
            color: var(--green);
            border-color: rgba(70,230,176,.34);
          }

          .connector {
            height: 28px;
            width: 4px;
            margin: 0 auto;
            background: linear-gradient(180deg, var(--accent), var(--green));
          }

          .route-panel {
            width: 500px;
            display: grid;
            gap: 28px;
          }

          .route-line {
            display: grid;
            grid-template-columns: 30px 1fr 170px;
            gap: 18px;
            align-items: center;
          }

          .route-dot {
            width: 22px;
            height: 22px;
            border-radius: 999px;
          }

          .route-good {
            background: var(--green);
            box-shadow: 0 0 20px rgba(70,230,176,.35);
          }

          .route-alert {
            background: var(--danger);
            box-shadow: 0 0 20px rgba(255,107,107,.35);
          }

          .route-bar {
            height: 6px;
            border-radius: 999px;
            background: linear-gradient(90deg, rgba(70,230,176,.25), var(--green));
          }

          .route-bar-alert {
            background: linear-gradient(90deg, rgba(255,107,107,.25), var(--danger));
          }

          .route-target {
            min-height: 72px;
            display: grid;
            place-items: center;
            font-size: 24px;
            font-weight: 820;
            color: var(--text);
          }

          .route-target-alert {
            border-color: rgba(255,107,107,.28);
          }

          .score-panel {
            width: 470px;
            display: grid;
            gap: 14px;
          }

          .score-row {
            min-height: 68px;
            padding: 0 20px;
            display: flex;
            align-items: center;
            justify-content: space-between;
            font-size: 24px;
            font-weight: 780;
          }

          .score-row b {
            color: var(--green);
            font-size: 22px;
            letter-spacing: .08em;
          }

          .cta-ring {
            width: 250px;
            height: 250px;
            border-radius: 999px;
            border: 2px dashed rgba(247,201,72,.42);
            display: grid;
            place-items: center;
          }

          .cta-core {
            width: 138px;
            height: 138px;
            border-radius: 999px;
            background: linear-gradient(135deg, var(--accent), var(--green));
            color: #07100d;
            display: grid;
            place-items: center;
            font-size: 34px;
            font-weight: 900;
          }
        </style>
      </head>
      <body>
        ${slideHtml(slide)}
      </body>
    </html>
  `
}

function contactSheetHtml(imageDataUrls) {
  const images = imageDataUrls.map((src) => `<img src="${src}" alt="">`).join('')

  return `
    <!doctype html>
    <html>
      <head>
        <style>
          body {
            margin: 0;
            padding: 24px;
            background: #0b0c0a;
            display: grid;
            grid-template-columns: repeat(4, 250px);
            gap: 18px;
            width: max-content;
          }
          img {
            width: 250px;
            height: auto;
            border: 1px solid rgba(255,255,255,.12);
            border-radius: 8px;
          }
        </style>
      </head>
      <body>${images}</body>
    </html>
  `
}

async function main() {
  await fs.mkdir(outDir, { recursive: true })

  const browser = await chromium.launch({ headless: true })
  const page = await browser.newPage({ viewport: { width: 1080, height: 1350 }, deviceScaleFactor: 1 })

  const imagePaths = []
  for (const [index, slide] of slides.entries()) {
    await page.setContent(pageHtml(slide), { waitUntil: 'load' })
    const outputPath = path.join(outDir, `slide-${index + 1}.png`)
    await page.screenshot({ path: outputPath, type: 'png' })
    imagePaths.push(outputPath)
  }

  const imageDataUrls = await Promise.all(
    imagePaths.map(async (imagePath) => {
      const bytes = await fs.readFile(imagePath)
      return `data:image/png;base64,${bytes.toString('base64')}`
    }),
  )

  await page.setViewportSize({ width: 1060, height: 760 })
  await page.setContent(contactSheetHtml(imageDataUrls), { waitUntil: 'load' })
  await page.screenshot({
    path: path.join(outDir, 'contact-sheet.png'),
    type: 'png',
    fullPage: true,
  })

  await browser.close()

  console.log(JSON.stringify({ outDir, slides: imagePaths.length }, null, 2))
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
