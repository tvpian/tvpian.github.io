(() => {
  const chapter = document.querySelector('.research-notebook');
  if (!chapter) return;
  const tabs = [...chapter.querySelectorAll('[data-thread]')];
  const panels = [...chapter.querySelectorAll('[data-thread-panel]')];
  const nav = chapter.querySelector('.rn-tabs');
  const mobile = matchMedia('(max-width: 700px)');
  nav.setAttribute('role', 'tablist');
  nav.setAttribute('aria-label', 'Research threads and shared platform');
  const setOrientation = () => nav.setAttribute('aria-orientation', mobile.matches ? 'horizontal' : 'vertical');
  setOrientation();
  mobile.addEventListener('change', setOrientation);
  for (const tab of tabs) {
    tab.setAttribute('role', 'tab');
    tab.setAttribute('aria-controls', tab.hash.slice(1));
  }
  for (const panel of panels) {
    panel.setAttribute('role', 'tabpanel');
    panel.setAttribute('aria-labelledby', tabs.find(t => t.hash === '#' + panel.id).id);
    panel.tabIndex = 0;
  }
  function reveal(id, {update = false, scroll = false, focus = false} = {}) {
    const target = document.getElementById(id);
    const panel = target?.closest('[data-thread-panel]');
    if (!target || !chapter.contains(target) || (!panel && !target.matches('details'))) return false;
    if (panel) {
      for (const item of panels) item.hidden = item !== panel;
      for (const tab of tabs) {
        const selected = tab.hash === '#' + panel.id;
        tab.setAttribute('aria-selected', String(selected));
        tab.tabIndex = selected ? 0 : -1;
      }
    }
    chapter.classList.add('rn-enhanced');
    if (target.matches('details')) target.open = true;
    const reading = target.closest('.rn-reading-panel');
    if (reading && !reading.open) reading.showModal();
    if (update) history.pushState(null, '', '#' + id);
    if (scroll) (target.closest('.rn-reading-panel') ? target : chapter).scrollIntoView({behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'start'});
    if (focus) target.focus({preventScroll: true});
    return true;
  }
  chapter.addEventListener('click', event => {
    const tab = event.target.closest('[data-thread]');
    if (!tab || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    reveal(tab.hash.slice(1), {update: true, scroll: mobile.matches || chapter.querySelector('.rn-panels').getBoundingClientRect().top < 0});
  });
  nav.addEventListener('keydown', event => {
    const index = tabs.indexOf(event.target.closest('[data-thread]'));
    if (index < 0) return;
    let next;
    const forward = mobile.matches ? 'ArrowRight' : 'ArrowDown';
    const backward = mobile.matches ? 'ArrowLeft' : 'ArrowUp';
    if (event.key === forward) next = (index + 1) % tabs.length;
    if (event.key === backward) next = (index - 1 + tabs.length) % tabs.length;
    if (event.key === 'Home') next = 0;
    if (event.key === 'End') next = tabs.length - 1;
    if (next === undefined) return;
    event.preventDefault();
    tabs[next].focus();
    reveal(tabs[next].hash.slice(1));
  });
  document.addEventListener('click', event => {
    const link = event.target.closest('a[href]:not([data-thread])');
    if (!link || new URL(link.href).pathname !== location.pathname || !link.hash || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
    if (reveal(link.hash.slice(1), {update: true, scroll: true})) event.preventDefault();
  });
  const fromHash = () => reveal(location.hash.slice(1));
  addEventListener('hashchange', fromHash);
  addEventListener('popstate', fromHash);
  reveal('continual-learning');
  fromHash();
  if (location.hash) requestAnimationFrame(() => {
    const target = document.getElementById(location.hash.slice(1));
    if (target && chapter.contains(target)) (target.closest('.rn-reading-panel') ? target : chapter).scrollIntoView({behavior: 'instant', block: 'start'});
  });
})();


(() => {
  const root = document.querySelector('.research-notebook');
  if (!root) return;
  const initialHash = location.hash;
  const alignEntry = () => requestAnimationFrame(() => {
    if (location.hash !== initialHash) return;
    const target = document.getElementById(initialHash.slice(1));
    if (target && root.contains(target)) (target.closest('.rn-reading-panel') ? target : root).scrollIntoView({behavior: 'instant', block: 'start'});
  });
  if (document.readyState === 'complete') alignEntry();
  else addEventListener('load', alignEntry, {once: true});
  root.querySelector('[data-load-research-video]')?.addEventListener('click', event => {
    const figure = event.currentTarget.closest('figure');
    const host = figure.querySelector('.rn-video-host');
    host.replaceChildren(figure.querySelector('template').content.cloneNode(true));
    const video = host.querySelector('video');
    video.focus();
    video.play().catch(() => {});
  });
  const pauseHiddenMedia = () => root.querySelectorAll('.rn-panel[hidden] video, .rn-reading-panel:not([open]) video').forEach(video => video.pause());
  new MutationObserver(pauseHiddenMedia).observe(root, {attributes: true, attributeFilter: ['hidden', 'open'], subtree: true});
  function closeDisclosure(disclosure) {
    const summary = disclosure.querySelector(':scope > summary');
    disclosure.open = false;
    summary.focus({preventScroll: true});
    const bounds = summary.getBoundingClientRect();
    if (bounds.top < 24 || bounds.bottom > innerHeight - 24) {
      summary.scrollIntoView({behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth', block: 'center'});
    }
  }
  root.querySelectorAll('details').forEach(disclosure => {
    const summary = disclosure.querySelector(':scope > summary');
    if (!summary) return;
    const close = document.createElement('button');
    close.type = 'button';
    close.className = 'rn-close-disclosure';
    close.textContent = disclosure.classList.contains('rn-platform') ? 'Close platform' : 'Close';
    close.setAttribute('aria-label', 'Close ' + summary.textContent.trim());
    close.addEventListener('click', () => closeDisclosure(disclosure));
    disclosure.append(close);
  });
  root.addEventListener('keydown', event => {
    if (event.key !== 'Escape') return;
    const open = event.target.closest('details[open]');
    if (!open) return;
    event.preventDefault();
    closeDisclosure(open);
  });
})();


(() => {
  const root = document.querySelector('.research-notebook');
  if (!root) return;
  const figures = [...root.querySelectorAll('[data-rn-animation]')];
  const preference = matchMedia('(prefers-reduced-motion: reduce)');
  const onscreen = new Set();
  function update(figure) {
    const visible = onscreen.has(figure) && !figure.closest('.rn-panel')?.hidden && !document.hidden;
    if (preference.matches) {
      figure.classList.remove('rn-motion-entered', 'rn-motion-playing');
      return;
    }
    if (visible) figure.classList.add('rn-motion-entered');
    figure.classList.toggle('rn-motion-playing', visible);
  }
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) onscreen.add(entry.target);
        else onscreen.delete(entry.target);
        update(entry.target);
      });
    }, {threshold: .2});
    figures.forEach(figure => observer.observe(figure));
  }
  const refresh = () => figures.forEach(update);
  new MutationObserver(refresh).observe(root, {attributes: true, attributeFilter: ['hidden', 'open'], subtree: true});
  preference.addEventListener('change', refresh);
  addEventListener('visibilitychange', refresh);
})();


(() => {
  const root = document.querySelector('.research-notebook');
  if (!root) return;
  root.querySelectorAll('[data-open-reading]').forEach(button => {
    const dialog = document.getElementById(button.dataset.openReading);
    button.addEventListener('click', () => dialog.showModal());
  });
  root.querySelectorAll('.rn-reading-panel').forEach(dialog => {
    dialog.querySelector('[data-close-reading]').addEventListener('click', () => dialog.close());
    dialog.addEventListener('click', event => {
      if (event.target !== dialog) return;
      const box = dialog.getBoundingClientRect();
      if (event.clientX < box.left || event.clientX > box.right || event.clientY < box.top || event.clientY > box.bottom) dialog.close();
    });
  });
})();
