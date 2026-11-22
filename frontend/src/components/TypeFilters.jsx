import React from 'react';
import { POKEMON_TYPES } from '../data/types';
import { Filter, X } from 'lucide-react';

export default function TypeFilters({ selectedType, onSelectType }) {
  const typeKeys = Object.keys(POKEMON_TYPES);

  return (
    <div className="w-full select-none">
      {/* Cabeçalho do Painel no estilo GBA Menu */}
      <div className="flex items-center justify-between mb-3 px-1 pb-2 border-b-2 border-[#20483e]">
        <div className="flex items-center gap-2">
          {/* Ícone de Filtro retrô */}
          <div className="w-5 h-5 rounded-sm bg-[#2054c8] border border-[#0e2868] flex items-center justify-center text-white shadow-sm">
            <Filter className="w-3.5 h-3.5 text-white" />
          </div>
          <span className="text-[10px] sm:text-xs font-black text-[#f8d030] uppercase tracking-wider">
            FILTRAR POR TIPO ELEMENTAL
          </span>
        </div>
        {selectedType && (
          <button
            onClick={() => onSelectType(null)}
            className="text-[9px] sm:text-[10px] text-[#f87868] hover:text-[#fedcd0] flex items-center gap-1 font-black transition-colors cursor-pointer"
          >
            <X className="w-3 h-3" /> LIMPAR
          </button>
        )}
      </div>

      {/* Badges de Tipo estilo Game Boy Advance */}
      <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto pb-2 scrollbar-none no-scrollbar">
        <button
          onClick={() => onSelectType(null)}
          className={`shrink-0 px-3 py-1.5 rounded-sm text-[10px] sm:text-xs font-black transition-all border-2 cursor-pointer shadow-[0_2px_0_rgba(0,0,0,0.3)] active:translate-y-0.5 active:shadow-none ${
            selectedType === null
              ? 'bg-[#fffef4] text-[#1c3830] border-[#f8d030] ring-1 ring-[#f8d030]'
              : 'bg-[#183630] text-[#a0d0c4] hover:bg-[#204840] hover:text-white border-[#2c584c]'
          }`}
        >
          TODOS
        </button>

        {typeKeys.map((typeKey) => {
          const typeData = POKEMON_TYPES[typeKey];
          const isSelected = selectedType === typeKey;

          return (
            <button
              key={typeKey}
              onClick={() => onSelectType(isSelected ? null : typeKey)}
              style={{
                backgroundColor: isSelected ? typeData.color : undefined,
                borderColor: isSelected ? '#ffffff' : undefined,
              }}
              className={`shrink-0 px-2.5 py-1.5 rounded-sm text-[10px] sm:text-xs font-black transition-all border-2 flex items-center gap-1.5 cursor-pointer shadow-[0_2px_0_rgba(0,0,0,0.3)] active:translate-y-0.5 active:shadow-none ${
                isSelected
                  ? 'text-white shadow-md ring-2 ring-white/70 scale-105'
                  : 'bg-[#183630] text-[#a0d0c4] hover:bg-[#204840] hover:text-white border-[#2c584c]'
              }`}
            >
              <span
                className="w-2 h-2 rounded-full border border-black/30"
                style={{ backgroundColor: typeData.color }}
              ></span>
              <span className="uppercase">{typeData.name}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
