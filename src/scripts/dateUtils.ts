/**
 * Date and time formatting utilities
 */

/**
 * Valid timeframe options
 */
export type TimeframeOption = '24h' | '7d' | '30d'

/**
 * Format a given datetime as a relative time string like "1 minute ago" or fallback to readable time
 * @param date Date object or ISO string
 * @returns Formatted relative time string
 */
export function formatRelativeTime(date: Date | string): string {
  const target = typeof date === 'string' ? new Date(date) : date
  const now = new Date()
  const diffMs = now.getTime() - target.getTime()
  const diffSec = Math.floor(diffMs / 1000)

  if (diffSec < 60) return 'Just now'

  const diffMin = Math.floor(diffSec / 60)
  if (diffMin < 60) return `${diffMin} minute${diffMin > 1 ? 's' : ''} ago`

  const diffHours = Math.floor(diffMin / 60)
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`

  const diffDays = Math.floor(diffHours / 24)
  if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`

  return target.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

/**
 * Format a given datetime as a readable string with "Today, " prefix if it's today
 * @param date Date object or ISO string
 * @param options Intl.DateTimeFormatOptions
 * @returns Formatted datetime string like "Today, 10:35:38 PM"
 */
export function formatReadableDateTime(
  date: Date | string,
  options: Intl.DateTimeFormatOptions = {},
): string {
  const target = typeof date === 'string' ? new Date(date) : date
  const now = new Date()

  const isToday =
    target.getFullYear() === now.getFullYear() &&
    target.getMonth() === now.getMonth() &&
    target.getDate() === now.getDate()

  const timeString = target.toLocaleTimeString('en-US', {
    hour12: true,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    ...options,
  })

  return isToday ? `Today, ${timeString}` : timeString
}

/**
 * Get time label based on timeframe
 * @param date The date to format
 * @param timeframe The timeframe ('24h', '7d', or '30d')
 * @returns Formatted time label
 */
export function getTimeLabel(date: Date, timeframe: TimeframeOption): string {
  if (timeframe === '24h') {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  } else if (timeframe === '7d') {
    return date.toLocaleDateString([], { weekday: 'short', hour: '2-digit' })
  } else {
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' })
  }
}

/**
 * Format uptime since last downtime into human-readable string
 * @param lastDowntimeEnd ISO string of last downtime end
 * @returns Formatted uptime string
 */
export function formatUptimeSinceLastDowntime(lastDowntimeEnd: string): string {
  const lastEnd = new Date(lastDowntimeEnd)
  const now = new Date()
  let diffMs = now.getTime() - lastEnd.getTime()

  if (diffMs <= 0) return 'Uptime: Just now'

  const msInSecond = 1000
  const msInMinute = msInSecond * 60
  const msInHour = msInMinute * 60
  const msInDay = msInHour * 24

  const days = Math.floor(diffMs / msInDay)
  diffMs %= msInDay

  const hours = Math.floor(diffMs / msInHour)
  diffMs %= msInHour

  const minutes = Math.floor(diffMs / msInMinute)
  diffMs %= msInMinute

  const seconds = Math.floor(diffMs / msInSecond)

  const parts: string[] = []
  if (days) parts.push(`${days} day${days > 1 ? 's' : ''}`)
  if (hours) parts.push(`${hours} hour${hours > 1 ? 's' : ''}`)
  if (minutes) parts.push(`${minutes} minute${minutes > 1 ? 's' : ''}`)
  if (seconds && parts.length === 0) parts.push(`${seconds} second${seconds > 1 ? 's' : ''}`) // only show seconds if <1 min

  return `${parts.join(' ')}`
}
