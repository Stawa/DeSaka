<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import SensorChart from '@/components/SensorChart.vue'
import AirQualityDashboard from '@/components/AirQualityDashboard.vue'
import {
  formatCurrentTime,
  generateTimeBasedData,
  getRandomTrend,
  getSensorStatus,
  calculateParameterScore,
} from '@/scripts'

type DataPoint = { time: string; value: number }

const airData = ref({
  temperature: {
    value: 23.5,
    unit: '°C',
    min: 18,
    max: 28,
    optimal_min: 21,
    optimal_max: 25,
    status: 'optimal',
    trend: 'increasing',
    history: [] as DataPoint[],
  },
  humidity: {
    value: 45,
    unit: '%',
    min: 30,
    max: 60,
    optimal_min: 40,
    optimal_max: 50,
    status: 'optimal',
    trend: 'stable',
    history: [] as DataPoint[],
  },
  co2: {
    value: 850,
    unit: 'ppm',
    min: 400,
    max: 1000,
    optimal_min: 400,
    optimal_max: 800,
    status: 'warning',
    trend: 'increasing',
    history: [] as DataPoint[],
  },
  tvoc: {
    value: 220,
    unit: 'ppb',
    min: 0,
    max: 500,
    optimal_min: 0,
    optimal_max: 300,
    status: 'optimal',
    trend: 'stable',
    history: [] as DataPoint[],
  },
  pressure: {
    value: 1013.2,
    unit: 'hPa',
    min: 990,
    max: 1030,
    optimal_min: 1000,
    optimal_max: 1020,
    status: 'optimal',
    trend: 'stable',
    history: [] as DataPoint[],
  },
  light: {
    value: 450,
    unit: 'lux',
    min: 200,
    max: 1000,
    optimal_min: 300,
    optimal_max: 700,
    status: 'optimal',
    trend: 'decreasing',
    history: [] as DataPoint[],
  },
})

const lastUpdated = ref(formatCurrentTime())

const isRefreshing = ref(false)
const timeFrame = ref('24h')

function refreshData() {
  isRefreshing.value = true
  setTimeout(() => {
    airData.value.temperature.value = parseFloat(
      (airData.value.temperature.value + (Math.random() * 2 - 1)).toFixed(1),
    )
    airData.value.humidity.value = parseFloat(
      (airData.value.humidity.value + (Math.random() * 5 - 2.5)).toFixed(1),
    )
    airData.value.co2.value = parseFloat(
      (airData.value.co2.value + (Math.random() * 50 - 25)).toFixed(0),
    )
    airData.value.tvoc.value = parseFloat(
      (airData.value.tvoc.value + (Math.random() * 30 - 15)).toFixed(0),
    )

    airData.value.temperature.trend = getRandomTrend()
    airData.value.humidity.trend = getRandomTrend()
    airData.value.co2.trend = getRandomTrend()
    airData.value.tvoc.trend = getRandomTrend()

    updateHistoricalData()
    updateSensorStatuses()

    lastUpdated.value = formatCurrentTime()

    isRefreshing.value = false
  }, 1000)
}

function generateHistoricalData() {
  const now = new Date()
  const config: Record<string, { points: number; interval: number }> = {
    '24h': { points: 24, interval: 60 },
    '7d': { points: 28, interval: 360 },
    default: { points: 30, interval: 1440 },
  }

  const { points, interval } = config[timeFrame.value] || config.default

  airData.value.temperature.history = createTimeBasedData(points, interval, 20, 26, now)
  airData.value.humidity.history = createTimeBasedData(points, interval, 35, 55, now)
  airData.value.co2.history = createTimeBasedData(points, interval, 500, 950, now)
  airData.value.tvoc.history = createTimeBasedData(points, interval, 100, 300, now)
  airData.value.pressure.history = createTimeBasedData(points, interval, 1000, 1025, now)
  airData.value.light.history = createTimeBasedData(points, interval, 250, 800, now)
}

function updateHistoricalData() {
  const now = new Date()

  let timeLabel: string
  if (timeFrame.value === '24h') {
    timeLabel = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })

    airData.value.temperature.history.push({
      time: timeLabel,
      value: airData.value.temperature.value,
    })
    airData.value.humidity.history.push({
      time: timeLabel,
      value: airData.value.humidity.value,
    })
    airData.value.co2.history.push({
      time: timeLabel,
      value: airData.value.co2.value,
    })
    airData.value.tvoc.history.push({
      time: timeLabel,
      value: airData.value.tvoc.value,
    })

    const maxPoints = 24
    if (airData.value.temperature.history.length > maxPoints) {
      airData.value.temperature.history.shift()
      airData.value.humidity.history.shift()
      airData.value.co2.history.shift()
      airData.value.tvoc.history.shift()
    }
  } else {
    if (timeFrame.value === '7d') {
      timeLabel = now.toLocaleDateString([], { month: 'short', day: 'numeric' })
    } else {
      timeLabel = now.toLocaleDateString([], { month: 'short', day: 'numeric' })
    }

    const tempIndex = airData.value.temperature.history.findIndex((item) => item.time === timeLabel)
    const humidIndex = airData.value.humidity.history.findIndex((item) => item.time === timeLabel)
    const co2Index = airData.value.co2.history.findIndex((item) => item.time === timeLabel)
    const tvocIndex = airData.value.tvoc.history.findIndex((item) => item.time === timeLabel)

    if (tempIndex !== -1) {
      airData.value.temperature.history[tempIndex].value = airData.value.temperature.value
    } else {
      airData.value.temperature.history.push({
        time: timeLabel,
        value: airData.value.temperature.value,
      })
      if (airData.value.temperature.history.length > (timeFrame.value === '7d' ? 28 : 30)) {
        airData.value.temperature.history.shift()
      }
    }

    if (humidIndex !== -1) {
      airData.value.humidity.history[humidIndex].value = airData.value.humidity.value
    } else {
      airData.value.humidity.history.push({
        time: timeLabel,
        value: airData.value.humidity.value,
      })
      if (airData.value.humidity.history.length > (timeFrame.value === '7d' ? 28 : 30)) {
        airData.value.humidity.history.shift()
      }
    }

    if (co2Index !== -1) {
      airData.value.co2.history[co2Index].value = airData.value.co2.value
    } else {
      airData.value.co2.history.push({
        time: timeLabel,
        value: airData.value.co2.value,
      })
      if (airData.value.co2.history.length > (timeFrame.value === '7d' ? 28 : 30)) {
        airData.value.co2.history.shift()
      }
    }

    if (tvocIndex !== -1) {
      airData.value.tvoc.history[tvocIndex].value = airData.value.tvoc.value
    } else {
      airData.value.tvoc.history.push({
        time: timeLabel,
        value: airData.value.tvoc.value,
      })
      if (airData.value.tvoc.history.length > (timeFrame.value === '7d' ? 28 : 30)) {
        airData.value.tvoc.history.shift()
      }
    }
  }
}

function createTimeBasedData(
  points: number,
  intervalMinutes: number,
  min: number,
  max: number,
  endTime: Date,
): DataPoint[] {
  return generateTimeBasedData(points, intervalMinutes, min, max, endTime, timeFrame.value)
}

function changeTimeFrame(frame: string) {
  timeFrame.value = frame
  updateHistoricalData()
}

onMounted(() => {
  generateHistoricalData()
  updateSensorStatuses()
})

function updateSensorStatuses() {
  airData.value.temperature.status = getSensorStatus(
    airData.value.temperature.value,
    airData.value.temperature.min,
    airData.value.temperature.max,
    airData.value.temperature.optimal_min,
    airData.value.temperature.optimal_max,
  )

  airData.value.humidity.status = getSensorStatus(
    airData.value.humidity.value,
    airData.value.humidity.min,
    airData.value.humidity.max,
    airData.value.humidity.optimal_min,
    airData.value.humidity.optimal_max,
  )

  airData.value.co2.status = getSensorStatus(
    airData.value.co2.value,
    airData.value.co2.min,
    airData.value.co2.max,
    airData.value.co2.optimal_min,
    airData.value.co2.optimal_max,
  )

  airData.value.tvoc.status = getSensorStatus(
    airData.value.tvoc.value,
    airData.value.tvoc.min,
    airData.value.tvoc.max,
    airData.value.tvoc.optimal_min,
    airData.value.tvoc.optimal_max,
  )

  airData.value.pressure.status = getSensorStatus(
    airData.value.pressure.value,
    airData.value.pressure.min,
    airData.value.pressure.max,
    airData.value.pressure.optimal_min,
    airData.value.pressure.optimal_max,
  )

  airData.value.light.status = getSensorStatus(
    airData.value.light.value,
    airData.value.light.min,
    airData.value.light.max,
    airData.value.light.optimal_min,
    airData.value.light.optimal_max,
  )
}

const airQualityIndex = computed(() => {
  const temperatureScore = calculateParameterScore(
    airData.value.temperature.value,
    airData.value.temperature.min,
    airData.value.temperature.max,
    airData.value.temperature.optimal_min,
    airData.value.temperature.optimal_max,
  )

  const humidityScore = calculateParameterScore(
    airData.value.humidity.value,
    airData.value.humidity.min,
    airData.value.humidity.max,
    airData.value.humidity.optimal_min,
    airData.value.humidity.optimal_max,
  )

  const co2Score = calculateParameterScore(
    airData.value.co2.value,
    airData.value.co2.min,
    airData.value.co2.max,
    airData.value.co2.optimal_min,
    airData.value.co2.optimal_max,
  )

  const tvocScore = calculateParameterScore(
    airData.value.tvoc.value,
    airData.value.tvoc.min,
    airData.value.tvoc.max,
    airData.value.tvoc.optimal_min,
    airData.value.tvoc.optimal_max,
  )

  const totalScore = temperatureScore * 0.2 + humidityScore * 0.2 + co2Score * 0.3 + tvocScore * 0.3

  return Math.round(totalScore)
})
</script>

<template>
  <div class="container mx-auto px-4 py-6">
    <!-- Title Banner -->
    <div
      class="mb-8 bg-white dark:bg-gray-900 rounded-xl shadow-md overflow-hidden border border-gray-100 dark:border-gray-700"
    >
      <div class="h-1.5 w-full bg-gradient-to-r from-blue-400 to-blue-600"></div>
      <div class="p-4 sm:p-6">
        <!-- Header Content -->
        <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <!-- Title and Description -->
          <div class="flex items-start sm:items-center w-full md:w-auto">
            <div
              class="bg-blue-100 dark:bg-blue-900/30 py-2 px-3 sm:py-2 sm:px-3 rounded-lg mr-3 sm:mr-4 flex-shrink-0"
            >
              <span
                class="mdi mdi-air-filter text-blue-600 dark:text-blue-400 text-xl sm:text-2xl"
              ></span>
            </div>
            <div class="flex-grow">
              <h1 class="text-xl sm:text-2xl font-bold text-gray-800 dark:text-gray-100">
                Air Quality Monitoring
              </h1>
              <p
                class="text-sm sm:text-base text-gray-600 dark:text-gray-400 mt-0.5 sm:mt-1 line-clamp-2 sm:line-clamp-none"
              >
                Comprehensive air quality monitoring and analysis
              </p>
              <div class="text-xs sm:text-sm text-gray-500 dark:text-gray-500 mt-0.5 sm:mt-1">
                Last updated: {{ lastUpdated }}
              </div>
            </div>
          </div>

          <!-- Action Buttons -->
          <div class="flex flex-wrap gap-2 sm:gap-3 w-full md:w-auto justify-end mt-3 md:mt-0">
            <button
              @click="refreshData"
              class="flex items-center px-3 sm:px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 dark:focus:ring-offset-gray-900 transition-colors shadow-sm"
              :class="{ 'opacity-50 cursor-not-allowed': isRefreshing }"
              :disabled="isRefreshing"
            >
              <span
                class="mdi mr-1.5"
                :class="isRefreshing ? 'mdi-loading mdi-spin' : 'mdi-refresh'"
              ></span>
              <span class="whitespace-nowrap">{{
                isRefreshing ? 'Refreshing...' : 'Refresh Data'
              }}</span>
            </button>

            <button
              class="flex items-center px-3 sm:px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 dark:focus:ring-offset-gray-900 transition-colors shadow-sm"
            >
              <span class="mdi mdi-download mr-1.5"></span>
              <span class="whitespace-nowrap">Export</span>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Air Quality Dashboard -->
    <AirQualityDashboard :air-data="airData" :quality-index="airQualityIndex" />

    <!-- Air Trends Section -->
    <div
      class="mb-8 bg-white dark:bg-gray-900 rounded-xl shadow-md overflow-hidden border border-gray-100 dark:border-gray-700 dashboard-section"
    >
      <div class="h-1.5 w-full bg-gradient-to-r from-blue-400 to-blue-600"></div>
      <div class="p-6">
        <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4">
          <div class="flex items-center mb-3 sm:mb-0">
            <div class="bg-blue-100 dark:bg-blue-900/30 p-2 rounded-lg mr-3">
              <span
                class="mdi mdi-chart-timeline-variant text-blue-600 dark:text-blue-400 text-xl"
              ></span>
            </div>
            <div>
              <h2 class="text-xl font-bold text-gray-800 dark:text-gray-100">Air Trends</h2>
              <p class="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Historical data analysis for air parameters
              </p>
            </div>
          </div>

          <!-- Time Period Selector -->
          <div
            class="flex items-center space-x-1 bg-gray-100 dark:bg-gray-700 rounded-full p-1 self-start sm:self-auto"
          >
            <button
              @click="changeTimeFrame('24h')"
              class="px-3 py-1 rounded-full text-xs font-medium transition-colors"
              :class="
                timeFrame === '24h'
                  ? 'bg-primary-500 text-white'
                  : 'text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              "
            >
              24h
            </button>
            <button
              @click="changeTimeFrame('7d')"
              class="px-3 py-1 rounded-full text-xs font-medium transition-colors"
              :class="
                timeFrame === '7d'
                  ? 'bg-primary-500 text-white'
                  : 'text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              "
            >
              7d
            </button>
            <button
              @click="changeTimeFrame('30d')"
              class="px-3 py-1 rounded-full text-xs font-medium transition-colors"
              :class="
                timeFrame === '30d'
                  ? 'bg-primary-500 text-white'
                  : 'text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              "
            >
              30d
            </button>
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <SensorChart
            title="Temperature Trends"
            :data="airData.temperature.history"
            valueLabel="Temperature (°C)"
            chartColor="#E97451"
          />
          <SensorChart
            title="Humidity Trends"
            :data="airData.humidity.history"
            valueLabel="Humidity (%)"
            chartColor="#3B82F6"
          />
          <SensorChart
            title="CO₂ Level Trends"
            :data="airData.co2.history"
            valueLabel="CO₂ (ppm)"
            chartColor="#8B5CF6"
          />
          <SensorChart
            title="TVOC Level Trends"
            :data="airData.tvoc.history"
            valueLabel="TVOC (ppb)"
            chartColor="#10B981"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Fade-in animation */
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
  animation: fadeIn 0.5s ease-out forwards;
}

/* Transition for dark mode */
.dark-mode-transition {
  transition:
    background-color 0.3s ease,
    color 0.3s ease,
    border-color 0.3s ease;
}

/* Dashboard section styling */
.dashboard-section {
  transition:
    transform 0.3s ease,
    box-shadow 0.3s ease;
}

.dashboard-section:hover {
  transform: translateY(-2px);
  box-shadow:
    0 10px 25px -5px rgba(0, 0, 0, 0.1),
    0 10px 10px -5px rgba(0, 0, 0, 0.04);
}
</style>
