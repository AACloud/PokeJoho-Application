// ===== Pokémon name aliases (forms PokéAPI requires) =====
const pokemonAliases = {
  giratina: "giratina-altered",
  tornadus: "tornadus-incarnate",
  thundurus: "thundurus-incarnate",
  landorus: "landorus-incarnate",
  enamorus: "enamorus-incarnate",
  meloetta: "meloetta-aria",
  hoopa: "hoopa-confined",
  shaymin: "shaymin-land",
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

// ===== Events =====
searchBtn.addEventListener("click", fetchPokemon);
input.addEventListener("keydown", (e) => {
  if (e.key === "Enter") fetchPokemon();
});

// ===== Helpers =====
function statColor(value) {
  // map 0–255 → hue (red → blue)
  const max = 255;
  const ratio = Math.min(value / max, 1);
  const hue = 240 * ratio; // 0=red, 240=blue
  return `hsl(${hue}, 80%, 55%)`;
}

// ===== Main =====
async function fetchPokemon() {
  let name = input.value.toLowerCase().trim();
  if (!name) return;

  name = pokemonAliases[name] || name;
  result.innerHTML = "<p>Loading...</p>";

  try {
    const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${name}`);
    if (!res.ok) throw new Error("Not found");

    const data = await res.json();

    // Artwork (official → fallback)
    const artwork =
      data.sprites.other?.["official-artwork"]?.front_default ||
      data.sprites.front_default;

    // Height / Weight (UNCHANGED logic)
    const heightMeters = data.height / 10;
    const feet = Math.floor(heightMeters * 3.28084);
    const inches = Math.round((heightMeters * 3.28084 - feet) * 12);

    const weightKg = data.weight / 10;
    const weightLbs = (weightKg * 2.20462).toFixed(1);

    // Types (badges)
    const typesHtml = data.types
      .map((t) => {
        const type = t.type.name;
        return `
          <span
            class="type-badge"
            style="background-color: ${typeColors[type]}"
          >
            ${type.toUpperCase()}
          </span>
        `;
      })
      .join("");

    // Abilities (hidden labeled)
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

    // Stats object
    const stats = {
      HP: data.stats[0].base_stat,
      Attack: data.stats[1].base_stat,
      Defense: data.stats[2].base_stat,
      "Sp. Atk": data.stats[3].base_stat,
      "Sp. Def": data.stats[4].base_stat,
      Speed: data.stats[5].base_stat,
    };
    const statTotal = Object.values(stats).reduce((sum, v) => sum + v, 0);

    // Stats HTML
    const statsHtml = Object.entries(stats)
      .map(([label, value]) => {
        return `
          <div class="stat-row">
            <div class="stat-label">${label}:</div>
            <div class="stat-value">${value}</div>
            <div class="bar">
              <div
                class="fill"
                style="
                  width: ${Math.min(value, 255) / 2}%;
                  background-color: ${statColor(value)};
                "
              ></div>
            </div>
          </div>
        `;
      })
      .join("");

    // Render
    // Render Pokémon card
    result.innerHTML = `
  <div class="pokemon-card">
    <div class="pokemon-image">
      <img src="${artwork}" alt="${data.name}" />
    </div>

    <div class="pokemon-info">
      <h2>${data.name}</h2>

      <p><strong>Pokedex #:</strong> ${data.id}</p>

      <p><strong>Species:</strong> ${data.species.name
        .replace("-", " ")
        .replace(/\b\w/g, (c) => c.toUpperCase())}</p>

      <p>
        <strong>Height:</strong>
        ${heightMeters.toFixed(1)} m (${feet}' ${inches}")
      </p>

      <p>
        <strong>Weight:</strong>
        ${weightKg.toFixed(1)} kg (${weightLbs} lbs)
      </p>

      <p><strong>Type:</strong> ${typesHtml}</p>

      <p><strong>Ability:</strong> ${abilitiesHtml}</p>
    </div>

    <div class="pokemon-stats">
      ${Object.entries(stats)
        .map(([label, value]) => {
          return `
            <div class="stat-row">
              <div class="stat-label">${label}:</div>
              <div class="stat-value">${value}</div>
              <div class="bar">
                <div
                  class="fill"
                  style="
                    width: 0%; /* start at 0% for animation */
                    background-color: ${statColor(value)};
                  "
                ></div>
              </div>
            </div>
          `;
        })
        .join("")}

      <!-- BST under stats -->
      <div class="stat-total">
        <strong>Base Stat Total:</strong> ${statTotal}
      </div>
    </div>
  </div>
`;
    // Animate stat bars
    const fills = document.querySelectorAll(".pokemon-stats .fill");
    fills.forEach((fill, i) => {
      // Get the corresponding stat value
      const statValue = Object.values(stats)[i];
      // Animate width after a tiny delay to allow rendering
      setTimeout(() => {
        fill.style.width = `${Math.min(statValue, 255) / 2}%`;
      }, 50); // 50ms delay ensures CSS transition triggers
    });
  } catch (err) {
    result.innerHTML = "<p>Pokémon not found</p>";
  }
}
