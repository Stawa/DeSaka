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
import AirHeader from '@/components/air/AirHeader.vue'

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
    <AirHeader
      :title="'Air Quality'"
      :subtitle="'Current Conditions'"
      :last-updated="lastUpdated"
    />

    <!-- Air Quality Dashboard -->
    <AirQualityDashboard :air-data="airData" :healthScore="airQualityIndex" />

    <!-- Air Trends Section -->
    <!-- Air Trends Section (Redesigned) -->
    <div
      class="bg-white dark:bg-gray-900 rounded-2xl shadow-md border border-gray-200 dark:border-gray-800 mb-12 overflow-hidden"
    >
      <!-- Top Accent Bar -->
      <div class="h-1.5 bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700 w-full"></div>

      <div class="p-6 md:p-8">
        <!-- Header -->
        <div
          class="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-6"
        >
          <!-- Header Text -->
          <div>
            <h2 class="text-2xl font-bold text-gray-900 dark:text-white">Air Trends</h2>
            <p class="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Historical data analysis of environmental air quality metrics
            </p>
          </div>

          <!-- Time Frame Selector -->
          <div
            class="flex items-center gap-1 bg-gray-100 dark:bg-gray-800 p-1 rounded-full border border-gray-300 dark:border-gray-700"
          >
            <template v-for="frame in ['24h', '7d', '30d']" :key="frame">
              <button
                @click="changeTimeFrame(frame)"
                :class="[
                  'px-4 py-1.5 text-sm rounded-full font-medium focus:outline-none transition-all duration-200',
                  timeFrame === frame
                    ? 'bg-blue-600 text-white shadow'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700',
                ]"
              >
                {{ frame }}
              </button>
            </template>
          </div>
        </div>

        <!-- Sensor Chart Grid -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div
            class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-5 hover:shadow-md transition"
          >
            <SensorChart
              title="Temperature"
              :data="airData.temperature.history"
              valueLabel="Air Temperature (°C)"
              chartColor="#E97451"
            />
          </div>
          <div
            class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-5 hover:shadow-md transition"
          >
            <SensorChart
              title="Humidity"
              :data="airData.humidity.history"
              valueLabel="Air Humidity (%)"
              chartColor="#3B82F6"
            />
          </div>
          <div
            class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-5 hover:shadow-md transition"
          >
            <SensorChart
              title="CO₂"
              :data="airData.co2.history"
              valueLabel="Air CO₂ (ppm)"
              chartColor="#8B5CF6"
            />
          </div>
          <div
            class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-5 hover:shadow-md transition"
          >
            <SensorChart
              title="TVOC"
              :data="airData.tvoc.history"
              valueLabel="Air TVOC (ppb)"
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
