(() => {
  const root = document.documentElement;
  const toggle = document.querySelector('[data-theme-toggle]');
  const systemTheme = window.matchMedia('(prefers-color-scheme: dark)');
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  const storedTheme = () => {
    try {
      return localStorage.getItem('tvp-theme');
    } catch (_error) {
      return null;
    }
  };

  const applyTheme = (theme, persist = false) => {
    root.dataset.theme = theme;
    root.style.colorScheme = theme;
    if (persist) {
      try {
        localStorage.setItem('tvp-theme', theme);
      } catch (_error) {}
    }

    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    if (toggle) {
      toggle.dataset.theme = theme;
      toggle.setAttribute('aria-label', `Switch to ${nextTheme} theme`);
      toggle.setAttribute('aria-pressed', String(theme === 'dark'));
    }

    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.content = getComputedStyle(root).getPropertyValue('--browser-chrome').trim();
  };

  applyTheme(root.dataset.theme || (systemTheme.matches ? 'dark' : 'light'));
  toggle?.addEventListener('click', () => {
    applyTheme(root.dataset.theme === 'dark' ? 'light' : 'dark', true);
  });
  systemTheme.addEventListener?.('change', (event) => {
    if (!storedTheme()) applyTheme(event.matches ? 'dark' : 'light');
  });

  const scenes = [...document.querySelectorAll('[data-depth-scene]')];
  if (!scenes.length || reduceMotion.matches || navigator.connection?.saveData) return;

  scenes.forEach((scene) => {
    const layers = [...scene.querySelectorAll('[data-depth]')];
    let targetX = 0;
    let targetY = 0;
    let currentX = 0;
    let currentY = 0;
    let frame = 0;
    let sceneVisible = false;

    const render = (time) => {
      const driftX = Math.sin(time / 3200) * 2.2;
      const driftY = Math.cos(time / 3800) * 1.8;
      currentX += (targetX - currentX) * 0.055;
      currentY += (targetY - currentY) * 0.055;
      scene.style.setProperty('--scene-rotate-x', `${currentY * -0.09}deg`);
      scene.style.setProperty('--scene-rotate-y', `${currentX * 0.09}deg`);
      layers.forEach((layer) => {
        const depth = Number(layer.dataset.depth) || 0;
        layer.style.setProperty('--depth-x', `${(currentX + driftX) * depth}px`);
        layer.style.setProperty('--depth-y', `${(currentY + driftY) * depth}px`);
      });
      frame = requestAnimationFrame(render);
    };

    const start = () => {
      if (!frame && !document.hidden) frame = requestAnimationFrame(render);
    };
    const stop = () => {
      cancelAnimationFrame(frame);
      frame = 0;
    };

    scene.addEventListener('pointermove', (event) => {
      const bounds = scene.getBoundingClientRect();
      targetX = ((event.clientX - bounds.left) / bounds.width - 0.5) * 22;
      targetY = ((event.clientY - bounds.top) / bounds.height - 0.5) * 22;
    });
    scene.addEventListener('pointerleave', () => {
      targetX = 0;
      targetY = 0;
    });

    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver(([entry]) => {
        sceneVisible = entry.isIntersecting;
        if (sceneVisible) start();
        else stop();
      }, { rootMargin: '100px 0px' });
      observer.observe(scene);
    } else {
      sceneVisible = true;
      start();
    }
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) stop();
      else if (sceneVisible) start();
    });
  });
})();