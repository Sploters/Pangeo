import React, { useState, useMemo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { Colors, Radius, Spacing } from '../theme';
import { PgChip, Icons } from '../components';
import { useVaultStore } from '../store';
import { VocabSuggestion } from '../data/seed';
import { RootStackParamList } from '../navigation';

type Route = RouteProp<RootStackParamList, 'Triagem'>;

export default function TriagemScreen() {
  const navigation = useNavigation();
  const route      = useRoute<Route>();
  const { suggestions, title, subtitle } = route.params;
  const { items, addItem } = useVaultStore();

  const pending = useMemo(
    () => suggestions.filter(
      (s) => !items.some((v) => v.term.toLowerCase() === s.term.toLowerCase()),
    ),
    [],
  );

  const [index, setIndex] = useState(0);
  const [added, setAdded] = useState(0);
  const [done,  setDone]  = useState(false);

  const current = pending[index];

  const advance = () => {
    if (index + 1 >= pending.length) setDone(true);
    else setIndex((i) => i + 1);
  };

  const handleAdd = () => {
    const now = new Date();
    addItem({
      term: current.term,
      type: current.type,
      lang: 'en→pt',
      gloss: current.gloss,
      source: current.source,
      date: `${now.toLocaleDateString('pt-BR')} · ${now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`,
      example: current.example ?? '',
      srs: 'new',
      strength: 0,
      tags: [],
      function: current.function,
      level: current.level,
      stability: 0,
      difficulty: 5,
      lapses: 0,
      lastReviewAt: 0,
      nextReviewAt: 0,
    });
    setAdded((a) => a + 1);
    advance();
  };

  function typeColor(type: VocabSuggestion['type']) {
    switch (type) {
      case 'reduction':   return { c: Colors.ocean,   soft: Colors.oceanSoft };
      case 'collocation': return { c: Colors.gold,    soft: Colors.goldSoft };
      case 'phonetic':    return { c: Colors.coral,   soft: Colors.coralSoft };
      case 'chunk':       return { c: Colors.purple,  soft: Colors.purpleSoft };
      default:            return { c: Colors.moss,    soft: Colors.mossSoft };
    }
  }

  if (done || pending.length === 0) {
    return (
      <SafeAreaView style={s.safe}>
        <View style={s.done}>
          <Text style={s.doneIcon}>✓</Text>
          <Text style={s.doneTitle}>
            {added === 0
              ? 'Nenhuma palavra adicionada'
              : `${added} ${added === 1 ? 'palavra adicionada' : 'palavras adicionadas'}`}
          </Text>
          <Text style={s.doneSub}>
            {added > 0
              ? 'Elas já estão no seu Vault prontas para revisão.'
              : 'Você pulou todas as sugestões.'}
          </Text>
          <TouchableOpacity style={s.doneBtn} onPress={() => navigation.goBack()} activeOpacity={0.85}>
            <Text style={s.doneBtnText}>Voltar</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const { c, soft } = typeColor(current.type);
  const progress    = index / pending.length;

  return (
    <SafeAreaView style={s.safe}>
      <View style={s.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={s.closeBtn} activeOpacity={0.7}>
          <Icons.Close size={20} color={Colors.ink} />
        </TouchableOpacity>
        <View style={{ flex: 1, alignItems: 'center' }}>
          <Text style={s.headerTitle}>{title}</Text>
          <Text style={s.headerSub}>{subtitle}</Text>
        </View>
        <View style={s.closeBtn}>
          <Text style={s.counter}>{index + 1} / {pending.length}</Text>
        </View>
      </View>

      <View style={s.track}>
        <View style={[s.fill, { width: `${progress * 100}%` as any }]} />
      </View>

      <View style={s.cardArea}>
        <View style={s.card}>
          <PgChip c={c} soft={soft}>{current.type}</PgChip>
          <Text style={s.term}>{current.term}</Text>
          <Text style={s.gloss}>{current.gloss}</Text>
          {current.example ? <Text style={s.example}>"{current.example}"</Text> : null}
          <View style={s.badge}>
            <Icons.Bookmark size={11} color={Colors.inkMute} />
            <Text style={s.badgeText}>{current.source}</Text>
          </View>
        </View>
      </View>

      <View style={s.actions}>
        <TouchableOpacity style={s.skip} onPress={advance} activeOpacity={0.8}>
          <Text style={s.skipText}>Pular</Text>
        </TouchableOpacity>
        <TouchableOpacity style={s.add} onPress={handleAdd} activeOpacity={0.85}>
          <Text style={s.addText}>Adicionar ao Vault</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe:       { flex: 1, backgroundColor: Colors.sand },
  header:     { flexDirection: 'row', alignItems: 'center', paddingHorizontal: Spacing.lg, paddingTop: 8, paddingBottom: 8 },
  closeBtn:   { width: 48, alignItems: 'center', justifyContent: 'center' },
  headerTitle:{ fontSize: 14, fontWeight: '700', color: Colors.ink },
  headerSub:  { fontSize: 11, color: Colors.inkMute, marginTop: 2 },
  counter:    { fontSize: 12, fontWeight: '600', color: Colors.inkMute },
  track:      { height: 3, backgroundColor: Colors.line, marginHorizontal: Spacing.lg },
  fill:       { height: 3, backgroundColor: Colors.moss, borderRadius: 2 },
  cardArea:   { flex: 1, paddingHorizontal: Spacing.lg, paddingTop: 24, justifyContent: 'center' },
  card:       { backgroundColor: Colors.paper, borderRadius: Radius.lg, borderWidth: 0.5, borderColor: Colors.line, padding: 28, shadowColor: Colors.ink, shadowOpacity: 0.06, shadowRadius: 20, shadowOffset: { width: 0, height: 8 }, elevation: 3 },
  term:       { fontSize: 34, fontWeight: '600', color: Colors.ink, letterSpacing: -0.8, marginTop: 16, marginBottom: 12 },
  gloss:      { fontSize: 16, color: Colors.inkSoft, lineHeight: 24, marginBottom: 12 },
  example:    { fontSize: 14, fontStyle: 'italic', color: Colors.inkMute, lineHeight: 20, marginBottom: 16 },
  badge:      { flexDirection: 'row', alignItems: 'center', gap: 5, alignSelf: 'flex-start', backgroundColor: Colors.sandDeep, borderRadius: Radius.full, paddingHorizontal: 10, paddingVertical: 4 },
  badgeText:  { fontSize: 11, color: Colors.inkMute, fontWeight: '500' },
  actions:    { flexDirection: 'row', gap: 10, paddingHorizontal: Spacing.lg, paddingBottom: 24, paddingTop: 12 },
  skip:       { flex: 1, height: 50, borderRadius: Radius.full, borderWidth: 1, borderColor: Colors.lineStrong, alignItems: 'center', justifyContent: 'center' },
  skipText:   { fontSize: 14, fontWeight: '600', color: Colors.inkSoft },
  add:        { flex: 2, height: 50, borderRadius: Radius.full, backgroundColor: Colors.moss, alignItems: 'center', justifyContent: 'center' },
  addText:    { fontSize: 14, fontWeight: '700', color: Colors.sand },
  done:       { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32 },
  doneIcon:   { fontSize: 48, marginBottom: 20, color: Colors.moss },
  doneTitle:  { fontSize: 22, fontWeight: '700', color: Colors.ink, textAlign: 'center', letterSpacing: -0.4 },
  doneSub:    { fontSize: 14, color: Colors.inkMute, textAlign: 'center', marginTop: 10, lineHeight: 20 },
  doneBtn:    { marginTop: 28, backgroundColor: Colors.moss, paddingHorizontal: 32, paddingVertical: 14, borderRadius: Radius.full },
  doneBtnText:{ color: Colors.sand, fontWeight: '700', fontSize: 14 },
});