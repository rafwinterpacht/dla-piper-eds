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

  // tools/importer/import-insights-publication.js
  var import_insights_publication_exports = {};
  __export(import_insights_publication_exports, {
    default: () => import_insights_publication_default
  });

  // tools/importer/parsers/hero-article.js
  function parse(element, { document }) {
    const image = element.querySelector(".editorial-hero-image img.hero-img, .editorial-hero-image img, .hero-img-wrapper img, img");
    const textContent = [];
    const dateEl = element.querySelector(".tag-section p, .tag-section span, .tag-section");
    if (dateEl) {
      const dateText = dateEl.textContent.replace(/\s+/g, " ").trim();
      if (dateText) {
        const p = document.createElement("p");
        p.textContent = dateText;
        textContent.push(p);
      }
    }
    const heading = element.querySelector(".hero-title-section h1.title, .hero-title-section h1, h1");
    if (heading) {
      const h1 = document.createElement("h1");
      h1.append(...heading.cloneNode(true).childNodes);
      if (h1.textContent.trim()) textContent.push(h1);
    }
    const cells = [];
    if (image) {
      const imageCell = document.createDocumentFragment();
      imageCell.appendChild(document.createComment(" field:image "));
      imageCell.appendChild(image.cloneNode(true));
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
    const block = WebImporter.Blocks.createBlock(document, { name: "hero-article", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/cards-insights.js
  function parse2(element, { document }) {
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

  // tools/importer/import-insights-publication.js
  var parsers = {
    "hero-article": parse,
    "cards-insights": parse2
  };
  var transformers = [
    transform
  ];
  var PAGE_TEMPLATE = {
    name: "insights-publication",
    description: "Insights/publication article page with article header (title, date, authors), rich-text body, and related content",
    urls: [
      "https://www.dlapiper.com/en-us/insights/publications/2026/05/doj-and-cftc-criminal-and-civil-insider-trading-charges"
    ],
    blocks: [
      {
        name: "hero-article",
        instances: [".hero-component"]
      },
      {
        name: "cards-insights",
        instances: [".tertiary-content-component"]
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
  var import_insights_publication_default = {
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
  return __toCommonJS(import_insights_publication_exports);
})();
