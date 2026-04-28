import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, ScrollView, Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Colors, Spacing, Radius } from '../theme';
import { PgButton, Icons, PgWaveform } from '../components';
import { SHADOW_TRANSCRIPT } from '../data/seed';

const TOTAL_DURATION = 5.6;

export default function ShadowingScreen() {
  const navigation = useNavigation();
  const [playing, setPlaying] = useState(false);
  const [time, setTime] = useState(2.4);
  const [recording, setRecording] = useState(false);
  const [showTrans, setShowTrans] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (!playing) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }
    timerRef.current = setInterval(() => {
      setTime((prev) => {
        const next = prev + 0.05;
        if (next >= TOTAL_DURATION) {
          setPlaying(false);
          return TOTAL_DURATION;
        }
        return next;
      });
    }, 50);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [playing]);

  useEffect(() => {
    if (recording) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.5, duration: 700, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1, duration: 700, useNativeDriver: true }),
        ])
      ).start();
    } else {
      pulseAnim.stopAnimation();
      pulseAnim.setValue(1);
    }
  }, [recording]);

  const activeIdx = Math.floor((time / TOTAL_DURATION) * 28);
  const mins = Math.floor(time);
  const secs = Math.floor((time % 1) * 10);

  return (
    <View style={styles.container}>
      <SafeAreaView style={{ flex: 1 }}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconBtn} activeOpacity={0.7}>
            <Icons.Close size={20} color={Colors.sand} />
          </TouchableOpacity>
          <View style={{ alignItems: 'center' }}>
            <Text style={styles.headerEye}>SHADOWING · ETAPA 3 / 5</Text>
            <Text style={styles.headerTitle}>Reductions</Text>
          </View>
          <TouchableOpacity style={styles.iconBtn} activeOpacity={0.7}>
            <Icons.More size={20} color={Colors.sand} />
          </TouchableOpacity>
        </View>

        {/* Segment progress */}
        <View style={styles.segRow}>
          {[1, 1, 0.6, 0, 0].map((v, i) => (
            <View key={i} style={styles.segTrack}>
              <View style={[styles.segFill, { flex: v }]} />
            </View>
          ))}
        </View>

        {/* Speaker */}
        <View style={styles.speaker}>
          <View style={styles.speakerAvatar}>
            <Text style={{ color: '#fff', fontWeight: '700', fontSize: 14 }}>L</Text>
          </View>
          <View>
            <Text style={styles.speakerName}>Lex Fridman</Text>
            <Text style={styles.speakerMeta}>Sotaque neutro · 142 wpm</Text>
          </View>
        </View>

        {/* Transcript */}
        <ScrollView style={{ flex: 1, paddingHorizontal: 22 }} showsVerticalScrollIndicator={false}>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', paddingTop: 10 }}>
            {SHADOW_TRANSCRIPT.map((tok, i) => {
              const isActive = time >= tok.t && (i === SHADOW_TRANSCRIPT.length - 1 || time < SHADOW_TRANSCRIPT[i + 1].t);
              const past = time > tok.t;
              const opacity = isActive ? 1 : past ? 0.85 : 0.32;
              const bg = tok.flag === 'reduce'
                ? isActive ? 'rgba(232,112,76,0.25)' : 'rgba(232,112,76,0.12)'
                : 'transparent';
              const needsSpace = !tok.punct && i < SHADOW_TRANSCRIPT.length - 1;
              return (
                <Text
                  key={i}
                  style={[
                    styles.word,
                    { opacity, backgroundColor: bg },
                    tok.flag === 'schwa' && styles.wordSchwa,
                  ]}
                >
                  {tok.w}{needsSpace ? ' ' : ''}
                </Text>
              );
            })}
          </View>

          {/* Legend */}
          <View style={styles.legend}>
            <Text style={styles.legendItem}>─── schwa /ə/</Text>
            <Text style={styles.legendItem}>█ reduction</Text>
            <TouchableOpacity onPress={() => setShowTrans((s) => !s)} activeOpacity={0.7} style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
              <Icons.Translate size={12} color={Colors.sand} />
              <Text style={[styles.legendItem, { color: Colors.sand }]}>Tradução</Text>
            </TouchableOpacity>
          </View>

          {showTrans && (
            <View style={styles.translation}>
              <Text style={styles.translationText}>
                Então a coisa é, quando você começa a aprender uma nova língua, foque nos sons, não na escrita.
              </Text>
            </View>
          )}
        </ScrollView>

        {/* Native audio */}
        <View style={{ paddingHorizontal: 22, paddingBottom: 14 }}>
          <Text style={styles.trackLabel}>NATIVO</Text>
          <View style={styles.trackRow}>
            <TouchableOpacity
              onPress={() => setPlaying((p) => !p)}
              style={styles.playBtn}
              activeOpacity={0.85}
            >
              {playing ? <Icons.Pause size={24} color="#fff" /> : <Icons.Play size={24} color="#fff" />}
            </TouchableOpacity>
            <View style={{ flex: 1 }}>
              <PgWaveform playing={playing} bars={28} c={Colors.oceanSoft} activeIdx={activeIdx} />
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 4 }}>
                <Text style={styles.timeText}>0:0{mins}</Text>
                <Text style={styles.timeText}>0:0{Math.ceil(TOTAL_DURATION)}</Text>
              </View>
            </View>
            <TouchableOpacity style={styles.speedBtn} activeOpacity={0.7}>
              <Text style={styles.speedText}>0.75×</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.divider} />

        {/* User record */}
        <View style={{ paddingHorizontal: 22, paddingVertical: 14 }}>
          <Text style={styles.trackLabel}>VOCÊ · IMITE A ENTONAÇÃO</Text>
          <View style={styles.trackRow}>
            <TouchableOpacity
              onPress={() => setRecording((r) => !r)}
              style={[styles.recBtn, recording && { backgroundColor: Colors.coral }]}
              activeOpacity={0.85}
            >
              {recording && (
                <Animated.View style={[styles.pulse, { transform: [{ scale: pulseAnim }] }]} />
              )}
              <Icons.Mic size={22} color={recording ? '#fff' : Colors.coral} />
            </TouchableOpacity>
            <View style={{ flex: 1, height: 36, flexDirection: 'row', alignItems: 'center', gap: 2 }}>
              {Array.from({ length: 28 }).map((_, i) => {
                const ratio = recording ? Math.abs(Math.sin(i * 0.7 + time * 8)) * 0.8 + 0.2 : 0.3;
                return (
                  <View
                    key={i}
                    style={{
                      flex: 1,
                      height: Math.round(ratio * 36),
                      borderRadius: 2,
                      backgroundColor: recording ? Colors.coral : 'rgba(232,112,76,0.25)',
                    }}
                  />
                );
              })}
            </View>
            <Text style={styles.recTime}>{recording ? '0:02' : '—:—'}</Text>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <PgButton
            variant="ghost"
            onPress={() => { setTime(0); setPlaying(true); }}
            style={{ backgroundColor: 'rgba(244,234,213,0.08)', borderRadius: Radius.full }}
          >
            <Icons.Headphones size={18} color={Colors.sand} />
            <Text style={{ color: Colors.sand, fontWeight: '700', fontSize: 14 }}>Repetir</Text>
          </PgButton>
          <PgButton
            full variant="primary"
            style={{ backgroundColor: Colors.sand }}
            onPress={() => navigation.goBack()}
          >
            <Text style={{ color: Colors.mossDeep, fontWeight: '700', fontSize: 14 }}>Próxima frase →</Text>
          </PgButton>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.ink },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg, paddingTop: 8,
  },
  iconBtn: {
    width: 38, height: 38, borderRadius: Radius.full,
    backgroundColor: 'rgba(244,234,213,0.08)',
    alignItems: 'center', justifyContent: 'center',
  },
  headerEye: { fontSize: 10.5, fontWeight: '700', letterSpacing: 1.2, color: Colors.sand, opacity: 0.55 },
  headerTitle: { fontSize: 13, fontWeight: '600', color: Colors.sand, marginTop: 2 },
  segRow: { flexDirection: 'row', gap: 4, paddingHorizontal: Spacing.lg, paddingTop: 12 },
  segTrack: { flex: 1, height: 3, borderRadius: 2, backgroundColor: 'rgba(244,234,213,0.18)', overflow: 'hidden' },
  segFill: { height: 3, backgroundColor: Colors.sand },
  speaker: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 22, paddingTop: 24 },
  speakerAvatar: { width: 32, height: 32, borderRadius: 16, backgroundColor: Colors.ocean, alignItems: 'center', justifyContent: 'center' },
  speakerName: { fontSize: 13, fontWeight: '600', color: Colors.sand },
  speakerMeta: { fontSize: 11, color: Colors.sand, opacity: 0.55 },
  word: { fontSize: 22, lineHeight: 36, color: Colors.sand, letterSpacing: -0.2 },
  wordSchwa: { textDecorationLine: 'underline', textDecorationStyle: 'solid', textDecorationColor: Colors.coral },
  legend: { flexDirection: 'row', gap: 14, flexWrap: 'wrap', marginTop: 12 },
  legendItem: { fontSize: 11, color: Colors.sand, opacity: 0.7 },
  translation: {
    marginTop: 12, padding: 12,
    backgroundColor: 'rgba(244,234,213,0.08)',
    borderRadius: 12,
  },
  translationText: { fontSize: 13, lineHeight: 20, color: Colors.sand, opacity: 0.85 },
  trackLabel: { fontSize: 10.5, fontWeight: '700', letterSpacing: 1, color: Colors.sand, opacity: 0.55, marginBottom: 8 },
  trackRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  playBtn: {
    width: 52, height: 52, borderRadius: 26, backgroundColor: Colors.ocean,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: Colors.ocean, shadowOpacity: 0.4, shadowRadius: 18, shadowOffset: { width: 0, height: 6 },
    elevation: 6,
  },
  speedBtn: {
    backgroundColor: 'rgba(244,234,213,0.1)', borderRadius: 8, padding: 6,
  },
  speedText: { fontSize: 11, fontWeight: '600', color: Colors.sand },
  timeText: { fontFamily: 'monospace', fontSize: 10, color: Colors.sand, opacity: 0.55 },
  divider: { height: 1, backgroundColor: 'rgba(244,234,213,0.1)', marginHorizontal: 22 },
  recBtn: {
    width: 52, height: 52, borderRadius: 26,
    backgroundColor: 'rgba(232,112,76,0.18)',
    borderWidth: 1.5, borderColor: Colors.coral,
    alignItems: 'center', justifyContent: 'center',
  },
  pulse: {
    position: 'absolute', width: 64, height: 64, borderRadius: 32,
    borderWidth: 2, borderColor: Colors.coral,
  },
  recTime: { fontFamily: 'monospace', fontSize: 11, color: Colors.sand, opacity: 0.55 },
  footer: { flexDirection: 'row', gap: 8, paddingHorizontal: Spacing.lg, paddingBottom: 22 },
});
