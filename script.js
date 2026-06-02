const shell = document.querySelector("[data-horizontal]");
const progress = document.querySelector("[data-progress]");
const navLinks = document.querySelectorAll('a[href^="#"]');

const updateProgress = () => {
  if (!shell || !progress) return;
  const max = shell.scrollWidth - shell.clientWidth;
  const ratio = max > 0 ? shell.scrollLeft / max : 0;
  progress.style.width = `${Math.max(0, Math.min(1, ratio)) * 100}%`;
};

shell?.addEventListener(
  "wheel",
  (event) => {
    if (Math.abs(event.deltaY) > Math.abs(event.deltaX)) {
      event.preventDefault();
      shell.scrollLeft += event.deltaY;
    }
  },
  { passive: false }
);

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
