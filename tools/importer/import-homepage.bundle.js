/* eslint-disable */
var CustomImportScript = (() => {
  var __defProp = Object.defineProperty;
  var __defProps = Object.defineProperties;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropDescs = Object.getOwnPropertyDescriptors;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __getOwnPropSymbols = Object.getOwnPropertySymbols;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __propIsEnum = Object.prototype.propertyIsEnumerable;
  var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
  var __spreadValues = (a, b) => {
    for (var prop in b || (b = {}))
      if (__hasOwnProp.call(b, prop))
        __defNormalProp(a, prop, b[prop]);
    if (__getOwnPropSymbols)
      for (var prop of __getOwnPropSymbols(b)) {
        if (__propIsEnum.call(b, prop))
          __defNormalProp(a, prop, b[prop]);
      }
    return a;
  };
  var __spreadProps = (a, b) => __defProps(a, __getOwnPropDescs(b));
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

  // tools/importer/import-homepage.js
  var import_homepage_exports = {};
  __export(import_homepage_exports, {
    default: () => import_homepage_default
  });

  // tools/importer/parsers/hero-banner.js
  function parse(element, { document }) {
    const heroCardRow = element.querySelector(".hero-card-row");
    let bgImage = element.querySelector(".hero-bg-wrapper .hero-bg-img.active");
    if (!bgImage) {
      const allBg = element.querySelectorAll(".hero-bg-wrapper .hero-bg-img");
      if (allBg.length) bgImage = allBg[allBg.length - 1];
    }
    const content = element.querySelector(".hero-banner-content");
    const textContent = [];
    if (content) {
      const heading = content.querySelector("h1.heading, h1");
      if (heading) {
        const h1 = document.createElement("h1");
        const innerSpan = heading.querySelector(":scope > span");
        if (innerSpan && heading.children.length === 1) {
          h1.append(...innerSpan.cloneNode(true).childNodes);
        } else {
          h1.append(...heading.cloneNode(true).childNodes);
        }
        if (h1.textContent.trim()) textContent.push(h1);
      }
      const paras = content.querySelectorAll(".sub-heading p");
      paras.forEach((para) => {
        const p = para.cloneNode(true);
        if (p.textContent.trim()) textContent.push(p);
      });
      const cta = content.querySelector("a.banner-CTA, a.btn, a");
      if (cta) {
        const a = document.createElement("a");
        a.setAttribute("href", cta.getAttribute("href") || "");
        a.textContent = cta.textContent.replace(/\s+/g, " ").trim();
        if (a.textContent) {
          const p = document.createElement("p");
          p.appendChild(a);
          textContent.push(p);
        }
      }
    }
    const cells = [];
    if (bgImage) {
      const imageCell = document.createDocumentFragment();
      imageCell.appendChild(document.createComment(" field:image "));
      imageCell.appendChild(bgImage.cloneNode(true));
      cells.push([imageCell]);
    } else {
      cells.push([""]);
    }
    if (textContent.length) {
      const textCell = document.createDocumentFragment();
      textCell.appendChild(document.createComment(" field:text "));
      textContent.forEach((node) => textCell.appendChild(node));
      cells.push([textCell]);
    } else {
      cells.push([""]);
    }
    const block = WebImporter.Blocks.createBlock(document, { name: "hero-banner", cells });
    if (heroCardRow) {
      element.replaceWith(block, heroCardRow);
    } else {
      element.replaceWith(block);
    }
  }

  // tools/importer/parsers/cards-promo.js
  function parse2(element, { document }) {
    const cards = Array.from(element.querySelectorAll(":scope > .hero-card"));
    const cells = [];
    cards.forEach((card) => {
      const content = card.querySelector(".card.card-custom, .card-custom, .card") || card;
      const eyebrow = content.querySelector("small.hero-card-type, .hero-card-type");
      const headline = content.querySelector("h2.hero-card-description, .hero-card-description, h2, h3");
      const cta = content.querySelector('a.hero-card-CTA, a[class*="CTA"], a[class*="cta"], a');
      const textCell = document.createDocumentFragment();
      textCell.appendChild(document.createComment(" field:text "));
      if (eyebrow) textCell.appendChild(eyebrow);
      if (headline) textCell.appendChild(headline);
      if (cta) {
        const cleaned = (cta.textContent || "").replace(/\s*[→➜➡➔>›»]+\s*$/u, "").trim();
        if (cleaned) cta.textContent = cleaned;
        textCell.appendChild(cta);
      }
      cells.push([textCell]);
    });
    const block = WebImporter.Blocks.createBlock(document, { name: "cards-promo", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/cards-insights.js
  function parse3(element, { document }) {
    const cards = Array.from(
      element.querySelectorAll("a.card, .card-img")
    ).map((el) => el.matches("a.card") ? el : el.closest("a")).filter((el, idx, arr) => el && arr.indexOf(el) === idx);
    const cells = [];
    cards.forEach((card) => {
      const img = card.querySelector("img.card-img, .image-wrapper img, img");
      const imageCell = document.createDocumentFragment();
      imageCell.appendChild(document.createComment(" field:image "));
      if (img) imageCell.appendChild(img);
      const href = card.getAttribute("href");
      const category = card.querySelector(".category");
      const headline = card.querySelector(".description, .card-content .description, p.description");
      const date = card.querySelector(".date, .card-content .date, p.date");
      const body = href ? document.createElement("a") : document.createElement("div");
      if (href) body.setAttribute("href", href);
      if (category) body.appendChild(category);
      if (headline) body.appendChild(headline);
      if (date) body.appendChild(date);
      const textCell = document.createDocumentFragment();
      textCell.appendChild(document.createComment(" field:text "));
      textCell.appendChild(body);
      cells.push([imageCell, textCell]);
    });
    const block = WebImporter.Blocks.createBlock(document, { name: "cards-insights", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/columns-cta.js
  function parse4(element, { document }) {
    let anchors = Array.from(element.querySelectorAll(".cta-container a.cta-with-arrow"));
    if (anchors.length === 0) {
      anchors = Array.from(element.querySelectorAll("a.cta-with-arrow, .cta-container a, a[href]"));
    }
    const columnCells = anchors.map((anchor) => {
      const href = anchor.getAttribute("href") || "";
      const text = anchor.textContent.replace(/\s+/g, " ").trim();
      const a = document.createElement("a");
      a.setAttribute("href", href);
      a.textContent = text;
      return a;
    });
    const cells = [columnCells];
    const block = WebImporter.Blocks.createBlock(document, { name: "columns-cta", cells });
    element.replaceWith(block);
  }

  // tools/importer/transformers/dlapiper-cleanup.js
  var TransformHook = { beforeTransform: "beforeTransform", afterTransform: "afterTransform" };
  function transform(hookName, element, payload) {
    if (hookName === TransformHook.beforeTransform) {
      WebImporter.DOMUtils.remove(element, [
        "#onetrust-consent-sdk",
        "#onetrust-banner-sdk",
        ".ot-sdk-container",
        ".cookie-banner",
        '[class*="cookie"]',
        ".floating-button-component",
        ".share-component",
        ".anchor-nav-component",
        'img[src*="rlcdn.com"]',
        'iframe[src*="rlcdn.com"]'
      ]);
    }
    if (hookName === TransformHook.afterTransform) {
      WebImporter.DOMUtils.remove(element, [
        "header",
        "footer",
        "nav",
        ".relatedCountries",
        ".campaignName",
        ".share-component",
        ".anchor-nav-component",
        ".floating-button-component",
        "iframe",
        "noscript",
        "link",
        "script",
        "style",
        "source"
      ]);
      element.querySelectorAll("*").forEach((el) => {
        el.removeAttribute("onclick");
        el.removeAttribute("data-track");
        el.removeAttribute("data-tracking");
      });
    }
  }

  // tools/importer/import-homepage.js
  var parsers = {
    "hero-banner": parse,
    "cards-promo": parse2,
    "cards-insights": parse3,
    "columns-cta": parse4
  };
  var transformers = [
    transform
  ];
  var PAGE_TEMPLATE = {
    name: "homepage",
    description: "DLA Piper homepage with hero, featured insights/news, capabilities, and promotional sections",
    urls: [
      "https://www.dlapiper.com/en-us"
    ],
    blocks: [
      {
        name: "hero-banner",
        instances: [".hero-card-container"]
      },
      {
        name: "cards-promo",
        instances: [".hero-card-row"]
      },
      {
        name: "cards-insights",
        instances: [".tertiary-content-component"]
      },
      {
        name: "columns-cta",
        instances: [".feature-cta-component"],
        section: "accent-olive"
      }
    ]
  };
  function executeTransformers(hookName, element, payload) {
    const enhancedPayload = __spreadProps(__spreadValues({}, payload), {
      template: PAGE_TEMPLATE
    });
    transformers.forEach((transformerFn) => {
      try {
        transformerFn.call(null, hookName, element, enhancedPayload);
      } catch (e) {
        console.error(`Transformer failed at ${hookName}:`, e);
      }
    });
  }
  function findBlocksOnPage(document, template) {
    const pageBlocks = [];
    template.blocks.forEach((blockDef) => {
      blockDef.instances.forEach((selector) => {
        const elements = document.querySelectorAll(selector);
        if (elements.length === 0) {
          console.warn(`Block "${blockDef.name}" selector not found: ${selector}`);
        }
        elements.forEach((element) => {
          pageBlocks.push({
            name: blockDef.name,
            selector,
            element,
            section: blockDef.section || null
          });
        });
      });
    });
    console.log(`Found ${pageBlocks.length} block instances on page`);
    return pageBlocks;
  }
  var import_homepage_default = {
    transform: (payload) => {
      const { document, url, params } = payload;
      const main = document.body;
      executeTransformers("beforeTransform", main, payload);
      const pageBlocks = findBlocksOnPage(document, PAGE_TEMPLATE);
      pageBlocks.forEach((block) => {
        const parser = parsers[block.name];
        if (parser) {
          try {
            parser(block.element, { document, url, params });
          } catch (e) {
            console.error(`Failed to parse ${block.name} (${block.selector}):`, e);
          }
        } else {
          console.warn(`No parser found for block: ${block.name}`);
        }
      });
      executeTransformers("afterTransform", main, payload);
      const hr = document.createElement("hr");
      main.appendChild(hr);
      WebImporter.rules.createMetadata(main, document);
      WebImporter.rules.transformBackgroundImages(main, document);
      WebImporter.rules.adjustImageUrls(main, url, params.originalURL);
      const path = WebImporter.FileUtils.sanitizePath(
        new URL(params.originalURL).pathname.replace(/\/$/, "").replace(/\.html$/, "")
      );
      return [{
        element: main,
        path,
        report: {
          title: document.title,
          template: PAGE_TEMPLATE.name,
          blocks: pageBlocks.map((b) => b.name)
        }
      }];
    }
  };
  return __toCommonJS(import_homepage_exports);
})();
