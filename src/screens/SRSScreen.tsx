import React, { useState, useRef, useEffect, useMemo } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, Animated, ScrollView, TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Colors, Radius, Spacing } from '../theme';
import { PgButton, PgChip, Icons } from '../components';
import { useVaultStore, useProfileStore, StudyIntensity } from '../store';
import { initFSRS, reviewFSRS, previewIntervals } from '../utils/fsrs';
import { VaultItem, GRAMMAR_TOPICS, GrammarTopic } from '../data/seed';
import { RootStackParamList } from '../navigation';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import * as Speech from 'expo-speech';

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

function buildCloze(example: string, term: string): string | null {
  if (!example.trim()) return null;
  const escaped = term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const re = new RegExp(`\\b${escaped}\\b`, 'i');
  return re.test(example) ? example.replace(re, '___') : null;
}

type Nav = NativeStackNavigationProp<RootStackParamList>;

export default function SRSScreen() {
  const navigation = useNavigation<Nav>();
  const { items, updateSRS, toggleBookmark } = useVaultStore();
  const { trackStudySession, recordLatency, avgLatencyMs, studyIntensity, setStudyIntensity, clozeEnabled, setClozeEnabled, level } = useProfileStore();

  const [phase, setPhase] = useState<'pick' | 'session'>('pick');
  const [selectedIntensity, setSelectedIntensity] = useState<StudyIntensity>(studyIntensity);
  const [activeSessionDeck, setActiveSessionDeck] = useState<VaultItem[]>([]);
  const [flipped, setFlipped] = useState(false);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [sessionCards, setSessionCards] = useState(0);
  const [cardLatencyMs, setCardLatencyMs] = useState<number | null>(null);
  const [intervals, setIntervals] = useState<Record<1|2|3|4, string> | null>(null);
  const [clozeAnswer, setClozeAnswer] = useState('');
  const [clozeSubmitted, setClozeSubmitted] = useState(false);
  const [clozeCorrect, setClozeCorrect] = useState(false);
  const [suggestion, setSuggestion] = useState<GrammarTopic | null>(null);
  const flipAnim = useRef(new Animated.Value(0)).current;
  const startTimeRef = useRef<number>(Date.now());

  const findSuggestion = (item: VaultItem, userLevel: string) => {
    let topic: GrammarTopic | undefined;
    if (item.type === 'phrase') {
      topic = GRAMMAR_TOPICS.find(t => t.title === 'Phrasal verbs');
    }
    if (!topic && item.term.toLowerCase().endsWith('ing')) {
      topic = GRAMMAR_TOPICS.find(t => t.title === (userLevel.startsWith('A') ? 'Present continuous' : 'Past continuous'));
    }
    if (topic) return topic;
    const baseLevel = userLevel.charAt(0);
    return GRAMMAR_TOPICS.find(t => t.level.startsWith(baseLevel)) || GRAMMAR_TOPICS[0];
  };

  // Full deck: items due for review that have a gloss
  const deck = useMemo(
    () => items.filter(
      (v) => (v.lastReviewAt === 0 || v.nextReviewAt <= Date.now()) && v.gloss.trim(),
    ),
    [items],
  );

  const card = activeSessionDeck[currentIdx];

  const clozeSentence = useMemo(() => {
    if (!card || !clozeEnabled) return null;
    return buildCloze(card.example, card.term);
  }, [card, clozeEnabled]);

  const cardMode: 'flashcard' | 'cloze' = clozeSentence ? 'cloze' : 'flashcard';

  // Smarter study time estimation
  const estimatedSecPerCard = useMemo(() => {
    const nonMatureCount = deck.filter(c => c.srs !== 'mature').length;
    const repetitionWeight = deck.length > 0 ? nonMatureCount / deck.length : 0.5;
    const baseTimePerCard = avgLatencyMs > 0 ? (avgLatencyMs / 1000) + 4.5 : 10;
    return baseTimePerCard * (1 + repetitionWeight * 0.7);
  }, [deck, avgLatencyMs]);

  // Reset timer whenever a new card appears (only in session phase)
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
    
    const opt = INTENSITY_OPTIONS.find((o) => o.key === selectedIntensity);
    const limit = opt?.limit ?? 20;
    const initialDeck = limit === Infinity ? deck : deck.slice(0, limit);
    setActiveSessionDeck(initialDeck);

    setCurrentIdx(0);
    setSessionCards(0);
    setPhase('session');
  };

  const submitCloze = () => {
    const elapsed = Date.now() - startTimeRef.current;
    setCardLatencyMs(elapsed);
    recordLatency(elapsed);
    const correct = clozeAnswer.trim().toLowerCase() === card.term.trim().toLowerCase();
    setClozeCorrect(correct);
    setClozeSubmitted(true);
    if (card) setIntervals(previewIntervals(card));
  };

  const next = (difficulty: keyof typeof GRADE_MAP) => {
    if (!card) return;
    const grade = GRADE_MAP[difficulty];
    const patch = card.lastReviewAt === 0 ? initFSRS(grade) : reviewFSRS(card, grade);
    const updatedCard = { ...card, ...patch };
    updateSRS(card.id, patch);

    const shouldRepeat = grade === 1 || grade === 2;

    if (shouldRepeat) {
      setSuggestion(findSuggestion(card, level));
    } else {
      setSuggestion(null);
    }

    // Repetition logic: add updated card to end of session deck
    if (shouldRepeat) {
      setActiveSessionDeck((prev) => [...prev, updatedCard]);
    }

    setSessionCards((c) => c + 1);
    trackStudySession(1);

    if (currentIdx + 1 < activeSessionDeck.length || shouldRepeat) {
      setCurrentIdx((i) => i + 1);
    } else {
      navigation.goBack();
    }
  };

  const frontRotate = flipAnim.interpolate({ 
    inputRange: [0, 1], 
    outputRange: ['0deg', '180deg'] 
  });
  const backRotate = flipAnim.interpolate({ 
    inputRange: [0, 1], 
    outputRange: ['180deg', '360deg'] 
  });

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
              const estSec = count * estimatedSecPerCard;
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
            <Text style={{ fontWeight: '700' }}>{currentIdx + 1} / {activeSessionDeck.length}</Text>
            {'  ·  '}sessão: {sessionCards} revisados
          </Text>
        </View>
        <View style={styles.closeBtn} />
      </View>

      {/* Progress */}
      <View style={styles.progressRow}>
        {activeSessionDeck.length <= 30 ? (
          activeSessionDeck.map((_, i) => (
            <View key={i} style={[
              styles.progressDot,
              { backgroundColor: i < currentIdx ? Colors.moss : i === currentIdx ? Colors.coral : Colors.line }
            ]} />
          ))
        ) : (
          <View style={{ flex: 1, height: 3, backgroundColor: Colors.line, borderRadius: 2, overflow: 'hidden' }}>
            <View style={{ 
              width: `${((currentIdx + 1) / activeSessionDeck.length) * 100}%`, 
              height: '100%', 
              backgroundColor: Colors.moss 
            }} />
          </View>
        )}
      </View>

      {/* Card Area */}
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
        ) : (
          <View style={styles.cardContainer}>
            {/* BACK SIDE (rendered first to be behind) */}
            <Animated.View 
              style={[
                styles.card, 
                styles.cardBack, 
                { 
                  position: 'absolute',
                  top: 0, left: 0, right: 0, bottom: 0,
                  backfaceVisibility: 'hidden',
                  transform: [{ rotateY: backRotate }] 
                }
              ]}
            >
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
              <TouchableOpacity
                onPress={() => Speech.speak(card.example || card.term, { language: 'en-US' })}
                style={{ position: 'absolute', top: 14, left: 14 }}
                activeOpacity={0.7}
              >
                <Icons.Play size={18} color={Colors.sand} />
              </TouchableOpacity>
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

            {/* FRONT SIDE (rendered last to be on top and catch touches) */}
            <Animated.View 
              style={[
                styles.card, 
                styles.cardFront, 
                { 
                  position: 'absolute',
                  top: 0, left: 0, right: 0, bottom: 0,
                  backfaceVisibility: 'hidden',
                  transform: [{ rotateY: frontRotate }] 
                }
              ]}
              pointerEvents={flipped ? 'none' : 'auto'}
            >
              <View style={{ position: 'absolute', top: 14, left: 14 }}>
                <PgChip c={Colors.coral} soft={Colors.coralSoft}>
                  {card.srs === 'due' ? 'PARA HOJE' : card.srs === 'learning' ? 'APRENDENDO' : 'NOVO'}
                </PgChip>
              </View>
              <View style={{ position: 'absolute', top: 14, right: 14, flexDirection: 'row', gap: 6 }}>
                <TouchableOpacity onPress={() => Speech.speak(card.term, { language: 'en-US' })} activeOpacity={0.7}>
                  <Icons.Play size={18} color={Colors.inkMute} />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => toggleBookmark(card.id)} activeOpacity={0.7}>
                  <Icons.Bookmark size={18} color={card.bookmarked ? Colors.coral : Colors.inkMute} />
                </TouchableOpacity>
              </View>
              <Text style={styles.cardFrontWord}>{card.term}</Text>
              <Text style={styles.cardType}>{card.type}</Text>
              <Text style={styles.tapHint}>TOQUE PARA REVELAR</Text>
              <TouchableOpacity style={StyleSheet.absoluteFill} onPress={flip} activeOpacity={1} />
            </Animated.View>
          </View>
        )}

        {suggestion && (
          <View style={styles.suggestionBox}>
            <View style={{ flex: 1 }}>
              <Text style={styles.suggestionTitle}>💡 DICA DE GRAMÁTICA</Text>
              <Text style={styles.suggestionText}>{suggestion.title}</Text>
            </View>
            <TouchableOpacity 
              onPress={() => navigation.navigate('GrammarDetail', { topicId: suggestion.id })}
              style={styles.suggestionBtn}
            >
              <Text style={styles.suggestionBtnText}>Ver Lição</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Difficulty or Reveal / Verify */}
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
  cardContainer: {
    alignSelf: 'stretch',
    height: 340,
    transform: [{ perspective: 1000 }],
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
  suggestionBox: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: Colors.amberSoft, borderRadius: Radius.md,
    padding: 12, marginTop: 20, width: '100%',
    borderWidth: 1, borderColor: 'rgba(192, 131, 42, 0.2)',
  },
  suggestionTitle: { fontSize: 9, fontWeight: '700', letterSpacing: 0.5, color: Colors.amber, opacity: 0.8 },
  suggestionText: { fontSize: 14, fontWeight: '700', color: Colors.ink, marginTop: 2 },
  suggestionBtn: { backgroundColor: Colors.amber, paddingHorizontal: 12, paddingVertical: 6, borderRadius: Radius.full },
  suggestionBtnText: { color: Colors.sand, fontSize: 11, fontWeight: '700' },
});