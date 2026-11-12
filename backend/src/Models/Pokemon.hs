{-# LANGUAGE DeriveGeneric #-}
{-# LANGUAGE OverloadedStrings #-}
{-# LANGUAGE CPP #-}

module Models.Pokemon
  ( Pokemon(..)
  , PokemonType(..)
  ) where

import GHC.Generics (Generic)

#ifdef WITH_AESON
import Data.Aeson (FromJSON, ToJSON)
#endif

-- | Representação de um Tipo de Pokémon
newtype PokemonType = PokemonType
  { typeName :: String
  } deriving (Show, Eq, Generic)

#ifdef WITH_AESON
instance ToJSON PokemonType
instance FromJSON PokemonType
#endif

-- | Estrutura principal que representa um Pokémon no ecossistema
-- Demonstra tipos próprios (data), tipagem estática e registros (record syntax).
data Pokemon = Pokemon
  { pokemonId       :: Int
  , pokemonName     :: String
  , hp              :: Int
  , attack          :: Int
  , defense         :: Int
  , specialAttack   :: Int
  , specialDefense  :: Int
  , speed           :: Int
  , imageUrl        :: String
  , types           :: [String]
  } deriving (Show, Eq, Generic)

#ifdef WITH_AESON
instance ToJSON Pokemon
instance FromJSON Pokemon
#endif
