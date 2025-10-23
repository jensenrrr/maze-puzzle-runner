'use client';

import { Direction, GameState } from '../types';

interface GameControlsProps {
  onMove: (direction: Direction) => void;
  onEndTurn: () => void;
  onReset: () => void;
  gameState: GameState;
}

export default function GameControls({ onMove, onEndTurn, onReset, gameState }: GameControlsProps) {
  const isDisabled = gameState.gameWon;

  return (
    <div className="bg-gray-800 p-6 rounded-lg shadow-lg text-white">
  <h2 className="text-2xl font-bold mb-4">Controls</h2>
      
      <div className="space-y-4">
        <div className="text-sm text-gray-300 mb-4 space-y-1">
          <p>Use Arrow Keys or WASD to move (multiple moves per turn).</p>
          <p>Click &quot;End Turn&quot; to let enemies and environment act.</p>
          {/* Gate cycling removed in hash maze model */}
        </div>
        
        <div className="grid grid-cols-3 gap-2">
          <div></div>
          <button
            onClick={() => onMove('up')}
            disabled={isDisabled}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-bold py-3 px-4 rounded transition-colors"
          >
            ↑
          </button>
          <div></div>
          
          <button
            onClick={() => onMove('left')}
            disabled={isDisabled}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-bold py-3 px-4 rounded transition-colors"
          >
            ←
          </button>
          <button
            onClick={() => onMove('down')}
            disabled={isDisabled}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-bold py-3 px-4 rounded transition-colors"
          >
            ↓
          </button>
          <button
            onClick={() => onMove('right')}
            disabled={isDisabled}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-bold py-3 px-4 rounded transition-colors"
          >
            →
          </button>
        </div>
        
        <div className="grid grid-cols-1 gap-2 mt-4">
          <button
            onClick={onEndTurn}
            disabled={isDisabled}
            className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-semibold py-3 px-4 rounded transition-colors"
          >
            End Turn ({gameState.inTurnMoves} moves)
          </button>
        </div>
        <button
          onClick={onReset}
          className="w-full mt-4 bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded transition-colors"
        >
          Reset Game
        </button>
      </div>
    </div>
  );
}
