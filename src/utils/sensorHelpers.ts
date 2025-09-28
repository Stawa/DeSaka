/**
 * Sensor utility functions
 * Centralized helper functions for sensor data processing and manipulation
 * to eliminate code duplication across components.
 */

import {
  SENSOR_STATUS_CONFIG,
  SENSOR_TREND_CONFIG,
  CATEGORY_COLOR_CONFIG,
  SENSOR_ICON_MAP,
  DEFAULT_SENSOR_CONFIG,
  CHART_COLOR_THEMES,
  type SensorDataStructure,
  type SensorStatus,
  type SensorTrend,
  type SensorCategory,
} from '@/constants/sensorConstants'
import { formatRelativeTime } from '@/scripts'

/**
 * Raw sensor data interface
 */
export interface RawSensorData {
  [key: string]: {
    value?: number
    unit?: string
    status?: string
    time?: string
  }
}

/**
 * Sensor mapping configuration interface
 */
interface SensorMapping {
  id: string
  name: string
  icon: string
  category: SensorCategory
  dataKey: string
}

/**
 * Chart color theme interface
 */
interface ChartColorTheme {
  primary: string
  light: string
  bg: string
  gradient: [string, string, string]
}

/**
 * Retrieves the status configuration for a given sensor status
 * @param status - The sensor status key
 * @returns The corresponding status configuration object
 */
export function getSensorStatusConfig(status: SensorStatus) {
  return SENSOR_STATUS_CONFIG[status] || SENSOR_STATUS_CONFIG.inactive
}

/**
 * Retrieves the trend configuration for a given sensor trend
 * @param trend - The sensor trend key
 * @returns The corresponding trend configuration object
 */
export function getSensorTrendConfig(trend: SensorTrend) {
  return SENSOR_TREND_CONFIG[trend] || SENSOR_TREND_CONFIG.stable
}

/**
 * Retrieves the category color configuration for a given category
 * @param category - The sensor category key
 * @returns The corresponding category color configuration string
 */
export function getCategoryColorConfig(category: SensorCategory): string {
  return CATEGORY_COLOR_CONFIG[category] || CATEGORY_COLOR_CONFIG.Environment
}

/**
 * Maps a sensor icon key to its corresponding Material Design Icon class
 * @param iconKey - The sensor icon key
 * @returns The corresponding MDI class name
 */
export function getSensorIconClass(iconKey: string): string {
  return SENSOR_ICON_MAP[iconKey] || DEFAULT_SENSOR_CONFIG.icon
}

/**
 * Retrieves chart color theme configuration
 * @param color - The color key for the theme
 * @returns The corresponding chart color theme object
 */
export function getChartColorTheme(color: string): ChartColorTheme {
  return CHART_COLOR_THEMES[color] || CHART_COLOR_THEMES['#10B981']
}

/**
 * Transforms raw sensor data into standardized sensor structure
 * @param rawData - Raw sensor data from API or props
 * @returns Array of standardized sensor data structures
 */
export function transformSensorData(rawData: RawSensorData): SensorDataStructure[] {
  const sensorMappings: SensorMapping[] = [
    {
      id: 'soilTemperature',
      name: 'Soil Temperature',
      icon: 'thermometer',
      category: 'Soil',
      dataKey: 'soilTemperature',
    },
    {
      id: 'soilMoisture',
      name: 'Soil Moisture',
      icon: 'water-percent',
      category: 'Soil',
      dataKey: 'soilMoisture',
    },
    {
      id: 'soilPH',
      name: 'Soil pH Level',
      icon: 'flask',
      category: 'Soil',
      dataKey: 'soilPH',
    },
    {
      id: 'airTemperature',
      name: 'Air Temperature',
      icon: 'weather-partly-cloudy',
      category: 'Air',
      dataKey: 'airTemperature',
    },
    {
      id: 'airHumidity',
      name: 'Air Humidity',
      icon: 'water',
      category: 'Air',
      dataKey: 'airHumidity',
    },
  ]

  console.log(rawData)
  return sensorMappings.map((mapping) => ({
    id: mapping.id,
    name: mapping.name,
    value: rawData[mapping.dataKey]?.value ?? DEFAULT_SENSOR_CONFIG.value,
    unit: rawData[mapping.dataKey]?.unit ?? getDefaultUnit(mapping.id),
    status: (rawData[mapping.dataKey]?.status ?? DEFAULT_SENSOR_CONFIG.status) as SensorStatus,
    icon: getSensorIconClass(mapping.icon),
    category: mapping.category,
    lastUpdate: formatRelativeTime(rawData[mapping.dataKey]?.time || ''),
    trend: DEFAULT_SENSOR_CONFIG.trend,
  }))
}

/**
 * Gets the default unit for a sensor based on its ID
 * @param sensorId - The sensor identifier
 * @returns The default unit string for the sensor
 */
function getDefaultUnit(sensorId: string): string {
  const unitMap: Record<string, string> = {
    soilTemperature: '°C',
    soilMoisture: '%',
    soilPH: 'pH',
    airTemperature: '°C',
    airHumidity: '%',
  }

  return unitMap[sensorId] || ''
}

/**
 * Capitalizes the first letter of a string
 * @param str - The string to capitalize
 * @returns The capitalized string
 */
export function capitalizeFirst(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1)
}

/**
 * Formats a numeric value with appropriate decimal places
 * @param value - The numeric value to format
 * @param decimals - Number of decimal places (default: 1)
 * @returns Formatted number string
 */
export function formatSensorValue(value: number | string, decimals = 1): string {
  if (typeof value === 'string') return value
  return typeof value === 'number' ? value.toFixed(decimals) : '0'
}

/**
 * Validates if a sensor status is valid
 * @param status - The status to validate
 * @returns Boolean indicating if the status is valid
 */
export function isValidSensorStatus(status: string): status is SensorStatus {
  return status in SENSOR_STATUS_CONFIG
}

/**
 * Validates if a sensor trend is valid
 * @param trend - The trend to validate
 * @returns Boolean indicating if the trend is valid
 */
export function isValidSensorTrend(trend: string): trend is SensorTrend {
  return trend in SENSOR_TREND_CONFIG
}

export function getMinMax(history: { time: string; value: number }[]): {
  min: number
  max: number
} {
  if (history.length === 0) return { min: 0, max: 0 }
  const values = history.map((r) => r.value)
  return {
    min: Math.min(...values),
    max: Math.max(...values),
  }
}
