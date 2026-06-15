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

  // tools/importer/import-news-article.js
  var import_news_article_exports = {};
  __export(import_news_article_exports, {
    default: () => import_news_article_default
  });

  // tools/importer/da-parsers/hero-article.js
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
    const subtitle = element.querySelector(".hero-title-section .subtitle, .subtitle");
    if (subtitle) {
      const subText = subtitle.textContent.replace(/\s+/g, " ").trim();
      if (subText) {
        const p = document.createElement("p");
        p.textContent = subText;
        textContent.push(p);
      }
    }
    const cells = [];
    cells.push([image ? image.cloneNode(true) : ""]);
    cells.push([textContent.length ? textContent : ""]);
    const block = WebImporter.Blocks.createBlock(document, { name: "hero-article", cells });
    element.replaceWith(block);
  }

  // tools/importer/da-parsers/columns-cta.js
  function parse2(element, { document }) {
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

  // tools/importer/import-news-article.js
  var parsers = {
    "hero-article": parse,
    "columns-cta": parse2
  };
  var transformers = [
    transform
  ];
  var PAGE_TEMPLATE = {
    name: "news-article",
    description: "DLA Piper news article (da.live-authored) \u2014 article hero, rich-text body, related professionals/capabilities, media-team CTA",
    urls: [
      "https://www.dlapiper.com/en-us/news/2025/12/dla-piper-wins-strategic-direction-honor-at-financial-times-innovative-lawyers-awards"
    ],
    blocks: [
      {
        name: "hero-article",
        instances: [".hero-component"]
      },
      {
        // Single "Contact our media team" CTA. The source wraps the link in an <h2>;
        // columns-cta flattens <a><h2></a> into a clean plain link (a heading inside a
        // link otherwise leaks as literal text).
        name: "columns-cta",
        instances: [".feature-cta-component"]
      }
    ]
  };
  function executeTransformers(hookName, element, payload) {
    const enhancedPayload = __spreadProps(__spreadValues({}, payload), { template: PAGE_TEMPLATE });
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
          pageBlocks.push({ name: blockDef.name, selector, element });
        });
      });
    });
    console.log(`Found ${pageBlocks.length} block instances on page`);
    return pageBlocks;
  }
  var import_news_article_default = {
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
  return __toCommonJS(import_news_article_exports);
})();
