// Cliente de integração com a API REST desenvolvida em Haskell com Servant
const HASKELL_API_BASE = 'http://localhost:8080';

export async function checkBackendHealth() {
  try {
    const res = await fetch(`${HASKELL_API_BASE}/health`, { method: 'GET' });
    if (!res.ok) return { online: false };
    const data = await res.json();
    return { online: true, ...data };
  } catch (err) {
    return { online: false, error: err.message };
  }
}

export async function fetchAllPokemonFromBackend() {
  const res = await fetch(`${HASKELL_API_BASE}/pokemon`);
  if (!res.ok) throw new Error('Falha ao listar Pokémon do backend Haskell');
  return await res.json();
}

export async function fetchPokemonByIdFromBackend(id) {
  const res = await fetch(`${HASKELL_API_BASE}/pokemon/${id}`);
  if (!res.ok) throw new Error(`Pokémon #${id} não encontrado no backend`);
  return await res.json();
}

export async function searchPokemonFromBackend(query) {
  const res = await fetch(`${HASKELL_API_BASE}/pokemon/search/${encodeURIComponent(query)}`);
  if (!res.ok) throw new Error('Falha na busca de Pokémon pelo backend');
  return await res.json();
}

export async function filterPokemonByTypeFromBackend(type) {
  const res = await fetch(`${HASKELL_API_BASE}/pokemon/type/${encodeURIComponent(type)}`);
  if (!res.ok) throw new Error('Falha no filtro por tipo pelo backend');
  return await res.json();
}

export async function fetchTeamsFromBackend() {
  const res = await fetch(`${HASKELL_API_BASE}/teams`);
  if (!res.ok) throw new Error('Falha ao buscar times no backend');
  return await res.json();
}

export async function createTeamInBackend(teamName) {
  const res = await fetch(`${HASKELL_API_BASE}/teams`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: teamName }),
  });
  if (!res.ok) {
    const errText = await res.text();
    throw new Error(errText || 'Falha ao criar time no backend');
  }
  return await res.json();
}

export async function addPokemonToTeamInBackend(teamId, pokemonId) {
  const res = await fetch(`${HASKELL_API_BASE}/teams/${teamId}/pokemon`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ targetPokemonId: pokemonId }),
  });
  if (!res.ok) {
    const errText = await res.text();
    throw new Error(errText || 'Falha ao adicionar integrante ao time');
  }
  return await res.json();
}

export async function removePokemonFromTeamInBackend(teamId, pokemonId) {
  const res = await fetch(`${HASKELL_API_BASE}/teams/${teamId}/pokemon/${pokemonId}`, {
    method: 'DELETE',
  });
  if (!res.ok) {
    const errText = await res.text();
    throw new Error(errText || 'Falha ao remover integrante do time');
  }
  return await res.json();
}
