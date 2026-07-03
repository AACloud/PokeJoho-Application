async function loadHeader() {
  const placeholder = document.getElementById("header-placeholder");
  if (!placeholder) return;

  const res = await fetch("/components/header.html");
  if (!res.ok) {
    throw new Error(`Failed to load header.html: ${res.status}`);
  }

  placeholder.innerHTML = await res.text();

  const input = document.getElementById("pokemonInput");
  const searchBtn = document.getElementById("searchBtn");
  const themeToggle = document.getElementById("themeToggle");
  const homeTitle = document.getElementById("homeTitle");

  window.goToPokedex = function goToPokedex(nameOverride = null) {
    const inputEl = document.getElementById("pokemonInput");
    const name = (nameOverride || inputEl?.value || "").toLowerCase().trim();
    if (!name) return;

    window.location.href = `/pokedex/${name}`;
  };

  if (homeTitle) {
    homeTitle.addEventListener("click", () => {
      window.location.href = "/";
    });
  }

  if (themeToggle) {
    if (localStorage.getItem("theme") === "dark") {
      document.body.classList.add("dark");
      themeToggle.textContent = "☀️ Light Mode";
    }

    themeToggle.addEventListener("click", () => {
      document.body.classList.toggle("dark");
      const isDark = document.body.classList.contains("dark");
      themeToggle.textContent = isDark ? "☀️ Light Mode" : "🌙 Dark Mode";
      localStorage.setItem("theme", isDark ? "dark" : "light");
    });
  }

  if (searchBtn) {
    searchBtn.addEventListener("click", () => {
      window.goToPokedex();
    });
  }

  if (input) {
    input.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        window.goToPokedex();
      }
    });
  }

  window.__headerReady = true;
  window.dispatchEvent(new Event("headerLoaded"));
}

window.addEventListener("DOMContentLoaded", () => {
  loadHeader().catch(console.error);
});
