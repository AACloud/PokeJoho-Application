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

const button = document.getElementById("searchBtn");
const input = document.getElementById("pokemonInput");
const result = document.getElementById("pokemonResult");

async function fetchPokemon() {
  let name = input.value.toLowerCase().trim();
  name = pokemonAliases[name] || name;

  if (!name) return;

  result.innerHTML = "<p>Loading...</p>";

  try {
    const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${name}`);
    if (!res.ok) throw new Error("Pokémon not found");

    const data = await res.json();

    const pokedexNumber = data.id; // Pokedex Number

    // Species
    const species = data.species.name
      .replace("-", " ")
      .replace(/\b\w/g, (c) => c.toUpperCase());

    const heightMeters = data.height / 10;
    const weightKg = data.weight / 10;

    // Height in feet/inches
    const totalInches = heightMeters * 39.3701;
    const feet = Math.floor(totalInches / 12);
    const inches = Math.round(totalInches % 12);

    // Weight in pounds
    const weightLbs = (weightKg * 2.20462).toFixed(1);

    // Pokemon Type
    const types = data.types.map((t) => t.type.name.toUpperCase()).join(" / ");

    // Ability
    const abilities = data.abilities
      .map((a) =>
        a.ability.name
          .replace("-", " ")
          .replace(/\b\w/g, (c) => c.toUpperCase())
      )
      .join(", ");

    //stats

    const stats = {
      hp: data.stats.find((s) => s.stat.name === "hp").base_stat,
      attack: data.stats.find((s) => s.stat.name === "attack").base_stat,
      defense: data.stats.find((s) => s.stat.name === "defense").base_stat,
      "special-attack": data.stats.find((s) => s.stat.name === "special-attack")
        .base_stat,
      "special-defense": data.stats.find(
        (s) => s.stat.name === "special-defense"
      ).base_stat,
      speed: data.stats.find((s) => s.stat.name === "speed").base_stat,
    };

    const maxStat = 200;

    const getStatColor = (value, max = 200) => {
      // Clamp value between 0 and max
      const clamped = Math.min(Math.max(value, 0), max);

      // Hue range: red (0) → blue (220)
      const hue = (clamped / max) * 220;

      return `hsl(${hue}, 85%, 50%)`;
    };

    const statBar = (label, value) => {
      const color = getStatColor(value, maxStat);
      const lightColor = `${color}33`; // add transparency for background (33 = 20% opacity)

      return `
    <div class="stat">
    <div class="stat-header">
      <span class="stat-label">${label}:</span>
      <span class="stat-value">${value}</span>
    </div>
    <div class="bar">
      <div
        class="fill"
        style="
          width: ${(value / maxStat) * 50}%;
          background-color: ${getStatColor(value, maxStat)};
        "
      ></div>
    </div>
  </div>
`;
    };

    const statsHtml = `
  <h3>Stats</h3>
  ${statBar("HP", stats.hp)}
  ${statBar("Attack", stats.attack)}
  ${statBar("Defense", stats.defense)}
  ${statBar("Sp. Attack", stats["special-attack"])}
  ${statBar("Sp. Defense", stats["special-defense"])}
  ${statBar("Speed", stats.speed)}
`;
    result.innerHTML = `
  <div class="pokemon-card">
    <div class="pokemon-image">
      <img
        src="${data.sprites.other["official-artwork"].front_default}"
        alt="${data.name}"
      />

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

  <p><strong>Type:</strong>
    ${data.types.map((t) => t.type.name.toUpperCase()).join(" / ")}
  </p>

  <p><strong>Ability:</strong>
    ${data.abilities
      .map((a) =>
        a.ability.name
          .replace("-", " ")
          .replace(/\b\w/g, (c) => c.toUpperCase())
      )
      .join(", ")}
  </p>
</div>


    <div class="pokemon-stats">
      ${statsHtml}
    </div>
  </div>
`;
  } catch (err) {
    result.innerHTML = `<p class="error">${err.message}</p>`;
  }
}

button.addEventListener("click", fetchPokemon);

input.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    fetchPokemon();
  }
});
