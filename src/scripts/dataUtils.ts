/**
 * Data generation and manipulation utilities
 */
import { getTimeLabel } from './dateUtils'

/**
 * Type definition for a data point with time and value
 */
export type DataPoint = { time: string; value: number }

/**
 * Valid timeframe options
 */
export type Timeframe = '24h' | '7d' | '30d'

/**
 * Generate mock data points based on timeframe
 * @param points Number of data points to generate
 * @param min Minimum value
 * @param max Maximum value
 * @param timeframe Timeframe ('24h', '7d', or '30d')
 * @returns Array of data points
 */
export function generateMockData(
  points: number,
  min: number,
  max: number,
  timeframe: Timeframe = '24h',
): DataPoint[] {
  const data: DataPoint[] = []
  const now = new Date()
  let interval: number

  switch (timeframe) {
    case '7d':
      interval = ((7 * 24) / points) * 60 * 60 * 1000
      break
    case '30d':
      interval = ((30 * 24) / points) * 60 * 60 * 1000
      break
    case '24h':
    default:
      interval = 60 * 60 * 1000
      break
  }

  for (let i = points; i > 0; i--) {
    const time = new Date(now.getTime() - i * interval)
    data.push({
      time: getTimeLabel(time, timeframe),
      value: Number.parseFloat((Math.random() * (max - min) + min).toFixed(1)),
    })
  }

  return data
}

/**
 * Generate time-based data points
 * @param points Number of data points to generate
 * @param intervalMinutes Interval between points in minutes
 * @param min Minimum value
 * @param max Maximum value
 * @param endTime End time for the data points
 * @param timeframe Timeframe ('24h', '7d', or '30d')
 * @returns Array of data points
 */
export function generateTimeBasedData(
  points: number,
  intervalMinutes: number,
  min: number,
  max: number,
  endTime: Date,
  timeframe: Timeframe,
): DataPoint[] {
  const data: DataPoint[] = []
  const msPerInterval = intervalMinutes * 60 * 1000

  for (let i = points - 1; i >= 0; i--) {
    const time = new Date(endTime.getTime() - i * msPerInterval)
    data.push({
      time: getTimeLabel(time, timeframe),
      value: Number.parseFloat((Math.random() * (max - min) + min).toFixed(1)),
    })
  }

  return data
}

/**
 * Valid trend values
 */
export type TrendDirection = 'increasing' | 'decreasing' | 'stable'

/**
 * Get a random trend value
 * @returns 'increasing', 'decreasing', or 'stable'
 */
export function getRandomTrend(): TrendDirection {
  const rand = Math.random()
  if (rand > 0.66) return 'increasing'
  if (rand > 0.33) return 'decreasing'
  return 'stable'
}
