# Repository Guidelines

## Project Structure & Module Organization

This repository contains “מה מירי אמרה?”, a static Hebrew quote quiz designed for GitHub Pages and direct browser use. Preact source files live under `src/`, with build scripts and content at the repository root:

- `src/main.jsx`: quote loading and Preact entry point.
- `src/App.jsx`: game state and responsive composition.
- `src/components/`: JSX components for questions, feedback, results, sharing, and media playback.
- `src/game.js`: game reducer, shuffling, and scoring.
- `style.css`: responsive layout, right-to-left presentation, and interaction states.
- `quotes.json`: quote catalog, truth labels, source links, and optional media.
- `build.mjs`: generates the standalone `index.html`, embedding scripts, styles, quotes, and PNG assets.
- `server.mjs`: local HTTP server with an explicit file allowlist.
- `assets/`: background and favicon images, plus their creation prompts.

Edit source files and regenerate `index.html`; avoid editing the generated page directly. Interaction and state tests live under `test/`.

## Build, Test, and Development Commands

Node.js is required; run `npm ci` before developing.

- `npm run build`: regenerate `index.html` and validate quote JSON during parsing.
- `npm start`: build and serve the game at `http://localhost:8000`.
- `PORT=8001 npm start`: use another local port.
- `npm test`: rebuild and run game-state and generated-page interaction tests.
- `node --check build.mjs`: check Node script syntax; repeat for changed `.mjs` files. The build checks JSX syntax.

## Coding Style & Naming Conventions

Follow existing JavaScript conventions: two-space indentation, semicolons, single-quoted strings, and camelCase functions and variables. Node scripts use ES modules and built-in APIs. Keep CSS class names in kebab-case and match surrounding formatting; no formatter or linter is configured. Preserve Hebrew copy, RTL layout, keyboard focus behavior, and accessible labels.

## Testing Guidelines

Run `npm test` for Node test-runner and jsdom checks. There is no coverage threshold. After changes, build and manually check answering, feedback, scoring, restart, and media cleanup between questions. Check desktop and mobile layouts, keyboard navigation, and direct `index.html` opening for offline fallback behavior. Real quotes require `context` and `source`; optional `video` and `audio` fields should retain working playback or fallback links.

## Commit & Pull Request Guidelines

The short Git history uses concise subjects such as “Add quote media, illustrated background and favicon”; no formal commit convention is established. Use descriptive, imperative subjects. Pull requests should explain the change, list validation performed, link relevant issues, and include screenshots for visual changes. Include regenerated `index.html` when changing embedded sources or assets.

## Agent Instructions

Follow `/home/jochman/.codex/RTK.md`: prefix shell commands with `rtk`.
