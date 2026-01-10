const button = document.getElementById("searchBtn");
const input = document.getElementById("pokemonInput");
const result = document.getElementById("pokemonResult");

async function fetchPokemon() {
  const name = input.value.toLowerCase().trim();
  if (!name) return;

  result.innerHTML = "<p>Loading...</p>";

  try {
    const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${name}`);
    if (!res.ok) throw new Error("Pokémon not found");

    const data = await res.json();

    const heightMeters = data.height / 10;
    const weightKg = data.weight / 10;

    // Height in feet/inches
    const totalInches = heightMeters * 39.3701;
    const feet = Math.floor(totalInches / 12);
    const inches = Math.round(totalInches % 12);

    // Weight in pounds
    const weightLbs = (weightKg * 2.20462).toFixed(1);

    result.innerHTML = `
      <h2>${data.name}</h2>
      <img src="${data.sprites.front_default}" alt="${data.name}" />
      <p>Height: ${heightMeters.toFixed(1)} m
      (${feet}' ${inches}")</p>
      <p>Weight: ${weightKg.toFixed(1)} kg
      (${weightLbs} lbs)</p>
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
