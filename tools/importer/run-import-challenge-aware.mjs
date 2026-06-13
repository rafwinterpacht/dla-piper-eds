#!/usr/bin/env node

/**
 * Challenge-aware import runner for dlapiper.com (Vercel Security Checkpoint).
 *
 * The stock run-bulk-import.js injects the helix-importer and transforms the DOM
 * immediately after navigation, before the Vercel JS challenge clears — so it
 * captures only the "We're verifying your browser" checkpoint page and reports a
 * false success. This driver reuses the same vendored helix-importer bundle, the
 * project's bundled import script, and the vendored processPlainHtml, but it polls
 * for a real content selector (and reloads) until the challenge clears BEFORE it
 * transforms.
 *
 * Usage:
 *   node tools/importer/run-import-challenge-aware.mjs \
 *     --import-script tools/importer/import-person-profile.bundle.js \
 *     --urls tools/importer/urls-person-profile.txt \
 *     [--content-selector ".people-profile-component"]
 */

import {
  readFileSync, existsSync, mkdirSync, writeFileSync,
} from 'fs';
import { resolve, dirname, join } from 'path';
import { pathToFileURL } from 'url';

const SKILL_SCRIPTS_DIR = '/home/node/.excat-marketplace/excat/skills/excat-content-import/scripts';

// Playwright + processPlainHtml live in the skill's node_modules (project has no playwright dep).
const playwright = await import(pathToFileURL(join(SKILL_SCRIPTS_DIR, 'node_modules/playwright/index.js')).href);
const chromium = playwright.chromium || playwright.default?.chromium;
const { processPlainHtml } = await import(pathToFileURL(join(SKILL_SCRIPTS_DIR, 'import-processors/index.js')).href);

const VIEWPORT_WIDTH = 1920;
const VIEWPORT_HEIGHT = 1080;
const PAGE_TIMEOUT = 60000;
const USER_AGENT = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36';

// Selectors that indicate REAL person-profile content has rendered (challenge cleared).
const DEFAULT_CONTENT_SELECTORS = [
  '.people-profile-component',
  'a.contact-card',
  '.connect-component',
  'h1.name',
];
const CHALLENGE_MAX_RELOADS = 8;
const CHALLENGE_POLL_TIMEOUT = 20000;

function parseArgs() {
  const args = process.argv.slice(2);
  const parsed = {};
  for (let i = 0; i < args.length; i += 1) {
    const arg = args[i];
    if (arg.startsWith('--')) {
      const value = args[i + 1];
      parsed[arg] = value;
      i += 1;
    }
  }
  if (!parsed['--import-script'] || !parsed['--urls']) {
    console.error('Usage: node tools/importer/run-import-challenge-aware.mjs --import-script <bundle.js> --urls <urls.txt> [--content-selector <sel>]');
    process.exit(1);
  }
  const workspacePath = process.env.WORKSPACE_PATH || process.cwd();
  return {
    importScript: resolve(parsed['--import-script']),
    urlsFile: resolve(parsed['--urls']),
    outputDir: resolve(workspacePath, 'content'),
    contentSelectors: parsed['--content-selector']
      ? [parsed['--content-selector'], ...DEFAULT_CONTENT_SELECTORS]
      : DEFAULT_CONTENT_SELECTORS,
  };
}

function loadUrls(urlFile) {
  return readFileSync(urlFile, 'utf-8')
    .split('\n')
    .map((l) => l.trim())
    .filter((l) => l.length > 0 && !l.startsWith('#'));
}

function sanitizeDocumentPath(docPath, fallbackUrl) {
  let p = docPath;
  if (!p || typeof p !== 'string') {
    p = new URL(fallbackUrl).pathname || '/';
  }
  p = p.replace(/\\/g, '/');
  if (p.startsWith('/')) p = p.slice(1);
  if (p.endsWith('/')) p = p.slice(0, -1);
  if (p === '') p = 'index';
  return p;
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

/**
 * Wait for the Vercel challenge to clear: poll for any real content selector,
 * reloading the page between attempts. Returns the selector that matched, or
 * throws if the challenge never clears.
 */
async function waitForRealContent(page, url, contentSelectors) {
  for (let attempt = 1; attempt <= CHALLENGE_MAX_RELOADS; attempt += 1) {
    try {
      const matched = await page.waitForFunction(
        (selectors) => selectors.find((s) => document.querySelector(s)) || false,
        contentSelectors,
        { timeout: CHALLENGE_POLL_TIMEOUT, polling: 1000 },
      );
      const sel = await matched.jsonValue();
      if (sel) return sel;
    } catch {
      // timed out waiting this round
    }

    const title = await page.title().catch(() => '');
    const bodyText = await page.evaluate(() => document.body?.innerText?.slice(0, 200) || '').catch(() => '');
    const stillChallenged = /verif|checkpoint|security/i.test(title) || /verif|checkpoint/i.test(bodyText);
    console.log(`  [challenge] attempt ${attempt}/${CHALLENGE_MAX_RELOADS}: title="${title.slice(0, 60)}" content not ready${stillChallenged ? ' (challenge page)' : ''}; reloading...`);

    await page.waitForTimeout(3000 + attempt * 1000);
    try {
      await page.reload({ waitUntil: 'domcontentloaded', timeout: PAGE_TIMEOUT });
    } catch {
      await page.goto(url, { waitUntil: 'domcontentloaded', timeout: PAGE_TIMEOUT }).catch(() => {});
    }
    await page.waitForTimeout(2000);
  }
  throw new Error(`Vercel challenge did not clear after ${CHALLENGE_MAX_RELOADS} reloads — no content selector matched.`);
}

async function processUrl({
  context, url, helixImporterScript, importScriptContent, outputDir, contentSelectors, index, total,
}) {
  const label = `[${index}/${total}]`;
  console.log(`${label} Starting ${url}`);
  const page = await context.newPage();
  page.on('console', (msg) => {
    const t = msg.type();
    const text = msg.text();
    if (t === 'error') console.error(`[Browser Console] ${text}`);
    else if (t === 'warning') console.warn(`[Browser Console] ${text}`);
    else console.log(`[Browser Console] ${text}`);
  });
  await addStealthScripts(page);

  try {
    try {
      await page.goto(url, { waitUntil: 'networkidle', timeout: PAGE_TIMEOUT });
    } catch {
      await page.goto(url, { waitUntil: 'domcontentloaded', timeout: PAGE_TIMEOUT });
      await page.waitForTimeout(3000);
    }

    // KEY DIFFERENCE vs stock runner: wait for the challenge to clear first.
    const matchedSelector = await waitForRealContent(page, url, contentSelectors);
    console.log(`${label} ✅ Challenge cleared (matched "${matchedSelector}"); transforming...`);
    await page.waitForTimeout(1500);

    // Inject helix-importer bundle (preserve any existing AMD define).
    await page.evaluate((script) => {
      const originalDefine = window.define;
      if (typeof window.define !== 'undefined') delete window.define;
      const el = document.createElement('script');
      el.textContent = script;
      document.head.appendChild(el);
      if (originalDefine) window.define = originalDefine;
    }, helixImporterScript);

    // Inject the bundled import script.
    await page.evaluate((script) => {
      const el = document.createElement('script');
      el.textContent = script;
      document.head.appendChild(el);
    }, importScriptContent);

    await page.waitForFunction(
      () => typeof window.CustomImportScript !== 'undefined' && window.CustomImportScript?.default,
      { timeout: 10000 },
    );

    const result = await page.evaluate(async (pageUrl) => {
      if (!window.WebImporter || typeof window.WebImporter.html2md !== 'function') {
        throw new Error('WebImporter not available.');
      }
      const cfg = window.CustomImportScript?.default;
      if (typeof cfg.onLoad === 'function') await cfg.onLoad({ document });
      const r = await window.WebImporter.html2md(pageUrl, document, cfg, {
        toDocx: false, toMd: true, originalURL: pageUrl,
      });
      r.html = window.WebImporter.md2da(r.md);
      return r;
    }, url);

    if (!result.path || !result.html) {
      throw new Error('Transform did not return valid path/html.');
    }

    const plainHtml = processPlainHtml(result.html);
    const relativeDocPath = sanitizeDocumentPath(result.path, url);
    const plainHtmlPath = join(outputDir, `${relativeDocPath}.plain.html`);
    mkdirSync(dirname(plainHtmlPath), { recursive: true });
    writeFileSync(plainHtmlPath, plainHtml, 'utf-8');

    const reportPath = join('tools/importer/reports', `${relativeDocPath}.report.json`);
    mkdirSync(dirname(reportPath), { recursive: true });
    writeFileSync(reportPath, JSON.stringify({
      status: 'success', url, path: relativeDocPath, timestamp: new Date().toISOString(), ...(result.report || {}),
    }, null, 2), 'utf-8');

    console.log(`${label} ✅ Saved content to ${relativeDocPath}`);
    return { success: true };
  } catch (error) {
    console.error(`${label} ❌ Failed for ${url}: ${error.message}`);
    return { success: false, error };
  } finally {
    await page.close().catch(() => {});
  }
}

async function main() {
  const {
    importScript, urlsFile, outputDir, contentSelectors,
  } = parseArgs();
  if (!existsSync(importScript)) { console.error(`Import script not found: ${importScript}`); process.exit(1); }
  const urls = loadUrls(urlsFile);
  mkdirSync(outputDir, { recursive: true });

  const helixImporterScript = readFileSync(join(SKILL_SCRIPTS_DIR, 'static', 'inject', 'helix-importer.js'), 'utf-8');
  const importScriptContent = readFileSync(importScript, 'utf-8');

  console.log('[Challenge-Aware Import] Starting run with:');
  console.log(`  Import script: ${importScript}`);
  console.log(`  URLs file:     ${urlsFile}`);
  console.log(`  Output dir:    ${outputDir}`);
  console.log(`  URL count:     ${urls.length}`);
  console.log(`  Content sel:   ${contentSelectors.join(', ')}`);
  console.log('');

  const browser = await chromium.launch({
    headless: true,
    args: [
      '--no-sandbox', '--disable-setuid-sandbox',
      '--disable-blink-features=AutomationControlled',
      '--disable-dev-shm-usage', '--disable-gpu', '--window-size=1920,1080',
    ],
  });
  const context = await browser.newContext({
    viewport: { width: VIEWPORT_WIDTH, height: VIEWPORT_HEIGHT },
    userAgent: USER_AGENT,
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

  let successCount = 0;
  try {
    for (let i = 0; i < urls.length; i += 1) {
      if (i > 0) await new Promise((r) => setTimeout(r, 3000));
      // eslint-disable-next-line no-await-in-loop
      const result = await processUrl({
        context, url: urls[i], helixImporterScript, importScriptContent, outputDir, contentSelectors, index: i + 1, total: urls.length,
      });
      if (result.success) successCount += 1;
    }
  } finally {
    await context.close().catch(() => {});
    await browser.close().catch(() => {});
  }

  console.log(`[Challenge-Aware Import] Completed. Success: ${successCount}/${urls.length}, Failures: ${urls.length - successCount}`);
  process.exit(successCount === urls.length ? 0 : 1);
}

main().catch((err) => {
  console.error('[Challenge-Aware Import] Unexpected error:', err);
  process.exit(1);
});
