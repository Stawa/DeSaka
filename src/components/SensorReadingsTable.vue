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
  <div class="card card-hover overflow-hidden">
    <!-- Header -->
    <div class="px-6 py-5 border-b border-gray-100 dark:border-gray-800 bg-gradient-to-r from-gray-50/50 to-white dark:from-gray-800/50 dark:to-gray-900">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-4">
          <div class="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/25">
            <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
            </svg>
          </div>
          <div>
            <h2 class="text-xl font-bold text-gray-900 dark:text-gray-100">Sensor Readings</h2>
            <p class="text-sm text-gray-600 dark:text-gray-400">
              {{ sensorCount }} {{ sensorCount === 1 ? 'sensor' : 'sensors' }} active
            </p>
          </div>
        </div>
        
        <div class="flex items-center gap-2">
          <div class="status-dot status-online"></div>
          <span class="text-sm font-medium text-emerald-600 dark:text-emerald-400">Live</span>
        </div>
      </div>
    </div>

    <!-- Content -->
    <div class="overflow-hidden">
      <div class="overflow-x-auto scrollbar-thin">
        <table class="min-w-full">
          <thead>
            <tr class="border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/30">
              <th class="text-left py-4 px-6 font-semibold text-sm text-gray-700 dark:text-gray-300">
                Sensor
              </th>
              <th class="text-left py-4 px-6 font-semibold text-sm text-gray-700 dark:text-gray-300">
                Status
              </th>
              <th class="text-left py-4 px-6 font-semibold text-sm text-gray-700 dark:text-gray-300">
                Current Reading
              </th>
              <th class="text-left py-4 px-6 font-semibold text-sm text-gray-700 dark:text-gray-300">
                Last Updated
              </th>
              <th class="text-left py-4 px-6 font-semibold text-sm text-gray-700 dark:text-gray-300">
                Action
              </th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100 dark:divide-gray-800">
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

      <!-- Empty State -->
      <div v-if="sensorCount === 0" class="text-center py-16">
        <div class="w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <svg class="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
        </div>
        <h3 class="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">
          No sensors available
        </h3>
        <p class="text-gray-600 dark:text-gray-400 max-w-md mx-auto">
          Connect your sensors to start monitoring readings and performance metrics.
        </p>
      </div>
    </div>
  </div>
</template>