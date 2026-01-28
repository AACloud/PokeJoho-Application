// ===== Pokémon name aliases (base forms only) =====
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
  palafin: "palafin-zero",
};
// ===== Form-specific ability overrides =====
const formAbilityOverrides = {
  "zygarde-complete": ["power-construct"],
  "palafin-hero": ["zero-to-hero"],
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
searchBtn.addEventListener("click", () => fetchPokemon());
input.addEventListener("keydown", (e) => {
  if (e.key === "Enter") fetchPokemon();
});

// ===== Autocomplete =====
let allPokemonNames = [];

async function preloadPokemonNames() {
  const res = await fetch("https://pokeapi.co/api/v2/pokemon?limit=1300");
  const data = await res.json();

  allPokemonNames = data.results
    .map((p) => p.name)
    .filter((name) => !name.includes("-"));
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
  if (!e.target.closest(".search-container")) {
    autocompleteList.classList.add("hidden");
  }
});

// ===== Helpers =====
function statColor(value) {
  const ratio = Math.min(value / 255, 1);
  return `hsl(${240 * ratio}, 80%, 55%)`;
}

function formatFormName(name) {
  return name.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

async function getUniqueFormsFromSpecies(speciesData) {
  const formMap = new Map();

  for (const variety of speciesData.varieties) {
    const res = await fetch(variety.pokemon.url);
    const pokemonData = await res.json();

    const form = pokemonData.forms[0];

    // UNIVERSAL normalization
    let normalizedForm = form.name
      .replace(/-power-construct$/, "")
      .replace(/-battle$/, "")
      .replace(/-amped$/, "")
      .replace(/-low-key$/, "")
      .replace(/-hero$/, "")
      .replace(/-family-of-four$/, "")
      .replace(/-family-of-three$/, "");

    // Default form name fallback
    if (normalizedForm === speciesData.name) {
      normalizedForm = "base";
    }

    if (!formMap.has(normalizedForm)) {
      formMap.set(normalizedForm, {
        label: normalizedForm,
        pokemonName: pokemonData.name,
        battleOnly: isBattleOnlyForm(pokemonData),
      });
    }
  }

  return Array.from(formMap.values());
}
async function getSpeciesAbilities(speciesData) {
  const abilityMap = new Map();

  for (const variety of speciesData.varieties) {
    const res = await fetch(variety.pokemon.url);
    const pokemon = await res.json();

    pokemon.abilities.forEach((a) => {
      abilityMap.set(a.ability.name, {
        name: a.ability.name,
        is_hidden: a.is_hidden,
      });
    });
  }

  return Array.from(abilityMap.values());
}
function isBattleOnlyForm(pokemonData) {
  // 1️⃣ Explicit PokeAPI flag
  if (pokemonData.forms[0]?.is_battle_only) return true;

  // 2️⃣ Known battle-state keywords (UNIVERSAL)
  const battleKeywords = [
    "hero",
    "complete",
    "blade",
    "school",
    "noice",
    "sunny",
    "zen",
    "mega",
    "ultra",
  ];

  return battleKeywords.some((k) => pokemonData.name.includes(k));
}

// ===== Fetch & Render =====
async function fetchPokemon(nameOrForm = null, isForm = false) {
  autocompleteList.classList.add("hidden");

  let name = (nameOrForm || input.value).toLowerCase().trim();
  if (!name) return;

  result.innerHTML = "<p>Loading...</p>";

  try {
    let pokemonData, speciesData;

    if (isForm) {
      // 🔹 FORM CLICK → fetch Pokémon directly
      const pokemonRes = await fetch(
        `https://pokeapi.co/api/v2/pokemon/${name}`
      );
      if (!pokemonRes.ok) throw new Error();
      pokemonData = await pokemonRes.json();

      const speciesRes = await fetch(pokemonData.species.url);
      speciesData = await speciesRes.json();
    } else {
      // 🔹 SEARCH → resolve base form via species
      const speciesRes = await fetch(
        `https://pokeapi.co/api/v2/pokemon-species/${name}`
      );
      if (!speciesRes.ok) throw new Error();
      speciesData = await speciesRes.json();

      const defaultVariety = speciesData.varieties.find((v) => v.is_default);

      const pokemonRes = await fetch(defaultVariety.pokemon.url);
      pokemonData = await pokemonRes.json();
    }

    const forms = await getUniqueFormsFromSpecies(speciesData);
    const abilities = await getSpeciesAbilities(speciesData);

    renderPokemon(pokemonData, speciesData, forms, abilities);
  } catch {
    result.innerHTML = "<p>Pokémon not found</p>";
  }
}

// ===== Render Pokémon =====
function renderPokemon(data, speciesData, forms, abilities) {
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
      (t) =>
        `<span class="type-badge" style="background:${typeColors[t.type.name]}">
          ${t.type.name.toUpperCase()}
        </span>`
    )
    .join("");

  const abilitiesHtml = abilities
    .map((a) =>
      a.is_hidden
        ? `${formatFormName(
            a.name
          )} <span class="hidden-ability">(Hidden)</span>`
        : formatFormName(a.name)
    )
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
    <img src="${sprites.official}">
  </div>

  <div class="pokemon-info">
    <h2>${formatFormName(data.name)}</h2>
    <p><strong>Pokedex #:</strong> ${data.id}</p>
    <p><strong>Height:</strong> ${heightMeters.toFixed(
      1
    )} m (${feet}' ${inches}")</p>
    <p><strong>Weight:</strong> ${weightKg.toFixed(1)} kg (${weightLbs} lbs)</p>
    <p><strong>Type:</strong> ${typesHtml}</p>
    <p><strong>Ability:</strong> ${abilitiesHtml}</p>

    ${
      forms.length > 1
        ? `<div class="form-tabs">
        ${forms
          .map(
            (f) => `
    <button
      class="form-tab ${f.pokemonName === data.name ? "active" : ""} ${
              f.battleOnly ? "battle-only" : ""
            }"
      data-form="${f.pokemonName}"
    >
      ${formatFormName(f.label)}
      ${f.battleOnly ? `<span class="battle-badge">⚔️</span>` : ""}
    </button>
  `
          )
          .join("")}

      </div>`
        : ""
    }

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

  // Sprite switching
  const imageEl = document.querySelector(".pokemon-image img");
  document.querySelectorAll(".sprite-tab").forEach((tab) => {
    tab.addEventListener("click", () => {
      document
        .querySelectorAll(".sprite-tab")
        .forEach((t) => t.classList.remove("active"));
      tab.classList.add("active");
      imageEl.src = sprites[tab.dataset.sprite];
    });
  });

  // Form switching
  document.querySelectorAll(".form-tab").forEach((tab) => {
    tab.addEventListener("click", () => fetchPokemon(tab.dataset.form, true));
  });

  // Animate stats
  document.querySelectorAll(".fill").forEach((fill, i) => {
    setTimeout(() => {
      fill.style.width = `${Math.min(Object.values(stats)[i], 255) / 2}%`;
    }, 50);
  });
}
