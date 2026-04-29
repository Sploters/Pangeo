import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Linking,
  SafeAreaView,
} from 'react-native';
import { Colors, Spacing, Radius, FontSize } from '../theme';
import { Icons, PgCard, PgHeader, PgChip } from '../components';
import { GRAMMAR_TOPICS, GrammarTopic, GrammarLevel } from '../data/seed';
import { useVaultStore } from '../store';

const LEVEL_COLORS: Record<GrammarLevel, { c: string; soft: string }> = {
  A1: { c: Colors.moss, soft: Colors.mossSoft },
  A2: { c: Colors.moss, soft: Colors.mossSoft },
  B1: { c: Colors.ocean, soft: Colors.oceanSoft },
  B2: { c: Colors.ocean, soft: Colors.oceanSoft },
  C1: { c: Colors.amber, soft: Colors.amberSoft },
  C2: { c: Colors.amber, soft: Colors.amberSoft },
};

export default function GrammarScreen() {
  const totalWords = useVaultStore((s) => s.items.length);

  // Group topics by CEFR level
  const groupedTopics = GRAMMAR_TOPICS.reduce((acc, topic) => {
    if (!acc[topic.level]) acc[topic.level] = [];
    acc[topic.level].push(topic);
    return acc;
  }, {} as Record<string, GrammarTopic[]>);

  // Get suggested topics (3 topics closest to user's totalWords)
  const suggested = [...GRAMMAR_TOPICS]
    .sort((a, b) => Math.abs(a.minWords - totalWords) - Math.abs(b.minWords - totalWords))
    .slice(0, 3);

  const openLesson = (url: string) => {
    Linking.openURL(url).catch((err) => console.error('Failed to open URL:', err));
  };

  const renderTopicCard = (topic: GrammarTopic) => {
    const { c, soft } = LEVEL_COLORS[topic.level] || LEVEL_COLORS.A1;
    const isLocked = topic.minWords > totalWords;

    return (
      <TouchableOpacity
        key={topic.id}
        onPress={() => !isLocked && openLesson(topic.url)}
        activeOpacity={0.7}
        disabled={isLocked}
        style={styles.cardContainer}
      >
        <PgCard style={[styles.card, isLocked && styles.cardLocked]}>
          <View style={styles.cardHeader}>
            <View style={[styles.levelBadge, { backgroundColor: soft }]}>
              <Text style={[styles.levelText, { color: c }]}>{topic.level}</Text>
            </View>
            <Text style={styles.lessonNumber}>Lesson {topic.lessonNumber}</Text>
            {isLocked && <Icons.Close size={14} color={Colors.inkMute} />}
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
            {isLocked ? (
              <View style={styles.lockInfo}>
                <Icons.Vault size={12} color={Colors.inkMute} />
                <Text style={styles.lockText}>{topic.minWords} words</Text>
              </View>
            ) : (
              <Icons.Next size={16} color={Colors.moss} />
            )}
          </View>
        </PgCard>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <PgHeader title="Grammar Hub" sub="Learn & Practice" />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Suggested Section */}
        {suggested.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Icons.Sparkle size={18} color={Colors.amber} />
              <Text style={styles.sectionTitle}>Suggested for You</Text>
            </View>
            <Text style={styles.sectionSub}>Based on your vocabulary of {totalWords} words</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalScroll}>
              {suggested.map(topic => (
                <View key={topic.id} style={styles.horizontalCard}>
                  {renderTopicCard(topic)}
                </View>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Level Sections */}
        {(Object.keys(groupedTopics) as GrammarLevel[]).sort().map((level) => (
          <View key={level} style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={[styles.dot, { backgroundColor: LEVEL_COLORS[level].c }]} />
              <Text style={styles.sectionTitle}>{level} Lessons</Text>
            </View>
            <View style={styles.grid}>
              {groupedTopics[level].map(renderTopicCard)}
            </View>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.sand,
  },
  scrollContent: {
    paddingBottom: Spacing.xxl,
  },
  section: {
    marginTop: Spacing.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.lg,
  },
  sectionTitle: {
    fontSize: FontSize.lg,
    fontWeight: '700',
    color: Colors.ink,
  },
  sectionSub: {
    fontSize: FontSize.xs,
    color: Colors.inkMute,
    paddingHorizontal: Spacing.lg,
    marginTop: 2,
    marginBottom: Spacing.md,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  horizontalScroll: {
    paddingLeft: Spacing.lg,
    paddingRight: Spacing.md,
    paddingBottom: Spacing.sm,
  },
  horizontalCard: {
    width: 260,
    marginRight: Spacing.md,
  },
  grid: {
    paddingHorizontal: Spacing.lg,
    gap: Spacing.md,
    marginTop: Spacing.md,
  },
  cardContainer: {
    marginBottom: Spacing.xs,
  },
  card: {
    padding: Spacing.md,
  },
  cardLocked: {
    opacity: 0.6,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  levelBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: Radius.sm,
  },
  levelText: {
    fontSize: 10,
    fontWeight: '800',
  },
  lessonNumber: {
    fontSize: 10,
    color: Colors.inkMute,
    fontWeight: '600',
    flex: 1,
  },
  topicTitle: {
    fontSize: FontSize.md,
    fontWeight: '700',
    color: Colors.ink,
    marginBottom: 4,
  },
  topicDesc: {
    fontSize: FontSize.sm,
    color: Colors.inkMute,
    lineHeight: 18,
    marginBottom: Spacing.md,
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  tagsContainer: {
    flexDirection: 'row',
    gap: 6,
  },
  tag: {
    backgroundColor: Colors.line,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  tagText: {
    fontSize: 9,
    color: Colors.inkMute,
    fontWeight: '600',
  },
  lockInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  lockText: {
    fontSize: 10,
    color: Colors.inkMute,
    fontWeight: '600',
  },
});
