import { getPokemonSprite, handleSpriteError } from "./pokemonSprites.js";

function getAbilityNameFromPath() {
  const parts = window.location.pathname.split("/").filter(Boolean);

  if (parts[0] === "ability" && parts[1]) {
    return parts[1];
  }

  const params = new URLSearchParams(window.location.search);
  return params.get("name");
}

window.addEventListener("DOMContentLoaded", () => {
  const tableBody = document.getElementById("pokemonWithAbility");
  const abilityNameEl = document.getElementById("abilityName");
  const abilityDescEl = document.getElementById("abilityDescription");

  const abilityName = getAbilityNameFromPath();

  if (!abilityName) {
    tableBody.innerHTML = "<tr><td colspan='5'>No ability specified.</td></tr>";
    return;
  }

  loadAbility(abilityName);

  async function loadAbility(abilityName) {
    try {
      const res = await fetch(
        `https://pokeapi.co/api/v2/ability/${abilityName}`
      );
      const data = await res.json();

      abilityNameEl.textContent = data.name.toUpperCase();

      const effect = data.effect_entries.find((e) => e.language.name === "en");
      abilityDescEl.textContent = effect
        ? effect.effect
        : "No description available.";

      const rows = await Promise.all(
        data.pokemon
          .filter((entry) => {
            const pokemonName = entry.pokemon.name;
            return (
              !pokemonName.includes("gmax") &&
              !pokemonName.includes("mega") &&
              !pokemonName.includes("totem")
            );
          })
          .map(async (entry) => {
            const pokemonName = entry.pokemon.name;

            const pokeRes = await fetch(
              `https://pokeapi.co/api/v2/pokemon/${pokemonName}`
            );
            const pokeData = await pokeRes.json();

            const dexNumber = pokeData.id;
            const types = pokeData.types.map((t) => t.type.name).join(", ");

            const otherAbilities =
              pokeData.abilities
                .map((a) => a.ability.name)
                .filter((a) => a !== abilityName)
                .join(", ") || "—";

            const row = document.createElement("tr");
            row.style.cursor = "pointer";
            row.addEventListener("click", () => {
              window.location.href = `/pokedex/${pokemonName}`;
            });

            row.innerHTML = `
              <td>${dexNumber}</td>
              <td>
                <img
                  src="${getPokemonSprite(pokemonName)}"
                  alt="${pokemonName}"
                  onerror="this.onerror=null;this.src='https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/0.png';"
                />
              </td>
              <td>${pokemonName}</td>
              <td>${types}</td>
              <td>${otherAbilities}</td>
            `;

            return row;
          })
      );

      tableBody.innerHTML = "";
      rows.forEach((row) => tableBody.appendChild(row));
    } catch (err) {
      console.error("Error loading ability:", err);
      tableBody.innerHTML =
        "<tr><td colspan='5'>Failed to load ability.</td></tr>";
    }
  }
});
