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
          className={`shrink-0 px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${
            selectedType === null
              ? 'bg-slate-200 text-slate-900 border-white shadow-md'
              : 'bg-slate-900/60 text-slate-400 hover:text-slate-200 border-slate-800'
          }`}
        >
          Todos
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
                borderColor: isSelected ? 'rgba(255,255,255,0.4)' : undefined,
              }}
              className={`shrink-0 px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all border flex items-center gap-1.5 ${
                isSelected
                  ? 'text-white shadow-lg ring-2 ring-white/20 scale-105'
                  : 'bg-slate-900/60 text-slate-400 hover:text-white border-slate-800/80 hover:border-slate-700'
              }`}
            >
              <span
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: typeData.color }}
              ></span>
              <span>{typeData.name}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
