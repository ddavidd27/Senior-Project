import { escapeHtml, getToken } from "/js/home/util.js";

function ensureRatingsModalRoot() {
  let root = document.getElementById("ratingsModalRoot");
  if (!root) {
    root = document.createElement("div");
    root.id = "ratingsModalRoot";
    root.style.position = "fixed";
    root.style.inset = "0";
    root.style.background = "rgba(0,0,0,0.35)";
    root.style.display = "none";
    root.style.alignItems = "center";
    root.style.justifyContent = "center";
    root.style.zIndex = "100000";
    document.body.appendChild(root);
  }
  return root;
}

function openRatingsModal(html) {
  const root = ensureRatingsModalRoot();
  root.innerHTML = `
    <div style="width:min(640px, 92vw); max-height:90vh; overflow:auto; background:white; border-radius:16px; padding:16px; box-shadow:0 20px 60px rgba(0,0,0,0.25);">
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px;">
        <div style="font-weight:700;">Play4All</div>
        <button id="closeRatingsModalBtn" style="border:0; background:transparent; font-size:18px; cursor:pointer;">✕</button>
      </div>
      ${html}
    </div>
  `;
  root.style.display = "flex";
  root.querySelector("#closeRatingsModalBtn").onclick = () => {
    root.style.display = "none";
  };
  root.onclick = (e) => {
    if (e.target === root) root.style.display = "none";
  };
  return root;
}

function closeRatingsModal() {
  const root = document.getElementById("ratingsModalRoot");
  if (root) root.style.display = "none";
}

function playerLabel(player) {
  const fullName = `${player.firstName || ""} ${player.lastName || ""}`.trim();
  const usernamePart = player.username ? ` (@${player.username})` : "";
  return `${fullName || "Unknown player"}${usernamePart}`;
}

async function getPendingRatings(token) {
  const res = await fetch("/api/ratings/pending", {
    headers: { Authorization: `Bearer ${token}` },
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || "Could not load pending ratings");
  }
  return Array.isArray(data) ? data : [];
}

async function submitRatings(token, gameId, ratings) {
  const res = await fetch("/api/ratings", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ gameId, ratings }),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error || "Could not submit ratings");
  }

  return data;
}

function buildPlayerCard(player) {
  const safeId = escapeHtml(String(player._id));
  const safeName = escapeHtml(playerLabel(player));

  return `
    <div style="border:1px solid #eee; border-radius:12px; padding:12px; display:flex; flex-direction:column; gap:8px;">
      <div style="font-weight:600;">${safeName}</div>

      <label style="font-size:14px;">Rating</label>
      <select data-score="${safeId}" style="width:100%; padding:10px; border-radius:10px; border:1px solid #ddd;">
        <option value="5">5 - Excellent</option>
        <option value="4">4 - Good</option>
        <option value="3" selected>3 - Okay</option>
        <option value="2">2 - Poor</option>
        <option value="1">1 - Bad</option>
      </select>

      <label style="font-size:14px;">Was the level as expected?</label>
      <select data-level="${safeId}" style="width:100%; padding:10px; border-radius:10px; border:1px solid #ddd;">
        <option value="expected" selected>As expected</option>
        <option value="lower">Lower than expected</option>
        <option value="higher">Higher than expected</option>
      </select>

      <label style="font-size:14px;">Comment</label>
      <input data-comment="${safeId}" type="text" placeholder="Optional comment" style="width:100%; padding:10px; border-radius:10px; border:1px solid #ddd;">
    </div>
  `;
}

async function openSinglePendingRating(game, token) {
  const playersHtml = (game.playersToRate || []).map(buildPlayerCard).join("");

  const root = openRatingsModal(`
    <div style="font-weight:700; font-size:20px; margin-bottom:6px;">Rate players from your game</div>
    <div style="font-size:14px; opacity:.75; margin-bottom:14px;">
      ${escapeHtml(game.sport || "Game")} · ${escapeHtml(game.date || "")} · ${escapeHtml(game.startTime || "")}
    </div>

    <div style="display:flex; flex-direction:column; gap:10px; margin-bottom:14px;">
      ${playersHtml}
    </div>

    <div style="display:flex; gap:10px; align-items:center;">
      <button id="submitRatingsBtn" style="padding:10px 14px; border-radius:10px; border:0; cursor:pointer;">Submit ratings</button>
      <div id="ratingsMsg" style="font-size:14px;"></div>
    </div>
  `);

  const msg = root.querySelector("#ratingsMsg");
  const submitBtn = root.querySelector("#submitRatingsBtn");

  submitBtn.onclick = async () => {
    submitBtn.disabled = true;
    msg.textContent = "";

    try {
      const ratings = (game.playersToRate || []).map((player) => {
        const id = String(player._id);

        return {
          toUser: id,
          score: Number(root.querySelector(`[data-score="${id}"]`).value),
          levelAccuracy: root.querySelector(`[data-level="${id}"]`).value,
          comment: root.querySelector(`[data-comment="${id}"]`).value.trim(),
        };
      });

      await submitRatings(token, game._id, ratings);
      msg.textContent = "✅ Ratings submitted";
      setTimeout(() => {
        closeRatingsModal();
      }, 700);
    } catch (error) {
      msg.textContent = error.message || "Could not submit ratings";
      submitBtn.disabled = false;
    }
  };
}

export async function openPendingRatingsModal() {
  const token = getToken();
  if (!token) return;

  try {
    const pendingGames = await getPendingRatings(token);
    if (!pendingGames.length) {
      const root = openRatingsModal(`
        <div style="font-weight:700; font-size:20px; margin-bottom:6px;">Ratings</div>
        <div style="font-size:14px; opacity:.75;">You have no pending ratings.</div>
      `);
      return root;
    }

    await openSinglePendingRating(pendingGames[0], token);
  } catch (error) {
    console.error("Pending ratings error:", error);
  }
}

export async function refreshRatingsBadge() {
  const token = getToken();
  if (!token) return;

  try {
    const pendingGames = await getPendingRatings(token);
    const badge = document.getElementById("ratingsBadge");
    if (!badge) return;

    const count = pendingGames.length;

    if (count > 0) {
      badge.textContent = String(count);
      badge.style.display = "inline-block";
    } else {
      badge.style.display = "none";
    }
  } catch (error) {
    console.error("Ratings badge error:", error);
  }
}