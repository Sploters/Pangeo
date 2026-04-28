import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Colors, Radius, Spacing } from '../theme';
import { Icons } from '../components';
import { SCHWA_WORDS, REDUCTIONS, CONNECTED_SPEECH, ConnectedSpeechPhenomenon } from '../data/seed';

type Tab = 'schwa' | 'reduce' | 'link' | 'assim' | 'elision';

const TABS: { id: Tab; label: string; mono?: string; color: string; soft: string }[] = [
  { id: 'schwa',   label: 'Schwa',      mono: '/ə/', color: Colors.coral,  soft: Colors.coralSoft },
  { id: 'reduce',  label: 'Reductions',             color: Colors.ocean,  soft: Colors.oceanSoft },
  { id: 'link',    label: 'Linking',                color: Colors.purple, soft: Colors.purpleSoft },
  { id: 'assim',   label: 'Assimilação',            color: Colors.amber,  soft: Colors.amberSoft },
  { id: 'elision', label: 'Elision',                color: Colors.moss,   soft: Colors.mossSoft },
];

const PHENOMENON_META: Record<ConnectedSpeechPhenomenon, { title: string; description: string; color: string; soft: string }> = {
  linking: {
    title: 'Linking (Ligação)',
    description: 'Consoante final de uma palavra se liga à vogal inicial da próxima — sem pausa, como se fossem uma palavra só.',
    color: Colors.purple, soft: Colors.purpleSoft,
  },
  intrusion: {
    title: 'Intrusion (Intrusão)',
    description: 'Um som "fantasma" (/r/, /w/ ou /j/) aparece entre duas vogais para facilitar a transição — você não vê na escrita, mas ouve.',
    color: Colors.purple, soft: Colors.purpleSoft,
  },
  assimilation: {
    title: 'Assimilação',
    description: 'Um som muda para se aproximar do som vizinho. O exemplo clássico: /d/ + /j/ → /dʒ/ (como "did you" → "didja").',
    color: Colors.amber, soft: Colors.amberSoft,
  },
  elision: {
    title: 'Elision (Elisão)',
    description: 'Um som simplesmente desaparece na fala rápida, especialmente o /t/ e /d/ antes de consoantes. Nativo nem percebe — é automático.',
    color: Colors.moss, soft: Colors.mossSoft,
  },
};

const SCHWA_LETTER_MAP: Record<string, number[]> = {
  banana: [1, 5],
  about: [0],
  problem: [5],
  family: [3],
  comfortable: [4, 8],
};

export default function PronunciationScreen() {
  const navigation = useNavigation();
  const [tab, setTab] = useState<Tab>('schwa');
  const [activeSchwa, setActiveSchwa] = useState(0);

  const linkItems = CONNECTED_SPEECH.filter(
    (c) => c.phenomenon === 'linking' || c.phenomenon === 'intrusion',
  );
  const assimItems = CONNECTED_SPEECH.filter((c) => c.phenomenon === 'assimilation');
  const elisionItems = CONNECTED_SPEECH.filter((c) => c.phenomenon === 'elision');

  const activeTab = TABS.find((t) => t.id === tab)!;

  return (
    <SafeAreaView style={styles.safe}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn} activeOpacity={0.7}>
          <Icons.Back size={20} color={Colors.ink} />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={styles.headerSub}>PRONÚNCIA · CONNECTED SPEECH</Text>
          <Text style={styles.headerTitle}>Sons do Inglês Real</Text>
        </View>
      </View>

      {/* Tabs — horizontal scroll */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.tabScroll}
      >
        {TABS.map((t) => {
          const active = tab === t.id;
          return (
            <TouchableOpacity
              key={t.id}
              onPress={() => setTab(t.id)}
              style={[
                styles.tab,
                active && { backgroundColor: t.color, borderColor: t.color },
              ]}
              activeOpacity={0.8}
            >
              {t.mono ? (
                <Text style={[styles.tabMono, active && { color: '#fff' }]}>{t.mono}</Text>
              ) : null}
              <Text style={[styles.tabLabel, active && { color: '#fff' }]}>{t.label}</Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 48 }}>

        {/* ── SCHWA ── */}
        {tab === 'schwa' && (
          <>
            <View style={{ paddingHorizontal: Spacing.lg, paddingBottom: 16 }}>
              <View style={styles.heroCard}>
                <Text style={styles.heroSchwa}>ə</Text>
                <View style={{ flex: 1 }}>
                  <Text style={styles.heroLabel}>O SOM MAIS FREQUENTE DO INGLÊS</Text>
                  <Text style={styles.heroText}>
                    Vogal neutra, relaxada — aparece em ~30% das sílabas átonas. Se você não dominar o schwa, nunca vai soar natural.
                  </Text>
                </View>
              </View>
            </View>
            <View style={{ paddingHorizontal: Spacing.lg }}>
              <Text style={styles.sectionTitle}>Encontre o schwa</Text>
              {SCHWA_WORDS.map((w, i) => {
                const isOpen = activeSchwa === i;
                const letters = w.word.split('');
                const schwaIdxs = SCHWA_LETTER_MAP[w.word] || [];
                return (
                  <TouchableOpacity
                    key={i}
                    onPress={() => setActiveSchwa(i)}
                    style={[styles.wordCard, isOpen && styles.wordCardActive]}
                    activeOpacity={0.8}
                  >
                    <View style={styles.wordRow}>
                      <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
                        {letters.map((l, li) => (
                          <Text
                            key={li}
                            style={[styles.wordLetter, schwaIdxs.includes(li) && styles.schwaLetter]}
                          >
                            {l}
                          </Text>
                        ))}
                      </View>
                      <View style={styles.wordRight}>
                        <Text style={styles.ipaText}>{w.ipa}</Text>
                        <TouchableOpacity style={styles.playBtn} activeOpacity={0.7}>
                          <Icons.Play size={14} color={Colors.coral} />
                        </TouchableOpacity>
                      </View>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          </>
        )}

        {/* ── REDUCTIONS ── */}
        {tab === 'reduce' && (
          <>
            <View style={{ paddingHorizontal: Spacing.lg, paddingBottom: 16 }}>
              <View style={[styles.explainerCard, { borderLeftWidth: 3, borderLeftColor: Colors.ocean }]}>
                <Text style={[styles.explainerLabel, { color: Colors.ocean }]}>FORMAS NATURAIS DA FALA</Text>
                <Text style={styles.explainerText}>
                  Falantes nativos não pronunciam tudo como na escrita. Aprender as reductions é ouvir o inglês como ele é — não como está no livro.
                </Text>
              </View>
            </View>
            <View style={{ paddingHorizontal: Spacing.lg, gap: 8 }}>
              {REDUCTIONS.map((r, i) => (
                <View key={i} style={styles.reductionCard}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.reductionFull}>{r.full}</Text>
                    <Text style={[styles.reductionReduced, { color: Colors.ocean }]}>{r.reduced}</Text>
                  </View>
                  <View style={styles.reductionRight}>
                    <Text style={styles.reductionPhon}>{r.phon}</Text>
                    <TouchableOpacity style={[styles.reductionPlayBtn, { backgroundColor: Colors.ocean }]} activeOpacity={0.7}>
                      <Icons.Play size={14} color="#fff" />
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </View>
          </>
        )}

        {/* ── LINKING + INTRUSION ── */}
        {tab === 'link' && (
          <ConnectedSpeechSection
            title="Linking & Intrusion"
            items={linkItems}
            phenomena={['linking', 'intrusion']}
          />
        )}

        {/* ── ASSIMILATION ── */}
        {tab === 'assim' && (
          <ConnectedSpeechSection
            title="Assimilação"
            items={assimItems}
            phenomena={['assimilation']}
          />
        )}

        {/* ── ELISION ── */}
        {tab === 'elision' && (
          <ConnectedSpeechSection
            title="Elision"
            items={elisionItems}
            phenomena={['elision']}
          />
        )}

      </ScrollView>
    </SafeAreaView>
  );
}

// ─── Connected Speech Section ────────────────────────────────────────────────
function ConnectedSpeechSection({
  items,
  phenomena,
}: {
  title: string;
  items: typeof CONNECTED_SPEECH;
  phenomena: ConnectedSpeechPhenomenon[];
}) {
  const mainMeta = PHENOMENON_META[phenomena[0]];

  return (
    <>
      {/* Hero explainer */}
      <View style={{ paddingHorizontal: Spacing.lg, paddingBottom: 16 }}>
        {phenomena.map((ph) => {
          const meta = PHENOMENON_META[ph];
          return (
            <View
              key={ph}
              style={[
                styles.explainerCard,
                { borderLeftWidth: 3, borderLeftColor: meta.color, marginBottom: 10 },
              ]}
            >
              <Text style={[styles.explainerLabel, { color: meta.color }]}>{meta.title.toUpperCase()}</Text>
              <Text style={styles.explainerText}>{meta.description}</Text>
            </View>
          );
        })}
      </View>

      {/* Items */}
      <View style={{ paddingHorizontal: Spacing.lg, gap: 10 }}>
        {items.map((item, i) => {
          const meta = PHENOMENON_META[item.phenomenon];
          return (
            <View key={i} style={[styles.csCard, { borderLeftColor: meta.color }]}>
              {/* Phenomenon badge */}
              <View style={[styles.csBadge, { backgroundColor: meta.soft }]}>
                <Text style={[styles.csBadgeText, { color: meta.color }]}>
                  {item.phenomenon.toUpperCase()}
                </Text>
              </View>

              {/* Full → Connected */}
              <View style={styles.csTransform}>
                <Text style={styles.csFull}>{item.full}</Text>
                <Text style={styles.csArrow}>→</Text>
                <Text style={[styles.csConnected, { color: meta.color }]}>{item.connected}</Text>
              </View>

              {/* IPA */}
              <Text style={styles.csPhon}>{item.phon}</Text>

              {/* Example */}
              <View style={styles.csDivider} />
              <Text style={styles.csExample}>"{item.example}"</Text>

              {/* Tip */}
              <View style={[styles.csTipBox, { backgroundColor: meta.soft }]}>
                <Text style={[styles.csTip, { color: meta.color }]}>💡 {item.tip}</Text>
              </View>

              {/* Play button */}
              <TouchableOpacity
                style={[styles.csPlayBtn, { backgroundColor: meta.color }]}
                activeOpacity={0.8}
              >
                <Icons.Play size={13} color="#fff" />
              </TouchableOpacity>
            </View>
          );
        })}
      </View>
    </>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.sand },
  header: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    paddingHorizontal: Spacing.lg, paddingTop: 14, paddingBottom: Spacing.sm,
  },
  backBtn: {
    width: 38, height: 38, borderRadius: Radius.full,
    backgroundColor: Colors.paper, borderWidth: 0.5, borderColor: Colors.line,
    alignItems: 'center', justifyContent: 'center',
  },
  headerSub: {
    fontSize: 10, fontWeight: '700', letterSpacing: 1,
    color: Colors.inkMute, textTransform: 'uppercase', marginBottom: 2,
  },
  headerTitle: { fontSize: 20, fontWeight: '700', color: Colors.ink, letterSpacing: -0.3 },

  tabScroll: {
    paddingHorizontal: Spacing.lg, paddingBottom: 14, gap: 6, flexDirection: 'row',
  },
  tab: {
    height: 36,
    flexDirection: 'row', alignItems: 'center', gap: 5,
    paddingHorizontal: 14, paddingVertical: 9, borderRadius: 12,
    borderWidth: 0.5, borderColor: Colors.line, backgroundColor: Colors.paper,
  },
  tabMono: { fontSize: 16, fontWeight: '700', fontFamily: 'monospace', color: Colors.ink },
  tabLabel: { fontSize: 13, fontWeight: '600', color: Colors.ink },

  sectionTitle: {
    fontSize: 12, fontWeight: '700', letterSpacing: 0.8,
    textTransform: 'uppercase', color: Colors.inkSoft, marginBottom: 10,
  },

  // Schwa
  heroCard: {
    flexDirection: 'row', alignItems: 'center', gap: 16,
    backgroundColor: Colors.paper, borderRadius: Radius.lg,
    borderWidth: 0.5, borderColor: Colors.line, padding: 20,
  },
  heroSchwa: { fontSize: 80, color: Colors.coral, lineHeight: 90, letterSpacing: -3 },
  heroLabel: {
    fontSize: 11, fontWeight: '700', letterSpacing: 1,
    color: Colors.inkMute, textTransform: 'uppercase',
  },
  heroText: { fontSize: 15, color: Colors.ink, marginTop: 4, lineHeight: 21 },
  wordCard: {
    backgroundColor: 'transparent', borderWidth: 0.5, borderColor: Colors.line,
    borderRadius: 14, padding: 12, marginBottom: 8,
  },
  wordCardActive: { backgroundColor: Colors.paper, borderColor: Colors.coral },
  wordRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  wordLetter: { fontSize: 22, fontWeight: '500', color: Colors.ink },
  schwaLetter: {
    color: Colors.coral, fontWeight: '700',
    textDecorationLine: 'underline', textDecorationColor: Colors.coral,
  },
  wordRight: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  ipaText: { fontSize: 13, color: Colors.inkMute, fontFamily: 'monospace' },
  playBtn: {
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: Colors.coralSoft, alignItems: 'center', justifyContent: 'center',
  },

  // Reductions
  explainerCard: {
    backgroundColor: Colors.paper, borderRadius: Radius.lg,
    borderWidth: 0.5, borderColor: Colors.line, padding: 18,
  },
  explainerLabel: {
    fontSize: 11, fontWeight: '700', letterSpacing: 1,
    textTransform: 'uppercase', marginBottom: 6,
  },
  explainerText: { fontSize: 15, color: Colors.ink, lineHeight: 22 },
  reductionCard: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: Colors.paper, borderWidth: 0.5, borderColor: Colors.line,
    borderRadius: 14, padding: 14,
  },
  reductionFull: { fontSize: 13, color: Colors.inkMute, marginBottom: 4 },
  reductionReduced: { fontSize: 24, fontWeight: '600', letterSpacing: -0.3 },
  reductionRight: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  reductionPhon: { fontSize: 12, color: Colors.inkMute, fontFamily: 'monospace' },
  reductionPlayBtn: {
    width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center',
  },

  // Connected Speech
  csCard: {
    backgroundColor: Colors.paper, borderWidth: 0.5, borderColor: Colors.line,
    borderRadius: Radius.md, padding: 16, borderLeftWidth: 3,
    position: 'relative',
  },
  csBadge: {
    alignSelf: 'flex-start', borderRadius: Radius.full,
    paddingHorizontal: 8, paddingVertical: 3, marginBottom: 10,
  },
  csBadgeText: { fontSize: 9, fontWeight: '700', letterSpacing: 1 },
  csTransform: { flexDirection: 'row', alignItems: 'baseline', gap: 10, marginBottom: 4 },
  csFull: { fontSize: 17, fontWeight: '500', color: Colors.inkSoft },
  csArrow: { fontSize: 14, color: Colors.inkMute },
  csConnected: { fontSize: 22, fontWeight: '700', letterSpacing: -0.3 },
  csPhon: { fontSize: 12, color: Colors.inkMute, fontFamily: 'monospace', marginBottom: 10 },
  csDivider: { height: 0.5, backgroundColor: Colors.line, marginBottom: 10 },
  csExample: {
    fontSize: 14, color: Colors.inkSoft, fontStyle: 'italic',
    lineHeight: 20, marginBottom: 10,
  },
  csTipBox: { borderRadius: 10, padding: 10, marginBottom: 4 },
  csTip: { fontSize: 12.5, lineHeight: 18, fontWeight: '500' },
  csPlayBtn: {
    position: 'absolute', top: 14, right: 14,
    width: 30, height: 30, borderRadius: 15,
    alignItems: 'center', justifyContent: 'center',
  },
});
