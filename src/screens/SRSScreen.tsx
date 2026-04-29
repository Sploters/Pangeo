import React, { useState, useRef, useEffect, useMemo } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, Animated, ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Colors, Radius, Spacing } from '../theme';
import { PgButton, PgChip, Icons } from '../components';
import { useVaultStore, useProfileStore, StudyIntensity } from '../store';
import { initFSRS, reviewFSRS, previewIntervals } from '../utils/fsrs';

function latencyLabel(ms: number): { text: string; color: string } {
  if (ms < 2000) return { text: 'RÁPIDO', color: Colors.moss };
  if (ms < 4500) return { text: 'OK', color: Colors.gold };
  return { text: 'LENTO', color: Colors.coral };
}

function fmtTime(seconds: number): string {
  if (seconds < 60) return `~${Math.round(seconds)}s`;
  return `~${Math.round(seconds / 60)} min`;
}

const GRADE_MAP = { again: 1, hard: 2, good: 3, easy: 4 } as const;

const INTENSITY_OPTIONS: { key: StudyIntensity; lbl: string; sub: string; icon: string; limit: number }[] = [
  { key: 'light',    lbl: 'Leve',     sub: '10 cards',   icon: '🌿', limit: 10 },
  { key: 'moderate', lbl: 'Moderado', sub: '20 cards',   icon: '⚖️', limit: 20 },
  { key: 'deep',     lbl: 'Intenso',  sub: '40 cards',   icon: '🔥', limit: 40 },
  { key: 'all',      lbl: 'Tudo',     sub: 'sem limite', icon: '💪', limit: Infinity },
];


export default function SRSScreen() {
  const navigation = useNavigation();
  const { items, updateSRS } = useVaultStore();
  const { trackStudySession, recordLatency, avgLatencyMs, studyIntensity, setStudyIntensity } = useProfileStore();

  const [phase, setPhase] = useState<'pick' | 'session'>('pick');
  const [selectedIntensity, setSelectedIntensity] = useState<StudyIntensity>(studyIntensity);
  const [flipped, setFlipped] = useState(false);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [sessionCards, setSessionCards] = useState(0);
  const [cardLatencyMs, setCardLatencyMs] = useState<number | null>(null);
  const [intervals, setIntervals] = useState<Record<1|2|3|4, string> | null>(null);
  const flipAnim = useRef(new Animated.Value(0)).current;
  const startTimeRef = useRef<number>(Date.now());

  // Full deck: items due for review that have a gloss
  const deck = useMemo(
    () => items.filter(
      (v) => (v.lastReviewAt === 0 || v.nextReviewAt <= Date.now()) && v.gloss.trim(),
    ),
    [items],
  );

  // Session deck: limited by intensity
  const sessionDeck = useMemo(() => {
    const opt = INTENSITY_OPTIONS.find((o) => o.key === selectedIntensity);
    const limit = opt?.limit ?? 20;
    return limit === Infinity ? deck : deck.slice(0, limit);
  }, [deck, selectedIntensity]);

  const card = sessionDeck[currentIdx];

  // Estimated seconds per card (recall time + ~5s to rate)
  const secPerCard = avgLatencyMs > 0 ? avgLatencyMs / 1000 + 5 : 8;

  // Reset timer whenever a new card appears (only in session phase)
  useEffect(() => {
    if (phase !== 'session') return;
    startTimeRef.current = Date.now();
    setFlipped(false);
    flipAnim.setValue(0);
    setCardLatencyMs(null);
    if (card) setIntervals(previewIntervals(card));
    else setIntervals(null);
  }, [currentIdx, phase]);

  const flip = () => {
    if (flipped) return;
    const elapsed = Date.now() - startTimeRef.current;
    setCardLatencyMs(elapsed);
    recordLatency(elapsed);
    Animated.timing(flipAnim, {
      toValue: 1, duration: 420, useNativeDriver: true,
    }).start(() => setFlipped(true));
  };

  const startSession = () => {
    setStudyIntensity(selectedIntensity);
    setCurrentIdx(0);
    setSessionCards(0);
    setPhase('session');
  };

  const next = (difficulty: keyof typeof GRADE_MAP) => {
    if (!card) return;
    const grade = GRADE_MAP[difficulty];
    const patch = card.lastReviewAt === 0 ? initFSRS(grade) : reviewFSRS(card, grade);
    updateSRS(card.id, patch);

    setSessionCards((c) => c + 1);
    trackStudySession(1);

    if (currentIdx + 1 < sessionDeck.length) {
      setCurrentIdx((i) => i + 1);
    } else {
      navigation.goBack();
    }
  };

  const frontRotate = flipAnim.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '90deg'] });
  const backRotate = flipAnim.interpolate({ inputRange: [0, 1], outputRange: ['-90deg', '0deg'] });

  // Empty state
  if (deck.length === 0) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.closeBtn} activeOpacity={0.7}>
            <Icons.Close size={20} color={Colors.ink} />
          </TouchableOpacity>
          <View style={{ flex: 1, alignItems: 'center' }}>
            <Text style={styles.headerEye}>REVISÃO ESPAÇADA</Text>
          </View>
          <View style={styles.closeBtn} />
        </View>
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32 }}>
          <Text style={{ fontSize: 40, marginBottom: 16 }}>🎉</Text>
          <Text style={{ fontSize: 20, fontWeight: '700', color: Colors.ink, textAlign: 'center', letterSpacing: -0.4 }}>
            Tudo em dia!
          </Text>
          <Text style={{ fontSize: 14, color: Colors.inkMute, textAlign: 'center', marginTop: 8, lineHeight: 20 }}>
            Você não tem cards para revisar agora. Capture novas palavras no Vault para começar.
          </Text>
          <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginTop: 28, backgroundColor: Colors.moss, paddingHorizontal: 24, paddingVertical: 12, borderRadius: Radius.full }}>
            <Text style={{ color: Colors.sand, fontWeight: '700', fontSize: 14 }}>Voltar</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // Intensity picker
  if (phase === 'pick') {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.closeBtn} activeOpacity={0.7}>
            <Icons.Close size={20} color={Colors.ink} />
          </TouchableOpacity>
          <View style={{ flex: 1, alignItems: 'center' }}>
            <Text style={styles.headerEye}>REVISÃO ESPAÇADA</Text>
          </View>
          <View style={styles.closeBtn} />
        </View>

        <ScrollView contentContainerStyle={{ paddingHorizontal: Spacing.lg, paddingBottom: 32 }}>
          <Text style={styles.pickerTitle}>Como quer estudar hoje?</Text>
          <Text style={styles.pickerSub}>
            {deck.length} card{deck.length !== 1 ? 's' : ''} disponíveis para revisão
          </Text>

          <View style={{ gap: 10, marginTop: 20 }}>
            {INTENSITY_OPTIONS.map((opt) => {
              const count = opt.limit === Infinity ? deck.length : Math.min(opt.limit, deck.length);
              const estSec = count * secPerCard;
              const active = selectedIntensity === opt.key;
              return (
                <TouchableOpacity
                  key={opt.key}
                  onPress={() => setSelectedIntensity(opt.key)}
                  style={[styles.intensityCard, active && styles.intensityCardActive]}
                  activeOpacity={0.8}
                >
                  <Text style={styles.intensityIcon}>{opt.icon}</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.intensityLbl, active && { color: Colors.sand }]}>{opt.lbl}</Text>
                    <Text style={[styles.intensitySub, active && { color: Colors.sand, opacity: 0.75 }]}>
                      {count} card{count !== 1 ? 's' : ''} · {fmtTime(estSec)}
                    </Text>
                  </View>
                  {active && (
                    <View style={styles.intensityCheck}>
                      <Text style={{ color: Colors.moss, fontSize: 14, fontWeight: '700' }}>✓</Text>
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>

          <View style={{ marginTop: 24 }}>
            <PgButton full variant="primary" onPress={startSession}>
              Começar sessão
            </PgButton>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.closeBtn} activeOpacity={0.7}>
          <Icons.Close size={20} color={Colors.ink} />
        </TouchableOpacity>
        <View style={{ flex: 1, alignItems: 'center' }}>
          <Text style={styles.headerEye}>REVISÃO ESPAÇADA</Text>
          <Text style={styles.headerSub}>
            <Text style={{ fontWeight: '700' }}>{currentIdx + 1} / {sessionDeck.length}</Text>
            {'  ·  '}sessão: {sessionCards} revisados
          </Text>
        </View>
        <View style={styles.closeBtn} />
      </View>

      {/* Progress */}
      <View style={styles.progressRow}>
        {sessionDeck.map((_, i) => (
          <View key={i} style={[
            styles.progressDot,
            { backgroundColor: i < currentIdx ? Colors.moss : i === currentIdx ? Colors.coral : Colors.line }
          ]} />
        ))}
      </View>

      {/* Card */}
      <View style={styles.cardArea}>
        {!flipped ? (
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
            {/* Latency badge */}
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

      {/* Difficulty or Reveal */}
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
      ) : (
        <View style={{ paddingHorizontal: Spacing.lg, paddingBottom: 22 }}>
          <PgButton full variant="primary" onPress={flip}>Revelar resposta</PgButton>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.sand },
  header: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: Spacing.lg, paddingTop: 8,
  },
  closeBtn: {
    width: 38, height: 38, borderRadius: Radius.full,
    alignItems: 'center', justifyContent: 'center',
  },
  headerEye: { fontSize: 10.5, fontWeight: '700', letterSpacing: 1.2, color: Colors.inkMute },
  headerSub: { fontSize: 12, marginTop: 2, color: Colors.inkSoft },
  progressRow: { flexDirection: 'row', gap: 3, paddingHorizontal: Spacing.lg, paddingTop: 8 },
  progressDot: { flex: 1, height: 3, borderRadius: 2 },
  cardArea: {
    flex: 1, paddingHorizontal: Spacing.lg, paddingTop: 24,
    alignItems: 'center', justifyContent: 'center',
  },
  card: {
    alignSelf: 'stretch', height: 340, borderRadius: Radius.lg,
    padding: 24, overflow: 'hidden',
  },
  cardFront: {
    backgroundColor: Colors.paper, borderWidth: 0.5, borderColor: Colors.line,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: Colors.ink, shadowOpacity: 0.08, shadowRadius: 30, shadowOffset: { width: 0, height: 12 },
    elevation: 4,
  },
  cardFrontWord: {
    fontSize: 34, fontWeight: '500', color: Colors.ink,
    letterSpacing: -0.8, textAlign: 'center', lineHeight: 42,
  },
  cardType: { fontSize: 12, color: Colors.inkMute, marginTop: 8, textTransform: 'uppercase', letterSpacing: 0.6 },
  tapHint: {
    position: 'absolute', bottom: 18,
    fontSize: 11, color: Colors.inkMute, fontWeight: '600', letterSpacing: 0.6,
  },
  cardBack: {
    backgroundColor: Colors.moss,
    shadowColor: Colors.ink, shadowOpacity: 0.12, shadowRadius: 30, shadowOffset: { width: 0, height: 12 },
    elevation: 4,
  },
  latencyBadge: {
    position: 'absolute', top: 14, right: 14,
    flexDirection: 'row', alignItems: 'center', gap: 5,
    backgroundColor: 'rgba(0,0,0,0.18)', borderRadius: Radius.full,
    paddingHorizontal: 8, paddingVertical: 4,
  },
  latencyDot: { width: 5, height: 5, borderRadius: 3 },
  latencyText: { fontSize: 9.5, fontWeight: '700', letterSpacing: 0.8 },
  backEye: { fontSize: 11, fontWeight: '700', letterSpacing: 1, color: Colors.sand, opacity: 0.6 },
  backMeaning: { fontSize: 22, fontWeight: '500', color: Colors.sand, lineHeight: 30, marginTop: 8, letterSpacing: -0.3 },
  backDivider: { height: 1, backgroundColor: 'rgba(244,234,213,0.18)', marginVertical: 16 },
  backContextLabel: { fontSize: 11, fontWeight: '700', letterSpacing: 1, color: Colors.sand, opacity: 0.6 },
  backExample: { fontSize: 16, lineHeight: 24, marginTop: 6, fontStyle: 'italic', color: Colors.sand, opacity: 0.92 },
  cardDebug: { position: 'absolute', bottom: 18, left: 24, right: 24, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  debugText: { fontSize: 10, fontWeight: '600', color: Colors.sand, opacity: 0.5, fontFamily: 'monospace' },
  diffLabel: { fontSize: 10.5, fontWeight: '700', letterSpacing: 1, color: Colors.inkMute, textAlign: 'center', marginBottom: 10 },
  diffRow: { flexDirection: 'row', gap: 6 },
  diffBtn: { flex: 1, borderRadius: 12, paddingVertical: 12, alignItems: 'center' },
  diffLbl: { fontSize: 13, fontWeight: '700' },
  diffSub: { fontSize: 11, fontWeight: '600', opacity: 0.7, fontFamily: 'monospace', marginTop: 2 },
  pickerTitle: { fontSize: 22, fontWeight: '700', color: Colors.ink, letterSpacing: -0.4, marginTop: 8 },
  pickerSub: { fontSize: 13, color: Colors.inkMute, marginTop: 4 },
  intensityCard: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    backgroundColor: Colors.paper, borderRadius: Radius.md,
    borderWidth: 0.5, borderColor: Colors.line,
    padding: 16,
  },
  intensityCardActive: {
    backgroundColor: Colors.moss, borderColor: Colors.moss,
  },
  intensityIcon: { fontSize: 28 },
  intensityLbl: { fontSize: 15, fontWeight: '700', color: Colors.ink },
  intensitySub: { fontSize: 12, color: Colors.inkMute, marginTop: 2 },
  intensityCheck: {
    width: 28, height: 28, borderRadius: 14,
    backgroundColor: Colors.sand,
    alignItems: 'center', justifyContent: 'center',
  },
});