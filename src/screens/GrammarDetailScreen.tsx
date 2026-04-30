import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRoute, RouteProp, useNavigation } from '@react-navigation/native';
import { Colors, Spacing, Radius, FontSize } from '../theme';
import { PgCard, Icons } from '../components';
import { GRAMMAR_TOPICS, GrammarLevel } from '../data/seed';
import { RootStackParamList } from '../navigation';
import { useGrammarStore, GrammarStatus } from '../store';

const LEVEL_COLORS: Record<GrammarLevel, { c: string; soft: string }> = {
  A1: { c: Colors.moss, soft: Colors.mossSoft },
  A2: { c: Colors.moss, soft: Colors.mossSoft },
  B1: { c: Colors.ocean, soft: Colors.oceanSoft },
  B2: { c: Colors.ocean, soft: Colors.oceanSoft },
  C1: { c: Colors.amber, soft: Colors.amberSoft },
  C2: { c: Colors.amber, soft: Colors.amberSoft },
};

const COMPREHENSION_OPTIONS: { status: GrammarStatus; label: string; emoji: string; color: string; soft: string; detail: string }[] = [
  { status: 'got-it',   label: 'Entendi',          emoji: '✓', color: Colors.moss,  soft: Colors.mossSoft,   detail: 'Pronto para avançar' },
  { status: 'review',   label: 'Preciso revisar',  emoji: '↺', color: Colors.amber, soft: Colors.amberSoft,  detail: 'Volte em breve' },
  { status: 'confused', label: 'Ainda confuso',    emoji: '?', color: '#E74C3C',    soft: '#FDECEA',         detail: 'Releia com calma' },
];

export default function GrammarDetailScreen() {
  const route = useRoute<RouteProp<RootStackParamList, 'GrammarDetail'>>();
  const navigation = useNavigation<any>();
  const { topicId } = route.params;

  const markSeen  = useGrammarStore((s) => s.markSeen);
  const setStatus = useGrammarStore((s) => s.setStatus);
  const progress  = useGrammarStore((s) => s.progress);

  const topicIdx = GRAMMAR_TOPICS.findIndex(t => t.id === topicId);
  const topic    = GRAMMAR_TOPICS[topicIdx];
  const prevTopic = topicIdx > 0 ? GRAMMAR_TOPICS[topicIdx - 1] : null;
  const nextTopic = topicIdx < GRAMMAR_TOPICS.length - 1 ? GRAMMAR_TOPICS[topicIdx + 1] : null;

  // Mark as seen when the lesson is opened
  useEffect(() => { markSeen(topicId); }, [topicId]);

  if (!topic) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Lesson content could not be loaded.</Text>
        </View>
      </SafeAreaView>
    );
  }

  const currentStatus = progress[topicId] as GrammarStatus | undefined;
  const { c, soft } = LEVEL_COLORS[topic.level] || LEVEL_COLORS.A1;
  const bodyParagraphs = topic.content?.body?.split('\n\n') ?? [];

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Icons.Back size={20} color={Colors.ink} />
        </TouchableOpacity>
        <View style={styles.headerMeta}>
          <View style={[styles.levelBadge, { backgroundColor: soft }]}>
            <Text style={[styles.levelText, { color: c }]}>{topic.level}</Text>
          </View>
          <Text style={styles.lessonNum}>Lesson {topic.lessonNumber}</Text>
        </View>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Title */}
        <View style={styles.titleSection}>
          <Text style={styles.title}>{topic.title}</Text>
          <Text style={styles.description}>{topic.description}</Text>

          {/* Difficulty tags */}
          <View style={styles.tagsRow}>
            {topic.difficultyTags.map(tag => (
              <View key={tag} style={[styles.tag, { backgroundColor: soft }]}>
                <Text style={[styles.tagText, { color: c }]}>{tag}</Text>
              </View>
            ))}
          </View>
        </View>

        {topic.content ? (
          <>
            {/* Explanation body */}
            {bodyParagraphs.map((para, i) => {
              const isStructure = para.includes('→') || para.includes(':') && para.split('\n').length > 2;
              if (isStructure) {
                return (
                  <View key={i} style={[styles.structureCard, { borderLeftColor: c }]}>
                    {para.split('\n').map((line, j) => (
                      <Text key={j} style={line.endsWith(':') ? styles.structureLabel : styles.structureLine}>
                        {line}
                      </Text>
                    ))}
                  </View>
                );
              }
              return (
                <View key={i} style={styles.bodyCard}>
                  {para.split('\n').map((line, j) => (
                    <Text
                      key={j}
                      style={[
                        styles.bodyLine,
                        line.startsWith('•') && styles.bulletLine,
                        line.startsWith('✓') && styles.correctLine,
                        line.startsWith('✗') && styles.wrongLine,
                        line.match(/^[A-Z].*:$/) && styles.subheading,
                      ]}
                    >
                      {line}
                    </Text>
                  ))}
                </View>
              );
            })}

            {/* Examples section */}
            {topic.content.examples && topic.content.examples.length > 0 && (
              <View style={styles.examplesSection}>
                <View style={styles.sectionHeaderRow}>
                  <View style={[styles.dot, { backgroundColor: c }]} />
                  <Text style={styles.sectionTitle}>Examples</Text>
                </View>
                {topic.content.examples.map((ex, i) => (
                  <PgCard key={i} style={styles.exampleCard}>
                    <Text style={styles.exampleNumber}>{i + 1}</Text>
                    <Text style={styles.exampleText}>{ex}</Text>
                  </PgCard>
                ))}
              </View>
            )}
          </>
        ) : (
          <PgCard style={styles.emptyCard}>
            <Icons.Book size={32} color={Colors.inkMute} />
            <Text style={styles.emptyTitle}>Content coming soon</Text>
            <Text style={styles.emptyBody}>
              This lesson\u2019s detailed content is being prepared. Visit{' '}
              <Text style={{ color: c }}>grammarinlevels.com</Text> for now.
            </Text>
          </PgCard>
        )}

        {/* ── Comprehension check ─────────────────────────────────────── */}
        <View style={styles.comprehensionSection}>
          <Text style={styles.comprehensionTitle}>Como ficou?</Text>
          <Text style={styles.comprehensionSub}>Avalie seu entendimento desta lição</Text>
          <View style={styles.comprehensionRow}>
            {COMPREHENSION_OPTIONS.map((opt) => {
              const selected = currentStatus === opt.status;
              return (
                <TouchableOpacity
                  key={opt.status}
                  style={[
                    styles.comprehensionBtn,
                    { borderColor: opt.color, backgroundColor: selected ? opt.soft : Colors.paper },
                  ]}
                  onPress={() => setStatus(topicId, opt.status)}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.comprehensionEmoji, { color: opt.color }]}>{opt.emoji}</Text>
                  <Text style={[styles.comprehensionLabel, { color: selected ? opt.color : Colors.ink }]}>
                    {opt.label}
                  </Text>
                  {selected && (
                    <Text style={[styles.comprehensionDetail, { color: opt.color }]}>{opt.detail}</Text>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Navigation between lessons */}
        <View style={styles.navRow}>
          {prevTopic ? (
            <TouchableOpacity
              style={[styles.navBtn, styles.navBtnLeft]}
              onPress={() => navigation.replace('GrammarDetail', { topicId: prevTopic.id })}
              activeOpacity={0.7}
            >
              <Icons.Back size={14} color={Colors.inkMute} />
              <View style={styles.navBtnText}>
                <Text style={styles.navBtnLabel}>Anterior</Text>
                <Text style={styles.navBtnTitle} numberOfLines={1}>{prevTopic.title}</Text>
              </View>
            </TouchableOpacity>
          ) : <View style={styles.navBtnPlaceholder} />}

          {nextTopic ? (
            <TouchableOpacity
              style={[styles.navBtn, styles.navBtnRight]}
              onPress={() => navigation.replace('GrammarDetail', { topicId: nextTopic.id })}
              activeOpacity={0.7}
            >
              <View style={styles.navBtnText}>
                <Text style={[styles.navBtnLabel, { textAlign: 'right' }]}>Próxima</Text>
                <Text style={[styles.navBtnTitle, { textAlign: 'right' }]} numberOfLines={1}>{nextTopic.title}</Text>
              </View>
              <Icons.Next size={14} color={Colors.inkMute} />
            </TouchableOpacity>
          ) : <View style={styles.navBtnPlaceholder} />}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.sand },
  errorContainer: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  errorText: { color: Colors.inkMute, fontSize: FontSize.md },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    justifyContent: 'space-between',
  },
  backBtn: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: Radius.full,
    backgroundColor: Colors.line,
  },
  headerMeta: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  levelBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: Radius.sm,
  },
  levelText: { fontSize: 11, fontWeight: '800' },
  lessonNum: { fontSize: FontSize.sm, color: Colors.inkMute, fontWeight: '600' },

  scrollContent: { paddingBottom: Spacing.xxl },

  titleSection: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.lg,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: Colors.ink,
    marginBottom: 6,
    letterSpacing: -0.5,
  },
  description: {
    fontSize: FontSize.md,
    color: Colors.inkMute,
    lineHeight: 22,
    marginBottom: Spacing.md,
  },
  tagsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  tag: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: Radius.sm,
  },
  tagText: { fontSize: 11, fontWeight: '700' },

  structureCard: {
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
    padding: Spacing.md,
    backgroundColor: Colors.paper,
    borderRadius: Radius.md,
    borderLeftWidth: 3,
  },
  structureLabel: {
    fontSize: FontSize.sm,
    fontWeight: '700',
    color: Colors.ink,
    marginBottom: 4,
    marginTop: 8,
  },
  structureLine: {
    fontSize: FontSize.sm,
    color: Colors.ink,
    lineHeight: 22,
    fontFamily: 'monospace',
  },

  bodyCard: {
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
    padding: Spacing.md,
    backgroundColor: Colors.paper,
    borderRadius: Radius.md,
  },
  bodyLine: {
    fontSize: FontSize.md,
    color: Colors.ink,
    lineHeight: 24,
  },
  bulletLine: {
    paddingLeft: 4,
    color: Colors.ink,
  },
  correctLine: {
    color: Colors.moss,
    fontWeight: '600',
  },
  wrongLine: {
    color: '#C0392B',
    fontWeight: '600',
  },
  subheading: {
    fontWeight: '700',
    marginTop: 8,
    marginBottom: 2,
  },

  examplesSection: {
    marginTop: Spacing.sm,
    marginBottom: Spacing.md,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
  },
  dot: { width: 8, height: 8, borderRadius: 4 },
  sectionTitle: {
    fontSize: FontSize.lg,
    fontWeight: '700',
    color: Colors.ink,
  },
  exampleCard: {
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.sm,
    padding: Spacing.md,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.md,
  },
  exampleNumber: {
    fontSize: 11,
    fontWeight: '800',
    color: Colors.inkMute,
    width: 18,
    marginTop: 3,
  },
  exampleText: {
    flex: 1,
    fontSize: FontSize.md,
    color: Colors.ink,
    lineHeight: 24,
    fontStyle: 'italic',
  },

  emptyCard: {
    marginHorizontal: Spacing.lg,
    padding: Spacing.xl,
    alignItems: 'center',
    gap: Spacing.md,
  },
  emptyTitle: {
    fontSize: FontSize.lg,
    fontWeight: '700',
    color: Colors.ink,
  },
  emptyBody: {
    fontSize: FontSize.sm,
    color: Colors.inkMute,
    textAlign: 'center',
    lineHeight: 20,
  },

  navRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    marginTop: Spacing.xl,
    gap: Spacing.md,
  },
  navBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.paper,
    padding: Spacing.md,
    borderRadius: Radius.md,
  },
  navBtnLeft: { justifyContent: 'flex-start' },
  navBtnRight: { justifyContent: 'flex-end' },
  navBtnText: { flex: 1 },
  navBtnLabel: {
    fontSize: 10,
    color: Colors.inkMute,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  navBtnTitle: {
    fontSize: FontSize.sm,
    fontWeight: '700',
    color: Colors.ink,
  },
  navBtnPlaceholder: { flex: 1 },

  comprehensionSection: {
    marginHorizontal: Spacing.lg,
    marginTop: Spacing.xl,
    marginBottom: Spacing.sm,
  },
  comprehensionTitle: {
    fontSize: FontSize.lg, fontWeight: '800', color: Colors.ink, marginBottom: 4,
  },
  comprehensionSub: {
    fontSize: FontSize.sm, color: Colors.inkMute, marginBottom: Spacing.md,
  },
  comprehensionRow: {
    flexDirection: 'row', gap: Spacing.sm,
  },
  comprehensionBtn: {
    flex: 1, alignItems: 'center', paddingVertical: Spacing.md, paddingHorizontal: Spacing.sm,
    borderRadius: Radius.md, borderWidth: 1.5, gap: 4,
  },
  comprehensionEmoji: { fontSize: 18, fontWeight: '800' },
  comprehensionLabel: { fontSize: 11, fontWeight: '700', textAlign: 'center' },
  comprehensionDetail: { fontSize: 10, fontWeight: '600', textAlign: 'center' },
});
