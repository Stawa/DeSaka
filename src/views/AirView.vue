<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import SensorChart from '@/components/SensorChart.vue'
import AirQualityDashboard from '@/components/AirQualityDashboard.vue'
import DataExportModal from '@/components/DataExportModal.vue'
import { handleDataExport } from '@/utils/exportUtils'
import { useApi } from '@/composables/useApi'
import {
  formatCurrentTime,
  calculateParameterScore,
  getDateRangeFromTimeframe,
  updateSensorDataFromResponse,
  updateSensorStatus,
  formatSensorDataForExport,
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
  pm25: {
    value: 15,
    unit: 'μg/m³',
    min: 0,
    max: 50,
    optimal_min: 0,
    optimal_max: 25,
    status: 'optimal',
    trend: 'stable',
    history: [] as DataPoint[],
  },
  pm10: {
    value: 35,
    unit: 'μg/m³',
    min: 0,
    max: 100,
    optimal_min: 0,
    optimal_max: 50,
    status: 'optimal',
    trend: 'stable',
    history: [] as DataPoint[],
  },
})

const lastUpdated = ref(formatCurrentTime())
const isRefreshing = ref(false)
const timeFrame = ref('24h')
const showExportModal = ref(false)

const { fetchSensorData, refreshData: apiRefreshData, fetchFileById, isLoading, error } = useApi()

function handleExport(exportOptions: any) {
  const sensorsList = [
    { name: 'temperature', label: 'Temperature', unit: '°C', selected: true },
    { name: 'humidity', label: 'Humidity', unit: '%', selected: true },
    { name: 'co2', label: 'CO2', unit: 'ppm', selected: true },
    { name: 'tvoc', label: 'TVOC', unit: 'ppb', selected: true },
    { name: 'pm25', label: 'PM2.5', unit: 'µg/m³', selected: true },
    { name: 'pm10', label: 'PM10', unit: 'µg/m³', selected: true },
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

async function refreshData() {
  isRefreshing.value = true
  try {
    try {
      const airFileId = '1F38HpxfKYZRj2tk0JZanTajVIEK2izkO'
      const airResponse = await fetchFileById(airFileId)

      updateAirData(airResponse)
      updateSensorStatuses()

      lastUpdated.value = formatCurrentTime()
      return
    } catch (fileErr) {
      console.warn('Could not fetch from file endpoint, falling back to sensors endpoint:', fileErr)
    }

    const { startDate: startDateStr, endDate } = getDateRangeFromTimeframe(timeFrame.value)
    const params = {
      startDate: startDateStr,
      endDate: endDate,
      sensors: ['air_temperature', 'air_humidity', 'air_co2', 'air_tvoc', 'air_pm25', 'air_pm10'],
    }

    await apiRefreshData(
      (airResponse) => {
        updateAirData(airResponse)
        updateSensorStatuses()
        lastUpdated.value = formatCurrentTime()
      },
      fetchSensorData,
      params,
    )
  } catch (err) {
    console.error('Error refreshing air data:', err)
  } finally {
    isRefreshing.value = false
  }
}

function updateAirData(response: any) {
  if (!response) return

  const isFileApiFormat = response.temperature !== undefined || response.humidity !== undefined

  updateSensorDataFromResponse(
    airData.value.temperature,
    response,
    'air_temperature',
    'temperature',
  )
  updateSensorDataFromResponse(airData.value.humidity, response, 'air_humidity', 'humidity')
  updateSensorDataFromResponse(airData.value.co2, response, 'air_co2')
  updateSensorDataFromResponse(airData.value.tvoc, response, 'air_tvoc')
  updateSensorDataFromResponse(airData.value.pm25, response, 'air_pm25')
  updateSensorDataFromResponse(airData.value.pm10, response, 'air_pm10')
}

function changeTimeFrame(frame: string) {
  timeFrame.value = frame
  refreshData()
}

onMounted(() => {
  refreshData()
})

function updateSensorStatuses() {
  updateSensorStatus(airData.value.temperature)
  updateSensorStatus(airData.value.humidity)
  updateSensorStatus(airData.value.co2)
  updateSensorStatus(airData.value.tvoc)
  updateSensorStatus(airData.value.pressure)
  updateSensorStatus(airData.value.light)
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
</script>

<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors duration-300">
    <div class="mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8">
      <!-- Enhanced Header Section -->
      <div
        class="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-2xl border border-gray-200/60 dark:border-gray-800/60 shadow-sm overflow-hidden animate-fade-in"
      >
        <!-- Dynamic Accent Bar -->
        <div class="h-1.5 bg-gradient-to-r w-full" :class="healthStatus.accentColor"></div>

        <div class="p-6 lg:p-8">
          <div class="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <!-- Header Content -->
            <div class="flex items-start gap-4">
              <div
                class="w-16 h-16 rounded-2xl flex items-center justify-center ring-1 transition-all duration-300"
                :class="[healthStatus.bgColor, 'ring-gray-200/50 dark:ring-gray-700/50']"
              >
                <span class="text-2xl">🌬️</span>
              </div>
              <div class="flex-1">
                <h1 class="text-3xl font-bold text-gray-900 dark:text-gray-100 tracking-tight">
                  Air Quality Monitor
                </h1>
                <p class="text-gray-600 dark:text-gray-400 mt-2 text-lg">
                  Real-time environmental air quality analysis and monitoring
                </p>
              </div>
            </div>

            <!-- Action Buttons -->
            <div class="flex items-center gap-3">
              <button
                @click="refreshData"
                :disabled="isRefreshing"
                class="inline-flex items-center gap-2 px-4 py-2.5 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
              >
                <span
                  :class="[
                    'w-4 h-4',
                    isRefreshing ? 'mdi mdi-loading animate-spin' : 'mdi mdi-refresh',
                  ]"
                ></span>
                {{ isRefreshing ? 'Refreshing...' : 'Refresh' }}
              </button>
              <button
                @click="showExportModal = true"
                class="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl transition-all duration-200 shadow-sm hover:shadow-md"
              >
                <span class="mdi mdi-download w-4 h-4"></span>
                Export Data
              </button>
            </div>
          </div>

          <!-- Status Bar -->
          <div class="mt-6 pt-6 border-t border-gray-200/60 dark:border-gray-700/60">
            <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div class="flex items-center gap-6 text-sm text-gray-600 dark:text-gray-400">
                <div class="flex items-center gap-2">
                  <span class="mdi mdi-clock-outline"></span>
                  <span>Last updated {{ lastUpdated }}</span>
                </div>
              </div>
              <div class="flex items-center gap-6 text-sm">
                <div class="flex items-center gap-2">
                  <div class="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span class="text-gray-600 dark:text-gray-300">
                    <span class="font-semibold text-gray-900 dark:text-gray-100">8</span>
                    Active Sensors
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Air Quality Dashboard -->
      <div class="animate-fade-in" style="animation-delay: 0.1s">
        <AirQualityDashboard :air-data="airData" :healthScore="airQualityIndex" />
      </div>

      <!-- Enhanced Air Trends Section -->
      <div
        class="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-2xl border border-gray-200/60 dark:border-gray-800/60 shadow-sm overflow-hidden animate-fade-in"
        style="animation-delay: 0.2s"
      >
        <!-- Accent Bar -->
        <div class="h-1.5 bg-gradient-to-r from-blue-500 via-cyan-500 to-teal-500 w-full"></div>

        <div class="p-6 lg:p-8">
          <!-- Section Header -->
          <div class="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 mb-8">
            <div class="flex items-start gap-4">
              <div
                class="w-12 h-12 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/30 dark:to-cyan-900/30 rounded-xl flex items-center justify-center ring-1 ring-blue-200/50 dark:ring-blue-700/30"
              >
                <span class="mdi mdi-chart-line text-xl text-blue-600 dark:text-blue-400"></span>
              </div>
              <div>
                <h2 class="text-2xl font-bold text-gray-900 dark:text-gray-100 tracking-tight">
                  Air Quality Trends
                </h2>
                <p class="text-gray-600 dark:text-gray-400 mt-1">
                  Historical analysis of environmental air quality parameters
                </p>
              </div>
            </div>

            <!-- Time Frame Selector -->
            <div
              class="flex items-center gap-1 bg-gray-100 dark:bg-gray-800 p-1 rounded-xl border border-gray-200 dark:border-gray-700"
            >
              <template v-for="frame in ['24h', '7d', '30d']" :key="frame">
                <button
                  @click="changeTimeFrame(frame)"
                  :class="[
                    'px-4 py-2 text-sm rounded-lg font-medium transition-all duration-200',
                    timeFrame === frame
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700',
                  ]"
                >
                  {{ frame }}
                </button>
              </template>
            </div>
          </div>

          <!-- Charts Grid -->
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <!-- Temperature Chart -->
            <div class="animate-fade-in" style="animation-delay: 0.3s">
              <SensorChart
                title="Air Temperature"
                :data="airData.temperature.history"
                valueLabel="Temperature (°C)"
                chartColor="#EF4444"
              />
            </div>

            <!-- Humidity Chart -->
            <div class="animate-fade-in" style="animation-delay: 0.4s">
              <SensorChart
                title="Air Humidity"
                :data="airData.humidity.history"
                valueLabel="Humidity (%)"
                chartColor="#3B82F6"
              />
            </div>

            <!-- CO₂ Chart -->
            <div class="animate-fade-in" style="animation-delay: 0.5s">
              <SensorChart
                title="CO₂ Levels"
                :data="airData.co2.history"
                valueLabel="CO₂ (ppm)"
                chartColor="#8B5CF6"
              />
            </div>

            <!-- TVOC Chart -->
            <div class="animate-fade-in" style="animation-delay: 0.6s">
              <SensorChart
                title="TVOC Levels"
                :data="airData.tvoc.history"
                valueLabel="TVOC (ppb)"
                chartColor="#10B981"
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
      :available-sensors="[
        { id: 'temperature', name: 'Air Temperature', unit: airData.temperature.unit },
        { id: 'humidity', name: 'Humidity', unit: airData.humidity.unit },
        { id: 'co2', name: 'CO2', unit: airData.co2.unit },
        { id: 'tvoc', name: 'TVOC', unit: airData.tvoc.unit },
        { id: 'pm25', name: 'PM2.5', unit: airData.pm25.unit },
        { id: 'pm10', name: 'PM10', unit: airData.pm10.unit },
      ]"
      @close="showExportModal = false"
      @export="handleExport"
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
