const form = document.getElementById("authForm");
const errorMsg = document.getElementById("errorMsg");

const title = document.getElementById("title");
const submitBtn = document.getElementById("submitBtn");
const toggleMode = document.getElementById("toggleMode");
const toggleText = document.getElementById("toggleText");

const firstName = document.getElementById("firstName");
const lastName = document.getElementById("lastName");
const username = document.getElementById("username");
const bio = document.getElementById("bio");

const sportsSection = document.getElementById("sportsSection");
const sport1 = document.getElementById("sport1");
const sport1Level = document.getElementById("sport1Level");
const sport2 = document.getElementById("sport2");
const sport2Level = document.getElementById("sport2Level");
const sport3 = document.getElementById("sport3");
const sport3Level = document.getElementById("sport3Level");

const email = document.getElementById("email");
const password = document.getElementById("password");

const avatarInput = document.getElementById("avatar");
const avatarPicker = document.getElementById("avatarPicker");

if (avatarPicker) {
  avatarPicker.addEventListener("click", (e) => {
    if (e.target.tagName !== "IMG") return;

    const selected = e.target.dataset.avatar;
    avatarInput.value = selected;

    avatarPicker.querySelectorAll("img").forEach(img => {
      img.style.border = "2px solid transparent";
    });
    e.target.style.border = "2px solid #2563eb";
  });
}

let mode = "login";

function setMode(nextMode) {
  mode = nextMode;
  errorMsg.textContent = "";
  const avatarSection = document.getElementById("avatarSection");

  const isSignup = mode === "signup";

  title.textContent = isSignup ? "Sign up" : "Login";
  submitBtn.textContent = isSignup ? "Create account" : "Login";

  firstName.style.display = isSignup ? "block" : "none";
  lastName.style.display = isSignup ? "block" : "none";
  username.style.display = isSignup ? "block" : "none";
  bio.style.display = isSignup ? "block" : "none";
  sportsSection.style.display = isSignup ? "block" : "none";
  avatarSection.style.display = isSignup ? "block" : "none";

  firstName.required = isSignup;
  lastName.required = isSignup;
  username.required = isSignup;
  sport1.required = isSignup;

  if (!isSignup) {
    firstName.value = "";
    lastName.value = "";
    username.value = "";
    bio.value = "";
    sport1.value = "";
    sport2.value = "";
    sport3.value = "";
    sport1Level.value = "beginner";
    sport2Level.value = "beginner";
    sport3Level.value = "beginner";
    avatarInput.value = "user.png";
  }

  toggleText.textContent = isSignup
    ? "Already have an account?"
    : "Don’t have an account?";
  toggleMode.textContent = isSignup ? "Log in" : "Sign up";
}

toggleMode.addEventListener("click", (e) => {
  e.preventDefault();
  setMode(mode === "login" ? "signup" : "login");
});

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  errorMsg.textContent = "";

  try {
    let url = "/api/users/login";
    let body = { email: email.value.trim(), password: password.value };

    if (mode === "signup") {
      url = "/api/users";

      const sports = [
        sport1.value.trim()
          ? { name: sport1.value.trim(), level: sport1Level.value }
          : null,
        sport2.value.trim()
          ? { name: sport2.value.trim(), level: sport2Level.value }
          : null,
        sport3.value.trim()
          ? { name: sport3.value.trim(), level: sport3Level.value }
          : null,
      ].filter(Boolean);

      body = {
        firstName: firstName.value.trim(),
        lastName: lastName.value.trim(),
        username: username.value.trim().toLowerCase(),
        email: email.value.trim(),
        password: password.value,
        bio: bio.value.trim(),
        sports,
        avatar: avatarInput.value,
      };
    }

    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const data = await res.json();

    if (!res.ok) {
      errorMsg.textContent =
        data.error ||
        (mode === "signup"
          ? "Signup failed (username/email may already exist)"
          : "Login failed (wrong credentials)");
      return;
    }

    localStorage.setItem("token", data.token);
    localStorage.setItem("user", JSON.stringify(data.user));

    const redirect = sessionStorage.getItem("redirectAfterLogin") || "/";
    sessionStorage.removeItem("redirectAfterLogin");
    window.location.href = redirect;
  } catch (err) {
    console.error(err);
    errorMsg.textContent = "No puedo conectar con el servidor";
  }
});

setMode("login");