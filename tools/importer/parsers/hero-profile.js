/* eslint-disable */
/* global WebImporter */
/**
 * Parser for hero-profile. Base: hero.
 * Source: https://www.dlapiper.com/en-us/people/r/ryan-frank-w (.people-profile-component)
 *
 * Attorney profile header on a navy band: square portrait (left) + identity
 * content (right) -> name (h1), role ("Partner"), functional title
 * ("Global Chair / Global Co-CEO") and a one-line positioning statement.
 *
 * IMPORTANT: The .people-profile-component ALSO nests, inside .right-section,
 * the quick-contact band (email/phone/region), the About bio, Areas of Focus and
 * Bar admissions. Those are DEFAULT CONTENT (per the authoring analysis) but they
 * live INSIDE the hero's mapped container — so this parser must emit the hero
 * block AND re-emit those nested sections as default content; otherwise
 * element.replaceWith(block) would delete them.
 *
 * xwalk model (blocks/hero-profile/_hero-profile.json):
 *   image (reference) + imageAlt (collapsed -> img alt attr) -> row 1
 *   text  (richtext)                                          -> row 2
 */
export default function parse(element, { document }) {
  // ---- Hero block: portrait + identity ----
  const image = element.querySelector('.left-section img, .left-section picture, img');

  const heading = element.querySelector('.name-details h1, .name-details .name, h1');
  const role = element.querySelector('.name-details .role');
  const designation = element.querySelector('.name-details .designation');
  const statement = element.querySelector('.quote-box .withoutQuotationMark, .quote-box');

  // Unwrap single-child <div>/<span> wrappers down to meaningful content and
  // return it as a clean <p>.
  const toParagraph = (source) => {
    if (!source) return null;
    let inner = source;
    while (
      inner.children.length === 1
      && inner.firstElementChild
      && (inner.firstElementChild.tagName === 'DIV' || inner.firstElementChild.tagName === 'SPAN')
    ) {
      inner = inner.firstElementChild;
    }
    const p = document.createElement('p');
    p.append(...inner.childNodes);
    return p;
  };

  const textContent = [];
  if (heading) {
    const h1 = document.createElement('h1');
    h1.textContent = heading.textContent.replace(/\s+/g, ' ').trim();
    textContent.push(h1);
  }
  const roleP = toParagraph(role);
  if (roleP && roleP.textContent.trim()) textContent.push(roleP);
  const designationP = toParagraph(designation);
  if (designationP && designationP.textContent.trim()) textContent.push(designationP);
  const statementP = toParagraph(statement);
  if (statementP && statementP.textContent.trim()) textContent.push(statementP);

  const cells = [];
  if (image) {
    const imageCell = document.createDocumentFragment();
    imageCell.appendChild(document.createComment(' field:image '));
    imageCell.appendChild(image.cloneNode(true));
    cells.push([imageCell]);
  } else {
    cells.push(['']);
  }
  if (textContent.length) {
    const textCell = document.createDocumentFragment();
    textCell.appendChild(document.createComment(' field:text '));
    textContent.forEach((node) => textCell.appendChild(node));
    cells.push([textCell]);
  } else {
    cells.push(['']);
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'hero-profile', cells });

  // ---- Default content nested inside the hero container ----
  const defaultNodes = [];

  const makeHeading = (text) => {
    if (!text) return null;
    const h = document.createElement('h3');
    h.textContent = text.replace(/\s+/g, ' ').trim();
    return h;
  };
  const makeLinkParagraph = (anchor) => {
    if (!anchor) return null;
    const p = document.createElement('p');
    const a = document.createElement('a');
    a.setAttribute('href', anchor.getAttribute('href') || '');
    a.textContent = anchor.textContent.replace(/\s+/g, ' ').trim();
    p.appendChild(a);
    return p;
  };

  // Quick-contact band: email, phone, location links.
  const emailA = element.querySelector('.email-and-phone .email a, .email-section .email a');
  const phoneA = element.querySelector('.email-and-phone .phone a, .phone-section .phone a');
  const regionA = element.querySelector('.people-info-section a.region, .people-info-section a');
  [emailA, phoneA, regionA].forEach((a) => {
    const p = makeLinkParagraph(a);
    if (p && p.textContent.trim()) defaultNodes.push(p);
  });

  // About bio. Prefer the full (.showPrint) copy over the truncated (.lessCopy) copy.
  const aboutSection = element.querySelector('.people-about-section');
  if (aboutSection) {
    const aboutHeading = makeHeading(aboutSection.querySelector('.label')?.textContent || 'About');
    let paras = aboutSection.querySelectorAll('.showPrint p');
    if (!paras.length) paras = aboutSection.querySelectorAll('.lessCopy p');
    if (!paras.length) paras = aboutSection.querySelectorAll('.about-para p, p');
    if (paras.length) {
      defaultNodes.push(aboutHeading);
      paras.forEach((p) => {
        const np = document.createElement('p');
        np.append(...p.cloneNode(true).childNodes);
        if (np.textContent.trim()) defaultNodes.push(np);
      });
    }
  }

  // Areas of Focus: heading + list of practice-area links.
  const areaSection = element.querySelector('.area-focus-section');
  if (areaSection) {
    const links = areaSection.querySelectorAll('a.focus-area, a');
    if (links.length) {
      defaultNodes.push(makeHeading(areaSection.querySelector('.label')?.textContent || 'Areas of Focus'));
      const ul = document.createElement('ul');
      links.forEach((link) => {
        const li = document.createElement('li');
        const a = document.createElement('a');
        a.setAttribute('href', link.getAttribute('href') || '');
        a.textContent = link.textContent.replace(/\s+/g, ' ').trim();
        li.appendChild(a);
        ul.appendChild(li);
      });
      defaultNodes.push(ul);
    }
  }

  // Bar admissions: heading + value.
  const barSection = element.querySelector('.bar-admission-section');
  if (barSection) {
    const value = barSection.querySelector('.area')?.textContent.replace(/\s+/g, ' ').trim();
    if (value) {
      defaultNodes.push(makeHeading(barSection.querySelector('.label')?.textContent || 'Bar admissions'));
      const p = document.createElement('p');
      p.textContent = value;
      defaultNodes.push(p);
    }
  }

  element.replaceWith(block, ...defaultNodes);
}
