import React, { useState, useEffect } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, TextInput,
  KeyboardAvoidingView, Platform, ScrollView, ActivityIndicator,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { Colors, Radius, Spacing } from '../theme';
import { PgButton, Icons } from '../components';
import { useVaultStore, useProfileStore } from '../store';
import { CommunicativeFunction, COMMUNICATIVE_FUNCTIONS } from '../data/seed';
import { RootStackParamList } from '../navigation';

type Route = RouteProp<RootStackParamList, 'Capture'>;

const TYPES = [
  { id: 'word',        lbl: 'Palavra' },
  { id: 'phrase',      lbl: 'Frase' },
  { id: 'chunk',       lbl: 'Chunk' },
  { id: 'collocation', lbl: 'Collocation' },
  { id: 'reduction',   lbl: 'Reduction' },
  { id: 'idiom',       lbl: 'Idiom' },
  { id: 'phonetic',    lbl: 'Fonética' },
  { id: 'gap-filler',  lbl: 'Gap-filler' },
] as const;

const LEVELS = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'] as const;

// Types that benefit from a communicative function tag
const CHUNK_TYPES = new Set(['phrase', 'chunk', 'collocation', 'idiom', 'gap-filler']);

type DictSuggestion = {
  phonetic: string;
  definition: string;
  example: string;
  partOfSpeech: string;
};

const POS_TO_TYPE: Record<string, typeof TYPES[number]['id']> = {
  verb: 'phrase',
  noun: 'word',
  adjective: 'word',
  adverb: 'word',
  interjection: 'gap-filler',
  idiom: 'idiom',
};

function todayLabel() {
  const now = new Date();
  const h = now.getHours().toString().padStart(2, '0');
  const m = now.getMinutes().toString().padStart(2, '0');
  return `hoje · ${h}:${m}`;
}

export default function CaptureScreen() {
  const navigation = useNavigation();
  const route = useRoute<Route>();
  const itemId = route.params?.itemId;

  const { addItem, updateItem, items } = useVaultStore();
  const { level: profileLevel } = useProfileStore();

  const existingItem = itemId ? items.find((v) => v.id === itemId) : null;
  const isEditing = !!existingItem;

  const [term, setTerm]       = useState(existingItem?.term ?? '');
  const [gloss, setGloss]     = useState(existingItem?.gloss ?? '');
  const [example, setExample] = useState(existingItem?.example ?? '');
  const [source, setSource]   = useState(existingItem?.source ?? '');
  const [type, setType]       = useState<typeof TYPES[number]['id']>(existingItem?.type ?? 'phrase');
  const [fn, setFn]           = useState<CommunicativeFunction | undefined>(existingItem?.function ?? undefined);
  const [level, setLevel]     = useState<string>(existingItem?.level ?? profileLevel ?? 'B1');
  const [suggestion, setSuggestion] = useState<DictSuggestion | null>(null);
  const [fetching, setFetching]     = useState(false);

  const showFunctionPicker = CHUNK_TYPES.has(type);
  const canSave = term.trim().length > 0 && gloss.trim().length > 0;

  // ── Auto-fill from Free Dictionary API (only when creating) ─────────────────
  useEffect(() => {
    if (isEditing) return;
    const trimmed = term.trim();
    setSuggestion(null);
    if (trimmed.length < 2) return;

    const timer = setTimeout(async () => {
      setFetching(true);
      try {
        const url = `https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(trimmed)}`;
        const res = await fetch(url);
        if (!res.ok) { setFetching(false); return; }
        const data = await res.json();
        const entry = data?.[0];
        if (!entry) { setFetching(false); return; }

        const phonetic =
          entry.phonetic ||
          (entry.phonetics as any[])?.find((p: any) => p.text)?.text ||
          '';
        const meaning = entry.meanings?.[0];
        const def = meaning?.definitions?.[0];

        setSuggestion({
          phonetic,
          definition: def?.definition || '',
          example: def?.example || '',
          partOfSpeech: meaning?.partOfSpeech || '',
        });

        if (meaning?.partOfSpeech && POS_TO_TYPE[meaning.partOfSpeech]) {
          setType(POS_TO_TYPE[meaning.partOfSpeech]);
        }
      } catch {
        // Network error or not found — fail silently
      } finally {
        setFetching(false);
      }
    }, 800);

    return () => clearTimeout(timer);
  }, [term]);

  const handleSave = () => {
    if (!canSave) return;
    const data = {
      term: term.trim(),
      type,
      lang: existingItem?.lang ?? 'en→pt',
      gloss: gloss.trim(),
      source: source.trim() || 'Manual',
      date: existingItem?.date ?? todayLabel(),
      example: example.trim(),
      srs: existingItem?.srs ?? 'new',
      strength: existingItem?.strength ?? 0,
      tags: existingItem?.tags ?? [],
      function: showFunctionPicker ? fn : undefined,
      level,
      stability:    existingItem?.stability    ?? 0,
      difficulty:   existingItem?.difficulty   ?? 5,
      lapses:       existingItem?.lapses       ?? 0,
      lastReviewAt: existingItem?.lastReviewAt ?? 0,
      nextReviewAt: existingItem?.nextReviewAt ?? 0,
    };

    if (isEditing && existingItem) {
      updateItem(existingItem.id, data);
    } else {
      addItem(data);
    }
    navigation.goBack();
  };

  return (
    <View style={styles.safe}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1, justifyContent: 'flex-end' }}
      >
        <TouchableOpacity style={StyleSheet.absoluteFill} activeOpacity={1} onPress={() => navigation.goBack()} />
        <TouchableOpacity activeOpacity={1} onPress={() => {}}>
          <View style={styles.sheet}>
            {/* Handle */}
            <View style={styles.handle} />

            {/* Header */}
            <View style={styles.sheetHeader}>
              <View>
                <Text style={styles.sheetEye}>{isEditing ? 'EDITAR' : 'CAPTURAR'}</Text>
                <Text style={styles.sheetTitle}>{isEditing ? 'Editar entrada' : 'Nova entrada no Vault'}</Text>
              </View>
              <TouchableOpacity onPress={() => navigation.goBack()} style={styles.closeBtn} activeOpacity={0.7}>
                <Icons.Close size={18} color={Colors.ink} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
              {/* Term */}
              <View style={styles.fieldWrap}>
                <Text style={styles.fieldLabel}>TERMO EM INGLÊS</Text>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <TextInput
                    value={term}
                    onChangeText={setTerm}
                    style={[styles.termInput, { flex: 1 }]}
                    autoFocus={!isEditing}
                    placeholder="Palavra ou frase..."
                    placeholderTextColor={Colors.inkMute}
                    returnKeyType="next"
                  />
                  {fetching && (
                    <ActivityIndicator size="small" color={Colors.ocean} style={{ marginLeft: 8 }} />
                  )}
                </View>
                <View style={{ height: 1.5, backgroundColor: term ? Colors.moss : Colors.line, marginTop: 4 }} />
              </View>

              {/* Dictionary suggestion card */}
              {suggestion && (
                <View style={styles.fieldWrap}>
                  <View style={styles.suggestionCard}>
                    <View style={styles.suggestionHeader}>
                      <Text style={styles.suggestionLabel}>SUGESTÃO · DICIONÁRIO</Text>
                      {suggestion.partOfSpeech ? (
                        <View style={styles.posBadge}>
                          <Text style={styles.posBadgeText}>{suggestion.partOfSpeech}</Text>
                        </View>
                      ) : null}
                    </View>

                    {suggestion.phonetic ? (
                      <Text style={styles.suggestionPhon}>{suggestion.phonetic}</Text>
                    ) : null}

                    {suggestion.definition ? (
                      <TouchableOpacity
                        style={styles.suggestionRow}
                        onPress={() => setGloss(suggestion.definition)}
                        activeOpacity={0.75}
                      >
                        <View style={styles.suggestionRowInner}>
                          <Text style={styles.suggestionRowLabel}>DEFINIÇÃO</Text>
                          <Text style={styles.suggestionDef}>{suggestion.definition}</Text>
                        </View>
                        <View style={styles.applyBtn}>
                          <Text style={styles.applyBtnText}>Usar</Text>
                        </View>
                      </TouchableOpacity>
                    ) : null}

                    {suggestion.example ? (
                      <TouchableOpacity
                        style={[styles.suggestionRow, { marginTop: 6 }]}
                        onPress={() => setExample(suggestion.example)}
                        activeOpacity={0.75}
                      >
                        <View style={styles.suggestionRowInner}>
                          <Text style={styles.suggestionRowLabel}>EXEMPLO</Text>
                          <Text style={styles.suggestionEx}>"{suggestion.example}"</Text>
                        </View>
                        <View style={styles.applyBtn}>
                          <Text style={styles.applyBtnText}>Usar</Text>
                        </View>
                      </TouchableOpacity>
                    ) : null}
                  </View>
                </View>
              )}

              {/* Gloss */}
              <View style={styles.fieldWrap}>
                <Text style={styles.fieldLabel}>SIGNIFICADO EM PORTUGUÊS</Text>
                <TextInput
                  value={gloss}
                  onChangeText={setGloss}
                  style={styles.glossInput}
                  placeholder="Tradução ou explicação..."
                  placeholderTextColor={Colors.inkMute}
                  returnKeyType="next"
                  multiline
                />
                <View style={{ height: 1.5, backgroundColor: gloss ? Colors.moss : Colors.line, marginTop: 4 }} />
              </View>

              {/* Example */}
              <View style={styles.fieldWrap}>
                <Text style={styles.fieldLabel}>EXEMPLO EM INGLÊS (OPCIONAL)</Text>
                <TextInput
                  value={example}
                  onChangeText={setExample}
                  style={styles.exampleInput}
                  placeholder="Frase de contexto..."
                  placeholderTextColor={Colors.inkMute}
                  returnKeyType="next"
                  multiline
                />
                <View style={{ height: 1.5, backgroundColor: example ? Colors.ocean : Colors.line, marginTop: 4 }} />
              </View>

              {/* Type */}
              <View style={styles.fieldWrap}>
                <Text style={styles.fieldLabel}>TIPO</Text>
                <View style={styles.typeRow}>
                  {TYPES.map((ty) => (
                    <TouchableOpacity
                      key={ty.id}
                      onPress={() => setType(ty.id)}
                      style={[styles.typePill, type === ty.id && styles.typePillActive]}
                      activeOpacity={0.8}
                    >
                      <Text style={[styles.typePillText, type === ty.id && { color: Colors.sand }]}>
                        {ty.lbl}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Level */}
              <View style={styles.fieldWrap}>
                <Text style={styles.fieldLabel}>NÍVEL CEFR</Text>
                <View style={styles.typeRow}>
                  {LEVELS.map((l) => (
                    <TouchableOpacity
                      key={l}
                      onPress={() => setLevel(l)}
                      style={[styles.typePill, level === l && styles.typePillLevel]}
                      activeOpacity={0.8}
                    >
                      <Text style={[styles.typePillText, level === l && { color: Colors.sand }]}>
                        {l}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Communicative Function — only for chunk-like types */}
              {showFunctionPicker && (
                <View style={styles.fieldWrap}>
                  <Text style={styles.fieldLabel}>FUNÇÃO COMUNICATIVA (OPCIONAL)</Text>
                  <Text style={styles.fieldHint}>Como este chunk é usado na conversa?</Text>
                  <View style={styles.typeRow}>
                    {COMMUNICATIVE_FUNCTIONS.map((f) => (
                      <TouchableOpacity
                        key={f.id}
                        onPress={() => setFn(fn === f.id ? undefined : f.id)}
                        style={[styles.typePill, fn === f.id && styles.typePillFn]}
                        activeOpacity={0.8}
                      >
                        <Text style={[styles.typePillText, fn === f.id && { color: Colors.sand }]}>
                          {f.emoji} {f.lbl}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              )}

              {/* Source */}
              <View style={styles.fieldWrap}>
                <Text style={styles.fieldLabel}>FONTE (OPCIONAL)</Text>
                <TextInput
                  value={source}
                  onChangeText={setSource}
                  style={styles.sourceInput}
                  placeholder="Podcast, livro, série..."
                  placeholderTextColor={Colors.inkMute}
                  returnKeyType="done"
                />
              </View>

              {/* CTAs */}
              <View style={styles.ctaRow}>
                <PgButton variant="secondary" onPress={() => navigation.goBack()}>Cancelar</PgButton>
                <PgButton
                  full
                  variant="primary"
                  onPress={handleSave}
                  style={!canSave ? { opacity: 0.45 } : undefined}
                >
                  <Text style={{ fontSize: 14, fontWeight: '700', color: Colors.sand }}>
                    {isEditing ? 'Salvar alterações' : 'Adicionar ao Vault'}
                  </Text>
                </PgButton>
              </View>

              <View style={{ height: 24 }} />
            </ScrollView>
          </View>
        </TouchableOpacity>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: 'rgba(26,26,23,0.55)' },
  sheet: {
    backgroundColor: Colors.paper,
    borderTopLeftRadius: 24, borderTopRightRadius: 24,
    paddingTop: 12, maxHeight: '92%',
  },
  handle: {
    width: 36, height: 4, borderRadius: 2,
    backgroundColor: 'rgba(26,26,23,0.18)',
    alignSelf: 'center', marginBottom: 14,
  },
  sheetHeader: {
    flexDirection: 'row', alignItems: 'flex-start',
    paddingHorizontal: 20, justifyContent: 'space-between', marginBottom: 4,
  },
  sheetEye: { fontSize: 11, fontWeight: '700', letterSpacing: 1, color: Colors.inkMute },
  sheetTitle: { fontSize: 22, fontWeight: '600', marginTop: 2, letterSpacing: -0.3, color: Colors.ink },
  closeBtn: {
    width: 34, height: 34, borderRadius: 17,
    backgroundColor: 'rgba(26,26,23,0.06)',
    alignItems: 'center', justifyContent: 'center',
  },
  fieldWrap: { paddingHorizontal: 20, paddingTop: 18 },
  fieldLabel: { fontSize: 10.5, fontWeight: '700', letterSpacing: 1, color: Colors.inkMute, marginBottom: 8 },
  fieldHint: { fontSize: 11, color: Colors.inkMute, marginBottom: 8, marginTop: -4 },
  termInput: {
    fontSize: 26, fontWeight: '500', color: Colors.ink,
    letterSpacing: -0.4, padding: 0,
  },
  glossInput: {
    fontSize: 16, color: Colors.ink,
    padding: 0, lineHeight: 22, minHeight: 22,
  },
  exampleInput: {
    fontSize: 14, color: Colors.ink, fontStyle: 'italic',
    padding: 0, lineHeight: 20, minHeight: 20,
  },
  sourceInput: {
    fontSize: 14, color: Colors.ink,
    backgroundColor: Colors.sand, borderRadius: 10,
    paddingHorizontal: 12, paddingVertical: 10,
    borderWidth: 0.5, borderColor: Colors.line,
  },
  typeRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  typePill: {
    paddingHorizontal: 12, paddingVertical: 7, borderRadius: Radius.full,
    borderWidth: 1, borderColor: Colors.lineStrong,
  },
  typePillActive: { backgroundColor: Colors.moss, borderColor: Colors.moss },
  typePillLevel:  { backgroundColor: Colors.ocean, borderColor: Colors.ocean },
  typePillFn:     { backgroundColor: Colors.purple, borderColor: Colors.purple },
  typePillText: { fontSize: 12, fontWeight: '600', color: Colors.inkSoft },

  // Suggestion card
  suggestionCard: {
    backgroundColor: Colors.oceanSoft,
    borderRadius: Radius.md, padding: 14,
    borderWidth: 0.5, borderColor: Colors.ocean + '44',
  },
  suggestionHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 },
  suggestionLabel: { fontSize: 10, fontWeight: '700', letterSpacing: 1, color: Colors.ocean },
  suggestionPhon: {
    fontSize: 15, fontFamily: 'monospace', color: Colors.ocean,
    fontWeight: '600', marginBottom: 10,
  },
  posBadge: {
    backgroundColor: Colors.ocean, borderRadius: Radius.full,
    paddingHorizontal: 8, paddingVertical: 2,
  },
  posBadgeText: { fontSize: 9, fontWeight: '700', color: '#fff', textTransform: 'uppercase' },
  suggestionRow: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: Colors.white + 'CC', borderRadius: 10, padding: 10,
  },
  suggestionRowInner: { flex: 1 },
  suggestionRowLabel: { fontSize: 9.5, fontWeight: '700', letterSpacing: 0.8, color: Colors.ocean, marginBottom: 3 },
  suggestionDef: { fontSize: 13, color: Colors.inkSoft, lineHeight: 18 },
  suggestionEx: { fontSize: 12, fontStyle: 'italic', color: Colors.inkMute, lineHeight: 17 },
  applyBtn: {
    backgroundColor: Colors.ocean, borderRadius: Radius.full,
    paddingHorizontal: 10, paddingVertical: 5,
  },
  applyBtnText: { fontSize: 11, fontWeight: '700', color: '#fff' },

  ctaRow: { flexDirection: 'row', gap: 8, paddingHorizontal: 20, paddingTop: 20 },
});
