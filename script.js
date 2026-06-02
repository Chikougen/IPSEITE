const menuButton = document.querySelector("[data-menu-toggle]");
const nav = document.querySelector("[data-nav]");
const filters = document.querySelectorAll("[data-filter]");
const looks = document.querySelectorAll("[data-kind]");

menuButton?.addEventListener("click", () => {
  const isOpen = nav.classList.toggle("is-open");
  menuButton.setAttribute("aria-expanded", String(isOpen));
});

nav?.addEventListener("click", (event) => {
  if (event.target.matches("a")) {
    nav.classList.remove("is-open");
    menuButton?.setAttribute("aria-expanded", "false");
  }
});

filters.forEach((filter) => {
  filter.addEventListener("click", () => {
    const active = filter.dataset.filter;

    filters.forEach((item) => item.classList.toggle("active", item === filter));
    looks.forEach((look) => {
      const shouldShow = active === "all" || look.dataset.kind === active;
      look.classList.toggle("is-hidden", !shouldShow);
    });
  });
});
