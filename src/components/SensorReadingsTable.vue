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
  <div class="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden relative">
    <!-- Animated gradient accent bar -->
    <div class="h-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-blue-600 animate-gradient-x"></div>

    <!-- Enhanced header -->
    <div class="px-6 py-5 lg:px-8 lg:py-6 border-b border-gray-200 dark:border-gray-700">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-4">
          <div class="relative group">
            <div class="w-12 h-12 bg-gradient-to-br from-blue-100 via-blue-50 to-indigo-50 dark:from-blue-900/40 dark:via-blue-800/30 dark:to-indigo-800/20 rounded-2xl flex items-center justify-center ring-1 ring-blue-200/50 dark:ring-blue-700/30 backdrop-blur-sm transition-all duration-300 group-hover:scale-105 group-hover:shadow-lg group-hover:shadow-blue-500/20">
              <svg class="w-6 h-6 text-blue-600 dark:text-blue-400 transition-transform duration-300 group-hover:rotate-12" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
              </svg>
            </div>
            <div class="absolute inset-0 bg-blue-500/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10"></div>
          </div>
          <div>
            <h2 class="text-xl font-bold text-gray-900 dark:text-white bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 dark:from-white dark:via-gray-100 dark:to-white bg-clip-text">Sensor Readings</h2>
            <p class="text-sm text-gray-600 dark:text-gray-400 font-medium">
              {{ sensorCount }} {{ sensorCount === 1 ? 'sensor' : 'sensors' }} active
            </p>
          </div>
        </div>
        
        <div class="flex items-center gap-3">
          <div class="relative">
            <div class="w-3 h-3 bg-emerald-500 rounded-full shadow-sm"></div>
            <div class="absolute inset-0 w-3 h-3 bg-emerald-500 rounded-full animate-ping opacity-75"></div>
          </div>
          <span class="text-sm font-bold text-emerald-600 dark:text-emerald-400">Live</span>
        </div>
      </div>
    </div>

    <!-- Enhanced content -->
    <div class="overflow-hidden">
      <div class="overflow-x-auto">
        <table class="min-w-full">
          <thead>
            <tr class="border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-gray-50 to-gray-25 dark:from-gray-800/50 dark:to-gray-700/30">
              <th class="text-left py-4 px-6 font-bold text-sm text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                Sensor
              </th>
              <th class="text-left py-4 px-6 font-bold text-sm text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                Status
              </th>
              <th class="text-left py-4 px-6 font-bold text-sm text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                Current Reading
              </th>
              <th class="text-left py-4 px-6 font-bold text-sm text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                Last Updated
              </th>
              <th class="text-left py-4 px-6 font-bold text-sm text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                Action
              </th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200 dark:divide-gray-700">
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

      <!-- Enhanced empty state -->
      <div v-if="sensorCount === 0" class="text-center py-16">
        <div class="w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-50 dark:from-gray-800 dark:to-gray-700 rounded-2xl flex items-center justify-center mx-auto mb-6 ring-1 ring-gray-200 dark:ring-gray-700">
          <svg class="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
        </div>
        <h3 class="text-xl font-bold text-gray-900 dark:text-white mb-3">
          No sensors available
        </h3>
        <p class="text-gray-600 dark:text-gray-400 max-w-md mx-auto font-medium">
          Connect your sensors to start monitoring readings and performance metrics.
        </p>
      </div>
    </div>

    <!-- Subtle background pattern -->
    <div class="absolute inset-0 opacity-[0.02] dark:opacity-[0.05] pointer-events-none">
      <div class="absolute inset-0" style="background-image: radial-gradient(circle at 1px 1px, rgba(0,0,0,0.15) 1px, transparent 0); background-size: 20px 20px;"></div>
    </div>
  </div>
</template>

<style scoped>
@keyframes gradient-x {
  0%, 100% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
}

.animate-gradient-x {
  background-size: 200% 200%;
  animation: gradient-x 3s ease infinite;
}

/* Enhanced hover effects */
.group:hover .group-hover\:rotate-12 {
  transform: rotate(12deg);
}

/* Smooth transitions for all elements */
* {
  transition-property: all;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 300ms;
}

/* Enhanced table styling */
tbody tr {
  transition: all 0.2s ease;
}

tbody tr:hover {
  background: linear-gradient(to right, rgba(59, 130, 246, 0.05), rgba(99, 102, 241, 0.05));
  transform: translateX(2px);
}

/* Custom scrollbar for consistency */
::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}

::-webkit-scrollbar-track {
  background: transparent;
}

::-webkit-scrollbar-thumb {
  background: rgba(156, 163, 175, 0.5);
  border-radius: 3px;
}

::-webkit-scrollbar-thumb:hover {
  background: rgba(107, 114, 128, 0.7);
}

.dark ::-webkit-scrollbar-thumb {
  background: rgba(75, 85, 99, 0.5);
}

.dark ::-webkit-scrollbar-thumb:hover {
  background: rgba(107, 114, 128, 0.7);
}
</style>