# 🔴 PokéTeam — Pokédex e Team Builder com Backend em Haskell e MySQL

Projeto acadêmico completo integrando um backend funcional desenvolvido em **Haskell** com **Servant**, persistência de dados em **MySQL** (com suporte automático a modo **In-Memory** se o MySQL não estiver instalado) e frontend moderno em **React + Tailwind CSS**.

---

## 💡 Não tem o MySQL instalado? Sem problemas!

O backend do PokéTeam foi arquitetado com um **Modo de Contingência Em Memória (In-Memory)**:
- Se você **não tiver o MySQL rodando**, o backend detecta isso automaticamente na inicialização e ativa o repositório em memória com todos os **151 Pokémon da 1ª Geração pré-carregados**.
- Todas as rotas da API (`/pokemon`, `/teams`, `/health`, etc.) e validações funcionam **100% sem precisar de nenhum banco de dados externo instalado**.
- Quando você instalar ou subir o MySQL futuramente, o backend automaticamente passa a persistir no banco real sem nenhuma alteração de código!

---

## 📁 Estrutura do Repositório

```text
poketeam/
│
├── backend/
│   ├── app/
│   │   └── Main.hs                     # Inicialização do servidor Warp (com fallback automático)
│   ├── src/
│   │   ├── Models/
│   │   │   ├── Pokemon.hs              # Tipos algébricos (Pokemon, PokemonType)
│   │   │   └── Team.hs                 # Modelagem do Time, DTOs e erros (Either)
│   │   ├── Services/
│   │   │   ├── PokemonService.hs       # Regras puras: busca, filtros e ordenação
│   │   │   └── TeamService.hs          # Regras puras: validações, médias com foldr e limites
│   │   ├── Database/
│   │   │   ├── Connection.hs           # Conexão com MySQL via variáveis de ambiente
│   │   │   ├── PokemonRepository.hs    # Consultas SQL com mysql-simple
│   │   │   └── InMemoryRepository.hs   # Repositório puro em memória com os 151 Pokémon
│   │   └── API/
│   │       └── Routes.hs               # Rotas e handlers REST com Servant e CORS
│   ├── test/
│   │   └── Spec.hs                     # Suíte de testes dos 7 cenários acadêmicos
│   └── poketeam.cabal                  # Manifesto de compilação Cabal
│
├── frontend/                           # Aplicação web React + Tailwind CSS
│   ├── src/
│   │   ├── services/
│   │   │   └── haskellBackendApi.js    # Cliente HTTP para a API Haskell
│   │   └── ...
│   └── package.json
│
├── database/
│   ├── schema.sql                      # DDL do MySQL (pokemon, types, teams, team_pokemon)
│   └── seed.sql                        # Carga dos 151 Pokémon com status oficiais
│
└── README.md
```

---

## 🧠 Conceitos de Programação Funcional Demonstrados

| Conceito Haskell | Onde foi aplicado no código | Detalhes da Implementação |
|---|---|---|
| **Tipos Algébricos (`data` e `newtype`)** | `Models/Pokemon.hs`, `Models/Team.hs` | Modelagem segura de domínio (`Pokemon`, `Team`, `TeamStats`, `TeamValidationError`). |
| **Funções Puras e Imutabilidade** | `Services/TeamService.hs` | As funções não produzem efeitos colaterais. `addPokemonToTeam` e `removePokemonFromTeam` retornam novas estruturas sem alterar as antigas. |
| **Pattern Matching** | `Services/PokemonService.hs`, `Services/TeamService.hs` | Desconstrução de listas (`[]` e `p:ps`), tipos `Maybe` (`Just` / `Nothing`) e `Either` (`Left` / `Right`). |
| **Guardas (`|`)** | `validateTeamLimit`, `searchPokemon` | Validação de limites e condições de maneira declarativa e legível. |
| **Recursividade Pura** | `teamSize`, `sortByAttack` | Contagem recursiva de elementos e ordenação pura por Ataque via algoritmo **Quicksort**. |
| **Higher-Order Functions (`map`, `filter`, `foldr`)** | `Services/TeamService.hs`, `Services/PokemonService.hs` | Agregação de estatísticas (`calculateAverageBy` via `foldr`), conversão de strings (`map toLower`) e filtragens (`filterByType`). |
| **Tipo `Maybe`** | `searchPokemon`, `findById`, `PokemonRepository.hs` | Tratamento seguro de ausência de dados sem exceções de ponteiro nulo. |
| **Tipo `Either`** | `addPokemonToTeam`, `validateTeamLimit` | Controle de erros explícito (`Left TeamFullError`, `Left DuplicatePokemonError`). |
| **Mônada `IO`** | `Connection.hs`, `PokemonRepository.hs`, `Main.hs` | Isolamento estrito de efeitos colaterais para acesso a banco de dados e servidor web. |

---

## 🧪 Como Rodar os Testes das Regras de Negócio (Etapa 4)

Você pode compilar e executar o teste acadêmico imediatamente em qualquer máquina com GHC:

```powershell
cd backend
ghc -isrc test/Spec.hs -o test/Spec.exe
.\test\Spec.exe
```

Todos os 7 cenários serão testados e validados!

---

## 🚀 Como Rodar o Projeto

### Opção 1: Sem MySQL (Modo Em Memória Automático)
Basta iniciar a API:
```powershell
cd backend
cabal run poketeam-server
```
O servidor detectará a ausência do banco e inicializará o **InMemoryRepository** com os 151 Pokémon.

### Opção 2: Com MySQL via Docker (Recomendado para quem não quer instalar o MySQL na máquina)
Se tiver Docker instalado, suba o MySQL em 5 segundos com:
```powershell
docker run --name poketeam-mysql -e MYSQL_DATABASE=poketeam_db -e MYSQL_ALLOW_EMPTY_PASSWORD=yes -p 3306:3306 -d mysql:8.0
```
E importe os dados:
```powershell
docker exec -i poketeam-mysql mysql -uroot poketeam_db < database/schema.sql
docker exec -i poketeam-mysql mysql -uroot poketeam_db < database/seed.sql
```

### Opção 3: Com MySQL Server Nativo
Importe os arquivos no MySQL Workbench:
```sql
SOURCE database/schema.sql;
SOURCE database/seed.sql;
```

---

### Iniciar o Frontend em React
```powershell
cd frontend
npm run dev
```
Acesse no navegador: [http://localhost:5173](http://localhost:5173).
