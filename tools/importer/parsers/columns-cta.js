/* eslint-disable */
/* global WebImporter */
/**
 * Parser for columns-cta.
 * Base block: columns (core/franklin/components/columns/v1/columns), 2 columns x 1 row.
 * Source: https://www.dlapiper.com/en-us
 *
 * Two-up call-to-action band (olive/gold). In the source DOM the mapped element
 * `.feature-cta-component` wraps:
 *   .feature-cta > .row > two .cta-container
 * Each .cta-container holds:
 *   a.cta-with-arrow[href]  -> wraps  h2.cta-text  ("Find a career" -> /en-us/careers,
 *                                                    "Find a lawyer" -> /en-us/people)
 *   span.arrow              -> decorative CSS arrow (no content)
 *
 * Mapping: one row, one column cell per CTA. Each cell keeps the anchor (href +
 * heading text) as default content; the decorative span.arrow is dropped.
 * Columns blocks do NOT use field hints (xwalk rule) — cells contain default
 * content placed across the columns.
 */
export default function parse(element, { document }) {
  // The two CTA links. Prefer the explicit .cta-container > a.cta-with-arrow
  // structure; fall back to any anchor inside the band.
  let anchors = Array.from(element.querySelectorAll('.cta-container a.cta-with-arrow'));
  if (anchors.length === 0) {
    anchors = Array.from(element.querySelectorAll('a.cta-with-arrow, .cta-container a, a[href]'));
  }

  // One cell per column: a clean anchor (href + plain CTA text).
  // The source anchor wraps an <h2>; a heading nested inside a link does NOT
  // round-trip through markdown (it serializes as a literal "## ..." inside the
  // link text). So flatten the anchor to a plain link carrying just the CTA text.
  const columnCells = anchors.map((anchor) => {
    const href = anchor.getAttribute('href') || '';
    const text = anchor.textContent.replace(/\s+/g, ' ').trim();
    const a = document.createElement('a');
    a.setAttribute('href', href);
    a.textContent = text;
    return a;
  });

  // Single row containing both column cells.
  const cells = [columnCells];

  const block = WebImporter.Blocks.createBlock(document, { name: 'columns-cta', cells });
  element.replaceWith(block);
}
