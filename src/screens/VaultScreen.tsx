import React, { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet, TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Colors, Radius, Spacing } from '../theme';
import { PgChip, PgStrength, Icons } from '../components';
import { useVaultStore } from '../store';
import { VaultItem, COMMUNICATIVE_FUNCTIONS } from '../data/seed';
import { RootStackParamList } from '../navigation';

const FILTERS = [
  { id: 'all',        lbl: 'Todos' },
  { id: 'due',        lbl: 'Para hoje' },
  { id: 'chunk',      lbl: 'Chunks' },
  { id: 'reduction',  lbl: 'Reductions' },
  { id: 'collocation',lbl: 'Collocations' },
  { id: 'phonetic',   lbl: 'Fonética' },
];

function typeColor(type: VaultItem['type']) {
  switch (type) {
    case 'reduction':   return { c: Colors.ocean,   soft: Colors.oceanSoft };
    case 'collocation': return { c: Colors.gold,    soft: Colors.goldSoft };
    case 'phonetic':    return { c: Colors.coral,   soft: Colors.coralSoft };
    case 'idiom':       return { c: Colors.amber,   soft: Colors.amberSoft };
    case 'gap-filler':  return { c: Colors.inkMute, soft: Colors.line };
    case 'chunk':       return { c: Colors.purple,  soft: Colors.purpleSoft };
    default:            return { c: Colors.moss,    soft: Colors.mossSoft };
  }
}

function fnMeta(id: string) {
  return COMMUNICATIVE_FUNCTIONS.find((f) => f.id === id);
}

export default function VaultScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { items } = useVaultStore();
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');

  let filtered = items;
  if (filter === 'due') filtered = filtered.filter((v) => v.srs === 'due' || v.srs === 'new');
  else if (filter === 'chunk') filtered = filtered.filter((v) =>
    ['chunk', 'phrase', 'idiom', 'gap-filler', 'collocation'].includes(v.type)
  );
  else if (filter !== 'all') filtered = filtered.filter((v) => v.type === filter);
  if (search) filtered = filtered.filter((v) =>
    v.term.toLowerCase().includes(search.toLowerCase()) ||
    v.gloss.toLowerCase().includes(search.toLowerCase())
  );

  const dueCount = items.filter((v) => v.srs === 'due' || v.srs === 'new').length;

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <View style={{ flex: 1 }}>
          <Text style={styles.headerSub}>SEU BANCO PESSOAL</Text>
          <Text style={styles.headerTitle}>Vault</Text>
        </View>
        <TouchableOpacity style={styles.filterBtn} activeOpacity={0.7}>
          <Icons.Filter size={18} color={Colors.ink} />
        </TouchableOpacity>
      </View>

      {/* Search */}
      <View style={styles.searchWrap}>
        <Icons.Search size={18} color={Colors.inkMute} />
        <TextInput
          value={search}
          onChangeText={setSearch}
          placeholder="Buscar palavra, frase, tag…"
          placeholderTextColor={Colors.inkMute}
          style={styles.searchInput}
        />
      </View>

      {/* Stats */}
      <View style={styles.statsRow}>
        <View style={[styles.stat, { flex: 1.3 }]}>
          <Text style={styles.statLabel}>TOTAL</Text>
          <Text style={styles.statValue}>{items.length.toLocaleString()}</Text>
        </View>
        <View style={[styles.stat, { backgroundColor: Colors.coralSoft }]}>
          <Text style={[styles.statLabel, { color: Colors.coral }]}>PARA HOJE</Text>
          <Text style={[styles.statValue, { color: Colors.coral }]}>{dueCount}</Text>
        </View>
        <View style={[styles.stat, { backgroundColor: Colors.mossSoft }]}>
          <Text style={[styles.statLabel, { color: Colors.moss }]}>MADUROS</Text>
          <Text style={[styles.statValue, { color: Colors.moss }]}>
            {items.filter((v) => v.srs === 'mature').length}
          </Text>
        </View>
      </View>

      {/* Filter pills */}
      <ScrollView
        horizontal showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: Spacing.lg, gap: 6, paddingBottom: 12 }}
      >
        {FILTERS.map((f) => {
          const count = f.id === 'all' ? items.length :
            f.id === 'due' ? dueCount :
            items.filter((v) => v.type === f.id).length;
          const active = filter === f.id;
          return (
            <TouchableOpacity
              key={f.id}
              onPress={() => setFilter(f.id)}
              style={[styles.pill, active && styles.pillActive]}
              activeOpacity={0.8}
            >
              <Text style={[styles.pillText, active && { color: Colors.sand }]}>{f.lbl}</Text>
              <Text style={[styles.pillCount, active && { color: Colors.sand }]}>{count}</Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Items */}
      <ScrollView contentContainerStyle={{ paddingHorizontal: Spacing.lg, paddingBottom: 32 }}>
        {filtered.length === 0 && (
          <View style={{ alignItems: 'center', paddingTop: 48, paddingHorizontal: 24 }}>
            <Text style={{ fontSize: 36, marginBottom: 12 }}>📚</Text>
            <Text style={{ fontSize: 17, fontWeight: '700', color: Colors.ink, textAlign: 'center' }}>
              {items.length === 0 ? 'Seu Vault está vazio' : 'Nenhum resultado'}
            </Text>
            <Text style={{ fontSize: 13, color: Colors.inkMute, textAlign: 'center', marginTop: 6, lineHeight: 19 }}>
              {items.length === 0
                ? 'Capture palavras e frases em inglês enquanto estuda ou consome conteúdo.'
                : 'Tente outro filtro ou busca.'}
            </Text>
          </View>
        )}
        {filtered.map((v) => {
          const { c, soft } = typeColor(v.type);
          const srsColor = v.srs === 'due' ? Colors.coral : v.srs === 'mature' ? Colors.moss : Colors.ocean;
          const fn = v.function ? fnMeta(v.function) : null;
          return (
            <View key={v.id} style={styles.item}>
              <View style={styles.itemTop}>
                <View style={{ flex: 1 }}>
                  <View style={styles.itemTermRow}>
                    <Text style={styles.itemTerm}>{v.term}</Text>
                    <PgChip c={c} soft={soft}>{v.type}</PgChip>
                    {fn && (
                      <View style={styles.fnBadge}>
                        <Text style={styles.fnBadgeText}>{fn.emoji} {fn.lbl}</Text>
                      </View>
                    )}
                  </View>
                  <Text style={styles.itemGloss}>{v.gloss}</Text>
                  {v.example ? (
                    <Text style={styles.itemExample}>"{v.example}"</Text>
                  ) : null}
                </View>
              </View>
              <View style={styles.itemFooter}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                  <Icons.Bookmark size={11} color={Colors.inkMute} />
                  <Text style={styles.itemSource}>{v.source} · {v.date}</Text>
                </View>
                <PgStrength value={v.strength} c={srsColor} />
              </View>
            </View>
          );
        })}
      </ScrollView>

      {/* FAB */}
      <TouchableOpacity
        onPress={() => navigation.navigate('Capture')}
        style={styles.fab}
        activeOpacity={0.85}
      >
        <Icons.Plus size={24} color={Colors.sand} />
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.sand },
  header: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: Spacing.lg, paddingTop: 14, paddingBottom: Spacing.md,
  },
  headerSub: { fontSize: 10, fontWeight: '700', letterSpacing: 1, color: Colors.inkMute, textTransform: 'uppercase', marginBottom: 3 },
  headerTitle: { fontSize: 22, fontWeight: '700', color: Colors.ink, letterSpacing: -0.4 },
  filterBtn: {
    width: 38, height: 38, borderRadius: Radius.full,
    backgroundColor: Colors.paper, borderWidth: 0.5, borderColor: Colors.line,
    alignItems: 'center', justifyContent: 'center',
  },
  searchWrap: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    marginHorizontal: Spacing.lg, marginBottom: 12,
    backgroundColor: Colors.paper, borderWidth: 0.5, borderColor: Colors.line,
    borderRadius: Radius.full, paddingHorizontal: 12, height: 40,
  },
  searchInput: { flex: 1, fontSize: 14, color: Colors.ink },
  statsRow: { flexDirection: 'row', gap: 8, paddingHorizontal: Spacing.lg, marginBottom: 14 },
  stat: {
    flex: 1, backgroundColor: Colors.paper, borderRadius: 12,
    borderWidth: 0.5, borderColor: Colors.line,
    padding: 10,
  },
  statLabel: { fontSize: 10, fontWeight: '700', letterSpacing: 0.6, color: Colors.inkMute, textTransform: 'uppercase' },
  statValue: { fontSize: 22, fontWeight: '600', color: Colors.ink, fontFamily: undefined },
  pill: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: 10, paddingVertical: 5,
    borderRadius: Radius.full,
    borderWidth: 1, borderColor: Colors.lineStrong,
  },
  pillActive: { backgroundColor: Colors.ink, borderColor: Colors.ink },
  pillText: { fontSize: 12, fontWeight: '600', color: Colors.inkSoft },
  pillCount: { fontSize: 11, opacity: 0.65, color: Colors.inkSoft },
  item: {
    backgroundColor: Colors.paper, borderWidth: 0.5, borderColor: Colors.line,
    borderRadius: 14, padding: 14, marginBottom: 8,
  },
  itemTop: { marginBottom: 8 },
  itemTermRow: { flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 4 },
  itemTerm: { fontSize: 19, fontWeight: '600', letterSpacing: -0.3, lineHeight: 24, color: Colors.ink },
  itemGloss: { fontSize: 12.5, color: Colors.inkSoft, lineHeight: 18 },
  itemExample: { fontSize: 12, fontStyle: 'italic', color: Colors.inkMute, marginTop: 5, lineHeight: 18 },
  itemFooter: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  itemSource: { fontSize: 11, color: Colors.inkMute },
  fnBadge: {
    backgroundColor: Colors.purpleSoft, borderRadius: Radius.full,
    paddingHorizontal: 7, paddingVertical: 2,
  },
  fnBadgeText: { fontSize: 9.5, fontWeight: '600', color: Colors.purple },
  fab: {
    position: 'absolute', bottom: 30, right: 22,
    width: 56, height: 56, borderRadius: 28,
    backgroundColor: Colors.moss,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: Colors.moss, shadowOpacity: 0.35, shadowRadius: 12, shadowOffset: { width: 0, height: 4 },
    elevation: 8,
  },
});
