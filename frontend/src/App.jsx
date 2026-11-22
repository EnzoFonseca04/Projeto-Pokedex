import React, { useState, useEffect, useMemo } from 'react';
import Header from './components/Header';
import GenerationTabs from './components/GenerationTabs';
import TypeFilters from './components/TypeFilters';
import PokemonCard from './components/PokemonCard';
import PokemonDetailModal from './components/PokemonDetailModal';
import TeamBuilderDrawer from './components/TeamBuilderDrawer';
import Toast from './components/Toast';
import { GENERATIONS } from './data/generations';
import { STATIC_POKEMON_TYPES } from './data/pokemonTypesMap';
import {
  fetchGenerationPokemon,
  formatPokemonId,
  get2DAnimatedSpriteUrl,
} from './services/pokeApi';
import { useTeam } from './context/TeamContext';
import {
  SlidersHorizontal,
  ChevronDown,
  Users,
  Search,
  Sparkles,
  ArrowUpDown,
  RefreshCw,
  Swords,
} from 'lucide-react';

export default function App() {
  const { team } = useTeam();

  // State
  const [selectedGenId, setSelectedGenId] = useState(1); // Default Gen 1 (Kanto)
  const [selectedType, setSelectedType] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [shinyMode, setShinyMode] = useState(false);
  const [sortBy, setSortBy] = useState('id_asc'); // 'id_asc' | 'id_desc' | 'name_asc' | 'name_desc'
  const [isTeamDrawerOpen, setIsTeamDrawerOpen] = useState(false);
  const [selectedPokemonId, setSelectedPokemonId] = useState(null);

  // List data state
  const [pokemonList, setPokemonList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [displayLimit, setDisplayLimit] = useState(60);

  // Load Pokémon based on selected generation
  useEffect(() => {
    let isCurrent = true;
    setLoading(true);
    setDisplayLimit(60);

    const loadData = async () => {
      try {
        if (selectedGenId !== null) {
          const gen = GENERATIONS.find((g) => g.id === selectedGenId);
          if (!gen) return;

          const rawList = await fetchGenerationPokemon(gen);
          if (!isCurrent) return;

          // Enrich with static types for instant badge rendering
          const enriched = rawList.map((p) => ({
            ...p,
            sprite: get2DAnimatedSpriteUrl(p.id, shinyMode),
            types: STATIC_POKEMON_TYPES[p.id] || ['normal'],
          }));

          setPokemonList(enriched);
        } else {
          // "Todas" (All 9 Generations)
          const fullList = [];
          for (let i = 1; i <= 1025; i++) {
            fullList.push({
              id: i,
              name: `Pokemon #${i}`,
              sprite: get2DAnimatedSpriteUrl(i, shinyMode),
              types: STATIC_POKEMON_TYPES[i] || ['normal'],
            });
          }
          if (isCurrent) {
            setPokemonList(fullList);
          }
        }
      } catch (err) {
        console.error('Failed to load Pokémon list:', err);
      } finally {
        if (isCurrent) {
          setLoading(false);
        }
      }
    };

    loadData();

    return () => {
      isCurrent = false;
    };
  }, [selectedGenId, shinyMode]);

  // Filter and sort Pokémon
  const filteredPokemon = useMemo(() => {
    let result = [...pokemonList];

    // Search filter (by name or ID formatted as '25' or '#0025')
    if (searchTerm.trim()) {
      const cleanSearch = searchTerm.toLowerCase().replace('#', '').replace('nº', '').trim();
      const searchNum = parseInt(cleanSearch, 10);

      result = result.filter((p) => {
        const matchesName = p.name.toLowerCase().includes(cleanSearch);
        const matchesId = !isNaN(searchNum) && p.id === searchNum;
        const matchesFormattedId = String(p.id).includes(cleanSearch);
        return matchesName || matchesId || matchesFormattedId;
      });
    }

    // Type filter
    if (selectedType) {
      result = result.filter((p) => {
        const pTypes = p.types || STATIC_POKEMON_TYPES[p.id] || ['normal'];
        return pTypes.includes(selectedType);
      });
    }

    // Sorting
    result.sort((a, b) => {
      if (sortBy === 'id_asc') return a.id - b.id;
      if (sortBy === 'id_desc') return b.id - a.id;
      if (sortBy === 'name_asc') return a.name.localeCompare(b.name);
      if (sortBy === 'name_desc') return b.name.localeCompare(a.name);
      return 0;
    });

    return result;
  }, [pokemonList, searchTerm, selectedType, sortBy]);

  // Sliced for performance when scrolling
  const visiblePokemon = useMemo(() => {
    return filteredPokemon.slice(0, displayLimit);
  }, [filteredPokemon, displayLimit]);

  const activeGen = GENERATIONS.find((g) => g.id === selectedGenId);

  return (
    <div className="relative min-h-screen text-[#f0f4e8] flex flex-col antialiased selection:bg-[#d83828] selection:text-white overflow-x-hidden">
      
      {/* 1. FUNDO 2D CAMPO DE BATALHA DESFOCADO (Estilo Game Boy Advance) */}
      <div
        className="fixed inset-[-30px] pointer-events-none z-0 bg-cover bg-center bg-no-repeat transition-all duration-700"
        style={{
          backgroundImage: `url('/battle-bg.jpg')`,
          filter: 'blur(10px) brightness(0.68) saturate(1.3)',
          transform: 'scale(1.08)',
        }}
      />

      {/* 2. OVERLAY DE VINHETA / RETRÔ GBA */}
      <div className="fixed inset-0 pointer-events-none z-0 bg-gradient-to-b from-black/60 via-[#122824]/40 to-black/80" />

      {/* Toast notifications */}
      <Toast />

      {/* Conteúdo Principal com z-index acima do fundo */}
      <div className="relative z-10 flex flex-col min-h-screen">
        
        {/* Header Bar */}
        <Header
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          shinyMode={shinyMode}
          onToggleShiny={() => setShinyMode((prev) => !prev)}
          teamCount={team.length}
          teamMembers={team}
          onOpenTeamDrawer={() => setIsTeamDrawerOpen(true)}
          totalPokemonCount={pokemonList.length}
        />

        {/* Main Container */}
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
          
          {/* Banner com Informações do Campo de Batalha / Região */}
          <div className="relative rounded-3xl overflow-hidden p-6 sm:p-8 border-2 border-[#d8e4c8]/30 bg-[#122824]/85 backdrop-blur-md shadow-2xl">
            <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
            
            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 text-xs font-bold mb-3">
                  <Swords className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Campo de Batalha Pokémon • Game Boy Advance</span>
                </div>
                <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
                  {activeGen ? (
                    <>
                      Região de <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-amber-300">{activeGen.region}</span>
                    </>
                  ) : (
                    'Todas as Gerações'
                  )}
                </h2>
                <p className="text-xs sm:text-sm text-slate-300 mt-2 max-w-xl leading-relaxed">
                  {activeGen
                    ? `${activeGen.name} (${activeGen.games}) • Pokémon de #${String(activeGen.startId).padStart(3, '0')} a #${String(activeGen.endId).padStart(3, '0')}. Sprites 2D animados em movimento real. Clique no Pokémon para abrir seus status na Pokédex!`
                    : 'Catálogo geral de Pokémon com sprites animados em 2D. Clique em qualquer card para inspecionar os status da criatura.'}
                </p>
              </div>

              {/* Quick stats badge */}
              <div className="flex items-center gap-3">
                <div className="p-4 rounded-2xl bg-[#0c1b18]/90 border border-emerald-500/30 text-center min-w-[100px] shadow-lg">
                  <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider block">
                    No Campo
                  </span>
                  <span className="text-2xl font-black text-white font-mono">
                    {filteredPokemon.length}
                  </span>
                </div>

                <div
                  onClick={() => setIsTeamDrawerOpen(true)}
                  className="p-4 rounded-2xl bg-gradient-to-br from-red-950/80 to-[#122824] border-2 border-red-500/50 text-center min-w-[120px] cursor-pointer hover:border-red-400 transition-all group shadow-lg"
                >
                  <span className="text-[10px] font-bold text-red-400 uppercase tracking-wider block group-hover:text-red-300">
                    Seu Time
                  </span>
                  <span className="text-2xl font-black text-white font-mono flex items-center justify-center gap-1">
                    {team.length}<span className="text-slate-400 text-sm">/6</span>
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Abas de Gerações */}
          <section className="bg-[#122824]/85 backdrop-blur-md rounded-2xl p-4 border border-[#d8e4c8]/20 shadow-xl">
            <GenerationTabs
              selectedGenId={selectedGenId}
              onSelectGen={setSelectedGenId}
            />
          </section>

          {/* Filtros por Tipo e Ordenação */}
          <section className="bg-[#122824]/85 backdrop-blur-md rounded-2xl p-4 border border-[#d8e4c8]/20 shadow-xl space-y-4">
            <TypeFilters
              selectedType={selectedType}
              onSelectType={setSelectedType}
            />

            {/* Barra de Ordenação */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-700/60 text-xs">
              <span className="text-slate-300 font-semibold">
                Mostrando <strong className="text-emerald-400">{visiblePokemon.length}</strong> de <strong className="text-white">{filteredPokemon.length}</strong> Pokémon
              </span>

              <div className="flex items-center gap-2">
                <span className="text-slate-300 flex items-center gap-1 font-bold">
                  <ArrowUpDown className="w-3.5 h-3.5 text-emerald-400" />
                  Ordenar:
                </span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="bg-[#0c1b18] border border-emerald-500/40 rounded-lg px-2.5 py-1.5 text-xs text-white font-bold focus:outline-none focus:ring-1 focus:ring-emerald-400"
                >
                  <option value="id_asc">Número (Crescente)</option>
                  <option value="id_desc">Número (Decrescente)</option>
                  <option value="name_asc">Nome (A - Z)</option>
                  <option value="name_desc">Nome (Z - A)</option>
                </select>
              </div>
            </div>
          </section>

          {/* Grade de Cards com Sprites 2D Animados */}
          <section>
            {loading ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                {Array.from({ length: 18 }).map((_, i) => (
                  <div
                    key={i}
                    className="rounded-2xl bg-white/10 border border-white/20 p-4 h-64 animate-pulse flex flex-col justify-between"
                  >
                    <div className="w-12 h-3 bg-white/20 rounded"></div>
                    <div className="w-20 h-20 bg-white/20 rounded-full mx-auto my-2"></div>
                    <div className="space-y-2">
                      <div className="w-24 h-4 bg-white/20 rounded"></div>
                      <div className="w-12 h-3 bg-white/20 rounded"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : visiblePokemon.length === 0 ? (
              <div className="py-20 text-center rounded-3xl bg-[#122824]/80 backdrop-blur-md border border-slate-700 p-8 space-y-4">
                <div className="w-16 h-16 rounded-2xl bg-black/40 flex items-center justify-center mx-auto text-slate-400">
                  <Search className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-bold text-white">Nenhum Pokémon encontrado no campo</h3>
                <p className="text-xs text-slate-400 max-w-sm mx-auto">
                  Ajuste os filtros de geração, tipagem ou termos de busca.
                </p>
                <button
                  onClick={() => {
                    setSearchTerm('');
                    setSelectedType(null);
                  }}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-colors"
                >
                  Limpar Filtros
                </button>
              </div>
            ) : (
              <>
                {/* Cards com Sprites 2D Animados em Movimento */}
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                  {visiblePokemon.map((pokemon) => (
                    <PokemonCard
                      key={pokemon.id}
                      pokemon={pokemon}
                      shinyMode={shinyMode}
                      onClick={() => setSelectedPokemonId(pokemon.id)}
                    />
                  ))}
                </div>

                {/* Botão Carregar Mais */}
                {visiblePokemon.length < filteredPokemon.length && (
                  <div className="pt-8 text-center">
                    <button
                      onClick={() => setDisplayLimit((prev) => prev + 60)}
                      className="px-6 py-3 rounded-2xl bg-[#0c1b18] hover:bg-[#122824] border-2 border-emerald-500/50 text-white text-xs font-extrabold tracking-wide uppercase transition-all shadow-xl hover:border-emerald-400 inline-flex items-center gap-2"
                    >
                      <ChevronDown className="w-4 h-4 text-emerald-400" />
                      <span>Carregar Mais Pokémon ({filteredPokemon.length - visiblePokemon.length} restantes)</span>
                    </button>
                  </div>
                )}
              </>
            )}
          </section>

        </main>

        {/* Floating Team Builder Quick-Toggle Button */}
        <button
          onClick={() => setIsTeamDrawerOpen(true)}
          className="fixed bottom-6 left-6 z-30 p-3.5 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white rounded-2xl shadow-2xl shadow-red-600/50 border-2 border-white/40 flex items-center gap-2.5 active:scale-95 transition-all group"
        >
          <div className="relative">
            <Users className="w-5 h-5 text-white" />
            <span className="absolute -top-2 -right-2 bg-slate-950 text-amber-300 text-[10px] font-black px-1.5 py-0.2 rounded-full border border-amber-400">
              {team.length}/6
            </span>
          </div>
          <span className="text-xs font-black hidden sm:inline">
            Team Builder
          </span>
        </button>

        {/* Modal de Status da Pokédex (Abre ao Clicar no Pokémon) */}
        {selectedPokemonId && (
          <PokemonDetailModal
            pokemonId={selectedPokemonId}
            initialPokemon={pokemonList.find((p) => p.id === selectedPokemonId)}
            onClose={() => setSelectedPokemonId(null)}
          />
        )}

        {/* Team Builder Drawer Lateral */}
        <TeamBuilderDrawer
          isOpen={isTeamDrawerOpen}
          onClose={() => setIsTeamDrawerOpen(false)}
          onSelectPokemonForDetail={(id) => setSelectedPokemonId(id)}
          availableList={pokemonList}
        />

        {/* Footer */}
        <footer className="border-t border-slate-800 bg-[#0c1b18]/90 backdrop-blur-md py-8 text-center text-xs text-slate-400 mt-12">
          <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p>© 2026 Pokédex Game Boy Advance • Sprites 2D Animados & Áudios Oficiais</p>
            <p className="text-slate-500 text-[11px]">
              Dados e Cries via PokéAPI • Marcas e Sprites são propriedade da Nintendo / Game Freak / Pokémon.
            </p>
          </div>
        </footer>

      </div>
    </div>
  );
}
