# 🧭 Poké-Joho

A modern, interactive Pokédex-style web app built with **vanilla HTML, CSS, and JavaScript**, powered by **PokeAPI**. Poké-Joho focuses on accurate Pokémon data, clean UI, correct handling of Pokémon forms, and advanced type matchup logic.

---

## ✨ Features

* 🔍 **Pokémon Search** by name

* 🧠 **Smart Base Form Resolution**  
  Searching a Pokémon name always loads its **official base/default form** using Pokémon *species* data (no hard-coded aliases).

* 🔁 **Form Switching Tabs**  
  Switch between all available Pokémon forms using tabs. Each form is fetched directly from the Pokémon endpoint for accuracy.

* ⚔️ **Battle-Only Form Indicators**  
  Forms that only appear during battle (e.g. Palafin Hero, Zygarde Complete, Aegislash Blade) are visually marked with a ⚔️ badge.

* 📊 **Animated Base Stat Bars**  
  Stats animate smoothly from 0 to their base stat value.

* 🎨 **Type Badges with Accurate Colors**

* 🖼️ **Sprite Switching**
  Toggle between:
  * Official artwork
  * Modern HOME-style sprites
  * Shiny sprites

* 🧬 **Ability-Based Type Matchups**
  * Automatically detects abilities that grant **type immunities**
  * Generates **separate effectiveness tables per ability**
  * Tabs are labeled with the **actual ability name**
  * Base tab is hidden when redundant
  * Ability tabs are hidden if no matchup-changing abilities exist
  * Correct matchup table is shown automatically on search

* 📋 **Full Type Effectiveness Table**
  * Displays all 18 types
  * Shows:
    * `4×`, `2×`, `1×`, `½×`, `¼×`, `0×`
  * Color-coded type boxes
  * Optimized square grid layout

* 🌙 **Dark Mode Toggle** (with saved preference)

* ✍️ **Autocomplete Search**  
  Live Pokémon name suggestions while typing.

* 📱 **Responsive Design**  
  Fully usable on desktop and mobile screens.

---

## 🧩 How Form Handling Works (Important)

### Base Form Resolution

When a user searches a Pokémon name:

1. The app fetches `/pokemon-species/{name}`
2. Finds the variety where `is_default === true`
3. Loads that Pokémon as the base form

This ensures correct results for Pokémon like:

* Palafin → Zero Form  
* Deoxys → Normal Form  
* Giratina → Altered Form  

---

### Form Switching

* Clicking a form tab fetches the Pokémon **directly** via `/pokemon/{form-name}`
* Species data is reused to keep forms grouped correctly
* Preloaded and cached for **instant switching**

---

### Battle-Only Forms

A form is marked as battle-only if:

* `is_battle_only === true` in the API  
**OR**
* Its name matches known battle-state mechanics (Hero, Complete, Blade, etc.)

---

## ⚔️ Type Matchup System

### Base Matchups

Calculated using the Pokémon’s **combined defensive typing**.

Example:

Garchomp → Ice shows **4×**, not `2× + 2×`.

---

### Ability Matchups

If a Pokémon has an ability that grants an immunity:

Example abilities:

* Lightning Rod → Electric immunity
* Flash Fire → Fire immunity
* Water Absorb → Water immunity

The app:

* Creates a **separate matchup mode**
* Applies the immunity to the type chart
* Lets the user switch between them via tabs

---

### Smart Tab Logic

| Situation | Result |
|-----------|--------|
No immunity abilities | No tabs shown |
Only immunity abilities | Only ability tabs shown |
Mixed abilities | Base + ability tabs |

The chart **always remains visible**.

---

## 🚀 Performance Optimizations

* ⚡ Type data is **preloaded and cached**
* ⚡ Pokémon data is **cached for instant form switching**
* ⚡ No redundant API calls

---

## 🛠️ Tech Stack

* **HTML5**
* **CSS3** (Flexbox, responsive design, dark mode via CSS variables)
* **Vanilla JavaScript (ES6+)**
* **PokeAPI** → https://pokeapi.co

> No build tools or frameworks required.

---

## 📜 License

This project is for educational and personal use.  
Pokémon and Pokémon names are © Nintendo / Game Freak.
