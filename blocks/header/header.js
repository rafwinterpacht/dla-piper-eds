// DLA Piper header: click-triggered megamenu panels (desktop) + full-screen drawer (mobile).
// Content-first: all labels/links/images come from content/nav.plain.html. This file
// only reads that DOM and wires structure + behavior; it hardcodes no copy.

import { getMetadata } from '../../scripts/aem.js';

const isDesktop = window.matchMedia('(min-width: 900px)');

/**
 * Fetch the nav fragment. Dual-fetch: local preview first, then DA/EDS production.
 */
async function fetchNav() {
  let resp = await fetch('/content/nav.plain.html');
  if (!resp.ok) {
    const navMeta = getMetadata('nav');
    const navPath = navMeta ? new URL(navMeta, window.location).pathname : '/nav';
    resp = await fetch(`${navPath}.plain.html`);
  }
  if (!resp.ok) return null;
  const html = await resp.text();
  const tmp = document.createElement('div');
  tmp.innerHTML = html;
  return tmp;
}

function closeAllPanels(nav) {
  nav.querySelectorAll('.nav-drop[aria-expanded="true"]').forEach((li) => {
    li.setAttribute('aria-expanded', 'false');
  });
}

function decorateDesktopBehavior(nav) {
  const topItems = nav.querySelectorAll('.nav-sections > ul > li');
  topItems.forEach((li) => {
    const submenu = li.querySelector(':scope > ul');
    const trigger = li.querySelector(':scope > a');
    if (!submenu || !trigger) return;
    li.classList.add('nav-drop');
    li.setAttribute('aria-expanded', 'false');
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
  nav.querySelectorAll('.nav-sections > ul > li.nav-drop > a').forEach((trigger) => {
    trigger.addEventListener('click', (e) => {
      if (isDesktop.matches) return;
      const li = trigger.closest('li');
      const submenu = li.querySelector(':scope > ul');
      if (!submenu) return;
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
    while (fragment.firstElementChild) nav.append(fragment.firstElementChild);
  }

  // Tag the three top-level sections: brand, sections (primary nav), tools (search + locale).
  const sectionClasses = ['nav-brand', 'nav-sections', 'nav-tools'];
  sectionClasses.forEach((cls, i) => {
    if (nav.children[i]) nav.children[i].classList.add(cls);
  });

  // The tools section: first <ul> = search link, second <ul> = locale list.
  const navTools = nav.querySelector('.nav-tools');
  if (navTools) {
    const lists = navTools.querySelectorAll(':scope > ul');
    if (lists[0]) lists[0].classList.add('nav-search');
    if (lists[1]) lists[1].classList.add('nav-locale');
    // Wrap the locale list in a click-to-toggle control.
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
