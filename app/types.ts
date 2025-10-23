// Cell-based maze types: '#' are walls occupying space, ' ' open squares.

export interface Position {
  x: number;
  y: number;
}

export type Direction = 'up' | 'down' | 'left' | 'right';

export type GateType = 'gateA' | 'gateB' | 'gateC' | 'gateD' | 'gateE';
export type CellType = 'wall' | 'floor' | 'start' | 'exit' | 'gate';

export interface Cell {
  type: CellType;
  isWalkable: boolean; // dynamic for gates (depends on gateStatus)
  gateType?: GateType; // present when type === 'gate'
}

export type EnemyKind = 'stationary' | 'roaming';
export interface Enemy {
  id: number;
  kind: EnemyKind;
  position: Position;
  direction: Direction; // last move direction
  active?: boolean; // for stationary: true when chasing player; for roaming: true when chasing player
  movesPerTurn?: number; // 3 for stationary when active, 6 for roaming
  lastPosition?: Position; // for pathfinding to avoid immediate backtracking
}

export interface GameState {
  grid: Cell[][]; // 2D grid of cells
  player: Position;
  enemies: Enemy[];
  turnCount: number;
  inTurnMoves: number;
  gameOver: boolean;
  gameWon: boolean;
  exitPosition: Position;
  gridWidth: number;
  gridHeight: number;
  gateStatus: Record<GateType, boolean>; // true means gates of that type are open (walkable)
}
