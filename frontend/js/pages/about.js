import { setupLoginLink } from "/js/home/dropdown.js";
import { checkAuthAndUpdateUI } from "/js/home/auth.js";

document.addEventListener("DOMContentLoaded", async () => {
  setupLoginLink();
  await checkAuthAndUpdateUI();

  const menuToggle = document.getElementById("menuToggle");
  const mainNav = document.getElementById("mainNav");
  const navOverlay = document.getElementById("navOverlay"); 
  const navLinks = document.querySelectorAll(".nav .pill"); 

  const closeMenu = () => {
    menuToggle.classList.remove("active");
    mainNav.classList.remove("open");
    if (navOverlay) navOverlay.classList.remove("active");
  };

  if (menuToggle && mainNav) {
    menuToggle.addEventListener("click", (e) => {
      e.stopPropagation(); 
      const isOpen = mainNav.classList.toggle("open");
      menuToggle.classList.toggle("active");
      if (navOverlay) navOverlay.classList.toggle("active", isOpen);
    });
  }

  if (navOverlay) {
    navOverlay.addEventListener("click", closeMenu);
  }

  navLinks.forEach(link => {
    link.addEventListener("click", closeMenu);
  });

  document.addEventListener("click", (e) => {
    if (mainNav && mainNav.classList.contains("open") && !mainNav.contains(e.target) && !menuToggle.contains(e.target)) {
      closeMenu();
    }
  });
});