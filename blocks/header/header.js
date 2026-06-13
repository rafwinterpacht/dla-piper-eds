// DLA Piper header: click-triggered megamenu panels (desktop) + full-screen drawer (mobile).
// Content-first: all labels/links/images come from content/nav.plain.html. This file
// only reads that DOM and wires structure + behavior; it hardcodes no copy.
//
// Robustness: works both in local `aem up` preview (raw fragment: section div > ul)
// and in AEM (which wraps each authored group in a .section / .default-content-wrapper).
// We keep .section (the grouping) but flatten .default-content-wrapper, identify groups
// by content signature (not position), and rely on CSS to hide submenus structurally so
// a fixed-position header can never expand to full height and cover the page.

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

  // Resolve relative image paths (logo/icons) against the fragment's location so
  // they load regardless of the current page URL.
  tmp.querySelectorAll('img[src]').forEach((img) => {
    const src = img.getAttribute('src');
    if (src && !/^(https?:)?\/\//.test(src) && !src.startsWith('data:')) {
      img.setAttribute('src', new URL(src, new URL(base, window.location)).href);
    }
  });
  return tmp;
}

/**
 * Keep .section (AEM's per-group wrapper = our brand/nav/tools grouping) but flatten
 * the inner .default-content-wrapper so each group's ul/p is a direct child. In local
 * preview there are no such wrappers, so this is a no-op there.
 */
function unwrap(el) {
  el.querySelectorAll('.default-content-wrapper').forEach((w) => {
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
    // Submenu may not be a strict direct child after AEM conversion; take the
    // first nested <ul> anywhere inside this top-level item.
    const submenu = li.querySelector('ul');
    const trigger = li.querySelector('a');
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
      if (!li.querySelector('ul')) return;
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

  // Identify the three groups by CONTENT SIGNATURE, not by position. AEM and the
  // local `aem up` pipeline can differ in child count/order, and positional tagging
  // mis-assigned the groups in AEM (nav group left untagged -> rendered as a raw,
  // full-height list that covered the hero). Signatures are unambiguous:
  //   primary nav (sections) = the group whose list has NESTED sub-lists (megamenu)
  //   brand                  = a group that contains an <img> (logo) and no list
  //   tools                  = the remaining group (search + locale)
  const topSections = Array.from(nav.children).filter((c) => c.tagName === 'DIV');
  let brand;
  let sections;
  let tools;
  topSections.forEach((sec) => {
    if (!sections && sec.querySelector('ul ul')) {
      sections = sec;
    } else if (!brand && sec.querySelector('img') && !sec.querySelector('ul')) {
      brand = sec;
    }
  });
  topSections.forEach((sec) => {
    if (sec !== sections && sec !== brand && !tools) tools = sec;
  });
  // Position fallbacks if a signature was inconclusive.
  if (!brand) brand = topSections.find((s) => s.querySelector('img'));
  if (!sections) sections = topSections.find((s) => s !== brand && s.querySelector('ul'));
  if (!tools) tools = topSections.find((s) => s !== brand && s !== sections);

  if (brand) brand.classList.add('nav-brand');
  if (sections) sections.classList.add('nav-sections');
  if (tools) tools.classList.add('nav-tools');

  // Tag the primary nav list explicitly so CSS does not depend on direct-child structure.
  if (sections) {
    const primaryList = sections.querySelector('ul');
    if (primaryList) primaryList.classList.add('nav-primary-list');
  }

  // Locate the locale list by CONTENT, anywhere in the nav — do not rely on it
  // landing in a particular group/position. AEM's fragment conversion can merge
  // or regroup the tools lists, which left the locale list untagged and fully
  // visible (spilling over the hero). The locale list is the <ul> whose links
  // point at other region/language home pages (/en, /en-xx, /zh-xx, /ja-jp ...)
  // and is NOT the primary nav list.
  const localePattern = /^\/(?:[a-z]{2})(?:-[a-z]{2})?(?:\/|$)/i;
  let localeList = null;
  let bestScore = 0;
  nav.querySelectorAll('ul').forEach((ul) => {
    if (ul.classList.contains('nav-primary-list') || ul.closest('.nav-submenu')) return;
    const links = Array.from(ul.querySelectorAll(':scope > li > a'));
    if (links.length < 5) return;
    const score = links.filter((a) => localePattern.test(a.getAttribute('href') || '')).length;
    if (score >= 5 && score > bestScore) {
      bestScore = score;
      localeList = ul;
    }
  });

  if (tools) {
    // Tag the search list (a tools list that is not the locale list).
    tools.querySelectorAll('ul').forEach((ul) => {
      if (ul !== localeList) ul.classList.add('nav-search');
    });
  }

  if (localeList) {
    localeList.classList.add('nav-locale');
    // Ensure the locale list lives inside .nav-tools so it is positioned and
    // hidden correctly even if AEM grouped it elsewhere.
    if (tools && !tools.contains(localeList)) tools.append(localeList);
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
