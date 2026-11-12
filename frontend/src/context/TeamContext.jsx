import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { TYPE_CHART, POKEMON_TYPES } from '../data/types';

const TeamContext = createContext(null);

const STORAGE_KEY = 'pokedex_my_team_v2';

export function TeamProvider({ children }) {
  const [team, setTeam] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed.slice(0, 6);
      }
    } catch (e) {
      console.error('Error loading team from localStorage:', e);
    }
    // Default starter team for initial delight if empty
    return [
      {
        id: 25,
        name: 'pikachu',
        types: ['electric'],
        sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/25.png',
        stats: { hp: 35, attack: 55, defense: 40, specialAttack: 50, specialDefense: 50, speed: 90, total: 320 },
      },
      {
        id: 6,
        name: 'charizard',
        types: ['fire', 'flying'],
        sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/6.png',
        stats: { hp: 78, attack: 84, defense: 78, specialAttack: 109, specialDefense: 85, speed: 100, total: 534 },
      },
      {
        id: 9,
        name: 'blastoise',
        types: ['water'],
        sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/9.png',
        stats: { hp: 79, attack: 83, defense: 100, specialAttack: 85, specialDefense: 105, speed: 78, total: 530 },
      },
    ];
  });

  const [toastMessage, setToastMessage] = useState(null);

  // Save to local storage on changes
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(team));
    } catch (e) {
      console.error('Error saving team:', e);
    }
  }, [team]);

  const showToast = (message, type = 'info') => {
    setToastMessage({ message, type, id: Date.now() });
    setTimeout(() => {
      setToastMessage((cur) => (cur?.message === message ? null : cur));
    }, 3200);
  };

  const addToTeam = (pokemon, targetIndex = null) => {
    if (team.length >= 6 && targetIndex === null) {
      showToast('Seu time já está completo com 6 Pokémon!', 'warning');
      return false;
    }

    // Check if duplicate
    const isDuplicate = team.some((p) => p.id === pokemon.id);
    if (isDuplicate) {
      showToast(`${capitalize(pokemon.name)} já faz parte do seu time!`, 'warning');
      return false;
    }

    const member = {
      id: pokemon.id,
      name: pokemon.name,
      types: pokemon.types && pokemon.types.length ? pokemon.types : ['normal'],
      sprite: pokemon.sprite || `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${pokemon.id}.png`,
      stats: pokemon.stats || { hp: 70, attack: 70, defense: 70, specialAttack: 70, specialDefense: 70, speed: 70, total: 420 },
    };

    setTeam((prev) => {
      if (targetIndex !== null && targetIndex >= 0 && targetIndex < 6) {
        const next = [...prev];
        if (targetIndex < next.length) {
          next[targetIndex] = member;
        } else {
          next.push(member);
        }
        return next;
      }
      return [...prev, member];
    });

    showToast(`🌟 ${capitalize(pokemon.name)} adicionado ao time!`, 'success');
    return true;
  };

  const removeFromTeam = (index) => {
    setTeam((prev) => {
      const removed = prev[index];
      if (removed) {
        showToast(`${capitalize(removed.name)} removido do time.`, 'info');
      }
      return prev.filter((_, i) => i !== index);
    });
  };

  const clearTeam = () => {
    if (team.length === 0) return;
    setTeam([]);
    showToast('Time limpo com sucesso!', 'info');
  };

  const reorderTeam = (fromIndex, toIndex) => {
    if (fromIndex === toIndex) return;
    setTeam((prev) => {
      const next = [...prev];
      const [movedItem] = next.splice(fromIndex, 1);
      next.splice(toIndex, 0, movedItem);
      return next;
    });
  };

  const isPokemonInTeam = (id) => {
    return team.some((p) => p.id === id);
  };

  // Team defensive matrix & statistics analysis
  const teamAnalysis = useMemo(() => {
    if (team.length === 0) {
      return {
        averageStats: { hp: 0, attack: 0, defense: 0, specialAttack: 0, specialDefense: 0, speed: 0, total: 0 },
        weaknesses: {},
        resistances: {},
        immunities: {},
        typesRepresented: [],
      };
    }

    const count = team.length;
    const totals = { hp: 0, attack: 0, defense: 0, specialAttack: 0, specialDefense: 0, speed: 0, total: 0 };

    team.forEach((p) => {
      if (p.stats) {
        totals.hp += p.stats.hp || 70;
        totals.attack += p.stats.attack || 70;
        totals.defense += p.stats.defense || 70;
        totals.specialAttack += p.stats.specialAttack || 70;
        totals.specialDefense += p.stats.specialDefense || 70;
        totals.speed += p.stats.speed || 70;
        totals.total += p.stats.total || 420;
      }
    });

    const averageStats = {
      hp: Math.round(totals.hp / count),
      attack: Math.round(totals.attack / count),
      defense: Math.round(totals.defense / count),
      specialAttack: Math.round(totals.specialAttack / count),
      specialDefense: Math.round(totals.specialDefense / count),
      speed: Math.round(totals.speed / count),
      total: Math.round(totals.total / count),
    };

    // Calculate weaknesses & resistances count for all attacking types
    const allTypes = Object.keys(POKEMON_TYPES);
    const weaknesses = {};
    const resistances = {};
    const immunities = {};
    const teamTypesSet = new Set();

    allTypes.forEach((attType) => {
      weaknesses[attType] = 0;
      resistances[attType] = 0;
      immunities[attType] = 0;
    });

    team.forEach((member) => {
      const mTypes = member.types || ['normal'];
      mTypes.forEach((t) => teamTypesSet.add(t));

      allTypes.forEach((attType) => {
        let mult = 1;
        mTypes.forEach((defType) => {
          const lowerDef = defType.toLowerCase();
          if (TYPE_CHART[attType] && TYPE_CHART[attType][lowerDef] !== undefined) {
            mult *= TYPE_CHART[attType][lowerDef];
          }
        });

        if (mult > 1) weaknesses[attType]++;
        else if (mult === 0) immunities[attType]++;
        else if (mult < 1) resistances[attType]++;
      });
    });

    return {
      averageStats,
      weaknesses,
      resistances,
      immunities,
      typesRepresented: Array.from(teamTypesSet),
    };
  }, [team]);

  return (
    <TeamContext.Provider
      value={{
        team,
        addToTeam,
        removeFromTeam,
        clearTeam,
        reorderTeam,
        isPokemonInTeam,
        teamAnalysis,
        toastMessage,
        showToast,
      }}
    >
      {children}
    </TeamContext.Provider>
  );
}

export function useTeam() {
  const context = useContext(TeamContext);
  if (!context) {
    throw new Error('useTeam must be used within a TeamProvider');
  }
  return context;
}

function capitalize(str) {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
}
