const shell = document.querySelector("[data-horizontal]");
const progress = document.querySelector("[data-progress]");
const navLinks = document.querySelectorAll('a[href^="#"]');
let wheelFrame = null;
let wheelDelta = 0;

const updateProgress = () => {
  if (!shell || !progress) return;
  const max = shell.scrollWidth - shell.clientWidth;
  const ratio = max > 0 ? shell.scrollLeft / max : 0;
  progress.style.width = `${Math.max(0, Math.min(1, ratio)) * 100}%`;
};

const applyWheel = () => {
  if (!shell) return;
  shell.scrollLeft += wheelDelta;
  wheelDelta = 0;
  wheelFrame = null;
};

window.addEventListener(
  "wheel",
  (event) => {
    if (!shell) return;

    const delta = Math.abs(event.deltaX) > Math.abs(event.deltaY) ? event.deltaX : event.deltaY;
    if (!delta) return;

    event.preventDefault();
    wheelDelta += delta;

    if (!wheelFrame) {
      wheelFrame = requestAnimationFrame(applyWheel);
    }
  },
  { passive: false }
);

window.addEventListener("keydown", (event) => {
  if (!shell) return;

  if (event.key === "ArrowRight" || event.key === "PageDown") {
    event.preventDefault();
    shell.scrollBy({ left: window.innerWidth, behavior: "smooth" });
  }

  if (event.key === "ArrowLeft" || event.key === "PageUp") {
    event.preventDefault();
    shell.scrollBy({ left: -window.innerWidth, behavior: "smooth" });
  }
});

shell?.addEventListener("scroll", updateProgress, { passive: true });
window.addEventListener("resize", updateProgress);
updateProgress();

navLinks.forEach((link) => {
  link.addEventListener("click", (event) => {
    const target = document.querySelector(link.getAttribute("href"));
    if (!target || !shell) return;

    event.preventDefault();
    shell.scrollTo({
      left: target.offsetLeft,
      behavior: "smooth",
    });
  });
});
