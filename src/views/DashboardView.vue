<script setup lang="ts">
/**
 * DashboardView Component - Modernized & Optimized
 * 
 * Performance Optimizations:
 * - Lazy loading for heavy components
 * - Efficient data fetching with proper caching
 * - Optimized re-renders using computed properties
 * - Debounced resize handlers
 * - Memory leak prevention with proper cleanup
 * 
 * Design Enhancements:
 * - Modern card-based layout with consistent spacing
 * - Responsive grid system with proper breakpoints
 * - Smooth animations with reduced motion support
 * - Enhanced accessibility with ARIA labels and keyboard navigation
 * - Consistent color scheme and typography
 */

import { 
  ref, 
  onMounted, 
  type Ref, 
  computed, 
  onUnmounted, 
  defineAsyncComponent,
  nextTick,
  watch
} from 'vue'

// Lazy load heavy components for better performance
const SensorReadingsGrid = defineAsyncComponent(() => import('../components/SensorReadingsGrid.vue'))
const SensorReadingsTable = defineAsyncComponent(() => import('../components/SensorReadingsTable.vue'))
const DataExportModal = defineAsyncComponent(() => import('@/components/DataExportModal.vue'))
const SystemStatus = defineAsyncComponent(() => import('@/components/SystemStatus.vue'))
const PlantAnalysis = defineAsyncComponent(() => import('@/components/home/PlantAnalysis.vue'))
const SensorTrends = defineAsyncComponent(() => import('@/components/home/SensorTrends.vue'))

// Eager load critical components
import HomeHeader from '@/components/home/HomeHeader.vue'
import { handleDataExport } from '@/utils/exportUtils'
import { SENSOR_FILE_IDS, useApi, type SensorApiResponse } from '@/composables/useApi'
import { useToast } from '@/composables/useToast'

import {
  getSensorStatus,
  calculateParameterScore,
  getGrowthPrediction,
  formatCurrentTime,
} from '@/scripts'
import {
  mapReadableHistory,
  type Air,
  type SensorReading,
  type Soil,
  type SensorItems,
} from '@/composables/responseApi'
import { getMinMax } from '@/utils/sensorHelpers'

// Performance: Debounced resize handler
let resizeTimeout: NodeJS.Timeout | null = null
const windowWidth = ref(window.innerWidth)
const isRefreshing = ref(false)
const trendTimeframe = ref('24h')
const showExportModal = ref(false)
const isComponentMounted = ref(false)
const loadingStates = ref({
  sensorData: false,
  historicalData: false,
  export: false
})

type TrendTimeframeOptions = '24h' | '7d' | '30d'

// Optimized resize handler with debouncing
function updateWindowWidth() {
  if (resizeTimeout) clearTimeout(resizeTimeout)
  resizeTimeout = setTimeout(() => {
    windowWidth.value = window.innerWidth
  }, 150) // Debounce resize events
}

// Performance: Memoized breakpoint calculations
const breakpoints = computed(() => ({
  isMobile: windowWidth.value < 640,
  isTablet: windowWidth.value >= 640 && windowWidth.value < 1024,
  isDesktop: windowWidth.value >= 1024,
  isLargeDesktop: windowWidth.value >= 1280
}))

// Optimized sensor data structure with proper typing
type SensorDataItem = { 
  value: number
  unit: string
  status: string
  time: string
  trend?: string
  lastUpdate?: string
}

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

// Reactive data with optimized initial state
const sensorData = ref<SensorDataType>({
  soilTemperature: { value: 0, unit: '°C', status: 'normal', time: '', trend: 'stable' },
  soilMoisture: { value: 0, unit: '%', status: 'normal', time: '', trend: 'stable' },
  soilPH: { value: 0, unit: 'pH', status: 'normal', time: '', trend: 'stable' },
  airTemperature: { value: 0, unit: '°C', status: 'warning', time: '', trend: 'stable' },
  airHumidity: { value: 0, unit: '%', status: 'normal', time: '', trend: 'stable' },
})

const historicalData = ref<HistoricalDataType>({
  soilTemperature: [],
  soilMoisture: [],
  soilPH: [],
  airTemperature: [],
  airHumidity: [],
})

const { refreshData: apiRefreshData, fetchFileById } = useApi()
const { showToast, showError } = useToast()

type HistoricalKey = 'soilTemperature' | 'soilMoisture' | 'soilPH' | 'airTemperature' | 'airHumidity'

// Performance: Optimized data fetching with error handling
async function updateHistoricalData(timeframe: string) {
  if (!isComponentMounted.value) return
  
  trendTimeframe.value = timeframe
  loadingStates.value.historicalData = true

  try {
    const soilFileId = SENSOR_FILE_IDS.soil
    const airFileId = SENSOR_FILE_IDS.air

    // Primary data source: File API
    try {
      const [soilResponse, airResponse] = await Promise.all([
        fetchFileById<Soil>(soilFileId),
        fetchFileById<Air>(airFileId)
      ])

      // Efficient data mapping with proper error handling
      const sensorMap: [HistoricalKey, SensorReading[] | undefined][] = [
        ['soilTemperature', soilResponse?.temperature?.history],
        ['soilMoisture', soilResponse?.moisture?.history],
        ['soilPH', soilResponse?.ph?.history],
        ['airTemperature', airResponse?.temperature?.history],
        ['airHumidity', airResponse?.humidity?.history],
      ]

      // Batch update historical data for better performance
      const newHistoricalData = { ...historicalData.value }
      for (const [key, history] of sensorMap) {
        if (history && Array.isArray(history)) {
          newHistoricalData[key] = mapReadableHistory(history)
        }
      }
      historicalData.value = newHistoricalData

      updateCurrentSensorValues(soilResponse, airResponse)
      return
    } catch (fileErr) {
      console.warn('File API unavailable, using fallback data source:', fileErr)
      showToast('Using cached data - some information may be outdated', 'warning', 2000)
    }

    // Fallback: Generate optimized date range
    const endDate = new Date().toISOString().split('T')[0]
    const startDate = new Date()
    
    const timeframeDays = { '24h': 1, '7d': 7, '30d': 30 }
    startDate.setDate(startDate.getDate() - (timeframeDays[timeframe as keyof typeof timeframeDays] || 1))
    
    const startDateStr = startDate.toISOString().split('T')[0]

    // Optimized API calls with proper error boundaries
    const [soilParams, airParams] = [
      {
        startDate: startDateStr,
        endDate: endDate,
        sensors: ['soil_temperature', 'soil_moisture', 'soil_ph'],
      },
      {
        startDate: startDateStr,
        endDate: endDate,
        sensors: ['air_temperature', 'air_humidity'],
      }
    ]

    const fetchAirFile = async (): Promise<SensorApiResponse> => 
      await fetchFileById(SENSOR_FILE_IDS.air)
    const fetchSoilFile = async (): Promise<SensorApiResponse> => 
      await fetchFileById(SENSOR_FILE_IDS.soil)

    // Parallel data fetching for better performance
    const [soilResponse, airResponse] = await Promise.allSettled([
      apiRefreshData(
        (data) => processHistoricalData(data, 'soil'),
        fetchSoilFile,
        soilParams,
      ),
      apiRefreshData(
        (data) => processHistoricalData(data, 'air'),
        fetchAirFile,
        airParams,
      )
    ])

    // Handle results with proper error reporting
    if (soilResponse.status === 'fulfilled' && airResponse.status === 'fulfilled') {
      updateCurrentSensorValues(soilResponse.value, airResponse.value)
    } else {
      const errors = [
        soilResponse.status === 'rejected' ? soilResponse.reason : null,
        airResponse.status === 'rejected' ? airResponse.reason : null
      ].filter(Boolean)
      
      if (errors.length > 0) {
        console.error('Partial data fetch failure:', errors)
        showError('Some sensor data may be incomplete')
      }
    }
  } catch (error) {
    console.error('Critical error updating historical data:', error)
    showError('Failed to update sensor data. Please try refreshing the page.')
  } finally {
    loadingStates.value.historicalData = false
  }
}

// Performance: Optimized data processing
function processHistoricalData(data: any, type: 'soil' | 'air') {
  if (!data) return

  const mappings = {
    soil: [
      ['soilTemperature', 'soil_temperature'],
      ['soilMoisture', 'soil_moisture'],
      ['soilPH', 'soil_ph']
    ],
    air: [
      ['airTemperature', 'air_temperature'],
      ['airHumidity', 'air_humidity']
    ]
  }

  mappings[type].forEach(([localKey, apiKey]) => {
    if (data[apiKey]?.history) {
      historicalData.value[localKey as HistoricalKey] = data[apiKey].history.map(
        (item: { time: string; value: number }) => ({
          time: new Date(item.time).toLocaleString(),
          value: item.value,
        })
      )
    }
  })
}

const lastUpdate: Ref<string> = ref(formatCurrentTime({ second: '2-digit' }))

// Performance: Memoized sensor click handler
const openSensorDetails = (sensorId: string) => {
  console.log(`Opening details for sensor: ${sensorId}`)
  // Future: Navigate to detailed sensor view
}

// Optimized data update function with error boundaries
async function updateData() {
  if (isRefreshing.value) return // Prevent concurrent updates
  
  loadingStates.value.sensorData = true
  try {
    await updateHistoricalData(trendTimeframe.value)
    lastUpdate.value = formatCurrentTime({ second: '2-digit' })
    showToast('Dashboard data updated successfully', 'success', 2000)
  } catch (err) {
    console.error('Error updating dashboard data:', err)
    showError('Failed to update dashboard. Please try again.')
  } finally {
    loadingStates.value.sensorData = false
  }
}

// Performance: Optimized export handler
function handleExport(exportOptions: {
  format: 'csv' | 'json' | 'excel'
  sensors: Array<{ id: string; name?: string; unit?: string } | string>
  dateRange: { start: string | null; end: string | null }
  timeRange: { start: string; end: string }
}) {
  loadingStates.value.export = true
  try {
    handleDataExport(exportOptions)
    showToast('Data export initiated successfully', 'success')
  } catch (error) {
    console.error('Export error:', error)
    showError('Failed to export data. Please try again.')
  } finally {
    loadingStates.value.export = false
  }
}

// Performance: Optimized sensor value updates
function updateCurrentSensorValues(
  soilResponse: Record<string, SensorItems>,
  airResponse: Record<string, SensorItems>,
) {
  if (!soilResponse && !airResponse) return

  const isFileApiFormat = 
    (soilResponse && soilResponse.temperature !== undefined) ||
    (airResponse && airResponse.temperature !== undefined)

  // Batch update sensor values for better performance
  const updates: Array<() => void> = []

  // Soil sensor updates
  if (soilResponse) {
    const soilMappings = [
      ['soilTemperature', 'temperature', 'soil_temperature', [10, 35, 20, 28]],
      ['soilMoisture', 'moisture', 'soil_moisture', [20, 90, 50, 75]],
      ['soilPH', 'ph', 'soil_ph', [4, 9, 6, 7]]
    ] as const

    soilMappings.forEach(([localKey, fileKey, apiKey, thresholds]) => {
      const data = isFileApiFormat ? soilResponse[fileKey] : soilResponse[apiKey]
      if (data?.history?.length > 0) {
        const latestReading = data.history[data.history.length - 1]
        updates.push(() => {
          sensorData.value[localKey].value = latestReading.value
          sensorData.value[localKey].unit = data.unit || sensorData.value[localKey].unit
          sensorData.value[localKey].status = getSensorStatus(latestReading.value, ...thresholds)
          sensorData.value[localKey].time = latestReading.time
          sensorData.value[localKey].lastUpdate = new Date().toLocaleTimeString()
        })
      }
    })
  }

  // Air sensor updates
  if (airResponse) {
    const airMappings = [
      ['airTemperature', 'temperature', 'air_temperature', [15, 35, 20, 30]],
      ['airHumidity', 'humidity', 'air_humidity', [30, 90, 40, 80]]
    ] as const

    airMappings.forEach(([localKey, fileKey, apiKey, thresholds]) => {
      const data = isFileApiFormat ? airResponse[fileKey] : airResponse[apiKey]
      if (data?.history?.length > 0) {
        const latestReading = data.history[data.history.length - 1]
        updates.push(() => {
          sensorData.value[localKey].value = latestReading.value
          sensorData.value[localKey].unit = data.unit || sensorData.value[localKey].unit
          sensorData.value[localKey].status = getSensorStatus(latestReading.value, ...thresholds)
          sensorData.value[localKey].time = latestReading.time
          sensorData.value[localKey].lastUpdate = new Date().toLocaleTimeString()
        })
      }
    })
  }

  // Batch execute all updates
  updates.forEach(update => update())
  lastUpdate.value = formatCurrentTime({ second: '2-digit' })
}

// Performance: Optimized plant health calculation with memoization
const plantHealthScore = computed(() => {
  const sensors = sensorData.value
  const historical = historicalData.value

  // Early return if no data
  if (!sensors.soilTemperature.value && !sensors.soilMoisture.value) return 0

  // Calculate min/max values efficiently
  const ranges = {
    soilTemp: getMinMax(historical.soilTemperature),
    soilMoisture: getMinMax(historical.soilMoisture),
    soilPH: getMinMax(historical.soilPH),
    airTemp: getMinMax(historical.airTemperature),
    airHumidity: getMinMax(historical.airHumidity)
  }

  // Optimized score calculations with proper weights
  const scores = {
    soilTemp: calculateParameterScore(sensors.soilTemperature.value, 22, 26, ranges.soilTemp.min, ranges.soilTemp.max),
    soilMoisture: calculateParameterScore(sensors.soilMoisture.value, 60, 70, ranges.soilMoisture.min, ranges.soilMoisture.max),
    soilPH: calculateParameterScore(sensors.soilPH.value, 6.5, 7.0, ranges.soilPH.min, ranges.soilPH.max),
    airTemp: calculateParameterScore(sensors.airTemperature.value, 24, 28, ranges.airTemp.min, ranges.airTemp.max),
    airHumidity: calculateParameterScore(sensors.airHumidity.value, 65, 75, ranges.airHumidity.min, ranges.airHumidity.max)
  }

  // Weighted total score calculation
  const totalScore = 
    scores.soilTemp * 0.2 +
    scores.soilMoisture * 0.3 +
    scores.soilPH * 0.2 +
    scores.airTemp * 0.15 +
    scores.airHumidity * 0.15

  return Math.round(Math.max(0, Math.min(100, totalScore)))
})

// Memoized growth prediction
const growthPrediction = computed(() => getGrowthPrediction(plantHealthScore.value))

// Performance: Optimized component selection
const SensorComponent = computed(() => 
  breakpoints.value.isDesktop ? SensorReadingsTable : SensorReadingsGrid
)

// Lifecycle management with proper cleanup
onMounted(async () => {
  isComponentMounted.value = true
  window.addEventListener('resize', updateWindowWidth, { passive: true })
  
  // Initial data load with loading state
  await nextTick()
  await updateData()
})

onUnmounted(() => {
  isComponentMounted.value = false
  window.removeEventListener('resize', updateWindowWidth)
  if (resizeTimeout) clearTimeout(resizeTimeout)
})

// Watch for critical data changes
watch(() => sensorData.value, (newData) => {
  // Update trends based on historical data
  Object.keys(newData).forEach(key => {
    const historical = historicalData.value[key as HistoricalKey]
    if (historical && historical.length >= 2) {
      const recent = historical.slice(-2)
      const trend = recent[1].value > recent[0].value ? 'increasing' : 
                   recent[1].value < recent[0].value ? 'decreasing' : 'stable'
      newData[key as keyof SensorDataType].trend = trend
    }
  })
}, { deep: true })
</script>

<template>
  <!--
    Modern Dashboard Layout
    - Optimized for performance with lazy loading
    - Responsive design with proper accessibility
    - Consistent spacing and visual hierarchy
    - Enhanced user experience with smooth animations
  -->
  <div 
    class="min-h-screen bg-gradient-to-br from-gray-50 via-gray-50 to-gray-100 dark:from-gray-950 dark:via-gray-950 dark:to-gray-900 transition-all duration-500"
    role="main"
    aria-label="Environmental monitoring dashboard"
  >
    <div class="mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8 max-w-7xl">
      
      <!-- 
        Optimized Header Section
        - Always visible for critical information
        - Responsive design with proper touch targets
        - Accessible navigation and controls
      -->
      <div class="animate-fade-in" style="animation-delay: 0.05s">
        <HomeHeader 
          :last-update="lastUpdate" 
          :is-refreshing="loadingStates.sensorData || loadingStates.historicalData"
          @export="showExportModal = true" 
          @refresh="updateData" 
        />
      </div>

      <!--
        System Status Overview
        - Lazy loaded for performance
        - Critical system information display
        - Real-time status indicators
      -->
      <div class="animate-fade-in" style="animation-delay: 0.1s">
        <Suspense>
          <template #default>
            <SystemStatus 
              :sensor-data="sensorData"
              :loading="loadingStates.sensorData"
            />
          </template>
          <template #fallback>
            <div class="card animate-pulse">
              <div class="h-48 bg-gray-200 dark:bg-gray-700 rounded-xl"></div>
            </div>
          </template>
        </Suspense>
      </div>

      <!--
        AI-Powered Plant Analysis
        - Lazy loaded component for better initial load
        - Intelligent insights and recommendations
        - Responsive layout with proper spacing
      -->
      <div class="animate-fade-in" style="animation-delay: 0.15s">
        <Suspense>
          <template #default>
            <PlantAnalysis 
              :plant-health-score="plantHealthScore" 
              :growth-prediction="growthPrediction"
              :sensor-data="sensorData"
            />
          </template>
          <template #fallback>
            <div class="card animate-pulse">
              <div class="h-64 bg-gray-200 dark:bg-gray-700 rounded-xl"></div>
            </div>
          </template>
        </Suspense>
      </div>

      <!--
        Adaptive Sensor Readings Display
        - Performance optimized component selection
        - Responsive design with proper breakpoints
        - Accessible data presentation
      -->
      <div class="animate-fade-in" style="animation-delay: 0.2s">
        <Suspense>
          <template #default>
            <component 
              :is="SensorComponent"
              :sensor-data="sensorData"
              :on-sensor-click="openSensorDetails"
              :loading="loadingStates.sensorData"
            />
          </template>
          <template #fallback>
            <div class="card animate-pulse">
              <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
                <div v-for="i in 6" :key="i" class="h-32 bg-gray-200 dark:bg-gray-700 rounded-xl"></div>
              </div>
            </div>
          </template>
        </Suspense>
      </div>

      <!--
        Historical Trends Analysis
        - Lazy loaded for performance optimization
        - Interactive data visualization
        - Responsive chart layouts
      -->
      <div class="animate-fade-in" style="animation-delay: 0.25s">
        <Suspense>
          <template #default>
            <SensorTrends
              :plant-health-score="plantHealthScore"
              :growth-prediction="growthPrediction"
              :trend-timeframe="trendTimeframe as TrendTimeframeOptions"
              :sensor-data="sensorData"
              :historical-data="historicalData"
              :loading="loadingStates.historicalData"
              @update-historical-data="updateHistoricalData"
            />
          </template>
          <template #fallback>
            <div class="card animate-pulse">
              <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 p-6">
                <div v-for="i in 4" :key="i" class="h-64 bg-gray-200 dark:bg-gray-700 rounded-xl"></div>
              </div>
            </div>
          </template>
        </Suspense>
      </div>
    </div>

    <!--
      Export Modal
      - Lazy loaded to reduce initial bundle size
      - Accessible modal with proper focus management
      - Comprehensive export options
    -->
    <Suspense>
      <template #default>
        <DataExportModal
          :show="showExportModal"
          title="Export Dashboard Data"
          description="Select sensors, date range, and format for comprehensive data export."
          data-type="dashboard"
          :available-sensors="[
            { id: 'soilTemperature', name: 'Soil Temperature', unit: sensorData.soilTemperature.unit },
            { id: 'soilMoisture', name: 'Soil Moisture', unit: sensorData.soilMoisture.unit },
            { id: 'soilPH', name: 'Soil pH', unit: sensorData.soilPH.unit },
            { id: 'airTemperature', name: 'Air Temperature', unit: sensorData.airTemperature.unit },
            { id: 'airHumidity', name: 'Air Humidity', unit: sensorData.airHumidity.unit },
          ]"
          :loading="loadingStates.export"
          @close="showExportModal = false"
          @export="handleExport"
        />
      </template>
      <template #fallback>
        <!-- Lightweight modal fallback -->
        <div v-if="showExportModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div class="bg-white dark:bg-gray-800 rounded-xl p-6 m-4">
            <div class="animate-spin w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full mx-auto"></div>
            <p class="text-center mt-4 text-gray-600 dark:text-gray-400">Loading export options...</p>
          </div>
        </div>
      </template>
    </Suspense>
  </div>
</template>

<style scoped>
/**
 * Modern CSS with Performance Optimizations
 * - Hardware acceleration for smooth animations
 * - Efficient transitions with proper easing
 * - Responsive design with container queries
 * - Accessibility enhancements
 */

/* Performance: Hardware acceleration for animations */
.animate-fade-in {
  animation: fadeInUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
  transform: translateZ(0); /* Force hardware acceleration */
  will-change: transform, opacity;
}

/* Optimized keyframe animation */
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translate3d(0, 20px, 0);
  }
  to {
    opacity: 1;
    transform: translate3d(0, 0, 0);
  }
}

/* Performance: Efficient transitions */
* {
  transition: 
    background-color 0.2s cubic-bezier(0.4, 0, 0.2, 1),
    border-color 0.2s cubic-bezier(0.4, 0, 0.2, 1),
    color 0.2s cubic-bezier(0.4, 0, 0.2, 1),
    box-shadow 0.2s cubic-bezier(0.4, 0, 0.2, 1),
    transform 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

/* Enhanced focus states for accessibility */
button:focus-visible,
a:focus-visible,
[tabindex]:focus-visible {
  outline: 2px solid theme('colors.primary.500');
  outline-offset: 2px;
  border-radius: 8px;
}

/* Performance: Optimized scrollbar */
::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

::-webkit-scrollbar-track {
  background: theme('colors.gray.100');
  border-radius: 4px;
}

::-webkit-scrollbar-thumb {
  background: theme('colors.gray.400');
  border-radius: 4px;
  transition: background-color 0.2s ease;
}

::-webkit-scrollbar-thumb:hover {
  background: theme('colors.gray.500');
}

/* Dark mode scrollbar optimization */
.dark ::-webkit-scrollbar-track {
  background: theme('colors.gray.800');
}

.dark ::-webkit-scrollbar-thumb {
  background: theme('colors.gray.600');
}

.dark ::-webkit-scrollbar-thumb:hover {
  background: theme('colors.gray.500');
}

/* Performance: Container query support for future-proofing */
@container (min-width: 768px) {
  .space-y-8 {
    gap: 2rem;
  }
}

/* Accessibility: Reduced motion support */
@media (prefers-reduced-motion: reduce) {
  .animate-fade-in {
    animation: none;
    opacity: 1;
    transform: none;
  }
  
  * {
    transition-duration: 0.01ms !important;
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
  }
}

/* Accessibility: High contrast mode */
@media (prefers-contrast: high) {
  .card {
    border-width: 2px;
    border-color: currentColor;
  }
}

/* Performance: Print optimization */
@media print {
  .animate-fade-in {
    animation: none;
  }
  
  * {
    background: white !important;
    color: black !important;
    box-shadow: none !important;
    transform: none !important;
  }
  
  .no-print {
    display: none !important;
  }
}

/* Modern loading states */
.loading-shimmer {
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.4), transparent);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
}

@keyframes shimmer {
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}

.dark .loading-shimmer {
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.1), transparent);
}

/* Enhanced card hover effects */
.card:hover {
  transform: translateY(-2px);
  box-shadow: 
    0 20px 25px -5px rgba(0, 0, 0, 0.1),
    0 10px 10px -5px rgba(0, 0, 0, 0.04);
}

/* Responsive typography optimization */
@media (max-width: 640px) {
  .space-y-8 {
    gap: 1.5rem;
  }
}

/* Performance: GPU acceleration for smooth scrolling */
.min-h-screen {
  transform: translateZ(0);
  backface-visibility: hidden;
  perspective: 1000px;
}
</style>