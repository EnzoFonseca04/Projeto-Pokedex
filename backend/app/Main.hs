{-# LANGUAGE CPP #-}
{-# LANGUAGE OverloadedStrings #-}
{-# LANGUAGE ScopedTypeVariables #-}

module Main (main) where

import Network.Wai.Handler.Warp (run)
import System.Environment (lookupEnv)
import Data.Maybe (fromMaybe)
import API.Routes (app, BackendContext(..))
import qualified Database.InMemoryRepository as MemRepo
import System.IO (hSetEncoding, stdout, stderr, utf8)

#ifdef USE_MYSQL
import Database.Connection (withDatabase)
import Database.MySQL.Simple (query_)
import qualified Control.Exception as E
#endif

main :: IO ()
main = do
  hSetEncoding stdout utf8
  hSetEncoding stderr utf8

  portStr <- fromMaybe "8080" <$> lookupEnv "PORT"
  let port = read portStr :: Int

  putStrLn "=========================================================="
  putStrLn "   POKETEAM - BACKEND EM HASKELL COM SERVANT              "
  putStrLn "=========================================================="
  putStrLn $ "  * Servidor inicializando na porta: " ++ show port
  putStrLn $ "  * Health Check URL: http://localhost:" ++ show port ++ "/health"
  putStrLn $ "  * API Base URL:     http://localhost:" ++ show port ++ "/pokemon"
  putStrLn "=========================================================="

#ifdef USE_MYSQL
  forceMem <- lookupEnv "USE_IN_MEMORY"
  backendCtx <- case forceMem of
    Just "1" -> do
      putStrLn "-> Variavel USE_IN_MEMORY=1 detectada."
      putStrLn "-> Inicializando repositorio puramente Em Memoria..."
      memState <- MemRepo.newInMemoryState
      putStrLn "  [OK] Repositorio In-Memory pronto com os 151 Pokemon oficiais!"
      return (InMemoryContext memState)
    _ -> do
      putStrLn "-> Verificando conectividade com o banco MySQL..."
      connTest <- tryConnect
      if connTest
        then do
          putStrLn "  [OK] Conexao com o MySQL estabelecida com sucesso!"
          return MySqlContext
        else do
          putStrLn "  [AVISO] MySQL nao detectado no ambiente local."
          putStrLn "  -> Ativando modo de contingencia: Repositorio In-Memory!"
          memState <- MemRepo.newInMemoryState
          putStrLn "  [OK] 151 Pokemon carregados na memoria com time de exemplo."
          return (InMemoryContext memState)
#else
  putStrLn "-> Compilado em Modo Puro In-Memory (Zero Dependencias C / MySQL)."
  putStrLn "  [OK] Carregando 151 Pokemon oficiais da 1a Geracao na memoria..."
  memState <- MemRepo.newInMemoryState
  putStrLn "  [OK] Repositorio pronto e 100% operacional!"
  let backendCtx = InMemoryContext memState
#endif

  putStrLn $ "\nIniciando servidor Warp em http://localhost:" ++ show port ++ "..."
  run port (app backendCtx)

#ifdef USE_MYSQL
tryConnect :: IO Bool
tryConnect =
  (withDatabase (\conn -> do
      _ :: [()] <- query_ conn "SELECT 1"
      return True))
    `E.catch` (\(_ :: E.SomeException) -> return False)
#endif
