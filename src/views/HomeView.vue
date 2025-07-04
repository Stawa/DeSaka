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

/**
 * Updates historical data based on selected timeframe
 * Implements data fetching with fallback mechanisms
 */
async function updateHistoricalData(timeframe: string) {
  trendTimeframe.value = timeframe
  isRefreshing.value = true

  try {
    // Primary data source: File API
    try {
      const soilFileId = '13mBooyMXhDiBHtqJcwy3dcz1RsL6iXYG'
      const airFileId = '1F38HpxfKYZRj2tk0JZanTajVIEK2izkO'

      const soilResponse = await fetchFileById(soilFileId)
      const airResponse = await fetchFileById(airFileId)

      // Process soil data
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

      // Process air data
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

    // Fallback: Sensors API
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

    // Process fallback data
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

// Last update timestamp for user feedback
const lastUpdate: Ref<string> = ref(formatCurrentTime({ second: '2-digit' }))

/**
 * Opens detailed sensor view (placeholder for future implementation)
 */
function openSensorDetails(sensorId: string) {
  console.log(`Opening details for sensor: ${sensorId}`)
}

/**
 * Main data refresh function
 */
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

/**
 * Export handler for data export functionality
 */
function handleExport(exportOptions: any) {
  handleDataExport(exportOptions)
}

/**
 * Updates current sensor values from API responses
 * Handles both file API and sensors API formats
 */
function updateCurrentSensorValues(soilResponse: any, airResponse: any) {
  const isFileApiFormat =
    soilResponse?.temperature !== undefined || airResponse?.temperature !== undefined

  // Update soil temperature
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

  // Update soil moisture
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

  // Update soil pH
  if (soilResponse?.soil_ph?.history?.length > 0) {
    const latestReading = soilResponse.soil_ph.history[soilResponse.soil_ph.history.length - 1]
    sensorData.value.soilPH.value = latestReading.value
    sensorData.value.soilPH.unit = soilResponse.soil_ph.unit || 'pH'
  }

  // Update air temperature
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

  // Update air humidity
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

  // Update sensor statuses based on optimal ranges
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

/**
 * Computed plant health score based on weighted sensor parameters
 */
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

/**
 * Computed growth prediction based on health score
 */
const growthPrediction = computed(() => {
  return getGrowthPrediction(plantHealthScore.value)
})

/**
 * Computed system status based on all sensor statuses
 */
const systemStatus = computed(() => {
  const statuses = Object.values(sensorData.value).map((item) => item.status)
  return getSystemStatus(statuses)
})
</script>

<template>
  <!--
    Main container with modern design system
    - Uses consistent spacing and layout patterns
    - Implements responsive design with proper breakpoints
    - Maintains visual hierarchy through structured sections
  -->
  <div class="min-h-screen bg-gray-50 dark:bg-gray-950">
    <div class="mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8">
      <!--
        Header Section
        - Consistent with sidebar/navbar design patterns
        - Responsive layout with proper spacing
        - Includes system status and last update information
      -->
      <HomeHeader :last-update="'Just now'" />

      <!--
        Dashboard Status Overview
        - Central hub for plant health monitoring
        - Uses card-based design consistent with app theme
        - Responsive grid layout for optimal viewing
      -->
      <PlantStatusDashboard
        :sensor-data="sensorData"
        :plant-health-score="plantHealthScore"
        :growth-prediction="growthPrediction"
        :system-status="systemStatus"
      />

      <!--
        Plant Analysis Insights
        - AI-powered recommendations and metrics
        - Modern card design with proper visual hierarchy
        - Responsive layout adapting to screen size
      -->
      <PlantAnalysis :plant-health-score="plantHealthScore" :growth-prediction="growthPrediction" />

      <!--
        Sensor Readings Display
        - Adaptive component selection based on screen size
        - Table view for desktop (better data density)
        - Grid view for mobile (touch-friendly)
        - Consistent styling with app theme
      -->
      <SensorReadingsTable
        v-if="windowWidth >= 1024"
        :sensor-data="sensorData"
        :on-sensor-click="openSensorDetails"
      />
      <SensorReadingsGrid v-else :sensor-data="sensorData" :on-sensor-click="openSensorDetails" />

      <!--
        Sensor Trends Analysis
        - Historical data visualization
        - Interactive timeframe selection
        - Responsive chart layouts
        - Smooth animations and transitions
      -->
      <SensorTrends
        :plant-health-score="plantHealthScore"
        :growth-prediction="growthPrediction"
        :trend-timeframe="trendTimeframe"
        @update-historical-data="updateHistoricalData"
      />
    </div>

    <!--
      Export Modal
      - Consistent modal design with app theme
      - Accessible keyboard navigation
      - Responsive layout for all screen sizes
      - Smooth enter/exit animations
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
/*
  Modern styling approach with design system consistency
  - Uses CSS custom properties for theme consistency
  - Implements smooth transitions for better UX
  - Follows accessibility guidelines for contrast and focus states
*/

/* Smooth transitions for all interactive elements */
* {
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

/* Focus states for accessibility */
button:focus,
a:focus {
  outline: 2px solid theme('colors.primary.500');
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
</style>
