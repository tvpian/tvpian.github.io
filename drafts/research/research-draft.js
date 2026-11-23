(() => {
  const chapter = document.querySelector('.research-notebook');
  if (!chapter) return;
  const tabs = [...chapter.querySelectorAll('[data-thread]')];
  const panels = [...chapter.querySelectorAll('[data-thread-panel]')];
  const nav = chapter.querySelector('.rn-tabs');
  const mobile = matchMedia('(max-width: 700px)');
  nav.setAttribute('role', 'tablist');
  nav.setAttribute('aria-label', 'Research threads');
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
    if (update) history.pushState(null, '', '#' + id);
    if (scroll) target.scrollIntoView({behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'start'});
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
    if (target && chapter.contains(target)) target.scrollIntoView({behavior: 'instant', block: 'start'});
  });
})();
