/* eslint-disable */
/* global WebImporter */
/**
 * Parser for cards-insights.
 * Base block: cards
 * Source: https://www.dlapiper.com/en-us/people/r/ryan-frank-w (.tertiary-content-component)
 * Generated for xwalk project (field hints required).
 *
 * Model (blocks/cards-insights/_cards-insights.json):
 *   container "cards-insights" -> items of model "card-insights"
 *   card-insights fields: image (reference), text (richtext)
 *
 * Structure: one row per card.
 *   - cell 1: image  (<!-- field:image -->)
 *   - cell 2: text   (<!-- field:text -->) — category, headline, date, kept inside the card's link.
 *
 * The "My latest insights" heading and the trailing "View All" link have no model
 * fields, so they are intentionally not emitted as cells.
 */
export default function parse(element, { document }) {
  // Each insight is an <a class="card"> link; fall back to broader matches if classes vary.
  const cards = Array.from(
    element.querySelectorAll('a.card, .card-img'),
  )
    .map((el) => (el.matches('a.card') ? el : el.closest('a')))
    .filter((el, idx, arr) => el && arr.indexOf(el) === idx);

  const cells = [];

  cards.forEach((card) => {
    // --- image cell ---
    const img = card.querySelector('img.card-img, .image-wrapper img, img');
    const imageCell = document.createDocumentFragment();
    imageCell.appendChild(document.createComment(' field:image '));
    if (img) imageCell.appendChild(img);

    // --- text cell (category, headline, date), preserving the card link ---
    const href = card.getAttribute('href');
    const category = card.querySelector('.category');
    const headline = card.querySelector('.description, .card-content .description, p.description');
    const date = card.querySelector('.date, .card-content .date, p.date');

    // Build the richtext body inside an anchor so the card link is preserved.
    const body = href ? document.createElement('a') : document.createElement('div');
    if (href) body.setAttribute('href', href);
    if (category) body.appendChild(category);
    if (headline) body.appendChild(headline);
    if (date) body.appendChild(date);

    const textCell = document.createDocumentFragment();
    textCell.appendChild(document.createComment(' field:text '));
    textCell.appendChild(body);

    cells.push([imageCell, textCell]);
  });

  const block = WebImporter.Blocks.createBlock(document, { name: 'cards-insights', cells });
  element.replaceWith(block);
}
