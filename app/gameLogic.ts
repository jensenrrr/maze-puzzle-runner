import { Direction, Enemy, GameState, Position, GateType } from './types';
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
  // 2 roaming enemies (wanderers) that travel 6 paces randomly
  // Current enemies are stationary (chasers) until clicked
  return [
    { id: 1, kind: 'wanderer', position: { x: 10, y: 5 }, direction: 'left', movesPerTurn: 6 },
    { id: 2, kind: 'wanderer', position: { x: 4, y: 9 }, direction: 'right', movesPerTurn: 6 },
    { id: 3, kind: 'chaser', position: { x: 12, y: 10 }, direction: 'up', active: false, movesPerTurn: 3 },
    { id: 4, kind: 'chaser', position: { x: 16, y: 15 }, direction: 'down', active: false, movesPerTurn: 3 },
  ];
}


// Game State Initialization ------------------------------------------
export function initializeGameState(): GameState {
  const parsed = parseHashMaze(HASH_MAZE);
  MAZE_SIZE = Math.max(parsed.width, parsed.height);
  const gateStatus: Record<GateType, boolean> = {
    gateA: false,
    gateB: false,
    gateC: false,
    gateD: false,
    gateE: false,
  };
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
    gateStatus,
  };
}


// Movement & Collision -----------------------------------------------
function isWalkable(state: GameState, pos: Position): boolean {
  if (!withinBounds(pos, state.gridWidth, state.gridHeight)) return false;
  const cell = state.grid[pos.y][pos.x];
  if (cell.type === 'gate') {
    return !!(cell.gateType && state.gateStatus[cell.gateType]);
  }
  return cell.isWalkable;
}

export function movePlayer(state: GameState, direction: Direction): GameState {
  const target = getAdjacent(state.player, direction);
  if (!isWalkable(state, target)) return state;
  return { ...state, player: target, inTurnMoves: state.inTurnMoves + 1 };
}

export function moveEnemies(state: GameState): Enemy[] {
  return state.enemies.map(enemy => {
    if (enemy.kind === 'wanderer') {
      let updated = { ...enemy };
      for (let i = 0; i < (enemy.movesPerTurn || 6); i++) {
        const currentPos = updated.position;
        const dirs: Direction[] = ['up', 'down', 'left', 'right'];
        
        // Get available directions
        const availableDirs = dirs.filter(dir => isWalkable(state, getAdjacent(currentPos, dir)));
        
        if (availableDirs.length === 0) break; // Stuck
        
        // If at intersection (more than 2 directions), prefer turning
        let chosenDir: Direction;
        if (availableDirs.length > 2) {
          // At intersection - prefer directions that aren't opposite to current direction
          const oppositeDir = getOppositeDirection(updated.direction);
          const nonBacktrackDirs = availableDirs.filter(dir => dir !== oppositeDir);
          
          if (nonBacktrackDirs.length > 0) {
            // Weight directions towards open gates
            const weightedDirs = nonBacktrackDirs.flatMap(dir => {
              const target = getAdjacent(currentPos, dir);
              const cell = state.grid[target.y][target.x];
              // If target leads towards an open gate, add it multiple times for weighting
              if (cell.type === 'gate' && cell.gateType && state.gateStatus[cell.gateType]) {
                return [dir, dir, dir]; // 3x weight for open gates
              }
              return [dir];
            });
            chosenDir = weightedDirs[Math.floor(Math.random() * weightedDirs.length)];
          } else {
            chosenDir = availableDirs[Math.floor(Math.random() * availableDirs.length)];
          }
        } else {
          // Not at intersection, move normally but avoid backtracking if possible
          const oppositeDir = getOppositeDirection(updated.direction);
          const nonBacktrackDirs = availableDirs.filter(dir => dir !== oppositeDir);
          chosenDir = nonBacktrackDirs.length > 0 
            ? nonBacktrackDirs[Math.floor(Math.random() * nonBacktrackDirs.length)]
            : availableDirs[Math.floor(Math.random() * availableDirs.length)];
        }
        
        const target = getAdjacent(updated.position, chosenDir);
        if (isWalkable(state, target)) {
          updated = { ...updated, position: target, direction: chosenDir };
        }
      }
      return updated;
    } else if (enemy.kind === 'chaser') {
      // If not active, remain stationary
      if (!enemy.active) return enemy;
      let updated = { ...enemy };
      for (let i = 0; i < (enemy.movesPerTurn || 3); i++) {
        // Simple greedy move towards player
        const dx = state.player.x - updated.position.x;
        const dy = state.player.y - updated.position.y;
        let dir: Direction | undefined;
        if (Math.abs(dx) > Math.abs(dy)) {
          dir = dx < 0 ? 'left' : 'right';
        } else if (dy !== 0) {
          dir = dy < 0 ? 'up' : 'down';
        } else {
          dir = undefined;
        }
        if (!dir) break;
        const target = getAdjacent(updated.position, dir);
        if (isWalkable(state, target)) {
          updated = { ...updated, position: target, direction: dir };
        }
      }
      return updated;
    }
    return enemy;
  });
}

function getOppositeDirection(dir: Direction): Direction {
  switch (dir) {
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

// Gate Toggling ------------------------------------------------------
export function toggleGateType(state: GameState, gate: GateType): GameState {
  const isCurrentlyOpen = state.gateStatus[gate];
  
  if (isCurrentlyOpen) {
    // If gate is open, just close it
    return { ...state, gateStatus: { ...state.gateStatus, [gate]: false } };
  } else {
    // If gate is closed, open it and close all others
    const newGateStatus: Record<GateType, boolean> = {
      gateA: false,
      gateB: false,
      gateC: false,
      gateD: false,
      gateE: false,
    };
    newGateStatus[gate] = true;
    return { ...state, gateStatus: newGateStatus };
  }
}

export function toggleChaser(state: GameState, enemyId: number): GameState {
  return {
    ...state,
    enemies: state.enemies.map(e => e.id === enemyId && e.kind === 'chaser' ? { ...e, active: !e.active } : e)
  };
}

export function handleEnemyClick(state: GameState, x: number, y: number): GameState {
  const enemy = state.enemies.find(e => e.position.x === x && e.position.y === y);
  if (enemy && enemy.kind === 'chaser') {
    return toggleChaser(state, enemy.id);
  }
  return state;
}
