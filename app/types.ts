// Types for the maze puzzle game

export type CellType = 'empty' | 'wall' | 'gate' | 'shifting' | 'player' | 'enemy';

export interface Position {
  x: number;
  y: number;
}

export interface Cell {
  type: CellType;
  isWalkable: boolean;
}

export interface Gate {
  position: Position;
  isOpen: boolean;
}

export interface Enemy {
  id: number;
  position: Position;
  direction: Direction;
}

export interface ShiftingPart {
  positions: Position[];
  direction: Direction;
  shiftPhase: number;
}

export type Direction = 'up' | 'down' | 'left' | 'right';

export interface GameState {
  maze: Cell[][];
  player: Position;
  enemies: Enemy[];
  gates: Gate[];
  shiftingParts: ShiftingPart[];
  turnCount: number;
  gameOver: boolean;
  gameWon: boolean;
}
