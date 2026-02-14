import React from 'react';
import { Text } from 'react-native';
import { fonts } from '../theme/fonts';

// Chars that often show as demo/box in Fractul/Gobold – render with system font
// Use only ASCII and \u escapes so the parser does not choke on curly quotes
const SYMBOL_CHARS = new Set([
  '&', '-', '_', "'", '"', '`',
  '\u2013', '\u2014', '\u2018', '\u2019', '\u201C', '\u201D', // – — ' ' " "
]);

function splitWithSymbols(str) {
  const result = [];
  for (let i = 0; i < str.length; i++) {
    const ch = str[i];
    if (SYMBOL_CHARS.has(ch)) {
      result.push({ type: 'symbol', value: ch });
    } else {
      const start = i;
      while (i < str.length && !SYMBOL_CHARS.has(str[i])) i++;
      result.push({ type: 'text', value: str.slice(start, i) });
      i--;
    }
  }
  return result;
}

/**
 * Renders text so that symbols like & - _ ' " use system font (no demo/box icons).
 * Use for titles, names, descriptions that may contain these characters.
 */
export default function TextWithSymbolFallback({ children, style, ...rest }) {
  const str = typeof children === 'string' ? children : String(children ?? '');
  if (!str) return null;

  const parts = splitWithSymbols(str);
  const hasSymbols = parts.some((p) => p.type === 'symbol');
  if (!hasSymbols) {
    return <Text style={style} {...rest}>{str}</Text>;
  }

  return (
    <Text style={style} {...rest}>
      {parts.map((part, i) =>
        part.type === 'symbol' ? (
          <Text key={i} style={[style, { fontFamily: fonts.systemFont }]}>
            {part.value}
          </Text>
        ) : (
          part.value
        )
      )}
    </Text>
  );
}
