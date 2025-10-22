'use client';

import { GameState } from '../types';

interface GameInfoProps {
  gameState: GameState;
}

export default function GameInfo({ gameState }: GameInfoProps) {
  return (
    <div className="bg-gray-800 p-6 rounded-lg shadow-lg text-white">
      <h2 className="text-2xl font-bold mb-4">Game Info</h2>
      
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-gray-300">Turn:</span>
          <span className="text-xl font-semibold">{gameState.turnCount}</span>
        </div>
        
        <div className="flex justify-between items-center">
          <span className="text-gray-300">Enemies:</span>
          <span className="text-xl font-semibold">{gameState.enemies.length}</span>
        </div>
        
        <div className="flex justify-between items-center">
          <span className="text-gray-300">Gates:</span>
          <span className="text-xl font-semibold">
            {gameState.gates.filter(g => g.isOpen).length}/{gameState.gates.length} open
          </span>
        </div>
        
        <div className="border-t border-gray-700 pt-3 mt-3">
          <div className="text-sm text-gray-400">
            <p className="mb-2">Gates toggle every 3 turns</p>
            <p className="mb-2">Shifting walls move every 2 turns</p>
            <p>Enemies patrol and change direction when blocked</p>
          </div>
        </div>
      </div>
    </div>
  );
}
