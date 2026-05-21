/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { GameStateData, PowerUpsState } from './types';
import { Header, SidebarLeft, SidebarRight, Footer } from './components/GameUI';
import { GameEngine } from './game/engine';

export default function App() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<GameEngine | null>(null);

  const [gameState, setGameState] = useState<GameStateData>({
    score: 0,
    coins: 0,
    powerUps: { shield: 0, turbo: 0, slowmo: 0, magnet: 0 },
    altitude: 0,
    velocity: 0,
    fuel: 100,
    gameOver: false,
    gameStarted: false,
  });

  useEffect(() => {
    if (canvasRef.current) {
      engineRef.current = new GameEngine(canvasRef.current, (state) => {
        setGameState(state);
      });
    }

    const handleRestart = () => {
      engineRef.current?.reset();
    };
    
    window.addEventListener('restart-game', handleRestart);

    return () => {
      engineRef.current?.destroy();
      window.removeEventListener('restart-game', handleRestart);
    };
  }, []);

  return (
    <div className="w-full h-screen bg-[#020617] text-white font-sans overflow-hidden flex flex-col relative select-none">
      <div className="absolute inset-0 opacity-30 pointer-events-none" style={{ background: 'radial-gradient(circle at 50% 50%, #312e81 0%, transparent 70%)' }}></div>
      
      <Header score={gameState.score} coins={gameState.coins} />
      
      <main className="flex-1 flex overflow-hidden">
        <SidebarLeft score={gameState.score} />
        
        <section className="flex-1 relative bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] flex items-center justify-center overflow-hidden border-x border-white/5">
          <canvas 
            ref={canvasRef} 
            className="absolute inset-0 w-full h-full z-10 touch-none" 
            style={{ display: 'block' }} 
          />
          
          <div className="absolute top-12 flex flex-col items-center gap-1 z-0 pointer-events-none opacity-40">
            <span className="text-[120px] font-black leading-none tracking-tighter drop-shadow-[0_0_20px_rgba(255,255,255,0.2)]">
              {gameState.score.toString().padStart(3, '0')}
            </span>
            <span className="text-sm uppercase tracking-[0.8em] text-cyan-400 font-bold drop-shadow-md">
              {gameState.gameStarted ? (gameState.gameOver ? 'SYSTEM FAILURE' : 'TARGET LOCKED') : 'AWAITING LAUNCH'}
            </span>
          </div>

          {!gameState.gameStarted && !gameState.gameOver && (
            <div className="absolute z-20 flex flex-col items-center animate-pulse pointer-events-none">
              <p className="text-2xl font-bold tracking-[0.3em] text-white shadow-black drop-shadow-2xl">TAP TO IGNITE</p>
            </div>
          )}

          {gameState.gameOver && (
            <div className="absolute z-30 flex flex-col items-center bg-black/80 backdrop-blur-md p-10 rounded-2xl border border-red-500/30 shadow-[0_0_50px_rgba(239,68,68,0.2)]">
              <h2 className="text-4xl font-black text-red-500 mb-2 tracking-widest drop-shadow-[0_0_10px_rgba(239,68,68,0.6)]">CRITICAL DAMAGE</h2>
              <p className="text-xl mb-8 text-white/80 font-mono tracking-widest">FINAL SCORE: {gameState.score}</p>
              <button 
                className="px-8 py-4 bg-white text-black font-black tracking-[0.2em] uppercase rounded hover:bg-cyan-400 transition-colors pointer-events-auto hover:shadow-[0_0_20px_rgba(34,211,238,0.6)] border border-transparent"
                onClick={() => window.dispatchEvent(new Event('restart-game'))}
              >
                Reboot Sequence
              </button>
            </div>
          )}
          
          {/* Bottom HUD */}
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 bg-black/60 backdrop-blur-xl border border-white/20 px-10 py-4 rounded-full flex gap-12 items-center pointer-events-none z-20 shadow-[0_10px_30px_rgba(0,0,0,0.5)]">
            <div className="flex flex-col items-center w-20">
              <span className="text-[10px] uppercase text-white/40 tracking-widest mb-1">Alt</span>
              <span className="text-sm font-mono tracking-wider">{gameState.altitude.toFixed(0)}M</span>
            </div>
            <div className="w-px h-8 bg-gradient-to-b from-transparent via-white/20 to-transparent"></div>
            <div className="flex flex-col items-center w-24">
              <span className="text-[10px] uppercase text-white/40 tracking-widest mb-1">Vel</span>
              <span className="text-sm font-mono text-cyan-400 tracking-wider">M {(Math.abs(gameState.velocity) / 10).toFixed(2)}</span>
            </div>
            <div className="w-px h-8 bg-gradient-to-b from-transparent via-white/20 to-transparent"></div>
            <div className="flex flex-col items-center">
              <span className="text-[10px] uppercase text-white/40 tracking-widest mb-1">Core</span>
              <div className="w-20 h-1.5 bg-white/10 rounded-full overflow-hidden">
                <div className="h-full bg-cyan-500 shadow-[0_0_8px_#06b6d4] transition-all" style={{ width: `${gameState.fuel}%` }}></div>
              </div>
            </div>
          </div>
        </section>

        <SidebarRight powerUps={gameState.powerUps} />
      </main>
      
      <Footer />
    </div>
  );
}
