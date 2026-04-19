import { setupLoginLink } from "/js/home/dropdown.js";
import { checkAuthAndUpdateUI } from "/js/home/auth.js";

document.addEventListener("DOMContentLoaded", async () => {
  setupLoginLink();
  await checkAuthAndUpdateUI();
});