const button = document.getElementById("searchBtn");
const result = document.getElementById("pokemonResult");

button.addEventListener("click", async () => {
  const name = document
    .getElementById("pokemonInput")
    .value
    .toLowerCase()
    .trim();

  if (!name) return;

  try {
    const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${name}`);
    if (!res.ok) throw new Error("Pokémon not found");

    const data = await res.json();

    result.innerHTML = `
      <h2>${data.name}</h2>
      <img src="${data.sprites.front_default}" />
      <p>Height: ${(data.height / 10).toFixed(1)} m</p>
      <p>Weight: ${(data.weight / 10).toFixed(1)} kg</p>

    `;
  } catch (err) {
    result.innerHTML = `<p>${err.message}</p>`;
  }
});
