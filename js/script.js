let selectedIndex = -1;
let allPokemonNames = [];

function debounce(fn, delay = 300) {
  let timer;
  return function (...args) {
    clearTimeout(timer);
    timer = setTimeout(() => fn.apply(this, args), delay);
  };
}

function updateActiveItem(items) {
  items.forEach((item, i) => {
    item.classList.toggle("active", i === selectedIndex);
  });

  items[selectedIndex]?.scrollIntoView({ block: "nearest" });
}

async function preloadPokemonNames() {
  const res = await fetch(
    "https://pokeapi.co/api/v2/pokemon-species?limit=1300"
  );
  const data = await res.json();
  allPokemonNames = data.results.map((p) => p.name);
}

function handleAutocomplete() {
  const input = document.getElementById("pokemonInput");
  const autocompleteList = document.getElementById("autocomplete-list");
  if (!input || !autocompleteList) return;

  const value = input.value.toLowerCase().trim();
  autocompleteList.innerHTML = "";
  selectedIndex = -1;

  if (!value) {
    autocompleteList.classList.add("hidden");
    return;
  }

  const matches = allPokemonNames
    .filter((name) => name.startsWith(value))
    .slice(0, 8);

  if (!matches.length) {
    autocompleteList.classList.add("hidden");
    return;
  }

  matches.forEach((name) => {
    const item = document.createElement("div");
    item.className = "autocomplete-item";
    item.textContent = name;

    item.addEventListener("click", () => {
      window.location.href = `/pokedex/${name}`;
    });

    autocompleteList.appendChild(item);
  });

  autocompleteList.classList.remove("hidden");
}

function initAutocomplete() {
  const input = document.getElementById("pokemonInput");
  const autocompleteList = document.getElementById("autocomplete-list");
  if (!input || !autocompleteList) return;

  input.addEventListener("input", debounce(handleAutocomplete, 250));

  input.addEventListener("keydown", (e) => {
    const items = autocompleteList.querySelectorAll(".autocomplete-item");

    if (autocompleteList.classList.contains("hidden") || !items.length) {
      if (e.key === "Enter") {
        e.preventDefault();
        window.goToPokedex?.();
      }
      return;
    }

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        selectedIndex = (selectedIndex + 1) % items.length;
        updateActiveItem(items);
        break;

      case "ArrowUp":
        e.preventDefault();
        selectedIndex = (selectedIndex - 1 + items.length) % items.length;
        updateActiveItem(items);
        break;

      case "Enter":
        e.preventDefault();
        if (selectedIndex !== -1) {
          items[selectedIndex].click();
        } else {
          autocompleteList.classList.add("hidden");
          window.goToPokedex?.();
        }
        break;

      case "Escape":
        autocompleteList.classList.add("hidden");
        selectedIndex = -1;
        break;
    }
  });

  document.addEventListener("click", (e) => {
    if (!e.target.closest(".search-container")) {
      autocompleteList.classList.add("hidden");
    }
  });

  preloadPokemonNames().catch(console.error);
}

if (window.__headerReady) {
  initAutocomplete();
} else {
  window.addEventListener("headerLoaded", initAutocomplete, { once: true });
}
