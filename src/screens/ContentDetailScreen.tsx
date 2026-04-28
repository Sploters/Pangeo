import React, { useMemo } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Colors, Radius, Spacing } from '../theme';
import { PgChip, Icons } from '../components';
import { CONTENT } from '../data/seed';
import { RootStackParamList } from '../navigation';
import { useVaultStore } from '../store';

type Nav   = NativeStackNavigationProp<RootStackParamList>;
type Route = RouteProp<RootStackParamList, 'ContentDetail'>;

const KIND_ICON: Record<string, React.FC<any>> = {
  podcast: Icons.Headphones,
  book:    Icons.Book,
  video:   Icons.Video,
  article: Icons.Article,
};

export default function ContentDetailScreen() {
  const navigation = useNavigation<Nav>();
  const route      = useRoute<Route>();
  const { items }  = useVaultStore();

  const content = CONTENT.find((c) => c.id === route.params.contentId)!;
  const KindIcon = KIND_ICON[content.kind] ?? Icons.Book;

  const vocabulary = content.vocabulary ?? [];

  const pending = useMemo(
    () => vocabulary.filter(
      (v) => !items.some((i) => i.term.toLowerCase() === v.term.toLowerCase()),
    ),
    [vocabulary, items],
  );

  const allCaptured = pending.length === 0 && vocabulary.length > 0;

  return (
    <SafeAreaView style={s.safe}>
      <View style={s.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={s.backBtn} activeOpacity={0.7}>
          <Icons.Back size={20} color={Colors.ink} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 100 }}>
        {/* Art + meta */}
        <View style={[s.artBlock, { backgroundColor: content.art }]}>
          <KindIcon size={48} color="#fff" />
        </View>
        <View style={s.meta}>
          <View style={s.metaTop}>
            <Text style={s.kind}>{content.kind.toUpperCase()}</Text>
            <Text style={s.level}>{content.level}</Text>
          </View>
          <Text style={s.title}>{content.title}</Text>
          <Text style={s.author}>{content.author}</Text>
        </View>

        {/* Why */}
        <View style={{ paddingHorizontal: Spacing.lg, marginBottom: 20 }}>
          <Text style={s.sectionLabel}>POR QUE ESTE CONTEÚDO?</Text>
          <View style={s.whyCard}>
            <Text style={s.whyText}>{content.why}</Text>
          </View>
        </View>

        {/* Vocabulary preview */}
        {vocabulary.length > 0 && (
          <View style={{ paddingHorizontal: Spacing.lg }}>
            <Text style={s.sectionLabel}>VOCABULÁRIO ESSENCIAL</Text>
            <View style={s.vocabList}>
              {vocabulary.map((v, i) => {
                const inVault = items.some((item) => item.term.toLowerCase() === v.term.toLowerCase());
                return (
                  <View key={i} style={s.vocabRow}>
                    <Text style={[s.vocabTerm, inVault && { color: Colors.moss }]}>{v.term}</Text>
                    <PgChip c={Colors.inkMute} soft={Colors.line}>{v.type}</PgChip>
                    {inVault && <Text style={s.check}>✓</Text>}
                  </View>
                );
              })}
            </View>
          </View>
        )}
      </ScrollView>

      {/* Footer CTA */}
      {vocabulary.length > 0 && (
        <View style={s.footer}>
          <TouchableOpacity
            style={[s.ctaBtn, allCaptured && s.ctaDone]}
            disabled={allCaptured}
            onPress={() =>
              navigation.navigate('Triagem', {
                suggestions: pending,
                title: content.title,
                subtitle: `${pending.length} palavras para capturar`,
              })
            }
            activeOpacity={0.85}
          >
            <Text style={[s.ctaText, allCaptured && { color: Colors.moss }]}>
              {allCaptured
                ? '✓ Vocabulário capturado'
                : `Iniciar triagem · ${pending.length} palavras →`}
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe:         { flex: 1, backgroundColor: Colors.sand },
  header:       { paddingHorizontal: Spacing.lg, paddingTop: 14, paddingBottom: 4 },
  backBtn:      { width: 38, height: 38, borderRadius: Radius.full, backgroundColor: Colors.paper, borderWidth: 0.5, borderColor: Colors.line, alignItems: 'center', justifyContent: 'center' },
  artBlock:     { height: 160, alignItems: 'center', justifyContent: 'center', marginHorizontal: Spacing.lg, borderRadius: Radius.lg, marginBottom: 16 },
  meta:         { paddingHorizontal: Spacing.lg, marginBottom: 20 },
  metaTop:      { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 },
  kind:         { fontSize: 10, fontWeight: '700', letterSpacing: 0.8, color: Colors.inkMute },
  level:        { fontSize: 10, fontWeight: '700', color: Colors.moss, backgroundColor: Colors.mossSoft, borderRadius: Radius.full, paddingHorizontal: 8, paddingVertical: 2 },
  title:        { fontSize: 20, fontWeight: '700', color: Colors.ink, letterSpacing: -0.4, marginBottom: 4 },
  author:       { fontSize: 13, color: Colors.inkMute },
  sectionLabel: { fontSize: 10, fontWeight: '700', letterSpacing: 0.8, textTransform: 'uppercase', color: Colors.inkMute, marginBottom: 10 },
  whyCard:      { backgroundColor: Colors.oceanSoft, borderRadius: Radius.md, padding: 14 },
  whyText:      { fontSize: 14, color: Colors.inkSoft, lineHeight: 21, fontStyle: 'italic' },
  vocabList:    { backgroundColor: Colors.paper, borderRadius: Radius.md, borderWidth: 0.5, borderColor: Colors.line, padding: 14, gap: 10 },
  vocabRow:     { flexDirection: 'row', alignItems: 'center', gap: 8 },
  vocabTerm:    { flex: 1, fontSize: 14, fontWeight: '500', color: Colors.inkSoft },
  check:        { fontSize: 13, color: Colors.moss, fontWeight: '700' },
  footer:       { position: 'absolute', bottom: 0, left: 0, right: 0, padding: Spacing.lg, backgroundColor: Colors.sand, borderTopWidth: 0.5, borderTopColor: Colors.line },
  ctaBtn:       { backgroundColor: Colors.moss, borderRadius: Radius.full, height: 50, alignItems: 'center', justifyContent: 'center' },
  ctaDone:      { backgroundColor: Colors.mossSoft },
  ctaText:      { fontSize: 14, fontWeight: '700', color: Colors.sand },
});