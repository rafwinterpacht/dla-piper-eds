/* eslint-disable */
/* global WebImporter */
/**
 * Parser for hero-article. Base: hero.
 * Source: https://www.dlapiper.com/en-us/insights/publications/2026/05/doj-and-cftc-criminal-and-civil-insider-trading-charges (.hero-component)
 *
 * Insights/publication article hero: a full-bleed editorial background image
 * with the publication date as an eyebrow above the article title (h1).
 *
 * Source structure (.hero-component .hero-img-wrapper):
 *   .editorial-hero-image img.hero-img   -> background/hero image
 *   .tag-section <p><span>12 May 2026</span></p> -> publication date eyebrow
 *   .hero-title-section h1.title         -> article title
 *
 * xwalk model (blocks/hero-article/_hero-article.json):
 *   image (reference) + imageAlt (collapsed -> img alt attr) -> row 1 (field:image)
 *   text  (richtext: date eyebrow paragraph + h1 title)      -> row 2 (field:text)
 *
 * Mirrors the hero-banner.js / hero-profile.js parsers in this project:
 * field hints emitted as HTML comments, cells built as DocumentFragments,
 * empty cells fall back to [''], createBlock + element.replaceWith.
 */
export default function parse(element, { document }) {
  // ---- Row 1: background / hero image (single) ----
  const image = element.querySelector('.editorial-hero-image img.hero-img, .editorial-hero-image img, .hero-img-wrapper img, img');

  // ---- Row 2: text (date eyebrow + article title) ----
  const textContent = [];

  // Publication date eyebrow (e.g. "12 May 2026") emitted as a plain paragraph.
  const dateEl = element.querySelector('.tag-section p, .tag-section span, .tag-section');
  if (dateEl) {
    const dateText = dateEl.textContent.replace(/\s+/g, ' ').trim();
    if (dateText) {
      const p = document.createElement('p');
      p.textContent = dateText;
      textContent.push(p);
    }
  }

  // Article title -> keep as h1 heading.
  const heading = element.querySelector('.hero-title-section h1.title, .hero-title-section h1, h1');
  if (heading) {
    const h1 = document.createElement('h1');
    h1.append(...heading.cloneNode(true).childNodes);
    if (h1.textContent.trim()) textContent.push(h1);
  }

  // ---- Build cells (xwalk field hints) ----
  const cells = [];

  // Row 1: image (reference). imageAlt is a collapsed field carried on the img's
  // alt attribute (no separate hint).
  if (image) {
    const imageCell = document.createDocumentFragment();
    imageCell.appendChild(document.createComment(' field:image '));
    imageCell.appendChild(image.cloneNode(true));
    cells.push([imageCell]);
  } else {
    cells.push(['']);
  }

  // Row 2: text (richtext).
  if (textContent.length) {
    const textCell = document.createDocumentFragment();
    textCell.appendChild(document.createComment(' field:text '));
    textContent.forEach((node) => textCell.appendChild(node));
    cells.push([textCell]);
  } else {
    cells.push(['']);
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'hero-article', cells });
  element.replaceWith(block);
}
