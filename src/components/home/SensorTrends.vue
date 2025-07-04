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
  <div class="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden relative">
    <!-- Animated gradient accent bar -->
    <div class="h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-600 animate-gradient-x"></div>
    
    <!-- Header with enhanced styling -->
    <div class="px-6 py-6 lg:px-8 lg:py-7 border-b border-gray-100 dark:border-gray-800">
      <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
        <!-- Enhanced title section -->
        <div class="flex items-center gap-5">
          <div class="relative group">
            <div class="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-100 via-indigo-50 to-purple-50 dark:from-indigo-900/40 dark:via-indigo-800/30 dark:to-purple-800/20 flex items-center justify-center ring-1 ring-indigo-200/50 dark:ring-indigo-700/30 backdrop-blur-sm transition-all duration-300 group-hover:scale-105 group-hover:shadow-lg group-hover:shadow-indigo-500/20">
              <svg class="w-7 h-7 text-indigo-600 dark:text-indigo-400 transition-transform duration-300 group-hover:rotate-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <div class="absolute inset-0 bg-indigo-500/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10"></div>
          </div>
          <div>
            <h2 class="text-2xl font-bold text-gray-900 dark:text-white bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 dark:from-white dark:via-gray-100 dark:to-white bg-clip-text">Sensor Trends</h2>
            <p class="text-sm text-gray-500 dark:text-gray-400 mt-1 font-medium">
              {{ timeframeLabel }} • Updated {{ formattedLastUpdated }}
            </p>
          </div>
        </div>

        <!-- Enhanced time range selector -->
        <div class="flex items-center bg-gray-100 dark:bg-gray-800 rounded-2xl p-1.5 border border-gray-200 dark:border-gray-700 shadow-sm">
          <button
            v-for="option in ['24h', '7d', '30d']"
            :key="option"
            @click="updateHistoricalData(option as '24h' | '7d' | '30d')"
            :disabled="isLoading"
            class="px-5 py-2.5 text-sm font-semibold rounded-xl transition-all duration-200 disabled:opacity-50 relative overflow-hidden"
            :class="{
              'bg-white dark:bg-gray-700 text-indigo-600 dark:text-indigo-400 shadow-sm ring-1 ring-indigo-200/50 dark:ring-indigo-700/30 transform scale-105':
                trendTimeframe === option,
              'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-750':
                trendTimeframe !== option,
            }"
          >
            <span class="relative z-10">{{ option }}</span>
            <div 
              v-if="trendTimeframe === option"
              class="absolute inset-0 bg-gradient-to-r from-indigo-500/10 to-purple-500/10 rounded-xl"
            ></div>
          </button>
        </div>
      </div>
    </div>

    <!-- Enhanced charts grid -->
    <div class="p-6 lg:p-8">
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- Dynamic sensor charts with enhanced styling -->
        <div v-for="(config, sensorKey) in sensors" :key="sensorKey" class="group">
          <div class="p-6 bg-gradient-to-br from-gray-50 via-gray-25 to-slate-50 dark:from-gray-800/50 dark:via-gray-700/40 dark:to-slate-700/30 rounded-2xl border border-gray-200/50 dark:border-gray-700/30 hover:border-gray-300 dark:hover:border-gray-600 transition-all duration-300 hover:shadow-lg hover:shadow-gray-500/10 hover:scale-[1.02]">
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

      <!-- Loading state overlay -->
      <div 
        v-if="isLoading" 
        class="absolute inset-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm flex items-center justify-center z-10 rounded-2xl"
      >
        <div class="flex flex-col items-center space-y-4">
          <div class="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
          <span class="text-sm font-medium text-gray-600 dark:text-gray-400">Loading trends...</span>
        </div>
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

.group:hover .group-hover\:rotate-12 {
  transform: rotate(12deg);
}

/* Smooth transitions for all elements */
* {
  transition-property: all;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 300ms;
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