import { moveInstrumentation } from '../../scripts/scripts.js';

/**
 * cards-deals — grid of representative deal tiles.
 * Each authored row is one deal. The first cell is the deal-type tag; the
 * remaining cell holds the deal body (company, type, amount) and date, authored
 * as rich text. Text-only, no images.
 */
export default function decorate(block) {
  const ul = document.createElement('ul');
  ul.className = 'cards-deals-list';
  [...block.children].forEach((row) => {
    const li = document.createElement('li');
    moveInstrumentation(row, li);
    li.className = 'cards-deals-item';
    while (row.firstElementChild) li.append(row.firstElementChild);
    const cells = [...li.children];
    if (cells[0]) cells[0].className = 'cards-deals-tag';
    if (cells[1]) cells[1].className = 'cards-deals-body';
    ul.append(li);
  });
  block.textContent = '';
  block.append(ul);
}
