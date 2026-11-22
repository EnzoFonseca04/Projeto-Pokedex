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
          className={`shrink-0 px-3.5 py-2 rounded-sm font-black text-[10px] sm:text-xs transition-all flex flex-col items-center justify-center min-w-[90px] border-2 cursor-pointer shadow-[0_2px_0_rgba(0,0,0,0.3)] active:translate-y-0.5 active:shadow-none ${
            selectedGenId === null
              ? 'bg-[#d83828] text-white border-[#881810] shadow-[0_3px_0_#501008]'
              : 'bg-[#122824] text-[#a0d0c4] hover:text-white border-[#244840]'
          }`}
        >
          <span className="tracking-wide uppercase">TODAS</span>
          <span className="text-[8px] font-mono opacity-80">1025 POKÉMON</span>
        </button>

        {/* 9 Generations */}
        {GENERATIONS.map((gen) => {
          const isActive = selectedGenId === gen.id;
          return (
            <button
              key={gen.id}
              onClick={() => onSelectGen(gen.id)}
              className={`group shrink-0 px-3 py-1.5 rounded-sm text-left transition-all border-2 min-w-[110px] cursor-pointer shadow-[0_2px_0_rgba(0,0,0,0.3)] active:translate-y-0.5 active:shadow-none ${
                isActive
                  ? 'bg-[#1e4840] border-[#f8d030] shadow-[0_3px_0_#0e2420]'
                  : 'bg-[#122824] text-[#a0d0c4] hover:text-white border-[#244840]'
              }`}
            >
              <div className="flex items-center justify-between gap-1 mb-0.5">
                <span className={`text-[10px] font-black uppercase tracking-wider ${isActive ? 'text-[#f8d030]' : 'text-[#88b8a8] group-hover:text-white'}`}>
                  {gen.name}
                </span>
                <span className="text-[8px] px-1 py-0.2 rounded-sm bg-[#0a1814] font-mono text-[#88b8a8] border border-black/20">
                  {gen.total}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className={`text-[10px] sm:text-xs font-black ${isActive ? 'text-white' : 'text-[#c8e8dc]'}`}>
                  {gen.region}
                </span>
                <span className="text-[8px] font-mono text-[#88b8a8]">
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
