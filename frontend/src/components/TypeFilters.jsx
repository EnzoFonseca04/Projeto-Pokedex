import React from 'react';
import { POKEMON_TYPES } from '../data/types';
import { Flame, Filter, X } from 'lucide-react';

export default function TypeFilters({ selectedType, onSelectType }) {
  const typeKeys = Object.keys(POKEMON_TYPES);

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-2.5 px-1">
        <div className="flex items-center gap-2">
          <Filter className="w-3.5 h-3.5 text-blue-400" />
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Filtrar por Tipo
          </span>
        </div>
        {selectedType && (
          <button
            onClick={() => onSelectType(null)}
            className="text-xs text-red-400 hover:text-red-300 flex items-center gap-1 font-semibold transition-colors"
          >
            <X className="w-3 h-3" /> Limpar filtro
          </button>
        )}
      </div>

      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none no-scrollbar">
        <button
          onClick={() => onSelectType(null)}
          className={`shrink-0 px-3 py-1.5 rounded-sm text-[10px] sm:text-xs font-black transition-all border-2 cursor-pointer shadow-[0_2px_0_rgba(0,0,0,0.3)] active:translate-y-0.5 active:shadow-none ${
            selectedType === null
              ? 'bg-[#fcf8d8] text-[#1c3830] border-[#889050]'
              : 'bg-[#122824] text-[#a0d0c4] hover:text-white border-[#244840]'
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
                  ? 'text-white shadow-md ring-1 ring-white scale-105'
                  : 'bg-[#122824] text-[#a0d0c4] hover:text-white border-[#244840]'
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
