import React from 'react';
import { GENERATIONS } from '../data/generations';
import { Compass } from 'lucide-react';

export default function GenerationTabs({ selectedGenId, onSelectGen }) {
  return (
    <div className="w-full select-none">
      {/* Cabeçalho do Painel no estilo GBA — texto escuro para fundo claro */}
      <div className="flex items-center justify-between mb-3 px-1 pb-2" style={{ borderBottom: '2px solid #182028' }}>
        <div className="flex items-center gap-2">
          {/* Ícone de Bússola retrô */}
          <div className="w-5 h-5 bg-[#d83828] border border-[#781810] flex items-center justify-center text-white shadow-sm" style={{ borderRadius: 0 }}>
            <Compass className="w-3.5 h-3.5 text-white" />
          </div>
          <h2 className="text-[10px] sm:text-xs font-black text-[#182028] uppercase tracking-wider">
            FILTRAR POR REGIÃO & GERAÇÃO
          </h2>
        </div>
        <span className="text-[9px] sm:text-[10px] font-black text-[#182028] px-2 py-0.5 border border-[#182028]"
          style={{ background: '#d8e8d0', borderRadius: 0 }}>
          5 GERAÇÕES (ATÉ UNOVA • 2D)
        </span>
      </div>

      {/* Grade de Botões estilo GBA — fundo claro */}
      <div className="flex items-center gap-2 sm:gap-2.5 overflow-x-auto pb-2 pt-1 scrollbar-none no-scrollbar">
        {/* Opção Todas as Gerações (649 Pokémon) */}
        <button
          onClick={() => onSelectGen(null)}
          className={`shrink-0 px-3.5 py-2 font-black text-[10px] sm:text-xs transition-all flex flex-col items-center justify-center min-w-[95px] border-2 cursor-pointer shadow-[0_3px_0_rgba(0,0,0,0.35)] active:translate-y-0.5 active:shadow-none ${
            selectedGenId === null
              ? 'bg-[#d83828] text-white border-[#f8d030] shadow-[0_3px_0_#501008] ring-1 ring-[#f8d030]'
              : 'bg-[#d8e8d0] text-[#182028] hover:bg-[#c0d8c8] border-[#182028]'
          }`}
          style={{ borderRadius: 0 }}
        >
          <span className="tracking-wide uppercase">TODAS</span>
          <span className="text-[8px] font-mono opacity-85 mt-0.5">649 POKÉMON</span>
        </button>

        {/* 5 Gerações Oficiais (Kanto até Unova) */}
        {GENERATIONS.map((gen) => {
          const isActive = selectedGenId === gen.id;
          return (
            <button
              key={gen.id}
              onClick={() => onSelectGen(gen.id)}
              style={{ borderRadius: 0 }}
              className={`group shrink-0 px-3 py-1.5 text-left transition-all border-2 min-w-[120px] cursor-pointer shadow-[0_3px_0_rgba(0,0,0,0.35)] active:translate-y-0.5 active:shadow-none ${
                isActive
                  ? 'bg-[#fffef4] border-[#f8d030] shadow-[0_3px_0_#987008] ring-2 ring-[#f8d030]/60'
                  : 'bg-[#d8e8d0] text-[#182028] hover:bg-[#c0d8c8] border-[#182028]'
              }`}
            >
              <div className="flex items-center justify-between gap-1 mb-0.5">
                <span
                  className={`text-[9px] font-black uppercase tracking-wider ${
                    isActive ? 'text-[#c82818]' : 'text-[#304850] group-hover:text-[#182028]'
                  }`}
                >
                  {gen.name}
                </span>
                <span
                  className={`text-[8px] px-1 py-0.2 font-mono border ${
                    isActive
                      ? 'bg-[#182824] text-[#f8d030] border-black/40'
                      : 'bg-[#b8ccb8] text-[#182028] border-[#182028]/30'
                  }`}
                  style={{ borderRadius: 0 }}
                >
                  {gen.total}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span
                  className={`text-[10px] sm:text-xs font-black uppercase ${
                    isActive ? 'text-[#142820]' : 'text-[#182028]'
                  }`}
                >
                  {gen.region}
                </span>
                <span
                  className={`text-[8px] font-mono ${
                    isActive ? 'text-[#587868]' : 'text-[#405848]'
                  }`}
                >
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
