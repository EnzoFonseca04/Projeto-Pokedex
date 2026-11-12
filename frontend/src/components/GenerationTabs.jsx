import React from 'react';
import { GENERATIONS } from '../data/generations';
import { Compass, Sparkles } from 'lucide-react';

export default function GenerationTabs({ selectedGenId, onSelectGen }) {
  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-3 px-1">
        <div className="flex items-center gap-2">
          <Compass className="w-4 h-4 text-red-500" />
          <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Filtrar por Região & Geração
          </h2>
        </div>
        <span className="text-xs text-slate-500 hidden sm:inline">
          9 Gerações disponíveis
        </span>
      </div>

      <div className="flex items-center gap-2 overflow-x-auto pb-3 pt-1 scrollbar-none no-scrollbar">
        {/* All Generations Option */}
        <button
          onClick={() => onSelectGen(null)}
          className={`shrink-0 px-4 py-2.5 rounded-xl font-bold text-xs transition-all flex flex-col items-center justify-center min-w-[90px] border ${
            selectedGenId === null
              ? 'bg-gradient-to-r from-red-600 to-rose-600 text-white border-red-500 shadow-lg shadow-red-600/30 ring-2 ring-red-500/20'
              : 'bg-slate-900/80 hover:bg-slate-800 text-slate-300 border-slate-800 hover:border-slate-700'
          }`}
        >
          <span className="tracking-wide">Todas</span>
          <span className="text-[10px] font-normal opacity-70">1025 Pokémon</span>
        </button>

        {/* 9 Generations */}
        {GENERATIONS.map((gen) => {
          const isActive = selectedGenId === gen.id;
          return (
            <button
              key={gen.id}
              onClick={() => onSelectGen(gen.id)}
              className={`group shrink-0 px-4 py-2 rounded-xl text-left transition-all border min-w-[110px] ${
                isActive
                  ? 'bg-slate-800/90 border-red-500/80 shadow-lg shadow-red-500/10 ring-2 ring-red-500/30'
                  : 'bg-slate-900/80 hover:bg-slate-800 text-slate-300 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between gap-1 mb-0.5">
                <span className={`text-[11px] font-extrabold uppercase tracking-wider ${isActive ? 'text-red-400' : 'text-slate-400 group-hover:text-slate-200'}`}>
                  {gen.name}
                </span>
                <span className="text-[9px] px-1 py-0.2 rounded bg-slate-950/60 font-mono text-slate-400">
                  {gen.total}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className={`text-xs font-bold ${isActive ? 'text-white' : 'text-slate-300'}`}>
                  {gen.region}
                </span>
                <span className="text-[9px] font-mono text-slate-400">
                  #{String(gen.startId).padStart(3, '0')}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
