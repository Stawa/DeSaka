/**
 * Centralized sensor configuration constants
 * This file contains all sensor-related constants to eliminate duplication
 * and provide a single source of truth for sensor configurations.
 */

/**
 * Sensor status type definition
 */
export type SensorStatus = 'optimal' | 'normal' | 'warning' | 'critical' | 'inactive'

/**
 * Sensor trend type definition
 */
export type SensorTrend = 'increasing' | 'decreasing' | 'stable'

/**
 * Sensor category type definition
 */
export type SensorCategory = 'Soil' | 'Air' | 'Environment'

/**
 * Sensor status configuration interface
 */
interface SensorStatusConfig {
  badge: string
  dot: string
  iconBg: string
  iconColor: string
  ring: string
}

/**
 * Sensor trend configuration interface
 */
interface SensorTrendConfig {
  icon: string
  color: string
  bg: string
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
 * Sensor status configuration mapping
 * Defines visual styling for different sensor states
 */
export const SENSOR_STATUS_CONFIG: Record<SensorStatus, SensorStatusConfig> = {
  optimal: {
    badge: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300',
    dot: 'bg-emerald-500',
    iconBg: 'bg-emerald-50 dark:bg-emerald-900/20',
    iconColor: 'text-emerald-600 dark:text-emerald-400',
    ring: 'ring-emerald-200/50 dark:ring-emerald-700/30',
  },
  normal: {
    badge: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300',
    dot: 'bg-emerald-500',
    iconBg: 'bg-emerald-50 dark:bg-emerald-900/20',
    iconColor: 'text-emerald-600 dark:text-emerald-400',
    ring: 'ring-emerald-200/50 dark:ring-emerald-700/30',
  },
  warning: {
    badge: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
    dot: 'bg-amber-500',
    iconBg: 'bg-amber-50 dark:bg-amber-900/20',
    iconColor: 'text-amber-600 dark:text-amber-400',
    ring: 'ring-amber-200/50 dark:ring-amber-700/30',
  },
  critical: {
    badge: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
    dot: 'bg-red-500',
    iconBg: 'bg-red-50 dark:bg-red-900/20',
    iconColor: 'text-red-600 dark:text-red-400',
    ring: 'ring-red-200/50 dark:ring-red-700/30',
  },
  inactive: {
    badge: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
    dot: 'bg-gray-400',
    iconBg: 'bg-gray-50 dark:bg-gray-800/30',
    iconColor: 'text-gray-500 dark:text-gray-400',
    ring: 'ring-gray-200/50 dark:ring-gray-700/30',
  },
} as const

/**
 * Sensor trend configuration mapping
 * Defines visual styling for different trend indicators
 */
export const SENSOR_TREND_CONFIG: Record<SensorTrend, SensorTrendConfig> = {
  increasing: {
    icon: 'mdi-trending-up',
    color: 'text-emerald-500',
    bg: 'bg-emerald-50 dark:bg-emerald-900/20',
  },
  decreasing: {
    icon: 'mdi-trending-down',
    color: 'text-red-500',
    bg: 'bg-red-50 dark:bg-red-900/20',
  },
  stable: {
    icon: 'mdi-trending-neutral',
    color: 'text-gray-500',
    bg: 'bg-gray-50 dark:bg-gray-800/30',
  },
} as const

/**
 * Category color configuration mapping
 * Defines visual styling for different sensor categories
 */
export const CATEGORY_COLOR_CONFIG: Record<SensorCategory, string> = {
  Soil: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300',
  Air: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
  Environment: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
} as const

/**
 * Sensor icon mapping
 * Maps sensor types to their corresponding Material Design Icons
 */
export const SENSOR_ICON_MAP: Record<string, string> = {
  thermometer: 'mdi-thermometer',
  'water-percent': 'mdi-water-percent',
  flask: 'mdi-flask',
  'weather-partly-cloudy': 'mdi-weather-partly-cloudy',
  water: 'mdi-water',
  'white-balance-sunny': 'mdi-white-balance-sunny',
} as const

/**
 * Default sensor configuration
 * Provides fallback values for sensor properties
 */
export const DEFAULT_SENSOR_CONFIG = {
  status: 'inactive' as SensorStatus,
  trend: 'stable' as SensorTrend,
  icon: 'mdi-circle',
  unit: '',
  value: 0,
} as const

/**
 * Sensor data structure interface
 * Defines the expected structure for sensor data objects
 */
export interface SensorDataStructure {
  id: string
  name: string
  value: number
  unit: string
  status: SensorStatus
  icon: string
  category: SensorCategory
  lastUpdate: string
  trend: SensorTrend
}

/**
 * Chart color themes for different sensors
 * Provides consistent color schemes across all charts
 */
export const CHART_COLOR_THEMES: Record<string, ChartColorTheme> = {
  '#10B981': {
    primary: '#10B981',
    light: '#34D399',
    bg: 'rgba(16, 185, 129, 0.1)',
    gradient: ['rgba(16, 185, 129, 0.2)', 'rgba(16, 185, 129, 0.05)', 'rgba(16, 185, 129, 0.01)'],
  },
  '#0D9488': {
    primary: '#0D9488',
    light: '#14B8A6',
    bg: 'rgba(13, 148, 136, 0.1)',
    gradient: ['rgba(13, 148, 136, 0.2)', 'rgba(13, 148, 136, 0.05)', 'rgba(13, 148, 136, 0.01)'],
  },
  '#7C3AED': {
    primary: '#7C3AED',
    light: '#8B5CF6',
    bg: 'rgba(124, 58, 237, 0.1)',
    gradient: ['rgba(124, 58, 237, 0.2)', 'rgba(124, 58, 237, 0.05)', 'rgba(124, 58, 237, 0.01)'],
  },
  '#F59E0B': {
    primary: '#F59E0B',
    light: '#FBBF24',
    bg: 'rgba(245, 158, 11, 0.1)',
    gradient: ['rgba(245, 158, 11, 0.2)', 'rgba(245, 158, 11, 0.05)', 'rgba(245, 158, 11, 0.01)'],
  },
} as const
