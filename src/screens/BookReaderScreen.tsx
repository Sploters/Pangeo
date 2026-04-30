import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRoute, RouteProp, useNavigation } from '@react-navigation/native';
import { Colors, Spacing, Radius, FontSize } from '../theme';
import { Icons } from '../components';
import { CONTENT } from '../data/seed';
import { RootStackParamList } from '../navigation';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const LEVEL_COLORS: Record<string, { c: string; soft: string }> = {
  A1:    { c: Colors.moss,  soft: Colors.mossSoft },
  A2:    { c: Colors.moss,  soft: Colors.mossSoft },
  'A2/B1': { c: Colors.ocean, soft: Colors.oceanSoft },
  B1:    { c: Colors.ocean, soft: Colors.oceanSoft },
  B2:    { c: Colors.amber, soft: Colors.amberSoft },
};

export default function BookReaderScreen() {
  const route = useRoute<RouteProp<RootStackParamList, 'BookReader'>>();
  const navigation = useNavigation<any>();
  const { bookId } = route.params;
  const book = CONTENT.find(b => b.id === bookId);

  const [currentChapter, setCurrentChapter] = useState(0);
  const [showContents, setShowContents] = useState(false);
  const scrollRef = useRef<ScrollView>(null);

  if (!book) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Book content not available.</Text>
        </View>
      </SafeAreaView>
    );
  }

  const chapters = book.chapters ?? [];
  const hasChapters = chapters.length > 0;
  const levelBase = book.level.split('/')[0];
  const { c, soft } = LEVEL_COLORS[book.level] ?? LEVEL_COLORS[levelBase] ?? LEVEL_COLORS.B1;
  const chapter = chapters[currentChapter];

  const goTo = (idx: number) => {
    setCurrentChapter(idx);
    setShowContents(false);
    scrollRef.current?.scrollTo({ y: 0, animated: true });
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: Colors.paper }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconBtn}>
          <Icons.Back size={20} color={Colors.ink} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle} numberOfLines={1}>{book.title}</Text>
          <Text style={styles.headerAuthor} numberOfLines={1}>{book.author}</Text>
        </View>
        <TouchableOpacity
          onPress={() => setShowContents(v => !v)}
          style={styles.iconBtn}
        >
          <Icons.Book size={20} color={showContents ? c : Colors.ink} />
        </TouchableOpacity>
      </View>

      {/* Table of contents overlay */}
      {showContents && hasChapters && (
        <View style={styles.contentsOverlay}>
          <Text style={styles.contentsTitle}>Contents</Text>
          {chapters.map((ch, i) => (
            <TouchableOpacity
              key={i}
              style={[styles.contentsItem, i === currentChapter && { backgroundColor: soft }]}
              onPress={() => goTo(i)}
              activeOpacity={0.7}
            >
              <Text style={[styles.contentsItemNum, { color: c }]}>{i + 1}</Text>
              <Text
                style={[styles.contentsItemTitle, i === currentChapter && { color: c, fontWeight: '700' }]}
                numberOfLines={2}
              >
                {ch.title}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {hasChapters ? (
        <>
          {/* Cover bar */}
          <View style={[styles.coverBar, { backgroundColor: book.art }]}>
            <View style={[styles.levelPill, { backgroundColor: 'rgba(255,255,255,0.25)' }]}>
              <Text style={styles.levelPillText}>{book.level}</Text>
            </View>
            <Text style={styles.coverTitle}>{book.title}</Text>
            <Text style={styles.coverAuthor}>{book.author}</Text>
          </View>

          {/* Chapter content */}
          <ScrollView
            ref={scrollRef}
            contentContainerStyle={styles.readingContent}
            showsVerticalScrollIndicator={false}
          >
            {/* Chapter header */}
            <Text style={[styles.chapterTitle, { color: c }]}>{chapter.title}</Text>

            {/* Body paragraphs */}
            {chapter.body.split('\n\n').map((para, i) => (
              <Text key={i} style={styles.bodyParagraph}>{para}</Text>
            ))}

            {/* Inline dialogue detection — lines starting with " are formatted distinctly */}

            {/* Bottom nav */}
            <View style={styles.chapterNav}>
              <TouchableOpacity
                style={[styles.navChBtn, { opacity: currentChapter === 0 ? 0.3 : 1 }]}
                onPress={() => currentChapter > 0 && goTo(currentChapter - 1)}
                disabled={currentChapter === 0}
                activeOpacity={0.7}
              >
                <Icons.Back size={16} color={Colors.ink} />
                <Text style={styles.navChBtnText}>Previous</Text>
              </TouchableOpacity>

              <Text style={styles.chapterProgress}>
                {currentChapter + 1} / {chapters.length}
              </Text>

              <TouchableOpacity
                style={[styles.navChBtn, styles.navChBtnRight, { opacity: currentChapter === chapters.length - 1 ? 0.3 : 1 }]}
                onPress={() => currentChapter < chapters.length - 1 && goTo(currentChapter + 1)}
                disabled={currentChapter === chapters.length - 1}
                activeOpacity={0.7}
              >
                <Text style={styles.navChBtnText}>Next</Text>
                <Icons.Next size={16} color={Colors.ink} />
              </TouchableOpacity>
            </View>
          </ScrollView>

          {/* Progress bar */}
          <View style={styles.progressBarContainer}>
            <View style={[styles.progressBar, { backgroundColor: c, width: `${((currentChapter + 1) / chapters.length) * 100}%` as any }]} />
          </View>
        </>
      ) : (
        <View style={styles.emptyContainer}>
          <Icons.Book size={48} color={Colors.inkMute} />
          <Text style={styles.emptyTitle}>Content coming soon</Text>
          <Text style={styles.emptyBody}>
            {book.why}
          </Text>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  errorContainer: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  errorText: { color: Colors.inkMute, fontSize: FontSize.md },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderBottomWidth: 0.5,
    borderBottomColor: Colors.line,
    backgroundColor: Colors.paper,
  },
  iconBtn: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: Radius.full,
  },
  headerCenter: { flex: 1, alignItems: 'center', paddingHorizontal: Spacing.sm },
  headerTitle: { fontSize: FontSize.sm, fontWeight: '700', color: Colors.ink },
  headerAuthor: { fontSize: 11, color: Colors.inkMute, marginTop: 1 },

  contentsOverlay: {
    position: 'absolute',
    top: 60,
    right: Spacing.md,
    left: Spacing.md,
    zIndex: 100,
    backgroundColor: Colors.paper,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 4 },
    elevation: 10,
  },
  contentsTitle: {
    fontSize: FontSize.md,
    fontWeight: '800',
    color: Colors.ink,
    marginBottom: Spacing.md,
  },
  contentsItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.md,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.sm,
    borderRadius: Radius.sm,
    marginBottom: 2,
  },
  contentsItemNum: {
    fontSize: 11,
    fontWeight: '800',
    width: 18,
    marginTop: 2,
  },
  contentsItemTitle: {
    flex: 1,
    fontSize: FontSize.sm,
    color: Colors.ink,
    fontWeight: '500',
    lineHeight: 20,
  },

  coverBar: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.lg,
    alignItems: 'center',
  },
  levelPill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: Radius.full,
    marginBottom: Spacing.sm,
  },
  levelPillText: {
    fontSize: 11,
    fontWeight: '800',
    color: Colors.paper,
  },
  coverTitle: {
    fontSize: FontSize.lg,
    fontWeight: '800',
    color: Colors.paper,
    textAlign: 'center',
  },
  coverAuthor: {
    fontSize: FontSize.sm,
    color: 'rgba(255,255,255,0.75)',
    marginTop: 2,
  },

  readingContent: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.xl,
    paddingBottom: Spacing.xxl,
  },
  chapterTitle: {
    fontSize: FontSize.lg,
    fontWeight: '800',
    marginBottom: Spacing.lg,
    lineHeight: 26,
  },
  bodyParagraph: {
    fontSize: 16,
    color: Colors.ink,
    lineHeight: 28,
    marginBottom: Spacing.lg,
    letterSpacing: 0.1,
  },

  chapterNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: Spacing.xl,
    paddingTop: Spacing.lg,
    borderTopWidth: 0.5,
    borderTopColor: Colors.line,
  },
  navChBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: Radius.sm,
    backgroundColor: Colors.sand,
  },
  navChBtnRight: {},
  navChBtnText: {
    fontSize: FontSize.sm,
    fontWeight: '600',
    color: Colors.ink,
  },
  chapterProgress: {
    fontSize: FontSize.sm,
    color: Colors.inkMute,
    fontWeight: '600',
  },

  progressBarContainer: {
    height: 3,
    backgroundColor: Colors.line,
  },
  progressBar: {
    height: 3,
    borderRadius: 1.5,
  },

  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.xl,
    gap: Spacing.md,
  },
  emptyTitle: {
    fontSize: FontSize.lg,
    fontWeight: '700',
    color: Colors.ink,
    textAlign: 'center',
  },
  emptyBody: {
    fontSize: FontSize.md,
    color: Colors.inkMute,
    textAlign: 'center',
    lineHeight: 22,
  },
});
