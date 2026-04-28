import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Colors, Radius, Spacing } from '../theme';
import { PgCard, PgChip, Icons, PgZipfCurve } from '../components';
import { ZIPF_WORDS } from '../data/seed';
import { useProfileStore, useVaultStore } from '../store';

const ZIPF_BASE: Record<string, number> = { A1: 18, A2: 32, B1: 50, 'B1+': 58, B2: 68, C1: 82, C2: 95 };

export default function ZipfScreen() {
  const navigation = useNavigation();
  const { level } = useProfileStore();
  const { items } = useVaultStore();
  const zipfCoverage = Math.min(100, (ZIPF_BASE[level] ?? 50) + Math.round(items.length / 40));

  return (
    <SafeAreaView style={styles.safe}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn} activeOpacity={0.7}>
          <Icons.Back size={20} color={Colors.ink} />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={styles.headerSub}>LEI DE ZIPF · INGLÊS</Text>
          <Text style={styles.headerTitle}>Mapa de frequência</Text>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
        {/* Hero stat */}
        <View style={{ paddingHorizontal: Spacing.lg, paddingBottom: 14 }}>
          <View style={styles.heroCard}>
            <Text style={styles.heroEye}>SUA COBERTURA ATUAL</Text>
            <View style={styles.heroPctRow}>
              <Text style={styles.heroPct}>{zipfCoverage}%</Text>
              <Text style={styles.heroPctSub}>das top 2.000</Text>
            </View>
            <Text style={styles.heroDesc}>
              ~{Math.round(zipfCoverage / 100 * 2000).toLocaleString()} vocábulos cobrem grande parte de qualquer texto em inglês. Continue capturando para avançar.
            </Text>

            {/* coverage bar */}
            <View style={styles.coverageBar}>
              <View style={[styles.coverageFill, { flex: zipfCoverage, backgroundColor: Colors.sand }]} />
              <View style={[styles.coverageFill, { flex: 12, backgroundColor: 'rgba(244,234,213,0.5)' }]} />
              <View style={[styles.coverageFill, { flex: 15, backgroundColor: 'rgba(244,234,213,0.2)' }]} />
            </View>
            <View style={styles.coverageLegend}>
              <Text style={styles.coverageLegendText}>DOMINA {Math.round(zipfCoverage / 100 * 2000).toLocaleString()}</Text>
              <Text style={styles.coverageLegendText}>META: 2.000</Text>
            </View>
          </View>
        </View>

        {/* Zipf curve */}
        <View style={{ paddingHorizontal: Spacing.lg }}>
          <Text style={styles.sectionTitle}>A curva de Zipf</Text>
          <PgCard p={14} style={{ marginBottom: 20 }}>
            <PgZipfCurve />
            <View style={styles.curveLabels}>
              <Text style={styles.curveLabel}>1</Text>
              <Text style={styles.curveLabel}>500</Text>
              <Text style={styles.curveLabel}>1,460 ↑</Text>
              <Text style={styles.curveLabel}>5,000</Text>
              <Text style={styles.curveLabel}>20k</Text>
            </View>
          </PgCard>
        </View>

        {/* Words to learn */}
        <View style={{ paddingHorizontal: Spacing.lg }}>
          <Text style={styles.sectionTitle}>Próximas a aprender</Text>
          {ZIPF_WORDS.filter((w) => !w.known || w.focus).map((w) => (
            <View
              key={w.rank}
              style={[styles.wordRow, w.focus && styles.wordRowFocus]}
            >
              <Text style={styles.wordRank}>#{w.rank}</Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.wordText}>{w.word}</Text>
                <Text style={styles.wordMeta}>{w.type} · {w.freq} do corpus</Text>
              </View>
              {w.focus ? (
                <PgChip c={Colors.gold} soft="rgba(212,162,76,0.2)">
                  FOCO
                </PgChip>
              ) : (
                <TouchableOpacity style={styles.addBtn} activeOpacity={0.7}>
                  <Icons.Plus size={16} color={Colors.moss} />
                </TouchableOpacity>
              )}
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.sand },
  header: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    paddingHorizontal: Spacing.lg, paddingTop: 14, paddingBottom: Spacing.md,
  },
  backBtn: {
    width: 38, height: 38, borderRadius: Radius.full,
    backgroundColor: Colors.paper, borderWidth: 0.5, borderColor: Colors.line,
    alignItems: 'center', justifyContent: 'center',
  },
  headerSub: { fontSize: 10, fontWeight: '700', letterSpacing: 1, color: Colors.inkMute, textTransform: 'uppercase', marginBottom: 2 },
  headerTitle: { fontSize: 20, fontWeight: '700', color: Colors.ink, letterSpacing: -0.3 },
  heroCard: {
    backgroundColor: Colors.moss, borderRadius: Radius.lg, padding: 20,
  },
  heroEye: { fontSize: 11, fontWeight: '700', letterSpacing: 1.2, color: Colors.sand, opacity: 0.7 },
  heroPctRow: { flexDirection: 'row', alignItems: 'baseline', gap: 6, marginTop: 6 },
  heroPct: { fontSize: 56, fontWeight: '600', color: Colors.sand, lineHeight: 64, letterSpacing: -2 },
  heroPctSub: { fontSize: 14, color: Colors.sand, opacity: 0.78 },
  heroDesc: { fontSize: 12.5, color: Colors.sand, opacity: 0.78, marginTop: 8, lineHeight: 18 },
  coverageBar: { flexDirection: 'row', height: 16, borderRadius: 4, overflow: 'hidden', marginTop: 14, backgroundColor: 'rgba(244,234,213,0.18)' },
  coverageFill: { height: 16 },
  coverageLegend: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 6 },
  coverageLegendText: { fontSize: 10.5, fontWeight: '600', color: Colors.sand, opacity: 0.7, letterSpacing: 0.4 },
  sectionTitle: { fontSize: 12, fontWeight: '700', letterSpacing: 0.8, textTransform: 'uppercase', color: Colors.inkSoft, marginBottom: 10 },
  curveLabels: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 4 },
  curveLabel: { fontSize: 10.5, color: Colors.inkMute, fontFamily: 'monospace' },
  wordRow: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    padding: 12, marginBottom: 6,
    backgroundColor: Colors.paper, borderWidth: 0.5, borderColor: Colors.line,
    borderRadius: 12,
  },
  wordRowFocus: { backgroundColor: Colors.goldSoft, borderColor: Colors.gold },
  wordRank: { width: 44, fontFamily: 'monospace', fontSize: 11, color: Colors.inkMute, fontWeight: '600', letterSpacing: 0.5, textAlign: 'right' },
  wordText: { fontSize: 19, fontWeight: '600', letterSpacing: -0.3, color: Colors.ink },
  wordMeta: { fontSize: 11, color: Colors.inkMute, marginTop: 1 },
  addBtn: {
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: Colors.mossSoft,
    alignItems: 'center', justifyContent: 'center',
  },
});
