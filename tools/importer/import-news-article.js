/* eslint-disable */
/* global WebImporter */

// DA-CLEAN import script for the news-article page (authored in da.live).
// Uses the DA parser variants in ./da-parsers/ which emit block tables WITHOUT
// xwalk `<!-- field:* -->` hint comments. The shared block decorators
// (blocks/hero-article, blocks/columns-cta) render these by row position, so the
// same blocks work in both DA and Universal Editor — the mixed-mode demo.

// PARSER IMPORTS (DA-clean variants)
import heroArticleParser from './da-parsers/hero-article.js';
import columnsCtaParser from './da-parsers/columns-cta.js';

// TRANSFORMER IMPORTS
import dlapiperCleanupTransformer from './transformers/dlapiper-cleanup.js';

// PARSER REGISTRY
const parsers = {
  'hero-article': heroArticleParser,
  'columns-cta': columnsCtaParser,
};

// TRANSFORMER REGISTRY
const transformers = [
  dlapiperCleanupTransformer,
];

// PAGE TEMPLATE CONFIGURATION
const PAGE_TEMPLATE = {
  name: 'news-article',
  description: 'DLA Piper news article (da.live-authored) — article hero, rich-text body, related professionals/capabilities, media-team CTA',
  urls: [
    'https://www.dlapiper.com/en-us/news/2025/12/dla-piper-wins-strategic-direction-honor-at-financial-times-innovative-lawyers-awards',
  ],
  blocks: [
    {
      name: 'hero-article',
      instances: ['.hero-component'],
    },
    {
      // Single "Contact our media team" CTA. The source wraps the link in an <h2>;
      // columns-cta flattens <a><h2></a> into a clean plain link (a heading inside a
      // link otherwise leaks as literal text).
      name: 'columns-cta',
      instances: ['.feature-cta-component'],
    },
  ],
};

function executeTransformers(hookName, element, payload) {
  const enhancedPayload = { ...payload, template: PAGE_TEMPLATE };
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

export default {
  transform: (payload) => {
    const { document, url, params } = payload;
    const main = document.body;

    executeTransformers('beforeTransform', main, payload);

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

    executeTransformers('afterTransform', main, payload);

    const hr = document.createElement('hr');
    main.appendChild(hr);
    WebImporter.rules.createMetadata(main, document);
    WebImporter.rules.transformBackgroundImages(main, document);
    WebImporter.rules.adjustImageUrls(main, url, params.originalURL);

    const path = WebImporter.FileUtils.sanitizePath(
      new URL(params.originalURL).pathname.replace(/\/$/, '').replace(/\.html$/, ''),
    );

    return [{
      element: main,
      path,
      report: {
        title: document.title,
        template: PAGE_TEMPLATE.name,
        blocks: pageBlocks.map((b) => b.name),
      },
    }];
  },
};
