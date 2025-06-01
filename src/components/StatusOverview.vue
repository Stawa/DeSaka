<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  sensorData: {
    soilTemperature: { value: number; unit: string; status: string }
    soilMoisture: { value: number; unit: string; status: string }
    soilPH: { value: number; unit: string; status: string }
    airTemperature: { value: number; unit: string; status: string }
    airHumidity: { value: number; unit: string; status: string }
    lightIntensity: { value: number; unit: string; status: string }
  }
}>()

const statusCounts = computed(() => {
  const counts: { [key: string]: number } = { normal: 0, warning: 0, critical: 0 }

  Object.values(props.sensorData).forEach((sensor) => {
    counts[sensor.status]++
  })

  return counts
})
</script>

<template>
  <div
    class="bg-white dark:bg-gray-900 rounded-2xl shadow-lg p-3 xs:p-4 sm:p-6 dark:text-white border border-gray-100 dark:border-gray-700 transition-all duration-300 hover:shadow-xl backdrop-blur-sm"
  >
    <!-- Header with title and status summary -->
    <div
      class="flex flex-col xs:flex-row xs:items-center xs:justify-between gap-2 xs:gap-3 mb-3 sm:mb-6"
    >
      <div class="flex items-center">
        <div class="bg-primary-100 dark:bg-primary-900/30 p-2 rounded-lg mr-3 flex-shrink-0">
          <span
            class="mdi mdi-chart-areaspline text-primary-600 dark:text-primary-400 text-xl"
          ></span>
        </div>
        <div class="min-w-0">
          <!-- This ensures the div can shrink below its content size -->
          <h2 class="text-lg sm:text-xl font-bold text-gray-800 dark:text-white truncate">
            System Status
          </h2>
          <p class="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-0.5 truncate">
            {{ statusCounts.normal + statusCounts.warning + statusCounts.critical }} sensors
            monitored
          </p>
        </div>
      </div>

      <!-- Overall Status Badge -->
      <div
        class="px-2 xs:px-3 sm:px-4 py-1 xs:py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-medium flex items-center whitespace-nowrap flex-shrink-0 mt-1 xs:mt-0"
        :class="{
          'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300':
            statusCounts.critical === 0 && statusCounts.warning === 0,
          'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300':
            statusCounts.critical === 0 && statusCounts.warning > 0,
          'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300': statusCounts.critical > 0,
        }"
      >
        <span
          class="mdi mr-1 text-lg flex-shrink-0"
          :class="{
            'mdi-check-circle': statusCounts.critical === 0 && statusCounts.warning === 0,
            'mdi-alert': statusCounts.critical === 0 && statusCounts.warning > 0,
            'mdi-alert-circle': statusCounts.critical > 0,
          }"
        ></span>
        <span class="truncate flex-shrink-0 text-sm sm:text-base">
          {{
            statusCounts.critical > 0
              ? 'Critical Issues Detected'
              : statusCounts.warning > 0
                ? 'Warnings Detected'
                : 'All Systems Normal'
          }}
        </span>
      </div>
    </div>

    <!-- Status Cards with enhanced styling -->
    <div class="grid grid-cols-1 xs:grid-cols-3 gap-2 sm:gap-4 mb-4 sm:mb-6">
      <div
        class="flex items-center p-3 sm:p-4 bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-900/30 rounded-xl border border-green-100 dark:border-green-800/50 transition-all duration-200 hover:shadow-md transform hover:-translate-y-1"
      >
        <div
          class="bg-white dark:bg-gray-800 rounded-full py-1.5 sm:py-2 px-2 sm:px-3 mr-2 sm:mr-3 shadow-sm flex-shrink-0"
        >
          <span class="mdi mdi-check-circle text-lg sm:text-xl text-green-500"></span>
        </div>
        <div>
          <div class="text-green-800 dark:text-green-300 text-xs sm:text-sm font-medium truncate">
            Normal
          </div>
          <div class="text-green-900 dark:text-green-200 text-lg sm:text-xl font-bold">
            {{ statusCounts.normal }}
          </div>
        </div>
      </div>

      <div
        class="flex items-center p-3 sm:p-4 bg-gradient-to-r from-amber-50 to-amber-100 dark:from-amber-900/20 dark:to-amber-900/30 rounded-xl border border-amber-100 dark:border-amber-800/50 transition-all duration-200 hover:shadow-md transform hover:-translate-y-1"
      >
        <div
          class="bg-white dark:bg-gray-800 rounded-full py-1.5 sm:py-2 px-2 sm:px-3 mr-2 sm:mr-3 shadow-sm flex-shrink-0"
        >
          <span class="mdi mdi-alert text-lg sm:text-xl text-amber-500"></span>
        </div>
        <div>
          <div class="text-amber-800 dark:text-amber-300 text-xs sm:text-sm font-medium truncate">
            Warning
          </div>
          <div class="text-amber-900 dark:text-amber-200 text-lg sm:text-xl font-bold">
            {{ statusCounts.warning }}
          </div>
        </div>
      </div>

      <div
        class="flex items-center p-3 sm:p-4 bg-gradient-to-r from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-900/30 rounded-xl border border-red-100 dark:border-red-800/50 transition-all duration-200 hover:shadow-md transform hover:-translate-y-1"
      >
        <div
          class="bg-white dark:bg-gray-800 rounded-full py-1.5 sm:py-2 px-2 sm:px-3 mr-2 sm:mr-3 shadow-sm flex-shrink-0"
        >
          <span class="mdi mdi-alert-circle text-lg sm:text-xl text-red-500"></span>
        </div>
        <div>
          <div class="text-red-800 dark:text-red-300 text-xs sm:text-sm font-medium truncate">
            Critical
          </div>
          <div class="text-red-900 dark:text-red-200 text-lg sm:text-xl font-bold">
            {{ statusCounts.critical }}
          </div>
        </div>
      </div>
    </div>

    <!-- Quick Actions with enhanced styling -->
    <div
      class="pt-4 border-t border-gray-200 dark:border-gray-700 flex flex-wrap gap-2 sm:gap-3 justify-center sm:justify-start"
    >
      <button class="btn btn-primary">
        <span class="mdi mdi-refresh mr-1 sm:mr-2 flex-shrink-0"></span>
        <span class="truncate">Refresh Data</span>
      </button>

      <button class="btn btn-secondary">
        <span class="mdi mdi-download mr-1 sm:mr-2 flex-shrink-0"></span>
        <span class="truncate">Export Report</span>
      </button>

      <button class="btn btn-secondary hidden sm:flex">
        <span class="mdi mdi-bell mr-1 sm:mr-2 flex-shrink-0"></span>
        <span class="truncate">Configure Alerts</span>
      </button>
    </div>
  </div>
</template>

<style scoped>
.btn {
  @apply px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-medium transition-all duration-200 flex items-center shadow-sm transform hover:-translate-y-0.5;
}

.btn-primary {
  @apply bg-gradient-to-r from-primary-500 to-primary-600 text-white hover:from-primary-600 hover:to-primary-700 active:from-primary-700 active:to-primary-800 focus:ring-2 focus:ring-primary-500 focus:ring-opacity-50;
}

.btn-secondary {
  @apply bg-white text-gray-700 hover:bg-gray-50 active:bg-gray-100 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600 dark:active:bg-gray-500 focus:ring-2 focus:ring-gray-400 focus:ring-opacity-50 dark:focus:ring-gray-500 border border-gray-200 dark:border-gray-600;
}

.btn-outline {
  @apply bg-transparent text-gray-600 dark:text-gray-300 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 active:bg-gray-100 dark:active:bg-gray-600 focus:ring-2 focus:ring-gray-400 focus:ring-opacity-50 dark:focus:ring-gray-500;
}

/* Add subtle pulse animation for status indicators */
@keyframes subtle-pulse {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.8;
  }
}

.animate-pulse {
  animation: subtle-pulse 2s ease-in-out infinite;
}

/* Custom breakpoint for extra small screens */
@media (max-width: 425px) {
  .xs\:grid-cols-3 {
    grid-template-columns: repeat(1, minmax(0, 1fr));
  }

  .xs\:flex-row {
    flex-direction: column;
  }

  .xs\:items-center {
    align-items: flex-start;
  }

  .xs\:justify-between {
    justify-content: flex-start;
  }

  .xs\:gap-3 {
    gap: 0.5rem;
  }

  .xs\:mt-0 {
    margin-top: 0.5rem;
  }
}

@media (min-width: 426px) and (max-width: 475px) {
  .xs\:grid-cols-3 {
    grid-template-columns: repeat(1, minmax(0, 1fr));
  }

  .xs\:flex-row {
    flex-direction: row;
  }

  .xs\:items-center {
    align-items: center;
  }

  .xs\:justify-between {
    justify-content: space-between;
  }

  .xs\:gap-3 {
    gap: 0.75rem;
  }

  .xs\:mt-0 {
    margin-top: 0;
  }
}

@media (min-width: 476px) and (max-width: 639px) {
  .xs\:grid-cols-3 {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }

  .xs\:flex-row {
    flex-direction: row;
  }

  .xs\:items-center {
    align-items: center;
  }

  .xs\:justify-between {
    justify-content: space-between;
  }

  .xs\:gap-3 {
    gap: 0.75rem;
  }

  .xs\:mt-0 {
    margin-top: 0;
  }
}
</style>
