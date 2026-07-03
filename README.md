# Poké-Joho

A modern, interactive Pokédex-style web app built with **vanilla HTML, CSS, and JavaScript**, powered by **PokeAPI**. Poké-Joho focuses on accurate Pokémon data, clean UI, correct handling of Pokémon forms, clean page routing, detailed ability pages, and advanced type matchup logic.

---

# Features

## Pokémon Search

Search any Pokémon by name using a fast, autocomplete-powered search bar.

Features include:

- Live Pokémon name suggestions
- Keyboard support
- Search button support
- Enter key support
- Search available across multiple pages through a shared header

---

## Shared Site Header

Poké-Joho uses a reusable shared header loaded from a single component file.

The shared header includes:

- Poké-Joho logo/title
- Light/Dark Mode toggle
- Search bar
- Autocomplete dropdown
- Navigation dropdown menu

This prevents repeating the same header HTML across every page.

---

## Dropdown Navigation Menu

A horizontal navigation menu appears under the header line.

Current structure:

```text
Pokemon | Pokedex | Mechanic | Settings
```

The navigation menu provides a cleaner way to access major sections of the app, including the National Pokédex page.

---

## Smart Base Form Resolution

Searching a Pokémon name always loads its **official base/default form** using Pokémon _species_ data.

The app:

1. Fetches `/pokemon-species/{name}`
2. Finds the variety where `is_default === true`
3. Loads that Pokémon as the base form

This ensures correct results for Pokémon like:

- Palafin → Zero Form
- Deoxys → Normal Form
- Giratina → Altered Form

No hard-coded aliases are required for normal base-form searching.

---

## National Pokédex Page

Poké-Joho includes a National Pokédex page available at:

```text
/pokedex/national
```

This page displays Pokémon in National Pokédex order and shows their base forms.

Each Pokémon entry includes:

- National Pokédex number
- Pokémon image sprite
- Pokémon name

Clicking a Pokémon opens its individual Pokédex page:

```text
/pokedex/{pokemonName}
```

Example:

```text
/pokedex/aerodactyl
```

---

## Clean Page Routes

Poké-Joho uses clean Express routes instead of query-string URLs.

Examples:

```text
/pokedex/aerodactyl
/ability/intimidate
/pokedex/national
```

Instead of:

```text
pokedex.html?name=aerodactyl
ability.html?name=intimidate
```

This makes the app feel more like a real website and improves navigation structure.

---

## Form Switching Tabs

Switch between all available Pokémon forms using tabs.

- Each form is fetched directly from `/pokemon/{form-name}`
- Species data keeps forms grouped correctly
- Forms are preloaded and cached for faster switching
- Battle-only forms can be visually marked

---

## Battle-Only Form Indicators

Forms that only appear during battle are visually marked with a **⚔️ badge**.

Examples include:

- Palafin Hero
- Zygarde Complete
- Aegislash Blade

---

## Special Form and Ability Handling

Poké-Joho includes custom logic for Pokémon whose forms or abilities require special handling.

Examples:

- Zygarde 10% and 50% can display both Aura Break and Power Construct
- Zygarde Complete displays Power Construct
- Ability-based suffixes are prevented from becoming separate form tabs
- Form names are normalized for cleaner display

---

## Animated Base Stat Bars

Pokémon base stats animate smoothly from **0 → their base stat value**.

Stats include:

- HP
- Attack
- Defense
- Special Attack
- Special Defense
- Speed
- Base Stat Total

---

## Type Badges with Accurate Colors

Each Pokémon type is displayed with a matching color scheme.

Examples:

- Fire
- Water
- Grass
- Electric
- Dragon
- Fairy

---

## Sprite Switching

Pokémon detail pages support multiple artwork styles.

Sprite options include:

- Official artwork
- Pokémon HOME-style sprites
- Shiny sprites

The selected sprite view can be switched using the sprite controls on the Pokémon page.

---

## Pokémon HOME Icon Sprites

Poké-Joho uses Pokémon HOME-style icon sprites for Pokémon list displays, such as the ability page and National Pokédex page.

The sprite helper includes safer name formatting so Pokémon with hyphenated names, such as:

- Ho-Oh
- Porygon-Z
- Jangmo-o
- Hakamo-o
- Kommo-o

do not break when loading image URLs.

---

## Ability System

Poké-Joho includes clickable abilities with detailed ability pages.

Abilities displayed on the Pokémon card open a dedicated ability page.

Example:

```text
/ability/intimidate
```

Ability pages include:

- Ability effect description
- List of Pokémon that have the ability
- Pokémon image
- Pokédex number
- Type
- Other abilities

This information is fetched directly from the PokeAPI ability endpoint.

---

## ⚡ Faster Ability Page Loading

Ability pages fetch Pokémon data in parallel using `Promise.all()`.

Instead of waiting for each Pokémon request one by one, Poké-Joho starts multiple Pokémon detail requests at the same time.

This improves load speed for abilities that belong to many Pokémon, such as:

- Intimidate
- Overgrow
- Levitate
- Swift Swim

---

## Ability-Based Type Matchups

Poké-Joho automatically detects abilities that grant type immunities and generates separate matchup tables.

Examples:

- Lightning Rod → Electric immunity
- Flash Fire → Fire immunity
- Water Absorb → Water immunity
- Levitate → Ground immunity

The system:

- Creates separate effectiveness tables per ability
- Labels tabs with the actual ability name
- Hides the base tab when redundant
- Automatically displays the correct matchup table after search

---

## Full Type Effectiveness Table

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

## Dark Mode

Toggle between light and dark themes.

The selected theme is saved using `localStorage`, so the user’s preference persists across sessions.

---

## Responsive Design

The interface is designed to work across:

- Desktop
- Tablets
- Mobile devices

---

# Form Handling System

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
- The Pokémon card updates with the selected form’s data

---

## Battle-Only Forms

A form is flagged as battle-only if:

- `is_battle_only === true` in the API

OR

- Its name matches known battle mechanics such as Hero, Complete, Blade, and similar battle-only forms

---

# Type Matchup System

## Base Matchups

Type matchups are calculated using the Pokémon’s combined defensive typing.

Example:

Garchomp takes **4×** damage from Ice because Dragon and Ground are both weak to Ice.

---

## Ability Matchups

If a Pokémon has an ability that grants a type immunity, Poké-Joho:

1. Detects the ability
2. Applies the immunity to the type chart
3. Creates a separate matchup mode

Example:

Lightning Rod makes Electric attacks become **0×** instead of normal damage.

---

## Smart Tab Logic

| Situation               | Result                  |
| ----------------------- | ----------------------- |
| No immunity abilities   | No tabs shown           |
| Only immunity abilities | Only ability tabs shown |
| Mixed abilities         | Base + ability tabs     |

The type chart always remains visible.

---

Poké-Joho includes several optimizations:

- Type data is preloaded and cached
- Pokémon data is cached for faster form switching
- Ability page Pokémon data is fetched in parallel
- Ability data is loaded only when needed
- Shared header prevents repeated HTML across pages
- Clean routes improve navigation flow

---

# Tech Stack

- **HTML5**
- **CSS3**
  - Flexbox
  - Grid
  - Responsive design
  - CSS variables for dark mode

- **Vanilla JavaScript**
  - ES Modules
  - Fetch API
  - DOM manipulation
  - LocalStorage

- **Node.js**
- **Express**
- **PokeAPI**

PokeAPI:

```text
https://pokeapi.co
```

# License

This project is for educational and personal use.

Pokémon, Pokémon names, and related assets are trademarks or copyrights of Nintendo, Game Freak, Creatures Inc., and The Pokémon Company.

Poké-Joho is an unofficial fan-made project and is not affiliated with or endorsed by Nintendo, Game Freak, Creatures Inc., or The Pokémon Company.
