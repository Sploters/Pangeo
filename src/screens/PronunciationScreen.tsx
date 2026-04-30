import React, { useRef, useState, useMemo } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet, PanResponder, Animated, Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import * as Speech from 'expo-speech';
import { Colors, Radius, Spacing } from '../theme';
import { Icons } from '../components';
import {
  SCHWA_WORDS, REDUCTIONS, CONNECTED_SPEECH, ConnectedSpeechPhenomenon,
} from '../data/seed';
import { useProfileStore, useVaultStore } from '../store';

type Tab = 'schwa' | 'reduce' | 'link' | 'assim' | 'elision';
type Tier = 'basic' | 'intermediate' | 'advanced';

const TABS: { id: Tab; label: string; mono?: string; color: string; soft: string }[] = [
  { id: 'schwa',   label: 'Schwa',      mono: '/ə/', color: Colors.coral,  soft: Colors.coralSoft },
  { id: 'reduce',  label: 'Reductions',             color: Colors.ocean,  soft: Colors.oceanSoft },
  { id: 'link',    label: 'Linking',                color: Colors.purple, soft: Colors.purpleSoft },
  { id: 'assim',   label: 'Assimilação',            color: Colors.amber,  soft: Colors.amberSoft },
  { id: 'elision', label: 'Elision',                color: Colors.moss,   soft: Colors.mossSoft },
];

const TIERS: { id: Tier; label: string }[] = [
  { id: 'basic', label: 'Básico' },
  { id: 'intermediate', label: 'Intermediário' },
  { id: 'advanced', label: 'Avançado' },
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
  for: [0],
  of: [0],
  to: [0],
  a: [0],
  the: [0],
  some: [0],
  than: [0],
  information: [1, 3],
  pronunciation: [0, 4],
  dictionary: [1],
  extraordinary: [0],
  responsibility: [1, 3],
  vegetable: [1, 2],
};

const SW = Dimensions.get('window').width;

export default function PronunciationScreen() {
  const navigation   = useNavigation<any>();
  const { markConnectedSpeechVisited } = useProfileStore();
  const vaultItems   = useVaultStore((s) => s.items);
  const [tabIndex, setTabIndex] = useState(0);
  const [tier, setTier] = useState<Tier>('basic');
  React.useEffect(() => { markConnectedSpeechVisited(); }, []);
  const [activeSchwa, setActiveSchwa] = useState(0);
  const tabBarRef    = useRef<ScrollView>(null);
  const tabIndexRef  = useRef(0);
  const pagerX       = useRef(new Animated.Value(0)).current;
  const snapRef      = useRef<(i: number) => void>(() => {});

  // Tier-filtered data
  const schwaByTier = useMemo(() =>
    SCHWA_WORDS.filter((w) => w.tier === tier),
  [tier]);

  const reductionsByTier = useMemo(() =>
    REDUCTIONS.filter((r) => r.tier === tier),
  [tier]);

  const connectedByTier = useMemo(() =>
    CONNECTED_SPEECH.filter((c) => c.tier === tier),
  [tier]);

  // Vault bridge — items with type 'reduction' or 'phonetic' not already in seed
  const vaultReductions = useMemo(() =>
    vaultItems.filter((v) => v.type === 'reduction').map((v) => ({
      full: v.term,
      reduced: v.term,
      phon: '',
      tier: 'intermediate' as Tier,
    })),
  [vaultItems]);

  const vaultPhonetics = useMemo(() =>
    vaultItems.filter((v) => v.type === 'phonetic').map((v) => ({
      word: v.term,
      ipa: '',
      schwas: [] as number[],
      tier: 'intermediate' as Tier,
    })),
  [vaultItems]);

  // Counts per tier for current tab
  const currentTabId = TABS[tabIndex].id;

  const tierCounts: Record<Tier, number> = useMemo(() => {
    switch (currentTabId) {
      case 'schwa':
        return {
          basic: SCHWA_WORDS.filter((w) => w.tier === 'basic').length,
          intermediate: SCHWA_WORDS.filter((w) => w.tier === 'intermediate').length,
          advanced: SCHWA_WORDS.filter((w) => w.tier === 'advanced').length,
        };
      case 'reduce':
        return {
          basic: REDUCTIONS.filter((r) => r.tier === 'basic').length,
          intermediate: REDUCTIONS.filter((r) => r.tier === 'intermediate').length,
          advanced: REDUCTIONS.filter((r) => r.tier === 'advanced').length,
        };
      default: {
        const isLinkOrAssim = currentTabId === 'link' || currentTabId === 'assim';
        const phenomena = currentTabId === 'link' ? ['linking', 'intrusion']
          : currentTabId === 'assim' ? ['assimilation']
          : ['elision'];
        return {
          basic: CONNECTED_SPEECH.filter((c) => phenomena.includes(c.phenomenon) && c.tier === 'basic').length,
          intermediate: CONNECTED_SPEECH.filter((c) => phenomena.includes(c.phenomenon) && c.tier === 'intermediate').length,
          advanced: CONNECTED_SPEECH.filter((c) => phenomena.includes(c.phenomenon) && c.tier === 'advanced').length,
        };
      }
    }
  }, [currentTabId]);

  const linkItems    = connectedByTier.filter((c) => c.phenomenon === 'linking' || c.phenomenon === 'intrusion');
  const assimItems   = connectedByTier.filter((c) => c.phenomenon === 'assimilation');
  const elisionItems = connectedByTier.filter((c) => c.phenomenon === 'elision');

  const snapToTab = (index: number) => {
    tabIndexRef.current = index;
    setTabIndex(index);
    tabBarRef.current?.scrollTo({ x: Math.max(0, index * 90 - 50), animated: true });
    Animated.spring(pagerX, {
      toValue: -(index * SW),
      useNativeDriver: false,
      tension: 120,
      friction: 20,
    }).start();
  };
  snapRef.current = snapToTab;

  const swipePan = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gs) =>
        Math.abs(gs.dx) > 8 && Math.abs(gs.dx) > Math.abs(gs.dy) * 1.2,
      onPanResponderGrant: () => { pagerX.stopAnimation(); },
      onPanResponderMove: (_, gs) => {
        const base = -(tabIndexRef.current * SW);
        let nx = base + gs.dx;
        if (nx > 0) nx *= 0.15;
        const minX = -((TABS.length - 1) * SW);
        if (nx < minX) nx = minX + (nx - minX) * 0.15;
        pagerX.setValue(nx);
      },
      onPanResponderRelease: (_, gs) => {
        const threshold = SW * 0.25;
        let next = tabIndexRef.current;
        if (gs.dx < -threshold && next < TABS.length - 1) next++;
        else if (gs.dx > threshold && next > 0) next--;
        snapRef.current(next);
      },
      onPanResponderTerminate: () => { snapRef.current(tabIndexRef.current); },
    })
  ).current;

  const currentTab = TABS[tabIndex].id;

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

      {/* Tab pills */}
      <ScrollView
        ref={tabBarRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.tabScroll}
        style={{ flexGrow: 0 }}
      >
        {TABS.map((t, i) => {
          const active = tabIndex === i;
          return (
            <TouchableOpacity
              key={t.id}
              onPress={() => snapRef.current(i)}
              style={[styles.tab, active && { backgroundColor: t.color, borderColor: t.color }]}
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

      {/* Tier selector */}
      <View style={styles.tierRow}>
        {TIERS.map((t) => {
          const active = tier === t.id;
          const tabColor = TABS[tabIndex]?.color ?? Colors.ink;
          const count = tierCounts[t.id];
          return (
            <TouchableOpacity
              key={t.id}
              onPress={() => setTier(t.id)}
              style={[styles.tierChip, active && { backgroundColor: tabColor, borderColor: tabColor }]}
              activeOpacity={0.8}
            >
              <Text style={[styles.tierText, active && { color: Colors.sand }]}>{t.label}</Text>
              {count > 0 && (
                <View style={[styles.tierCountBadge, { backgroundColor: active ? 'rgba(255,255,255,0.25)' : Colors.line }]}>
                  <Text style={[styles.tierCountText, { color: active ? Colors.sand : Colors.inkMute }]}>{count}</Text>
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Pager */}
      <View style={{ flex: 1, overflow: 'hidden' }} {...swipePan.panHandlers}>
        <Animated.View style={{ flexDirection: 'row', width: SW * TABS.length, flex: 1, transform: [{ translateX: pagerX }] }}>

          {/* ── Schwa ── */}
          <ScrollView style={{ width: SW }} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 48 }}>
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
              {schwaByTier.map((w, i) => {
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
                          <Text key={li} style={[styles.wordLetter, schwaIdxs.includes(li) && styles.schwaLetter]}>
                            {l}
                          </Text>
                        ))}
                      </View>
                      <View style={styles.wordRight}>
                        <Text style={styles.ipaText}>{w.ipa}</Text>
                        <TouchableOpacity style={styles.playBtn} onPress={() => Speech.speak(w.word, { language: 'en-US' })} activeOpacity={0.7}>
                          <Icons.Play size={14} color={Colors.coral} />
                        </TouchableOpacity>
                      </View>
                    </View>
                  </TouchableOpacity>
                );
              })}
              {schwaByTier.length === 0 && (
                <Text style={{ fontSize: 13, color: Colors.inkMute, textAlign: 'center', marginTop: 20 }}>
                  Nenhum exemplo neste nível.
                </Text>
              )}

              {/* Vault bridge — phonetic items */}
              {vaultPhonetics.length > 0 && (
                <View style={{ marginTop: 20 }}>
                  <Text style={styles.vaultBridgeTitle}>DO SEU VAULT</Text>
                  {vaultPhonetics.map((vp, i) => (
                    <View key={i} style={[styles.wordCard, { borderLeftWidth: 3, borderLeftColor: Colors.moss }]}>
                      <View style={styles.wordRow}>
                        <Text style={[styles.wordLetter, { fontSize: 18 }]}>{vp.word}</Text>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                          <View style={styles.vaultDot} />
                          <Text style={{ fontSize: 11, color: Colors.moss, fontWeight: '600' }}>Vault</Text>
                        </View>
                      </View>
                    </View>
                  ))}
                </View>
              )}
            </View>
          </ScrollView>

          {/* ── Reductions ── */}
          <ScrollView style={{ width: SW }} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 48 }}>
            <View style={{ paddingHorizontal: Spacing.lg, paddingBottom: 16 }}>
              <View style={[styles.explainerCard, { borderLeftWidth: 3, borderLeftColor: Colors.ocean }]}>
                <Text style={[styles.explainerLabel, { color: Colors.ocean }]}>FORMAS NATURAIS DA FALA</Text>
                <Text style={styles.explainerText}>
                  Falantes nativos não pronunciam tudo como na escrita. Aprender as reductions é ouvir o inglês como ele é — não como está no livro.
                </Text>
              </View>
            </View>
            <View style={{ paddingHorizontal: Spacing.lg, gap: 8 }}>
              {reductionsByTier.map((r, i) => (
                <View key={i} style={styles.reductionCard}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.reductionFull}>{r.full}</Text>
                    <Text style={[styles.reductionReduced, { color: Colors.ocean }]}>{r.reduced}</Text>
                  </View>
                  <View style={styles.reductionRight}>
                    <Text style={styles.reductionPhon}>{r.phon}</Text>
                    <TouchableOpacity style={[styles.reductionPlayBtn, { backgroundColor: Colors.ocean }]} onPress={() => Speech.speak(r.full, { language: 'en-US' })} activeOpacity={0.7}>
                      <Icons.Play size={14} color="#fff" />
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
              {reductionsByTier.length === 0 && (
                <Text style={{ fontSize: 13, color: Colors.inkMute, textAlign: 'center', marginTop: 20 }}>
                  Nenhuma redução neste nível.
                </Text>
              )}

              {/* Vault bridge — reduction items */}
              {vaultReductions.length > 0 && (
                <View style={{ marginTop: 20 }}>
                  <Text style={styles.vaultBridgeTitle}>DO SEU VAULT</Text>
                  {vaultReductions.map((vr, i) => (
                    <TouchableOpacity
                      key={i}
                      style={[styles.reductionCard, { borderLeftWidth: 3, borderLeftColor: Colors.moss }]}
                      onPress={() => Speech.speak(vr.full, { language: 'en-US' })}
                      activeOpacity={0.8}
                    >
                      <View style={{ flex: 1 }}>
                        <Text style={[styles.reductionReduced, { color: Colors.ocean }]}>{vr.full}</Text>
                      </View>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                        <View style={styles.vaultDot} />
                        <Text style={{ fontSize: 11, color: Colors.moss, fontWeight: '600' }}>Vault</Text>
                      </View>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>
          </ScrollView>

          {/* ── Linking + Intrusion ── */}
          <ScrollView style={{ width: SW }} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 48 }}>
            <ConnectedSpeechSection items={linkItems} phenomena={['linking', 'intrusion']} currentTab={currentTab} />
          </ScrollView>

          {/* ── Assimilation ── */}
          <ScrollView style={{ width: SW }} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 48 }}>
            <ConnectedSpeechSection items={assimItems} phenomena={['assimilation']} currentTab={currentTab} />
          </ScrollView>

          {/* ── Elision ── */}
          <ScrollView style={{ width: SW }} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 48 }}>
            <ConnectedSpeechSection items={elisionItems} phenomena={['elision']} currentTab={currentTab} />

            {/* Shadowing entry card */}
            <View style={{ paddingHorizontal: Spacing.lg, marginTop: 24 }}>
              <TouchableOpacity
                onPress={() => navigation.navigate('Shadowing')}
                style={styles.shadowingCard}
                activeOpacity={0.85}
              >
                <View style={[styles.shadowingIcon, { backgroundColor: Colors.purpleSoft }]}>
                  <Icons.Wave size={24} color={Colors.purple} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.shadowingTitle}>Shadowing</Text>
                  <Text style={styles.shadowingSub}>
                    Pratique a pronúncia repetindo áudios em tempo real. Melhore sua fluência e redução de sotaque.
                  </Text>
                </View>
                <Icons.Next size={18} color={Colors.purple} />
              </TouchableOpacity>
            </View>
          </ScrollView>

        </Animated.View>
      </View>
    </SafeAreaView>
  );
}

// ─── Connected Speech Section ────────────────────────────────────────────────
function ConnectedSpeechSection({
  items,
  phenomena,
  currentTab,
}: {
  items: typeof CONNECTED_SPEECH;
  phenomena: ConnectedSpeechPhenomenon[];
  currentTab: string;
}) {
  return (
    <>
      <View style={{ paddingHorizontal: Spacing.lg, paddingBottom: 16 }}>
        {phenomena.map((ph) => {
          const meta = PHENOMENON_META[ph];
          return (
            <View
              key={ph}
              style={[styles.explainerCard, { borderLeftWidth: 3, borderLeftColor: meta.color, marginBottom: 10 }]}
            >
              <Text style={[styles.explainerLabel, { color: meta.color }]}>{meta.title.toUpperCase()}</Text>
              <Text style={styles.explainerText}>{meta.description}</Text>
            </View>
          );
        })}
      </View>
      <View style={{ paddingHorizontal: Spacing.lg, gap: 10 }}>
        {items.map((item, i) => {
          const meta = PHENOMENON_META[item.phenomenon];
          return (
            <View key={i} style={[styles.csCard, { borderLeftColor: meta.color }]}>
              <View style={[styles.csBadge, { backgroundColor: meta.soft }]}>
                <Text style={[styles.csBadgeText, { color: meta.color }]}>
                  {item.phenomenon.toUpperCase()}
                </Text>
              </View>
              <View style={styles.csTransform}>
                <Text style={styles.csFull}>{item.full}</Text>
                <Text style={styles.csArrow}>→</Text>
                <Text style={[styles.csConnected, { color: meta.color }]}>{item.connected}</Text>
              </View>
              <Text style={styles.csPhon}>{item.phon}</Text>
              <View style={styles.csDivider} />
              <Text style={styles.csExample}>"{item.example}"</Text>
              <View style={[styles.csTipBox, { backgroundColor: meta.soft }]}>
                <Text style={[styles.csTip, { color: meta.color }]}>💡 {item.tip}</Text>
              </View>
              <TouchableOpacity style={[styles.csPlayBtn, { backgroundColor: meta.color }]} onPress={() => Speech.speak(item.example, { language: 'en-US' })} activeOpacity={0.8}>
                <Icons.Play size={13} color="#fff" />
              </TouchableOpacity>
            </View>
          );
        })}
        {items.length === 0 && (
          <Text style={{ fontSize: 13, color: Colors.inkMute, textAlign: 'center', marginTop: 20 }}>
            Nenhum exemplo neste nível.
          </Text>
        )}
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

  tabScroll: { paddingHorizontal: Spacing.lg, paddingBottom: 8, gap: 6, flexDirection: 'row' },
  tab: {
    height: 36, flexDirection: 'row', alignItems: 'center', gap: 5,
    paddingHorizontal: 14, borderRadius: 12,
    borderWidth: 0.5, borderColor: Colors.line, backgroundColor: Colors.paper,
  },
  tabMono:  { fontSize: 16, fontWeight: '700', fontFamily: 'monospace', color: Colors.ink },
  tabLabel: { fontSize: 13, fontWeight: '600', color: Colors.ink },

  tierRow: {
    flexDirection: 'row', gap: 6,
    paddingHorizontal: Spacing.lg, paddingBottom: 12,
  },
  tierChip: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: 14, paddingVertical: 6,
    borderRadius: Radius.full, borderWidth: 1,
    borderColor: Colors.lineStrong, backgroundColor: Colors.paper,
  },
  tierText: { fontSize: 12, fontWeight: '600', color: Colors.inkSoft },
  tierCountBadge: {
    paddingHorizontal: 6, paddingVertical: 1,
    borderRadius: 8,
  },
  tierCountText: { fontSize: 10, fontWeight: '700' },

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
  heroSchwa:  { fontSize: 80, color: Colors.coral, lineHeight: 90, letterSpacing: -3 },
  heroLabel:  { fontSize: 11, fontWeight: '700', letterSpacing: 1, color: Colors.inkMute, textTransform: 'uppercase' },
  heroText:   { fontSize: 15, color: Colors.ink, marginTop: 4, lineHeight: 21 },
  wordCard: {
    backgroundColor: 'transparent', borderWidth: 0.5, borderColor: Colors.line,
    borderRadius: 14, padding: 12, marginBottom: 8,
  },
  wordCardActive: { backgroundColor: Colors.paper, borderColor: Colors.coral },
  wordRow:    { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  wordLetter: { fontSize: 22, fontWeight: '500', color: Colors.ink },
  schwaLetter: {
    color: Colors.coral, fontWeight: '700',
    textDecorationLine: 'underline', textDecorationColor: Colors.coral,
  },
  wordRight:  { flexDirection: 'row', alignItems: 'center', gap: 10 },
  ipaText:    { fontSize: 13, color: Colors.inkMute, fontFamily: 'monospace' },
  playBtn: {
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: Colors.coralSoft, alignItems: 'center', justifyContent: 'center',
  },

  // Vault bridge
  vaultBridgeTitle: {
    fontSize: 10, fontWeight: '700', letterSpacing: 1,
    color: Colors.moss, marginBottom: 8, textTransform: 'uppercase',
  },
  vaultDot: {
    width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.moss,
  },

  // Reductions
  explainerCard: {
    backgroundColor: Colors.paper, borderRadius: Radius.lg,
    borderWidth: 0.5, borderColor: Colors.line, padding: 18,
  },
  explainerLabel: { fontSize: 11, fontWeight: '700', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 6 },
  explainerText:  { fontSize: 15, color: Colors.ink, lineHeight: 22 },
  reductionCard: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: Colors.paper, borderWidth: 0.5, borderColor: Colors.line,
    borderRadius: 14, padding: 14,
  },
  reductionFull:     { fontSize: 13, color: Colors.inkMute, marginBottom: 4 },
  reductionReduced:  { fontSize: 24, fontWeight: '600', letterSpacing: -0.3 },
  reductionRight:    { flexDirection: 'row', alignItems: 'center', gap: 10 },
  reductionPhon:     { fontSize: 12, color: Colors.inkMute, fontFamily: 'monospace' },
  reductionPlayBtn:  { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },

  // Connected Speech
  csCard: {
    backgroundColor: Colors.paper, borderWidth: 0.5, borderColor: Colors.line,
    borderRadius: Radius.md, padding: 16, borderLeftWidth: 3, position: 'relative',
  },
  csBadge: {
    alignSelf: 'flex-start', borderRadius: Radius.full,
    paddingHorizontal: 8, paddingVertical: 3, marginBottom: 10,
  },
  csBadgeText:  { fontSize: 9, fontWeight: '700', letterSpacing: 1 },
  csTransform:  { flexDirection: 'row', alignItems: 'baseline', gap: 10, marginBottom: 4 },
  csFull:       { fontSize: 17, fontWeight: '500', color: Colors.inkSoft },
  csArrow:      { fontSize: 14, color: Colors.inkMute },
  csConnected:  { fontSize: 22, fontWeight: '700', letterSpacing: -0.3 },
  csPhon:       { fontSize: 12, color: Colors.inkMute, fontFamily: 'monospace', marginBottom: 10 },
  csDivider:    { height: 0.5, backgroundColor: Colors.line, marginBottom: 10 },
  csExample:    { fontSize: 14, color: Colors.inkSoft, fontStyle: 'italic', lineHeight: 20, marginBottom: 10 },
  csTipBox:     { borderRadius: 10, padding: 10, marginBottom: 4 },
  csTip:        { fontSize: 12.5, lineHeight: 18, fontWeight: '500' },
  csPlayBtn: {
    position: 'absolute', top: 14, right: 14,
    width: 30, height: 30, borderRadius: 15,
    alignItems: 'center', justifyContent: 'center',
  },

  // Shadowing
  shadowingCard: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    backgroundColor: Colors.paper, borderRadius: Radius.md,
    borderWidth: 1, borderColor: Colors.purple,
    padding: 16,
  },
  shadowingIcon: {
    width: 48, height: 48, borderRadius: 14,
    alignItems: 'center', justifyContent: 'center',
  },
  shadowingTitle: { fontSize: 15, fontWeight: '700', color: Colors.ink },
  shadowingSub: { fontSize: 12, color: Colors.inkMute, marginTop: 4, lineHeight: 17 },
});
