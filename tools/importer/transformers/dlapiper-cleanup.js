/* eslint-disable */
/* global WebImporter */

/**
 * Transformer: DLA Piper site-wide cleanup.
 *
 * IMPORTANT: This transformer runs against the LIVE rendered dlapiper.com DOM
 * (after the Vercel Security Checkpoint JS challenge clears), NOT the
 * pre-cleaned migration-work/cleaned.html scrape. The live page carries chrome
 * wrappers that the scraper already stripped, so the selectors below target
 * those live chrome classes. Sources:
 *   - migration-work/cleaned.html (`.relatedCountries` present at top of main)
 *   - prior DLA Piper migration experience / project memory
 *     (`.campaignName`, `.share-component`, `.anchor-nav-component`,
 *      `.floating-button-component`, `img[src*="rlcdn.com"]`)
 *
 * Header, nav and footer are auto-populated by EDS header/footer blocks, so any
 * site shell chrome is removed here; only the page-level authorable content
 * under main#content should survive.
 */

const TransformHook = { beforeTransform: 'beforeTransform', afterTransform: 'afterTransform' };

export default function transform(hookName, element, payload) {
  if (hookName === TransformHook.beforeTransform) {
    // Overlays / widgets / tracking that can block or pollute block parsing.
    // Cookie consent banners (live DOM), floating contact button, social share
    // widgets, and the LiveRamp (rlcdn) tracking pixel.
    // NOTE: `.anchor-nav-component` is intentionally NOT removed — on capability
    // pages it is an authorable block (parsed into the `anchornav` block), so it
    // must survive into parsing. It carries no meaningful content on other
    // templates, so leaving it in place is harmless where no anchornav parser runs.
    WebImporter.DOMUtils.remove(element, [
      '#onetrust-consent-sdk',
      '#onetrust-banner-sdk',
      '.ot-sdk-container',
      '.cookie-banner',
      '[class*="cookie"]',
      '.floating-button-component',
      '.share-component',
      'img[src*="rlcdn.com"]',
      'iframe[src*="rlcdn.com"]',
    ]);
  }

  if (hookName === TransformHook.afterTransform) {
    // Non-authorable site chrome. Header/nav/footer are rebuilt by EDS blocks.
    // `.relatedCountries` (top of main) and `.campaignName` are metadata-driven
    // chrome carried in page metadata, not authorable page content.
    // NOTE: `.anchor-nav-component` is intentionally NOT removed here — on
    // capability pages the anchornav parser has already replaced it with a block
    // table by this point; on other templates it carries no authorable content.
    WebImporter.DOMUtils.remove(element, [
      'header',
      'footer',
      'nav',
      '.relatedCountries',
      '.campaignName',
      '.share-component',
      '.floating-button-component',
      'iframe',
      'noscript',
      'link',
      'script',
      'style',
      'source',
    ]);

    // Strip tracking / behavioral attributes left on surviving elements.
    element.querySelectorAll('*').forEach((el) => {
      el.removeAttribute('onclick');
      el.removeAttribute('data-track');
      el.removeAttribute('data-tracking');
    });
  }
}
