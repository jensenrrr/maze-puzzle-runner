# Maze Puzzle Runner

Turn-based maze puzzle with dynamic gate sets and environmental effects.

## Overview

You navigate a 20x20 maze trying to reach the goal area (bottom-right corner). The maze contains:

* Walls: Impassable cells forming the maze layout.
* Gate Sets: 5 distinct sets of gates (each gate behaves like a wall unless its set is active). Only one set is open at a time.
* Enemies: Move after you end your turn; collision ends the game.
* Shifting Parts: Moving wall segments that periodically shift positions.

## Turn System

You can take multiple movement steps per turn (using Arrow Keys or WASD). These moves do NOT trigger enemy or environment movement immediately.

When satisfied with your positioning, click End Turn:

1. Enemies move (patrol logic reversing direction when blocked).
2. Shifting wall segments may update.
3. Collision or victory is checked.
4. Turn counter increments and your move counter resets.

## Gate Sets

* 5 gate sets (IDs 1–5). Initially set 1 is open (designed to allow a solution path).
* Cycling gate sets (Cycle Gate Set button) closes the current set and opens the next.
* Gates themselves occupy their coordinate as walls when closed and become walkable when their set is active.

## Controls

* Move: Arrow Keys / WASD (multiple times within a turn)
* End Turn: Applies enemy + environment actions.
* Cycle Gate Set: Activates next gate set (strategic path planning).
* Reset Game: Returns to initial state.

## Win / Loss

* Win: Enter any cell within the 2x2 goal region at bottom-right.
* Loss: Enemy moves onto your position at end of turn.

## Development Notes

* Maze internal walls and gate coordinates are placeholders; further puzzle design can refine solvability and challenge.
* Gate sets stored in `GameState.gates` with `setId`; active set tracked by `activeGateSetId`.
* Player movement is processed by `processPlayerMove`; end-of-turn effects handled in `endTurn`.
* Future enhancements: pathfinding enemies, timed gate cycling puzzles, scoring based on efficiency.

## Scripts

* `npm run dev` – Start development server.
* `npm run build` – Production build.
* `npm run start` – Start production server.
* `npm run lint` – Lint the code.

## Tech Stack

* Next.js 16 (App Router)
* React 19
* TypeScript
* Tailwind CSS

## Contributing

Puzzle layout adjustments (internal walls + gate positions) should maintain at least one guaranteed path with the initial gate set active. Consider documenting design rationale when changing these elements.
