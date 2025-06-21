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
              @click="showExportModal = true"
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
            <div class="bg-blue-100 dark:bg-blue-900/30 py-2 px-3 rounded-lg mr-3">
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
            valueLabel="Air Temperature (°C)"
            chartColor="#E97451"
          />
          <SensorChart
            title="Humidity Trends"
            :data="airData.humidity.history"
            valueLabel="Air Humidity (%)"
            chartColor="#3B82F6"
          />
          <SensorChart
            title="CO₂ Level Trends"
            :data="airData.co2.history"
            valueLabel="Air CO₂ (ppm)"
            chartColor="#8B5CF6"
          />
          <SensorChart
            title="TVOC Level Trends"
            :data="airData.tvoc.history"
            valueLabel="Air TVOC (ppb)"
            chartColor="#10B981"
          />
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
