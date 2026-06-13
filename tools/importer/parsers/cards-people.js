/* eslint-disable */
/* global WebImporter */
/**
 * Parser for cards-people.
 * Base block: cards (container block — each card = one row of [image, text]).
 * Source: https://www.dlapiper.com/en-us/about-us (.contact-list)
 * Generated: 2026-06-12
 *
 * Source structure (per card):
 *   <a class="contact-card" href="/bio-page">
 *     <img alt="Name" src="...">          -> image cell (field:image)
 *     <div class="contact-name">Name</div> -> name (linked to bio page)
 *     <div class="bottomtext">Role<br>...</div> -> role/title
 *   </a>
 *
 * Target (xwalk container block):
 *   Row 1: block name 'cards-people'
 *   Each card -> one row with two columns:
 *     col1: <!-- field:image --> <img>
 *     col2: <!-- field:text --> <p><a href=bio>Name</a></p><p>Role</p>...
 *   The per-card bio link href is preserved by wrapping the name in an <a>.
 */
export default function parse(element, { document }) {
  // Each person card is an anchor linking to the person's bio page.
  // Validated against source.html (.contact-list > a.contact-card) and the live
  // DOM, where .contact-card can also appear on nested divs — so we restrict to
  // anchors only, and drop any anchor nested inside another card anchor.
  let cards = Array.from(element.querySelectorAll('a.contact-card, a[href*="/people/"]'))
    .filter((a) => a.querySelector('img') || a.querySelector('.contact-name'));
  cards = cards.filter((a) => !cards.some((other) => other !== a && other.contains(a)));

  // The page may contain several .contact-list elements, some of which are
  // empty (no person cards). The selector matches all of them; skip the empty
  // ones so we never emit an empty block.
  if (cards.length === 0) {
    return;
  }

  const cells = [];

  cards.forEach((card) => {
    // --- Image cell ---
    const img = card.querySelector('img');
    const imageCell = document.createElement('div');
    if (img) {
      imageCell.appendChild(document.createComment(' field:image '));
      imageCell.appendChild(img);
    }

    // --- Text cell (richtext): name (linked) + role lines ---
    const href = card.getAttribute('href');
    const nameEl = card.querySelector('.contact-name');
    const roleEl = card.querySelector('.bottomtext');

    const textCell = document.createElement('div');
    textCell.appendChild(document.createComment(' field:text '));

    // Name paragraph, wrapped in the bio-page link to preserve the per-card href.
    if (nameEl) {
      const nameP = document.createElement('p');
      const nameText = nameEl.textContent.trim();
      if (href) {
        const a = document.createElement('a');
        a.setAttribute('href', href);
        a.textContent = nameText;
        nameP.appendChild(a);
      } else {
        nameP.textContent = nameText;
      }
      textCell.appendChild(nameP);
    }

    // Role lines — split on <br> so each line becomes its own paragraph.
    if (roleEl) {
      const html = roleEl.innerHTML;
      const lines = html
        .split(/<br\s*\/?>/i)
        .map((line) => {
          const tmp = document.createElement('div');
          tmp.innerHTML = line;
          return tmp.textContent.trim();
        })
        .filter((line) => line.length > 0);
      lines.forEach((line) => {
        const p = document.createElement('p');
        p.textContent = line;
        textCell.appendChild(p);
      });
    }

    cells.push([imageCell, textCell]);
  });

  const block = WebImporter.Blocks.createBlock(document, { name: 'cards-people', cells });
  element.replaceWith(block);
}
