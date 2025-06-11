<script setup lang="ts">
import { ref, onMounted, type Ref, computed, onUnmounted } from 'vue'
import SensorChart from '../components/SensorChart.vue'
import PlantStatusDashboard from '../components/PlantStatusDashboard.vue'
import SensorReadingsGrid from '../components/SensorReadingsGrid.vue'
import SensorReadingsTable from '../components/SensorReadingsTable.vue'
import {
  generateMockData,
  getSensorStatus,
  calculateParameterScore,
  getGrowthPrediction,
  getSystemStatus,
  formatCurrentTime,
} from '@/scripts'

const windowWidth = ref(window.innerWidth)
const isRefreshing = ref(false)
const trendTimeframe = ref('24h')

function updateWindowWidth() {
  windowWidth.value = window.innerWidth
}

onMounted(() => {
  window.addEventListener('resize', updateWindowWidth)
})

onUnmounted(() => {
  window.removeEventListener('resize', updateWindowWidth)
})

type SensorDataItem = { value: number; unit: string; status: string }
type SensorDataType = {
  [key: string]: SensorDataItem
  soilTemperature: SensorDataItem
  soilMoisture: SensorDataItem
  soilPH: SensorDataItem
  airTemperature: SensorDataItem
  airHumidity: SensorDataItem
  lightIntensity: SensorDataItem
}

type HistoricalDataItem = { time: string; value: number }[]
type HistoricalDataType = {
  [key: string]: HistoricalDataItem
  soilTemperature: HistoricalDataItem
  soilMoisture: HistoricalDataItem
  soilPH: HistoricalDataItem
  airTemperature: HistoricalDataItem
  airHumidity: HistoricalDataItem
}

const sensorData = ref<SensorDataType>({
  soilTemperature: { value: 24.5, unit: '°C', status: 'normal' },
  soilMoisture: { value: 65, unit: '%', status: 'normal' },
  soilPH: { value: 6.8, unit: 'pH', status: 'normal' },
  airTemperature: { value: 28.2, unit: '°C', status: 'warning' },
  airHumidity: { value: 72, unit: '%', status: 'normal' },
  lightIntensity: { value: 850, unit: 'lux', status: 'normal' },
})

const historicalData = ref<HistoricalDataType>({
  soilTemperature: generateMockData(24, 20, 30, trendTimeframe.value),
  soilMoisture: generateMockData(24, 50, 80, trendTimeframe.value),
  soilPH: generateMockData(24, 6, 7.5, trendTimeframe.value),
  airTemperature: generateMockData(24, 25, 35, trendTimeframe.value),
  airHumidity: generateMockData(24, 60, 90, trendTimeframe.value),
})

function updateHistoricalData(timeframe: string) {
  trendTimeframe.value = timeframe
  historicalData.value = {
    soilTemperature: generateMockData(24, 20, 30, timeframe),
    soilMoisture: generateMockData(24, 50, 80, timeframe),
    soilPH: generateMockData(24, 6, 7.5, timeframe),
    airTemperature: generateMockData(24, 25, 35, timeframe),
    airHumidity: generateMockData(24, 60, 90, timeframe),
  }
}

const lastUpdate: Ref<string> = ref(formatCurrentTime({ second: '2-digit' }))

function openSensorDetails(sensorId: string) {
  console.log(`Opening details for sensor: ${sensorId}`)
}

const quickActions = [
  { name: 'Refresh Data', icon: 'refresh', action: updateData },
  {
    name: 'Export Data',
    icon: 'download-outline',
    action: () => alert('Export functionality would be implemented here'),
  },
  {
    name: 'System Check',
    icon: 'check-circle-outline',
    action: () => alert('System check would be implemented here'),
  },
]

function updateData() {
  isRefreshing.value = true

  setTimeout(() => {
    sensorData.value.soilTemperature.value = parseFloat(
      (sensorData.value.soilTemperature.value + (Math.random() * 0.6 - 0.3)).toFixed(1),
    )
    sensorData.value.soilMoisture.value = parseFloat(
      (sensorData.value.soilMoisture.value + (Math.random() * 2 - 1)).toFixed(1),
    )
    sensorData.value.soilPH.value = parseFloat(
      (sensorData.value.soilPH.value + (Math.random() * 0.2 - 0.1)).toFixed(1),
    )
    sensorData.value.airTemperature.value = parseFloat(
      (sensorData.value.airTemperature.value + (Math.random() * 0.8 - 0.4)).toFixed(1),
    )
    sensorData.value.airHumidity.value = parseFloat(
      (sensorData.value.airHumidity.value + (Math.random() * 3 - 1.5)).toFixed(1),
    )
    sensorData.value.lightIntensity.value = parseFloat(
      (sensorData.value.lightIntensity.value + (Math.random() * 50 - 25)).toFixed(0),
    )

    sensorData.value.soilTemperature.status = getSensorStatus(
      sensorData.value.soilTemperature.value,
      15,
      32,
      20,
      28,
    )
    sensorData.value.soilMoisture.status = getSensorStatus(
      sensorData.value.soilMoisture.value,
      30,
      85,
      40,
      75,
    )
    sensorData.value.soilPH.status = getSensorStatus(sensorData.value.soilPH.value, 5, 8, 5.5, 7.5)
    sensorData.value.airTemperature.status = getSensorStatus(
      sensorData.value.airTemperature.value,
      15,
      35,
      20,
      30,
    )
    sensorData.value.airHumidity.status = getSensorStatus(
      sensorData.value.airHumidity.value,
      30,
      90,
      40,
      80,
    )

    lastUpdate.value = formatCurrentTime({ second: '2-digit' })

    Object.keys(historicalData.value).forEach((key) => {
      const data = historicalData.value[key]
      const now = new Date()

      let timeLabel: string
      if (trendTimeframe.value === '24h') {
        timeLabel = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        data.shift()
        data.push({
          time: timeLabel,
          value: sensorData.value[key].value,
        })
      } else {
        if (trendTimeframe.value === '7d') {
          timeLabel = now.toLocaleDateString([], { month: 'short', day: 'numeric' })
        } else {
          timeLabel = now.toLocaleDateString([], { month: 'short', day: 'numeric' })
        }

        const existingIndex = data.findIndex((item) => item.time === timeLabel)

        if (existingIndex !== -1) {
          data[existingIndex].value = sensorData.value[key].value
        } else {
          data.shift()
          data.push({
            time: timeLabel,
            value: sensorData.value[key].value,
          })
        }
      }
    })

    isRefreshing.value = false
  }, 1000)
}

const plantHealthScore = computed(() => {
  const soilTempScore = calculateParameterScore(
    sensorData.value.soilTemperature.value,
    22,
    26,
    15,
    32,
  )
  const soilMoistureScore = calculateParameterScore(
    sensorData.value.soilMoisture.value,
    60,
    70,
    30,
    85,
  )
  const soilPHScore = calculateParameterScore(sensorData.value.soilPH.value, 6.5, 7.0, 5.0, 8.0)
  const airTempScore = calculateParameterScore(
    sensorData.value.airTemperature.value,
    24,
    28,
    15,
    35,
  )
  const airHumidityScore = calculateParameterScore(
    sensorData.value.airHumidity.value,
    65,
    75,
    30,
    90,
  )

  const totalScore =
    soilTempScore * 0.2 +
    soilMoistureScore * 0.3 +
    soilPHScore * 0.2 +
    airTempScore * 0.15 +
    airHumidityScore * 0.15

  return Math.round(totalScore)
})

const growthPrediction = computed(() => {
  return getGrowthPrediction(plantHealthScore.value)
})

const systemStatus = computed(() => {
  const statuses = Object.values(sensorData.value).map((item) => item.status)
  return getSystemStatus(statuses)
})

onMounted(() => {
  setInterval(updateData, 5000)
})
</script>

<template>
  <div class="container mx-auto px-4 py-6">
    <!-- Title Banner -->
    <div
      class="mb-8 bg-white dark:bg-gray-900 rounded-xl shadow-md overflow-hidden border border-gray-100 dark:border-gray-700"
    >
      <div class="h-1.5 w-full bg-gradient-to-r from-purple-400 to-purple-600"></div>
      <div class="p-4 sm:p-6">
        <!-- Header Content -->
        <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <!-- Title and Description -->
          <div class="flex items-start sm:items-center w-full md:w-auto">
            <div
              class="bg-purple-100 dark:bg-purple-900/30 py-2 px-3 sm:px-3 sm:py-2 rounded-lg mr-3 sm:mr-4 flex-shrink-0"
            >
              <span
                class="mdi mdi-view-dashboard text-purple-600 dark:text-purple-400 text-xl sm:text-2xl"
              ></span>
            </div>
            <div class="flex-grow">
              <h1 class="text-xl sm:text-2xl font-bold text-gray-800 dark:text-gray-100">
                Dashboard
              </h1>
              <p
                class="text-sm sm:text-base text-gray-600 dark:text-gray-400 mt-0.5 sm:mt-1 line-clamp-2 sm:line-clamp-none"
              >
                Real-time monitoring dashboard for plant growth optimization
              </p>
              <div class="text-xs sm:text-sm text-gray-500 dark:text-gray-500 mt-0.5 sm:mt-1">
                Last updated: {{ lastUpdate }}
              </div>
            </div>
          </div>

          <!-- Action Buttons -->
          <div class="flex flex-wrap gap-2 sm:gap-3 w-full md:w-auto justify-end mt-3 md:mt-0">
            <!-- Mobile: Icon-only buttons on very small screens -->
            <template v-if="windowWidth < 400">
              <button
                v-for="action in quickActions"
                :key="action.name"
                @click="action.action"
                class="flex items-center justify-center p-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 dark:focus:ring-offset-gray-900 transition-colors shadow-sm"
                :class="{
                  'opacity-50 cursor-not-allowed': action.name === 'Refresh Data' && isRefreshing,
                }"
                :disabled="action.name === 'Refresh Data' && isRefreshing"
                :title="action.name"
              >
                <span
                  class="mdi text-lg"
                  :class="{
                    'mdi-loading mdi-spin': action.name === 'Refresh Data' && isRefreshing,
                    ['mdi-' + action.icon]: !(action.name === 'Refresh Data' && isRefreshing),
                  }"
                ></span>
              </button>
            </template>

            <!-- Tablet/Desktop: Full buttons with text -->
            <template v-else>
              <button
                v-for="action in quickActions"
                :key="action.name"
                @click="action.action"
                class="flex items-center px-3 sm:px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 dark:focus:ring-offset-gray-900 transition-colors shadow-sm"
                :class="{
                  'opacity-50 cursor-not-allowed': action.name === 'Refresh Data' && isRefreshing,
                }"
                :disabled="action.name === 'Refresh Data' && isRefreshing"
              >
                <span
                  class="mdi mr-1.5"
                  :class="{
                    'mdi-loading mdi-spin': action.name === 'Refresh Data' && isRefreshing,
                    ['mdi-' + action.icon]: !(action.name === 'Refresh Data' && isRefreshing),
                  }"
                ></span>
                <span class="whitespace-nowrap">{{
                  action.name === 'Refresh Data' && isRefreshing ? 'Refreshing...' : action.name
                }}</span>
              </button>
            </template>
          </div>
        </div>
      </div>
    </div>

    <!-- Dashboard Header with System Status and Plant Health Overview -->
    <div class="mb-10">
      <PlantStatusDashboard
        :sensor-data="sensorData"
        :plant-health-score="plantHealthScore"
        :growth-prediction="growthPrediction"
        :system-status="systemStatus"
      />
    </div>

    <!-- Plant Growth Analysis with Insights -->
    <div class="mb-6 sm:mb-8">
      <div
        class="bg-white dark:bg-gray-900 rounded-xl shadow-md overflow-hidden border border-gray-100 dark:border-gray-700 transition-all duration-300 hover:shadow-lg w-full"
      >
        <div class="h-1 sm:h-1.5 w-full bg-gradient-to-r from-primary-400 to-primary-500"></div>
        <div class="p-3 sm:p-4 md:p-6">
          <div class="flex items-center mb-3 sm:mb-4">
            <div
              class="bg-green-100 dark:bg-green-900/30 p-1.5 sm:p-2 rounded-lg mr-2 sm:mr-3 flex-shrink-0"
            >
              <span
                class="mdi mdi-sprout text-green-600 dark:text-green-400 text-lg sm:text-xl"
              ></span>
            </div>
            <h2 class="text-lg sm:text-xl font-semibold text-gray-800 dark:text-gray-200 truncate">
              Plant Growth Analysis
            </h2>
          </div>

          <div class="mb-4 sm:mb-5">
            <h3 class="text-sm sm:text-base font-medium text-gray-700 dark:text-gray-300 mb-2">
              Growth Recommendations
            </h3>
            <div class="bg-gray-50 dark:bg-gray-800 rounded-lg p-3 sm:p-4">
              <p class="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-2 sm:mb-3">
                Based on current sensor readings and historical data, we recommend the following
                actions to optimize plant growth:
              </p>
              <ul
                class="space-y-1 sm:space-y-2 text-xs sm:text-sm text-gray-600 dark:text-gray-400"
              >
                <li class="flex items-start">
                  <span
                    class="mdi mdi-check-circle text-green-500 mr-1.5 mt-0.5 flex-shrink-0"
                  ></span>
                  <span>Maintain current watering schedule for optimal soil moisture levels</span>
                </li>
                <li class="flex items-start">
                  <span
                    class="mdi mdi-check-circle text-green-500 mr-1.5 mt-0.5 flex-shrink-0"
                  ></span>
                  <span>Consider adding nitrogen-rich fertilizer within the next 3-5 days</span>
                </li>
                <li class="flex items-start">
                  <span
                    class="mdi mdi-alert-circle text-amber-500 mr-1.5 mt-0.5 flex-shrink-0"
                  ></span>
                  <span
                    >Monitor air temperature during midday as it approaches upper threshold</span
                  >
                </li>
              </ul>
            </div>
          </div>

          <div>
            <h3 class="text-sm sm:text-base font-medium text-gray-700 dark:text-gray-300 mb-2">
              Growth Metrics
            </h3>
            <div class="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4">
              <div
                class="bg-gray-50 dark:bg-gray-800 rounded-lg p-2 sm:p-3 flex flex-col items-center justify-center text-center"
              >
                <span class="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mb-1"
                  >Growth Rate</span
                >
                <span
                  class="text-base sm:text-lg md:text-xl font-bold text-green-600 dark:text-green-400"
                  >+2.3 cm/week</span
                >
              </div>
              <div
                class="bg-gray-50 dark:bg-gray-800 rounded-lg p-2 sm:p-3 flex flex-col items-center justify-center text-center"
              >
                <span class="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mb-1"
                  >Leaf Count</span
                >
                <span
                  class="text-base sm:text-lg md:text-xl font-bold text-gray-800 dark:text-gray-200"
                  >12 leaves</span
                >
              </div>
              <div
                class="bg-gray-50 dark:bg-gray-800 rounded-lg p-2 sm:p-3 flex flex-col items-center justify-center text-center"
              >
                <span class="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mb-1"
                  >Est. Yield</span
                >
                <span
                  class="text-base sm:text-lg md:text-xl font-bold text-amber-600 dark:text-amber-400"
                  >Medium</span
                >
              </div>
              <div
                class="bg-gray-50 dark:bg-gray-800 rounded-lg p-2 sm:p-3 flex flex-col items-center justify-center text-center"
              >
                <span class="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mb-1"
                  >Time to Harvest</span
                >
                <span
                  class="text-base sm:text-lg md:text-xl font-bold text-blue-600 dark:text-blue-400"
                  >~18 days</span
                >
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Sensor Cards Grid with improved spacing and animations -->
    <div class="mb-6 sm:mb-8">
      <!-- Sensor Readings Component -->
      <SensorReadingsTable
        v-if="windowWidth >= 1024"
        :sensor-data="sensorData"
        :on-sensor-click="openSensorDetails"
        @refresh="updateData"
        @download="console.log('Download functionality removed')"
      />
      <SensorReadingsGrid
        v-else
        :sensor-data="sensorData"
        :on-sensor-click="openSensorDetails"
        @refresh="updateData"
        @download="console.log('Download functionality removed')"
      />
    </div>

    <!-- Sensor Trends Section with improved styling -->
    <div class="mb-6 sm:mb-8">
      <div
        class="bg-white dark:bg-gray-900 rounded-xl shadow-md overflow-hidden border border-gray-100 dark:border-gray-700 transition-all duration-300 hover:shadow-lg w-full max-w-full"
      >
        <div class="h-1 sm:h-1.5 w-full bg-gradient-to-r from-indigo-400 to-indigo-500"></div>
        <div class="p-3 sm:p-4 md:p-6">
          <div
            class="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 sm:mb-6 gap-3 sm:gap-4"
          >
            <div class="flex items-center min-w-0">
              <div
                class="bg-indigo-100 dark:bg-indigo-900/30 p-1.5 sm:p-2 rounded-lg mr-2 sm:mr-3 flex-shrink-0"
              >
                <span
                  class="mdi mdi-chart-line-variant text-indigo-600 dark:text-indigo-400 text-lg sm:text-xl"
                ></span>
              </div>
              <h2
                class="text-lg sm:text-xl font-semibold text-gray-800 dark:text-gray-200 truncate"
              >
                Sensor Trends
              </h2>
            </div>

            <div
              class="flex items-center space-x-1 sm:space-x-2 self-end sm:self-auto flex-shrink-0"
            >
              <button
                @click="updateHistoricalData('24h')"
                class="px-2 sm:px-3 py-0.5 sm:py-1 rounded-lg text-xs sm:text-sm font-medium transition-colors duration-200"
                :class="{
                  'bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300':
                    trendTimeframe === '24h',
                  'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700':
                    trendTimeframe !== '24h',
                }"
              >
                24h
              </button>
              <button
                @click="updateHistoricalData('7d')"
                class="px-2 sm:px-3 py-0.5 sm:py-1 rounded-lg text-xs sm:text-sm font-medium transition-colors duration-200"
                :class="{
                  'bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300':
                    trendTimeframe === '7d',
                  'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700':
                    trendTimeframe !== '7d',
                }"
              >
                7d
              </button>
              <button
                @click="updateHistoricalData('30d')"
                class="px-2 sm:px-3 py-0.5 sm:py-1 rounded-lg text-xs sm:text-sm font-medium transition-colors duration-200"
                :class="{
                  'bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300':
                    trendTimeframe === '30d',
                  'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700':
                    trendTimeframe !== '30d',
                }"
              >
                30d
              </button>
            </div>
          </div>

          <!-- Charts with improved responsive grid -->
          <div
            class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-3 sm:gap-4 md:gap-6 animate-fade-in"
          >
            <!-- Soil Temperature Chart -->
            <div class="p-0 sm:p-2 md:p-4">
              <SensorChart
                :data="historicalData.soilTemperature"
                color="#6366f1"
                :height="windowWidth < 640 ? 180 : 200"
                title="Soil Temperature"
                valueLabel="Temperature (°C)"
              />
            </div>

            <!-- Soil Moisture Chart -->
            <div class="p-0 sm:p-2 md:p-4">
              <SensorChart
                :data="historicalData.soilMoisture"
                color="#3b82f6"
                :height="windowWidth < 640 ? 180 : 200"
                title="Soil Moisture"
                valueLabel="Moisture (%)"
              />
            </div>

            <!-- Soil pH Chart -->
            <div class="p-0 sm:p-2 md:p-4">
              <SensorChart
                :data="historicalData.soilPH"
                color="#8b5cf6"
                :height="windowWidth < 640 ? 180 : 200"
                title="Soil pH"
                valueLabel="pH Level"
              />
            </div>

            <!-- Air Conditions Chart -->
            <div class="p-0 sm:p-2 md:p-4">
              <SensorChart
                :data="historicalData.airTemperature"
                color="#06b6d4"
                :height="windowWidth < 640 ? 180 : 200"
                title="Air Temperature"
                valueLabel="Temperature (°C)"
              />
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Download Modal removed -->
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

/* Hover effects for cards */
.card-hover {
  transition: all 0.3s ease;
}

.card-hover:hover {
  transform: translateY(-4px);
  box-shadow:
    0 10px 25px -5px rgba(0, 0, 0, 0.1),
    0 10px 10px -5px rgba(0, 0, 0, 0.04);
}

/* Pulse animation for status indicators */
@keyframes pulse {
  0% {
    opacity: 0.6;
  }
  50% {
    opacity: 1;
  }
  100% {
    opacity: 0.6;
  }
}

.animate-pulse {
  animation: pulse 2s infinite ease-in-out;
}

/* Responsive adjustments */
@media (max-width: 640px) {
  .dashboard-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .dashboard-header > div {
    margin-top: 1rem;
    width: 100%;
  }
}

/* Progress bar animation */
@keyframes fillProgress {
  from {
    width: 0;
  }
  to {
    width: var(--progress-width, 0%);
  }
}

.animate-progress {
  animation: fillProgress 1s ease-out forwards;
}

/* Transition for dark mode */
.dark-mode-transition {
  transition:
    background-color 0.3s ease,
    color 0.3s ease,
    border-color 0.3s ease;
}
</style>
