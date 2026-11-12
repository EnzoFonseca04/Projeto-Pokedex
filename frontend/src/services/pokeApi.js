// Pokémon API Service with memory and localStorage caching

const CACHE_PREFIX = 'pokedex_cache_v2_';
const MEMORY_CACHE = new Map();

export const getSpriteUrl = (id, options = {}) => {
  const { shiny = false, animated = false } = options;
  if (animated) {
    return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/showdown/${shiny ? 'shiny/' : ''}${id}.gif`;
  }
  return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${shiny ? 'shiny/' : ''}${id}.png`;
};

export const getFallbackSpriteUrl = (id, shiny = false) => {
  return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${shiny ? 'shiny/' : ''}${id}.png`;
};

export const getCryAudioUrl = (id) => {
  return `https://raw.githubusercontent.com/PokeAPI/cries/main/cries/pokemon/latest/${id}.ogg`;
};

export const formatPokemonId = (id) => {
  return `#${String(id).padStart(4, '0')}`;
};

export const capitalize = (str) => {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
};

// Safe cached fetch wrapper
async function cachedFetch(url, cacheKey, ttlMs = 1000 * 60 * 60 * 24) {
  // 1. Check memory cache
  if (MEMORY_CACHE.has(cacheKey)) {
    return MEMORY_CACHE.get(cacheKey);
  }

  // 2. Check localStorage
  try {
    const stored = localStorage.getItem(CACHE_PREFIX + cacheKey);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (Date.now() - parsed.timestamp < ttlMs) {
        MEMORY_CACHE.set(cacheKey, parsed.data);
        return parsed.data;
      }
    }
  } catch (e) {
    // LocalStorage quota or disabled, ignore
  }

  // 3. Network fetch
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Failed to fetch from ${url} (status: ${res.status})`);
  }
  const data = await res.json();

  // Save to caches
  MEMORY_CACHE.set(cacheKey, data);
  try {
    localStorage.setItem(
      CACHE_PREFIX + cacheKey,
      JSON.stringify({ timestamp: Date.now(), data })
    );
  } catch (e) {
    // quota exceeded, safely continue
  }

  return data;
}

// Fetch list of Pokemon for a generation
export async function fetchGenerationPokemon(generation) {
  const cacheKey = `gen_${generation.id}`;
  const limit = generation.total;
  const offset = generation.startId - 1;
  const url = `https://pokeapi.co/api/v2/pokemon?limit=${limit}&offset=${offset}`;

  try {
    const data = await cachedFetch(url, cacheKey);
    const basicList = data.results.map((item, index) => {
      const id = generation.startId + index;
      return {
        id,
        name: item.name,
        url: item.url,
        sprite: getSpriteUrl(id),
      };
    });
    return basicList;
  } catch (err) {
    console.warn(`Failed to fetch generation ${generation.id} from network, fallback to generated IDs:`, err);
    // Fallback: generate entries mathematically
    const fallbackList = [];
    for (let id = generation.startId; id <= generation.endId; id++) {
      fallbackList.push({
        id,
        name: `Pokemon #${id}`,
        sprite: getSpriteUrl(id),
      });
    }
    return fallbackList;
  }
}

// Fetch complete details for a single Pokémon
export async function fetchPokemonDetail(idOrName) {
  const cacheKey = `detail_${idOrName}`;
  const url = `https://pokeapi.co/api/v2/pokemon/${idOrName}`;

  try {
    const data = await cachedFetch(url, cacheKey);
    
    // Extract clean stats
    const stats = {};
    let totalBaseStats = 0;
    data.stats.forEach((s) => {
      const statName = s.stat.name;
      const value = s.base_stat;
      stats[statName] = value;
      totalBaseStats += value;
    });

    const types = data.types.map((t) => t.type.name);
    const abilities = data.abilities.map((a) => ({
      name: a.ability.name,
      isHidden: a.is_hidden,
    }));

    return {
      id: data.id,
      name: data.name,
      types,
      height: data.height / 10, // decimetres to metres
      weight: data.weight / 10, // hectograms to kg
      baseExperience: data.base_experience,
      stats: {
        hp: stats['hp'] || 0,
        attack: stats['attack'] || 0,
        defense: stats['defense'] || 0,
        specialAttack: stats['special-attack'] || 0,
        specialDefense: stats['special-defense'] || 0,
        speed: stats['speed'] || 0,
        total: totalBaseStats,
      },
      abilities,
      sprite: getSpriteUrl(data.id),
      shinySprite: getSpriteUrl(data.id, { shiny: true }),
      animatedSprite: getSpriteUrl(data.id, { animated: true }),
      shinyAnimatedSprite: getSpriteUrl(data.id, { shiny: true, animated: true }),
      cryUrl: getCryAudioUrl(data.id),
    };
  } catch (err) {
    console.error(`Failed to fetch detail for ${idOrName}:`, err);
    throw err;
  }
}

// Fetch species information (flavor text, evolution chain, category)
export async function fetchPokemonSpecies(id) {
  const cacheKey = `species_${id}`;
  const url = `https://pokeapi.co/api/v2/pokemon-species/${id}`;

  try {
    const data = await cachedFetch(url, cacheKey);
    
    // Find Portuguese or English flavor text
    const ptEntry = data.flavor_text_entries.find(
      (entry) => entry.language.name === 'pt' || entry.language.name === 'pt-BR'
    );
    const enEntry = data.flavor_text_entries.find(
      (entry) => entry.language.name === 'en'
    );
    const flavorText = (ptEntry || enEntry || { flavor_text: 'Sem descrição disponível.' })
      .flavor_text.replace(/[\n\f\r]/g, ' ');

    // Category / genus (e.g. "Seed Pokémon")
    const genusPt = data.genera.find((g) => g.language.name === 'pt' || g.language.name === 'pt-BR');
    const genusEn = data.genera.find((g) => g.language.name === 'en');
    const genus = (genusPt || genusEn || { genus: 'Pokémon' }).genus;

    return {
      flavorText,
      genus,
      isLegendary: data.is_legendary,
      isMythical: data.is_mythical,
      captureRate: data.capture_rate,
      genderRate: data.gender_rate,
    };
  } catch (e) {
    return {
      flavorText: 'Um Pokémon misterioso registrado no catálogo da Pokédex.',
      genus: 'Pokémon',
      isLegendary: false,
      isMythical: false,
    };
  }
}
