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

// Line of sight detection
function hasLineOfSight(state: GameState, from: Position, to: Position): boolean {
  const dx = Math.abs(to.x - from.x);
  const dy = Math.abs(to.y - from.y);
  const sx = from.x < to.x ? 1 : -1;
  const sy = from.y < to.y ? 1 : -1;
  let err = dx - dy;
  
  let x = from.x;
  let y = from.y;
  
  while (true) {
    if (x === to.x && y === to.y) return true;
    
    // Check if current position is blocked (but skip start and end positions)
    if ((x !== from.x || y !== from.y) && (x !== to.x || y !== to.y)) {
      const cell = state.grid[y][x];
      if (cell.type === 'wall' || (cell.type === 'gate' && cell.gateType && !state.gateStatus[cell.gateType])) {
        return false;
      }
    }
    
    const e2 = 2 * err;
    if (e2 > -dy) {
      err -= dy;
      x += sx;
    }
    if (e2 < dx) {
      err += dx;
      y += sy;
    }
  }
}

// Depth-first search pathfinding for stationary enemies
function findPathDFS(state: GameState, from: Position, to: Position): Direction | null {
  const visited = new Set<string>();
  const directions: Direction[] = ['up', 'down', 'left', 'right'];
  
  function dfs(current: Position, path: Direction[]): Direction[] | null {
    if (current.x === to.x && current.y === to.y) {
      return path;
    }
    
    const key = `${current.x},${current.y}`;
    if (visited.has(key)) return null;
    visited.add(key);
    
    for (const dir of directions) {
      const next = getAdjacent(current, dir);
      if (isWalkable(state, next) && !visited.has(`${next.x},${next.y}`)) {
        const result = dfs(next, [...path, dir]);
        if (result) return result;
      }
    }
    
    return null;
  }
  
  const path = dfs(from, []);
  return path && path.length > 0 ? path[0] : null;
}
// Enemies -------------------------------------------------------------
function createEnemiesFromParsed(parsedEnemies: { id: number; kind: 'stationary' | 'roaming'; position: Position }[]): Enemy[] {
  return parsedEnemies.map(enemy => ({
    ...enemy,
    kind: enemy.kind,
    direction: 'up' as Direction,
    active: false, // stationary start inactive, roaming start active but not chasing
    movesPerTurn: enemy.kind === 'stationary' ? 3 : 6,
    lastPosition: undefined,
  }));
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
    enemies: createEnemiesFromParsed(parsed.enemies),
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
    if (enemy.kind === 'roaming') {
      // Check if enemy can see player
      const canSeePlayer = hasLineOfSight(state, enemy.position, state.player);
      
      if (canSeePlayer && !enemy.active) {
        // Start chasing player
        return { ...enemy, active: true };
      }
      
      if (enemy.active) {
        // Chase player using DFS pathfinding
        let updated = { ...enemy };
        for (let i = 0; i < (enemy.movesPerTurn || 6); i++) {
          const direction = findPathDFS(state, updated.position, state.player);
          if (direction) {
            const target = getAdjacent(updated.position, direction);
            if (isWalkable(state, target)) {
              updated = { ...updated, position: target, direction, lastPosition: updated.position };
            }
          }
        }
        return updated;
      } else {
        // Move randomly
        let updated = { ...enemy };
        for (let i = 0; i < (enemy.movesPerTurn || 6); i++) {
          const currentPos = updated.position;
          const dirs: Direction[] = ['up', 'down', 'left', 'right'];
          
          // Get available directions
          const availableDirs = dirs.filter(dir => isWalkable(state, getAdjacent(currentPos, dir)));
          
          if (availableDirs.length === 0) break; // Stuck
          
          // Avoid immediate backtracking
          let chosenDir: Direction;
          if (updated.lastPosition) {
            const nonBacktrackDirs = availableDirs.filter(dir => {
              const target = getAdjacent(currentPos, dir);
              return !(target.x === updated.lastPosition!.x && target.y === updated.lastPosition!.y);
            });
            chosenDir = nonBacktrackDirs.length > 0 
              ? nonBacktrackDirs[Math.floor(Math.random() * nonBacktrackDirs.length)]
              : availableDirs[Math.floor(Math.random() * availableDirs.length)];
          } else {
            chosenDir = availableDirs[Math.floor(Math.random() * availableDirs.length)];
          }
          
          const target = getAdjacent(updated.position, chosenDir);
          if (isWalkable(state, target)) {
            updated = { ...updated, position: target, direction: chosenDir, lastPosition: updated.position };
          }
        }
        return updated;
      }
    } else if (enemy.kind === 'stationary') {
      // If not active, remain stationary
      if (!enemy.active) return enemy;
      
      // Chase player using DFS pathfinding
      let updated = { ...enemy };
      for (let i = 0; i < (enemy.movesPerTurn || 3); i++) {
        const direction = findPathDFS(state, updated.position, state.player);
        if (direction) {
          const target = getAdjacent(updated.position, direction);
          if (isWalkable(state, target)) {
            updated = { ...updated, position: target, direction, lastPosition: updated.position };
          }
        }
      }
      return updated;
    }
    return enemy;
  });
}


export function checkCollision(player: Position, enemies: Enemy[]): boolean {
  return enemies.some(e => e.position.x === player.x && e.position.y === player.y);
}

export function checkWinCondition(player: Position, exit: Position): boolean {
  return player.x === exit.x && player.y === exit.y;
}

// Turn Processing ----------------------------------------------------
export function processPlayerMove(state: GameState, direction: Direction): GameState {
  if (state.gameWon) return state;
  const after = movePlayer(state, direction);
  if (checkWinCondition(after.player, after.exitPosition)) return { ...after, gameWon: true };
  return after;
}

export function endTurn(state: GameState): GameState {
  if (state.gameWon) return state;
  const next: GameState = { ...state };
  next.enemies = moveEnemies(next);
  
  // Check win condition but no game over from enemies
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
    enemies: state.enemies.map(e => {
      if (e.id === enemyId) {
        if (e.kind === 'stationary') {
          // Toggle stationary enemy active state
          return { ...e, active: !e.active };
        } else if (e.kind === 'roaming' && e.active) {
          // Stop chasing for roaming enemy (they go back to random movement)
          return { ...e, active: false };
        }
      }
      return e;
    })
  };
}

export function handleEnemyClick(state: GameState, x: number, y: number, isDelete: boolean = false): GameState {
  const enemy = state.enemies.find(e => e.position.x === x && e.position.y === y);
  if (!enemy) return state;
  
  if (isDelete) {
    // Delete the enemy
    return {
      ...state,
      enemies: state.enemies.filter(e => e.id !== enemy.id)
    };
  }
  
  // Toggle enemy behavior
  if (enemy.kind === 'stationary' || (enemy.kind === 'roaming' && enemy.active)) {
    return toggleChaser(state, enemy.id);
  }
  return state;
}
