// ===== Pokémon name aliases (forms PokéAPI requires) =====
const pokemonAliases = {
  giratina: "giratina-altered",
  tornadus: "tornadus-incarnate",
  thundurus: "thundurus-incarnate",
  landorus: "landorus-incarnate",
  enamorus: "enamorus-incarnate",
  shaymin: "shaymin-land",
  meloetta: "meloetta-aria",
  hoopa: "hoopa-confined",
  toxtricity: "toxtricity-amped",
  indeedee: "indeedee-male",
  oinkologne: "oinkologne-male",
  meowstic: "meowstic-male",
  zygarde: "zygarde-50",
};

// ===== Type colors =====
const typeColors = {
  normal: "#A8A77A",
  fire: "#EE8130",
  water: "#6390F0",
  electric: "#F7D02C",
  grass: "#7AC74C",
  ice: "#96D9D6",
  fighting: "#C22E28",
  poison: "#A33EA1",
  ground: "#E2BF65",
  flying: "#A98FF3",
  psychic: "#F95587",
  bug: "#A6B91A",
  rock: "#B6A136",
  ghost: "#735797",
  dragon: "#6F35FC",
  dark: "#705746",
  steel: "#B7B7CE",
  fairy: "#D685AD",
};

// ===== DOM =====
const input = document.getElementById("pokemonInput");
const result = document.getElementById("result");
const searchBtn = document.getElementById("searchBtn");
const themeToggle = document.getElementById("themeToggle");
const autocompleteList = document.getElementById("autocomplete-list");

// ===== Dark mode =====
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

// ===== Events =====
searchBtn.addEventListener("click", fetchPokemon);
input.addEventListener("keydown", (e) => {
  if (e.key === "Enter") fetchPokemon();
});

// ===== Autocomplete =====
let allPokemonNames = [];

async function preloadPokemonNames() {
  const res = await fetch("https://pokeapi.co/api/v2/pokemon?limit=1300");
  const data = await res.json();
  allPokemonNames = data.results.map((p) => p.name);
}
preloadPokemonNames();

input.addEventListener("input", () => {
  const value = input.value.toLowerCase().trim();
  autocompleteList.innerHTML = "";

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
      input.value = name;
      autocompleteList.classList.add("hidden");
      fetchPokemon();
    });

    autocompleteList.appendChild(item);
  });

  autocompleteList.classList.remove("hidden");
});

document.addEventListener("click", (e) => {
  if (!e.target.closest(".search")) {
    autocompleteList.classList.add("hidden");
  }
});

// ===== Helpers =====
function statColor(value) {
  const max = 255;
  const ratio = Math.min(value / max, 1);
  const hue = 240 * ratio;
  return `hsl(${hue}, 80%, 55%)`;
}

// ===== Main =====
async function fetchPokemon() {
  autocompleteList.classList.add("hidden");

  let name = input.value.toLowerCase().trim().replace(/\s+/g, " ");
  if (!name) return;

  name = pokemonAliases[name] || name.replace(/\s+/g, "-");
  result.innerHTML = "<p>Loading...</p>";

  try {
    const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${name}`);
    if (!res.ok) throw new Error("Not found");
    const data = await res.json();

    const gen =
      data.id <= 151
        ? 1
        : data.id <= 251
        ? 2
        : data.id <= 386
        ? 3
        : data.id <= 493
        ? 4
        : data.id <= 649
        ? 5
        : 6;

    const sprites = {
      official: data.sprites.other["official-artwork"].front_default,
      modern: data.sprites.other.home.front_default,
    };

    const heightMeters = data.height / 10;
    const feet = Math.floor(heightMeters * 3.28084);
    const inches = Math.round((heightMeters * 3.28084 - feet) * 12);

    const weightKg = data.weight / 10;
    const weightLbs = (weightKg * 2.20462).toFixed(1);

    const typesHtml = data.types
      .map(
        (t) => `
        <span class="type-badge" style="background-color: ${
          typeColors[t.type.name]
        }">
          ${t.type.name.toUpperCase()}
        </span>`
      )
      .join("");

    const abilitiesHtml = data.abilities
      .map((a) => {
        const name = a.ability.name
          .replace("-", " ")
          .replace(/\b\w/g, (c) => c.toUpperCase());
        return a.is_hidden
          ? `${name} <span class="hidden-ability">(Hidden)</span>`
          : name;
      })
      .join(", ");

    const stats = {
      HP: data.stats[0].base_stat,
      Attack: data.stats[1].base_stat,
      Defense: data.stats[2].base_stat,
      "Sp. Atk": data.stats[3].base_stat,
      "Sp. Def": data.stats[4].base_stat,
      Speed: data.stats[5].base_stat,
    };

    const statTotal = Object.values(stats).reduce((a, b) => a + b, 0);

    result.innerHTML = `
<div class="pokemon-card">
  <div class="pokemon-image">
    <div class="sprite-tabs">
      <button class="sprite-tab active" data-sprite="official">Official</button>
      <button class="sprite-tab" data-sprite="modern">Modern</button>
    </div>
    <img src="${sprites.official}" alt="${data.name}">
  </div>

  <div class="pokemon-info">
    <h2>${data.name}</h2>
    <p><strong>Pokedex #:</strong> ${data.id}</p>
    <p><strong>Species:</strong> ${data.species.name.replace(
      "-",
      " "
    )}</p>
    <p><strong>Height:</strong> ${heightMeters.toFixed(
      1
    )} m (${feet}' ${inches}")</p>
    <p><strong>Weight:</strong> ${weightKg.toFixed(
      1
    )} kg (${weightLbs} lbs)</p>
    <p><strong>Type:</strong> ${typesHtml}</p>
    <p><strong>Ability:</strong> ${abilitiesHtml}</p>
  </div>

  <div class="pokemon-stats">
    ${Object.entries(stats)
      .map(
        ([label, value]) => `
      <div class="stat-row">
        <div class="stat-label">${label}</div>
        <div class="stat-value">${value}</div>
        <div class="bar">
          <div class="fill" style="width:0%;background:${statColor(
            value
          )}"></div>
        </div>
      </div>`
      )
      .join("")}
    <div class="stat-total"><strong>Total:</strong> ${statTotal}</div>
  </div>
</div>
`;
      

    const tabs = document.querySelectorAll(".sprite-tab");
    const imageEl = document.querySelector(".pokemon-image img");

    tabs.forEach((tab) => {
      tab.addEventListener("click", () => {
        const type = tab.dataset.sprite;
        tabs.forEach((t) => t.classList.remove("active"));
        tab.classList.add("active");
        imageEl.src = sprites[type];
      });
    });

    document.querySelectorAll(".pokemon-stats .fill").forEach((fill, i) => {
      setTimeout(() => {
        fill.style.width = `${Math.min(
          Object.values(stats)[i],
          255
        ) / 2}%`;
      }, 50);
    });
  } catch {
    result.innerHTML = "<p>Pokémon not found</p>";
  }
}
