const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const videos = [...document.querySelectorAll('video')];
const visibleVideos = new Set();

function syncVideo(video, visible) {
  if (visible) visibleVideos.add(video);
  else visibleVideos.delete(video);

  if (reduceMotion.matches || !visible) {
    video.pause();
    return;
  }

  if (video.readyState === HTMLMediaElement.HAVE_NOTHING) video.load();
  const promise = video.play();
  if (promise) promise.catch(() => {
    video.dataset.playbackBlocked = 'true';
  });
}

function addMediaToggle(video) {
  const parent = video.parentElement;
  if (!parent || parent.querySelector(':scope > .media-toggle')) return;

  const button = document.createElement('button');
  const label = document.createElement('span');
  button.type = 'button';
  button.className = 'media-toggle';
  button.dataset.state = 'paused';
  label.textContent = 'Play motion';
  button.append(label);
  parent.append(button);

  const update = () => {
    const playing = !video.paused && !video.ended;
    button.dataset.state = playing ? 'playing' : 'paused';
    label.textContent = playing ? 'Pause motion' : 'Play motion';
  };

  button.addEventListener('click', async () => {
    if (!video.paused) {
      video.pause();
      return;
    }
    if (video.readyState === HTMLMediaElement.HAVE_NOTHING) video.load();
    try {
      await video.play();
      delete video.dataset.playbackBlocked;
    } catch (_error) {
      label.textContent = 'Motion unavailable';
    }
  });
  video.addEventListener('play', update);
  video.addEventListener('pause', update);
  video.addEventListener('ended', update);
}

videos.forEach((video) => {
  video.muted = true;
  video.defaultMuted = true;
  video.preload = 'metadata';
  addMediaToggle(video);
  video.addEventListener('canplay', () => {
    if (visibleVideos.has(video) && !reduceMotion.matches && video.paused) syncVideo(video, true);
  });
});

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
  else visibleVideos.forEach((video) => syncVideo(video, true));
});

document.addEventListener('visibilitychange', () => {
  if (document.hidden) videos.forEach((video) => video.pause());
  else visibleVideos.forEach((video) => syncVideo(video, true));
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
