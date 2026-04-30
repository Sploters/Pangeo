import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Colors, Radius, Spacing } from '../theme';
import { Icons } from '../components';
import { NEWS_ARTICLES, VocabSuggestion } from '../data/seed';
import { RootStackParamList } from '../navigation';
import { useVaultStore } from '../store';

type Nav   = NativeStackNavigationProp<RootStackParamList>;
type Route = RouteProp<RootStackParamList, 'NewsArticle'>;

const LEVEL_META: Record<1|2|3|4, { color: string; soft: string; label: string }> = {
  1: { color: Colors.moss,  soft: Colors.mossSoft,  label: 'Level 1 · A2' },
  2: { color: Colors.ocean, soft: Colors.oceanSoft, label: 'Level 2 · B1' },
  3: { color: Colors.coral, soft: Colors.coralSoft, label: 'Level 3 · B2' },
  4: { color: '#D4AF37',    soft: '#FFF3CD',        label: 'Real News · B2+' },
};

export default function NewsArticleScreen() {
  const navigation = useNavigation<Nav>();
  const route      = useRoute<Route>();
  const { items, addItem }  = useVaultStore();

  const article = NEWS_ARTICLES.find((a) => a.id === route.params.articleId)!;
  const meta    = LEVEL_META[article.level];

  const vocabTerms = useMemo(
    () => new Set(article.vocabulary.map((v) => v.term.toLowerCase())),
    [article],
  );

  const allCaptured = article.vocabulary.every((v) =>
    items.some((i) => i.term.toLowerCase() === v.term.toLowerCase()),
  );

  const pending = article.vocabulary.filter(
    (v) => !items.some((i) => i.term.toLowerCase() === v.term.toLowerCase()),
  );

  const [tooltip, setTooltip] = useState<VocabSuggestion | null>(null);

  const captureFromTooltip = (v: VocabSuggestion) => {
    const now = new Date();
    addItem({
      term: v.term,
      type: v.type,
      lang: 'en→pt',
      gloss: v.gloss,
      source: v.source,
      date: `${now.toLocaleDateString('pt-BR')} · ${now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`,
      example: v.example ?? '',
      srs: 'new',
      strength: 0,
      tags: [],
      function: v.function,
      level: v.level,
      stability: 0,
      difficulty: 5,
      lapses: 0,
      lastReviewAt: 0,
      nextReviewAt: 0,
    });
    setTooltip(null);
  };

  // Split text into segments, matching vocab terms (single and multi-word)
  const tokens = useMemo(() => {
    const sorted = [...article.vocabulary].sort((a, b) => b.term.length - a.term.length);
    const escaped = sorted.map((v) => v.term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
    if (escaped.length === 0) return article.text.split(/(\s+)/).map((raw, key) => ({ raw, key, vocab: null }));
    const pattern = new RegExp(`(${escaped.join('|')})`, 'gi');
    const parts: { raw: string; key: number; vocab: typeof article.vocabulary[0] | null }[] = [];
    let lastIndex = 0;
    let key = 0;
    pattern.lastIndex = 0;
    for (;;) {
      const m = pattern.exec(article.text);
      if (!m) break;
      if (m.index > lastIndex) {
        parts.push({ raw: article.text.slice(lastIndex, m.index), key: key++, vocab: null });
      }
      const match = sorted.find((v) => v.term.toLowerCase() === m[0].toLowerCase());
      parts.push({ raw: m[0], key: key++, vocab: match ?? null });
      lastIndex = pattern.lastIndex;
    }
    if (lastIndex < article.text.length) {
      parts.push({ raw: article.text.slice(lastIndex), key: key++, vocab: null });
    }
    return parts;
  }, [article]);

  return (
    <SafeAreaView style={s.safe}>
      <View style={s.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={s.backBtn} activeOpacity={0.7}>
          <Icons.Back size={20} color={Colors.ink} />
        </TouchableOpacity>
          <View style={[s.levelBadge, { backgroundColor: meta.soft }]}>
            <Text style={[s.levelText, { color: meta.color }]}>{meta.label}</Text>
          </View>
          {article.source && (
            <View style={[s.levelBadge, { backgroundColor: Colors.mossSoft }]}>
              <Text style={[s.levelText, { color: Colors.moss }]}>{article.source}</Text>
            </View>
          )}
        </View>

        <ScrollView contentContainerStyle={s.content}>
          <Text style={s.title}>{article.title}</Text>
          <Text style={s.date}>{article.date}</Text>

        {/* Article text with vocab highlights */}
        <View style={s.textBlock}>
          <Text style={s.articleText}>
            {tokens.map((t) =>
              t.vocab ? (
                <Text
                  key={t.key}
                  style={s.vocabWord}
                  onPress={() => setTooltip(t.vocab)}
                >
                  {t.raw}
                </Text>
              ) : (
                <Text key={t.key}>{t.raw}</Text>
              ),
            )}
          </Text>
        </View>

        {/* Vocab list preview */}
        <View style={s.vocabSection}>
          <Text style={s.vocabLabel}>VOCABULÁRIO DO ARTIGO</Text>
          {article.vocabulary.map((v, i) => {
            const inVault = items.some((item) => item.term.toLowerCase() === v.term.toLowerCase());
            return (
              <View key={i} style={s.vocabRow}>
                <Text style={[s.vocabTerm, inVault && { color: Colors.moss }]}>{v.term}</Text>
                {inVault && <Text style={s.vocabCheck}>✓</Text>}
              </View>
            );
          })}
        </View>
      </ScrollView>

      {/* Footer CTA */}
      <View style={s.footer}>
        <TouchableOpacity
          style={[s.ctaBtn, allCaptured && s.ctaBtnDone]}
          disabled={allCaptured}
          onPress={() =>
            navigation.navigate('Triagem', {
              suggestions: pending,
              title: 'Vocabulário do Artigo',
              subtitle: article.title,
            })
          }
          activeOpacity={0.85}
        >
          <Text style={[s.ctaText, allCaptured && { color: Colors.moss }]}>
            {allCaptured
              ? '✓ Vocabulário capturado'
              : `Revisar vocabulário · ${pending.length} palavras →`}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Tooltip modal */}
      {tooltip && (
        <Modal transparent animationType="fade" onRequestClose={() => setTooltip(null)}>
          <TouchableOpacity style={s.overlay} activeOpacity={1} onPress={() => setTooltip(null)}>
            <View style={s.tooltipCard}>
              <Text style={s.tooltipTerm}>{tooltip.term}</Text>
              <Text style={s.tooltipGloss}>{tooltip.gloss}</Text>
              {tooltip.example && <Text style={s.tooltipExample}>"{tooltip.example}"</Text>}

              {/* Capture button */}
              {(() => {
                const alreadyCaptured = items.some(
                  (i) => i.term.toLowerCase() === tooltip.term.toLowerCase(),
                );
                return (
                  <TouchableOpacity
                    onPress={() => !alreadyCaptured && captureFromTooltip(tooltip)}
                    disabled={alreadyCaptured}
                    style={{
                      marginTop: 16,
                      backgroundColor: alreadyCaptured ? Colors.mossSoft : Colors.moss,
                      borderRadius: Radius.full,
                      paddingVertical: 11,
                      alignItems: 'center',
                    }}
                    activeOpacity={0.85}
                  >
                    <Text style={{
                      fontSize: 13, fontWeight: '700',
                      color: alreadyCaptured ? Colors.moss : Colors.sand,
                    }}>
                      {alreadyCaptured ? '✓ No Vault' : 'Capturar →'}
                    </Text>
                  </TouchableOpacity>
                );
              })()}
            </View>
          </TouchableOpacity>
        </Modal>
      )}
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe:         { flex: 1, backgroundColor: Colors.sand },
  header:       { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: Spacing.lg, paddingTop: 14, paddingBottom: Spacing.sm },
  backBtn:      { width: 38, height: 38, borderRadius: Radius.full, backgroundColor: Colors.paper, borderWidth: 0.5, borderColor: Colors.line, alignItems: 'center', justifyContent: 'center' },
  levelBadge:   { borderRadius: Radius.full, paddingHorizontal: 10, paddingVertical: 4 },
  levelText:    { fontSize: 11, fontWeight: '700', letterSpacing: 0.5 },
  content:      { paddingHorizontal: Spacing.lg, paddingBottom: 100 },
  title:        { fontSize: 20, fontWeight: '700', color: Colors.ink, letterSpacing: -0.4, lineHeight: 28, marginBottom: 6 },
  date:         { fontSize: 11, color: Colors.inkMute, marginBottom: 18 },
  textBlock:    { marginBottom: 24 },
  articleText:  { fontSize: 15, color: Colors.ink, lineHeight: 26 },
  vocabWord:    { color: Colors.ocean, textDecorationLine: 'underline', textDecorationStyle: 'dotted', textDecorationColor: Colors.ocean },
  vocabSection: { backgroundColor: Colors.paper, borderRadius: Radius.md, borderWidth: 0.5, borderColor: Colors.line, padding: 14, gap: 8 },
  vocabLabel:   { fontSize: 10, fontWeight: '700', letterSpacing: 0.8, color: Colors.inkMute, textTransform: 'uppercase', marginBottom: 4 },
  vocabRow:     { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  vocabTerm:    { fontSize: 14, fontWeight: '500', color: Colors.inkSoft },
  vocabCheck:   { fontSize: 13, color: Colors.moss, fontWeight: '700' },
  footer:       { position: 'absolute', bottom: 0, left: 0, right: 0, padding: Spacing.lg, backgroundColor: Colors.sand, borderTopWidth: 0.5, borderTopColor: Colors.line },
  ctaBtn:       { backgroundColor: Colors.moss, borderRadius: Radius.full, height: 50, alignItems: 'center', justifyContent: 'center' },
  ctaBtnDone:   { backgroundColor: Colors.mossSoft },
  ctaText:      { fontSize: 14, fontWeight: '700', color: Colors.sand },
  overlay:      { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', alignItems: 'center', justifyContent: 'center', padding: 32 },
  tooltipCard:  { backgroundColor: Colors.paper, borderRadius: Radius.lg, padding: 20, width: '100%' },
  tooltipTerm:  { fontSize: 20, fontWeight: '700', color: Colors.ink, marginBottom: 8 },
  tooltipGloss: { fontSize: 15, color: Colors.inkSoft, lineHeight: 22, marginBottom: 8 },
  tooltipExample:{ fontSize: 13, fontStyle: 'italic', color: Colors.inkMute, lineHeight: 19 },
});