# Pangeo Improvements Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Corrigir inconsistências visuais, implementar FSRS real e criar fluxo automático de triagem de vocabulário a partir de News in Levels, Zipf top-500 e conteúdo curado.

**Architecture:** Visual fixes são isolados no tema e em dois screens. FSRS adiciona 5 campos ao `VaultItem` e substitui a lógica manual do `SRSScreen`. A `TriagemScreen` é um componente reutilizável que recebe `VocabSuggestion[]` e serve News, Zipf e Content.

**Tech Stack:** React Native 0.81 / Expo 54, TypeScript, Zustand + AsyncStorage, React Navigation 7 (native stack + bottom tabs).

---

## Fase 1 — Visual Fixes

### Task 1: Adicionar tokens de cor ao tema

**Files:**
- Modify: `src/theme/index.ts`

- [ ] **Abrir `src/theme/index.ts` e localizar o objeto `Colors`**

- [ ] **Adicionar os quatro tokens novos dentro de `Colors`**

```typescript
// Adicionar após Colors.lineStrong:
amber: '#C0832A',
amberSoft: '#F5E5C8',
purple: '#7C5CBF',
purpleSoft: '#E8DFF8',
```

- [ ] **Commitar**

```bash
git add src/theme/index.ts
git commit -m "feat(theme): add amber and purple color tokens"
```

---

### Task 2: Corrigir tabs do PronunciationScreen

**Files:**
- Modify: `src/screens/PronunciationScreen.tsx`

- [ ] **No StyleSheet, localizar o estilo `tab` (linha ~324) e adicionar `height: 36`**

```typescript
tab: {
  height: 36,
  flexDirection: 'row', alignItems: 'center', gap: 5,
  paddingHorizontal: 14, paddingVertical: 9, borderRadius: 12,
  borderWidth: 0.5, borderColor: Colors.line, backgroundColor: Colors.paper,
},
```

- [ ] **No array `TABS` (linha ~11), substituir as cores hardcoded pelos tokens**

```typescript
const TABS: { id: Tab; label: string; mono?: string; color: string; soft: string }[] = [
  { id: 'schwa',   label: 'Schwa',      mono: '/ə/', color: Colors.coral,  soft: Colors.coralSoft },
  { id: 'reduce',  label: 'Reductions',             color: Colors.ocean,  soft: Colors.oceanSoft },
  { id: 'link',    label: 'Linking',                color: Colors.purple, soft: Colors.purpleSoft },
  { id: 'assim',   label: 'Assimilação',            color: Colors.amber,  soft: Colors.amberSoft },
  { id: 'elision', label: 'Elision',                color: Colors.moss,   soft: Colors.mossSoft },
];
```

- [ ] **No objeto `PHENOMENON_META` (linha ~19), substituir hardcodes**

```typescript
const PHENOMENON_META: Record<ConnectedSpeechPhenomenon, { title: string; description: string; color: string; soft: string }> = {
  linking: {
    title: 'Linking (Ligação)',
    description: 'Consoante final de uma palavra se liga à vogal inicial da próxima — sem pausa, como se fossem uma palavra só.',
    color: Colors.purple, soft: Colors.purpleSoft,
  },
  intrusion: {
    title: 'Intrusion (Intrusão)',
    description: 'Um som "fantasma" (/r/, /w/ ou /j/) aparece entre duas vogais para facilitar a transição — você não vê na escrita, mas ouve.',
    color: Colors.purple, soft: Colors.purpleSoft,
  },
  assimilation: {
    title: 'Assimilação',
    description: 'Um som muda para se aproximar do som vizinho. O exemplo clássico: /d/ + /j/ → /dʒ/ (como "did you" → "didja").',
    color: Colors.amber, soft: Colors.amberSoft,
  },
  elision: {
    title: 'Elision (Elisão)',
    description: 'Um som simplesmente desaparece na fala rápida, especialmente o /t/ e /d/ antes de consoantes. Nativo nem percebe — é automático.',
    color: Colors.moss, soft: Colors.mossSoft,
  },
};
```

- [ ] **Verificar manualmente no app:** todos os 5 tabs de Pronúncia devem ter a mesma altura.

- [ ] **Commitar**

```bash
git add src/screens/PronunciationScreen.tsx
git commit -m "fix(pronunciation): uniform tab height and token colors"
```

---

### Task 3: Corrigir pills do VaultScreen

**Files:**
- Modify: `src/screens/VaultScreen.tsx`

- [ ] **Localizar o estilo `pill` (linha ~215) e reduzir padding**

```typescript
pill: {
  flexDirection: 'row', alignItems: 'center', gap: 6,
  paddingHorizontal: 10,   // era 12
  paddingVertical: 5,      // era 7
  borderRadius: Radius.full,
  borderWidth: 1, borderColor: Colors.lineStrong,
},
```

- [ ] **Na função `typeColor` (linha ~23), substituir hardcodes**

```typescript
function typeColor(type: VaultItem['type']) {
  switch (type) {
    case 'reduction':   return { c: Colors.ocean,   soft: Colors.oceanSoft };
    case 'collocation': return { c: Colors.gold,    soft: Colors.goldSoft };
    case 'phonetic':    return { c: Colors.coral,   soft: Colors.coralSoft };
    case 'idiom':       return { c: Colors.amber,   soft: Colors.amberSoft };
    case 'gap-filler':  return { c: Colors.inkMute, soft: Colors.line };
    case 'chunk':       return { c: Colors.purple,  soft: Colors.purpleSoft };
    default:            return { c: Colors.moss,    soft: Colors.mossSoft };
  }
}
```

- [ ] **Nos estilos `fnBadge` e `fnBadgeText` (linha ~235), substituir hardcodes**

```typescript
fnBadge: {
  backgroundColor: Colors.purpleSoft, borderRadius: Radius.full,
  paddingHorizontal: 7, paddingVertical: 2,
},
fnBadgeText: { fontSize: 9.5, fontWeight: '600', color: Colors.purple },
```

- [ ] **Verificar manualmente no app:** pills do Vault menores; chips de chunk com cor roxa consistente.

- [ ] **Commitar**

```bash
git add src/screens/VaultScreen.tsx
git commit -m "fix(vault): smaller filter pills and token colors"
```

---

## Fase 2 — FSRS

### Task 4: Adicionar campos FSRS ao VaultItem

**Files:**
- Modify: `src/data/seed.ts`

- [ ] **Localizar o tipo `VaultItem` (linha ~35) e adicionar os 5 campos FSRS**

```typescript
export type VaultItem = {
  id: number;
  term: string;
  type: 'phrase' | 'phonetic' | 'reduction' | 'collocation' | 'idiom' | 'gap-filler' | 'word' | 'chunk';
  lang: string;
  gloss: string;
  source: string;
  date: string;
  example: string;
  srs: 'due' | 'learning' | 'mature' | 'new';
  strength: number;
  tags: string[];
  function?: CommunicativeFunction;
  // FSRS
  stability: number;      // dias até 90% retenção (0 = nunca revisado)
  difficulty: number;     // dificuldade 1-10 (padrão 5)
  lapses: number;         // vezes que esqueceu
  lastReviewAt: number;   // timestamp ms (0 = nunca revisado)
  nextReviewAt: number;   // timestamp ms (0 = vence agora)
};
```

- [ ] **Localizar o array `VAULT` em seed.ts e adicionar os campos FSRS a cada item existente**

Cada item do array ganha: `stability: 0, difficulty: 5, lapses: 0, lastReviewAt: 0, nextReviewAt: 0`

Exemplo — primeiro item do array:
```typescript
{
  id: 1,
  term: 'kind of',
  // ... campos existentes ...
  srs: 'learning',
  strength: 0.65,
  tags: [],
  stability: 0,
  difficulty: 5,
  lapses: 0,
  lastReviewAt: 0,
  nextReviewAt: 0,
},
```

Repetir para todos os 12 itens do array `VAULT`.

- [ ] **Commitar**

```bash
git add src/data/seed.ts
git commit -m "feat(fsrs): add FSRS fields to VaultItem type and seed data"
```

---

### Task 5: Implementar algoritmo FSRS

**Files:**
- Create: `src/utils/fsrs.ts`

- [ ] **Criar o arquivo `src/utils/fsrs.ts` com o conteúdo abaixo**

```typescript
import { VaultItem } from '../data/seed';

// FSRS-4.5 parâmetros pré-treinados no dataset do Anki
const W = [
  0.4072, 1.1829, 3.1262, 15.4722, // w0-w3: estabilidade inicial por grade
  7.2102, 0.5316,                   // w4-w5: dificuldade inicial
  1.0651, 0.0589,                   // w6-w7: atualização de dificuldade
  1.5060, 0.1544, 1.0140,           // w8-w10: estabilidade pós-recall
  1.9332, 0.1100, 0.2900, 0.2272,  // w11-w14: estabilidade pós-lapse
  2.9898, 0.5100,                   // w15-w16: penalidade difícil / bônus fácil
];

const DESIRED_RETENTION = 0.9;
const MS_PER_DAY = 86_400_000;

function clamp(v: number, lo: number, hi: number) {
  return Math.max(lo, Math.min(hi, v));
}

// Probabilidade de lembrar após `elapsedDays` com estabilidade `s`
export function getRetrievability(elapsedDays: number, stability: number): number {
  if (stability <= 0) return 0;
  return Math.pow(DESIRED_RETENTION, elapsedDays / stability);
}

function initStability(grade: number): number {
  return W[grade - 1];
}

function initDifficulty(grade: number): number {
  return clamp(W[4] - Math.exp(W[5] * (grade - 1)) + 1, 1, 10);
}

function updateDifficulty(d: number, grade: number): number {
  const d04 = initDifficulty(4);
  return clamp(W[6] * d04 + (1 - W[6]) * (d - W[7] * (grade - 3)), 1, 10);
}

function recallStability(d: number, s: number, r: number, grade: number): number {
  const hardPenalty = grade === 2 ? W[15] : 1;
  const easyBonus  = grade === 4 ? W[16] : 1;
  return s * (
    Math.exp(W[8]) * (11 - d) * Math.pow(s, -W[9]) *
    (Math.exp(W[10] * (1 - r)) - 1) * hardPenalty * easyBonus + 1
  );
}

function forgetStability(d: number, s: number, r: number): number {
  return (
    W[11] * Math.pow(d, -W[12]) *
    (Math.pow(s + 1, W[13]) - 1) *
    Math.exp(W[14] * (1 - r))
  );
}

export type FSRSPatch = Pick<
  VaultItem,
  'stability' | 'difficulty' | 'lapses' | 'lastReviewAt' | 'nextReviewAt' | 'strength' | 'srs'
>;

// Primeira revisão de um card novo
export function initFSRS(grade: 1 | 2 | 3 | 4): FSRSPatch {
  const stability  = initStability(grade);
  const difficulty = initDifficulty(grade);
  const interval   = Math.max(1, Math.round(stability));
  const now        = Date.now();
  return {
    stability,
    difficulty,
    lapses: 0,
    lastReviewAt: now,
    nextReviewAt: now + interval * MS_PER_DAY,
    strength: DESIRED_RETENTION,
    srs: interval >= 21 ? 'mature' : 'learning',
  };
}

// Revisões subsequentes
export function reviewFSRS(
  item: Pick<VaultItem, 'stability' | 'difficulty' | 'lapses' | 'lastReviewAt'>,
  grade: 1 | 2 | 3 | 4,
): FSRSPatch {
  const now         = Date.now();
  const elapsedDays = (now - item.lastReviewAt) / MS_PER_DAY;
  const r           = getRetrievability(elapsedDays, item.stability);
  const newDiff     = updateDifficulty(item.difficulty, grade);

  if (grade === 1) {
    const s = Math.max(0.1, forgetStability(item.difficulty, item.stability, r));
    return {
      stability: s,
      difficulty: newDiff,
      lapses: item.lapses + 1,
      lastReviewAt: now,
      nextReviewAt: now + 10 * 60_000, // 10 minutos
      strength: getRetrievability(0, s),
      srs: 'due',
    };
  }

  const s        = Math.max(0.1, recallStability(item.difficulty, item.stability, r, grade));
  const interval = Math.max(1, Math.round(s));
  return {
    stability: s,
    difficulty: newDiff,
    lapses: item.lapses,
    lastReviewAt: now,
    nextReviewAt: now + interval * MS_PER_DAY,
    strength: DESIRED_RETENTION,
    srs: interval >= 21 ? 'mature' : 'learning',
  };
}

// Calcula o intervalo previsto para cada grade sem commitar (usado para preview no UI)
export function previewIntervals(
  item: Pick<VaultItem, 'stability' | 'difficulty' | 'lapses' | 'lastReviewAt'>,
): Record<1 | 2 | 3 | 4, string> {
  const labels: Record<1 | 2 | 3 | 4, string> = { 1: '', 2: '', 3: '', 4: '' };
  ([1, 2, 3, 4] as const).forEach((g) => {
    const patch = item.lastReviewAt === 0 ? initFSRS(g) : reviewFSRS(item, g);
    if (g === 1) { labels[1] = '10m'; return; }
    const days = Math.round((patch.nextReviewAt - Date.now()) / MS_PER_DAY);
    labels[g] = days >= 30
      ? `${Math.round(days / 30)}mo`
      : days >= 7
      ? `${Math.round(days / 7)}sem`
      : `${days}d`;
  });
  return labels;
}
```

- [ ] **Commitar**

```bash
git add src/utils/fsrs.ts
git commit -m "feat(fsrs): implement FSRS-4.5 algorithm"
```

---

### Task 6: Atualizar store para FSRS

**Files:**
- Modify: `src/store/index.ts`

- [ ] **Substituir a assinatura de `updateSRS` para aceitar patch parcial**

Localizar `type VaultStore` (linha ~21) e alterar:

```typescript
type VaultStore = {
  items: VaultItem[];
  addItem: (item: Omit<VaultItem, 'id'>) => void;
  updateSRS: (id: number, patch: Partial<VaultItem>) => void;  // ← mudou
};
```

- [ ] **Atualizar a implementação de `updateSRS`**

```typescript
updateSRS: (id, patch) =>
  set((s) => ({
    items: s.items.map((v) => (v.id === id ? { ...v, ...patch } : v)),
  })),
```

- [ ] **Commitar**

```bash
git add src/store/index.ts
git commit -m "feat(store): updateSRS accepts Partial<VaultItem> for FSRS"
```

---

### Task 7: Integrar FSRS no SRSScreen

**Files:**
- Modify: `src/screens/SRSScreen.tsx`

- [ ] **Adicionar import do FSRS no topo do arquivo**

```typescript
import { initFSRS, reviewFSRS, previewIntervals } from '../utils/fsrs';
```

- [ ] **Substituir o filtro do deck (linha ~44)**

```typescript
// Antes:
const deck = items.filter((v) => v.srs !== 'mature' && v.gloss.trim());

// Depois:
const deck = items.filter(
  (v) => (v.lastReviewAt === 0 || v.nextReviewAt <= Date.now()) && v.gloss.trim(),
);
```

- [ ] **Remover a constante `SRS_NEXT` (linhas ~18-23) — não é mais usada**

- [ ] **Adicionar estado para preview de intervalos, logo após `cardLatencyMs`**

```typescript
const [intervals, setIntervals] = useState<Record<1|2|3|4, string> | null>(null);
```

- [ ] **Atualizar o efeito que reseta por card — calcular preview ao abrir o card**

```typescript
useEffect(() => {
  startTimeRef.current = Date.now();
  setCardLatencyMs(null);
  if (card) setIntervals(previewIntervals(card));
}, [currentIdx]);
```

- [ ] **Substituir a função `next` inteira**

```typescript
const GRADE_MAP = { again: 1, hard: 2, good: 3, easy: 4 } as const;

const next = (difficulty: keyof typeof GRADE_MAP) => {
  const grade = GRADE_MAP[difficulty];
  const patch = card.lastReviewAt === 0 ? initFSRS(grade) : reviewFSRS(card, grade);
  updateSRS(card.id, patch);

  setSessionCards((c) => c + 1);
  trackStudySession(1);
  setFlipped(false);
  flipAnim.setValue(0);

  if (currentIdx + 1 < deck.length) {
    setCurrentIdx((i) => i + 1);
  } else {
    navigation.goBack();
  }
};
```

- [ ] **Atualizar o array `DIFFICULTIES` para usar os intervalos calculados**

Substituir os `sub` fixos por dinâmicos — na renderização dos botões de dificuldade:

```typescript
// Substituir o bloco de renderização dos botões (dentro de flipped ? ...)
{flipped && intervals ? (
  <View style={{ paddingHorizontal: 14, paddingBottom: 18 }}>
    <Text style={styles.diffLabel}>QUÃO BEM VOCÊ LEMBROU?</Text>
    <View style={styles.diffRow}>
      {(
        [
          { key: 'again' as const, lbl: 'De novo', grade: 1 as const, c: '#B43E2A', bg: Colors.coralSoft },
          { key: 'hard'  as const, lbl: 'Difícil',  grade: 2 as const, c: '#A86B3C', bg: Colors.goldSoft },
          { key: 'good'  as const, lbl: 'Bom',      grade: 3 as const, c: Colors.mossDeep, bg: Colors.mossSoft },
          { key: 'easy'  as const, lbl: 'Fácil',    grade: 4 as const, c: Colors.ocean,    bg: Colors.oceanSoft },
        ] as const
      ).map((d) => (
        <TouchableOpacity
          key={d.key}
          onPress={() => next(d.key)}
          style={[styles.diffBtn, { backgroundColor: d.bg }]}
          activeOpacity={0.8}
        >
          <Text style={[styles.diffLbl, { color: d.c }]}>{d.lbl}</Text>
          <Text style={[styles.diffSub, { color: d.c }]}>{intervals[d.grade]}</Text>
        </TouchableOpacity>
      ))}
    </View>
  </View>
) : null}
```

- [ ] **Verificar manualmente:** abrir SRS, revisar um card, confirmar que os botões mostram intervalos reais (ex: "1d", "4d", "12d") em vez de fixos.

- [ ] **Commitar**

```bash
git add src/screens/SRSScreen.tsx
git commit -m "feat(srs): integrate FSRS-4.5 algorithm with dynamic intervals"
```

---

## Fase 3 — Triagem

### Task 8: Adicionar tipos e seed data para Triagem

**Files:**
- Modify: `src/data/seed.ts`

- [ ] **Adicionar o tipo `VocabSuggestion` após o tipo `ContentItem`**

```typescript
export type VocabSuggestion = {
  term: string;
  type: VaultItem['type'];
  gloss: string;
  example?: string;
  source: string;
  level?: string;
  function?: CommunicativeFunction;
};
```

- [ ] **Adicionar o tipo `NewsArticle` após `VocabSuggestion`**

```typescript
export type NewsArticle = {
  id: string;
  title: string;
  level: 1 | 2 | 3;
  topic: string;
  date: string;
  text: string;
  vocabulary: VocabSuggestion[];
};
```

- [ ] **Adicionar o campo `vocabulary` ao tipo `ContentItem`**

```typescript
export type ContentItem = {
  id: string;
  kind: 'podcast' | 'book' | 'video' | 'article';
  title: string;
  author: string;
  minutes: number | string;
  level: string;
  match: number;
  art: string;
  why: string;
  tags: string[];
  vocabulary?: VocabSuggestion[];   // ← adicionar
};
```

- [ ] **Commitar**

```bash
git add src/data/seed.ts
git commit -m "feat(seed): add VocabSuggestion, NewsArticle types and vocabulary field"
```

---

### Task 9: Criar TriagemScreen

**Files:**
- Create: `src/screens/TriagemScreen.tsx`

- [ ] **Criar o arquivo com o conteúdo abaixo**

```typescript
import React, { useState, useMemo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { Colors, Radius, Spacing } from '../theme';
import { PgChip, Icons } from '../components';
import { useVaultStore } from '../store';
import { VocabSuggestion } from '../data/seed';
import { RootStackParamList } from '../navigation';

type Route = RouteProp<RootStackParamList, 'Triagem'>;

export default function TriagemScreen() {
  const navigation = useNavigation();
  const route      = useRoute<Route>();
  const { suggestions, title, subtitle } = route.params;
  const { items, addItem } = useVaultStore();

  const pending = useMemo(
    () => suggestions.filter(
      (s) => !items.some((v) => v.term.toLowerCase() === s.term.toLowerCase()),
    ),
    [],
  );

  const [index, setIndex] = useState(0);
  const [added, setAdded] = useState(0);
  const [done,  setDone]  = useState(false);

  const current = pending[index];

  const advance = () => {
    if (index + 1 >= pending.length) setDone(true);
    else setIndex((i) => i + 1);
  };

  const handleAdd = () => {
    const now = new Date();
    addItem({
      term: current.term,
      type: current.type,
      lang: 'en→pt',
      gloss: current.gloss,
      source: current.source,
      date: `${now.toLocaleDateString('pt-BR')} · ${now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`,
      example: current.example ?? '',
      srs: 'new',
      strength: 0,
      tags: [],
      function: current.function,
      stability: 0,
      difficulty: 5,
      lapses: 0,
      lastReviewAt: 0,
      nextReviewAt: 0,
    });
    setAdded((a) => a + 1);
    advance();
  };

  function typeColor(type: VocabSuggestion['type']) {
    switch (type) {
      case 'reduction':   return { c: Colors.ocean,   soft: Colors.oceanSoft };
      case 'collocation': return { c: Colors.gold,    soft: Colors.goldSoft };
      case 'phonetic':    return { c: Colors.coral,   soft: Colors.coralSoft };
      case 'chunk':       return { c: Colors.purple,  soft: Colors.purpleSoft };
      default:            return { c: Colors.moss,    soft: Colors.mossSoft };
    }
  }

  if (done || pending.length === 0) {
    return (
      <SafeAreaView style={s.safe}>
        <View style={s.done}>
          <Text style={s.doneIcon}>✓</Text>
          <Text style={s.doneTitle}>
            {added === 0
              ? 'Nenhuma palavra adicionada'
              : `${added} ${added === 1 ? 'palavra adicionada' : 'palavras adicionadas'}`}
          </Text>
          <Text style={s.doneSub}>
            {added > 0
              ? 'Elas já estão no seu Vault prontas para revisão.'
              : 'Você pulou todas as sugestões.'}
          </Text>
          <TouchableOpacity style={s.doneBtn} onPress={() => navigation.goBack()} activeOpacity={0.85}>
            <Text style={s.doneBtnText}>Voltar</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const { c, soft } = typeColor(current.type);
  const progress    = index / pending.length;

  return (
    <SafeAreaView style={s.safe}>
      <View style={s.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={s.closeBtn} activeOpacity={0.7}>
          <Icons.Close size={20} color={Colors.ink} />
        </TouchableOpacity>
        <View style={{ flex: 1, alignItems: 'center' }}>
          <Text style={s.headerTitle}>{title}</Text>
          <Text style={s.headerSub}>{subtitle}</Text>
        </View>
        <View style={s.closeBtn}>
          <Text style={s.counter}>{index + 1} / {pending.length}</Text>
        </View>
      </View>

      <View style={s.track}>
        <View style={[s.fill, { width: `${progress * 100}%` as any }]} />
      </View>

      <View style={s.cardArea}>
        <View style={s.card}>
          <PgChip c={c} soft={soft}>{current.type}</PgChip>
          <Text style={s.term}>{current.term}</Text>
          <Text style={s.gloss}>{current.gloss}</Text>
          {current.example ? <Text style={s.example}>"{current.example}"</Text> : null}
          <View style={s.badge}>
            <Icons.Bookmark size={11} color={Colors.inkMute} />
            <Text style={s.badgeText}>{current.source}</Text>
          </View>
        </View>
      </View>

      <View style={s.actions}>
        <TouchableOpacity style={s.skip} onPress={advance} activeOpacity={0.8}>
          <Text style={s.skipText}>Pular</Text>
        </TouchableOpacity>
        <TouchableOpacity style={s.add} onPress={handleAdd} activeOpacity={0.85}>
          <Text style={s.addText}>Adicionar ao Vault</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe:       { flex: 1, backgroundColor: Colors.sand },
  header:     { flexDirection: 'row', alignItems: 'center', paddingHorizontal: Spacing.lg, paddingTop: 8, paddingBottom: 8 },
  closeBtn:   { width: 48, alignItems: 'center', justifyContent: 'center' },
  headerTitle:{ fontSize: 14, fontWeight: '700', color: Colors.ink },
  headerSub:  { fontSize: 11, color: Colors.inkMute, marginTop: 2 },
  counter:    { fontSize: 12, fontWeight: '600', color: Colors.inkMute },
  track:      { height: 3, backgroundColor: Colors.line, marginHorizontal: Spacing.lg },
  fill:       { height: 3, backgroundColor: Colors.moss, borderRadius: 2 },
  cardArea:   { flex: 1, paddingHorizontal: Spacing.lg, paddingTop: 24, justifyContent: 'center' },
  card:       { backgroundColor: Colors.paper, borderRadius: Radius.lg, borderWidth: 0.5, borderColor: Colors.line, padding: 28, shadowColor: Colors.ink, shadowOpacity: 0.06, shadowRadius: 20, shadowOffset: { width: 0, height: 8 }, elevation: 3 },
  term:       { fontSize: 34, fontWeight: '600', color: Colors.ink, letterSpacing: -0.8, marginTop: 16, marginBottom: 12 },
  gloss:      { fontSize: 16, color: Colors.inkSoft, lineHeight: 24, marginBottom: 12 },
  example:    { fontSize: 14, fontStyle: 'italic', color: Colors.inkMute, lineHeight: 20, marginBottom: 16 },
  badge:      { flexDirection: 'row', alignItems: 'center', gap: 5, alignSelf: 'flex-start', backgroundColor: Colors.sandDeep, borderRadius: Radius.full, paddingHorizontal: 10, paddingVertical: 4 },
  badgeText:  { fontSize: 11, color: Colors.inkMute, fontWeight: '500' },
  actions:    { flexDirection: 'row', gap: 10, paddingHorizontal: Spacing.lg, paddingBottom: 24, paddingTop: 12 },
  skip:       { flex: 1, height: 50, borderRadius: Radius.full, borderWidth: 1, borderColor: Colors.lineStrong, alignItems: 'center', justifyContent: 'center' },
  skipText:   { fontSize: 14, fontWeight: '600', color: Colors.inkSoft },
  add:        { flex: 2, height: 50, borderRadius: Radius.full, backgroundColor: Colors.moss, alignItems: 'center', justifyContent: 'center' },
  addText:    { fontSize: 14, fontWeight: '700', color: Colors.sand },
  done:       { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32 },
  doneIcon:   { fontSize: 48, marginBottom: 20, color: Colors.moss },
  doneTitle:  { fontSize: 22, fontWeight: '700', color: Colors.ink, textAlign: 'center', letterSpacing: -0.4 },
  doneSub:    { fontSize: 14, color: Colors.inkMute, textAlign: 'center', marginTop: 10, lineHeight: 20 },
  doneBtn:    { marginTop: 28, backgroundColor: Colors.moss, paddingHorizontal: 32, paddingVertical: 14, borderRadius: Radius.full },
  doneBtnText:{ color: Colors.sand, fontWeight: '700', fontSize: 14 },
});
```

- [ ] **Commitar**

```bash
git add src/screens/TriagemScreen.tsx
git commit -m "feat(triagem): create reusable TriagemScreen"
```

---

### Task 10: Registrar rotas novas na navegação

**Files:**
- Modify: `src/navigation/index.tsx`

- [ ] **Adicionar imports dos novos screens no topo do arquivo**

```typescript
import TriagemScreen       from '../screens/TriagemScreen';
import NewsListScreen      from '../screens/NewsListScreen';
import NewsArticleScreen   from '../screens/NewsArticleScreen';
import ContentDetailScreen from '../screens/ContentDetailScreen';
```

- [ ] **Adicionar as rotas ao tipo `RootStackParamList`**

```typescript
export type RootStackParamList = {
  Main: undefined;
  Shadowing: undefined;
  SRS: undefined;
  Capture: undefined;
  Pronunciation: undefined;
  Zipf: undefined;
  Profile: undefined;
  Onboarding: undefined;
  // novas:
  Triagem: { suggestions: VocabSuggestion[]; title: string; subtitle: string };
  NewsList: undefined;
  NewsArticle: { articleId: string };
  ContentDetail: { contentId: string };
};
```

Adicionar o import necessário no topo:
```typescript
import { VocabSuggestion } from '../data/seed';
```

- [ ] **Registrar as telas no `Stack.Navigator` (após a rota `Profile`)**

```typescript
<Stack.Screen name="Triagem"       component={TriagemScreen}       options={{ presentation: 'modal' }} />
<Stack.Screen name="NewsList"      component={NewsListScreen}      options={{ presentation: 'modal' }} />
<Stack.Screen name="NewsArticle"   component={NewsArticleScreen}   />
<Stack.Screen name="ContentDetail" component={ContentDetailScreen} />
```

- [ ] **Commitar** (vai falhar com TS se os screens ainda não existirem — criar arquivos vazios temporários se necessário)

```typescript
// Arquivo temporário para NewsListScreen.tsx, NewsArticleScreen.tsx, ContentDetailScreen.tsx:
import React from 'react';
import { View } from 'react-native';
export default function PlaceholderScreen() { return <View />; }
```

```bash
git add src/navigation/index.tsx src/screens/NewsListScreen.tsx src/screens/NewsArticleScreen.tsx src/screens/ContentDetailScreen.tsx
git commit -m "feat(nav): register Triagem, NewsList, NewsArticle, ContentDetail routes"
```

---

## Fase 4 — Zipf Top 500

### Task 11: Seed data — ZIPF_TOP_500

**Files:**
- Modify: `src/data/seed.ts`

- [ ] **Verificar se o tipo `ZipfWord` já existe em seed.ts. Se sim, atualizá-lo para incluir `gloss` e `example`; se não, criar**

```typescript
export type ZipfWord = {
  rank: number;
  word: string;
  type: VaultItem['type'];
  gloss: string;
  example: string;
};
```

- [ ] **Adicionar o array `ZIPF_TOP_500` ao final de seed.ts**

O array completo deve ter 500 itens. Abaixo estão os 50 mais frequentes — continuar o padrão até rank 500 usando frequencylist.com como referência para ranqueamento e um dicionário PT-EN para os glosses:

```typescript
export const ZIPF_TOP_500: ZipfWord[] = [
  { rank: 1,   word: 'the',      type: 'word',  gloss: 'artigo definido — o, a, os, as',                          example: 'The book is on the table.' },
  { rank: 2,   word: 'be',       type: 'word',  gloss: 'ser ou estar (verbo auxiliar)',                            example: 'She will be here soon.' },
  { rank: 3,   word: 'to',       type: 'word',  gloss: 'para; partícula de infinitivo',                            example: 'I want to learn English.' },
  { rank: 4,   word: 'of',       type: 'word',  gloss: 'de (preposição de posse/relação)',                         example: 'A cup of coffee.' },
  { rank: 5,   word: 'and',      type: 'word',  gloss: 'e (conjunção aditiva)',                                    example: 'cats and dogs' },
  { rank: 6,   word: 'a',        type: 'word',  gloss: 'artigo indefinido — um, uma',                              example: 'I saw a dog.' },
  { rank: 7,   word: 'in',       type: 'word',  gloss: 'em, dentro de (preposição de lugar/tempo)',                example: 'She lives in Brazil.' },
  { rank: 8,   word: 'that',     type: 'word',  gloss: 'que; esse/essa; aquele/aquela',                            example: 'I think that it\'s true.' },
  { rank: 9,   word: 'have',     type: 'word',  gloss: 'ter; possuir; auxiliar de perfeito',                       example: 'I have finished my work.' },
  { rank: 10,  word: 'it',       type: 'word',  gloss: 'pronome neutro — isso, ele, ela (objetos/ideias)',         example: 'It is raining.' },
  { rank: 11,  word: 'for',      type: 'word',  gloss: 'para; por; durante (preposição)',                          example: 'I\'ve been here for two hours.' },
  { rank: 12,  word: 'not',      type: 'word',  gloss: 'não (negação)',                                            example: 'I do not agree.' },
  { rank: 13,  word: 'on',       type: 'word',  gloss: 'sobre, em cima de; em (preposição)',                       example: 'Put it on the table.' },
  { rank: 14,  word: 'with',     type: 'word',  gloss: 'com (preposição de companhia/instrumento)',                example: 'She came with her friend.' },
  { rank: 15,  word: 'he',       type: 'word',  gloss: 'ele (pronome sujeito masculino)',                          example: 'He is my brother.' },
  { rank: 16,  word: 'as',       type: 'word',  gloss: 'como; enquanto; tão…quanto',                               example: 'As a teacher, she inspires many.' },
  { rank: 17,  word: 'you',      type: 'word',  gloss: 'você; vocês (pronome)',                                    example: 'You are doing great.' },
  { rank: 18,  word: 'do',       type: 'word',  gloss: 'fazer; auxiliar de negação/pergunta',                      example: 'Do you speak English?' },
  { rank: 19,  word: 'at',       type: 'word',  gloss: 'em, às (preposição de lugar/hora específica)',             example: 'I\'ll meet you at 5pm.' },
  { rank: 20,  word: 'this',     type: 'word',  gloss: 'este, esta, isso (demonstrativo próximo)',                 example: 'This is my favorite book.' },
  { rank: 21,  word: 'but',      type: 'word',  gloss: 'mas, porém (conjunção adversativa)',                       example: 'I tried, but I failed.' },
  { rank: 22,  word: 'his',      type: 'word',  gloss: 'dele, seu/sua (possessivo masculino)',                     example: 'That\'s his car.' },
  { rank: 23,  word: 'by',       type: 'word',  gloss: 'por; ao lado de; até (preposição)',                        example: 'The book was written by her.' },
  { rank: 24,  word: 'from',     type: 'word',  gloss: 'de; desde; a partir de (preposição de origem)',            example: 'She\'s from Japan.' },
  { rank: 25,  word: 'they',     type: 'word',  gloss: 'eles, elas (pronome plural)',                              example: 'They are coming tomorrow.' },
  { rank: 26,  word: 'we',       type: 'word',  gloss: 'nós (pronome)',                                            example: 'We should talk.' },
  { rank: 27,  word: 'say',      type: 'word',  gloss: 'dizer, falar',                                             example: 'What did you say?' },
  { rank: 28,  word: 'her',      type: 'word',  gloss: 'ela (objeto); dela (possessivo feminino)',                  example: 'I called her yesterday.' },
  { rank: 29,  word: 'she',      type: 'word',  gloss: 'ela (pronome sujeito feminino)',                            example: 'She knows the answer.' },
  { rank: 30,  word: 'or',       type: 'word',  gloss: 'ou (conjunção alternativa)',                               example: 'Coffee or tea?' },
  { rank: 31,  word: 'an',       type: 'word',  gloss: 'artigo indefinido antes de vogal — um, uma',              example: 'I have an idea.' },
  { rank: 32,  word: 'will',     type: 'word',  gloss: 'auxiliar de futuro; vontade',                              example: 'I will call you later.' },
  { rank: 33,  word: 'my',       type: 'word',  gloss: 'meu, minha (possessivo)',                                  example: 'My name is Ana.' },
  { rank: 34,  word: 'one',      type: 'word',  gloss: 'um (numeral); alguém (pronome genérico)',                  example: 'One must be careful.' },
  { rank: 35,  word: 'all',      type: 'word',  gloss: 'todo, todos, tudo',                                        example: 'All the students passed.' },
  { rank: 36,  word: 'would',    type: 'word',  gloss: 'auxiliar condicional/passado de will',                     example: 'I would love to come.' },
  { rank: 37,  word: 'there',    type: 'word',  gloss: 'lá; há/existe (there is/are)',                             example: 'There is a problem.' },
  { rank: 38,  word: 'their',    type: 'word',  gloss: 'deles, delas (possessivo plural)',                         example: 'Their house is big.' },
  { rank: 39,  word: 'what',     type: 'word',  gloss: 'o que; que (interrogativo/relativo)',                      example: 'What do you mean?' },
  { rank: 40,  word: 'so',       type: 'word',  gloss: 'então; tão; portanto',                                     example: 'So, what happened?' },
  { rank: 41,  word: 'up',       type: 'word',  gloss: 'para cima; completamente (partícula verbal)',              example: 'Pick it up.' },
  { rank: 42,  word: 'out',      type: 'word',  gloss: 'para fora; fora (partícula/adv)',                          example: 'Get out of here.' },
  { rank: 43,  word: 'if',       type: 'word',  gloss: 'se (conjunção condicional)',                               example: 'If you need help, call me.' },
  { rank: 44,  word: 'about',    type: 'word',  gloss: 'sobre; acerca de; mais ou menos',                          example: 'Tell me about yourself.' },
  { rank: 45,  word: 'who',      type: 'word',  gloss: 'quem (interrogativo/relativo)',                             example: 'Who are you?' },
  { rank: 46,  word: 'get',      type: 'word',  gloss: 'pegar; obter; ficar; entender',                            example: 'I get what you mean.' },
  { rank: 47,  word: 'which',    type: 'word',  gloss: 'qual; que; o qual (relativo)',                              example: 'Which one do you prefer?' },
  { rank: 48,  word: 'go',       type: 'word',  gloss: 'ir; funcionar; acontecer',                                 example: 'Let\'s go!' },
  { rank: 49,  word: 'me',       type: 'word',  gloss: 'me, mim (pronome objeto)',                                  example: 'Call me.' },
  { rank: 50,  word: 'when',     type: 'word',  gloss: 'quando (interrogativo/conjunção)',                          example: 'When does it start?' },
  // Continuar de rank 51 até 500 seguindo o mesmo padrão.
  // Fonte de ranqueamento: frequencylist.com/list/english/
  // Fonte de glosses: dicionário Oxford/Michaelis PT-EN
];
```

> **Nota de implementação:** Os ranks 51–500 devem ser populados antes do release. A lista completa de palavras ranqueadas está disponível em frequencylist.com — cada entrada precisa de `type` (usar 'word' para palavras funcionais e ajustar para 'collocation'/'phrase' conforme necessário), `gloss` em PT e `example` em inglês.

- [ ] **Commitar**

```bash
git add src/data/seed.ts
git commit -m "feat(seed): add ZIPF_TOP_500 structure and top 50 entries"
```

---

### Task 12: Atualizar ZipfScreen com bandas e triagem

**Files:**
- Modify: `src/screens/ZipfScreen.tsx`

- [ ] **Adicionar imports no topo do arquivo**

```typescript
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ZIPF_TOP_500 } from '../data/seed';
import { useVaultStore } from '../store';
import { RootStackParamList } from '../navigation';
```

- [ ] **Dentro do componente, após os hooks existentes, calcular cobertura e bandas**

```typescript
const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
const { items } = useVaultStore();

const inVault = (word: string) =>
  items.some((v) => v.term.toLowerCase() === word.toLowerCase());

const band1 = ZIPF_TOP_500.filter((z) => z.rank <= 100);
const band2 = ZIPF_TOP_500.filter((z) => z.rank > 100 && z.rank <= 300);
const band3 = ZIPF_TOP_500.filter((z) => z.rank > 300 && z.rank <= 500);

const cov1 = band1.filter((z) => inVault(z.word)).length;
const cov2 = band2.filter((z) => inVault(z.word)).length;
const cov3 = band3.filter((z) => inVault(z.word)).length;
const total = cov1 + cov2 + cov3;
const pct   = ZIPF_TOP_500.length > 0
  ? Math.round((total / ZIPF_TOP_500.length) * 100)
  : 0;

function openBandTriagem(band: typeof band1, label: string) {
  const suggestions = band
    .filter((z) => !inVault(z.word))
    .map((z) => ({
      term: z.word,
      type: z.type,
      gloss: z.gloss,
      example: z.example,
      source: `Zipf #${z.rank}`,
    }));
  navigation.navigate('Triagem', {
    suggestions,
    title: 'Palavras Frequentes',
    subtitle: label,
  });
}
```

- [ ] **No JSX, substituir o hero card para usar `pct` calculado dinamicamente**

Localizar onde o hero card exibe a porcentagem (provavelmente algo como `{zipfPct}%`) e substituir por `{pct}%`. Ajustar o texto "das top 2.000" para "das top 500".

- [ ] **Antes da lista de palavras existente, adicionar a seção de bandas**

```typescript
{/* Bandas de frequência */}
<View style={{ paddingHorizontal: Spacing.lg, gap: 10, marginBottom: 20 }}>
  {[
    { band: band1, cov: cov1, total: 100,  label: '🏆 Top 1–100',    sub: 'Essenciais' },
    { band: band2, cov: cov2, total: 200,  label: '⚡ Top 101–300',  sub: 'Frequentes' },
    { band: band3, cov: cov3, total: 200,  label: '📈 Top 301–500',  sub: 'Avançadas' },
  ].map(({ band, cov, total: tot, label, sub }) => {
    const remaining = band.filter((z) => !inVault(z.word)).length;
    return (
      <View key={label} style={{ backgroundColor: Colors.paper, borderRadius: Radius.md, borderWidth: 0.5, borderColor: Colors.line, padding: 14 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
          <View>
            <Text style={{ fontSize: 13, fontWeight: '700', color: Colors.ink }}>{label}</Text>
            <Text style={{ fontSize: 11, color: Colors.inkMute, marginTop: 1 }}>{sub} · {cov} / {tot} capturadas</Text>
          </View>
          <TouchableOpacity
            onPress={() => openBandTriagem(band, `${label} · ${remaining} para capturar`)}
            disabled={remaining === 0}
            style={{ backgroundColor: remaining === 0 ? Colors.mossSoft : Colors.moss, borderRadius: Radius.full, paddingHorizontal: 14, paddingVertical: 7 }}
            activeOpacity={0.85}
          >
            <Text style={{ fontSize: 12, fontWeight: '700', color: remaining === 0 ? Colors.moss : Colors.sand }}>
              {remaining === 0 ? '✓ Completo' : `Treinar → ${remaining}`}
            </Text>
          </TouchableOpacity>
        </View>
        <View style={{ height: 4, backgroundColor: Colors.line, borderRadius: 2 }}>
          <View style={{ height: 4, backgroundColor: Colors.moss, borderRadius: 2, width: `${(cov / tot) * 100}%` as any }} />
        </View>
      </View>
    );
  })}
</View>
```

- [ ] **Verificar manualmente:** ZipfScreen mostra 3 bandas com barras de progresso e botões "Treinar →". Tocar num botão abre TriagemScreen com as palavras daquela banda.

- [ ] **Commitar**

```bash
git add src/screens/ZipfScreen.tsx
git commit -m "feat(zipf): add frequency bands with triagem integration"
```

---

## Fase 5 — News in Levels

### Task 13: Seed data — NEWS_ARTICLES

**Files:**
- Modify: `src/data/seed.ts`

- [ ] **Adicionar o array `NEWS_ARTICLES` ao final de seed.ts**

```typescript
export const NEWS_ARTICLES: NewsArticle[] = [
  // ── LEVEL 1 (A2) ──────────────────────────────────────────────────────────
  {
    id: 'news-l1-01',
    title: 'A New School Opens in the City',
    level: 1,
    topic: 'Education',
    date: '2026-04-20',
    text: 'A new school opened in the city last week. The school has 500 students. The students are happy. The teachers are happy too. The school has new computers and a big library. Parents say it is a great place to learn.',
    vocabulary: [
      { term: 'opened', type: 'word', gloss: 'abriu (passado de open)', example: 'The new school opened last week.', source: 'News · Level 1' },
      { term: 'library', type: 'word', gloss: 'biblioteca', example: 'The school has a big library.', source: 'News · Level 1' },
      { term: 'parents', type: 'word', gloss: 'pais (pai e mãe)', example: 'Parents say it is a great place.', source: 'News · Level 1' },
      { term: 'great place to learn', type: 'phrase', gloss: 'ótimo lugar para aprender', example: 'It is a great place to learn.', source: 'News · Level 1' },
    ],
  },
  {
    id: 'news-l1-02',
    title: 'Scientists Find Water on Mars',
    level: 1,
    topic: 'Science',
    date: '2026-04-15',
    text: 'Scientists say they found water on Mars. The water is under the ground. It is very cold there. Mars is far from Earth. People cannot live on Mars now. But scientists want to learn more about it.',
    vocabulary: [
      { term: 'scientists', type: 'word', gloss: 'cientistas', example: 'Scientists found water on Mars.', source: 'News · Level 1' },
      { term: 'under the ground', type: 'phrase', gloss: 'embaixo da terra / subterrâneo', example: 'The water is under the ground.', source: 'News · Level 1' },
      { term: 'far from', type: 'collocation', gloss: 'longe de', example: 'Mars is far from Earth.', source: 'News · Level 1' },
      { term: 'learn more about', type: 'chunk', gloss: 'aprender mais sobre', example: 'Scientists want to learn more about it.', source: 'News · Level 1', function: 'clarifying' },
    ],
  },
  {
    id: 'news-l1-03',
    title: 'Dogs Help People Feel Better',
    level: 1,
    topic: 'Health',
    date: '2026-04-10',
    text: 'A new study says dogs help people feel better. When you are sad, a dog can make you happy. Doctors say people with dogs are healthier. Dogs are good for your heart. Many hospitals now have dogs for patients.',
    vocabulary: [
      { term: 'study', type: 'word', gloss: 'estudo (pesquisa científica)', example: 'A new study says dogs help people.', source: 'News · Level 1' },
      { term: 'feel better', type: 'phrase', gloss: 'sentir-se melhor', example: 'Dogs help people feel better.', source: 'News · Level 1' },
      { term: 'healthier', type: 'word', gloss: 'mais saudável (comparativo de healthy)', example: 'People with dogs are healthier.', source: 'News · Level 1' },
      { term: 'patients', type: 'word', gloss: 'pacientes (hospital)', example: 'Hospitals have dogs for patients.', source: 'News · Level 1' },
    ],
  },
  // ── LEVEL 2 (B1) ──────────────────────────────────────────────────────────
  {
    id: 'news-l2-01',
    title: 'Teenagers Spend Too Much Time on Phones',
    level: 2,
    topic: 'Technology',
    date: '2026-04-18',
    text: 'A recent survey found that teenagers spend an average of seven hours a day on their smartphones. Experts are concerned about the impact on mental health and sleep quality. Some schools have introduced phone bans during lessons, which has led to improved concentration and better academic results.',
    vocabulary: [
      { term: 'survey', type: 'word', gloss: 'pesquisa/enquete (coleta de dados)', example: 'A recent survey found that teenagers...', source: 'News · Level 2' },
      { term: 'are concerned about', type: 'chunk', gloss: 'estão preocupados com', example: 'Experts are concerned about the impact.', source: 'News · Level 2', function: 'reacting' },
      { term: 'phone ban', type: 'collocation', gloss: 'proibição de celulares', example: 'Some schools introduced phone bans.', source: 'News · Level 2' },
      { term: 'led to', type: 'phrase', gloss: 'resultou em / levou a', example: 'The ban led to improved concentration.', source: 'News · Level 2' },
      { term: 'academic results', type: 'collocation', gloss: 'resultados acadêmicos / desempenho escolar', example: 'Students showed better academic results.', source: 'News · Level 2' },
    ],
  },
  {
    id: 'news-l2-02',
    title: 'Electric Cars Are Becoming More Popular',
    level: 2,
    topic: 'Technology',
    date: '2026-04-12',
    text: 'Sales of electric vehicles have increased by 35% this year, according to industry data. Many governments are offering tax incentives to encourage people to switch from petrol cars. However, critics point out that charging infrastructure is still insufficient in rural areas, making the transition challenging for many drivers.',
    vocabulary: [
      { term: 'tax incentives', type: 'collocation', gloss: 'incentivos fiscais / benefícios tributários', example: 'Governments offer tax incentives.', source: 'News · Level 2' },
      { term: 'charging infrastructure', type: 'collocation', gloss: 'infraestrutura de recarga (elétrica)', example: 'Charging infrastructure is insufficient.', source: 'News · Level 2' },
      { term: 'point out', type: 'phrase', gloss: 'apontar / ressaltar', example: 'Critics point out the challenges.', source: 'News · Level 2' },
      { term: 'rural areas', type: 'collocation', gloss: 'áreas rurais / interior', example: 'Infrastructure is lacking in rural areas.', source: 'News · Level 2' },
      { term: 'make the transition', type: 'chunk', gloss: 'fazer a transição', example: 'The transition is challenging for drivers.', source: 'News · Level 2', function: 'transitioning' },
    ],
  },
  {
    id: 'news-l2-03',
    title: 'Coffee Prices Hit Record High',
    level: 2,
    topic: 'World',
    date: '2026-04-08',
    text: 'Global coffee prices have reached their highest level in 50 years due to poor harvests in Brazil and Vietnam, which together account for over half of the world\'s supply. Retailers are warning consumers to expect higher prices at cafés and supermarkets. Some economists believe prices could remain elevated for at least two years.',
    vocabulary: [
      { term: 'hit a record high', type: 'phrase', gloss: 'atingir um recorde histórico', example: 'Coffee prices hit a record high.', source: 'News · Level 2' },
      { term: 'poor harvest', type: 'collocation', gloss: 'safra ruim / colheita fraca', example: 'Poor harvests caused price increases.', source: 'News · Level 2' },
      { term: 'account for', type: 'phrase', gloss: 'representar / corresponder a (porcentagem/parte)', example: 'They account for half of the supply.', source: 'News · Level 2' },
      { term: 'elevated', type: 'word', gloss: 'elevado / alto (formal)', example: 'Prices could remain elevated.', source: 'News · Level 2' },
      { term: 'at least', type: 'phrase', gloss: 'pelo menos / no mínimo', example: 'For at least two years.', source: 'News · Level 2' },
    ],
  },
  // ── LEVEL 3 (B2) ──────────────────────────────────────────────────────────
  {
    id: 'news-l3-01',
    title: 'Artificial Intelligence Reshaping the Job Market',
    level: 3,
    topic: 'Technology',
    date: '2026-04-22',
    text: 'A landmark report by the World Economic Forum predicts that AI and automation will displace 85 million jobs globally by 2025, while simultaneously creating 97 million new roles. The disparity lies in skills: routine cognitive tasks are increasingly vulnerable to automation, whereas positions requiring emotional intelligence, creative problem-solving, and complex human interaction are proving more resilient. Critics argue the transition will disproportionately affect lower-income workers who lack access to retraining programmes.',
    vocabulary: [
      { term: 'landmark report', type: 'collocation', gloss: 'relatório histórico / estudo marcante', example: 'A landmark report predicts major changes.', source: 'News · Level 3' },
      { term: 'displace', type: 'word', gloss: 'deslocar / substituir (empregos)', example: 'AI will displace millions of jobs.', source: 'News · Level 3' },
      { term: 'simultaneously', type: 'word', gloss: 'simultaneamente / ao mesmo tempo', example: 'Jobs are lost and created simultaneously.', source: 'News · Level 3' },
      { term: 'vulnerable to', type: 'collocation', gloss: 'vulnerável a / suscetível a', example: 'Routine tasks are vulnerable to automation.', source: 'News · Level 3' },
      { term: 'disproportionately affect', type: 'collocation', gloss: 'afetar desproporcionalmente', example: 'Changes disproportionately affect low-income workers.', source: 'News · Level 3' },
      { term: 'retraining programmes', type: 'collocation', gloss: 'programas de requalificação profissional', example: 'Workers lack access to retraining programmes.', source: 'News · Level 3' },
    ],
  },
  {
    id: 'news-l3-02',
    title: 'Microplastics Found in Human Blood',
    level: 3,
    topic: 'Health',
    date: '2026-04-14',
    text: 'Researchers have detected microplastics in human blood for the first time, raising profound concerns about long-term health implications. The study, published in Environment International, analysed samples from 22 anonymous donors and found plastic particles in 77% of them. While the full ramifications remain unclear, preliminary evidence suggests microplastics may trigger inflammatory responses and accumulate in organs over time. Scientists are calling for urgent regulatory action to curb plastic pollution at its source.',
    vocabulary: [
      { term: 'profound concerns', type: 'collocation', gloss: 'preocupações profundas / sérias inquietações', example: 'The findings raise profound concerns.', source: 'News · Level 3' },
      { term: 'ramifications', type: 'word', gloss: 'ramificações / consequências (formal)', example: 'The full ramifications remain unclear.', source: 'News · Level 3' },
      { term: 'trigger', type: 'word', gloss: 'desencadear / disparar (um processo)', example: 'Microplastics may trigger inflammation.', source: 'News · Level 3' },
      { term: 'accumulate', type: 'word', gloss: 'acumular-se / se depositar ao longo do tempo', example: 'Plastics accumulate in organs.', source: 'News · Level 3' },
      { term: 'curb', type: 'word', gloss: 'conter / frear / limitar (formal)', example: 'Scientists call to curb plastic pollution.', source: 'News · Level 3' },
      { term: 'calling for', type: 'chunk', gloss: 'reivindicando / pedindo / exigindo (ação)', example: 'Scientists are calling for urgent action.', source: 'News · Level 3', function: 'emphasizing' },
    ],
  },
  {
    id: 'news-l3-03',
    title: 'Remote Work Permanently Reshaping Urban Planning',
    level: 3,
    topic: 'World',
    date: '2026-04-05',
    text: 'The sustained shift towards remote and hybrid work arrangements is fundamentally altering the dynamics of urban centres. Once-thriving business districts are grappling with persistently high office vacancy rates, prompting city authorities to explore adaptive reuse strategies — converting commercial spaces into residential units and mixed-use developments. Economists warn this structural transformation could erode municipal tax revenues, while urban planners see an opportunity to create more liveable, people-centred cities.',
    vocabulary: [
      { term: 'grappling with', type: 'chunk', gloss: 'lidando com / enfrentando (desafio persistente)', example: 'Districts are grappling with high vacancy.', source: 'News · Level 3', function: 'storytelling' },
      { term: 'adaptive reuse', type: 'collocation', gloss: 'reuso adaptativo (converter edifícios para novos usos)', example: 'Cities explore adaptive reuse strategies.', source: 'News · Level 3' },
      { term: 'erode', type: 'word', gloss: 'erodir / desgastar / reduzir gradualmente', example: 'Changes could erode tax revenues.', source: 'News · Level 3' },
      { term: 'municipal', type: 'word', gloss: 'municipal / da prefeitura', example: 'Municipal tax revenues could fall.', source: 'News · Level 3' },
      { term: 'people-centred', type: 'collocation', gloss: 'centrado nas pessoas / humanizado', example: 'Creating more people-centred cities.', source: 'News · Level 3' },
      { term: 'vacancy rate', type: 'collocation', gloss: 'taxa de vacância / ocupação vaga', example: 'High office vacancy rates persist.', source: 'News · Level 3' },
    ],
  },
];
```

- [ ] **Commitar**

```bash
git add src/data/seed.ts
git commit -m "feat(seed): add NEWS_ARTICLES with 9 curated articles (3 per level)"
```

> **Nota:** Adicionar mais 6 artigos (2 por nível) antes do release para chegar a 5 por nível conforme o design spec. Seguir o mesmo padrão de 5–8 `VocabSuggestion` por artigo.

---

### Task 14: Criar NewsListScreen

**Files:**
- Modify: `src/screens/NewsListScreen.tsx` (substituir placeholder do Task 10)

- [ ] **Substituir o conteúdo do arquivo com a implementação completa**

```typescript
import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Colors, Radius, Spacing } from '../theme';
import { Icons } from '../components';
import { NEWS_ARTICLES, NewsArticle } from '../data/seed';
import { RootStackParamList } from '../navigation';
import { useVaultStore } from '../store';

type Nav = NativeStackNavigationProp<RootStackParamList>;

const LEVEL_META: Record<1|2|3, { label: string; color: string; soft: string; cefr: string }> = {
  1: { label: 'Level 1', color: Colors.moss,  soft: Colors.mossSoft,  cefr: 'A2' },
  2: { label: 'Level 2', color: Colors.ocean, soft: Colors.oceanSoft, cefr: 'B1' },
  3: { label: 'Level 3', color: Colors.coral, soft: Colors.coralSoft, cefr: 'B2' },
};

export default function NewsListScreen() {
  const navigation = useNavigation<Nav>();
  const { items }  = useVaultStore();
  const [level, setLevel] = useState<1|2|3|'all'>('all');

  const allCaptured = (article: NewsArticle) =>
    article.vocabulary.every((v) =>
      items.some((i) => i.term.toLowerCase() === v.term.toLowerCase()),
    );

  const visible = level === 'all'
    ? NEWS_ARTICLES
    : NEWS_ARTICLES.filter((a) => a.level === level);

  return (
    <SafeAreaView style={s.safe}>
      <View style={s.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={s.backBtn} activeOpacity={0.7}>
          <Icons.Back size={20} color={Colors.ink} />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={s.headerSub}>NOTÍCIAS EM INGLÊS</Text>
          <Text style={s.headerTitle}>News in Levels</Text>
        </View>
      </View>

      {/* Level filter */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.filterScroll}>
        {(['all', 1, 2, 3] as const).map((l) => {
          const active = level === l;
          const meta   = l === 'all' ? null : LEVEL_META[l];
          return (
            <TouchableOpacity
              key={String(l)}
              onPress={() => setLevel(l)}
              style={[s.pill, active && { backgroundColor: meta?.color ?? Colors.ink, borderColor: meta?.color ?? Colors.ink }]}
              activeOpacity={0.8}
            >
              <Text style={[s.pillText, active && { color: Colors.sand }]}>
                {l === 'all' ? 'Todos' : `${meta!.label} · ${meta!.cefr}`}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      <ScrollView contentContainerStyle={{ paddingHorizontal: Spacing.lg, paddingBottom: 32, gap: 10 }}>
        {visible.map((article) => {
          const meta      = LEVEL_META[article.level];
          const captured  = allCaptured(article);
          const remaining = article.vocabulary.filter(
            (v) => !items.some((i) => i.term.toLowerCase() === v.term.toLowerCase()),
          ).length;
          return (
            <TouchableOpacity
              key={article.id}
              style={s.card}
              onPress={() => navigation.navigate('NewsArticle', { articleId: article.id })}
              activeOpacity={0.85}
            >
              <View style={s.cardTop}>
                <View style={[s.levelBadge, { backgroundColor: meta.soft }]}>
                  <Text style={[s.levelText, { color: meta.color }]}>{meta.label} · {meta.cefr}</Text>
                </View>
                {captured && (
                  <View style={s.capturedBadge}>
                    <Text style={s.capturedText}>✓ Capturado</Text>
                  </View>
                )}
              </View>
              <Text style={s.cardTitle}>{article.title}</Text>
              <View style={s.cardFooter}>
                <Text style={s.cardTopic}>{article.topic}</Text>
                <Text style={s.cardVocab}>
                  {captured ? 'Vocabulário capturado' : `${remaining} palavras para capturar`}
                </Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe:          { flex: 1, backgroundColor: Colors.sand },
  header:        { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: Spacing.lg, paddingTop: 14, paddingBottom: Spacing.sm },
  backBtn:       { width: 38, height: 38, borderRadius: Radius.full, backgroundColor: Colors.paper, borderWidth: 0.5, borderColor: Colors.line, alignItems: 'center', justifyContent: 'center' },
  headerSub:     { fontSize: 10, fontWeight: '700', letterSpacing: 1, color: Colors.inkMute, textTransform: 'uppercase', marginBottom: 2 },
  headerTitle:   { fontSize: 20, fontWeight: '700', color: Colors.ink, letterSpacing: -0.3 },
  filterScroll:  { paddingHorizontal: Spacing.lg, gap: 6, paddingBottom: 14 },
  pill:          { paddingHorizontal: 12, paddingVertical: 6, borderRadius: Radius.full, borderWidth: 1, borderColor: Colors.lineStrong },
  pillText:      { fontSize: 12, fontWeight: '600', color: Colors.inkSoft },
  card:          { backgroundColor: Colors.paper, borderRadius: Radius.md, borderWidth: 0.5, borderColor: Colors.line, padding: 14 },
  cardTop:       { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  levelBadge:    { borderRadius: Radius.full, paddingHorizontal: 8, paddingVertical: 3 },
  levelText:     { fontSize: 10, fontWeight: '700', letterSpacing: 0.5 },
  capturedBadge: { borderRadius: Radius.full, paddingHorizontal: 8, paddingVertical: 3, backgroundColor: Colors.mossSoft },
  capturedText:  { fontSize: 10, fontWeight: '700', color: Colors.moss },
  cardTitle:     { fontSize: 15, fontWeight: '600', color: Colors.ink, letterSpacing: -0.2, lineHeight: 21, marginBottom: 8 },
  cardFooter:    { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cardTopic:     { fontSize: 11, color: Colors.inkMute, fontWeight: '500' },
  cardVocab:     { fontSize: 11, color: Colors.inkMute },
});
```

- [ ] **Commitar**

```bash
git add src/screens/NewsListScreen.tsx
git commit -m "feat(news): create NewsListScreen with level filter"
```

---

### Task 15: Criar NewsArticleScreen

**Files:**
- Modify: `src/screens/NewsArticleScreen.tsx` (substituir placeholder)

- [ ] **Substituir o conteúdo do arquivo**

```typescript
import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Colors, Radius, Spacing } from '../theme';
import { Icons } from '../components';
import { NEWS_ARTICLES, VocabSuggestion } from '../data/seed';
import { RootStackParamList } from '../navigation';
import { useVaultStore } from '../store';

type Nav   = NativeStackNavigationProp<RootStackParamList>;
type Route = RouteProp<RootStackParamList, 'NewsArticle'>;

const LEVEL_META: Record<1|2|3, { color: string; soft: string; label: string }> = {
  1: { color: Colors.moss,  soft: Colors.mossSoft,  label: 'Level 1 · A2' },
  2: { color: Colors.ocean, soft: Colors.oceanSoft, label: 'Level 2 · B1' },
  3: { color: Colors.coral, soft: Colors.coralSoft, label: 'Level 3 · B2' },
};

export default function NewsArticleScreen() {
  const navigation = useNavigation<Nav>();
  const route      = useRoute<Route>();
  const { items }  = useVaultStore();

  const article = NEWS_ARTICLES.find((a) => a.id === route.params.articleId)!;
  const meta    = LEVEL_META[article.level];

  const vocabTerms = useMemo(
    () => new Set(article.vocabulary.map((v) => v.term.toLowerCase())),
    [article],
  );

  const allCaptured = article.vocabulary.every((v) =>
    items.some((i) => i.term.toLowerCase() === v.term.toLowerCase()),
  );

  const pending = article.vocabulary.filter(
    (v) => !items.some((i) => i.term.toLowerCase() === v.term.toLowerCase()),
  );

  const [tooltip, setTooltip] = useState<VocabSuggestion | null>(null);

  // Split text into word tokens, marking vocab words
  const tokens = useMemo(() => {
    return article.text.split(/(\s+)/).map((token, i) => {
      const clean = token.replace(/[^a-zA-Z'-]/g, '').toLowerCase();
      const matched = article.vocabulary.find((v) => {
        const vWords = v.term.toLowerCase().split(' ');
        return vWords.length === 1 && vWords[0] === clean;
      });
      return { raw: token, key: i, vocab: matched ?? null };
    });
  }, [article]);

  return (
    <SafeAreaView style={s.safe}>
      <View style={s.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={s.backBtn} activeOpacity={0.7}>
          <Icons.Back size={20} color={Colors.ink} />
        </TouchableOpacity>
        <View style={[s.levelBadge, { backgroundColor: meta.soft }]}>
          <Text style={[s.levelText, { color: meta.color }]}>{meta.label}</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={s.content}>
        <Text style={s.title}>{article.title}</Text>
        <Text style={s.date}>{article.date}</Text>

        {/* Article text with vocab highlights */}
        <View style={s.textBlock}>
          <Text style={s.articleText}>
            {tokens.map((t) =>
              t.vocab ? (
                <Text
                  key={t.key}
                  style={s.vocabWord}
                  onPress={() => setTooltip(t.vocab)}
                >
                  {t.raw}
                </Text>
              ) : (
                <Text key={t.key}>{t.raw}</Text>
              ),
            )}
          </Text>
        </View>

        {/* Vocab list preview */}
        <View style={s.vocabSection}>
          <Text style={s.vocabLabel}>VOCABULÁRIO DO ARTIGO</Text>
          {article.vocabulary.map((v, i) => {
            const inVault = items.some((item) => item.term.toLowerCase() === v.term.toLowerCase());
            return (
              <View key={i} style={s.vocabRow}>
                <Text style={[s.vocabTerm, inVault && { color: Colors.moss }]}>{v.term}</Text>
                {inVault && <Text style={s.vocabCheck}>✓</Text>}
              </View>
            );
          })}
        </View>
      </ScrollView>

      {/* Footer CTA */}
      <View style={s.footer}>
        <TouchableOpacity
          style={[s.ctaBtn, allCaptured && s.ctaBtnDone]}
          disabled={allCaptured}
          onPress={() =>
            navigation.navigate('Triagem', {
              suggestions: pending,
              title: 'Vocabulário do Artigo',
              subtitle: article.title,
            })
          }
          activeOpacity={0.85}
        >
          <Text style={[s.ctaText, allCaptured && { color: Colors.moss }]}>
            {allCaptured
              ? '✓ Vocabulário capturado'
              : `Revisar vocabulário · ${pending.length} palavras →`}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Tooltip modal */}
      {tooltip && (
        <Modal transparent animationType="fade" onRequestClose={() => setTooltip(null)}>
          <TouchableOpacity style={s.overlay} activeOpacity={1} onPress={() => setTooltip(null)}>
            <View style={s.tooltipCard}>
              <Text style={s.tooltipTerm}>{tooltip.term}</Text>
              <Text style={s.tooltipGloss}>{tooltip.gloss}</Text>
              {tooltip.example && <Text style={s.tooltipExample}>"{tooltip.example}"</Text>}
            </View>
          </TouchableOpacity>
        </Modal>
      )}
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe:         { flex: 1, backgroundColor: Colors.sand },
  header:       { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: Spacing.lg, paddingTop: 14, paddingBottom: Spacing.sm },
  backBtn:      { width: 38, height: 38, borderRadius: Radius.full, backgroundColor: Colors.paper, borderWidth: 0.5, borderColor: Colors.line, alignItems: 'center', justifyContent: 'center' },
  levelBadge:   { borderRadius: Radius.full, paddingHorizontal: 10, paddingVertical: 4 },
  levelText:    { fontSize: 11, fontWeight: '700', letterSpacing: 0.5 },
  content:      { paddingHorizontal: Spacing.lg, paddingBottom: 100 },
  title:        { fontSize: 20, fontWeight: '700', color: Colors.ink, letterSpacing: -0.4, lineHeight: 28, marginBottom: 6 },
  date:         { fontSize: 11, color: Colors.inkMute, marginBottom: 18 },
  textBlock:    { marginBottom: 24 },
  articleText:  { fontSize: 15, color: Colors.ink, lineHeight: 26 },
  vocabWord:    { color: Colors.ocean, textDecorationLine: 'underline', textDecorationStyle: 'dotted', textDecorationColor: Colors.ocean },
  vocabSection: { backgroundColor: Colors.paper, borderRadius: Radius.md, borderWidth: 0.5, borderColor: Colors.line, padding: 14, gap: 8 },
  vocabLabel:   { fontSize: 10, fontWeight: '700', letterSpacing: 0.8, color: Colors.inkMute, textTransform: 'uppercase', marginBottom: 4 },
  vocabRow:     { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  vocabTerm:    { fontSize: 14, fontWeight: '500', color: Colors.inkSoft },
  vocabCheck:   { fontSize: 13, color: Colors.moss, fontWeight: '700' },
  footer:       { position: 'absolute', bottom: 0, left: 0, right: 0, padding: Spacing.lg, backgroundColor: Colors.sand, borderTopWidth: 0.5, borderTopColor: Colors.line },
  ctaBtn:       { backgroundColor: Colors.moss, borderRadius: Radius.full, height: 50, alignItems: 'center', justifyContent: 'center' },
  ctaBtnDone:   { backgroundColor: Colors.mossSoft },
  ctaText:      { fontSize: 14, fontWeight: '700', color: Colors.sand },
  overlay:      { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', alignItems: 'center', justifyContent: 'center', padding: 32 },
  tooltipCard:  { backgroundColor: Colors.paper, borderRadius: Radius.lg, padding: 20, width: '100%' },
  tooltipTerm:  { fontSize: 20, fontWeight: '700', color: Colors.ink, marginBottom: 8 },
  tooltipGloss: { fontSize: 15, color: Colors.inkSoft, lineHeight: 22, marginBottom: 8 },
  tooltipExample:{ fontSize: 13, fontStyle: 'italic', color: Colors.inkMute, lineHeight: 19 },
});
```

- [ ] **Verificar manualmente:** abrir um artigo → palavras de vocabulário aparecem sublinhadas em pontilhado → toque numa palavra → tooltip aparece → botão rodapé abre TriagemScreen com as palavras pendentes.

- [ ] **Commitar**

```bash
git add src/screens/NewsArticleScreen.tsx
git commit -m "feat(news): create NewsArticleScreen with vocab highlights and triagem"
```

---

## Fase 6 — Content Vocabulary

### Task 16: Seed data — vocabulário nos ContentItems

**Files:**
- Modify: `src/data/seed.ts`

- [ ] **Localizar o array `CONTENT` em seed.ts e adicionar o campo `vocabulary` a cada item**

Exemplo para o primeiro item (Lex Fridman Podcast ou equivalente — ajustar ao conteúdo real do array):

```typescript
// Cada ContentItem ganha vocabulary: VocabSuggestion[]
// Exemplo com 5 itens — repetir para todos os 6 ContentItems do array CONTENT
{
  id: 'lex-fridman',
  kind: 'podcast',
  title: 'Lex Fridman Podcast',
  // ... campos existentes ...
  vocabulary: [
    { term: 'fascinating', type: 'word', gloss: 'fascinante / muito interessante', example: 'That\'s a fascinating perspective.', source: 'Lex Fridman Podcast' },
    { term: 'break it down', type: 'chunk', gloss: 'explicar passo a passo / detalhar', example: 'Let me break it down for you.', source: 'Lex Fridman Podcast', function: 'clarifying' },
    { term: 'at the end of the day', type: 'chunk', gloss: 'no fim das contas / em última análise', example: 'At the end of the day, it\'s about results.', source: 'Lex Fridman Podcast', function: 'emphasizing' },
    { term: 'dive deep into', type: 'chunk', gloss: 'mergulhar fundo em / explorar a fundo', example: 'We\'re going to dive deep into AI today.', source: 'Lex Fridman Podcast', function: 'storytelling' },
    { term: 'compelling', type: 'word', gloss: 'convincente / irresistível / muito bom', example: 'That\'s a compelling argument.', source: 'Lex Fridman Podcast' },
    { term: 'nuanced', type: 'word', gloss: 'cheio de nuances / sutil / não simplista', example: 'This is a very nuanced topic.', source: 'Lex Fridman Podcast' },
    { term: 'ground-breaking', type: 'collocation', gloss: 'revolucionário / pioneiro', example: 'Ground-breaking research in the field.', source: 'Lex Fridman Podcast' },
    { term: 'in terms of', type: 'chunk', gloss: 'em termos de / no que diz respeito a', example: 'In terms of impact, it\'s huge.', source: 'Lex Fridman Podcast', function: 'clarifying' },
  ],
},
```

Adicionar 6–8 VocabSuggestions a cada um dos 6 ContentItems existentes, com `source` sendo o título do conteúdo.

- [ ] **Commitar**

```bash
git add src/data/seed.ts
git commit -m "feat(seed): add vocabulary to ContentItems for triagem"
```

---

### Task 17: Criar ContentDetailScreen

**Files:**
- Modify: `src/screens/ContentDetailScreen.tsx` (substituir placeholder)

- [ ] **Substituir o conteúdo do arquivo**

```typescript
import React, { useMemo } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Colors, Radius, Spacing } from '../theme';
import { PgChip, Icons } from '../components';
import { CONTENT } from '../data/seed';
import { RootStackParamList } from '../navigation';
import { useVaultStore } from '../store';

type Nav   = NativeStackNavigationProp<RootStackParamList>;
type Route = RouteProp<RootStackParamList, 'ContentDetail'>;

const KIND_ICON: Record<string, React.FC<any>> = {
  podcast: Icons.Headphones,
  book:    Icons.Book,
  video:   Icons.Video,
  article: Icons.Article,
};

export default function ContentDetailScreen() {
  const navigation = useNavigation<Nav>();
  const route      = useRoute<Route>();
  const { items }  = useVaultStore();

  const content = CONTENT.find((c) => c.id === route.params.contentId)!;
  const KindIcon = KIND_ICON[content.kind] ?? Icons.Book;

  const vocabulary = content.vocabulary ?? [];

  const pending = useMemo(
    () => vocabulary.filter(
      (v) => !items.some((i) => i.term.toLowerCase() === v.term.toLowerCase()),
    ),
    [vocabulary, items],
  );

  const allCaptured = pending.length === 0 && vocabulary.length > 0;

  return (
    <SafeAreaView style={s.safe}>
      <View style={s.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={s.backBtn} activeOpacity={0.7}>
          <Icons.Back size={20} color={Colors.ink} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 100 }}>
        {/* Art + meta */}
        <View style={[s.artBlock, { backgroundColor: content.art }]}>
          <KindIcon size={48} color="#fff" />
        </View>
        <View style={s.meta}>
          <View style={s.metaTop}>
            <Text style={s.kind}>{content.kind.toUpperCase()}</Text>
            <Text style={s.level}>{content.level}</Text>
          </View>
          <Text style={s.title}>{content.title}</Text>
          <Text style={s.author}>{content.author}</Text>
        </View>

        {/* Why */}
        <View style={{ paddingHorizontal: Spacing.lg, marginBottom: 20 }}>
          <Text style={s.sectionLabel}>POR QUE ESTE CONTEÚDO?</Text>
          <View style={s.whyCard}>
            <Text style={s.whyText}>{content.why}</Text>
          </View>
        </View>

        {/* Vocabulary preview */}
        {vocabulary.length > 0 && (
          <View style={{ paddingHorizontal: Spacing.lg }}>
            <Text style={s.sectionLabel}>VOCABULÁRIO ESSENCIAL</Text>
            <View style={s.vocabList}>
              {vocabulary.map((v, i) => {
                const inVault = items.some((item) => item.term.toLowerCase() === v.term.toLowerCase());
                return (
                  <View key={i} style={s.vocabRow}>
                    <Text style={[s.vocabTerm, inVault && { color: Colors.moss }]}>{v.term}</Text>
                    <PgChip c={Colors.inkMute} soft={Colors.line}>{v.type}</PgChip>
                    {inVault && <Text style={s.check}>✓</Text>}
                  </View>
                );
              })}
            </View>
          </View>
        )}
      </ScrollView>

      {/* Footer CTA */}
      {vocabulary.length > 0 && (
        <View style={s.footer}>
          <TouchableOpacity
            style={[s.ctaBtn, allCaptured && s.ctaDone]}
            disabled={allCaptured}
            onPress={() =>
              navigation.navigate('Triagem', {
                suggestions: pending,
                title: content.title,
                subtitle: `${pending.length} palavras para capturar`,
              })
            }
            activeOpacity={0.85}
          >
            <Text style={[s.ctaText, allCaptured && { color: Colors.moss }]}>
              {allCaptured
                ? '✓ Vocabulário capturado'
                : `Iniciar triagem · ${pending.length} palavras →`}
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe:         { flex: 1, backgroundColor: Colors.sand },
  header:       { paddingHorizontal: Spacing.lg, paddingTop: 14, paddingBottom: 4 },
  backBtn:      { width: 38, height: 38, borderRadius: Radius.full, backgroundColor: Colors.paper, borderWidth: 0.5, borderColor: Colors.line, alignItems: 'center', justifyContent: 'center' },
  artBlock:     { height: 160, alignItems: 'center', justifyContent: 'center', marginHorizontal: Spacing.lg, borderRadius: Radius.lg, marginBottom: 16 },
  meta:         { paddingHorizontal: Spacing.lg, marginBottom: 20 },
  metaTop:      { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 },
  kind:         { fontSize: 10, fontWeight: '700', letterSpacing: 0.8, color: Colors.inkMute },
  level:        { fontSize: 10, fontWeight: '700', color: Colors.moss, backgroundColor: Colors.mossSoft, borderRadius: Radius.full, paddingHorizontal: 8, paddingVertical: 2 },
  title:        { fontSize: 20, fontWeight: '700', color: Colors.ink, letterSpacing: -0.4, marginBottom: 4 },
  author:       { fontSize: 13, color: Colors.inkMute },
  sectionLabel: { fontSize: 10, fontWeight: '700', letterSpacing: 0.8, textTransform: 'uppercase', color: Colors.inkMute, marginBottom: 10 },
  whyCard:      { backgroundColor: Colors.oceanSoft, borderRadius: Radius.md, padding: 14 },
  whyText:      { fontSize: 14, color: Colors.inkSoft, lineHeight: 21, fontStyle: 'italic' },
  vocabList:    { backgroundColor: Colors.paper, borderRadius: Radius.md, borderWidth: 0.5, borderColor: Colors.line, padding: 14, gap: 10 },
  vocabRow:     { flexDirection: 'row', alignItems: 'center', gap: 8 },
  vocabTerm:    { flex: 1, fontSize: 14, fontWeight: '500', color: Colors.inkSoft },
  check:        { fontSize: 13, color: Colors.moss, fontWeight: '700' },
  footer:       { position: 'absolute', bottom: 0, left: 0, right: 0, padding: Spacing.lg, backgroundColor: Colors.sand, borderTopWidth: 0.5, borderTopColor: Colors.line },
  ctaBtn:       { backgroundColor: Colors.moss, borderRadius: Radius.full, height: 50, alignItems: 'center', justifyContent: 'center' },
  ctaDone:      { backgroundColor: Colors.mossSoft },
  ctaText:      { fontSize: 14, fontWeight: '700', color: Colors.sand },
});
```

- [ ] **Commitar**

```bash
git add src/screens/ContentDetailScreen.tsx
git commit -m "feat(content): create ContentDetailScreen with triagem integration"
```

---

### Task 18: Atualizar ContentScreen com acesso a News e ContentDetail

**Files:**
- Modify: `src/screens/ContentScreen.tsx`

- [ ] **Adicionar imports necessários no topo**

```typescript
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation';
```

- [ ] **Dentro do componente, adicionar hook de navegação**

```typescript
const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
```

- [ ] **Localizar onde os cards de conteúdo são renderizados e adicionar `onPress` para navegar para ContentDetailScreen**

Nos cards da lista de recomendações (`CONTENT.map(...)`), adicionar:
```typescript
onPress={() => navigation.navigate('ContentDetail', { contentId: item.id })}
```

- [ ] **Adicionar um card de destaque para News in Levels antes da lista de recomendações**

Adicionar dentro do ScrollView, antes dos cards existentes:
```typescript
{/* News in Levels card */}
<TouchableOpacity
  onPress={() => navigation.navigate('NewsList')}
  style={{
    backgroundColor: Colors.moss,
    borderRadius: Radius.lg,
    padding: 20,
    marginHorizontal: Spacing.lg,
    marginBottom: 20,
  }}
  activeOpacity={0.85}
>
  <Text style={{ fontSize: 10, fontWeight: '700', letterSpacing: 1, color: Colors.mossSoft, textTransform: 'uppercase', marginBottom: 6 }}>
    NOTÍCIAS EM INGLÊS
  </Text>
  <Text style={{ fontSize: 18, fontWeight: '700', color: Colors.sand, letterSpacing: -0.3, marginBottom: 4 }}>
    News in Levels
  </Text>
  <Text style={{ fontSize: 13, color: Colors.mossSoft, lineHeight: 19, marginBottom: 14 }}>
    Notícias reais em 3 níveis de dificuldade com vocabulário curado para capturar.
  </Text>
  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
    <View style={{ backgroundColor: Colors.mossDeep, borderRadius: Radius.full, paddingHorizontal: 10, paddingVertical: 4 }}>
      <Text style={{ fontSize: 11, fontWeight: '600', color: Colors.mossSoft }}>{NEWS_ARTICLES.length} artigos</Text>
    </View>
    <Text style={{ fontSize: 13, fontWeight: '700', color: Colors.sand }}>Ver notícias →</Text>
  </View>
</TouchableOpacity>
```

Adicionar o import de `NEWS_ARTICLES` no topo:
```typescript
import { CONTENT, NEWS_ARTICLES } from '../data/seed';
```

- [ ] **Verificar manualmente:** ContentScreen mostra card verde de News in Levels → toque abre NewsListScreen. Cards de conteúdo existentes → toque abre ContentDetailScreen com vocabulário.

- [ ] **Commitar**

```bash
git add src/screens/ContentScreen.tsx
git commit -m "feat(content): add News in Levels card and ContentDetail navigation"
```

---

## Self-Review

### Cobertura do spec

| Spec | Task |
|---|---|
| Fix tabs Pronúncia | Task 2 |
| Fix pills Vault | Task 3 |
| Tokens amber/purple | Task 1 |
| FSRS campos em VaultItem | Task 4 |
| FSRS algoritmo | Task 5 |
| Store updateSRS patch | Task 6 |
| SRSScreen usa FSRS | Task 7 |
| VocabSuggestion type | Task 8 |
| NewsArticle type | Task 8 |
| ContentItem vocabulary field | Task 8 |
| TriagemScreen | Task 9 |
| Rotas novas na navegação | Task 10 |
| ZIPF_TOP_500 | Task 11 |
| ZipfScreen bandas | Task 12 |
| NEWS_ARTICLES seed (9 artigos) | Task 13 |
| NewsListScreen | Task 14 |
| NewsArticleScreen | Task 15 |
| ContentItem vocabulary seed | Task 16 |
| ContentDetailScreen | Task 17 |
| ContentScreen news card + detail nav | Task 18 |

### Consistência de tipos

- `FSRSPatch` em `fsrs.ts` usa `Pick<VaultItem, ...>` — depende de VaultItem ter os campos FSRS (Task 4 antes de Task 5 ✓)
- `TriagemScreen` importa `VocabSuggestion` de seed.ts (Task 8 antes de Task 9 ✓)
- Todas as screens novas importam `RootStackParamList` com as novas rotas (Task 10 registra antes das tasks 11+ ✓)
- `Colors.purple` / `Colors.purpleSoft` / `Colors.amber` / `Colors.amberSoft` usados em Tasks 2, 3, 9 — definidos em Task 1 ✓

### Itens pendentes antes do release

- ZIPF_TOP_500: ranks 51–500 precisam ser populados (Task 11)
- NEWS_ARTICLES: adicionar mais 6 artigos (2 por nível) para chegar a 5 por nível (Task 13)
- ContentItems: vocabulary precisa ser adicionado a todos os 6 itens de CONTENT (Task 16)
