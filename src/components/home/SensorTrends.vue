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
    color: '#6366f1',
    bgColor: '',
    hoverColor: '',
    borderColor: 'border-gray-100 dark:border-gray-700',
    baseValue: 22,
    variance: 4,
  },
  soilMoisture: {
    title: 'Soil Moisture',
    valueLabel: 'Moisture (%)',
    color: '#3b82f6',
    bgColor: '',
    hoverColor: '',
    borderColor: 'border-gray-100 dark:border-gray-700',
    baseValue: 65,
    variance: 15,
  },
  soilPH: {
    title: 'Soil pH',
    valueLabel: 'pH Level',
    color: '#8b5cf6',
    bgColor: '',
    hoverColor: '',
    borderColor: 'border-gray-100 dark:border-gray-700',
    baseValue: 6.5,
    variance: 0.5,
  },
  airTemperature: {
    title: 'Air Temperature',
    valueLabel: 'Temperature (°C)',
    color: '#06b6d4',
    bgColor: '',
    hoverColor: '',
    borderColor: 'border-gray-100 dark:border-gray-700',
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
  <div class="mb-6 sm:mb-8">
    <div
      class="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 transition-all duration-300 hover:shadow-md w-full max-w-full overflow-hidden"
    >
      <!-- Header -->
      <div class="px-4 sm:px-6 py-4 sm:py-5 border-b border-gray-50 dark:border-gray-800">
        <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <!-- Title Section -->
          <div class="flex items-center gap-3">
            <div
              class="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-600 flex items-center justify-center shadow-sm"
            >
              <span class="text-white text-2xl mdi mdi-view-dashboard"> </span>
            </div>
            <div>
              <h2 class="text-xl font-semibold text-gray-900 dark:text-gray-100">Sensor Trends</h2>
              <p class="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                {{ timeframeLabel }} • Updated {{ formattedLastUpdated }}
              </p>
            </div>
          </div>

          <!-- Time Range Selector -->
          <div class="flex items-center bg-gray-50 dark:bg-gray-800 rounded-lg p-1">
            <button
              v-for="option in ['24h', '7d', '30d']"
              :key="option"
              @click="updateHistoricalData(option as '24h' | '7d' | '30d')"
              :disabled="isLoading"
              class="px-3 py-1.5 text-sm font-medium rounded-md transition-all duration-200 disabled:opacity-50"
              :class="{
                'bg-white dark:bg-gray-700 text-indigo-600 dark:text-indigo-400 shadow-sm':
                  trendTimeframe === option,
                'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100':
                  trendTimeframe !== option,
              }"
            >
              {{ option }}
            </button>
          </div>
        </div>
      </div>

      <!-- Charts Grid -->
      <div class="p-4 sm:p-6">
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <!-- Dynamic Sensor Charts -->
          <div v-for="(config, sensorKey) in sensors" :key="sensorKey" class="group">
            <div
              :class="[
                'rounded-lg p-4 transition-all duration-200 border',
                config.bgColor,
                config.hoverColor,
                config.borderColor,
              ]"
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

/* Custom scrollbar for potential future use */
::-webkit-scrollbar {
  width: 6px;
}

::-webkit-scrollbar-track {
  background: #f1f5f9;
}

::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 3px;
}

::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}

.dark ::-webkit-scrollbar-track {
  background: #1e293b;
}

.dark ::-webkit-scrollbar-thumb {
  background: #475569;
}

.dark ::-webkit-scrollbar-thumb:hover {
  background: #64748b;
}
</style>
