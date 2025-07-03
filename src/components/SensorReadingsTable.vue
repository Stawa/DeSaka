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
const sensorCount = computed(() => sensorIds.value.length)
</script>

<template>
  <div
    class="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 transition-all duration-200 hover:shadow-md w-full"
  >
    <!-- Header -->
    <div class="px-6 py-5 border-b border-gray-50 dark:border-gray-700">
      <div class="flex items-center justify-between">
        <div class="flex items-center space-x-3">
          <div
            class="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-sm"
          >
            <span class="text-white text-2xl mdi mdi-table-check"></span>
          </div>
          <div>
            <h2 class="text-lg font-semibold text-gray-900 dark:text-gray-100">Sensor Readings</h2>
            <p class="text-sm text-gray-500 dark:text-gray-400">
              {{ sensorCount }} {{ sensorCount === 1 ? 'sensor' : 'sensors' }} active
            </p>
          </div>
        </div>
      </div>
    </div>

    <!-- Content -->
    <div class="p-6">
      <div class="overflow-hidden">
        <!-- Mobile: Card Layout -->
        <div class="block sm:hidden space-y-3">
          <SensorReadingItem
            v-for="sensorId in sensorIds"
            :key="sensorId"
            :sensor-id="sensorId"
            :sensor-data="sensorData[sensorId]"
            :on-click="onSensorClick"
            mobile-layout
          />
        </div>

        <!-- Desktop: Table Layout -->
        <div class="hidden sm:block">
          <div class="overflow-x-auto">
            <table class="min-w-full">
              <thead>
                <tr class="border-b border-gray-100 dark:border-gray-700">
                  <th
                    class="text-left py-3 px-4 font-medium text-sm text-gray-600 dark:text-gray-400"
                  >
                    Sensor
                  </th>
                  <th
                    class="text-left py-3 px-4 font-medium text-sm text-gray-600 dark:text-gray-400"
                  >
                    Status
                  </th>
                  <th
                    class="text-left py-3 px-4 font-medium text-sm text-gray-600 dark:text-gray-400"
                  >
                    Current Reading
                  </th>
                  <th
                    class="text-left py-3 px-4 font-medium text-sm text-gray-600 dark:text-gray-400"
                  >
                    Last Updated
                  </th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-50 dark:divide-gray-800">
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

        <!-- Empty State -->
        <div v-if="sensorCount === 0" class="text-center py-12">
          <div
            class="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4"
          >
            <svg
              class="w-8 h-8 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
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
            No sensors available
          </h3>
          <p class="text-gray-500 dark:text-gray-400 max-w-sm mx-auto">
            Connect your sensors to start monitoring readings and performance metrics.
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Custom scrollbar for webkit browsers */
.overflow-x-auto::-webkit-scrollbar {
  height: 6px;
}

.overflow-x-auto::-webkit-scrollbar-track {
  @apply bg-gray-100 dark:bg-gray-800 rounded-full;
}

.overflow-x-auto::-webkit-scrollbar-thumb {
  @apply bg-gray-300 dark:bg-gray-600 rounded-full;
}

.overflow-x-auto::-webkit-scrollbar-thumb:hover {
  @apply bg-gray-400 dark:bg-gray-500;
}

/* Smooth transitions */
* {
  transition-property: color, background-color, border-color, box-shadow;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 200ms;
}
</style>
