// DLA Piper footer: content-first. All copy/links/icons live in
// content/footer.plain.html; this file fetches that fragment, reads its DOM,
// and tags sections for styling. No hardcoded copy.

import { getMetadata } from '../../scripts/aem.js';

async function fetchFooter() {
  let resp = await fetch('/content/footer.plain.html');
  if (!resp.ok) {
    const footerMeta = getMetadata('footer');
    const footerPath = footerMeta ? new URL(footerMeta, window.location).pathname : '/footer';
    resp = await fetch(`${footerPath}.plain.html`);
  }
  if (!resp.ok) return null;
  const html = await resp.text();
  const tmp = document.createElement('div');
  tmp.innerHTML = html;
  return tmp;
}

export default async function decorate(block) {
  const fragment = await fetchFooter();
  block.textContent = '';

  const footer = document.createElement('div');
  footer.className = 'footer-content';

  if (fragment) {
    while (fragment.firstElementChild) footer.append(fragment.firstElementChild);
  }

  // Tag the four sections for styling: primary links, also-of-interest, legal links, legal text.
  const sectionClasses = ['footer-primary', 'footer-also-of-interest', 'footer-legal-links', 'footer-legal-text'];
  sectionClasses.forEach((cls, i) => {
    if (footer.children[i]) footer.children[i].classList.add(cls);
  });

  // Within the primary section: 1st ul = nav links, 2nd = action links, 3rd = social icons.
  const primary = footer.querySelector('.footer-primary');
  if (primary) {
    const lists = primary.querySelectorAll(':scope > ul');
    if (lists[0]) lists[0].classList.add('footer-nav-links');
    if (lists[1]) lists[1].classList.add('footer-actions');
    if (lists[2]) lists[2].classList.add('footer-social');
  }

  // Social links open in a new tab.
  footer.querySelectorAll('.footer-social a').forEach((a) => {
    a.setAttribute('target', '_blank');
    a.setAttribute('rel', 'noopener noreferrer');
  });

  block.append(footer);
}
