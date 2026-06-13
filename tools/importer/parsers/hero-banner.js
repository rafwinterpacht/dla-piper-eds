/* eslint-disable */
/* global WebImporter */
/**
 * Parser for hero-banner. Base: hero.
 * Source: https://www.dlapiper.com/en-us (.hero-card-container)
 *
 * Homepage marketing hero on a dark navy band with a full-bleed rotating
 * background image. The EDS hero takes a SINGLE image, so we pick the
 * .hero-bg-img marked `active` (falling back to the last .hero-bg-img).
 * Content: h1.heading, a .sub-heading with two <p> (subhead1 nests an
 * .isHighlighted span we preserve as inline emphasis), and a CTA anchor
 * a.banner-CTA ("FIND A LAWYER" -> /en-us/people).
 *
 * CRITICAL NESTING GOTCHA: .hero-card-container ALSO nests a sibling
 * .hero-card-row (the cards-promo block, parsed by tools/importer/parsers/
 * cards-promo.js which is mapped to `.hero-card-row`). Because the importer
 * calls element.replaceWith(block) on the mapped .hero-card-container, that
 * would delete the nested .hero-card-row. To avoid data loss this parser
 * re-appends the untouched .hero-card-row element as a sibling AFTER the
 * hero block — i.e. element.replaceWith(heroBlock, heroCardRow). We do NOT
 * parse the promo cards here; we only preserve that element so the cards-promo
 * parser can process it afterward. (Mirrors the person-profile hero-profile.js
 * pattern where nested content is re-emitted alongside the block.)
 *
 * xwalk model (blocks/hero-banner/_hero-banner.json):
 *   image (reference) + imageAlt (collapsed -> img alt attr) -> row 1
 *   text  (richtext: h1 + paragraphs + CTA link)             -> row 2
 */
export default function parse(element, { document }) {
  // ---- Preserve the nested cards-promo container (do NOT parse it here) ----
  // Pull it out so it survives element.replaceWith() and the cards-promo
  // parser (mapped to .hero-card-row) can process it afterward.
  const heroCardRow = element.querySelector('.hero-card-row');

  // ---- Row 1: background image (single) ----
  // Prefer the rotating background marked `active`; fall back to the last one.
  let bgImage = element.querySelector('.hero-bg-wrapper .hero-bg-img.active');
  if (!bgImage) {
    const allBg = element.querySelectorAll('.hero-bg-wrapper .hero-bg-img');
    if (allBg.length) bgImage = allBg[allBg.length - 1];
  }

  // ---- Row 2: text (heading + subheads + CTA) ----
  // Scope strictly to .hero-banner-content so we never touch .hero-card-row.
  const content = element.querySelector('.hero-banner-content');

  const textContent = [];
  if (content) {
    const heading = content.querySelector('h1.heading, h1');
    if (heading) {
      const h1 = document.createElement('h1');
      // Preserve inline markup but unwrap the redundant outer <span> wrapper.
      const innerSpan = heading.querySelector(':scope > span');
      if (innerSpan && heading.children.length === 1) {
        h1.append(...innerSpan.cloneNode(true).childNodes);
      } else {
        h1.append(...heading.cloneNode(true).childNodes);
      }
      if (h1.textContent.trim()) textContent.push(h1);
    }

    // Sub-heading paragraphs (preserve nested .isHighlighted as inline emphasis).
    const paras = content.querySelectorAll('.sub-heading p');
    paras.forEach((para) => {
      const p = para.cloneNode(true);
      if (p.textContent.trim()) textContent.push(p);
    });

    // CTA anchor.
    const cta = content.querySelector('a.banner-CTA, a.btn, a');
    if (cta) {
      const a = document.createElement('a');
      a.setAttribute('href', cta.getAttribute('href') || '');
      a.textContent = cta.textContent.replace(/\s+/g, ' ').trim();
      if (a.textContent) {
        const p = document.createElement('p');
        p.appendChild(a);
        textContent.push(p);
      }
    }
  }

  // ---- Build cells (xwalk field hints) ----
  const cells = [];

  // Row 1: image (reference). imageAlt is a collapsed field -> img alt attr only.
  if (bgImage) {
    const imageCell = document.createDocumentFragment();
    imageCell.appendChild(document.createComment(' field:image '));
    imageCell.appendChild(bgImage.cloneNode(true));
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

  const block = WebImporter.Blocks.createBlock(document, { name: 'hero-banner', cells });

  // Re-emit the untouched .hero-card-row as a sibling AFTER the hero block so
  // the separate cards-promo parser can process it (prevents data loss).
  if (heroCardRow) {
    element.replaceWith(block, heroCardRow);
  } else {
    element.replaceWith(block);
  }
}
