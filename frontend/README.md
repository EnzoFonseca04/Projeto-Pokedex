# 🔴 Pokédex Moderna & PokéTeam Builder

Uma aplicação moderna e interativa construída com **React**, **Tailwind CSS** e a **PokéAPI oficial**.

---

## ✨ Principais Funcionalidades

1. **Catálogo Completo por Gerações (I a IX)**:
   - Filtros instantâneos por região: **Kanto**, **Johto**, **Hoenn**, **Sinnoh**, **Unova**, **Kalos**, **Alola**, **Galar** e **Paldea**, além da opção **Todas**.
   - Contadores e faixas de numeração oficiais.

2. **Sprites Oficiais em Alta Resolução**:
   - Imagens oficiais de alta fidelidade (*Official Artwork*).
   - Alternância rápida para modo **Shiny** (brilhante).
   - Suporte a modelos animados em 3D (*Showdown animated sprites*).

3. **Detalhes e Estatísticas Completas**:
   - Modal com **HP, Ataque, Defesa, Atq. Especial, Def. Especial e Velocidade** com barras animadas e BST (Base Stat Total).
   - **Áudio Oficial dos Cries**: Reprodução do som característico de cada Pokémon.
   - Análise de **Eficácia Defensiva**: Tabela de fraquezas (2x/4x), resistências (0.5x/0.25x) e imunidades (0x).
   - Biometria: Altura, peso, categoria e habilidades (incluindo habilidade oculta).

4. **Team Builder Lateral (Monte até 6 Pokémon)**:
   - **Drag & Drop**: Arraste qualquer Pokémon da lista principal diretamente para qualquer um dos 6 slots ou reorganize sua equipe arrastando os slots.
   - **Quick Add**: Botão rápido `+ Time` em cada card ou no modal de detalhes.
   - **Relatório de Análise do Time**:
     - Média de status do time (Average BST).
     - Alerta de fraquezas críticas (identifica tipos contra os quais 3 ou mais membros são vulneráveis).
     - Resumo de resistências e variedade de tipos.
   - **Exportar Time**: Exportação no formato padrão Pokémon Showdown / PokéPaste para a área de transferência.
   - **Gerador Aleatório**: Botão com dados para montar times surpresa instantaneamente.
   - **Persistência Automática**: Seu time fica salvo no `localStorage`.

---

## 🚀 Como Executar

No terminal, acesse a pasta do projeto:

```bash
cd "C:\Users\fonse\.gemini\antigravity\scratch\modern-pokedex"
npm run dev
```

Abra o endereço indicado (geralmente [http://localhost:5173](http://localhost:5173)) no seu navegador.
