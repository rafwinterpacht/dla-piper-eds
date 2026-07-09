#!/usr/bin/env node

/**
 * Challenge-aware page scraper for dlapiper.com (Vercel Security Checkpoint).
 *
 * Reuses the edge-delivery-services scrape-webpage skill helper modules
 * (image-capture, generate-path) but adds the stealth + reload loop from
 * run-import-challenge-aware.mjs so that the Vercel JS challenge clears BEFORE
 * we capture the screenshot / HTML / images. Produces the same artifacts as the
 * stock analyze-webpage.js: metadata.json, screenshot.png, cleaned.html, images/.
 *
 * Usage:
 *   node tools/importer/scrape-challenge-aware.mjs "<url>" --output ./migration-work [--content-selector "<sel>"]
 */

import fs from 'fs';
import path from 'path';
import { pathToFileURL } from 'url';

const SKILL_SCRIPTS_DIR = '/home/node/.excat-marketplaces/excat-marketplace/edge-delivery-services/skills/scrape-webpage/scripts';
const BROWSER_UTIL = '/home/node/.excat-marketplaces/excat-marketplace/excat/utils/playwright-browser.js';

const { connectOrLaunchStealth, connectOrLaunch } = await import(pathToFileURL(BROWSER_UTIL).href);
const { generateDocumentPathInfo } = await import(pathToFileURL(path.join(SKILL_SCRIPTS_DIR, 'generate-path.js')).href);
const { setupImageCapture, waitForPendingImages, replaceImageUrls } = await import(pathToFileURL(path.join(SKILL_SCRIPTS_DIR, 'image-capture.js')).href);
const analyze = await import(pathToFileURL(path.join(SKILL_SCRIPTS_DIR, 'analyze-webpage.js')).href);

const PAGE_TIMEOUT = 60000;
// Real capability-page content selectors (challenge cleared). Broad-to-specific.
const DEFAULT_CONTENT_SELECTORS = [
  '.rich-text-component',
  '.hero-component',
  '.tertiary-content-component',
  'main h1',
  'article',
];
const CHALLENGE_MAX_RELOADS = 8;
const CHALLENGE_POLL_TIMEOUT = 20000;

function parseArgs() {
  const args = process.argv.slice(2);
  const url = args[0];
  let outputDir = './migration-work';
  const oi = args.indexOf('--output');
  if (oi !== -1 && args[oi + 1]) outputDir = args[oi + 1];
  const ci = args.indexOf('--content-selector');
  const contentSelectors = ci !== -1 && args[ci + 1]
    ? [args[ci + 1], ...DEFAULT_CONTENT_SELECTORS]
    : DEFAULT_CONTENT_SELECTORS;
  if (!url) {
    console.error('Usage: node scrape-challenge-aware.mjs "<url>" --output <dir> [--content-selector <sel>]');
    process.exit(1);
  }
  return { url, outputDir, contentSelectors };
}

async function addStealthScripts(page) {
  await page.addInitScript(() => {
    Object.defineProperty(navigator, 'webdriver', { get: () => undefined });
    Object.defineProperty(navigator, 'languages', { get: () => ['en-US', 'en'] });
    Object.defineProperty(navigator, 'hardwareConcurrency', { get: () => 8 });
    Object.defineProperty(navigator, 'deviceMemory', { get: () => 8 });
    window.chrome = { runtime: {} };
  });
}

async function waitForRealContent(page, url, contentSelectors) {
  for (let attempt = 1; attempt <= CHALLENGE_MAX_RELOADS; attempt += 1) {
    try {
      const matched = await page.waitForFunction(
        (selectors) => selectors.find((s) => document.querySelector(s)) || false,
        contentSelectors,
        { timeout: CHALLENGE_POLL_TIMEOUT, polling: 1000 },
      );
      const sel = await matched.jsonValue();
      if (sel) {
        // Extra guard: make sure body text is NOT the checkpoint page.
        const bodyText = await page.evaluate(() => document.body?.innerText?.slice(0, 400) || '');
        if (!/verifying your browser|security checkpoint/i.test(bodyText)) return sel;
      }
    } catch { /* timed out this round */ }

    const title = await page.title().catch(() => '');
    const bodyText = await page.evaluate(() => document.body?.innerText?.slice(0, 200) || '').catch(() => '');
    const challenged = /verif|checkpoint|security/i.test(title) || /verif|checkpoint/i.test(bodyText);
    console.error(`  [challenge] attempt ${attempt}/${CHALLENGE_MAX_RELOADS}: title="${title.slice(0, 60)}" not ready${challenged ? ' (challenge page)' : ''}; reloading...`);
    await page.waitForTimeout(3000 + attempt * 1000);
    try {
      await page.reload({ waitUntil: 'domcontentloaded', timeout: PAGE_TIMEOUT });
    } catch {
      await page.goto(url, { waitUntil: 'domcontentloaded', timeout: PAGE_TIMEOUT }).catch(() => {});
    }
    await page.waitForTimeout(2000);
  }
  throw new Error(`Vercel challenge did not clear after ${CHALLENGE_MAX_RELOADS} reloads.`);
}

async function main() {
  const { url, outputDir, contentSelectors } = parseArgs();
  if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

  // Resolve playwright from the skill scripts dir (it pins the dep there).
  const callerUrl = pathToFileURL(path.join(SKILL_SCRIPTS_DIR, 'analyze-webpage.js')).href;
  let browser;
  try { browser = await connectOrLaunchStealth({}, { callerUrl }); }
  catch { browser = await connectOrLaunch({}, { callerUrl }); }

  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
    locale: 'en-US',
    timezoneId: 'America/New_York',
    ignoreHTTPSErrors: true,
    extraHTTPHeaders: {
      'Accept-Language': 'en-US,en;q=0.9',
      'sec-ch-ua': '"Google Chrome";v="131", "Chromium";v="131", "Not_A Brand";v="24"',
      'sec-ch-ua-mobile': '?0',
      'sec-ch-ua-platform': '"macOS"',
    },
  });
  const page = await context.newPage();
  await addStealthScripts(page);

  try {
    const captureState = setupImageCapture(page, outputDir);

    try {
      await page.goto(url, { waitUntil: 'networkidle', timeout: PAGE_TIMEOUT });
    } catch {
      await page.goto(url, { waitUntil: 'domcontentloaded', timeout: PAGE_TIMEOUT });
      await page.waitForTimeout(3000);
    }

    const matched = await waitForRealContent(page, url, contentSelectors);
    console.error(`✅ Challenge cleared (matched "${matched}").`);
    await page.waitForTimeout(1500);

    console.error('Scrolling to trigger lazy load...');
    await analyze.scrollToTriggerLazyLoad(page);
    await page.waitForTimeout(1500);

    console.error(`Waiting for ${captureState.pendingImages.size} pending images...`);
    await waitForPendingImages(captureState, 8000);
    console.error(`Image capture: ${captureState.stats.total} total, ${captureState.stats.converted} converted, ${captureState.stats.failed} failed`);

    console.error('Screenshot...');
    const screenshot = path.join(outputDir, 'screenshot.png');
    await page.screenshot({ path: screenshot, fullPage: true });

    const metadata = await analyze.extractMetadata(page);

    captureState.disable();

    // Reuse the skill's DOM image fixer via internal call by re-navigating logic:
    // analyze.js does not export fixImagesInDom, so replicate the essential srcset/relative fix inline.
    await page.evaluate((sourceUrl) => {
      document.body.querySelectorAll('picture').forEach((pic) => {
        const img = pic.querySelector('img');
        if (img && !img.getAttribute('src')) {
          const s = pic.querySelector('source[srcset]');
          if (s) img.setAttribute('src', s.getAttribute('srcset').split(',')[0].trim().split(/\s+/)[0]);
        }
      });
      document.body.querySelectorAll('img').forEach((img) => {
        let src = img.getAttribute('src');
        const srcset = img.getAttribute('srcset')?.split(' ')[0];
        if (!src && srcset) { img.setAttribute('src', srcset); src = srcset; }
        if (src) {
          try { new URL(src); } catch {
            try { img.src = new URL(src.startsWith('/') ? src : `./${src}`, sourceUrl).toString(); } catch {}
          }
        }
      });
    }, url);

    let html = await analyze.extractCleanedHTML(page);
    html = replaceImageUrls(html, captureState.imageMap);
    const htmlPath = path.join(outputDir, 'cleaned.html');
    fs.writeFileSync(htmlPath, html, 'utf-8');

    const paths = generateDocumentPathInfo(url);
    const result = {
      url,
      timestamp: new Date().toISOString(),
      paths: {
        documentPath: paths.documentPath,
        htmlFilePath: paths.htmlFilePath,
        mdFilePath: paths.mdFilePath,
        dirPath: paths.dirPath,
        filename: paths.filename,
      },
      screenshot,
      html: { filePath: htmlPath, size: html.length },
      metadata,
      images: {
        count: captureState.imageMap.size,
        mapping: Object.fromEntries(captureState.imageMap),
        stats: captureState.stats,
      },
    };
    fs.writeFileSync(path.join(outputDir, 'metadata.json'), JSON.stringify(result, null, 2), 'utf-8');
    console.error(`Saved metadata.json (html ${html.length} bytes, ${result.images.count} images).`);
    console.log(JSON.stringify({ ok: true, documentPath: paths.documentPath, htmlSize: html.length, images: result.images.count }));
  } finally {
    await context.close().catch(() => {});
    await browser.close().catch(() => {});
  }
}

main().catch((e) => { console.error('scrape failed:', e.message); process.exit(1); });
