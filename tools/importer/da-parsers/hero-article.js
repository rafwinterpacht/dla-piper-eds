/* eslint-disable */
/* global WebImporter */
/**
 * DA-CLEAN parser for hero-article (da.live authoring variant).
 *
 * Identical block output to tools/importer/parsers/hero-article.js EXCEPT it emits
 * NO `<!-- field:* -->` hint comments. Field hints are an xwalk/Universal-Editor
 * convention consumed by md2jcr; da.live authors plain block tables, so the hints
 * are not needed (and would show up as stray comments in the DA document).
 *
 * The SHARED block decorator blocks/hero-article/hero-article.js renders by row
 * position (row 1 = image, row 2 = text), so this hint-free table renders
 * identically in both DA and UE — that's the point of the mixed-mode demo.
 *
 * Source structure (.hero-component .hero-img-wrapper):
 *   .editorial-hero-image img.hero-img            -> hero image       (row 1)
 *   .tag-section <p><span>10 December 2025</span> -> date eyebrow      (row 2)
 *   .hero-title-section h1.title                  -> article title     (row 2)
 *   .hero-title-section .subtitle                 -> optional subtitle (row 2)
 */
export default function parse(element, { document }) {
  // ---- Row 1: hero image ----
  const image = element.querySelector('.editorial-hero-image img.hero-img, .editorial-hero-image img, .hero-img-wrapper img, img');

  // ---- Row 2: text (date eyebrow + title + optional subtitle) ----
  const textContent = [];

  const dateEl = element.querySelector('.tag-section p, .tag-section span, .tag-section');
  if (dateEl) {
    const dateText = dateEl.textContent.replace(/\s+/g, ' ').trim();
    if (dateText) {
      const p = document.createElement('p');
      p.textContent = dateText;
      textContent.push(p);
    }
  }

  const heading = element.querySelector('.hero-title-section h1.title, .hero-title-section h1, h1');
  if (heading) {
    const h1 = document.createElement('h1');
    h1.append(...heading.cloneNode(true).childNodes);
    if (h1.textContent.trim()) textContent.push(h1);
  }

  const subtitle = element.querySelector('.hero-title-section .subtitle, .subtitle');
  if (subtitle) {
    const subText = subtitle.textContent.replace(/\s+/g, ' ').trim();
    if (subText) {
      const p = document.createElement('p');
      p.textContent = subText;
      textContent.push(p);
    }
  }

  // ---- Build cells (NO field hints — DA-clean) ----
  const cells = [];
  cells.push([image ? image.cloneNode(true) : '']);
  cells.push([textContent.length ? textContent : '']);

  const block = WebImporter.Blocks.createBlock(document, { name: 'hero-article', cells });
  element.replaceWith(block);
}
