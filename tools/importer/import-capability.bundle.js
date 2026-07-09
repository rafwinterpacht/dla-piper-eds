var CustomImportScript = (() => {
  var __defProp = Object.defineProperty;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
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

  // tools/importer/import-capability.js
  var import_capability_exports = {};
  __export(import_capability_exports, {
    default: () => import_capability_default
  });

  // tools/importer/parsers/anchornav.js
  function parse(element, { document }) {
    let links = Array.from(element.querySelectorAll(".anchor-nav-desktop .anchor-nav-list a[href]"));
    if (!links.length) {
      links = Array.from(element.querySelectorAll(".anchor-nav-list a[href]"));
    }
    if (!links.length) {
      links = Array.from(element.querySelectorAll('a[href^="#"]'));
    }
    if (!links.length) {
      return;
    }
    const cells = [];
    links.forEach((link) => {
      const label = link.textContent.trim();
      const anchor = (link.getAttribute("href") || "").trim();
      if (!label || !anchor) return;
      const labelCell = document.createElement("div");
      labelCell.appendChild(document.createComment(" field:label "));
      const labelP = document.createElement("p");
      labelP.textContent = label;
      labelCell.appendChild(labelP);
      const anchorCell = document.createElement("div");
      anchorCell.appendChild(document.createComment(" field:anchor "));
      const anchorP = document.createElement("p");
      anchorP.textContent = anchor;
      anchorCell.appendChild(anchorP);
      cells.push([labelCell, anchorCell]);
    });
    if (!cells.length) {
      return;
    }
    const block = WebImporter.Blocks.createBlock(document, { name: "anchornav", cells });
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

  // tools/importer/parsers/quote-profile.js
  function parse3(element, { document }) {
    const quote = element.querySelector('.quote, .article-quote, blockquote, [class*="quote-text"] > div:first-child');
    const attribution = element.querySelector('.attribution, .author, cite, [class*="attribution"]');
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
  function parse4(element, { document }) {
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

  // tools/importer/parsers/cards-topics.js
  function parse5(element, { document }) {
    let pills = Array.from(element.querySelectorAll(".related-capability-section a[href], a.topic-box"));
    if (!pills.length) {
      pills = Array.from(element.querySelectorAll("a[href]"));
    }
    if (!pills.length) {
      return;
    }
    const cells = [];
    pills.forEach((pill) => {
      const href = pill.getAttribute("href");
      const text = pill.textContent.trim();
      if (!href || !text) return;
      const cell = document.createElement("div");
      cell.appendChild(document.createComment(" field:link "));
      const a = document.createElement("a");
      a.setAttribute("href", href);
      a.textContent = text;
      cell.appendChild(a);
      cells.push([cell]);
    });
    if (!cells.length) {
      return;
    }
    const block = WebImporter.Blocks.createBlock(document, { name: "cards-topics", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/cards-deals.js
  function parse6(element, { document }) {
    const tiles = Array.from(element.querySelectorAll(".deal-details"));
    if (!tiles.length) {
      return;
    }
    const cells = [];
    tiles.forEach((tile) => {
      const tagEl = tile.querySelector(".deal-tag");
      const tagCell = document.createElement("div");
      tagCell.appendChild(document.createComment(" field:tag "));
      if (tagEl) {
        const tagP = document.createElement("p");
        tagP.textContent = tagEl.textContent.trim();
        tagCell.appendChild(tagP);
      }
      const bodyCell = document.createElement("div");
      bodyCell.appendChild(document.createComment(" field:body "));
      const dealEl = tile.querySelector(".deal, h4.deal");
      const company = tile.querySelector(".deal-company");
      if (company) {
        const h = document.createElement("h4");
        h.textContent = company.textContent.trim();
        bodyCell.appendChild(h);
      }
      if (dealEl) {
        const clone = dealEl.cloneNode(true);
        const companyClone = clone.querySelector(".deal-company");
        if (companyClone) companyClone.remove();
        const lines = clone.innerHTML.split(/<br\s*\/?>/i).map((line) => {
          const tmp = document.createElement("div");
          tmp.innerHTML = line;
          return tmp.textContent.trim();
        }).filter((line) => line.length > 0);
        lines.forEach((line) => {
          const p = document.createElement("p");
          p.textContent = line;
          bodyCell.appendChild(p);
        });
      }
      const dateEl = tile.querySelector(".deal-date");
      if (dateEl) {
        const dateP = document.createElement("p");
        dateP.textContent = dateEl.textContent.trim();
        bodyCell.appendChild(dateP);
      }
      cells.push([tagCell, bodyCell]);
    });
    const block = WebImporter.Blocks.createBlock(document, { name: "cards-deals", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/carousel-awards.js
  function parse7(element, { document }) {
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
  function parse8(element, { document }) {
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
  function parse9(element, { document }) {
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

  // tools/importer/import-capability.js
  var parsers = {
    "anchornav": parse,
    "columns-media": parse2,
    "quote-profile": parse3,
    "cards-insights": parse4,
    "cards-topics": parse5,
    "cards-deals": parse6,
    "carousel-awards": parse7,
    "cards-people": parse8,
    "columns-cta": parse9
  };
  var transformers = [
    transform
  ];
  var PAGE_TEMPLATE = {
    name: "capability",
    description: "Capability / practice-area page with sticky anchor nav, image+text intro panels, pull quote, resource/event/insight card rows, related-capability pills, deal tiles, awards carousel, contacts card, and a meet-the-team CTA",
    urls: [
      "https://www.dlapiper.com/en-us/capabilities/practice-area/corporate/capital-markets-and-public-company-advisory"
    ],
    blocks: [
      { name: "anchornav", instances: [".anchor-nav-component"] },
      { name: "columns-media", instances: [".image-text-component"] },
      { name: "quote-profile", instances: [".article-quote-component"] },
      { name: "cards-insights", instances: [".gallery-container", ".tertiary-content-component"] },
      { name: "cards-topics", instances: [".related-capability-component"] },
      { name: "cards-deals", instances: [".deal-row"] },
      { name: "carousel-awards", instances: [".multimedia-highlight-component"] },
      { name: "cards-people", instances: [".dla-contacts .contact-list"] },
      { name: "columns-cta", instances: [".feature-cta-component"] }
    ]
  };
  function executeTransformers(hookName, element, payload) {
    const enhancedPayload = {
      ...payload,
      template: PAGE_TEMPLATE
    };
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
  var import_capability_default = {
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
  return __toCommonJS(import_capability_exports);
})();
