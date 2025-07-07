/**
 * Date and time formatting utilities
 */

/**
 * Valid timeframe options
 */
export type TimeframeOption = '24h' | '7d' | '30d'

/**
 * Format a date as a time string with specified options
 * @param date The date to format
 * @param options Formatting options
 * @returns Formatted time string
 */
export function formatTime(date: Date, options: Intl.DateTimeFormatOptions = {}): string {
  const defaultOptions: Intl.DateTimeFormatOptions = {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  }

  return date.toLocaleTimeString('en-US', { ...defaultOptions, ...options })
}

/**
 * Format the current time as a string with "Today, " prefix
 * @param options Formatting options
 * @returns Formatted time string with "Today, " prefix
 */
export function formatCurrentTime(options: Intl.DateTimeFormatOptions = {}): string {
  return `Today, ${formatTime(new Date(), options)}`
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
