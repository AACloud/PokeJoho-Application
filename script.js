const speciesCache = {};
let selectedIndex = -1;

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
// ===== Type Effectiveness =====
const typeChart = {
  normal: { rock: 0.5, ghost: 0, steel: 0.5 },
  fire: {
    fire: 0.5,
    water: 0.5,
    grass: 2,
    ice: 2,
    bug: 2,
    rock: 0.5,
    dragon: 0.5,
    steel: 2,
  },
  water: { fire: 2, water: 0.5, grass: 0.5, ground: 2, rock: 2, dragon: 0.5 },
  electric: {
    water: 2,
    electric: 0.5,
    grass: 0.5,
    ground: 0,
    flying: 2,
    dragon: 0.5,
  },
  grass: {
    fire: 0.5,
    water: 2,
    grass: 0.5,
    poison: 0.5,
    ground: 2,
    flying: 0.5,
    bug: 0.5,
    rock: 2,
    dragon: 0.5,
    steel: 0.5,
  },
  ice: {
    fire: 0.5,
    water: 0.5,
    grass: 2,
    ice: 0.5,
    ground: 2,
    flying: 2,
    dragon: 2,
    steel: 0.5,
  },
  fighting: {
    normal: 2,
    ice: 2,
    rock: 2,
    dark: 2,
    steel: 2,
    poison: 0.5,
    flying: 0.5,
    psychic: 0.5,
    bug: 0.5,
    fairy: 0.5,
    ghost: 0,
  },
  poison: {
    grass: 2,
    fairy: 2,
    poison: 0.5,
    ground: 0.5,
    rock: 0.5,
    ghost: 0.5,
    steel: 0,
  },
  ground: {
    fire: 2,
    electric: 2,
    grass: 0.5,
    poison: 2,
    flying: 0,
    bug: 0.5,
    rock: 2,
    steel: 2,
  },
  flying: {
    electric: 0.5,
    grass: 2,
    fighting: 2,
    bug: 2,
    rock: 0.5,
    steel: 0.5,
  },
  psychic: { fighting: 2, poison: 2, psychic: 0.5, steel: 0.5, dark: 0 },
  bug: {
    fire: 0.5,
    grass: 2,
    fighting: 0.5,
    poison: 0.5,
    flying: 0.5,
    psychic: 2,
    ghost: 0.5,
    dark: 2,
    steel: 0.5,
    fairy: 0.5,
  },
  rock: {
    fire: 2,
    ice: 2,
    fighting: 0.5,
    ground: 0.5,
    flying: 2,
    bug: 2,
    steel: 0.5,
  },
  ghost: { normal: 0, psychic: 2, ghost: 2, dark: 0.5 },
  dragon: { dragon: 2, steel: 0.5, fairy: 0 },
  dark: { fighting: 0.5, psychic: 2, ghost: 2, dark: 0.5, fairy: 0.5 },
  steel: {
    fire: 0.5,
    water: 0.5,
    electric: 0.5,
    ice: 2,
    rock: 2,
    steel: 0.5,
    fairy: 2,
  },
  fairy: {
    fire: 0.5,
    fighting: 2,
    poison: 0.5,
    dragon: 2,
    dark: 2,
    steel: 0.5,
  },
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
  if (e.key === "Enter" && autocompleteList.classList.contains("hidden")) {
    fetchPokemon();
  }
});

// ===== Autocomplete =====
let allPokemonNames = [];

async function preloadPokemonNames() {
  const res = await fetch(
    "https://pokeapi.co/api/v2/pokemon-species?limit=1300",
  );
  const data = await res.json();

  allPokemonNames = data.results.map((p) => p.name);
}

preloadPokemonNames();

input.addEventListener("input", () => {
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
      input.value = name;
      autocompleteList.classList.add("hidden");
      fetchPokemon();
    });
    autocompleteList.appendChild(item);
  });

  autocompleteList.classList.remove("hidden");
});
input.addEventListener("keydown", (e) => {
  const items = autocompleteList.querySelectorAll(".autocomplete-item");

  if (autocompleteList.classList.contains("hidden") || !items.length) {
    if (e.key === "Enter") fetchPokemon();
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

      // ✅ If user navigated autocomplete, use selection
      if (selectedIndex !== -1) {
        items[selectedIndex].click();
      } else {
        // ✅ Otherwise, search exactly what was typed
        autocompleteList.classList.add("hidden");
        fetchPokemon();
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

// ===== Helpers =====
function updateActiveItem(items) {
  items.forEach((item, i) => {
    item.classList.toggle("active", i === selectedIndex);
  });

  items[selectedIndex]?.scrollIntoView({
    block: "nearest",
  });
}

async function getSpeciesData(url) {
  if (speciesCache[url]) {
    return speciesCache[url];
  }

  const res = await fetch(url);
  if (!res.ok) throw new Error("Failed to fetch species");

  const data = await res.json();
  speciesCache[url] = data;
  return data;
}

function statColor(value) {
  const ratio = Math.min(value / 255, 1);
  return `hsl(${240 * ratio}, 80%, 55%)`;
}

function formatFormName(name) {
  return name.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}
function formatDexNumber(num) {
  return `${String(num).padStart(4, "0")}`;
}

function statsAreEqual(a, b) {
  return a.stats.every((stat, i) => stat.base_stat === b.stats[i].base_stat);
}

async function getUniqueFormsFromSpecies(speciesData) {
  const formMap = new Map();

  // ✅ Fetch base Pokémon once
  const baseRes = await fetch(speciesData.varieties[0].pokemon.url);
  const basePokemon = await baseRes.json();

  for (const variety of speciesData.varieties) {
    const res = await fetch(variety.pokemon.url);
    const pokemonData = await res.json();

    const name = pokemonData.name;
    const form = pokemonData.forms[0];

    // ❌ Remove Gmax
    if (name.includes("gmax")) continue;

    // ❌ Remove outfits / costumes
    const costumeKeywords = [
      "cap",
      "cosplay",
      "rock-star",
      "belle",
      "phd",
      "libre",
      "pop-star",
      "original",
      "partner",
      "starter",
      "world",
    ];
    if (costumeKeywords.some((k) => name.includes(k))) continue;

    // ❌ Remove cosmetic stat clones (Minior, Alcremie, etc.)
    if (statsAreEqual(basePokemon, pokemonData)) {
      if (pokemonData.id !== basePokemon.id) continue;
    }

    // ✅ Your normalization logic (kept)
    let normalizedForm = form.name
      .replace(/-power-construct$/, "")
      .replace(/-battle$/, "")
      .replace(/-amped$/, "")
      .replace(/-low-key$/, "")
      .replace(/-hero$/, "")
      .replace(/-family-of-four$/, "")
      .replace(/-family-of-three$/, "");

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

function getFormAbilities(pokemonData) {
  return pokemonData.abilities.map((a) => ({
    name: a.ability.name,
    is_hidden: a.is_hidden,
  }));
}

async function getAbilitiesForForm(speciesData, targetPokemonName) {
  const abilityMap = new Map();

  // Strip ability-only suffix
  const baseName = targetPokemonName.replace(/-power-construct$/, "");

  for (const variety of speciesData.varieties) {
    const res = await fetch(variety.pokemon.url);
    const pokemon = await res.json();

    const name = pokemon.name;

    const matchesBase =
      name === baseName || name === `${baseName}-power-construct`;

    if (matchesBase) {
      pokemon.abilities.forEach((a) => {
        abilityMap.set(a.ability.name, {
          name: a.ability.name,
          is_hidden: normalizeAbilityHiddenFlag(
            pokemon,
            a.ability.name,
            a.is_hidden,
          ),
        });
      });
    }
  }
  return Array.from(abilityMap.values());
}
function normalizeAbilityHiddenFlag(pokemonData, abilityName, isHidden) {
  // Form-locked abilities are never "hidden" in UI
  const formLockedKeywords = [
    "zero-to-hero",
    "power-construct",
    "tera-shift",
    "tera-shell",
    "embody-aspect",
  ];

  if (formLockedKeywords.includes(abilityName)) {
    return false;
  }
  return isHidden;
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

function formatMultiplier(value) {
  if (value === 4) return "4";
  if (value === 2) return "2";
  if (value === 1) return "1";
  if (value === 0.5) return "½";
  if (value === 0.25) return "¼";
  if (value === 0) return "0";
}

// Generate Weakness Table
function generateWeaknessTable(effectiveness) {
  const types = Object.keys(effectiveness);

  const firstRow = types.slice(0, 9);
  const secondRow = types.slice(9, 18);

  const renderRow = (rowTypes, isTypeRow = true) =>
    `<tr>
      ${rowTypes
        .map(
          (type) =>
            `<td>
              ${
                isTypeRow
                  ? `<div class="type-box" style="background:${typeColors[type]}">${type.slice(0, 3).toUpperCase()}</div>`
                  : `<div class="type-multiplier">${formatMultiplier(effectiveness[type])}</div>`
              }
            </td>`,
        )
        .join("")}
    </tr>`;

  return `
    <table class="weakness-table">
      ${renderRow(firstRow, true)}
      ${renderRow(firstRow, false)}
      ${renderRow(secondRow, true)}
      ${renderRow(secondRow, false)}
    </table>
  `;
}

// Type Effectiveness
async function getTypeEffectiveness(pokemonTypes) {
  const effectiveness = {};

  // Start every attacking type at neutral
  Object.keys(typeColors).forEach((type) => {
    effectiveness[type] = 1;
  });

  for (const typeInfo of pokemonTypes) {
    const res = await fetch(typeInfo.type.url);
    const data = await res.json();

    data.damage_relations.double_damage_from.forEach((t) => {
      effectiveness[t.name] *= 2;
    });

    data.damage_relations.half_damage_from.forEach((t) => {
      effectiveness[t.name] *= 0.5;
    });

    data.damage_relations.no_damage_from.forEach((t) => {
      effectiveness[t.name] *= 0;
    });
  }

  return effectiveness;
}

// Form Specific Abilities
function resolveAbilities(pokemonData, abilities) {
  const override = formAbilityOverrides[pokemonData.name];
  if (!override) return abilities;

  return abilities.filter((a) => override.includes(a.name));
}

// ===== Fetch & Render =====
async function fetchPokemon(nameOrForm = null, isForm = false) {
  autocompleteList.classList.add("hidden");

  isShiny = false;
  activeSprite = "official";

  let name = (nameOrForm || input.value)
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-");
  if (!name) return;

  result.innerHTML = `
  <div class="loading">
    <div class="loading-spinner"></div>
    <p>Loading Pokémon data…</p>
  </div>
`;

  try {
    let pokemonData, speciesData;

    if (isForm) {
      // 🔹 FORM CLICK → fetch Pokémon directly
      const pokemonRes = await fetch(
        `https://pokeapi.co/api/v2/pokemon/${name}`,
      );
      if (!pokemonRes.ok) throw new Error();
      pokemonData = await pokemonRes.json();

      speciesData = await getSpeciesData(pokemonData.species.url);
    } else {
      // 🔹 SEARCH → resolve base form via species
      speciesData = await getSpeciesData(
        "https://pokeapi.co/api/v2/pokemon-species/" + name,
      );

      const defaultVariety = speciesData.varieties.find((v) => v.is_default);
      if (!defaultVariety) throw new Error();

      const pokemonRes = await fetch(defaultVariety.pokemon.url);
      pokemonData = await pokemonRes.json();
    }

    const forms = await getUniqueFormsFromSpecies(speciesData);
    const abilities = await getAbilitiesForForm(speciesData, pokemonData.name);

    renderPokemon(pokemonData, speciesData, forms, abilities);
  } catch {
    result.innerHTML = "<p>Pokémon not found</p>";
  }
}
let isShiny = false;
let activeSprite = "Official"; // Keeps track of Official vs Modern
// ===== Render Pokémon =====
async function renderPokemon(data, speciesData, forms, abilities) {
  const sprites = {
    official: data.sprites.other["official-artwork"].front_default,
    officialShiny: data.sprites.other["official-artwork"].front_shiny,
    modern: data.sprites.other.home.front_default,
    modernShiny: data.sprites.other.home.front_shiny,
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
        </span>`,
    )
    .join("");

  const pokemonTypes = data.types.map((t) => t.type.name);
  const effectiveness = await getTypeEffectiveness(data.types);
  const weaknessHtml = generateWeaknessTable(effectiveness);

  const abilitiesHtml = abilities
    .map((a) =>
      a.is_hidden
        ? `${formatFormName(
            a.name,
          )} <span class="hidden-ability">(Hidden)</span>`
        : formatFormName(a.name),
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

  <!-- LEFT COLUMN -->
  <div class="pokemon-left">
    <div class="pokemon-image">
  <div class="sprite-controls">
    <div class="sprite-tabs">
      <button class="sprite-tab active" data-sprite="official">Official</button>
      <button class="sprite-tab" data-sprite="modern">Modern</button>
      <button class="shiny-toggle">✨ Shiny</button>
    </div>
  </div>

  <img src="${isShiny ? sprites.officialShiny : sprites.official}">
</div>


    <div class="pokemon-stats">
      ${Object.entries(stats)
        .map(
          ([label, value]) => `
        <div class="stat-row">
          <div class="stat-label">${label}</div>
          <div class="stat-value">${value}</div>
          <div class="bar">
            <div
              class="fill"
              style="width:${(value / 255) * 70}%; background:${statColor(value)}"
              ></div>
          </div>
        </div>`,
        )
        .join("")}
      <div class="stat-total"><strong>Total:</strong> ${statTotal}</div>
    </div>
  </div>

 <!-- INFO COLUMN -->
  <div class="pokemon-info">
    <h2>${formatFormName(data.name)}</h2>
    <p><strong>Pokedex Number:</strong> ${formatDexNumber(speciesData.id)}</p>
    <p><strong>Height:</strong> ${heightMeters.toFixed(1)} m (${feet}' ${inches}")</p>
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
            </button>`,
            )
            .join("")}
        </div>`
        : ""
    }
  </div>

  <!-- WEAKNESS COLUMN -->
  <div class="weakness-chart">
    <h3>Type Matchups</h3>
    <div class="weakness-grid">
      ${weaknessHtml}
    </div>
  </div>

</div>
`;

  // Stat Row
  requestAnimationFrame(() => {
    document.querySelectorAll(".stat-row").forEach((row) => {
      const label = row.querySelector(".stat-label").textContent;
      const value = stats[label];
      const fill = row.querySelector(".fill");

      fill.style.width = `${barWidth}px`;
    });
  });

  // Sprite switching
  const imageEl = document.querySelector(".pokemon-image img");

  document.querySelectorAll(".sprite-tab").forEach((tab) => {
    tab.addEventListener("click", () => {
      document
        .querySelectorAll(".sprite-tab")
        .forEach((t) => t.classList.remove("active"));

      tab.classList.add("active");
      activeSprite = tab.dataset.sprite;

      imageEl.src = isShiny
        ? sprites[`${activeSprite}Shiny`]
        : sprites[activeSprite];
    });
  });
  // Shiny Toggle Logic
  const shinyBtn = document.querySelector(".shiny-toggle");
  // ✅ Ensure shiny toggle starts OFF
  shinyBtn.classList.remove("active");

  shinyBtn.addEventListener("click", () => {
    isShiny = !isShiny;
    shinyBtn.classList.toggle("active", isShiny);

    imageEl.src = isShiny
      ? sprites[`${activeSprite}Shiny`]
      : sprites[activeSprite];
  });

  // Form switching
  if (forms.length > 1) {
    document.querySelectorAll(".form-tab").forEach((tab) => {
      tab.addEventListener("click", () => fetchPokemon(tab.dataset.form, true));
    });
  }
}
