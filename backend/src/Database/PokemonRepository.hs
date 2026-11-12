{-# LANGUAGE CPP #-}
{-# LANGUAGE OverloadedStrings #-}
{-# LANGUAGE ScopedTypeVariables #-}

#ifdef USE_MYSQL

module Database.PokemonRepository
  ( getAllPokemon
  , getPokemonById
  , searchPokemonByName
  , getPokemonByType
  , getAllTeams
  , getTeamById
  , createTeam
  , addMemberToTeam
  , removeMemberFromTeam
  ) where

import Database.MySQL.Simple
import Database.MySQL.Simple.QueryParams
import Database.MySQL.Simple.QueryResults
import Models.Pokemon (Pokemon(..))
import Models.Team (Team(..))
import Data.List.Split (splitOn)
import Data.Int (Int64)

type PokemonRow = (Int, String, Int, Int, Int, Int, Int, Int, String, String)

rowToPokemon :: PokemonRow -> Pokemon
rowToPokemon (pId, pName, pHp, pAtk, pDef, pSpA, pSpD, pSpe, pImg, pTypesConcat) =
  Pokemon
    { pokemonId      = pId
    , pokemonName    = pName
    , hp             = pHp
    , attack         = pAtk
    , defense        = pDef
    , specialAttack  = pSpA
    , specialDefense = pSpD
    , speed          = pSpe
    , imageUrl       = pImg
    , types          = if null pTypesConcat then [] else splitOn "," pTypesConcat
    }

getAllPokemon :: Connection -> IO [Pokemon]
getAllPokemon conn = do
  let sql = "SELECT p.id, p.name, p.hp, p.attack, p.defense, p.special_attack, p.special_defense, " ++
            "p.speed, p.image_url, COALESCE(GROUP_CONCAT(t.name ORDER BY t.id), '') " ++
            "FROM pokemon p " ++
            "LEFT JOIN pokemon_type pt ON p.id = pt.pokemon_id " ++
            "LEFT JOIN pokemon_types t ON pt.type_id = t.id " ++
            "GROUP BY p.id ORDER BY p.id ASC"
  rows <- query_ conn (Query sql)
  return (map rowToPokemon rows)

getPokemonById :: Connection -> Int -> IO (Maybe Pokemon)
getPokemonById conn targetId = do
  let sql = "SELECT p.id, p.name, p.hp, p.attack, p.defense, p.special_attack, p.special_defense, " ++
            "p.speed, p.image_url, COALESCE(GROUP_CONCAT(t.name ORDER BY t.id), '') " ++
            "FROM pokemon p " ++
            "LEFT JOIN pokemon_type pt ON p.id = pt.pokemon_id " ++
            "LEFT JOIN pokemon_types t ON pt.type_id = t.id " ++
            "WHERE p.id = ? " ++
            "GROUP BY p.id"
  rows <- query conn (Query sql) (Only targetId)
  case rows of
    [r] -> return (Just (rowToPokemon r))
    _   -> return Nothing

searchPokemonByName :: Connection -> String -> IO [Pokemon]
searchPokemonByName conn queryStr = do
  let sql = "SELECT p.id, p.name, p.hp, p.attack, p.defense, p.special_attack, p.special_defense, " ++
            "p.speed, p.image_url, COALESCE(GROUP_CONCAT(t.name ORDER BY t.id), '') " ++
            "FROM pokemon p " ++
            "LEFT JOIN pokemon_type pt ON p.id = pt.pokemon_id " ++
            "LEFT JOIN pokemon_types t ON pt.type_id = t.id " ++
            "WHERE LOWER(p.name) LIKE LOWER(?) " ++
            "GROUP BY p.id ORDER BY p.id ASC"
  let pattern = "%" ++ queryStr ++ "%"
  rows <- query conn (Query sql) (Only pattern)
  return (map rowToPokemon rows)

getPokemonByType :: Connection -> String -> IO [Pokemon]
getPokemonByType conn typeQuery = do
  let sql = "SELECT p.id, p.name, p.hp, p.attack, p.defense, p.special_attack, p.special_defense, " ++
            "p.speed, p.image_url, COALESCE(GROUP_CONCAT(t.name ORDER BY t.id), '') " ++
            "FROM pokemon p " ++
            "JOIN pokemon_type pt ON p.id = pt.pokemon_id " ++
            "JOIN pokemon_types t ON pt.type_id = t.id " ++
            "WHERE LOWER(t.name) = LOWER(?) " ++
            "GROUP BY p.id ORDER BY p.id ASC"
  rows <- query conn (Query sql) (Only typeQuery)
  return (map rowToPokemon rows)

getAllTeams :: Connection -> IO [Team]
getAllTeams conn = do
  let sqlTeams = "SELECT id, name FROM teams ORDER BY id ASC"
  teamsRows :: [(Int, String)] <- query_ conn (Query sqlTeams)
  mapM (fetchTeamMembers conn) teamsRows

fetchTeamMembers :: Connection -> (Int, String) -> IO Team
fetchTeamMembers conn (tId, tName) = do
  let sqlMembers = "SELECT p.id, p.name, p.hp, p.attack, p.defense, p.special_attack, p.special_defense, " ++
                   "p.speed, p.image_url, COALESCE(GROUP_CONCAT(t.name ORDER BY t.id), '') " ++
                   "FROM team_pokemon tp " ++
                   "JOIN pokemon p ON tp.pokemon_id = p.id " ++
                   "LEFT JOIN pokemon_type pt ON p.id = pt.pokemon_id " ++
                   "LEFT JOIN pokemon_types t ON pt.type_id = t.id " ++
                   "WHERE tp.team_id = ? " ++
                   "GROUP BY p.id, tp.position ORDER BY tp.position ASC"
  rows <- query conn (Query sqlMembers) (Only tId)
  return (Team tId tName (map rowToPokemon rows))

getTeamById :: Connection -> Int -> IO (Maybe Team)
getTeamById conn tId = do
  let sql = "SELECT id, name FROM teams WHERE id = ?"
  rows :: [(Int, String)] <- query conn (Query sql) (Only tId)
  case rows of
    [teamRow] -> Just <$> fetchTeamMembers conn teamRow
    _         -> return Nothing

createTeam :: Connection -> String -> IO Team
createTeam conn tName = do
  let sql = "INSERT INTO teams (name) VALUES (?)"
  _ <- execute conn (Query sql) (Only tName)
  newId <- insertId conn
  return (Team (fromIntegral newId) tName [])

addMemberToTeam :: Connection -> Int -> Int -> Int -> IO ()
addMemberToTeam conn tId pId pos = do
  let sql = "INSERT INTO team_pokemon (team_id, pokemon_id, position) VALUES (?, ?, ?) " ++
            "ON DUPLICATE KEY UPDATE position = VALUES(position)"
  _ <- execute conn (Query sql) (tId, pId, pos)
  return ()

removeMemberFromTeam :: Connection -> Int -> Int -> IO ()
removeMemberFromTeam conn tId pId = do
  let sql = "DELETE FROM team_pokemon WHERE team_id = ? AND pokemon_id = ?"
  _ <- execute conn (Query sql) (tId, pId)
  return ()

insertId :: Connection -> IO Int64
insertId conn = do
  [Only lastId] <- query_ conn "SELECT LAST_INSERT_ID()"
  return lastId

#else

module Database.PokemonRepository where

-- Stub quando compilado sem MySQL
#endif
