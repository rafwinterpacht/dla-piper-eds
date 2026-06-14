/*
 * hero-article - insights/publication article-header variant of the hero block.
 * Source: dlapiper.com insights publication articles.
 * Renders a full-bleed editorial background photo with a publication-date
 * eyebrow and the article title on a light title plate (no CTA, no portrait).
 *
 * Content model: row 1 = background image, row 2 = rich text (date eyebrow + H1 title).
 * Vanilla hero decoration is CSS-only; this variant tags the image and
 * content wrappers so the article-header layout can be styled.
 */
export default function decorate(block) {
  const rows = [...block.children];
  rows.forEach((row) => {
    const hasPicture = row.querySelector('picture, img');
    if (hasPicture) {
      row.classList.add('hero-article-image');
    } else {
      row.classList.add('hero-article-content');
    }
  });
}
