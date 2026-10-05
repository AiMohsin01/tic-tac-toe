# AIM ARCADE — Tic Tac Toe

A polished, dependency-free Tic Tac Toe game built with HTML, CSS, and JavaScript.

## Run it

Open `index.html` in any modern browser. No installation, build step, or server is required.

## Features

- Solo mode against a built-in computer opponent
- Local two-player mode on one device
- Player-name setup with browser-based name persistence
- Scoreboard, round tracker, reset controls, and winner celebration modal
- Responsive blue arcade-style interface

## Project files

- `index.html` — page structure, dialogs, and accessible game controls
- `style.css` — responsive visual system and animations
- `script.js` — game state, computer moves, player setup, and browser storage

## Development notes

Player names and the selected mode are saved only in the browser using `localStorage` under the key `aim-arcade-player-setup`. Clear browser site data if you want to simulate a new visitor.

The computer player uses simple tactical logic: it wins when possible, blocks an immediate player win, then prefers the center and corners. This keeps games lively without making the code overly complex.
