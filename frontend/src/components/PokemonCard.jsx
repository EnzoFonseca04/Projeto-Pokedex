import React, { useState } from 'react';
import { POKEMON_TYPES } from '../data/types';
import { formatPokemonId, capitalize, getSpriteUrl } from '../services/pokeApi';
import { Plus, Check, GripVertical, Sparkles } from 'lucide-react';
import { useTeam } from '../context/TeamContext';

export default function PokemonCard({
  pokemon,
  shinyMode = false,
  onClick,
}) {
  const { addToTeam, isPokemonInTeam } = useTeam();
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  const inTeam = isPokemonInTeam(pokemon.id);
  const primaryType = pokemon.types?.[0] || 'normal';
  const typeConfig = POKEMON_TYPES[primaryType] || POKEMON_TYPES.normal;

  const handleDragStart = (e) => {
    // Pack essential data for drag & drop
    const dragData = {
      id: pokemon.id,
      name: pokemon.name,
      types: pokemon.types,
      sprite: getSpriteUrl(pokemon.id, { shiny: shinyMode }),
      stats: pokemon.stats,
    };
    e.dataTransfer.setData('application/json', JSON.stringify(dragData));
    e.dataTransfer.effectAllowed = 'copyMove';

    // Visual drag feedback
    if (e.target) {
      e.target.style.opacity = '0.6';
    }
  };

  const handleDragEnd = (e) => {
    if (e.target) {
      e.target.style.opacity = '1';
    }
  };

  const handleQuickAdd = (e) => {
    e.stopPropagation();
    if (inTeam) return;
    addToTeam({
      ...pokemon,
      sprite: getSpriteUrl(pokemon.id, { shiny: shinyMode }),
    });
  };

  const spriteSrc = imageError
    ? `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${shinyMode ? 'shiny/' : ''}${pokemon.id}.png`
    : getSpriteUrl(pokemon.id, { shiny: shinyMode });

  return (
    <div
      draggable={true}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          onClick();
        }
      }}
      className="group relative rounded-2xl bg-gradient-to-b from-slate-900/90 to-slate-950 border border-slate-800 hover:border-slate-600 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-2xl overflow-hidden cursor-pointer select-none"
      style={{
        boxShadow: `0 10px 30px -15px ${typeConfig.color}25`,
      }}
    >
      {/* Dynamic Type Glow Background */}
      <div
        className="absolute -top-12 -right-12 w-32 h-32 rounded-full opacity-20 blur-2xl group-hover:opacity-40 transition-opacity pointer-events-none"
        style={{ backgroundColor: typeConfig.color }}
      />

      {/* Watermark Pokeball background in card */}
      <div className="absolute top-2 right-2 text-slate-800/40 pointer-events-none group-hover:text-slate-700/60 transition-colors">
        <svg className="w-24 h-24 -mr-6 -mt-6 opacity-20" viewBox="0 0 100 100" fill="currentColor">
          <path d="M 50 10 A 40 40 0 0 0 12 46 L 36 46 A 14 14 0 0 1 50 36 A 14 14 0 0 1 64 46 L 88 46 A 40 40 0 0 0 50 10 Z M 12 54 A 40 40 0 0 0 50 90 A 40 40 0 0 0 88 54 L 64 54 A 14 14 0 0 1 50 64 A 14 14 0 0 1 36 54 L 12 54 Z" />
          <circle cx="50" cy="50" r="8" />
        </svg>
      </div>

      {/* Top Bar: ID and Drag Handle */}
      <div className="relative p-3.5 pb-0 flex items-center justify-between z-10">
        <div className="flex items-center gap-1.5">
          <span className="font-mono text-xs font-bold text-slate-400 group-hover:text-slate-200 transition-colors">
            {formatPokemonId(pokemon.id)}
          </span>
          {shinyMode && (
            <Sparkles className="w-3 h-3 text-amber-400 animate-pulse" />
          )}
        </div>

        {/* Drag indicator & quick add button */}
        <div className="flex items-center gap-1">
          <button
            onClick={handleQuickAdd}
            disabled={inTeam}
            title={inTeam ? 'Já está no time' : 'Adicionar ao time (+)'}
            className={`px-2 py-1 rounded-lg text-[10px] font-bold flex items-center gap-1 transition-all ${
              inTeam
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                : 'bg-slate-800/80 hover:bg-red-600 text-slate-300 hover:text-white border border-slate-700 hover:border-red-500'
            }`}
          >
            {inTeam ? (
              <>
                <Check className="w-3 h-3" />
                <span className="hidden sm:inline">No Time</span>
              </>
            ) : (
              <>
                <Plus className="w-3 h-3" />
                <span>Time</span>
              </>
            )}
          </button>

          <span
            className="text-slate-500 hover:text-slate-300 cursor-grab active:cursor-grabbing p-1"
            title="Arraste para o Team Builder"
          >
            <GripVertical className="w-3.5 h-3.5" />
          </span>
        </div>
      </div>

      {/* Pokémon Official Artwork Sprite */}
      <div className="relative flex items-center justify-center p-4 h-40">
        {!imageLoaded && !imageError && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-8 h-8 border-2 border-red-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}
        <img
          src={spriteSrc}
          alt={pokemon.name}
          loading="lazy"
          onLoad={() => setImageLoaded(true)}
          onError={() => setImageError(true)}
          className={`h-32 w-32 object-contain drop-shadow-xl transition-all duration-300 group-hover:scale-110 group-hover:drop-shadow-[0_10px_15px_rgba(0,0,0,0.5)] ${
            imageLoaded ? 'opacity-100' : 'opacity-0'
          }`}
        />
      </div>

      {/* Bottom Info: Name & Type badges */}
      <div className="relative p-3.5 pt-0 z-10">
        <h3 className="font-extrabold text-sm sm:text-base text-white tracking-wide mb-2 group-hover:text-red-400 transition-colors truncate">
          {capitalize(pokemon.name)}
        </h3>

        <div className="flex flex-wrap items-center gap-1.5">
          {pokemon.types && pokemon.types.length > 0 ? (
            pokemon.types.map((t) => {
              const currentTypeConfig = POKEMON_TYPES[t] || POKEMON_TYPES.normal;
              return (
                <span
                  key={t}
                  style={{
                    backgroundColor: `${currentTypeConfig.color}25`,
                    borderColor: `${currentTypeConfig.color}50`,
                    color: currentTypeConfig.color,
                  }}
                  className="px-2 py-0.5 text-[10px] font-extrabold rounded-md uppercase tracking-wider border"
                >
                  {currentTypeConfig.name}
                </span>
              );
            })
          ) : (
            <span className="px-2 py-0.5 text-[10px] font-bold rounded-md uppercase tracking-wider bg-slate-800 text-slate-400">
              {typeConfig.name}
            </span>
          )}
        </div>
      </div>

      {/* Subtle bottom accent line */}
      <div
        className="h-[2px] w-full transition-all duration-300 opacity-60 group-hover:opacity-100"
        style={{
          background: `linear-gradient(90deg, transparent, ${typeConfig.color}, transparent)`,
        }}
      />
    </div>
  );
}
