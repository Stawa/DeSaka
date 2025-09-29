<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import SensorChart from '@/components/SensorChart.vue'

defineProps<{
  selectedSensors: string[]
  chartData: Record<string, Array<{ time: string; value: number }>>
  getSensorById: (id: string) => { name: string; color: string; unit: string } | undefined
  toggleSensor: (id: string) => void
}>()

const chartLayout = ref<'grid' | 'list'>('grid')
const screenWidth = ref(window.innerWidth)

const isDesktop = computed(() => screenWidth.value >= 1024)

const getSensorIcon = (sensorId: string) => {
  const iconMap: Record<string, string> = {
    soil_ph: 'mdi-flask',
    soil_temperature: 'mdi-thermometer',
    soil_moisture: 'mdi-water',
    air_temperature: 'mdi-thermometer-lines',
    air_humidity: 'mdi-water-percent',
  }
  return iconMap[sensorId] || 'mdi-chart-line'
}

const updateScreenWidth = () => {
  screenWidth.value = window.innerWidth
}

onMounted(() => {
  window.addEventListener('resize', updateScreenWidth)
})

onUnmounted(() => {
  window.removeEventListener('resize', updateScreenWidth)
})
</script>

<template>
  <div class="space-y-6">
    <!-- Header Section -->
    <div
      class="bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/20 dark:to-teal-950/20 rounded-2xl p-6 border border-emerald-100 dark:border-emerald-800/30"
    >
      <div class="flex items-center justify-between flex-wrap gap-4">
        <div class="flex items-center gap-3">
          <div
            class="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center shadow-lg"
          >
            <span class="mdi mdi-chart-line text-white text-2xl"></span>
          </div>
          <div>
            <h2 class="text-xl font-bold text-gray-900 dark:text-gray-100">Sensor Charts</h2>
            <p class="text-sm text-gray-600 dark:text-gray-400 mt-1">
              {{ selectedSensors.length }} of 5 selected
            </p>
          </div>
        </div>

        <!-- Layout Toggle - Desktop Only -->
        <div
          v-if="isDesktop"
          class="inline-flex bg-gray-100 dark:bg-gray-800 rounded-full p-1 border border-gray-200 dark:border-gray-700 shadow-sm"
        >
          <button
            @click="chartLayout = 'grid'"
            class="px-4 py-2 text-sm font-medium transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:ring-offset-1 dark:focus-visible:ring-offset-gray-900"
            :class="[
              chartLayout === 'grid'
                ? 'bg-white dark:bg-gray-700 text-emerald-600 dark:text-emerald-400 shadow-sm ring-1 ring-emerald-200/60 dark:ring-emerald-700/40'
                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 hover:text-emerald-600 dark:hover:text-emerald-400',
              'rounded-l-full',
            ]"
          >
            <span class="mdi mdi-view-grid text-lg"></span>
          </button>
          <button
            @click="chartLayout = 'list'"
            class="px-4 py-2 text-sm font-medium transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:ring-offset-1 dark:focus-visible:ring-offset-gray-900"
            :class="[
              chartLayout === 'list'
                ? 'bg-white dark:bg-gray-700 text-emerald-600 dark:text-emerald-400 shadow-sm ring-1 ring-emerald-200/60 dark:ring-emerald-700/40'
                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 hover:text-emerald-600 dark:hover:text-emerald-400',
              'rounded-r-full',
            ]"
          >
            <span class="mdi mdi-view-list text-lg"></span>
          </button>
        </div>
      </div>
    </div>

    <!-- Charts Section -->
    <div v-if="selectedSensors.length > 0">
      <div
        class="grid gap-6"
        :class="{
          'grid-cols-1': !isDesktop || chartLayout === 'list',
          'grid-cols-1 lg:grid-cols-2': isDesktop && chartLayout === 'grid',
        }"
      >
        <div
          v-for="sensorId in selectedSensors"
          :key="sensorId"
          class="group relative transform transition-all duration-300 hover:scale-[1.02]"
        >
          <!-- SensorChart - Let it handle its own title and styling -->
          <SensorChart
            :title="getSensorById(sensorId)?.name || ''"
            :data="chartData[sensorId] || []"
            :valueLabel="getSensorById(sensorId)?.name || ''"
            :valueUnit="getSensorById(sensorId)?.unit || ''"
            :chartColor="getSensorById(sensorId)?.color || '#6B7280'"
            :icon="getSensorIcon(sensorId)"
          />
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div
      v-else
      class="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-2xl border border-gray-200/60 dark:border-gray-800/60 shadow-lg p-12 text-center"
    >
      <div class="max-w-md mx-auto">
        <!-- Animated Icon -->
        <div class="relative mb-6">
          <div
            class="w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 rounded-2xl flex items-center justify-center mx-auto"
          >
            <span
              class="mdi mdi-chart-timeline-variant text-gray-400 dark:text-gray-500 text-4xl"
            ></span>
          </div>
          <div
            class="absolute -inset-2 bg-gradient-to-r from-emerald-500/20 to-teal-500/20 rounded-2xl blur opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          ></div>
        </div>

        <h3 class="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-3">
          No Sensors Selected
        </h3>
        <p class="text-gray-600 dark:text-gray-400 mb-6 leading-relaxed">
          Choose sensors from the configuration panel to start viewing their historical data and
          trends.
        </p>

        <!-- Quick Action Buttons -->
        <div class="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            @click="$emit('selectDefaultSensors')"
            class="inline-flex items-center justify-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg font-medium transition-all duration-200 hover:scale-105 shadow-lg shadow-emerald-500/25"
          >
            <span class="mdi mdi-auto-fix"></span>
            Select Default Sensors
          </button>
          <button
            @click="$emit('openSensorConfig')"
            class="inline-flex items-center justify-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-lg font-medium transition-all duration-200 hover:scale-105"
          >
            <span class="mdi mdi-tune"></span>
            Configure Sensors
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Smooth animations */
.transform {
  transition: transform 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

/* Hover effects */
.hover\:scale-\[1\.02\]:hover {
  transform: scale(1.02);
}

/* Focus states */
button:focus {
  outline: 2px solid theme('colors.emerald.500');
  outline-offset: 2px;
}

/* Responsive grid improvements */
@media (max-width: 640px) {
  .grid {
    grid-template-columns: 1fr;
  }
}

@media (min-width: 1280px) {
  .xl\:grid-cols-2 {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

/* Animation keyframes */
@keyframes ping {
  75%,
  100% {
    transform: scale(2);
    opacity: 0;
  }
}

.animate-ping {
  animation: ping 1s cubic-bezier(0, 0, 0.2, 1) infinite;
}

@keyframes pulse {
  50% {
    opacity: 0.5;
  }
}

.animate-pulse {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

/* Smooth transitions for theme changes */
* {
  transition:
    background-color 0.3s ease,
    border-color 0.3s ease,
    color 0.3s ease;
}
</style>
