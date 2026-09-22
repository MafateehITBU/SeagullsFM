/**
 * Program day/time formatters — same structure as beat-web Home.jsx,
 * adapted for Arabic display (Watar FM).
 */

const DAY_ORDER = {
  Sunday: 0,
  Monday: 1,
  Tuesday: 2,
  Wednesday: 3,
  Thursday: 4,
  Friday: 5,
  Saturday: 6,
}

const DAY_AR = {
  Sunday: 'الأحد',
  Monday: 'الإثنين',
  Tuesday: 'الثلاثاء',
  Wednesday: 'الأربعاء',
  Thursday: 'الخميس',
  Friday: 'الجمعة',
  Saturday: 'السبت',
}

const WEEKDAY_SET = new Set([
  'sunday',
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
])

function canonicalizeDay(day) {
  if (!day) return null
  const raw = String(day).trim()
  const titled = raw.charAt(0).toUpperCase() + raw.slice(1).toLowerCase()
  if (DAY_ORDER[titled] !== undefined) return titled
  const lower = raw.toLowerCase()
  const match = Object.keys(DAY_ORDER).find((d) => d.toLowerCase() === lower)
  return match || null
}

/**
 * Mirrors Beat's weekday shortcut + CMS consecutive-range logic,
 * outputting Arabic day names.
 */
export function formatProgramDays(days) {
  if (!Array.isArray(days) || days.length === 0) return '—'

  const normalizedLower = days
    .map((day) => String(day).trim().toLowerCase())
    .filter(Boolean)

  if (
    normalizedLower.length === 5 &&
    normalizedLower.every((day) => WEEKDAY_SET.has(day))
  ) {
    return `${DAY_AR.Sunday} - ${DAY_AR.Thursday}`
  }

  const canonical = days.map(canonicalizeDay).filter(Boolean)
  if (canonical.length === 0) return '—'

  const sorted = [...canonical].sort((a, b) => DAY_ORDER[a] - DAY_ORDER[b])

  const isConsecutive = sorted.every((day, index) => {
    if (index === 0) return true
    const prev = DAY_ORDER[sorted[index - 1]]
    const curr = DAY_ORDER[day]
    return curr === prev + 1 || (prev === 6 && curr === 0)
  })

  if (isConsecutive && sorted.length > 1) {
    return `${DAY_AR[sorted[0]]} - ${DAY_AR[sorted[sorted.length - 1]]}`
  }

  return sorted.map((d) => DAY_AR[d]).join('، ')
}

/** Same 12h parsing as Beat, with Arabic صباحاً / مساءً periods. */
export function formatTimeForDisplay(time) {
  if (!time || typeof time !== 'string') return null
  const [hoursRaw, minutesRaw] = time.split(':')
  const hours = Number.parseInt(hoursRaw, 10)
  if (Number.isNaN(hours)) return null
  const minutes = Number.parseInt(minutesRaw ?? '0', 10)
  const safeMinutes = Number.isNaN(minutes) ? 0 : Math.min(59, Math.max(0, minutes))
  const twelveHour = hours % 12 || 12
  return {
    time: `${twelveHour}:${String(safeMinutes).padStart(2, '0')}`,
    period: hours >= 12 ? 'مساءً' : 'صباحاً',
  }
}

export function formatProgramTime(startTime, endTime) {
  const start = formatTimeForDisplay(startTime)
  const end = formatTimeForDisplay(endTime)
  if (!start && !end) return '—'
  if (start && !end) return `${start.time} ${start.period}`
  if (!start && end) return `${end.time} ${end.period}`
  if (start.period === end.period) {
    return `${start.time} - ${end.time} ${end.period}`
  }
  return `${start.time} ${start.period} - ${end.time} ${end.period}`
}
