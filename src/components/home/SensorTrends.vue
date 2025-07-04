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
    color: '#e05d44',
    baseValue: 22,
    variance: 4,
  },
  soilMoisture: {
    title: 'Soil Moisture',
    valueLabel: 'Moisture (%)',
    color: '#3b82f6',
    baseValue: 65,
    variance: 15,
  },
  soilPH: {
    title: 'Soil pH',
    valueLabel: 'pH Level',
    color: '#8b5cf6',
    baseValue: 6.5,
    variance: 0.5,
  },
  airTemperature: {
    title: 'Air Temperature',
    valueLabel: 'Temperature (°C)',
    color: '#06b6d4',
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
    class="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden"
  >
    <!-- Subtle accent bar -->
    <div class="h-1 bg-gradient-to-r from-indigo-500 to-purple-600"></div>

    <!-- Header -->
    <div class="px-6 py-5 border-b border-gray-100 dark:border-gray-800">
      <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <!-- Title Section -->
        <div class="flex items-center gap-4">
          <div
            class="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-100 to-indigo-50 dark:from-indigo-900/30 dark:to-indigo-800/20 flex items-center justify-center ring-1 ring-indigo-200/50 dark:ring-indigo-700/30"
          >
            <svg
              class="w-6 h-6 text-indigo-600 dark:text-indigo-400"
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
          class="flex items-center bg-gray-100 dark:bg-gray-800 rounded-xl p-1 border border-gray-200 dark:border-gray-700"
        >
          <button
            v-for="option in ['24h', '7d', '30d']"
            :key="option"
            @click="updateHistoricalData(option as '24h' | '7d' | '30d')"
            :disabled="isLoading"
            class="px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 disabled:opacity-50"
            :class="{
              'bg-white dark:bg-gray-700 text-indigo-600 dark:text-indigo-400 shadow-sm ring-1 ring-indigo-200/50 dark:ring-indigo-700/30':
                trendTimeframe === option,
              'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-750':
                trendTimeframe !== option,
            }"
          >
            {{ option }}
          </button>
        </div>
      </div>
    </div>

    <!-- Charts Grid -->
    <div class="p-6">
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- Dynamic Sensor Charts -->
        <div v-for="(config, sensorKey) in sensors" :key="sensorKey" class="group">
          <div
            class="p-5 bg-gradient-to-br from-gray-50 to-gray-25 dark:from-gray-800/50 dark:to-gray-700/30 rounded-xl border border-gray-200/50 dark:border-gray-700/30 hover:border-gray-300 dark:hover:border-gray-600 transition-all duration-200"
          >
            <SensorChart
              :data="historicalData[sensorKey] || []"
              :color="config.color"
              :height="windowWidth < 640 ? 180 : 200"
              :title="config.title"
              :valueLabel="config.valueLabel"
              :animate="true"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.animate-fade-in {
  animation: fadeIn 0.6s ease-out;
}

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

.group:hover .group-hover\:scale-105 {
  transform: scale(1.05);
}
</style>
