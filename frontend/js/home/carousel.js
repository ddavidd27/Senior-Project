export function initCarouselAndTopbar() {
  const cards = document.getElementById("games-cards");
  if (!cards) return;

  const carousel = cards.closest(".carousel");
  if (!carousel) return;

  const [prevBtn, nextBtn] = carousel.querySelectorAll(".arrow");
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function getStep() {
    const first = cards.querySelector(".card");
    if (!first) return 250;

    const styles = getComputedStyle(cards);
    const gap = parseFloat(styles.gap || styles.columnGap || "14") || 14;
    return first.getBoundingClientRect().width + gap;
  }

  function next() {
    const first = cards.firstElementChild;
    if (!first) return;

    const distance = getStep();

    if (reduced) {
      cards.appendChild(first);
      return;
    }

    cards.style.transition = "transform 0.35s ease";
    cards.style.transform = `translateX(-${distance}px)`;

    setTimeout(() => {
      cards.style.transition = "none";
      cards.style.transform = "none";
      cards.appendChild(first);
    }, 350);
  }

  function prev() {
    const last = cards.lastElementChild;
    if (!last) return;

    const distance = getStep();

    if (reduced) {
      cards.insertBefore(last, cards.firstElementChild);
      return;
    }

    cards.insertBefore(last, cards.firstElementChild);
    cards.style.transition = "none";
    cards.style.transform = `translateX(-${distance}px)`;

    requestAnimationFrame(() => {
      cards.style.transition = "transform 0.35s ease";
      cards.style.transform = "translateX(0)";
    });
  }

  nextBtn.addEventListener("click", prev);
  prevBtn.addEventListener("click", next);

  window.addEventListener("scroll", () => {
    const topbar = document.querySelector(".topbar");
    if (!topbar) return;

    if (window.scrollY > 10) topbar.classList.add("scrolled");
    else topbar.classList.remove("scrolled");
  });
}