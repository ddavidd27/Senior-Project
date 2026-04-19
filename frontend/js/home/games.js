import { escapeHtml } from "/js/home/util.js";
import { setupProtectedActions } from "/js/home/protected.js";


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

    const date = escapeHtml(g.date || "");
    const time = escapeHtml(g.startTime || "");

    const locationText = escapeHtml(g.locationName || "Unknown place");
    const subRest = `${date} ${time} • ${joined}/${needed} people`;

    const imgSrc =
      `/api/places/photo?placeId=${encodeURIComponent(g.locationPlaceId || "")}` +
      `&lat=${encodeURIComponent(g.locationLat ?? "")}` +
      `&lng=${encodeURIComponent(g.locationLng ?? "")}` +
      `&maxwidth=800`;

    const mapsUrl = g.locationPlaceId
      ? `https://www.google.com/maps/search/?api=1&query=Google&query_place_id=${encodeURIComponent(g.locationPlaceId)}`
      : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(g.locationName || "")}`;

    article.innerHTML = `
      <div class="card-img">
        <a href="${mapsUrl}" target="_blank">
          <img class="venue-img" src="${imgSrc}">
        </a>
      </div>
      <div class="card-meta">
        <div class="meta-title">${title}</div>
        <div class="meta-sub">
          <a href="${mapsUrl}" target="_blank">${locationText}</a>
          • ${escapeHtml(subRest)}
        </div>
        <button class="btn btn-outline join-btn" data-game-id="${g._id}">Join</button>
      </div>
    `;

    cards.appendChild(article);
  }

  setupProtectedActions();
}

export async function loadGamesIntoCarousel() {
  const cards = document.getElementById("games-cards");
  if (!cards) return;

  try {
    const res = await fetch("/api/games");
    const games = await res.json();
    if (!res.ok || !Array.isArray(games)) return;

    renderGames(games);
  } catch (err) {
    console.error("Could not load games:", err);
  }

    setupProtectedActions();
  }