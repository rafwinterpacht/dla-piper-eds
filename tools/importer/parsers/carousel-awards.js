/* eslint-disable */
/* global WebImporter */
/**
 * Parser for carousel-awards.
 * Base block: carousel-awards (carousel of award tiles).
 * Source: https://www.dlapiper.com/en-us/about-us
 *   (selector: .multimedia-highlight-component:has(.award-section))
 * Generated: 2026-06-12
 *
 * Source structure (validated against live DOM): a container
 * (.multimedia-highlight-component) wrapping N award tiles. Each tile is a
 * `.award-section` holding:
 *   - span.award-text   -> award title / statistic
 *   - span.award-source -> awarding body + year
 * Tiles are nested descendants of the container (not direct children).
 *
 * Target structure (xwalk container block):
 *   Row 1: block name ("carousel-awards")
 *   Each subsequent row = one carousel slide (model: carousel-awards-item):
 *     Column 1 (image)   -> media_image (empty here, awards have no background image)
 *     Column 2 (content) -> content_text richtext (award title + source)
 *
 * The decorate() function treats the first column of each row as the slide
 * image and the remaining column(s) as the slide content. Award tiles carry
 * no image, so the image cell is left empty (no field hint per hinting rules).
 */
export default function parse(element, { document }) {
  // Each award tile becomes one slide. Validated against live DOM: tiles are
  // `.award-section` (descendants of the container, not always direct children).
  let tiles = Array.from(element.querySelectorAll('.award-section'));
  if (!tiles.length) {
    // Fallback: the awardbox anchors that wrap each tile in some renders.
    tiles = Array.from(element.querySelectorAll('.awardbox'));
  }
  if (!tiles.length) {
    tiles = Array.from(element.querySelectorAll(':scope > div'));
  }

  const cells = [];

  tiles.forEach((tile) => {
    // --- Image column (media_image) ---
    // Awards have no background image; leave the cell empty (no field hint
    // on empty cells per xwalk hinting rules). Keeps the 2-column slide shape
    // expected by decorate().
    const imageCell = document.createElement('div');

    // --- Content column (content_text richtext) ---
    const title = tile.querySelector('.award-text, [class*="text"]');
    const source = tile.querySelector('.award-source, [class*="source"]');

    const contentFragment = document.createDocumentFragment();
    contentFragment.appendChild(document.createComment(' field:content_text '));

    if (title) {
      const titleEl = document.createElement('h3');
      titleEl.textContent = title.textContent.trim();
      contentFragment.appendChild(titleEl);
    }

    if (source) {
      const sourceEl = document.createElement('p');
      sourceEl.textContent = source.textContent.trim();
      contentFragment.appendChild(sourceEl);
    }

    const contentCell = document.createElement('div');
    contentCell.appendChild(contentFragment);

    cells.push([imageCell, contentCell]);
  });

  const block = WebImporter.Blocks.createBlock(document, { name: 'carousel-awards', cells });
  element.replaceWith(block);
}
