/* eslint-disable */
/* global WebImporter */
/**
 * Parser for columns-media.
 * Base block: columns (core/franklin/components/columns/v1/columns).
 * Source: https://www.dlapiper.com/en-us/about-us (.image-text-component:has(video))
 * Generated: 2026-06-12
 *
 * Layout (2 columns, 1 row — Columns block, so NO field hints per hinting.md):
 *   - Left column:  autoplay/looping MP4 video with poster image.
 *   - Right column: rich text (intro subhead + four bold value labels with descriptions).
 *
 * Video preservation: markdown conversion (html2md) drops raw <video>/<source>
 * tags, so the MP4 source and poster are re-expressed as a poster <img> plus a
 * link to the .mp4. This survives the HTML -> markdown -> JCR pipeline and lets
 * the EDS client-side video autoblock rebuild a player at render time.
 */
export default function parse(element, { document }) {
  // LEFT COLUMN — media. Re-express the <video> so its source + poster survive md.
  const mediaBox = element.querySelector('.extended-image-box, [class*="image-box"]');
  const video = element.querySelector('video');
  const leftCell = [];
  if (video) {
    const posterUrl = video.getAttribute('poster');
    const source = video.querySelector('source');
    const videoUrl = source ? source.getAttribute('src') : (video.getAttribute('src') || '');
    if (posterUrl) {
      const poster = document.createElement('img');
      poster.src = posterUrl;
      poster.alt = '';
      leftCell.push(poster);
    }
    if (videoUrl) {
      const link = document.createElement('a');
      link.href = videoUrl;
      link.textContent = videoUrl;
      leftCell.push(link);
    }
    // If neither poster nor source resolved, fall back to the raw element.
    if (leftCell.length === 0) leftCell.push(video);
  } else if (mediaBox) {
    // Fallback: keep whatever media wrapper exists (e.g. an <img>/<picture>).
    leftCell.push(mediaBox);
  }

  // RIGHT COLUMN — rich text. Combine the intro subhead and the value-list description.
  const textBox = element.querySelector('.text-box, [class*="text-box"]');
  const subhead = element.querySelector('.optional-subhead, [class*="subhead"]');
  const description = element.querySelector('.text-box-description, [class*="text-box-description"]');
  const rightCell = [];
  if (subhead) rightCell.push(subhead);
  if (description) rightCell.push(description);
  // Fallback: if neither known sub-element matched, take the whole text box.
  if (rightCell.length === 0 && textBox) rightCell.push(textBox);

  const cells = [
    [leftCell, rightCell],
  ];

  const block = WebImporter.Blocks.createBlock(document, { name: 'columns-media', cells });
  element.replaceWith(block);
}
