import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { VaultItem } from '../data/seed';

// ─── GrammarStore ─────────────────────────────────────────────────────────────
export type GrammarStatus = 'unseen' | 'seen' | 'got-it' | 'review' | 'confused';

type GrammarStore = {
  progress: Record<string, GrammarStatus>;   // topicId → status
  collapsedLevels: string[];                  // level keys that are collapsed
  markSeen: (topicId: string) => void;
  setStatus: (topicId: string, status: GrammarStatus) => void;
  toggleLevel: (level: string) => void;
};

export const useGrammarStore = create<GrammarStore>()(
  persist(
    (set) => ({
      progress: {},
      collapsedLevels: [],
      markSeen: (topicId) =>
        set((s) => {
          if (s.progress[topicId]) return s; // don't downgrade existing status
          return { progress: { ...s.progress, [topicId]: 'seen' } };
        }),
      setStatus: (topicId, status) =>
        set((s) => ({ progress: { ...s.progress, [topicId]: status } })),
      toggleLevel: (level) =>
        set((s) => ({
          collapsedLevels: s.collapsedLevels.includes(level)
            ? s.collapsedLevels.filter((l) => l !== level)
            : [...s.collapsedLevels, level],
        })),
    }),
    { name: 'pangeo-grammar-v1', storage: createJSONStorage(() => AsyncStorage) }
  )
);

// ─── Date helpers ─────────────────────────────────────────────────────────────
function todayKey() {
  return new Date().toISOString().slice(0, 10); // 'YYYY-MM-DD'
}
function yesterdayKey() {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return d.toISOString().slice(0, 10);
}
function dayOfWeekIdx() {
  const dow = new Date().getDay(); // 0=Sun … 6=Sat
  return dow === 0 ? 6 : dow - 1; // Mon=0 … Sun=6
}

// ─── VaultStore ───────────────────────────────────────────────────────────────
type VaultStore = {
  items: VaultItem[];
  addItem: (item: Omit<VaultItem, 'id'>) => void;
  updateSRS: (id: number, patch: Partial<VaultItem>) => void;
  updateItem: (id: number, patch: Omit<VaultItem, 'id'>) => void;
  removeItem: (id: number) => void;
  toggleBookmark: (id: number) => void;
};

export const useVaultStore = create<VaultStore>()(
  persist(
    (set) => ({
      items: [],
      addItem: (item) =>
        set((s) => ({ items: [{ ...item, id: Date.now() }, ...s.items] })),
      updateSRS: (id, patch) =>
        set((s) => ({
          items: s.items.map((v) => (v.id === id ? { ...v, ...patch } : v)),
        })),
      updateItem: (id, patch) =>
        set((s) => ({
          items: s.items.map((v) => (v.id === id ? { ...v, ...patch } : v)),
        })),
      removeItem: (id) =>
        set((s) => ({ items: s.items.filter((v) => v.id !== id) })),
      toggleBookmark: (id) =>
        set((s) => ({
          items: s.items.map((v) =>
            v.id === id ? { ...v, bookmarked: !v.bookmarked } : v,
          ),
        })),
    }),
    { name: 'pangeo-vault-v2', storage: createJSONStorage(() => AsyncStorage) }
  )
);

// ─── ProfileStore ─────────────────────────────────────────────────────────────
export type StudyIntensity = 'light' | 'moderate' | 'deep' | 'all';

export type BadgeDef = { id: string; label: string; icon: string; desc: string };
export const BADGE_DEFS: BadgeDef[] = [
  { id: 'first-capture',  label: 'Primeira Captura', icon: '🎯', desc: 'Capture sua primeira palavra' },
  { id: 'collector-50',   label: 'Colecionador',     icon: '📚', desc: '50 palavras no Vault' },
  { id: 'scholar-100',    label: 'Acadêmico',        icon: '🎓', desc: '100 palavras no Vault' },
  { id: 'streak-7',       label: 'Dedicado',         icon: '🔥', desc: '7 dias de streak' },
  { id: 'streak-30',      label: 'Maratona',         icon: '💪', desc: '30 dias de streak' },
  { id: 'first-review',   label: 'Primeira Revisão', icon: '✅', desc: 'Complete sua primeira revisão SRS' },
  { id: 'reviews-100',    label: 'Incansável',       icon: '⚡', desc: '100 cards revisados' },
  { id: 'grammar-star',   label: 'Gramático',        icon: '📖', desc: 'Complete 5 lições de gramática' },
];

export const XP_PER_REVIEW = 10;
export const XP_PER_CAPTURE = 5;
export const XP_PER_CHALLENGE = 20;

export function xpForLevel(lvl: number): number {
  return lvl * (lvl + 1) * 50; // level 1=100, 2=300, 3=600, 4=1000, 5=1500...
}

export function levelFromXp(xp: number): number {
  let lvl = 1;
  while (xpForLevel(lvl) <= xp) lvl++;
  return lvl;
}

type DailyChallenge = {
  id: string;
  label: string;
  done: boolean;
};

type ProfileStore = {
  name: string;
  level: string;
  streak: number;
  bestStreak: number;
  lastStudyDate: string;
  weeklyCards: number[]; // [Mon, Tue, Wed, Thu, Fri, Sat, Sun]
  onboarded: boolean;
  avgLatencyMs: number;   // rolling average response latency across all SRS reviews
  latencySamples: number; // total samples recorded (for rolling average)
  studyIntensity: StudyIntensity;
  clozeEnabled: boolean;
  dailyGoal: number;        // target reviews per day (default 15)
  todayReviewed: number;    // cards reviewed today (resets on new day)
  visitedConnectedSpeech: boolean;
  xp: number;
  badges: string[];
  dailyChallenges: DailyChallenge[];
  setName: (n: string) => void;
  setLevel: (l: string) => void;
  setOnboarded: () => void;
  markConnectedSpeechVisited: () => void;
  trackStudySession: (cards: number) => void;
  recordLatency: (ms: number) => void;
  setStudyIntensity: (i: StudyIntensity) => void;
  setClozeEnabled: (v: boolean) => void;
  setDailyGoal: (n: number) => void;
  addXp: (amount: number) => void;
  addBadge: (id: string) => void;
  initDailyChallenges: () => void;
  completeChallenge: (id: string) => void;
};

export const useProfileStore = create<ProfileStore>()(
  persist(
    (set) => ({
      name: '',
      level: 'B1',
      streak: 0,
      bestStreak: 0,
      lastStudyDate: '',
      weeklyCards: [0, 0, 0, 0, 0, 0, 0],
      onboarded: false,
      avgLatencyMs: 0,
      latencySamples: 0,
      studyIntensity: 'moderate' as StudyIntensity,
      clozeEnabled: false,
      dailyGoal: 15,
      todayReviewed: 0,
      visitedConnectedSpeech: false,
      xp: 0,
      badges: [],
      dailyChallenges: [],
      setName: (name) => set({ name }),
      setLevel: (level) => set({ level }),
      setOnboarded: () => set({ onboarded: true }),
      markConnectedSpeechVisited: () => set({ visitedConnectedSpeech: true }),
      setStudyIntensity: (studyIntensity) => set({ studyIntensity }),
      setClozeEnabled: (clozeEnabled) => set({ clozeEnabled }),
      setDailyGoal: (dailyGoal) => set({ dailyGoal }),
      recordLatency: (ms) =>
        set((s) => {
          const samples = s.latencySamples + 1;
          const avg = Math.round((s.avgLatencyMs * s.latencySamples + ms) / samples);
          return { avgLatencyMs: avg, latencySamples: samples };
        }),
      addXp: (amount) =>
        set((s) => ({ xp: s.xp + amount })),
      addBadge: (id) =>
        set((s) => {
          if (s.badges.includes(id)) return s;
          return { badges: [...s.badges, id] };
        }),
      initDailyChallenges: () =>
        set((s) => {
          const today = todayKey();
          if (s.dailyChallenges.length > 0 && s.dailyChallenges[0].id.startsWith(today)) {
            return s; // already initialized for today
          }
          // Deterministic tasks based on dayOfYear
          const doy = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86_400_000);
          const taskPool = [
            { id: 'review',   label: 'Revisar 10 cards no SRS' },
            { id: 'capture',  label: 'Capturar 3 novas palavras' },
            { id: 'read',     label: 'Ler 1 notícia em inglês' },
            { id: 'grammar',  label: 'Estudar 1 lição de gramática' },
            { id: 'pronounce',label: 'Praticar pronúncia por 5 min' },
            { id: 'streak',   label: 'Manter o streak do dia' },
          ];
          // Pick 3 tasks deterministically based on the day
          const tasks = [0, 1, 2].map((offset) => {
            const idx = (doy + offset) % taskPool.length;
            return { ...taskPool[idx], id: `${today}-${taskPool[idx].id}`, done: false };
          });
          return { dailyChallenges: tasks };
        }),
      completeChallenge: (id) =>
        set((s) => ({
          dailyChallenges: s.dailyChallenges.map((t) =>
            t.id === id ? { ...t, done: true } : t
          ),
        })),
      trackStudySession: (cards) =>
        set((s) => {
          const today = todayKey();
          const yesterday = yesterdayKey();
          let newStreak = s.streak;
          if (s.lastStudyDate === today) {
            // Already counted today
          } else if (s.lastStudyDate === yesterday) {
            newStreak = s.streak + 1;
          } else {
            newStreak = 1;
          }
          const newBest = Math.max(newStreak, s.bestStreak);
          const idx = dayOfWeekIdx();
          const weekly = [...s.weeklyCards];
          weekly[idx] = s.lastStudyDate === today ? weekly[idx] + cards : cards;
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
    }),
    { name: 'pangeo-profile-v2', storage: createJSONStorage(() => AsyncStorage) }
  )
);
