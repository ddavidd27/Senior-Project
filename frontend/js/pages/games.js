import { checkAuthAndUpdateUI } from "/js/home/auth.js";
import { setupLoginLink } from "/js/home/dropdown.js";
import { showError, showSuccess } from "/js/ui/popups.js";

const gamesContainer = document.getElementById("gamesContainer");
const sportFilter = document.getElementById("sportFilter");
const levelFilter = document.getElementById("levelFilter");
const typeFilter = document.getElementById("typeFilter");
const dateFilter = document.getElementById("dateFilter");
const clearFiltersBtn = document.getElementById("clearFiltersBtn");
const createGameBtn = document.getElementById("createGameBtn");

let allGames = [];
let currentUser = null;
let sportsList = [];

async function loadSports() {
  const res = await fetch("/api/sports");
  sportsList = await res.json();
}

init();

async function init() {
      setupLoginLink();         
  await checkAuthAndUpdateUI();  
  await loadCurrentUser();
  await loadGames();
  updateHeroTitle();
  await loadSports();
  populateSportFilter();
  renderGames();

  sportFilter.addEventListener("change", renderGames);
  levelFilter.addEventListener("change", renderGames);
  typeFilter.addEventListener("change", renderGames);
  dateFilter.addEventListener("change", renderGames);

  clearFiltersBtn.addEventListener("click", clearFilters);
  createGameBtn.addEventListener("click", () => {
    window.location.href = "/create.html";
  });
}

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
  } catch (error) {
    console.error("Error loading current user:", error);
    currentUser = null;
  }
}

async function loadGames() {
  try {
    const params = new URLSearchParams(window.location.search);

    const location = params.get("location");
    const lat = params.get("lat");
    const lng = params.get("lng");
    const radius = params.get("radius") || "10";

    let url = "/api/games";

    if (location) {
      url += `?location=${encodeURIComponent(location)}&radius=${encodeURIComponent(radius)}`;
    } else if (lat && lng) {
      url += `?lat=${encodeURIComponent(lat)}&lng=${encodeURIComponent(lng)}&radius=${encodeURIComponent(radius)}`;
    }

    const res = await fetch(url);
    const data = await res.json();

    allGames = Array.isArray(data) ? data : [];
  } catch (error) {
    console.error("Error loading games:", error);
    allGames = [];
  }
}

function updateHeroTitle() {
  const heroTitle = document.querySelector(".games-hero h1");
  if (!heroTitle) return;

  const params = new URLSearchParams(window.location.search);
  const location = params.get("location");
  const lat = params.get("lat");
  const lng = params.get("lng");

  if (location) {
    heroTitle.textContent = `Games near ${location}`;
  } else if (lat && lng) {
    heroTitle.textContent = "Games near you";
  } else {
    heroTitle.textContent = "Find games by sport";
  }
}

function populateSportFilter() {
  sportFilter.innerHTML = `<option value="">All sports</option>`;

  const sortedSports = sortSports(sportsList);

  for (const sport of sortedSports) {
    const option = document.createElement("option");
    option.value = sport;
    option.textContent = capitalizeWords(sport);
    sportFilter.appendChild(option);
  }
}

function getFavoriteSports() {
  if (!currentUser || !Array.isArray(currentUser.sports)) return [];

  return currentUser.sports
    .map(sport => sport.name?.trim().toLowerCase())
    .filter(Boolean);
}

function getFilteredGames() {
  return allGames.filter(game => {
    const matchesSport =
      !sportFilter.value || game.sport === sportFilter.value;

    const matchesLevel =
      !levelFilter.value || game.level === levelFilter.value;

    const matchesType =
      !typeFilter.value || game.type === typeFilter.value;

    const matchesDate =
      !dateFilter.value || game.date === dateFilter.value;

    return matchesSport && matchesLevel && matchesType && matchesDate;
  });
}

function groupGamesBySport(games) {
  const grouped = {};

  for (const game of games) {
    const sport = game.sport || "other";

    if (!grouped[sport]) {
      grouped[sport] = [];
    }

    grouped[sport].push(game);
  }

  return grouped;
}

function sortSports(sportNames) {
  const favorites = getFavoriteSports();

  return sportNames.sort((a, b) => {
    const aIndex = favorites.indexOf(a.toLowerCase());
    const bIndex = favorites.indexOf(b.toLowerCase());

    const aIsFavorite = aIndex !== -1;
    const bIsFavorite = bIndex !== -1;

    if (aIsFavorite && bIsFavorite) {
      return aIndex - bIndex;
    }

    if (aIsFavorite) return -1;
    if (bIsFavorite) return 1;

    return a.localeCompare(b);
  });
}

function renderGames() {
  const filteredGames = getFilteredGames();
  const groupedGames = groupGamesBySport(filteredGames);

  gamesContainer.innerHTML = "";

  if (filteredGames.length === 0) {
    gamesContainer.innerHTML = `
      <div class="empty-games">
        <p>There are no games yet. Create one.</p>
      </div>
    `;
    return;
  }

  const sortedSports = sortSports(Object.keys(groupedGames));

  for (const sport of sortedSports) {
    const section = document.createElement("section");
    section.className = "sport-section";

    const title = document.createElement("h2");
    title.className = "sport-title";
    title.textContent = capitalizeWords(sport);

    const cardsWrapper = document.createElement("div");
    cardsWrapper.className = "sport-games-grid";

    const gamesForSport = groupedGames[sport] || [];
    const visibleGames = gamesForSport.slice(0, 6);

    for (const game of visibleGames) {
    const card = createGameCard(game);
    cardsWrapper.appendChild(card);
    }

    section.appendChild(title);
    section.appendChild(cardsWrapper);

    if (gamesForSport.length > 6) {
    const moreBtn = document.createElement("button");
    moreBtn.textContent = "See more";
    moreBtn.className = "see-more-btn";

    moreBtn.addEventListener("click", () => {
        cardsWrapper.innerHTML = "";

        for (const game of gamesForSport) {
        const card = createGameCard(game);
        cardsWrapper.appendChild(card);
        }

        moreBtn.remove(); 
    });

    section.appendChild(moreBtn);
    }

    gamesContainer.appendChild(section);
    }
}


function createGameCard(game) {
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

      <button class="join-btn">Join</button>
    </div>
  `;

  const joinBtn = card.querySelector(".join-btn");
  joinBtn.addEventListener("click", () => joinGame(game._id));

  return card;
}

async function joinGame(gameId) {
  const token = localStorage.getItem("token");

  if (!token) {
    sessionStorage.setItem("redirectAfterLogin", "/games.html");
    window.location.href = "/login.html";
    return;
  }

  try {
    const res = await fetch(`/api/games/${gameId}/join`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await res.json();

    if (!res.ok) {
      showError(data.error || data.message || "Could not join game");
      return;
    }

    showSuccess("Joined game successfully");
    
    await loadGames();
    renderGames();
  } catch (error) {
    console.error("Error joining game:", error);
    showError("Something went wrong while joining the game");
  }
}

function clearFilters() {
  sportFilter.value = "";
  levelFilter.value = "";
  typeFilter.value = "";
  dateFilter.value = "";

  const url = new URL(window.location.href);
  url.searchParams.delete("location");
  url.searchParams.delete("lat");
  url.searchParams.delete("lng");
  url.searchParams.delete("radius");

  window.location.href = url.pathname;
}

function capitalizeWords(text = "") {
  return text
    .split(" ")
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}