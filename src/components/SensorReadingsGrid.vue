<script setup lang="ts">
/**
 * SensorReadingsGrid Component
 *
 * A grid-based layout component for displaying multiple sensor readings in card format.
 * This component serves as a container that transforms raw sensor data into a structured
 * grid of SensorCard components with consistent styling and animations.
 *
 * Features:
 * - Responsive grid layout (1-3 columns based on screen size)
 * - Staggered entrance animations for visual appeal
 * - Centralized sensor data transformation
 * - Click handling for sensor interaction
 * - Accessibility support with proper ARIA attributes
 */

import { computed } from 'vue'
import SensorCard from './SensorCard.vue'
import { transformSensorData, type RawSensorData } from '@/utils/sensorHelpers'
import { type SensorDataStructure } from '@/constants/sensorConstants'

/**
 * Component props interface
 */
interface Props {
  /** Raw sensor data object from API or parent component */
  sensorData: RawSensorData
  /** Optional callback function for sensor click events */
  onSensorClick?: (sensorId: string) => void
}

/**
 * Define component props with defaults
 */
const props = withDefaults(defineProps<Props>(), {
  onSensorClick: () => {},
})

/**
 * Computed property for transformed sensor data
 * Converts raw sensor data into standardized sensor card data structures
 */
const sensorCards = computed((): SensorDataStructure[] => {
  return transformSensorData(props.sensorData)
})

/**
 * Handles sensor card click events
 * Delegates to the provided onSensorClick callback with the sensor category
 *
 * @param sensorCategory - The category of the clicked sensor
 */
const handleSensorClick = (sensorCategory: string): void => {
  if (props.onSensorClick) {
    props.onSensorClick(sensorCategory.toLowerCase())
  }
}
</script>

<template>
  <div
    class="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-2xl border border-gray-200/60 dark:border-gray-800/60 shadow-sm overflow-hidden"
    role="region"
    aria-label="Sensor readings grid"
  >
    <!-- Visual Accent Bar -->
    <div class="h-1 bg-gradient-to-r from-emerald-500 to-teal-600" aria-hidden="true"></div>

    <!-- Header Section -->
    <div class="px-6 py-5 border-b border-gray-100 dark:border-gray-800">
      <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <!-- Title Section with Icon -->
        <div class="flex items-center gap-4">
          <!-- Header Icon Container -->
          <div
            class="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-100 to-emerald-50 dark:from-emerald-900/30 dark:to-emerald-800/20 flex items-center justify-center ring-1 ring-emerald-200/50 dark:ring-emerald-700/30"
            aria-hidden="true"
          >
            <svg
              class="w-6 h-6 text-emerald-600 dark:text-emerald-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
              />
            </svg>
          </div>

          <!-- Header Text Content -->
          <div>
            <h2 class="text-xl font-semibold text-gray-900 dark:text-gray-100">Sensor Readings</h2>
            <p class="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
              Real-time environmental monitoring
            </p>
          </div>
        </div>
      </div>
    </div>

    <!-- Sensor Cards Grid Container -->
    <div class="p-6">
      <div
        class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
        role="grid"
        aria-label="Sensor readings"
      >
        <!-- Individual Sensor Cards -->
        <div
          v-for="(sensor, index) in sensorCards"
          :key="sensor.id"
          @click="handleSensorClick(sensor.category)"
          @keydown.enter="handleSensorClick(sensor.category)"
          @keydown.space.prevent="handleSensorClick(sensor.category)"
          class="cursor-pointer card-enter focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 rounded-2xl"
          :style="{ animationDelay: `${index * 100}ms` }"
          role="gridcell"
          tabindex="0"
          :aria-label="`${sensor.name} sensor, click to view details`"
        >
          <SensorCard
            :title="sensor.name"
            :value="sensor.value"
            :unit="sensor.unit"
            :status="sensor.status"
            :icon="sensor.icon"
            :trend="sensor.trend"
          />
        </div>
      </div>

      <!-- Empty State (shown when no sensor data is available) -->
      <div
        v-if="sensorCards.length === 0"
        class="text-center py-12"
        role="status"
        aria-live="polite"
      >
        <div
          class="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-xl flex items-center justify-center mx-auto mb-4"
        >
          <svg
            class="w-8 h-8 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
            />
          </svg>
        </div>
        <h3 class="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
          No sensor data available
        </h3>
        <p class="text-gray-500 dark:text-gray-400">
          Sensor readings will appear here when data becomes available.
        </p>
      </div>
    </div>
  </div>
</template>

<style scoped>
/**
 * Component-specific styles for animations and interactions
 */

/* Staggered entrance animation for sensor cards */
@keyframes cardEnter {
  from {
    opacity: 0;
    transform: translateY(20px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.card-enter {
  animation: cardEnter 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
  opacity: 0;
}

/* Enhanced hover effects for interactive elements */
.cursor-pointer:hover {
  transform: translateY(-2px);
}

/* Accessibility: Reduced motion support */
@media (prefers-reduced-motion: reduce) {
  .card-enter {
    animation: none;
    opacity: 1;
  }

  .cursor-pointer:hover {
    transform: none;
  }
}

/* Focus management for keyboard navigation */
.cursor-pointer:focus {
  transform: translateY(-2px);
}
</style>
