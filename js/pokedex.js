// ===== CONTAINER =====
const container = document.getElementById("pokedex-container");

// ===== URL PARAM =====
function getPokemonNameFromPath() {
  const parts = window.location.pathname.split("/").filter(Boolean);

  if (parts[0] === "pokedex" && parts[1]) {
    return parts[1];
  }

  const params = new URLSearchParams(window.location.search);
  return params.get("name");
}

const nameParam = getPokemonNameFromPath();

// ===== CACHES =====
const speciesCache = {};
const typeCache = {};
const pokemonCache = {};

// ===== STATE =====
let isShiny = false;
let activeSprite = "official";
// ===== TYPE COLORS =====
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

// ===== ABILITY IMMUNITIES =====
const abilityImmunities = {
  "lightning-rod": ["electric"],
  "motor-drive": ["electric"],
  "volt-absorb": ["electric"],
  "flash-fire": ["fire"],
  "water-absorb": ["water"],
  "storm-drain": ["water"],
  "dry-skin": ["water"],
  levitate: ["ground"],
  "sap-sipper": ["grass"],
  "well-baked-body": ["fire"],
  "earth-eater": ["ground"],
  "wind-rider": ["flying"],
};

// ===== HELPERS =====
function statColor(v) {
  return `hsl(${240 * Math.min(v / 255, 1)},80%,55%)`;
}
function formatFormName(n) {
  return n.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}
function formatDexNumber(n) {
  return String(n).padStart(4, "0");
}

// ===== FETCH =====
async function getPokemonData(x) {
  if (pokemonCache[x]) return pokemonCache[x];
  const r = await fetch(
    x.startsWith("http") ? x : `https://pokeapi.co/api/v2/pokemon/${x}`
  );
  const d = await r.json();
  pokemonCache[x] = d;
  return d;
}

async function getSpeciesData(u) {
  if (speciesCache[u]) return speciesCache[u];
  const r = await fetch(u);
  const d = await r.json();
  speciesCache[u] = d;
  return d;
}

async function getTypeData(t) {
  if (typeCache[t]) return typeCache[t];
  const r = await fetch(`https://pokeapi.co/api/v2/type/${t}`);
  const d = await r.json();
  typeCache[t] = d;
  return d;
}

function getDisplayAbilitiesForPokemon(pokemonData, speciesData) {
  const name = pokemonData.name.toLowerCase();

  if (speciesData.name === "zygarde") {
    // Zygarde Complete: only Power Construct
    if (name.includes("complete")) {
      return [
        {
          ability: { name: "power-construct" },
          is_hidden: false,
        },
      ];
    }

    // Zygarde 10% and 50%: show both abilities
    return [
      {
        ability: { name: "aura-break" },
        is_hidden: false,
      },
      {
        ability: { name: "power-construct" },
        is_hidden: false,
      },
    ];
  }

  return pokemonData.abilities;
}
// ===== TYPE EFFECTIVENESS =====
async function getTypeEffectiveness(types) {
  const e = {};
  Object.keys(typeColors).forEach((t) => (e[t] = 1));

  for (const t of types) {
    const d = await getTypeData(t.type.name);

    d.damage_relations.double_damage_from.forEach((x) => (e[x.name] *= 2));
    d.damage_relations.half_damage_from.forEach((x) => (e[x.name] *= 0.5));
    d.damage_relations.no_damage_from.forEach((x) => (e[x.name] *= 0));
  }
  return e;
}

function applyAbilityImmunities(e, a) {
  const m = { ...e };
  a.forEach((x) => {
    const im = abilityImmunities[x.name];
    if (im) im.forEach((t) => (m[t] = 0));
  });
  return m;
}

function formatMultiplier(v) {
  if (v === 4) return "4";
  if (v === 2) return "2";
  if (v === 1) return "1";
  if (v === 0.5) return "½";
  if (v === 0.25) return "¼";
  if (v === 0) return "0";
}

function generateWeaknessTable(e) {
  const types = Object.keys(e);

  const row = (r, t = true) =>
    `<tr>${r
      .map(
        (x) =>
          `<td>${
            t
              ? `<div class="type-box" style="background:${typeColors[x]}">${x.slice(0, 3).toUpperCase()}</div>`
              : `<div class="type-multiplier">${formatMultiplier(e[x])}</div>`
          }</td>`
      )
      .join("")}</tr>`;

  return `<table class="weakness-table">
    ${row(types.slice(0, 9), true)}
    ${row(types.slice(0, 9), false)}
    ${row(types.slice(9), true)}
    ${row(types.slice(9), false)}
  </table>`;
}

// ===== FORMS =====
const FORM_SUFFIXES_TO_STRIP = [
  "power-construct",
  "zero-to-hero",
  "embody-aspect",
  "tera-shift",
  "tera-shell",
];
async function getUniqueFormsFromSpecies(speciesData) {
  const formMap = new Map();
  const speciesName = speciesData.name.toLowerCase();

  for (const variety of speciesData.varieties) {
    const pokemonData = await getPokemonData(variety.pokemon.url);
    const rawName = pokemonData.name.toLowerCase();

    // Skip only forms you truly do not want as tabs
    if (rawName.includes("gmax") || rawName.includes("totem")) {
      continue;
    }

    let normalizedForm = rawName
      .replace(speciesName, "")
      .replace(/^[-]/, "")
      .trim();

    // Remove ability-based suffixes so they do NOT become separate tabs
    normalizedForm = normalizedForm
      .replace(/-power-construct$/, "")
      .replace(/-zero-to-hero$/, "")
      .replace(/-embody-aspect$/, "")
      .replace(/-tera-shift$/, "")
      .replace(/-tera-shell$/, "")
      .trim();

    if (!normalizedForm) {
      normalizedForm = "base";
    }

    if (!formMap.has(normalizedForm)) {
      formMap.set(normalizedForm, {
        label: normalizedForm,
        pokemonName: pokemonData.name,
        battleOnly: false,
      });
    }
  }

  return Array.from(formMap.values());
}

// ===== MAIN FETCH =====
async function fetchPokemon(name) {
  if (!name) {
    container.innerHTML = "<p>No Pokémon specified.</p>";
    return;
  }

  container.innerHTML = "<p>Loading...</p>";

  try {
    const speciesData = await getSpeciesData(
      `https://pokeapi.co/api/v2/pokemon-species/${name}`
    );

    await Promise.all(
      speciesData.varieties.map((v) => getPokemonData(v.pokemon.url))
    );

    const defaultVariety = speciesData.varieties.find((v) => v.is_default);
    const pokemonData = await getPokemonData(defaultVariety.pokemon.url);

    const forms = await getUniqueFormsFromSpecies(speciesData);
    const abilities = getDisplayAbilitiesForPokemon(pokemonData, speciesData);

    renderPokemon(pokemonData, speciesData, forms, abilities);
  } catch (err) {
    console.error(err);
    container.innerHTML = "<p>Pokémon not found</p>";
  }
}

function updateSprite(imageEl, sprites) {
  imageEl.classList.add("sprite-fade-out");

  setTimeout(() => {
    imageEl.src = isShiny
      ? sprites[`${activeSprite}Shiny`]
      : sprites[activeSprite];

    imageEl.classList.remove("sprite-fade-out");
    imageEl.classList.add("sprite-fade-in");
  }, 120);
}
// ===== RENDER =====
async function renderPokemon(data, speciesData, forms, abilities) {
  activeSprite = "official";
  isShiny = false;

  const sprites = {
    official: data.sprites.other["official-artwork"].front_default,
    officialShiny: data.sprites.other["official-artwork"].front_shiny,
    modern: data.sprites.other.home.front_default,
    modernShiny: data.sprites.other.home.front_shiny,
  };

  const typesHtml = data.types
    .map(
      (t) =>
        `<span class="type-badge" style="background:${typeColors[t.type.name]}">${t.type.name.toUpperCase()}</span>`
    )
    .join("");

  const finalAbilities = abilities.map((a) => ({
    name: a.ability.name,
    is_hidden: a.is_hidden,
  }));

  const abilitiesHtml = finalAbilities
    .map(
      (a, index) => `
      <div class="ability-line">
        ${index + 1}. <a class="ability-link" href="/ability/${a.name}">
          ${formatFormName(a.name)}${a.is_hidden ? " (Hidden)" : ""}
        </a>
      </div>
    `
    )
    .join("");

  const stats = {
    HP: data.stats[0].base_stat,
    Attack: data.stats[1].base_stat,
    Defense: data.stats[2].base_stat,
    "Sp. Atk": data.stats[3].base_stat,
    "Sp. Def": data.stats[4].base_stat,
    Speed: data.stats[5].base_stat,
  };

  const effectiveness = await getTypeEffectiveness(data.types);

  const matchupModes = [{ label: "Base", effectiveness, mode: "base" }];

  finalAbilities.forEach((a) => {
    if (abilityImmunities[a.name]) {
      matchupModes.push({
        label: formatFormName(a.name),
        effectiveness: applyAbilityImmunities(effectiveness, [a]),
        mode: a.name,
      });
    }
  });

  container.innerHTML = `
<div class="pokemon-card">

<div class="pokemon-left">
  <div class="pokemon-image">
    <div class="sprite-tabs">
      <button class="sprite-tab active" data-sprite="official">Official</button>
      <button class="sprite-tab" data-sprite="modern">Modern</button>
      <button class="shiny-toggle">✨ Shiny</button>
    </div>
    <img src="${
      isShiny ? sprites[`${activeSprite}Shiny`] : sprites[activeSprite]
    }">
  </div>

  <div class="pokemon-stats">
    ${Object.entries(stats)
      .map(
        ([label, value]) => `
      <div class="stat-row">
        <div class="stat-label">${label}</div>
        <div class="stat-value">${value}</div>
        <div class="bar">
          <div class="fill" style="width:0%;background:${statColor(value)}"></div>
        </div>
      </div>`
      )
      .join("")}
  </div>
</div>

<div class="pokemon-info">
  <h2>${formatFormName(speciesData.name)}</h2>

  <p><strong>Pokédex Number:</strong> ${formatDexNumber(speciesData.id)}</p>

  <p><strong>Height:</strong> ${(data.height / 10).toFixed(1)} m</p>

  <p><strong>Weight:</strong> ${(data.weight / 10).toFixed(1)} kg</p>

  <p><strong>Type:</strong> ${typesHtml}</p>

  <p><strong>Abilities:</strong> ${abilitiesHtml}</p>

  ${
    forms.length > 1
      ? `
    <div class="form-tabs">
      ${forms
        .map(
          (f) => `
        <button class="form-tab ${f.pokemonName === data.name ? "active" : ""}"
          data-form="${f.pokemonName}">
          ${formatFormName(f.label)}
        </button>`
        )
        .join("")}
    </div>`
      : ""
  }
</div>

<div class="weakness-chart">
  <h3>Type Matchups</h3>

  <div class="matchup-tabs">
    ${matchupModes
      .map(
        (m, i) => `
      <button class="matchup-tab ${i === 0 ? "active" : ""}" data-mode="${m.mode}">
        ${m.label}
      </button>`
      )
      .join("")}
  </div>

  <div id="matchupTable">
    ${generateWeaknessTable(effectiveness)}
  </div>
</div>

</div>
`;
  // ===== SELECT ELEMENTS AFTER RENDER =====
  const imageEl = container.querySelector(".pokemon-image img");
  const spriteTabs = container.querySelectorAll(".sprite-tab");
  const shinyBtn = container.querySelector(".shiny-toggle");

  // ✅ Set active tab from saved preference
  spriteTabs.forEach((tab) => {
    if (tab.dataset.sprite === activeSprite) {
      tab.classList.add("active");
    } else {
      tab.classList.remove("active");
    }
  });

  // ===== SPRITE SWITCH =====
  spriteTabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      spriteTabs.forEach((t) => t.classList.remove("active"));
      tab.classList.add("active");

      activeSprite = tab.dataset.sprite;

      // 💾 Save preference
      localStorage.setItem("spritePreference", activeSprite);

      updateSprite(imageEl, sprites);
    });
  });

  // ===== SHINY TOGGLE =====
  shinyBtn.classList.toggle("active", isShiny);

  shinyBtn.addEventListener("click", () => {
    const nextState = !isShiny;

    // 🛑 PREVENT REDUNDANT UPDATE
    if (nextState === isShiny) return;

    isShiny = nextState;

    shinyBtn.classList.toggle("active", isShiny);

    updateSprite(imageEl, sprites);
  });

  // ===== ANIMATION =====
  requestAnimationFrame(() => {
    document.querySelectorAll(".fill").forEach((f, i) => {
      const value = Object.values(stats)[i];
      f.style.width = `${(value / 255) * 70}%`;
    });
  });

  // ===== FORM SWITCH =====
  document.querySelectorAll(".form-tab").forEach((tab) => {
    tab.addEventListener("click", async () => {
      const formName = tab.dataset.form;

      // PREVENT RELOAD IF SAME FORM
      if (formName === data.name) return;

      const newData = await getPokemonData(formName);
      const nextAbilities = getDisplayAbilitiesForPokemon(newData, speciesData);
      renderPokemon(newData, speciesData, forms, nextAbilities);
    });
  });

  // ===== MATCHUP SWITCH =====
  document.querySelectorAll(".matchup-tab").forEach((tab) => {
    tab.addEventListener("click", () => {
      document
        .querySelectorAll(".matchup-tab")
        .forEach((t) => t.classList.remove("active"));
      tab.classList.add("active");

      const selected = matchupModes.find((m) => m.mode === tab.dataset.mode);
      document.getElementById("matchupTable").innerHTML = generateWeaknessTable(
        selected.effectiveness
      );
    });
  });
}

// ===== INIT =====
if (nameParam) {
  fetchPokemon(nameParam);
} else {
  container.innerHTML = "<p>No Pokémon specified.</p>";
}
