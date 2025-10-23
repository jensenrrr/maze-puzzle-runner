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
          <span className="text-gray-300">Moves this turn:</span>
          <span className="text-xl font-semibold">{gameState.inTurnMoves}</span>
        </div>
        
        <div className="flex justify-between items-center">
          <span className="text-gray-300">Enemies:</span>
          <span className="text-xl font-semibold">{gameState.enemies.length}</span>
        </div>
        
        <div className="border-t border-gray-700 pt-3 mt-3">
          <div className="text-sm text-gray-400">
            <p className="mb-2">Take multiple moves, then End Turn.</p>
            <p>Enemies move only when a turn ends.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
