import React, { useState, useEffect } from 'react';
import { POKEMON_TYPES, getDefensiveEffectiveness } from '../data/types';
import {
  formatPokemonId,
  capitalize,
  fetchPokemonDetail,
  fetchPokemonSpecies,
  getCryAudioUrl,
  get2DAnimatedSpriteUrl,
  getOfficialArtworkUrl,
} from '../services/pokeApi';
import {
  X,
  Volume2,
  Sparkles,
  Shield,
  Swords,
  Heart,
  Zap,
  Activity,
  Plus,
  Trash2,
  Check,
  Image,
} from 'lucide-react';
import { useTeam } from '../context/TeamContext';

export default function PokemonDetailModal({ pokemonId, initialPokemon, onClose }) {
  const { team, addToTeam, removeFromTeam, isPokemonInTeam } = useTeam();

  const [detail, setDetail] = useState(null);
  const [species, setSpecies] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isShiny, setIsShiny] = useState(false);
  const [showArtwork, setShowArtwork] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  const inTeam = isPokemonInTeam(pokemonId);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setError(null);

    Promise.all([
      fetchPokemonDetail(pokemonId),
      fetchPokemonSpecies(pokemonId),
    ])
      .then(([det, spec]) => {
        if (isMounted) {
          setDetail(det);
          setSpecies(spec);
          setLoading(false);

          // Toca o som (Cry) oficial ao carregar a Pokédex
          if (det?.cryUrl) {
            try {
              setIsPlayingAudio(true);
              const audio = new Audio(det.cryUrl);
              audio.volume = 0.5;
              audio.play().catch(() => {});
              audio.onended = () => setIsPlayingAudio(false);
              audio.onerror = () => setIsPlayingAudio(false);
            } catch (e) {
              setIsPlayingAudio(false);
            }
          }
        }
      })
      .catch((err) => {
        if (isMounted) {
          console.error(err);
          setError('Não foi possível carregar os detalhes do Pokémon.');
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [pokemonId]);

  // Handle ESC key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const playCry = () => {
    if (!detail?.cryUrl) return;
    try {
      setIsPlayingAudio(true);
      const audio = new Audio(detail.cryUrl);
      audio.volume = 0.5;
      audio.play().catch(() => {});
      audio.onended = () => setIsPlayingAudio(false);
      audio.onerror = () => setIsPlayingAudio(false);
    } catch (e) {
      setIsPlayingAudio(false);
    }
  };

  const handleTeamAction = () => {
    if (inTeam) {
      const idx = team.findIndex((p) => p.id === pokemonId);
      if (idx !== -1) removeFromTeam(idx);
    } else if (detail) {
      addToTeam({
        id: detail.id,
        name: detail.name,
        types: detail.types,
        sprite: isShiny ? detail.shinySprite : detail.sprite,
        stats: detail.stats,
      });
    }
  };

  const primaryType = detail?.types?.[0] || initialPokemon?.types?.[0] || 'normal';
  const typeConfig = POKEMON_TYPES[primaryType] || POKEMON_TYPES.normal;
  const effectiveness = detail ? getDefensiveEffectiveness(detail.types) : {};

  const weaknesses = [];
  const resistances = [];
  const immunities = [];

  Object.entries(effectiveness).forEach(([type, mult]) => {
    if (mult > 1) weaknesses.push({ type, mult });
    else if (mult === 0) immunities.push({ type, mult });
    else if (mult < 1) resistances.push({ type, mult });
  });

  const getStatPercent = (val) => Math.min(100, Math.round((val / 200) * 100));

  const getStatColor = (val) => {
    if (val >= 130) return 'bg-emerald-500';
    if (val >= 90) return 'bg-blue-500';
    if (val >= 60) return 'bg-amber-500';
    return 'bg-red-500';
  };

  const activeSprite = showArtwork
    ? getOfficialArtworkUrl(pokemonId, isShiny)
    : get2DAnimatedSpriteUrl(pokemonId, isShiny);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto bg-black/85 backdrop-blur-md animate-fadeIn">
      {/* Backdrop click to close */}
      <div className="fixed inset-0" onClick={onClose} />

      <div
        className="relative w-full max-w-3xl rounded-3xl bg-slate-900 border-2 border-slate-700 shadow-2xl overflow-hidden z-10 max-h-[92vh] flex flex-col my-auto"
        style={{
          boxShadow: `0 25px 60px -15px ${typeConfig.color}60`,
        }}
      >
        {/* Header Ribbon Estilo Pokédex */}
        <div
          className="relative px-6 py-4 flex items-center justify-between border-b border-white/10"
          style={{
            background: `linear-gradient(135deg, ${typeConfig.color}40, rgba(15, 23, 42, 0.95))`,
          }}
        >
          <div className="flex items-center gap-3">
            {/* Lente circular luminosa que pisca com o som do Pokémon */}
            <div className={`relative w-8 h-8 rounded-full border-2 border-white flex items-center justify-center ${isPlayingAudio ? 'bg-cyan-400 shadow-[0_0_20px_#22d3ee] scale-110 animate-pulse' : 'bg-cyan-600 shadow-[0_0_8px_#0891b2]'}`}>
              <div className="w-2.5 h-2.5 rounded-full bg-white/80 absolute top-1 left-1"></div>
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs sm:text-sm font-extrabold text-amber-300 bg-black/50 px-2 py-0.5 rounded-md border border-amber-400/30">
                  {formatPokemonId(pokemonId)}
                </span>
                <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                  {capitalize(detail?.name || initialPokemon?.name || `Pokemon #${pokemonId}`)}
                </h2>
              </div>
              {species?.genus && (
                <p className="text-xs text-slate-300 font-medium mt-0.5">
                  {species.genus}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleTeamAction}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-md ${
                inTeam
                  ? 'bg-red-500/20 text-red-300 border border-red-500/40 hover:bg-red-500/30'
                  : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black'
              }`}
            >
              {inTeam ? (
                <>
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Remover do Time</span>
                </>
              ) : (
                <>
                  <Plus className="w-3.5 h-3.5" />
                  <span>Adicionar ao Time</span>
                </>
              )}
            </button>

            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors border border-slate-700"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Content */}
        <div className="p-6 overflow-y-auto space-y-6">
          {loading ? (
            <div className="py-20 flex flex-col items-center justify-center gap-3">
              <div className="w-10 h-10 border-3 border-red-500 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-sm font-semibold text-slate-400">Carregando dados da Pokédex...</p>
            </div>
          ) : error ? (
            <div className="py-12 text-center text-red-400 text-sm font-semibold">
              {error}
            </div>
          ) : (
            <>
              {/* Top Section: Sprite 2D no Pedestal de Batalha */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                
                {/* Sprite Box com Campo de Batalha 2D */}
                <div
                  className="md:col-span-5 relative flex flex-col items-center justify-center p-6 rounded-2xl border-2 overflow-hidden shadow-inner"
                  style={{
                    backgroundColor: typeConfig.cardBg || '#d7f7e6',
                    borderColor: typeConfig.cardBorder || '#9fe4be',
                  }}
                >
                  {/* Sprite 2D em movimento sobre o anel de grama */}
                  <div className="relative h-44 w-44 flex items-center justify-center">
                    {/* Plataforma de batalha estilo Game Boy */}
                    <div className="absolute bottom-2 w-36 h-10 rounded-[100%] bg-emerald-700/40 border-2 border-emerald-600/50 flex items-center justify-center">
                      <div className="w-28 h-6 rounded-[100%] bg-emerald-400/50 blur-[1px]"></div>
                    </div>

                    <img
                      src={activeSprite}
                      alt={detail.name}
                      style={{ imageRendering: 'pixelated' }}
                      className="relative z-10 max-h-36 max-w-36 object-contain filter drop-shadow-xl animate-bounce-subtle"
                    />
                  </div>

                  {/* Controles de Sprite e Som */}
                  <div className="flex items-center gap-2 mt-4 z-10">
                    <button
                      onClick={playCry}
                      title="Ouvir som oficial (Cry)"
                      className={`p-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all border shadow-sm ${
                        isPlayingAudio
                          ? 'bg-red-600 text-white border-red-400 animate-pulse'
                          : 'bg-white/90 hover:bg-white text-slate-800 border-slate-300'
                      }`}
                    >
                      <Volume2 className="w-3.5 h-3.5 text-red-600" />
                      <span>Som</span>
                    </button>

                    <button
                      onClick={() => setIsShiny(!isShiny)}
                      title="Alternar versão Shiny"
                      className={`p-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all border shadow-sm ${
                        isShiny
                          ? 'bg-amber-500 text-slate-950 border-amber-300'
                          : 'bg-white/90 hover:bg-white text-slate-800 border-slate-300'
                      }`}
                    >
                      <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                      <span>Shiny</span>
                    </button>

                    <button
                      onClick={() => setShowArtwork(!showArtwork)}
                      title="Alternar entre Sprite 2D e Arte Oficial"
                      className="p-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all border shadow-sm bg-white/90 hover:bg-white text-slate-800 border-slate-300"
                    >
                      <Image className="w-3.5 h-3.5 text-blue-600" />
                      <span>{showArtwork ? '2D Sprite' : 'Arte'}</span>
                    </button>
                  </div>
                </div>

                {/* Atributos Básicos & Descrição */}
                <div className="md:col-span-7 space-y-4">
                  {/* Tipos */}
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1.5">
                      Tipagem
                    </span>
                    <div className="flex flex-wrap items-center gap-2">
                      {detail.types.map((t) => {
                        const tc = POKEMON_TYPES[t] || POKEMON_TYPES.normal;
                        return (
                          <div
                            key={t}
                            style={{
                              backgroundColor: tc.color,
                            }}
                            className="px-3 py-1 text-xs font-black text-white rounded-lg uppercase tracking-wider shadow-sm flex items-center gap-1.5"
                          >
                            <span>{tc.name}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Flavor Text (Descrição da Pokédex) */}
                  {species?.flavorText && (
                    <div className="p-3.5 rounded-xl bg-slate-800/80 border border-slate-700">
                      <p className="text-xs sm:text-sm text-slate-200 italic leading-relaxed">
                        "{species.flavorText}"
                      </p>
                    </div>
                  )}

                  {/* Medidas Físicas */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700">
                      <span className="text-[10px] font-bold uppercase text-slate-400 block">
                        Altura
                      </span>
                      <span className="text-sm font-extrabold text-white">
                        {detail.height} m
                      </span>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700">
                      <span className="text-[10px] font-bold uppercase text-slate-400 block">
                        Peso
                      </span>
                      <span className="text-sm font-extrabold text-white">
                        {detail.weight} kg
                      </span>
                    </div>
                  </div>

                  {/* Habilidades */}
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1.5">
                      Habilidades
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {detail.abilities.map((ab) => (
                        <span
                          key={ab.name}
                          className={`text-xs px-2.5 py-1 rounded-lg border font-semibold ${
                            ab.isHidden
                              ? 'bg-purple-950/50 text-purple-200 border-purple-500/40'
                              : 'bg-slate-800 text-slate-200 border-slate-700'
                          }`}
                        >
                          {capitalize(ab.name.replace('-', ' '))}
                          {ab.isHidden && (
                            <span className="ml-1 text-[9px] text-purple-300 font-bold">
                              (Oculta)
                            </span>
                          )}
                        </span>
                      ))}
                    </div>
                  </div>

                </div>
              </div>

              {/* Status da Pokédex (Barras de Estatísticas) */}
              <div className="p-5 rounded-2xl bg-slate-800/60 border border-slate-700/80">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Activity className="w-4 h-4 text-emerald-400" />
                    <h3 className="text-xs font-black uppercase tracking-wider text-white">
                      Estatísticas Base (Status)
                    </h3>
                  </div>
                  <div className="flex items-center gap-1.5 font-mono text-xs font-bold text-slate-300">
                    <span>BST Total:</span>
                    <span className="text-amber-400 font-extrabold text-sm px-2 py-0.5 rounded-md bg-slate-900 border border-slate-700">
                      {detail.stats.total}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3">
                  {[
                    { key: 'hp', label: 'HP', val: detail.stats.hp, icon: Heart, color: 'text-rose-400' },
                    { key: 'attack', label: 'Ataque', val: detail.stats.attack, icon: Swords, color: 'text-orange-400' },
                    { key: 'defense', label: 'Defesa', val: detail.stats.defense, icon: Shield, color: 'text-amber-400' },
                    { key: 'specialAttack', label: 'Atq. Especial', val: detail.stats.specialAttack, icon: Zap, color: 'text-cyan-400' },
                    { key: 'specialDefense', label: 'Def. Especial', val: detail.stats.specialDefense, icon: Shield, color: 'text-blue-400' },
                    { key: 'speed', label: 'Velocidade', val: detail.stats.speed, icon: Activity, color: 'text-emerald-400' },
                  ].map((stat) => (
                    <div key={stat.key} className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-300 font-semibold flex items-center gap-1.5">
                          <stat.icon className={`w-3.5 h-3.5 ${stat.color}`} />
                          {stat.label}
                        </span>
                        <span className="font-mono font-bold text-white">
                          {stat.val}
                        </span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-slate-950 overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-700 ${getStatColor(stat.val)}`}
                          style={{ width: `${getStatPercent(stat.val)}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Fraquezas e Resistências */}
              <div className="p-5 rounded-2xl bg-slate-800/60 border border-slate-700/80">
                <h3 className="text-xs font-black uppercase tracking-wider text-white mb-3 flex items-center gap-2">
                  <Shield className="w-4 h-4 text-blue-400" />
                  Eficácia Defensiva (Fraquezas e Resistências)
                </h3>

                <div className="space-y-3">
                  {/* Fraquezas */}
                  <div>
                    <span className="text-[10px] font-bold uppercase text-red-400 block mb-1.5">
                      Fraquezas (Dano aumentado)
                    </span>
                    {weaknesses.length === 0 ? (
                      <p className="text-xs text-slate-400 italic">Sem fraquezas identificadas.</p>
                    ) : (
                      <div className="flex flex-wrap gap-1.5">
                        {weaknesses.map(({ type, mult }) => {
                          const tc = POKEMON_TYPES[type] || POKEMON_TYPES.normal;
                          return (
                            <span
                              key={type}
                              style={{ borderColor: `${tc.color}80` }}
                              className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-900 border text-slate-100 flex items-center gap-1 shadow-sm"
                            >
                              <span
                                className="w-1.5 h-1.5 rounded-full"
                                style={{ backgroundColor: tc.color }}
                              />
                              {tc.name}
                              <span className="text-red-400 font-extrabold">{mult}x</span>
                            </span>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* Resistências */}
                  <div>
                    <span className="text-[10px] font-bold uppercase text-emerald-400 block mb-1.5">
                      Resistências (Dano reduzido)
                    </span>
                    {resistances.length === 0 ? (
                      <p className="text-xs text-slate-400 italic">Nenhuma resistência especial.</p>
                    ) : (
                      <div className="flex flex-wrap gap-1.5">
                        {resistances.map(({ type, mult }) => {
                          const tc = POKEMON_TYPES[type] || POKEMON_TYPES.normal;
                          return (
                            <span
                              key={type}
                              style={{ borderColor: `${tc.color}80` }}
                              className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-900 border text-slate-100 flex items-center gap-1 shadow-sm"
                            >
                              <span
                                className="w-1.5 h-1.5 rounded-full"
                                style={{ backgroundColor: tc.color }}
                              />
                              {tc.name}
                              <span className="text-emerald-400 font-extrabold">{mult}x</span>
                            </span>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* Imunidades */}
                  {immunities.length > 0 && (
                    <div>
                      <span className="text-[10px] font-bold uppercase text-purple-400 block mb-1.5">
                        Imunidades (Dano 0x)
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {immunities.map(({ type }) => {
                          const tc = POKEMON_TYPES[type] || POKEMON_TYPES.normal;
                          return (
                            <span
                              key={type}
                              className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-purple-950/60 border border-purple-500/50 text-purple-200 flex items-center gap-1 shadow-sm"
                            >
                              {tc.name}
                              <span className="text-purple-300 font-extrabold">0x</span>
                            </span>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
