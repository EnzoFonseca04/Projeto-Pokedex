-- ========================================================
-- PokéTeam — Database Schema (MySQL)
-- ========================================================

CREATE DATABASE IF NOT EXISTS poketeam_db
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE poketeam_db;

-- 1. Tabela de Pokémon
CREATE TABLE IF NOT EXISTS pokemon (
  id INT NOT NULL,
  name VARCHAR(50) NOT NULL,
  hp INT NOT NULL,
  attack INT NOT NULL,
  defense INT NOT NULL,
  special_attack INT NOT NULL,
  special_defense INT NOT NULL,
  speed INT NOT NULL,
  image_url VARCHAR(255) NOT NULL,
  PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 2. Tabela de Tipos de Pokémon
CREATE TABLE IF NOT EXISTS pokemon_types (
  id INT NOT NULL AUTO_INCREMENT,
  name VARCHAR(30) NOT NULL UNIQUE,
  PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 3. Tabela Associativa Pokémon <-> Tipos (N:N)
CREATE TABLE IF NOT EXISTS pokemon_type (
  pokemon_id INT NOT NULL,
  type_id INT NOT NULL,
  PRIMARY KEY (pokemon_id, type_id),
  CONSTRAINT fk_pt_pokemon FOREIGN KEY (pokemon_id) REFERENCES pokemon (id) ON DELETE CASCADE,
  CONSTRAINT fk_pt_type FOREIGN KEY (type_id) REFERENCES pokemon_types (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 4. Tabela de Times de Treinadores
CREATE TABLE IF NOT EXISTS teams (
  id INT NOT NULL AUTO_INCREMENT,
  name VARCHAR(100) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 5. Tabela Associativa Time <-> Pokémon (com posição de 1 a 6)
CREATE TABLE IF NOT EXISTS team_pokemon (
  team_id INT NOT NULL,
  pokemon_id INT NOT NULL,
  position INT NOT NULL DEFAULT 1,
  PRIMARY KEY (team_id, pokemon_id),
  CONSTRAINT fk_tp_team FOREIGN KEY (team_id) REFERENCES teams (id) ON DELETE CASCADE,
  CONSTRAINT fk_tp_pokemon FOREIGN KEY (pokemon_id) REFERENCES pokemon (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Índices adicionais para otimização de busca
CREATE INDEX idx_pokemon_name ON pokemon (name);
CREATE INDEX idx_teams_name ON teams (name);
