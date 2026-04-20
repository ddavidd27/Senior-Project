function getToken() {
  return localStorage.getItem("token");
}

const token = getToken();
if (!token) {
  window.location.href = "/login";
}

const socket = io({ auth: { token } });

let me = null;               
let selectedFriend = null;   
let userCache = new Map();  
const composer = document.getElementById("composer");

function displayName(u) {
  if (!u) return "Unknown";
  const at = u.username ? ` (@${u.username})` : "";
  return `${u.firstName || ""} ${u.lastName || ""}`.trim() + at;
}

function setChatHeader(friend) {
  const title = document.getElementById("chatTitle");
  const sub = document.getElementById("chatSub");

  if (!friend) {
    title.textContent = "Pick a friend";
    sub.textContent = "Start chatting";
    if (composer) composer.classList.add("hidden");
    return;
  }

  title.textContent = `Talking to: ${displayName(friend)}`;
  sub.textContent = "Real-time messages via Socket.io";
  if (composer) composer.classList.remove("hidden");
}

function addMessage(msg) {
  const div = document.getElementById("messages");
  const el = document.createElement("div");

  const fromName = userCache.get(String(msg.from)) || String(msg.from).slice(0, 6);
  const isMe = me && String(msg.from) === String(me._id);

  el.className = `msg ${isMe ? "me" : ""}`;
  el.innerHTML = `
    <div class="meta">${fromName}</div>
    <div>${msg.text}</div>
  `;

  div.appendChild(el);
  div.scrollTop = div.scrollHeight;
}

function clearMessages() {
  document.getElementById("messages").innerHTML = "";
}

function normalizeMsg(msg) {
  if (msg.sender && !msg.from) {
    return {
      _id: msg._id,
      from: String(msg.sender),
      to: selectedFriend ? String(selectedFriend._id) : null,
      text: msg.text,
      createdAt: msg.createdAt,
    };
  }

  return {
    _id: msg._id,
    from: String(msg.from),
    to: msg.to ? String(msg.to) : null,
    text: msg.text,
    createdAt: msg.createdAt,
  };
}

async function loadHistory(friendId) {
  const res = await fetch(`/api/chat/messages/${friendId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) return;

  const messages = await res.json();
  clearMessages();

  messages.forEach((m) => addMessage(normalizeMsg(m)));
}


async function loadMe() {
  const res = await fetch("/api/users/me", {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) {
    localStorage.removeItem("token");
    window.location.href = "/login";
    return null;
  }
  const data = await res.json();
  userCache.set(String(data._id), displayName(data));
  document.getElementById("meLabel").textContent = `You: ${displayName(data)}`;
  return data;
}

async function loadFriends() {
  const res = await fetch("/api/users/me", {
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await res.json();

  const friends = data.friends || []; 
  const box = document.getElementById("friends");
  box.innerHTML = "";

  friends.forEach((f) => {
    userCache.set(String(f._id), displayName(f));

    const btn = document.createElement("button");
    btn.className = "friend";
    btn.textContent = displayName(f);
    btn.addEventListener("click", () => {
      [...box.querySelectorAll(".friend")].forEach(x => x.classList.remove("active"));
      btn.classList.add("active");

    selectedFriend = f;
    setChatHeader(f);
    loadHistory(f._id);
    });
    box.appendChild(btn);
  });
}

socket.on("connect", () => console.log("✅ socket connected", socket.id));
socket.on("connect_error", (e) => console.log("❌ connect_error", e.message));

socket.on("dm:receive", (msg) => {
  if (!selectedFriend) return;

  const otherId = String(selectedFriend._id);
  const from = String(msg.from);
  const to = String(msg.to);

  const isThisChat =
    (from === otherId && to === String(me._id)) ||
    (from === String(me._id) && to === otherId);

  if (isThisChat) addMessage(normalizeMsg(msg));
});

document.getElementById("sendBtn").addEventListener("click", () => {
  const input = document.getElementById("messageInput");
  const text = String(input.value || "").trim();
  if (!text) return;

  if (!selectedFriend) {
    alert("Pick a friend first");
    return;
  }

  socket.emit("dm:send", { to: selectedFriend._id, text }, (res) => {
    if (!res?.ok) alert(res?.error || "Could not send");
  });

  input.value = "";
});

document.getElementById("messageInput").addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    e.preventDefault();
    document.getElementById("sendBtn").click();
  }
});

setChatHeader(null);
(async () => {
  me = await loadMe();
  if (!me) return;
  await loadFriends();
})();