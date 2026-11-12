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
  getSpriteUrl,
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
            types: STATIC_POKEMON_TYPES[p.id] || ['normal'],
          }));

          setPokemonList(enriched);
        } else {
          // "Todas" (All 9 Generations)
          // Build full list of 1025 Pokemon
          const fullList = [];
          for (let i = 1; i <= 1025; i++) {
            fullList.push({
              id: i,
              name: `Pokemon #${i}`,
              sprite: getSpriteUrl(i),
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
  }, [selectedGenId]);

  // Filter and sort Pokémon
  const filteredPokemon = useMemo(() => {
    let result = [...pokemonList];

    // Search filter (by name or ID formatted as '25' or '#0025')
    if (searchTerm.trim()) {
      const cleanSearch = searchTerm.toLowerCase().replace('#', '').trim();
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
    <div className="min-h-screen bg-[#080c14] text-slate-100 flex flex-col antialiased selection:bg-red-500 selection:text-white">
      {/* Toast notifications */}
      <Toast />

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
        
        {/* Banner with Current Generation Info */}
        <div className="relative rounded-3xl overflow-hidden p-6 sm:p-8 border border-slate-800 bg-gradient-to-r from-slate-900 via-slate-900/90 to-slate-950 shadow-xl">
          <div className="absolute top-0 right-0 w-96 h-96 bg-red-600/10 rounded-full blur-3xl pointer-events-none" />
          
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-bold mb-3">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Pokédex Oficial Interativa</span>
              </div>
              <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
                {activeGen ? (
                  <>
                    Região de <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-amber-400">{activeGen.region}</span>
                  </>
                ) : (
                  'Todas as Gerações'
                )}
              </h2>
              <p className="text-sm text-slate-400 mt-1 max-w-xl">
                {activeGen
                  ? `${activeGen.name} (${activeGen.games}) • Pokémon de #${String(activeGen.startId).padStart(3, '0')} a #${String(activeGen.endId).padStart(3, '0')}. Clique para ver detalhes ou arraste para montar sua equipe.`
                  : 'Catálogo completo de Pokémon. Use os filtros de região ou tipo para encontrar seus companheiros ideais.'}
              </p>
            </div>

            {/* Quick stats badge */}
            <div className="flex items-center gap-3">
              <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 text-center min-w-[100px]">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                  Exibindo
                </span>
                <span className="text-2xl font-black text-white font-mono">
                  {filteredPokemon.length}
                </span>
              </div>

              <div
                onClick={() => setIsTeamDrawerOpen(true)}
                className="p-4 rounded-2xl bg-gradient-to-br from-red-950/60 to-slate-950 border border-red-500/30 text-center min-w-[120px] cursor-pointer hover:border-red-500/60 transition-all group"
              >
                <span className="text-xs font-bold text-red-400 uppercase tracking-wider block group-hover:text-red-300">
                  Seu Time
                </span>
                <span className="text-2xl font-black text-white font-mono flex items-center justify-center gap-1">
                  {team.length}<span className="text-slate-500 text-base">/6</span>
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Generation Tabs / Filter */}
        <section className="bg-slate-900/40 rounded-2xl p-4 border border-slate-800/80">
          <GenerationTabs
            selectedGenId={selectedGenId}
            onSelectGen={setSelectedGenId}
          />
        </section>

        {/* Type Filters & Sorting Controls */}
        <section className="bg-slate-900/40 rounded-2xl p-4 border border-slate-800/80 space-y-4">
          <TypeFilters
            selectedType={selectedType}
            onSelectType={setSelectedType}
          />

          {/* Sort bar & Results count */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-800/60 text-xs">
            <span className="text-slate-400 font-semibold">
              Mostrando <strong className="text-white">{visiblePokemon.length}</strong> de <strong className="text-white">{filteredPokemon.length}</strong> Pokémon encontrados
            </span>

            <div className="flex items-center gap-2">
              <span className="text-slate-400 flex items-center gap-1 font-bold">
                <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
                Ordenar por:
              </span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 font-bold focus:outline-none focus:ring-1 focus:ring-red-500"
              >
                <option value="id_asc">Número (Crescente)</option>
                <option value="id_desc">Número (Decrescente)</option>
                <option value="name_asc">Nome (A - Z)</option>
                <option value="name_desc">Nome (Z - A)</option>
              </select>
            </div>
          </div>
        </section>

        {/* Pokémon Grid */}
        <section>
          {loading ? (
            /* Skeleton Loading State */
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              {Array.from({ length: 18 }).map((_, i) => (
                <div
                  key={i}
                  className="rounded-2xl bg-slate-900/50 border border-slate-800 p-4 h-64 animate-pulse flex flex-col justify-between"
                >
                  <div className="flex justify-between items-center">
                    <div className="w-10 h-3 bg-slate-800 rounded"></div>
                    <div className="w-6 h-6 bg-slate-800 rounded-lg"></div>
                  </div>
                  <div className="w-28 h-28 bg-slate-800/80 rounded-full mx-auto my-2"></div>
                  <div className="space-y-2">
                    <div className="w-20 h-4 bg-slate-800 rounded"></div>
                    <div className="w-12 h-3 bg-slate-800 rounded"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : visiblePokemon.length === 0 ? (
            /* Empty State */
            <div className="py-20 text-center rounded-3xl bg-slate-900/30 border border-slate-800 p-8 space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-slate-800/80 flex items-center justify-center mx-auto text-slate-500">
                <Search className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-white">Nenhum Pokémon encontrado</h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Tente ajustar os filtros de geração, tipagem ou termos de busca para encontrar o Pokémon desejado.
              </p>
              <button
                onClick={() => {
                  setSearchTerm('');
                  setSelectedType(null);
                }}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold transition-colors"
              >
                Limpar Todos os Filtros
              </button>
            </div>
          ) : (
            <>
              {/* Pokemon Cards Grid */}
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

              {/* Load More Button if remaining */}
              {visiblePokemon.length < filteredPokemon.length && (
                <div className="pt-8 text-center">
                  <button
                    onClick={() => setDisplayLimit((prev) => prev + 60)}
                    className="px-6 py-3 rounded-2xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-white text-xs font-extrabold tracking-wide uppercase transition-all shadow-lg hover:border-slate-500 inline-flex items-center gap-2"
                  >
                    <ChevronDown className="w-4 h-4 text-red-500" />
                    <span>Carregar Mais Pokémon ({filteredPokemon.length - visiblePokemon.length} restantes)</span>
                  </button>
                </div>
              )}
            </>
          )}
        </section>

      </main>

      {/* Floating Team Builder Quick-Toggle Button for Mobile & Desktop */}
      <button
        onClick={() => setIsTeamDrawerOpen(true)}
        className="fixed bottom-6 left-6 z-30 p-3.5 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white rounded-2xl shadow-2xl shadow-red-600/40 border border-red-400/40 flex items-center gap-2.5 active:scale-95 transition-all group"
      >
        <div className="relative">
          <Users className="w-5 h-5 text-white" />
          <span className="absolute -top-2 -right-2 bg-slate-950 text-amber-300 text-[10px] font-black px-1.5 py-0.2 rounded-full border border-amber-400/40">
            {team.length}/6
          </span>
        </div>
        <span className="text-xs font-black hidden sm:inline">
          Team Builder
        </span>
      </button>

      {/* Detail Modal */}
      {selectedPokemonId && (
        <PokemonDetailModal
          pokemonId={selectedPokemonId}
          initialPokemon={pokemonList.find((p) => p.id === selectedPokemonId)}
          onClose={() => setSelectedPokemonId(null)}
        />
      )}

      {/* Team Builder Lateral Drawer */}
      <TeamBuilderDrawer
        isOpen={isTeamDrawerOpen}
        onClose={() => setIsTeamDrawerOpen(false)}
        onSelectPokemonForDetail={(id) => setSelectedPokemonId(id)}
        availableList={pokemonList}
      />

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950/80 py-8 text-center text-xs text-slate-500 mt-12">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© 2026 Pokédex Moderna • Construído com React & Tailwind CSS</p>
          <p className="text-slate-600 text-[11px]">
            Dados fornecidos por PokéAPI • Sprites oficiais e marcas registradas são propriedade de Pokémon / Nintendo / Game Freak.
          </p>
        </div>
      </footer>
    </div>
  );
}
