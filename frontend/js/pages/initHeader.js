import { setupLoginLink } from "/js/home/dropdown.js";
import { checkAuthAndUpdateUI } from "/js/home/auth.js";
import { refreshFriendRequestBadge } from "/js/home/dropdown.js";
import { refreshRatingsBadge } from "/js/home/ratings.js";

document.addEventListener("DOMContentLoaded", async () => {
  await checkAuthAndUpdateUI();
  setupLoginLink();
  await refreshFriendRequestBadge();
  await refreshRatingsBadge();

  const menuToggle = document.getElementById("menuToggle");
  const mainNav = document.getElementById("mainNav");
  const overlay = document.getElementById("navOverlay");

  if (!menuToggle || !mainNav || !overlay) return;

  function openMenu() {
    mainNav.classList.add("open");
    overlay.classList.add("active");
    menuToggle.classList.add("active");
    menuToggle.setAttribute("aria-expanded", "true");
    document.body.style.overflow = "hidden";
  }

  function closeMenu() {
    mainNav.classList.remove("open");
    overlay.classList.remove("active");
    menuToggle.classList.remove("active");
    menuToggle.setAttribute("aria-expanded", "false");
    document.body.style.overflow = "";
  }

  menuToggle.addEventListener("click", () => {
    if (mainNav.classList.contains("open")) {
      closeMenu();
    } else {
      openMenu();
    }
  });

  overlay.addEventListener("click", closeMenu);

  mainNav.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      if (link.closest(".account-dropdown")) return;
      closeMenu();
    });
  });

  window.addEventListener("resize", () => {
    if (window.innerWidth > 900) {
      closeMenu();
    }
  });
});