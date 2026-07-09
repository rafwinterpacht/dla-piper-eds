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

  const content = block.querySelector('.hero-profile-content');
  if (content) {
    // Two-tone name treatment: the source bolds the first word (given name)
    // and renders the remainder in a lighter serif weight. CSS alone cannot
    // target the first word of a text node, so wrap it in a span.
    const h1 = content.querySelector('h1');
    if (h1 && !h1.querySelector('.hero-profile-firstname')) {
      const text = h1.textContent.trim();
      const [firstWord, ...rest] = text.split(' ');
      if (rest.length) {
        h1.textContent = '';
        const span = document.createElement('span');
        span.className = 'hero-profile-firstname';
        span.textContent = firstWord;
        h1.append(span, ` ${rest.join(' ')}`);
      }
    }

    // Tag the paragraphs so the navy title band and the olive quote box can be
    // styled independently. Order in the content cell:
    //   p[0] = functional title, p[1] = positioning statement, p[2] = attribution
    const paras = [...content.querySelectorAll('p')];
    if (paras[0]) paras[0].classList.add('hero-profile-title');
    if (paras[1]) paras[1].classList.add('hero-profile-quote');
    if (paras[2]) paras[2].classList.add('hero-profile-attribution');

    // Group the positioning statement + attribution into an olive quote box.
    if (paras[1]) {
      const quoteBox = document.createElement('div');
      quoteBox.className = 'hero-profile-quotebox';
      paras[1].replaceWith(quoteBox);
      quoteBox.append(paras[1]);
      if (paras[2]) quoteBox.append(paras[2]);
    }
  }
}
