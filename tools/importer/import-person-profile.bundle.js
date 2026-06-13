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

  // tools/importer/import-person-profile.js
  var import_person_profile_exports = {};
  __export(import_person_profile_exports, {
    default: () => import_person_profile_default
  });

  // tools/importer/parsers/hero-profile.js
  function parse(element, { document }) {
    var _a, _b, _c, _d;
    const image = element.querySelector(".left-section img, .left-section picture, img");
    const heading = element.querySelector(".name-details h1, .name-details .name, h1");
    const role = element.querySelector(".name-details .role");
    const designation = element.querySelector(".name-details .designation");
    const statement = element.querySelector(".quote-box .withoutQuotationMark, .quote-box");
    const toParagraph = (source) => {
      if (!source) return null;
      let inner = source;
      while (inner.children.length === 1 && inner.firstElementChild && (inner.firstElementChild.tagName === "DIV" || inner.firstElementChild.tagName === "SPAN")) {
        inner = inner.firstElementChild;
      }
      const p = document.createElement("p");
      p.append(...inner.childNodes);
      return p;
    };
    const textContent = [];
    if (heading) {
      const h1 = document.createElement("h1");
      h1.textContent = heading.textContent.replace(/\s+/g, " ").trim();
      textContent.push(h1);
    }
    const roleP = toParagraph(role);
    if (roleP && roleP.textContent.trim()) textContent.push(roleP);
    const designationP = toParagraph(designation);
    if (designationP && designationP.textContent.trim()) textContent.push(designationP);
    const statementP = toParagraph(statement);
    if (statementP && statementP.textContent.trim()) textContent.push(statementP);
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
    const block = WebImporter.Blocks.createBlock(document, { name: "hero-profile", cells });
    const defaultNodes = [];
    const makeHeading = (text) => {
      if (!text) return null;
      const h = document.createElement("h3");
      h.textContent = text.replace(/\s+/g, " ").trim();
      return h;
    };
    const makeLinkParagraph = (anchor) => {
      if (!anchor) return null;
      const p = document.createElement("p");
      const a = document.createElement("a");
      a.setAttribute("href", anchor.getAttribute("href") || "");
      a.textContent = anchor.textContent.replace(/\s+/g, " ").trim();
      p.appendChild(a);
      return p;
    };
    const emailA = element.querySelector(".email-and-phone .email a, .email-section .email a");
    const phoneA = element.querySelector(".email-and-phone .phone a, .phone-section .phone a");
    const regionA = element.querySelector(".people-info-section a.region, .people-info-section a");
    [emailA, phoneA, regionA].forEach((a) => {
      const p = makeLinkParagraph(a);
      if (p && p.textContent.trim()) defaultNodes.push(p);
    });
    const aboutSection = element.querySelector(".people-about-section");
    if (aboutSection) {
      const aboutHeading = makeHeading(((_a = aboutSection.querySelector(".label")) == null ? void 0 : _a.textContent) || "About");
      let paras = aboutSection.querySelectorAll(".showPrint p");
      if (!paras.length) paras = aboutSection.querySelectorAll(".lessCopy p");
      if (!paras.length) paras = aboutSection.querySelectorAll(".about-para p, p");
      if (paras.length) {
        defaultNodes.push(aboutHeading);
        paras.forEach((p) => {
          const np = document.createElement("p");
          np.append(...p.cloneNode(true).childNodes);
          if (np.textContent.trim()) defaultNodes.push(np);
        });
      }
    }
    const areaSection = element.querySelector(".area-focus-section");
    if (areaSection) {
      const links = areaSection.querySelectorAll("a.focus-area, a");
      if (links.length) {
        defaultNodes.push(makeHeading(((_b = areaSection.querySelector(".label")) == null ? void 0 : _b.textContent) || "Areas of Focus"));
        const ul = document.createElement("ul");
        links.forEach((link) => {
          const li = document.createElement("li");
          const a = document.createElement("a");
          a.setAttribute("href", link.getAttribute("href") || "");
          a.textContent = link.textContent.replace(/\s+/g, " ").trim();
          li.appendChild(a);
          ul.appendChild(li);
        });
        defaultNodes.push(ul);
      }
    }
    const barSection = element.querySelector(".bar-admission-section");
    if (barSection) {
      const value = (_c = barSection.querySelector(".area")) == null ? void 0 : _c.textContent.replace(/\s+/g, " ").trim();
      if (value) {
        defaultNodes.push(makeHeading(((_d = barSection.querySelector(".label")) == null ? void 0 : _d.textContent) || "Bar admissions"));
        const p = document.createElement("p");
        p.textContent = value;
        defaultNodes.push(p);
      }
    }
    element.replaceWith(block, ...defaultNodes);
  }

  // tools/importer/parsers/quote-profile.js
  function parse2(element, { document }) {
    const quote = element.querySelector('.quote, blockquote, [class*="quote-text"] > div:first-child');
    const attribution = element.querySelector('.attribution, cite, [class*="attribution"]');
    if (!quote || !quote.textContent.trim()) {
      element.remove();
      return;
    }
    const cells = [];
    const quotationCell = document.createDocumentFragment();
    quotationCell.appendChild(document.createComment(" field:quotation "));
    if (quote) {
      quotationCell.appendChild(quote);
    }
    cells.push([quotationCell]);
    const attributionCell = document.createDocumentFragment();
    attributionCell.appendChild(document.createComment(" field:attribution "));
    if (attribution) {
      attributionCell.appendChild(attribution);
    }
    cells.push([attributionCell]);
    const block = WebImporter.Blocks.createBlock(document, { name: "quote-profile", cells });
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

  // tools/importer/parsers/columns-contact.js
  function parse4(element, { document }) {
    const wrapper = element.closest(".component") || element.parentElement || element;
    const heading = wrapper.querySelector(".rich-text-header, h2");
    const order = [".email-block", ".phone-block", ".location-block", ".sayhello-block"];
    let columnBlocks = order.map((sel) => element.querySelector(sel)).filter((el) => el);
    if (columnBlocks.length === 0) {
      columnBlocks = Array.from(element.children);
    }
    const columnCells = columnBlocks.map((block2) => {
      const clone = block2.cloneNode(true);
      clone.querySelectorAll("svg, .rightarrowicon, .social-icon, .direction-text > svg").forEach((n) => n.remove());
      const cellContent = [];
      Array.from(clone.childNodes).forEach((node) => {
        if (node.nodeType === 3 && !node.textContent.trim()) return;
        cellContent.push(node);
      });
      return cellContent.length === 1 ? cellContent[0] : cellContent;
    });
    if (heading && columnCells.length > 0) {
      const h = document.createElement("h2");
      h.textContent = heading.textContent.replace(/\s+/g, " ").trim();
      const first = columnCells[0];
      columnCells[0] = Array.isArray(first) ? [h, ...first] : [h, first];
    }
    const cells = [columnCells];
    const block = WebImporter.Blocks.createBlock(document, { name: "columns-contact", cells });
    const target = wrapper !== element && wrapper.querySelector(".profile-contact-component") ? wrapper : element;
    target.replaceWith(block);
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

  // tools/importer/import-person-profile.js
  var parsers = {
    "hero-profile": parse,
    "quote-profile": parse2,
    "cards-insights": parse3,
    "columns-contact": parse4
  };
  var transformers = [
    transform
  ];
  var PAGE_TEMPLATE = {
    name: "person-profile",
    description: "Attorney/person profile page with bio, contact card, practice areas, credentials, and related content",
    urls: [
      "https://www.dlapiper.com/en-us/people/r/ryan-frank-w"
    ],
    blocks: [
      {
        name: "hero-profile",
        instances: [".people-profile-component"]
      },
      {
        name: "quote-profile",
        instances: [".quote-component"]
      },
      {
        name: "cards-insights",
        instances: [".tertiary-content-component"]
      },
      {
        name: "columns-contact",
        instances: [".profile-contact-component"]
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
  var import_person_profile_default = {
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
  return __toCommonJS(import_person_profile_exports);
})();
