import React from 'react';
import { Shield, Zap, CircleDashed, Magnet, Focus, Target } from 'lucide-react';
import { PowerUpsState } from '../types';

export function Header({ score, coins }: { score: number; coins: number }) {
  return (
    <header className="flex-none h-16 flex items-center justify-between px-8 bg-black/40 backdrop-blur-md border-b border-white/10 z-20">
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-cyan-500 to-blue-600 border border-white/30 flex items-center justify-center shadow-[0_0_15px_rgba(6,182,212,0.5)]">
          <Zap className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-lg font-bold tracking-tight uppercase">Neon Glide</h1>
          <p className="text-[10px] text-cyan-400 font-mono">SEASON 04: HYPERDRIVE</p>
        </div>
      </div>
      <div className="flex gap-6">
        <div className="flex items-center gap-2 bg-white/5 px-4 py-1.5 rounded-full border border-white/10 shadow-inner">
          <div className="w-3 h-3 bg-yellow-400 rounded-sm rotate-45 shadow-[0_0_8px_#facc15]"></div>
          <span className="text-sm font-bold tracking-widest">{score.toLocaleString()}</span>
        </div>
        <div className="flex items-center gap-2 bg-white/5 px-4 py-1.5 rounded-full border border-white/10 shadow-inner">
          <div className="w-3 h-3 bg-cyan-400 rounded-full shadow-[0_0_8px_#22d3ee]"></div>
          <span className="text-sm font-bold tracking-widest">{coins.toLocaleString()}</span>
        </div>
      </div>
      <div className="flex gap-4">
        <button className="w-10 h-10 flex items-center justify-center rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-colors">
          <Target className="w-5 h-5 text-white/70" />
        </button>
      </div>
    </header>
  );
}

export function SidebarLeft({ score }: { score: number }) {
  return (
    <aside className="w-72 bg-black/20 border-r border-white/10 p-6 flex flex-col gap-6 z-10 backdrop-blur-sm">
      <div className="space-y-4">
        <div>
          <p className="text-xs text-slate-400 uppercase tracking-[0.2em] mb-3 focus:outline-none">Global Leaderboard</p>
          <div className="space-y-2">
            <div className="flex items-center justify-between p-3 rounded-lg bg-cyan-500/10 border border-cyan-500/30 shadow-[0_0_10px_rgba(6,182,212,0.1)]">
              <div className="flex items-center gap-3">
                <span className="text-cyan-400 font-bold w-4">1</span>
                <span className="text-sm">SkyRunner_99</span>
              </div>
              <span className="text-xs font-mono">942k</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/5 shadow-inner transition-colors">
              <div className="flex items-center gap-3">
                <span className="text-slate-500 font-bold w-4">2</span>
                <span className="text-sm flex items-center gap-2">You <span className="bg-cyan-500/20 text-cyan-400 text-[9px] px-1.5 py-0.5 rounded font-black uppercase shadow-[0_0_5px_rgba(6,182,212,0.3)]">Active</span></span>
              </div>
              <span className="text-xs font-mono text-cyan-400">{score > 0 ? score.toLocaleString() : '---'}</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/5 shadow-inner">
              <div className="flex items-center gap-3">
                <span className="text-slate-500 font-bold w-4">3</span>
                <span className="text-sm">VoltChaser</span>
              </div>
              <span className="text-xs font-mono">881k</span>
            </div>
          </div>
        </div>
        <div className="mt-auto p-4 rounded-xl bg-gradient-to-b from-indigo-600/20 to-transparent border border-indigo-500/20 shadow-lg relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 blur-2xl rounded-full"></div>
          <p className="text-[10px] text-indigo-300 uppercase mb-2 relative z-10">Weekly Target</p>
          <p className="text-sm leading-tight mb-3 text-indigo-100 relative z-10">Score 5,000 points without crashing.</p>
          <div className="w-full h-1.5 bg-black/40 rounded-full overflow-hidden shadow-inner relative z-10">
            <div className="h-full bg-indigo-500 transition-all duration-300 shadow-[0_0_8px_#6366f1]" style={{ width: `${Math.min(100, (score / 5000) * 100)}%` }}></div>
          </div>
          <p className="text-[10px] mt-2 text-right text-indigo-400 font-mono relative z-10">{Math.min(5000, score)} / 5000</p>
        </div>
      </div>
    </aside>
  );
}

export function SidebarRight({ powerUps }: { powerUps: PowerUpsState }) {
  const isShield = powerUps.shield > 0;
  const isTurbo = powerUps.turbo > 0;
  const isSlow = powerUps.slowmo > 0;
  const isMagnet = powerUps.magnet > 0;

  return (
    <aside className="w-80 bg-black/20 border-l border-white/10 p-6 flex flex-col gap-8 z-10 backdrop-blur-sm">
      <div className="space-y-4 flex-1">
        <p className="text-xs text-slate-400 uppercase tracking-[0.2em]">Active Powers</p>
        <div className="grid grid-cols-2 gap-3">
          <div className={`aspect-square rounded-2xl border p-4 flex flex-col justify-between relative overflow-hidden transition-all duration-300 ${isShield ? 'bg-gradient-to-br from-purple-500/20 to-indigo-500/20 border-purple-500/40 opacity-100' : 'bg-black/40 border-white/5 grayscale opacity-50 shadow-inner'}`}>
            {isShield && <div className="absolute -right-4 -top-4 w-16 h-16 bg-purple-500/30 blur-2xl"></div>}
            <Shield className={`w-8 h-8 transition-colors ${isShield ? 'text-purple-400 drop-shadow-[0_0_12px_#a855f7]' : 'text-slate-500'}`} />
            <div className="space-y-1 relative z-10">
              <span className="text-xs font-bold text-white/90 uppercase tracking-widest">Shield</span>
              {isShield && (
                <div className="h-1 w-full bg-black/60 rounded-full overflow-hidden">
                  <div className="h-full bg-purple-500 shadow-[0_0_8px_#a855f7] transition-all duration-150" style={{ width: `${powerUps.shield}%` }}></div>
                </div>
              )}
            </div>
          </div>
          
          <div className={`aspect-square rounded-2xl border p-4 flex flex-col justify-between relative overflow-hidden transition-all duration-300 ${isTurbo ? 'bg-gradient-to-br from-orange-500/20 to-red-500/20 border-orange-500/40 opacity-100' : 'bg-black/40 border-white/5 grayscale opacity-50 shadow-inner'}`}>
            {isTurbo && <div className="absolute -right-4 -top-4 w-16 h-16 bg-orange-500/30 blur-2xl"></div>}
            <Zap className={`w-8 h-8 transition-colors ${isTurbo ? 'text-orange-400 drop-shadow-[0_0_12px_#f97316]' : 'text-slate-500'}`} />
            <div className="space-y-1 relative z-10">
              <span className="text-xs font-bold text-white/90 uppercase tracking-widest">Turbo</span>
              {isTurbo && (
                <div className="h-1 w-full bg-black/60 rounded-full overflow-hidden">
                  <div className="h-full bg-orange-500 shadow-[0_0_8px_#f97316] transition-all duration-150" style={{ width: `${powerUps.turbo}%` }}></div>
                </div>
              )}
            </div>
          </div>

          <div className={`aspect-square rounded-2xl border p-4 flex flex-col justify-between relative overflow-hidden transition-all duration-300 ${isSlow ? 'bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border-cyan-500/40 opacity-100' : 'bg-black/40 border-white/5 grayscale opacity-50 shadow-inner'}`}>
            {isSlow && <div className="absolute -right-4 -top-4 w-16 h-16 bg-cyan-500/30 blur-2xl"></div>}
            <CircleDashed className={`w-8 h-8 transition-colors ${isSlow ? 'text-cyan-400 drop-shadow-[0_0_12px_#22d3ee]' : 'text-slate-500'}`} />
            <div className="space-y-1 relative z-10">
              <span className="text-xs font-bold text-white/90 uppercase tracking-widest">Slow-Mo</span>
              {isSlow && (
                <div className="h-1 w-full bg-black/60 rounded-full overflow-hidden">
                  <div className="h-full bg-cyan-500 shadow-[0_0_8px_#22d3ee] transition-all duration-150" style={{ width: `${powerUps.slowmo}%` }}></div>
                </div>
              )}
            </div>
          </div>

          <div className={`aspect-square rounded-2xl border p-4 flex flex-col justify-between relative overflow-hidden transition-all duration-300 ${isMagnet ? 'bg-gradient-to-br from-green-500/20 to-emerald-500/20 border-green-500/40 opacity-100' : 'bg-black/40 border-white/5 grayscale opacity-50 shadow-inner'}`}>
            {isMagnet && <div className="absolute -right-4 -top-4 w-16 h-16 bg-green-500/30 blur-2xl"></div>}
            <Magnet className={`w-8 h-8 transition-colors ${isMagnet ? 'text-green-400 drop-shadow-[0_0_12px_#4ade80]' : 'text-slate-500'}`} />
            <div className="space-y-1 relative z-10">
              <span className="text-xs font-bold text-white/90 uppercase tracking-widest">Magnet</span>
              {isMagnet && (
                <div className="h-1 w-full bg-black/60 rounded-full overflow-hidden">
                  <div className="h-full bg-green-500 shadow-[0_0_8px_#4ade80] transition-all duration-150" style={{ width: `${powerUps.magnet}%` }}></div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      
      <div className="mt-auto">
        <p className="text-xs text-slate-400 uppercase tracking-[0.2em] mb-4">Mystery Crate</p>
        <div className="p-6 rounded-2xl bg-gradient-to-tr from-cyan-600/40 to-blue-700/40 flex items-center justify-center relative group cursor-pointer shadow-[0_15px_30px_rgba(6,182,212,0.1)] hover:shadow-[0_20px_40px_rgba(6,182,212,0.3)] border border-cyan-500/30 transition-all duration-300">
          <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl"></div>
          <Focus className="w-12 h-12 text-cyan-300 drop-shadow-[0_0_15px_rgba(6,182,212,0.8)] mix-blend-screen" />
        </div>
        <button className="w-full mt-4 py-3 bg-white text-black font-black uppercase tracking-tighter rounded-xl hover:bg-cyan-400 transition-colors shadow-[0_0_10px_rgba(255,255,255,0.2)] hover:shadow-[0_0_20px_rgba(34,211,238,0.6)] border border-transparent">OPEN CRATE</button>
      </div>
    </aside>
  );
}

export function Footer() {
  return (
    <footer className="flex-none h-12 bg-black border-t border-white/5 flex items-center justify-between px-8 text-[10px] text-slate-500 uppercase tracking-[0.3em] z-20">
      <span className="flex items-center gap-2">
        <span className="w-1.5 h-1.5 rounded-full bg-green-500 shadow-[0_0_8px_#22c55e] animate-pulse"></span> 
        Network Linked
      </span>
      <span>Build v2.4.11-Alpha</span>
      <span className="text-cyan-600/50">Ping: 12ms</span>
    </footer>
  );
}
