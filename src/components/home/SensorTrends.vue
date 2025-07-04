<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import SensorChart from '../SensorChart.vue'

interface Props {
  refreshInterval?: number
}

const props = withDefaults(defineProps<Props>(), {
  refreshInterval: 30000,
})

const trendTimeframe = ref<'24h' | '7d' | '30d'>('24h')
const windowWidth = ref(typeof window !== 'undefined' ? window.innerWidth : 1024)
const isLoading = ref(false)
const lastUpdated = ref<Date>(new Date())

const sensors = {
  soilTemperature: {
    title: 'Soil Temperature',
    valueLabel: 'Temperature',
    color: '#10B981',
    unit: '°C',
    baseValue: 22,
    variance: 4,
    icon: 'mdi-thermometer-lines',
  },
  soilMoisture: {
    title: 'Soil Moisture',
    valueLabel: 'Moisture',
    color: '#0D9488',
    unit: '%',
    baseValue: 65,
    variance: 15,
    icon: 'mdi-grass',
  },
  soilPH: {
    title: 'Soil pH Level',
    valueLabel: 'pH Level',
    color: '#7C3AED',
    unit: 'pH',
    baseValue: 6.5,
    variance: 0.5,
    icon: 'mdi-water-opacity',
  },
  airTemperature: {
    title: 'Air Temperature',
    valueLabel: 'Temperature',
    color: '#F59E0B',
    unit: '°C',
    baseValue: 24,
    variance: 6,
    icon: 'mdi-sun-thermometer',
  },
}

const historicalData = ref<Record<string, Array<{ time: string; value: number }>>>({})

const isMobile = computed(() => windowWidth.value < 640)
const isTablet = computed(() => windowWidth.value >= 640 && windowWidth.value < 1024)
const isDesktop = computed(() => windowWidth.value >= 1024)

const timeframeLabel = computed(() => {
  switch (trendTimeframe.value) {
    case '24h':
      return 'Last 24 Hours'
    case '7d':
      return 'Last 7 Days'
    case '30d':
      return 'Last 30 Days'
    default:
      return 'Last 24 Hours'
  }
})

const formattedLastUpdated = computed(() => {
  return lastUpdated.value.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  })
})

const generateMockData = (timeframe: string, baseValue: number, variance: number) => {
  const now = new Date()
  const pointsMap = { '24h': 12, '7d': 7, '30d': 15 }
  const points = pointsMap[timeframe as keyof typeof pointsMap] || 12
  const interval = timeframe === '24h' ? 2 * 60 * 60 * 1000 : 24 * 60 * 60 * 1000

  return Array.from({ length: points }, (_, i) => {
    const time = new Date(now.getTime() - (points - 1 - i) * interval)
    const variation = (Math.random() - 0.5) * variance
    const value = Math.round((baseValue + variation) * 10) / 10

    return {
      time:
        timeframe === '24h'
          ? time.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
          : time.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      value,
    }
  })
}

const updateHistoricalData = async (timeframe: '24h' | '7d' | '30d') => {
  isLoading.value = true
  trendTimeframe.value = timeframe

  await new Promise((resolve) => setTimeout(resolve, 500))

  const newData: Record<string, Array<{ time: string; value: number }>> = {}

  Object.entries(sensors).forEach(([key, config]) => {
    newData[key] = generateMockData(timeframe, config.baseValue, config.variance)
  })

  historicalData.value = newData
  lastUpdated.value = new Date()
  isLoading.value = false
}

const handleResize = () => {
  windowWidth.value = window.innerWidth
}

onMounted(() => {
  if (typeof window !== 'undefined') {
    window.addEventListener('resize', handleResize)
    updateHistoricalData('24h')

    const interval = setInterval(() => {
      updateHistoricalData(trendTimeframe.value)
    }, props.refreshInterval)

    onUnmounted(() => {
      clearInterval(interval)
    })
  }
})

onUnmounted(() => {
  if (typeof window !== 'undefined') {
    window.removeEventListener('resize', handleResize)
  }
})

defineExpose({
  updateHistoricalData,
  refresh: () => updateHistoricalData(trendTimeframe.value),
})
</script>

<template>
  <!-- Main container matching app's card design -->
  <div
    class="bg-white/80 dark:bg-gray-900/80 rounded-2xl border border-gray-200/60 dark:border-gray-800/60 shadow-sm overflow-hidden"
  >
    <!-- Accent bar matching app's design -->
    <div class="h-1 bg-gradient-to-r from-emerald-500 to-teal-600"></div>

    <!-- Header matching navbar/sidebar style -->
    <div class="px-6 py-5 border-b border-gray-100 dark:border-gray-800">
      <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <!-- Title Section matching app's header style -->
        <div class="flex items-center gap-4">
          <!-- Icon container matching sidebar icons -->
          <div
            class="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-100 to-emerald-50 dark:from-emerald-900/30 dark:to-emerald-800/20 flex items-center justify-center ring-1 ring-emerald-200/50 dark:ring-emerald-700/30"
          >
            <svg
              class="w-6 h-6 text-emerald-600 dark:text-emerald-400"
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
          <div>
            <h2 class="text-xl font-semibold text-gray-900 dark:text-gray-100">Sensor Trends</h2>
            <p class="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
              {{ timeframeLabel }} • Updated {{ formattedLastUpdated }}
            </p>
          </div>
        </div>

        <!-- Time Range Selector matching app's button style -->
        <div
          class="inline-flex bg-gray-100 dark:bg-gray-800 rounded-full p-1 border border-gray-200 dark:border-gray-700"
        >
          <button
            v-for="(option, index) in ['24h', '7d', '30d']"
            :key="option"
            @click="updateHistoricalData(option as '24h' | '7d' | '30d')"
            :disabled="isLoading"
            class="px-4 py-2 text-sm font-medium transition-all duration-200 disabled:opacity-50 focus:outline-none"
            :class="[
              trendTimeframe === option
                ? 'bg-white dark:bg-gray-700 text-emerald-600 dark:text-emerald-400 shadow-sm ring-1 ring-emerald-200/50 dark:ring-emerald-700/30'
                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 hover:text-emerald-600 dark:hover:text-emerald-400',
              index === 0 ? 'rounded-l-full' : '',
              index === 2 ? 'rounded-r-full' : '',
            ]"
          >
            {{ option }}
          </button>
        </div>
      </div>
    </div>

    <!-- Charts Grid with responsive layout -->
    <div class="p-6">
      <div
        class="grid gap-6"
        :class="{
          'grid-cols-1': isMobile || isTablet,
          'grid-cols-2': isDesktop,
        }"
      >
        <!-- Individual Chart Cards -->
        <div v-for="(config, sensorKey) in sensors" :key="sensorKey" class="relative">
          <!-- Loading overlay for individual charts -->
          <div
            v-if="isLoading"
            class="absolute inset-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm rounded-2xl flex items-center justify-center z-10"
          >
            <div class="flex flex-col items-center gap-2">
              <div
                class="w-6 h-6 border-2 border-gray-300 dark:border-gray-600 border-t-emerald-500 rounded-full animate-spin"
              ></div>
              <span class="text-xs text-gray-600 dark:text-gray-400"
                >Updating {{ config.title }}...</span
              >
            </div>
          </div>

          <SensorChart
            :data="historicalData[sensorKey] || []"
            :title="config.title"
            :valueLabel="config.valueLabel"
            :chartColor="config.color"
            :valueUnit="config.unit"
            :icon="config.icon"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Smooth transitions matching app's design system */
* {
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

/* Focus states matching app's design */
button:focus {
  outline: 2px solid theme('colors.emerald.500');
  outline-offset: 2px;
}

/* Reduced motion support */
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}

/* High contrast mode support */
@media (prefers-contrast: high) {
  .border {
    border-width: 2px;
  }
}
</style>
