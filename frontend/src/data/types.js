// Pokémon Types data, colors, gradients and Portuguese translations

export const POKEMON_TYPES = {
  normal: {
    name: 'Normal',
    color: '#9FA19F',
    bg: 'bg-zinc-500',
    border: 'border-zinc-400',
    text: 'text-zinc-200',
    lightBg: 'rgba(168, 167, 122, 0.15)',
    gradient: 'from-zinc-500/30 to-zinc-700/20',
  },
  fire: {
    name: 'Fogo',
    color: '#E62829',
    bg: 'bg-red-500',
    border: 'border-red-400',
    text: 'text-red-200',
    lightBg: 'rgba(238, 129, 48, 0.15)',
    gradient: 'from-orange-500/30 to-red-600/20',
  },
  water: {
    name: 'Água',
    color: '#2980EF',
    bg: 'bg-blue-500',
    border: 'border-blue-400',
    text: 'text-blue-200',
    lightBg: 'rgba(99, 144, 240, 0.15)',
    gradient: 'from-blue-500/30 to-cyan-600/20',
  },
  grass: {
    name: 'Planta',
    color: '#3FA129',
    bg: 'bg-emerald-500',
    border: 'border-emerald-400',
    text: 'text-emerald-200',
    lightBg: 'rgba(122, 199, 76, 0.15)',
    gradient: 'from-emerald-500/30 to-green-600/20',
  },
  electric: {
    name: 'Elétrico',
    color: '#FAC000',
    bg: 'bg-amber-400',
    border: 'border-amber-300',
    text: 'text-amber-200',
    lightBg: 'rgba(247, 208, 44, 0.15)',
    gradient: 'from-amber-400/30 to-yellow-600/20',
  },
  ice: {
    name: 'Gelo',
    color: '#3DCEF3',
    bg: 'bg-cyan-400',
    border: 'border-cyan-300',
    text: 'text-cyan-200',
    lightBg: 'rgba(150, 217, 214, 0.15)',
    gradient: 'from-cyan-400/30 to-blue-500/20',
  },
  fighting: {
    name: 'Lutador',
    color: '#FF8000',
    bg: 'bg-orange-600',
    border: 'border-orange-500',
    text: 'text-orange-200',
    lightBg: 'rgba(194, 46, 40, 0.15)',
    gradient: 'from-orange-600/30 to-red-700/20',
  },
  poison: {
    name: 'Veneno',
    color: '#9141CB',
    bg: 'bg-purple-600',
    border: 'border-purple-500',
    text: 'text-purple-200',
    lightBg: 'rgba(163, 62, 161, 0.15)',
    gradient: 'from-purple-600/30 to-fuchsia-700/20',
  },
  ground: {
    name: 'Terrestre',
    color: '#915121',
    bg: 'bg-yellow-700',
    border: 'border-yellow-600',
    text: 'text-yellow-200',
    lightBg: 'rgba(226, 191, 101, 0.15)',
    gradient: 'from-yellow-700/30 to-amber-800/20',
  },
  flying: {
    name: 'Voador',
    color: '#81B9EF',
    bg: 'bg-indigo-400',
    border: 'border-indigo-300',
    text: 'text-indigo-200',
    lightBg: 'rgba(169, 143, 243, 0.15)',
    gradient: 'from-indigo-400/30 to-sky-500/20',
  },
  psychic: {
    name: 'Psíquico',
    color: '#EF4179',
    bg: 'bg-pink-500',
    border: 'border-pink-400',
    text: 'text-pink-200',
    lightBg: 'rgba(249, 85, 135, 0.15)',
    gradient: 'from-pink-500/30 to-rose-600/20',
  },
  bug: {
    name: 'Inseto',
    color: '#91A119',
    bg: 'bg-lime-600',
    border: 'border-lime-500',
    text: 'text-lime-200',
    lightBg: 'rgba(166, 185, 26, 0.15)',
    gradient: 'from-lime-600/30 to-green-700/20',
  },
  rock: {
    name: 'Pedra',
    color: '#AFA981',
    bg: 'bg-stone-500',
    border: 'border-stone-400',
    text: 'text-stone-200',
    lightBg: 'rgba(182, 161, 54, 0.15)',
    gradient: 'from-stone-500/30 to-stone-700/20',
  },
  ghost: {
    name: 'Fantasma',
    color: '#704170',
    bg: 'bg-violet-800',
    border: 'border-violet-600',
    text: 'text-violet-200',
    lightBg: 'rgba(112, 85, 152, 0.15)',
    gradient: 'from-violet-800/30 to-purple-900/20',
  },
  dragon: {
    name: 'Dragão',
    color: '#5060E1',
    bg: 'bg-indigo-600',
    border: 'border-indigo-500',
    text: 'text-indigo-200',
    lightBg: 'rgba(111, 53, 252, 0.15)',
    gradient: 'from-indigo-600/30 to-violet-800/20',
  },
  dark: {
    name: 'Sombrio',
    color: '#50413F',
    bg: 'bg-neutral-800',
    border: 'border-neutral-700',
    text: 'text-neutral-300',
    lightBg: 'rgba(112, 87, 70, 0.15)',
    gradient: 'from-neutral-800/40 to-slate-900/30',
  },
  steel: {
    name: 'Aço',
    color: '#60A1B8',
    bg: 'bg-slate-500',
    border: 'border-slate-400',
    text: 'text-slate-200',
    lightBg: 'rgba(183, 183, 206, 0.15)',
    gradient: 'from-slate-500/30 to-slate-700/20',
  },
  fairy: {
    name: 'Fada',
    color: '#EF70EF',
    bg: 'bg-pink-400',
    border: 'border-pink-300',
    text: 'text-pink-200',
    lightBg: 'rgba(214, 133, 173, 0.15)',
    gradient: 'from-pink-400/30 to-rose-400/20',
  },
};

// Type Effectiveness Matrix (Defending type: how attacking types damage it)
// attacker -> defender -> multiplier
export const TYPE_CHART = {
  normal: { rock: 0.5, ghost: 0, steel: 0.5 },
  fire: { fire: 0.5, water: 0.5, grass: 2, ice: 2, bug: 2, rock: 0.5, dragon: 0.5, steel: 2 },
  water: { fire: 2, water: 0.5, grass: 0.5, ground: 2, rock: 2, dragon: 0.5 },
  grass: { fire: 0.5, water: 2, grass: 0.5, poison: 0.5, ground: 2, flying: 0.5, bug: 0.5, rock: 2, dragon: 0.5, steel: 0.5 },
  electric: { water: 2, grass: 0.5, electric: 0.5, ground: 0, flying: 2, dragon: 0.5 },
  ice: { fire: 0.5, water: 0.5, grass: 2, ice: 0.5, ground: 2, flying: 2, dragon: 2, steel: 0.5 },
  fighting: { normal: 2, ice: 2, poison: 0.5, flying: 0.5, psychic: 0.5, bug: 0.5, rock: 2, ghost: 0, dark: 2, steel: 2, fairy: 0.5 },
  poison: { grass: 2, poison: 0.5, ground: 0.5, rock: 0.5, ghost: 0.5, steel: 0, fairy: 2 },
  ground: { fire: 2, grass: 0.5, electric: 2, poison: 2, flying: 0, bug: 0.5, rock: 2, steel: 2 },
  flying: { grass: 2, electric: 0.5, fighting: 2, bug: 2, rock: 0.5, steel: 0.5 },
  psychic: { fighting: 2, poison: 2, psychic: 0.5, dark: 0, steel: 0.5 },
  bug: { fire: 0.5, grass: 2, fighting: 0.5, poison: 0.5, flying: 0.5, psychic: 2, ghost: 0.5, dark: 2, steel: 0.5, fairy: 0.5 },
  rock: { fire: 2, ice: 2, fighting: 0.5, ground: 0.5, flying: 2, bug: 2, steel: 0.5 },
  ghost: { normal: 0, psychic: 2, ghost: 2, dark: 0.5 },
  dragon: { dragon: 2, steel: 0.5, fairy: 0 },
  dark: { fighting: 0.5, psychic: 2, ghost: 2, dark: 0.5, fairy: 0.5 },
  steel: { fire: 0.5, water: 0.5, electric: 0.5, ice: 2, rock: 2, steel: 0.5, fairy: 2 },
  fairy: { fire: 0.5, fighting: 2, poison: 0.5, dragon: 2, dark: 2, steel: 0.5 },
};

// Calculate defensive effectiveness for a Pokémon given its types
export function getDefensiveEffectiveness(types = []) {
  const allTypes = Object.keys(POKEMON_TYPES);
  const result = {};

  allTypes.forEach((attType) => {
    let multiplier = 1;
    types.forEach((defType) => {
      const lowerDef = defType.toLowerCase();
      if (TYPE_CHART[attType] && TYPE_CHART[attType][lowerDef] !== undefined) {
        multiplier *= TYPE_CHART[attType][lowerDef];
      }
    });
    result[attType] = multiplier;
  });

  return result;
}
