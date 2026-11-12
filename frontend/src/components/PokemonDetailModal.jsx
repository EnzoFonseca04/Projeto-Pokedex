import React, { useState, useEffect } from 'react';
import { POKEMON_TYPES, getDefensiveEffectiveness } from '../data/types';
import {
  formatPokemonId,
  capitalize,
  fetchPokemonDetail,
  fetchPokemonSpecies,
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
  Award,
  Plus,
  Trash2,
  Check,
  Film,
} from 'lucide-react';
import { useTeam } from '../context/TeamContext';

export default function PokemonDetailModal({ pokemonId, initialPokemon, onClose }) {
  const { team, addToTeam, removeFromTeam, isPokemonInTeam } = useTeam();

  const [detail, setDetail] = useState(null);
  const [species, setSpecies] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isShiny, setIsShiny] = useState(false);
  const [isAnimated, setIsAnimated] = useState(false);
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
      audio.play().catch((e) => console.log('Audio autoplay prevented', e));
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

  // Group weaknesses & resistances
  const weaknesses = [];
  const resistances = [];
  const immunities = [];

  Object.entries(effectiveness).forEach(([type, mult]) => {
    if (mult > 1) weaknesses.push({ type, mult });
    else if (mult === 0) immunities.push({ type, mult });
    else if (mult < 1) resistances.push({ type, mult });
  });

  // Calculate stat bar percentage (max baseline 255 for Blissey HP)
  const getStatPercent = (val) => Math.min(100, Math.round((val / 200) * 100));

  const getStatColor = (val) => {
    if (val >= 130) return 'bg-emerald-400';
    if (val >= 90) return 'bg-blue-400';
    if (val >= 60) return 'bg-amber-400';
    return 'bg-red-400';
  };

  const activeSprite = isAnimated
    ? (isShiny ? detail?.shinyAnimatedSprite : detail?.animatedSprite)
    : (isShiny ? detail?.shinySprite : detail?.sprite);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto bg-black/80 backdrop-blur-md animate-fadeIn">
      {/* Backdrop click to close */}
      <div className="fixed inset-0" onClick={onClose} />

      <div
        className="relative w-full max-w-3xl rounded-3xl bg-slate-900 border border-slate-700/80 shadow-2xl overflow-hidden z-10 max-h-[92vh] flex flex-col my-auto"
        style={{
          boxShadow: `0 25px 60px -15px ${typeConfig.color}40`,
        }}
      >
        {/* Header Ribbon */}
        <div
          className="relative px-6 py-4 flex items-center justify-between border-b border-white/10"
          style={{
            background: `linear-gradient(135deg, ${typeConfig.color}33, rgba(15, 23, 42, 0.9))`,
          }}
        >
          <div className="flex items-center gap-3">
            <span className="font-mono text-sm sm:text-base font-extrabold text-white/70 bg-black/40 px-2.5 py-1 rounded-xl border border-white/10">
              {formatPokemonId(pokemonId)}
            </span>
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                {capitalize(detail?.name || initialPokemon?.name || `Pokemon #${pokemonId}`)}
              </h2>
              {species?.genus && (
                <p className="text-xs text-white/60 font-medium">
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
                  <span>Remover</span>
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
              className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors border border-slate-700"
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
              {/* Top Section: Sprite Showcase & Quick Attributes */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                
                {/* Sprite Preview Box */}
                <div className="md:col-span-5 relative flex flex-col items-center justify-center p-6 rounded-2xl bg-gradient-to-b from-slate-800/60 to-slate-950/80 border border-slate-800 overflow-hidden">
                  <div
                    className="absolute inset-0 opacity-20 blur-2xl"
                    style={{ backgroundColor: typeConfig.color }}
                  />

                  {/* Sprite image */}
                  <div className="relative h-48 w-48 flex items-center justify-center">
                    <img
                      src={activeSprite || detail.sprite}
                      alt={detail.name}
                      className="max-h-full max-w-full object-contain drop-shadow-2xl transition-all duration-300"
                    />
                  </div>

                  {/* Sprite Controls: Cry, Shiny, Animated */}
                  <div className="flex items-center gap-2 mt-4 z-10">
                    <button
                      onClick={playCry}
                      title="Ouvir som oficial (Cry)"
                      className={`p-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all border ${
                        isPlayingAudio
                          ? 'bg-red-500 text-white border-red-400 animate-pulse'
                          : 'bg-slate-800/90 hover:bg-slate-700 text-slate-300 border-slate-700'
                      }`}
                    >
                      <Volume2 className="w-3.5 h-3.5" />
                      <span>Som</span>
                    </button>

                    <button
                      onClick={() => setIsShiny(!isShiny)}
                      title="Alternar versão Shiny"
                      className={`p-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all border ${
                        isShiny
                          ? 'bg-amber-500/20 text-amber-300 border-amber-400/50'
                          : 'bg-slate-800/90 hover:bg-slate-700 text-slate-300 border-slate-700'
                      }`}
                    >
                      <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                      <span>Shiny</span>
                    </button>

                    <button
                      onClick={() => setIsAnimated(!isAnimated)}
                      title="Alternar modelo animado Showdown"
                      className={`p-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all border ${
                        isAnimated
                          ? 'bg-blue-500/20 text-blue-300 border-blue-400/50'
                          : 'bg-slate-800/90 hover:bg-slate-700 text-slate-300 border-slate-700'
                      }`}
                    >
                      <Film className="w-3.5 h-3.5 text-blue-400" />
                      <span>Animado</span>
                    </button>
                  </div>
                </div>

                {/* Attributes & Bio */}
                <div className="md:col-span-7 space-y-4">
                  {/* Types */}
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1.5">
                      Tipagem
                    </span>
                    <div className="flex flex-wrap items-center gap-2">
                      {detail.types.map((t) => {
                        const tc = POKEMON_TYPES[t] || POKEMON_TYPES.normal;
                        return (
                          <div
                            key={t}
                            style={{
                              backgroundColor: `${tc.color}25`,
                              borderColor: `${tc.color}60`,
                              color: tc.color,
                            }}
                            className="px-3 py-1 text-xs font-black rounded-lg uppercase tracking-wider border flex items-center gap-1.5"
                          >
                            <span
                              className="w-2 h-2 rounded-full"
                              style={{ backgroundColor: tc.color }}
                            />
                            {tc.name}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Flavor Text Description */}
                  {species?.flavorText && (
                    <div className="p-3.5 rounded-xl bg-slate-800/40 border border-slate-700/50">
                      <p className="text-xs sm:text-sm text-slate-300 italic leading-relaxed">
                        "{species.flavorText}"
                      </p>
                    </div>
                  )}

                  {/* Physical measurements */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-800">
                      <span className="text-[10px] font-bold uppercase text-slate-400 block">
                        Altura
                      </span>
                      <span className="text-sm font-extrabold text-white">
                        {detail.height} m
                      </span>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-800">
                      <span className="text-[10px] font-bold uppercase text-slate-400 block">
                        Peso
                      </span>
                      <span className="text-sm font-extrabold text-white">
                        {detail.weight} kg
                      </span>
                    </div>
                  </div>

                  {/* Abilities */}
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1.5">
                      Habilidades
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {detail.abilities.map((ab) => (
                        <span
                          key={ab.name}
                          className={`text-xs px-2.5 py-1 rounded-lg border font-semibold ${
                            ab.isHidden
                              ? 'bg-purple-950/40 text-purple-300 border-purple-500/30'
                              : 'bg-slate-800 text-slate-200 border-slate-700'
                          }`}
                        >
                          {capitalize(ab.name.replace('-', ' '))}
                          {ab.isHidden && (
                            <span className="ml-1 text-[9px] text-purple-400 font-bold">
                              (Oculta)
                            </span>
                          )}
                        </span>
                      ))}
                    </div>
                  </div>

                </div>
              </div>

              {/* Base Stats Section */}
              <div className="p-5 rounded-2xl bg-slate-800/30 border border-slate-800">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Activity className="w-4 h-4 text-emerald-400" />
                    <h3 className="text-xs font-black uppercase tracking-wider text-slate-300">
                      Estatísticas Base (Status)
                    </h3>
                  </div>
                  <div className="flex items-center gap-1.5 font-mono text-xs font-bold text-slate-400">
                    <span>BST Total:</span>
                    <span className="text-white font-extrabold text-sm px-2 py-0.5 rounded-md bg-slate-800 border border-slate-700">
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
                        <span className="text-slate-400 font-semibold flex items-center gap-1.5">
                          <stat.icon className={`w-3.5 h-3.5 ${stat.color}`} />
                          {stat.label}
                        </span>
                        <span className="font-mono font-bold text-white">
                          {stat.val}
                        </span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${getStatColor(stat.val)}`}
                          style={{ width: `${getStatPercent(stat.val)}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Type Weaknesses & Resistances */}
              <div className="p-5 rounded-2xl bg-slate-800/30 border border-slate-800">
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-300 mb-3 flex items-center gap-2">
                  <Shield className="w-4 h-4 text-blue-400" />
                  Eficácia Defensiva (Fraquezas e Resistências)
                </h3>

                <div className="space-y-3">
                  {/* Fraquezas */}
                  <div>
                    <span className="text-[10px] font-bold uppercase text-red-400 block mb-1.5">
                      Fraquezas (Recebe dano aumentado)
                    </span>
                    {weaknesses.length === 0 ? (
                      <p className="text-xs text-slate-500 italic">Sem fraquezas identificadas.</p>
                    ) : (
                      <div className="flex flex-wrap gap-1.5">
                        {weaknesses.map(({ type, mult }) => {
                          const tc = POKEMON_TYPES[type] || POKEMON_TYPES.normal;
                          return (
                            <span
                              key={type}
                              style={{ borderColor: `${tc.color}60` }}
                              className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-900 border text-slate-200 flex items-center gap-1"
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
                      Resistências (Recebe dano reduzido)
                    </span>
                    {resistances.length === 0 ? (
                      <p className="text-xs text-slate-500 italic">Nenhuma resistência especial.</p>
                    ) : (
                      <div className="flex flex-wrap gap-1.5">
                        {resistances.map(({ type, mult }) => {
                          const tc = POKEMON_TYPES[type] || POKEMON_TYPES.normal;
                          return (
                            <span
                              key={type}
                              style={{ borderColor: `${tc.color}60` }}
                              className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-900 border text-slate-200 flex items-center gap-1"
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
                        Imunidades (Dano nulo - 0x)
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {immunities.map(({ type }) => {
                          const tc = POKEMON_TYPES[type] || POKEMON_TYPES.normal;
                          return (
                            <span
                              key={type}
                              className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-purple-950/40 border border-purple-500/40 text-purple-300 flex items-center gap-1"
                            >
                              {tc.name}
                              <span className="text-purple-400 font-extrabold">0x</span>
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
