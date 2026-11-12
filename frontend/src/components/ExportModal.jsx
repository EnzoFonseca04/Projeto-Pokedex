import React, { useState } from 'react';
import { X, Copy, Check, Share2 } from 'lucide-react';
import { capitalize } from '../services/pokeApi';

export default function ExportModal({ team, onClose }) {
  const [copied, setCopied] = useState(false);

  // Generate Pokémon Showdown / PokéPaste formatted text
  const showdownText = team
    .map((pokemon) => {
      const name = capitalize(pokemon.name);
      const types = (pokemon.types || []).map((t) => capitalize(t)).join('/');
      return `${name} @ Leftovers
Ability: Standard
EVs: 252 HP / 252 Atk / 4 Spe
Adamant Nature
- Move 1 (${types || 'Normal'})
- Move 2
- Move 3
- Move 4`;
    })
    .join('\n\n');

  const handleCopy = () => {
    navigator.clipboard.writeText(showdownText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="fixed inset-0" onClick={onClose} />
      
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-700 rounded-3xl p-6 shadow-2xl z-10 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Share2 className="w-5 h-5 text-red-500" />
            <h3 className="text-base font-bold text-white">Exportar Time Pokémon</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-xs text-slate-400">
          Formato compatível com Pokémon Showdown, PokéPaste e simuladores competitivos:
        </p>

        <div className="relative">
          <textarea
            readOnly
            value={showdownText}
            rows={10}
            className="w-full p-3 font-mono text-xs bg-slate-950 rounded-xl border border-slate-800 text-slate-300 focus:outline-none focus:ring-1 focus:ring-red-500 resize-none"
          />
        </div>

        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-bold text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 transition-colors"
          >
            Fechar
          </button>

          <button
            onClick={handleCopy}
            className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-red-600 hover:bg-red-500 transition-colors flex items-center gap-1.5 shadow-lg shadow-red-600/30"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 text-emerald-300" />
                <span>Copiado!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                <span>Copiar Texto</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
