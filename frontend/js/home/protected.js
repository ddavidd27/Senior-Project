import { requireLogin } from "/js/home/auth.js";
import { loadGamesIntoCarousel } from "/js/home/games.js";
import { showError } from "/js/ui/popups.js";

export function setupProtectedActions() {
  document.querySelectorAll(".join-btn").forEach((btn) => {
    if (btn.dataset.wired === "1") return;
    btn.dataset.wired = "1";

    btn.addEventListener("click", async () => {
      const gameId = btn.dataset.gameId;

      const token = requireLogin("/");
      if (!token) return;

      try {
        const res = await fetch(`/api/games/${gameId}/join`, {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
        });

        const data = await res.json();
        if (!res.ok) {
          showError(data.error || "Could not join");
          return;
        }

        await loadGamesIntoCarousel();
      } catch (err) {
        console.error(err);
        showError("Server error");
      }
    });
  });

  const createBtn = document.getElementById("createGameBtn");
  if (createBtn && createBtn.dataset.wired !== "1") {
    createBtn.dataset.wired = "1";
    createBtn.addEventListener("click", (e) => {
      e.preventDefault();
      const token = requireLogin("/create");
      if (!token) return;
      window.location.href = "/create.html";
    });
  }
}