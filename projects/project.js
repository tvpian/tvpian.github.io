const videos = [...document.querySelectorAll('video')];
const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)');

videos.forEach((video) => {
  video.muted = true;
  video.defaultMuted = true;
  video.playsInline = true;
});

if ('IntersectionObserver' in window && !reduceMotion.matches) {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) entry.target.play().catch(() => {});
      else entry.target.pause();
    });
  }, { rootMargin: '100px 0px', threshold: .2 });
  videos.forEach((video) => observer.observe(video));
}

document.querySelectorAll('[data-year]').forEach((node) => {
  node.textContent = String(new Date().getFullYear());
});

const expandableFigures = [...document.querySelectorAll('.evidence-gallery figure, .research-figure, .figure-grid figure')]
  .filter((figure) => figure.querySelector('img'));

if (expandableFigures.length && typeof HTMLDialogElement !== 'undefined') {
  const dialog = document.createElement('dialog');
  dialog.className = 'figure-lightbox';
  dialog.setAttribute('aria-label', 'Expanded research figure');
  dialog.innerHTML = `
    <div class="figure-lightbox__frame">
      <img alt="">
      <div class="figure-lightbox__bar">
        <span></span>
        <button class="figure-lightbox__close" type="button">Close</button>
      </div>
    </div>`;
  document.body.append(dialog);

  const lightboxImage = dialog.querySelector('img');
  const lightboxCaption = dialog.querySelector('.figure-lightbox__bar span');
  const closeButton = dialog.querySelector('.figure-lightbox__close');

  const openFigure = (figure) => {
    const source = figure.querySelector('img');
    const caption = figure.querySelector('figcaption');
    lightboxImage.src = source.currentSrc || source.src;
    lightboxImage.alt = source.alt;
    lightboxCaption.textContent = caption?.innerText || source.alt;
    dialog.showModal();
  };

  expandableFigures.forEach((figure) => {
    figure.classList.add('is-expandable');
    figure.tabIndex = 0;
    figure.setAttribute('role', 'button');
    figure.setAttribute('aria-label', `Expand figure: ${figure.querySelector('img').alt}`);
    figure.addEventListener('click', () => openFigure(figure));
    figure.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        openFigure(figure);
      }
    });
  });

  closeButton.addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', (event) => {
    if (event.target === dialog) dialog.close();
  });
}
