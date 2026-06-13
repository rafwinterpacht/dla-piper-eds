/* eslint-disable */
/* global WebImporter */

// PARSER IMPORTS
import heroBannerParser from './parsers/hero-banner.js';
import columnsMediaParser from './parsers/columns-media.js';
import quotePortraitParser from './parsers/quote-portrait.js';
import carouselAwardsParser from './parsers/carousel-awards.js';
import cardsPeopleParser from './parsers/cards-people.js';

// TRANSFORMER IMPORTS
import dlapiperCleanupTransformer from './transformers/dlapiper-cleanup.js';

// PARSER REGISTRY
const parsers = {
  'hero-banner': heroBannerParser,
  'columns-media': columnsMediaParser,
  'quote-portrait': quotePortraitParser,
  'carousel-awards': carouselAwardsParser,
  'cards-people': cardsPeopleParser,
};

// TRANSFORMER REGISTRY
const transformers = [
  dlapiperCleanupTransformer,
];

// PAGE TEMPLATE CONFIGURATION - Embedded from page-templates.json
const PAGE_TEMPLATE = {
  name: 'about-us',
  description: 'DLA Piper About Us page - firm overview, mission, values, and key information sections',
  urls: [
    'https://www.dlapiper.com/en-us/about-us',
  ],
  blocks: [
    {
      name: 'hero-banner',
      instances: ['.hero-component'],
    },
    {
      name: 'columns-media',
      instances: ['.image-text-component:has(video)'],
    },
    {
      name: 'quote-portrait',
      instances: ['.image-text-component:has(.text-box.blue)'],
    },
    {
      name: 'carousel-awards',
      instances: ['.multimedia-highlight-component'],
    },
    {
      name: 'cards-people',
      instances: ['.contact-list'],
    },
  ],
  sections: [
    {
      id: 'closing-cta',
      name: 'Closing CTA band',
      selector: '.feature-cta-component',
      style: 'dark',
      blocks: [],
      defaultContent: ['.feature-cta-component .cta-with-arrow'],
    },
  ],
};

/**
 * Execute all page transformers for a specific hook
 * @param {string} hookName - The hook name ('beforeTransform' or 'afterTransform')
 * @param {Element} element - The DOM element to transform
 * @param {Object} payload - The payload containing { document, url, html, params }
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
 * @param {Document} document - The DOM document
 * @param {Object} template - The embedded PAGE_TEMPLATE object
 * @returns {Array} Array of block instances found on the page
 */
function findBlocksOnPage(document, template) {
  const pageBlocks = [];
  const seen = new Set();

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
    const {
      document, url, html, params,
    } = payload;

    const main = document.body;

    // 1. Execute beforeTransform transformers (initial cleanup)
    executeTransformers('beforeTransform', main, payload);

    // 2. Find blocks on page using embedded template
    const pageBlocks = findBlocksOnPage(document, PAGE_TEMPLATE);

    // 3. Parse each block using registered parsers
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

    // 4. Execute afterTransform transformers (final cleanup)
    executeTransformers('afterTransform', main, payload);

    // 5. Apply WebImporter built-in rules
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
