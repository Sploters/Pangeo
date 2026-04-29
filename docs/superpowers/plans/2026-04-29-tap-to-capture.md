# Tap-to-Capture in News Articles Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Allow users to tap any highlighted vocab word in a news article and capture it directly to the Vault from the tooltip, closing the loop between reading and learning.

**Architecture:** The `NewsArticleScreen` already has a tooltip modal triggered by tapping vocab-highlighted words. The tooltip shows term, gloss, and example. This plan adds a "Capturar" button to the tooltip that calls `addItem` directly — if the word is already in vault the button shows "✓ No Vault". No new screens required.

**Tech Stack:** React Native, Zustand — no new dependencies.

---

## Files

| Action | File | What changes |
|--------|------|--------------|
| Modify | `src/screens/NewsArticleScreen.tsx` | Add capture button to tooltip, import `useVaultStore.addItem` |

---

### Task 1: Add capture action to the tooltip modal

**Files:**
- Modify: `src/screens/NewsArticleScreen.tsx`

- [ ] **Step 1: Import `addItem` from vault store**

The file already imports `useVaultStore`. Change the destructure:

```typescript
const { items, addItem } = useVaultStore();
```

- [ ] **Step 2: Add `captureFromTooltip` handler**

After the `const [tooltip, setTooltip] = useState<VocabSuggestion | null>(null);` line, add:

```typescript
const captureFromTooltip = (v: VocabSuggestion) => {
  const now = new Date();
  addItem({
    term: v.term,
    type: v.type,
    lang: 'en→pt',
    gloss: v.gloss,
    source: v.source,
    date: `${now.toLocaleDateString('pt-BR')} · ${now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`,
    example: v.example ?? '',
    srs: 'new',
    strength: 0,
    tags: [],
    function: v.function,
    level: v.level,
    stability: 0,
    difficulty: 5,
    lapses: 0,
    lastReviewAt: 0,
    nextReviewAt: 0,
  });
  setTooltip(null);
};
```

- [ ] **Step 3: Add capture button inside the tooltip card**

The current tooltip card ends at `{tooltip.example && <Text style={s.tooltipExample}>"{tooltip.example}"</Text>}`. Add the button below the example and before the closing `</View>` of `tooltipCard`:

```tsx
{tooltip && (
  <Modal transparent animationType="fade" onRequestClose={() => setTooltip(null)}>
    <TouchableOpacity style={s.overlay} activeOpacity={1} onPress={() => setTooltip(null)}>
      <View style={s.tooltipCard}>
        <Text style={s.tooltipTerm}>{tooltip.term}</Text>
        <Text style={s.tooltipGloss}>{tooltip.gloss}</Text>
        {tooltip.example && <Text style={s.tooltipExample}>"{tooltip.example}"</Text>}

        {/* Capture button */}
        {(() => {
          const alreadyCaptured = items.some(
            (i) => i.term.toLowerCase() === tooltip.term.toLowerCase(),
          );
          return (
            <TouchableOpacity
              onPress={() => !alreadyCaptured && captureFromTooltip(tooltip)}
              disabled={alreadyCaptured}
              style={{
                marginTop: 16,
                backgroundColor: alreadyCaptured ? Colors.mossSoft : Colors.moss,
                borderRadius: Radius.full,
                paddingVertical: 11,
                alignItems: 'center',
              }}
              activeOpacity={0.85}
            >
              <Text style={{
                fontSize: 13, fontWeight: '700',
                color: alreadyCaptured ? Colors.moss : Colors.sand,
              }}>
                {alreadyCaptured ? '✓ No Vault' : 'Capturar →'}
              </Text>
            </TouchableOpacity>
          );
        })()}
      </View>
    </TouchableOpacity>
  </Modal>
)}
```

> Note: Replace the entire existing tooltip Modal block with this updated version.

- [ ] **Step 4: Verify TypeScript**

```bash
npx tsc --noEmit
```
Expected: no errors.

- [ ] **Step 5: Manual verify**

1. Open a news article, tap a highlighted word
2. Tooltip appears with term + gloss + "Capturar →" button
3. Tap "Capturar →" — tooltip closes, word added to Vault
4. Tap the same word again — tooltip shows "✓ No Vault" (disabled)
5. Open Vault — confirm the captured word appears

- [ ] **Step 6: Commit**

```bash
git add src/screens/NewsArticleScreen.tsx
git commit -m "feat(news): add one-tap capture button to vocab tooltip"
```
