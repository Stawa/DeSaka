<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import SensorChart from '../components/SensorChart.vue'
import SoilHealthDashboard from '../components/SoilHealthDashboard.vue'
import DataExportModal from '@/components/DataExportModal.vue'
import SoilHeader from '@/components/soil/SoilHeader.vue'
import { calculateParameterScore, formatReadableDateTime, type TimeframeOption } from '@/scripts'
import { handleDataExport } from '@/utils/exportUtils'
import { SENSOR_FILE_IDS, useApi } from '@/composables/useApi'
import {
  getDateRangeFromTimeframe,
  updateSensorDataFromResponse,
  updateSensorStatus,
  updateSensorTrend,
  formatSensorDataForExport,
  type SensorResponse,
} from '@/scripts/sensorDataUtils'
import type { SensorModification, Settings, Soil } from '@/composables/responseApi'
import { getMinMax } from '@/utils/sensorHelpers'

const soilData = ref<SensorModification>({
  temperature: {
    value: 0,
    unit: '°C',
    history: [],
    min: 0,
    max: 0,
    optimal_min: 0,
    optimal_max: 0,
    status: 'optimal',
    trend: 'increasing',
  },
  moisture: {
    value: 0,
    unit: '%',
    history: [],
    min: 0,
    max: 0,
    optimal_min: 0,
    optimal_max: 0,
    status: 'optimal',
    trend: 'increasing',
  },
  ph: {
    value: 0,
    unit: '',
    history: [],
    min: 0,
    max: 0,
    optimal_min: 0,
    optimal_max: 0,
    status: 'optimal',
    trend: 'increasing',
  },
})

type HistoricalDataItem = { time: string; value: number }[]
type HistoricalDataType = {
  [key: string]: HistoricalDataItem
  soilTemperature: HistoricalDataItem
  soilMoisture: HistoricalDataItem
  soilPH: HistoricalDataItem
  airTemperature: HistoricalDataItem
  airHumidity: HistoricalDataItem
}
const historicalData = ref<HistoricalDataType>({
  soilTemperature: [],
  soilMoisture: [],
  soilPH: [],
  airTemperature: [],
  airHumidity: [],
})

const lastUpdated = ref('Loading...')
const isRefreshing = ref(false)
const timeFrame = ref('24h')
const showExportModal = ref(false)
const SettingsResponse = ref<Settings | null>(null)

const { refreshData: apiRefreshData, fetchFileById } = useApi()

onMounted(() => {
  refreshData()
})

/**
 * Handle export of soil sensor data
 * @param exportOptions Export configuration options
 */
function handleExport(exportOptions: {
  format: 'csv' | 'json' | 'excel'
  sensors: Array<{ id: string; name?: string; unit?: string } | string>
  dateRange: { start: string | null; end: string | null }
  timeRange: { start: string; end: string }
}) {
  const sensorsList = [
    {
      name: 'temperature',
      label: 'Soil Temperature',
      unit: soilData.value.temperature.unit,
      selected: true,
    },
    {
      name: 'moisture',
      label: 'Soil Moisture',
      unit: soilData.value.moisture.unit,
      selected: true,
    },
    { name: 'ph', label: 'Soil pH', unit: soilData.value.ph.unit, selected: true },
  ]

  const exportData: Record<string, Array<{ timestamp: string; value: number }>> = {}
  const sensorInfo: Record<string, { name: string; unit: string }> = {}

  sensorsList
    .filter((sensor) => sensor.selected)
    .forEach((sensor) => {
      const sensorData = soilData.value[sensor.name as keyof typeof soilData.value]
      const formattedData = formatSensorDataForExport(sensorData, sensor.label)
      exportData[sensor.name] = formattedData.exportData
      sensorInfo[sensor.name] = formattedData.sensorInfo
    })

  handleDataExport(exportOptions, exportData, sensorInfo)
}

async function refreshData() {
  const settingsFileId = SENSOR_FILE_IDS.settings
  const settingsResponse: Settings = await fetchFileById(settingsFileId)

  isRefreshing.value = true
  SettingsResponse.value = settingsResponse

  try {
    try {
      const soilFileId = SENSOR_FILE_IDS.soil
      const soilResponse: Soil = await fetchFileById(soilFileId)

      updateSoilData(soilResponse)
      updateSensorStatuses()
      updateSensorTrends()

      const history = soilResponse.temperature.history
      lastUpdated.value = formatReadableDateTime(history[history.length - 1].time)

      return
    } catch (fileErr) {
      console.warn('Could not fetch from file endpoint, falling back to sensors endpoint:', fileErr)
    }

    const { startDate, endDate } = getDateRangeFromTimeframe(timeFrame.value as TimeframeOption)
    const startDateStr = new Date(startDate).toISOString().split('T')[0]
    const endDateStr = new Date(endDate).toISOString().split('T')[0]

    const params = {
      startDate: startDateStr,
      endDate: endDateStr,
      sensors: [
        'soil_temperature',
        'soil_moisture',
        'soil_ph',
        'soil_conductivity',
        'soil_nitrogen',
        'soil_phosphorus',
        'soil_potassium',
      ],
    }

    const fetchSoilFile = async (): Promise<Soil> => {
      return await fetchFileById(SENSOR_FILE_IDS.soil)
    }

    await apiRefreshData(
      (soilResponse) => {
        updateSoilData(soilResponse)
        updateSensorStatuses()
        updateSensorTrends()
      },
      fetchSoilFile,
      params,
    )
  } catch (err) {
    console.error('Error refreshing soil data:', err)
  } finally {
    isRefreshing.value = false
  }
}

function changeTimeFrame(newTimeFrame: string) {
  if (timeFrame.value !== newTimeFrame) {
    timeFrame.value = newTimeFrame
    refreshData()
  }
}

function updateSensorTrends() {
  updateSensorTrend(soilData.value.temperature)
  updateSensorTrend(soilData.value.moisture)
  updateSensorTrend(soilData.value.ph)
}

/**
 * Updates soil data from API response
 * @param response The API response containing sensor data
 */
function updateSoilData(response: Record<string, SensorResponse>) {
  if (!SettingsResponse.value) return
  if (!response) return

  const sensorMappings = [
    { sensor: soilData.value.temperature, apiKey: 'soil_temperature', fileKey: 'temperature' },
    { sensor: soilData.value.moisture, apiKey: 'soil_moisture', fileKey: 'moisture' },
    { sensor: soilData.value.ph, apiKey: 'soil_ph', fileKey: 'ph' },
  ]

  sensorMappings.forEach((mapping) => {
    updateSensorDataFromResponse(mapping.sensor, response, mapping.apiKey, mapping.fileKey)
  })

  if (SettingsResponse.value) {
    const t = SettingsResponse.value.thresholds
    soilData.value.temperature.optimal_min = t.soilTemperature.min
    soilData.value.temperature.optimal_max = t.soilTemperature.max
    soilData.value.moisture.optimal_min = t.soilMoisture.min
    soilData.value.moisture.optimal_max = t.soilMoisture.max
    soilData.value.ph.optimal_min = t.soilPH.min
    soilData.value.ph.optimal_max = t.soilPH.max
  }

  const { min: soilTempMin, max: soilTempMax } = getMinMax(historicalData.value.soilTemperature)
  soilData.value.temperature.min = soilTempMin
  soilData.value.temperature.max = soilTempMax

  const { min: soilMoistureMin, max: soilMoistureMax } = getMinMax(
    historicalData.value.soilMoisture,
  )
  soilData.value.moisture.min = soilMoistureMin
  soilData.value.moisture.max = soilMoistureMax

  const { min: soilPHMin, max: soilPHMax } = getMinMax(historicalData.value.soilPH)
  soilData.value.ph.min = soilPHMin
  soilData.value.ph.max = soilPHMax
}

function updateSensorStatuses() {
  if (!SettingsResponse.value) return

  updateSensorStatus(
    soilData.value.temperature,
    SettingsResponse.value?.thresholds.soilTemperature.min - 5,
    SettingsResponse.value?.thresholds.soilTemperature.max + 5,
    SettingsResponse.value?.thresholds.soilTemperature.min,
    SettingsResponse.value?.thresholds.soilTemperature.max,
  )
  updateSensorStatus(
    soilData.value.moisture,
    SettingsResponse.value?.thresholds.soilMoisture.min - 5,
    SettingsResponse.value?.thresholds.soilMoisture.max + 5,
    SettingsResponse.value?.thresholds.soilMoisture.min,
    SettingsResponse.value?.thresholds.soilMoisture.max,
  )
  updateSensorStatus(
    soilData.value.ph,
    SettingsResponse.value?.thresholds.soilPH.min - 5,
    SettingsResponse.value?.thresholds.soilPH.max + 5,
    SettingsResponse.value?.thresholds.soilPH.min,
    SettingsResponse.value?.thresholds.soilPH.max,
  )
}

const soilHealthScore = computed(() => {
  if (!SettingsResponse.value) return 0
  const thresholds = SettingsResponse.value.thresholds

  const soilTempValue = soilData.value.temperature.value
  const soilMoistureValue = soilData.value.moisture.value
  const soilPHValue = soilData.value.ph.value

  const soilTempHistory = soilData.value.temperature.history
  const soilMoistureHistory = soilData.value.moisture.history
  const soilPHHistory = soilData.value.ph.history

  const { min: soilTempMin, max: soilTempMax } = getMinMax(soilTempHistory)
  const { min: soilMoistureMin, max: soilMoistureMax } = getMinMax(soilMoistureHistory)
  const { min: soilPHMin, max: soilPHMax } = getMinMax(soilPHHistory)

  const soilTempScore = calculateParameterScore(
    soilTempValue,
    thresholds.soilTemperature.min,
    thresholds.soilTemperature.max,
    soilTempMin,
    soilTempMax,
  )
  const soilMoistureScore = calculateParameterScore(
    soilMoistureValue,
    thresholds.soilMoisture.min,
    thresholds.soilMoisture.max,
    soilMoistureMin,
    soilMoistureMax,
  )
  const soilPHScore = calculateParameterScore(
    soilPHValue,
    thresholds.soilPH.min,
    thresholds.soilPH.max,
    soilPHMin,
    soilPHMax,
  )

  return Math.round(soilTempScore * 0.15 + soilMoistureScore * 0.2 + soilPHScore * 0.15)
})
</script>

<template>
  <!-- Main container matching HomeView design -->
  <div class="min-h-screen bg-gray-50 dark:bg-gray-950">
    <div class="mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8">
      <!-- Page Header -->
      <SoilHeader
        :last-updated="lastUpdated"
        :is-refreshing="isRefreshing"
        @refresh="refreshData"
        @export="showExportModal = true"
      />

      <!-- Soil Health Dashboard -->
      <SoilHealthDashboard :soil-data="soilData" :health-score="soilHealthScore" />

      <!-- Soil Trends Section -->
      <div
        class="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-2xl border border-gray-200/60 dark:border-gray-800/60 shadow-sm overflow-hidden"
      >
        <!-- Accent Line -->
        <div class="h-1 w-full bg-gradient-to-r from-emerald-500 to-teal-600"></div>

        <!-- Section Content -->
        <div class="p-6">
          <!-- Header -->
          <div
            class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6"
          >
            <!-- Title & Description -->
            <div class="flex items-center space-x-4">
              <div
                class="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-100 to-emerald-50 dark:from-emerald-900/30 dark:to-emerald-800/20 flex items-center justify-center ring-1 ring-emerald-200/50 dark:ring-emerald-700/30"
              >
                <svg
                  class="w-6 h-6 text-emerald-600 dark:text-emerald-400"
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
                <h2 class="text-xl font-semibold text-gray-900 dark:text-gray-100">Soil Trends</h2>
                <p class="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                  Historical data of soil parameters
                </p>
              </div>
            </div>

            <!-- Timeframe Switch styled like the app's main buttons -->
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
                    ? 'bg-white dark:bg-gray-700 text-emerald-600 dark:text-emerald-400 shadow-sm ring-1 ring-emerald-200/50 dark:ring-emerald-700/30'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 hover:text-emerald-600 dark:hover:text-emerald-400',
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
            <SensorChart
              title="Temperature Trends"
              :data="soilData.temperature.history"
              valueLabel="Soil Temperature (°C)"
              chartColor="#10b981"
              icon="mdi-thermometer-lines"
            />
            <SensorChart
              title="Moisture Trends"
              :data="soilData.moisture.history"
              valueLabel="Soil Moisture (%)"
              chartColor="#06b6d4"
              icon="mdi-grass"
            />
            <div class="lg:col-span-2">
              <SensorChart
                title="pH Level Trends"
                :data="soilData.ph.history"
                valueLabel="Soil pH Level"
                chartColor="#8b5cf6"
                icon="mdi-water-opacity"
              />
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Export Data Modal -->
    <DataExportModal
      :show="showExportModal"
      title="Export Soil Data"
      description="Select the parameters, date range, and format for your soil data export."
      data-type="soil"
      :available-sensors="[
        { id: 'temperature', name: 'Soil Temperature', unit: soilData.temperature.unit },
        { id: 'moisture', name: 'Soil Moisture', unit: soilData.moisture.unit },
        { id: 'ph', name: 'Soil pH', unit: soilData.ph.unit },
      ]"
      @close="showExportModal = false"
      @export="handleExport"
    />
  </div>
</template>

<style scoped>
/* Smooth transitions for all interactive elements */
* {
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

/* Focus states for accessibility */
button:focus,
a:focus {
  outline: 2px solid theme('colors.emerald.500');
  outline-offset: 2px;
}

/* Responsive image handling */
img {
  max-width: 100%;
  height: auto;
}

/* Smooth scrolling for better UX */
html {
  scroll-behavior: smooth;
}

/* Custom scrollbar styling for consistency */
::-webkit-scrollbar {
  width: 8px;
}

::-webkit-scrollbar-track {
  background: theme('colors.gray.100');
}

::-webkit-scrollbar-thumb {
  background: theme('colors.gray.400');
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: theme('colors.gray.500');
}

/* Dark mode scrollbar */
.dark ::-webkit-scrollbar-track {
  background: theme('colors.gray.800');
}

.dark ::-webkit-scrollbar-thumb {
  background: theme('colors.gray.600');
}

.dark ::-webkit-scrollbar-thumb:hover {
  background: theme('colors.gray.500');
}

/* Animation for page load */
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Apply fade-in animation to main sections */
.space-y-8 > * {
  animation: fadeInUp 0.6s ease-out;
  animation-fill-mode: both;
}

/* Stagger animation delays for visual appeal */
.space-y-8 > *:nth-child(1) {
  animation-delay: 0.1s;
}
.space-y-8 > *:nth-child(2) {
  animation-delay: 0.2s;
}
.space-y-8 > *:nth-child(3) {
  animation-delay: 0.3s;
}
.space-y-8 > *:nth-child(4) {
  animation-delay: 0.4s;
}
.space-y-8 > *:nth-child(5) {
  animation-delay: 0.5s;
}

/* Reduced motion for accessibility */
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }

  html {
    scroll-behavior: auto;
  }
}

/* High contrast mode support */
@media (prefers-contrast: high) {
  * {
    border-color: currentColor;
  }
}

/* Print styles for better document output */
@media print {
  .no-print {
    display: none !important;
  }

  * {
    background: white !important;
    color: black !important;
    box-shadow: none !important;
  }
}

/* Hover effects for interactive elements */
button:hover {
  transform: translateY(-1px);
}

/* Card hover effects */
.space-y-8 > div:hover {
  transform: translateY(-2px);
  box-shadow:
    0 10px 25px -5px rgba(0, 0, 0, 0.1),
    0 10px 10px -5px rgba(0, 0, 0, 0.04);
}

/* Enhanced visual feedback */
.bg-gradient-to-br:hover {
  transform: scale(1.02);
}
</style>
