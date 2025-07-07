/**
 * Sensor data utilities for handling API responses and data processing
 */
import { getSensorStatus } from './sensorUtils'

/**
 * Type definition for a data point with time and value
 */
export type DataPoint = { time: string; value: number }

/**
 * Type definition for a sensor data object
 */
export interface SensorData {
  value: number
  unit: string
  min?: number
  max?: number
  optimal_min?: number
  optimal_max?: number
  status?: string
  trend?: string
  history: DataPoint[]
}

/**
 * Type definition for sensor data response from API
 */
export interface SensorResponse {
  history?: { time: string; value: number }[]
  unit?: string
  [key: string]: any
}

/**
 * Update sensor data from API response
 * @param sensorData The sensor data object to update
 * @param response The API response data
 * @param sensorKey The key for the sensor in the response
 * @param fileApiKey The key for the sensor in the file API response
 */
export function updateSensorDataFromResponse(
  sensorData: SensorData,
  response: any,
  sensorKey: string,
  fileApiKey?: string,
): void {
  if (!response) return

  const isFileApiFormat = fileApiKey && response[fileApiKey] !== undefined
  const responseData = isFileApiFormat ? response[fileApiKey] : response[sensorKey]

  if (responseData) {
    if (responseData.history && responseData.history.length > 0) {
      const latestReading = responseData.history[responseData.history.length - 1]
      sensorData.value = latestReading.value
      sensorData.history = responseData.history.map((item: any) => ({
        time: new Date(item.time).toLocaleString(),
        value: item.value,
      }))
    }
    if (responseData.unit) {
      sensorData.unit = responseData.unit
    }
  }
}

/**
 * Update sensor status based on current value and thresholds
 * @param sensorData The sensor data object to update
 * @param optimalMin Optional override for optimal minimum value
 * @param optimalMax Optional override for optimal maximum value
 */
export function updateSensorStatus(
  sensorData: SensorData,
  optimalMin?: number,
  optimalMax?: number,
): void {
  if (
    sensorData.min === undefined ||
    sensorData.max === undefined ||
    sensorData.value === undefined
  ) {
    return
  }

  const min = sensorData.min
  const max = sensorData.max
  const oMin = optimalMin ?? sensorData.optimal_min ?? min
  const oMax = optimalMax ?? sensorData.optimal_max ?? max

  sensorData.status = getSensorStatus(sensorData.value, min, max, oMin, oMax)
}

/**
 * Update sensor trend based on historical data
 * @param sensorData The sensor data object to update
 */
export function updateSensorTrend(sensorData: SensorData): void {
  if (sensorData.history.length >= 2) {
    const current = sensorData.history[sensorData.history.length - 1].value
    const previous = sensorData.history[sensorData.history.length - 2].value
    sensorData.trend = current > previous ? 'up' : current < previous ? 'down' : 'stable'
  }
}

/**
 * Format sensor data for export
 * @param sensorData The sensor data object
 * @param sensorName The name of the sensor for the export
 * @returns Formatted export data and sensor info
 */
export function formatSensorDataForExport(sensorData: SensorData, sensorName: string) {
  const exportData = sensorData.history.map((point) => ({
    timestamp: point.time,
    value: point.value,
  }))

  const sensorInfo = {
    name: sensorName,
    unit: sensorData.unit,
  }

  return { exportData, sensorInfo }
}

interface DateRange {
  startDate: string
  endDate: string
}

/**
 * Get date range parameters based on timeframe
 * @param timeframe The timeframe ('24h', '7d', or '30d')
 * @returns Object with startDate and endDate strings
 */
export function getDateRangeFromTimeframe(timeframe: string): DateRange {
  const endDate = new Date().toISOString().split('T')[0]
  const startDate = new Date()

  if (timeframe === '7d') {
    startDate.setDate(startDate.getDate() - 7)
  } else if (timeframe === '30d') {
    startDate.setDate(startDate.getDate() - 30)
  } else {
    startDate.setDate(startDate.getDate() - 1)
  }

  const startDateStr = startDate.toISOString().split('T')[0]

  return { startDate: startDateStr, endDate }
}
