import React from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  ViewStyle,
} from 'react-native';
import { Colors, Radius, Spacing } from '../theme';
import Svg, { Path, Circle, Defs, LinearGradient, Stop } from 'react-native-svg';

// ─── PgCard ──────────────────────────────────────────────────────────────────
export function PgCard({
  children, p = 16, style,
}: { children: React.ReactNode; p?: number; style?: ViewStyle }) {
  return (
    <View style={[styles.card, { padding: p }, style]}>
      {children}
    </View>
  );
}

// ─── PgButton ────────────────────────────────────────────────────────────────
type BtnVariant = 'primary' | 'secondary' | 'ghost';
export function PgButton({
  children, variant = 'primary', full, onPress, style,
}: {
  children: React.ReactNode;
  variant?: BtnVariant;
  full?: boolean;
  onPress?: () => void;
  style?: ViewStyle;
}) {
  const bg =
    variant === 'primary' ? Colors.moss :
    variant === 'secondary' ? Colors.paper : 'transparent';
  const color =
    variant === 'primary' ? Colors.sand :
    variant === 'secondary' ? Colors.ink : Colors.ink;
  const border =
    variant === 'secondary' ? { borderWidth: 0.5, borderColor: Colors.lineStrong } : {};

  return (
    <TouchableOpacity
      onPress={onPress}
      style={[
        styles.btn,
        { backgroundColor: bg, flex: full ? 1 : 0 },
        border,
        style,
      ]}
      activeOpacity={0.75}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
        {typeof children === 'string' ? (
          <Text style={[styles.btnText, { color }]}>{children}</Text>
        ) : children}
      </View>
    </TouchableOpacity>
  );
}

// ─── PgChip ──────────────────────────────────────────────────────────────────
export function PgChip({
  children, c, soft,
}: { children: React.ReactNode; c: string; soft: string }) {
  return (
    <View style={[styles.chip, { backgroundColor: soft }]}>
      <Text style={[styles.chipText, { color: c }]}>{children}</Text>
    </View>
  );
}

// ─── PgHeader ────────────────────────────────────────────────────────────────
export function PgHeader({
  title, sub, onBack, right,
}: {
  title: string;
  sub?: string;
  onBack?: () => void;
  right?: React.ReactNode;
}) {
  return (
    <View style={styles.header}>
      <View style={{ flex: 1 }}>
        {sub && <Text style={styles.headerSub}>{sub}</Text>}
        <Text style={styles.headerTitle}>{title}</Text>
      </View>
      {right}
      {onBack && (
        <TouchableOpacity onPress={onBack} style={styles.backBtn} activeOpacity={0.7}>
          <BackIcon />
        </TouchableOpacity>
      )}
    </View>
  );
}

// ─── PgStrength ──────────────────────────────────────────────────────────────
export function PgStrength({ value, c = Colors.moss }: { value: number; c?: string }) {
  return (
    <View style={{ flexDirection: 'row', gap: 3, alignItems: 'center' }}>
      {[0.25, 0.5, 0.75, 1].map((threshold, i) => (
        <View
          key={i}
          style={{
            width: 4, height: 4 + i * 2,
            borderRadius: 2,
            backgroundColor: value >= threshold ? c : Colors.line,
          }}
        />
      ))}
    </View>
  );
}

// ─── PgRing ──────────────────────────────────────────────────────────────────
export function PgRing({
  pct, size = 64, stroke = 6, c = Colors.moss, children,
}: {
  pct: number; size?: number; stroke?: number; c?: string; children?: React.ReactNode;
}) {
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const dash = (pct / 100) * circ;
  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <Svg width={size} height={size} style={{ position: 'absolute' }}>
        <Circle cx={size / 2} cy={size / 2} r={r} stroke={Colors.line} strokeWidth={stroke} fill="none" />
        <Circle
          cx={size / 2} cy={size / 2} r={r}
          stroke={c} strokeWidth={stroke} fill="none"
          strokeDasharray={[dash, circ - dash]}
          strokeLinecap="round"
          rotation={-90}
          originX={size / 2} originY={size / 2}
        />
      </Svg>
      {children}
    </View>
  );
}

// ─── PgWaveform ──────────────────────────────────────────────────────────────
export function PgWaveform({
  playing, bars = 28, c = Colors.oceanSoft, activeIdx = 0,
}: {
  playing: boolean; bars?: number; c?: string; activeIdx?: number;
}) {
  const maxH = 36;
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', height: maxH, gap: 2 }}>
      {Array.from({ length: bars }).map((_, i) => {
        const ratio = Math.abs(Math.sin(i * 0.8)) * 0.7 + 0.3;
        const active = i <= activeIdx;
        return (
          <View
            key={i}
            style={{
              flex: 1,
              height: Math.round(ratio * maxH),
              borderRadius: 2,
              backgroundColor: active ? c : `${c}44`,
            }}
          />
        );
      })}
    </View>
  );
}

// ─── PgRadar ─────────────────────────────────────────────────────────────────
export type RadarAxis = { label: string; value: number; color: string; sublabel?: string };

export function PgRadar({ axes, size = 200 }: { axes: RadarAxis[]; size?: number }) {
  const N = axes.length;
  const cx = size / 2;
  const cy = size / 2;
  const maxR = size * 0.36;

  const angleFor = (i: number) => (2 * Math.PI * i) / N - Math.PI / 2;

  const outerPts = axes.map((_, i) => {
    const a = angleFor(i);
    return { x: cx + maxR * Math.cos(a), y: cy + maxR * Math.sin(a) };
  });

  const dataPts = axes.map((ax, i) => {
    const a = angleFor(i);
    const r = maxR * (Math.max(0, Math.min(100, ax.value)) / 100);
    return { x: cx + r * Math.cos(a), y: cy + r * Math.sin(a) };
  });

  const gridLevels = [0.25, 0.5, 0.75, 1];

  const ptsToPath = (pts: { x: number; y: number }[]) =>
    pts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' ') + ' Z';

  return (
    <View style={{ alignItems: 'center' }}>
      <Svg width={size} height={size}>
        {/* Grid rings */}
        {gridLevels.map((scale, ri) => {
          const ringPts = axes.map((_, i) => {
            const a = angleFor(i);
            return { x: cx + maxR * scale * Math.cos(a), y: cy + maxR * scale * Math.sin(a) };
          });
          return (
            <Path
              key={ri}
              d={ptsToPath(ringPts)}
              fill="none"
              stroke={Colors.line}
              strokeWidth={0.8}
            />
          );
        })}

        {/* Axis spokes */}
        {outerPts.map((pt, i) => (
          <Path
            key={i}
            d={`M ${cx.toFixed(1)} ${cy.toFixed(1)} L ${pt.x.toFixed(1)} ${pt.y.toFixed(1)}`}
            stroke={Colors.line}
            strokeWidth={0.8}
          />
        ))}

        {/* Data polygon */}
        <Path
          d={ptsToPath(dataPts)}
          fill={Colors.moss}
          fillOpacity={0.18}
          stroke={Colors.moss}
          strokeWidth={1.8}
        />

        {/* Data dots */}
        {dataPts.map((pt, i) => (
          <Circle key={i} cx={pt.x} cy={pt.y} r={3.5} fill={axes[i].color} />
        ))}
      </Svg>

      {/* Labels grid below chart */}
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 4, justifyContent: 'center' }}>
        {axes.map((ax) => (
          <View key={ax.label} style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
            <View style={{ width: 7, height: 7, borderRadius: 4, backgroundColor: ax.color }} />
            <Text style={{ fontSize: 10, color: Colors.inkMute, fontWeight: '600' }}>
              {ax.label}
            </Text>
            <Text style={{ fontSize: 10, color: ax.color, fontWeight: '700', fontFamily: 'monospace' }}>
              {ax.value}%
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}

// ─── PgZipfCurve ─────────────────────────────────────────────────────────────
export function PgZipfCurve() {
  return (
    <Svg viewBox="0 0 320 100" width="100%" height={100}>
      <Defs>
        <LinearGradient id="zipf-g" x1="0" x2="0" y1="0" y2="1">
          <Stop offset="0" stopColor={Colors.moss} stopOpacity={0.3} />
          <Stop offset="1" stopColor={Colors.moss} stopOpacity={0} />
        </LinearGradient>
      </Defs>
      <Path d="M 0 5 Q 30 18, 60 42 Q 110 70, 180 85 Q 250 95, 320 98 L 320 100 L 0 100 Z" fill="url(#zipf-g)" />
      <Path d="M 0 5 Q 30 18, 60 42 Q 110 70, 180 85 Q 250 95, 320 98" fill="none" stroke={Colors.moss} strokeWidth={1.5} />
      <Path d="M125,20 L125,100" stroke={Colors.coral} strokeWidth={1} strokeDasharray={[3, 3]} />
      <Circle cx={125} cy={58} r={5} fill={Colors.coral} />
      <Circle cx={125} cy={58} r={9} fill="none" stroke={Colors.coral} strokeOpacity={0.4} strokeWidth={1.5} />
    </Svg>
  );
}

// ─── Icons (inline SVG) ──────────────────────────────────────────────────────
function icon(path: string, size = 24, stroke = 2, fill = 'none') {
  return ({ size: s = size, color = Colors.ink }: { size?: number; color?: string }) => (
    <Svg width={s} height={s} viewBox="0 0 24 24" fill={fill}>
      <Path d={path} stroke={color} strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

export const Icons = {
  Home: icon('M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z M9 22V12h6v10'),
  Stack: icon('M2 17l10 5 10-5M2 12l10 5 10-5M12 2L2 7l10 5 10-5z'),
  Vault: icon('M5 4h14a2 2 0 012 2v12a2 2 0 01-2 2H5a2 2 0 01-2-2V6a2 2 0 012-2z M8 10h8 M8 14h4'),
  Compass: icon('M12 2a10 10 0 100 20A10 10 0 0012 2z M16.2 7.8l-1.5 4.7-4.7 1.5 1.5-4.7z'),
  Plus: icon('M12 5v14M5 12h14'),
  Mic: icon('M12 1a3 3 0 00-3 3v8a3 3 0 006 0V4a3 3 0 00-3-3z M19 10v2a7 7 0 01-14 0v-2 M12 19v4 M8 23h8'),
  Play: icon('M5 3l14 9-14 9V3z', 24, 2, Colors.ink),
  Pause: icon('M6 4h4v16H6z M14 4h4v16h-4z'),
  Headphones: icon('M3 18v-6a9 9 0 0118 0v6 M21 19a2 2 0 01-2 2h-1a2 2 0 01-2-2v-3a2 2 0 012-2h3z M3 19a2 2 0 002 2h1a2 2 0 002-2v-3a2 2 0 00-2-2H3z'),
  Close: icon('M18 6L6 18M6 6l12 12'),
  Back: icon('M19 12H5M12 5l-7 7 7 7'),
  Next: icon('M5 12h14M12 5l7 7-7 7'),
  Settings: icon('M12 15a3 3 0 100-6 3 3 0 000 6z M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z'),
  Search: icon('M21 21l-4.35-4.35M17 11A6 6 0 115 11a6 6 0 0112 0z'),
  Filter: icon('M4 6h16M7 12h10M10 18h4'),
  Bookmark: icon('M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z'),
  Flame: icon('M8.5 14.5A2.5 2.5 0 0011 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 11-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 002.5 3z'),
  Globe: icon('M12 2a10 10 0 100 20A10 10 0 0012 2z M2 12h20 M12 2a15.3 15.3 0 010 20 M12 2a15.3 15.3 0 000 20'),
  Trophy: icon('M6 9H2V4h4M18 9h4V4h-4M6 4h12 M8 9a4 4 0 008 0V4H8z M10 17l-2 5h8l-2-5 M8 22h8'),
  More: icon('M5 12h.01M12 12h.01M19 12h.01'),
  Book: icon('M4 19.5A2.5 2.5 0 016.5 17H20 M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z'),
  Video: icon('M15 10l4.553-2.669A1 1 0 0121 8.23v7.54a1 1 0 01-1.447.899L15 14 M3 8a2 2 0 012-2h10a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z'),
  Article: icon('M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z M14 2v6h6 M16 13H8 M16 17H8 M10 9H8'),
  Check: icon('M20 6L9 17l-5-5'),
  Translate: icon('M5 8l6 6M4 14l6-6 2-2M2 5h12M7 2h1M22 22l-5-10-5 10M14 18h6'),
  Wave: icon('M2 12c1.333-4 2.667-6 4-6s2.667 2 4 6 2.667 6 4 6 2.667-2 4-6'),
  Sparkle: icon('M12 3l1.09 3.26L16 7l-2.91.74L12 11l-1.09-3.26L8 7l2.91-.74z M19 11l.55 1.63L21 13l-1.45.37L19 15l-.55-1.63L17 13l1.45-.37z M5 15l.55 1.63L7 17l-1.45.37L5 19l-.55-1.63L3 17l1.45-.37z'),
  Calendar: icon('M19 4H5a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2V6a2 2 0 00-2-2z M16 2v4M8 2v4M3 10h18'),
};

function BackIcon() {
  return <Icons.Back size={20} color={Colors.ink} />;
}

// ─── Styles ──────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.paper,
    borderRadius: Radius.md,
    borderWidth: 0.5,
    borderColor: Colors.line,
  },
  btn: {
    borderRadius: Radius.full,
    paddingVertical: 12,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnText: {
    fontSize: 14,
    fontWeight: '700',
  },
  chip: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: Radius.full,
  },
  chipText: {
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.lg,
    paddingBottom: Spacing.md,
  },
  headerSub: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1,
    color: Colors.inkMute,
    textTransform: 'uppercase',
    marginBottom: 3,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: Colors.ink,
    letterSpacing: -0.4,
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: Radius.full,
    backgroundColor: Colors.paper,
    borderWidth: 0.5,
    borderColor: Colors.line,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
