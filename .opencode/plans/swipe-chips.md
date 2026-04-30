# Swipe + Chips Improvements

## PronunciationScreen.tsx

### 1. snapToTab (line 158)
```
- tabBarRef scroll: index * 90 - 50 → index * 110
- spring tension: 120 → 200
- spring friction: 20 → 15
```

### 2. PanResponder.onMoveShouldSetPanResponder (line 173)
```
- Math.abs(gs.dx) > 8 → Math.abs(gs.dx) > 5
```

### 3. PanResponder.onPanResponderMove (lines 176-183)
Remove edge damping: delete lines 179 (`if (nx > 0) nx *= 0.15;`) and 181 (`if (nx < minX) ...`).

Keep only:
```
const base = -(tabIndexRef.current * SW);
pagerX.setValue(base + gs.dx);
```

### 4. PanResponder.onPanResponderRelease (lines 184-190)
Replace with velocity-first logic:
```
onPanResponderRelease: (_, gs) => {
  let next = tabIndexRef.current;
  const velThreshold = 0.3;
  const distThreshold = SW * 0.15;
  if (gs.vx > velThreshold && next > 0) next--;
  else if (gs.vx < -velThreshold && next < TABS.length - 1) next++;
  else if (gs.dx > distThreshold && next > 0) next--;
  else if (gs.dx < -distThreshold && next < TABS.length - 1) next++;
  snapRef.current(next);
}
```

## NewsListScreen.tsx

### 1. sourceChip styles (line 196)
```
- paddingVertical: 10 → 14
- paddingHorizontal: 14 → 20
```

### 2. sourceText (line 206)
```
- fontSize: 13 → 15
```

### 3. sourceSubtext (line 208)
```
- fontSize: 10 → 11
```

### 4. pill (line 211)
```
- paddingHorizontal: 12 → 20
- paddingVertical: 6 → 12
```

### 5. pillText (line 212)
```
- fontSize: 12 → 15
- fontWeight: '600' → '700'
```

### 6. filterScroll (line 210)
```
- gap: 6 → 10
- paddingBottom: 14 → 16
```
