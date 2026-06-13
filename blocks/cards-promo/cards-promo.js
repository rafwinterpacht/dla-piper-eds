import { moveInstrumentation } from '../../scripts/scripts.js';

/*
 * cards-promo - text-only promotional card variant of the cards block.
 * Source: dlapiper.com homepage hero "Publication" promo row.
 * Each card: a small category eyebrow, a headline, and a "Learn more" link.
 * No images. Derived from the vanilla cards block (image handling removed).
 */
export default function decorate(block) {
  const ul = document.createElement('ul');
  [...block.children].forEach((row) => {
    const li = document.createElement('li');
    moveInstrumentation(row, li);
    while (row.firstElementChild) li.append(row.firstElementChild);
    [...li.children].forEach((div) => {
      div.className = 'cards-promo-card-body';
    });
    ul.append(li);
  });
  block.textContent = '';
  block.append(ul);
}
