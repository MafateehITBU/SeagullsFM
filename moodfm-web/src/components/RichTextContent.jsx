import { useMemo } from 'react'
import DOMPurify from 'dompurify'
import { formatTextWithSpecialChars } from '../utils/formatTextWithSpecialChars'

const ALLOWED_TAGS = [
  'h1',
  'h2',
  'h3',
  'h4',
  'h5',
  'h6',
  'p',
  'br',
  'strong',
  'b',
  'em',
  'i',
  'u',
  'span',
  'hr',
  'ul',
  'ol',
  'li',
]

function looksLikeHtml(value) {
  return /<[a-z][\s\S]*>/i.test(value)
}

function stripFontStyles(html) {
  return html.replace(/font-family\s*:[^;"]+;?/gi, '')
}

function wrapSpecialCharsInHtml(html) {
  return html.replace(/(<[^>]+>)|(&amp;)|(['\u2018\u2019\u201C\u201D\-]|4)/g, (match, tag, amp, special) => {
    if (tag) return tag
    if (amp) return '<span class="ampersand-fallback">&amp;</span>'
    return `<span class="ampersand-fallback">${special}</span>`
  })
}

function sanitizeRichHtml(html) {
  DOMPurify.addHook('uponSanitizeAttribute', (node, data) => {
    if (data.attrName === 'style' && data.attrValue) {
      data.attrValue = stripFontStyles(data.attrValue).trim()
      if (!data.attrValue) {
        data.keepAttr = false
      }
    }
  })

  const clean = DOMPurify.sanitize(html, {
    ALLOWED_TAGS,
    ALLOWED_ATTR: ['style', 'class'],
  })

  DOMPurify.removeHook('uponSanitizeAttribute')
  return wrapSpecialCharsInHtml(clean)
}

function renderPlainText(text) {
  const lines = text.split(/(?:\r?\n|<br\s*\/?>)/gi)
  return lines.map((line, index) => (
    <span key={`${index}-${line.slice(0, 12)}`}>
      {formatTextWithSpecialChars(line)}
      {index < lines.length - 1 ? <br /> : null}
    </span>
  ))
}

export default function RichTextContent({ html, className = '', as: Tag = 'div', style }) {
  const content = useMemo(() => {
    if (!html?.trim()) return null

    if (!looksLikeHtml(html)) {
      return { type: 'plain', value: html }
    }

    const sanitized = sanitizeRichHtml(html)
    if (!sanitized.trim()) return null
    return { type: 'html', value: sanitized }
  }, [html])

  if (!content) return null

  if (content.type === 'plain') {
    return <Tag className={`rich-text-content ${className}`.trim()} style={style}>{renderPlainText(content.value)}</Tag>
  }

  return (
    <Tag
      className={`rich-text-content ${className}`.trim()}
      style={style}
      dangerouslySetInnerHTML={{ __html: content.value }}
    />
  )
}
