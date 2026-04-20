function ensurePopupRoot() {
  let root = document.getElementById("popupRoot");

  if (!root) {
    root = document.createElement("div");
    root.id = "popupRoot";
    root.className = "popup-root";
    document.body.appendChild(root);
  }

  return root;
}

function showPopup(type, text, actions = []) {
  const root = ensurePopupRoot();

  root.innerHTML = `
    <div class="popup-overlay">
      <div class="popup">
        <div class="popup-text">${text}</div>
        <div class="popup-actions">
          ${actions.map(a => `<button class="${a.class}" id="${a.id}">${a.label}</button>`).join("")}
        </div>
      </div>
    </div>
  `;

  root.classList.add("open");

  const overlay = root.querySelector(".popup-overlay");
  const popup = root.querySelector(".popup");

  overlay.addEventListener("click", () => {
    root.classList.remove("open");
  });

  popup.addEventListener("click", (e) => {
    e.stopPropagation();
  });

  actions.forEach(a => {
    const btn = document.getElementById(a.id);
    if (!btn) return;

    btn.onclick = () => {
      a.onClick && a.onClick();
      root.classList.remove("open");
    };
  });
}
export function showError(text) {
  showPopup("error", text);
}

export function showSuccess(text) {
  showPopup("success", text);
}

export function showConfirm(text, onConfirm) {
  showPopup("confirm", text, [
    {
      label: "Cancel",
      id: "cancelBtn",
      class: "btn-outline",
    },
    {
      label: "Confirm",
      id: "confirmBtn",
      class: "btn-primary",
      onClick: onConfirm,
    },
  ]);
}