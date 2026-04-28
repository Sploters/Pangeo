import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { VaultItem } from '../data/seed';

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
  updateSRS: (id: number, srs: VaultItem['srs'], strength: number) => void;
};

export const useVaultStore = create<VaultStore>()(
  persist(
    (set) => ({
      items: [],
      addItem: (item) =>
        set((s) => ({ items: [{ ...item, id: Date.now() }, ...s.items] })),
      updateSRS: (id, srs, strength) =>
        set((s) => ({
          items: s.items.map((v) => (v.id === id ? { ...v, srs, strength } : v)),
        })),
    }),
    { name: 'pangeo-vault-v2', storage: createJSONStorage(() => AsyncStorage) }
  )
);

// ─── ProfileStore ─────────────────────────────────────────────────────────────
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
  setName: (n: string) => void;
  setLevel: (l: string) => void;
  setOnboarded: () => void;
  trackStudySession: (cards: number) => void;
  recordLatency: (ms: number) => void;
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
      setName: (name) => set({ name }),
      setLevel: (level) => set({ level }),
      setOnboarded: () => set({ onboarded: true }),
      recordLatency: (ms) =>
        set((s) => {
          const samples = s.latencySamples + 1;
          const avg = Math.round((s.avgLatencyMs * s.latencySamples + ms) / samples);
          return { avgLatencyMs: avg, latencySamples: samples };
        }),
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
          return {
            streak: newStreak,
            bestStreak: newBest,
            lastStudyDate: today,
            weeklyCards: weekly,
          };
        }),
    }),
    { name: 'pangeo-profile-v2', storage: createJSONStorage(() => AsyncStorage) }
  )
);
