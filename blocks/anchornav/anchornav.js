import { moveInstrumentation } from '../../scripts/scripts.js';

/**
 * anchornav — sticky in-page jump navigation for long capability/section pages.
 * Each authored row is one link (label + in-page anchor, e.g. #resources).
 * Renders a horizontal list that sticks to the top on scroll and highlights the
 * section currently in view.
 */
export default function decorate(block) {
  const nav = document.createElement('nav');
  nav.className = 'anchornav-list';
  nav.setAttribute('aria-label', 'In-page navigation');

  const links = [];
  [...block.children].forEach((row) => {
    const li = document.createElement('div');
    li.className = 'anchornav-item';
    moveInstrumentation(row, li);
    const anchor = row.querySelector('a');
    if (anchor) {
      anchor.classList.add('anchornav-link');
      li.append(anchor);
      links.push(anchor);
    } else {
      while (row.firstElementChild) li.append(row.firstElementChild);
    }
    nav.append(li);
  });

  block.textContent = '';
  block.append(nav);

  // Highlight the link whose target section is currently in view.
  const targets = links
    .map((a) => {
      const id = (a.getAttribute('href') || '').replace(/^.*#/, '');
      return id ? { a, el: document.getElementById(id) } : null;
    })
    .filter((t) => t && t.el);

  if (targets.length && 'IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const match = targets.find((t) => t.el === entry.target);
          if (match) {
            links.forEach((a) => a.classList.remove('active'));
            match.a.classList.add('active');
          }
        }
      });
    }, { rootMargin: '-40% 0px -55% 0px', threshold: 0 });
    targets.forEach((t) => observer.observe(t.el));
  }
}
