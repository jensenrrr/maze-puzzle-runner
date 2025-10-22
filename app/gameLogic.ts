import { Cell, Direction, Enemy, GameState, Gate, Position, ShiftingPart } from './types';

const MAZE_SIZE = 15;

// Create initial maze layout
export function createInitialMaze(): Cell[][] {
  const maze: Cell[][] = [];
  
  // Initialize with empty cells
  for (let y = 0; y < MAZE_SIZE; y++) {
    maze[y] = [];
    for (let x = 0; x < MAZE_SIZE; x++) {
      // Create walls around the border
      if (x === 0 || x === MAZE_SIZE - 1 || y === 0 || y === MAZE_SIZE - 1) {
        maze[y][x] = { type: 'wall', isWalkable: false };
      } else {
        maze[y][x] = { type: 'empty', isWalkable: true };
      }
    }
  }
  
  // Add some internal walls to create a maze structure
  const walls = [
    // Horizontal walls
    { x: 3, y: 3, length: 4, direction: 'horizontal' },
    { x: 8, y: 3, length: 4, direction: 'horizontal' },
    { x: 2, y: 7, length: 5, direction: 'horizontal' },
    { x: 9, y: 7, length: 4, direction: 'horizontal' },
    { x: 3, y: 11, length: 5, direction: 'horizontal' },
    // Vertical walls
    { x: 3, y: 4, length: 3, direction: 'vertical' },
    { x: 7, y: 1, length: 5, direction: 'vertical' },
    { x: 11, y: 4, length: 4, direction: 'vertical' },
    { x: 5, y: 8, length: 3, direction: 'vertical' },
  ];
  
  walls.forEach(wall => {
    if (wall.direction === 'horizontal') {
      for (let i = 0; i < wall.length; i++) {
        if (wall.x + i < MAZE_SIZE && wall.y < MAZE_SIZE) {
          maze[wall.y][wall.x + i] = { type: 'wall', isWalkable: false };
        }
      }
    } else {
      for (let i = 0; i < wall.length; i++) {
        if (wall.x < MAZE_SIZE && wall.y + i < MAZE_SIZE) {
          maze[wall.y + i][wall.x] = { type: 'wall', isWalkable: false };
        }
      }
    }
  });
  
  return maze;
}

export function createInitialGates(): Gate[] {
  return [
    { position: { x: 7, y: 5 }, isOpen: false },
    { position: { x: 9, y: 9 }, isOpen: true },
    { position: { x: 6, y: 11 }, isOpen: false },
  ];
}

export function createInitialEnemies(): Enemy[] {
  return [
    { id: 1, position: { x: 10, y: 5 }, direction: 'left' },
    { id: 2, position: { x: 4, y: 9 }, direction: 'right' },
    { id: 3, position: { x: 12, y: 10 }, direction: 'up' },
  ];
}

export function createInitialShiftingParts(): ShiftingPart[] {
  return [
    {
      positions: [
        { x: 2, y: 5 },
        { x: 3, y: 5 },
        { x: 4, y: 5 },
      ],
      direction: 'right',
      shiftPhase: 0,
    },
    {
      positions: [
        { x: 10, y: 12 },
        { x: 11, y: 12 },
      ],
      direction: 'left',
      shiftPhase: 0,
    },
  ];
}

export function initializeGameState(): GameState {
  const maze = createInitialMaze();
  const gates = createInitialGates();
  const enemies = createInitialEnemies();
  const shiftingParts = createInitialShiftingParts();
  
  return {
    maze,
    player: { x: 1, y: 1 }, // Start position
    enemies,
    gates,
    shiftingParts,
    turnCount: 0,
    gameOver: false,
    gameWon: false,
  };
}

export function isPositionWalkable(
  position: Position,
  maze: Cell[][],
  gates: Gate[]
): boolean {
  if (position.x < 0 || position.x >= MAZE_SIZE || position.y < 0 || position.y >= MAZE_SIZE) {
    return false;
  }
  
  const cell = maze[position.y][position.x];
  
  // Check if it's a closed gate
  const gate = gates.find(g => g.position.x === position.x && g.position.y === position.y);
  if (gate && !gate.isOpen) {
    return false;
  }
  
  return cell.isWalkable;
}

export function movePlayer(
  state: GameState,
  direction: Direction
): GameState {
  const newPosition = getNewPosition(state.player, direction);
  
  if (isPositionWalkable(newPosition, state.maze, state.gates)) {
    return {
      ...state,
      player: newPosition,
    };
  }
  
  return state;
}

export function getNewPosition(position: Position, direction: Direction): Position {
  switch (direction) {
    case 'up':
      return { x: position.x, y: position.y - 1 };
    case 'down':
      return { x: position.x, y: position.y + 1 };
    case 'left':
      return { x: position.x - 1, y: position.y };
    case 'right':
      return { x: position.x + 1, y: position.y };
  }
}

export function moveEnemies(state: GameState): Enemy[] {
  return state.enemies.map(enemy => {
    const newPosition = getNewPosition(enemy.position, enemy.direction);
    
    // Check if new position is walkable
    if (isPositionWalkable(newPosition, state.maze, state.gates)) {
      return { ...enemy, position: newPosition };
    } else {
      // Change direction if blocked
      const newDirection = getOppositeDirection(enemy.direction);
      return { ...enemy, direction: newDirection };
    }
  });
}

function getOppositeDirection(direction: Direction): Direction {
  switch (direction) {
    case 'up': return 'down';
    case 'down': return 'up';
    case 'left': return 'right';
    case 'right': return 'left';
  }
}

export function updateShiftingParts(shiftingParts: ShiftingPart[]): ShiftingPart[] {
  return shiftingParts.map(part => {
    const newPhase = (part.shiftPhase + 1) % 4;
    
    // Shift positions every 2 turns
    if (newPhase % 2 === 0) {
      const newPositions = part.positions.map(pos => 
        getNewPosition(pos, part.direction)
      );
      
      return {
        ...part,
        positions: newPositions,
        shiftPhase: newPhase,
      };
    }
    
    return { ...part, shiftPhase: newPhase };
  });
}

export function toggleGates(gates: Gate[]): Gate[] {
  return gates.map(gate => ({
    ...gate,
    isOpen: !gate.isOpen,
  }));
}

export function checkCollision(player: Position, enemies: Enemy[]): boolean {
  return enemies.some(enemy => 
    enemy.position.x === player.x && enemy.position.y === player.y
  );
}

export function checkWinCondition(player: Position): boolean {
  // Win condition: reach the bottom-right corner area
  return player.x >= MAZE_SIZE - 2 && player.y >= MAZE_SIZE - 2;
}

export function processTurn(state: GameState, playerDirection?: Direction): GameState {
  let newState = { ...state };
  
  // 1. Move player if direction provided
  if (playerDirection) {
    newState = movePlayer(newState, playerDirection);
  }
  
  // 2. Move enemies
  newState.enemies = moveEnemies(newState);
  
  // 3. Check for collision after movements
  if (checkCollision(newState.player, newState.enemies)) {
    return {
      ...newState,
      gameOver: true,
    };
  }
  
  // 4. Update shifting parts every turn
  newState.shiftingParts = updateShiftingParts(newState.shiftingParts);
  
  // 5. Toggle gates every 3 turns
  if (newState.turnCount % 3 === 2) {
    newState.gates = toggleGates(newState.gates);
  }
  
  // 6. Check win condition
  if (checkWinCondition(newState.player)) {
    return {
      ...newState,
      gameWon: true,
      turnCount: newState.turnCount + 1,
    };
  }
  
  // 7. Increment turn count
  return {
    ...newState,
    turnCount: newState.turnCount + 1,
  };
}
