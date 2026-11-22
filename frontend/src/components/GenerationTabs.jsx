import React from 'react';
import { GENERATIONS } from '../data/generations';
import { Compass } from 'lucide-react';

export default function GenerationTabs({ selectedGenId, onSelectGen }) {
  return (
    <div className="w-full select-none">
      {/* Cabeçalho do Painel no estilo GBA Menu */}
      <div className="flex items-center justify-between mb-3 px-1 pb-2 border-b-2 border-[#20483e]">
        <div className="flex items-center gap-2">
          {/* Ícone de Bússola retrô */}
          <div className="w-5 h-5 rounded-sm bg-[#d83828] border border-[#781810] flex items-center justify-center text-white shadow-sm">
            <Compass className="w-3.5 h-3.5 text-white" />
          </div>
          <h2 className="text-[10px] sm:text-xs font-black text-[#f8d030] uppercase tracking-wider">
            FILTRAR POR REGIÃO & GERAÇÃO
          </h2>
        </div>
        <span className="text-[9px] sm:text-[10px] font-black text-[#88b8a8] bg-[#0c1c18] px-2 py-0.5 rounded-sm border border-[#20483e]">
          5 GERAÇÕES (ATÉ UNOVA • 2D)
        </span>
      </div>

      {/* Grade de Botões estilo Placas de Rota e Cartuchos GBA (Imagens 3 e 4) */}
      <div className="flex items-center gap-2 sm:gap-2.5 overflow-x-auto pb-2 pt-1 scrollbar-none no-scrollbar">
        {/* Opção Todas as Gerações (649 Pokémon) */}
        <button
          onClick={() => onSelectGen(null)}
          className={`shrink-0 px-3.5 py-2 rounded-sm font-black text-[10px] sm:text-xs transition-all flex flex-col items-center justify-center min-w-[95px] border-2 cursor-pointer shadow-[0_3px_0_rgba(0,0,0,0.4)] active:translate-y-0.5 active:shadow-none ${
            selectedGenId === null
              ? 'bg-[#d83828] text-white border-[#f8d030] shadow-[0_3px_0_#501008] ring-1 ring-[#f8d030]'
              : 'bg-[#183630] text-[#a0d0c4] hover:bg-[#204840] hover:text-white border-[#2c584c]'
          }`}
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
              className={`group shrink-0 px-3 py-1.5 rounded-sm text-left transition-all border-2 min-w-[120px] cursor-pointer shadow-[0_3px_0_rgba(0,0,0,0.4)] active:translate-y-0.5 active:shadow-none ${
                isActive
                  ? 'bg-[#fffef4] border-[#f8d030] shadow-[0_3px_0_#987008] ring-2 ring-[#f8d030]/60'
                  : 'bg-[#183630] text-[#a0d0c4] hover:bg-[#204840] hover:text-white border-[#2c584c]'
              }`}
            >
              <div className="flex items-center justify-between gap-1 mb-0.5">
                <span
                  className={`text-[9px] font-black uppercase tracking-wider ${
                    isActive ? 'text-[#c82818]' : 'text-[#88b8a8] group-hover:text-white'
                  }`}
                >
                  {gen.name}
                </span>
                <span
                  className={`text-[8px] px-1 py-0.2 rounded-sm font-mono border ${
                    isActive
                      ? 'bg-[#182824] text-[#f8d030] border-black/40'
                      : 'bg-[#0a1814] text-[#88b8a8] border-black/20'
                  }`}
                >
                  {gen.total}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span
                  className={`text-[10px] sm:text-xs font-black uppercase ${
                    isActive ? 'text-[#142820]' : 'text-[#c8e8dc]'
                  }`}
                >
                  {gen.region}
                </span>
                <span
                  className={`text-[8px] font-mono ${
                    isActive ? 'text-[#587868]' : 'text-[#88b8a8]'
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
