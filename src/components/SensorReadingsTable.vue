<script setup lang="ts">
/**
 * SensorReadingsTable Component
 *
 * A table-based layout component for displaying sensor readings in a structured,
 * data-dense format. This component provides an alternative view to the grid layout,
 * offering better data comparison and detailed information display.
 *
 * Features:
 * - Responsive table design with horizontal scrolling on mobile
 * - Consistent styling with status indicators and category badges
 * - Interactive rows with hover effects and click handling
 * - Accessibility support with proper table semantics
 * - Reuses centralized sensor data transformation logic
 */

import { computed } from 'vue'
import {
  transformSensorData,
  getSensorStatusConfig,
  getCategoryColorConfig,
  type RawSensorData,
} from '@/utils/sensorHelpers'
import { type SensorDataStructure } from '@/constants/sensorConstants'

/**
 * Component props interface
 */
interface Props {
  /** Raw sensor data object from API or parent component */
  sensorData: RawSensorData
  /** Optional callback function for sensor row click events */
  onSensorClick?: (sensorId: string) => void
}

/**
 * Define component props with defaults
 */
const props = withDefaults(defineProps<Props>(), {
  onSensorClick: () => {},
})

/**
 * Computed property for table data
 * Transforms raw sensor data into standardized table row data
 */
const tableData = computed((): SensorDataStructure[] => {
  return transformSensorData(props.sensorData)
})

/**
 * Handles sensor row click events
 * Delegates to the provided onSensorClick callback with the sensor category
 *
 * @param sensorCategory - The category of the clicked sensor row
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
    aria-label="Sensor readings table"
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
                d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
              />
            </svg>
          </div>

          <!-- Header Text Content -->
          <div>
            <h2 class="text-xl font-semibold text-gray-900 dark:text-gray-100">Sensor Readings</h2>
            <p class="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
              Detailed environmental monitoring data
            </p>
          </div>
        </div>
      </div>
    </div>

    <!-- Table Container with Horizontal Scroll -->
    <div class="overflow-x-auto">
      <table class="w-full" role="table" aria-label="Sensor readings data">
        <!-- Table Header -->
        <thead class="bg-gray-50/50 dark:bg-gray-800/50">
          <tr role="row">
            <th
              class="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider"
              scope="col"
            >
              Sensor
            </th>
            <th
              class="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider"
              scope="col"
            >
              Category
            </th>
            <th
              class="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider"
              scope="col"
            >
              Current Value
            </th>
            <th
              class="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider"
              scope="col"
            >
              Status
            </th>
            <th
              class="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider"
              scope="col"
            >
              Last Update
            </th>
          </tr>
        </thead>

        <!-- Table Body -->
        <tbody class="divide-y divide-gray-200 dark:divide-gray-700">
          <!-- Individual Sensor Rows -->
          <tr
            v-for="sensor in tableData"
            :key="sensor.id"
            class="hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition-colors duration-200 cursor-pointer focus-within:bg-gray-50/50 dark:focus-within:bg-gray-800/50"
            @click="handleSensorClick(sensor.category)"
            @keydown.enter="handleSensorClick(sensor.category)"
            @keydown.space.prevent="handleSensorClick(sensor.category)"
            role="row"
            tabindex="0"
            :aria-label="`${sensor.name} sensor row, click to view details`"
          >
            <!-- Sensor Name and Icon Cell -->
            <td class="px-6 py-4 whitespace-nowrap" role="gridcell">
              <div class="flex items-center gap-3">
                <!-- Sensor Icon -->
                <div
                  class="w-10 h-10 rounded-xl flex items-center justify-center ring-1 ring-gray-200/50 dark:ring-gray-700/30"
                  :class="getSensorStatusConfig(sensor.status).iconBg"
                  aria-hidden="true"
                >
                  <span
                    :class="[
                      sensor.icon,
                      'mdi text-lg',
                      getSensorStatusConfig(sensor.status).iconColor,
                    ]"
                  ></span>
                </div>

                <!-- Sensor Information -->
                <div>
                  <div class="font-medium text-gray-900 dark:text-gray-100">
                    {{ sensor.name }}
                  </div>
                  <div class="text-sm text-gray-500 dark:text-gray-400">ID: {{ sensor.id }}</div>
                </div>
              </div>
            </td>

            <!-- Category Badge Cell -->
            <td class="px-6 py-4 whitespace-nowrap" role="gridcell">
              <span
                class="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium"
                :class="getCategoryColorConfig(sensor.category)"
              >
                {{ sensor.category }}
              </span>
            </td>

            <!-- Current Value Cell -->
            <td class="px-6 py-4 whitespace-nowrap" role="gridcell">
              <div class="flex items-baseline gap-1">
                <span class="text-lg font-semibold text-gray-900 dark:text-gray-100 tabular-nums">
                  {{ sensor.value }}
                </span>
                <span class="text-sm text-gray-500 dark:text-gray-400">
                  {{ sensor.unit }}
                </span>
              </div>
            </td>

            <!-- Status Badge Cell -->
            <td class="px-6 py-4 whitespace-nowrap" role="gridcell">
              <div
                class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium"
                :class="getSensorStatusConfig(sensor.status).badge"
              >
                <div
                  class="w-1.5 h-1.5 rounded-full"
                  :class="getSensorStatusConfig(sensor.status).dot"
                  aria-hidden="true"
                ></div>
                {{ sensor.status.charAt(0).toUpperCase() + sensor.status.slice(1) }}
              </div>
            </td>

            <!-- Last Update Cell -->
            <td
              class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400"
              role="gridcell"
            >
              {{ sensor.lastUpdate }}
            </td>
          </tr>
        </tbody>
      </table>

      <!-- Empty State (shown when no sensor data is available) -->
      <div v-if="tableData.length === 0" class="text-center py-12" role="status" aria-live="polite">
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
              d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
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
 * Component-specific styles for table interactions and accessibility
 */

/* Enhanced table row interactions */
tbody tr {
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

/* Subtle hover effects for better user experience */
tbody tr:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px -2px rgba(0, 0, 0, 0.05);
}

/* Accessibility: Focus states for keyboard navigation */
tbody tr:focus {
  outline: 2px solid theme('colors.emerald.500');
  outline-offset: -2px;
}

/* Typography: Tabular numbers for consistent digit alignment */
.tabular-nums {
  font-variant-numeric: tabular-nums;
  font-feature-settings: 'tnum' 1;
}

/* Accessibility: Reduced motion support */
@media (prefers-reduced-motion: reduce) {
  tbody tr {
    transition: none;
  }

  tbody tr:hover {
    transform: none;
    box-shadow: none;
  }
}

/* Responsive design: Ensure table scrolls horizontally on small screens */
@media (max-width: 640px) {
  table {
    min-width: 600px;
  }
}
</style>
