import React, { useMemo } from 'react';
import { Text } from 'react-native';
import { fonts } from '../theme/fonts';

const BLOCK_BREAK = '\n\n';

const INLINE_TAG_STYLES = {
  strong: { fontFamily: fonts.gothamBold },
  b: { fontFamily: fonts.gothamBold },
  em: { fontStyle: 'italic' },
  i: { fontStyle: 'italic' },
  u: { textDecorationLine: 'underline' },
};

function looksLikeHtml(value) {
  return /<[a-z][\s\S]*>/i.test(value || '');
}

function decodeEntities(text) {
  return text
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
}

function sanitizeHtml(html) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '');
}

function normalizeBlocks(html) {
  return sanitizeHtml(html)
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/h[1-6]>/gi, `</strong>${BLOCK_BREAK}`)
    .replace(/<h[1-6][^>]*>/gi, '<strong>')
    .replace(/<\/p>\s*<p[^>]*>/gi, BLOCK_BREAK)
    .replace(/<\/?p[^>]*>/gi, '')
    .replace(/<li[^>]*>/gi, '• ')
    .replace(/<\/li>/gi, '\n')
    .replace(/<\/?(ul|ol)[^>]*>/gi, '\n')
    .replace(/<hr\s*\/?>/gi, BLOCK_BREAK)
    .split(BLOCK_BREAK)
    .map((block) => block.trim())
    .filter(Boolean);
}

function parseInlineContent(html, baseStyle, keyPrefix) {
  const elements = [];
  let textBuf = '';
  let key = 0;

  const flushText = () => {
    if (!textBuf) return;
    elements.push(
      <Text key={`${keyPrefix}-t-${key++}`} style={baseStyle}>
        {decodeEntities(textBuf)}
      </Text>
    );
    textBuf = '';
  };

  let i = 0;
  while (i < html.length) {
    if (html[i] !== '<') {
      textBuf += html[i];
      i += 1;
      continue;
    }

    const closeIdx = html.indexOf('>', i);
    if (closeIdx === -1) {
      textBuf += html.slice(i);
      break;
    }

    const tagRaw = html.slice(i + 1, closeIdx).trim();
    i = closeIdx + 1;

    const isClosing = tagRaw.startsWith('/');
    const tagName = (isClosing ? tagRaw.slice(1) : tagRaw).split(/\s/)[0].toLowerCase();

    if (!isClosing && tagName === 'br') {
      flushText();
      elements.push(<Text key={`${keyPrefix}-br-${key++}`}>{'\n'}</Text>);
      continue;
    }

    if (!isClosing && INLINE_TAG_STYLES[tagName]) {
      flushText();
      const endTag = `</${tagName}>`;
      const endIdx = html.toLowerCase().indexOf(endTag, i);
      if (endIdx === -1) continue;

      const inner = html.slice(i, endIdx);
      i = endIdx + endTag.length;
      const nestedStyle = { ...baseStyle, ...INLINE_TAG_STYLES[tagName] };
      const nested = parseInlineContent(inner, nestedStyle, `${keyPrefix}-${key}`);

      elements.push(
        <Text key={`${keyPrefix}-tag-${key++}`} style={nestedStyle}>
          {nested.length > 0 ? nested : decodeEntities(inner)}
        </Text>
      );
      continue;
    }

    if (isClosing || ['span', 'div'].includes(tagName)) {
      continue;
    }
  }

  flushText();
  return elements;
}

function renderBlocks(html, baseStyle) {
  const blocks = normalizeBlocks(html);
  if (blocks.length === 0) {
    const plain = decodeEntities(sanitizeHtml(html).replace(/<[^>]+>/g, ''));
    return plain ? [<Text key="plain" style={baseStyle}>{plain}</Text>] : [];
  }

  return blocks.map((block, index) => {
    const inline = parseInlineContent(block, baseStyle, `block-${index}`);
    const isLast = index === blocks.length - 1;
    return (
      <Text key={`block-${index}`} style={baseStyle}>
        {inline}
        {!isLast ? BLOCK_BREAK : null}
      </Text>
    );
  });
}

/**
 * Renders CMS HTML as nested React Native Text with basic formatting
 * (bold, italic, underline, paragraphs, line breaks).
 */
export default function RichTextContent({ html, style, numberOfLines, ...rest }) {
  const content = useMemo(() => {
    if (!html?.trim()) return null;
    if (!looksLikeHtml(html)) {
      return decodeEntities(html);
    }
    return renderBlocks(html, style);
  }, [html, style]);

  if (!content) return null;

  if (typeof content === 'string') {
    return (
      <Text style={style} numberOfLines={numberOfLines} {...rest}>
        {content}
      </Text>
    );
  }

  return (
    <Text style={style} numberOfLines={numberOfLines} {...rest}>
      {content}
    </Text>
  );
}
