import React, { useMemo } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Colors, Radius, Spacing } from '../theme';
import { PgCard, PgRing, PgStrength, Icons } from '../components';
import { useVaultStore, useProfileStore } from '../store';
import { CONTENT, ZIPF_TOP_500, NEWS_ARTICLES } from '../data/seed';
import { RootStackParamList } from '../navigation';

const DAY_NAMES = ['DOM', 'SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SÁB'];
const MONTH_NAMES = ['JAN', 'FEV', 'MAR', 'ABR', 'MAI', 'JUN', 'JUL', 'AGO', 'SET', 'OUT', 'NOV', 'DEZ'];

function typeColor(type: string) {
  switch (type) {
    case 'reduction':   return { bg: Colors.oceanSoft, c: Colors.ocean,   char: 'R' };
    case 'collocation': return { bg: Colors.goldSoft,  c: Colors.gold,    char: 'C' };
    case 'phonetic':    return { bg: Colors.coralSoft, c: Colors.coral,   char: 'ə' };
    case 'idiom':       return { bg: Colors.goldSoft,  c: '#A86B3C',      char: 'I' };
    case 'gap-filler':  return { bg: Colors.line,      c: Colors.inkMute, char: '…' };
    case 'chunk':       return { bg: '#E8DFF8',        c: '#7C5CBF',      char: '⇅' };
    default:            return { bg: Colors.mossSoft,  c: Colors.moss,    char: 'V' };
  }
}

export default function HomeScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const items = useVaultStore((s) => s.items);
  const { name, streak, dailyGoal, todayReviewed } = useProfileStore();

  const missionPct = Math.min(1, dailyGoal > 0 ? todayReviewed / dailyGoal : 0);
  const missionDone = todayReviewed >= dailyGoal;

  const inVault = (word: string) =>
    items.some((v) => v.term.toLowerCase() === word.toLowerCase());

  // Suggestions for Triagem (Top 100 + News L1)
  const triagemSuggestions = useMemo(() => {
    const zipf = ZIPF_TOP_500.filter((z) => z.rank <= 100 && !inVault(z.word))
      .map(z => ({ term: z.word, type: z.type, gloss: z.gloss, example: z.example, source: `Zipf #${z.rank}` }));
    const news = NEWS_ARTICLES.filter((a) => a.level === 1)
      .flatMap(a => a.vocabulary.filter(v => !inVault(v.term)));
    return [...zipf, ...news];
  }, [items]);

  // Dynamic Coverage
  const zipfCovCount = ZIPF_TOP_500.filter((z) => inVault(z.word)).length;
  const zipfCoverage = ZIPF_TOP_500.length > 0
    ? Math.round((zipfCovCount / ZIPF_TOP_500.length) * 100)
    : 0;

  const now = new Date();
  const greetDate = `${DAY_NAMES[now.getDay()]} · ${now.getDate()} ${MONTH_NAMES[now.getMonth()]}`;

  const reviewableCount = items.filter((v) => v.srs !== 'mature' && v.gloss.trim()).length;
  const displayName = name || 'Você';

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 32 }}>
        {/* Greeting */}
        <View style={styles.greeting}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{displayName[0].toUpperCase()}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.greetDate}>{greetDate.toUpperCase()}</Text>
            <Text style={styles.greetName}>Bom dia, {displayName}</Text>
          </View>
          <TouchableOpacity
            onPress={() => navigation.navigate('Profile')}
            style={styles.streakBadge}
            activeOpacity={0.8}
          >
            <Icons.Flame size={15} color={Colors.coral} />
            <Text style={styles.streakText}>{streak}</Text>
          </TouchableOpacity>
        </View>

        {/* Hero Focus Card */}
        <View style={{ paddingHorizontal: Spacing.lg, paddingTop: 8 }}>
          {items.length === 0 ? (
            <View style={styles.emptyHero}>
              <Text style={styles.emptyHeroTitle}>Comece capturando palavras</Text>
              <Text style={styles.emptyHeroSub}>
                Toque no + para adicionar sua primeira entrada no Vault. Suas revisões aparecerão aqui.
              </Text>
              <TouchableOpacity
                onPress={() => navigation.navigate('Capture')}
                style={styles.emptyHeroCta}
                activeOpacity={0.85}
              >
                <Icons.Plus size={16} color={Colors.sand} />
                <Text style={styles.emptyHeroCtaText}>Capturar primeira palavra</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.heroCard}>
              <Text style={styles.heroEyebrow}>SEU PROGRESSO</Text>
              <Text style={styles.heroTitle}>{items.length} {items.length === 1 ? 'palavra capturada' : 'palavras capturadas'}</Text>
              <Text style={styles.heroMeta}>
                {items.filter(v => v.srs === 'mature').length} maduras · {reviewableCount} para revisar
              </Text>

              <View style={styles.stepRow}>
                {['new', 'learning', 'due', 'mature'].map((status) => {
                  const count = items.filter(v => v.srs === status).length;
                  const pct = items.length > 0 ? count / items.length : 0;
                  return (
                    <View key={status} style={styles.stepTrack}>
                      <View style={[styles.stepFill, { flex: pct }]} />
                    </View>
                  );
                })}
              </View>

              <View style={styles.heroFooter}>
                <Text style={styles.heroSteps}>Cobertura Zipf {zipfCoverage}%</Text>
                <TouchableOpacity
                  onPress={() => navigation.navigate('SRS')}
                  style={styles.heroCta}
                  activeOpacity={0.85}
                >
                  <Text style={styles.heroCtaText}>Revisar →</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>

        {/* Daily Mission */}
        <View style={{ paddingHorizontal: Spacing.lg, marginTop: 12 }}>
          <View style={{
            backgroundColor: Colors.paper, borderRadius: Radius.md,
            borderWidth: 0.5, borderColor: missionDone ? Colors.moss : Colors.line,
            padding: 14,
          }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
              <View>
                <Text style={{ fontSize: 13, fontWeight: '700', color: Colors.ink }}>
                  {missionDone ? '✓ Meta do dia concluída!' : 'Meta do dia'}
                </Text>
                <Text style={{ fontSize: 11, color: Colors.inkMute, marginTop: 1 }}>
                  {todayReviewed} / {dailyGoal} cards revisados
                </Text>
              </View>
              <Text style={{ fontSize: 22, fontWeight: '700', color: missionDone ? Colors.moss : Colors.ink }}>
                {Math.round(missionPct * 100)}%
              </Text>
            </View>
            <View style={{ height: 6, backgroundColor: Colors.line, borderRadius: 3 }}>
              <View style={{
                height: 6, borderRadius: 3,
                backgroundColor: missionDone ? Colors.moss : Colors.ocean,
                width: `${missionPct * 100}%` as any,
              }} />
            </View>
          </View>
        </View>

        {/* Quick actions */}
        <View style={styles.quickRow}>
          <TouchableOpacity
            onPress={() => navigation.navigate('SRS')}
            style={[styles.quickCard, { flex: 1 }]}
            activeOpacity={0.8}
          >
            <View style={styles.quickCardHeader}>
              <View style={[styles.iconBox, { backgroundColor: Colors.coralSoft }]}>
                <Icons.Stack size={18} color={Colors.coral} />
              </View>
              {reviewableCount > 0 && (
                <View style={[styles.badge, { backgroundColor: Colors.coral }]}>
                  <Text style={styles.badgeText}>{reviewableCount}</Text>
                </View>
              )}
            </View>
            <Text style={styles.quickLabel}>Revisão SRS</Text>
            <Text style={styles.quickSub}>
              {reviewableCount > 0 ? `${reviewableCount} cards prontos` : 'Tudo em dia'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => navigation.navigate('Pronunciation')}
            style={[styles.quickCard, { flex: 1 }]}
            activeOpacity={0.8}
          >
            <View style={styles.quickCardHeader}>
              <View style={[styles.iconBox, { backgroundColor: Colors.oceanSoft }]}>
                <Icons.Wave size={18} color={Colors.ocean} />
              </View>
              <View style={styles.newBadge}>
                <Text style={styles.newBadgeText}>Novo</Text>
              </View>
            </View>
            <Text style={styles.quickLabel}>Connected Speech</Text>
            <Text style={styles.quickSub}>Schwa · reduções · linking · elisão</Text>
          </TouchableOpacity>
        </View>

        {/* Pending Triagem */}
        {triagemSuggestions.length > 0 && (
          <View style={{ paddingHorizontal: Spacing.lg, marginTop: 20 }}>
            <TouchableOpacity
              onPress={() => navigation.navigate('Triagem', {
                suggestions: triagemSuggestions,
                title: 'Triagem Diária',
                subtitle: `${triagemSuggestions.length} palavras sugeridas`,
              })}
              style={{
                backgroundColor: Colors.paper, borderRadius: Radius.md,
                borderWidth: 1, borderColor: Colors.moss,
                padding: 14, flexDirection: 'row', alignItems: 'center', gap: 12
              }}
              activeOpacity={0.8}
            >
              <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: Colors.mossSoft, alignItems: 'center', justifyContent: 'center' }}>
                <Icons.Vault size={20} color={Colors.moss} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 13, fontWeight: '700', color: Colors.ink }}>Triagem pendente</Text>
                <Text style={{ fontSize: 11, color: Colors.inkMute, marginTop: 1 }}>
                  {triagemSuggestions.length} palavras frequentes prontas para o seu Vault.
                </Text>
              </View>
              <Icons.Next size={16} color={Colors.moss} />
            </TouchableOpacity>
          </View>
        )}

        {/* Content row */}
        <View style={{ paddingHorizontal: Spacing.lg, marginTop: 20 }}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Continue ouvindo</Text>
            <TouchableOpacity activeOpacity={0.7} onPress={() => navigation.navigate('Discover')}>
              <Text style={styles.sectionAction}>Tudo →</Text>
            </TouchableOpacity>
          </View>
        </View>
        <ScrollView
          horizontal showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingLeft: Spacing.lg, paddingRight: 8, gap: 10, paddingTop: 8 }}
        >
          {CONTENT.slice(0, 3).map((c) => (
            <TouchableOpacity
              key={c.id}
              style={styles.contentCard}
              onPress={() => navigation.navigate('ContentDetail', { contentId: c.id })}
              activeOpacity={0.8}
            >
              <View style={[styles.contentArt, { backgroundColor: c.art }]}>
                {c.kind === 'podcast' && <Icons.Headphones size={28} color="#FBF6EB" />}
                {c.kind === 'book' && <Icons.Book size={28} color="#FBF6EB" />}
                {c.kind === 'video' && <Icons.Video size={28} color="#FBF6EB" />}
                {c.kind === 'article' && <Icons.Article size={28} color="#FBF6EB" />}
              </View>
              <Text style={styles.contentKind}>
                {c.kind} · {typeof c.minutes === 'number' ? `${c.minutes}m` : c.minutes}
              </Text>
              <Text style={styles.contentTitle} numberOfLines={2}>{c.title}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Zipf insight */}
        <View style={{ paddingHorizontal: Spacing.lg, marginTop: 20 }}>
          <PgCard p={16}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
              <PgRing pct={zipfCoverage} size={64} stroke={6} c={Colors.moss}>
                <Text style={{ fontSize: 13, fontWeight: '700', color: Colors.moss }}>
                  {zipfCoverage}%
                </Text>
              </PgRing>
              <View style={{ flex: 1 }}>
                <Text style={styles.zipfLabel}>COBERTURA ZIPF</Text>
                <Text style={styles.zipfText}>
                  {zipfCovCount} das 500 palavras mais frequentes
                </Text>
                <TouchableOpacity onPress={() => navigation.navigate('Zipf')} activeOpacity={0.7}>
                  <Text style={styles.zipfCta}>Ver mapa →</Text>
                </TouchableOpacity>
              </View>
            </View>
          </PgCard>
        </View>

        {/* Recent captures */}
        {items.length > 0 && (
          <View style={{ paddingHorizontal: Spacing.lg, marginTop: 20 }}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Capturado recentemente</Text>
              <TouchableOpacity activeOpacity={0.7} onPress={() => navigation.navigate('Vault')}>
                <Text style={styles.sectionAction}>Vault →</Text>
              </TouchableOpacity>
            </View>
            <View style={{ marginTop: 8 }}>
              {items.slice(0, 3).map((v) => {
                const { bg, c, char } = typeColor(v.type);
                const srsColor = v.srs === 'due' ? Colors.coral : v.srs === 'mature' ? Colors.moss : Colors.ocean;
                return (
                  <View key={v.id} style={styles.captureRow}>
                    <View style={[styles.typeBox, { backgroundColor: bg }]}>
                      <Text style={[styles.typeChar, { color: c }]}>{char}</Text>
                    </View>
                    <View style={{ flex: 1, minWidth: 0 }}>
                      <Text style={styles.captureTerm}>{v.term}</Text>
                      <Text style={styles.captureGloss} numberOfLines={1}>{v.gloss}</Text>
                    </View>
                    <PgStrength value={v.strength} c={srsColor} />
                  </View>
                );
              })}
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.sand },
  greeting: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    paddingHorizontal: Spacing.lg, paddingTop: 14, paddingBottom: 8,
  },
  avatar: {
    width: 38, height: 38, borderRadius: 19, backgroundColor: Colors.moss,
    alignItems: 'center', justifyContent: 'center',
  },
  avatarText: { color: Colors.sand, fontWeight: '700', fontSize: 16 },
  greetDate: { fontSize: 11, color: Colors.inkMute, fontWeight: '600', letterSpacing: 0.5 },
  greetName: { fontSize: 14, fontWeight: '600', marginTop: 1, color: Colors.ink },
  streakBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: 11, paddingVertical: 6,
    borderRadius: Radius.full, backgroundColor: Colors.coralSoft,
  },
  streakText: { fontWeight: '700', fontSize: 13, color: Colors.coral },
  emptyHero: {
    backgroundColor: Colors.moss, borderRadius: Radius.lg, padding: 22,
  },
  emptyHeroTitle: { fontSize: 20, fontWeight: '600', color: Colors.sand, letterSpacing: -0.4, lineHeight: 26 },
  emptyHeroSub: { fontSize: 13, color: Colors.sand, opacity: 0.78, marginTop: 8, lineHeight: 19 },
  emptyHeroCta: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    marginTop: 16, backgroundColor: Colors.sand,
    paddingHorizontal: 16, paddingVertical: 10, borderRadius: Radius.full,
    alignSelf: 'flex-start',
  },
  emptyHeroCtaText: { fontWeight: '700', fontSize: 13, color: Colors.mossDeep },
  heroCard: {
    backgroundColor: Colors.moss, borderRadius: Radius.lg,
    padding: 20, overflow: 'hidden',
  },
  heroEyebrow: { fontSize: 11, fontWeight: '700', letterSpacing: 1.5, color: Colors.sand, opacity: 0.7 },
  heroTitle: { fontSize: 22, fontWeight: '600', color: Colors.sand, marginTop: 6, lineHeight: 28, letterSpacing: -0.4 },
  heroMeta: { fontSize: 13, color: Colors.sand, opacity: 0.78, marginTop: 4, lineHeight: 19 },
  stepRow: { flexDirection: 'row', gap: 4, marginTop: 16, height: 4 },
  stepTrack: { flex: 1, height: 4, borderRadius: 2, backgroundColor: 'rgba(244,234,213,0.18)', overflow: 'hidden' },
  stepFill: { height: 4, backgroundColor: Colors.sand },
  heroFooter: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 14 },
  heroSteps: { fontSize: 12, color: Colors.sand, opacity: 0.78 },
  heroCta: {
    backgroundColor: Colors.sand, borderRadius: Radius.full,
    paddingHorizontal: 18, paddingVertical: 10,
  },
  heroCtaText: { fontWeight: '700', fontSize: 13, color: Colors.mossDeep },
  quickRow: { flexDirection: 'row', gap: 10, paddingHorizontal: Spacing.lg, marginTop: 14 },
  quickCard: {
    backgroundColor: Colors.paper, borderWidth: 0.5, borderColor: Colors.line,
    borderRadius: Radius.md, padding: 14,
  },
  quickCardHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  iconBox: { width: 32, height: 32, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  badge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: Radius.full },
  badgeText: { fontSize: 11, fontWeight: '700', color: Colors.white },
  monoLabel: { fontSize: 13, color: Colors.inkMute, fontFamily: 'monospace' },
  newBadge: {
    backgroundColor: '#E8DFF8', borderRadius: Radius.full,
    paddingHorizontal: 7, paddingVertical: 2,
  },
  newBadgeText: { fontSize: 9.5, fontWeight: '700', color: '#7C5CBF', letterSpacing: 0.4 },
  quickLabel: { fontSize: 14, fontWeight: '700', marginTop: 14, color: Colors.ink },
  quickSub: { fontSize: 11.5, color: Colors.inkMute, marginTop: 1 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  sectionTitle: { fontSize: 12, fontWeight: '700', letterSpacing: 0.8, textTransform: 'uppercase', color: Colors.inkSoft },
  sectionAction: { fontSize: 12, fontWeight: '600', color: Colors.inkMute },
  contentCard: {
    width: 168, backgroundColor: Colors.paper, borderWidth: 0.5,
    borderColor: Colors.line, borderRadius: Radius.md, padding: 12,
  },
  contentArt: {
    width: '100%', height: 100, borderRadius: 8,
    alignItems: 'center', justifyContent: 'center', marginBottom: 9,
  },
  contentKind: { fontSize: 11, color: Colors.inkMute, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.6 },
  contentTitle: { fontSize: 13, fontWeight: '600', marginTop: 3, lineHeight: 17, color: Colors.ink },
  zipfLabel: { fontSize: 11, color: Colors.inkMute, fontWeight: '700', letterSpacing: 0.6, textTransform: 'uppercase' },
  zipfText: { fontSize: 14, fontWeight: '600', marginTop: 3, lineHeight: 19, color: Colors.ink },
  zipfCta: { marginTop: 8, color: Colors.moss, fontSize: 12, fontWeight: '700' },
  captureRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12, borderBottomWidth: 0.5, borderBottomColor: Colors.line },
  typeBox: { width: 36, height: 36, borderRadius: 9, alignItems: 'center', justifyContent: 'center' },
  typeChar: { fontWeight: '700', fontSize: 13 },
  captureTerm: { fontSize: 14, fontWeight: '600', lineHeight: 18, color: Colors.ink },
  captureGloss: { fontSize: 11.5, color: Colors.inkMute, marginTop: 2 },
});