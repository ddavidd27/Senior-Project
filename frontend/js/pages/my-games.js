import { checkAuthAndUpdateUI } from "/js/home/auth.js";
import { setupLoginLink } from "/js/home/dropdown.js";
import { showError, showSuccess, showConfirm } from "/js/ui/popups.js";

const container = document.getElementById("myGamesContainer");

init();

async function init() {
  setupLoginLink();
  await checkAuthAndUpdateUI();
  await loadMyGames();
}

async function loadMyGames() {
  const token = localStorage.getItem("token");

  if (!token) {
    window.location.href = "/login.html";
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
      showError(games.error || "Could not load your games");
      return;
    }

    renderMyGames(games);
  } catch (err) {
    console.error(err);
    showError("Could not load your games");
  }
}

function renderMyGames(games) {
  container.innerHTML = "";

  if (!games.length) {
    container.innerHTML = `
      <div class="empty-games">
        <p>You have no upcoming games yet.</p>
        <button type="button" onclick="window.location.href='/games.html'">Browse games</button>
      </div>
    `;
    return;
  }

  const grid = document.createElement("div");
  grid.className = "sport-games-grid";

  games.forEach((game) => {
    grid.appendChild(createMyGameCard(game));
  });

  container.appendChild(grid);
}

function createMyGameCard(game) {
  const card = document.createElement("article");
  card.className = "game-card";

  const joinedCount = Array.isArray(game.players) ? game.players.length : 0;

  const mapsUrl = game.locationPlaceId
    ? `https://www.google.com/maps/search/?api=1&query_place_id=${game.locationPlaceId}`
    : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(game.locationName || "")}`;

  const imageUrl = game.locationPlaceId
    ? `/api/places/photo?placeId=${game.locationPlaceId}`
    : null;

  card.innerHTML = `
    ${imageUrl ? `<img src="${imageUrl}" class="game-img" />` : ""}

    <div class="game-content">
      <h3>${capitalizeWords(game.sport)} - ${capitalizeWords(game.type)}</h3>

      <p><strong>Level:</strong> ${capitalizeWords(game.level)}</p>
      <p><strong>Date:</strong> ${game.date || "-"}</p>
      <p><strong>Time:</strong> ${game.startTime}</p>

      <p>
        <strong>Location:</strong> 
        <a href="${mapsUrl}" target="_blank" class="location-link">
          ${game.locationName || "View location"}
        </a>
      </p>

      <p><strong>Players:</strong> ${joinedCount}/${game.peopleNeeded}</p>

      <button class="join-btn leave-btn">Leave</button>
      <button class="join-btn info-btn">More info</button>
    </div>
  `;

  const leaveBtn = card.querySelector(".leave-btn");
  leaveBtn.addEventListener("click", () => {
    showConfirm("Leave this game?", async () => {
      await leaveGame(game._id);
    });
  });

  const infoBtn = card.querySelector(".info-btn");
  infoBtn.addEventListener("click", () => {
    showGameInfo(game);
  });

  return card;
}

async function leaveGame(gameId) {
  const token = localStorage.getItem("token");

  try {
    const res = await fetch(`/api/games/${gameId}/leave`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await res.json();

    if (!res.ok) {
      showError(data.error || "Could not leave game");
      return;
    }

    showSuccess("You left the game successfully");
    await loadMyGames();
  } catch (err) {
    console.error(err);
    showError("Error leaving game");
  }
}

function showGameInfo(game) {
  const playersText = Array.isArray(game.players) && game.players.length
    ? game.players
        .map((p) => p.username ? `@${p.username}` : p._id)
        .join(", ")
    : "No players yet";

  const creatorText = game.createdBy?.username
    ? `@${game.createdBy.username}`
    : "Unknown";

  showConfirm(`
    <strong>${capitalizeWords(game.sport)} - ${capitalizeWords(game.type)}</strong><br>
    ${game.date} - ${game.startTime}<br><br>
    Created by: ${creatorText}<br><br>
    Players:<br>
    ${playersText}
  `);
}

function capitalizeWords(text = "") {
  return text
    .split(" ")
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}