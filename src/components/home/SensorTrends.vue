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
const windowWidth = ref(window.innerWidth)
const isLoading = ref(false)
const lastUpdated = ref<Date>(new Date())

const sensors = {
  soilTemperature: {
    title: 'Soil Temperature',
    valueLabel: 'Temperature (°C)',
    color: '#10B981',
    baseValue: 22,
    variance: 4,
  },
  soilMoisture: {
    title: 'Soil Moisture',
    valueLabel: 'Moisture (%)',
    color: '#0D9488',
    baseValue: 65,
    variance: 15,
  },
  soilPH: {
    title: 'Soil pH Level',
    valueLabel: 'pH Level',
    color: '#7C3AED',
    baseValue: 6.5,
    variance: 0.5,
  },
  airTemperature: {
    title: 'Air Temperature',
    valueLabel: 'Temperature (°C)',
    color: '#DC2626',
    baseValue: 24,
    variance: 6,
  },
}

const historicalData = ref<Record<string, Array<{ time: string; value: number }>>>({})

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
    second: '2-digit',
  })
})

const isTabletView = computed(() => windowWidth.value >= 768 && windowWidth.value < 1024)
const isMobileView = computed(() => windowWidth.value < 768)
const shouldUseMobileLayout = computed(() => isMobileView.value || isTabletView.value)

const generateMockData = (timeframe: string, baseValue: number, variance: number) => {
  const now = new Date()
  const pointsMap = { '24h': 24, '7d': 7, '30d': 30 }
  const points = pointsMap[timeframe as keyof typeof pointsMap] || 24
  const interval = timeframe === '24h' ? 60 * 60 * 1000 : 24 * 60 * 60 * 1000

  return Array.from({ length: points }, (_, i) => {
    const time = new Date(now.getTime() - (points - 1 - i) * interval)
    const variation = (Math.random() - 0.5) * variance
    const value = Math.round((baseValue + variation) * 10) / 10

    return {
      time:
        timeframe === '24h'
          ? time.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
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
  window.addEventListener('resize', handleResize)
  updateHistoricalData('24h')

  const interval = setInterval(() => {
    updateHistoricalData(trendTimeframe.value)
  }, props.refreshInterval)

  onUnmounted(() => {
    clearInterval(interval)
  })
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
})

defineExpose({
  updateHistoricalData,
  refresh: () => updateHistoricalData(trendTimeframe.value),
})
</script>

<template>
  <div
    class="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-2xl border border-gray-200/60 dark:border-gray-800/60 shadow-sm overflow-hidden"
  >
    <!-- Subtle accent bar -->
    <div class="h-1 bg-gradient-to-r from-emerald-500 to-teal-600"></div>

    <!-- Header -->
    <div class="px-6 py-5 border-b border-gray-100 dark:border-gray-800">
      <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <!-- Title Section -->
        <div class="flex items-center gap-4">
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

        <!-- Time Range Selector -->
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
              index !== 0 && index !== 2 ? 'border-l border-gray-300 dark:border-gray-700' : '',
            ]"
          >
            {{ option }}
          </button>
        </div>
      </div>
    </div>

    <!-- Charts Grid -->
    <div class="p-6">
      <div
        class="grid gap-6"
        :class="{
          'grid-cols-1': shouldUseMobileLayout,
          'grid-cols-2': !shouldUseMobileLayout,
        }"
      >
        <!-- Sensor Charts -->
        <div v-for="(config, sensorKey) in sensors" :key="sensorKey" class="group">
          <div
            class="p-5 bg-gray-50/50 dark:bg-gray-800/50 rounded-xl border border-gray-200/50 dark:border-gray-700/50 hover:bg-gray-100/50 dark:hover:bg-gray-700/50 transition-all duration-200"
          >
            <!-- Chart Container -->
            <div class="relative">
              <SensorChart
                :data="historicalData[sensorKey] || []"
                :color="config.color"
                :height="shouldUseMobileLayout ? 180 : 200"
                :title="config.title"
                :valueLabel="config.valueLabel"
                :animate="true"
              />

              <!-- Loading Overlay -->
              <div
                v-if="isLoading"
                class="absolute inset-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl flex items-center justify-center"
              >
                <div class="flex items-center gap-2">
                  <div
                    class="w-4 h-4 border-2 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin"
                  ></div>
                  <span class="text-sm text-gray-600 dark:text-gray-400">Updating...</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Responsive design */
@media (max-width: 1023px) {
  .grid-cols-2 {
    grid-template-columns: 1fr;
  }
}
</style>
