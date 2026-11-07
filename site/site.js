const shell = document.querySelector('.horizontal-shell');
const desktop = matchMedia('(min-width:1001px)');
const reduced = matchMedia('(prefers-reduced-motion:reduce)');
const dialog = document.querySelector('#album-dialog');
const albums = {
  nude: { title: 'Nude seconde peau', description: 'Des beiges et des rosés à choisir selon votre peau et vos envies.', images: [{ style: 'nude', alt: 'Exemple de manucure nude' }] },
  french: { title: 'French lait', description: 'Une base laiteuse, avec une french fine.', images: [{ style: 'french', alt: 'Exemple de french laiteuse' }] },
  burgundy: { title: 'Bordeaux de vigne', description: 'Du rouge profond au bordeaux foncé, en couleur unie.', images: [{ style: 'burgundy', alt: 'Exemple de manucure bordeaux' }] },
  signature: { title: 'Fleurs fines', description: 'Notre projet signature : un nail art très épuré. Un petit détail sur un ou deux ongles, sans charger la pose.', images: [{ style: 'signature', alt: 'Exemple de nail art minimaliste' }] },
};
let albumTrigger;
document.querySelectorAll('[data-album]').forEach(button => button.addEventListener('click', () => {
  const album = albums[button.dataset.album];
  albumTrigger = button;
  document.querySelector('#album-title').textContent = album.title;
  document.querySelector('#album-description').textContent = album.description;
  const images = document.querySelector('.album-images');
  images.replaceChildren(...album.images.map(item => {
    const image = document.createElement('div'); image.className = `nail-photo ${item.style}`;
    image.role = 'img'; image.setAttribute('aria-label', item.alt); return image;
  }));
  document.querySelector('.album-booking').href = 'https://wa.me/33768228951?text=' + encodeURIComponent(`Bonjour Ipséité, j’aimerais parler d’une pose inspirée de l’album « ${album.title} ».`);
  dialog.showModal(); document.body.classList.add('album-open');
}));
document.querySelector('.close-album').addEventListener('click', () => dialog.close());
dialog.addEventListener('click', event => {
  const rect = dialog.getBoundingClientRect();
  if (event.target === dialog && (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom)) dialog.close();
});
dialog.addEventListener('close', () => { document.body.classList.remove('album-open'); albumTrigger?.focus(); });
// Keep keyboard focus inside the modal, including when this document is embedded.
dialog.addEventListener('keydown', event => {
  if (event.key !== 'Tab') return;
  const controls = [...dialog.querySelectorAll('button, a[href], input, select, textarea, [tabindex="0"]')].filter(node => !node.disabled && node.getClientRects().length);
  const first = controls[0], last = controls[controls.length - 1];
  if (!first || !last) return;
  if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
  else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
});
function go(target, smooth = true) {
  const behavior = smooth && !reduced.matches ? 'smooth' : 'instant';
  if (desktop.matches) shell.scrollTo({ left: target.offsetLeft, behavior });
  else target.scrollIntoView({ behavior, block: 'start' });
}
document.querySelectorAll('a[href^="#"]').forEach(link => link.addEventListener('click', event => {
  const target = document.getElementById(link.hash.slice(1)); if (!target) return;
  event.preventDefault(); go(target); history.replaceState(null, '', link.hash);
}));
const panels = [...shell.querySelectorAll('.panel')];
let currentId = 'accueil';
function update() {
  const max = desktop.matches ? shell.scrollWidth - shell.clientWidth : document.documentElement.scrollHeight - innerHeight;
  const position = desktop.matches ? shell.scrollLeft : scrollY;
  document.querySelector('.progress span').style.width = `${max > 0 ? position / max * 100 : 0}%`;
  const current = panels.reduce((best, panel) => {
    const rect = panel.getBoundingClientRect(); const distance = Math.abs(desktop.matches ? rect.left : rect.top - 110);
    return distance < best.distance ? { id: panel.id, distance } : best;
  }, { id: '', distance: Infinity }); currentId = current.id;
  document.querySelectorAll('nav a').forEach(link => {
    if (link.hash === '#' + currentId) link.setAttribute('aria-current', 'location'); else link.removeAttribute('aria-current');
  });
}
function nestedCanScroll(event, delta) {
  return event.composedPath().some(node => {
    if (!(node instanceof HTMLElement) || node === shell || node === document.body || node === document.documentElement) return false;
    if (node.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(node.tagName)) return true;
    return /(auto|scroll)/.test(getComputedStyle(node).overflowY) && node.scrollHeight > node.clientHeight + 1 && (delta < 0 ? node.scrollTop > 0 : node.scrollTop < node.scrollHeight - node.clientHeight - 1);
  });
}
shell.addEventListener('wheel', event => {
  if (!desktop.matches || dialog.open || event.ctrlKey || event.metaKey || event.defaultPrevented) return;
  const delta = Math.abs(event.deltaX) > Math.abs(event.deltaY) ? event.deltaX : event.deltaY;
  if (!delta || nestedCanScroll(event, delta)) return;
  event.preventDefault(); shell.scrollLeft += delta * (event.deltaMode === 1 ? 20 : event.deltaMode === 2 ? shell.clientWidth : 1);
}, { passive: false });
document.addEventListener('keydown', event => {
  if (!desktop.matches || dialog.open || event.ctrlKey || event.metaKey || event.altKey || event.defaultPrevented || event.composedPath().some(node => node instanceof HTMLElement && (node.isContentEditable || /^(INPUT|TEXTAREA|SELECT|BUTTON|IFRAME)$/.test(node.tagName)))) return;
  const deltas = { ArrowRight: .75, ArrowLeft: -.75, PageDown: 1, PageUp: -1 };
  const left = event.key === 'Home' ? 0 : event.key === 'End' ? shell.scrollWidth : event.key in deltas ? shell.scrollLeft + shell.clientWidth * deltas[event.key] : undefined;
  if (left === undefined) return; event.preventDefault(); shell.scrollTo({ left, behavior: reduced.matches ? 'instant' : 'smooth' });
});
desktop.addEventListener('change', () => { const target = document.getElementById(currentId); shell.scrollLeft = 0; if (target) go(target, false); });
shell.addEventListener('scroll', update, { passive: true }); window.addEventListener('scroll', update, { passive: true }); window.addEventListener('resize', update); update();
if (location.hash) { const target = document.getElementById(location.hash.slice(1)); if (target) requestAnimationFrame(() => go(target, false)); }
