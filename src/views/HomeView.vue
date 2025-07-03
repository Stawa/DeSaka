<script setup lang="ts">
import { ref, onMounted, type Ref, computed, onUnmounted } from 'vue'
import PlantStatusDashboard from '../components/PlantStatusDashboard.vue'
import SensorReadingsGrid from '../components/SensorReadingsGrid.vue'
import SensorReadingsTable from '../components/SensorReadingsTable.vue'
import DataExportModal from '@/components/DataExportModal.vue'
import { handleDataExport } from '@/utils/exportUtils'
import { useApi } from '@/composables/useApi'
import HomeHeader from '@/components/home/HomeHeader.vue'
import SensorTrends from '@/components/home/SensorTrends.vue'
import PlantAnalysis from '@/components/home/PlantAnalysis.vue'

import {
  getSensorStatus,
  calculateParameterScore,
  getGrowthPrediction,
  getSystemStatus,
  formatCurrentTime,
} from '@/scripts'

const windowWidth = ref(window.innerWidth)
const isRefreshing = ref(false)
const trendTimeframe = ref('24h')
const showExportModal = ref(false)

function updateWindowWidth() {
  windowWidth.value = window.innerWidth
}

onMounted(() => {
  window.addEventListener('resize', updateWindowWidth)
  updateData()
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
  soilTemperature: [],
  soilMoisture: [],
  soilPH: [],
  airTemperature: [],
  airHumidity: [],
})

const { fetchSensorData, refreshData: apiRefreshData, fetchFileById } = useApi()

async function updateHistoricalData(timeframe: string) {
  trendTimeframe.value = timeframe
  isRefreshing.value = true

  try {
    try {
      const soilFileId = '13mBooyMXhDiBHtqJcwy3dcz1RsL6iXYG'
      const airFileId = '1F38HpxfKYZRj2tk0JZanTajVIEK2izkO'

      const soilResponse = await fetchFileById(soilFileId)
      const airResponse = await fetchFileById(airFileId)

      if (soilResponse && soilResponse.temperature && soilResponse.temperature.history) {
        historicalData.value.soilTemperature = soilResponse.temperature.history.map(
          (item: any) => ({
            time: new Date(item.time).toLocaleString(),
            value: item.value,
          }),
        )
      }

      if (soilResponse && soilResponse.moisture && soilResponse.moisture.history) {
        historicalData.value.soilMoisture = soilResponse.moisture.history.map((item: any) => ({
          time: new Date(item.time).toLocaleString(),
          value: item.value,
        }))
      }

      if (airResponse && airResponse.temperature && airResponse.temperature.history) {
        historicalData.value.airTemperature = airResponse.temperature.history.map((item: any) => ({
          time: new Date(item.time).toLocaleString(),
          value: item.value,
        }))
      }

      if (airResponse && airResponse.humidity && airResponse.humidity.history) {
        historicalData.value.airHumidity = airResponse.humidity.history.map((item: any) => ({
          time: new Date(item.time).toLocaleString(),
          value: item.value,
        }))
      }

      updateCurrentSensorValues(soilResponse, airResponse)
      return
    } catch (fileErr) {
      console.warn(
        'Could not fetch from file endpoints, falling back to sensors endpoint:',
        fileErr,
      )
    }

    const endDate = new Date().toISOString().split('T')[0]
    let startDate = new Date()

    if (timeframe === '7d') {
      startDate.setDate(startDate.getDate() - 7)
    } else if (timeframe === '30d') {
      startDate.setDate(startDate.getDate() - 30)
    } else {
      startDate.setDate(startDate.getDate() - 1)
    }

    const startDateStr = startDate.toISOString().split('T')[0]

    const soilParams = {
      startDate: startDateStr,
      endDate: endDate,
      sensors: ['soil_temperature', 'soil_moisture', 'soil_ph'],
    }

    const airParams = {
      startDate: startDateStr,
      endDate: endDate,
      sensors: ['air_temperature', 'air_humidity'],
    }

    const soilResponse = await apiRefreshData(
      (data) => {
        if (data && data.soil_temperature && data.soil_temperature.history) {
          historicalData.value.soilTemperature = data.soil_temperature.history.map((item: any) => ({
            time: new Date(item.time).toLocaleString(),
            value: item.value,
          }))
        }

        if (data && data.soil_moisture && data.soil_moisture.history) {
          historicalData.value.soilMoisture = data.soil_moisture.history.map((item: any) => ({
            time: new Date(item.time).toLocaleString(),
            value: item.value,
          }))
        }

        if (data && data.soil_ph && data.soil_ph.history) {
          historicalData.value.soilPH = data.soil_ph.history.map((item: any) => ({
            time: new Date(item.time).toLocaleString(),
            value: item.value,
          }))
        }
      },
      fetchSensorData,
      soilParams,
    )

    const airResponse = await apiRefreshData(
      (data) => {
        if (data && data.air_temperature && data.air_temperature.history) {
          historicalData.value.airTemperature = data.air_temperature.history.map((item: any) => ({
            time: new Date(item.time).toLocaleString(),
            value: item.value,
          }))
        }

        if (data && data.air_humidity && data.air_humidity.history) {
          historicalData.value.airHumidity = data.air_humidity.history.map((item: any) => ({
            time: new Date(item.time).toLocaleString(),
            value: item.value,
          }))
        }
      },
      fetchSensorData,
      airParams,
    )

    updateCurrentSensorValues(soilResponse, airResponse)
  } catch (err) {
    console.error('Error fetching sensor data:', err)
  } finally {
    isRefreshing.value = false
  }
}

const lastUpdate: Ref<string> = ref(formatCurrentTime({ second: '2-digit' }))

function openSensorDetails(sensorId: string) {
  console.log(`Opening details for sensor: ${sensorId}`)
}

async function updateData() {
  isRefreshing.value = true
  try {
    await updateHistoricalData(trendTimeframe.value)
    lastUpdate.value = formatCurrentTime({ second: '2-digit' })
  } catch (err) {
    console.error('Error updating data:', err)
  } finally {
    isRefreshing.value = false
  }
}

function handleExport(exportOptions: any) {
  handleDataExport(exportOptions)
}

function updateCurrentSensorValues(soilResponse: any, airResponse: any) {
  const isFileApiFormat =
    soilResponse?.temperature !== undefined || airResponse?.temperature !== undefined

  if (isFileApiFormat && soilResponse?.temperature?.history?.length > 0) {
    const latestReading =
      soilResponse.temperature.history[soilResponse.temperature.history.length - 1]
    sensorData.value.soilTemperature.value = latestReading.value
    sensorData.value.soilTemperature.unit = soilResponse.temperature.unit || '°C'
  } else if (soilResponse?.soil_temperature?.history?.length > 0) {
    const latestReading =
      soilResponse.soil_temperature.history[soilResponse.soil_temperature.history.length - 1]
    sensorData.value.soilTemperature.value = latestReading.value
    sensorData.value.soilTemperature.unit = soilResponse.soil_temperature.unit || '°C'
  }

  if (isFileApiFormat && soilResponse?.moisture?.history?.length > 0) {
    const latestReading = soilResponse.moisture.history[soilResponse.moisture.history.length - 1]
    sensorData.value.soilMoisture.value = latestReading.value
    sensorData.value.soilMoisture.unit = soilResponse.moisture.unit || '%'
  } else if (soilResponse?.soil_moisture?.history?.length > 0) {
    const latestReading =
      soilResponse.soil_moisture.history[soilResponse.soil_moisture.history.length - 1]
    sensorData.value.soilMoisture.value = latestReading.value
    sensorData.value.soilMoisture.unit = soilResponse.soil_moisture.unit || '%'
  }

  if (soilResponse?.soil_ph?.history?.length > 0) {
    const latestReading = soilResponse.soil_ph.history[soilResponse.soil_ph.history.length - 1]
    sensorData.value.soilPH.value = latestReading.value
    sensorData.value.soilPH.unit = soilResponse.soil_ph.unit || 'pH'
  }

  if (isFileApiFormat && airResponse?.temperature?.history?.length > 0) {
    const latestReading =
      airResponse.temperature.history[airResponse.temperature.history.length - 1]
    sensorData.value.airTemperature.value = latestReading.value
    sensorData.value.airTemperature.unit = airResponse.temperature.unit || '°C'
  } else if (airResponse?.air_temperature?.history?.length > 0) {
    const latestReading =
      airResponse.air_temperature.history[airResponse.air_temperature.history.length - 1]
    sensorData.value.airTemperature.value = latestReading.value
    sensorData.value.airTemperature.unit = airResponse.air_temperature.unit || '°C'
  }

  if (isFileApiFormat && airResponse?.humidity?.history?.length > 0) {
    const latestReading = airResponse.humidity.history[airResponse.humidity.history.length - 1]
    sensorData.value.airHumidity.value = latestReading.value
    sensorData.value.airHumidity.unit = airResponse.humidity.unit || '%'
  } else if (airResponse?.air_humidity?.history?.length > 0) {
    const latestReading =
      airResponse.air_humidity.history[airResponse.air_humidity.history.length - 1]
    sensorData.value.airHumidity.value = latestReading.value
    sensorData.value.airHumidity.unit = airResponse.air_humidity.unit || '%'
  }

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
</script>

<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <!-- Header Section -->
      <div class="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm mb-8">
        <div class="p-6">
          <!-- Main header layout -->
          <div class="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <!-- Left: Icon and Title -->
            <div class="flex items-start gap-4">
              <div class="flex-shrink-0">
                <div class="w-12 h-12 bg-emerald-100 dark:bg-emerald-900/30 rounded-xl flex items-center justify-center">
                  <svg class="w-6 h-6 text-emerald-600 dark:text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.5">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
                  </svg>
                </div>
              </div>

              <div>
                <h1 class="text-2xl font-semibold text-gray-900 dark:text-gray-100">
                  Environmental Dashboard
                </h1>
                <p class="text-gray-600 dark:text-gray-400 mt-1">
                  Real-time monitoring and analytics for your plant growth environment
                </p>
              </div>
            </div>

            <!-- Right: Action buttons -->
            <div class="flex items-center gap-3">
              <!-- Refresh -->
              <button
                @click="updateData"
                class="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                :class="{ 'opacity-50 cursor-not-allowed': isRefreshing }"
                :disabled="isRefreshing"
              >
                <svg
                  class="w-4 h-4"
                  :class="{ 'animate-spin': isRefreshing }"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  stroke-width="2"
                >
                  <path stroke-linecap="round" stroke-linejoin="round" d="M16.023 9.348h4.992M2.985 19.644v-4.992h4.992l-4.993 0 3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182" />
                </svg>
                {{ isRefreshing ? 'Refreshing...' : 'Refresh' }}
              </button>

              <!-- Export -->
              <button
                @click="showExportModal = true"
                class="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
                </svg>
                Export
              </button>
            </div>
          </div>

          <!-- Bottom section: Status and Stats -->
          <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pt-6 mt-6 border-t border-gray-200 dark:border-gray-700">
            <!-- Left: status -->
            <div class="flex items-center gap-4 text-sm">
              <div class="flex items-center gap-2">
                <div 
                  class="w-2 h-2 rounded-full"
                  :class="systemStatus === 'normal' ? 'bg-emerald-500' : systemStatus === 'warning' ? 'bg-amber-500' : 'bg-red-500'"
                ></div>
                <span 
                  class="font-medium"
                  :class="systemStatus === 'normal' ? 'text-emerald-600 dark:text-emerald-400' : systemStatus === 'warning' ? 'text-amber-600 dark:text-amber-400' : 'text-red-600 dark:text-red-400'"
                >
                  System {{ systemStatus === 'normal' ? 'Online' : systemStatus === 'warning' ? 'Warning' : 'Critical' }}
                </span>
              </div>
              <div class="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>Updated {{ lastUpdate }}</span>
              </div>
            </div>

            <!-- Right: Stats -->
            <div class="flex items-center gap-6">
              <div class="flex items-center gap-2">
                <div class="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                  <svg class="w-4 h-4 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <div>
                  <div class="text-lg font-semibold text-gray-900 dark:text-gray-100">6</div>
                  <div class="text-xs text-gray-500 dark:text-gray-400">Sensors</div>
                </div>
              </div>
              
              <div class="w-px h-8 bg-gray-200 dark:bg-gray-700"></div>
              
              <div class="flex items-center gap-2">
                <div class="w-8 h-8 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg flex items-center justify-center">
                  <svg class="w-4 h-4 text-emerald-600 dark:text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <div class="text-lg font-semibold text-emerald-600 dark:text-emerald-400">{{ plantHealthScore }}%</div>
                  <div class="text-xs text-gray-500 dark:text-gray-400">Health Score</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Dashboard Status Overview -->
      <div class="mb-8">
        <PlantStatusDashboard
          :sensor-data="sensorData"
          :plant-health-score="plantHealthScore"
          :growth-prediction="growthPrediction"
          :system-status="systemStatus"
        />
      </div>

      <!-- Plant Analysis Insights -->
      <div class="mb-8">
        <PlantAnalysis 
          :plant-health-score="plantHealthScore" 
          :growth-prediction="growthPrediction" 
        />
      </div>

      <!-- Sensor Readings Grid/Table -->
      <div class="mb-8">
        <SensorReadingsTable
          v-if="windowWidth >= 1024"
          :sensor-data="sensorData"
          :on-sensor-click="openSensorDetails"
          @refresh="updateData"
        />
        <SensorReadingsGrid
          v-else
          :sensor-data="sensorData"
          :on-sensor-click="openSensorDetails"
          @refresh="updateData"
        />
      </div>

      <!-- Sensor Trends -->
      <div class="mb-8">
        <SensorTrends
          :plant-health-score="plantHealthScore"
          :growth-prediction="growthPrediction"
          :trend-timeframe="trendTimeframe"
          @update-historical-data="updateHistoricalData"
        />
      </div>
    </div>

    <!-- Export Modal -->
    <DataExportModal
      :show="showExportModal"
      title="Export Dashboard Data"
      description="Select the sensors, date range, and format for your dashboard data export."
      data-type="dashboard"
      :available-sensors="[
        { id: 'soilTemperature', name: 'Soil Temperature', unit: sensorData.soilTemperature.unit },
        { id: 'soilMoisture', name: 'Soil Moisture', unit: sensorData.soilMoisture.unit },
        { id: 'soilPH', name: 'Soil pH', unit: sensorData.soilPH.unit },
        { id: 'airTemperature', name: 'Air Temperature', unit: sensorData.airTemperature.unit },
        { id: 'airHumidity', name: 'Air Humidity', unit: sensorData.airHumidity.unit },
      ]"
      @close="showExportModal = false"
      @export="handleExport"
    />
  </div>
</template>