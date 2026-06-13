/* eslint-disable */
/* global WebImporter */

/**
 * Transformer: DLA Piper site-wide cleanup.
 *
 * Removes non-authorable site chrome and page-internal navigation so the import
 * contains only authorable page content.
 *
 * All selectors below are verified against migration-work/cleaned.html and/or
 * are defensive removals of global chrome that the live page (loaded by the
 * validator) renders but the scraper already stripped from cleaned.html:
 *   - header / global primary nav            -> site chrome (not authorable)
 *   - footer                                 -> site chrome (not authorable)
 *   - cookie consent banner                  -> widget (not authorable)
 *   - share component / floating print btn   -> site chrome (not authorable)
 *   - nav.anchor-nav                         -> page-internal anchor nav (cleaned.html line 16) — excluded from import
 *   - h1#primarytitle ("About us")           -> rendered by the share/title shell (cleaned.html line 13) — not authorable
 */

const TransformHook = { beforeTransform: 'beforeTransform', afterTransform: 'afterTransform' };

export default function transform(hookName, element, payload) {
  if (hookName === TransformHook.beforeTransform) {
    // Widgets / overlays and non-authorable chrome that the LIVE page renders.
    // Selectors verified against the live rendered DOM (the importer transforms
    // the live page, not the scraper's pre-cleaned HTML).
    WebImporter.DOMUtils.remove(element, [
      '#onetrust-consent-sdk',
      '#onetrust-banner-sdk',
      '[id*="CookieConsent"]',
      '[class*="cookie-consent"]',
      '.campaignName',              // empty campaign marker (top of main)
      '.relatedCountries',          // region/language selector list (top of main)
      '.share-component',           // share/title shell (contains h1#primarytitle + share links)
      '.anchor-nav-component',      // page-internal sticky anchor nav (live markup)
      '.floating-button-component', // floating Print/PDF button (bottom)
      '.social-share',
    ]);
  }

  if (hookName === TransformHook.afterTransform) {
    // Non-authorable global chrome and any residual page-internal navigation.
    WebImporter.DOMUtils.remove(element, [
      'header',
      'footer',
      'nav.anchor-nav',     // page-internal anchor nav (pre-cleaned markup variant)
      '.anchor-nav-component',
      'h1#primarytitle',    // title rendered by share/title shell
      'iframe',
      'link',
      'noscript',
      'img[src*="rlcdn.com"]',   // RLCDN tracking pixel
      'img[src*="/pixel"]',      // generic tracking pixels
      'img[width="1"][height="1"]',
    ]);
  }
}
