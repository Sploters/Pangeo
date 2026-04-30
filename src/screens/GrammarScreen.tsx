import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Colors, Spacing, Radius, FontSize } from '../theme';
import { Icons, PgCard, PgHeader } from '../components';
import { GRAMMAR_TOPICS, GrammarTopic, GrammarLevel, CONTENT, ContentItem } from '../data/seed';
import { useVaultStore, useGrammarStore, GrammarStatus } from '../store';

const LEVEL_COLORS: Record<GrammarLevel, { c: string; soft: string }> = {
  A1: { c: Colors.moss,  soft: Colors.mossSoft },
  A2: { c: Colors.moss,  soft: Colors.mossSoft },
  B1: { c: Colors.ocean, soft: Colors.oceanSoft },
  B2: { c: Colors.ocean, soft: Colors.oceanSoft },
  C1: { c: Colors.amber, soft: Colors.amberSoft },
  C2: { c: Colors.amber, soft: Colors.amberSoft },
};

const STATUS_CONFIG: Record<GrammarStatus, { color: string; label: string } | null> = {
  unseen:   null,
  seen:     { color: Colors.inkMute,  label: '·' },
  'got-it': { color: Colors.moss,     label: '✓' },
  review:   { color: Colors.amber,    label: '↺' },
  confused: { color: '#E74C3C',       label: '?' },
};

export default function GrammarScreen() {
  const totalWords    = useVaultStore((s) => s.items.length);
  const progress      = useGrammarStore((s) => s.progress);
  const collapsedLevels = useGrammarStore((s) => s.collapsedLevels);
  const toggleLevel   = useGrammarStore((s) => s.toggleLevel);

  const groupedTopics = GRAMMAR_TOPICS.reduce((acc, topic) => {
    if (!acc[topic.level]) acc[topic.level] = [];
    acc[topic.level].push(topic);
    return acc;
  }, {} as Record<string, GrammarTopic[]>);

  const gradedReaders = CONTENT.filter(
    (item) => item.kind === 'book' && item.tags.includes('graded-reader'),
  );

  const suggested = [...GRAMMAR_TOPICS]
    .sort((a, b) => Math.abs(a.minWords - totalWords) - Math.abs(b.minWords - totalWords))
    .slice(0, 3);

  const navigation = useNavigation<any>();

  // ── helpers ────────────────────────────────────────────────────────────────
  const levelStats = (level: string) => {
    const topics = groupedTopics[level] ?? [];
    const done   = topics.filter((t) => progress[t.id] === 'got-it').length;
    const seen   = topics.filter((t) => progress[t.id] && progress[t.id] !== 'unseen').length;
    return { total: topics.length, done, seen };
  };

  // ── renders ────────────────────────────────────────────────────────────────
  const renderTopicCard = (topic: GrammarTopic) => {
    const { c, soft } = LEVEL_COLORS[topic.level] || LEVEL_COLORS.A1;
    const status       = progress[topic.id] as GrammarStatus | undefined;
    const statusCfg    = status ? STATUS_CONFIG[status] : null;

    return (
      <TouchableOpacity
        key={topic.id}
        onPress={() => navigation.navigate('GrammarDetail', { topicId: topic.id })}
        activeOpacity={0.7}
      >
        <PgCard style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={[styles.levelBadge, { backgroundColor: soft }]}>
              <Text style={[styles.levelText, { color: c }]}>{topic.level}</Text>
            </View>
            <Text style={styles.lessonNumber}>Lesson {topic.lessonNumber}</Text>

            {/* status badge */}
            {statusCfg && (
              <View style={[styles.statusDot, { backgroundColor: statusCfg.color }]}>
                <Text style={styles.statusDotText}>{statusCfg.label}</Text>
              </View>
            )}
          </View>

          <Text style={styles.topicTitle}>{topic.title}</Text>
          <Text style={styles.topicDesc} numberOfLines={2}>
            {topic.description}
          </Text>

          <View style={styles.cardFooter}>
            <View style={styles.tagsContainer}>
              {topic.difficultyTags.slice(0, 2).map((tag) => (
                <View key={tag} style={styles.tag}>
                  <Text style={styles.tagText}>{tag}</Text>
                </View>
              ))}
            </View>
            <Icons.Next size={16} color={Colors.moss} />
          </View>
        </PgCard>
      </TouchableOpacity>
    );
  };

  const renderBookCard = (book: ContentItem) => {
    const levelBase = book.level.includes('/') ? book.level.split('/')[0] : book.level;
    const { c, soft } = LEVEL_COLORS[levelBase as GrammarLevel] || LEVEL_COLORS.A1;

    return (
      <TouchableOpacity
        key={book.id}
        onPress={() => navigation.navigate('BookReader', { bookId: book.id })}
        activeOpacity={0.7}
        style={styles.bookCardContainer}
      >
        <PgCard style={styles.bookCard}>
          <View style={[styles.bookArt, { backgroundColor: book.art }]}>
            <Icons.Book size={24} color={Colors.sand} />
          </View>
          <View style={styles.bookInfo}>
            <View style={[styles.levelBadge, { backgroundColor: soft, alignSelf: 'flex-start', marginBottom: 4 }]}>
              <Text style={[styles.levelText, { color: c }]}>{book.level}</Text>
            </View>
            <Text style={styles.bookTitle} numberOfLines={1}>{book.title}</Text>
            <Text style={styles.bookWhy} numberOfLines={2}>{book.why}</Text>
          </View>
        </PgCard>
      </TouchableOpacity>
    );
  };

  const renderLevelSection = (level: GrammarLevel) => {
    const { c, soft } = LEVEL_COLORS[level];
    const topics       = groupedTopics[level] ?? [];
    const collapsed    = collapsedLevels.includes(level);
    const { total, done, seen } = levelStats(level);

    return (
      <View key={level} style={styles.section}>
        {/* Collapsible header */}
        <TouchableOpacity
          style={styles.levelHeader}
          onPress={() => toggleLevel(level)}
          activeOpacity={0.7}
        >
          <View style={[styles.levelDot, { backgroundColor: c }]} />
          <Text style={styles.levelTitle}>{level} Lessons</Text>

          {/* progress pill */}
          {seen > 0 && (
            <View style={[styles.progressPill, { backgroundColor: soft }]}>
              <Text style={[styles.progressPillText, { color: c }]}>
                {done}/{total} ✓
              </Text>
            </View>
          )}

          {/* mini progress bar */}
          {seen > 0 && (
            <View style={styles.miniBarBg}>
              <View style={[styles.miniBarFill, { backgroundColor: c, width: `${(done / total) * 100}%` as any }]} />
            </View>
          )}

          <View style={[styles.chevron, { transform: [{ rotate: collapsed ? '0deg' : '90deg' }] }]}>
            <Icons.Next size={14} color={Colors.inkMute} />
          </View>
        </TouchableOpacity>

        {/* Lesson grid — hidden when collapsed */}
        {!collapsed && (
          <View style={styles.grid}>
            {topics.map(renderTopicCard)}
          </View>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <PgHeader title="Grammar & Reading" sub="Structured Path" />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

        {/* Suggested */}
        {suggested.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Icons.Sparkle size={18} color={Colors.amber} />
              <Text style={styles.sectionTitle}>Sugeridas para você</Text>
            </View>
            <Text style={styles.sectionSub}>Mais próximas do seu vocabulário atual</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalScroll}>
              {suggested.map((topic) => (
                <View key={topic.id} style={styles.horizontalCard}>
                  {renderTopicCard(topic)}
                </View>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Graded Readers */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Icons.Book size={18} color={Colors.moss} />
            <Text style={styles.sectionTitle}>Graded Readers</Text>
          </View>
          <Text style={styles.sectionSub}>Clássicos adaptados ao seu nível</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalScroll}>
            {gradedReaders.map((book) => (
              <View key={book.id} style={styles.horizontalBookCard}>
                {renderBookCard(book)}
              </View>
            ))}
          </ScrollView>
        </View>

        {/* Level sections (collapsible) */}
        {(Object.keys(groupedTopics) as GrammarLevel[]).sort().map(renderLevelSection)}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container:      { flex: 1, backgroundColor: Colors.sand },
  scrollContent:  { paddingBottom: Spacing.xxl },

  section:     { marginTop: Spacing.lg },
  sectionHeader: {
    flexDirection: 'row', alignItems: 'center',
    gap: Spacing.sm, paddingHorizontal: Spacing.lg,
  },
  sectionTitle: { fontSize: FontSize.lg, fontWeight: '700', color: Colors.ink },
  sectionSub: {
    fontSize: FontSize.xs, color: Colors.inkMute,
    paddingHorizontal: Spacing.lg, marginTop: 2, marginBottom: Spacing.md,
  },

  // ── Collapsible level header ──────────────────────────────────────────────
  levelHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
  },
  levelDot:   { width: 10, height: 10, borderRadius: 5 },
  levelTitle: { fontSize: FontSize.lg, fontWeight: '700', color: Colors.ink, flex: 1 },
  progressPill: {
    paddingHorizontal: 7, paddingVertical: 2,
    borderRadius: Radius.full,
  },
  progressPillText: { fontSize: 10, fontWeight: '700' },
  miniBarBg: {
    flex: 1, maxWidth: 60, height: 4,
    backgroundColor: Colors.line, borderRadius: 2, overflow: 'hidden',
  },
  miniBarFill: { height: 4, borderRadius: 2 },
  chevron:    { marginLeft: 2 },

  // ── Lesson card ──────────────────────────────────────────────────────────
  grid: {
    paddingHorizontal: Spacing.lg,
    gap: Spacing.sm,
    marginTop: Spacing.sm,
  },
  card: { padding: Spacing.md },

  cardHeader: {
    flexDirection: 'row', alignItems: 'center',
    gap: Spacing.sm, marginBottom: Spacing.sm,
  },
  levelBadge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: Radius.sm },
  levelText:  { fontSize: 10, fontWeight: '800' },
  lessonNumber: {
    fontSize: 10, color: Colors.inkMute, fontWeight: '600', flex: 1,
  },

  statusDot: {
    width: 20, height: 20, borderRadius: 10,
    alignItems: 'center', justifyContent: 'center',
  },
  statusDotText: { fontSize: 10, fontWeight: '800', color: Colors.paper },

  topicTitle: {
    fontSize: FontSize.md, fontWeight: '700', color: Colors.ink, marginBottom: 4,
  },
  topicDesc: {
    fontSize: FontSize.sm, color: Colors.inkMute, lineHeight: 18, marginBottom: Spacing.md,
  },
  cardFooter: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
  },
  tagsContainer: { flexDirection: 'row', gap: 6 },
  tag: {
    backgroundColor: Colors.line, paddingHorizontal: 6,
    paddingVertical: 2, borderRadius: 4,
  },
  tagText: { fontSize: 9, color: Colors.inkMute, fontWeight: '600' },

  // ── Horizontal scrolls ────────────────────────────────────────────────────
  horizontalScroll: {
    paddingLeft: Spacing.lg, paddingRight: Spacing.md, paddingBottom: Spacing.sm,
  },
  horizontalCard:     { width: 280, marginRight: Spacing.md },
  horizontalBookCard: { width: 220, marginRight: Spacing.md },

  // ── Book card ─────────────────────────────────────────────────────────────
  bookCardContainer: { flex: 1 },
  bookCard: {
    padding: Spacing.sm, flexDirection: 'row',
    gap: Spacing.md, height: 100, alignItems: 'center',
  },
  bookArt: {
    width: 60, height: 80, borderRadius: Radius.sm,
    alignItems: 'center', justifyContent: 'center',
  },
  bookInfo:  { flex: 1, justifyContent: 'center' },
  bookTitle: { fontSize: FontSize.sm, fontWeight: '700', color: Colors.ink, marginBottom: 2 },
  bookWhy:   { fontSize: 11, color: Colors.inkMute, lineHeight: 14 },
});
