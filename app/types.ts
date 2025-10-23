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

export type EnemyKind = 'wanderer' | 'chaser';
export interface Enemy {
  id: number;
  kind: EnemyKind;
  position: Position;
  direction: Direction; // last move direction (wanderers) or next planned direction (chaser)
  active?: boolean; // for chasers: true when chasing player
  movesPerTurn?: number; // 6 for wanderer (distributed randomly), 3 for active chaser
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
