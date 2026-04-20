import { getToken } from "/js/home/util.js";
import { openFriendsModal, openRequestsModal } from "/js/home/modals.js";
import { openPendingRatingsModal, refreshRatingsBadge } from "/js/home/ratings.js";

export function setupLoginLink() {
  const loginLink = document.getElementById("loginLink");
  if (!loginLink) return;

  const token = getToken();

  if (!token) {
    loginLink.textContent = "Log in";
    loginLink.href = "/login";
    return;
  }

  let name = "Account";
  try {
    const cached = JSON.parse(localStorage.getItem("user") || "null");
    if (cached?.firstName) name = cached.firstName;
  } catch {}

  loginLink.textContent = `${name} ▾`;
  loginLink.href = "#";

  const existing = document.getElementById("accountMenu");
  if (existing) existing.remove();

  const menu = document.createElement("div");
  menu.id = "accountMenu";
  menu.style.position = "absolute";
  menu.style.top = "calc(100% + 8px)";
  menu.style.right = "0";
  menu.style.minWidth = "180px";
  menu.style.padding = "8px";
  menu.style.borderRadius = "12px";
  menu.style.boxShadow = "0 12px 30px rgba(0,0,0,0.15)";
  menu.style.background = "white";
  menu.style.display = "none";
  menu.style.zIndex = "9999";

  menu.innerHTML = `
    <button id="profileBtn" type="button" style="width:100%; text-align:left; padding:10px 12px; border:0; background:transparent; cursor:pointer;">
      Profile
    </button>
    <button id="friendsBtn" type="button" style="width:100%; text-align:left; padding:10px 12px; border:0; background:transparent; cursor:pointer;">
      Friends
    </button>
    <button id="friendRequestsBtn" type="button" style="width:100%; text-align:left; padding:10px 12px; border:0; background:transparent; cursor:pointer;">
      Friend requests
      <span id="reqBadge" style="margin-left:8px; background:#ff3b30; color:#fff; font-size:12px; padding:2px 8px; border-radius:999px; display:none;"></span>
    </button>
    <button id="ratingsBtn" type="button" style="width:100%; text-align:left; padding:10px 12px; border:0; background:transparent; cursor:pointer;">
      Ratings
      <span id="ratingsBadge" style="margin-left:8px; background:#2563eb; color:#fff; font-size:12px; padding:2px 8px; border-radius:999px; display:none;"></span>
    </button>
    <div style="height:1px; background:#eee; margin:6px 0;"></div>
    <button id="logoutBtn" type="button" style="width:100%; text-align:left; padding:10px 12px; border:0; background:transparent; cursor:pointer;">
      Log out
    </button>
  `;

  const parent = loginLink.parentElement;
  parent.style.position = "relative";
  parent.appendChild(menu);

  loginLink.addEventListener("click", (e) => {
    e.preventDefault();
    menu.style.display = menu.style.display === "none" ? "block" : "none";
  });


  menu.querySelector("#profileBtn").addEventListener("click", () => {
    menu.style.display = "none";
    window.location.href = "/profile";
  });

  menu.querySelector("#friendsBtn").addEventListener("click", () => {
    menu.style.display = "none";
    openFriendsModal();
  });

  menu.querySelector("#friendRequestsBtn").addEventListener("click", () => {
    menu.style.display = "none";
    openRequestsModal();
  });

  menu.querySelector("#ratingsBtn").addEventListener("click", () => {
    menu.style.display = "none";
    openPendingRatingsModal();
  });

  menu.querySelector("#logoutBtn").addEventListener("click", () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    sessionStorage.removeItem("redirectAfterLogin");
    window.location.reload();
  });

  document.addEventListener("click", (e) => {
    if (!menu.contains(e.target) && e.target !== loginLink) {
      menu.style.display = "none";
    }
  });
}
export async function refreshFriendRequestBadge() {
  const token = getToken();
  if (!token) return;

  try {
    const res = await fetch("/api/users/me", {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!res.ok) return;

    const me = await res.json();
    localStorage.setItem("user", JSON.stringify(me));

    const badge = document.getElementById("reqBadge");
    if (!badge) return;

    const n = (me.friendRequests || []).length;

    if (n > 0) {
      badge.textContent = String(n);
      badge.style.display = "inline-block";
    } else {
      badge.style.display = "none";
    }
  } catch (e) {
    console.log("badge refresh error:", e);
  }
}