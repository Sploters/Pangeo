import React from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Colors, Radius, Spacing } from '../theme';
import { PgChip, Icons } from '../components';
import { CONTENT, ContentItem, NEWS_ARTICLES } from '../data/seed';
import { RootStackParamList } from '../navigation';
import { useVaultStore } from '../store';

type Nav = NativeStackNavigationProp<RootStackParamList>;

function kindIcon(kind: ContentItem['kind'], color: string) {
  switch (kind) {
    case 'podcast': return <Icons.Headphones size={32} color={color} />;
    case 'book':    return <Icons.Book size={32} color={color} />;
    case 'video':   return <Icons.Video size={32} color={color} />;
    case 'article': return <Icons.Article size={32} color={color} />;
  }
}

type VocabProgress = { captured: number; total: number } | null;

export default function ContentScreen() {
  const navigation = useNavigation<Nav>();
  const { items } = useVaultStore();

  function vocabProgress(content: ContentItem): VocabProgress {
    const vocab = content.vocabulary ?? [];
    if (vocab.length === 0) return null;
    const captured = vocab.filter((s) =>
      items.some((v) => v.term.toLowerCase() === s.term.toLowerCase())
    ).length;
    return { captured, total: vocab.length };
  }

  // News progress: how many articles have all vocab captured
  const newsDone = NEWS_ARTICLES.filter((a) =>
    a.vocabulary.length > 0 &&
    a.vocabulary.every((s) => items.some((v) => v.term.toLowerCase() === s.term.toLowerCase()))
  ).length;
  const newsAllDone = newsDone === NEWS_ARTICLES.length;

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 32 }}>
        {/* Header */}
        <View style={styles.header}>
          <View style={{ flex: 1 }}>
            <Text style={styles.headerSub}>PARA VOCÊ · B2</Text>
            <Text style={styles.headerTitle}>Descobrir</Text>
          </View>
          <TouchableOpacity style={styles.filterBtn} activeOpacity={0.7}>
            <Icons.Filter size={18} color={Colors.ink} />
          </TouchableOpacity>
        </View>

        {/* News in Levels card */}
        <TouchableOpacity
          onPress={() => navigation.navigate('NewsList')}
          style={styles.newsCard}
          activeOpacity={0.85}
        >
          <View style={{ flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' }}>
            <View style={{ flex: 1 }}>
              <Text style={styles.newsEye}>NOTÍCIAS EM INGLÊS</Text>
              <Text style={styles.newsTitle}>News in Levels</Text>
              <Text style={styles.newsSub}>
                Notícias reais em 3 níveis de dificuldade com vocabulário curado para capturar.
              </Text>
            </View>
            {newsAllDone && (
              <View style={styles.allDoneBadge}>
                <Text style={styles.allDoneText}>✓</Text>
              </View>
            )}
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <View style={styles.newsPill}>
              <Text style={styles.newsPillText}>{NEWS_ARTICLES.length} artigos</Text>
            </View>
            {newsDone > 0 && (
              <View style={[styles.newsPill, { backgroundColor: Colors.mossDeep + 'AA' }]}>
                <Text style={styles.newsPillText}>
                  {newsAllDone ? '✓ Todos capturados' : `${newsDone}/${NEWS_ARTICLES.length} capturados`}
                </Text>
              </View>
            )}
            <Text style={styles.newsLink}>Ver notícias →</Text>
          </View>
        </TouchableOpacity>

        {/* Featured */}
        <View style={{ paddingHorizontal: Spacing.lg }}>
          {(() => {
            const prog = vocabProgress(CONTENT[0]);
            const allCaptured = prog ? prog.captured === prog.total : false;
            return (
              <TouchableOpacity
                style={styles.featured}
                onPress={() => navigation.navigate('ContentDetail', { contentId: CONTENT[0].id })}
                activeOpacity={0.85}
              >
                <View style={[styles.featuredArt, { backgroundColor: CONTENT[0].art }]}>
                  {kindIcon(CONTENT[0].kind, '#FBF6EB')}
                  {allCaptured && (
                    <View style={styles.capturedOverlay}>
                      <Text style={styles.capturedOverlayText}>✓ Capturado</Text>
                    </View>
                  )}
                </View>
                <View style={styles.featuredBody}>
                  <View style={styles.featuredMeta}>
                    <Text style={styles.featuredKind}>{CONTENT[0].kind.toUpperCase()}</Text>
                    <PgChip c={Colors.moss} soft={Colors.mossSoft}>{CONTENT[0].match}% match</PgChip>
                  </View>
                  <Text style={styles.featuredTitle}>{CONTENT[0].title}</Text>
                  <Text style={styles.featuredAuthor}>{CONTENT[0].author}</Text>
                  <Text style={styles.featuredWhy}>{CONTENT[0].why}</Text>
                  {prog && (
                    <VocabProgressBar captured={prog.captured} total={prog.total} />
                  )}
                </View>
              </TouchableOpacity>
            );
          })()}
        </View>

        {/* Section: Recomendados */}
        <View style={{ paddingHorizontal: Spacing.lg, marginTop: 22 }}>
          <Text style={styles.sectionTitle}>Recomendados para você</Text>
        </View>
        <View style={{ paddingHorizontal: Spacing.lg, marginTop: 10, gap: 10 }}>
          {CONTENT.slice(1).map((c) => {
            const prog = vocabProgress(c);
            const allCaptured = prog ? prog.captured === prog.total : false;
            return (
              <TouchableOpacity
                key={c.id}
                style={styles.card}
                onPress={() => navigation.navigate('ContentDetail', { contentId: c.id })}
                activeOpacity={0.8}
              >
                <View style={[styles.cardArt, { backgroundColor: c.art }]}>
                  {kindIcon(c.kind, '#FBF6EB')}
                </View>
                <View style={{ flex: 1, gap: 3 }}>
                  <View style={styles.cardMeta}>
                    <Text style={styles.cardKind}>{c.kind} · {typeof c.minutes === 'number' ? `${c.minutes}m` : c.minutes}</Text>
                    <Text style={styles.cardLevel}>{c.level}</Text>
                    {allCaptured && (
                      <View style={styles.capturedChip}>
                        <Text style={styles.capturedChipText}>✓</Text>
                      </View>
                    )}
                  </View>
                  <Text style={styles.cardTitle} numberOfLines={2}>{c.title}</Text>
                  <Text style={styles.cardAuthor}>{c.author}</Text>
                  {prog && !allCaptured ? (
                    <Text style={styles.cardVocabHint}>{prog.captured}/{prog.total} palavras capturadas</Text>
                  ) : (
                    <Text style={styles.cardWhy} numberOfLines={1}>{c.why}</Text>
                  )}
                </View>
                <View style={styles.matchBadge}>
                  <Text style={styles.matchText}>{c.match}%</Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function VocabProgressBar({ captured, total }: { captured: number; total: number }) {
  const pct = total > 0 ? captured / total : 0;
  const allDone = captured === total;
  return (
    <View style={pb.wrap}>
      <View style={pb.track}>
        <View style={[pb.fill, { width: `${pct * 100}%` as any, backgroundColor: allDone ? Colors.moss : Colors.gold }]} />
      </View>
      <Text style={[pb.label, allDone && { color: Colors.moss }]}>
        {allDone ? '✓ Vocabulário capturado' : `${captured}/${total} palavras`}
      </Text>
    </View>
  );
}

const pb = StyleSheet.create({
  wrap:  { marginTop: 10 },
  track: { height: 3, backgroundColor: Colors.line, borderRadius: 2, marginBottom: 5 },
  fill:  { height: 3, borderRadius: 2 },
  label: { fontSize: 11, color: Colors.inkMute, fontWeight: '500' },
});

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.sand },
  header: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: Spacing.lg, paddingTop: 14, paddingBottom: Spacing.md,
  },
  headerSub:   { fontSize: 10, fontWeight: '700', letterSpacing: 1, color: Colors.inkMute, textTransform: 'uppercase', marginBottom: 3 },
  headerTitle: { fontSize: 22, fontWeight: '700', color: Colors.ink, letterSpacing: -0.4 },
  filterBtn: {
    width: 38, height: 38, borderRadius: Radius.full,
    backgroundColor: Colors.paper, borderWidth: 0.5, borderColor: Colors.line,
    alignItems: 'center', justifyContent: 'center',
  },

  // News card
  newsCard: {
    backgroundColor: Colors.moss, borderRadius: Radius.lg,
    padding: 20, marginHorizontal: Spacing.lg, marginBottom: 20,
  },
  newsEye:   { fontSize: 10, fontWeight: '700', letterSpacing: 1, color: Colors.mossSoft, textTransform: 'uppercase', marginBottom: 6 },
  newsTitle: { fontSize: 18, fontWeight: '700', color: Colors.sand, letterSpacing: -0.3, marginBottom: 4 },
  newsSub:   { fontSize: 13, color: Colors.mossSoft, lineHeight: 19, marginBottom: 14 },
  newsPill: {
    backgroundColor: Colors.mossDeep, borderRadius: Radius.full,
    paddingHorizontal: 10, paddingVertical: 4,
  },
  newsPillText: { fontSize: 11, fontWeight: '600', color: Colors.mossSoft },
  newsLink:     { fontSize: 13, fontWeight: '700', color: Colors.sand },
  allDoneBadge: {
    width: 28, height: 28, borderRadius: 14,
    backgroundColor: Colors.mossSoft,
    alignItems: 'center', justifyContent: 'center',
    marginLeft: 8,
  },
  allDoneText: { fontSize: 14, fontWeight: '700', color: Colors.moss },

  // Featured
  featured: {
    backgroundColor: Colors.paper, borderRadius: Radius.lg,
    borderWidth: 0.5, borderColor: Colors.line, overflow: 'hidden',
  },
  featuredArt: {
    width: '100%', height: 160,
    alignItems: 'center', justifyContent: 'center',
  },
  capturedOverlay: {
    position: 'absolute', bottom: 10, right: 10,
    backgroundColor: Colors.moss,
    borderRadius: Radius.full, paddingHorizontal: 10, paddingVertical: 4,
  },
  capturedOverlayText: { fontSize: 11, fontWeight: '700', color: Colors.sand },
  featuredBody:   { padding: 16 },
  featuredMeta:   { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 },
  featuredKind:   { fontSize: 10, fontWeight: '700', letterSpacing: 1, color: Colors.inkMute, textTransform: 'uppercase' },
  featuredTitle:  { fontSize: 18, fontWeight: '700', color: Colors.ink, lineHeight: 24, letterSpacing: -0.3 },
  featuredAuthor: { fontSize: 12, color: Colors.inkMute, marginTop: 3 },
  featuredWhy:    { fontSize: 12, color: Colors.inkSoft, marginTop: 8, lineHeight: 17 },

  sectionTitle: { fontSize: 12, fontWeight: '700', letterSpacing: 0.8, textTransform: 'uppercase', color: Colors.inkSoft },
  card: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: Colors.paper, borderWidth: 0.5, borderColor: Colors.line,
    borderRadius: Radius.md, padding: 12,
  },
  cardArt: {
    width: 64, height: 64, borderRadius: 10,
    alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  },
  cardMeta:   { flexDirection: 'row', alignItems: 'center', gap: 6 },
  cardKind:   { fontSize: 10, fontWeight: '700', letterSpacing: 0.5, color: Colors.inkMute, textTransform: 'uppercase' },
  cardLevel: {
    fontSize: 10, fontWeight: '600', color: Colors.inkMute,
    backgroundColor: Colors.sandDeep, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4,
  },
  capturedChip: {
    backgroundColor: Colors.mossSoft, borderRadius: Radius.full,
    paddingHorizontal: 6, paddingVertical: 2,
  },
  capturedChipText: { fontSize: 9, fontWeight: '700', color: Colors.moss },
  cardTitle:     { fontSize: 14, fontWeight: '700', color: Colors.ink, lineHeight: 19 },
  cardAuthor:    { fontSize: 12, color: Colors.inkMute },
  cardWhy:       { fontSize: 11, color: Colors.inkSoft, fontStyle: 'italic' },
  cardVocabHint: { fontSize: 11, color: Colors.gold, fontWeight: '500' },
  matchBadge: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: Colors.mossSoft,
    alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  },
  matchText: { fontSize: 11, fontWeight: '700', color: Colors.moss },
});
