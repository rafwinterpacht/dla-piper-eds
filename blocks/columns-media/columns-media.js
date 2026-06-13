export default function decorate(block) {
  const cols = [...block.firstElementChild.children];
  block.classList.add(`columns-media-${cols.length}-cols`);

  [...block.children].forEach((row) => {
    [...row.children].forEach((col) => {
      const pic = col.querySelector('picture');
      const mediaLink = col.querySelector('a[href$=".mp4"], a[href$=".webm"]');

      // Media column: contains a poster <picture> and/or a video link
      if (pic || mediaLink) {
        col.classList.add('columns-media-img-col');

        if (mediaLink) {
          const src = mediaLink.getAttribute('href');
          const poster = pic ? pic.querySelector('img')?.getAttribute('src') : '';

          const video = document.createElement('video');
          ['autoplay', 'loop', 'playsinline'].forEach((a) => video.setAttribute(a, ''));
          video.muted = true;
          video.setAttribute('muted', '');
          video.setAttribute('preload', 'metadata');
          if (poster) video.setAttribute('poster', poster);

          const source = document.createElement('source');
          source.setAttribute('src', src);
          source.setAttribute('type', 'video/mp4');
          video.append(source);

          // The poster <picture> and the mp4 <a> live in the same wrapper <p>.
          // Replace that wrapper with the video element.
          const holder = mediaLink.closest('p') || mediaLink;
          holder.replaceWith(video);
        }
      }
    });
  });
}
