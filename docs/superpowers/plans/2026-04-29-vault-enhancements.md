# Vault Enhancements: Bulk Import + Word Relationships Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** (1) Allow pasting a list of words/phrases from clipboard directly into a Triagem queue for batch adding to Vault. (2) Add a word detail screen that shows word family relationships (other vault items sharing the same root) and collocations.

**Architecture:** Bulk import = a modal in VaultScreen with a TextInput + parse logic → navigate to Triagem. Word relationships = new `WordDetailScreen` that computes related items from the vault at render time (no extra seed data needed). Navigation stack gets one new screen: `WordDetail: { itemId: number }`.

**Tech Stack:** React Native, Zustand, `@react-native-clipboard/clipboard` (or the Expo equivalent `expo-clipboard` which is already available in Expo SDK) — no paid dependencies.

---

## Files

| Action | File | What changes |
|--------|------|--------------|
| Modify | `src/navigation/index.tsx` | Add `WordDetail` route to stack |
| Modify | `src/screens/VaultScreen.tsx` | Add "Importar" button + bulk import modal |
| Create | `src/screens/WordDetailScreen.tsx` | New screen showing word info + vault relationships |

---

### Task 1: Add WordDetail to navigation

**Files:**
- Modify: `src/navigation/index.tsx`

- [ ] **Step 1: Add `WordDetail` to `RootStackParamList`**

In `src/navigation/index.tsx`, add to the `RootStackParamList` type:

```typescript
WordDetail: { itemId: number };
```

- [ ] **Step 2: Import and register the new screen**

Add the import after the existing screen imports:

```typescript
import WordDetailScreen from '../screens/WordDetailScreen';
```

Inside `Stack.Navigator`, add after the last `Stack.Screen`:

```tsx
<Stack.Screen name="WordDetail" component={WordDetailScreen} options={{ presentation: 'modal' }} />
```

- [ ] **Step 3: Verify TypeScript**

```bash
npx tsc --noEmit
```
Expected: error about `WordDetailScreen` not found (file doesn't exist yet) — that's fine, proceed.

- [ ] **Step 4: Commit (after WordDetailScreen is created in Task 2)**

Hold this commit until Task 2 is done.

---

### Task 2: Create WordDetailScreen

**Files:**
- Create: `src/screens/WordDetailScreen.tsx`

- [ ] **Step 1: Create the file with the full implementation**

```typescript
import React, { useMemo } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Colors, Radius, Spacing } from '../theme';
import { PgChip, Icons } from '../components';
import { useVaultStore } from '../store';
import { RootStackParamList } from '../navigation';

type Route = RouteProp<RootStackParamList, 'WordDetail'>;
type Nav   = NativeStackNavigationProp<RootStackParamList>;

function extractRoot(term: string): string {
  return term.toLowerCase().replace(/[^a-z\s'-]/g, '').split(' ')[0].replace(/(?:ing|ed|er|est|ly|s)$/, '');
}

export default function WordDetailScreen() {
  const navigation = useNavigation<Nav>();
  const route      = useRoute<Route>();
  const { items }  = useVaultStore();

  const item = items.find((v) => v.id === route.params.itemId);

  const related = useMemo(() => {
    if (!item) return [];
    const root = extractRoot(item.term);
    return items.filter(
      (v) =>
        v.id !== item.id &&
        (extractRoot(v.term) === root ||
          v.example?.toLowerCase().includes(item.term.toLowerCase())),
    );
  }, [item, items]);

  if (!item) {
    return (
      <SafeAreaView style={s.safe}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={s.backBtn}>
          <Icons.Back size={20} color={Colors.ink} />
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const CEFR_COLORS: Record<string, { c: string; soft: string }> = {
    A1: { c: Colors.moss,   soft: Colors.mossSoft },
    A2: { c: Colors.ocean,  soft: Colors.oceanSoft },
    B1: { c: Colors.gold,   soft: Colors.goldSoft },
    B2: { c: Colors.amber,  soft: Colors.amberSoft },
    C1: { c: Colors.coral,  soft: Colors.coralSoft },
    C2: { c: Colors.purple, soft: Colors.purpleSoft },
  };
  const cefrMeta = item.level ? CEFR_COLORS[item.level] ?? null : null;

  return (
    <SafeAreaView style={s.safe}>
      <View style={s.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={s.backBtn} activeOpacity={0.7}>
          <Icons.Back size={20} color={Colors.ink} />
        </TouchableOpacity>
        <Text style={s.headerTitle}>Detalhe</Text>
        <View style={{ width: 38 }} />
      </View>

      <ScrollView contentContainerStyle={{ paddingHorizontal: Spacing.lg, paddingBottom: 40 }}>
        {/* Main card */}
        <View style={s.mainCard}>
          <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 10, marginBottom: 12 }}>
            {cefrMeta && <PgChip c={cefrMeta.c} soft={cefrMeta.soft}>{item.level}</PgChip>}
            <PgChip c={Colors.inkMute} soft={Colors.line}>{item.type}</PgChip>
          </View>
          <Text style={s.term}>{item.term}</Text>
          <Text style={s.gloss}>{item.gloss}</Text>
          {item.example ? (
            <Text style={s.example}>"{item.example}"</Text>
          ) : null}
        </View>

        {/* SRS stats */}
        <View style={s.statsRow}>
          <View style={s.statBox}>
            <Text style={s.statLabel}>ESTABILIDADE</Text>
            <Text style={s.statValue}>{item.stability.toFixed(1)}d</Text>
          </View>
          <View style={s.statBox}>
            <Text style={s.statLabel}>DIFICULDADE</Text>
            <Text style={s.statValue}>{item.difficulty.toFixed(1)}</Text>
          </View>
          <View style={s.statBox}>
            <Text style={s.statLabel}>LAPSOS</Text>
            <Text style={s.statValue}>{item.lapses}</Text>
          </View>
          <View style={s.statBox}>
            <Text style={s.statLabel}>STATUS</Text>
            <Text style={[s.statValue, {
              color: item.srs === 'mature' ? Colors.moss
                   : item.srs === 'due'    ? Colors.coral
                   : Colors.ocean,
            }]}>
              {item.srs.toUpperCase()}
            </Text>
          </View>
        </View>

        {/* Related words */}
        {related.length > 0 && (
          <View style={{ marginTop: 24 }}>
            <Text style={s.sectionTitle}>Relacionadas no Vault</Text>
            <View style={{ gap: 8, marginTop: 10 }}>
              {related.map((v) => (
                <TouchableOpacity
                  key={v.id}
                  onPress={() => navigation.replace('WordDetail', { itemId: v.id })}
                  style={s.relatedRow}
                  activeOpacity={0.8}
                >
                  <View style={{ flex: 1 }}>
                    <Text style={s.relatedTerm}>{v.term}</Text>
                    <Text style={s.relatedGloss} numberOfLines={1}>{v.gloss}</Text>
                  </View>
                  <Icons.Next size={14} color={Colors.inkMute} />
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* Source */}
        {item.source ? (
          <Text style={s.sourceMeta}>{item.source} · {item.date}</Text>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe:        { flex: 1, backgroundColor: Colors.sand },
  header:      { flexDirection: 'row', alignItems: 'center', paddingHorizontal: Spacing.lg, paddingTop: 14, paddingBottom: 10 },
  backBtn:     { width: 38, height: 38, borderRadius: Radius.full, backgroundColor: Colors.paper, borderWidth: 0.5, borderColor: Colors.line, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { flex: 1, fontSize: 16, fontWeight: '700', color: Colors.ink, textAlign: 'center' },
  mainCard:    { backgroundColor: Colors.paper, borderRadius: Radius.lg, borderWidth: 0.5, borderColor: Colors.line, padding: 20, marginTop: 8 },
  term:        { fontSize: 28, fontWeight: '600', color: Colors.ink, letterSpacing: -0.6, marginBottom: 8 },
  gloss:       { fontSize: 16, color: Colors.inkSoft, lineHeight: 24 },
  example:     { fontSize: 14, fontStyle: 'italic', color: Colors.inkMute, lineHeight: 20, marginTop: 12 },
  statsRow:    { flexDirection: 'row', gap: 8, marginTop: 14 },
  statBox:     { flex: 1, backgroundColor: Colors.paper, borderRadius: Radius.md, borderWidth: 0.5, borderColor: Colors.line, padding: 10, alignItems: 'center' },
  statLabel:   { fontSize: 9, fontWeight: '700', letterSpacing: 0.6, color: Colors.inkMute, marginBottom: 4 },
  statValue:   { fontSize: 14, fontWeight: '700', color: Colors.ink },
  sectionTitle:{ fontSize: 12, fontWeight: '700', letterSpacing: 0.8, textTransform: 'uppercase', color: Colors.inkSoft },
  relatedRow:  { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.paper, borderRadius: Radius.md, borderWidth: 0.5, borderColor: Colors.line, padding: 14 },
  relatedTerm: { fontSize: 14, fontWeight: '600', color: Colors.ink },
  relatedGloss:{ fontSize: 12, color: Colors.inkMute, marginTop: 2 },
  sourceMeta:  { fontSize: 11, color: Colors.inkMute, marginTop: 20, textAlign: 'center' },
});
```

- [ ] **Step 2: Verify TypeScript**

```bash
npx tsc --noEmit
```
Expected: no errors.

- [ ] **Step 3: Commit navigation + new screen together**

```bash
git add src/navigation/index.tsx src/screens/WordDetailScreen.tsx
git commit -m "feat(vault): add WordDetailScreen with related words from vault"
```

---

### Task 3: Wire VaultScreen items to open WordDetailScreen

**Files:**
- Modify: `src/screens/VaultScreen.tsx`

- [ ] **Step 1: Read VaultScreen to find the item row press handler**

Read `src/screens/VaultScreen.tsx` fully to find how vault items are rendered (around the `items.map(...)` section).

- [ ] **Step 2: Make item rows tappable to navigate to WordDetail**

Find the vault item row component. If items are rendered in a `View` (not `TouchableOpacity`), wrap the row with `TouchableOpacity`:

```tsx
<TouchableOpacity
  key={v.id}
  onPress={() => navigation.navigate('WordDetail', { itemId: v.id })}
  activeOpacity={0.85}
  style={/* existing row style */}
>
  {/* existing row content */}
</TouchableOpacity>
```

If it's already a `TouchableOpacity`, add the `onPress` prop.

- [ ] **Step 3: Verify TypeScript**

```bash
npx tsc --noEmit
```
Expected: no errors.

- [ ] **Step 4: Manual verify**

1. Open Vault, tap a word — WordDetail screen opens
2. Confirm term, gloss, example, CEFR chip, SRS stats are shown
3. If you have two words with the same root (e.g., "run" and "runner"), the related section appears
4. Tapping a related word navigates to its detail

- [ ] **Step 5: Commit**

```bash
git add src/screens/VaultScreen.tsx
git commit -m "feat(vault): tap vault item to open word detail"
```

---

### Task 4: Bulk import modal in VaultScreen

**Files:**
- Modify: `src/screens/VaultScreen.tsx`

- [ ] **Step 1: Add import modal state**

At the top of the `VaultScreen` component, add:

```typescript
const [showImport, setShowImport] = useState(false);
const [importText, setImportText] = useState('');
```

Add `TextInput, Modal` to the React Native import if not already present.

- [ ] **Step 2: Add `parseImport` function inside component**

After the state declarations, add:

```typescript
const parseImport = () => {
  const lines = importText
    .split(/[\n,;]+/)
    .map((l) => l.trim())
    .filter((l) => l.length > 0 && l.length < 80);
  const unique = [...new Set(lines)];
  const suggestions = unique
    .filter((term) => !items.some((v) => v.term.toLowerCase() === term.toLowerCase()))
    .map((term) => ({
      term,
      type: 'word' as const,
      gloss: '',
      example: '',
      source: 'Importado',
    }));
  setShowImport(false);
  setImportText('');
  if (suggestions.length > 0) {
    navigation.navigate('Triagem', {
      suggestions,
      title: 'Importar em lote',
      subtitle: `${suggestions.length} palavras para triagem`,
    });
  }
};
```

- [ ] **Step 3: Add import button to the VaultScreen header**

Read the VaultScreen header section to find where the header buttons are. Add an import icon button next to the existing controls:

```tsx
<TouchableOpacity onPress={() => setShowImport(true)} style={/* same style as other header buttons */} activeOpacity={0.7}>
  <Icons.Plus size={20} color={Colors.ink} />
</TouchableOpacity>
```

> Use a "stack" or "list" icon if available, or reuse `Icons.Plus`.

- [ ] **Step 4: Add the import modal JSX**

Before the closing `</SafeAreaView>` in VaultScreen, add:

```tsx
<Modal
  visible={showImport}
  animationType="slide"
  presentationStyle="pageSheet"
  onRequestClose={() => setShowImport(false)}
>
  <SafeAreaView style={{ flex: 1, backgroundColor: Colors.sand }}>
    <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: Spacing.lg, paddingTop: 16, paddingBottom: 12 }}>
      <Text style={{ flex: 1, fontSize: 18, fontWeight: '700', color: Colors.ink }}>Importar palavras</Text>
      <TouchableOpacity onPress={() => setShowImport(false)} activeOpacity={0.7}>
        <Icons.Close size={20} color={Colors.ink} />
      </TouchableOpacity>
    </View>

    <View style={{ paddingHorizontal: Spacing.lg, flex: 1 }}>
      <Text style={{ fontSize: 13, color: Colors.inkMute, marginBottom: 12, lineHeight: 19 }}>
        Cole uma lista de palavras — uma por linha, ou separadas por vírgula. Palavras já no Vault serão ignoradas.
      </Text>
      <TextInput
        value={importText}
        onChangeText={setImportText}
        placeholder={'run\njump\nbeautiful\n...'}
        placeholderTextColor={Colors.inkMute}
        multiline
        autoCorrect={false}
        autoCapitalize="none"
        style={{
          flex: 1, borderWidth: 1, borderColor: Colors.line,
          borderRadius: Radius.md, padding: 14,
          fontSize: 15, color: Colors.ink, lineHeight: 24,
          backgroundColor: Colors.paper, textAlignVertical: 'top',
        }}
      />
      <TouchableOpacity
        onPress={parseImport}
        disabled={!importText.trim()}
        style={{
          marginTop: 14, marginBottom: 20,
          backgroundColor: importText.trim() ? Colors.moss : Colors.mossSoft,
          borderRadius: Radius.full, height: 50,
          alignItems: 'center', justifyContent: 'center',
        }}
        activeOpacity={0.85}
      >
        <Text style={{ fontSize: 14, fontWeight: '700', color: Colors.sand }}>
          Enviar para triagem →
        </Text>
      </TouchableOpacity>
    </View>
  </SafeAreaView>
</Modal>
```

- [ ] **Step 5: Verify TypeScript**

```bash
npx tsc --noEmit
```
Expected: no errors.

- [ ] **Step 6: Manual verify**

1. Open Vault → tap the import button
2. Paste text: `"run\njump\nbeautiful"`
3. Tap "Enviar para triagem" → Triagem screen opens with 3 items
4. Each item has empty gloss (user fills in Triagem or saves as-is)
5. A word already in Vault is filtered out from the import

- [ ] **Step 7: Commit**

```bash
git add src/screens/VaultScreen.tsx
git commit -m "feat(vault): add bulk word import modal with triagem integration"
```
