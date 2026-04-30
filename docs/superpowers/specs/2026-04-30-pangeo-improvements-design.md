# Pangeo — Improvements Design
**Date:** 2026-04-30  
**Status:** Approved  
**Scope:** Coherence fixes · Discover upgrade · Connected Speech tiers + vault bridge · Bonus features

---

## 1. Context

Pangeo is a React Native app (Expo) for Brazilian Portuguese speakers learning English. It features SRS flashcards (FSRS), a vocabulary vault, grammar lessons, news reading, content discovery, and connected speech reference. All data is local (Zustand + AsyncStorage). No backend.

This spec covers four areas identified in a brainstorm session over the current codebase:
1. Seven coherence bugs (dead UI, inconsistent data, broken navigation links)
2. Discover tab — content upgrade (famous books + real news tier)
3. Connected Speech — complexity tiers + vault bridge
4. Small bonus features (word of the day, vault export, TTS in SRS)

---

## 2. Coherence Fixes

Seven targeted fixes, no new architecture.

### 2.1 Discover level label hardcoded
**File:** `src/screens/ContentScreen.tsx`  
**Change:** Replace hardcoded `"PARA VOCÊ · B2"` with `useProfileStore().level`.

### 2.2 Filter button in Discover has no handler
**File:** `src/screens/ContentScreen.tsx`  
**Change:** Add a simple bottom-sheet or `Alert`-based filter that lets the user filter content by `kind` (podcast / book / video / article) and `level`. A minimal inline state (`filterKind`, `filterLevel`) is enough — no new screen.

### 2.3 SRS grammar suggestion opens external URL
**File:** `src/screens/SRSScreen.tsx`  
**Change:** Replace `Linking.openURL(suggestion.url)` with `navigation.navigate('GrammarDetail', { topicId: suggestion.id })`. The `GrammarTopic` type already has an `id` field.

### 2.4 Bookmark icon in SRS card has no handler
**File:** `src/screens/SRSScreen.tsx`  
**Change:** Tapping the bookmark icon on the front of a flashcard toggles a `bookmarked` boolean on the `VaultItem`. Add `bookmarked?: boolean` to `VaultItem` type and a `toggleBookmark(id)` action to `VaultStore`. The icon becomes filled when `bookmarked === true`.

### 2.5 "Novo" badge on Connected Speech never dismisses
**File:** `src/screens/HomeScreen.tsx`, `src/store/index.ts`  
**Change:** Add `visitedConnectedSpeech: boolean` flag to `ProfileStore`. Set it to `true` on first visit to `PronunciationScreen`. The "Novo" badge on the Home quick-action card only renders when `!visitedConnectedSpeech`.

### 2.6 Profile Zipf coverage uses fake formula
**File:** `src/screens/ProfileScreen.tsx`  
**Change:** Remove the `ZIPF_BASE[level] + totalWords/40` approximation. Use the same real calculation used in `HomeScreen` and `ZipfScreen`: count vault items whose `term` matches a word in `ZIPF_TOP_500`, divide by `ZIPF_TOP_500.length`.

### 2.7 ShadowingScreen is unreachable
**File:** `src/screens/PronunciationScreen.tsx`  
**Change:** Add a "Shadowing" entry card at the bottom of `PronunciationScreen` (or as a new tab in the connected speech tabs row) that navigates to `Shadowing` modal.

---

## 3. Discover — Content Upgrade

### 3.1 Famous classic books (public domain)

Add six well-known titles to the existing `CONTENT` array — do not remove current entries. All are public domain and can include real chapter text in the `chapters` field used by `BookReaderScreen`.

| Title | Level | Notes |
|-------|-------|-------|
| *Alice's Adventures in Wonderland* | B1 | Lewis Carroll, 1865 |
| *The Wonderful Wizard of Oz* | B1 | L. Frank Baum, 1900 |
| *Animal Farm* | B2 | George Orwell, 1945 |
| *The Old Man and the Sea* | B2 | Ernest Hemingway, 1952 |
| *The Great Gatsby* | C1 | F. Scott Fitzgerald, 1925 (PD since 2021) |
| O. Henry short stories (3–5) | B2 | Each story = one `ContentItem` with `kind: 'book'` |

Each book entry keeps the existing `ContentItem` schema: `chapters` array with `{ title, body }` pairs (short chapters, ~500 words each). Vocabulary suggestions per book are pre-curated for triagem integration.

### 3.2 Real News tier (B2+)

Current "News in Levels" is level 1–3 graded text — good for A2–B1 but not authentic for intermediate+ learners.

**New "Real News" section:** 6 seed articles (~250–350 words each) from BBC News / The Guardian / NPR style, labeled B2+. Each uses the existing `NewsArticle` schema with `level: 4` (new numeric level added to the type union: `1 | 2 | 3 | 4`).

**Toggle in NewsListScreen:** Add a `source` filter at the top of `NewsListScreen`:
- **Graded** — shows articles with `level 1 | 2 | 3` (current behavior)
- **Real** — shows articles with `level 4`

No new screen. The toggle is a two-chip selector that sets a `sourceFilter` state value. The article list filters accordingly.

---

## 4. Connected Speech — Tiers + Vault Bridge

### 4.1 Complexity tiers

Each phenomenon tab (Schwa, Reductions, Linking, Assimilation, Elision) gains a three-option chip selector: **Basic · Intermediate · Advanced**. The selected tier is local state in `PronunciationScreen` (no persistence needed).

Seed data (`SCHWA_WORDS`, `REDUCTIONS`, `CONNECTED_SPEECH` in `seed.ts`) is expanded and each item gains a `tier: 'basic' | 'intermediate' | 'advanced'` field. Items are filtered by selected tier before rendering.

Example tier distribution per phenomenon:

**Schwa**
- Basic: *about, problem, family, banana, comfortable*
- Intermediate: schwa in function words (*for /fə/, of /əv/, to /tə/, a /ə/, the /ðə/*)
- Advanced: schwa in suffixes (*-tion, -er, -ous, -ance*), polysyllabic words

**Reductions**
- Basic: *gonna, wanna, gotta, kinda*
- Intermediate: *sorta, hafta, lemme, dunno, s'pose*
- Advanced: *wouldja, couldja, doncha, whatcha, shoulda, woulda*

**Linking**
- Basic: consonant + vowel (*an_apple, pick_it_up*)
- Intermediate: vowel + vowel with /j/ and /w/ glides (*go_on, see_it, how_are*)
- Advanced: multi-word groups (*not_at_all, kind_of_a*)

**Assimilation**
- Basic: *don't you → doncha*
- Intermediate: *did you → didja, would you → wouldja*
- Advanced: nasal assimilation (*ten pins → tem pins*), place assimilation

**Elision**
- Basic: /t/ between consonants (*bes(t) man, nex(t) door*)
- Intermediate: /d/ in clusters (*han(d)s, frien(d)s*)
- Advanced: elision in fast connected speech (*las(t) nigh(t)*)

### 4.2 Vault bridge

Items in the vault with `type === 'reduction'` or `type === 'phonetic'` automatically appear in the relevant Connected Speech tab, visually marked as "do seu vault" (e.g., a small moss-colored dot or "Vault" chip).

**Implementation:** `PronunciationScreen` calls `useVaultStore(s => s.items)` and filters at render time. No store changes. Vault items are appended after the seed items list for the relevant tab, deduplicated by `term`.

Vault items do not have a `tier` — they always render under the currently selected tier filter as a separate "From your vault" section below the main list, visible regardless of selected tier.

---

## 5. Bonus Features

### 5.1 Word of the Day (Home)

A daily vocabulary suggestion card on `HomeScreen`, positioned between "Meta do dia" and the quick actions row.

**Logic:** Filter `ZIPF_TOP_500` by rank, remove items already in the vault, take the first 20 results. Pick deterministically by index: `dayOfYear % Math.min(20, filtered.length)`, where `dayOfYear = Math.floor((Date.now() - new Date(year, 0, 0).getTime()) / 86_400_000)`. Show: term, gloss, example sentence, and a "Capturar" button that navigates to `Capture` pre-filled with the term. If all top-20 are already vaulted, the card does not render.

**State:** No persistence needed — recalculates from vault state each render.

### 5.2 Vault Export

A "Exportar Vault" button in `ProfileScreen` (below the stats section).

**Implementation:** Serialize `useVaultStore().items` to JSON, call `Share.share({ message: JSON.stringify(items, null, 2) })` from React Native's built-in `Share` API. No new dependencies.

### 5.3 TTS in SRS Cards

A small speaker icon on both the front and back of flashcards in `SRSScreen`. Tapping it calls `Speech.speak(term, { language: 'en-US' })` from `expo-speech` (already a transitive dependency in Expo projects).

On the front: speaks `card.term`. On the back: speaks `card.example` if present, otherwise `card.term`.

---

## 6. Data Model Changes

| Change | Type | Field |
|--------|------|-------|
| `VaultItem` | add optional | `bookmarked?: boolean` |
| `NewsArticle.level` | extend union | `1 \| 2 \| 3 \| 4` |
| `ConnectedSpeechItem` | add required | `tier: 'basic' \| 'intermediate' \| 'advanced'` |
| `SchwaWord` (in seed) | add required | `tier: 'basic' \| 'intermediate' \| 'advanced'` |
| `VaultStore` | add action | `toggleBookmark(id: number)` |
| `ProfileStore` | add field | `visitedConnectedSpeech: boolean` |
| `ProfileStore` | add action | `markConnectedSpeechVisited()` |

---

## 7. Files Affected

```
src/data/seed.ts               — new books, real news articles, tier fields on connected speech/schwa/reduction items
src/store/index.ts             — VaultStore.toggleBookmark, ProfileStore.visitedConnectedSpeech
src/screens/ContentScreen.tsx  — dynamic level label, filter handler
src/screens/NewsListScreen.tsx — Graded/Real toggle
src/screens/SRSScreen.tsx      — in-app grammar nav, bookmark handler, TTS button
src/screens/HomeScreen.tsx     — word of the day card, conditional "Novo" badge
src/screens/PronunciationScreen.tsx — tier selector, vault bridge section
src/screens/ProfileScreen.tsx  — real Zipf coverage, export button
```

---

## 8. Out of Scope

- Backend / cloud sync
- Audio files for connected speech (TTS covers SRS; pronunciation screen remains visual-only for now)
- Full comprehension quiz for news articles (separate future spec)
- Spaced repetition for grammar topics
