{-# LANGUAGE DeriveGeneric #-}
{-# LANGUAGE OverloadedStrings #-}
{-# LANGUAGE CPP #-}

module Models.Team
  ( Team(..)
  , CreateTeamRequest(..)
  , AddPokemonRequest(..)
  , TeamStats(..)
  , TeamValidationError(..)
  ) where

import GHC.Generics (Generic)
import Models.Pokemon (Pokemon)

#ifdef WITH_AESON
import Data.Aeson (FromJSON, ToJSON)
#endif

-- | Estrutura que representa um Time Pokémon
-- Cada time pode possuir no máximo 6 integrantes.
data Team = Team
  { teamId      :: Int
  , teamName    :: String
  , members     :: [Pokemon]
  } deriving (Show, Eq, Generic)

#ifdef WITH_AESON
instance ToJSON Team
instance FromJSON Team
#endif

-- | DTO para criação de time
newtype CreateTeamRequest = CreateTeamRequest
  { name :: String
  } deriving (Show, Eq, Generic)

#ifdef WITH_AESON
instance ToJSON CreateTeamRequest
instance FromJSON CreateTeamRequest
#endif

-- | DTO para inclusão de Pokémon ao time
newtype AddPokemonRequest = AddPokemonRequest
  { targetPokemonId :: Int
  } deriving (Show, Eq, Generic)

#ifdef WITH_AESON
instance ToJSON AddPokemonRequest
instance FromJSON AddPokemonRequest
#endif

-- | Estatísticas médias e totais de um time
data TeamStats = TeamStats
  { avgHp        :: Double
  , avgAttack    :: Double
  , avgDefense   :: Double
  , avgSpAtk     :: Double
  , avgSpDef     :: Double
  , avgSpeed     :: Double
  , totalMembers :: Int
  } deriving (Show, Eq, Generic)

#ifdef WITH_AESON
instance ToJSON TeamStats
instance FromJSON TeamStats
#endif

-- | Erros de validação modelados algebricamente com Either
data TeamValidationError
  = TeamFullError                 -- Time já atingiu o limite de 6 integrantes
  | DuplicatePokemonError Int     -- Pokémon já existente no time
  | PokemonNotFoundError Int      -- Pokémon não encontrado
  | EmptyTeamNameError            -- Nome do time vazio ou inválido
  deriving (Show, Eq, Generic)

#ifdef WITH_AESON
instance ToJSON TeamValidationError
instance FromJSON TeamValidationError
#endif
