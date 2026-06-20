import { chromium } from 'playwright'
import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.resolve(__dirname, '..')

function usage() {
  console.error('Usage: node scripts/render-emc2ops-meta-carousel-config.mjs <config-module>')
  process.exit(1)
}

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
}

function visualMarkup(type) {
  const visuals = {
    bars: `
      <div class="visual-card bars">
        <i style="height: 58px"></i>
        <i style="height: 96px"></i>
        <i style="height: 142px"></i>
        <i style="height: 182px"></i>
        <span></span>
      </div>
    `,
    cta: `
      <div class="visual-card cta">
        <span></span><span></span><span></span>
        <b></b>
      </div>
    `,
    grid: `
      <div class="visual-card grid-card">
        <b>1</b><b>2</b><b>3</b><b>4</b><b>5</b>
        <i></i><i></i><i></i><i></i><i></i>
      </div>
    `,
    handoff: `
      <div class="visual-card handoff">
        <span></span><span></span><span></span>
        <b></b><b></b>
      </div>
    `,
    route: `
      <div class="visual-card route">
        <span></span><span></span><span></span><span></span>
        <b></b><b></b><b></b>
      </div>
    `,
    score: `
      <div class="visual-card score">
        <span></span><span></span><span></span><span></span><span></span>
        <b></b><b></b><b></b>
      </div>
    `,
    stack: `
      <div class="visual-card stack">
        <span></span><span></span><span></span>
        <b></b>
      </div>
    `,
    timer: `
      <div class="visual-card timer">
        <span></span>
        <b></b>
        <i></i>
      </div>
    `,
  }

  return visuals[type] || visuals.score
}

function slideHtml(run, slide, index) {
  const titleAccent = slide.titleAccent
    ? `<em>${escapeHtml(slide.titleAccent)}</em>`
    : ''

  return `
    <section class="slide">
      <div class="panel">
        <div class="topbar">
          <span class="brand">${escapeHtml(slide.eyebrow)}</span>
          <span class="count">${String(index + 1).padStart(2, '0')} / ${String(
            run.slides.length,
          ).padStart(2, '0')}</span>
        </div>
        <div class="copy">
          <p class="kicker">${escapeHtml(slide.kicker)}</p>
          <h1>${escapeHtml(slide.title)}${titleAccent}</h1>
          <p class="body">${escapeHtml(slide.body).replaceAll('\n', '<br>')}</p>
        </div>
        <div class="visual-wrap">${visualMarkup(slide.visual)}</div>
        <div class="footer">${escapeHtml(slide.footer)}</div>
      </div>
    </section>
  `
}

function pageHtml(run, slide, index) {
  return `<!doctype html>
  <html>
    <head>
      <meta charset="utf-8">
      <style>
        :root {
          --bg: #0b0c0a;
          --bg-2: #12130f;
          --panel: rgba(255,255,255,0.065);
          --line: rgba(255,255,255,0.12);
          --text: #f5f7fb;
          --muted: #b8bcae;
          --gold: #f7c948;
          --green: #46e6b0;
          --danger: #ff6b6b;
          --shadow: 0 24px 70px rgba(0,0,0,0.38);
          --radius: 8px;
        }

        * { box-sizing: border-box; }
        body {
          margin: 0;
          background: linear-gradient(180deg, var(--bg) 0%, var(--bg-2) 54%, #080906 100%);
          color: var(--text);
          font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
        }

        .slide {
          width: 1080px;
          height: 1350px;
          position: relative;
          overflow: hidden;
        }

        .slide::before {
          content: "";
          position: absolute;
          inset: 0;
          background-image:
            linear-gradient(rgba(255, 255, 255, 0.04) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255, 255, 255, 0.04) 1px, transparent 1px);
          background-size: 56px 56px;
          mask-image: linear-gradient(to bottom, rgba(0,0,0,0.72), transparent 78%);
        }

        .panel {
          position: absolute;
          inset: 42px;
          padding: 44px;
          display: grid;
          grid-template-rows: auto 1fr auto auto;
          background: linear-gradient(180deg, rgba(255,255,255,0.08), rgba(255,255,255,0.03));
          border: 1px solid var(--line);
          border-radius: var(--radius);
          box-shadow: var(--shadow);
        }

        .topbar, .footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          font-size: 24px;
          font-weight: 880;
          text-transform: uppercase;
        }

        .brand {
          display: inline-flex;
          align-items: center;
          gap: 12px;
        }

        .brand::before {
          content: "E²";
          width: 40px;
          height: 40px;
          display: grid;
          place-items: center;
          background: linear-gradient(135deg, var(--gold), var(--green));
          color: #07100d;
          border-radius: var(--radius);
          font-weight: 950;
        }

        .count {
          color: var(--muted);
        }

        .copy {
          align-self: end;
          max-width: 860px;
          padding-bottom: 38px;
        }

        .kicker {
          margin: 0 0 24px;
          min-height: 56px;
          display: inline-flex;
          align-items: center;
          padding: 0 18px;
          background: rgba(247,201,72,0.08);
          border: 1px solid rgba(247,201,72,0.28);
          border-radius: var(--radius);
          color: #ffe49a;
          font-size: 30px;
          font-weight: 820;
        }

        h1 {
          margin: 0;
          font-size: 84px;
          line-height: 0.93;
          letter-spacing: 0;
          font-weight: 970;
          text-wrap: balance;
        }

        h1 em {
          display: block;
          font-style: normal;
          background: linear-gradient(90deg, #fff, var(--gold) 42%, var(--green));
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
        }

        .body {
          margin: 32px 0 0;
          max-width: 804px;
          color: var(--muted);
          font-size: 33px;
          line-height: 1.19;
          font-weight: 740;
        }

        .visual-wrap {
          display: flex;
          justify-content: flex-end;
          align-items: center;
          height: 320px;
          margin: 16px 0 24px;
        }

        .footer {
          min-height: 84px;
          padding: 0 28px;
          border-radius: var(--radius);
          background: rgba(70,230,176,0.08);
          border: 1px solid rgba(70,230,176,0.22);
          color: var(--text);
          text-transform: none;
        }

        .visual-card {
          position: relative;
          width: 340px;
          height: 220px;
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: var(--radius);
          background: linear-gradient(180deg, rgba(255,255,255,0.05), rgba(255,255,255,0.02));
          overflow: hidden;
        }

        .score span {
          position: absolute;
          left: 34px;
          width: 190px;
          height: 18px;
          border-radius: 999px;
          background: rgba(255,255,255,0.09);
        }
        .score span:nth-child(1) { top: 34px; width: 176px; }
        .score span:nth-child(2) { top: 66px; width: 192px; }
        .score span:nth-child(3) { top: 98px; width: 210px; }
        .score span:nth-child(4) { top: 130px; width: 164px; }
        .score span:nth-child(5) { top: 162px; width: 220px; }
        .score b {
          position: absolute;
          right: 34px;
          width: 28px;
          height: 28px;
          border-radius: 6px;
          background: var(--green);
        }
        .score b:nth-child(6) { top: 28px; }
        .score b:nth-child(7) { top: 92px; }
        .score b:nth-child(8) { top: 156px; }

        .bars {
          display: flex;
          align-items: flex-end;
          gap: 18px;
          padding: 30px;
        }
        .bars i {
          width: 42px;
          border-radius: 8px 8px 0 0;
          background: linear-gradient(180deg, var(--gold), var(--green));
        }
        .bars span {
          position: absolute;
          left: 28px;
          right: 28px;
          bottom: 28px;
          height: 1px;
          background: rgba(255,255,255,0.12);
        }

        .timer span {
          position: absolute;
          inset: 28px auto auto 28px;
          width: 162px;
          height: 162px;
          border: 12px solid var(--gold);
          border-right-color: rgba(255,255,255,0.12);
          border-bottom-color: rgba(255,255,255,0.12);
          border-radius: 50%;
        }
        .timer b {
          position: absolute;
          left: 108px;
          top: 70px;
          width: 12px;
          height: 54px;
          background: var(--green);
          border-radius: 999px;
          transform-origin: bottom center;
          transform: rotate(18deg);
        }
        .timer i {
          position: absolute;
          left: 108px;
          top: 106px;
          width: 72px;
          height: 12px;
          background: rgba(255,255,255,0.22);
          border-radius: 999px;
        }

        .route span {
          position: absolute;
          left: 38px;
          width: 26px;
          height: 26px;
          border-radius: 6px;
          background: var(--danger);
        }
        .route span:nth-child(1) { top: 36px; }
        .route span:nth-child(2) { top: 80px; background: var(--gold); }
        .route span:nth-child(3) { top: 124px; background: var(--green); }
        .route span:nth-child(4) { top: 168px; background: #f5f1e8; }
        .route b {
          position: absolute;
          left: 86px;
          right: 32px;
          height: 2px;
          border-top: 2px dashed rgba(70,230,176,0.55);
        }
        .route b:nth-child(5) { top: 48px; }
        .route b:nth-child(6) { top: 92px; }
        .route b:nth-child(7) { top: 136px; }

        .handoff span {
          position: absolute;
          top: 56px;
          width: 44px;
          height: 44px;
          border-radius: 8px;
          background: var(--danger);
        }
        .handoff span:nth-child(1) { left: 36px; }
        .handoff span:nth-child(2) { left: 110px; background: var(--gold); }
        .handoff span:nth-child(3) { left: 184px; background: var(--green); }
        .handoff b {
          position: absolute;
          left: 58px;
          right: 50px;
          height: 2px;
          border-top: 2px solid rgba(255,255,255,0.12);
        }
        .handoff b:nth-child(4) { top: 124px; }
        .handoff b:nth-child(5) {
          top: 152px;
          border-top-style: dashed;
          border-top-color: rgba(70,230,176,0.45);
        }

        .stack span {
          position: absolute;
          left: 36px;
          right: 36px;
          height: 42px;
          border-radius: 8px;
          border: 1px solid rgba(255,255,255,0.08);
        }
        .stack span:nth-child(1) { top: 36px; background: rgba(255,255,255,0.05); }
        .stack span:nth-child(2) { top: 92px; background: rgba(247,201,72,0.09); }
        .stack span:nth-child(3) { top: 148px; background: rgba(70,230,176,0.09); }
        .stack b {
          position: absolute;
          right: 36px;
          top: 50px;
          width: 84px;
          height: 112px;
          border-radius: 8px;
          background: linear-gradient(180deg, rgba(255,255,255,0.08), rgba(255,255,255,0.02));
          border: 1px solid rgba(255,255,255,0.08);
        }

        .grid-card {
          display: grid;
          grid-template-columns: repeat(5, 1fr);
          gap: 10px;
          padding: 28px;
        }
        .grid-card b,
        .grid-card i {
          display: grid;
          place-items: center;
          min-height: 58px;
          border-radius: 8px;
          font-style: normal;
          font-weight: 850;
        }
        .grid-card b {
          color: #07100d;
          background: linear-gradient(180deg, var(--gold), #ffd978);
        }
        .grid-card i {
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.08);
        }

        .cta {
          width: 250px;
          height: 250px;
          border-radius: 999px;
          border: 2px dashed rgba(247,201,72,0.42);
          background: transparent;
          overflow: visible;
        }
        .cta span {
          position: absolute;
          width: 44px;
          height: 44px;
          border-radius: 999px;
          background: var(--danger);
          border: 8px solid var(--bg);
        }
        .cta span:nth-child(1) { left: 12px; top: 26px; }
        .cta span:nth-child(2) { right: -8px; top: 96px; }
        .cta span:nth-child(3) { left: 46px; bottom: 10px; }
        .cta b {
          position: absolute;
          left: 56px;
          top: 56px;
          width: 136px;
          height: 136px;
          display: grid;
          place-items: center;
          border-radius: 999px;
          background: linear-gradient(135deg, var(--gold), var(--green));
          color: #07100d;
          font-size: 30px;
          font-weight: 900;
        }
        .cta b::before {
          content: "Audit";
        }
      </style>
    </head>
    <body>${slideHtml(run, slide, index)}</body>
  </html>`
}

async function ensureDir(dirPath) {
  await fs.mkdir(dirPath, { recursive: true })
}

async function readPngSize(filePath) {
  const buffer = await fs.readFile(filePath)
  return {
    width: buffer.readUInt32BE(16),
    height: buffer.readUInt32BE(20),
  }
}

async function buildContactSheet(browser, run, outDir) {
  const page = await browser.newPage({
    viewport: { width: 2320, height: 3400 },
    deviceScaleFactor: 1,
  })

  const items = (
    await Promise.all(
      run.slides.map(async (_, index) => {
        const bytes = await fs.readFile(path.join(outDir, `slide-${index + 1}.png`))
        const src = `data:image/png;base64,${bytes.toString('base64')}`
        return `<figure><img src="${src}" alt="Slide ${index + 1}"><figcaption>Slide ${index + 1}</figcaption></figure>`
      }),
    )
  ).join('')

  await page.setContent(
    `<!doctype html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body {
            margin: 0;
            padding: 28px;
            background: #0b0c0a;
            color: #f5f7fb;
            font-family: Inter, ui-sans-serif, system-ui, sans-serif;
          }
          .grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 24px;
          }
          figure {
            margin: 0;
            padding: 0;
          }
          img {
            display: block;
            width: 100%;
            height: auto;
            border: 1px solid rgba(255,255,255,0.08);
          }
          figcaption {
            margin-top: 10px;
            color: #b8bcae;
            font-size: 20px;
            font-weight: 700;
          }
        </style>
      </head>
      <body><div class="grid">${items}</div></body>
    </html>`,
    { waitUntil: 'load' },
  )
  await page.screenshot({
    path: path.join(outDir, 'contact-sheet.png'),
    type: 'png',
    fullPage: true,
  })
  await page.close()
}

async function main() {
  const configPath = process.argv[2]
  if (!configPath) usage()

  const configModule = await import(pathToFileURL(path.resolve(root, configPath)).href)
  const run = configModule.default

  if (
    !run?.date ||
    !run?.slot ||
    !run?.slug ||
    !run?.topic ||
    !run?.hook ||
    !run?.captionInstagram ||
    !run?.captionFacebook ||
    !Array.isArray(run?.slides) ||
    run.slides.length < 6
  ) {
    throw new Error(`Invalid carousel config: ${configPath}`)
  }

  const outDir = path.join(
    root,
    'public/social-assets/carousel',
    `${run.date}-${run.slot}-${run.slug}`,
  )

  await ensureDir(outDir)
  const browser = await chromium.launch({ headless: true })

  try {
    for (const [index, slide] of run.slides.entries()) {
      const page = await browser.newPage({
        viewport: { width: 1080, height: 1350 },
        deviceScaleFactor: 1,
      })
      await page.setContent(pageHtml(run, slide, index), { waitUntil: 'load' })
      await page.screenshot({
        path: path.join(outDir, `slide-${index + 1}.png`),
        type: 'png',
      })
      await page.close()
    }

    await buildContactSheet(browser, run, outDir)
  } finally {
    await browser.close()
  }

  const slidePaths = []
  for (const [index] of run.slides.entries()) {
    const fileName = `slide-${index + 1}.png`
    const filePath = path.join(outDir, fileName)
    const size = await readPngSize(filePath)
    if (size.width !== 1080 || size.height !== 1350) {
      throw new Error(`${fileName} rendered at ${size.width}x${size.height}, expected 1080x1350.`)
    }
    slidePaths.push({
      fileName,
      filePath,
      relativeUrl: `/social-assets/carousel/${run.date}-${run.slot}-${run.slug}/${fileName}`,
      width: size.width,
      height: size.height,
    })
  }

  const manifest = {
    ...run,
    outputDir: outDir,
    renderedAt: new Date().toISOString(),
    slidePaths,
    contactSheet: path.join(outDir, 'contact-sheet.png'),
  }

  await fs.writeFile(
    path.join(outDir, 'manifest.json'),
    `${JSON.stringify(manifest, null, 2)}\n`,
  )

  console.log(JSON.stringify(manifest, null, 2))
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
