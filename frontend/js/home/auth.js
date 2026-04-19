import { getToken } from "/js/home/util.js";

export async function checkAuthAndUpdateUI() {
  const token = getToken();
  if (!token) return null;

  try {
    const res = await fetch("/api/users/me", {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!res.ok) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      return null;
    }

    const me = await res.json();

    const el = document.getElementById("username");
    if (el) el.textContent = me.firstName;

    localStorage.setItem("user", JSON.stringify(me));

    const chatLink = document.getElementById("chatLink");
    if (chatLink) chatLink.style.display = "inline-block";

    return me;
  } catch (err) {
    console.error(err);
    return null;
  }
}

export function requireLogin(nextUrl = "/") {
  const token = getToken();
  if (!token) {
    sessionStorage.setItem("redirectAfterLogin", nextUrl);
    window.location.href = "/login";
    return null;
  }
  return token;
}