import { useEffect, useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import theme from '../theme';

const barCount = 6;

export default function AnimatedWaveform({ active }: { active: boolean }) {
  const [heights, setHeights] = useState<number[]>([]);

  const baseHeights = useMemo(
    () => Array.from({ length: barCount }, () => Math.random() * 20 + 10),
    [],
  );

  useEffect(() => {
    setHeights(baseHeights);
  }, [baseHeights]);

  useEffect(() => {
    if (!active) {
      setHeights(baseHeights.map(height => height / 2));
      return;
    }

    const interval = setInterval(() => {
      setHeights(prev => prev.map(() => Math.random() * 26 + 12));
    }, 250);

    return () => clearInterval(interval);
  }, [active, baseHeights]);

  return (
    <View style={styles.row}>
      {heights.map((height, index) => (
        <View key={index} style={[styles.bar, { height }]} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: 14,
    marginTop: 22,
  },
  bar: {
    width: 10,
    borderRadius: 8,
    backgroundColor: theme.colors.primary,
  },
});
