/* eslint-disable */
/* global WebImporter */
/**
 * Parser for cards-deals.
 * Base block: cards-deals (grid of representative deal tiles, text-only).
 * Source: https://www.dlapiper.com/en-us/capabilities/practice-area/corporate/capital-markets-and-public-company-advisory
 *   (selector: .deal-row)
 * Generated: 2026-07-09
 *
 * Source structure (validated against cleaned.html):
 *   <div class="deal-row">
 *     <div class="container"><div class="row">
 *       <div class="col-...">
 *         <div class="deal-details">
 *           <span class="deal-tag">Initial Public Offering</span>
 *           <h4 class="deal">
 *             <span class="deal-company">Rare Earths Americas</span><br>
 *             <span>Initial Public Offering<br><span>US$69 million</span></span>
 *           </h4>
 *           <p class="deal-date"><span>May 2026</span></p>
 *         </div>
 *       </div>
 *       ... (one .deal-details per deal) ...
 *     </div></div>
 *   </div>
 *
 * Target structure (xwalk container block, model 'deal'):
 *   Row 1: block name ("cards-deals")
 *   Each deal -> one row with two columns:
 *     col1: <!-- field:tag -->  deal-type tag
 *     col2: <!-- field:body --> richtext: company (heading) + type/amount + date
 *   NOTE: these are text-only deal tiles (no images). Unlike the generic Cards
 *   convention (image cell + text cell), this custom block's model is
 *   tag + richtext body, and its decorate() reads cell[0] as the tag and cell[1]
 *   as the body — so the first cell holds the tag text, not an image.
 */
export default function parse(element, { document }) {
  const tiles = Array.from(element.querySelectorAll('.deal-details'));

  if (!tiles.length) {
    return;
  }

  const cells = [];

  tiles.forEach((tile) => {
    // --- Tag cell ---
    const tagEl = tile.querySelector('.deal-tag');
    const tagCell = document.createElement('div');
    tagCell.appendChild(document.createComment(' field:tag '));
    if (tagEl) {
      const tagP = document.createElement('p');
      tagP.textContent = tagEl.textContent.trim();
      tagCell.appendChild(tagP);
    }

    // --- Body cell (richtext): company + type/amount + date ---
    const bodyCell = document.createElement('div');
    bodyCell.appendChild(document.createComment(' field:body '));

    const dealEl = tile.querySelector('.deal, h4.deal');
    const company = tile.querySelector('.deal-company');

    // Company name as the tile heading.
    if (company) {
      const h = document.createElement('h4');
      h.textContent = company.textContent.trim();
      bodyCell.appendChild(h);
    }

    // Remaining deal lines (type + amount) — everything in .deal except the
    // company name, split on <br> into separate paragraphs.
    if (dealEl) {
      const clone = dealEl.cloneNode(true);
      const companyClone = clone.querySelector('.deal-company');
      if (companyClone) companyClone.remove();
      const lines = clone.innerHTML
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
        bodyCell.appendChild(p);
      });
    }

    // Deal date.
    const dateEl = tile.querySelector('.deal-date');
    if (dateEl) {
      const dateP = document.createElement('p');
      dateP.textContent = dateEl.textContent.trim();
      bodyCell.appendChild(dateP);
    }

    cells.push([tagCell, bodyCell]);
  });

  const block = WebImporter.Blocks.createBlock(document, { name: 'cards-deals', cells });
  element.replaceWith(block);
}
