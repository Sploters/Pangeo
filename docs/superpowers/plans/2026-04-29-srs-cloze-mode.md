# SRS Cloze Mode Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a fill-in-the-blank exercise mode to the SRS session, where cards with example sentences show the sentence with the term blanked out and require the user to type the answer.

**Architecture:** Extend `SRSScreen` with a `clozeEnabled` boolean from `ProfileStore`. Per card, compute whether cloze is viable (term found in example). Cloze cards replace the flip animation with a TextInput + verify flow; grade buttons appear after verification. Flashcard fallback remains when example is absent or term not found in sentence.

**Tech Stack:** React Native, Zustand, TypeScript — no new dependencies.

---

## Files

| Action | File | What changes |
|--------|------|--------------|
| Modify | `src/store/index.ts` | Add `clozeEnabled: boolean` + `setClozeEnabled` to `ProfileStore` |
| Modify | `src/screens/SRSScreen.tsx` | Add cloze state, `buildCloze` helper, cloze card UI, toggle in picker |

---

### Task 1: Add `clozeEnabled` to ProfileStore

**Files:**
- Modify: `src/store/index.ts`

- [ ] **Step 1: Add the field and setter to the ProfileStore type**

In `src/store/index.ts`, inside `type ProfileStore`, add after `studyIntensity`:

```typescript
clozeEnabled: boolean;
setClozeEnabled: (v: boolean) => void;
```

- [ ] **Step 2: Add default value and implementation in the store**

Inside the `create<ProfileStore>()` initializer, add after `studyIntensity: 'moderate' as StudyIntensity,`:

```typescript
clozeEnabled: false,
```

And after `setStudyIntensity: (studyIntensity) => set({ studyIntensity }),`:

```typescript
setClozeEnabled: (clozeEnabled) => set({ clozeEnabled }),
```

- [ ] **Step 3: Verify TypeScript**

```bash
npx tsc --noEmit
```
Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add src/store/index.ts
git commit -m "feat(store): add clozeEnabled preference to ProfileStore"
```

---

### Task 2: Add `buildCloze` helper and cloze state to SRSScreen

**Files:**
- Modify: `src/screens/SRSScreen.tsx`

- [ ] **Step 1: Add TextInput to the React Native import**

Change the import line:

```typescript
import {
  View, Text, TouchableOpacity, StyleSheet, Animated, ScrollView, TextInput,
} from 'react-native';
```

- [ ] **Step 2: Add `buildCloze` helper above the component**

After the `INTENSITY_OPTIONS` array, add:

```typescript
function buildCloze(example: string, term: string): string | null {
  if (!example.trim()) return null;
  const escaped = term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const re = new RegExp(`\\b${escaped}\\b`, 'i');
  return re.test(example) ? example.replace(re, '___') : null;
}
```

- [ ] **Step 3: Pull `clozeEnabled` and `setClozeEnabled` from store**

In the component, change the destructure from `useProfileStore`:

```typescript
const { trackStudySession, recordLatency, avgLatencyMs, studyIntensity, setStudyIntensity, clozeEnabled, setClozeEnabled } = useProfileStore();
```

- [ ] **Step 4: Add cloze session state**

After the existing state declarations, add:

```typescript
const [clozeAnswer, setClozeAnswer] = useState('');
const [clozeSubmitted, setClozeSubmitted] = useState(false);
const [clozeCorrect, setClozeCorrect] = useState(false);
```

- [ ] **Step 5: Add `cardMode` and `clozeSentence` memos**

After the `sessionDeck` memo, add:

```typescript
const clozeSentence = useMemo(() => {
  if (!card || !clozeEnabled) return null;
  return buildCloze(card.example, card.term);
}, [card, clozeEnabled]);

const cardMode: 'flashcard' | 'cloze' = clozeSentence ? 'cloze' : 'flashcard';
```

- [ ] **Step 6: Reset cloze state when card changes**

Update the `useEffect` to also reset cloze state:

```typescript
useEffect(() => {
  if (phase !== 'session') return;
  startTimeRef.current = Date.now();
  setFlipped(false);
  setClozeAnswer('');
  setClozeSubmitted(false);
  setClozeCorrect(false);
  flipAnim.setValue(0);
  setCardLatencyMs(null);
  if (card) setIntervals(previewIntervals(card));
  else setIntervals(null);
}, [currentIdx, phase]);
```

- [ ] **Step 7: Add `submitCloze` handler**

After the `startSession` function, add:

```typescript
const submitCloze = () => {
  const elapsed = Date.now() - startTimeRef.current;
  setCardLatencyMs(elapsed);
  recordLatency(elapsed);
  const correct = clozeAnswer.trim().toLowerCase() === card.term.trim().toLowerCase();
  setClozeCorrect(correct);
  setClozeSubmitted(true);
  if (card) setIntervals(previewIntervals(card));
};
```

- [ ] **Step 8: Verify TypeScript**

```bash
npx tsc --noEmit
```
Expected: no errors.

- [ ] **Step 9: Commit**

```bash
git add src/screens/SRSScreen.tsx
git commit -m "feat(srs): add buildCloze helper and cloze state scaffolding"
```

---

### Task 3: Render cloze toggle in the picker screen

**Files:**
- Modify: `src/screens/SRSScreen.tsx`

- [ ] **Step 1: Add the cloze toggle row after the intensity cards**

In the picker phase JSX, after the `</View>` that closes the intensity options `gap: 10` container and before the `<View style={{ marginTop: 24 }}>` with the start button, add:

```tsx
<TouchableOpacity
  onPress={() => setClozeEnabled(!clozeEnabled)}
  style={{
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    marginTop: 14, backgroundColor: Colors.paper,
    borderRadius: Radius.md, borderWidth: 0.5, borderColor: Colors.line, padding: 16,
  }}
  activeOpacity={0.8}
>
  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
    <Text style={{ fontSize: 22 }}>✏️</Text>
    <View>
      <Text style={{ fontSize: 15, fontWeight: '700', color: Colors.ink }}>Modo cloze</Text>
      <Text style={{ fontSize: 12, color: Colors.inkMute, marginTop: 2 }}>
        Preencher a lacuna nas frases de exemplo
      </Text>
    </View>
  </View>
  <View style={{
    width: 44, height: 26, borderRadius: 13,
    backgroundColor: clozeEnabled ? Colors.moss : Colors.line,
    alignItems: 'center', justifyContent: 'center',
    paddingHorizontal: 2,
  }}>
    <View style={{
      width: 22, height: 22, borderRadius: 11, backgroundColor: Colors.sand,
      alignSelf: clozeEnabled ? 'flex-end' : 'flex-start',
    }} />
  </View>
</TouchableOpacity>
```

- [ ] **Step 2: Manual verify picker toggle**

Run the app, open Revisão, confirm the toggle appears and tapping it switches the visual state (green/gray).

- [ ] **Step 3: Commit**

```bash
git add src/screens/SRSScreen.tsx
git commit -m "feat(srs): add cloze mode toggle to session picker"
```

---

### Task 4: Render the cloze card UI in the session

**Files:**
- Modify: `src/screens/SRSScreen.tsx`

- [ ] **Step 1: Replace the card area with mode-aware rendering**

The current card area is a single `<View style={styles.cardArea}>` containing the animated front/back. Replace the entire card area block with:

```tsx
{/* Card */}
<View style={styles.cardArea}>
  {cardMode === 'cloze' ? (
    <View style={[styles.card, styles.cardFront, { justifyContent: 'flex-start', paddingTop: 20 }]}>
      <View style={{ position: 'absolute', top: 14, left: 14 }}>
        <PgChip c={Colors.ocean} soft={Colors.oceanSoft}>CLOZE</PgChip>
      </View>
      <View style={{ width: '100%', marginTop: 32 }}>
        <Text style={{ fontSize: 16, color: Colors.ink, lineHeight: 26, textAlign: 'center', marginBottom: 20 }}>
          {clozeSubmitted
            ? clozeSentence!.replace('___', card.term)
            : clozeSentence}
        </Text>
        {clozeSubmitted ? (
          <View style={{ alignItems: 'center', gap: 6 }}>
            <Text style={{
              fontSize: 13, fontWeight: '700', letterSpacing: 0.5,
              color: clozeCorrect ? Colors.moss : Colors.coral,
            }}>
              {clozeCorrect ? '✓ Correto!' : `✗ Era: ${card.term}`}
            </Text>
            <Text style={{ fontSize: 13, color: Colors.inkMute }}>{card.gloss}</Text>
          </View>
        ) : (
          <TextInput
            value={clozeAnswer}
            onChangeText={setClozeAnswer}
            placeholder="Digite a palavra..."
            placeholderTextColor={Colors.inkMute}
            autoCapitalize="none"
            autoCorrect={false}
            style={{
              borderWidth: 1, borderColor: Colors.line,
              borderRadius: Radius.md, padding: 12,
              fontSize: 16, color: Colors.ink, backgroundColor: Colors.paper,
              textAlign: 'center',
            }}
            onSubmitEditing={submitCloze}
          />
        )}
      </View>
    </View>
  ) : !flipped ? (
    <Animated.View style={[styles.card, styles.cardFront, { transform: [{ rotateY: frontRotate }] }]}>
      <View style={{ position: 'absolute', top: 14, left: 14 }}>
        <PgChip c={Colors.coral} soft={Colors.coralSoft}>
          {card.srs === 'due' ? 'PARA HOJE' : card.srs === 'learning' ? 'APRENDENDO' : 'NOVO'}
        </PgChip>
      </View>
      <View style={{ position: 'absolute', top: 14, right: 14 }}>
        <Icons.Bookmark size={18} color={Colors.inkMute} />
      </View>
      <Text style={styles.cardFrontWord}>{card.term}</Text>
      <Text style={styles.cardType}>{card.type}</Text>
      <Text style={styles.tapHint}>TOQUE PARA REVELAR</Text>
      <TouchableOpacity style={StyleSheet.absoluteFill} onPress={flip} activeOpacity={1} />
    </Animated.View>
  ) : (
    <Animated.View style={[styles.card, styles.cardBack, { transform: [{ rotateY: backRotate }] }]}>
      {cardLatencyMs !== null && (() => {
        const lb = latencyLabel(cardLatencyMs);
        return (
          <View style={styles.latencyBadge}>
            <View style={[styles.latencyDot, { backgroundColor: lb.color }]} />
            <Text style={[styles.latencyText, { color: lb.color }]}>
              {lb.text} · {(cardLatencyMs / 1000).toFixed(1)}s
            </Text>
          </View>
        );
      })()}
      <View style={{ flex: 1, justifyContent: 'center' }}>
        <Text style={styles.backEye}>{card.term.toUpperCase()}</Text>
        <Text style={styles.backMeaning}>{card.gloss}</Text>
        {card.example ? (
          <>
            <View style={styles.backDivider} />
            <Text style={styles.backContextLabel}>EM CONTEXTO</Text>
            <Text style={styles.backExample}>"{card.example}"</Text>
          </>
        ) : null}
      </View>
      <View style={styles.cardDebug}>
        <Text style={styles.debugText}>S: {card.stability.toFixed(1)}d · D: {card.difficulty.toFixed(1)}</Text>
        {card.source ? <Text style={styles.debugText}>{card.source}</Text> : null}
      </View>
    </Animated.View>
  )}
</View>
```

- [ ] **Step 2: Replace the bottom action area to handle cloze**

Replace the entire bottom action block (the `{flipped && intervals ? ... : ...}` section) with:

```tsx
{cardMode === 'cloze' ? (
  clozeSubmitted && intervals ? (
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
  ) : (
    <View style={{ paddingHorizontal: Spacing.lg, paddingBottom: 22 }}>
      <PgButton full variant="primary" onPress={submitCloze} disabled={!clozeAnswer.trim()}>
        Verificar
      </PgButton>
    </View>
  )
) : flipped && intervals ? (
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
) : (
  <View style={{ paddingHorizontal: Spacing.lg, paddingBottom: 22 }}>
    <PgButton full variant="primary" onPress={flip}>Revelar resposta</PgButton>
  </View>
)}
```

- [ ] **Step 3: Verify TypeScript**

```bash
npx tsc --noEmit
```
Expected: no errors.

- [ ] **Step 4: Manual verify cloze flow**

1. Add a vault item with term `"run"` and example `"Let's go for a run."`
2. Enable Modo cloze in the picker
3. Start session — the card should show `"Let's go for a ___."`
4. Type `"run"` → tap Verificar → should show green "✓ Correto!"
5. Tap "Bom" → next card
6. Test wrong answer: type `"walk"` → should show red `"✗ Era: run"`

- [ ] **Step 5: Commit**

```bash
git add src/screens/SRSScreen.tsx
git commit -m "feat(srs): implement cloze fill-in-the-blank exercise mode"
```
