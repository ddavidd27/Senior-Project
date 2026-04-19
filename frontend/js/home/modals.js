import { escapeHtml, getToken } from "/js/home/util.js";
import { requireLogin } from "/js/home/auth.js";

function ensureModalRoot() {
  let root = document.getElementById("modalRoot");
  if (!root) {
    root = document.createElement("div");
    root.id = "modalRoot";
    root.style.position = "fixed";
    root.style.inset = "0";
    root.style.background = "rgba(0,0,0,0.35)";
    root.style.display = "none";
    root.style.alignItems = "center";
    root.style.justifyContent = "center";
    root.style.zIndex = "99999";
    document.body.appendChild(root);
  }
  return root;
}

function openModal(html) {
  const root = ensureModalRoot();
  root.innerHTML = `
    <div style="width:min(520px, 92vw); background:white; border-radius:16px; padding:16px; box-shadow:0 20px 60px rgba(0,0,0,0.25);">
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px;">
        <div style="font-weight:700;">Play4All</div>
        <button id="closeModalBtn" style="border:0; background:transparent; font-size:18px; cursor:pointer;">✕</button>
      </div>
      ${html}
    </div>
  `;
  root.style.display = "flex";
  root.querySelector("#closeModalBtn").onclick = () => (root.style.display = "none");
  root.onclick = (e) => { if (e.target === root) root.style.display = "none"; };
  return root;
}

export function openFriendsModal() {
  const token = requireLogin("/");
  if (!token) return;

  openModal(`
    <div style="margin-bottom:10px;">
      <div style="font-weight:600; margin-bottom:6px;">Add friend</div>
      <input id="addFriendUsername" placeholder="username (ej: carlos)" style="width:100%; padding:10px; border-radius:10px; border:1px solid #ddd;">
      <button id="sendFriendReqBtn" style="margin-top:10px; padding:10px 12px; border-radius:10px; border:0; cursor:pointer;">
        Send request
      </button>
      <div id="addFriendMsg" style="margin-top:10px; font-size:14px;"></div>
    </div>
  `);

  document.getElementById("sendFriendReqBtn").onclick = async () => {
    const username = (document.getElementById("addFriendUsername").value || "").trim();
    const msg = document.getElementById("addFriendMsg");

    if (!username) { msg.textContent = "Write a username."; return; }

    const res = await fetch("/api/users/friends/request", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ username }),
    });

    const data = await res.json();
    if (!res.ok) {
      msg.textContent = data.error || "Could not send request";
      return;
    }
    msg.textContent = "✅ Friend request sent!";
  };
}

export async function openRequestsModal() {
  const token = requireLogin("/");
  if (!token) return;

  const root = openModal(`
    <div style="font-weight:600; margin-bottom:10px;">Friend requests</div>
    <div id="reqList" style="display:flex; flex-direction:column; gap:10px;"></div>
    <div id="reqMsg" style="margin-top:10px; font-size:14px;"></div>
  `);

  const list = root.querySelector("#reqList");
  const msg = root.querySelector("#reqMsg");

  const res = await fetch("/api/users/friends/requests", {
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await res.json();

  if (!res.ok) {
    msg.textContent = data.error || "Could not load requests";
    return;
  }

  const requests = data.requests || [];
  if (requests.length === 0) {
    list.innerHTML = `<div style="opacity:.7;">No pending requests.</div>`;
    return;
  }

  list.innerHTML = requests.map(r => `
    <div style="border:1px solid #eee; border-radius:12px; padding:10px; display:flex; justify-content:space-between; gap:10px; align-items:center;">
      <div>
        <div style="font-weight:600;">${escapeHtml(r.firstName)} ${escapeHtml(r.lastName)} (@${escapeHtml(r.username)})</div>
        <div style="font-size:13px; opacity:.7;">${escapeHtml(r.level || "")}</div>
      </div>
      <div style="display:flex; gap:8px;">
        <button data-accept="${r._id}" style="padding:8px 10px; border-radius:10px; border:0; cursor:pointer;">Accept</button>
        <button data-decline="${r._id}" style="padding:8px 10px; border-radius:10px; border:1px solid #ddd; background:white; cursor:pointer;">Decline</button>
      </div>
    </div>
  `).join("");

  list.querySelectorAll("[data-accept]").forEach(btn => {
    btn.onclick = async () => {
      const fromUserId = btn.getAttribute("data-accept");
      const r2 = await fetch("/api/users/friends/accept", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ fromUserId }),
      });
      const d2 = await r2.json();
      if (!r2.ok) { msg.textContent = d2.error || "Error accepting"; return; }
      msg.textContent = "✅ Friend added!";
      openRequestsModal();
    };
  });

  list.querySelectorAll("[data-decline]").forEach(btn => {
    btn.onclick = async () => {
      const fromUserId = btn.getAttribute("data-decline");
      const r2 = await fetch("/api/users/friends/decline", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ fromUserId }),
      });
      const d2 = await r2.json();
      if (!r2.ok) { msg.textContent = d2.error || "Error declining"; return; }
      msg.textContent = "✅ Declined";
      openRequestsModal();
    };
  });
}