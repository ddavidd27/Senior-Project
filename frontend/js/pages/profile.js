const token = localStorage.getItem("token");

if (!token) {
  window.location.href = "/login";
}

const nameEl = document.getElementById("name");
const usernameEl = document.getElementById("username");
const bioEl = document.getElementById("bio");
const sportsList = document.getElementById("sportsList");
const editBtn = document.getElementById("editBtn");

const editSection = document.getElementById("editSection");
const editProfileForm = document.getElementById("editProfileForm");
const cancelEditBtn = document.getElementById("cancelEditBtn");

const editBio = document.getElementById("editBio");

const editSport1 = document.getElementById("editSport1");
const editSport1Level = document.getElementById("editSport1Level");
const editSport2 = document.getElementById("editSport2");
const editSport2Level = document.getElementById("editSport2Level");
const editSport3 = document.getElementById("editSport3");
const editSport3Level = document.getElementById("editSport3Level");

let currentUser = null;

async function loadProfile() {
  try {
    const res = await fetch("/api/users/me", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!res.ok) {
      throw new Error("No se pudo cargar el perfil");
    }

    const data = await res.json();
    currentUser = data;

    renderProfile(data);
  } catch (err) {
    console.error("Error loading profile:", err);
  }
}

function renderProfile(data) {
  nameEl.textContent =
    `${data.firstName || ""} ${data.lastName || ""}`.trim() || "No name";

  usernameEl.textContent = "@" + (data.username || "");
  bioEl.textContent = data.bio || "Sin bio";

  sportsList.innerHTML = "";

  if (Array.isArray(data.sports) && data.sports.length > 0) {
    data.sports.forEach((sport) => {
      const li = document.createElement("li");
      li.textContent = `${sport.name} — ${sport.level}`;
      sportsList.appendChild(li);
    });
  } else {
    const li = document.createElement("li");
    li.textContent = "No sports added";
    sportsList.appendChild(li);
  }
}

async function loadMatches() {
  try {
    const res = await fetch("/api/games/my", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!res.ok) throw new Error("Error cargando partidos");

    const matches = await res.json();

    const list = document.getElementById("matchesList");
    list.innerHTML = "";

    if (matches.length === 0) {
      list.innerHTML = "<li>No matches yet</li>";
      return;
    }

    matches.forEach((match) => {
      const li = document.createElement("li");
      li.textContent = `${match.sport} — ${match.date} at ${match.startTime}`;
      list.appendChild(li);
    });
  } catch (err) {
    console.error(err);
  }
}

function fillEditForm(user) {
  editBio.value = user.bio || "";

  const sports = Array.isArray(user.sports) ? user.sports : [];

  editSport1.value = sports[0]?.name || "";
  editSport1Level.value = sports[0]?.level || "beginner";

  editSport2.value = sports[1]?.name || "";
  editSport2Level.value = sports[1]?.level || "beginner";

  editSport3.value = sports[2]?.name || "";
  editSport3Level.value = sports[2]?.level || "beginner";
}

editBtn.addEventListener("click", () => {
  if (!currentUser) return;

  fillEditForm(currentUser);
  editSection.style.display = "block";
});

cancelEditBtn.addEventListener("click", () => {
  editSection.style.display = "none";
});

editProfileForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const sports = [
    editSport1.value.trim()
      ? { name: editSport1.value.trim(), level: editSport1Level.value }
      : null,
    editSport2.value.trim()
      ? { name: editSport2.value.trim(), level: editSport2Level.value }
      : null,
    editSport3.value.trim()
      ? { name: editSport3.value.trim(), level: editSport3Level.value }
      : null,
  ].filter(Boolean);

  if (sports.length < 1) {
    alert("At least one sport is required");
    return;
  }

  try {
    const res = await fetch("/api/users/me", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        bio: editBio.value.trim(),
        sports,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      alert(data.error || "Error updating profile");
      return;
    }

    currentUser = data;
    renderProfile(data);
    editSection.style.display = "none";
  } catch (err) {
    console.error(err);
    alert("Error updating profile");
  }
});

loadProfile();
loadMatches();