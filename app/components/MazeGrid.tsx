'use client';

import { GameState } from '../types';

interface MazeGridProps {
  gameState: GameState;
}

export default function MazeGrid({ gameState }: MazeGridProps) {
  const { maze, player, enemies, gates, shiftingParts } = gameState;

  const getCellContent = (x: number, y: number) => {
    // Check if player is at this position
    if (player.x === x && player.y === y) {
      return (
        <div className="w-full h-full flex items-center justify-center bg-blue-500 rounded-full border-2 border-blue-300 shadow-lg">
          <div className="text-white text-xl font-bold">P</div>
        </div>
      );
    }

    // Check if any enemy is at this position
    const enemy = enemies.find(e => e.position.x === x && e.position.y === y);
    if (enemy) {
      return (
        <div className="w-full h-full flex items-center justify-center bg-red-500 rounded-full border-2 border-red-300 shadow-lg animate-pulse">
          <div className="text-white text-xl font-bold">E</div>
        </div>
      );
    }

    // Check if gate is at this position
    const gate = gates.find(g => g.position.x === x && g.position.y === y);
    if (gate) {
      return (
        <div 
          className={`w-full h-full flex items-center justify-center border-2 transition-all ${
            gate.isOpen 
              ? 'bg-green-400 border-green-600' 
              : 'bg-yellow-500 border-yellow-700'
          }`}
        >
          <div className="text-white text-xs font-bold">
            {gate.isOpen ? '⬆' : '⬇'}
          </div>
        </div>
      );
    }

    // Check if shifting part is at this position
    const isShifting = shiftingParts.some(part =>
      part.positions.some(pos => pos.x === x && pos.y === y)
    );
    if (isShifting) {
      return (
        <div className="w-full h-full bg-purple-500 border border-purple-700 animate-pulse">
          <div className="w-full h-full flex items-center justify-center text-white text-xs">
            ≈
          </div>
        </div>
      );
    }

    // Regular maze cell
    const cell = maze[y][x];
    if (cell.type === 'wall') {
      return <div className="w-full h-full bg-gray-800 border border-gray-700"></div>;
    }

    // Goal area (bottom-right corner)
    if (x >= maze[0].length - 2 && y >= maze.length - 2) {
      return <div className="w-full h-full bg-green-300 border border-green-500 opacity-50"></div>;
    }

    return <div className="w-full h-full bg-gray-700 border border-gray-600"></div>;
  };

  return (
    <div className="bg-gray-900 p-4 rounded-lg shadow-2xl">
      <div className="grid gap-0.5" style={{ gridTemplateColumns: `repeat(${maze[0].length}, 1fr)` }}>
        {maze.map((row, y) =>
          row.map((cell, x) => (
            <div
              key={`${x}-${y}`}
              className="aspect-square"
              style={{ minWidth: '20px', minHeight: '20px' }}
            >
              {getCellContent(x, y)}
            </div>
          ))
        )}
      </div>
      
      <div className="mt-4 text-sm text-gray-300 space-y-1">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-blue-500 rounded-full"></div>
          <span>Player</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-red-500 rounded-full"></div>
          <span>Enemy</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-yellow-500"></div>
          <span>Closed Gate</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-green-400"></div>
          <span>Open Gate</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-purple-500"></div>
          <span>Shifting Wall</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-green-300 opacity-50"></div>
          <span>Goal</span>
        </div>
      </div>
    </div>
  );
}
