/* eslint-disable */
/* global WebImporter */

// PARSER IMPORTS
import heroProfileParser from './parsers/hero-profile.js';
import quoteProfileParser from './parsers/quote-profile.js';
import cardsInsightsParser from './parsers/cards-insights.js';
import columnsContactParser from './parsers/columns-contact.js';

// TRANSFORMER IMPORTS
import dlapiperCleanupTransformer from './transformers/dlapiper-cleanup.js';

// PARSER REGISTRY
const parsers = {
  'hero-profile': heroProfileParser,
  'quote-profile': quoteProfileParser,
  'cards-insights': cardsInsightsParser,
  'columns-contact': columnsContactParser,
};

// TRANSFORMER REGISTRY
const transformers = [
  dlapiperCleanupTransformer,
];

// PAGE TEMPLATE CONFIGURATION - Embedded from page-templates.json
const PAGE_TEMPLATE = {
  name: 'person-profile',
  description: 'Attorney/person profile page with bio, contact card, practice areas, credentials, and related content',
  urls: [
    'https://www.dlapiper.com/en-us/people/r/ryan-frank-w',
  ],
  blocks: [
    {
      name: 'hero-profile',
      instances: ['.people-profile-component'],
    },
    {
      name: 'quote-profile',
      instances: ['.quote-component'],
    },
    {
      name: 'cards-insights',
      instances: ['.tertiary-content-component'],
    },
    {
      name: 'columns-contact',
      instances: ['.profile-contact-component'],
    },
  ],
};

/**
 * Execute all page transformers for a specific hook
 */
function executeTransformers(hookName, element, payload) {
  const enhancedPayload = {
    ...payload,
    template: PAGE_TEMPLATE,
  };

  transformers.forEach((transformerFn) => {
    try {
      transformerFn.call(null, hookName, element, enhancedPayload);
    } catch (e) {
      console.error(`Transformer failed at ${hookName}:`, e);
    }
  });
}

/**
 * Find all blocks on the page based on the embedded template configuration
 */
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
          section: blockDef.section || null,
        });
      });
    });
  });

  console.log(`Found ${pageBlocks.length} block instances on page`);
  return pageBlocks;
}

// EXPORT DEFAULT CONFIGURATION
export default {
  transform: (payload) => {
    const { document, url, params } = payload;

    const main = document.body;

    // 1. beforeTransform cleanup
    executeTransformers('beforeTransform', main, payload);

    // 2. Find blocks on page
    const pageBlocks = findBlocksOnPage(document, PAGE_TEMPLATE);

    // 3. Parse each block
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

    // 4. afterTransform cleanup
    executeTransformers('afterTransform', main, payload);

    // 5. WebImporter built-in rules
    const hr = document.createElement('hr');
    main.appendChild(hr);
    WebImporter.rules.createMetadata(main, document);
    WebImporter.rules.transformBackgroundImages(main, document);
    WebImporter.rules.adjustImageUrls(main, url, params.originalURL);

    // 6. Generate sanitized path
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
