import { setupLoginLink, refreshFriendRequestBadge } from "/js/home/dropdown.js";
import { checkAuthAndUpdateUI } from "/js/home/auth.js";
import { loadGamesIntoCarousel, renderGames } from "/js/home/games.js";
import { initCarouselAndTopbar } from "/js/home/carousel.js";
import { showError } from "/js/ui/popups.js";

document.addEventListener("DOMContentLoaded", async () => {
  setupLoginLink();
  await refreshFriendRequestBadge();
  setInterval(refreshFriendRequestBadge, 15000);
  await checkAuthAndUpdateUI();
  await loadGamesIntoCarousel();
  initCarouselAndTopbar();

  const form = document.querySelector(".search");
  const input = document.querySelector(".location");

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const value = input.value.trim();

    let url = "/games.html";

    if (value) {
      url += `?location=${encodeURIComponent(value)}&radius=10`;
    }

    window.location.href = url;
  });

  const useLocationBtn = document.getElementById("useLocationBtn");

  if (useLocationBtn) {
    useLocationBtn.addEventListener("click", () => {
      if (!navigator.geolocation) {
        showError("Could not get your location.");
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;

          window.location.href = `/games.html?lat=${encodeURIComponent(lat)}&lng=${encodeURIComponent(lng)}&radius=35`;
        },
        () => {
          showError("Could not get your location.");
        }
      );
    });
  }

  const faqItems = document.querySelectorAll(".faq-item");

  if (faqItems.length) {
    faqItems.forEach((item) => {
      item.addEventListener("toggle", () => {
        if (item.open) {
          faqItems.forEach((other) => {
            if (other !== item) {
              other.open = false;
            }
          });
        }
      });
    });
  }
});