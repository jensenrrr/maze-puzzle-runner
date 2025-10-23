'use client';

import { useEffect, useState, useCallback } from 'react';
import { GameState, Direction, GateType } from '../types';
import { initializeGameState, processPlayerMove, endTurn, toggleGateType, handleEnemyClick } from '../gameLogic';
import MazeGrid from './MazeGrid';
import GameControls from './GameControls';
import GateControls from './GateControls';

export default function MazeGame() {
  const [gameState, setGameState] = useState<GameState>(initializeGameState());

  const handleMove = useCallback((direction: Direction) => {
    setGameState(prevState => processPlayerMove(prevState, direction));
  }, []);

  const handleEndTurn = useCallback(() => {
    setGameState(prevState => endTurn(prevState));
  }, []);

  const handleReset = useCallback(() => {
    setGameState(initializeGameState());
  }, []);

  const handleToggleGate = useCallback((gateType: GateType) => {
    setGameState(prevState => toggleGateType(prevState, gateType));
  }, []);

  const handleEnemyClickCallback = useCallback((x: number, y: number) => {
    setGameState(prevState => handleEnemyClick(prevState, x, y));
  }, []);

  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (gameState.gameOver || gameState.gameWon) return;

      let direction: Direction | undefined;

      switch (event.key) {
        case 'ArrowUp':
        case 'w':
        case 'W':
          direction = 'up';
          break;
        case 'ArrowDown':
        case 's':
        case 'S':
          direction = 'down';
          break;
        case 'ArrowLeft':
        case 'a':
        case 'A':
          direction = 'left';
          break;
        case 'ArrowRight':
        case 'd':
        case 'D':
          direction = 'right';
          break;
      }

      if (direction) {
        event.preventDefault();
        handleMove(direction);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [gameState, handleMove]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
      <div className="max-w-6xl w-full">
        <h1 className="text-4xl font-bold text-center text-white mb-2">
          Maze Puzzle Runner test
        </h1>
        <p className="text-center text-gray-300 mb-6">
          Navigate to the bottom-right corner while avoiding enemies!
        </p>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <MazeGrid gameState={gameState} onEnemyClick={handleEnemyClickCallback} />
          </div>
          
          <div className="space-y-4">
            <GateControls 
              gateStatus={gameState.gateStatus}
              onToggleGate={handleToggleGate}
            />
            <GameControls 
              onMove={handleMove} 
              onEndTurn={handleEndTurn}
              onReset={handleReset} 
              gameState={gameState} 
            />
          </div>
        </div>
        
        {gameState.gameOver && (
          <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center">
            <div className="bg-red-600 text-white p-8 rounded-lg shadow-2xl text-center">
              <h2 className="text-3xl font-bold mb-4">Game Over!</h2>
              <p className="mb-6">You were caught by an enemy!</p>
              <button
                onClick={handleReset}
                className="bg-white text-red-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
              >
                Try Again
              </button>
            </div>
          </div>
        )}
        
        {gameState.gameWon && (
          <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center">
            <div className="bg-green-600 text-white p-8 rounded-lg shadow-2xl text-center">
              <h2 className="text-3xl font-bold mb-4">Victory!</h2>
              <p className="mb-2">You reached the goal!</p>
              <p className="mb-6">Turns taken: {gameState.turnCount}</p>
              <button
                onClick={handleReset}
                className="bg-white text-green-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
              >
                Play Again
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
