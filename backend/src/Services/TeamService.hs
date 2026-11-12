module Services.TeamService
  ( addPokemonToTeam
  , removePokemonFromTeam
  , validateTeamLimit
  , averageAttack
  , averageDefense
  , averageSpeed
  , calculateTeamStats
  , isPokemonInTeam
  , teamSize
  ) where

import Models.Pokemon (Pokemon(..))
import Models.Team
  ( Team(..)
  , TeamStats(..)
  , TeamValidationError(..)
  )

-- | Limite máximo de integrantes permitido em um time Pokémon oficial
maxTeamMembers :: Int
maxTeamMembers = 6

-- | Retorna o tamanho atual do time utilizando recursão e pattern matching
teamSize :: [Pokemon] -> Int
teamSize [] = 0
teamSize (_:xs) = 1 + teamSize xs

-- | Verifica se um Pokémon com determinado ID já está presente no time
-- Demonstra 'any', 'map' e composição
isPokemonInTeam :: Int -> [Pokemon] -> Bool
isPokemonInTeam targetId = any (\p -> pokemonId p == targetId)

-- | Valida se o time pode receber um novo integrante.
-- Demonstra:
-- 1. Tipo algébrico 'Either' para tratamento robusto de erros sem exceções em tempo de execução
-- 2. Guardas
validateTeamLimit :: [Pokemon] -> Pokemon -> Either TeamValidationError ()
validateTeamLimit currentMembers newPokemon
  | teamSize currentMembers >= maxTeamMembers = Left TeamFullError
  | isPokemonInTeam (pokemonId newPokemon) currentMembers = Left (DuplicatePokemonError (pokemonId newPokemon))
  | otherwise = Right ()

-- | Adiciona um Pokémon ao time de forma pura e imutável.
-- Retorna Left com o erro de validação ou Right com o novo time atualizado.
-- Demonstra:
-- 1. Imutabilidade (o time original nunca é modificado; cria-se uma nova estrutura)
-- 2. Pattern Matching
-- 3. 'Either'
addPokemonToTeam :: Pokemon -> Team -> Either TeamValidationError Team
addPokemonToTeam newPokemon (Team tId tName currentMembers) =
  case validateTeamLimit currentMembers newPokemon of
    Left err -> Left err
    Right () -> Right (Team tId tName (currentMembers ++ [newPokemon]))

-- | Remove um Pokémon do time pelo seu ID numérico de forma pura.
-- Demonstra:
-- 1. Higher-Order Function 'filter'
-- 2. Imutabilidade
removePokemonFromTeam :: Int -> Team -> Team
removePokemonFromTeam pId (Team tId tName currentMembers) =
  let updatedMembers = filter (\p -> pokemonId p /= pId) currentMembers
  in Team tId tName updatedMembers

-- | Função genérica de alta ordem para calcular a média de qualquer atributo numérico
-- Demonstra:
-- 1. Higher-Order Function 'foldr' para agregação de valores
-- 2. 'map'
-- 3. Tratamento de divisão por zero (retorna 0.0 se a lista estiver vazia)
calculateAverageBy :: (Pokemon -> Int) -> [Pokemon] -> Double
calculateAverageBy _ [] = 0.0
calculateAverageBy statExtractor pokemonList =
  let totalSum = foldr (+) 0 (map statExtractor pokemonList)
      count    = fromIntegral (teamSize pokemonList)
  in fromIntegral totalSum / count

-- | Calcula a média de Ataque do time usando 'calculateAverageBy'
averageAttack :: [Pokemon] -> Double
averageAttack = calculateAverageBy attack

-- | Calcula a média de Defesa do time usando 'calculateAverageBy'
averageDefense :: [Pokemon] -> Double
averageDefense = calculateAverageBy defense

-- | Calcula a média de Velocidade do time usando 'calculateAverageBy'
averageSpeed :: [Pokemon] -> Double
averageSpeed = calculateAverageBy speed

-- | Calcula o relatório completo de estatísticas de um time
calculateTeamStats :: Team -> TeamStats
calculateTeamStats (Team _ _ currentMembers) =
  TeamStats
    { avgHp        = calculateAverageBy hp currentMembers
    , avgAttack    = calculateAverageBy attack currentMembers
    , avgDefense   = calculateAverageBy defense currentMembers
    , avgSpAtk     = calculateAverageBy specialAttack currentMembers
    , avgSpDef     = calculateAverageBy specialDefense currentMembers
    , avgSpeed     = calculateAverageBy speed currentMembers
    , totalMembers = teamSize currentMembers
    }
