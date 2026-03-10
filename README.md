# Eclipse: Second Dawn for the Galaxy — Combat Calculator

A small React + Vite web app that estimates battle outcomes for **Eclipse: Second Dawn for the Galaxy** using Monte Carlo simulation.

You configure attacker/defender ship stacks (weapons, computer, shield, hull, initiative, ship count, etc.), then the app runs many simulated combats and reports:

- Attacker / Defender / Draw rates
- Per-ship survival rate **given that side wins**

## Features

- Two sides: **Attacker** and **Defender**
- Multiple ships per side (add/remove ships)
- NPC presets (Ancients / Guardians / GCDS) + Custom
- Weapons supported:
  - Cannons: Yellow (1), Orange (2), Blue (3), Red / Antimatter (4)
  - Rift Cannon (special table)
  - Missiles: Yellow (1), Orange (2)
- Tech toggles:
  - **Antimatter Splitter** (splits Antimatter damage across ships)
  - **Morph Shield** (heals 1 HP per round while alive)

## How to Use

1. Configure ships on each side using the tiles.
   - **Left-click**: increase a value
   - **Right-click**: decrease a value
2. Optionally pick a preset for attacker/defender.
3. Toggle techs as needed.
4. Click **Calculate**.

## Simulation Notes

- The app runs a fixed number of iterations per calculation (default is `10,000`).
- Combat is simulated with missiles first (if present), then repeated cannon rounds up to a max round limit.
- If the state doesn’t change for several rounds, the battle is treated as a draw (to avoid infinite stalemates).

If you want to change the iteration count, edit the `ITERATIONS` constant in `src/App.jsx`.

## Local Development

Requires Node.js.

```bash
npm install
npm run dev
```

Open the URL printed in the terminal (usually `http://localhost:5173`).

## Build

```bash
npm run build
npm run preview
```

## Tech Stack

- React
- Vite

## Disclaimer

This project is an unofficial community tool. The game _Eclipse: Second Dawn for the Galaxy_ and related content are the property of their respective owners.
