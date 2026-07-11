const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const videos = [...document.querySelectorAll('video')];

function syncVideo(video, visible) {
  if (reduceMotion.matches || !visible) {
    video.pause();
    return;
  }
  const promise = video.play();
  if (promise) promise.catch(() => {});
}

if ('IntersectionObserver' in window) {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => syncVideo(entry.target, entry.isIntersecting));
  }, { rootMargin: '120px 0px', threshold: 0.2 });
  videos.forEach((video) => observer.observe(video));
} else if (!reduceMotion.matches) {
  videos.forEach((video) => syncVideo(video, true));
}

reduceMotion.addEventListener?.('change', () => {
  if (reduceMotion.matches) videos.forEach((video) => video.pause());
});

const filterButtons = [...document.querySelectorAll('[data-filter]')];
const atlasItems = [...document.querySelectorAll('.atlas-item')];

filterButtons.forEach((button) => {
  button.addEventListener('click', () => {
    const filter = button.dataset.filter;
    filterButtons.forEach((item) => item.setAttribute('aria-pressed', String(item === button)));
    atlasItems.forEach((item) => {
      const categories = item.dataset.category?.split(' ') ?? [];
      item.hidden = filter !== 'all' && !categories.includes(filter);
    });
  });
});
