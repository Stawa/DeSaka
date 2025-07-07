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
import {
  mapReadableHistory,
  type Air,
  type SensorReading,
  type Soil,
} from '@/composables/responseApi'

/**
 * Dashboard View Component
 *
 * Main dashboard interface providing comprehensive environmental monitoring
 * Features:
 * - Real-time sensor data display
 * - Plant health analysis and scoring
 * - Historical trend visualization
 * - Data export functionality
 * - Responsive design for all screen sizes
 * - Automatic data refresh capabilities
 */

/**
 * Reactive state management for dashboard functionality
 */
const windowWidth = ref(window.innerWidth)
const isRefreshing = ref(false)
const trendTimeframe = ref('24h')
const showExportModal = ref(false)

/**
 * Window resize handler for responsive behavior
 */
function updateWindowWidth() {
  windowWidth.value = window.innerWidth
}

/**
 * Component lifecycle management
 */
onMounted(() => {
  window.addEventListener('resize', updateWindowWidth)
  updateData()
})

onUnmounted(() => {
  window.removeEventListener('resize', updateWindowWidth)
})

/**
 * TypeScript interfaces for type safety
 */
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

/**
 * Reactive sensor data with default values
 * Provides fallback data for initial render and error states
 */
const sensorData = ref<SensorDataType>({
  soilTemperature: { value: 24.5, unit: '°C', status: 'normal' },
  soilMoisture: { value: 65, unit: '%', status: 'normal' },
  soilPH: { value: 6.8, unit: 'pH', status: 'normal' },
  airTemperature: { value: 28.2, unit: '°C', status: 'warning' },
  airHumidity: { value: 72, unit: '%', status: 'normal' },
  lightIntensity: { value: 850, unit: 'lux', status: 'normal' },
})

/**
 * Historical data storage for trend analysis
 */
const historicalData = ref<HistoricalDataType>({
  soilTemperature: [],
  soilMoisture: [],
  soilPH: [],
  airTemperature: [],
  airHumidity: [],
})

/**
 * API composable for data fetching
 */
const { fetchSensorData, refreshData: apiRefreshData, fetchFileById } = useApi()
type HistoricalKey = 'soilTemperature' | 'soilMoisture' | 'airTemperature' | 'airHumidity'

/**
 * Updates historical data based on selected timeframe
 * Implements data fetching with fallback mechanisms for reliability
 *
 * @param timeframe - Time period for historical data ('24h', '7d', '30d')
 */
async function updateHistoricalData(timeframe: string) {
  trendTimeframe.value = timeframe
  isRefreshing.value = true

  try {
    const soilFileId = '13mBooyMXhDiBHtqJcwy3dcz1RsL6iXYG'
    const airFileId = '1F38HpxfKYZRj2tk0JZanTajVIEK2izkO'

    const soilResponse: Soil = await fetchFileById(soilFileId)
    const airResponse: Air = await fetchFileById(airFileId)

    const sensorMap: [HistoricalKey, SensorReading[] | undefined][] = [
      ['soilTemperature', soilResponse?.temperature?.history],
      ['soilMoisture', soilResponse?.moisture?.history],
      ['airTemperature', airResponse?.temperature?.history],
      ['airHumidity', airResponse?.humidity?.history],
    ]

    for (const [key, history] of sensorMap) {
      if (history) {
        historicalData.value[key] = mapReadableHistory(history)
      }
    }

    updateCurrentSensorValues(soilResponse, airResponse)
  } catch (fileErr) {
    console.warn('Could not fetch from file endpoints, falling back to sensors endpoint:', fileErr)
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
  } finally {
    isRefreshing.value = false
  }
}

/**
 * Last update timestamp for user feedback
 */
const lastUpdate: Ref<string> = ref(formatCurrentTime({ second: '2-digit' }))

/**
 * Opens detailed sensor view (placeholder for future implementation)
 *
 * @param sensorId - Unique identifier for the sensor
 */
function openSensorDetails(sensorId: string) {
  console.log(`Opening details for sensor: ${sensorId}`)
  // Future implementation: Navigate to detailed sensor view
}

/**
 * Main data refresh function
 * Coordinates all data updates and manages loading states
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
 *
 * @param exportOptions - Configuration for data export
 */
function handleExport(exportOptions: any) {
  handleDataExport(exportOptions)
}

/**
 * Updates current sensor values from API responses
 * Handles both file API and sensors API formats for maximum compatibility
 *
 * @param soilResponse - Response from soil sensors API
 * @param airResponse - Response from air sensors API
 */
function updateCurrentSensorValues(soilResponse: any, airResponse: any) {
  const isFileApiFormat =
    soilResponse?.temperature !== undefined || airResponse?.temperature !== undefined

  // Update soil temperature sensor
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

  // Update soil moisture sensor
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

  // Update soil pH sensor
  if (soilResponse?.soil_ph?.history?.length > 0) {
    const latestReading = soilResponse.soil_ph.history[soilResponse.soil_ph.history.length - 1]
    sensorData.value.soilPH.value = latestReading.value
    sensorData.value.soilPH.unit = soilResponse.soil_ph.unit || 'pH'
  }

  // Update air temperature sensor
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

  // Update air humidity sensor
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

  // Update sensor statuses based on optimal ranges for plant growth
  sensorData.value.soilTemperature.status = getSensorStatus(
    sensorData.value.soilTemperature.value,
    15, // minimum acceptable
    32, // maximum acceptable
    20, // optimal minimum
    28, // optimal maximum
  )
  sensorData.value.soilMoisture.status = getSensorStatus(
    sensorData.value.soilMoisture.value,
    30, // minimum acceptable
    85, // maximum acceptable
    40, // optimal minimum
    75, // optimal maximum
  )
  sensorData.value.soilPH.status = getSensorStatus(
    sensorData.value.soilPH.value,
    5, // minimum acceptable
    8, // maximum acceptable
    5.5, // optimal minimum
    7.5, // optimal maximum
  )
  sensorData.value.airTemperature.status = getSensorStatus(
    sensorData.value.airTemperature.value,
    15, // minimum acceptable
    35, // maximum acceptable
    20, // optimal minimum
    30, // optimal maximum
  )
  sensorData.value.airHumidity.status = getSensorStatus(
    sensorData.value.airHumidity.value,
    30, // minimum acceptable
    90, // maximum acceptable
    40, // optimal minimum
    80, // optimal maximum
  )

  lastUpdate.value = formatCurrentTime({ second: '2-digit' })
}

/**
 * Computed plant health score based on weighted sensor parameters
 * Uses scientific ranges for optimal plant growth conditions
 */
const plantHealthScore = computed(() => {
  const soilTempScore = calculateParameterScore(
    sensorData.value.soilTemperature.value,
    22, // optimal minimum
    26, // optimal maximum
    15, // acceptable minimum
    32, // acceptable maximum
  )
  const soilMoistureScore = calculateParameterScore(
    sensorData.value.soilMoisture.value,
    60, // optimal minimum
    70, // optimal maximum
    30, // acceptable minimum
    85, // acceptable maximum
  )
  const soilPHScore = calculateParameterScore(
    sensorData.value.soilPH.value,
    6.5, // optimal minimum
    7.0, // optimal maximum
    5.0, // acceptable minimum
    8.0, // acceptable maximum
  )
  const airTempScore = calculateParameterScore(
    sensorData.value.airTemperature.value,
    24, // optimal minimum
    28, // optimal maximum
    15, // acceptable minimum
    35, // acceptable maximum
  )
  const airHumidityScore = calculateParameterScore(
    sensorData.value.airHumidity.value,
    65, // optimal minimum
    75, // optimal maximum
    30, // acceptable minimum
    90, // acceptable maximum
  )

  // Weighted calculation based on parameter importance for plant health
  const totalScore =
    soilTempScore * 0.2 + // 20% weight - soil temperature
    soilMoistureScore * 0.3 + // 30% weight - soil moisture (most critical)
    soilPHScore * 0.2 + // 20% weight - soil pH
    airTempScore * 0.15 + // 15% weight - air temperature
    airHumidityScore * 0.15 // 15% weight - air humidity

  return Math.round(totalScore)
})

/**
 * Computed growth prediction based on health score
 * Provides actionable insights for plant care
 */
const growthPrediction = computed(() => {
  return getGrowthPrediction(plantHealthScore.value)
})

/**
 * Computed system status based on all sensor statuses
 * Provides overall system health indicator
 */
const systemStatus = computed(() => {
  const statuses = Object.values(sensorData.value).map((item) => item.status)
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
        :trend-timeframe="trendTimeframe"
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
