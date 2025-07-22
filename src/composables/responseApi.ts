/**
 * Response API interfaces and utilities for sensor data handling
 * Provides type-safe interfaces for API responses and data transformation utilities
 */

interface SensorData {
  value: number
  unit: string
  history: { time: string; value: number }[]
}

interface SensorReading {
  time: string
  value: number
}

interface SensorItems {
  unit: string
  history: SensorReading[]
}

interface Soil {
  temperature: SensorItems
  moisture: SensorItems
  ph: SensorItems
  [key: string]: SensorItems
}

interface Air {
  temperature: SensorItems
  humidity: SensorItems
  light: SensorItems
  [key: string]: SensorItems
}

interface SensorModificationItem {
  value: number
  unit: string
  history: { time: string; value: number }[]
  min: number
  max: number
  optimal_min: number
  optimal_max: number
  status: 'optimal' | 'warning' | 'critical' | 'unknown'
  trend: 'increasing' | 'decreasing' | 'stable'
}

interface SensorModification {
  [key: string]: SensorModificationItem
}

interface GeneralSettings {
  dataRefreshInterval: number
  dataRetentionPeriod: number
  timezone: string
  dateFormat: string
  timeFormat: string
}

interface NotificationSettings {
  emailEnabled: boolean
  smsEnabled: boolean
  pushEnabled: boolean
  emails: string[]
  phones: string[]
}

interface ThresholdRange {
  min: number
  max: number
}

interface ThresholdSettings {
  soilTemperature: ThresholdRange
  soilMoisture: ThresholdRange
  soilPH: ThresholdRange
  airTemperature: ThresholdRange
  airHumidity: ThresholdRange
}

interface Settings {
  general: GeneralSettings
  notifications: NotificationSettings
  thresholds: ThresholdSettings
}

/**
 * Converts an array of sensor readings with ISO timestamp strings
 * into a more human-readable format using `toLocaleString()` for the time.
 *
 * Useful for preparing data for display in charts, tables, or logs.
 *
 * @param history - An array of sensor readings (temperature, humidity, etc.) with `time` and `value`.
 * @returns A new array of objects with the time converted to a locale-formatted string and the original value.
 *
 * @example
 * mapReadableHistory([
 *   { time: "2025-06-14T01:08:02", value: 33.6 }
 * ])
 * // => [ { time: "6/14/2025, 1:08:02 AM", value: 33.6 } ]
 */
function mapReadableHistory(history: SensorReading[]): { time: string; value: number }[] {
  return history.map((item) => ({
    time: new Date(item.time).toLocaleString(),
    value: item.value,
  }))
}

export type { Soil, Air, SensorReading, Settings, SensorItems, SensorData, SensorModification }
export { mapReadableHistory }
