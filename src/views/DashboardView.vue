<script setup lang="ts">
import { ref, onMounted, type Ref, computed, onUnmounted } from 'vue'
import PlantStatusDashboard from '../components/PlantStatusDashboard.vue'
import SensorReadingsGrid from '../components/SensorReadingsGrid.vue'
import SensorReadingsTable from '../components/SensorReadingsTable.vue'
import DataExportModal from '@/components/DataExportModal.vue'
import { handleDataExport } from '@/utils/exportUtils'
import { SENSOR_FILE_IDS, useApi, type SensorApiResponse } from '@/composables/useApi'
import HomeHeader from '@/components/home/HomeHeader.vue'
import SensorTrends from '@/components/home/SensorTrends.vue'
import PlantAnalysis from '@/components/home/PlantAnalysis.vue'

import {
  getSensorStatus,
  calculateParameterScore,
  getGrowthPrediction,
  getSystemStatus,
  formatCurrentTime,
  type SensorStatusValue,
} from '@/scripts'
import {
  mapReadableHistory,
  type Air,
  type SensorReading,
  type Soil,
  type SensorItems,
} from '@/composables/responseApi'
import { getMinMax } from '@/utils/sensorHelpers'

const windowWidth = ref(window.innerWidth)
const isRefreshing = ref(false)
const trendTimeframe = ref('24h')
const showExportModal = ref(false)
type TrendTimeframeOptions = '24h' | '7d' | '30d'

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
})

const historicalData = ref<HistoricalDataType>({
  soilTemperature: [],
  soilMoisture: [],
  soilPH: [],
  airTemperature: [],
  airHumidity: [],
})

const { refreshData: apiRefreshData, fetchFileById } = useApi()
type HistoricalKey =
  | 'soilTemperature'
  | 'soilMoisture'
  | 'soilPH'
  | 'airTemperature'
  | 'airHumidity'

async function updateHistoricalData(timeframe: string) {
  trendTimeframe.value = timeframe
  isRefreshing.value = true

  try {
    const soilFileId = SENSOR_FILE_IDS.soil
    const airFileId = SENSOR_FILE_IDS.air

    try {
      const soilResponse: Soil = await fetchFileById(soilFileId)
      const airResponse: Air = await fetchFileById(airFileId)

      const sensorMap: [HistoricalKey, SensorReading[] | undefined][] = [
        ['soilTemperature', soilResponse?.temperature?.history],
        ['soilMoisture', soilResponse?.moisture?.history],
        ['soilPH', soilResponse?.ph?.history],
        ['airTemperature', airResponse?.temperature?.history],
        ['airHumidity', airResponse?.humidity?.history],
      ]

      for (const [key, history] of sensorMap) {
        if (history) {
          historicalData.value[key] = mapReadableHistory(history)
        }
      }

      updateCurrentSensorValues(soilResponse, airResponse)
      return
    } catch (fileErr) {
      console.warn('Could not fetch from file endpoint, falling back to sensors endpoint:', fileErr)
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
      sensors: ['air_temperature', 'air_humidity', 'light_intensity'],
    }

    const fetchAirFile = async (): Promise<SensorApiResponse> => {
      return await fetchFileById(SENSOR_FILE_IDS.air)
    }

    const fetchSoilFile = async (): Promise<SensorApiResponse> => {
      return await fetchFileById(SENSOR_FILE_IDS.soil)
    }

    const soilResponse = await apiRefreshData(
      (data) => {
        if (data && data.soil_temperature && data.soil_temperature.history) {
          historicalData.value.soilTemperature = data.soil_temperature.history.map(
            (item: { time: string; value: number }) => ({
              time: new Date(item.time).toLocaleString(),
              value: item.value,
            }),
          )
        }

        if (data && data.soil_moisture && data.soil_moisture.history) {
          historicalData.value.soilMoisture = data.soil_moisture.history.map(
            (item: { time: string; value: number }) => ({
              time: new Date(item.time).toLocaleString(),
              value: item.value,
            }),
          )
        }

        if (data && data.soil_ph && data.soil_ph.history) {
          historicalData.value.soilPH = data.soil_ph.history.map(
            (item: { time: string; value: number }) => ({
              time: new Date(item.time).toLocaleString(),
              value: item.value,
            }),
          )
        }
      },
      fetchSoilFile,
      soilParams,
    )

    const airResponse = await apiRefreshData(
      (data) => {
        if (data && data.air_temperature && data.air_temperature.history) {
          historicalData.value.airTemperature = data.air_temperature.history.map(
            (item: { time: string; value: number }) => ({
              time: new Date(item.time).toLocaleString(),
              value: item.value,
            }),
          )
        }

        if (data && data.air_humidity && data.air_humidity.history) {
          historicalData.value.airHumidity = data.air_humidity.history.map(
            (item: { time: string; value: number }) => ({
              time: new Date(item.time).toLocaleString(),
              value: item.value,
            }),
          )
        }
      },
      fetchAirFile,
      airParams,
    )

    updateCurrentSensorValues(soilResponse, airResponse)
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

function handleExport(exportOptions: {
  format: 'csv' | 'json' | 'excel'
  sensors: Array<{ id: string; name?: string; unit?: string } | string>
  dateRange: { start: string | null; end: string | null }
  timeRange: { start: string; end: string }
}) {
  handleDataExport(exportOptions)
}

function updateCurrentSensorValues(
  soilResponse: Record<string, SensorItems>,
  airResponse: Record<string, SensorItems>,
) {
  if (!soilResponse && !airResponse) return

  const isFileApiFormat =
    (soilResponse && soilResponse.temperature !== undefined) ||
    (airResponse && airResponse.temperature !== undefined)

  if (isFileApiFormat && soilResponse?.temperature?.history?.length > 0) {
    const latestReading =
      soilResponse.temperature.history[soilResponse.temperature.history.length - 1]
    sensorData.value.soilTemperature.value = latestReading.value
    sensorData.value.soilTemperature.unit = soilResponse.temperature.unit || '°C'
    sensorData.value.soilTemperature.status = getSensorStatus(latestReading.value, 10, 35, 20, 28)
  } else if (soilResponse?.soil_temperature?.history?.length > 0) {
    const latestReading =
      soilResponse.soil_temperature.history[soilResponse.soil_temperature.history.length - 1]
    sensorData.value.soilTemperature.value = latestReading.value
    sensorData.value.soilTemperature.unit = soilResponse.soil_temperature.unit || '°C'
    sensorData.value.soilTemperature.status = getSensorStatus(latestReading.value, 10, 35, 20, 28)
  }

  if (isFileApiFormat && soilResponse?.moisture?.history?.length > 0) {
    const latestReading = soilResponse.moisture.history[soilResponse.moisture.history.length - 1]
    sensorData.value.soilMoisture.value = latestReading.value
    sensorData.value.soilMoisture.unit = soilResponse.moisture.unit || '%'
    sensorData.value.soilMoisture.status = getSensorStatus(latestReading.value, 20, 90, 50, 75)
  } else if (soilResponse?.soil_moisture?.history?.length > 0) {
    const latestReading =
      soilResponse.soil_moisture.history[soilResponse.soil_moisture.history.length - 1]
    sensorData.value.soilMoisture.value = latestReading.value
    sensorData.value.soilMoisture.unit = soilResponse.soil_moisture.unit || '%'
    sensorData.value.soilMoisture.status = getSensorStatus(latestReading.value, 20, 90, 50, 75)
  }

  if (isFileApiFormat && soilResponse?.ph?.history?.length > 0) {
    const latestReading = soilResponse.ph.history[soilResponse.ph.history.length - 1]
    sensorData.value.soilPH.value = latestReading.value
    sensorData.value.soilPH.unit = soilResponse.ph.unit || 'pH'
    sensorData.value.soilPH.status = getSensorStatus(latestReading.value, 4, 9, 6, 7)
  } else if (soilResponse?.soil_ph?.history?.length > 0) {
    const latestReading = soilResponse.soil_ph.history[soilResponse.soil_ph.history.length - 1]
    sensorData.value.soilPH.value = latestReading.value
    sensorData.value.soilPH.unit = soilResponse.soil_ph.unit || 'pH'
    sensorData.value.soilPH.status = getSensorStatus(latestReading.value, 4, 9, 6, 7)
  }

  if (isFileApiFormat && airResponse?.temperature?.history?.length > 0) {
    const latestReading =
      airResponse.temperature.history[airResponse.temperature.history.length - 1]
    sensorData.value.airTemperature.value = latestReading.value
    sensorData.value.airTemperature.unit = airResponse.temperature.unit || '°C'
    sensorData.value.airTemperature.status = getSensorStatus(latestReading.value, 15, 35, 20, 26)
  } else if (airResponse?.air_temperature?.history?.length > 0) {
    const latestReading =
      airResponse.air_temperature.history[airResponse.air_temperature.history.length - 1]
    sensorData.value.airTemperature.value = latestReading.value
    sensorData.value.airTemperature.unit = airResponse.air_temperature.unit || '°C'
    sensorData.value.airTemperature.status = getSensorStatus(latestReading.value, 15, 35, 20, 26)
  }

  if (isFileApiFormat && airResponse?.humidity?.history?.length > 0) {
    const latestReading = airResponse.humidity.history[airResponse.humidity.history.length - 1]
    sensorData.value.airHumidity.value = latestReading.value
    sensorData.value.airHumidity.unit = airResponse.humidity.unit || '%'
    sensorData.value.airHumidity.status = getSensorStatus(latestReading.value, 20, 80, 40, 60)
  } else if (airResponse?.air_humidity?.history?.length > 0) {
    const latestReading =
      airResponse.air_humidity.history[airResponse.air_humidity.history.length - 1]
    sensorData.value.airHumidity.value = latestReading.value
    sensorData.value.airHumidity.unit = airResponse.air_humidity.unit || '%'
    sensorData.value.airHumidity.status = getSensorStatus(latestReading.value, 20, 80, 40, 60)
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
  const soilTempValue = sensorData.value.soilTemperature.value
  const soilMoistureValue = sensorData.value.soilMoisture.value
  const soilPHValue = sensorData.value.soilPH.value
  const airTempValue = sensorData.value.airTemperature.value
  const airHumidityValue = sensorData.value.airHumidity.value

  const soilTempHistory = historicalData.value.soilTemperature
  const soilMoistureHistory = historicalData.value.soilMoisture
  const soilPHHistory = historicalData.value.soilPH
  const airTempHistory = historicalData.value.airTemperature
  const airHumidityHistory = historicalData.value.airHumidity

  const { min: soilTempMin, max: soilTempMax } = getMinMax(soilTempHistory)
  const { min: soilMoistureMin, max: soilMoistureMax } = getMinMax(soilMoistureHistory)
  const { min: soilPHMin, max: soilPHMax } = getMinMax(soilPHHistory)
  const { min: airTempMin, max: airTempMax } = getMinMax(airTempHistory)
  const { min: airHumidityMin, max: airHumidityMax } = getMinMax(airHumidityHistory)

  const soilTempScore = calculateParameterScore(soilTempValue, 22, 26, soilTempMin, soilTempMax)
  const soilMoistureScore = calculateParameterScore(
    soilMoistureValue,
    60,
    70,
    soilMoistureMin,
    soilMoistureMax,
  )
  const soilPHScore = calculateParameterScore(soilPHValue, 6.5, 7.0, soilPHMin, soilPHMax)
  const airTempScore = calculateParameterScore(airTempValue, 24, 28, airTempMin, airTempMax)
  const airHumidityScore = calculateParameterScore(
    airHumidityValue,
    65,
    75,
    airHumidityMin,
    airHumidityMax,
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
  const statuses = Object.values(sensorData.value).map((item) => item.status as SensorStatusValue)
  return getSystemStatus(statuses)
})
</script>

<template>
  <!--
    Dashboard Main Container
    - Modern design system with consistent spacing and layout patterns
    - Responsive design with proper breakpoints for all devices
    - Maintains visual hierarchy through structured sections
    - Implements accessibility best practices
  -->
  <div class="min-h-screen bg-gray-50 dark:bg-gray-950">
    <div class="mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8">
      <!--
        Dashboard Header Section
        - Consistent with application design patterns
        - Responsive layout with proper spacing
        - Includes system status and last update information
        - Provides quick access to export functionality
      -->
      <HomeHeader :last-update="lastUpdate" @export="showExportModal = true" />

      <!--
        Plant Status Overview Dashboard
        - Central hub for plant health monitoring
        - Uses card-based design consistent with app theme
        - Responsive grid layout for optimal viewing on all devices
        - Real-time status indicators with color-coded alerts
      -->
      <PlantStatusDashboard
        :sensor-data="sensorData"
        :plant-health-score="plantHealthScore"
        :growth-prediction="growthPrediction"
        :system-status="systemStatus"
      />

      <!--
        AI-Powered Plant Analysis Insights
        - Machine learning-based recommendations and metrics
        - Modern card design with proper visual hierarchy
        - Responsive layout adapting to screen size
        - Actionable insights for plant care optimization
      -->
      <PlantAnalysis :plant-health-score="plantHealthScore" :growth-prediction="growthPrediction" />

      <!--
        Adaptive Sensor Readings Display
        - Component selection based on screen size for optimal UX
        - Table view for desktop (better data density and scanning)
        - Grid view for mobile (touch-friendly interaction)
        - Consistent styling with application theme
        - Real-time data updates with visual feedback
      -->
      <SensorReadingsTable
        v-if="windowWidth >= 1024"
        :sensor-data="sensorData"
        :on-sensor-click="openSensorDetails"
      />
      <SensorReadingsGrid v-else :sensor-data="sensorData" :on-sensor-click="openSensorDetails" />

      <!--
        Historical Sensor Trends Analysis
        - Interactive data visualization with multiple timeframes
        - Responsive chart layouts with touch support
        - Smooth animations and transitions for better UX
        - Trend analysis with predictive insights
      -->
      <SensorTrends
        :plant-health-score="plantHealthScore"
        :growth-prediction="growthPrediction"
        :trend-timeframe="trendTimeframe as TrendTimeframeOptions"
        :sensor-data="sensorData"
        :historical-data="historicalData"
        @update-historical-data="updateHistoricalData"
      />
    </div>

    <!--
      Data Export Modal
      - Consistent modal design with application theme
      - Accessible keyboard navigation and screen reader support
      - Responsive layout for all screen sizes
      - Smooth enter/exit animations with proper focus management
      - Comprehensive export options for data analysis
    -->
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

<style scoped>
/**
 * Dashboard-specific styling with modern design system consistency
 * - Uses CSS custom properties for theme consistency across components
 * - Implements smooth transitions for better user experience
 * - Follows accessibility guidelines for contrast and focus states
 * - Responsive design patterns for optimal viewing on all devices
 */

/* Smooth transitions for all interactive elements */
* {
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

/* Focus states for accessibility compliance */
button:focus,
a:focus,
[tabindex]:focus {
  outline: 2px solid theme('colors.primary.500');
  outline-offset: 2px;
  border-radius: 4px;
}

/* Responsive image handling */
img {
  max-width: 100%;
  height: auto;
}

/* Smooth scrolling for better user experience */
html {
  scroll-behavior: smooth;
}

/* Custom scrollbar styling for visual consistency */
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

/* Dark mode scrollbar styling */
.dark ::-webkit-scrollbar-track {
  background: theme('colors.gray.800');
}

.dark ::-webkit-scrollbar-thumb {
  background: theme('colors.gray.600');
}

.dark ::-webkit-scrollbar-thumb:hover {
  background: theme('colors.gray.500');
}

/* Page load animation for enhanced user experience */
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

/* Apply fade-in animation to main dashboard sections */
.space-y-8 > * {
  animation: fadeInUp 0.6s ease-out;
  animation-fill-mode: both;
}

/* Staggered animation delays for visual appeal */
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

/* Accessibility: Reduced motion support */
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

/* High contrast mode support for accessibility */
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

/* Loading states for better user feedback */
.loading {
  position: relative;
  overflow: hidden;
}

.loading::after {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.4), transparent);
  animation: loading-shimmer 1.5s infinite;
}

@keyframes loading-shimmer {
  0% {
    left: -100%;
  }
  100% {
    left: 100%;
  }
}

/* Dark mode loading shimmer */
.dark .loading::after {
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.1), transparent);
}
</style>
