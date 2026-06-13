/*
 * hero-banner - marketing homepage hero variant of the hero block.
 * Source: dlapiper.com homepage (/en-us) "Success, Solved." banner.
 * Overlays a heading, value-proposition paragraphs and a single CTA
 * button on top of a full-bleed background image, on a dark navy band.
 *
 * Content model: row 1 = background image, row 2 = heading/text/CTA rich text.
 * Vanilla hero decoration is CSS-only; this variant tags the image and
 * content wrappers so the full-bleed overlay layout can be styled.
 */
export default function decorate(block) {
  const rows = [...block.children];
  rows.forEach((row) => {
    const hasPicture = row.querySelector('picture, img');
    if (hasPicture) {
      row.classList.add('hero-banner-image');
    } else {
      row.classList.add('hero-banner-content');
    }
  });
}
