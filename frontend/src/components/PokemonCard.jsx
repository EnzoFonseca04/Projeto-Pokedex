import React, { useState } from 'react';
import { POKEMON_TYPES } from '../data/types';
import {
  formatPokemonId,
  capitalize,
  get2DAnimatedSpriteUrl,
  getShowdownAnimatedSpriteUrl,
  getFallbackSpriteUrl,
  getCryAudioUrl,
} from '../services/pokeApi';
import { Plus, Check, GripVertical, Sparkles, Volume2 } from 'lucide-react';
import { useTeam } from '../context/TeamContext';

export default function PokemonCard({
  pokemon,
  shinyMode = false,
  onClick,
}) {
  const { addToTeam, isPokemonInTeam } = useTeam();
  const [imageLoaded, setImageLoaded] = useState(false);
  const [fallbackLevel, setFallbackLevel] = useState(0);

  const inTeam = isPokemonInTeam(pokemon.id);
  const primaryType = pokemon.types?.[0] || 'normal';
  const typeConfig = POKEMON_TYPES[primaryType] || POKEMON_TYPES.normal;

  // Sound cry helper
  const handlePlayCry = (e) => {
    e.stopPropagation();
    try {
      const audio = new Audio(getCryAudioUrl(pokemon.id));
      audio.volume = 0.45;
      audio.play().catch(() => {});
    } catch (err) {}
  };

  const handleDragStart = (e) => {
    const dragData = {
      id: pokemon.id,
      name: pokemon.name,
      types: pokemon.types,
      sprite: get2DAnimatedSpriteUrl(pokemon.id, shinyMode),
      stats: pokemon.stats,
    };
    e.dataTransfer.setData('application/json', JSON.stringify(dragData));
    e.dataTransfer.effectAllowed = 'copyMove';

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
      sprite: get2DAnimatedSpriteUrl(pokemon.id, shinyMode),
    });
  };

  const handleClickCard = () => {
    // Toca o som oficial (Cry) e abre os status como na Pokédex
    try {
      const audio = new Audio(getCryAudioUrl(pokemon.id));
      audio.volume = 0.45;
      audio.play().catch(() => {});
    } catch (err) {}

    onClick();
  };

  // Sprites 2D animados com fallbacks elegantes
  const getSpriteSource = () => {
    if (fallbackLevel === 0) {
      // 1. Sprite oficial animado 2D em pixel art (Geração V Black/White)
      return get2DAnimatedSpriteUrl(pokemon.id, shinyMode);
    }
    if (fallbackLevel === 1) {
      // 2. Sprite animado 2D Showdown
      return getShowdownAnimatedSpriteUrl(pokemon.id, shinyMode);
    }
    // 3. Fallback estático pixel art
    return getFallbackSpriteUrl(pokemon.id, shinyMode);
  };

  const handleImageError = () => {
    if (fallbackLevel < 2) {
      setFallbackLevel((prev) => prev + 1);
    }
  };

  return (
    <div
      draggable={true}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onClick={handleClickCard}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          handleClickCard();
        }
      }}
      className="group relative rounded-2xl bg-white/95 dark:bg-[#1a2e29] border-2 transition-all duration-200 hover:-translate-y-2 hover:shadow-2xl overflow-hidden cursor-pointer select-none flex flex-col justify-between"
      style={{
        borderColor: typeConfig.cardBorder || '#d8e4c8',
        boxShadow: `0 8px 24px -10px ${typeConfig.color}40`,
      }}
    >
      {/* Área Superior: Sprite 2D Animado sobre a Base de Batalha (Estilo Campo GBA) */}
      <div
        className="relative h-44 w-full flex flex-col items-center justify-center p-3 rounded-t-2xl transition-colors overflow-hidden"
        style={{
          backgroundColor: typeConfig.cardBg || '#d7f7e6',
        }}
      >
        {/* Controles do Card (Som, Shiny, Time, Drag) */}
        <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between z-10">
          <div className="flex items-center gap-1.5">
            <span className="font-mono text-[10px] font-extrabold text-slate-700/80 dark:text-slate-900 bg-white/60 dark:bg-white/80 px-2 py-0.5 rounded-md border border-black/10 shadow-sm">
              {formatPokemonId(pokemon.id)}
            </span>
            {shinyMode && (
              <Sparkles className="w-3.5 h-3.5 text-amber-500 animate-pulse" />
            )}
          </div>

          <div className="flex items-center gap-1.5">
            {/* Botão de Som oficial (Cry) Retrô */}
            <button
              onClick={handlePlayCry}
              title="Ouvir som (Cry)"
              className="p-1 rounded-sm bg-[#eef2ee] hover:bg-white text-[#183828] border border-[#688878] shadow-[0_1.5px_0_#486054] active:translate-y-0.5 active:shadow-none transition-all cursor-pointer"
            >
              <Volume2 className="w-3 h-3 text-[#d83828]" />
            </button>

            {/* Quick Add ao Time Retrô */}
            <button
              onClick={handleQuickAdd}
              disabled={inTeam}
              title={inTeam ? 'Já está no time' : 'Adicionar ao time (+)'}
              className={`px-1.5 py-0.5 rounded-sm text-[8px] sm:text-[9px] font-black flex items-center gap-1 transition-all cursor-pointer shadow-[0_1.5px_0_rgba(0,0,0,0.3)] active:translate-y-0.5 active:shadow-none border ${
                inTeam
                  ? 'bg-[#38a868] text-white border-[#185830]'
                  : 'bg-[#eef2ee] hover:bg-[#f8d030] text-[#183828] hover:text-[#381c00] border-[#688878] hover:border-[#987008]'
              }`}
            >
              {inTeam ? (
                <>
                  <Check className="w-2.5 h-2.5" />
                  <span>TIME</span>
                </>
              ) : (
                <>
                  <Plus className="w-2.5 h-2.5" />
                  <span>TIME</span>
                </>
              )}
            </button>

            <span
              className="text-slate-600 hover:text-slate-900 cursor-grab active:cursor-grabbing p-0.5"
              title="Arraste para o Team Builder"
            >
              <GripVertical className="w-3 h-3" />
            </span>
          </div>
        </div>

        {/* Base de Batalha (Plataforma redonda estilo GBA) */}
        <div className="relative flex items-center justify-center mt-3">
          {/* Anel de grama / pedestal de batalha 2D */}
          <div className="absolute -bottom-2 w-28 h-8 rounded-[100%] bg-emerald-700/30 border-2 border-emerald-600/40 shadow-inner flex items-center justify-center pointer-events-none">
            <div className="w-20 h-5 rounded-[100%] bg-emerald-400/40 blur-[1px]"></div>
          </div>

          {/* Sprite 2D Animado com movimento real */}
          {!imageLoaded && (
            <div className="w-20 h-20 flex items-center justify-center">
              <div className="w-6 h-6 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
          )}
          <img
            src={getSpriteSource()}
            alt={pokemon.name}
            loading="lazy"
            onLoad={() => setImageLoaded(true)}
            onError={handleImageError}
            className={`relative z-10 h-24 w-24 object-contain filter drop-shadow-md transition-all duration-200 group-hover:scale-125 group-hover:-translate-y-2 ${
              imageLoaded ? 'opacity-100' : 'opacity-0'
            }`}
            style={{
              imageRendering: 'pixelated',
            }}
          />
        </div>
      </div>

      {/* Área Inferior: Nome, Número e Badges de Tipo (Estilo Clean GBA) */}
      <div className="p-3 bg-white dark:bg-[#142622] flex-1 flex flex-col justify-between">
        <div className="mb-2">
          <h3 className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-[#f0f4e8] tracking-wide group-hover:text-red-500 transition-colors truncate">
            {capitalize(pokemon.name)}
          </h3>
        </div>

        {/* Tipos em Pílulas Coloridas */}
        <div className="flex flex-wrap items-center gap-1.5">
          {pokemon.types && pokemon.types.length > 0 ? (
            pokemon.types.map((t) => {
              const currentTypeConfig = POKEMON_TYPES[t] || POKEMON_TYPES.normal;
              return (
                <span
                  key={t}
                  style={{
                    backgroundColor: currentTypeConfig.color,
                  }}
                  className="px-2 py-0.5 text-[9px] font-black text-white rounded-md uppercase tracking-wider shadow-sm"
                >
                  {currentTypeConfig.name}
                </span>
              );
            })
          ) : (
            <span className="px-2 py-0.5 text-[9px] font-bold rounded-md uppercase tracking-wider bg-slate-300 text-slate-800">
              {typeConfig.name}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
