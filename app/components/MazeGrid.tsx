'use client';

import { GameState } from '../types';

interface MazeGridProps {
  gameState: GameState;
}

export default function MazeGrid({ gameState }: MazeGridProps) {
  const { player, enemies, grid, exitPosition } = gameState;
  const width = gameState.gridWidth;
  const height = gameState.gridHeight;

  const getCellContent = (x: number, y: number) => {
    const cell = grid[y][x];
    const isPlayer = player.x === x && player.y === y;
    const enemy = enemies.find(e => e.position.x === x && e.position.y === y);
    const isExit = exitPosition.x === x && exitPosition.y === y;
    if (cell.type === 'wall') {
      return <div className="w-full h-full bg-neutral-900 border border-white/40"></div>;
    }
    return (
      <div className={`w-full h-full relative bg-neutral-700 border border-neutral-600`}>
        {isExit && <div className="absolute inset-0 bg-green-400 opacity-50"></div>}
        {enemy && (
          <div className="absolute inset-1 flex items-center justify-center bg-red-500 rounded-full border-2 border-red-300 animate-pulse">
            <span className="text-white text-xs font-bold">E</span>
          </div>
        )}
        {isPlayer && (
          <div className="absolute inset-1 flex items-center justify-center bg-blue-500 rounded-full border-2 border-blue-300 shadow-lg">
            <span className="text-white text-xs font-bold">P</span>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="bg-gray-900 p-4 rounded-lg shadow-2xl">
      <div className="grid gap-0.5" style={{ gridTemplateColumns: `repeat(${width}, 1fr)` }}>
        {Array.from({ length: height }).map((_, y) =>
          Array.from({ length: width }).map((_, x) => (
            <div key={`${x}-${y}`} className="aspect-square" style={{ minWidth: '20px', minHeight: '20px' }}>
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
          <div className="w-4 h-4 bg-neutral-900 border border-white/40"></div>
          <span>Wall (#)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-green-300 opacity-50"></div>
          <span>Exit</span>
        </div>
      </div>
    </div>
  );
}
