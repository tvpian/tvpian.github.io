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
