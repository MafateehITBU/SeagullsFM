import React, { useEffect, useRef, useState } from 'react';
import { Text, StyleSheet } from 'react-native';
import { fonts } from '../theme/fonts';
import { colors } from '../theme/colors';

export default function BeatCountUp({
  end,
  suffix = '',
  duration = 2800,
  useKFormat = false,
  style,
}) {
  const [count, setCount] = useState(0);
  const hasStarted = useRef(false);

  useEffect(() => {
    if (hasStarted.current) return;
    hasStarted.current = true;

    const startTime = Date.now();
    const tick = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easeOutCubic = 1 - (1 - progress) ** 3;
      const value = Math.floor(easeOutCubic * end);
      setCount(value);
      if (progress < 1) requestAnimationFrame(tick);
      else setCount(end);
    };
    requestAnimationFrame(tick);
  }, [duration, end]);

  const formatted = useKFormat && count >= 1000 ? `${Math.floor(count / 1000)}` : String(count);

  return (
    <Text style={[styles.number, style]}>
      {formatted}
      <Text style={styles.suffix}>{suffix}</Text>
    </Text>
  );
}

const styles = StyleSheet.create({
  number: {
    fontFamily: fonts.gothamBlack,
    fontSize: 32,
    color: colors.accentCyan,
    letterSpacing: -1,
  },
  suffix: {
    fontFamily: fonts.gothamBlack,
    fontSize: 32,
    color: colors.accentCyan,
  },
});
