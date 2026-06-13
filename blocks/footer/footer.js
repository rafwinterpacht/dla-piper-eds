// DLA Piper footer: content-first. All copy/links/icons live in
// content/footer.plain.html; this file fetches that fragment, reads its DOM,
// and tags sections for styling. No hardcoded copy.
//
// Robustness: works in local `aem up` preview (raw fragment) and in AEM (which
// wraps each authored group in .section / .default-content-wrapper). Keep
// .section (the grouping), flatten .default-content-wrapper, absolutize image
// paths, and let CSS hold the layout via classes (no fragile child chains).

import { getMetadata } from '../../scripts/aem.js';

async function fetchFooter() {
  let resp = await fetch('/content/footer.plain.html');
  let base = '/content/footer.plain.html';
  if (!resp.ok) {
    const footerMeta = getMetadata('footer');
    const footerPath = footerMeta ? new URL(footerMeta, window.location).pathname : '/footer';
    base = `${footerPath}.plain.html`;
    resp = await fetch(base);
  }
  if (!resp.ok) return null;
  const html = await resp.text();
  const tmp = document.createElement('div');
  tmp.innerHTML = html;

  // Resolve relative image paths (social icons) against the fragment location.
  tmp.querySelectorAll('img[src]').forEach((img) => {
    const src = img.getAttribute('src');
    if (src && !/^(https?:)?\/\//.test(src) && !src.startsWith('data:')) {
      img.setAttribute('src', new URL(src, new URL(base, window.location)).href);
    }
  });
  return tmp;
}

// Keep .section (AEM's per-`---` grouping = our 4 footer sections); only flatten
// the inner .default-content-wrapper. Removing .section would merge all groups.
function unwrap(el) {
  el.querySelectorAll('.default-content-wrapper').forEach((w) => {
    w.replaceWith(...w.childNodes);
  });
}

export default async function decorate(block) {
  const fragment = await fetchFooter();
  block.textContent = '';

  const footer = document.createElement('div');
  footer.className = 'footer-content';

  if (fragment) {
    unwrap(fragment);
    while (fragment.firstElementChild) footer.append(fragment.firstElementChild);
  }

  // Tag the four sections by position (authored order is stable after unwrap):
  // primary links, also-of-interest, legal links, legal text.
  const sectionClasses = ['footer-primary', 'footer-also-of-interest', 'footer-legal-links', 'footer-legal-text'];
  const sections = Array.from(footer.children).filter((c) => c.tagName === 'DIV');
  sectionClasses.forEach((cls, i) => {
    if (sections[i]) sections[i].classList.add(cls);
  });

  // Within the primary section: 1st ul = nav links, 2nd = action links, 3rd = social icons.
  const primary = footer.querySelector('.footer-primary');
  if (primary) {
    const lists = primary.querySelectorAll('ul');
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
