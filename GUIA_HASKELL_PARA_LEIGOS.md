# 📘 PokéTeam — Guia Simplificado do Backend em Haskell
> **Para quem é este guia?** Para qualquer pessoa (colegas, avaliadores ou leigos em programação funcional) que queira entender como o backend do PokéTeam funciona, o que foi usado e por que o Haskell é tão especial.

---

## 1. O que é o Haskell e por que ele é diferente?

A maioria das pessoas está acostumada com linguagens como JavaScript, Python ou C, que são **imperativas**: você dá uma sequência de ordens ao computador passo a passo (*"pegue essa variável, mude o valor dela, agora vá ali, delete aquilo"*).

O **Haskell** é uma linguagem **Puramente Funcional**. Em vez de dar ordens de mudança de estado, você escreve **fórmulas matemáticas**:
- **Tudo é uma função**: Uma função recebe um dado e devolve um resultado.
- **Não há "efeitos colaterais ocultos"**: O programa não faz nada "por baixo dos panos" sem você saber.
- **É à prova de quebras**: Se o código compilou sem erros, a chance de ele travar no ar é praticamente zero.

---

## 2. Analogias simples para os Conceitos do Projeto

Aqui está a tradução dos conceitos difíceis de Haskell para o português claro do dia a dia:

### 🧱 1. Imutabilidade (Nada se destrói, tudo se recria)
* **No mundo normal (JavaScript/Python)**: Se você tem um time com 3 Pokémon e adiciona um quarto, você altera o time existente.
* **No Haskell**: Dados são **imutáveis**. É como uma folha de papel: você não apaga o que já escreveu. Se você adiciona um Pokémon, o Haskell cria **uma folha novinha** contendo o time atualizado e preserva a folha anterior intacta. Isso impede que uma parte do sistema estrague os dados de outra parte.

---

### 🧮 2. Funções Puras (A regra da calculadora)
* Uma função pura é como a tecla de soma de uma calculadora: `2 + 2` sempre será `4`. Não importa se está de dia, de noite ou se a internet caiu.
* No nosso projeto, funções como calcular a média de ataque (`averageAttack`) ou validar se o time tem mais de 6 integrantes são 100% puras: não dependem de nada externo, não mudam variáveis globais e sempre dão o mesmo resultado para as mesmas entradas.

---

### 🧩 3. Pattern Matching (Encaixe de Peças)
* Imagine um brinquedo infantil onde você tem formas geométricas e buracos (círculo, quadrado, triângulo). O Haskell olha para o dado e diz:
  - *"Se a lista for vazia `[]`, faça isso."*
  - *"Se a lista tiver pelo menos um item `(x:xs)`, faça aquilo."*
  - *"Se o resultado for um sucesso `Right`, entregue o time."*
  - *"Se for um erro `Left`, entregue a mensagem amigável."*
* Isso evita dezenas de `if/else` confusos e garante que **nenhum caso seja esquecido**.

---

### 📦 4. `Maybe` (O fim do temido erro "Null Pointer / Undefined")
* Em outras linguagens, se você busca um Pokémon que não existe, o sistema pode retornar `null` e travar a tela.
* No Haskell existe o tipo **`Maybe`**, que funciona como uma caixinha de correio:
  - **`Just pokemon`**: A caixinha veio com um Pokémon dentro!
  - **`Nothing`**: A caixinha veio vazia.
* O sistema obriga você a tratar os dois casos antes mesmo do programa compilar. Travar por valor nulo? Impossível.

---

### 🚦 5. `Either` (O Semáforo de Erros)
* Como avisar que um time já tem 6 integrantes sem fazer o servidor "explodir"?
* Usamos o tipo **`Either`** (que significa "ou um, ou outro"):
  - **`Left erro`**: Se deu errado, devolve o motivo exato (ex: `TeamFullError` ou `DuplicatePokemonError`).
  - **`Right sucesso`**: Se deu tudo certo, devolve o novo Time pronto.

---

### 🪄 6. Higher-Order Functions: `map`, `filter` e `foldr`
São como pequenos ajudantes inteligentes para trabalhar com listas:
* **`filter` (A peneira)**: Peneira a lista para pegar só o que você quer. Usamos para filtrar Pokémon do tipo "Fogo" ou remover um integrante pelo ID.
* **`map` (O transformador)**: Pega todos os itens da lista e aplica uma transformação. Usamos para extrair o ataque de cada Pokémon ou deixar nomes em letras minúsculas.
* **`foldr` (O acumulador)**: Pega uma lista inteira e condensa em um único valor final. Usamos o `foldr (+) 0` para somar todos os pontos de ataque da equipe e depois calcular a média.

---

## 3. As Tecnologias Utilizadas (O que cada uma faz?)

| Tecnologia | O que é? | Para que serviu no projeto? |
|---|---|---|
| **GHC** | O compilador do Haskell | Transforma o código que escrevemos em um programa executável super rápido. |
| **Cabal** | O gerenciador de pacotes | Funciona como o `npm` do Node.js: organiza o projeto, compila e gerencia dependências. |
| **Servant** | O framework de API REST | É o "garçom" da nossa aplicação. Ele recebe as requisições HTTP (ex: `/pokemon`), valida os dados e entrega as respostas em JSON. |
| **Warp** | O servidor web HTTP | É um servidor de altíssima performance feito em Haskell que escuta na porta 8080. |
| **Aeson** | Manipulador de JSON | Traduz os dados do Haskell para JSON (a linguagem universal que o navegador entende). |
| **MySQL / In-Memory** | A camada de dados | Onde os 151 Pokémon e os times dos treinadores ficam guardados. |
| **React + Tailwind** | O Frontend visual | A interface bonita com cards, cores e sistema de arrastar e soltar (Drag & Drop). |

---

## 4. O Mapa do Nosso Backend (Arquivo por Arquivo)

Para explicar o código para alguém, siga este roteiro de 4 partes:

### 1️⃣ Os Moldes (`src/Models/`)
* **`Pokemon.hs`**: Define como é a "ficha" de um Pokémon: número, nome, tipo, vida (HP), ataque, defesa e imagem.
* **`Team.hs`**: Define o que é um Time (ID, nome e uma lista de até 6 Pokémon), além dos tipos de erro (`TeamFullError`, etc.).

### 2️⃣ O Cérebro / Regras Puras (`src/Services/`)
* **`PokemonService.hs`**: Contém a lógica de buscar por nome, filtrar por tipo e ordenar por ataque (usando o algoritmo Quicksort puramente funcional).
* **`TeamService.hs`**: Contém as regras de ouro: não deixar passar de 6 integrantes, não deixar repetir Pokémon e calcular médias de status usando `foldr`.

### 3️⃣ O Armazém de Dados (`src/Database/`)
* **`InMemoryRepository.hs`**: Um repositório que guarda os 151 Pokémon originais na memória do computador. Não precisa de nada instalado para funcionar!
* **`PokemonRepository.hs`**: As consultas SQL caso queira conectar ao banco MySQL tradicional.

### 4️⃣ A Porta de Entrada (`src/API/` e `app/`)
* **`Routes.hs`**: Conecta as funções puras aos endereços da web (como `/pokemon` e `/teams`).
* **`Main.hs`**: É o botão de "Ligar". Inicia o servidor Warp na porta 8080 e avisa que tudo está pronto.

---

## 5. Como resumir o projeto em 1 minuto numa apresentação?

> *"Nosso projeto é uma Pokédex moderna com sistema de montagem de times de até 6 integrantes.
> 
> O diferencial acadêmico está no Backend em Haskell: em vez de usarmos estilos tradicionais cheios de variáveis globais e estados mutáveis, nós implementamos um sistema puramente funcional.
> 
> Usamos tipos algébricos para modelar os dados, funções de alta ordem como `foldr` e `filter` para cálculos estatísticos, e os tipos `Maybe` e `Either` para garantir que erros como times lotados ou Pokémon duplicados sejam tratados com segurança matemática sem que o servidor nunca trave."*
