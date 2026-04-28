import React from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Colors, Radius, Spacing } from '../theme';
import { PgCard, PgChip, PgRing, PgRadar, RadarAxis, Icons } from '../components';
import { useVaultStore, useProfileStore } from '../store';

const DAY_LABELS = ['S', 'T', 'Q', 'Q', 'S', 'S', 'D'];

const CEFR_MAP: Record<string, number> = { A1: 8, A2: 22, B1: 42, 'B1+': 52, B2: 65, C1: 82, C2: 100 };
const ZIPF_BASE: Record<string, number> = { A1: 18, A2: 32, B1: 50, 'B1+': 58, B2: 68, C1: 82, C2: 95 };
const LEVEL_BONUS: Record<string, number> = { A1: 20, A2: 32, B1: 48, 'B1+': 56, B2: 66, C1: 78, C2: 90 };

export default function ProfileScreen() {
  const navigation = useNavigation();
  const { name, level, streak, bestStreak, weeklyCards, avgLatencyMs, latencySamples } = useProfileStore();
  const { items } = useVaultStore();

  // Computed stats
  const totalWords = items.length;
  const matureWords = items.filter((v) => v.srs === 'mature').length;
  const cefrPct = CEFR_MAP[level] ?? 42;
  const zipfCoverage = Math.min(100, (ZIPF_BASE[level] ?? 50) + Math.round(totalWords / 40));
  const weeklyMinutes = weeklyCards.map((c) => c * 2);
  const maxMin = Math.max(...weeklyMinutes, 1);
  const totalWeekMin = weeklyMinutes.reduce((a, b) => a + b, 0);

  const lb = LEVEL_BONUS[level] ?? 48;
  const vocabItems = items.filter((v) => ['word', 'phrase', 'idiom', 'gap-filler', 'chunk'].includes(v.type)).length;
  const chunkItems = items.filter((v) => ['phrase', 'collocation', 'idiom', 'gap-filler', 'chunk'].includes(v.type)).length;
  const phonItems = items.filter((v) => v.type === 'phonetic' || v.type === 'reduction').length;
  const collocItems = items.filter((v) => v.type === 'collocation').length;
  const maturePhonItems = items.filter((v) => (v.type === 'phonetic' || v.type === 'reduction') && v.srs === 'mature').length;

  const pillars = [
    { name: 'Vocabulary', pct: Math.min(100, lb + Math.round(vocabItems * 1.5)), c: Colors.moss },
    { name: 'Pronunciation', pct: Math.min(100, Math.round(lb * 0.7) + phonItems * 4), c: Colors.ocean },
    { name: 'Listening', pct: Math.min(100, Math.round(lb * 0.8) + Math.round(totalWeekMin / 10)), c: Colors.gold },
    { name: 'Collocations', pct: Math.min(100, Math.round(lb * 0.6) + collocItems * 5), c: Colors.coral },
  ];

  // ── Fluency DNA — 5 eixos calculados a partir dos dados reais ──
  const chunkDensity = items.length > 0
    ? Math.min(100, Math.round((chunkItems / items.length) * 100) + Math.round(lb * 0.3))
    : Math.round(lb * 0.5);

  const phonScore = Math.min(100, Math.round(lb * 0.7) + phonItems * 4 + maturePhonItems * 3);

  // Response Speed: 0ms = never recorded → use level proxy; ≤1500ms = 100; ≥8000ms = 10
  const speedScore = latencySamples === 0
    ? Math.round(lb * 0.75)
    : Math.max(10, Math.min(100, Math.round(100 - ((avgLatencyMs - 1500) / 65))));

  const vocabScore = Math.min(100, lb + Math.round(vocabItems * 1.5));

  const listeningScore = Math.min(100, Math.round(lb * 0.8) + Math.round(totalWeekMin / 10));

  const dnaAxes: RadarAxis[] = [
    { label: 'Vocab',       value: vocabScore,    color: Colors.moss },
    { label: 'Chunks',      value: chunkDensity,  color: Colors.ocean },
    { label: 'Velocidade',  value: speedScore,    color: Colors.coral },
    { label: 'Pronúncia',   value: phonScore,     color: Colors.gold },
    { label: 'Listening',   value: listeningScore,color: '#7C5CBF' },
  ];

  const displayName = name || 'Você';

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
        {/* Hero */}
        <View style={styles.hero}>
          <View style={styles.heroNav}>
            <Text style={styles.heroEye}>PERFIL</Text>
            <TouchableOpacity onPress={() => navigation.goBack()} activeOpacity={0.7}>
              <Icons.Settings size={20} color={Colors.sand} />
            </TouchableOpacity>
          </View>
          <View style={styles.heroUser}>
            <View style={styles.heroAvatar}>
              <Text style={styles.heroAvatarText}>{displayName[0].toUpperCase()}</Text>
            </View>
            <View>
              <Text style={styles.heroName}>{displayName}</Text>
              <View style={styles.heroMeta}>
                <Icons.Globe size={13} color={Colors.sand} />
                <Text style={styles.heroMetaText}>Inglês · {level}</Text>
                <Text style={styles.heroDot}>·</Text>
                <Icons.Flame size={13} color={Colors.sand} />
                <Text style={styles.heroMetaText}>{streak} dias</Text>
              </View>
            </View>
          </View>

          {/* CEFR bar */}
          <View style={{ marginTop: 22 }}>
            <View style={styles.cefrLabels}>
              {['A1', 'A2', 'B1', 'B2', 'C1', 'C2'].map((l) => (
                <Text key={l} style={styles.cefrLabel}>{l}</Text>
              ))}
            </View>
            <View style={styles.cefrTrack}>
              <View style={[styles.cefrFill, { flex: cefrPct }]} />
              <View style={{ flex: 100 - cefrPct }} />
            </View>
            <Text style={styles.cefrHint}>
              {cefrPct < 50 ? `Avançando rumo ao B1` : cefrPct < 70 ? `Rumo ao B2` : `Nível avançado`} — continue capturando!
            </Text>
          </View>
        </View>

        {/* Stats strip */}
        <View style={styles.statsStrip}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{totalWords}</Text>
            <Text style={styles.statLabel}>PALAVRAS</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{matureWords}</Text>
            <Text style={styles.statLabel}>MADURAS</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{streak}</Text>
            <Text style={styles.statLabel}>SEQUÊNCIA</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{bestStreak}</Text>
            <Text style={styles.statLabel}>RECORDE</Text>
          </View>
        </View>

        {/* Week activity */}
        <View style={{ paddingHorizontal: Spacing.lg, paddingTop: 20 }}>
          <PgCard p={16}>
            <View style={styles.weekHeader}>
              <View>
                <Text style={styles.weekLabel}>ESTA SEMANA</Text>
                <Text style={styles.weekTotal}>{totalWeekMin} min</Text>
              </View>
              <PgChip c={Colors.moss} soft={Colors.mossSoft}>{weeklyCards.reduce((a, b) => a + b, 0)} cards</PgChip>
            </View>
            <View style={styles.barChart}>
              {weeklyMinutes.map((m, i) => {
                const isToday = i === (new Date().getDay() === 0 ? 6 : new Date().getDay() - 1);
                const barH = Math.max(Math.round((m / maxMin) * 60), m > 0 ? 4 : 0);
                return (
                  <View key={i} style={styles.barCol}>
                    <View style={styles.barTrack}>
                      <View style={[
                        styles.bar,
                        { height: barH },
                        { backgroundColor: isToday ? Colors.moss : 'rgba(45,90,61,0.32)' },
                      ]} />
                    </View>
                    <Text style={[styles.barDay, isToday && { color: Colors.moss, fontWeight: '700' }]}>
                      {DAY_LABELS[i]}
                    </Text>
                  </View>
                );
              })}
            </View>
          </PgCard>
        </View>

        {/* Pillars */}
        <View style={{ paddingHorizontal: Spacing.lg, paddingTop: 20 }}>
          <Text style={styles.sectionTitle}>Pilares</Text>
          <View style={styles.pillarsGrid}>
            {pillars.map((pl) => (
              <View key={pl.name} style={styles.pillarCard}>
                <PgRing pct={pl.pct} size={48} stroke={5} c={pl.c}>
                  <Text style={[styles.pillarPct, { color: pl.c }]}>{pl.pct}</Text>
                </PgRing>
                <View style={{ minWidth: 0, flex: 1 }}>
                  <Text style={styles.pillarName}>{pl.name}</Text>
                  <Text style={styles.pillarStatus}>
                    {pl.pct >= 70 ? 'forte' : pl.pct >= 45 ? 'em desenvolvimento' : 'foco'}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Fluency DNA */}
        <View style={{ paddingHorizontal: Spacing.lg, paddingTop: 20 }}>
          <Text style={styles.sectionTitle}>Fluency DNA</Text>
          <PgCard p={20}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
              <View>
                <Text style={styles.dnaTitle}>Perfil de Fluência</Text>
                <Text style={styles.dnaSub}>5 eixos reais — além do CEFR</Text>
              </View>
              {latencySamples > 0 && (
                <View style={styles.dnaBadge}>
                  <Text style={styles.dnaBadgeText}>{latencySamples} reviews</Text>
                </View>
              )}
            </View>
            <PgRadar axes={dnaAxes} size={200} />
            {speedScore < 50 && latencySamples > 5 && (
              <View style={styles.dnaAlert}>
                <Text style={styles.dnaAlertText}>
                  ⚡ Sua velocidade de resposta está lenta ({(avgLatencyMs / 1000).toFixed(1)}s). Foque em chunks que você já conhece para baixar a latência.
                </Text>
              </View>
            )}
          </PgCard>
        </View>

        {/* Zipf */}
        <View style={{ paddingHorizontal: Spacing.lg, paddingTop: 20 }}>
          <PgCard p={16}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
              <PgRing pct={zipfCoverage} size={56} stroke={5} c={Colors.moss}>
                <Text style={{ fontSize: 11, fontWeight: '700', color: Colors.moss }}>{zipfCoverage}%</Text>
              </PgRing>
              <View style={{ flex: 1 }}>
                <Text style={styles.zipfLabel}>COBERTURA ZIPF</Text>
                <Text style={styles.zipfText}>
                  ~{Math.round(zipfCoverage / 100 * 2000).toLocaleString()} das 2.000 palavras mais frequentes
                </Text>
              </View>
            </View>
          </PgCard>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.sand },
  hero: { backgroundColor: Colors.ink, padding: 22, paddingBottom: 32 },
  heroNav: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  heroEye: { fontSize: 11, fontWeight: '700', letterSpacing: 1.2, color: Colors.sand, opacity: 0.6 },
  heroUser: { flexDirection: 'row', alignItems: 'center', gap: 14, marginTop: 16 },
  heroAvatar: {
    width: 64, height: 64, borderRadius: 32, backgroundColor: Colors.moss,
    alignItems: 'center', justifyContent: 'center',
  },
  heroAvatarText: { fontSize: 26, fontWeight: '600', color: Colors.sand, letterSpacing: -0.4 },
  heroName: { fontSize: 24, fontWeight: '600', color: Colors.sand, letterSpacing: -0.3 },
  heroMeta: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4 },
  heroMetaText: { fontSize: 12, color: Colors.sand, opacity: 0.78 },
  heroDot: { color: Colors.sand, opacity: 0.4 },
  cefrLabels: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  cefrLabel: { fontSize: 10.5, fontWeight: '700', color: Colors.sand, opacity: 0.6, letterSpacing: 1 },
  cefrTrack: { height: 6, backgroundColor: 'rgba(244,234,213,0.15)', borderRadius: 3, flexDirection: 'row' },
  cefrFill: { height: 6, backgroundColor: Colors.sand, borderRadius: 3 },
  cefrHint: { fontSize: 11, marginTop: 8, color: Colors.sand, opacity: 0.78, fontStyle: 'italic' },
  statsStrip: {
    flexDirection: 'row', backgroundColor: Colors.paper,
    borderBottomWidth: 0.5, borderBottomColor: Colors.line,
    paddingVertical: 14,
  },
  statItem: { flex: 1, alignItems: 'center' },
  statValue: { fontSize: 22, fontWeight: '600', color: Colors.ink, letterSpacing: -0.4 },
  statLabel: { fontSize: 9.5, fontWeight: '700', letterSpacing: 0.6, color: Colors.inkMute, marginTop: 2, textTransform: 'uppercase' },
  statDivider: { width: 0.5, backgroundColor: Colors.line },
  weekHeader: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 14 },
  weekLabel: { fontSize: 11, fontWeight: '700', letterSpacing: 0.8, color: Colors.inkMute, textTransform: 'uppercase' },
  weekTotal: { fontSize: 26, fontWeight: '600', color: Colors.ink, letterSpacing: -0.4, marginTop: 2 },
  barChart: { flexDirection: 'row', gap: 6, alignItems: 'flex-end', height: 70 },
  barCol: { flex: 1, alignItems: 'center', gap: 4 },
  barTrack: { flex: 1, alignSelf: 'stretch', justifyContent: 'flex-end', height: 60 },
  bar: { alignSelf: 'stretch', borderRadius: 4, minHeight: 0 },
  barDay: { fontSize: 10, color: Colors.inkMute, fontWeight: '500' },
  sectionTitle: { fontSize: 12, fontWeight: '700', letterSpacing: 0.8, textTransform: 'uppercase', color: Colors.inkSoft, marginBottom: 10 },
  pillarsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  pillarCard: {
    width: '48%', flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: Colors.paper, borderWidth: 0.5, borderColor: Colors.line,
    borderRadius: 14, padding: 14,
  },
  pillarPct: { fontSize: 11, fontWeight: '700', fontFamily: 'monospace' },
  pillarName: { fontSize: 13, fontWeight: '700', lineHeight: 16, color: Colors.ink },
  pillarStatus: { fontSize: 11, color: Colors.inkMute, marginTop: 2 },
  zipfLabel: { fontSize: 11, color: Colors.inkMute, fontWeight: '700', letterSpacing: 0.6, textTransform: 'uppercase' },
  zipfText: { fontSize: 13, fontWeight: '600', marginTop: 3, lineHeight: 18, color: Colors.ink },
  dnaTitle: { fontSize: 15, fontWeight: '700', color: Colors.ink, letterSpacing: -0.2 },
  dnaSub: { fontSize: 11, color: Colors.inkMute, marginTop: 2 },
  dnaBadge: {
    backgroundColor: Colors.mossSoft, borderRadius: Radius.full,
    paddingHorizontal: 10, paddingVertical: 4,
  },
  dnaBadgeText: { fontSize: 10, fontWeight: '700', color: Colors.moss },
  dnaAlert: {
    marginTop: 14, backgroundColor: Colors.coralSoft,
    borderRadius: 10, padding: 12,
  },
  dnaAlertText: { fontSize: 12, color: Colors.coral, lineHeight: 18, fontWeight: '500' },
});
