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

  // tools/importer/import-about-us.js
  var import_about_us_exports = {};
  __export(import_about_us_exports, {
    default: () => import_about_us_default
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

  // tools/importer/parsers/columns-media.js
  function parse2(element, { document }) {
    const mediaBox = element.querySelector('.extended-image-box, [class*="image-box"]');
    const video = element.querySelector("video");
    const leftCell = [];
    if (video) {
      const posterUrl = video.getAttribute("poster");
      const source = video.querySelector("source");
      const videoUrl = source ? source.getAttribute("src") : video.getAttribute("src") || "";
      if (posterUrl) {
        const poster = document.createElement("img");
        poster.src = posterUrl;
        poster.alt = "";
        leftCell.push(poster);
      }
      if (videoUrl) {
        const link = document.createElement("a");
        link.href = videoUrl;
        link.textContent = videoUrl;
        leftCell.push(link);
      }
      if (leftCell.length === 0) leftCell.push(video);
    } else if (mediaBox) {
      leftCell.push(mediaBox);
    }
    const textBox = element.querySelector('.text-box, [class*="text-box"]');
    const subhead = element.querySelector('.optional-subhead, [class*="subhead"]');
    const description = element.querySelector('.text-box-description, [class*="text-box-description"]');
    const rightCell = [];
    if (subhead) rightCell.push(subhead);
    if (description) rightCell.push(description);
    if (rightCell.length === 0 && textBox) rightCell.push(textBox);
    const cells = [
      [leftCell, rightCell]
    ];
    const block = WebImporter.Blocks.createBlock(document, { name: "columns-media", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/quote-portrait.js
  function parse3(element, { document }) {
    const textBox = element.querySelector(".text-box.blue") || element.querySelector(".text-box-description") || element;
    let quotation = textBox.querySelector("h4.optional-headline, .optional-headline");
    const quoteSpan = textBox.querySelector("p > span.quote, span.quote");
    if (!quotation && quoteSpan) {
      quotation = quoteSpan.closest("p") || quoteSpan;
    }
    if (!quotation) {
      quotation = textBox.querySelector("h2, h3, h4, h5, p");
    }
    let attribution = null;
    const attrCandidates = Array.from(textBox.querySelectorAll("p"));
    attribution = attrCandidates.find((p) => p !== quotation && p.querySelector("a")) || attrCandidates.find((p) => p !== quotation && !p.querySelector("span.quote")) || null;
    const cells = [];
    const quotationCell = document.createDocumentFragment();
    quotationCell.appendChild(document.createComment(" field:quotation "));
    if (quotation) quotationCell.appendChild(quotation);
    cells.push([quotationCell]);
    const attributionCell = document.createDocumentFragment();
    attributionCell.appendChild(document.createComment(" field:attribution "));
    if (attribution) attributionCell.appendChild(attribution);
    cells.push([attributionCell]);
    const block = WebImporter.Blocks.createBlock(document, { name: "quote-portrait", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/carousel-awards.js
  function parse4(element, { document }) {
    let tiles = Array.from(element.querySelectorAll(".award-section"));
    if (!tiles.length) {
      tiles = Array.from(element.querySelectorAll(".awardbox"));
    }
    if (!tiles.length) {
      tiles = Array.from(element.querySelectorAll(":scope > div"));
    }
    const cells = [];
    tiles.forEach((tile) => {
      const imageCell = document.createElement("div");
      const title = tile.querySelector('.award-text, [class*="text"]');
      const source = tile.querySelector('.award-source, [class*="source"]');
      const contentFragment = document.createDocumentFragment();
      contentFragment.appendChild(document.createComment(" field:content_text "));
      if (title) {
        const titleEl = document.createElement("h3");
        titleEl.textContent = title.textContent.trim();
        contentFragment.appendChild(titleEl);
      }
      if (source) {
        const sourceEl = document.createElement("p");
        sourceEl.textContent = source.textContent.trim();
        contentFragment.appendChild(sourceEl);
      }
      const contentCell = document.createElement("div");
      contentCell.appendChild(contentFragment);
      cells.push([imageCell, contentCell]);
    });
    const block = WebImporter.Blocks.createBlock(document, { name: "carousel-awards", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/cards-people.js
  function parse5(element, { document }) {
    let cards = Array.from(element.querySelectorAll('a.contact-card, a[href*="/people/"]')).filter((a) => a.querySelector("img") || a.querySelector(".contact-name"));
    cards = cards.filter((a) => !cards.some((other) => other !== a && other.contains(a)));
    if (cards.length === 0) {
      return;
    }
    const cells = [];
    cards.forEach((card) => {
      const img = card.querySelector("img");
      const imageCell = document.createElement("div");
      if (img) {
        imageCell.appendChild(document.createComment(" field:image "));
        imageCell.appendChild(img);
      }
      const href = card.getAttribute("href");
      const nameEl = card.querySelector(".contact-name");
      const roleEl = card.querySelector(".bottomtext");
      const textCell = document.createElement("div");
      textCell.appendChild(document.createComment(" field:text "));
      if (nameEl) {
        const nameP = document.createElement("p");
        const nameText = nameEl.textContent.trim();
        if (href) {
          const a = document.createElement("a");
          a.setAttribute("href", href);
          a.textContent = nameText;
          nameP.appendChild(a);
        } else {
          nameP.textContent = nameText;
        }
        textCell.appendChild(nameP);
      }
      if (roleEl) {
        const html = roleEl.innerHTML;
        const lines = html.split(/<br\s*\/?>/i).map((line) => {
          const tmp = document.createElement("div");
          tmp.innerHTML = line;
          return tmp.textContent.trim();
        }).filter((line) => line.length > 0);
        lines.forEach((line) => {
          const p = document.createElement("p");
          p.textContent = line;
          textCell.appendChild(p);
        });
      }
      cells.push([imageCell, textCell]);
    });
    const block = WebImporter.Blocks.createBlock(document, { name: "cards-people", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/columns-cta.js
  function parse6(element, { document }) {
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

  // tools/importer/import-about-us.js
  var parsers = {
    "hero-article": parse,
    "columns-media": parse2,
    "quote-portrait": parse3,
    "carousel-awards": parse4,
    "cards-people": parse5,
    "columns-cta": parse6
  };
  var transformers = [
    transform
  ];
  var PAGE_TEMPLATE = {
    name: "about-us",
    description: "DLA Piper About Us page - firm overview, mission, values, and key information sections",
    urls: [
      "https://www.dlapiper.com/en-us/about-us"
    ],
    blocks: [
      {
        name: "hero-article",
        instances: [".hero-component"]
      },
      {
        name: "columns-media",
        instances: [".image-text-component:has(video)"]
      },
      {
        name: "quote-portrait",
        instances: [".image-text-component:has(.text-box.blue)"]
      },
      {
        name: "carousel-awards",
        instances: [".multimedia-highlight-component"]
      },
      {
        name: "cards-people",
        instances: [".contact-list"]
      },
      {
        name: "columns-cta",
        instances: [".feature-cta-component"]
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
    const seen = /* @__PURE__ */ new Set();
    template.blocks.forEach((blockDef) => {
      blockDef.instances.forEach((selector) => {
        const elements = document.querySelectorAll(selector);
        if (elements.length === 0) {
          console.warn(`Block "${blockDef.name}" selector not found: ${selector}`);
        }
        elements.forEach((element) => {
          if (seen.has(element)) return;
          seen.add(element);
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
  var import_about_us_default = {
    transform: (payload) => {
      const {
        document,
        url,
        html,
        params
      } = payload;
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
  return __toCommonJS(import_about_us_exports);
})();
