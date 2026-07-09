import { moveInstrumentation } from '../../scripts/scripts.js';

/**
 * cards-topics — a wrap of pill/tag links (e.g. "Related capabilities").
 * Each authored row is a single cell containing one link; rendered as a pill.
 * Text-only (no images), typically on a dark accent band.
 */
export default function decorate(block) {
  const ul = document.createElement('ul');
  ul.className = 'cards-topics-list';
  [...block.children].forEach((row) => {
    const li = document.createElement('li');
    moveInstrumentation(row, li);
    li.className = 'cards-topics-item';
    while (row.firstElementChild) li.append(row.firstElementChild);
    // Promote a bare anchor to the pill; otherwise style the cell as a pill.
    const cell = li.firstElementChild;
    if (cell) cell.className = 'cards-topics-pill';
    ul.append(li);
  });
  block.textContent = '';
  block.append(ul);
}
