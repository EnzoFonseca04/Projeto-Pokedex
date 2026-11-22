import React, { useState, useEffect } from 'react';
import { POKEMON_TYPES, getDefensiveEffectiveness } from '../data/types';
import {
  formatPokemonId,
  capitalize,
  fetchPokemonDetail,
  fetchPokemonSpecies,
  getCryAudioUrl,
  get2DAnimatedSpriteUrl,
} from '../services/pokeApi';
import {
  Volume2,
  Sparkles,
  Plus,
  Trash2,
} from 'lucide-react';
import { useTeam } from '../context/TeamContext';

export default function PokemonDetailModal({ pokemonId, initialPokemon, onClose }) {
  const { team, addToTeam, removeFromTeam, isPokemonInTeam } = useTeam();

  const [detail, setDetail] = useState(null);
  const [species, setSpecies] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isShiny, setIsShiny] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [activeTab, setActiveTab] = useState('info'); // 'info' | 'status' | 'fraquezas'

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

          // Toca o som (Cry) oficial ao carregar a tela
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
          setError('Não foi possível carregar os dados do Pokémon.');
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [pokemonId]);

  // Handle ESC and Arrow Keys to switch pages
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowRight' || e.key === 'PageDown') {
        handleNextPage();
      } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
        handlePrevPage();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose, activeTab]);

  const PAGES = ['info', 'status', 'fraquezas'];

  const handleNextPage = () => {
    const nextIdx = (PAGES.indexOf(activeTab) + 1) % PAGES.length;
    setActiveTab(PAGES[nextIdx]);
  };

  const handlePrevPage = () => {
    const prevIdx = (PAGES.indexOf(activeTab) - 1 + PAGES.length) % PAGES.length;
    setActiveTab(PAGES[prevIdx]);
  };

  const playCry = () => {
    const cryUrl = detail?.cryUrl || getCryAudioUrl(pokemonId);
    if (!cryUrl) return;
    try {
      setIsPlayingAudio(true);
      const audio = new Audio(cryUrl);
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
        sprite: get2DAnimatedSpriteUrl(pokemonId, isShiny),
        stats: detail.stats,
      });
    }
  };

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
    if (val >= 130) return 'bg-[#28b878]';
    if (val >= 90) return 'bg-[#3898f8]';
    if (val >= 60) return 'bg-[#f8a828]';
    return 'bg-[#d83828]';
  };

  const pokemonName = detail?.name || initialPokemon?.name || `Pokemon #${pokemonId}`;
  const formattedId = String(pokemonId).padStart(3, '0');

  // Title bar text based on current GBA page
  const getHeaderTitle = () => {
    if (activeTab === 'info') return 'POKÉMON INFO';
    if (activeTab === 'status') return 'POKÉMON SKILLS';
    return 'EFICÁCIA BATALHA';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 overflow-y-auto bg-black/85 backdrop-blur-sm select-none">
      {/* Backdrop click to close */}
      <div className="fixed inset-0" onClick={onClose} />

      {/* Caixa Principal da Tela de Status estilo GBA (Pokémon FireRed / Emerald) */}
      <div
        className="relative w-full max-w-2xl bg-[#3da496] border-4 border-[#0c2e28] rounded-lg shadow-[0_12px_40px_rgba(0,0,0,0.8),inset_0_2px_0_#68c8bc,inset_0_-2px_0_#20645c] overflow-hidden z-10 flex flex-col my-auto"
        style={{
          boxShadow: 'inset 0 0 0 2px #50b0a2, 0 15px 35px rgba(0, 0, 0, 0.75)',
        }}
      >
        {/* Barra Superior estilo GBA (POKÉMON INFO / +PAGE / CANCEL) */}
        <div className="relative px-3 sm:px-4 py-2.5 bg-[#3da496] border-b-2 border-[#1a5048] flex items-center justify-between shadow-sm">
          {/* Lado Esquerdo: Indicador Oval + Dots + Título GBA */}
          <div className="flex items-center gap-2 sm:gap-2.5">
            {/* Cápsula Oval luminosa retrô */}
            <div className="w-3.5 h-6 rounded-full bg-[#f8faf8] border-2 border-[#1c4840] shadow-inner flex items-center justify-center">
              <div className="w-1.5 h-3 rounded-full bg-[#b8d4d0]/60" />
            </div>

            {/* Dois pontinhos/botões azuis do GBA */}
            <div className="flex flex-col gap-1">
              <div className="w-2 h-2 rounded-full bg-[#185868] border border-[#308898]" />
              <div className="w-2 h-2 rounded-full bg-[#185868] border border-[#308898]" />
            </div>

            {/* Título da tela com drop-shadow pixelado */}
            <h2
              className="text-xs sm:text-sm font-black text-white tracking-widest pl-1"
              style={{
                textShadow: '2px 2px 0px #18443e, -1px -1px 0px #18443e',
              }}
            >
              {getHeaderTitle()}
            </h2>
          </div>

          {/* Lado Direito: Botões +PAGE e (A)CANCEL */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            <button
              onClick={handleNextPage}
              title="Trocar página (ou use as setas ← → do teclado)"
              className="px-2 sm:px-2.5 py-1 text-[9px] sm:text-[10px] font-black rounded-sm bg-[#e8ece8] hover:bg-white text-[#183830] border-2 border-[#184840] shadow-[0_2px_0_#14342e] active:translate-y-0.5 active:shadow-none flex items-center gap-1 cursor-pointer transition-all"
            >
              <span className="text-[#388878] font-black">+</span>
              <span>PAGE</span>
            </button>

            <button
              onClick={onClose}
              title="Fechar (Esc)"
              className="px-2 sm:px-2.5 py-1 text-[9px] sm:text-[10px] font-black rounded-sm bg-[#e8ece8] hover:bg-[#fedcd0] text-[#881810] border-2 border-[#184840] shadow-[0_2px_0_#14342e] active:translate-y-0.5 active:shadow-none flex items-center gap-1 cursor-pointer transition-all"
            >
              <span className="text-[#d83828] font-black">A</span>
              <span>CANCEL</span>
            </button>
          </div>
        </div>

        {/* Abas Rápidas de Navegação das Páginas do GBA */}
        <div className="flex items-center gap-1 px-3 py-1 bg-[#28746a] border-b-2 border-[#184840] text-[9px] sm:text-[10px] overflow-x-auto">
          <span className="text-[#a4e0d4] mr-1 hidden sm:inline font-bold">TELA:</span>
          <button
            onClick={() => setActiveTab('info')}
            className={`px-2 py-0.5 rounded-sm border cursor-pointer font-bold transition-all ${
              activeTab === 'info'
                ? 'bg-[#fcf8d8] text-[#1c3830] border-[#889050] shadow-sm'
                : 'bg-[#1e5850] text-[#b8e8dc] border-[#16443c] hover:bg-[#28685c]'
            }`}
          >
            1. INFO
          </button>
          <button
            onClick={() => setActiveTab('status')}
            className={`px-2 py-0.5 rounded-sm border cursor-pointer font-bold transition-all ${
              activeTab === 'status'
                ? 'bg-[#fcf8d8] text-[#1c3830] border-[#889050] shadow-sm'
                : 'bg-[#1e5850] text-[#b8e8dc] border-[#16443c] hover:bg-[#28685c]'
            }`}
          >
            2. STATUS
          </button>
          <button
            onClick={() => setActiveTab('fraquezas')}
            className={`px-2 py-0.5 rounded-sm border cursor-pointer font-bold transition-all ${
              activeTab === 'fraquezas'
                ? 'bg-[#fcf8d8] text-[#1c3830] border-[#889050] shadow-sm'
                : 'bg-[#1e5850] text-[#b8e8dc] border-[#16443c] hover:bg-[#28685c]'
            }`}
          >
            3. FRAQUEZAS
          </button>
        </div>

        {/* Corpo da Tela GBA */}
        <div className="p-2.5 sm:p-3.5 space-y-2.5 sm:space-y-3 bg-[#3da496] max-h-[82vh] overflow-y-auto">
          {loading ? (
            <div className="py-20 flex flex-col items-center justify-center gap-3 bg-[#fff8f0] border-2 border-[#c87868] rounded-sm p-8">
              <div className="w-8 h-8 border-4 border-[#388878] border-t-transparent rounded-full animate-spin" />
              <p className="text-[11px] font-bold text-[#1c3830] tracking-wider">
                LENDO CARTUCHO...
              </p>
            </div>
          ) : error ? (
            <div className="py-12 text-center text-[#d83828] text-xs font-bold bg-[#fff0f0] border-2 border-[#d83828] p-4 rounded-sm">
              {error}
            </div>
          ) : (
            <>
              {/* Seção Superior: Caixa Lilás do Sprite (Esquerda) e Painel Listrado Pêssego (Direita) */}
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5 sm:gap-3 items-stretch">
                
                {/* === COLUNA ESQUERDA: QUADRO DO POKÉMON COM SPRITE GIGANTE (FRLG) === */}
                <div className="sm:col-span-5 flex flex-col">
                  {/* Faixa Roxa/Lilás com Nível e Nome */}
                  <div className="bg-[#8078b8] border-t-2 border-x-2 border-[#585088] rounded-t-sm px-2.5 py-1.5 flex items-center justify-between text-white shadow-sm">
                    <span className="text-[10px] font-black tracking-wider text-[#fcfcff]">
                      Lv50
                    </span>
                    <span className="text-[10px] font-black tracking-wider uppercase text-white truncate max-w-[100px]">
                      {pokemonName}
                    </span>
                    {/* Símbolo de Gênero estilo GBA */}
                    <span className="text-[11px] font-extrabold text-[#2858b8] drop-shadow-[0_1px_0_#ffffff]">
                      ♂
                    </span>
                  </div>

                  {/* Quadro Branco com Listras Horizontais Sutis + Sprite GRANDE em Pixel Art */}
                  <div
                    className="relative flex-1 min-h-[190px] sm:min-h-[210px] flex items-center justify-center border-2 border-[#585088] overflow-hidden"
                    style={{
                      background:
                        'repeating-linear-gradient(to bottom, #ffffff 0px, #ffffff 3px, #e8edf0 3px, #e8edf0 6px)',
                    }}
                  >
                    {/* Sombra / Pedestal oval da batalha sob o Pokémon */}
                    <div className="absolute bottom-4 w-32 sm:w-36 h-7 rounded-[100%] bg-[#b8c8c0]/70 border border-[#98a8a0] shadow-inner pointer-events-none" />

                    {/* SPRITE DO POKÉMON: Grande, Nítido e Animado em Pixel Art */}
                    <div className="relative z-10 w-36 h-36 sm:w-44 sm:h-44 flex items-center justify-center">
                      <img
                        src={get2DAnimatedSpriteUrl(pokemonId, isShiny)}
                        alt={pokemonName}
                        style={{
                          imageRendering: 'pixelated',
                        }}
                        className="max-h-36 max-w-36 sm:max-h-44 sm:max-w-44 object-contain scale-[1.75] sm:scale-[2.0] transform-gpu filter drop-shadow-md select-none pointer-events-none"
                      />
                    </div>

                    {/* Mini Pokéball no Canto Inferior Direito (igual na referência) */}
                    <img
                      src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/poke-ball.png"
                      alt="Pokéball"
                      style={{ imageRendering: 'pixelated' }}
                      className="absolute bottom-2 right-2 w-5 h-5 object-contain opacity-95 drop-shadow pointer-events-none"
                    />
                  </div>

                  {/* Botões de Ação do Sprite: Som (Cry), Shiny e Time (SEM botão de Arte) */}
                  <div className="flex items-center justify-between gap-1.5 mt-2">
                    {/* Botão de Som (Cry) */}
                    <button
                      onClick={playCry}
                      title="Tocar Som oficial (Cry)"
                      className={`flex-1 py-1.5 px-1 rounded-sm text-[9px] font-black flex items-center justify-center gap-1 border-2 transition-all cursor-pointer ${
                        isPlayingAudio
                          ? 'bg-[#d83828] text-white border-[#881810] animate-pulse'
                          : 'bg-[#eef2ee] hover:bg-white text-[#183828] border-[#688878] shadow-[0_2px_0_#486054] active:translate-y-0.5 active:shadow-none'
                      }`}
                    >
                      <Volume2 className="w-3 h-3 text-[#d83828]" />
                      <span>SOM</span>
                    </button>

                    {/* Botão Shiny */}
                    <button
                      onClick={() => setIsShiny(!isShiny)}
                      title="Alternar versão Shiny"
                      className={`flex-1 py-1.5 px-1 rounded-sm text-[9px] font-black flex items-center justify-center gap-1 border-2 transition-all cursor-pointer ${
                        isShiny
                          ? 'bg-[#f8c830] text-[#381c00] border-[#986808] shadow-[0_2px_0_#684000]'
                          : 'bg-[#eef2ee] hover:bg-white text-[#183828] border-[#688878] shadow-[0_2px_0_#486054] active:translate-y-0.5 active:shadow-none'
                      }`}
                    >
                      <Sparkles className="w-3 h-3 text-[#d89810]" />
                      <span>SHINY</span>
                    </button>

                    {/* Botão de Equipe (Time) */}
                    <button
                      onClick={handleTeamAction}
                      title={inTeam ? 'Remover da equipe' : 'Adicionar à equipe'}
                      className={`flex-1 py-1.5 px-1 rounded-sm text-[9px] font-black flex items-center justify-center gap-1 border-2 transition-all cursor-pointer shadow-[0_2px_0_rgba(0,0,0,0.3)] active:translate-y-0.5 active:shadow-none ${
                        inTeam
                          ? 'bg-[#d84838] hover:bg-[#e85848] text-white border-[#881810]'
                          : 'bg-[#38a868] hover:bg-[#48b878] text-white border-[#186838]'
                      }`}
                    >
                      {inTeam ? (
                        <>
                          <Trash2 className="w-3 h-3" />
                          <span>-TIME</span>
                        </>
                      ) : (
                        <>
                          <Plus className="w-3 h-3" />
                          <span>+TIME</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* === COLUNA DIREITA: DADOS ESPECÍFICOS DA PÁGINA (FRLG ESTILO PÊSSEGO) === */}
                <div
                  className="sm:col-span-7 p-2.5 sm:p-3 border-2 border-[#d08878] rounded-sm flex flex-col justify-between"
                  style={{
                    background:
                      'repeating-linear-gradient(to bottom, #fff5f0 0px, #fff5f0 3px, #fed8cb 3px, #fed8cb 6px)',
                  }}
                >
                  {/* CONTEÚDO DA PÁGINA 1: INFO (EXATAMENTE IGUAL À IMAGEM DE REFERÊNCIA) */}
                  {activeTab === 'info' && (
                    <div className="space-y-2">
                      {/* Linha No */}
                      <div className="flex items-center gap-3">
                        <span className="w-16 px-2 py-0.5 rounded-sm bg-[#687890] border border-[#485870] text-white text-[9px] sm:text-[10px] font-black text-center shadow-sm">
                          No
                        </span>
                        <span className="text-xs sm:text-sm font-black text-[#182838] tracking-wider">
                          {formattedId}
                        </span>
                      </div>

                      {/* Linha NAME */}
                      <div className="flex items-center gap-3">
                        <span className="w-16 px-2 py-0.5 rounded-sm bg-[#687890] border border-[#485870] text-white text-[9px] sm:text-[10px] font-black text-center shadow-sm">
                          NAME
                        </span>
                        <span className="text-xs sm:text-sm font-black text-[#182838] uppercase tracking-wide truncate">
                          {pokemonName}
                        </span>
                      </div>

                      {/* Linha TYPE */}
                      <div className="flex items-center gap-3">
                        <span className="w-16 px-2 py-0.5 rounded-sm bg-[#687890] border border-[#485870] text-white text-[9px] sm:text-[10px] font-black text-center shadow-sm">
                          TYPE
                        </span>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          {detail?.types?.map((t) => {
                            const tc = POKEMON_TYPES[t] || POKEMON_TYPES.normal;
                            return (
                              <span
                                key={t}
                                style={{ backgroundColor: tc.color }}
                                className="px-2 py-0.5 rounded-sm text-[9px] sm:text-[10px] font-black text-white uppercase border border-black/30 shadow-[inset_0_1px_0_rgba(255,255,255,0.4),0_1px_2px_rgba(0,0,0,0.3)]"
                              >
                                {tc.name}
                              </span>
                            );
                          })}
                        </div>
                      </div>

                      {/* Linha OT / ALTURA */}
                      <div className="flex items-center gap-3">
                        <span className="w-16 px-2 py-0.5 rounded-sm bg-[#687890] border border-[#485870] text-white text-[9px] sm:text-[10px] font-black text-center shadow-sm">
                          ALTURA
                        </span>
                        <span className="text-xs sm:text-sm font-black text-[#182838]">
                          {detail?.height} m
                        </span>
                      </div>

                      {/* Linha IDNo / PESO */}
                      <div className="flex items-center gap-3">
                        <span className="w-16 px-2 py-0.5 rounded-sm bg-[#687890] border border-[#485870] text-white text-[9px] sm:text-[10px] font-black text-center shadow-sm">
                          PESO
                        </span>
                        <span className="text-xs sm:text-sm font-black text-[#182838]">
                          {detail?.weight} kg
                        </span>
                      </div>

                      {/* Linha ITEM / HABILIDADE */}
                      <div className="flex items-center gap-3">
                        <span className="w-16 px-2 py-0.5 rounded-sm bg-[#687890] border border-[#485870] text-white text-[9px] sm:text-[10px] font-black text-center shadow-sm">
                          HABILIDADE
                        </span>
                        <div className="text-[10px] sm:text-[11px] font-black text-[#182838] uppercase truncate">
                          {capitalize(detail?.abilities?.[0]?.name?.replace('-', ' ') || 'NENHUMA')}
                          {detail?.abilities?.[0]?.isHidden && (
                            <span className="ml-1 text-[8px] text-[#702888]">
                              (OCULTA)
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* CONTEÚDO DA PÁGINA 2: STATUS (POKÉMON SKILLS ESTILO GBA) */}
                  {activeTab === 'status' && (
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between pb-1 border-b border-[#e09888]">
                        <span className="text-[10px] font-black text-[#182838]">
                          ATRIBUTOS BASE
                        </span>
                        <span className="text-[10px] font-black text-[#d83828]">
                          BST: {detail?.stats?.total}
                        </span>
                      </div>

                      {[
                        { label: 'HP', val: detail?.stats?.hp, color: '#e84838' },
                        { label: 'ATAQUE', val: detail?.stats?.attack, color: '#f07828' },
                        { label: 'DEFESA', val: detail?.stats?.defense, color: '#e8a820' },
                        { label: 'ATQ.ESP', val: detail?.stats?.specialAttack, color: '#2898e8' },
                        { label: 'DEF.ESP', val: detail?.stats?.specialDefense, color: '#38b868' },
                        { label: 'VELOC.', val: detail?.stats?.speed, color: '#8858b8' },
                      ].map((st) => (
                        <div key={st.label} className="space-y-0.5">
                          <div className="flex items-center justify-between text-[9px] sm:text-[10px] font-black">
                            <span className="text-[#384858]">{st.label}</span>
                            <span className="text-[#182838] font-mono">{st.val}</span>
                          </div>
                          <div className="w-full h-1.5 bg-[#e0cece] rounded-none border border-[#b89898] overflow-hidden">
                            <div
                              className="h-full"
                              style={{
                                width: `${getStatPercent(st.val)}%`,
                                backgroundColor: st.color,
                              }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* CONTEÚDO DA PÁGINA 3: EFICÁCIA E FRAQUEZAS */}
                  {activeTab === 'fraquezas' && (
                    <div className="space-y-2 text-[9px] sm:text-[10px]">
                      <div>
                        <span className="font-black text-[#b82818] block mb-1">
                          FRAQUEZAS (DANO AUMENTADO):
                        </span>
                        <div className="flex flex-wrap gap-1">
                          {weaknesses.length === 0 ? (
                            <span className="text-[#586878]">Nenhuma fraqueza</span>
                          ) : (
                            weaknesses.map(({ type, mult }) => {
                              const tc = POKEMON_TYPES[type] || POKEMON_TYPES.normal;
                              return (
                                <span
                                  key={type}
                                  style={{ backgroundColor: tc.color }}
                                  className="px-1.5 py-0.5 rounded-sm text-white font-black text-[9px] border border-black/20 flex items-center gap-1"
                                >
                                  {tc.name}
                                  <span className="bg-black/30 px-1 rounded-sm text-white">
                                    {mult}x
                                  </span>
                                </span>
                              );
                            })
                          )}
                        </div>
                      </div>

                      <div className="pt-1.5 border-t border-[#e09888]">
                        <span className="font-black text-[#187838] block mb-1">
                          RESISTÊNCIAS (DANO REDUZIDO):
                        </span>
                        <div className="flex flex-wrap gap-1">
                          {resistances.length === 0 ? (
                            <span className="text-[#586878]">Nenhuma resistência</span>
                          ) : (
                            resistances.map(({ type, mult }) => {
                              const tc = POKEMON_TYPES[type] || POKEMON_TYPES.normal;
                              return (
                                <span
                                  key={type}
                                  style={{ backgroundColor: tc.color }}
                                  className="px-1.5 py-0.5 rounded-sm text-white font-black text-[9px] border border-black/20 flex items-center gap-1"
                                >
                                  {tc.name}
                                  <span className="bg-black/30 px-1 rounded-sm text-white">
                                    {mult}x
                                  </span>
                                </span>
                              );
                            })
                          )}
                        </div>
                      </div>

                      {immunities.length > 0 && (
                        <div className="pt-1.5 border-t border-[#e09888]">
                          <span className="font-black text-[#582888] block mb-1">
                            IMUNIDADES (0x):
                          </span>
                          <div className="flex flex-wrap gap-1">
                            {immunities.map(({ type }) => {
                              const tc = POKEMON_TYPES[type] || POKEMON_TYPES.normal;
                              return (
                                <span
                                  key={type}
                                  style={{ backgroundColor: tc.color }}
                                  className="px-1.5 py-0.5 rounded-sm text-white font-black text-[9px] border border-black/20"
                                >
                                  {tc.name} 0x
                                </span>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* === SEÇÃO INFERIOR: TRAINER MEMO / DESCRIÇÃO DA POKÉDEX (FRLG) === */}
              <div>
                {/* Aba de Cabeçalho TRAINER MEMO */}
                <div className="flex items-center">
                  <span className="px-2.5 py-1 rounded-t-sm bg-[#687890] border-t-2 border-x-2 border-[#485870] text-white text-[9px] sm:text-[10px] font-black uppercase tracking-wider shadow-sm">
                    TRAINER MEMO
                  </span>
                </div>

                {/* Caixa de Texto estilo Pergaminho / Memo GBA com Listras Horizontais */}
                <div
                  className="p-3 border-2 border-[#d08878] rounded-b-sm rounded-tr-sm text-[#182838]"
                  style={{
                    background:
                      'repeating-linear-gradient(to bottom, #fffaf4 0px, #fffaf4 4px, #fcece0 4px, #fcece0 8px)',
                  }}
                >
                  {/* Linha de Natureza / Local (estilo FireRed) */}
                  <p className="text-[10px] sm:text-[11px] font-black text-[#284858] mb-1">
                    {species?.genus ? `${species.genus.toUpperCase()} nature.` : 'DOCILE nature.'}
                  </p>
                  <p className="text-[10px] sm:text-[11px] font-bold text-[#486070] mb-2">
                    Met in PALLET TOWN at Lv 5.
                  </p>

                  {/* Texto de Descrição da Pokédex */}
                  <p className="text-[10px] sm:text-[11px] leading-relaxed text-[#182838] font-bold">
                    "{species?.flavorText || 'A strange seed was planted on its back at birth. The plant sprouts and grows with this POKÉMON.'}"
                  </p>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
