{-# LANGUAGE CPP #-}
{-# LANGUAGE OverloadedStrings #-}

#ifdef USE_MYSQL

module Database.Connection
  ( getDbConnection
  , getDbConnectInfo
  , withDatabase
  ) where

import Database.MySQL.Simple
import System.Environment (lookupEnv)
import Data.Maybe (fromMaybe)
import Control.Exception (bracket)

-- | Recupera configurações de conexão a partir de variáveis de ambiente
getDbConnectInfo :: IO ConnectInfo
getDbConnectInfo = do
  host <- fromMaybe "127.0.0.1" <$> lookupEnv "MYSQL_HOST"
  portStr <- fromMaybe "3306" <$> lookupEnv "MYSQL_PORT"
  user <- fromMaybe "root" <$> lookupEnv "MYSQL_USER"
  pass <- fromMaybe "" <$> lookupEnv "MYSQL_PASSWORD"
  db   <- fromMaybe "poketeam_db" <$> lookupEnv "MYSQL_DATABASE"

  let port = read portStr :: Word16

  return defaultConnectInfo
    { connectHost     = host
    , connectPort     = port
    , connectUser     = user
    , connectPassword = pass
    , connectDatabase = db
    }

-- | Abre uma conexão com o banco de dados MySQL
getDbConnection :: IO Connection
getDbConnection = do
  connInfo <- getDbConnectInfo
  connect connInfo

-- | Executa uma ação com conexão segura (abre e fecha automaticamente com bracket)
withDatabase :: (Connection -> IO a) -> IO a
withDatabase = bracket getDbConnection close

#else

module Database.Connection
  ( withDatabaseStub
  ) where

-- | Módulo em modo stub (quando compilado sem o pacote mysql-simple)
withDatabaseStub :: (a -> IO b) -> IO b
withDatabaseStub _ = error "MySQL não habilitado nesta compilação. Use o modo In-Memory ou compile com -fuse-mysql."

#endif
