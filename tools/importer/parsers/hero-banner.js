/* eslint-disable */
/* global WebImporter */
/**
 * Parser for hero-banner. Base block: hero-banner (xwalk).
 * Source selector: .hero-component
 * Source URL: https://www.dlapiper.com/en-us/about-us
 * Generated: 2026-06-12
 *
 * Live DOM (validated):
 *   .hero-component > .hero-img-wrapper >
 *     .editorial-hero-image > img.hero-img[alt]
 *     .hero-title-section > h1.title
 *
 * UE model (blocks/hero-banner/_hero-banner.json) fields:
 *   - image      (reference)  -> background image, row 1, field:image
 *   - imageAlt   (text)       -> COLLAPSED into <img alt="..."> (suffix "Alt", no field hint)
 *   - text       (richtext)   -> heading/text content, row 2, field:text
 *
 * Simple block: one column, one row per unique non-collapsed field.
 * Source variations handled: image present or absent; heading h1/h2 or
 * any [class*="title"]; multiple image-class fallbacks.
 */
export default function parse(element, { document }) {
  // INPUT EXTRACTION — selectors validated against the live .hero-component DOM:
  //   .editorial-hero-image > img.hero-img[alt="Decorative"]
  //   .hero-title-section   > h1.title "Built for the future"
  const image = element.querySelector('img.hero-img, img[class*="hero"], picture img, img');

  // Prefer a real heading element. Use the heading tags first (document order
  // within this list does not matter — querySelector returns the first node in
  // DOM order matching ANY selector, and a heading tag is the heading we want).
  // Guard against matching the wrapper "[class*='hero-title']" container by
  // only falling back to a heading nested inside such a container.
  let heading = element.querySelector('h1, h2, h3, h1.title, .title');
  if (!heading) {
    const titleWrap = element.querySelector('[class*="title"]');
    heading = titleWrap
      ? (titleWrap.querySelector('h1, h2, h3, h4') || titleWrap)
      : null;
  }

  const cells = [];

  // Row 1: image (field:image). imageAlt is collapsed into the <img alt> attribute.
  const imageCell = document.createDocumentFragment();
  imageCell.appendChild(document.createComment(' field:image '));
  if (image) imageCell.appendChild(image);
  cells.push([imageCell]);

  // Row 2: text (field:text) — the hero heading/rich text.
  const textCell = document.createDocumentFragment();
  textCell.appendChild(document.createComment(' field:text '));
  if (heading) textCell.appendChild(heading);
  cells.push([textCell]);

  const block = WebImporter.Blocks.createBlock(document, { name: 'hero-banner', cells });
  element.replaceWith(block);
}
