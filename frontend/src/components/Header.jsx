import React from 'react';
import { Search, Sparkles, Shield, X, Layers, Users } from 'lucide-react';

export default function Header({
  searchTerm,
  onSearchChange,
  shinyMode,
  onToggleShiny,
  teamCount,
  teamMembers,
  onOpenTeamDrawer,
  totalPokemonCount,
}) {
  return (
    <header className="sticky top-0 z-30 border-b border-slate-800/80 bg-[#0b0f19]/80 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 gap-4">
          
          {/* Logo & Brand */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="relative group cursor-pointer">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-red-600 via-rose-500 to-amber-500 p-[2px] shadow-lg shadow-red-500/20 group-hover:shadow-red-500/40 transition-all duration-300">
                <div className="w-full h-full bg-slate-950 rounded-2xl flex items-center justify-center relative overflow-hidden">
                  {/* Stylized Pokeball Icon */}
                  <div className="w-7 h-7 rounded-full border-2 border-slate-200 relative flex items-center justify-center">
                    <div className="absolute inset-0 bg-red-600 rounded-t-full h-1/2"></div>
                    <div className="w-2.5 h-2.5 rounded-full bg-white border border-slate-900 z-10 shadow-sm"></div>
                    <div className="absolute w-full h-[2px] bg-slate-900"></div>
                  </div>
                </div>
              </div>
              <span className="absolute -bottom-1 -right-1 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
              </span>
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white flex items-center gap-1.5">
                  POKÉ<span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-rose-400 to-amber-400">DEX</span>
                </h1>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-red-500/10 text-red-400 border border-red-500/20 uppercase tracking-widest hidden sm:inline-block">
                  Modern
                </span>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block">
                {totalPokemonCount} Pokémon catalogados
              </p>
            </div>
          </div>

          {/* Search Bar */}
          <div className="flex-1 max-w-md mx-2">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Search className="w-4 h-4" />
              </div>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="Buscar por nome ou número (#0025)..."
                className="w-full pl-10 pr-9 py-2.5 bg-slate-900/90 border border-slate-700/60 rounded-xl text-sm text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500 transition-all shadow-inner"
              />
              {searchTerm && (
                <button
                  onClick={() => onSearchChange('')}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-200 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Quick Actions & Team Builder Trigger */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {/* Shiny Mode Toggle */}
            <button
              onClick={onToggleShiny}
              title={shinyMode ? 'Modo Shiny Ativo' : 'Ver Formas Shiny'}
              className={`p-2.5 rounded-xl border transition-all flex items-center gap-1.5 text-xs font-semibold ${
                shinyMode
                  ? 'bg-amber-500/20 border-amber-400/50 text-amber-300 shadow-lg shadow-amber-500/20'
                  : 'bg-slate-900 border-slate-700/70 text-slate-400 hover:text-amber-300 hover:border-slate-600'
              }`}
            >
              <Sparkles className={`w-4 h-4 ${shinyMode ? 'text-amber-400 animate-spin-slow' : ''}`} />
              <span className="hidden md:inline">Shiny</span>
            </button>

            {/* Team Builder Drawer Toggle Button */}
            <button
              onClick={onOpenTeamDrawer}
              className="relative flex items-center gap-2.5 pl-3 pr-4 py-2 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-semibold rounded-xl shadow-lg shadow-red-600/25 border border-red-400/30 active:scale-95 transition-all group"
            >
              <div className="relative">
                <Users className="w-4 h-4 text-white" />
                <span className="absolute -top-1.5 -right-2 bg-slate-950 text-amber-400 text-[10px] font-black px-1.5 py-0.2 rounded-full border border-amber-400/40 shadow-sm">
                  {teamCount}/6
                </span>
              </div>
              <span className="hidden sm:inline text-xs font-bold tracking-wide">
                Team Builder
              </span>

              {/* Mini Avatars preview in button */}
              {teamMembers && teamMembers.length > 0 && (
                <div className="hidden lg:flex -space-x-1.5 items-center ml-1">
                  {teamMembers.slice(0, 3).map((m, i) => (
                    <img
                      key={i}
                      src={m.sprite}
                      alt={m.name}
                      className="w-5 h-5 rounded-full bg-slate-900/80 border border-white/20 object-contain"
                    />
                  ))}
                  {teamMembers.length > 3 && (
                    <span className="w-5 h-5 rounded-full bg-slate-950/80 border border-white/20 text-[9px] font-bold flex items-center justify-center text-slate-300">
                      +{teamMembers.length - 3}
                    </span>
                  )}
                </div>
              )}
            </button>

          </div>

        </div>
      </div>
    </header>
  );
}
