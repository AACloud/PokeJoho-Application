# 🧭 Poké-Joho

A modern, interactive Pokédex-style web app built with **vanilla HTML, CSS, and JavaScript**, powered by **PokeAPI**. Poké-Joho focuses on accurate Pokémon data, clean UI, correct handling of Pokémon forms, and advanced type matchup logic.

---

# ✨ Features

### 🔍 Pokémon Search

Search any Pokémon by name using a fast, autocomplete-powered search bar.

---

### 🧠 Smart Base Form Resolution

Searching a Pokémon name always loads its **official base/default form** using Pokémon _species_ data.

The app:

1. Fetches `/pokemon-species/{name}`
2. Finds the variety where `is_default === true`
3. Loads that Pokémon as the base form

This ensures correct results for Pokémon like:

- Palafin → Zero Form
- Deoxys → Normal Form
- Giratina → Altered Form

No hard-coded aliases are required.

---

### 🔁 Form Switching Tabs

Switch between all available Pokémon forms using tabs.

- Each form is fetched directly from `/pokemon/{form-name}`
- Species data keeps forms grouped correctly
- Forms are **preloaded and cached** for instant switching

---

### ⚔️ Battle-Only Form Indicators

Forms that only appear during battle are visually marked with a **⚔️ badge**.

Examples include:

- Palafin Hero
- Zygarde Complete
- Aegislash Blade

---

### 📊 Animated Base Stat Bars

Pokémon base stats animate smoothly from **0 → their base stat value**.

---

### 🎨 Type Badges with Accurate Colors

Each Pokémon type is displayed with its **official color scheme**.

---

### 🖼️ Sprite Switching

Toggle between different Pokémon artwork styles:

- Official artwork
- Pokémon HOME-style sprites
- Shiny sprites

---

### 🧬 Ability System

Poké-Joho includes **clickable abilities with detailed ability pages**.

Abilities displayed on the Pokémon card are clickable and open a dedicated page with additional information.

Ability pages include:

- 📜 **Ability effect description**
- 🧬 **Generation introduced**
- 🐾 **List of Pokémon that have the ability**

This information is fetched directly from the **PokeAPI ability endpoint**.

---

### ⚔️ Ability-Based Type Matchups

Poké-Joho automatically detects abilities that grant **type immunities** and generates separate matchup tables.

Examples:

- Lightning Rod → Electric immunity
- Flash Fire → Fire immunity
- Water Absorb → Water immunity

The system:

- Creates **separate effectiveness tables per ability**
- Labels tabs with the **actual ability name**
- Hides the base tab when redundant
- Automatically displays the correct matchup table after search

---

### 📋 Full Type Effectiveness Table

Displays all **18 Pokémon types** in a grid.

Shows:

- `4×`
- `2×`
- `1×`
- `½×`
- `¼×`
- `0×`

Features:

- Color-coded type boxes
- Square grid layout
- Clear multiplier display

---

### 🌙 Dark Mode

Toggle between **light and dark themes**.

The user’s preference is saved using **localStorage**, so the selected theme persists across sessions.

---

### ✍️ Autocomplete Search

Live Pokémon name suggestions appear while typing in the search bar.

---

### 📱 Responsive Design

The interface works smoothly across:

- Desktop
- Tablets
- Mobile devices

---

# 🧩 Form Handling System

## Base Form Resolution

When a Pokémon is searched:

1. `/pokemon-species/{name}` is fetched
2. The variety where `is_default === true` is identified
3. That Pokémon is loaded as the base form

This guarantees correct behavior for Pokémon with multiple forms.

---

## Form Switching

When a form tab is clicked:

- The form is fetched directly using `/pokemon/{form-name}`
- Previously loaded forms are cached for faster switching

---

## Battle-Only Forms

A form is flagged as battle-only if:

- `is_battle_only === true` in the API
  OR
- Its name matches known battle mechanics (Hero, Complete, Blade, etc.)

---

# ⚔️ Type Matchup System

## Base Matchups

Type matchups are calculated using the Pokémon’s **combined defensive typing**.

Example:

Garchomp → Ice shows **4×**, not `2× + 2×`.

---

## Ability Matchups

If a Pokémon has an ability that grants a type immunity, Poké-Joho:

1. Detects the ability
2. Applies the immunity to the type chart
3. Creates a separate matchup mode

Example:

Lightning Rod → Electric attacks become **0×** instead of normal damage.

---

## Smart Tab Logic

| Situation               | Result                  |
| ----------------------- | ----------------------- |
| No immunity abilities   | No tabs shown           |
| Only immunity abilities | Only ability tabs shown |
| Mixed abilities         | Base + ability tabs     |

The type chart **always remains visible**.

---

# 🚀 Performance Optimizations

Poké-Joho includes several optimizations:

- ⚡ Type data is **preloaded and cached**
- ⚡ Pokémon data is **cached for instant form switching**
- ⚡ Ability data is loaded only when needed
- ⚡ No redundant API calls

---

# 🛠️ Tech Stack

- **HTML5**
- **CSS3**
  - Flexbox
  - Responsive design
  - CSS variables for dark mode

- **Vanilla JavaScript (ES6+)**
- **PokeAPI**

https://pokeapi.co

No frameworks or build tools are required.

---

# 🧹 Code Quality

Poké-Joho uses modern tooling for consistent code formatting:

- **ESLint** – JavaScript linting
- **Prettier** – automatic code formatting

---

# 📜 License

This project is for **educational and personal use**.

Pokémon and Pokémon names are © Nintendo / Game Freak.
