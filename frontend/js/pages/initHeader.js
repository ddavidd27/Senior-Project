import { setupLoginLink } from "/js/home/dropdown.js";

document.addEventListener("DOMContentLoaded", () => {
  const token = localStorage.getItem("token");
  const chatLink = document.getElementById("chatLink");
  if (token && chatLink) {
    chatLink.style.display = "inline-flex";
  }
  setupLoginLink();
});