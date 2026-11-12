module Database.InMemoryRepository
  ( InMemoryState
  , newInMemoryState
  , getAllPokemonMem
  , getPokemonByIdMem
  , searchPokemonByNameMem
  , getPokemonByTypeMem
  , getAllTeamsMem
  , getTeamByIdMem
  , createTeamMem
  , addMemberToTeamMem
  , removeMemberFromTeamMem
  ) where

import Data.IORef
import Models.Pokemon (Pokemon(..))
import Models.Team (Team(..), TeamValidationError(..))
import qualified Services.PokemonService as PokeService
import qualified Services.TeamService as TeamService

-- | Estado em memória para persistência volátil (sem necessidade de MySQL instalado)
data InMemoryState = InMemoryState
  { pokemonCatalog :: [Pokemon]
  , teamsRef       :: IORef [Team]
  , nextTeamIdRef  :: IORef Int
  }

-- | Catálogo inicial com os 151 Pokémon da 1ª Geração
catalog151 :: [Pokemon]
catalog151 =
  [ Pokemon 1 "bulbasaur" 45 49 49 65 65 45 "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/1.png" ["grass", "poison"]
  , Pokemon 2 "ivysaur" 60 62 63 80 80 60 "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/2.png" ["grass", "poison"]
  , Pokemon 3 "venusaur" 80 82 83 100 100 80 "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/3.png" ["grass", "poison"]
  , Pokemon 4 "charmander" 39 52 43 60 50 65 "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/4.png" ["fire"]
  , Pokemon 5 "charmeleon" 58 64 58 80 65 80 "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/5.png" ["fire"]
  , Pokemon 6 "charizard" 78 84 78 109 85 100 "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/6.png" ["fire", "flying"]
  , Pokemon 7 "squirtle" 44 48 65 50 64 43 "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/7.png" ["water"]
  , Pokemon 8 "wartortle" 59 63 80 65 80 58 "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/8.png" ["water"]
  , Pokemon 9 "blastoise" 79 83 100 85 105 78 "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/9.png" ["water"]
  , Pokemon 10 "caterpie" 45 30 35 20 20 45 "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/10.png" ["bug"]
  , Pokemon 11 "metapod" 50 20 55 25 25 30 "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/11.png" ["bug"]
  , Pokemon 12 "butterfree" 60 45 50 90 80 70 "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/12.png" ["bug", "flying"]
  , Pokemon 13 "weedle" 40 35 30 20 20 50 "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/13.png" ["bug", "poison"]
  , Pokemon 14 "kakuna" 45 25 50 25 25 35 "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/14.png" ["bug", "poison"]
  , Pokemon 15 "beedrill" 65 90 40 45 80 75 "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/15.png" ["bug", "poison"]
  , Pokemon 16 "pidgey" 40 45 40 35 35 56 "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/16.png" ["normal", "flying"]
  , Pokemon 17 "pidgeotto" 63 60 55 50 50 71 "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/17.png" ["normal", "flying"]
  , Pokemon 18 "pidgeot" 83 80 75 70 70 101 "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/18.png" ["normal", "flying"]
  , Pokemon 19 "rattata" 30 56 35 25 35 72 "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/19.png" ["normal"]
  , Pokemon 20 "raticate" 55 81 60 50 70 97 "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/20.png" ["normal"]
  , Pokemon 21 "spearow" 40 60 30 31 31 70 "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/21.png" ["normal", "flying"]
  , Pokemon 22 "fearow" 65 90 65 61 61 100 "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/22.png" ["normal", "flying"]
  , Pokemon 23 "ekans" 35 60 44 40 54 55 "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/23.png" ["poison"]
  , Pokemon 24 "arbok" 60 95 69 65 79 80 "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/24.png" ["poison"]
  , Pokemon 25 "pikachu" 35 55 40 50 50 90 "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/25.png" ["electric"]
  , Pokemon 26 "raichu" 60 90 55 90 80 110 "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/26.png" ["electric"]
  , Pokemon 27 "sandshrew" 50 75 85 20 30 40 "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/27.png" ["ground"]
  , Pokemon 28 "sandslash" 75 100 110 45 55 65 "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/28.png" ["ground"]
  , Pokemon 29 "nidoran-f" 55 47 52 40 40 41 "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/29.png" ["poison"]
  , Pokemon 30 "nidorina" 70 62 67 55 55 56 "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/30.png" ["poison"]
  , Pokemon 31 "nidoqueen" 90 92 87 75 85 76 "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/31.png" ["poison", "ground"]
  , Pokemon 32 "nidoran-m" 46 57 40 40 40 50 "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/32.png" ["poison"]
  , Pokemon 33 "nidorino" 61 72 57 55 55 65 "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/33.png" ["poison"]
  , Pokemon 34 "nidoking" 81 102 77 85 75 85 "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/34.png" ["poison", "ground"]
  , Pokemon 35 "clefairy" 70 45 48 60 65 35 "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/35.png" ["fairy"]
  , Pokemon 36 "clefable" 95 70 73 95 90 60 "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/36.png" ["fairy"]
  , Pokemon 37 "vulpix" 38 41 40 50 65 65 "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/37.png" ["fire"]
  , Pokemon 38 "ninetales" 73 76 75 81 100 100 "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/38.png" ["fire"]
  , Pokemon 39 "jigglypuff" 115 45 20 45 25 20 "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/39.png" ["normal", "fairy"]
  , Pokemon 40 "wigglytuff" 140 70 45 85 50 45 "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/40.png" ["normal", "fairy"]
  , Pokemon 41 "zubat" 40 45 35 30 40 55 "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/41.png" ["poison", "flying"]
  , Pokemon 42 "golbat" 75 80 70 65 75 90 "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/42.png" ["poison", "flying"]
  , Pokemon 43 "oddish" 45 50 55 75 65 30 "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/43.png" ["grass", "poison"]
  , Pokemon 44 "gloom" 60 65 70 85 75 40 "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/44.png" ["grass", "poison"]
  , Pokemon 45 "vileplume" 75 80 85 110 90 50 "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/45.png" ["grass", "poison"]
  , Pokemon 46 "paras" 35 70 55 45 55 25 "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/46.png" ["bug", "grass"]
  , Pokemon 47 "parasect" 60 95 80 60 80 30 "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/47.png" ["bug", "grass"]
  , Pokemon 48 "venonat" 60 55 50 40 55 45 "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/48.png" ["bug", "poison"]
  , Pokemon 49 "venomoth" 70 65 60 90 75 90 "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/49.png" ["bug", "poison"]
  , Pokemon 50 "diglett" 10 55 25 35 45 95 "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/50.png" ["ground"]
  , Pokemon 51 "dugtrio" 35 100 50 50 70 120 "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/51.png" ["ground"]
  , Pokemon 52 "meowth" 40 45 35 40 40 90 "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/52.png" ["normal"]
  , Pokemon 53 "persian" 65 70 60 65 65 115 "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/53.png" ["normal"]
  , Pokemon 54 "psyduck" 50 52 48 65 50 55 "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/54.png" ["water"]
  , Pokemon 55 "golduck" 80 82 78 95 80 85 "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/55.png" ["water"]
  , Pokemon 56 "mankey" 40 80 35 35 45 70 "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/56.png" ["fighting"]
  , Pokemon 57 "primeape" 65 105 60 60 70 95 "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/57.png" ["fighting"]
  , Pokemon 58 "growlithe" 55 70 45 70 50 60 "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/58.png" ["fire"]
  , Pokemon 59 "arcanine" 90 110 80 100 80 95 "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/59.png" ["fire"]
  , Pokemon 60 "poliwag" 40 50 40 40 40 90 "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/60.png" ["water"]
  , Pokemon 61 "poliwhirl" 65 65 65 50 50 90 "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/61.png" ["water"]
  , Pokemon 62 "poliwrath" 90 95 95 70 90 70 "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/62.png" ["water", "fighting"]
  , Pokemon 63 "abra" 25 20 15 105 55 90 "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/63.png" ["psychic"]
  , Pokemon 64 "kadabra" 40 35 30 120 70 105 "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/64.png" ["psychic"]
  , Pokemon 65 "alakazam" 55 50 45 135 95 120 "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/65.png" ["psychic"]
  , Pokemon 66 "machop" 70 80 50 35 35 35 "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/66.png" ["fighting"]
  , Pokemon 67 "machoke" 80 100 70 50 60 45 "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/67.png" ["fighting"]
  , Pokemon 68 "machamp" 90 130 80 65 85 55 "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/68.png" ["fighting"]
  , Pokemon 69 "bellsprout" 50 75 35 70 30 40 "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/69.png" ["grass", "poison"]
  , Pokemon 70 "weepinbell" 65 90 50 85 45 55 "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/70.png" ["grass", "poison"]
  , Pokemon 71 "victreebel" 80 105 65 100 70 70 "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/71.png" ["grass", "poison"]
  , Pokemon 72 "tentacool" 40 40 35 50 100 70 "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/72.png" ["water", "poison"]
  , Pokemon 73 "tentacruel" 80 70 65 80 120 100 "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/73.png" ["water", "poison"]
  , Pokemon 74 "geodude" 40 80 100 30 30 20 "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/74.png" ["rock", "ground"]
  , Pokemon 75 "graveler" 55 95 115 45 45 35 "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/75.png" ["rock", "ground"]
  , Pokemon 76 "golem" 80 120 130 55 65 45 "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/76.png" ["rock", "ground"]
  , Pokemon 77 "ponyta" 50 85 55 65 65 90 "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/77.png" ["fire"]
  , Pokemon 78 "rapidash" 65 100 70 80 80 105 "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/78.png" ["fire"]
  , Pokemon 79 "slowpoke" 90 65 65 40 40 15 "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/79.png" ["water", "psychic"]
  , Pokemon 80 "slowbro" 95 75 110 100 80 30 "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/80.png" ["water", "psychic"]
  , Pokemon 81 "magnemite" 25 35 70 95 55 45 "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/81.png" ["electric", "steel"]
  , Pokemon 82 "magneton" 50 60 95 120 70 70 "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/82.png" ["electric", "steel"]
  , Pokemon 83 "farfetchd" 52 90 55 58 62 60 "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/83.png" ["normal", "flying"]
  , Pokemon 84 "doduo" 35 85 45 35 35 75 "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/84.png" ["normal", "flying"]
  , Pokemon 85 "dodrio" 60 110 70 60 60 110 "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/85.png" ["normal", "flying"]
  , Pokemon 86 "seel" 65 45 55 45 70 45 "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/86.png" ["water"]
  , Pokemon 87 "dewgong" 90 70 80 70 95 70 "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/87.png" ["water", "ice"]
  , Pokemon 88 "grimer" 80 80 50 40 50 25 "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/88.png" ["poison"]
  , Pokemon 89 "muk" 105 105 75 65 100 50 "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/89.png" ["poison"]
  , Pokemon 90 "shellder" 30 65 100 45 25 40 "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/90.png" ["water"]
  , Pokemon 91 "cloyster" 50 95 180 85 45 70 "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/91.png" ["water", "ice"]
  , Pokemon 92 "gastly" 30 35 30 100 35 80 "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/92.png" ["ghost", "poison"]
  , Pokemon 93 "haunter" 45 50 45 115 55 95 "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/93.png" ["ghost", "poison"]
  , Pokemon 94 "gengar" 60 65 60 130 75 110 "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/94.png" ["ghost", "poison"]
  , Pokemon 95 "onix" 35 45 160 30 45 70 "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/95.png" ["rock", "ground"]
  , Pokemon 96 "drowzee" 60 48 45 43 90 42 "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/96.png" ["psychic"]
  , Pokemon 97 "hypno" 85 73 70 73 115 67 "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/97.png" ["psychic"]
  , Pokemon 98 "krabby" 30 105 90 25 25 50 "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/98.png" ["water"]
  , Pokemon 99 "kingler" 55 130 115 50 50 75 "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/99.png" ["water"]
  , Pokemon 100 "voltorb" 40 30 50 55 55 100 "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/100.png" ["electric"]
  , Pokemon 101 "electrode" 60 50 70 80 80 150 "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/101.png" ["electric"]
  , Pokemon 102 "exeggcute" 60 40 80 60 45 40 "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/102.png" ["grass", "psychic"]
  , Pokemon 103 "exeggutor" 95 95 85 125 75 55 "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/103.png" ["grass", "psychic"]
  , Pokemon 104 "cubone" 50 50 95 40 50 35 "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/104.png" ["ground"]
  , Pokemon 105 "marowak" 60 80 110 50 80 45 "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/105.png" ["ground"]
  , Pokemon 106 "hitmonlee" 50 120 53 35 110 87 "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/106.png" ["fighting"]
  , Pokemon 107 "hitmonchan" 50 105 79 35 110 76 "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/107.png" ["fighting"]
  , Pokemon 108 "lickitung" 90 55 75 60 75 30 "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/108.png" ["normal"]
  , Pokemon 109 "koffing" 40 65 95 60 45 35 "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/109.png" ["poison"]
  , Pokemon 110 "weezing" 65 90 120 85 70 60 "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/110.png" ["poison"]
  , Pokemon 111 "rhyhorn" 80 85 95 30 30 25 "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/111.png" ["ground", "rock"]
  , Pokemon 112 "rhydon" 105 130 120 45 45 40 "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/112.png" ["ground", "rock"]
  , Pokemon 113 "chansey" 250 5 5 35 105 50 "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/113.png" ["normal"]
  , Pokemon 114 "tangela" 65 55 115 100 40 60 "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/114.png" ["grass"]
  , Pokemon 115 "kangaskhan" 105 95 80 40 80 90 "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/115.png" ["normal"]
  , Pokemon 116 "horsea" 30 40 70 70 25 60 "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/116.png" ["water"]
  , Pokemon 117 "seadra" 55 65 95 95 45 85 "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/117.png" ["water"]
  , Pokemon 118 "goldeen" 45 67 60 35 50 63 "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/118.png" ["water"]
  , Pokemon 119 "seaking" 80 92 65 65 80 68 "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/119.png" ["water"]
  , Pokemon 120 "staryu" 30 45 55 70 55 85 "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/120.png" ["water"]
  , Pokemon 121 "starmie" 60 75 85 100 85 115 "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/121.png" ["water", "psychic"]
  , Pokemon 122 "mr-mime" 40 45 65 100 120 90 "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/122.png" ["psychic", "fairy"]
  , Pokemon 123 "scyther" 70 110 80 55 80 105 "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/123.png" ["bug", "flying"]
  , Pokemon 124 "jynx" 65 50 35 115 95 95 "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/124.png" ["ice", "psychic"]
  , Pokemon 125 "electabuzz" 65 83 57 95 85 105 "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/125.png" ["electric"]
  , Pokemon 126 "magmar" 65 95 57 100 85 93 "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/126.png" ["fire"]
  , Pokemon 127 "pinsir" 65 125 100 55 70 85 "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/127.png" ["bug"]
  , Pokemon 128 "tauros" 75 100 95 40 70 110 "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/128.png" ["normal"]
  , Pokemon 129 "magikarp" 20 10 55 15 20 80 "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/129.png" ["water"]
  , Pokemon 130 "gyarados" 95 125 79 60 100 81 "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/130.png" ["water", "flying"]
  , Pokemon 131 "lapras" 130 85 80 85 95 60 "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/131.png" ["water", "ice"]
  , Pokemon 132 "ditto" 48 48 48 48 48 48 "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/132.png" ["normal"]
  , Pokemon 133 "eevee" 55 55 50 45 65 55 "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/133.png" ["normal"]
  , Pokemon 134 "vaporeon" 130 65 60 110 95 65 "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/134.png" ["water"]
  , Pokemon 135 "jolteon" 65 65 60 110 95 130 "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/135.png" ["electric"]
  , Pokemon 136 "flareon" 65 130 60 95 110 65 "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/136.png" ["fire"]
  , Pokemon 137 "porygon" 65 60 70 85 75 40 "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/137.png" ["normal"]
  , Pokemon 138 "omanyte" 35 40 100 90 55 35 "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/138.png" ["rock", "water"]
  , Pokemon 139 "omastar" 70 60 125 115 70 55 "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/139.png" ["rock", "water"]
  , Pokemon 140 "kabuto" 30 80 90 55 45 55 "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/140.png" ["rock", "water"]
  , Pokemon 141 "kabutops" 60 115 105 65 70 80 "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/141.png" ["rock", "water"]
  , Pokemon 142 "aerodactyl" 80 105 65 60 75 130 "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/142.png" ["rock", "flying"]
  , Pokemon 143 "snorlax" 160 110 65 65 110 30 "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/143.png" ["normal"]
  , Pokemon 144 "articuno" 90 85 100 95 125 85 "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/144.png" ["ice", "flying"]
  , Pokemon 145 "zapdos" 90 90 85 125 90 100 "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/145.png" ["electric", "flying"]
  , Pokemon 146 "moltres" 90 100 90 125 85 90 "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/146.png" ["fire", "flying"]
  , Pokemon 147 "dratini" 41 64 45 50 50 50 "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/147.png" ["dragon"]
  , Pokemon 148 "dragonair" 61 84 65 70 70 70 "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/148.png" ["dragon"]
  , Pokemon 149 "dragonite" 91 134 95 100 100 80 "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/149.png" ["dragon", "flying"]
  , Pokemon 150 "mewtwo" 106 110 90 154 90 130 "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/150.png" ["psychic"]
  , Pokemon 151 "mew" 100 100 100 100 100 100 "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/151.png" ["psychic"]
  ]

-- | Cria um novo estado inicial em memória
newInMemoryState :: IO InMemoryState
newInMemoryState = do
  let initialTeam = Team 1 "Kanto Champions" [catalog151 !! 24, catalog151 !! 5, catalog151 !! 8] -- Pikachu, Charizard, Blastoise
  tRef <- newIORef [initialTeam]
  idRef <- newIORef 2
  return $ InMemoryState catalog151 tRef idRef

getAllPokemonMem :: InMemoryState -> IO [Pokemon]
getAllPokemonMem state = return (pokemonCatalog state)

getPokemonByIdMem :: InMemoryState -> Int -> IO (Maybe Pokemon)
getPokemonByIdMem state pId = return (PokeService.findById pId (pokemonCatalog state))

searchPokemonByNameMem :: InMemoryState -> String -> IO [Pokemon]
searchPokemonByNameMem state queryStr = return (PokeService.searchPokemonList queryStr (pokemonCatalog state))

getPokemonByTypeMem :: InMemoryState -> String -> IO [Pokemon]
getPokemonByTypeMem state t = return (PokeService.filterByType t (pokemonCatalog state))

getAllTeamsMem :: InMemoryState -> IO [Team]
getAllTeamsMem state = readIORef (teamsRef state)

getTeamByIdMem :: InMemoryState -> Int -> IO (Maybe Team)
getTeamByIdMem state tId = do
  allT <- readIORef (teamsRef state)
  case filter (\t -> teamId t == tId) allT of
    (t:_) -> return (Just t)
    []    -> return Nothing

createTeamMem :: InMemoryState -> String -> IO Team
createTeamMem state tName = do
  newId <- atomicModifyIORef' (nextTeamIdRef state) (\cur -> (cur + 1, cur))
  let newTeam = Team newId tName []
  atomicModifyIORef' (teamsRef state) (\cur -> (cur ++ [newTeam], ()))
  return newTeam

addMemberToTeamMem :: InMemoryState -> Int -> Pokemon -> IO (Either TeamValidationError Team)
addMemberToTeamMem state tId newP = do
  mTeam <- getTeamByIdMem state tId
  case mTeam of
    Nothing -> return (Left (PokemonNotFoundError tId))
    Just curTeam ->
      case TeamService.addPokemonToTeam newP curTeam of
        Left err -> return (Left err)
        Right updatedTeam -> do
          atomicModifyIORef' (teamsRef state) (\allT ->
            (map (\t -> if teamId t == tId then updatedTeam else t) allT, ()))
          return (Right updatedTeam)

removeMemberFromTeamMem :: InMemoryState -> Int -> Int -> IO (Maybe Team)
removeMemberFromTeamMem state tId pId = do
  mTeam <- getTeamByIdMem state tId
  case mTeam of
    Nothing -> return Nothing
    Just curTeam -> do
      let updatedTeam = TeamService.removePokemonFromTeam pId curTeam
      atomicModifyIORef' (teamsRef state) (\allT ->
        (map (\t -> if teamId t == tId then updatedTeam else t) allT, ()))
      return (Just updatedTeam)
