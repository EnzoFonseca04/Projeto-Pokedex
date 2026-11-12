{-# LANGUAGE CPP #-}
{-# LANGUAGE DataKinds #-}
{-# LANGUAGE TypeOperators #-}
{-# LANGUAGE DeriveGeneric #-}
{-# LANGUAGE OverloadedStrings #-}

module API.Routes
  ( PokeTeamAPI
  , pokeTeamApi
  , server
  , app
  , HealthResponse(..)
  , BackendContext(..)
  ) where

import Servant
import Models.Pokemon (Pokemon(..))
import Models.Team
  ( Team(..)
  , CreateTeamRequest(..)
  , AddPokemonRequest(..)
  , TeamValidationError(..)
  )
import qualified Database.InMemoryRepository as MemRepo
import qualified Services.TeamService as TeamService
import qualified Services.PokemonService as PokeService
import Data.Aeson (ToJSON, FromJSON)
import GHC.Generics (Generic)
import Control.Monad.IO.Class (liftIO)
import Network.Wai (Application)
import Network.Wai.Middleware.Cors (simpleCors)

#ifdef USE_MYSQL
import qualified Database.PokemonRepository as Repo
import Database.Connection (withDatabase)
#endif

-- | Modo de persistência do backend
data BackendContext
  = MySqlContext
  | InMemoryContext MemRepo.InMemoryState

-- | Resposta do endpoint de health check
data HealthResponse = HealthResponse
  { status  :: String
  , message :: String
  , backend :: String
  , version :: String
  } deriving (Show, Eq, Generic)

instance ToJSON HealthResponse
instance FromJSON HealthResponse

-- | Definição dos endpoints REST utilizando Servant (Type-Level API)
type PokeTeamAPI =
       "health" :> Get '[JSON] HealthResponse
  :<|> "pokemon" :> Get '[JSON] [Pokemon]
  :<|> "pokemon" :> Capture "id" Int :> Get '[JSON] Pokemon
  :<|> "pokemon" :> "search" :> Capture "name" String :> Get '[JSON] [Pokemon]
  :<|> "pokemon" :> "type" :> Capture "type" String :> Get '[JSON] [Pokemon]
  :<|> "teams" :> Get '[JSON] [Team]
  :<|> "teams" :> ReqBody '[JSON] CreateTeamRequest :> Post '[JSON] Team
  :<|> "teams" :> Capture "id" Int :> Get '[JSON] Team
  :<|> "teams" :> Capture "id" Int :> "pokemon" :> ReqBody '[JSON] AddPokemonRequest :> Post '[JSON] Team
  :<|> "teams" :> Capture "id" Int :> "pokemon" :> Capture "pokemonId" Int :> Delete '[JSON] Team

pokeTeamApi :: Proxy PokeTeamAPI
pokeTeamApi = Proxy

-- | Implementação dos Handlers da API Servant
server :: BackendContext -> Server PokeTeamAPI
server ctx =
       healthHandler ctx
  :<|> listAllPokemonHandler ctx
  :<|> getPokemonHandler ctx
  :<|> searchPokemonHandler ctx
  :<|> filterPokemonByTypeHandler ctx
  :<|> listTeamsHandler ctx
  :<|> createTeamHandler ctx
  :<|> getTeamHandler ctx
  :<|> addPokemonToTeamHandler ctx
  :<|> removePokemonFromTeamHandler ctx

-- | GET /health
healthHandler :: BackendContext -> Handler HealthResponse
healthHandler ctx = return HealthResponse
  { status  = "ok"
  , message = "PokéTeam Backend em Haskell com Servant operacional!"
  , backend = case ctx of
                MySqlContext       -> "MySQL Database"
                InMemoryContext _  -> "In-Memory Pure State (Zero Dependência C)"
  , version = "1.0.0"
  }

-- | GET /pokemon
listAllPokemonHandler :: BackendContext -> Handler [Pokemon]
#ifdef USE_MYSQL
listAllPokemonHandler MySqlContext = liftIO $ withDatabase Repo.getAllPokemon
#else
listAllPokemonHandler MySqlContext = liftIO $ error "MySQL não suportado nesta compilação."
#endif
listAllPokemonHandler (InMemoryContext mem) = liftIO $ MemRepo.getAllPokemonMem mem

-- | GET /pokemon/:id
getPokemonHandler :: BackendContext -> Int -> Handler Pokemon
getPokemonHandler ctx pId = do
  mPokemon <- liftIO $ case ctx of
#ifdef USE_MYSQL
    MySqlContext       -> withDatabase (\conn -> Repo.getPokemonById conn pId)
#else
    MySqlContext       -> error "MySQL não suportado nesta compilação."
#endif
    InMemoryContext m  -> MemRepo.getPokemonByIdMem m pId
  case mPokemon of
    Just p  -> return p
    Nothing -> throwError err404 { errBody = "Pokémon não encontrado com o ID especificado." }

-- | GET /pokemon/search/:name
searchPokemonHandler :: BackendContext -> String -> Handler [Pokemon]
searchPokemonHandler ctx query = liftIO $ case ctx of
#ifdef USE_MYSQL
  MySqlContext       -> withDatabase (\conn -> Repo.searchPokemonByName conn query)
#else
  MySqlContext       -> error "MySQL não suportado nesta compilação."
#endif
  InMemoryContext m  -> MemRepo.searchPokemonByNameMem m query

-- | GET /pokemon/type/:type
filterPokemonByTypeHandler :: BackendContext -> String -> Handler [Pokemon]
filterPokemonByTypeHandler ctx t = liftIO $ case ctx of
#ifdef USE_MYSQL
  MySqlContext       -> withDatabase (\conn -> Repo.getPokemonByType conn t)
#else
  MySqlContext       -> error "MySQL não suportado nesta compilação."
#endif
  InMemoryContext m  -> MemRepo.getPokemonByTypeMem m t

-- | GET /teams
listTeamsHandler :: BackendContext -> Handler [Team]
#ifdef USE_MYSQL
listTeamsHandler MySqlContext = liftIO $ withDatabase Repo.getAllTeams
#else
listTeamsHandler MySqlContext = liftIO $ error "MySQL não suportado nesta compilação."
#endif
listTeamsHandler (InMemoryContext m) = liftIO $ MemRepo.getAllTeamsMem m

-- | POST /teams
createTeamHandler :: BackendContext -> CreateTeamRequest -> Handler Team
createTeamHandler _ (CreateTeamRequest tName)
  | null tName = throwError err400 { errBody = "O nome do time não pode ser vazio." }
#ifdef USE_MYSQL
createTeamHandler MySqlContext (CreateTeamRequest tName) =
  liftIO $ withDatabase (\conn -> Repo.createTeam conn tName)
#else
createTeamHandler MySqlContext _ =
  liftIO $ error "MySQL não suportado nesta compilação."
#endif
createTeamHandler (InMemoryContext m) (CreateTeamRequest tName) =
  liftIO $ MemRepo.createTeamMem m tName

-- | GET /teams/:id
getTeamHandler :: BackendContext -> Int -> Handler Team
getTeamHandler ctx tId = do
  mTeam <- liftIO $ case ctx of
#ifdef USE_MYSQL
    MySqlContext      -> withDatabase (\conn -> Repo.getTeamById conn tId)
#else
    MySqlContext      -> error "MySQL não suportado nesta compilação."
#endif
    InMemoryContext m -> MemRepo.getTeamByIdMem m tId
  case mTeam of
    Just t  -> return t
    Nothing -> throwError err404 { errBody = "Time não encontrado." }

-- | POST /teams/:id/pokemon
addPokemonToTeamHandler :: BackendContext -> Int -> AddPokemonRequest -> Handler Team
addPokemonToTeamHandler ctx tId (AddPokemonRequest targetPId) = do
  mTeam <- liftIO $ case ctx of
#ifdef USE_MYSQL
    MySqlContext      -> withDatabase (\conn -> Repo.getTeamById conn tId)
#else
    MySqlContext      -> error "MySQL não suportado nesta compilação."
#endif
    InMemoryContext m -> MemRepo.getTeamByIdMem m tId
  case mTeam of
    Nothing -> throwError err404 { errBody = "Time não encontrado." }
    Just currentTeam -> do
      mPokemon <- liftIO $ case ctx of
#ifdef USE_MYSQL
        MySqlContext      -> withDatabase (\conn -> Repo.getPokemonById conn targetPId)
#else
        MySqlContext      -> error "MySQL não suportado nesta compilação."
#endif
        InMemoryContext m -> MemRepo.getPokemonByIdMem m targetPId
      case mPokemon of
        Nothing -> throwError err404 { errBody = "Pokémon não encontrado no catálogo." }
        Just newMember ->
          case TeamService.addPokemonToTeam newMember currentTeam of
            Left TeamFullError ->
              throwError err400 { errBody = "Limite máximo atingido! Um time pode ter no máximo 6 Pokémon." }
            Left (DuplicatePokemonError _) ->
              throwError err400 { errBody = "Este Pokémon já faz parte do time." }
            Left _ ->
              throwError err400 { errBody = "Erro de validação ao adicionar integrante." }
            Right updatedTeam -> do
              case ctx of
#ifdef USE_MYSQL
                MySqlContext -> do
                  let newPosition = TeamService.teamSize (members updatedTeam)
                  liftIO $ withDatabase (\conn -> Repo.addMemberToTeam conn tId targetPId newPosition)
                  return updatedTeam
#else
                MySqlContext -> error "MySQL não suportado."
#endif
                InMemoryContext m -> do
                  res <- liftIO $ MemRepo.addMemberToTeamMem m tId newMember
                  case res of
                    Right t -> return t
                    Left _  -> throwError err400 { errBody = "Erro ao adicionar integrante em memória." }

-- | DELETE /teams/:id/pokemon/:pokemonId
removePokemonFromTeamHandler :: BackendContext -> Int -> Int -> Handler Team
removePokemonFromTeamHandler ctx tId pId = do
  mTeam <- liftIO $ case ctx of
#ifdef USE_MYSQL
    MySqlContext      -> withDatabase (\conn -> Repo.getTeamById conn tId)
#else
    MySqlContext      -> error "MySQL não suportado nesta compilação."
#endif
    InMemoryContext m -> MemRepo.getTeamByIdMem m tId
  case mTeam of
    Nothing -> throwError err404 { errBody = "Time não encontrado." }
    Just currentTeam -> do
      case ctx of
#ifdef USE_MYSQL
        MySqlContext -> do
          liftIO $ withDatabase (\conn -> Repo.removeMemberFromTeam conn tId pId)
          return (TeamService.removePokemonFromTeam pId currentTeam)
#else
        MySqlContext -> error "MySQL não suportado."
#endif
        InMemoryContext m -> do
          mUpdated <- liftIO $ MemRepo.removeMemberFromTeamMem m tId pId
          case mUpdated of
            Just t  -> return t
            Nothing -> throwError err404 { errBody = "Falha ao remover integrante." }

-- | Cria a aplicação WAI com suporte a CORS para o frontend React
app :: BackendContext -> Application
app ctx = simpleCors $ serve pokeTeamApi (server ctx)
