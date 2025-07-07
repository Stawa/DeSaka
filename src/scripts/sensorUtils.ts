/**
 * Sensor data utilities
 */

/**
 * Valid sensor status values
 */
export type SensorStatusValue = 'critical' | 'warning' | 'optimal'

/**
 * Valid health status colors
 */
interface HealthStatusColor {
  color: string
}

/**
 * Valid growth prediction values
 */
export type GrowthPrediction = 'Excellent' | 'Good' | 'Fair' | 'Poor' | 'Critical'

/**
 * Valid system status values
 */
export type SystemStatus = 'critical' | 'warning' | 'normal'

/**
 * Calculate sensor status based on value and thresholds
 * @param value Current sensor value
 * @param min Minimum acceptable value
 * @param max Maximum acceptable value
 * @param optimal_min Optimal minimum value
 * @param optimal_max Optimal maximum value
 * @returns Status string: 'critical', 'warning', or 'optimal'
 */
export function getSensorStatus(
  value: number,
  min: number,
  max: number,
  optimal_min: number,
  optimal_max: number,
): SensorStatusValue {
  if (value < min || value > max) return 'critical'
  if (value >= optimal_min && value <= optimal_max) return 'optimal'
  return 'warning'
}

/**
 * Calculate parameter score for health calculations
 * @param value Current parameter value
 * @param optimalMin Optimal minimum value
 * @param optimalMax Optimal maximum value
 * @param absMin Absolute minimum value
 * @param absMax Absolute maximum value
 * @returns Score from 0-100
 */
export function calculateParameterScore(
  value: number,
  optimalMin: number,
  optimalMax: number,
  absMin: number,
  absMax: number,
): number {
  if (value >= optimalMin && value <= optimalMax) return 100

  if (value < optimalMin) {
    return Math.max(0, Math.round(((value - absMin) / (optimalMin - absMin)) * 80))
  } else {
    return Math.max(0, Math.round(((absMax - value) / (absMax - optimalMax)) * 80))
  }
}

/**
 * Get health status color based on score
 * @param score Health score (0-100)
 * @returns Status object with color property
 */
export function getHealthStatusColor(score: number): HealthStatusColor {
  if (score >= 90) {
    return { color: 'text-green-500 dark:text-green-400' }
  } else if (score >= 75) {
    return { color: 'text-green-600 dark:text-green-500' }
  } else if (score >= 60) {
    return { color: 'text-yellow-500 dark:text-yellow-400' }
  } else if (score >= 40) {
    return { color: 'text-orange-500 dark:text-orange-400' }
  } else {
    return { color: 'text-red-500 dark:text-red-400' }
  }
}

/**
 * Get growth prediction based on plant health score
 * @param score Plant health score (0-100)
 * @returns Growth prediction string
 */
export function getGrowthPrediction(score: number): GrowthPrediction {
  if (score >= 90) return 'Excellent'
  if (score >= 75) return 'Good'
  if (score >= 60) return 'Fair'
  if (score >= 40) return 'Poor'
  return 'Critical'
}

/**
 * Determine system status based on sensor statuses
 * @param statuses Array of sensor status strings
 * @returns System status: 'critical', 'warning', or 'normal'
 */
export function getSystemStatus(statuses: SensorStatusValue[]): SystemStatus {
  if (statuses.includes('critical')) return 'critical'
  if (statuses.includes('warning')) return 'warning'
  return 'normal'
}
