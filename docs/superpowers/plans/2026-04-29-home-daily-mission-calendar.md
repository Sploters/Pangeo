# Daily Mission + Review Calendar Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Show a daily mission card on the Home screen with a configurable goal (e.g. "revisar 15 cards") and a progress bar, plus a 7-day review forecast section in ProfileScreen showing how many cards are due each day.

**Architecture:** `ProfileStore` tracks `dailyGoal` (target cards/day) and `todayReviewed` (count that resets each new day, derived from `lastStudyDate`). `HomeScreen` shows a compact mission progress card. `ProfileScreen` adds a calendar section computed from `vault.items[].nextReviewAt` — no new store data needed for the calendar, it's derived at render time.

**Tech Stack:** React Native, Zustand — no new dependencies.

---

## Files

| Action | File | What changes |
|--------|------|--------------|
| Modify | `src/store/index.ts` | Add `dailyGoal`, `todayReviewed` to `ProfileStore` |
| Modify | `src/screens/HomeScreen.tsx` | Add daily mission card below the hero card |
| Modify | `src/screens/ProfileScreen.tsx` | Add 7-day review calendar section |

---

### Task 1: Add daily goal tracking to ProfileStore

**Files:**
- Modify: `src/store/index.ts`

- [ ] **Step 1: Add fields to the ProfileStore type**

In `type ProfileStore`, add after `studyIntensity: StudyIntensity;`:

```typescript
dailyGoal: number;        // target reviews per day (default 15)
todayReviewed: number;    // cards reviewed today (resets on new day)
setDailyGoal: (n: number) => void;
```

- [ ] **Step 2: Add defaults and implementations**

In the `create<ProfileStore>()` initializer, add after `studyIntensity: 'moderate' as StudyIntensity,`:

```typescript
dailyGoal: 15,
todayReviewed: 0,
```

Add after `setClozeEnabled: (clozeEnabled) => set({ clozeEnabled }),`:

```typescript
setDailyGoal: (dailyGoal) => set({ dailyGoal }),
```

- [ ] **Step 3: Update `trackStudySession` to count todayReviewed**

The existing `trackStudySession` already tracks `lastStudyDate`. Add `todayReviewed` tracking inside it. Replace the `trackStudySession` implementation with:

```typescript
trackStudySession: (cards) =>
  set((s) => {
    const today = todayKey();
    const yesterday = yesterdayKey();
    let newStreak = s.streak;
    if (s.lastStudyDate === today) {
      // same day — streak already counted
    } else if (s.lastStudyDate === yesterday) {
      newStreak = s.streak + 1;
    } else {
      newStreak = 1;
    }
    const newBest = Math.max(newStreak, s.bestStreak);
    const idx = dayOfWeekIdx();
    const weekly = [...s.weeklyCards];
    weekly[idx] = s.lastStudyDate === today ? weekly[idx] + cards : cards;
    // todayReviewed: reset on new day, accumulate same day
    const todayReviewed = s.lastStudyDate === today
      ? s.todayReviewed + cards
      : cards;
    return {
      streak: newStreak,
      bestStreak: newBest,
      lastStudyDate: today,
      weeklyCards: weekly,
      todayReviewed,
    };
  }),
```

- [ ] **Step 4: Verify TypeScript**

```bash
npx tsc --noEmit
```
Expected: no errors.

- [ ] **Step 5: Commit**

```bash
git add src/store/index.ts
git commit -m "feat(store): add dailyGoal and todayReviewed to ProfileStore"
```

---

### Task 2: Add daily mission card to HomeScreen

**Files:**
- Modify: `src/screens/HomeScreen.tsx`

- [ ] **Step 1: Import `dailyGoal` and `todayReviewed` from profile store**

The file already uses `useProfileStore`. Update the destructure:

```typescript
const { name, streak, dailyGoal, todayReviewed } = useProfileStore();
```

- [ ] **Step 2: Compute mission progress**

After the existing `const reviewableCount = ...` line, add:

```typescript
const missionPct = Math.min(1, dailyGoal > 0 ? todayReviewed / dailyGoal : 0);
const missionDone = todayReviewed >= dailyGoal;
```

- [ ] **Step 3: Add mission card JSX**

After the closing `</View>` of the hero card section (the outer `<View style={{ paddingHorizontal: Spacing.lg, paddingTop: 8 }}>` block), add:

```tsx
{/* Daily Mission */}
<View style={{ paddingHorizontal: Spacing.lg, marginTop: 12 }}>
  <View style={{
    backgroundColor: Colors.paper, borderRadius: Radius.md,
    borderWidth: 0.5, borderColor: missionDone ? Colors.moss : Colors.line,
    padding: 14,
  }}>
    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
      <View>
        <Text style={{ fontSize: 13, fontWeight: '700', color: Colors.ink }}>
          {missionDone ? '✓ Meta do dia concluída!' : 'Meta do dia'}
        </Text>
        <Text style={{ fontSize: 11, color: Colors.inkMute, marginTop: 1 }}>
          {todayReviewed} / {dailyGoal} cards revisados
        </Text>
      </View>
      <Text style={{ fontSize: 22, fontWeight: '700', color: missionDone ? Colors.moss : Colors.ink }}>
        {Math.round(missionPct * 100)}%
      </Text>
    </View>
    <View style={{ height: 6, backgroundColor: Colors.line, borderRadius: 3 }}>
      <View style={{
        height: 6, borderRadius: 3,
        backgroundColor: missionDone ? Colors.moss : Colors.ocean,
        width: `${missionPct * 100}%` as any,
      }} />
    </View>
  </View>
</View>
```

- [ ] **Step 4: Verify TypeScript**

```bash
npx tsc --noEmit
```
Expected: no errors.

- [ ] **Step 5: Manual verify**

1. Run app — the mission card shows "0 / 15 cards revisados" with 0% bar
2. Do 3 SRS reviews — card updates to "3 / 15"
3. In `store/index.ts`, temporarily change default `dailyGoal: 3` and `todayReviewed: 3` → card shows "✓ Meta do dia concluída!" in green
4. Revert the defaults

- [ ] **Step 6: Commit**

```bash
git add src/screens/HomeScreen.tsx
git commit -m "feat(home): add daily mission progress card"
```

---

### Task 3: Add 7-day review calendar to ProfileScreen

**Files:**
- Modify: `src/screens/ProfileScreen.tsx`

- [ ] **Step 1: Read the current ProfileScreen to find the correct insertion point**

Read `src/screens/ProfileScreen.tsx` to identify the bottom of the ScrollView content so you can add the calendar section before the closing `</ScrollView>`.

- [ ] **Step 2: Import vault store in ProfileScreen**

At the top of `ProfileScreen.tsx`, add:

```typescript
import { useVaultStore } from '../store';
```

- [ ] **Step 3: Add calendar computation inside the component**

After the existing store destructures, add:

```typescript
const { items } = useVaultStore();

const calendarDays = useMemo(() => {
  const days: { label: string; count: number; isToday: boolean }[] = [];
  const now = new Date();
  for (let i = 0; i < 7; i++) {
    const d = new Date(now);
    d.setDate(now.getDate() + i);
    const startMs = new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
    const endMs   = startMs + 86_400_000;
    const count = i === 0
      ? items.filter((v) => v.nextReviewAt <= Date.now() && v.gloss.trim()).length
      : items.filter((v) => v.nextReviewAt >= startMs && v.nextReviewAt < endMs && v.gloss.trim()).length;
    const DOW = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
    days.push({ label: i === 0 ? 'Hoje' : DOW[d.getDay()], count, isToday: i === 0 });
  }
  return days;
}, [items]);

const calendarMax = Math.max(1, ...calendarDays.map((d) => d.count));
```

> Note: `useMemo` requires importing it — add to the React import if not present: `import React, { useMemo } from 'react';`

- [ ] **Step 4: Add calendar section JSX**

Before the closing `</ScrollView>` in ProfileScreen, add:

```tsx
{/* 7-day review forecast */}
<View style={{ paddingHorizontal: Spacing.lg, marginTop: 24, marginBottom: 8 }}>
  <Text style={{ fontSize: 12, fontWeight: '700', letterSpacing: 0.8, textTransform: 'uppercase', color: Colors.inkSoft, marginBottom: 12 }}>
    Previsão de revisões
  </Text>
  <View style={{
    backgroundColor: Colors.paper, borderRadius: Radius.md,
    borderWidth: 0.5, borderColor: Colors.line, padding: 16,
  }}>
    <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 6, height: 80 }}>
      {calendarDays.map((day, i) => {
        const barHeight = calendarMax > 0 ? Math.max(4, (day.count / calendarMax) * 72) : 4;
        return (
          <View key={i} style={{ flex: 1, alignItems: 'center', gap: 4 }}>
            <Text style={{ fontSize: 10, fontWeight: '700', color: day.count > 0 ? Colors.ink : Colors.inkMute }}>
              {day.count > 0 ? day.count : ''}
            </Text>
            <View style={{
              width: '100%', height: barHeight,
              backgroundColor: day.isToday ? Colors.coral : Colors.moss,
              borderRadius: 3, opacity: day.count === 0 ? 0.25 : 1,
            }} />
            <Text style={{
              fontSize: 10, fontWeight: day.isToday ? '700' : '500',
              color: day.isToday ? Colors.coral : Colors.inkMute,
            }}>
              {day.label}
            </Text>
          </View>
        );
      })}
    </View>
  </View>
</View>
```

- [ ] **Step 5: Verify TypeScript**

```bash
npx tsc --noEmit
```
Expected: no errors.

- [ ] **Step 6: Manual verify**

1. Open Profile screen — 7-day bar chart appears at the bottom
2. "Hoje" bar is coral-colored, future bars are moss-green
3. Days with 0 cards due show a faint empty bar with no count label
4. After reviewing some cards (which updates `nextReviewAt` to the future), the corresponding future day bar grows

- [ ] **Step 7: Commit**

```bash
git add src/screens/ProfileScreen.tsx
git commit -m "feat(profile): add 7-day SRS review forecast calendar"
```

---

### Task 4 (optional): Daily goal setting in Profile

**Files:**
- Modify: `src/screens/ProfileScreen.tsx`

- [ ] **Step 1: Import `setDailyGoal` from profile store**

Update the ProfileStore destructure to include `dailyGoal` and `setDailyGoal`.

- [ ] **Step 2: Add a goal picker row**

After the 7-day calendar card, add a row that lets the user pick their daily goal from preset options:

```tsx
<View style={{ paddingHorizontal: Spacing.lg, marginTop: 12 }}>
  <Text style={{ fontSize: 12, fontWeight: '700', letterSpacing: 0.8, textTransform: 'uppercase', color: Colors.inkSoft, marginBottom: 10 }}>
    Meta diária
  </Text>
  <View style={{ flexDirection: 'row', gap: 8 }}>
    {[5, 10, 15, 20, 30].map((n) => (
      <TouchableOpacity
        key={n}
        onPress={() => setDailyGoal(n)}
        style={{
          flex: 1, paddingVertical: 10, borderRadius: Radius.md,
          backgroundColor: dailyGoal === n ? Colors.moss : Colors.paper,
          borderWidth: 0.5, borderColor: dailyGoal === n ? Colors.moss : Colors.line,
          alignItems: 'center',
        }}
        activeOpacity={0.8}
      >
        <Text style={{ fontSize: 14, fontWeight: '700', color: dailyGoal === n ? Colors.sand : Colors.ink }}>
          {n}
        </Text>
      </TouchableOpacity>
    ))}
  </View>
</View>
```

- [ ] **Step 3: Verify TypeScript and manual test**

```bash
npx tsc --noEmit
```

Test: tap different goal values — the selected one highlights in green, and the HomeScreen mission card updates the denominator.

- [ ] **Step 4: Commit**

```bash
git add src/screens/ProfileScreen.tsx
git commit -m "feat(profile): add daily goal picker"
```
