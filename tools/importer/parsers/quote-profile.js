/* eslint-disable */
/* global WebImporter */
/**
 * Parser for quote-profile.
 * Base block: quote-profile (xwalk).
 * Source: https://www.dlapiper.com/en-us/people/r/ryan-frank-w
 * Generated: 2026-06-13
 *
 * Pull-quote on a navy panel. Two known source structures:
 *   (person-profile) .quote-component .quote-text > .quote / .attribution
 *   (capability)     .article-quote-component > h2.article-quote / p.author
 *
 * UE model (blocks/quote-profile/_quote-profile.json) - simple block, 2 fields:
 *   - quotation  (richtext)
 *   - attribution (richtext)
 * One row per field; each content cell is preceded by its field hint comment.
 */
export default function parse(element, { document }) {
  // Quotation line. Person-profile: <div class="quote">; capability page:
  // <h2 class="article-quote">.
  const quote = element.querySelector('.quote, .article-quote, blockquote, [class*="quote-text"] > div:first-child');
  // Attribution line. Person-profile: <div class="attribution">&mdash; ...</div>;
  // capability page: <p class="author">Legal 500</p>.
  const attribution = element.querySelector('.attribution, .author, cite, [class*="attribution"]');

  // The live page renders a second, EMPTY quote component (`.quote-green`) as a
  // placeholder. If there is no quotation text, drop the block entirely rather
  // than emitting an empty quote table.
  if (!quote || !quote.textContent.trim()) {
    element.remove();
    return;
  }

  const cells = [];

  // Row 1: quotation (field hint before content)
  const quotationCell = document.createDocumentFragment();
  quotationCell.appendChild(document.createComment(' field:quotation '));
  if (quote) {
    quotationCell.appendChild(quote);
  }
  cells.push([quotationCell]);

  // Row 2: attribution (field hint before content)
  const attributionCell = document.createDocumentFragment();
  attributionCell.appendChild(document.createComment(' field:attribution '));
  if (attribution) {
    attributionCell.appendChild(attribution);
  }
  cells.push([attributionCell]);

  const block = WebImporter.Blocks.createBlock(document, { name: 'quote-profile', cells });
  element.replaceWith(block);
}
