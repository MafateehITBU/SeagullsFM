import React from 'react';
import { Text } from 'react-native';

export function renderProgramTitle(title, baseStyle, boldStyle) {
  const safeTitle = title || 'Untitled Show';
  const match = safeTitle.match(/\s(with)\s/i);
  if (!match || typeof match.index !== 'number') {
    return <Text style={baseStyle}>{safeTitle}</Text>;
  }

  const before = safeTitle.slice(0, match.index).trimEnd();
  const withAndAfter = safeTitle.slice(match.index + 1);

  return (
    <Text style={baseStyle}>
      {before}
      {'\n'}
      <Text style={boldStyle}>{withAndAfter}</Text>
    </Text>
  );
}
