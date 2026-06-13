/*
 * hero-profile - person-profile header variant of the hero block.
 * Source: dlapiper.com person profile (e.g. /en-us/people/r/ryan-frank-w).
 * Pairs a square portrait with the attorney's identity (name, role,
 * functional title and a one-line positioning statement) on a navy band.
 *
 * Content model: row 1 = image, row 2 = identity rich text.
 * Vanilla hero decoration is CSS-only; this variant tags the image and
 * text wrappers so the two-column navy layout can be styled.
 */
export default function decorate(block) {
  const rows = [...block.children];
  // First cell containing a picture/image = portrait column.
  rows.forEach((row) => {
    const hasPicture = row.querySelector('picture, img');
    if (hasPicture) {
      row.classList.add('hero-profile-image');
    } else {
      row.classList.add('hero-profile-content');
    }
  });
}
