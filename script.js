function attachHorizontalNavigation(shell             , progress                    ) {
  const desktop = window.matchMedia("(min-width: 1001px)");
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
  const panels = [...shell.querySelectorAll(".panel")];
  let frame = 0;
  let queuedDelta = 0;

  const update = () => {
    const max = desktop.matches ? shell.scrollWidth - shell.clientWidth : document.documentElement.scrollHeight - window.innerHeight;
    const position = desktop.matches ? shell.scrollLeft : window.scrollY;
    if (progress) progress.style.width = `${max > 0 ? Math.min(100, Math.max(0, position / max * 100)) : 0}%`;
    const current = panels.reduce((best, panel) => {
      const rect = panel.getBoundingClientRect();
      const distance = Math.abs(desktop.matches ? rect.left : rect.top - 100);
      return distance < best.distance ? { id: panel.id, distance } : best;
    }, { id: "", distance: Infinity });
    document.querySelectorAll('.site-nav a, .scene-index a').forEach(link => {
      if (link.getAttribute("href") === "#" + current.id) link.setAttribute("aria-current", "location");
      else link.removeAttribute("aria-current");
    });
  };

  const nestedCanScroll = (event            , delta        ) => event.composedPath().some(node => {
    if (!(node instanceof HTMLElement) || node === shell || node === document.body || node === document.documentElement) return false;
    if (node.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(node.tagName)) return true;
    const overflow = getComputedStyle(node).overflowY;
    if (!/(auto|scroll)/.test(overflow) || node.scrollHeight <= node.clientHeight + 1) return false;
    return delta < 0 ? node.scrollTop > 0 : node.scrollTop < node.scrollHeight - node.clientHeight - 1;
  });

  const onWheel = (event            ) => {
    if (!desktop.matches || event.ctrlKey || event.metaKey || event.defaultPrevented) return;
    const raw = Math.abs(event.deltaX) > Math.abs(event.deltaY) ? event.deltaX : event.deltaY;
    if (!raw || nestedCanScroll(event, raw)) return;
    const scale = event.deltaMode === 1 ? 20 : event.deltaMode === 2 ? shell.clientWidth : 1;
    event.preventDefault();
    queuedDelta += raw * scale;
    if (!frame) frame = requestAnimationFrame(() => {
      shell.scrollLeft += queuedDelta;
      queuedDelta = 0;
      frame = 0;
    });
  };

  const onKey = (event               ) => {
    if (!desktop.matches || event.ctrlKey || event.metaKey || event.altKey || event.defaultPrevented) return;
    if (event.composedPath().some(node => node instanceof HTMLElement && (node.isContentEditable || /^(INPUT|TEXTAREA|SELECT|BUTTON)$/.test(node.tagName) || node.getAttribute("role") === "dialog"))) return;
    let left                    ;
    if (event.key === "ArrowRight") left = shell.scrollLeft + shell.clientWidth * .75;
    if (event.key === "ArrowLeft") left = shell.scrollLeft - shell.clientWidth * .75;
    if (event.key === "PageDown") left = shell.scrollLeft + shell.clientWidth;
    if (event.key === "PageUp") left = shell.scrollLeft - shell.clientWidth;
    if (event.key === "Home") left = 0;
    if (event.key === "End") left = shell.scrollWidth;
    if (left === undefined) return;
    event.preventDefault();
    shell.scrollTo({ left, behavior: reduced.matches ? "instant" : "smooth" });
  };

  const onBreakpoint = () => { shell.scrollLeft = 0; update(); };
  window.addEventListener("wheel", onWheel, { passive: false });
  window.addEventListener("keydown", onKey);
  window.addEventListener("resize", update);
  window.addEventListener("scroll", update, { passive: true });
  shell.addEventListener("scroll", update, { passive: true });
  desktop.addEventListener("change", onBreakpoint);
  update();
  return () => {
    if (frame) cancelAnimationFrame(frame);
    window.removeEventListener("wheel", onWheel);
    window.removeEventListener("keydown", onKey);
    window.removeEventListener("resize", update);
    window.removeEventListener("scroll", update);
    shell.removeEventListener("scroll", update);
    desktop.removeEventListener("change", onBreakpoint);
  };
}


const shell = document.querySelector('[data-horizontal]');
if (shell) {
  attachHorizontalNavigation(shell, document.querySelector('[data-progress]'));
  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', event => {
      const href = link.getAttribute('href');
      const target = href && href !== '#' ? document.getElementById(href.slice(1)) : null;
      if (!target) return;
      event.preventDefault();
      const behavior = matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth';
      if (matchMedia('(min-width: 1001px)').matches) shell.scrollTo({left:target.offsetLeft,behavior});
      else target.scrollIntoView({behavior,block:'start'});
    });
  });
}
fetch('content/site.json').then(r => r.ok ? r.json() : null).then(data => {
  data?.services?.forEach((service,index) => {
    const name = document.querySelector('[data-service-name="'+index+'"]');
    const price = document.querySelector('[data-service-price="'+index+'"]');
    if (name && service.name) name.textContent=service.name;
    if (price && service.price) price.textContent=service.price;
  });
}).catch(() => {});
