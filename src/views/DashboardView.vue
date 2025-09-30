<script setup lang="ts">
import { ref, onMounted, type Ref, computed, onUnmounted } from 'vue'
import SensorReadingsGrid from '../components/SensorReadingsGrid.vue'
import SensorReadingsTable from '../components/SensorReadingsTable.vue'
import DataExportModal from '@/components/DataExportModal.vue'
import { handleDataExport } from '@/utils/exportUtils'
import { SENSOR_FILE_IDS, useApi } from '@/composables/useApi'
import HomeHeader from '@/components/home/HomeHeader.vue'
import SensorTrends from '@/components/home/SensorTrends.vue'
import PlantAnalysis from '@/components/home/PlantAnalysis.vue'

import {
  getSensorStatus,
  calculateParameterScore,
  getGrowthPrediction,
  formatReadableDateTime,
} from '@/scripts'
import {
  mapReadableHistory,
  type Air,
  type SensorReading,
  type Soil,
  type Settings,
  type Uptime,
  type SystemLogs,
  type HistoricalDataType,
  type SensorDataType,
} from '@/composables/responseApi'
import { getMinMax } from '@/utils/sensorHelpers'
import SystemStatus from '@/components/SystemStatus.vue'

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

const sensorData = ref<SensorDataType>({
  soilTemperature: { value: 0, unit: '°C', status: 'normal', time: '' },
  soilMoisture: { value: 0, unit: '%', status: 'normal', time: '' },
  soilPH: { value: 0, unit: 'pH', status: 'normal', time: '' },
  airTemperature: { value: 0, unit: '°C', status: 'warning', time: '' },
  airHumidity: { value: 0, unit: '%', status: 'normal', time: '' },
})

const SettingsResponse = ref<Settings>({
  general: {
    dataRefreshInterval: 0,
    dataRetentionPeriod: 0,
    timezone: '',
    dateFormat: '',
    timeFormat: '',
  },
  notifications: {
    emailEnabled: false,
    smsEnabled: false,
    pushEnabled: false,
    emails: [],
    phones: [],
  },
  thresholds: {
    soilTemperature: {
      min: 0,
      max: 0,
    },
    soilMoisture: {
      min: 0,
      max: 0,
    },
    soilPH: {
      min: 0,
      max: 0,
    },
    airTemperature: {
      min: 0,
      max: 0,
    },
    airHumidity: {
      min: 0,
      max: 0,
    },
  },
})
const LogsResponse = ref<SystemLogs | null>(null)

const historicalData = ref<HistoricalDataType>({
  soilTemperature: [],
  soilMoisture: [],
  soilPH: [],
  airTemperature: [],
  airHumidity: [],
})

const lastUpdate: Ref<string> = ref('Loading...')
const uptime: Ref<number> = ref(0)
const totalSensor: Ref<number> = ref(0)
const isUp: Ref<boolean> = ref(false)

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

  const soilFileId = SENSOR_FILE_IDS.soil
  const airFileId = SENSOR_FILE_IDS.air
  const settingsFileId = SENSOR_FILE_IDS.settings
  const uptimeFileId = SENSOR_FILE_IDS.uptime
  const logsFileId = SENSOR_FILE_IDS.logs
  const settingsResponse: Settings = await fetchFileById(settingsFileId)
  const logsResponse: SystemLogs = await fetchFileById(logsFileId)
  const uptimeResponse: Uptime = await fetchFileById(uptimeFileId)

  uptime.value = uptimeResponse.uptimePercent
  SettingsResponse.value = settingsResponse
  LogsResponse.value = logsResponse
  isUp.value = uptimeResponse.isUp

  try {
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

    const fetchAirFile = async (): Promise<Air> => {
      return await fetchFileById(SENSOR_FILE_IDS.air)
    }

    const fetchSoilFile = async (): Promise<Soil> => {
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
    totalSensor.value = Object.keys(sensorData.value).length
    lastUpdate.value = formatReadableDateTime(sensorData.value.airHumidity.time)
  }
}

function openSensorDetails(sensorId: string) {
  console.log(`Opening details for sensor: ${sensorId}`)
}

async function updateData() {
  isRefreshing.value = true
  try {
    await updateHistoricalData(trendTimeframe.value)
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
  timeRange?: { start: string; end: string }
  dataType?: string
  exportData?: Record<string, { timestamp: string; value: number }[]>
  sensorInfo?: Record<string, { name: string; unit: string }>
}) {
  handleDataExport(
    {
      format: exportOptions.format,
      sensors: exportOptions.sensors,
      dateRange: exportOptions.dateRange,
      timeRange: exportOptions.timeRange || {
        start: exportOptions.dateRange.start || '',
        end: exportOptions.dateRange.end || '',
      },
    },
    exportOptions.exportData,
    exportOptions.sensorInfo,
  )
}

function updateCurrentSensorValues(soilResponse: Soil, airResponse: Air) {
  if (!soilResponse && !airResponse) return
  if (!SettingsResponse.value) return

  const thresholds = SettingsResponse.value.thresholds

  if (soilResponse?.temperature?.history?.length > 0) {
    const latestReading =
      soilResponse.temperature.history[soilResponse.temperature.history.length - 1]
    sensorData.value.soilTemperature.value = latestReading.value
    sensorData.value.soilTemperature.unit = soilResponse.temperature.unit || '°C'
    sensorData.value.soilTemperature.status = getSensorStatus(
      latestReading.value,
      thresholds.soilTemperature.min - 5,
      thresholds.soilTemperature.max + 5,
      thresholds.soilTemperature.min,
      thresholds.soilTemperature.max,
    )
    sensorData.value.soilTemperature.time = latestReading.time
  }

  if (soilResponse?.moisture?.history?.length > 0) {
    const latestReading = soilResponse.moisture.history[soilResponse.moisture.history.length - 1]
    sensorData.value.soilMoisture.value = latestReading.value
    sensorData.value.soilMoisture.unit = soilResponse.moisture.unit || '%'
    sensorData.value.soilMoisture.status = getSensorStatus(
      latestReading.value,
      thresholds.soilMoisture.min - 5,
      thresholds.soilMoisture.max + 5,
      thresholds.soilMoisture.min,
      thresholds.soilMoisture.max,
    )
    sensorData.value.soilMoisture.time = latestReading.time
  }

  if (soilResponse?.ph?.history?.length > 0) {
    const latestReading = soilResponse.ph.history[soilResponse.ph.history.length - 1]
    sensorData.value.soilPH.value = latestReading.value
    sensorData.value.soilPH.unit = soilResponse.ph.unit || 'pH'
    sensorData.value.soilPH.status = getSensorStatus(
      latestReading.value,
      thresholds.soilPH.min - 5,
      thresholds.soilPH.max + 5,
      thresholds.soilPH.min,
      thresholds.soilPH.max,
    )
    sensorData.value.soilPH.time = latestReading.time
  }

  if (airResponse?.temperature?.history?.length > 0) {
    const latestReading =
      airResponse.temperature.history[airResponse.temperature.history.length - 1]
    sensorData.value.airTemperature.value = latestReading.value
    sensorData.value.airTemperature.unit = airResponse.temperature.unit || '°C'
    sensorData.value.airTemperature.status = getSensorStatus(
      latestReading.value,
      thresholds.airTemperature.min - 5,
      thresholds.airTemperature.max + 5,
      thresholds.airTemperature.min,
      thresholds.airTemperature.max,
    )
    sensorData.value.airTemperature.time = latestReading.time
  }

  if (airResponse?.humidity?.history?.length > 0) {
    const latestReading = airResponse.humidity.history[airResponse.humidity.history.length - 1]
    sensorData.value.airHumidity.value = latestReading.value
    sensorData.value.airHumidity.unit = airResponse.humidity.unit || '%'
    sensorData.value.airHumidity.status = getSensorStatus(
      latestReading.value,
      thresholds.airHumidity.min - 5,
      thresholds.airHumidity.max + 5,
      thresholds.airHumidity.min,
      thresholds.airHumidity.max,
    )
    sensorData.value.airHumidity.time = latestReading.time
  }
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

  if (!SettingsResponse.value) return 0
  const thresholds = SettingsResponse.value.thresholds

  const { min: soilTempMin, max: soilTempMax } = getMinMax(soilTempHistory)
  const { min: soilMoistureMin, max: soilMoistureMax } = getMinMax(soilMoistureHistory)
  const { min: soilPHMin, max: soilPHMax } = getMinMax(soilPHHistory)
  const { min: airTempMin, max: airTempMax } = getMinMax(airTempHistory)
  const { min: airHumidityMin, max: airHumidityMax } = getMinMax(airHumidityHistory)

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
  const airTempScore = calculateParameterScore(
    airTempValue,
    thresholds.airTemperature.min,
    thresholds.airTemperature.max,
    airTempMin,
    airTempMax,
  )
  const airHumidityScore = calculateParameterScore(
    airHumidityValue,
    thresholds.airHumidity.min,
    thresholds.airHumidity.max,
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
      <HomeHeader
        :last-update="lastUpdate"
        :uptime="uptime"
        :total-sensor="totalSensor"
        :isUp="isUp"
        :is-refreshing="isRefreshing"
        @export="showExportModal = true"
        @refresh="updateData"
      />

      <!--
        Plant Status Overview Dashboard
        - Central hub for plant health monitoring
        - Uses card-based design consistent with app theme
        - Responsive grid layout for optimal viewing on all devices
        - Real-time status indicators with color-coded alerts
      -->
      <SystemStatus :sensor-data="sensorData" />

      <!--
        AI-Powered Plant Analysis Insights
        - Machine learning-based recommendations and metrics
        - Modern card design with proper visual hierarchy
        - Responsive layout adapting to screen size
        - Actionable insights for plant care optimization
      -->
      <PlantAnalysis
        :plant-health-score="plantHealthScore"
        :growth-prediction="growthPrediction"
        :logs="LogsResponse?.logs ?? []"
        :sensor-data="sensorData"
        :settings="SettingsResponse"
      />

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
      :sensor-data="historicalData"
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
