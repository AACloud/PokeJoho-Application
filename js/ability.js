const params = new URLSearchParams(window.location.search);
const abilityName = params.get("ability");

async function loadAbility() {
  const res = await fetch(`https://pokeapi.co/api/v2/ability/${abilityName}`);
  const data = await res.json();

  // Ability title
  const formattedName =
    abilityName.charAt(0).toUpperCase() + abilityName.slice(1);

  document.getElementById("abilityName").textContent = formattedName;

  // Generation introduced
  const generation = data.generation.name.replace("generation-", "Gen ");
  document.getElementById("abilityGeneration").textContent =
    `Introduced in ${generation.toUpperCase()}`;

  // Ability effect
  const effectEntry = data.effect_entries.find(
    (entry) => entry.language.name === "en"
  );

  document.getElementById("abilityEffect").textContent =
    effectEntry?.effect || "No effect description available.";

  // Pokémon list
  const pokemonList = document.getElementById("abilityPokemonList");

  data.pokemon.slice(0, 20).forEach((p) => {
    const li = document.createElement("li");

    const name =
      p.pokemon.name.charAt(0).toUpperCase() + p.pokemon.name.slice(1);

    li.textContent = name;

    pokemonList.appendChild(li);
  });
}

loadAbility();
