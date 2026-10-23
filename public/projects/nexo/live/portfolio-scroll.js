// Only the automatic scroll is added. The page, styling and animation engine are original.
if (!matchMedia('(prefers-reduced-motion: reduce)').matches) {
  let elapsed = 0, previous = 0;
  const observer = new IntersectionObserver(entries => {
    active = entries[0].isIntersecting;
  });
  let active = true;
  observer.observe(document.body);
  function frame(now) {
    const dt = previous ? Math.min((now - previous) / 1000, 0.05) : 0;
    previous = now;
    if (!document.hidden) elapsed += dt;
    const cycle = elapsed % 46;
    const end = document.documentElement.scrollHeight - innerHeight;
    let y;
    if (cycle < 2) y = 0;
    else if (cycle < 30) y = end * (cycle - 2) / 28;
    else if (cycle < 33) y = end;
    else if (cycle < 45) y = end * (1 - (cycle - 33) / 12);
    else y = 0;
    window.scrollTo({ top: y, behavior: 'instant' });
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
}
