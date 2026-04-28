import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, ScrollView, TextInput, KeyboardAvoidingView, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Colors, Radius, Spacing } from '../theme';
import { PgButton, Icons } from '../components';
import { useProfileStore } from '../store';
import { RootStackParamList } from '../navigation';

const levels = [
  { id: 'A1', lbl: 'Iniciante', sub: 'Frases básicas' },
  { id: 'A2', lbl: 'Básico', sub: 'Conversas simples' },
  { id: 'B1', lbl: 'Intermediário', sub: 'Lido com o dia a dia' },
  { id: 'B2', lbl: 'Independente', sub: 'Trabalho em inglês' },
  { id: 'C1', lbl: 'Avançado', sub: 'Fluente, com sotaque' },
];

export default function OnboardingScreen() {
  const [step, setStep] = useState<'name' | 'level'>('name');
  const [name, setName] = useState('');
  const [level, setLevel] = useState('B1');
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { setName: saveName, setLevel: saveLevel, setOnboarded } = useProfileStore();

  const handleFinish = () => {
    saveName(name.trim() || 'Você');
    saveLevel(level);
    setOnboarded();
    navigation.replace('Main');
  };

  if (step === 'name') {
    return (
      <SafeAreaView style={styles.safe}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
          <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
            <View style={styles.progressRow}>
              {[1, 0, 0, 0, 0, 0].map((v, i) => (
                <View key={i} style={[styles.progressDot, { backgroundColor: v ? Colors.moss : Colors.line }]} />
              ))}
            </View>

            <Text style={styles.step}>PASSO 1 DE 6</Text>
            <Text style={styles.title}>Como você se chama?</Text>
            <Text style={styles.sub}>Usaremos seu nome para personalizar a experiência.</Text>

            <View style={styles.nameWrap}>
              <TextInput
                value={name}
                onChangeText={setName}
                placeholder="Seu nome"
                placeholderTextColor={Colors.inkMute}
                autoFocus
                autoCapitalize="words"
                returnKeyType="next"
                onSubmitEditing={() => setStep('level')}
                style={styles.nameInput}
              />
              <View style={{ height: 2, backgroundColor: name ? Colors.moss : Colors.line, marginTop: 4 }} />
            </View>

            <View style={styles.ctaRow}>
              <PgButton full variant="primary" onPress={() => setStep('level')}>
                Continuar →
              </PgButton>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.progressRow}>
          {[1, 1, 1, 0, 0, 0].map((v, i) => (
            <View key={i} style={[styles.progressDot, { backgroundColor: v ? Colors.moss : Colors.line }]} />
          ))}
        </View>

        <Text style={styles.step}>PASSO 3 DE 6</Text>
        <Text style={styles.title}>Onde você está hoje?</Text>
        <Text style={styles.sub}>
          {name.trim() ? `Oi, ${name.trim()}! ` : ''}Você fará um teste curto depois. Por enquanto, escolha o que mais combina.
        </Text>

        <View style={{ marginTop: 20 }}>
          {levels.map((lv) => {
            const sel = level === lv.id;
            return (
              <TouchableOpacity
                key={lv.id}
                onPress={() => setLevel(lv.id)}
                activeOpacity={0.8}
                style={[styles.levelCard, sel && styles.levelCardSelected]}
              >
                <View style={[styles.levelBadge, sel && { backgroundColor: 'rgba(244,234,213,0.18)' }]}>
                  <Text style={[styles.levelBadgeText, sel && { color: Colors.sand }]}>{lv.id}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.levelLbl, sel && { color: Colors.sand }]}>{lv.lbl}</Text>
                  <Text style={[styles.levelSub, sel && { color: Colors.sand, opacity: 0.78 }]}>{lv.sub}</Text>
                </View>
                {sel && (
                  <View style={styles.checkCircle}>
                    <Icons.Check size={14} color={Colors.moss} />
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={styles.ctaRow}>
          <PgButton variant="secondary" onPress={() => setStep('name')}>Voltar</PgButton>
          <PgButton full variant="primary" onPress={handleFinish}>Começar →</PgButton>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.sand },
  container: { padding: Spacing.lg, paddingTop: 10 },
  progressRow: { flexDirection: 'row', gap: 4, marginBottom: 20 },
  progressDot: { flex: 1, height: 3, borderRadius: 2 },
  step: { fontSize: 11, fontWeight: '700', letterSpacing: 1.2, color: Colors.moss },
  title: { fontSize: 28, fontWeight: '600', letterSpacing: -0.5, lineHeight: 34, marginTop: 8, color: Colors.ink },
  sub: { fontSize: 14, color: Colors.inkSoft, marginTop: 8, lineHeight: 21 },
  nameWrap: { marginTop: 32 },
  nameInput: {
    fontSize: 28, fontWeight: '500', color: Colors.ink,
    letterSpacing: -0.4, padding: 0, paddingBottom: 8,
  },
  levelCard: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    backgroundColor: Colors.paper, borderWidth: 0.5, borderColor: Colors.line,
    borderRadius: 14, padding: 14, marginBottom: 8,
  },
  levelCardSelected: {
    backgroundColor: Colors.moss, borderColor: Colors.moss,
    shadowColor: Colors.moss, shadowOpacity: 0.25, shadowRadius: 18, shadowOffset: { width: 0, height: 6 },
    elevation: 6,
  },
  levelBadge: {
    width: 48, height: 48, borderRadius: 10,
    backgroundColor: Colors.sandDeep,
    alignItems: 'center', justifyContent: 'center',
  },
  levelBadgeText: { fontSize: 18, fontWeight: '600', letterSpacing: -0.4, color: Colors.ink },
  levelLbl: { fontSize: 15, fontWeight: '700', color: Colors.ink },
  levelSub: { fontSize: 12, color: Colors.inkMute, marginTop: 2 },
  checkCircle: {
    width: 24, height: 24, borderRadius: 12,
    backgroundColor: Colors.sand,
    alignItems: 'center', justifyContent: 'center',
  },
  ctaRow: { flexDirection: 'row', gap: 8, marginTop: 24 },
});
