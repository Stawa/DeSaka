<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import SensorChart from '../components/SensorChart.vue'
import SoilHealthDashboard from '../components/SoilHealthDashboard.vue'
import DataExportModal from '@/components/DataExportModal.vue'
import SoilHeader from '@/components/soil/SoilHeader.vue'
import { formatCurrentTime, calculateParameterScore } from '@/scripts'
import { handleDataExport } from '@/utils/exportUtils'
import { useApi } from '@/composables/useApi'
import {
  getDateRangeFromTimeframe,
  updateSensorDataFromResponse,
  updateSensorStatus,
  updateSensorTrend,
  formatSensorDataForExport,
} from '@/scripts/sensorDataUtils'

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
const showExportModal = ref(false)
const error = ref<string | null>(null)

const { fetchSensorData, refreshData: apiRefreshData, fetchFileById } = useApi()

function handleExport(exportOptions: any) {
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

    {
      name: 'nutrients.nitrogen',
      label: 'Nitrogen',
      unit: soilData.value.nutrients.nitrogen.unit,
      selected: true,
    },
    {
      name: 'nutrients.phosphorus',
      label: 'Phosphorus',
      unit: soilData.value.nutrients.phosphorus.unit,
      selected: true,
    },
    {
      name: 'nutrients.potassium',
      label: 'Potassium',
      unit: soilData.value.nutrients.potassium.unit,
      selected: true,
    },
  ]

  const exportData: Record<string, Array<{ timestamp: string; value: number }>> = {}
  const sensorInfo: Record<string, { name: string; unit: string }> = {}

  sensorsList
    .filter((sensor) => sensor.selected)
    .forEach((sensor) => {
      const sensorPath = sensor.name.split('.')
      let sensorData: any = soilData.value

      for (const path of sensorPath) {
        sensorData = sensorData[path]
      }

      const formattedData = formatSensorDataForExport(sensorData, sensor.label)

      exportData[sensor.name] = formattedData.exportData
      sensorInfo[sensor.name] = formattedData.sensorInfo
    })

  handleDataExport(exportOptions, exportData, sensorInfo)
}

async function refreshData() {
  isRefreshing.value = true
  error.value = null

  try {
    try {
      const soilFileId = '13mBooyMXhDiBHtqJcwy3dcz1RsL6iXYG'
      const soilResponse = await fetchFileById(soilFileId)

      updateSoilData(soilResponse)
      updateSensorStatuses()
      updateSensorTrends()

      lastUpdated.value = formatCurrentTime()
      return
    } catch (fileErr) {
      console.warn('Could not fetch from file endpoint, falling back to sensors endpoint:', fileErr)
    }

    const { startDate, endDate } = getDateRangeFromTimeframe(timeFrame.value)
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

    await apiRefreshData(
      (soilResponse) => {
        updateSoilData(soilResponse)
        updateSensorStatuses()
        updateSensorTrends()
        lastUpdated.value = formatCurrentTime()
      },
      fetchSensorData,
      params,
    )
  } catch (err) {
    console.error('Error refreshing soil data:', err)
    error.value = 'Failed to fetch soil data. Please try again later.'
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
  updateSensorTrend(soilData.value.conductivity)
  updateSensorTrend(soilData.value.nutrients.nitrogen)
  updateSensorTrend(soilData.value.nutrients.phosphorus)
  updateSensorTrend(soilData.value.nutrients.potassium)
}

function updateSoilData(response: any) {
  if (!response) return

  const isFileApiFormat = response.temperature !== undefined || response.moisture !== undefined

  const sensorMappings = [
    { sensor: soilData.value.temperature, apiKey: 'soil_temperature', fileKey: 'temperature' },
    { sensor: soilData.value.moisture, apiKey: 'soil_moisture', fileKey: 'moisture' },
    { sensor: soilData.value.ph, apiKey: 'soil_ph', fileKey: 'ph' },
    { sensor: soilData.value.conductivity, apiKey: 'soil_conductivity', fileKey: 'conductivity' },
    { sensor: soilData.value.nutrients.nitrogen, apiKey: 'soil_nitrogen', fileKey: 'nitrogen' },
    {
      sensor: soilData.value.nutrients.phosphorus,
      apiKey: 'soil_phosphorus',
      fileKey: 'phosphorus',
    },
    { sensor: soilData.value.nutrients.potassium, apiKey: 'soil_potassium', fileKey: 'potassium' },
  ]

  sensorMappings.forEach((mapping) => {
    updateSensorDataFromResponse(mapping.sensor, response, mapping.apiKey, mapping.fileKey)
  })
}

onMounted(() => {
  refreshData()
})

function updateSensorStatuses() {
  updateSensorStatus(soilData.value.temperature, 20, 28)
  updateSensorStatus(soilData.value.moisture, 50, 75)
  updateSensorStatus(soilData.value.ph, 6.0, 7.0)
  updateSensorStatus(soilData.value.conductivity, 1.0, 1.4)
  updateSensorStatus(soilData.value.nutrients.nitrogen, 30, 60)
  updateSensorStatus(soilData.value.nutrients.phosphorus, 25, 50)
  updateSensorStatus(soilData.value.nutrients.potassium, 150, 220)
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
    <SoilHeader :last-updated="lastUpdated" :is-refreshing="isRefreshing" />

    <!-- Dashboard Overview -->
    <SoilHealthDashboard :soil-data="soilData" :health-score="soilHealthScore" />

    <!-- Soil Trends Section -->
    <div
      class="mb-8 bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800"
    >
      <!-- Accent Line -->
      <div class="h-1 w-full bg-gradient-to-r from-blue-400 to-blue-600 rounded-t-2xl"></div>

      <!-- Section Content -->
      <div class="p-6">
        <!-- Header -->
        <div
          class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6"
        >
          <!-- Title & Description -->
          <div class="flex items-center space-x-4">
            <div class="bg-blue-100 dark:bg-blue-800/40 px-3 py-2 rounded-lg">
              <span
                class="mdi mdi-chart-timeline-variant text-blue-600 dark:text-blue-400 text-xl"
              ></span>
            </div>
            <div>
              <h2 class="text-lg font-semibold text-gray-900 dark:text-white">Soil Trends</h2>
              <p class="text-sm text-gray-500 dark:text-gray-400">
                Historical data of soil parameters
              </p>
            </div>
          </div>

          <!-- Timeframe Switch -->
          <div class="flex items-center gap-1 bg-gray-100 dark:bg-gray-800 rounded-full p-1">
            <button
              v-for="option in ['24h', '7d', '30d']"
              :key="option"
              @click="changeTimeFrame(option)"
              class="px-3 py-1.5 text-xs font-medium rounded-full transition-colors"
              :class="
                timeFrame === option
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
              "
            >
              {{ option }}
            </button>
          </div>
        </div>

        <!-- Charts Grid -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <SensorChart
            title="Temperature Trends"
            :data="soilData.temperature.history"
            valueLabel="Soil Temperature (°C)"
            chartColor="#E97451"
          />
          <SensorChart
            title="Moisture Trends"
            :data="soilData.moisture.history"
            valueLabel="Soil Moisture (%)"
            chartColor="#3B82F6"
          />
          <SensorChart
            title="pH Level Trends"
            :data="soilData.ph.history"
            valueLabel="Soil pH Level"
            chartColor="#8B5CF6"
          />
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
      { id: 'nutrients.nitrogen', name: 'Nitrogen', unit: soilData.nutrients.nitrogen.unit },
      { id: 'nutrients.phosphorus', name: 'Phosphorus', unit: soilData.nutrients.phosphorus.unit },
      { id: 'nutrients.potassium', name: 'Potassium', unit: soilData.nutrients.potassium.unit },
      { id: 'conductivity', name: 'Conductivity', unit: soilData.conductivity.unit },
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
