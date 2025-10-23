// Cell-based maze types: '#' are walls occupying space, ' ' open squares.

export interface Position {
  x: number;
  y: number;
}

export type Direction = 'up' | 'down' | 'left' | 'right';

export type CellType = 'wall' | 'floor' | 'start' | 'exit';

export interface Cell {
  type: CellType;
  isWalkable: boolean;
}

export interface Enemy {
  id: number;
  position: Position;
  direction: Direction;
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
}
