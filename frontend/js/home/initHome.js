import { setupLoginLink, refreshFriendRequestBadge } from "/js/home/dropdown.js";
import { checkAuthAndUpdateUI } from "/js/home/auth.js";
import { loadGamesIntoCarousel } from "/js/home/games.js";
import { initCarouselAndTopbar } from "/js/home/carousel.js";
import { showError } from "/js/ui/popups.js";

async function loadUpcomingGames() {
  const token = localStorage.getItem("token");
  const upcomingContainer = document.getElementById("upcomingContainer");
  const upcomingSection = document.getElementById("upcoming");

  if (!upcomingContainer || !upcomingSection) return;

  if (!token) {
    upcomingSection.style.display = "none";
    return;
  }

  try {
    const res = await fetch("/api/games/my", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const games = await res.json();

    if (!res.ok) {
      upcomingSection.style.display = "none";
      return;
    }

    if (!Array.isArray(games) || games.length === 0) {
      upcomingContainer.innerHTML = `
        <article class="card">
          <div class="card-meta">
            <div class="meta-title">No upcoming games</div>
            <div class="meta-sub">Join a game to see it here.</div>
          </div>
        </article>
      `;
      return;
    }

    const visibleGames = games.slice(0, 3);

    upcomingContainer.innerHTML = visibleGames.map((game) => {
      const joined = Array.isArray(game.players) ? game.players.length : 0;

      const mapsUrl = game.locationPlaceId
        ? `https://www.google.com/maps/search/?api=1&query_place_id=${encodeURIComponent(game.locationPlaceId)}`
        : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(game.locationName || "")}`;

      return `
        <article class="card">
          <div class="card-meta">
            <div class="meta-title">${game.sport} — ${game.type}</div>
            <div class="meta-sub">${game.date} • ${game.startTime}</div>
            <div class="meta-sub">${joined}/${game.peopleNeeded} players</div>
            <div class="meta-sub">
              <a href="${mapsUrl}" target="_blank" class="maps-link">
                ${game.locationName || "View location"}
              </a>
            </div>
          </div>
        </article>
      `;
    }).join("");
  } catch (err) {
    console.error("Could not load upcoming games:", err);
    upcomingSection.style.display = "none";
  }
}

document.addEventListener("DOMContentLoaded", async () => {
  setupLoginLink();
  await refreshFriendRequestBadge();
  setInterval(refreshFriendRequestBadge, 15000);
  await checkAuthAndUpdateUI();
  await loadGamesIntoCarousel();
  await loadUpcomingGames();
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