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

onMounted(() => {
  refreshData()
})

/**
 * Handle export of soil sensor data
 * @param exportOptions Export configuration options
 */
function handleExport(exportOptions: {
  format: 'csv' | 'json' | 'excel';
  sensors: Array<{ id: string; name?: string; unit?: string } | string>;
  dateRange: { start: string | null; end: string | null };
  timeRange: { start: string; end: string };
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
      let sensorData: Record<string, unknown> = soilData.value

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

/**
 * Updates soil data from API response
 * @param response The API response containing sensor data
 */
function updateSoilData(response: Record<string, unknown>) {
  if (!response) return

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

      <!-- Soil Analysis Insights -->
      <div
        class="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-2xl border border-gray-200/60 dark:border-gray-800/60 shadow-sm overflow-hidden"
      >
        <!-- Accent bar matching HomeView -->
        <div class="h-1 bg-gradient-to-r from-emerald-500 to-teal-600"></div>

        <!-- Header -->
        <div class="px-6 py-5 border-b border-gray-100 dark:border-gray-800">
          <div class="flex items-center gap-4">
            <div
              class="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-100 to-emerald-50 dark:from-emerald-900/30 dark:to-emerald-800/20 flex items-center justify-center ring-1 ring-emerald-200/50 dark:ring-emerald-700/30"
            >
              <span
                class="mdi mdi-monitor-dashboard text-xl text-emerald-600 dark:text-emerald-400"
              ></span>
            </div>
            <div>
              <h2 class="text-xl font-semibold text-gray-900 dark:text-gray-100">Soil Analysis</h2>
              <p class="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                Comprehensive soil health insights and recommendations
              </p>
            </div>
          </div>
        </div>

        <!-- Analysis Content -->
        <div class="p-6">
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <!-- Nutrient Analysis Card -->
            <div
              class="bg-gradient-to-br from-emerald-50 to-emerald-100/50 dark:from-emerald-900/20 dark:to-emerald-800/10 rounded-xl p-6 border border-emerald-200/50 dark:border-emerald-700/30"
            >
              <div class="flex items-center gap-3 mb-4">
                <div
                  class="w-10 h-10 rounded-lg bg-emerald-500 flex items-center justify-center text-white"
                >
                  <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"
                    />
                  </svg>
                </div>
                <div>
                  <h3 class="font-semibold text-emerald-900 dark:text-emerald-100">
                    Nutrient Balance
                  </h3>
                  <p class="text-sm text-emerald-700 dark:text-emerald-300">
                    Optimal levels detected
                  </p>
                </div>
              </div>
              <div class="space-y-3">
                <div class="flex justify-between items-center">
                  <span class="text-sm text-emerald-800 dark:text-emerald-200">Nitrogen (N)</span>
                  <span class="font-medium text-emerald-900 dark:text-emerald-100">
                    {{ soilData.nutrients.nitrogen.value }}{{ soilData.nutrients.nitrogen.unit }}
                  </span>
                </div>
                <div class="flex justify-between items-center">
                  <span class="text-sm text-emerald-800 dark:text-emerald-200">Phosphorus (P)</span>
                  <span class="font-medium text-emerald-900 dark:text-emerald-100">
                    {{ soilData.nutrients.phosphorus.value
                    }}{{ soilData.nutrients.phosphorus.unit }}
                  </span>
                </div>
                <div class="flex justify-between items-center">
                  <span class="text-sm text-emerald-800 dark:text-emerald-200">Potassium (K)</span>
                  <span class="font-medium text-emerald-900 dark:text-emerald-100">
                    {{ soilData.nutrients.potassium.value }}{{ soilData.nutrients.potassium.unit }}
                  </span>
                </div>
              </div>
            </div>

            <!-- Soil Conditions Card -->
            <div
              class="bg-gradient-to-br from-blue-50 to-blue-100/50 dark:from-blue-900/20 dark:to-blue-800/10 rounded-xl p-6 border border-blue-200/50 dark:border-blue-700/30"
            >
              <div class="flex items-center gap-3 mb-4">
                <div
                  class="w-10 h-10 rounded-lg bg-blue-500 flex items-center justify-center text-white"
                >
                  <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fill-rule="evenodd"
                      d="M3 3a1 1 0 000 2v8a2 2 0 002 2h2.586l-1.293 1.293a1 1 0 101.414 1.414L10 15.414l2.293 2.293a1 1 0 001.414-1.414l2 2a1 1 0 001.414 0l4-4z"
                      clip-rule="evenodd"
                    />
                  </svg>
                </div>
                <div>
                  <h3 class="font-semibold text-blue-900 dark:text-blue-100">Soil Conditions</h3>
                  <p class="text-sm text-blue-700 dark:text-blue-300">Environmental factors</p>
                </div>
              </div>
              <div class="space-y-3">
                <div class="flex justify-between items-center">
                  <span class="text-sm text-blue-800 dark:text-blue-200">Temperature</span>
                  <span class="font-medium text-blue-900 dark:text-blue-100">
                    {{ soilData.temperature.value }}{{ soilData.temperature.unit }}
                  </span>
                </div>
                <div class="flex justify-between items-center">
                  <span class="text-sm text-blue-800 dark:text-blue-200">Moisture</span>
                  <span class="font-medium text-blue-900 dark:text-blue-100">
                    {{ soilData.moisture.value }}{{ soilData.moisture.unit }}
                  </span>
                </div>
                <div class="flex justify-between items-center">
                  <span class="text-sm text-blue-800 dark:text-blue-200">pH Level</span>
                  <span class="font-medium text-blue-900 dark:text-blue-100">
                    {{ soilData.ph.value }}{{ soilData.ph.unit }}
                  </span>
                </div>
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
                  Optimal Growth
                </span>
              </div>
              <p class="text-xs text-green-700 dark:text-green-300">
                Current conditions are ideal for plant growth. Continue current care routine.
              </p>
            </div>

            <div
              class="bg-gradient-to-br from-amber-50 to-amber-100/50 dark:from-amber-900/20 dark:to-amber-800/10 rounded-lg p-4 border border-amber-200/50 dark:border-amber-700/30"
            >
              <div class="flex items-center gap-2 mb-2">
                <div class="w-2 h-2 bg-amber-500 rounded-full"></div>
                <span class="text-sm font-medium text-amber-800 dark:text-amber-200">
                  Monitor pH
                </span>
              </div>
              <p class="text-xs text-amber-700 dark:text-amber-300">
                pH levels are within range but monitor for any significant changes.
              </p>
            </div>

            <div
              class="bg-gradient-to-br from-blue-50 to-blue-100/50 dark:from-blue-900/20 dark:to-blue-800/10 rounded-lg p-4 border border-blue-200/50 dark:border-blue-700/30"
            >
              <div class="flex items-center gap-2 mb-2">
                <div class="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span class="text-sm font-medium text-blue-800 dark:text-blue-200">
                  Nutrient Rich
                </span>
              </div>
              <p class="text-xs text-blue-700 dark:text-blue-300">
                Excellent nutrient balance supports healthy plant development.
              </p>
            </div>
          </div>
        </div>
      </div>

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
        { id: 'nutrients.nitrogen', name: 'Nitrogen', unit: soilData.nutrients.nitrogen.unit },
        {
          id: 'nutrients.phosphorus',
          name: 'Phosphorus',
          unit: soilData.nutrients.phosphorus.unit,
        },
        { id: 'nutrients.potassium', name: 'Potassium', unit: soilData.nutrients.potassium.unit },
        { id: 'conductivity', name: 'Conductivity', unit: soilData.conductivity.unit },
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
