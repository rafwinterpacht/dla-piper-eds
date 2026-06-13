/* eslint-disable */
/* global WebImporter */
/**
 * Parser for quote-portrait.
 * Base block: quote
 * Source: https://www.dlapiper.com/en-us/about-us
 * Generated for xwalk project.
 *
 * UE model (blocks/quote-portrait/_quote-portrait.json) defines two richtext fields:
 *   - quotation   (the pull-quote text)
 *   - attribution (linked name + role)
 * => simple block: 2 rows, one per field, each with a field hint.
 *
 * Source instances vary:
 *   1) quote text in <h4 class="optional-headline">, attribution in following <p>
 *   2) quote text in <p><span class="quote">...</span></p> inside .text-box-description
 * Both shapes are handled below.
 *
 * Note: the portrait image (.extended-image-box img) is intentionally not emitted —
 * the block model has no image field and quote-portrait.js only reads the quotation
 * and attribution children. The dark "text-box blue" is the quote/attribution carrier.
 */
export default function parse(element, { document }) {
  // The text carrier is the nested dark ".text-box.blue"; fall back to the element itself.
  const textBox = element.querySelector('.text-box.blue')
    || element.querySelector('.text-box-description')
    || element;

  // Quotation: shape 1 = h4.optional-headline; shape 2 = p > span.quote.
  let quotation = textBox.querySelector('h4.optional-headline, .optional-headline');
  const quoteSpan = textBox.querySelector('p > span.quote, span.quote');
  if (!quotation && quoteSpan) {
    // Use the wrapping <p> if available so we keep a block-level element for the cell.
    quotation = quoteSpan.closest('p') || quoteSpan;
  }
  if (!quotation) {
    // Last-resort fallback: first heading or paragraph in the text box.
    quotation = textBox.querySelector('h2, h3, h4, h5, p');
  }

  // Attribution: the paragraph containing the name link + role.
  // In both shapes this is a <p> with an <a> (linked name) and trailing role text.
  let attribution = null;
  const attrCandidates = Array.from(textBox.querySelectorAll('p'));
  attribution = attrCandidates.find((p) => p !== quotation && p.querySelector('a'))
    // fall back to a <p> that is not the quote paragraph
    || attrCandidates.find((p) => p !== quotation && !p.querySelector('span.quote'))
    || null;

  const cells = [];

  // Row 1: quotation
  const quotationCell = document.createDocumentFragment();
  quotationCell.appendChild(document.createComment(' field:quotation '));
  if (quotation) quotationCell.appendChild(quotation);
  cells.push([quotationCell]);

  // Row 2: attribution
  const attributionCell = document.createDocumentFragment();
  attributionCell.appendChild(document.createComment(' field:attribution '));
  if (attribution) attributionCell.appendChild(attribution);
  cells.push([attributionCell]);

  const block = WebImporter.Blocks.createBlock(document, { name: 'quote-portrait', cells });
  element.replaceWith(block);
}
