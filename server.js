const express = require("express");
const path = require("path");

const app = express();
const PORT = 3000;

// Serve all static files: css, js, assets, components, etc.
app.use(express.static(__dirname));

// Clean Poké-Joho routes
app.get("/pokedex/national", (_req, res) => {
  res.sendFile(path.join(__dirname, "pokedex-national.html"));
});

app.get("/pokedex/:name", (_req, res) => {
  res.sendFile(path.join(__dirname, "pokedex.html"));
});

app.get("/ability/:name", (_req, res) => {
  res.sendFile(path.join(__dirname, "ability.html"));
});

app.get("/", (_req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

app.listen(PORT, () => {
  console.log(`http://127.0.0.1:${PORT}`);
});
