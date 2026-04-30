import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Colors, Radius, Spacing } from '../theme';
import { Icons } from '../components';
import { NEWS_ARTICLES, NewsArticle } from '../data/seed';
import { RootStackParamList } from '../navigation';
import { useVaultStore } from '../store';

type Nav = NativeStackNavigationProp<RootStackParamList>;

const LEVEL_META: Record<1|2|3, { label: string; color: string; soft: string; cefr: string }> = {
  1: { label: 'Level 1', color: Colors.moss,  soft: Colors.mossSoft,  cefr: 'A2' },
  2: { label: 'Level 2', color: Colors.ocean, soft: Colors.oceanSoft, cefr: 'B1' },
  3: { label: 'Level 3', color: Colors.coral, soft: Colors.coralSoft, cefr: 'B2' },
};

const REAL_META = { label: 'Real', color: '#D4AF37', soft: '#FFF3CD', cefr: 'B2+' };

type SourceMode = 'graded' | 'real';

export default function NewsListScreen() {
  const navigation = useNavigation<Nav>();
  const { items }  = useVaultStore();
  const [sourceMode, setSourceMode] = useState<SourceMode>('graded');
  const [level, setLevel] = useState<1|2|3|'all'>('all');

  const filteredBySource = useMemo(() => {
    if (sourceMode === 'graded') {
      return NEWS_ARTICLES.filter((a) => a.level !== 4);
    }
    return NEWS_ARTICLES.filter((a) => a.level === 4);
  }, [sourceMode]);

  const allCaptured = (article: NewsArticle) =>
    article.vocabulary.every((v) =>
      items.some((i) => i.term.toLowerCase() === v.term.toLowerCase()),
    );

  const visible = level === 'all'
    ? filteredBySource
    : filteredBySource.filter((a) => a.level === level);

  const totalArticles = filteredBySource.length;
  const allDone = totalArticles > 0 && filteredBySource.every(allCaptured);

  return (
    <SafeAreaView style={s.safe}>
      <View style={s.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={s.backBtn} activeOpacity={0.7}>
          <Icons.Back size={20} color={Colors.ink} />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={s.headerSub}>NOTÍCIAS EM INGLÊS</Text>
          <Text style={s.headerTitle}>
            {sourceMode === 'graded' ? 'News in Levels' : 'Real News'}
          </Text>
        </View>
      </View>

      {/* Source toggle */}
      <View style={s.sourceToggle}>
        <TouchableOpacity
          onPress={() => { setSourceMode('graded'); setLevel('all'); }}
          style={[s.sourceChip, sourceMode === 'graded' && s.sourceChipActive]}
          activeOpacity={0.8}
        >
          <Text style={[s.sourceText, sourceMode === 'graded' && s.sourceTextActive]}>
            News in Levels
          </Text>
          <Text style={[s.sourceSubtext, sourceMode === 'graded' && s.sourceSubtextActive]}>
            Iniciante → Intermediário
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => { setSourceMode('real'); setLevel('all'); }}
          style={[s.sourceChip, sourceMode === 'real' && s.sourceChipReal]}
          activeOpacity={0.8}
        >
          <Text style={[s.sourceText, sourceMode === 'real' && s.sourceTextActive]}>
            Real News
          </Text>
          <Text style={[s.sourceSubtext, sourceMode === 'real' && s.sourceSubtextActive]}>
            Autêntico B2+
          </Text>
        </TouchableOpacity>
      </View>

      {/* Level filter */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.filterScroll}>
        {sourceMode === 'graded' ? (
          (['all', 1, 2, 3] as const).map((l) => {
            const active = level === l;
            const meta   = l === 'all' ? null : LEVEL_META[l];
            return (
              <TouchableOpacity
                key={String(l)}
                onPress={() => setLevel(l)}
                style={[s.pill, active && { backgroundColor: meta?.color ?? Colors.ink, borderColor: meta?.color ?? Colors.ink }]}
                activeOpacity={0.8}
              >
                <Text style={[s.pillText, active && { color: Colors.sand }]}>
                  {l === 'all' ? 'Todos' : `${meta!.label} · ${meta!.cefr}`}
                </Text>
              </TouchableOpacity>
            );
          })
        ) : (
          <View style={{ flexDirection: 'row', gap: 6 }}>
            <View style={[s.pill, { backgroundColor: REAL_META.color, borderColor: REAL_META.color }]}>
              <Text style={[s.pillText, { color: Colors.sand }]}>
                {totalArticles} artigos autênticos
              </Text>
            </View>
            {allDone && (
              <View style={[s.pill, { backgroundColor: Colors.mossDeep + 'AA', borderColor: 'transparent' }]}>
                <Text style={[s.pillText, { color: Colors.sand }]}>✓ Todos capturados</Text>
              </View>
            )}
          </View>
        )}
      </ScrollView>

      <ScrollView contentContainerStyle={{ paddingHorizontal: Spacing.lg, paddingBottom: 32, gap: 10 }}>
        {visible.length === 0 ? (
          <View style={{ padding: 40, alignItems: 'center' }}>
            <Text style={{ fontSize: 14, color: Colors.inkMute, textAlign: 'center' }}>
              Nenhum artigo encontrado neste nível.
            </Text>
          </View>
        ) : (
          visible.map((article) => {
            const isReal = article.level === 4;
            const meta   = isReal ? REAL_META : LEVEL_META[article.level as 1|2|3];
            const color  = isReal ? '#D4AF37' : meta.color;
            const soft   = isReal ? '#FFF3CD' : meta.soft;
            const captured  = allCaptured(article);
            const remaining = article.vocabulary.filter(
              (v) => !items.some((i) => i.term.toLowerCase() === v.term.toLowerCase()),
            ).length;
            return (
              <TouchableOpacity
                key={article.id}
                style={s.card}
                onPress={() => navigation.navigate('NewsArticle', { articleId: article.id })}
                activeOpacity={0.85}
              >
                <View style={s.cardTop}>
                  <View style={[s.levelBadge, { backgroundColor: soft }]}>
                    <Text style={[s.levelText, { color }]}>
                      {isReal ? `${article.source ?? 'Real'} · B2+` : `${meta.label} · ${meta.cefr}`}
                    </Text>
                  </View>
                  {captured && (
                    <View style={s.capturedBadge}>
                      <Text style={s.capturedText}>✓ Capturado</Text>
                    </View>
                  )}
                </View>
                <Text style={s.cardTitle}>{article.title}</Text>
                <View style={s.cardFooter}>
                  <Text style={s.cardTopic}>{article.topic}</Text>
                  {!isReal && (
                    <Text style={s.cardVocab}>
                      {captured ? 'Vocabulário capturado' : `${remaining} palavras para capturar`}
                    </Text>
                  )}
                  {isReal && (
                    <Text style={s.cardVocab}>
                      {captured ? 'Vocabulário capturado' : `${remaining} para capturar`}
                    </Text>
                  )}
                </View>
              </TouchableOpacity>
            );
          })
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe:          { flex: 1, backgroundColor: Colors.sand },
  header:        { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: Spacing.lg, paddingTop: 14, paddingBottom: Spacing.sm },
  backBtn:       { width: 38, height: 38, borderRadius: Radius.full, backgroundColor: Colors.paper, borderWidth: 0.5, borderColor: Colors.line, alignItems: 'center', justifyContent: 'center' },
  headerSub:     { fontSize: 10, fontWeight: '700', letterSpacing: 1, color: Colors.inkMute, textTransform: 'uppercase', marginBottom: 2 },
  headerTitle:   { fontSize: 20, fontWeight: '700', color: Colors.ink, letterSpacing: -0.3 },
  sourceToggle: {
    flexDirection: 'row', gap: 8, paddingHorizontal: Spacing.lg,
    paddingBottom: 12,
  },
  sourceChip: {
    flex: 1, paddingVertical: 14, paddingHorizontal: 20,
    borderRadius: Radius.md, borderWidth: 1, borderColor: Colors.line,
    backgroundColor: Colors.paper,
  },
  sourceChipActive: {
    borderColor: Colors.moss, backgroundColor: Colors.mossSoft,
  },
  sourceChipReal: {
    borderColor: '#D4AF37', backgroundColor: '#FFF3CD',
  },
  sourceText: { fontSize: 15, fontWeight: '700', color: Colors.inkMute },
  sourceTextActive: { color: Colors.mossDeep },
  sourceSubtext: { fontSize: 11, color: Colors.inkMute, marginTop: 2 },
  sourceSubtextActive: { color: Colors.inkSoft },
  filterScroll:  { paddingHorizontal: Spacing.lg, gap: 10, paddingBottom: 16 },
  pill:          { paddingHorizontal: 20, paddingVertical: 12, borderRadius: Radius.full, borderWidth: 1, borderColor: Colors.lineStrong },
  pillText:      { fontSize: 15, fontWeight: '700', color: Colors.inkSoft },
  card:          { backgroundColor: Colors.paper, borderRadius: Radius.md, borderWidth: 0.5, borderColor: Colors.line, padding: 14 },
  cardTop:       { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  levelBadge:    { borderRadius: Radius.full, paddingHorizontal: 8, paddingVertical: 3 },
  levelText:     { fontSize: 10, fontWeight: '700', letterSpacing: 0.5 },
  capturedBadge: { borderRadius: Radius.full, paddingHorizontal: 8, paddingVertical: 3, backgroundColor: Colors.mossSoft },
  capturedText:  { fontSize: 10, fontWeight: '700', color: Colors.moss },
  cardTitle:     { fontSize: 15, fontWeight: '600', color: Colors.ink, letterSpacing: -0.2, lineHeight: 21, marginBottom: 8 },
  cardFooter:    { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cardTopic:     { fontSize: 11, color: Colors.inkMute, fontWeight: '500' },
  cardVocab:     { fontSize: 11, color: Colors.inkMute },
});