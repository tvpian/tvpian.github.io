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
  if (!video.hasAttribute('preload')) video.preload = 'metadata';
  addMediaToggle(video);
  video.addEventListener('canplay', () => {
    if (visibleVideos.has(video) && !reduceMotion.matches && video.paused) syncVideo(video, true);
  });
});

document.querySelectorAll('img').forEach((img, index) => {
  img.decoding = 'async';
  if (index > 0 && !img.hasAttribute('loading')) img.loading = 'lazy';
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

const diagrams = [...document.querySelectorAll('[data-animate-diagram]')];
diagrams.forEach((diagram) => diagram.classList.add('diagram-ready'));

if ('IntersectionObserver' in window && !reduceMotion.matches) {
  const diagramObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-in-view');
      diagramObserver.unobserve(entry.target);
    });
  }, { rootMargin: '0px 0px -12%', threshold: 0.2 });
  diagrams.forEach((diagram) => diagramObserver.observe(diagram));
} else {
  diagrams.forEach((diagram) => diagram.classList.add('is-in-view'));
}

const platformFigure = document.querySelector('.current-work-live__platform-figure');
if (platformFigure) {
  const stageHits = [...platformFigure.querySelectorAll('.cwl-stage-hit')];
  const stageBands = [...platformFigure.querySelectorAll('.cwl-band rect')];
  const stageLabels = [...platformFigure.querySelectorAll('.cwl-label text')];
  const stageSubs = [...platformFigure.querySelectorAll('.cwl-sub text')];
  const diagramStatus = platformFigure.querySelector('[data-diagram-status]');
  const defaultStatus = diagramStatus?.textContent ?? '';
  let pinnedStage = -1;

  const showStage = (index = -1) => {
    const hit = stageHits[index];
    platformFigure.dataset.activeStage = index >= 0 ? String(index) : '';
    [stageBands, stageLabels, stageSubs].forEach((items) => {
      items.forEach((item, itemIndex) => item.classList.toggle('is-highlighted', itemIndex === index));
    });
    if (diagramStatus) diagramStatus.textContent = hit?.dataset.stageLabel ?? defaultStatus;
  };

  stageHits.forEach((hit, index) => {
    hit.setAttribute('aria-pressed', 'false');
    hit.addEventListener('pointerenter', () => showStage(index));
    hit.addEventListener('pointerleave', () => showStage(pinnedStage));
    hit.addEventListener('focus', () => showStage(index));
    hit.addEventListener('blur', () => showStage(pinnedStage));
    hit.addEventListener('click', () => {
      pinnedStage = pinnedStage === index ? -1 : index;
      stageHits.forEach((item, itemIndex) => item.setAttribute('aria-pressed', String(itemIndex === pinnedStage)));
      showStage(pinnedStage);
    });
    hit.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        hit.click();
      } else if (event.key === 'Escape') {
        pinnedStage = -1;
        stageHits.forEach((item) => item.setAttribute('aria-pressed', 'false'));
        showStage();
        hit.blur();
      }
    });
  });
}

document.querySelectorAll('[data-attention-mode]').forEach((button) => {
  button.addEventListener('click', () => {
    const attention = button.closest('[data-attention-state]');
    if (!attention) return;
    attention.dataset.attentionState = button.dataset.attentionMode;
    attention.querySelectorAll('[data-attention-mode]').forEach((item) => {
      item.setAttribute('aria-pressed', String(item === button));
    });
  });
});

const policyInputDescriptions = {
  vision: ['Vision', 'Which regions redirect the policy response when visual evidence changes?'],
  prompt: ['Prompt', 'Which action dimensions shift when the task wording changes?'],
  state: ['Robot state', 'Which outputs depend on joint, gripper, or force-state information?'],
  pretraining: ['Pretraining', 'How do learned representations and outputs change across pretrained encoders?'],
};

document.querySelectorAll('[data-policy-input-mode]').forEach((button) => {
  button.addEventListener('click', () => {
    const lab = button.closest('[data-policy-input]');
    if (!lab) return;
    const mode = button.dataset.policyInputMode;
    lab.dataset.policyInput = mode;
    lab.querySelectorAll('[data-policy-input-mode]').forEach((item) => {
      item.setAttribute('aria-pressed', String(item === button));
    });
    const status = lab.querySelector('[data-policy-input-status]');
    const description = policyInputDescriptions[mode];
    if (status && description) {
      status.replaceChildren();
      const label = document.createElement('strong');
      label.textContent = description[0];
      status.append(label, ` ${description[1]}`);
    }
  });
});

const heroSignal = document.querySelector('[data-hero-signal]');
if (heroSignal) {
  const steps = [...heroSignal.querySelectorAll('[data-signal-step]')];
  const label = heroSignal.querySelector('[data-hero-signal-label]');
  let activeSignal = 0;
  let signalTimer = 0;

  const setSignal = (index) => {
    activeSignal = (index + steps.length) % steps.length;
    heroSignal.style.setProperty('--signal-progress', `${(activeSignal + 1) * 25}%`);
    heroSignal.style.setProperty('--signal-position', `${(activeSignal * 25) + 12.5}%`);
    steps.forEach((step, stepIndex) => step.classList.toggle('is-active', stepIndex === activeSignal));
    if (label) label.textContent = steps[activeSignal]?.textContent ?? '';
  };
  const stopSignal = () => window.clearInterval(signalTimer);
  const startSignal = () => {
    stopSignal();
    if (!reduceMotion.matches) signalTimer = window.setInterval(() => setSignal(activeSignal + 1), 1900);
  };

  heroSignal.closest('.portrait-frame')?.addEventListener('pointermove', (event) => {
    const bounds = event.currentTarget.getBoundingClientRect();
    setSignal(Math.min(steps.length - 1, Math.floor(((event.clientX - bounds.left) / bounds.width) * steps.length)));
  });
  heroSignal.closest('.portrait-frame')?.addEventListener('pointerleave', startSignal);
  setSignal(0);
  startSignal();
  reduceMotion.addEventListener?.('change', () => {
    if (reduceMotion.matches) stopSignal();
    else startSignal();
  });
}

const focusLinks = [...document.querySelectorAll('[data-focus-link]')];
const researchDirections = document.querySelector('.current-work-live__questions > ol');
let spotlightTimer = 0;

const clearResearchSpotlight = () => {
  window.clearTimeout(spotlightTimer);
  researchDirections?.classList.remove('has-spotlight');
  researchDirections?.querySelectorAll('.is-spotlit').forEach((item) => item.classList.remove('is-spotlit'));
};

const spotlightResearchDirection = (hash, updateHash = true) => {
  const targetId = hash.replace(/^#/, '');
  const target = document.getElementById(targetId);
  if (!target || !researchDirections?.contains(target)) return;

  clearResearchSpotlight();
  researchDirections.classList.add('has-spotlight');
  target.classList.add('is-spotlit');
  target.tabIndex = -1;
  target.scrollIntoView({ behavior: reduceMotion.matches ? 'auto' : 'smooth', block: 'center' });
  target.focus({ preventScroll: true });
  if (updateHash) history.pushState(null, '', `#${targetId}`);
  spotlightTimer = window.setTimeout(clearResearchSpotlight, 9000);
};

focusLinks.forEach((link) => {
  link.addEventListener('click', (event) => {
    event.preventDefault();
    spotlightResearchDirection(link.hash);
  });
});

addEventListener('hashchange', () => spotlightResearchDirection(location.hash, false));
addEventListener('keydown', (event) => {
  if (event.key === 'Escape') clearResearchSpotlight();
});

if (focusLinks.some((link) => link.hash === location.hash)) {
  requestAnimationFrame(() => spotlightResearchDirection(location.hash, false));
}

const rail = document.querySelector('[data-research-rail]');
if (rail) {
  const links = [...rail.querySelectorAll('[data-rail-target]')];
  const sections = links.map((link) => document.getElementById(link.dataset.railTarget));
  const progress = rail.querySelector('[data-rail-progress]');
  let railFrame = 0;

  const updateRail = () => {
    railFrame = 0;
    const pageProgress = document.documentElement.scrollHeight > innerHeight
      ? scrollY / (document.documentElement.scrollHeight - innerHeight)
      : 0;
    if (progress) progress.style.transform = `scaleY(${Math.max(0, Math.min(1, pageProgress))})`;

    const marker = innerHeight * 0.42;
    let active = 0;
    sections.forEach((section, index) => {
      if (section && section.getBoundingClientRect().top <= marker) active = index;
    });
    links.forEach((link, index) => {
      const selected = index === active;
      link.classList.toggle('is-active', selected);
      if (selected) link.setAttribute('aria-current', 'location');
      else link.removeAttribute('aria-current');
    });
  };

  const requestRailUpdate = () => {
    if (!railFrame) railFrame = requestAnimationFrame(updateRail);
  };
  addEventListener('scroll', requestRailUpdate, { passive: true });
  addEventListener('resize', requestRailUpdate);
  updateRail();
}

function initReveals(elements) {
  const revealItems = [...elements];
  if (!revealItems.length || reduceMotion.matches || !('IntersectionObserver' in window)) {
    revealItems.forEach((item) => item.classList.add('is-revealed'));
    return;
  }
  revealItems.forEach((item, index) => {
    item.classList.add('reveal-ready');
    item.style.setProperty('--reveal-delay', `${Math.min(index % 4, 3) * 55}ms`);
  });
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-revealed');
      revealObserver.unobserve(entry.target);
    });
  }, { rootMargin: '0px 0px -7%', threshold: 0.08 });
  revealItems.forEach((item) => revealObserver.observe(item));
}

initReveals(document.querySelectorAll('.section-heading, .feature-card, .project-card, .system-spotlight, .role-spotlight'));

const evaluationDescriptions = {
  outcome: 'Task completion · partial progress',
  behavior: 'Failure modes · recovery behavior',
  control: 'Compliance sensitivity · repeatability',
};

document.querySelectorAll('[data-evaluation-mode]').forEach((button) => {
  button.addEventListener('click', () => {
    const evaluation = button.closest('[data-evaluation-state]');
    if (!evaluation) return;
    const mode = button.dataset.evaluationMode;
    evaluation.dataset.evaluationState = mode;
    evaluation.querySelectorAll('[data-evaluation-mode]').forEach((item) => {
      item.setAttribute('aria-pressed', String(item === button));
    });
    const status = evaluation.querySelector('[data-evaluation-status]');
    if (status) status.textContent = evaluationDescriptions[mode] ?? '';
  });
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
