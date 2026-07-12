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

const productTabs = [...document.querySelectorAll('[data-product-tab]')];
const productPanels = [...document.querySelectorAll('[data-product-panel]')];
const productStage = document.querySelector('[data-product-stage]');
const productPosition = document.querySelector('[data-product-position]');

if (productTabs.length && productPanels.length) {
  const selectProduct = (index, focus = false) => {
    const normalizedIndex = (index + productTabs.length) % productTabs.length;
    const selected = productTabs[normalizedIndex];

    productTabs.forEach((tab, tabIndex) => {
      const active = tabIndex === normalizedIndex;
      tab.setAttribute('aria-selected', String(active));
      tab.tabIndex = active ? 0 : -1;
      if (active && focus) tab.focus();
    });
    productPanels.forEach((panel) => {
      panel.hidden = panel.dataset.productPanel !== selected.dataset.productTab;
    });
    if (productPosition) {
      productPosition.textContent = `${String(normalizedIndex + 1).padStart(2, '0')} / ${String(productTabs.length).padStart(2, '0')}`;
    }
  };

  productTabs.forEach((tab, index) => {
    tab.addEventListener('click', () => selectProduct(index));
    tab.addEventListener('keydown', (event) => {
      let nextIndex;
      if (event.key === 'ArrowRight') nextIndex = index + 1;
      else if (event.key === 'ArrowLeft') nextIndex = index - 1;
      else if (event.key === 'Home') nextIndex = 0;
      else if (event.key === 'End') nextIndex = productTabs.length - 1;
      else return;
      event.preventDefault();
      selectProduct(nextIndex, true);
    });
  });

  let swipeStartX = null;
  productStage?.addEventListener('pointerdown', (event) => {
    if (event.pointerType === 'mouse') return;
    swipeStartX = event.clientX;
  });
  productStage?.addEventListener('pointerup', (event) => {
    if (swipeStartX === null) return;
    const distance = event.clientX - swipeStartX;
    swipeStartX = null;
    if (Math.abs(distance) < 55) return;
    const currentIndex = productTabs.findIndex((tab) => tab.getAttribute('aria-selected') === 'true');
    selectProduct(currentIndex + (distance < 0 ? 1 : -1));
  });
  productStage?.addEventListener('pointercancel', () => {
    swipeStartX = null;
  });
}
