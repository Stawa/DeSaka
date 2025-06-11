<script setup lang="ts">
import { computed } from 'vue'
import SensorReadingItem from './SensorReadingItem.vue'

const props = defineProps({
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

const sensorIds = computed(() => Object.keys(props.sensorData))
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

      <!-- Responsive Table Layout for Sensor Readings -->
      <div class="animate-fade-in overflow-x-auto -mx-3 sm:mx-0">
        <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead class="bg-gray-50 dark:bg-gray-800">
            <tr>
              <th
                scope="col"
                class="px-3 py-2.5 sm:px-4 sm:py-3.5 text-left text-2xs sm:text-xs md:text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
              >
                Sensor
              </th>
              <th
                scope="col"
                class="px-3 py-2.5 sm:px-4 sm:py-3.5 text-left text-2xs sm:text-xs md:text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
              >
                Status
              </th>
              <th
                scope="col"
                class="px-3 py-2.5 sm:px-4 sm:py-3.5 text-left text-2xs sm:text-xs md:text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
              >
                Reading
              </th>
            </tr>
          </thead>
          <tbody class="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
            <SensorReadingItem
              v-for="sensorId in sensorIds"
              :key="sensorId"
              :sensor-id="sensorId"
              :sensor-data="sensorData[sensorId]"
              :on-click="onSensorClick"
            />
          </tbody>
        </table>
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

.animate-fade-in {
  animation: fadeIn 0.5s ease-out;
}
</style>
