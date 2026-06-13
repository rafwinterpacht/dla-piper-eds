// DLA Piper header: click-triggered megamenu panels (desktop) + full-screen drawer (mobile).
// Content-first: all labels/links/images come from content/nav.plain.html. This file
// only reads that DOM and wires structure + behavior; it hardcodes no copy.
//
// Robustness: works both in local `aem up` preview (raw fragment: section div > ul)
// and in AEM (which can wrap section content in .section / .default-content-wrapper
// divs). We normalize the fetched DOM and tag elements with explicit classes so the
// CSS never depends on a fragile direct-child relationship.

import { getMetadata } from '../../scripts/aem.js';

const isDesktop = window.matchMedia('(min-width: 900px)');

/**
 * Fetch the nav fragment. Dual-fetch: local preview first, then DA/EDS production.
 */
async function fetchNav() {
  let resp = await fetch('/content/nav.plain.html');
  let base = '/content/nav.plain.html';
  if (!resp.ok) {
    const navMeta = getMetadata('nav');
    const navPath = navMeta ? new URL(navMeta, window.location).pathname : '/nav';
    base = `${navPath}.plain.html`;
    resp = await fetch(base);
  }
  if (!resp.ok) return null;
  const html = await resp.text();
  const tmp = document.createElement('div');
  tmp.innerHTML = html;

  // Resolve relative image paths (e.g. images/logo.svg) against the fragment's
  // location so the logo/icons load regardless of the current page URL.
  tmp.querySelectorAll('img[src]').forEach((img) => {
    const src = img.getAttribute('src');
    if (src && !/^(https?:)?\/\//.test(src) && !src.startsWith('data:')) {
      img.setAttribute('src', new URL(src, new URL(base, window.location)).href);
    }
  });
  return tmp;
}

/**
 * Flatten AEM section wrappers so each top-level section's meaningful content
 * (ul / p) becomes a direct child. Unwraps .section and .default-content-wrapper
 * (and any single-child wrapper div) in place.
 */
function unwrap(el) {
  el.querySelectorAll('.section, .default-content-wrapper').forEach((w) => {
    w.replaceWith(...w.childNodes);
  });
}

function closeAllPanels(nav) {
  nav.querySelectorAll('.nav-drop[aria-expanded="true"]').forEach((li) => {
    li.setAttribute('aria-expanded', 'false');
  });
}

function decorateDesktopBehavior(nav) {
  nav.querySelectorAll('.nav-primary-list > li').forEach((li) => {
    const submenu = li.querySelector(':scope > ul');
    const trigger = li.querySelector(':scope > a');
    if (!submenu || !trigger) return;
    li.classList.add('nav-drop');
    li.setAttribute('aria-expanded', 'false');
    submenu.classList.add('nav-submenu');
    // Click on the top-level label toggles its panel (source uses click, not hover).
    trigger.addEventListener('click', (e) => {
      if (!isDesktop.matches) return; // mobile handled separately
      e.preventDefault();
      const open = li.getAttribute('aria-expanded') === 'true';
      closeAllPanels(nav);
      li.setAttribute('aria-expanded', open ? 'false' : 'true');
    });
  });

  // Close panels on outside click / Escape.
  document.addEventListener('click', (e) => {
    if (isDesktop.matches && !nav.contains(e.target)) closeAllPanels(nav);
  });
  document.addEventListener('keydown', (e) => {
    if (e.code === 'Escape') closeAllPanels(nav);
  });
}

function toggleMobileMenu(nav, forceClose) {
  const expanded = nav.getAttribute('aria-expanded') === 'true';
  const open = forceClose ? false : !expanded;
  nav.setAttribute('aria-expanded', open ? 'true' : 'false');
  document.body.style.overflowY = (open && !isDesktop.matches) ? 'hidden' : '';
  const button = nav.querySelector('.nav-hamburger button');
  if (button) button.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
}

function decorateMobileAccordion(nav) {
  // On mobile, tapping a top-level label expands its sub-list in place (accordion).
  nav.querySelectorAll('.nav-primary-list > li.nav-drop > a').forEach((trigger) => {
    trigger.addEventListener('click', (e) => {
      if (isDesktop.matches) return;
      const li = trigger.closest('li');
      if (!li.querySelector(':scope > ul')) return;
      e.preventDefault();
      const open = li.getAttribute('aria-expanded') === 'true';
      li.setAttribute('aria-expanded', open ? 'false' : 'true');
    });
  });
}

export default async function decorate(block) {
  const fragment = await fetchNav();
  block.textContent = '';

  const nav = document.createElement('nav');
  nav.id = 'nav';
  nav.setAttribute('aria-expanded', 'false');

  if (fragment) {
    unwrap(fragment);
    while (fragment.firstElementChild) nav.append(fragment.firstElementChild);
  }

  // The fragment's three sections are authored in a fixed order: brand, primary
  // nav, tools. After unwrap() that order is preserved, so tag by position.
  // (The earlier AEM breakage was a CSS direct-child issue, not ordering.)
  const topSections = Array.from(nav.children).filter((c) => c.tagName === 'DIV');
  const [brand, sections, tools] = topSections;

  if (brand) brand.classList.add('nav-brand');
  if (sections) sections.classList.add('nav-sections');
  if (tools) tools.classList.add('nav-tools');

  // Tag the primary nav list explicitly so CSS does not depend on direct-child
  // structure (AEM may wrap it in .default-content-wrapper).
  if (sections) {
    const primaryList = sections.querySelector('ul');
    if (primaryList) primaryList.classList.add('nav-primary-list');
  }

  // Tools: first ul = search link(s), second ul = locale list.
  if (tools) {
    const lists = tools.querySelectorAll('ul');
    if (lists[0]) lists[0].classList.add('nav-search');
    if (lists[1]) lists[1].classList.add('nav-locale');
    const localeList = lists[1];
    if (localeList) {
      const localeToggle = document.createElement('button');
      localeToggle.type = 'button';
      localeToggle.className = 'nav-locale-toggle';
      localeToggle.setAttribute('aria-expanded', 'false');
      localeToggle.setAttribute('aria-label', 'Open region and language selector');
      localeToggle.textContent = 'United States | en-US';
      localeList.parentElement.insertBefore(localeToggle, localeList);
      localeToggle.addEventListener('click', () => {
        const open = localeToggle.getAttribute('aria-expanded') === 'true';
        localeToggle.setAttribute('aria-expanded', open ? 'false' : 'true');
        localeList.classList.toggle('open', !open);
      });
    }
  }

  // Hamburger (mobile).
  const hamburger = document.createElement('div');
  hamburger.className = 'nav-hamburger';
  hamburger.innerHTML = '<button type="button" aria-controls="nav" aria-label="Open navigation"><span class="nav-hamburger-icon"></span></button>';
  hamburger.addEventListener('click', () => toggleMobileMenu(nav));
  nav.prepend(hamburger);

  decorateDesktopBehavior(nav);
  decorateMobileAccordion(nav);

  // Reset state cleanly when crossing the breakpoint.
  isDesktop.addEventListener('change', () => {
    closeAllPanels(nav);
    toggleMobileMenu(nav, true);
    const button = nav.querySelector('.nav-hamburger button');
    if (button) button.setAttribute('aria-label', 'Open navigation');
  });

  const navWrapper = document.createElement('div');
  navWrapper.className = 'nav-wrapper';
  navWrapper.append(nav);
  block.append(navWrapper);

  // Expose the rendered header height so megamenu/locale panels open below the
  // full header (logo row + primary-nav row), not overlapping the nav row.
  const setHeaderHeight = () => {
    const h = navWrapper.getBoundingClientRect().height;
    if (h) document.documentElement.style.setProperty('--dlp-header-h', `${Math.round(h)}px`);
  };
  setHeaderHeight();
  window.addEventListener('resize', setHeaderHeight);
}
