/* eslint-disable */
/* global WebImporter */
/**
 * Parser for cards-promo.
 * Base block: cards
 * Source: https://www.dlapiper.com/en-us (.hero-card-row)
 * Generated for xwalk project (field hints required).
 *
 * Model (blocks/cards-promo/_cards-promo.json):
 *   container "cards-promo" -> items of model "card-promo"
 *   card-promo fields: text (richtext) — TEXT-ONLY, no image field.
 *
 * Structure: one row per card, a single text cell (no image cell).
 *   - cell 1: text (<!-- field:text -->) — eyebrow category, headline, and the
 *     "Learn more" link (href preserved, trailing "→" arrow stripped).
 *
 * Source DOM (validated against cached source.html):
 *   .hero-card-row > .hero-card > .card.card-custom
 *     small.hero-card-type        -> eyebrow / category label ("Publication")
 *     h2.hero-card-description     -> headline
 *     a.hero-card-CTA              -> "Learn more →" link to the publication
 */
export default function parse(element, { document }) {
  // Each promo is a .hero-card; the inner .card.card-custom holds the content.
  const cards = Array.from(element.querySelectorAll(':scope > .hero-card'));

  const cells = [];

  cards.forEach((card) => {
    const content = card.querySelector('.card.card-custom, .card-custom, .card') || card;

    const eyebrow = content.querySelector('small.hero-card-type, .hero-card-type');
    const headline = content.querySelector('h2.hero-card-description, .hero-card-description, h2, h3');
    const cta = content.querySelector('a.hero-card-CTA, a[class*="CTA"], a[class*="cta"], a');

    // Single text cell — text-only variant has no image field.
    const textCell = document.createDocumentFragment();
    textCell.appendChild(document.createComment(' field:text '));

    if (eyebrow) textCell.appendChild(eyebrow);
    if (headline) textCell.appendChild(headline);

    if (cta) {
      // Strip the trailing "→" arrow glyph, keep clean "Learn more".
      const cleaned = (cta.textContent || '').replace(/\s*[→➜➡➔>›»]+\s*$/u, '').trim();
      if (cleaned) cta.textContent = cleaned;
      textCell.appendChild(cta);
    }

    cells.push([textCell]);
  });

  const block = WebImporter.Blocks.createBlock(document, { name: 'cards-promo', cells });
  element.replaceWith(block);
}
