/*
 * columns-cta - feature call-to-action variant of the columns block.
 * Source: dlapiper.com homepage olive "Find a career / Find a lawyer" band.
 * Two large CTA links displayed side-by-side, each a heading with a
 * trailing arrow. Derived from the vanilla columns block.
 */
export default function decorate(block) {
  const cols = [...block.firstElementChild.children];
  block.classList.add(`columns-cta-${cols.length}-cols`);

  [...block.children].forEach((row) => {
    [...row.children].forEach((col) => {
      const pic = col.querySelector('picture');
      if (pic) {
        const picWrapper = pic.closest('div');
        if (picWrapper && picWrapper.children.length === 1) {
          picWrapper.classList.add('columns-cta-img-col');
        }
      }
    });
  });
}
