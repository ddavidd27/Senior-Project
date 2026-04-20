const token = localStorage.getItem("token");

if (!token) {
  window.location.href = "/login";
}

const params = new URLSearchParams(window.location.search);
const profileId = params.get("id");
const isOwnProfile = !profileId;

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

const matchesList = document.getElementById("matchesList");
const matchesSection = matchesList ? matchesList.closest(".profile-section") : null;

const avatarEl = document.getElementById("avatar");
const avatarPickerEdit = document.getElementById("avatarPickerEdit");
const editAvatarInput = document.getElementById("editAvatar");

if (avatarPickerEdit) {
  avatarPickerEdit.addEventListener("click", (e) => {
    if (e.target.tagName !== "IMG") return;

    const selected = e.target.dataset.avatar;
    editAvatarInput.value = selected;

    avatarPickerEdit.querySelectorAll("img").forEach(img => {
      img.style.border = "2px solid transparent";
    });

    e.target.style.border = "2px solid #2563eb";
  });
}

let currentUser = null;

async function loadProfile() {
  try {
    const url = isOwnProfile ? "/api/users/me" : `/api/users/${profileId}`;

    const res = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!res.ok) {
      throw new Error("Could not load profile");
    }

    const data = await res.json();
    currentUser = data;

    renderProfile(data);

    if (!isOwnProfile) {
      if (editBtn) editBtn.style.display = "none";
      if (editSection) editSection.style.display = "none";
      if (matchesSection) matchesSection.style.display = "none";
      return;
    }

    if (editBtn) editBtn.style.display = "";
    if (matchesSection) matchesSection.style.display = "";
  } catch (err) {
    console.error("Error loading profile:", err);
  }
}

function renderProfile(data) {
  avatarEl.src = `/images/avatar/${data.avatar || "user.png"}`;

  nameEl.textContent =
    `${data.firstName || ""} ${data.lastName || ""}`.trim() || "No name";

  setTimeout(() => {
    usernameEl.textContent = data.username ? `@${data.username}` : "";
  }, 0);
  bioEl.textContent = data.bio || "No bio yet";

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
  if (!isOwnProfile) return;

  try {
    const res = await fetch("/api/games/my", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!res.ok) throw new Error("Error loading matches");

    const matches = await res.json();

    matchesList.innerHTML = "";

    if (matches.length === 0) {
      matchesList.innerHTML = "<li>No matches yet</li>";
      return;
    }

    matches.forEach((match) => {
      const li = document.createElement("li");
      li.textContent = `${match.sport} — ${match.date} at ${match.startTime}`;
      matchesList.appendChild(li);
    });
  } catch (err) {
    console.error(err);
  }
}

function fillEditForm(user) {
  editBio.value = user.bio || "";

  editAvatarInput.value = user.avatar || "user.png";

  if (avatarPickerEdit) {
    avatarPickerEdit.querySelectorAll("img").forEach((img) => {
      img.style.border =
        img.dataset.avatar === (user.avatar || "user.png")
          ? "2px solid #2563eb"
          : "2px solid transparent";
    });
  }

  const sports = Array.isArray(user.sports) ? user.sports : [];

  editSport1.value = sports[0]?.name || "";
  editSport1Level.value = sports[0]?.level || "beginner";

  editSport2.value = sports[1]?.name || "";
  editSport2Level.value = sports[1]?.level || "beginner";

  editSport3.value = sports[2]?.name || "";
  editSport3Level.value = sports[2]?.level || "beginner";
}

if (editBtn) {
  editBtn.addEventListener("click", () => {
    if (!currentUser) return;

    fillEditForm(currentUser);
    editSection.style.display = "block";
  });
}

if (cancelEditBtn) {
  cancelEditBtn.addEventListener("click", () => {
    editSection.style.display = "none";
  });
}

if (editProfileForm) {
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
          avatar: editAvatarInput.value,
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
}

loadProfile();
loadMatches();