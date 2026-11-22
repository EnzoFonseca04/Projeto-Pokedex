import React from 'react';
import { Search, Sparkles, X } from 'lucide-react';

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
    <header className="sticky top-0 z-30 select-none shadow-[0_6px_20px_rgba(0,0,0,0.6)]">
      {/* Barra Principal Estilo GBA FireRed / LeafGreen (Fame Checker Style) */}
      <div className="relative bg-[#2054c8] border-t-2 border-[#0e1c38] flex items-stretch min-h-[58px] sm:min-h-[64px] overflow-hidden">
        
        {/* === SEÇÃO ESQUERDA: BANNER LARANJA COM CORTE DIAGONAL === */}
        <div
          className="relative z-10 flex items-center gap-2 sm:gap-3 px-3 sm:px-6 py-2 bg-gradient-to-r from-[#ea7028] via-[#f48434] to-[#f89848] border-r-2 border-[#984010] shrink-0"
          style={{
            clipPath: 'polygon(0 0, 100% 0, calc(100% - 16px) 100%, 0 100%)',
            paddingRight: '1.75rem',
          }}
        >
          {/* Ícone Pixel Art da Pokébola */}
          <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-white border-2 border-[#182838] relative flex items-center justify-center overflow-hidden shadow-sm shrink-0">
            <div className="absolute top-0 inset-x-0 h-1/2 bg-[#d83828] border-b border-[#182838]" />
            <div className="relative z-10 w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-white border border-[#182838] flex items-center justify-center shadow-inner">
              <div className="w-1 h-1 rounded-full bg-[#182838]" />
            </div>
          </div>

          {/* Título Retrô GBA */}
          <div>
            <div className="flex items-center gap-1.5">
              <h1
                className="text-xs sm:text-base font-black tracking-wider text-white uppercase"
                style={{
                  textShadow: '2px 2px 0px #803008, -1px -1px 0px #803008',
                }}
              >
                POKÉDEX
              </h1>
              <span className="hidden sm:inline-block px-1.5 py-0.2 rounded-sm bg-[#f8d030] text-[#482000] text-[9px] font-black border border-[#a07008] shadow-sm">
                GBA
              </span>
            </div>
            <p className="text-[8px] sm:text-[9px] font-bold text-[#fce8d8] tracking-widest hidden md:block">
              {totalPokemonCount} POKÉMON (ERA 2D)
            </p>
          </div>
        </div>

        {/* === SEÇÃO CENTRAL / DIREITA: BARRA AZUL SAFIRA COM LISTRAS SUTIS === */}
        <div
          className="flex-1 flex items-center justify-between gap-2 sm:gap-4 px-2 sm:px-4 py-2"
          style={{
            background:
              'repeating-linear-gradient(to bottom, #2458cc 0px, #2458cc 4px, #1c4cb8 4px, #1c4cb8 8px)',
          }}
        >
          {/* Caixa de Busca estilo Diálogo de Texto GBA */}
          <div className="flex-1 max-w-xs sm:max-w-md">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none text-[#305080]">
                <Search className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#204078]" />
              </div>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="BUSCAR..."
                className="w-full pl-8 sm:pl-9 pr-7 py-1.5 sm:py-2 bg-[#fffef2] border-2 border-[#0e245c] rounded-sm text-[10px] sm:text-xs text-[#102038] font-bold placeholder-[#7890b0] focus:outline-none focus:border-[#f8d030] focus:ring-1 focus:ring-[#f8d030] shadow-[inset_1px_1px_0_#d8e0f0,0_2px_0_rgba(0,0,0,0.25)] transition-all"
              />
              {searchTerm && (
                <button
                  onClick={() => onSearchChange('')}
                  className="absolute inset-y-0 right-0 pr-2 flex items-center text-[#7890b0] hover:text-[#d83828] transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Botões Retrô: [SELECT] SHINY e o Botão Team Builder idêntico à imagem de referência */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {/* Botão [SELECT] SHINY */}
            <button
              onClick={onToggleShiny}
              title={shinyMode ? 'Modo Shiny Ativo' : 'Ver Formas Shiny'}
              className={`px-2 sm:px-2.5 py-1.5 rounded-sm border-2 text-[9px] sm:text-[10px] font-black flex items-center gap-1.5 cursor-pointer transition-all shadow-[0_2px_0_#0a1838] active:translate-y-0.5 active:shadow-none ${
                shinyMode
                  ? 'bg-[#f8d030] text-[#382000] border-[#987008] shadow-[0_2px_0_#583800]'
                  : 'bg-[#eef2fc] hover:bg-white text-[#183478] border-[#0e2868]'
              }`}
            >
              <span className="hidden sm:inline-block px-1.5 py-0.2 rounded-full bg-[#183478] text-white text-[8px] font-black border border-black/20">
                SELECT
              </span>
              <Sparkles className={`w-3 h-3 ${shinyMode ? 'text-[#885000] animate-spin-slow' : 'text-[#d89810]'}`} />
              <span className="tracking-wide">SHINY</span>
            </button>

            {/* BOTÃO TEAM BUILDER: Pílula Vermelha + Contador Oval Dourado estilo GBA (igual à imagem) */}
            <button
              onClick={onOpenTeamDrawer}
              title="Abrir Team Builder"
              className="relative inline-flex items-center gap-0 cursor-pointer active:scale-95 transition-all group select-none"
            >
              {/* Contador Oval Escuro com borda dourada — fica sobreposto à esquerda da pílula */}
              <span
                className="relative z-10 flex flex-col items-center justify-center w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-[#101828] border-[3px] border-[#f8c820] shadow-[0_0_6px_#f8c820aa] mr-[-10px]"
              >
                <span className="text-[#f8d030] font-black text-[9px] sm:text-[10px] leading-none tracking-tight">
                  {teamCount}/6
                </span>
                {/* Mini Pokéball abaixo do contador — detalhe fiel à imagem */}
                <span className="mt-0.5 text-[7px] leading-none" title="Pokéball">🔴</span>
              </span>

              {/* Pílula principal vermelha */}
              <span
                className="inline-flex items-center pl-5 pr-4 py-2 sm:py-2.5 rounded-full font-black text-white text-[10px] sm:text-xs tracking-wide drop-shadow-sm"
                style={{
                  background: 'linear-gradient(to bottom, #f04858 0%, #c82030 60%, #a81828 100%)',
                  boxShadow: '0 3px 0 #781018, inset 0 1px 0 rgba(255,255,255,0.3)',
                  border: '2px solid rgba(255,255,255,0.35)',
                }}
              >
                Team Builder
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Faixa Amarela/Dourada GBA e Linha de Borda Inferior (Fame Checker Accent) */}
      <div className="h-1 sm:h-1.5 bg-[#f8d030] border-y border-[#a88010] shadow-sm" />
      <div className="h-0.5 bg-[#0a1428]" />
    </header>
  );
}
