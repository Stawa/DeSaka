<script setup lang="ts">
import { getSensorIcon, getSensorLabel, getSensorDescription, getSensorColor } from '@/scripts'

defineProps({
  sensorData: {
    type: Object,
    required: true,
  },
  onSensorClick: {
    type: Function,
    default: () => {},
  },
})

defineEmits(['refresh', 'download'])
</script>

<template>
  <div
    class="bg-white dark:bg-gray-900 rounded-xl shadow-md overflow-hidden border border-gray-100 dark:border-gray-700 transition-all duration-300 hover:shadow-lg w-full"
  >
    <div class="h-1 sm:h-1.5 w-full bg-gradient-to-r from-primary-400 to-primary-500"></div>
    <div class="p-3 sm:p-4 md:p-6">
      <!-- Header with title and buttons -->
      <div
        class="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 sm:mb-6 gap-3 sm:gap-4"
      >
        <div class="flex items-center min-w-0">
          <div
            class="bg-primary-100 dark:bg-primary-900/30 p-1.5 sm:p-2 rounded-lg mr-2 sm:mr-3 flex-shrink-0"
          >
            <span
              class="mdi mdi-gauge text-primary-600 dark:text-primary-400 text-base sm:text-lg md:text-xl"
            ></span>
          </div>
          <h2
            class="text-base sm:text-lg md:text-xl font-semibold text-gray-800 dark:text-gray-200 truncate"
          >
            Sensor Readings
          </h2>
        </div>
      </div>

      <!-- Sensor Cards Grid -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        <div
          v-for="(sensor, sensorId) in sensorData"
          :key="sensorId"
          class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden transition-transform duration-300 hover:shadow-md hover:scale-[1.02] cursor-pointer"
          @click="onSensorClick(sensorId)"
        >
          <div class="p-4 flex items-start">
            <!-- Icon and Title -->
            <div class="flex-shrink-0 mr-4">
              <div
                :class="`bg-${getSensorColor(sensorId)}-50 dark:bg-${getSensorColor(sensorId)}-900/30 px-3 py-2 rounded-full`"
              >
                <span
                  :class="`mdi ${getSensorIcon(sensorId)} text-${getSensorColor(sensorId)}-600 dark:text-${getSensorColor(sensorId)}-400 text-xl`"
                ></span>
              </div>
            </div>

            <div class="flex-1">
              <!-- Sensor Name and Description -->
              <div class="mb-2">
                <h3 class="text-base font-medium text-gray-900 dark:text-gray-100">
                  {{ getSensorLabel(sensorId) }}
                </h3>
                <p class="text-xs text-gray-500 dark:text-gray-400">
                  {{ getSensorDescription(sensorId) }}
                </p>
              </div>

              <!-- Status Badge -->
              <div class="mb-3">
                <span
                  class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium"
                  :class="{
                    'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300':
                      sensor.status === 'normal',
                    'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300':
                      sensor.status === 'warning',
                    'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300':
                      sensor.status === 'critical',
                  }"
                >
                  <span
                    class="mdi mr-1 text-xs"
                    :class="{
                      'mdi-check-circle': sensor.status === 'normal',
                      'mdi-alert': sensor.status === 'warning',
                      'mdi-alert-circle': sensor.status === 'critical',
                    }"
                  ></span>
                  {{ sensor.status.charAt(0).toUpperCase() + sensor.status.slice(1) }}
                </span>
              </div>

              <!-- Value and Unit -->
              <div class="flex items-baseline">
                <span class="text-lg font-bold text-gray-900 dark:text-gray-100">
                  {{ sensor.value }}
                </span>
                <span class="ml-1 text-xs text-gray-500 dark:text-gray-400">
                  {{ sensor.unit }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.grid > div {
  animation: fadeIn 0.5s ease-out;
  animation-fill-mode: both;
}

.grid > div:nth-child(1) {
  animation-delay: 0.1s;
}
.grid > div:nth-child(2) {
  animation-delay: 0.2s;
}
.grid > div:nth-child(3) {
  animation-delay: 0.3s;
}
.grid > div:nth-child(4) {
  animation-delay: 0.4s;
}
.grid > div:nth-child(5) {
  animation-delay: 0.5s;
}
.grid > div:nth-child(6) {
  animation-delay: 0.6s;
}
</style>
