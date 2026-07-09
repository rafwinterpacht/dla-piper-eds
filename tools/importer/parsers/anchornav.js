/* eslint-disable */
/* global WebImporter */
/**
 * Parser for anchornav.
 * Base block: anchornav (sticky in-page jump navigation).
 * Source: https://www.dlapiper.com/en-us/capabilities/practice-area/corporate/capital-markets-and-public-company-advisory
 *   (selector: .anchor-nav-component)
 * Generated: 2026-07-09
 *
 * Source structure (validated against cleaned.html):
 *   <div class="anchor-nav-component ...">
 *     <div class="anchor-nav-desktop">
 *       <ul class="anchor-nav-list">
 *         <li><a href="#blog" class="menuClass">market edge</a></li>
 *         ... (one <li><a> per section) ...
 *       </ul>
 *     </div>
 *     <div class="anchor-nav-mobile"> ...duplicate dropdown of the same links... </div>
 *   </div>
 *
 * Target structure (xwalk container block, model 'anchor-link'):
 *   Row 1: block name ("anchornav")
 *   Each link -> one row with two columns:
 *     col1: <!-- field:label --> label text
 *     col2: <!-- field:anchor --> #anchor target
 *
 * Only the desktop list is used as the source of truth (the mobile dropdown is
 * a duplicate of the same label+anchor pairs); this avoids emitting each link twice.
 */
export default function parse(element, { document }) {
  // Prefer the desktop list; fall back to any anchor list, then any anchors.
  let links = Array.from(element.querySelectorAll('.anchor-nav-desktop .anchor-nav-list a[href]'));
  if (!links.length) {
    links = Array.from(element.querySelectorAll('.anchor-nav-list a[href]'));
  }
  if (!links.length) {
    links = Array.from(element.querySelectorAll('a[href^="#"]'));
  }

  if (!links.length) {
    return;
  }

  const cells = [];

  links.forEach((link) => {
    const label = link.textContent.trim();
    const anchor = (link.getAttribute('href') || '').trim();
    if (!label || !anchor) return;

    // --- Label cell ---
    const labelCell = document.createElement('div');
    labelCell.appendChild(document.createComment(' field:label '));
    const labelP = document.createElement('p');
    labelP.textContent = label;
    labelCell.appendChild(labelP);

    // --- Anchor cell ---
    const anchorCell = document.createElement('div');
    anchorCell.appendChild(document.createComment(' field:anchor '));
    const anchorP = document.createElement('p');
    anchorP.textContent = anchor;
    anchorCell.appendChild(anchorP);

    cells.push([labelCell, anchorCell]);
  });

  if (!cells.length) {
    return;
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'anchornav', cells });
  element.replaceWith(block);
}
