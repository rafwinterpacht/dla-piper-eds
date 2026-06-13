import { getMetadata } from '../../scripts/aem.js';

// Desktop breakpoint — below this the header collapses to a mobile drawer (mobile phase TBD).
const isDesktop = window.matchMedia('(min-width: 900px)');

/**
 * Dual-fetch the nav fragment as plain HTML.
 * Tries /content/nav.plain.html first (local aem up / DA content tree), then
 * falls back to ${navPath}.plain.html when a `nav` metadata path is provided.
 * @returns {Promise<HTMLElement|null>} a detached container holding the fragment markup
 */
/**
 * Resolve relative image src values against the fragment's own directory so
 * `images/foo.svg` in /content/nav.plain.html loads from /content/images/foo.svg
 * regardless of the current page path.
 * @param {HTMLElement} container the fragment container
 * @param {string} fragmentUrl the URL the fragment was fetched from
 */
function resolveFragmentImages(container, fragmentUrl) {
  const base = new URL(fragmentUrl, window.location).href;
  container.querySelectorAll('img[src]').forEach((img) => {
    const raw = img.getAttribute('src');
    if (raw && !/^(https?:)?\/\//.test(raw) && !raw.startsWith('/')) {
      img.src = new URL(raw, base).href;
    }
  });
}

async function fetchFirst(candidates, index = 0) {
  if (index >= candidates.length) return null;
  try {
    const resp = await fetch(candidates[index]);
    if (resp.ok) {
      const html = await resp.text();
      const container = document.createElement('div');
      container.innerHTML = html;
      if (container.children.length) {
        resolveFragmentImages(container, candidates[index]);
        return container;
      }
    }
  } catch (e) {
    // try next candidate
  }
  return fetchFirst(candidates, index + 1);
}

async function loadNavFragment() {
  const navMeta = getMetadata('nav');
  const candidates = ['/content/nav.plain.html'];
  if (navMeta) {
    const navPath = new URL(navMeta, window.location).pathname;
    candidates.push(`${navPath}.plain.html`);
  }
  candidates.push('/nav.plain.html');
  return fetchFirst(candidates);
}

/**
 * Close every open megamenu panel and reset trigger state.
 * @param {HTMLElement} nav the nav root element
 */
function closeAllPanels(nav) {
  nav.querySelectorAll('[aria-expanded="true"]').forEach((el) => {
    el.setAttribute('aria-expanded', 'false');
  });
  nav.querySelectorAll('.nav-panel.is-open').forEach((panel) => {
    panel.classList.remove('is-open');
  });
  nav.classList.remove('has-open-panel');
}

/**
 * Toggle a single megamenu panel open/closed and close any siblings.
 * @param {HTMLElement} nav the nav root
 * @param {HTMLElement} trigger the trigger button
 * @param {HTMLElement} panel the associated panel
 */
function togglePanel(nav, trigger, panel) {
  const isOpen = trigger.getAttribute('aria-expanded') === 'true';
  closeAllPanels(nav);
  if (!isOpen) {
    trigger.setAttribute('aria-expanded', 'true');
    panel.classList.add('is-open');
    nav.classList.add('has-open-panel');
  }
}

/**
 * Build the primary navigation (megamenu) from the primary-nav source list.
 * Each top-level <li> becomes a click-triggered button + a panel built from its
 * nested <ul>. All copy, links, and images come from the fragment DOM.
 * @param {HTMLElement} section the .nav-sections source element
 * @param {HTMLElement} nav the nav root
 */
function buildPrimaryNav(section, nav) {
  const topList = section.querySelector(':scope > ul');
  if (!topList) return;
  topList.classList.add('nav-primary-list');

  topList.querySelectorAll(':scope > li').forEach((item) => {
    const link = item.querySelector(':scope > a');
    const panelList = item.querySelector(':scope > ul');
    if (!link) return;

    if (!panelList) {
      item.classList.add('nav-primary-item');
      return;
    }

    item.classList.add('nav-primary-item', 'nav-drop');
    const label = link.textContent.trim();
    const href = link.getAttribute('href');

    // Trigger button (real pointer target). Keep the original link as the panel CTA.
    const trigger = document.createElement('button');
    trigger.type = 'button';
    trigger.className = 'nav-trigger';
    trigger.textContent = label;
    trigger.setAttribute('aria-expanded', 'false');
    trigger.setAttribute('aria-haspopup', 'true');

    const panel = document.createElement('div');
    panel.className = 'nav-panel';

    // CTA row — re-use the original top-level link, UNLESS the panel already contains a
    // heading with the same text (then the heading is the title and a duplicate link is
    // redundant — keeps the panel link set faithful to source).
    const hasMatchingHeading = [...panelList.querySelectorAll('h1,h2,h3,h4,h5,h6')]
      .some((h) => h.textContent.trim().toLowerCase() === label.toLowerCase());
    if (!hasMatchingHeading) {
      const cta = document.createElement('a');
      cta.className = 'nav-panel-cta';
      cta.href = href;
      cta.textContent = label;
      panel.append(cta);
    }

    // Move the source nested list into the panel as the items grid.
    panelList.classList.add('nav-panel-list');
    panel.append(panelList);

    // Tag panel item types so CSS can render people-cards / featured cards / links.
    panelList.querySelectorAll(':scope > li').forEach((li) => {
      if (li.querySelector('h2')) {
        li.classList.add('nav-panel-heading');
      } else if (li.querySelector('strong')) {
        // Featured promo card (eyebrow <strong> + <h3> + Learn more link), may include an image.
        li.classList.add('nav-panel-featured');
      } else if (li.querySelector('img')) {
        li.classList.add('nav-panel-card');
      } else {
        li.classList.add('nav-panel-link');
      }
    });

    item.textContent = '';
    item.append(trigger, panel);

    trigger.addEventListener('click', (e) => {
      e.stopPropagation();
      togglePanel(nav, trigger, panel);
    });
  });
}

/**
 * Build the search control. The fragment provides a "Search" label and a list of
 * quick links / trending searches; the form input + button are created here (per
 * the plain-fragment contract: no form controls live in nav.plain.html).
 * @param {HTMLElement} section the source search section
 * @param {HTMLElement} nav the nav root
 */
function buildSearch(section, nav) {
  const tools = document.createElement('div');
  tools.className = 'nav-search';

  const trigger = document.createElement('button');
  trigger.type = 'button';
  trigger.className = 'nav-search-toggle';
  trigger.setAttribute('aria-label', 'Search');
  trigger.setAttribute('aria-expanded', 'false');

  const overlay = document.createElement('div');
  overlay.className = 'nav-search-overlay';

  const form = document.createElement('form');
  form.className = 'nav-search-form';
  form.setAttribute('role', 'search');

  const input = document.createElement('input');
  input.type = 'search';
  input.className = 'nav-search-input';
  input.setAttribute('aria-label', 'Search');
  input.placeholder = 'Search';

  const submit = document.createElement('button');
  submit.type = 'submit';
  submit.className = 'nav-search-submit';
  submit.setAttribute('aria-label', 'Submit search');

  form.append(input, submit);
  overlay.append(form);

  // Quick links / trending searches come from the fragment (links only).
  const quick = section.querySelector(':scope > ul');
  if (quick) {
    quick.classList.add('nav-search-links');
    overlay.append(quick);
  }

  trigger.addEventListener('click', (e) => {
    e.stopPropagation();
    const open = trigger.getAttribute('aria-expanded') === 'true';
    closeAllPanels(nav);
    trigger.setAttribute('aria-expanded', open ? 'false' : 'true');
    overlay.classList.toggle('is-open', !open);
    if (!open) input.focus();
  });

  tools.append(trigger, overlay);
  return tools;
}

/**
 * Build the locale / region selector. The fragment provides the current locale
 * label and a list of region/language links; the toggle button is built here.
 * @param {HTMLElement} section the source locale section
 * @param {HTMLElement} nav the nav root
 */
function buildLocale(section, nav) {
  const wrapper = document.createElement('div');
  wrapper.className = 'nav-locale';

  const current = section.querySelector(':scope > p');
  const label = current ? current.textContent.trim() : 'Region';

  const trigger = document.createElement('button');
  trigger.type = 'button';
  trigger.className = 'nav-locale-toggle';
  trigger.setAttribute('aria-haspopup', 'true');
  trigger.setAttribute('aria-expanded', 'false');
  trigger.setAttribute('aria-label', `${label}, open region and language selector`);
  trigger.textContent = label;

  const overlay = document.createElement('div');
  overlay.className = 'nav-locale-overlay';

  const list = section.querySelector(':scope > ul');
  if (list) {
    list.classList.add('nav-locale-list');
    overlay.append(list);
  }

  trigger.addEventListener('click', (e) => {
    e.stopPropagation();
    const open = trigger.getAttribute('aria-expanded') === 'true';
    closeAllPanels(nav);
    trigger.setAttribute('aria-expanded', open ? 'false' : 'true');
    overlay.classList.toggle('is-open', !open);
  });

  wrapper.append(trigger, overlay);
  return wrapper;
}

/**
 * loads and decorates the header, mainly the nav
 * @param {Element} block The header block element
 */
export default async function decorate(block) {
  const fragment = await loadNavFragment();
  block.textContent = '';
  if (!fragment) return;

  const sections = [...fragment.children];

  const nav = document.createElement('nav');
  nav.id = 'nav';
  nav.setAttribute('aria-label', 'Main navigation');

  // Section 0 = brand, 1 = primary nav, 2 = secondary links, 3 = search, 4 = locale.
  const [brandEl, primaryEl, secondaryEl, searchEl, localeEl] = sections;

  // Brand
  const brand = document.createElement('div');
  brand.className = 'nav-brand';
  if (brandEl) {
    while (brandEl.firstChild) brand.append(brandEl.firstChild);
  }

  // Primary nav (megamenu)
  const primary = document.createElement('div');
  primary.className = 'nav-sections';
  if (primaryEl) {
    while (primaryEl.firstChild) primary.append(primaryEl.firstChild);
    buildPrimaryNav(primary, nav);
  }

  // Secondary links (utility row below / inside drawer)
  const secondary = document.createElement('div');
  secondary.className = 'nav-secondary';
  if (secondaryEl) {
    const list = secondaryEl.querySelector(':scope > ul');
    if (list) {
      list.classList.add('nav-secondary-list');
      secondary.append(list);
    }
  }

  // Tools: search + locale
  const tools = document.createElement('div');
  tools.className = 'nav-tools';
  if (searchEl) tools.append(buildSearch(searchEl, nav));
  if (localeEl) tools.append(buildLocale(localeEl, nav));

  // Hamburger (mobile) — full behavior implemented in mobile phase.
  const hamburger = document.createElement('div');
  hamburger.className = 'nav-hamburger';
  hamburger.innerHTML = '<button type="button" aria-controls="nav" aria-label="Open navigation">'
    + '<span class="nav-hamburger-icon"></span></button>';
  hamburger.querySelector('button').addEventListener('click', () => {
    const open = nav.getAttribute('aria-expanded') === 'true';
    nav.setAttribute('aria-expanded', open ? 'false' : 'true');
  });

  nav.append(hamburger, brand, primary, tools, secondary);
  nav.setAttribute('aria-expanded', 'false');

  const navWrapper = document.createElement('div');
  navWrapper.className = 'nav-wrapper';
  navWrapper.append(nav);
  block.append(navWrapper);

  // Close panels / overlays on outside click and on Escape.
  document.addEventListener('click', (e) => {
    if (!nav.contains(e.target)) {
      closeAllPanels(nav);
      nav.querySelectorAll('.nav-search-toggle, .nav-locale-toggle').forEach((t) => t.setAttribute('aria-expanded', 'false'));
      nav.querySelectorAll('.nav-search-overlay, .nav-locale-overlay').forEach((o) => o.classList.remove('is-open'));
    }
  });
  document.addEventListener('keydown', (e) => {
    if (e.code === 'Escape') {
      closeAllPanels(nav);
      nav.querySelectorAll('.nav-search-toggle, .nav-locale-toggle').forEach((t) => t.setAttribute('aria-expanded', 'false'));
      nav.querySelectorAll('.nav-search-overlay, .nav-locale-overlay').forEach((o) => o.classList.remove('is-open'));
    }
  });

  // Viewport resize handling: close everything when crossing desktop/mobile.
  isDesktop.addEventListener('change', () => {
    closeAllPanels(nav);
    nav.setAttribute('aria-expanded', 'false');
    nav.querySelectorAll('.nav-search-overlay, .nav-locale-overlay').forEach((o) => o.classList.remove('is-open'));
    nav.querySelectorAll('.nav-search-toggle, .nav-locale-toggle').forEach((t) => t.setAttribute('aria-expanded', 'false'));
  });
}
