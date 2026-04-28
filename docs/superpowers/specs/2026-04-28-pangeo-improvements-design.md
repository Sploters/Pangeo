# Pangeo — Visual Fixes, FSRS e Triagem Automática

**Data:** 2026-04-28  
**Status:** Aprovado  

---

## Contexto

O Pangeo é um app React Native / Expo de aprendizado de inglês com foco em SRS, pronúncia (connected speech) e descoberta de conteúdo. O estado atual tem:

- SRS sem intervalos reais — todo item não-maduro aparece em toda sessão
- Captura de vocabulário 100% manual
- Inconsistências visuais pontuais (tabs de altura variável, pills grandes, cores hardcoded)
- `ContentScreen` sem link entre conteúdo e vocabulário

O objetivo deste design é: corrigir as inconsistências visuais, implementar SRS com algoritmo FSRS real, e criar um fluxo automático de captura de vocabulário a partir de três fontes curadas (News in Levels, Zipf top 500, conteúdo de filmes/livros).

---

## Escopo

| # | Seção | Tipo |
|---|---|---|
| 1 | Correções visuais | Fix |
| 2 | SRS com FSRS | Melhoria de algoritmo |
| 3 | `TriagemScreen` reutilizável | Feature nova |
| 4 | News in Levels | Feature nova |
| 5 | Zipf top 500 com bandas | Feature nova |
| 6 | Vocabulário por conteúdo (filmes/livros) | Feature nova |

---

## 1. Correções Visuais

### Problema
- Tabs de Pronúncia com alturas inconsistentes: o tab "Schwa" renderiza `/ə/` (16px) + label (13px) lado a lado, enquanto outros só têm label — tornando o Schwa ligeiramente mais alto
- Pills do Vault com `paddingVertical: 7` percebidos como grandes demais
- Cores `#C0832A` (Assimilação) e `#7C5CBF / #E8DFF8` (Chunk) hardcoded em vários arquivos sem token no tema
- Opacidade inline (`color: X, opacity: 0.55`) em vez de tokens de cor semânticos

### Fix

**`src/theme/index.ts`** — adicionar tokens:
```typescript
amber: '#C0832A',
amberSoft: '#F5E5C8',
purple: '#7C5CBF',
purpleSoft: '#E8DFF8',
```

**`PronunciationScreen.tsx:324`** — adicionar altura fixa ao estilo `tab`:
```typescript
tab: {
  height: 36,  // adicionar
  flexDirection: 'row', alignItems: 'center', ...
}
```

**`VaultScreen.tsx:215`** — reduzir padding das pills:
```typescript
pill: {
  paddingHorizontal: 10,  // era 12
  paddingVertical: 5,     // era 7
  ...
}
```

**Todos os arquivos** — substituir `#C0832A` por `Colors.amber`, `#7C5CBF` por `Colors.purple`, `#E8DFF8` por `Colors.purpleSoft`.

**Opacidade inline** — substituir padrões `{ color: Colors.X, opacity: 0.N }` por `Colors.inkMute` onde aplicável.

---

## 2. SRS com Algoritmo FSRS

### Problema atual
O SRS não tem datas de próxima revisão. Todos os itens não-maduros aparecem em toda sessão. `strength` é gravado manualmente em vez de calculado.

### Algoritmo FSRS-4.5
FSRS modela dois parâmetros psicológicos por item:
- **Stability (S):** dias até a retenção cair para 90%
- **Difficulty (D):** dificuldade intrínseca do item (1–10)

A **Retrievability** atual é: `R = 0.9^(diasDesdeRevisão / S)`

O próximo intervalo é: `I = S × ln(desiredRetention) / ln(0.9)` onde `desiredRetention = 0.9` por padrão.

O algoritmo usa 17 parâmetros (w0–w16) pré-treinados no dataset do Anki — não requer treinamento local.

### Novos campos em `VaultItem`

```typescript
// Adicionar a VaultItem em src/data/seed.ts:
stability: number      // S — dias para 90% retenção (default: 0)
difficulty: number     // D — dificuldade 1-10 (default: 5)
lapses: number         // vezes que esqueceu (default: 0)
lastReviewAt: number   // timestamp ms da última revisão (default: 0)
nextReviewAt: number   // timestamp ms da próxima revisão (default: 0 = vence hoje)
```

O campo `strength` (0–1) passa a ser calculado como `getRetrievability(item)` e gravado no store após cada revisão (para que `PgStrength` continue funcionando sem alteração). Não é mais atribuído manualmente com valores fixos (0.1, 0.3, 0.65, 1.0).

### Mapeamento dos botões → FSRS Grade

| Botão | Grade | Comportamento |
|---|---|---|
| De novo | 1 — Again | Stability cai, lapses++, `nextReviewAt` = agora + 10min |
| Difícil | 2 — Hard | Stability cresce lentamente |
| Bom | 3 — Good | Stability cresce normalmente |
| Fácil | 4 — Easy | Stability cresce mais, D diminui levemente |

### Estado SRS derivado
```
'new'      → nunca revisado (lastReviewAt === 0)
'learning' → stability < 1 (ainda em aprendizagem inicial)
'due'      → nextReviewAt <= Date.now() (venceu)
'mature'   → stability >= 21 dias
```

### Filtro do deck no SRSScreen
```typescript
// antes: items.filter(i => i.srs !== 'mature')
// depois:
items.filter(i => i.nextReviewAt <= Date.now() || i.lastReviewAt === 0)
```

### Novo arquivo: `src/utils/fsrs.ts`
Implementar as funções:
- `initFSRS(grade: 1|2|3|4): { stability, difficulty, nextReviewAt }`
- `reviewFSRS(item: VaultItem, grade: 1|2|3|4): { stability, difficulty, lapses, nextReviewAt }`
- `getRetrievability(item: VaultItem): number` — retorna 0–1

### Mudanças no store
`updateSRS(id, srs, strength)` → `updateSRS(id, patch: Partial<VaultItem>)` para gravar todos os campos FSRS de uma vez.

---

## 3. `TriagemScreen` — Padrão Reutilizável

### Propósito
Tela única usada por News in Levels, Zipf e Conteúdo para apresentar sugestões de vocabulário e permitir aprovação rápida uma a uma.

### Tipo `VocabSuggestion`

```typescript
// Adicionar em src/data/seed.ts:
type VocabSuggestion = {
  term: string;
  type: VaultItem['type'];
  gloss: string;
  example?: string;
  source: string;           // ex: "News · Level 2" ou "Zipf #143"
  level?: string;           // nível CEFR sugerido
  function?: CommunicativeFunction;
}
```

### Navigation params

```typescript
// Adicionar em RootStackParamList:
Triagem: {
  suggestions: VocabSuggestion[];
  title: string;
  subtitle: string;
}
```

### Layout da tela

```
┌─────────────────────────────────┐
│ ← [título]           [X / Y]   │  ← header + progresso
│ ▓▓▓▓▓▓▓▓▓░░░░░░░░░░░░░░░░░░░░  │  ← barra de progresso
│                                 │
│        [chip de tipo]           │
│                                 │
│     TERMO EM DESTAQUE           │  ← 34px, peso 600
│                                 │
│     gloss em português          │  ← 16px
│                                 │
│     "exemplo em contexto"       │  ← 14px, itálico
│                                 │
│     [badge fonte]               │  ← "Zipf #143" ou "News L2"
│                                 │
│  [  Pular  ]  [ Adicionar ✓ ]   │  ← rodapé fixo
└─────────────────────────────────┘
```

### Comportamento
- "Adicionar": chama `addItem()` com campos FSRS zerados, avança para próximo
- "Pular": avança sem adicionar
- Ao terminar todos: tela de resumo "X de Y palavras adicionadas ao Vault"
- Items já presentes no Vault são filtrados antes de exibir (sem duplicatas)

### Arquivo: `src/screens/TriagemScreen.tsx`

---

## 4. News in Levels

### Navegação
```
ContentScreen → NewsListScreen → NewsArticleScreen → TriagemScreen
```

### Tipo `NewsArticle`

```typescript
type NewsArticle = {
  id: string;
  title: string;
  level: 1 | 2 | 3;         // 1=A2, 2=B1, 3=B2
  topic: string;             // 'Technology' | 'Science' | 'World' | 'Health' | 'Culture'
  date: string;
  text: string;
  vocabulary: VocabSuggestion[];  // 5–8 itens curados por artigo
}
```

### Seed inicial
5 artigos por nível = **15 artigos** com 5–8 itens de vocabulário cada ≈ 90 sugestões.

### `NewsListScreen`
- Header: "NOTÍCIAS EM INGLÊS"
- Filtro de nível: pills Level 1 / Level 2 / Level 3 (cores: moss / ocean / coral)
- Cards: título, tópico, badge de nível, "X palavras para capturar"
- Badge "✓ Capturado" quando o usuário já triou o vocabulário daquele artigo

### `NewsArticleScreen`
- Título + badge de nível
- Texto do artigo com palavras de vocabulário **sublinhadas em pontilhado** (mesmo estilo do schwa)
- Toque em palavra sublinhada: tooltip com termo + gloss + tipo
- Botão fixo no rodapé: **"Revisar vocabulário · X palavras →"** → `TriagemScreen`
- Quando todas já estão no Vault: botão muda para "✓ Vocabulário capturado" (desabilitado)

### Integração no ContentScreen
- Novo card de destaque "Notícias em Inglês" no topo do ContentScreen
- Leva para `NewsListScreen`

### Novos arquivos
- `src/screens/NewsListScreen.tsx`
- `src/screens/NewsArticleScreen.tsx`
- Dados: novo array `NEWS_ARTICLES: NewsArticle[]` em `src/data/seed.ts`

---

## 5. Zipf Top 500

### Dados
Array `ZIPF_TOP_500: ZipfWord[]` em `src/data/seed.ts`:

```typescript
type ZipfWord = {
  rank: number;       // 1–500
  word: string;
  type: VaultItem['type'];
  gloss: string;
  example: string;
}
```

500 palavras × ~120 bytes ≈ **~60KB** embutido. Expansão para 2.000 em versão futura via API do dicionário.

### ZipfScreen atualizado

**Hero card** — mantido, mas cobertura passa a refletir `ZIPF_TOP_500` itens presentes no Vault do usuário:
```typescript
const covered = ZIPF_TOP_500.filter(z =>
  items.some(i => i.term.toLowerCase() === z.word.toLowerCase())
).length;
const pct = Math.round((covered / 500) * 100);
```

**Bandas de frequência** (substituem a lista simples atual):

| Banda | Range | Progresso | Botão |
|---|---|---|---|
| 🏆 Essenciais | Top 1–100 | `X / 100` | "Treinar →" |
| ⚡ Frequentes | Top 101–300 | `X / 200` | "Treinar →" |
| 📈 Avançadas | Top 301–500 | `X / 200` | "Treinar →" |

Cada botão "Treinar →" filtra os itens daquela banda **ausentes no Vault** e abre `TriagemScreen`.

Palavras já no Vault aparecem com ✓ quando o usuário expande uma banda.

### Integração no HomeScreen
Card Zipf existente passa a exibir "X das top 500" em vez do cálculo estimado atual.

---

## 6. Vocabulário por Conteúdo

### ContentItem — campo novo

```typescript
// Adicionar ao tipo ContentItem em src/data/seed.ts:
vocabulary?: VocabSuggestion[];  // 8–15 itens curados por conteúdo
```

Os 6 itens do seed atual ganham vocabulário curado (8–10 itens cada ≈ 55 sugestões).

### Fluxo
```
ContentScreen → toque num card → ContentDetailScreen → TriagemScreen
```

### `ContentDetailScreen` (nova tela)
- Arte + título + autor + badge de nível
- Seção "Por que este conteúdo?" (campo `why` atual)
- Seção "Vocabulário essencial": lista prévia com apenas os termos + chips de tipo (sem revelar gloss)
- Botão primário: **"Iniciar triagem · X palavras →"** → `TriagemScreen`
- Badge "✓ Vocabulário capturado" quando já triou tudo daquele conteúdo

### Badge no ContentScreen
Card de conteúdo ganha ícone ✓ quando vocabulário já foi capturado.

### Novo arquivo
- `src/screens/ContentDetailScreen.tsx`

---

## Arquitetura — Resumo de Mudanças

### Arquivos modificados
| Arquivo | Mudança |
|---|---|
| `src/theme/index.ts` | Adicionar `amber`, `amberSoft`, `purple`, `purpleSoft` |
| `src/data/seed.ts` | Novos tipos + arrays: `VocabSuggestion`, `NewsArticle`, `ZipfWord`; campos FSRS em `VaultItem`; vocabulário em `ContentItem` |
| `src/store/index.ts` | `updateSRS` aceita `Partial<VaultItem>`; novos campos FSRS no estado inicial |
| `src/screens/PronunciationScreen.tsx` | `height: 36` nas tabs; tokens de cor |
| `src/screens/VaultScreen.tsx` | Pills menores; tokens de cor |
| `src/screens/SRSScreen.tsx` | Integrar `reviewFSRS()`; filtro por `nextReviewAt` |
| `src/screens/ZipfScreen.tsx` | Bandas + botões de triagem; cobertura real vs top 500 |
| `src/screens/ContentScreen.tsx` | Card "Notícias"; link para `ContentDetailScreen` |
| `src/navigation/index.tsx` | Registrar: `Triagem`, `NewsList`, `NewsArticle`, `ContentDetail` |

### Novos arquivos
| Arquivo | Propósito |
|---|---|
| `src/utils/fsrs.ts` | Funções FSRS: `initFSRS`, `reviewFSRS`, `getRetrievability` |
| `src/screens/TriagemScreen.tsx` | Tela de triagem reutilizável |
| `src/screens/NewsListScreen.tsx` | Lista de artigos por nível |
| `src/screens/NewsArticleScreen.tsx` | Leitura de artigo + tooltips de vocabulário |
| `src/screens/ContentDetailScreen.tsx` | Detalhe de conteúdo + triagem |

---

## Ordem de Implementação Sugerida

1. Visual fixes (isolado, sem dependências)
2. `src/utils/fsrs.ts` + mudanças no store + `VaultItem` (base para tudo)
3. `TriagemScreen` (base para News, Zipf e Content)
4. Seed data: `ZIPF_TOP_500`, `NEWS_ARTICLES`, vocabulário em `ContentItem`
5. `ZipfScreen` atualizado
6. `NewsListScreen` + `NewsArticleScreen`
7. `ContentDetailScreen`
8. Registrar rotas e conectar navegação
