'use client';

import { GameState, GateType } from '../types';

interface MazeGridProps {
  gameState: GameState;
  onEnemyClick?: (x: number, y: number) => void;
}

export default function MazeGrid({ gameState, onEnemyClick }: MazeGridProps) {
  const { player, enemies, grid, exitPosition, gateStatus } = gameState;
  const width = gameState.gridWidth;
  const height = gameState.gridHeight;

  const gateColor = (gate: GateType, open: boolean) => {
    const borderClass = open ? 'border-green-500' : 'border-red-500';
    switch (gate) {
      case 'gateA': return `bg-emerald-500 border-2 ${borderClass}`;
      case 'gateB': return `bg-cyan-500 border-2 ${borderClass}`;
      case 'gateC': return `bg-fuchsia-500 border-2 ${borderClass}`;
      case 'gateD': return `bg-indigo-500 border-2 ${borderClass}`;
      case 'gateE': return `bg-rose-500 border-2 ${borderClass}`;
    }
  };

  const getCellContent = (x: number, y: number) => {
    const cell = grid[y][x];
    const isPlayer = player.x === x && player.y === y;
    const enemy = enemies.find(e => e.position.x === x && e.position.y === y);
    const isExit = exitPosition.x === x && exitPosition.y === y;
    if (cell.type === 'wall') {
      return <div className="w-full h-full bg-neutral-900 border border-white/40"></div>;
    }
    if (cell.type === 'gate' && cell.gateType) {
      const isOpen = gateStatus[cell.gateType];
      return (
        <div className={`w-full h-full relative flex items-center justify-center cursor-pointer ${gateColor(cell.gateType, isOpen)}`}
             onClick={() => {/* gate cell itself can toggle gate */}}
        >
          <span className="text-[10px] font-bold text-white uppercase">
            {cell.gateType.replace('gate','')}{isOpen ? '' : ' (X)'}
          </span>
        </div>
      );
    }
    return (
      <div className={`w-full h-full relative bg-neutral-700 border border-neutral-600`}>
        {isExit && <div className="absolute inset-0 bg-green-400 opacity-50"></div>}
        {enemy && (
          <div className={`absolute inset-1 flex items-center justify-center rounded-full border-2 ${enemy.kind === 'chaser' ? (enemy.active ? 'bg-purple-600 border-purple-300' : 'bg-purple-900 border-purple-500 cursor-pointer') : 'bg-red-500 border-red-300 animate-pulse'}`}
               onClick={() => onEnemyClick?.(x, y)}
          >
            <span className="text-white text-xs font-bold">{enemy.kind === 'chaser' ? (enemy.active ? 'C' : 'c') : 'E'}</span>
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
          <span>Roaming Enemy</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-purple-600 rounded-full"></div>
          <span>Chaser (active)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-purple-900 rounded-full"></div>
          <span>Chaser (click to activate)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-emerald-500 border-2 border-green-500"></div>
          <span>Gate A (open)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-emerald-500 border-2 border-red-500"></div>
          <span>Gate A (closed)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-cyan-500 border-2 border-red-500"></div>
          <span>Gate B, </span>
          <div className="w-4 h-4 bg-fuchsia-500 border-2 border-red-500"></div>
          <span>C, </span>
          <div className="w-4 h-4 bg-indigo-500 border-2 border-red-500"></div>
          <span>D, </span>
          <div className="w-4 h-4 bg-rose-500 border-2 border-red-500"></div>
          <span>E (closed)</span>
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
