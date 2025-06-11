<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import SensorChart from '../components/SensorChart.vue'
import SoilHealthDashboard from '../components/SoilHealthDashboard.vue'
import {
  formatCurrentTime,
  generateTimeBasedData,
  getSensorStatus,
  calculateParameterScore,
} from '@/scripts'

type DataPoint = { time: string; value: number }

const soilData = ref({
  temperature: {
    value: 24.5,
    unit: '°C',
    min: 15,
    max: 35,
    status: 'optimal',
    trend: 'stable',
    history: [] as DataPoint[],
  },
  moisture: {
    value: 65,
    unit: '%',
    min: 30,
    max: 85,
    status: 'optimal',
    trend: 'up',
    history: [] as DataPoint[],
  },
  ph: {
    value: 6.8,
    unit: '',
    min: 5.5,
    max: 7.5,
    status: 'optimal',
    trend: 'stable',
    history: [] as DataPoint[],
  },
  nutrients: {
    nitrogen: {
      value: 42,
      unit: 'ppm',
      min: 20,
      max: 80,
      status: 'optimal',
      trend: 'up',
      history: [] as DataPoint[],
    },
    phosphorus: {
      value: 35,
      unit: 'ppm',
      min: 20,
      max: 60,
      status: 'optimal',
      trend: 'stable',
      history: [] as DataPoint[],
    },
    potassium: {
      value: 180,
      unit: 'ppm',
      min: 125,
      max: 250,
      status: 'optimal',
      trend: 'down',
      history: [] as DataPoint[],
    },
  },
  conductivity: {
    value: 1.2,
    unit: 'mS/cm',
    min: 0.8,
    max: 1.5,
    status: 'optimal',
    trend: 'stable',
    history: [] as DataPoint[],
  },
})

const lastUpdated = ref(formatCurrentTime())

const isRefreshing = ref(false)
const timeFrame = ref('24h')

function refreshData() {
  isRefreshing.value = true
  setTimeout(() => {
    soilData.value.nutrients.nitrogen.value = parseFloat(
      (soilData.value.nutrients.nitrogen.value + (Math.random() * 4 - 2)).toFixed(1),
    )
    soilData.value.nutrients.nitrogen.trend =
      Math.random() > 0.5 ? (Math.random() > 0.5 ? 'up' : 'down') : 'stable'

    soilData.value.nutrients.phosphorus.value = parseFloat(
      (soilData.value.nutrients.phosphorus.value + (Math.random() * 3 - 1.5)).toFixed(1),
    )
    soilData.value.nutrients.phosphorus.trend =
      Math.random() > 0.5 ? (Math.random() > 0.5 ? 'up' : 'down') : 'stable'

    soilData.value.nutrients.potassium.value = parseFloat(
      (soilData.value.nutrients.potassium.value + (Math.random() * 10 - 5)).toFixed(1),
    )
    soilData.value.nutrients.potassium.trend =
      Math.random() > 0.5 ? (Math.random() > 0.5 ? 'up' : 'down') : 'stable'

    updateHistoricalData()
    updateSensorStatuses()

    lastUpdated.value = formatCurrentTime()

    isRefreshing.value = false
  }, 1000)
}

function generateHistoricalData() {
  const now = new Date()
  const points = timeFrame.value === '24h' ? 24 : timeFrame.value === '7d' ? 28 : 30
  const interval = timeFrame.value === '24h' ? 60 : timeFrame.value === '7d' ? 360 : 1440

  soilData.value.temperature.history = createTimeBasedData(points, interval, 20, 28, now)
  soilData.value.moisture.history = createTimeBasedData(points, interval, 55, 75, now)
  soilData.value.ph.history = createTimeBasedData(points, interval, 6.2, 7.2, now)
  soilData.value.conductivity.history = createTimeBasedData(points, interval, 1.0, 1.4, now)
}

function updateHistoricalData() {
  const now = new Date()

  let timeLabel: string
  if (timeFrame.value === '24h') {
    timeLabel = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })

    soilData.value.temperature.history.push({
      time: timeLabel,
      value: soilData.value.temperature.value,
    })
    soilData.value.moisture.history.push({
      time: timeLabel,
      value: soilData.value.moisture.value,
    })
    soilData.value.ph.history.push({
      time: timeLabel,
      value: soilData.value.ph.value,
    })
    soilData.value.conductivity.history.push({
      time: timeLabel,
      value: soilData.value.conductivity.value,
    })

    const maxPoints = 24
    if (soilData.value.temperature.history.length > maxPoints) {
      soilData.value.temperature.history.shift()
      soilData.value.moisture.history.shift()
      soilData.value.ph.history.shift()
      soilData.value.conductivity.history.shift()
    }
  } else {
    if (timeFrame.value === '7d') {
      timeLabel = now.toLocaleDateString([], { month: 'short', day: 'numeric' })
    } else {
      timeLabel = now.toLocaleDateString([], { month: 'short', day: 'numeric' })
    }

    const tempIndex = soilData.value.temperature.history.findIndex(
      (item) => item.time === timeLabel,
    )
    const moistIndex = soilData.value.moisture.history.findIndex((item) => item.time === timeLabel)
    const phIndex = soilData.value.ph.history.findIndex((item) => item.time === timeLabel)
    const condIndex = soilData.value.conductivity.history.findIndex(
      (item) => item.time === timeLabel,
    )

    if (tempIndex !== -1) {
      soilData.value.temperature.history[tempIndex].value = soilData.value.temperature.value
    } else {
      soilData.value.temperature.history.push({
        time: timeLabel,
        value: soilData.value.temperature.value,
      })
      if (soilData.value.temperature.history.length > (timeFrame.value === '7d' ? 28 : 30)) {
        soilData.value.temperature.history.shift()
      }
    }

    if (moistIndex !== -1) {
      soilData.value.moisture.history[moistIndex].value = soilData.value.moisture.value
    } else {
      soilData.value.moisture.history.push({
        time: timeLabel,
        value: soilData.value.moisture.value,
      })
      if (soilData.value.moisture.history.length > (timeFrame.value === '7d' ? 28 : 30)) {
        soilData.value.moisture.history.shift()
      }
    }

    if (phIndex !== -1) {
      soilData.value.ph.history[phIndex].value = soilData.value.ph.value
    } else {
      soilData.value.ph.history.push({
        time: timeLabel,
        value: soilData.value.ph.value,
      })
      if (soilData.value.ph.history.length > (timeFrame.value === '7d' ? 28 : 30)) {
        soilData.value.ph.history.shift()
      }
    }

    if (condIndex !== -1) {
      soilData.value.conductivity.history[condIndex].value = soilData.value.conductivity.value
    } else {
      soilData.value.conductivity.history.push({
        time: timeLabel,
        value: soilData.value.conductivity.value,
      })
      if (soilData.value.conductivity.history.length > (timeFrame.value === '7d' ? 28 : 30)) {
        soilData.value.conductivity.history.shift()
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
  generateHistoricalData()
}

onMounted(() => {
  generateHistoricalData()
  updateSensorStatuses()
})

function updateSensorStatuses() {
  soilData.value.temperature.status = getSensorStatus(
    soilData.value.temperature.value,
    soilData.value.temperature.min,
    soilData.value.temperature.max,
    20,
    28,
  )

  soilData.value.moisture.status = getSensorStatus(
    soilData.value.moisture.value,
    soilData.value.moisture.min,
    soilData.value.moisture.max,
    50,
    75,
  )

  soilData.value.ph.status = getSensorStatus(
    soilData.value.ph.value,
    soilData.value.ph.min,
    soilData.value.ph.max,
    6.0,
    7.0,
  )

  soilData.value.conductivity.status = getSensorStatus(
    soilData.value.conductivity.value,
    soilData.value.conductivity.min,
    soilData.value.conductivity.max,
    1.0,
    1.4,
  )

  soilData.value.nutrients.nitrogen.status = getSensorStatus(
    soilData.value.nutrients.nitrogen.value,
    soilData.value.nutrients.nitrogen.min,
    soilData.value.nutrients.nitrogen.max,
    30,
    60,
  )

  soilData.value.nutrients.phosphorus.status = getSensorStatus(
    soilData.value.nutrients.phosphorus.value,
    soilData.value.nutrients.phosphorus.min,
    soilData.value.nutrients.phosphorus.max,
    25,
    50,
  )

  soilData.value.nutrients.potassium.status = getSensorStatus(
    soilData.value.nutrients.potassium.value,
    soilData.value.nutrients.potassium.min,
    soilData.value.nutrients.potassium.max,
    150,
    220,
  )
}

const soilHealthScore = computed(() => {
  const tempScore = calculateParameterScore(
    soilData.value.temperature.value,
    soilData.value.temperature.min,
    soilData.value.temperature.max,
    20,
    28,
  )
  const moistureScore = calculateParameterScore(
    soilData.value.moisture.value,
    soilData.value.moisture.min,
    soilData.value.moisture.max,
    50,
    75,
  )
  const phScore = calculateParameterScore(
    soilData.value.ph.value,
    soilData.value.ph.min,
    soilData.value.ph.max,
    6.0,
    7.0,
  )
  const conductivityScore = calculateParameterScore(
    soilData.value.conductivity.value,
    soilData.value.conductivity.min,
    soilData.value.conductivity.max,
    1.0,
    1.4,
  )
  const nitrogenScore = calculateParameterScore(
    soilData.value.nutrients.nitrogen.value,
    soilData.value.nutrients.nitrogen.min,
    soilData.value.nutrients.nitrogen.max,
    30,
    60,
  )
  const phosphorusScore = calculateParameterScore(
    soilData.value.nutrients.phosphorus.value,
    soilData.value.nutrients.phosphorus.min,
    soilData.value.nutrients.phosphorus.max,
    25,
    50,
  )
  const potassiumScore = calculateParameterScore(
    soilData.value.nutrients.potassium.value,
    soilData.value.nutrients.potassium.min,
    soilData.value.nutrients.potassium.max,
    150,
    220,
  )

  const score =
    tempScore * 0.15 +
    moistureScore * 0.2 +
    phScore * 0.15 +
    conductivityScore * 0.1 +
    nitrogenScore * 0.15 +
    phosphorusScore * 0.1 +
    potassiumScore * 0.15

  return Math.round(score)
})
</script>

<template>
  <div class="container mx-auto px-4 py-6">
    <!-- Title Banner -->
    <div
      class="mb-8 bg-white dark:bg-gray-900 rounded-xl shadow-md overflow-hidden border border-gray-100 dark:border-gray-700"
    >
      <div class="h-1.5 w-full bg-gradient-to-r from-green-400 to-green-600"></div>
      <div class="p-4 sm:p-6">
        <!-- Header Content -->
        <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <!-- Title and Description -->
          <div class="flex items-start sm:items-center w-full md:w-auto">
            <div
              class="bg-green-100 dark:bg-green-900/30 p-2 sm:p-3 rounded-lg mr-3 sm:mr-4 flex-shrink-0"
            >
              <span
                class="mdi mdi-shovel text-green-600 dark:text-green-400 text-xl sm:text-2xl"
              ></span>
            </div>
            <div class="flex-grow">
              <h1 class="text-xl sm:text-2xl font-bold text-gray-800 dark:text-gray-100">
                Soil Analysis Dashboard
              </h1>
              <p
                class="text-sm sm:text-base text-gray-600 dark:text-gray-400 mt-0.5 sm:mt-1 line-clamp-2 sm:line-clamp-none"
              >
                Comprehensive soil health monitoring and analysis
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

    <!-- Dashboard Overview -->
    <SoilHealthDashboard :soil-data="soilData" :health-score="soilHealthScore" />

    <!-- Soil Trends Section -->
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
              <h2 class="text-xl font-bold text-gray-800 dark:text-gray-100">Soil Trends</h2>
              <p class="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Historical data analysis for soil parameters
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
            :data="soilData.temperature.history"
            valueLabel="Temperature (°C)"
            chartColor="#E97451"
          />
          <SensorChart
            title="Moisture Trends"
            :data="soilData.moisture.history"
            valueLabel="Moisture (%)"
            chartColor="#3B82F6"
          />
          <SensorChart
            title="pH Level Trends"
            :data="soilData.ph.history"
            valueLabel="pH Level"
            chartColor="#8B5CF6"
          />
          <SensorChart
            title="Conductivity Trends"
            :data="soilData.conductivity.history"
            valueLabel="Conductivity (mS/cm)"
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
