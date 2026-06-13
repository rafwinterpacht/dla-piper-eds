/* eslint-disable */
/* global WebImporter */
/**
 * Parser for columns-contact.
 * Base block: columns (core/franklin/components/columns/v1/columns).
 * Source: https://www.dlapiper.com/en-us/people/r/ryan-frank-w
 *
 * The "Connect" contact panel. In the LIVE rendered DOM the panel is a
 * `div.component` wrapping:
 *   .rich-text-heading-component  -> the "Connect" h2 heading
 *   .profile-contact-component    -> the contact fields, nested in bootstrap rows
 * The mapped element is `.profile-contact-component` (see page-templates.json).
 *
 * Within .profile-contact-component the four contact groups are NOT direct
 * children — they are nested inside .row/.col wrappers:
 *   .email-block, .phone-block, .location-block, .sayhello-block
 * Each becomes one column. Columns blocks do NOT use field hints (xwalk rule).
 */
export default function parse(element, { document }) {
  // The "Connect" heading lives in a sibling .rich-text-heading-component within
  // the shared `.component` wrapper, not inside .profile-contact-component.
  const wrapper = element.closest('.component') || element.parentElement || element;
  const heading = wrapper.querySelector('.rich-text-header, h2');

  // Find the four contact groups wherever they are nested.
  const order = ['.email-block', '.phone-block', '.location-block', '.sayhello-block'];
  let columnBlocks = order
    .map((sel) => element.querySelector(sel))
    .filter((el) => el);

  // Fallback: if the named blocks are absent, use direct children.
  if (columnBlocks.length === 0) {
    columnBlocks = Array.from(element.children);
  }

  // Build one cell per column, preserving inner content (h4 + links/address)
  // as semantic HTML. Strip decorative SVG icons / arrow spans.
  const columnCells = columnBlocks.map((block) => {
    const clone = block.cloneNode(true);
    clone.querySelectorAll('svg, .rightarrowicon, .social-icon, .direction-text > svg').forEach((n) => n.remove());
    const cellContent = [];
    Array.from(clone.childNodes).forEach((node) => {
      if (node.nodeType === 3 && !node.textContent.trim()) return;
      cellContent.push(node);
    });
    return cellContent.length === 1 ? cellContent[0] : cellContent;
  });

  // Prepend the "Connect" heading to the first column as default content so the
  // table stays a single multi-column row.
  if (heading && columnCells.length > 0) {
    const h = document.createElement('h2');
    h.textContent = heading.textContent.replace(/\s+/g, ' ').trim();
    const first = columnCells[0];
    columnCells[0] = Array.isArray(first) ? [h, ...first] : [h, first];
  }

  const cells = [columnCells];

  const block = WebImporter.Blocks.createBlock(document, { name: 'columns-contact', cells });

  // Replace the whole `.component` wrapper (heading + panel) when we own it,
  // otherwise just the mapped element.
  const target = (wrapper !== element && wrapper.querySelector('.profile-contact-component'))
    ? wrapper
    : element;
  target.replaceWith(block);
}
