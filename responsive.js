/* Disclosures are an enhancement: all links remain usable if JavaScript is off. */
(() => {
  const phone = matchMedia('(max-width: 767px)');
  for (const header of document.querySelectorAll('[data-responsive-header]')) {
    const button = header.querySelector('[data-responsive-toggle]');
    const links = document.getElementById(button.getAttribute('aria-controls'));
    const close = (focus = false) => {
      if (button.getAttribute('aria-expanded') !== 'true') return;
      button.setAttribute('aria-expanded', 'false');
      if (focus) button.focus({ preventScroll: true });
    };
    header.dataset.menuReady = '';
    button.addEventListener('click', () => {
      if (button.getAttribute('aria-expanded') === 'true') close();
      else {
        button.setAttribute('aria-expanded', 'true');
        links.querySelector('a')?.focus({ preventScroll: true });
      }
    });
    links.addEventListener('click', event => {
      if (event.target.closest('a')) close();
    });
    document.addEventListener('click', event => {
      if (!header.contains(event.target)) close();
    });
    document.addEventListener('keydown', event => {
      if (event.key === 'Escape' && phone.matches && header.contains(document.activeElement) && button.getAttribute('aria-expanded') === 'true') {
        event.preventDefault();
        close(true);
      };
    });
    phone.addEventListener('change', event => {
      if (!event.matches) close();
    });
    window.addEventListener('hashchange', () => close());
  }
})();
