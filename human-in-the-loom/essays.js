(() => {
  const list = document.querySelector('[data-essay-list]');
  if (!list) return;

  const makeEssay = (essay) => {
    const link = document.createElement('a');
    link.className = 'essay';
    link.href = essay.url;

    const heading = document.createElement('div');
    const meta = document.createElement('span');
    meta.textContent = `${essay.publication} · ${essay.date}`;
    const title = document.createElement('h3');
    title.textContent = essay.title;
    heading.append(meta, title);

    const description = document.createElement('p');
    description.textContent = essay.description;
    const arrow = document.createElement('b');
    arrow.setAttribute('aria-hidden', 'true');
    arrow.textContent = '↗';

    link.append(heading, description, arrow);
    return link;
  };

  fetch('essays.json')
    .then((response) => {
      if (!response.ok) throw new Error(`Essay feed returned ${response.status}`);
      return response.json();
    })
    .then(({ essays }) => {
      if (!Array.isArray(essays) || essays.length === 0) return;
      list.replaceChildren(...essays.map(makeEssay));
    })
    .catch(() => {
      // Preserve the curated HTML fallback when the generated snapshot is unavailable.
    });
})();
