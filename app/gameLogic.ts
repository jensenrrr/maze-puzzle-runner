import { Direction, Enemy, GameState, Position } from './types';
import { parseHashMaze, HASH_MAZE } from './hashMazeLayout';

export let MAZE_SIZE = 20; // legacy constant (not used directly for movement now)

// Helpers -------------------------------------------------------------
function getAdjacent(from: Position, dir: Direction): Position {
  switch (dir) {
    case 'up': return { x: from.x, y: from.y - 1 };
    case 'down': return { x: from.x, y: from.y + 1 };
    case 'left': return { x: from.x - 1, y: from.y };
    case 'right': return { x: from.x + 1, y: from.y };
  }
}

function withinBounds(p: Position, width: number, height: number): boolean {
  return p.x >= 0 && p.x < width && p.y >= 0 && p.y < height;
}
// Enemies -------------------------------------------------------------
function createInitialEnemies(): Enemy[] {
  return [
    { id: 1, position: { x: 10, y: 5 }, direction: 'left' },
    { id: 2, position: { x: 4, y: 9 }, direction: 'right' },
    { id: 3, position: { x: 12, y: 10 }, direction: 'up' },
  ];
}

// Game State Initialization ------------------------------------------
export function initializeGameState(): GameState {
  const parsed = parseHashMaze(HASH_MAZE);
  MAZE_SIZE = Math.max(parsed.width, parsed.height);
  return {
    grid: parsed.grid,
    player: parsed.start,
    enemies: createInitialEnemies(),
    turnCount: 0,
    inTurnMoves: 0,
    gameOver: false,
    gameWon: false,
    exitPosition: parsed.exit,
    gridWidth: parsed.width,
    gridHeight: parsed.height,
  };
}

// Movement & Collision -----------------------------------------------
function isWalkable(state: GameState, pos: Position): boolean {
  if (!withinBounds(pos, state.gridWidth, state.gridHeight)) return false;
  const cell = state.grid[pos.y][pos.x];
  return cell.isWalkable;
}

export function movePlayer(state: GameState, direction: Direction): GameState {
  const target = getAdjacent(state.player, direction);
  if (!isWalkable(state, target)) return state;
  return { ...state, player: target, inTurnMoves: state.inTurnMoves + 1 };
}

export function moveEnemies(state: GameState): Enemy[] {
  return state.enemies.map(enemy => {
    const target = getAdjacent(enemy.position, enemy.direction);
    if (isWalkable(state, target)) {
      return { ...enemy, position: target };
    }
    // Reverse direction if blocked or wall
    return { ...enemy, direction: getOpposite(enemy.direction) };
  });
}

function getOpposite(d: Direction): Direction {
  switch (d) {
    case 'up': return 'down';
    case 'down': return 'up';
    case 'left': return 'right';
    case 'right': return 'left';
  }
}

export function checkCollision(player: Position, enemies: Enemy[]): boolean {
  return enemies.some(e => e.position.x === player.x && e.position.y === player.y);
}

export function checkWinCondition(player: Position, exit: Position): boolean {
  return player.x === exit.x && player.y === exit.y;
}

// Turn Processing ----------------------------------------------------
export function processPlayerMove(state: GameState, direction: Direction): GameState {
  if (state.gameOver || state.gameWon) return state;
  const after = movePlayer(state, direction);
  if (checkWinCondition(after.player, after.exitPosition)) return { ...after, gameWon: true };
  return after;
}

export function endTurn(state: GameState): GameState {
  if (state.gameOver || state.gameWon) return state;
  const next: GameState = { ...state };
  next.enemies = moveEnemies(next);
  if (checkCollision(next.player, next.enemies)) {
    return { ...next, gameOver: true, inTurnMoves: 0, turnCount: next.turnCount + 1 };
  }
  if (checkWinCondition(next.player, next.exitPosition)) {
    return { ...next, gameWon: true, inTurnMoves: 0, turnCount: next.turnCount + 1 };
  }
  return { ...next, inTurnMoves: 0, turnCount: next.turnCount + 1 };
}

// Gate Set Switching -------------------------------------------------
// Gate functions removed in cell-based hash maze model
