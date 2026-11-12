module Main (main) where

import Models.Pokemon
import Models.Team
import Services.PokemonService
import Services.TeamService
import System.Exit (exitFailure, exitSuccess)
import System.IO (hSetEncoding, stdout, stderr, utf8)

-- Dados de teste para Pokemon
pPikachu :: Pokemon
pPikachu = Pokemon 25 "pikachu" 35 55 40 50 50 90 "img/25.png" ["electric"]

pCharizard :: Pokemon
pCharizard = Pokemon 6 "charizard" 78 84 78 109 85 100 "img/6.png" ["fire", "flying"]

pBlastoise :: Pokemon
pBlastoise = Pokemon 9 "blastoise" 79 83 100 85 105 78 "img/9.png" ["water"]

pVenusaur :: Pokemon
pVenusaur = Pokemon 3 "venusaur" 80 82 83 100 100 80 "img/3.png" ["grass", "poison"]

pGengar :: Pokemon
pGengar = Pokemon 94 "gengar" 60 65 60 130 75 110 "img/94.png" ["ghost", "poison"]

pDragonite :: Pokemon
pDragonite = Pokemon 149 "dragonite" 91 134 95 100 100 80 "img/149.png" ["dragon", "flying"]

pMewtwo :: Pokemon
pMewtwo = Pokemon 150 "mewtwo" 106 110 90 154 90 130 "img/150.png" ["psychic"]

allSamplePokemon :: [Pokemon]
allSamplePokemon = [pPikachu, pCharizard, pBlastoise, pVenusaur, pGengar, pDragonite, pMewtwo]

initialTeam :: Team
initialTeam = Team 1 "Kanto Dream Team" [pPikachu, pCharizard]

fullTeam :: Team
fullTeam = Team 2 "Full Team" [pPikachu, pCharizard, pBlastoise, pVenusaur, pGengar, pDragonite]

main :: IO ()
main = do
  hSetEncoding stdout utf8
  hSetEncoding stderr utf8

  putStrLn "=========================================================="
  putStrLn "   POKETEAM - TESTES ACADEMICOS DAS REGRAS DE NEGOCIO     "
  putStrLn "=========================================================="

  -- Cenario 1: Adicionar um Pokemon ao time
  putStrLn "\n[Cenario 1] Adicionar um Pokemon valido ao time:"
  case addPokemonToTeam pBlastoise initialTeam of
    Right updated -> do
      putStrLn $ "  [OK] Sucesso: Adicionado " ++ pokemonName pBlastoise ++ ". Integrantes: " ++ show (teamSize (members updated))
    Left err -> do
      putStrLn $ "  [ERRO] Falha inesperada: " ++ show err
      exitFailure

  -- Cenario 2: Tentar adicionar um setimo integrante a um time completo
  putStrLn "\n[Cenario 2] Tentar adicionar um setimo Pokemon (Limite de 6):"
  case addPokemonToTeam pMewtwo fullTeam of
    Left TeamFullError ->
      putStrLn "  [OK] Sucesso: Bloqueado corretamente com 'TeamFullError'!"
    other -> do
      putStrLn $ "  [ERRO] Falha: Esperava-se TeamFullError, mas obteve: " ++ show other
      exitFailure

  -- Cenario 3: Tentar adicionar um Pokemon duplicado
  putStrLn "\n[Cenario 3] Tentar adicionar um Pokemon ja presente no time:"
  case addPokemonToTeam pPikachu initialTeam of
    Left (DuplicatePokemonError pId) ->
      putStrLn $ "  [OK] Sucesso: Bloqueado duplicata do Pokemon ID #" ++ show pId
    other -> do
      putStrLn $ "  [ERRO] Falha: Esperava-se DuplicatePokemonError, obteve: " ++ show other
      exitFailure

  -- Cenario 4: Remover um Pokemon existente
  putStrLn "\n[Cenario 4] Remover um Pokemon existente (Charizard ID #6):"
  let teamAfterRemove = removePokemonFromTeam 6 initialTeam
  if teamSize (members teamAfterRemove) == 1 && not (isPokemonInTeam 6 (members teamAfterRemove))
    then putStrLn "  [OK] Sucesso: Pokemon removido. Restou apenas Pikachu no time."
    else do
      putStrLn "  [ERRO] Falha ao remover Pokemon."
      exitFailure

  -- Cenario 5: Pesquisar um Pokemon inexistente (Maybe)
  putStrLn "\n[Cenario 5] Pesquisar por Pokemon inexistente ('Agumon'):"
  case searchPokemon "Agumon" allSamplePokemon of
    Nothing ->
      putStrLn "  [OK] Sucesso: Retornou 'Nothing' como esperado para Pokemon inexistente."
    Just p -> do
      putStrLn $ "  [ERRO] Falha: Encontrou Pokemon inesperado: " ++ pokemonName p
      exitFailure

  -- Cenario 6: Calcular a media de ataque usando foldr e higher-order functions
  putStrLn "\n[Cenario 6] Calcular media de ataque do time inicial:"
  let avgAtk = averageAttack (members initialTeam) -- (55 + 84) / 2 = 69.5
  putStrLn $ "  [OK] Media de ataque calculada via foldr: " ++ show avgAtk ++ " (Esperado: 69.5)"
  if avgAtk == 69.5
    then putStrLn "  [OK] Calculo verificado com exatidao!"
    else do
      putStrLn "  [ERRO] Falha no calculo da media de ataque."
      exitFailure

  -- Cenario 7: Filtrar Pokemon por tipo (filterByType)
  putStrLn "\n[Cenario 7] Filtrar Pokemon por tipo ('flying'):"
  let flyingPokemon = filterByType "flying" allSamplePokemon
  let names = map pokemonName flyingPokemon
  putStrLn $ "  [OK] Pokemon voadores encontrados: " ++ show names
  if "charizard" `elem` names && "dragonite" `elem` names && length names == 2
    then putStrLn "  [OK] Filtro de tipagem verificado com sucesso!"
    else do
      putStrLn "  [ERRO] Falha no filtro por tipo."
      exitFailure

  putStrLn "\n=========================================================="
  putStrLn "   TODOS OS 7 CENARIOS DE TESTES PASSARAM COM SUCESSO!    "
  putStrLn "=========================================================="
  exitSuccess
