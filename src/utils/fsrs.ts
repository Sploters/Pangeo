import { VaultItem } from '../data/seed';

// FSRS-4.5 pre-trained parameters from Anki dataset
const W = [
  0.4072, 1.1829, 3.1262, 15.4722, // w0-w3: initial stability per grade (1-4)
  7.2102, 0.5316,                   // w4-w5: initial difficulty
  1.0651, 0.0589,                   // w6-w7: difficulty update
  1.5060, 0.1544, 1.0140,           // w8-w10: recall stability growth
  1.9332, 0.1100, 0.2900, 0.2272,  // w11-w14: forget stability
  2.9898, 0.5100,                   // w15-w16: hard penalty / easy bonus
];

const DESIRED_RETENTION = 0.9;
const MS_PER_DAY = 86_400_000;

function clamp(v: number, lo: number, hi: number) {
  return Math.max(lo, Math.min(hi, v));
}

// Probability of recall after `elapsedDays` with stability `s`
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

// First review of a new card
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

// Subsequent reviews
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
      nextReviewAt: now + 10 * 60_000, // 10 minutes
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

// Preview next intervals for each grade without committing (used for UI display)
export function previewIntervals(
  item: Pick<VaultItem, 'stability' | 'difficulty' | 'lapses' | 'lastReviewAt'>,
): Record<1 | 2 | 3 | 4, string> {
  const labels = {} as Record<1 | 2 | 3 | 4, string>;
  ([1, 2, 3, 4] as const).forEach((g) => {
    if (g === 1) { labels[1] = '10m'; return; }
    const patch = item.lastReviewAt === 0 ? initFSRS(g) : reviewFSRS(item, g);
    const days  = Math.max(1, Math.round((patch.nextReviewAt - Date.now()) / MS_PER_DAY));
    labels[g] = days >= 30
      ? `${Math.round(days / 30)}mo`
      : days >= 7
      ? `${Math.round(days / 7)}sem`
      : `${days}d`;
  });
  return labels;
}
