const form = document.getElementById("createGameForm");
const errorMsg = document.getElementById("errorMsg");
const confirmMapBtn = document.getElementById("confirmMapBtn");
const selectedLocationPreview = document.getElementById("selectedLocationPreview");

let pendingLocation = null;


function requireTokenOrRedirect() {
  const token = localStorage.getItem("token");
  if (!token) {
    sessionStorage.setItem("redirectAfterLogin", "/create");
    window.location.href = "/login";
    return null;
  }
  return token;
}

const token = requireTokenOrRedirect();
if (!token) throw new Error("No token");

loadSportsIntoSelect();

const openMapBtn = document.getElementById("openMapBtn");
const closeMapBtn = document.getElementById("closeMapBtn");
const mapModal = document.getElementById("mapModal");

const locationNameEl = document.getElementById("locationName");
const locationLatEl = document.getElementById("locationLat");
const locationLngEl = document.getElementById("locationLng");
const locationPlaceIdEl = document.getElementById("locationPlaceId");

let map, marker, searchBox;
let mapInitialized = false;

function openModal() {
  mapModal.classList.remove("hidden");
  mapModal.setAttribute("aria-hidden", "false");
}

function closeModal() {
  mapModal.classList.add("hidden");
  mapModal.setAttribute("aria-hidden", "true");
}

function setPendingLocation({ name, lat, lng, placeId }) {
  pendingLocation = {
    name,
    lat,
    lng,
    placeId: placeId || "",
  };

  selectedLocationPreview.textContent = `Selected: ${name}`;
  confirmMapBtn.disabled = false;
}


function initMapOnce() {
  if (mapInitialized) return;
  if (!window.google || !google.maps || !google.maps.places) {
    console.error("Google Maps JS API not loaded (check API key + libraries=places).");
    errorMsg.textContent = "Map failed to load (Google API).";
    return;
  }

  const center = { lat: 40.4168, lng: -3.7038 };

  map = new google.maps.Map(document.getElementById("map"), {
    center,
    zoom: 12,
    mapTypeControl: false,
    streetViewControl: false,
    fullscreenControl: false,
  });

  const placesService = new google.maps.places.PlacesService(map);
  const geocoder = new google.maps.Geocoder();

  marker = new google.maps.Marker({ map });

  const input = document.getElementById("pac-input");
  searchBox = new google.maps.places.SearchBox(input);

  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
    }
  });

  map.addListener("bounds_changed", () => {
    searchBox.setBounds(map.getBounds());
  });

  searchBox.addListener("places_changed", () => {
    const places = searchBox.getPlaces();
    if (!places || !places.length) return;

    const place = places[0];
    if (!place.geometry || !place.geometry.location) return;

    const lat = place.geometry.location.lat();
    const lng = place.geometry.location.lng();

    marker.setPosition(place.geometry.location);
    map.panTo(place.geometry.location);
    map.setZoom(15);

    setPendingLocation({
      name: place.formatted_address || place.name || "",
      lat,
      lng,
      placeId: place.place_id || ""
    });
  });

  map.addListener("click", (e) => {
    if (e.placeId) {
      e.stop();

      placesService.getDetails(
        {
          placeId: e.placeId,
          fields: ["place_id", "name", "formatted_address", "geometry"],
        },
        (place, status) => {
          if (status !== google.maps.places.PlacesServiceStatus.OK || !place?.geometry?.location) {
            console.error("getDetails failed:", status);
            return;
          }

          const lat = place.geometry.location.lat();
          const lng = place.geometry.location.lng();

          marker.setPosition(place.geometry.location);
          map.panTo(place.geometry.location);
          map.setZoom(16);

          setPendingLocation({
            name: place.formatted_address || place.name || "",
            lat,
            lng,
            placeId: place.place_id || e.placeId,
          });
        }
      );

      return;
    }

    marker.setPosition(e.latLng);

    geocoder.geocode({ location: e.latLng }, (results, status) => {
      if (status === "OK" && results && results[0]) {
        setPendingLocation({
          name: results[0].formatted_address,
          lat: e.latLng.lat(),
          lng: e.latLng.lng(),
          placeId: "",
        });
      } else {
        setPendingLocation({
          name: `Lat ${e.latLng.lat().toFixed(5)}, Lng ${e.latLng.lng().toFixed(5)}`,
          lat: e.latLng.lat(),
          lng: e.latLng.lng(),
          placeId: "",
        });
      }
    });
  });

  mapInitialized = true;
}

openMapBtn?.addEventListener("click", () => {
  openModal();
  setTimeout(() => {
    initMapOnce();
    if (map) google.maps.event.trigger(map, "resize");
  }, 50);
});

closeMapBtn?.addEventListener("click", closeModal);
mapModal?.addEventListener("click", (e) => {
  if (e.target === mapModal) closeModal();
});

async function loadSportsIntoSelect() {
  const select = document.getElementById("sport");
  if (!select) return;

  try {
    const res = await fetch("/api/sports");
    const sports = await res.json();

    if (!res.ok || !Array.isArray(sports)) return;

    select.innerHTML = `<option value="">Select...</option>`;

    for (const sport of sports) {
      const option = document.createElement("option");
      option.value = sport;
      option.textContent = capitalizeWords(sport);
      select.appendChild(option);
    }
  } catch (err) {
    console.error("Could not load sports:", err);
  }
}

function capitalizeWords(text = "") {
  return text
    .split(" ")
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  errorMsg.textContent = "";

  try {
    const payload = {
      sport: document.getElementById("sport").value.trim().toLowerCase(),
      type: document.getElementById("type").value,
      date: document.getElementById("date").value,
      startTime: document.getElementById("startTime").value.trim(),
      level: document.getElementById("level").value,
      peopleNeeded: Number(document.getElementById("peopleNeeded").value),
      locationName: locationNameEl.value.trim(),

      locationLat: locationLatEl.value ? Number(locationLatEl.value) : null,
      locationLng: locationLngEl.value ? Number(locationLngEl.value) : null,
      locationPlaceId: locationPlaceIdEl.value || null,
    };

    const res = await fetch("/api/games", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });

    const data = await res.json();

    if (!res.ok) {
      errorMsg.textContent = data.error || "Could not create game";
      return;
    }

    window.location.href = "/";
  } catch (err) {
    console.error(err);
    errorMsg.textContent = "Server not reachable";
  }
});

confirmMapBtn?.addEventListener("click", () => {
  if (!pendingLocation) return;

  locationNameEl.value = pendingLocation.name;
  locationLatEl.value = String(pendingLocation.lat);
  locationLngEl.value = String(pendingLocation.lng);
  locationPlaceIdEl.value = pendingLocation.placeId;

  closeModal();
});
