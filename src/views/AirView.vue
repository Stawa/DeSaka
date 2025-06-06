<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import SensorCard from '@/components/SensorCard.vue'
import SensorChart from '@/components/SensorChart.vue'

const airData = ref({
  temperature: {
    value: 23.5,
    unit: '°C',
    status: 'normal',
    trend: 'increasing',
    min: 18,
    max: 28,
    history: [] as { time: string; value: number }[],
  },
  humidity: {
    value: 45,
    unit: '%',
    status: 'normal',
    trend: 'stable',
    min: 30,
    max: 60,
    history: [] as { time: string; value: number }[],
  },
  co2: {
    value: 850,
    unit: 'ppm',
    status: 'warning',
    trend: 'increasing',
    min: 400,
    max: 1000,
    history: [] as { time: string; value: number }[],
  },
  tvoc: {
    value: 220,
    unit: 'ppb',
    status: 'normal',
    trend: 'stable',
    min: 0,
    max: 500,
    history: [] as { time: string; value: number }[],
  },
  pressure: {
    value: 1013.2,
    unit: 'hPa',
    status: 'normal',
    trend: 'stable',
    min: 990,
    max: 1030,
    history: [] as { time: string; value: number }[],
  },
  light: {
    value: 450,
    unit: 'lux',
    status: 'normal',
    trend: 'decreasing',
    min: 200,
    max: 1000,
    history: [] as { time: string; value: number }[],
  },
})

const lastUpdated = ref(new Date().toLocaleString())

function generateHistoricalData(min: number, max: number, count: number = 24) {
  const data = []
  const now = new Date()

  for (let i = count - 1; i >= 0; i--) {
    const time = new Date(now.getTime() - i * 60 * 60 * 1000)
    const value = min + Math.random() * (max - min)
    data.push({
      time: time.getHours() + ':00',
      value: parseFloat(value.toFixed(1)),
    })
  }

  return data
}

onMounted(() => {
  airData.value.temperature.history = generateHistoricalData(20, 26)
  airData.value.humidity.history = generateHistoricalData(35, 55)
  airData.value.co2.history = generateHistoricalData(500, 950)
  airData.value.tvoc.history = generateHistoricalData(100, 300)
  airData.value.pressure.history = generateHistoricalData(1000, 1025)
  airData.value.light.history = generateHistoricalData(250, 800)
})

function getStatus(value: number, min: number, max: number) {
  if (value < min) return 'critical'
  if (value > max) return 'critical'
  if (value < min + (max - min) * 0.2 || value > max - (max - min) * 0.2) return 'warning'
  return 'normal'
}

function updateSensorStatuses() {
  airData.value.temperature.status = getStatus(
    airData.value.temperature.value,
    airData.value.temperature.min,
    airData.value.temperature.max,
  )

  airData.value.humidity.status = getStatus(
    airData.value.humidity.value,
    airData.value.humidity.min,
    airData.value.humidity.max,
  )

  airData.value.co2.status = getStatus(
    airData.value.co2.value,
    airData.value.co2.min,
    airData.value.co2.max,
  )

  airData.value.tvoc.status = getStatus(
    airData.value.tvoc.value,
    airData.value.tvoc.min,
    airData.value.tvoc.max,
  )

  airData.value.pressure.status = getStatus(
    airData.value.pressure.value,
    airData.value.pressure.min,
    airData.value.pressure.max,
  )

  airData.value.light.status = getStatus(
    airData.value.light.value,
    airData.value.light.min,
    airData.value.light.max,
  )
}

// Compute air quality index based on CO2 and TVOC levels
const airQualityIndex = computed(() => {
  // Calculate CO2 score (0-100 where lower is better)
  const co2Score = calculateParameterScore(
    airData.value.co2.value,
    airData.value.co2.min,
    airData.value.co2.max,
  )

  // Calculate TVOC score (0-100 where lower is better)
  const tvocScore = calculateParameterScore(
    airData.value.tvoc.value,
    airData.value.tvoc.min,
    airData.value.tvoc.max,
  )

  // Calculate temperature and humidity comfort scores
  const tempScore = calculateParameterScore(
    airData.value.temperature.value,
    airData.value.temperature.min,
    airData.value.temperature.max,
  )

  const humidityScore = calculateParameterScore(
    airData.value.humidity.value,
    airData.value.humidity.min,
    airData.value.humidity.max,
  )

  // Weight the scores (CO2 and TVOC are more important for air quality)
  const weightedScore = co2Score * 0.4 + tvocScore * 0.3 + tempScore * 0.15 + humidityScore * 0.15

  // Return rounded score between 0-100
  return Math.round(Math.min(Math.max(weightedScore, 0), 100))
})

function calculateParameterScore(value: number, min: number, max: number): number {
  // Calculate how far the value is from the ideal middle point
  const middle = (min + max) / 2
  const range = max - min
  const deviation = Math.abs(value - middle)

  // Convert to a 0-100 score where 100 is perfect (at middle) and 0 is at or beyond min/max
  return Math.round(100 - (deviation / (range / 2)) * 100)
}

// Determine air quality status text and color
const airQualityStatus = computed(() => {
  if (airQualityIndex.value >= 80) return { text: 'Excellent', color: 'text-green-500' }
  if (airQualityIndex.value >= 60) return { text: 'Good', color: 'text-green-400' }
  if (airQualityIndex.value >= 40) return { text: 'Moderate', color: 'text-yellow-500' }
  if (airQualityIndex.value >= 20) return { text: 'Poor', color: 'text-orange-500' }
  return { text: 'Unhealthy', color: 'text-red-500' }
})

updateSensorStatuses()
</script>

<template>
  <div class="container mx-auto px-4 py-6">
    <div class="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
      <div>
        <h1 class="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-2">
          Air Quality Monitoring
        </h1>
        <p class="text-gray-600 dark:text-gray-300 mb-1">
          Comprehensive air quality monitoring and analysis
        </p>
        <p class="text-sm text-gray-500 dark:text-gray-400">Last updated: {{ lastUpdated }}</p>
      </div>

      <div class="mt-4 md:mt-0 flex space-x-2">
        <button
          class="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors flex items-center shadow-sm"
        >
          <span class="mdi mdi-refresh mr-2"></span>
          Refresh Data
        </button>
        <button
          class="px-4 py-2 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-lg border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors flex items-center shadow-sm"
        >
          <span class="mdi mdi-download mr-2"></span>
          Export
        </button>
      </div>
    </div>

    <!-- Air Quality Overview Card -->
    <div
      class="bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 rounded-xl shadow-md overflow-hidden mb-8 border border-gray-100 dark:border-gray-700"
    >
      <div class="p-6">
        <div class="flex flex-col md:flex-row md:items-center md:justify-between">
          <div class="mb-4 md:mb-0">
            <h2 class="text-xl font-bold text-gray-800 dark:text-gray-200 mb-2 flex items-center">
              <span class="mdi mdi-air-filter text-blue-500 mr-2 text-2xl"></span>
              Air Quality Overview
            </h2>
            <p class="text-gray-600 dark:text-gray-300">Overall air quality assessment</p>
          </div>

          <div
            class="flex items-center bg-white dark:bg-gray-700 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-600"
          >
            <div class="mr-4">
              <div class="text-4xl font-bold mb-1" :class="airQualityStatus.color">
                {{ airQualityIndex }}
              </div>
              <div class="text-sm font-medium" :class="airQualityStatus.color">
                {{ airQualityStatus.text }}
              </div>
            </div>

            <div class="relative h-20 w-20">
              <svg class="h-20 w-20 transform -rotate-90" viewBox="0 0 100 100">
                <circle
                  class="text-gray-200 dark:text-gray-600"
                  stroke-width="10"
                  stroke="currentColor"
                  fill="transparent"
                  r="40"
                  cx="50"
                  cy="50"
                />
                <circle
                  :class="airQualityStatus.color.replace('text', 'stroke')"
                  stroke-width="10"
                  :stroke-dasharray="`${airQualityIndex * 2.51}, 251`"
                  stroke-linecap="round"
                  stroke="currentColor"
                  fill="transparent"
                  r="40"
                  cx="50"
                  cy="50"
                />
              </svg>
              <div
                class="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-xs font-medium text-gray-500 dark:text-gray-300"
              >
                AQI
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="bg-gray-50 dark:bg-gray-800/50 border-t border-gray-100 dark:border-gray-700 p-4">
        <div class="flex flex-wrap gap-4 justify-between">
          <button
            class="flex items-center text-sm text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
          >
            <span class="mdi mdi-information-outline mr-1"></span>
            View Details
          </button>
          <button
            class="flex items-center text-sm text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
          >
            <span class="mdi mdi-history mr-1"></span>
            View History
          </button>
          <button
            class="flex items-center text-sm text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
          >
            <span class="mdi mdi-alert-circle-outline mr-1"></span>
            Set Alerts
          </button>
          <button
            class="flex items-center text-sm text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
          >
            <span class="mdi mdi-tune mr-1"></span>
            Adjust Parameters
          </button>
        </div>
      </div>
    </div>

    <!-- Air Sensor Cards -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-8">
      <SensorCard
        title="Air Temperature"
        :value="airData.temperature.value"
        :unit="airData.temperature.unit"
        :status="airData.temperature.status as 'normal' | 'warning' | 'critical'"
        :trend="airData.temperature.trend"
        icon="thermometer"
      />

      <SensorCard
        title="Humidity"
        :value="airData.humidity.value"
        :unit="airData.humidity.unit"
        :status="airData.humidity.status as 'normal' | 'warning' | 'critical'"
        :trend="airData.humidity.trend"
        icon="water-percent"
      />

      <SensorCard
        title="CO₂ Level"
        :value="airData.co2.value"
        :unit="airData.co2.unit"
        :status="airData.co2.status as 'normal' | 'warning' | 'critical'"
        :trend="airData.co2.trend"
        icon="molecule-co2"
      />

      <SensorCard
        title="TVOC Level"
        :value="airData.tvoc.value"
        :unit="airData.tvoc.unit"
        :status="airData.tvoc.status as 'normal' | 'warning' | 'critical'"
        :trend="airData.tvoc.trend"
        icon="air-filter"
      />

      <SensorCard
        title="Barometric Pressure"
        :value="airData.pressure.value"
        :unit="airData.pressure.unit"
        :status="airData.pressure.status as 'normal' | 'warning' | 'critical'"
        :trend="airData.pressure.trend"
        icon="gauge"
      />

      <SensorCard
        title="Light Intensity"
        :value="airData.light.value"
        :unit="airData.light.unit"
        :status="airData.light.status as 'normal' | 'warning' | 'critical'"
        :trend="airData.light.trend"
        icon="white-balance-sunny"
      />
    </div>

    <!-- Air Quality Metrics Section -->
    <div class="mb-8">
      <div class="flex items-center mb-4">
        <div class="bg-primary-100 dark:bg-primary-900/30 p-1.5 rounded-lg mr-2">
          <span class="mdi mdi-chart-bubble text-primary-600 dark:text-primary-400"></span>
        </div>
        <h2 class="text-xl font-semibold text-gray-700 dark:text-gray-200">Air Quality Metrics</h2>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div
          class="bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 rounded-xl shadow-md overflow-hidden border border-gray-100 dark:border-gray-700 transition-all duration-300 hover:shadow-lg transform hover:-translate-y-1"
        >
          <div class="h-1 w-full bg-blue-500"></div>
          <div class="p-5">
            <div class="flex justify-between items-start mb-4">
              <h3 class="font-bold text-gray-800 dark:text-gray-200 flex items-center">
                <span class="mdi mdi-molecule-co2 text-blue-500 mr-2"></span>
                Carbon Dioxide (CO₂)
              </h3>
              <div class="bg-blue-100 dark:bg-blue-900/30 rounded-full py-1 px-2">
                <span class="mdi mdi-alert-circle text-blue-600 dark:text-blue-400"></span>
              </div>
            </div>

            <div class="flex items-center">
              <div class="w-full">
                <div class="flex items-baseline">
                  <span class="text-4xl font-bold text-blue-600 dark:text-blue-400">
                    {{ airData.co2.value }}
                  </span>
                  <span class="ml-1 text-gray-500 dark:text-gray-400 font-medium">
                    {{ airData.co2.unit }}
                  </span>
                </div>

                <div class="mt-3 w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                  <div
                    class="bg-blue-500 h-2.5 rounded-full"
                    :style="{
                      width: `${(airData.co2.value / airData.co2.max) * 100}%`,
                    }"
                  ></div>
                </div>

                <div class="flex justify-between mt-1 text-xs text-gray-500 dark:text-gray-400">
                  <span>{{ airData.co2.min }}</span>
                  <span>{{ airData.co2.max }}</span>
                </div>
              </div>
            </div>
          </div>

          <div
            class="bg-gray-50 px-4 py-3 border-t flex justify-between items-center dark:bg-gray-800/50 dark:border-gray-700"
          >
            <span class="text-xs text-gray-500 dark:text-gray-400">{{ airData.co2.trend }}</span>
            <div class="flex space-x-2">
              <button
                class="text-gray-500 hover:text-blue-600 focus:outline-none dark:text-gray-400 dark:hover:text-blue-400 transition-colors"
              >
                <span class="mdi mdi-information-outline"></span>
              </button>
              <button
                class="text-gray-500 hover:text-blue-600 focus:outline-none dark:text-gray-400 dark:hover:text-blue-400 transition-colors"
              >
                <span class="mdi mdi-history"></span>
              </button>
            </div>
          </div>
        </div>

        <div
          class="bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 rounded-xl shadow-md overflow-hidden border border-gray-100 dark:border-gray-700 transition-all duration-300 hover:shadow-lg transform hover:-translate-y-1"
        >
          <div class="h-1 w-full bg-purple-500"></div>
          <div class="p-5">
            <div class="flex justify-between items-start mb-4">
              <h3 class="font-bold text-gray-800 dark:text-gray-200 flex items-center">
                <span class="mdi mdi-air-filter text-purple-500 mr-2"></span>
                TVOC Level
              </h3>
              <div class="bg-purple-100 dark:bg-purple-900/30 rounded-full py-1 px-2">
                <span class="mdi mdi-check-circle text-purple-600 dark:text-purple-400"></span>
              </div>
            </div>

            <div class="flex items-center">
              <div class="w-full">
                <div class="flex items-baseline">
                  <span class="text-4xl font-bold text-purple-600 dark:text-purple-400">
                    {{ airData.tvoc.value }}
                  </span>
                  <span class="ml-1 text-gray-500 dark:text-gray-400 font-medium">
                    {{ airData.tvoc.unit }}
                  </span>
                </div>

                <div class="mt-3 w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                  <div
                    class="bg-purple-500 h-2.5 rounded-full"
                    :style="{
                      width: `${(airData.tvoc.value / airData.tvoc.max) * 100}%`,
                    }"
                  ></div>
                </div>

                <div class="flex justify-between mt-1 text-xs text-gray-500 dark:text-gray-400">
                  <span>{{ airData.tvoc.min }}</span>
                  <span>{{ airData.tvoc.max }}</span>
                </div>
              </div>
            </div>
          </div>

          <div
            class="bg-gray-50 px-4 py-3 border-t flex justify-between items-center dark:bg-gray-800/50 dark:border-gray-700"
          >
            <span class="text-xs text-gray-500 dark:text-gray-400">{{ airData.tvoc.trend }}</span>
            <div class="flex space-x-2">
              <button
                class="text-gray-500 hover:text-purple-600 focus:outline-none dark:text-gray-400 dark:hover:text-purple-400 transition-colors"
              >
                <span class="mdi mdi-information-outline"></span>
              </button>
              <button
                class="text-gray-500 hover:text-purple-600 focus:outline-none dark:text-gray-400 dark:hover:text-purple-400 transition-colors"
              >
                <span class="mdi mdi-history"></span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Air Trends Section -->
    <div>
      <div class="flex items-center mb-4">
        <div class="bg-primary-100 dark:bg-primary-900/30 p-1.5 rounded-lg mr-2">
          <span class="mdi mdi-chart-line text-primary-600 dark:text-primary-400"></span>
        </div>
        <h2 class="text-xl font-semibold text-gray-700 dark:text-gray-200">Environmental Trends</h2>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SensorChart
          title="Temperature & Humidity"
          :data="airData.temperature.history"
          valueLabel="Temperature"
          chartColor="#e05d44"
          :secondaryData="airData.humidity.history"
          secondaryValueLabel="Humidity"
          secondaryChartColor="#3b82f6"
        />

        <SensorChart
          title="CO₂ Levels"
          :data="airData.co2.history"
          valueLabel="CO₂"
          chartColor="#8b5cf6"
        />

        <SensorChart
          title="TVOC Levels"
          :data="airData.tvoc.history"
          valueLabel="TVOC"
          chartColor="#10b981"
        />

        <SensorChart
          title="Light Intensity"
          :data="airData.light.history"
          valueLabel="Light"
          chartColor="#f59e0b"
        />
      </div>
    </div>
  </div>
</template>
