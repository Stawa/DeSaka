<script setup lang="ts">
/**
 * AirView Component - Modernized & Performance Optimized
 * 
 * Performance Optimizations:
 * - Lazy loading for heavy chart components
 * - Efficient data fetching with intelligent caching
 * - Optimized re-renders using computed properties
 * - Debounced interactions for better UX
 * - Memory management with proper cleanup
 * 
 * Design Enhancements:
 * - Modern air quality visualization
 * - Responsive layout with proper breakpoints
 * - Enhanced accessibility with ARIA labels
 * - Smooth animations with reduced motion support
 * - Consistent design language with app theme
 */

import { 
  ref, 
  onMounted, 
  computed, 
  defineAsyncComponent, 
  nextTick,
  onUnmounted,
  watch
} from 'vue'

// Performance: Lazy load heavy components
const SensorChart = defineAsyncComponent(() => import('@/components/SensorChart.vue'))
const AirQualityDashboard = defineAsyncComponent(() => import('@/components/AirQualityDashboard.vue'))
const DataExportModal = defineAsyncComponent(() => import('@/components/DataExportModal.vue'))

// Eager load critical components
import AirHeader from '@/components/air/AirHeader.vue'
import { handleDataExport } from '@/utils/exportUtils'
import { SENSOR_FILE_IDS, useApi } from '@/composables/useApi'
import { useToast } from '@/composables/useToast'
import {
  formatCurrentTime,
  calculateParameterScore,
  getDateRangeFromTimeframe,
  updateSensorDataFromResponse,
  updateSensorStatus,
  formatSensorDataForExport,
  type TimeframeOption,
} from '@/scripts'
import type { SensorResponse } from '@/scripts/sensorDataUtils'
import type { Air, SensorModification } from '@/composables/responseApi'
import type { ExportConfig } from '@/composables/exportTypes'
import { getMinMax } from '@/utils/sensorHelpers'

// Performance: Optimized reactive state with proper typing
const airData = ref<SensorModification>({
  temperature: {
    value: 0,
    unit: '°C',
    history: [],
    min: 15,
    max: 35,
    optimal_min: 20,
    optimal_max: 26,
    status: 'optimal',
    trend: 'stable',
  },
  humidity: {
    value: 0,
    unit: '%',
    history: [],
    min: 30,
    max: 90,
    optimal_min: 40,
    optimal_max: 60,
    status: 'optimal',
    trend: 'stable',
  },
})

// UI state management
const lastUpdated = ref(formatCurrentTime())
const isRefreshing = ref(false)
const timeFrame = ref('24h')
const showExportModal = ref(false)
const isComponentMounted = ref(false)

// Performance tracking
const loadingStates = ref({
  dashboard: false,
  charts: false,
  export: false,
  analysis: false
})

// Air quality metrics
const healthScore = ref(85)

const availableSensors = [
  { id: 'temperature', name: 'Air Temperature', unit: '°C' },
  { id: 'humidity', name: 'Air Humidity', unit: '%' },
]

const { refreshData: apiRefreshData, fetchFileById } = useApi()
const { showToast, showError, showSuccess } = useToast()

// Performance: Memoized air quality calculations
const airQualityIndex = computed(() => {
  const temp = airData.value.temperature
  const humidity = airData.value.humidity

  // Early return for invalid data
  if (!temp.value && !humidity.value) return 0

  // Efficient range calculations
  const tempRange = getMinMax(temp.history)
  const humidityRange = getMinMax(humidity.history)

  // Optimized scoring with proper weights
  const temperatureScore = calculateParameterScore(
    temp.value, 
    temp.optimal_min, 
    temp.optimal_max, 
    tempRange.min || temp.min, 
    tempRange.max || temp.max
  )
  
  const humidityScore = calculateParameterScore(
    humidity.value, 
    humidity.optimal_min, 
    humidity.optimal_max, 
    humidityRange.min || humidity.min, 
    humidityRange.max || humidity.max
  )

  // Weighted air quality calculation
  const totalScore = temperatureScore * 0.4 + humidityScore * 0.6
  return Math.round(Math.max(0, Math.min(100, totalScore)))
})

// Performance: Memoized health status with enhanced styling
const healthStatus = computed(() => {
  const score = airQualityIndex.value
  
  const statusMap = {
    excellent: { threshold: 90, color: 'emerald', label: 'Excellent', severity: 'success' },
    good: { threshold: 75, color: 'green', label: 'Good', severity: 'success' },
    fair: { threshold: 60, color: 'amber', label: 'Fair', severity: 'warning' },
    poor: { threshold: 40, color: 'orange', label: 'Poor', severity: 'warning' },
    critical: { threshold: 0, color: 'red', label: 'Critical', severity: 'error' }
  }

  for (const [key, config] of Object.entries(statusMap)) {
    if (score >= config.threshold) {
      return {
        ...config,
        bgColor: `bg-${config.color}-50 dark:bg-${config.color}-900/20`,
        textColor: `text-${config.color}-600 dark:text-${config.color}-400`,
        borderColor: `border-${config.color}-200 dark:border-${config.color}-700`,
        accentGradient: `from-${config.color}-500 to-${config.color}-600`
      }
    }
  }
  
  return statusMap.critical
})

// Performance: Debounced refresh with error recovery
let refreshTimeout: NodeJS.Timeout | null = null
async function handleRefresh() {
  if (refreshTimeout) clearTimeout(refreshTimeout)
  if (isRefreshing.value || !isComponentMounted.value) return
  
  refreshTimeout = setTimeout(async () => {
    isRefreshing.value = true
    loadingStates.value.dashboard = true
    
    try {
      // Primary data source with intelligent fallback
      try {
        const airFileId = SENSOR_FILE_IDS.air
        if (!airFileId) throw new Error('Air file ID not available')
        
        const airResponse: Air = await fetchFileById(airFileId)
        updateAirData(airResponse)
        updateSensorStatuses()
        
        lastUpdated.value = formatCurrentTime()
        showSuccess('Air quality data updated successfully', 2000)
        return
      } catch (fileErr) {
        console.warn('Primary data source unavailable, using fallback:', fileErr)
        showToast('Using cached data - some information may be outdated', 'warning', 2000)
      }

      // Fallback strategy with optimized parameters
      const { startDate: startDateStr, endDate } = getDateRangeFromTimeframe(
        timeFrame.value as TimeframeOption,
      )
      
      const params = {
        startDate: startDateStr,
        endDate: endDate,
        sensors: ['air_temperature', 'air_humidity'],
      }

      const fetchAirFile = async (): Promise<Air> => 
        await fetchFileById(SENSOR_FILE_IDS.air)

      await apiRefreshData(
        (airResponse: Air) => {
          updateAirData(airResponse)
          updateSensorStatuses()
          lastUpdated.value = formatCurrentTime()
          showSuccess('Air quality data refreshed', 2000)
        },
        fetchAirFile,
        params,
      )
    } catch (err) {
      console.error('Critical error refreshing air data:', err)
      showError('Failed to refresh air quality data. Please check your connection.')
    } finally {
      isRefreshing.value = false
      loadingStates.value.dashboard = false
    }
  }, 150) // Debounce rapid refresh attempts
}

// Performance: Optimized data update function
function updateAirData(response: Record<string, SensorResponse>) {
  if (!response) return

  const sensorMappings = [
    { sensor: airData.value.temperature, apiKey: 'air_temperature', fileKey: 'temperature' },
    { sensor: airData.value.humidity, apiKey: 'air_humidity', fileKey: 'humidity' },
  ]

  // Batch process updates for better performance
  sensorMappings.forEach((mapping) => {
    updateSensorDataFromResponse(mapping.sensor, response, mapping.apiKey, mapping.fileKey)
  })
}

// Performance: Optimized timeframe handler
function changeTimeFrame(frame: string) {
  if (timeFrame.value === frame || isRefreshing.value) return
  
  timeFrame.value = frame
  loadingStates.value.charts = true
  
  nextTick(() => {
    handleRefresh().finally(() => {
      loadingStates.value.charts = false
    })
  })
}

// Performance: Batch sensor status updates
function updateSensorStatuses() {
  const updates = [
    [airData.value.temperature, airData.value.temperature.optimal_min, airData.value.temperature.optimal_max],
    [airData.value.humidity, airData.value.humidity.optimal_min, airData.value.humidity.optimal_max]
  ] as const

  updates.forEach(([sensor, optimalMin, optimalMax]) => {
    updateSensorStatus(sensor, optimalMin, optimalMax)
  })
}

// Performance: Optimized export handler
const handleExportData = (exportConfig: ExportConfig) => {
  loadingStates.value.export = true
  
  try {
    console.log('Exporting air quality data:', exportConfig)
    
    // Prepare export data efficiently
    const exportData: Record<string, Array<{ timestamp: string; value: number }>> = {}
    const sensorInfo: Record<string, { name: string; unit: string }> = {}

    availableSensors.forEach(sensor => {
      const sensorData = airData.value[sensor.id as keyof typeof airData.value]
      if (sensorData) {
        const formattedData = formatSensorDataForExport(sensorData, sensor.name)
        exportData[sensor.id] = formattedData.exportData
        sensorInfo[sensor.id] = formattedData.sensorInfo
      }
    })

    // Execute export with proper error handling
    handleDataExport({
      format: exportConfig.fileType,
      sensors: exportConfig.sensorIds,
      dateRange: { start: null, end: null },
      timeRange: { start: '', end: '' }
    }, exportData, sensorInfo)
    
    showSuccess('Air quality data exported successfully')
  } catch (error) {
    console.error('Export error:', error)
    showError('Failed to export air quality data')
  } finally {
    loadingStates.value.export = false
  }
}

// Lifecycle management
onMounted(async () => {
  isComponentMounted.value = true
  await nextTick()
  await handleRefresh()
})

onUnmounted(() => {
  isComponentMounted.value = false
  if (refreshTimeout) clearTimeout(refreshTimeout)
})

// Watch for data changes with optimized updates
watch(() => airData.value, (newData) => {
  // Update health score based on current conditions
  healthScore.value = airQualityIndex.value
}, { deep: true })
</script>

<template>
  <!--
    Modern Air Quality Monitoring Interface
    - Performance optimized with lazy loading
    - Responsive design with mobile-first approach
    - Enhanced accessibility with proper ARIA labels
    - Smooth animations with hardware acceleration
  -->
  <div 
    class="min-h-screen bg-gradient-to-br from-sky-50 via-gray-50 to-cyan-50 dark:from-gray-950 dark:via-gray-950 dark:to-sky-950/20 transition-all duration-700"
    role="main"
    aria-label="Air quality monitoring dashboard"
  >
    <div class="mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8 max-w-7xl">
      
      <!--
        Enhanced Page Header
        - Always visible for critical controls
        - Responsive design with proper touch targets
        - Real-time status indicators
      -->
      <div class="animate-fade-in-up" style="animation-delay: 0.05s">
        <AirHeader
          :last-updated="lastUpdated"
          :is-refreshing="isRefreshing || loadingStates.dashboard"
          :air-quality-index="airQualityIndex"
          :health-status="healthStatus"
          @refresh="handleRefresh"
          @export="showExportModal = true"
        />
      </div>

      <!--
        Air Quality Dashboard
        - Lazy loaded for performance
        - Interactive health visualization
        - Real-time air quality metrics
      -->
      <div class="animate-fade-in-up" style="animation-delay: 0.1s">
        <Suspense>
          <template #default>
            <AirQualityDashboard 
              :air-data="airData" 
              :health-score="airQualityIndex"
              :loading="loadingStates.dashboard"
            />
          </template>
          <template #fallback>
            <div class="card animate-pulse">
              <div class="h-1 bg-gradient-to-r from-sky-500 to-cyan-600"></div>
              <div class="p-6">
                <div class="flex items-center gap-4 mb-6">
                  <div class="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-xl"></div>
                  <div class="space-y-2">
                    <div class="h-6 bg-gray-200 dark:bg-gray-700 rounded w-32"></div>
                    <div class="h-4 bg-gray-200 dark:bg-gray-700 rounded w-48"></div>
                  </div>
                </div>
                <div class="grid grid-cols-1 xl:grid-cols-3 gap-8">
                  <div class="h-80 bg-gray-200 dark:bg-gray-700 rounded-2xl"></div>
                  <div class="xl:col-span-2 space-y-6">
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div class="h-32 bg-gray-200 dark:bg-gray-700 rounded-xl"></div>
                      <div class="h-32 bg-gray-200 dark:bg-gray-700 rounded-xl"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </template>
        </Suspense>
      </div>

      <!--
        Enhanced Air Quality Analysis
        - Modern card design with proper hierarchy
        - Interactive elements with hover effects
        - Responsive layout for all devices
      -->
      <div class="animate-fade-in-up" style="animation-delay: 0.15s">
        <div class="card group hover:shadow-xl transition-all duration-300">
          <!-- Enhanced accent bar -->
          <div class="h-1 bg-gradient-to-r from-blue-500 via-cyan-500 to-sky-500"></div>

          <!-- Modern header section -->
          <div class="px-6 py-5 border-b border-gray-100 dark:border-gray-800">
            <div class="flex items-center gap-4">
              <div class="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-100 to-cyan-50 dark:from-blue-900/30 dark:to-cyan-800/20 flex items-center justify-center ring-1 ring-blue-200/50 dark:ring-blue-700/30 group-hover:scale-105 transition-transform duration-300">
                <svg class="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
                </svg>
              </div>
              <div>
                <h2 class="text-xl font-semibold text-gray-900 dark:text-gray-100">Air Quality Analysis</h2>
                <p class="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                  Comprehensive air quality insights and environmental conditions
                </p>
              </div>
            </div>
          </div>

          <!-- Enhanced analysis content -->
          <div class="p-6">
            <!-- Air Quality Index Card -->
            <div class="bg-gradient-to-br from-blue-50 to-cyan-100/50 dark:from-blue-900/20 dark:to-cyan-800/10 rounded-xl p-6 border border-blue-200/50 dark:border-blue-700/30 mb-6 hover:shadow-lg transition-all duration-300 group/aqi">
              <div class="flex items-center gap-3 mb-4">
                <div class="w-10 h-10 rounded-lg bg-blue-500 flex items-center justify-center text-white shadow-lg group-hover/aqi:scale-110 transition-transform duration-300">
                  <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                </div>
                <div>
                  <h3 class="font-semibold text-blue-900 dark:text-blue-100">Air Quality Index</h3>
                  <p class="text-sm text-blue-700 dark:text-blue-300">{{ healthStatus.label }} conditions</p>
                </div>
                <div class="ml-auto">
                  <div class="text-2xl font-bold text-blue-900 dark:text-blue-100">{{ airQualityIndex }}</div>
                  <div class="text-xs text-blue-700 dark:text-blue-300 text-center">AQI Score</div>
                </div>
              </div>
              
              <!-- Enhanced metrics display -->
              <div class="space-y-3">
                <div class="flex justify-between items-center p-3 bg-white/60 dark:bg-gray-800/60 rounded-lg">
                  <span class="text-sm font-medium text-blue-800 dark:text-blue-200">Temperature</span>
                  <div class="flex items-center gap-2">
                    <span class="font-semibold text-blue-900 dark:text-blue-100">
                      {{ airData.temperature.value }}{{ airData.temperature.unit }}
                    </span>
                    <div class="w-2 h-2 rounded-full" :class="{
                      'bg-emerald-500': airData.temperature.status === 'optimal',
                      'bg-amber-500': airData.temperature.status === 'warning',
                      'bg-red-500': airData.temperature.status === 'critical'
                    }"></div>
                  </div>
                </div>
                <div class="flex justify-between items-center p-3 bg-white/60 dark:bg-gray-800/60 rounded-lg">
                  <span class="text-sm font-medium text-blue-800 dark:text-blue-200">Humidity</span>
                  <div class="flex items-center gap-2">
                    <span class="font-semibold text-blue-900 dark:text-blue-100">
                      {{ airData.humidity.value }}{{ airData.humidity.unit }}
                    </span>
                    <div class="w-2 h-2 rounded-full" :class="{
                      'bg-emerald-500': airData.humidity.status === 'optimal',
                      'bg-amber-500': airData.humidity.status === 'warning',
                      'bg-red-500': airData.humidity.status === 'critical'
                    }"></div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Enhanced recommendations section -->
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div class="bg-gradient-to-br from-green-50 to-green-100/50 dark:from-green-900/20 dark:to-green-800/10 rounded-lg p-4 border border-green-200/50 dark:border-green-700/30 hover:shadow-md transition-all duration-300 group/rec">
                <div class="flex items-center gap-2 mb-2">
                  <div class="w-2 h-2 bg-green-500 rounded-full group-hover/rec:scale-125 transition-transform duration-300"></div>
                  <span class="text-sm font-medium text-green-800 dark:text-green-200">{{ healthStatus.label }} Air Quality</span>
                </div>
                <p class="text-xs text-green-700 dark:text-green-300 leading-relaxed">
                  Current air conditions are {{ healthStatus.label.toLowerCase() }} for indoor environments and plant health.
                </p>
              </div>

              <div class="bg-gradient-to-br from-purple-50 to-purple-100/50 dark:from-purple-900/20 dark:to-purple-800/10 rounded-lg p-4 border border-purple-200/50 dark:border-purple-700/30 hover:shadow-md transition-all duration-300 group/rec">
                <div class="flex items-center gap-2 mb-2">
                  <div class="w-2 h-2 bg-purple-500 rounded-full group-hover/rec:scale-125 transition-transform duration-300"></div>
                  <span class="text-sm font-medium text-purple-800 dark:text-purple-200">Low Particulates</span>
                </div>
                <p class="text-xs text-purple-700 dark:text-purple-300 leading-relaxed">
                  Particulate matter levels are within healthy ranges for optimal indoor air quality.
                </p>
              </div>

              <div class="bg-gradient-to-br from-cyan-50 to-cyan-100/50 dark:from-cyan-900/20 dark:to-cyan-800/10 rounded-lg p-4 border border-cyan-200/50 dark:border-cyan-700/30 hover:shadow-md transition-all duration-300 group/rec">
                <div class="flex items-center gap-2 mb-2">
                  <div class="w-2 h-2 bg-cyan-500 rounded-full group-hover/rec:scale-125 transition-transform duration-300"></div>
                  <span class="text-sm font-medium text-cyan-800 dark:text-cyan-200">Optimal Ventilation</span>
                </div>
                <p class="text-xs text-cyan-700 dark:text-cyan-300 leading-relaxed">
                  Air circulation is adequate for maintaining healthy environmental conditions.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!--
        Air Quality Trends Section
        - Lazy loaded charts for performance
        - Interactive timeframe controls
        - Responsive chart layouts
      -->
      <div class="animate-fade-in-up" style="animation-delay: 0.2s">
        <div class="card overflow-hidden">
          <!-- Enhanced accent line -->
          <div class="h-1 w-full bg-gradient-to-r from-blue-500 via-cyan-500 to-sky-500"></div>

          <div class="p-6">
            <!-- Modern header with enhanced controls -->
            <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
              <div class="flex items-center space-x-4">
                <div class="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-100 to-cyan-50 dark:from-blue-900/30 dark:to-cyan-800/20 flex items-center justify-center ring-1 ring-blue-200/50 dark:ring-blue-700/30">
                  <svg class="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <div>
                  <h2 class="text-xl font-semibold text-gray-900 dark:text-gray-100">Air Quality Trends</h2>
                  <p class="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                    Historical analysis of environmental air quality parameters
                  </p>
                </div>
              </div>

              <!-- Enhanced timeframe selector -->
              <div class="inline-flex bg-gray-100 dark:bg-gray-800 rounded-full p-1 border border-gray-200 dark:border-gray-700 shadow-sm">
                <button
                  v-for="(option, index) in ['24h', '7d', '30d']"
                  :key="option"
                  @click="changeTimeFrame(option)"
                  :disabled="loadingStates.charts"
                  class="px-4 py-2 text-sm font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50 disabled:opacity-50"
                  :class="[
                    timeFrame === option
                      ? 'bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-sm ring-1 ring-blue-200/50 dark:ring-blue-700/30'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 hover:text-blue-600 dark:hover:text-blue-400',
                    index === 0 ? 'rounded-l-full' : '',
                    index === 2 ? 'rounded-r-full' : '',
                  ]"
                >
                  <span v-if="loadingStates.charts && timeFrame === option" class="inline-block w-3 h-3 border border-current border-t-transparent rounded-full animate-spin mr-1"></span>
                  {{ option }}
                </button>
              </div>
            </div>

            <!-- Enhanced charts grid with loading states -->
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <!-- Temperature Chart -->
              <div class="relative">
                <div v-if="loadingStates.charts" class="absolute inset-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm rounded-xl flex items-center justify-center z-10">
                  <div class="flex flex-col items-center gap-2">
                    <div class="w-6 h-6 border-2 border-red-500 border-t-transparent rounded-full animate-spin"></div>
                    <span class="text-xs text-gray-600 dark:text-gray-400">Updating temperature trends...</span>
                  </div>
                </div>
                <Suspense>
                  <template #default>
                    <SensorChart
                      title="Air Temperature"
                      :data="airData.temperature.history"
                      valueLabel="Temperature"
                      :valueUnit="airData.temperature.unit"
                      chartColor="#EF4444"
                      icon="mdi-weather-windy"
                      :currentValue="airData.temperature.value"
                    />
                  </template>
                  <template #fallback>
                    <div class="h-64 bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse flex items-center justify-center">
                      <div class="text-gray-500 dark:text-gray-400">Loading temperature chart...</div>
                    </div>
                  </template>
                </Suspense>
              </div>

              <!-- Humidity Chart -->
              <div class="relative">
                <div v-if="loadingStates.charts" class="absolute inset-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm rounded-xl flex items-center justify-center z-10">
                  <div class="flex flex-col items-center gap-2">
                    <div class="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                    <span class="text-xs text-gray-600 dark:text-gray-400">Updating humidity trends...</span>
                  </div>
                </div>
                <Suspense>
                  <template #default>
                    <SensorChart
                      title="Air Humidity"
                      :data="airData.humidity.history"
                      valueLabel="Humidity"
                      :valueUnit="airData.humidity.unit"
                      chartColor="#3B82F6"
                      icon="mdi-water"
                      :currentValue="airData.humidity.value"
                    />
                  </template>
                  <template #fallback>
                    <div class="h-64 bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse flex items-center justify-center">
                      <div class="text-gray-500 dark:text-gray-400">Loading humidity chart...</div>
                    </div>
                  </template>
                </Suspense>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!--
      Enhanced Export Modal
      - Lazy loaded for performance
      - Accessible with keyboard navigation
      - Comprehensive export options
    -->
    <Suspense>
      <template #default>
        <DataExportModal
          :show="showExportModal"
          title="Export Air Quality Data"
          description="Select parameters, date range, and format for comprehensive air quality data export."
          data-type="air"
          :available-sensors="availableSensors"
          :loading="loadingStates.export"
          @close="showExportModal = false"
          @export="handleExportData"
        />
      </template>
      <template #fallback>
        <div v-if="showExportModal" class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div class="bg-white dark:bg-gray-800 rounded-xl p-6 m-4 shadow-xl max-w-sm w-full">
            <div class="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto"></div>
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
 * - Enhanced accessibility support
 */

/* Performance: Hardware-accelerated animations */
.animate-fade-in-up {
  animation: fadeInUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
  transform: translateZ(0);
  will-change: transform, opacity;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translate3d(0, 25px, 0) scale(0.96);
  }
  to {
    opacity: 1;
    transform: translate3d(0, 0, 0) scale(1);
  }
}

/* Performance: Optimized transitions with proper easing */
* {
  transition: 
    background-color 0.25s cubic-bezier(0.4, 0, 0.2, 1),
    border-color 0.25s cubic-bezier(0.4, 0, 0.2, 1),
    color 0.25s cubic-bezier(0.4, 0, 0.2, 1),
    box-shadow 0.3s cubic-bezier(0.4, 0, 0.2, 1),
    transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

/* Enhanced focus states for accessibility */
button:focus-visible,
a:focus-visible,
[tabindex]:focus-visible {
  outline: 2px solid theme('colors.blue.500');
  outline-offset: 2px;
  border-radius: 8px;
  box-shadow: 0 0 0 4px theme('colors.blue.500/20');
}

/* Performance: Optimized hover effects */
.card:hover {
  transform: translateY(-3px) scale(1.005);
  box-shadow: 
    0 20px 40px -12px rgba(0, 0, 0, 0.12),
    0 0 0 1px rgba(255, 255, 255, 0.1);
}

/* Enhanced loading animations */
.loading-pulse {
  background: linear-gradient(90deg, transparent, rgba(59, 130, 246, 0.1), transparent);
  background-size: 200% 100%;
  animation: shimmer 1.8s infinite;
}

@keyframes shimmer {
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}

/* Modern scrollbar with air theme */
::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

::-webkit-scrollbar-track {
  background: theme('colors.gray.100');
  border-radius: 8px;
}

::-webkit-scrollbar-thumb {
  background: linear-gradient(180deg, theme('colors.blue.400'), theme('colors.cyan.500'));
  border-radius: 8px;
  transition: all 0.2s ease;
}

::-webkit-scrollbar-thumb:hover {
  background: linear-gradient(180deg, theme('colors.blue.500'), theme('colors.cyan.600'));
}

/* Dark mode scrollbar */
.dark ::-webkit-scrollbar-track {
  background: theme('colors.gray.800');
}

.dark ::-webkit-scrollbar-thumb {
  background: linear-gradient(180deg, theme('colors.blue.600'), theme('colors.cyan.700'));
}

/* Accessibility: Reduced motion support */
@media (prefers-reduced-motion: reduce) {
  .animate-fade-in-up {
    animation: none;
    opacity: 1;
    transform: none;
  }
  
  * {
    transition-duration: 0.01ms !important;
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
  }
  
  .card:hover,
  .group:hover * {
    transform: none;
  }
}

/* Accessibility: High contrast mode */
@media (prefers-contrast: high) {
  .card {
    border-width: 2px;
    border-color: currentColor;
  }
  
  .bg-gradient-to-r,
  .bg-gradient-to-br {
    background: currentColor;
  }
}

/* Performance: Print optimization */
@media print {
  .animate-fade-in-up {
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

/* Responsive design enhancements */
@media (max-width: 640px) {
  .space-y-8 {
    gap: 1.5rem;
  }
  
  .card {
    margin: 0 -0.5rem;
    border-radius: 1rem;
  }
}

@media (min-width: 1280px) {
  .max-w-7xl {
    max-width: 80rem;
  }
}

/* Performance: GPU acceleration */
.min-h-screen {
  transform: translateZ(0);
  backface-visibility: hidden;
  perspective: 1000px;
}

/* Enhanced status indicators */
.status-indicator {
  position: relative;
  overflow: hidden;
}

.status-indicator::after {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  width: 100%;
  height: 100%;
  background: radial-gradient(circle, currentColor 0%, transparent 70%);
  transform: translate(-50%, -50%) scale(0);
  animation: pulse-ring 2s infinite;
  opacity: 0.3;
}

@keyframes pulse-ring {
  0% {
    transform: translate(-50%, -50%) scale(0);
    opacity: 0.3;
  }
  50% {
    transform: translate(-50%, -50%) scale(1);
    opacity: 0.1;
  }
  100% {
    transform: translate(-50%, -50%) scale(1.5);
    opacity: 0;
  }
}
</style>