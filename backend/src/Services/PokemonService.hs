module Services.PokemonService
  ( searchPokemon
  , searchPokemonList
  , filterByType
  , sortByAttack
  , findById
  , toLowerString
  ) where

import Models.Pokemon (Pokemon(..))
import Data.Char (toLower)

-- | Converte uma String para minúsculo usando a Higher-Order Function 'map'
toLowerString :: String -> String
toLowerString = map toLower

-- | Pesquisa um Pokémon pelo nome exato (case-insensitive).
-- Demonstra:
-- 1. Pattern Matching em listas ([] e x:xs)
-- 2. Guardas (guarded equations com |)
-- 3. Uso do tipo Maybe para tratamento seguro de ausência de valor (Just / Nothing)
-- 4. Recursividade pura
searchPokemon :: String -> [Pokemon] -> Maybe Pokemon
searchPokemon _ [] = Nothing
searchPokemon query (p:ps)
  | toLowerString query == toLowerString (pokemonName p) = Just p
  | otherwise = searchPokemon query ps

-- | Busca por Pokémon contendo o termo pesquisado em seu nome.
-- Demonstra:
-- 1. Higher-Order Function 'filter'
-- 2. Expressão lambda e composição de funções
searchPokemonList :: String -> [Pokemon] -> [Pokemon]
searchPokemonList query = filter matches
  where
    cleanQuery = toLowerString query
    matches p = cleanQuery `isSubstringOf` toLowerString (pokemonName p)

-- | Verifica se uma string está contida em outra (Recursividade e Pattern Matching)
isSubstringOf :: String -> String -> Bool
isSubstringOf [] _ = True
isSubstringOf _ [] = False
isSubstringOf needle haystack@(h:hs)
  | needle `isPrefixOf` haystack = True
  | otherwise = needle `isSubstringOf` hs

-- | Verifica se uma lista é prefixo de outra
isPrefixOf :: Eq a => [a] -> [a] -> Bool
isPrefixOf [] _ = True
isPrefixOf _ [] = False
isPrefixOf (x:xs) (y:ys) = (x == y) && isPrefixOf xs ys

-- | Filtra Pokémon pertencentes a um determinado tipo.
-- Demonstra:
-- 1. Higher-Order Function 'filter'
-- 2. Uso de 'elem' e 'map'
filterByType :: String -> [Pokemon] -> [Pokemon]
filterByType targetType = filter hasType
  where
    normalizedTarget = toLowerString targetType
    hasType p = normalizedTarget `elem` map toLowerString (types p)

-- | Ordena uma lista de Pokémon pelo atributo de Ataque (ordem decrescente).
-- Demonstra:
-- 1. Recursividade pura baseada no algoritmo Quicksort
-- 2. Pattern Matching
-- 3. Higher-Order Function 'filter'
sortByAttack :: [Pokemon] -> [Pokemon]
sortByAttack [] = []
sortByAttack (p:ps) =
  let greaterOrEqual = filter (\x -> attack x >= attack p) ps
      smaller        = filter (\x -> attack x < attack p) ps
  in sortByAttack greaterOrEqual ++ [p] ++ sortByAttack smaller

-- | Busca um Pokémon pelo seu ID numérico utilizando Maybe e Pattern Matching
findById :: Int -> [Pokemon] -> Maybe Pokemon
findById _ [] = Nothing
findById targetId (p:ps)
  | pokemonId p == targetId = Just p
  | otherwise = findById targetId ps
