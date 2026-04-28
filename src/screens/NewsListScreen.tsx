import React, { useState } from 'react';
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

export default function NewsListScreen() {
  const navigation = useNavigation<Nav>();
  const { items }  = useVaultStore();
  const [level, setLevel] = useState<1|2|3|'all'>('all');

  const allCaptured = (article: NewsArticle) =>
    article.vocabulary.every((v) =>
      items.some((i) => i.term.toLowerCase() === v.term.toLowerCase()),
    );

  const visible = level === 'all'
    ? NEWS_ARTICLES
    : NEWS_ARTICLES.filter((a) => a.level === level);

  return (
    <SafeAreaView style={s.safe}>
      <View style={s.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={s.backBtn} activeOpacity={0.7}>
          <Icons.Back size={20} color={Colors.ink} />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={s.headerSub}>NOTÍCIAS EM INGLÊS</Text>
          <Text style={s.headerTitle}>News in Levels</Text>
        </View>
      </View>

      {/* Level filter */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.filterScroll}>
        {(['all', 1, 2, 3] as const).map((l) => {
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
        })}
      </ScrollView>

      <ScrollView contentContainerStyle={{ paddingHorizontal: Spacing.lg, paddingBottom: 32, gap: 10 }}>
        {visible.map((article) => {
          const meta      = LEVEL_META[article.level];
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
                <View style={[s.levelBadge, { backgroundColor: meta.soft }]}>
                  <Text style={[s.levelText, { color: meta.color }]}>{meta.label} · {meta.cefr}</Text>
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
                <Text style={s.cardVocab}>
                  {captured ? 'Vocabulário capturado' : `${remaining} palavras para capturar`}
                </Text>
              </View>
            </TouchableOpacity>
          );
        })}
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
  filterScroll:  { paddingHorizontal: Spacing.lg, gap: 6, paddingBottom: 14 },
  pill:          { paddingHorizontal: 12, paddingVertical: 6, borderRadius: Radius.full, borderWidth: 1, borderColor: Colors.lineStrong },
  pillText:      { fontSize: 12, fontWeight: '600', color: Colors.inkSoft },
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