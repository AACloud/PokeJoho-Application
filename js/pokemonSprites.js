const FORM_SUFFIXES = [
  "-mega",
  "-mega-x",
  "-mega-y",
  "-gmax",
  "-incarnate",
  "-therian",
  "-altered",
  "-origin",
  "-land",
  "-sky",
  "-aria",
  "-pirouette",
  "-confined",
  "-unbound",
  "-amped",
  "-low-key",
  "-male",
  "-female",
  "-zero",
  "-hero",
];

function getBaseName(name) {
  let formatted = name.toLowerCase().trim();

  for (const suffix of FORM_SUFFIXES) {
    if (formatted.endsWith(suffix)) {
      return formatted.slice(0, -suffix.length);
    }
  }

  return formatted;
}

function formatPokemonName(name) {
  return name
    .toLowerCase()
    .trim()
    .replace(/\./g, "")
    .replace(/'/g, "")
    .replace(/:/g, "")
    .replace(/\s+/g, "-");
}

function getPokemonSprite(name) {
  const base = formatPokemonName(getBaseName(name));
  return `https://img.pokemondb.net/sprites/home/normal/${base}.png`;
}

function handleSpriteError(e) {
  e.target.src =
    "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/0.png";
}

export { getPokemonSprite, handleSpriteError };
