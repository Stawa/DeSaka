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

const statusColor = (status: string) => {
  switch (status) {
    case 'critical':
      return 'bg-red-500'
    case 'warning':
      return 'bg-amber-500'
    case 'normal':
      return 'bg-green-500'
    default:
      return 'bg-gray-500'
  }
}

const statusText = (status: string) => {
  switch (status) {
    case 'critical':
      return 'Critical Issues Detected'
    case 'warning':
      return 'Warnings Detected'
    case 'normal':
      return 'All Systems Normal'
    default:
      return 'Status Unknown'
  }
}
</script>

<template>
  <div
    class="bg-white rounded-xl shadow-lg p-6 dark:bg-gray-800 dark:text-white border border-gray-100 dark:border-gray-700 transition-all duration-300 hover:shadow-xl"
  >
    <!-- Header with title -->
    <div class="flex items-center mb-4">
      <span
        class="mdi mdi-chart-areaspline text-primary-600 dark:text-primary-400 text-xl mr-2"
      ></span>
      <h2 class="text-xl font-bold text-gray-800 dark:text-white">System Status</h2>
    </div>

    <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
      <!-- Status Counts with enhanced styling -->
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full md:w-auto mt-2 md:mt-0">
        <div
          class="flex items-center px-3 py-2 bg-green-50 dark:bg-green-900/30 rounded-lg border border-green-100 dark:border-green-800 transition-all duration-200 hover:shadow-md"
        >
          <div class="w-3 h-3 rounded-full bg-green-500 mr-2 shadow-sm"></div>
          <span class="text-green-800 dark:text-green-300 text-sm font-medium"
            >{{ statusCounts.normal }} Normal</span
          >
        </div>

        <div
          class="flex items-center px-3 py-2 bg-amber-50 dark:bg-amber-900/30 rounded-lg border border-amber-100 dark:border-amber-800 transition-all duration-200 hover:shadow-md"
        >
          <div class="w-3 h-3 rounded-full bg-amber-500 mr-2 shadow-sm"></div>
          <span class="text-amber-800 dark:text-amber-300 text-sm font-medium"
            >{{ statusCounts.warning }} Warning</span
          >
        </div>

        <div
          class="flex items-center px-3 py-2 bg-red-50 dark:bg-red-900/30 rounded-lg border border-red-100 dark:border-red-800 transition-all duration-200 hover:shadow-md"
        >
          <div class="w-3 h-3 rounded-full bg-red-500 mr-2 shadow-sm"></div>
          <span class="text-red-800 dark:text-red-300 text-sm font-medium"
            >{{ statusCounts.critical }} Critical</span
          >
        </div>
      </div>
    </div>

    <!-- Quick Actions with enhanced styling -->
    <div
      class="mt-6 pt-5 border-t border-gray-100 grid grid-cols-1 sm:grid-cols-3 gap-3 dark:border-gray-700"
    >
      <button class="btn btn-primary">
        <span class="mdi mdi-refresh mr-2"></span>
        Refresh Data
      </button>

      <button class="btn btn-secondary">
        <span class="mdi mdi-download mr-2"></span>
        Export Report
      </button>

      <button class="btn btn-secondary">
        <span class="mdi mdi-bell mr-2"></span>
        Configure Alerts
      </button>
    </div>
  </div>
</template>

<style scoped>
.btn {
  @apply px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center shadow-sm;
}

.btn-primary {
  @apply bg-primary-600 text-white hover:bg-primary-700 active:bg-primary-800 focus:ring-2 focus:ring-primary-500 focus:ring-opacity-50;
}

.btn-secondary {
  @apply bg-gray-100 text-gray-700 hover:bg-gray-200 active:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600 dark:active:bg-gray-500 focus:ring-2 focus:ring-gray-400 focus:ring-opacity-50 dark:focus:ring-gray-500;
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
</style>
