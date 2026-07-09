/* eslint-disable */
/* global WebImporter */
/**
 * Parser for cards-topics.
 * Base block: cards-topics (wrap of pill/tag links, e.g. "Related capabilities").
 * Source: https://www.dlapiper.com/en-us/capabilities/practice-area/corporate/capital-markets-and-public-company-advisory
 *   (selector: .related-capability-component)
 * Generated: 2026-07-09
 *
 * Source structure (validated against cleaned.html):
 *   <div class="related-capability-component ...">
 *     <div class="related-capability-container">
 *       <h4 class="heading">Related capabilities</h4>
 *       <div class="related-capability-section">
 *         <a class="topic-box" href="/en-us/...">Corporate</a>
 *         ... (one <a> per related capability) ...
 *       </div>
 *     </div>
 *   </div>
 *
 * Target structure (xwalk container block, model 'topic'):
 *   Row 1: block name ("cards-topics")
 *   Each pill -> one row with a single cell:
 *     <!-- field:link --> <a href="/en-us/...">Corporate</a>
 *   The block's decorate() promotes the cell's anchor to a pill; the 'topic'
 *   model captures the link (aem-content) and its linkText from that same anchor.
 *   This block is a text-only pill/tag list (no images), so — unlike the generic
 *   Cards convention — each row is a SINGLE cell holding one link, not an
 *   image+text pair.
 *
 * The section heading ("Related capabilities") is the block's own chrome and is
 * NOT emitted as a data row; only the pill links become rows.
 */
export default function parse(element, { document }) {
  let pills = Array.from(element.querySelectorAll('.related-capability-section a[href], a.topic-box'));
  if (!pills.length) {
    pills = Array.from(element.querySelectorAll('a[href]'));
  }

  if (!pills.length) {
    return;
  }

  const cells = [];

  pills.forEach((pill) => {
    const href = pill.getAttribute('href');
    const text = pill.textContent.trim();
    if (!href || !text) return;

    const cell = document.createElement('div');
    cell.appendChild(document.createComment(' field:link '));
    const a = document.createElement('a');
    a.setAttribute('href', href);
    a.textContent = text;
    cell.appendChild(a);

    cells.push([cell]);
  });

  if (!cells.length) {
    return;
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'cards-topics', cells });
  element.replaceWith(block);
}
