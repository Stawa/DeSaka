<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import SensorCard from '@/components/SensorCard.vue'
import SensorChart from '@/components/SensorChart.vue'

const soilData = ref({
  temperature: {
    value: 22.5,
    unit: '°C',
    status: 'normal',
    trend: 'stable',
    min: 15,
    max: 30,
    history: [] as { time: string; value: number }[],
  },
  moisture: {
    value: 65,
    unit: '%',
    status: 'normal',
    trend: 'increasing',
    min: 40,
    max: 80,
    history: [] as { time: string; value: number }[],
  },
  ph: {
    value: 6.8,
    unit: 'pH',
    status: 'normal',
    trend: 'stable',
    min: 5.5,
    max: 7.5,
    history: [] as { time: string; value: number }[],
  },
  nutrients: {
    nitrogen: {
      value: 42,
      unit: 'ppm',
      status: 'normal',
      trend: 'stable',
      min: 20,
      max: 80,
    },
    phosphorus: {
      value: 35,
      unit: 'ppm',
      status: 'normal',
      trend: 'decreasing',
      min: 20,
      max: 60,
    },
    potassium: {
      value: 180,
      unit: 'ppm',
      status: 'normal',
      trend: 'stable',
      min: 125,
      max: 250,
    },
  },
  conductivity: {
    value: 1.2,
    unit: 'mS/cm',
    status: 'normal',
    trend: 'stable',
    min: 0.8,
    max: 1.5,
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
  soilData.value.temperature.history = generateHistoricalData(18, 26)
  soilData.value.moisture.history = generateHistoricalData(45, 75)
  soilData.value.ph.history = generateHistoricalData(6.0, 7.2)
  soilData.value.conductivity.history = generateHistoricalData(0.9, 1.4)
})

function getStatus(value: number, min: number, max: number) {
  if (value < min) return 'critical'
  if (value > max) return 'critical'
  if (value < min + (max - min) * 0.2 || value > max - (max - min) * 0.2) return 'warning'
  return 'normal'
}

function updateSensorStatuses() {
  soilData.value.temperature.status = getStatus(
    soilData.value.temperature.value,
    soilData.value.temperature.min,
    soilData.value.temperature.max,
  )

  soilData.value.moisture.status = getStatus(
    soilData.value.moisture.value,
    soilData.value.moisture.min,
    soilData.value.moisture.max,
  )

  soilData.value.ph.status = getStatus(
    soilData.value.ph.value,
    soilData.value.ph.min,
    soilData.value.ph.max,
  )

  soilData.value.conductivity.status = getStatus(
    soilData.value.conductivity.value,
    soilData.value.conductivity.min,
    soilData.value.conductivity.max,
  )
}

// Compute overall soil health score based on all parameters
const soilHealthScore = computed(() => {
  const tempScore = calculateParameterScore(
    soilData.value.temperature.value,
    soilData.value.temperature.min,
    soilData.value.temperature.max,
  )
  const moistureScore = calculateParameterScore(
    soilData.value.moisture.value,
    soilData.value.moisture.min,
    soilData.value.moisture.max,
  )
  const phScore = calculateParameterScore(
    soilData.value.ph.value,
    soilData.value.ph.min,
    soilData.value.ph.max,
  )
  const conductivityScore = calculateParameterScore(
    soilData.value.conductivity.value,
    soilData.value.conductivity.min,
    soilData.value.conductivity.max,
  )

  // Calculate average score
  const avgScore = Math.round((tempScore + moistureScore + phScore + conductivityScore) / 4)
  return Math.min(Math.max(avgScore, 0), 100) // Ensure score is between 0-100
})

function calculateParameterScore(value: number, min: number, max: number): number {
  // Calculate how far the value is from the ideal middle point
  const middle = (min + max) / 2
  const range = max - min
  const deviation = Math.abs(value - middle)

  // Convert to a 0-100 score where 100 is perfect (at middle) and 0 is at or beyond min/max
  return Math.round(100 - (deviation / (range / 2)) * 100)
}

// Determine health status text and color
const healthStatus = computed(() => {
  if (soilHealthScore.value >= 80) return { text: 'Excellent', color: 'text-green-500' }
  if (soilHealthScore.value >= 60) return { text: 'Good', color: 'text-green-400' }
  if (soilHealthScore.value >= 40) return { text: 'Fair', color: 'text-yellow-500' }
  if (soilHealthScore.value >= 20) return { text: 'Poor', color: 'text-orange-500' }
  return { text: 'Critical', color: 'text-red-500' }
})

updateSensorStatuses()
</script>

<template>
  <div class="container mx-auto px-4 py-6">
    <div class="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
      <div>
        <h1 class="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-2">Soil Monitoring</h1>
        <p class="text-gray-600 dark:text-gray-300 mb-1">
          Comprehensive soil health monitoring and analysis
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

    <!-- Soil Health Overview Card -->
    <div
      class="bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 rounded-xl shadow-md overflow-hidden mb-8 border border-gray-100 dark:border-gray-700"
    >
      <div class="p-6">
        <div class="flex flex-col md:flex-row md:items-center md:justify-between">
          <div class="mb-4 md:mb-0">
            <h2 class="text-xl font-bold text-gray-800 dark:text-gray-200 mb-2 flex items-center">
              <span class="mdi mdi-sprout text-green-500 mr-2 text-2xl"></span>
              Soil Health Overview
            </h2>
            <p class="text-gray-600 dark:text-gray-300">Overall soil condition assessment</p>
          </div>

          <div
            class="flex items-center bg-white dark:bg-gray-700 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-600"
          >
            <div class="mr-4">
              <div class="text-4xl font-bold mb-1" :class="healthStatus.color">
                {{ soilHealthScore }}
              </div>
              <div class="text-sm font-medium" :class="healthStatus.color">
                {{ healthStatus.text }}
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
                  :class="healthStatus.color.replace('text', 'stroke')"
                  stroke-width="10"
                  :stroke-dasharray="`${soilHealthScore * 2.51}, 251`"
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
                Score
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

    <!-- Soil Sensor Cards -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-8">
      <SensorCard
        title="Soil Temperature"
        :value="soilData.temperature.value"
        :unit="soilData.temperature.unit"
        :status="soilData.temperature.status as 'normal' | 'warning' | 'critical'"
        :trend="soilData.temperature.trend"
        icon="thermometer"
      />

      <SensorCard
        title="Soil Moisture"
        :value="soilData.moisture.value"
        :unit="soilData.moisture.unit"
        :status="soilData.moisture.status as 'normal' | 'warning' | 'critical'"
        :trend="soilData.moisture.trend"
        icon="water"
      />

      <SensorCard
        title="Soil pH"
        :value="soilData.ph.value"
        :unit="soilData.ph.unit"
        :status="soilData.ph.status as 'normal' | 'warning' | 'critical'"
        :trend="soilData.ph.trend"
        icon="flask"
      />

      <SensorCard
        title="Soil Conductivity"
        :value="soilData.conductivity.value"
        :unit="soilData.conductivity.unit"
        :status="soilData.conductivity.status as 'normal' | 'warning' | 'critical'"
        :trend="soilData.conductivity.trend"
        icon="flash"
      />
    </div>

    <!-- Nutrient Levels Section -->
    <div class="mb-8">
      <div class="flex items-center mb-4">
        <div class="bg-primary-100 dark:bg-primary-900/30 p-1.5 rounded-lg mr-2">
          <span class="mdi mdi-leaf text-primary-600 dark:text-primary-400"></span>
        </div>
        <h2 class="text-xl font-semibold text-gray-700 dark:text-gray-200">Nutrient Levels</h2>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div
          class="bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 rounded-xl shadow-md overflow-hidden border border-gray-100 dark:border-gray-700 transition-all duration-300 hover:shadow-lg transform hover:-translate-y-1"
        >
          <div class="h-1 w-full bg-blue-500"></div>
          <div class="p-5">
            <div class="flex justify-between items-start mb-4">
              <h3 class="font-bold text-gray-800 dark:text-gray-200 flex items-center">
                <span class="mdi mdi-molecule text-blue-500 mr-2"></span>
                Nitrogen (N)
              </h3>
              <div class="bg-blue-100 dark:bg-blue-900/30 rounded-full py-1 px-2">
                <span class="mdi mdi-check-circle text-blue-600 dark:text-blue-400"></span>
              </div>
            </div>

            <div class="flex items-center">
              <div class="w-full">
                <div class="flex items-baseline">
                  <span class="text-4xl font-bold text-blue-600 dark:text-blue-400">
                    {{ soilData.nutrients.nitrogen.value }}
                  </span>
                  <span class="ml-1 text-gray-500 dark:text-gray-400 font-medium">
                    {{ soilData.nutrients.nitrogen.unit }}
                  </span>
                </div>

                <div class="mt-3 w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                  <div
                    class="bg-blue-500 h-2.5 rounded-full"
                    :style="{
                      width: `${(soilData.nutrients.nitrogen.value / soilData.nutrients.nitrogen.max) * 100}%`,
                    }"
                  ></div>
                </div>

                <div class="flex justify-between mt-1 text-xs text-gray-500 dark:text-gray-400">
                  <span>{{ soilData.nutrients.nitrogen.min }}</span>
                  <span>{{ soilData.nutrients.nitrogen.max }}</span>
                </div>
              </div>
            </div>
          </div>

          <div
            class="bg-gray-50 px-4 py-3 border-t flex justify-between items-center dark:bg-gray-800/50 dark:border-gray-700"
          >
            <span class="text-xs text-gray-500 dark:text-gray-400">{{
              soilData.nutrients.nitrogen.trend
            }}</span>
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
                <span class="mdi mdi-molecule text-purple-500 mr-2"></span>
                Phosphorus (P)
              </h3>
              <div class="bg-purple-100 dark:bg-purple-900/30 rounded-full py-1 px-2">
                <span class="mdi mdi-check-circle text-purple-600 dark:text-purple-400"></span>
              </div>
            </div>

            <div class="flex items-center">
              <div class="w-full">
                <div class="flex items-baseline">
                  <span class="text-4xl font-bold text-purple-600 dark:text-purple-400">
                    {{ soilData.nutrients.phosphorus.value }}
                  </span>
                  <span class="ml-1 text-gray-500 dark:text-gray-400 font-medium">
                    {{ soilData.nutrients.phosphorus.unit }}
                  </span>
                </div>

                <div class="mt-3 w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                  <div
                    class="bg-purple-500 h-2.5 rounded-full"
                    :style="{
                      width: `${(soilData.nutrients.phosphorus.value / soilData.nutrients.phosphorus.max) * 100}%`,
                    }"
                  ></div>
                </div>

                <div class="flex justify-between mt-1 text-xs text-gray-500 dark:text-gray-400">
                  <span>{{ soilData.nutrients.phosphorus.min }}</span>
                  <span>{{ soilData.nutrients.phosphorus.max }}</span>
                </div>
              </div>
            </div>
          </div>

          <div
            class="bg-gray-50 px-4 py-3 border-t flex justify-between items-center dark:bg-gray-800/50 dark:border-gray-700"
          >
            <span class="text-xs text-gray-500 dark:text-gray-400">{{
              soilData.nutrients.phosphorus.trend
            }}</span>
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

        <div
          class="bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 rounded-xl shadow-md overflow-hidden border border-gray-100 dark:border-gray-700 transition-all duration-300 hover:shadow-lg transform hover:-translate-y-1"
        >
          <div class="h-1 w-full bg-yellow-500"></div>
          <div class="p-5">
            <div class="flex justify-between items-start mb-4">
              <h3 class="font-bold text-gray-800 dark:text-gray-200 flex items-center">
                <span class="mdi mdi-molecule text-yellow-500 mr-2"></span>
                Potassium (K)
              </h3>
              <div class="bg-yellow-100 dark:bg-yellow-900/30 rounded-full py-1 px-2">
                <span class="mdi mdi-check-circle text-yellow-600 dark:text-yellow-400"></span>
              </div>
            </div>

            <div class="flex items-center">
              <div class="w-full">
                <div class="flex items-baseline">
                  <span class="text-4xl font-bold text-yellow-600 dark:text-yellow-400">
                    {{ soilData.nutrients.potassium.value }}
                  </span>
                  <span class="ml-1 text-gray-500 dark:text-gray-400 font-medium">
                    {{ soilData.nutrients.potassium.unit }}
                  </span>
                </div>

                <div class="mt-3 w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                  <div
                    class="bg-yellow-500 h-2.5 rounded-full"
                    :style="{
                      width: `${(soilData.nutrients.potassium.value / soilData.nutrients.potassium.max) * 100}%`,
                    }"
                  ></div>
                </div>

                <div class="flex justify-between mt-1 text-xs text-gray-500 dark:text-gray-400">
                  <span>{{ soilData.nutrients.potassium.min }}</span>
                  <span>{{ soilData.nutrients.potassium.max }}</span>
                </div>
              </div>
            </div>
          </div>

          <div
            class="bg-gray-50 px-4 py-3 border-t flex justify-between items-center dark:bg-gray-800/50 dark:border-gray-700"
          >
            <span class="text-xs text-gray-500 dark:text-gray-400">{{
              soilData.nutrients.potassium.trend
            }}</span>
            <div class="flex space-x-2">
              <button
                class="text-gray-500 hover:text-yellow-600 focus:outline-none dark:text-gray-400 dark:hover:text-yellow-400 transition-colors"
              >
                <span class="mdi mdi-information-outline"></span>
              </button>
              <button
                class="text-gray-500 hover:text-yellow-600 focus:outline-none dark:text-gray-400 dark:hover:text-yellow-400 transition-colors"
              >
                <span class="mdi mdi-history"></span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Soil Trends Section -->
    <div>
      <div class="flex items-center mb-4">
        <div class="bg-primary-100 dark:bg-primary-900/30 p-1.5 rounded-lg mr-2">
          <span class="mdi mdi-chart-line text-primary-600 dark:text-primary-400"></span>
        </div>
        <h2 class="text-xl font-semibold text-gray-700 dark:text-gray-200">Soil Trends</h2>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SensorChart
          title="Soil Temperature Trend"
          :data="soilData.temperature.history"
          valueLabel="Temperature"
          chartColor="#e05d44"
        />

        <SensorChart
          title="Soil Moisture Trend"
          :data="soilData.moisture.history"
          valueLabel="Moisture"
          chartColor="#3b82f6"
        />

        <SensorChart
          title="Soil pH Trend"
          :data="soilData.ph.history"
          valueLabel="pH Level"
          chartColor="#8b5cf6"
        />

        <SensorChart
          title="Soil Conductivity Trend"
          :data="soilData.conductivity.history"
          valueLabel="Conductivity"
          chartColor="#f59e0b"
        />
      </div>
    </div>
  </div>
</template>
