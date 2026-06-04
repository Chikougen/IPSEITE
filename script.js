const shell = document.querySelector("[data-horizontal]");
const progress = document.querySelector("[data-progress]");
const navLinks = document.querySelectorAll('a[href^="#"]');
let wheelFrame = null;
let wheelDelta = 0;

const applySiteContent = async () => {
  try {
    const response = await fetch("content/site.json");
    if (!response.ok) return;
    const data = await response.json();

    data.services?.forEach((service, index) => {
      const name = document.querySelector(`[data-service-name="${index}"]`);
      const price = document.querySelector(`[data-service-price="${index}"]`);
      if (name && service.name) name.textContent = service.name;
      if (price && service.price) price.textContent = service.price;
    });

    if (data.contact?.email) {
      const email = document.querySelector("[data-contact-email]");
      const emailButton = document.querySelector("[data-contact-email-link]");
      const href = `mailto:${data.contact.email}?subject=Demande%20de%20rendez-vous%20Ips%C3%A9it%C3%A9`;
      if (email) {
        email.textContent = data.contact.email;
        email.href = `mailto:${data.contact.email}`;
      }
      if (emailButton) emailButton.href = href;
    }

    if (data.contact?.phone) {
      const phone = document.querySelector("[data-contact-phone]");
      if (phone) {
        phone.textContent = data.contact.phone;
        phone.href = `tel:${data.contact.phone.replace(/\s/g, "")}`;
      }
    }
  } catch {
    // The static HTML remains the fallback if the content file is unavailable.
  }
};

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
applySiteContent();

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
