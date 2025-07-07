<script setup lang="ts">
/**
 * SensorCard Component
 *
 * A reusable card component for displaying individual sensor readings with status indicators,
 * trend information, and interactive hover effects. This component provides a consistent
 * visual representation of sensor data across the application.
 *
 * Features:
 * - Dynamic status-based styling (optimal, warning, critical, inactive)
 * - Trend indicators with visual cues
 * - Responsive design with hover animations
 * - Accessibility support with proper ARIA attributes
 * - Material Design Icons integration
 */

import { computed } from 'vue'
import {
  getSensorStatusConfig,
  getSensorTrendConfig,
  getSensorIconClass,
  capitalizeFirst,
  formatSensorValue,
  isValidSensorStatus,
  isValidSensorTrend,
} from '@/utils/sensorHelpers'

/**
 * Component props interface
 */
interface Props {
  /** Display title for the sensor */
  title: string
  /** Current sensor value (numeric or string) */
  value: number | string
  /** Unit of measurement for the sensor value */
  unit: string
  /** Current status of the sensor (optimal, warning, critical, inactive) */
  status?: string
  /** Icon identifier for the sensor display */
  icon: string
  /** Trend direction for the sensor (increasing, decreasing, stable) */
  trend?: string
}

/**
 * Define component props with validation and defaults
 */
const props = withDefaults(defineProps<Props>(), {
  status: 'normal',
  trend: 'stable',
})

/**
 * Computed property for status configuration
 * Provides styling classes based on the current sensor status
 */
const statusConfig = computed(() => {
  const validStatus = isValidSensorStatus(props.status) ? props.status : 'inactive'
  return getSensorStatusConfig(validStatus)
})

/**
 * Computed property for trend configuration
 * Provides styling and icon classes based on the current sensor trend
 */
const trendConfig = computed(() => {
  const validTrend = isValidSensorTrend(props.trend) ? props.trend : 'stable'
  return getSensorTrendConfig(validTrend)
})

/**
 * Computed property for sensor icon class
 * Maps the icon prop to the appropriate Material Design Icon class
 */
const sensorIcon = computed(() => {
  return getSensorIconClass(props.icon)
})

/**
 * Computed property for formatted sensor value
 * Ensures consistent number formatting across all sensor displays
 */
const formattedValue = computed(() => {
  return formatSensorValue(props.value)
})

/**
 * Computed property for capitalized status text
 * Provides properly formatted status text for display
 */
const statusText = computed(() => {
  return capitalizeFirst(props.status)
})

/**
 * Computed property for capitalized trend text
 * Provides properly formatted trend text for display
 */
const trendText = computed(() => {
  return `${capitalizeFirst(props.trend)} trend`
})
</script>

<template>
  <div
    class="group relative bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-2xl border border-gray-200/60 dark:border-gray-800/60 shadow-sm hover:shadow-xl hover:shadow-gray-900/5 dark:hover:shadow-gray-950/20 transition-all duration-300 hover:-translate-y-1 overflow-hidden"
    role="article"
    :aria-label="`${title} sensor reading: ${formattedValue} ${unit}, status: ${statusText}`"
  >
    <div class="p-6">
      <!-- Sensor Header Section -->
      <div class="flex items-start gap-4 mb-6">
        <!-- Status-based Icon Container -->
        <div
          :class="[
            statusConfig.iconBg,
            statusConfig.ring,
            'w-12 h-12 rounded-xl flex items-center justify-center ring-1',
          ]"
          :aria-hidden="true"
        >
          <i
            :class="[sensorIcon, statusConfig.iconColor, 'mdi text-xl']"
            :aria-label="`${title} icon`"
          ></i>
        </div>

        <!-- Sensor Information -->
        <div class="flex-1 min-w-0">
          <h3 class="font-semibold text-gray-900 dark:text-gray-100 mb-1 truncate" :title="title">
            {{ title }}
          </h3>

          <!-- Status Badge -->
          <div
            :class="[
              statusConfig.badge,
              'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium',
            ]"
            :aria-label="`Status: ${statusText}`"
          >
            <div :class="[statusConfig.dot, 'w-1.5 h-1.5 rounded-full']" :aria-hidden="true"></div>
            {{ statusText }}
          </div>
        </div>
      </div>

      <!-- Sensor Value Display Section -->
      <div class="space-y-2">
        <!-- Primary Value Display -->
        <div class="flex items-baseline gap-2">
          <span
            class="text-3xl font-bold text-gray-900 dark:text-gray-100 tabular-nums"
            :aria-label="`Current value: ${formattedValue}`"
          >
            {{ formattedValue }}
          </span>
          <span
            class="text-lg font-medium text-gray-500 dark:text-gray-400"
            :aria-label="`Unit: ${unit}`"
          >
            {{ unit }}
          </span>
        </div>

        <!-- Trend Indicator -->
        <div class="flex items-center gap-2 text-sm" :aria-label="trendText">
          <i :class="[trendConfig.icon, trendConfig.color, 'mdi text-sm']" :aria-hidden="true"></i>
          <span :class="[trendConfig.color, 'font-medium']">
            {{ trendText }}
          </span>
        </div>
      </div>
    </div>

    <!-- Hover Effect Overlay -->
    <div
      class="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-gray-50/20 dark:to-gray-800/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
      :aria-hidden="true"
    ></div>
  </div>
</template>

<style scoped>
/**
 * Component-specific styles with enhanced accessibility and performance
 */

/* Material Design Icons import for consistent icon rendering */
@import url('https://cdn.jsdelivr.net/npm/@mdi/font@7.4.47/css/materialdesignicons.min.css');

/* Smooth entrance animation for better user experience */
@keyframes slideInUp {
  from {
    opacity: 0;
    transform: translateY(20px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.group {
  animation: slideInUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}

/* Enhanced hover effects with hardware acceleration */
.group:hover {
  transform: translateY(-4px) scale(1.02);
}

/* Accessibility: Focus states for keyboard navigation */
.group:focus-within {
  outline: 2px solid theme('colors.emerald.500');
  outline-offset: 2px;
}

/* Typography: Tabular numbers for consistent digit alignment */
.tabular-nums {
  font-variant-numeric: tabular-nums;
  font-feature-settings: 'tnum' 1;
}

/* Performance: Reduced motion support for accessibility */
@media (prefers-reduced-motion: reduce) {
  .group {
    animation: none;
  }

  * {
    transition-duration: 0.01ms !important;
  }
}

/* Accessibility: High contrast mode support */
@media (prefers-contrast: high) {
  .group {
    border-width: 2px;
  }
}
</style>
