import { getPokemonSprite, handleSpriteError } from "./pokemonSprites.js";

const list = document.getElementById("national-pokedex-list");

async function loadNationalPokedex() {
  try {
    list.innerHTML = "<p>Loading National Pokédex...</p>";

    const res = await fetch(
      "https://pokeapi.co/api/v2/pokemon-species?limit=1025"
    );
    const data = await res.json();

    list.innerHTML = "";

    data.results.forEach((pokemon, index) => {
      const dexNumber = index + 1;
      const pokemonName = pokemon.name;

      const card = document.createElement("div");
      card.className = "national-pokedex-card";

      card.addEventListener("click", () => {
        window.location.href = `/pokedex/${pokemonName}`;
      });

      card.innerHTML = `
        <p class="dex-number">#${String(dexNumber).padStart(4, "0")}</p>
        <img
          src="${getPokemonSprite(pokemonName)}"
          alt="${pokemonName}"
        />
        <p class="pokemon-name">${pokemonName}</p>
      `;

      card.querySelector("img").onerror = handleSpriteError;

      list.appendChild(card);
    });
  } catch (err) {
    console.error(err);
    list.innerHTML = "<p>Failed to load National Pokédex.</p>";
  }
}

loadNationalPokedex();
