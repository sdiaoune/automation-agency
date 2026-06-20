import fs from 'node:fs/promises'
import { readFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { chromium } from 'playwright'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.resolve(__dirname, '..')
const slideWidth = 1080
const slideHeight = 1350
const contactSheetWidth = 270
const contactSheetHeight = 338

function usage() {
  console.error('Usage: node scripts/render-meta-carousel.mjs <manifest.json> [more manifests...]')
  process.exit(1)
}

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;')
}

function visualMarkup(type) {
  const markup = {
    calendar:
      '<div class="calendar"><i></i><span></span><span></span><span></span><span></span><b></b></div>',
    cards:
      '<div class="cards"><span></span><span></span><span></span><strong></strong><strong></strong><strong></strong></div>',
    checklist:
      '<div class="checklist"><i></i><i></i><i></i><i></i></div>',
    cta: '<div class="cta"><span></span><span></span><span></span><b></b></div>',
    flow: '<div class="flow"><i></i><i></i><i></i><b></b></div>',
    inbox: '<div class="inbox"><span></span><span></span><span></span><b></b></div>',
    ladder: '<div class="ladder"><i></i><i></i><i></i><i></i><b></b></div>',
    merge: '<div class="merge"><span></span><span></span><span></span><b></b></div>',
    phone: '<div class="phone"><span></span><span></span><span></span></div>',
    route: '<div class="route"><span></span><span></span><span></span><b></b></div>',
    shield: '<div class="shield"><span></span><b></b></div>',
    signal: '<div class="signal"><span></span><span></span><span></span><b></b></div>',
  }

  return markup[type] || markup.flow
}

function titleClass(slide) {
  const size = `${slide.title || ''}${slide.titleAccent || ''}`.length
  if (size > 80) return 'title title-tight'
  if (size > 56) return 'title title-medium'
  return 'title'
}

function bodyClass(slide) {
  const size = `${slide.body || ''}`.length
  if (size > 170) return 'body body-tight'
  if (size > 125) return 'body body-medium'
  return 'body'
}

function slideHtml(slide, index, total) {
  const title = escapeHtml(slide.title || '')
  const accent = slide.titleAccent ? `<em>${escapeHtml(slide.titleAccent)}</em>` : ''
  const body = escapeHtml(slide.body || '').replaceAll('\\n', '<br>')

  return `
    <section class="slide">
      <div class="panel">
        <div class="top">
          <span class="brand">${escapeHtml(slide.eyebrow || 'EMC2Ops')}</span>
          <span class="count">${String(index + 1).padStart(2, '0')} / ${String(total).padStart(2, '0')}</span>
        </div>
        <div class="copy">
          <p class="kicker">${escapeHtml(slide.kicker || '')}</p>
          <h1 class="${titleClass(slide)}">${title}${accent}</h1>
          <p class="${bodyClass(slide)}">${body}</p>
        </div>
        <div class="visual-wrap">${visualMarkup(slide.visual)}</div>
        <div class="footer">${escapeHtml(slide.footer || '')}</div>
      </div>
    </section>
  `
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
          font-family: Inter, "Segoe UI", Arial, sans-serif;
        }
        .slide {
          position: relative;
          width: ${slideWidth}px;
          height: ${slideHeight}px;
          overflow: hidden;
          background:
            linear-gradient(180deg, #0b0c0a 0%, #12130f 52%, #080906 100%);
        }
        .slide::before {
          content: "";
          position: absolute;
          inset: 0;
          background:
            radial-gradient(circle at 14% 18%, rgba(247, 201, 72, 0.16), transparent 24%),
            radial-gradient(circle at 82% 14%, rgba(70, 230, 176, 0.14), transparent 26%);
          pointer-events: none;
        }
        .slide::after {
          content: "";
          position: absolute;
          inset: 0;
          background-image:
            linear-gradient(rgba(255, 255, 255, 0.05) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255, 255, 255, 0.05) 1px, transparent 1px);
          background-size: 60px 60px;
          mask-image: linear-gradient(to bottom, rgba(0, 0, 0, 0.68), transparent 76%);
          pointer-events: none;
        }
        .panel {
          position: absolute;
          inset: 36px;
          display: grid;
          grid-template-rows: auto 1fr auto auto;
          padding: 46px;
          background: linear-gradient(180deg, rgba(255,255,255,0.07), rgba(255,255,255,0.025));
          border: 1px solid rgba(255,255,255,0.12);
          border-radius: 10px;
          box-shadow: 0 24px 70px rgba(0,0,0,0.38);
          overflow: hidden;
        }
        .panel::before {
          content: "";
          position: absolute;
          inset: 0;
          background: linear-gradient(180deg, rgba(247,201,72,0.06), transparent 32%);
          pointer-events: none;
        }
        .top,
        .footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          font-size: 24px;
          font-weight: 850;
          line-height: 1;
          text-transform: uppercase;
          letter-spacing: 0.02em;
          position: relative;
          z-index: 1;
        }
        .brand {
          display: inline-flex;
          align-items: center;
          gap: 12px;
          color: #f5f7fb;
        }
        .brand::before {
          content: "E";
          display: grid;
          place-items: center;
          width: 42px;
          height: 42px;
          border-radius: 8px;
          background: linear-gradient(135deg, #f7c948, #46e6b0);
          color: #07100d;
          font-size: 24px;
          font-weight: 950;
        }
        .count {
          color: #b8bcae;
        }
        .copy {
          align-self: end;
          max-width: 800px;
          padding-top: 34px;
          position: relative;
          z-index: 1;
        }
        .kicker {
          display: inline-flex;
          align-items: center;
          min-height: 54px;
          padding: 0 18px;
          margin: 0 0 26px;
          border-radius: 8px;
          border: 1px solid rgba(247,201,72,0.28);
          background: rgba(247,201,72,0.08);
          color: #ffe49a;
          font-size: 30px;
          font-weight: 850;
        }
        .title {
          margin: 0;
          color: #f5f7fb;
          font-size: 78px;
          font-weight: 960;
          line-height: 0.92;
          letter-spacing: -0.03em;
          text-wrap: balance;
        }
        .title-medium { font-size: 68px; }
        .title-tight { font-size: 60px; }
        .title em {
          display: block;
          font-style: normal;
          background: linear-gradient(90deg, #fff, #f7c948 46%, #46e6b0);
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
        }
        .body {
          margin: 34px 0 0;
          max-width: 780px;
          color: #e2e7dd;
          font-size: 33px;
          font-weight: 720;
          line-height: 1.18;
        }
        .body-medium { font-size: 31px; }
        .body-tight { font-size: 28px; }
        .visual-wrap {
          display: flex;
          align-items: center;
          justify-content: flex-end;
          height: 360px;
          margin: 14px 0 28px;
          position: relative;
          z-index: 1;
        }
        .footer {
          min-height: 86px;
          padding: 0 26px;
          border-radius: 8px;
          background: rgba(70,230,176,0.08);
          border: 1px solid rgba(70,230,176,0.24);
          color: #f5f7fb;
          text-transform: none;
          letter-spacing: 0;
          line-height: 1.2;
        }
        .phone,
        .flow,
        .checklist,
        .cards,
        .merge,
        .calendar,
        .signal,
        .route,
        .inbox,
        .shield,
        .ladder,
        .cta {
          position: relative;
          filter: drop-shadow(0 24px 42px rgba(0, 0, 0, 0.38));
        }
        .phone {
          width: 150px;
          height: 224px;
          padding: 34px 22px;
          border-radius: 18px;
          background: #151511;
          border: 7px solid #1c1c16;
        }
        .phone span {
          display: block;
          height: 28px;
          margin-bottom: 18px;
          background: rgba(255,255,255,0.14);
        }
        .phone span::after {
          content: "";
          position: absolute;
          right: -18px;
          top: -12px;
          width: 28px;
          height: 28px;
          border-radius: 999px;
          border: 5px solid #151511;
          background: #ff6b6b;
        }
        .flow {
          width: 420px;
          height: 220px;
        }
        .flow i {
          position: absolute;
          left: 0;
          width: 42px;
          height: 42px;
          border-radius: 999px;
          background: #ff6b6b;
        }
        .flow i:nth-child(1) { top: 18px; }
        .flow i:nth-child(2) { top: 88px; }
        .flow i:nth-child(3) { top: 158px; }
        .flow i::after {
          content: "";
          position: absolute;
          top: 20px;
          left: 52px;
          width: 250px;
          border-top: 4px dashed rgba(70,230,176,0.56);
        }
        .flow b,
        .route b,
        .cta b {
          position: absolute;
          background: #46e6b0;
        }
        .flow b {
          right: 0;
          top: 48px;
          width: 132px;
          height: 132px;
          border-radius: 8px;
        }
        .flow b::after,
        .route b::after,
        .cta b::after {
          content: "✓";
          position: absolute;
          left: 28px;
          top: 10px;
          color: #07100d;
          font-size: 82px;
          font-weight: 950;
        }
        .checklist {
          display: grid;
          gap: 14px;
          width: 390px;
        }
        .checklist i {
          position: relative;
          height: 40px;
          border-radius: 8px;
          border: 1px solid rgba(255,255,255,0.1);
          background: rgba(255,255,255,0.06);
        }
        .checklist i::before {
          content: "✓";
          position: absolute;
          left: 0;
          top: 0;
          width: 50px;
          height: 40px;
          display: grid;
          place-items: center;
          border-radius: 8px 0 0 8px;
          background: #46e6b0;
          color: #07100d;
          font-size: 24px;
          font-style: normal;
          font-weight: 950;
        }
        .cards {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 16px;
          width: 360px;
          height: 220px;
          padding: 24px;
          border-radius: 8px;
          background: rgba(8,11,16,0.75);
          border: 1px solid rgba(255,255,255,0.1);
        }
        .cards span,
        .cards strong {
          display: block;
          border-radius: 8px;
          border: 1px solid rgba(255,255,255,0.1);
          background: rgba(255,255,255,0.06);
        }
        .cards span::before,
        .cards strong::before {
          content: "";
          display: block;
          width: 18px;
          height: 18px;
          margin: 18px;
          border-radius: 4px;
          background: #46e6b0;
        }
        .merge {
          width: 360px;
          height: 220px;
        }
        .merge span {
          position: absolute;
          width: 110px;
          height: 110px;
          border-radius: 999px;
          border: 4px solid rgba(255,255,255,0.16);
          background: rgba(255,255,255,0.05);
        }
        .merge span:nth-child(1) { left: 24px; top: 58px; }
        .merge span:nth-child(2) { left: 126px; top: 22px; }
        .merge span:nth-child(3) { left: 126px; top: 94px; }
        .merge b {
          position: absolute;
          right: 12px;
          top: 54px;
          width: 108px;
          height: 108px;
          border-radius: 8px;
          background: #46e6b0;
        }
        .merge b::after {
          content: "";
          position: absolute;
          left: -104px;
          top: 48px;
          width: 92px;
          height: 6px;
          background: rgba(247,201,72,0.8);
          box-shadow: 0 -58px 0 rgba(247,201,72,0.5), 0 58px 0 rgba(247,201,72,0.5);
        }
        .calendar {
          width: 320px;
          height: 224px;
          padding: 34px 22px 22px;
          border-radius: 8px;
          background: rgba(8,11,16,0.78);
          border: 1px solid rgba(255,255,255,0.1);
        }
        .calendar i {
          position: absolute;
          left: 0;
          right: 0;
          top: 0;
          height: 48px;
          border-radius: 8px 8px 0 0;
          background: linear-gradient(90deg, rgba(247,201,72,0.92), rgba(70,230,176,0.92));
        }
        .calendar span {
          display: inline-block;
          width: 58px;
          height: 48px;
          margin: 12px 10px 0 0;
          border-radius: 8px;
          background: rgba(255,255,255,0.08);
        }
        .calendar b {
          position: absolute;
          right: 24px;
          bottom: 24px;
          width: 58px;
          height: 48px;
          border-radius: 8px;
          background: #46e6b0;
        }
        .signal {
          width: 360px;
          height: 220px;
        }
        .signal span {
          position: absolute;
          width: 120px;
          height: 52px;
          border-radius: 8px;
          background: rgba(255,255,255,0.08);
          border: 1px solid rgba(255,255,255,0.12);
        }
        .signal span:nth-child(1) { left: 0; top: 22px; }
        .signal span:nth-child(2) { left: 68px; top: 92px; }
        .signal span:nth-child(3) { left: 136px; top: 162px; }
        .signal b {
          position: absolute;
          right: 0;
          top: 58px;
          width: 108px;
          height: 108px;
          border-radius: 999px;
          background: #ff6b6b;
        }
        .signal b::after {
          content: "!";
          position: absolute;
          left: 40px;
          top: 8px;
          color: #fff;
          font-size: 72px;
          font-weight: 900;
        }
        .route {
          width: 420px;
          height: 230px;
        }
        .route span {
          position: absolute;
          left: 0;
          width: 46px;
          height: 46px;
          border-radius: 8px;
          background: #ff6b6b;
        }
        .route span:nth-child(1) { top: 30px; }
        .route span:nth-child(2) { top: 100px; }
        .route span:nth-child(3) { top: 170px; }
        .route span::after {
          content: "";
          position: absolute;
          top: 22px;
          left: 66px;
          width: 240px;
          height: 5px;
          background: rgba(70,230,176,0.36);
        }
        .route b {
          right: 0;
          top: 57px;
          width: 116px;
          height: 116px;
          border-radius: 8px;
        }
        .inbox {
          width: 320px;
          height: 220px;
          border-radius: 8px;
          border: 1px solid rgba(255,255,255,0.12);
          background: rgba(255,255,255,0.06);
          overflow: hidden;
        }
        .inbox span {
          display: block;
          height: 26px;
          margin: 22px 24px 0;
          border-radius: 999px;
          background: rgba(255,255,255,0.12);
        }
        .inbox b {
          position: absolute;
          left: 24px;
          right: 24px;
          bottom: 24px;
          height: 72px;
          border-radius: 8px;
          background: rgba(70,230,176,0.18);
          border: 1px solid rgba(70,230,176,0.32);
        }
        .shield {
          width: 260px;
          height: 240px;
        }
        .shield span {
          position: absolute;
          inset: 0;
          border-radius: 24px 24px 96px 96px;
          background: linear-gradient(180deg, rgba(247,201,72,0.18), rgba(70,230,176,0.18));
          border: 1px solid rgba(255,255,255,0.12);
          clip-path: polygon(50% 0%, 94% 16%, 94% 58%, 50% 100%, 6% 58%, 6% 16%);
        }
        .shield b {
          position: absolute;
          left: 78px;
          top: 62px;
          width: 104px;
          height: 104px;
          border-radius: 999px;
          background: #46e6b0;
        }
        .shield b::after {
          content: "!";
          position: absolute;
          left: 40px;
          top: 8px;
          color: #07100d;
          font-size: 72px;
          font-weight: 900;
        }
        .ladder {
          width: 360px;
          height: 220px;
        }
        .ladder i {
          position: absolute;
          left: 52px;
          width: 200px;
          height: 16px;
          border-radius: 999px;
          background: rgba(255,255,255,0.12);
        }
        .ladder i:nth-child(1) { top: 18px; }
        .ladder i:nth-child(2) { top: 72px; width: 226px; }
        .ladder i:nth-child(3) { top: 126px; width: 252px; }
        .ladder i:nth-child(4) { top: 180px; width: 278px; }
        .ladder b {
          position: absolute;
          left: 0;
          top: 0;
          bottom: 0;
          width: 24px;
          border-radius: 999px;
          background: linear-gradient(180deg, #f7c948, #46e6b0);
        }
        .cta {
          width: 230px;
          height: 230px;
          border-radius: 999px;
          border: 5px dashed rgba(70,230,176,0.42);
        }
        .cta span {
          position: absolute;
          width: 46px;
          height: 46px;
          border-radius: 999px;
          border: 8px solid #0b0c0a;
          background: #ff6b6b;
        }
        .cta span:nth-child(1) { left: 8px; top: 26px; }
        .cta span:nth-child(2) { right: -10px; top: 82px; }
        .cta span:nth-child(3) { left: 42px; bottom: 20px; }
        .cta b {
          left: 52px;
          top: 52px;
          width: 112px;
          height: 112px;
          border-radius: 999px;
        }
        .cta b::after {
          left: 24px;
          top: 2px;
          font-size: 72px;
        }
      </style>
    </head>
    <body>${slideHtml(slide, index, total)}</body>
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
          margin: 0;
          padding: 24px;
          width: max-content;
          background: #111;
          display: grid;
          grid-template-columns: repeat(4, ${contactSheetWidth}px);
          gap: 18px;
        }
        img {
          display: block;
          width: ${contactSheetWidth}px;
          height: ${contactSheetHeight}px;
        }
      </style>
    </head>
    <body>${images.map((src) => `<img src="${src}">`).join('')}</body>
  </html>
  `
}

async function renderManifest(manifestPath) {
  const raw = await fs.readFile(manifestPath, 'utf8')
  const manifest = JSON.parse(raw)

  if (!manifest.date || !manifest.slug || !Array.isArray(manifest.slides) || manifest.slides.length < 6) {
    throw new Error(`Invalid manifest: ${manifestPath}`)
  }

  const slot = manifest.slot ? `${manifest.slot}-` : ''
  const dirName = `${manifest.date}-${slot}${manifest.slug}`
  const outDir = path.join(root, 'public/social-assets/carousel', dirName)
  await fs.mkdir(outDir, { recursive: true })

  const browser = await chromium.launch()
  const page = await browser.newPage({
    deviceScaleFactor: 1,
    viewport: { width: slideWidth, height: slideHeight },
  })

  for (const [index, slide] of manifest.slides.entries()) {
    await page.setContent(pageHtml(slide, index, manifest.slides.length), { waitUntil: 'load' })
    await page.screenshot({
      path: path.join(outDir, `slide-${index + 1}.png`),
      type: 'png',
    })
  }

  const imageSources = manifest.slides.map((_, index) => {
    const image = readFileSync(path.join(outDir, `slide-${index + 1}.png`)).toString('base64')
    return `data:image/png;base64,${image}`
  })

  const contactSheetRows = Math.ceil(manifest.slides.length / 4)
  await page.setViewportSize({
    width: contactSheetWidth * 4 + 24 * 2 + 18 * 3,
    height: contactSheetHeight * contactSheetRows + 24 * 2 + 18 * Math.max(contactSheetRows - 1, 0),
  })
  await page.setContent(contactSheetHtml(imageSources), { waitUntil: 'load' })
  await page.screenshot({
    path: path.join(outDir, 'contact-sheet.png'),
    fullPage: true,
    type: 'png',
  })

  await browser.close()

  const slidePaths = manifest.slides.map((_, index) => ({
    fileName: `slide-${index + 1}.png`,
    filePath: path.join(outDir, `slide-${index + 1}.png`),
    relativeUrl: `/social-assets/carousel/${dirName}/slide-${index + 1}.png`,
    width: slideWidth,
    height: slideHeight,
  }))

  const captionInstagram = manifest.captionInstagram || manifest.caption || ''
  const captionFacebook = manifest.captionFacebook || manifest.caption || ''

  await fs.writeFile(
    path.join(outDir, 'manifest.json'),
    `${JSON.stringify(
      {
        ...manifest,
        captionFacebook,
        captionInstagram,
        directory: dirName,
        outputDir: outDir,
        renderedAt: new Date().toISOString(),
        slidePaths,
        contactSheet: path.join(outDir, 'contact-sheet.png'),
      },
      null,
      2,
    )}\n`,
  )
  await fs.writeFile(path.join(outDir, 'caption-instagram.txt'), `${captionInstagram.trim()}\n`)
  await fs.writeFile(path.join(outDir, 'caption-facebook.txt'), `${captionFacebook.trim()}\n`)

  return outDir
}

const manifestArgs = process.argv.slice(2)

if (manifestArgs.length === 0) usage()

for (const relativePath of manifestArgs) {
  const manifestPath = path.resolve(relativePath)
  const outDir = await renderManifest(manifestPath)
  console.log(`Rendered ${manifestPath} -> ${outDir}`)
}
