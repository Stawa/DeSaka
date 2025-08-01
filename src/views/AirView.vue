<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import SensorChart from '@/components/SensorChart.vue'
import AirQualityDashboard from '@/components/AirQualityDashboard.vue'
import DataExportModal from '@/components/DataExportModal.vue'
import { handleDataExport } from '@/utils/exportUtils'
import { SENSOR_FILE_IDS, useApi } from '@/composables/useApi'
import { useToast } from '@/composables/useToast'
import {
  formatCurrentTime,
  calculateParameterScore,
  getDateRangeFromTimeframe,
  updateSensorDataFromResponse,
  updateSensorStatus,
  formatSensorDataForExport,
  type TimeframeOption,
} from '@/scripts'
import AirHeader from '@/components/air/AirHeader.vue'
import type { SensorResponse } from '@/scripts/sensorDataUtils'
import type { Air, SensorModification } from '@/composables/responseApi'
import type { ExportConfig } from '@/composables/exportTypes'
import { getMinMax } from '@/utils/sensorHelpers'

const airData = ref<SensorModification>({
  temperature: {
    value: 0,
    unit: '°C',
    min: 0,
    max: 0,
    optimal_min: 0,
    optimal_max: 0,
    status: 'unknown',
    trend: 'stable',
    history: [],
  },
  humidity: {
    value: 0,
    unit: '%',
    min: 0,
    max: 0,
    optimal_min: 0,
    optimal_max: 0,
    status: 'unknown',
    trend: 'stable',
    history: [],
  },
})

const lastUpdated = ref(formatCurrentTime())
const isRefreshing = ref(false)
const timeFrame = ref('24h')
const showExportModal = ref(false)
const healthScore = ref(85)

const availableSensors = [
  { id: 'temperature', name: 'Air Temperature', unit: '°C' },
  { id: 'humidity', name: 'Air Humidity', unit: '%' },
]

const { refreshData: apiRefreshData, fetchFileById } = useApi()
const { showToast } = useToast()

onMounted(() => {
  handleRefresh()
})

/**
 * Handle export of sensor data
 * @param exportOptions Export configuration options
 */
function handleExport(exportOptions: {
  format: 'csv' | 'json' | 'excel'
  sensors: Array<{ id: string; name?: string; unit?: string } | string>
  dateRange: { start: string | null; end: string | null }
  timeRange: { start: string; end: string }
}) {
  const sensorsList = [
    { name: 'temperature', label: 'Temperature', unit: '°C', selected: true },
    { name: 'humidity', label: 'Humidity', unit: '%', selected: true },
  ].filter((sensor) => sensor.selected)

  const exportData: Record<string, Array<{ timestamp: string; value: number }>> = {}
  const sensorInfo: Record<string, { name: string; unit: string }> = {}

  sensorsList.forEach((sensor) => {
    const sensorData = airData.value[sensor.name as keyof typeof airData.value]
    if (sensorData) {
      const formattedData = formatSensorDataForExport(sensorData, sensor.label)
      exportData[sensor.name] = formattedData.exportData
      sensorInfo[sensor.name] = formattedData.sensorInfo
    }
  })

  handleDataExport(exportOptions, exportData, sensorInfo)
}

async function handleRefresh() {
  isRefreshing.value = true
  try {
    try {
      const airFileId = SENSOR_FILE_IDS.air
      const airResponse: Air = await fetchFileById(airFileId)

      updateAirData(airResponse)
      updateSensorStatuses()

      lastUpdated.value = formatCurrentTime()
      return
    } catch (fileErr) {
      console.warn('Could not fetch from file endpoint, falling back to sensors endpoint:', fileErr)
    }

    const { startDate: startDateStr, endDate } = getDateRangeFromTimeframe(
      timeFrame.value as TimeframeOption,
    )
    const params = {
      startDate: startDateStr,
      endDate: endDate,
      sensors: ['air_temperature', 'air_humidity'],
    }

    const fetchAirFile = async (): Promise<Air> => {
      return await fetchFileById(SENSOR_FILE_IDS.air)
    }

    await apiRefreshData(
      (airResponse: Air) => {
        updateAirData(airResponse)
        updateSensorStatuses()
        lastUpdated.value = formatCurrentTime()
      },
      fetchAirFile,
      params,
    )
  } catch (err) {
    console.error('Error refreshing air data:', err)
    showToast('Failed to refresh air quality data', 'error')
  } finally {
    isRefreshing.value = false
  }
}

/**
 * Updates air data from API response
 * @param response The API response containing sensor data
 */
function updateAirData(response: Record<string, SensorResponse>) {
  if (!response) return

  updateSensorDataFromResponse(
    airData.value.temperature,
    response,
    'air_temperature',
    'temperature',
  )
  updateSensorDataFromResponse(airData.value.humidity, response, 'air_humidity', 'humidity')
}

function changeTimeFrame(frame: string) {
  timeFrame.value = frame
  handleRefresh()
}

function updateSensorStatuses() {
  updateSensorStatus(airData.value.temperature)
  updateSensorStatus(airData.value.humidity)
}

const airQualityIndex = computed(() => {
  const temp = airData.value.temperature
  const humidity = airData.value.humidity

  const { min: tempMin, max: tempMax } = getMinMax(temp.history)
  const { min: humidityMin, max: humidityMax } = getMinMax(humidity.history)

  const temperatureScore = calculateParameterScore(temp.value, tempMin, tempMax, 20, 26)
  const humidityScore = calculateParameterScore(humidity.value, humidityMin, humidityMax, 40, 60)

  const totalScore = temperatureScore * 0.2 + humidityScore * 0.2

  return Math.round(totalScore)
})

const healthStatus = computed(() => {
  if (airQualityIndex.value >= 90) {
    return {
      color: 'text-emerald-600 dark:text-emerald-400',
      label: 'Excellent',
      bgColor: 'bg-emerald-50 dark:bg-emerald-900/20',
      accentColor: 'from-emerald-500 to-emerald-600',
    }
  } else if (airQualityIndex.value >= 75) {
    return {
      color: 'text-green-600 dark:text-green-400',
      label: 'Good',
      bgColor: 'bg-green-50 dark:bg-green-900/20',
      accentColor: 'from-green-500 to-green-600',
    }
  } else if (airQualityIndex.value >= 60) {
    return {
      color: 'text-amber-600 dark:text-amber-400',
      label: 'Fair',
      bgColor: 'bg-amber-50 dark:bg-amber-900/20',
      accentColor: 'from-amber-500 to-amber-600',
    }
  } else if (airQualityIndex.value >= 40) {
    return {
      color: 'text-orange-600 dark:text-orange-400',
      label: 'Poor',
      bgColor: 'bg-orange-50 dark:bg-orange-900/20',
      accentColor: 'from-orange-500 to-orange-600',
    }
  } else {
    return {
      color: 'text-red-600 dark:text-red-400',
      label: 'Critical',
      bgColor: 'bg-red-50 dark:bg-red-900/20',
      accentColor: 'from-red-500 to-red-600',
    }
  }
})

const handleExportData = (exportConfig: ExportConfig) => {
  console.log('Exporting air quality data:', exportConfig)
  showToast('Air quality data exported successfully', 'success')
}
</script>

<template>
  <!-- Main container matching SoilView design -->
  <div class="min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors duration-300">
    <div class="mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8">
      <!-- Page Header -->
      <AirHeader
        :last-updated="lastUpdated"
        :is-refreshing="isRefreshing"
        @refresh="handleRefresh"
        @export="handleExport"
      />

      <!-- Air Quality Dashboard -->
      <div class="animate-fade-in" style="animation-delay: 0.1s">
        <AirQualityDashboard :air-data="airData" :health-score="healthScore" />
      </div>

      <!-- Air Analysis Insights -->
      <div
        class="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-2xl border border-gray-200/60 dark:border-gray-800/60 shadow-sm overflow-hidden animate-fade-in"
        style="animation-delay: 0.2s"
      >
        <!-- Accent bar matching design -->
        <div class="h-1 bg-gradient-to-r from-blue-500 via-cyan-500 to-teal-500"></div>

        <!-- Header -->
        <div class="px-6 py-5 border-b border-gray-100 dark:border-gray-800">
          <div class="flex items-center gap-4">
            <div
              class="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-100 to-blue-50 dark:from-blue-900/30 dark:to-blue-800/20 flex items-center justify-center ring-1 ring-blue-200/50 dark:ring-blue-700/30"
            >
              <span
                class="mdi mdi-monitor-dashboard text-xl text-blue-600 dark:text-blue-400"
              ></span>
            </div>
            <div>
              <h2 class="text-xl font-semibold text-gray-900 dark:text-gray-100">Air Analysis</h2>
              <p class="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                Comprehensive air quality insights and environmental conditions
              </p>
            </div>
          </div>
        </div>

        <!-- Analysis Content -->
        <div class="p-6">
          <!-- Air Quality Card -->
          <div
            class="bg-gradient-to-br from-blue-50 to-blue-100/50 dark:from-blue-900/20 dark:to-blue-800/10 rounded-xl p-6 border border-blue-200/50 dark:border-blue-700/30"
          >
            <div class="flex items-center gap-3 mb-4">
              <div
                class="w-10 h-10 rounded-lg bg-blue-500 flex items-center justify-center text-white"
              >
                <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00.951-.69l1.07-3.292z"
                  />
                </svg>
              </div>
              <div>
                <h3 class="font-semibold text-blue-900 dark:text-blue-100">Air Quality Index</h3>
                <p class="text-sm text-blue-700 dark:text-blue-300">
                  {{ healthStatus.label }} conditions
                </p>
              </div>
            </div>
            <div class="space-y-3">
              <div class="flex justify-between items-center">
                <span class="text-sm text-blue-800 dark:text-blue-200">Temperature</span>
                <span class="font-medium text-blue-900 dark:text-blue-100">
                  {{ airData.temperature.value }}{{ airData.temperature.unit }}
                </span>
              </div>
              <div class="flex justify-between items-center">
                <span class="text-sm text-blue-800 dark:text-blue-200">Humidity</span>
                <span class="font-medium text-blue-900 dark:text-blue-100">
                  {{ airData.humidity.value }}{{ airData.humidity.unit }}
                </span>
              </div>
            </div>
          </div>

          <!-- Recommendations Section -->
          <div class="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div
              class="bg-gradient-to-br from-green-50 to-green-100/50 dark:from-green-900/20 dark:to-green-800/10 rounded-lg p-4 border border-green-200/50 dark:border-green-700/30"
            >
              <div class="flex items-center gap-2 mb-2">
                <div class="w-2 h-2 bg-green-500 rounded-full"></div>
                <span class="text-sm font-medium text-green-800 dark:text-green-200">
                  {{ healthStatus.label }} Air Quality
                </span>
              </div>
              <p class="text-xs text-green-700 dark:text-green-300">
                Current air conditions are {{ healthStatus.label.toLowerCase() }} for indoor
                environments.
              </p>
            </div>

            <div
              class="bg-gradient-to-br from-purple-50 to-purple-100/50 dark:from-purple-900/20 dark:to-purple-800/10 rounded-lg p-4 border border-purple-200/50 dark:border-purple-700/30"
            >
              <div class="flex items-center gap-2 mb-2">
                <div class="w-2 h-2 bg-purple-500 rounded-full"></div>
                <span class="text-sm font-medium text-purple-800 dark:text-purple-200">
                  Low Particulates
                </span>
              </div>
              <p class="text-xs text-purple-700 dark:text-purple-300">
                Particulate matter levels are within healthy ranges for indoor air quality.
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- Air Quality Trends Section -->
      <div
        class="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-2xl border border-gray-200/60 dark:border-gray-800/60 shadow-sm overflow-hidden animate-fade-in"
        style="animation-delay: 0.3s"
      >
        <!-- Accent Line -->
        <div class="h-1 w-full bg-gradient-to-r from-blue-500 via-cyan-500 to-teal-500"></div>

        <!-- Section Content -->
        <div class="p-6">
          <!-- Header -->
          <div
            class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6"
          >
            <!-- Title & Description -->
            <div class="flex items-center space-x-4">
              <div
                class="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-100 to-blue-50 dark:from-blue-900/30 dark:to-blue-800/20 flex items-center justify-center ring-1 ring-blue-200/50 dark:ring-blue-700/30"
              >
                <svg
                  class="w-6 h-6 text-blue-600 dark:text-blue-400"
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
                <h2 class="text-xl font-semibold text-gray-900 dark:text-gray-100">
                  Air Quality Trends
                </h2>
                <p class="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                  Historical analysis of environmental air quality parameters
                </p>
              </div>
            </div>

            <!-- Timeframe Switch -->
            <div
              class="inline-flex bg-gray-100 dark:bg-gray-800 rounded-full p-1 border border-gray-200 dark:border-gray-700"
            >
              <button
                v-for="(option, index) in ['24h', '7d', '30d']"
                :key="option"
                @click="changeTimeFrame(option)"
                class="px-4 py-2 text-sm font-medium transition-all duration-200 focus:outline-none"
                :class="[
                  timeFrame === option
                    ? 'bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-sm ring-1 ring-blue-200/50 dark:ring-blue-700/30'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 hover:text-blue-600 dark:hover:text-blue-400',
                  index === 0 ? 'rounded-l-full' : '',
                  index === 2 ? 'rounded-r-full' : '',
                ]"
              >
                {{ option }}
              </button>
            </div>
          </div>

          <!-- Charts Grid -->
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <!-- Temperature Chart -->
            <div class="animate-fade-in" style="animation-delay: 0.4s">
              <SensorChart
                title="Air Temperature"
                :data="airData.temperature.history"
                valueLabel="Temperature (°C)"
                chartColor="#EF4444"
                icon="mdi-weather-windy"
              />
            </div>

            <!-- Humidity Chart -->
            <div class="animate-fade-in" style="animation-delay: 0.5s">
              <SensorChart
                title="Air Humidity"
                :data="airData.humidity.history"
                valueLabel="Humidity (%)"
                chartColor="#3B82F6"
                icon="mdi-water"
              />
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Export Data Modal -->
    <DataExportModal
      :show="showExportModal"
      title="Export Air Quality Data"
      description="Select the parameters, date range, and format for your air quality data export."
      data-type="air"
      :available-sensors="availableSensors"
      @close="showExportModal = false"
      @export="handleExportData"
    />
  </div>
</template>

<style scoped>
/* Enhanced animations with staggered delays */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-fade-in {
  animation: fadeIn 0.6s ease-out forwards;
}

/* Smooth transitions for interactive elements */
.transition-all {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

/* Enhanced hover effects */
.hover\:shadow-md:hover {
  box-shadow:
    0 10px 25px -5px rgba(0, 0, 0, 0.1),
    0 10px 10px -5px rgba(0, 0, 0, 0.04);
}

/* Loading animation */
@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.animate-spin {
  animation: spin 1s linear infinite;
}

/* Pulse animation for live indicators */
@keyframes pulse {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

.animate-pulse {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

/* Dark mode transitions */
.dark-mode-transition {
  transition:
    background-color 0.3s ease,
    color 0.3s ease,
    border-color 0.3s ease;
}

/* Focus states for accessibility */
button:focus {
  outline: 2px solid theme('colors.emerald.500');
  outline-offset: 2px;
}

/* Reduced motion support */
@media (prefers-reduced-motion: reduce) {
  .animate-fade-in,
  .animate-spin,
  .animate-pulse {
    animation: none;
  }

  .transition-all {
    transition: none;
  }
}

/* High contrast mode support */
@media (prefers-contrast: high) {
  .border {
    border-width: 2px;
  }
}
</style>
