import { escapeHtml } from "/js/home/util.js";
import { setupProtectedActions } from "/js/home/protected.js";
import { showConfirm } from "/js/ui/popups.js";

let currentUser = null;

async function loadCurrentUser() {
  const token = localStorage.getItem("token");

  if (!token) {
    currentUser = null;
    return;
  }

  try {
    const res = await fetch("/api/users/me", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!res.ok) {
      currentUser = null;
      return;
    }

    currentUser = await res.json();
  } catch {
    currentUser = null;
  }
}

export function renderGames(games) {
  const cards = document.getElementById("games-cards");
  if (!cards) return;

  cards.innerHTML = "";

  if (games.length === 0) {
    cards.innerHTML = `
      <article class="card">
        <div class="card-img"></div>
        <div class="card-meta">
          <div class="meta-title">No games found</div>
          <div class="meta-sub">Try another location</div>
        </div>
      </article>
    `;
    return;
  }

  for (const g of games) {
    const article = document.createElement("article");
    article.className = "card";

    const sport = escapeHtml(g.sport || "Game");
    const type = escapeHtml(g.type || "pickup");
    const title = `${sport} — ${type}`;

    const joinedArr = g.players || [];
    const joined = Array.isArray(joinedArr) ? joinedArr.length : 0;
    const needed = Number(g.peopleNeeded || 0);

    const isJoined = Array.isArray(g.players)
      && currentUser
      && g.players.some((p) => {
        if (typeof p === "string") return p === currentUser._id;
        if (p && typeof p === "object") return p._id === currentUser._id;
        return false;
      });

    const date = escapeHtml(g.date || "");
    const time = escapeHtml(g.startTime || "");

    const locationText = escapeHtml(g.locationName || "Unknown place");

    const mapsUrl = g.locationPlaceId
      ? `https://www.google.com/maps/search/?api=1&query_place_id=${encodeURIComponent(g.locationPlaceId)}`
      : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(g.locationName || "")}`;

    const imgSrc =
      `/api/places/photo?placeId=${encodeURIComponent(g.locationPlaceId || "")}` +
      `&lat=${encodeURIComponent(g.locationLat ?? "")}` +
      `&lng=${encodeURIComponent(g.locationLng ?? "")}` +
      `&maxwidth=800`;

    article.innerHTML = `
      <div class="card-img">
        <a href="${mapsUrl}" target="_blank">
          <img class="venue-img" src="${imgSrc}">
        </a>
      </div>

      <div class="card-meta">
        <div class="meta-title">${title}</div>

        <div class="meta-sub">
          <strong>Date:</strong> ${date} • ${time}
        </div>

        <div class="meta-sub">
          <strong>Players:</strong> ${joined}/${needed}
        </div>

        <div class="meta-sub">
          <a href="${mapsUrl}" target="_blank">${locationText}</a>
        </div>

        <button class="btn btn-outline join-btn" data-game-id="${g._id}">
          ${isJoined ? "Leave" : "Join"}
        </button>

        <button class="btn btn-outline info-btn">
          More info
        </button>
      </div>
    `;

    const infoBtn = article.querySelector(".info-btn");
    infoBtn.addEventListener("click", () => {
      const playersText = Array.isArray(g.players) && g.players.length
        ? g.players
            .map((p) => {
              if (typeof p === "string") return p;
              return p.username ? `@${p.username}` : p._id;
            })
            .join(", ")
        : "No players yet";

      showConfirm(`
        <strong>${sport}</strong><br>
        ${date} - ${time}<br><br>
        Players:<br>
        ${playersText}
      `);
    });

    cards.appendChild(article);
  }

  setupProtectedActions();
}

export async function loadGamesIntoCarousel() {
  const cards = document.getElementById("games-cards");
  if (!cards) return;

  try {
    await loadCurrentUser();

    const res = await fetch("/api/games");
    const games = await res.json();

    if (!res.ok || !Array.isArray(games)) return;

    renderGames(games);
  } catch (err) {
    console.error("Could not load games:", err);
  }

  setupProtectedActions();
}