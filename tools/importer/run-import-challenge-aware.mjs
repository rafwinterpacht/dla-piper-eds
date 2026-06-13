#!/usr/bin/env node
/*
 * Challenge-aware single-page import driver.
 *
 * dlapiper.com sits behind a Vercel "Security Checkpoint" JS challenge that the
 * stock bulk runner cannot clear (it injects the importer before the challenge
 * resolves and has no flag to wait). This driver reuses the SAME vendored
 * helix-importer bundle, the SAME import bundle, and the SAME processPlainHtml
 * post-processor as the official runner, but waits for the real page to render
 * (challenge cleared + a known content selector present) before transforming.
 *
 * Output layout (content/<path>.plain.html + tools/importer/reports/*.report.json)
 * matches the official runner exactly.
 */
import { readFileSync, existsSync, writeFileSync, mkdirSync } from 'fs';
import { resolve, dirname, join } from 'path';
const SCRIPTS_DIR = '/home/node/.excat-marketplace/excat/skills/excat-content-import/scripts';
const playwright = await import(join(SCRIPTS_DIR, 'node_modules/playwright/index.js'));
const chromium = playwright.chromium || playwright.default?.chromium;
const { processPlainHtml } = await import(join(SCRIPTS_DIR, 'import-processors/index.js'));
const { compileReportsToExcel } = await import(join(SCRIPTS_DIR, 'import-report.js'));

const URL = 'https://www.dlapiper.com/en-us/about-us';
const IMPORT_BUNDLE = resolve('tools/importer/import-about-us.bundle.js');
const HELIX = join(SCRIPTS_DIR, 'static', 'inject', 'helix-importer.js');
const OUTPUT_DIR = resolve('content');
const CONTENT_READY_SELECTOR = 'a.contact-card'; // present only on the real rendered page
const USER_AGENT = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36';

function ensureDir(p) { mkdirSync(p, { recursive: true }); }

function sanitizeDocumentPath(docPath, fallbackUrl) {
  if (!docPath || typeof docPath !== 'string') {
    docPath = new URL(fallbackUrl).pathname || '/';
  }
  let n = docPath.replace(/\\/g, '/');
  if (n.startsWith('/')) n = n.slice(1);
  if (n.endsWith('/')) n = n.slice(0, -1);
  if (n === '') n = 'index';
  return n;
}

const helixImporterScript = readFileSync(HELIX, 'utf-8');
const importScriptContent = readFileSync(IMPORT_BUNDLE, 'utf-8');

const browser = await chromium.launch({
  headless: true,
  args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-blink-features=AutomationControlled', '--disable-dev-shm-usage', '--disable-gpu', '--window-size=1920,1080'],
});
const context = await browser.newContext({
  viewport: { width: 1920, height: 1080 },
  userAgent: USER_AGENT,
  locale: 'en-US',
  timezoneId: 'America/Los_Angeles',
  ignoreHTTPSErrors: true,
  extraHTTPHeaders: { 'Accept-Language': 'en-US,en;q=0.9' },
});
const page = await context.newPage();
page.on('console', (m) => console.log(`[Browser ${m.type()}] ${m.text()}`));

let exitCode = 0;
try {
  await page.goto(URL, { waitUntil: 'domcontentloaded', timeout: 60000 });

  // Wait out the Vercel challenge: poll until the real content selector appears.
  console.log('[Driver] Waiting for Vercel challenge to clear and real content to render...');
  let ready = false;
  for (let attempt = 0; attempt < 12 && !ready; attempt += 1) {
    try {
      await page.waitForSelector(CONTENT_READY_SELECTOR, { timeout: 10000 });
      ready = true;
    } catch {
      const title = await page.title().catch(() => '');
      console.log(`[Driver] attempt ${attempt + 1}: not ready yet (title="${title}"), reloading...`);
      await page.reload({ waitUntil: 'domcontentloaded', timeout: 60000 }).catch(() => {});
    }
  }
  if (!ready) throw new Error('Real page content never rendered (challenge did not clear).');
  console.log('[Driver] Real content detected. Proceeding to transform.');

  // Scroll to trigger any lazy hydration, then settle.
  await page.evaluate(async () => {
    for (let y = 0; y < document.body.scrollHeight; y += 800) {
      window.scrollTo(0, y);
      await new Promise((r) => setTimeout(r, 150));
    }
    window.scrollTo(0, 0);
  });
  await page.waitForTimeout(1500);

  // Inject helix-importer bundle (same dance as the official runner).
  await page.evaluate((script) => {
    const originalDefine = window.define;
    if (typeof window.define !== 'undefined') delete window.define;
    const el = document.createElement('script');
    el.textContent = script;
    document.head.appendChild(el);
    if (originalDefine) window.define = originalDefine;
  }, helixImporterScript);

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
    const cfg = window.CustomImportScript.default;
    if (typeof cfg.onLoad === 'function') await cfg.onLoad({ document });
    const r = await window.WebImporter.html2md(pageUrl, document, cfg, {
      toDocx: false, toMd: true, originalURL: pageUrl,
    });
    r.html = window.WebImporter.md2da(r.md);
    return r;
  }, URL);

  if (!result.path || !result.html) throw new Error('Transform produced no path/html.');

  const plainHtml = processPlainHtml(result.html);
  const rel = sanitizeDocumentPath(result.path, URL);
  const outPath = join(OUTPUT_DIR, `${rel}.plain.html`);
  ensureDir(dirname(outPath));
  writeFileSync(outPath, plainHtml, 'utf-8');

  const reportPath = join('tools/importer/reports', `${rel}.report.json`);
  ensureDir(dirname(reportPath));
  writeFileSync(reportPath, JSON.stringify({
    status: 'success', url: URL, path: rel, timestamp: new Date().toISOString(), ...(result.report || {}),
  }, null, 2), 'utf-8');

  console.log(`[Driver] ✅ Saved content to ${rel}`);
  console.log(`[Driver] Blocks found: ${JSON.stringify(result.report?.blocks || [])}`);

  await compileReportsToExcel(IMPORT_BUNDLE).catch((e) => console.log(`[Driver] Excel compile skipped: ${e.message}`));
} catch (e) {
  console.error(`[Driver] ❌ ${e.message}`);
  exitCode = 1;
} finally {
  await page.close().catch(() => {});
  await context.close().catch(() => {});
  await browser.close().catch(() => {});
}
process.exit(exitCode);
