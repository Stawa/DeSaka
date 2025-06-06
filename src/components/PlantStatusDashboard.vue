<script setup>
import { onMounted, onUnmounted, computed, ref } from 'vue'

// Props for the combined component
const props = defineProps({
  sensorData: {
    type: Object,
    required: true,
  },
  plantHealthScore: {
    type: Number,
    required: true,
  },
  growthPrediction: {
    type: String,
    default: 'Normal',
  },
  systemStatus: {
    type: String,
    default: 'normal',
  },
})

// Sample sensor data for StatusOverview (can be replaced with actual data)
const statusSensorData = [
  { id: 1, name: 'Soil Moisture Sensor', status: 'normal' },
  { id: 2, name: 'Temperature Sensor', status: 'warning' },
  { id: 3, name: 'Humidity Sensor', status: 'normal' },
  { id: 4, name: 'Light Sensor', status: 'normal' },
  { id: 5, name: 'pH Sensor', status: 'critical' },
  { id: 6, name: 'Nutrient Sensor', status: 'warning' },
  { id: 7, name: 'Water Level Sensor', status: 'normal' },
  { id: 8, name: 'CO2 Sensor', status: 'normal' },
]

// Status counts for the overview section
const statusCounts = computed(() => {
  return {
    normal: statusSensorData.filter((sensor) => sensor.status === 'normal').length,
    warning: statusSensorData.filter((sensor) => sensor.status === 'warning').length,
    critical: statusSensorData.filter((sensor) => sensor.status === 'critical').length,
  }
})

// Key metrics for system health
const keyMetrics = [
  { name: 'System Uptime', value: '99.8%', status: 'normal' },
  { name: 'Response Time', value: '120ms', status: 'normal' },
  { name: 'Error Rate', value: '0.5%', status: 'warning' },
]

// For hover effects on status cards
const isHoveredCard = ref(null)

// For mobile/tablet view tab switching
const activeTab = ref('status') // 'status' or 'health'

// Computed properties for plant health section
const soilMoisture = computed(() => {
  return props.sensorData.soilMoisture
})

const soilPh = computed(() => {
  return props.sensorData.soilPH
})

const airTemperature = computed(() => {
  return props.sensorData.airTemperature
})

// Helper function to get status color
const getStatusColor = (status) => {
  switch (status) {
    case 'normal':
      return 'text-green-500 dark:text-green-400'
    case 'warning':
      return 'text-yellow-500 dark:text-yellow-400'
    case 'critical':
      return 'text-red-500 dark:text-red-400'
    default:
      return 'text-gray-500 dark:text-gray-400'
  }
}

// Computed properties for health score colors
const healthScoreColor = computed(() => {
  if (props.plantHealthScore >= 80) return 'text-green-500 dark:text-green-400'
  if (props.plantHealthScore >= 60) return 'text-yellow-500 dark:text-yellow-400'
  return 'text-red-500 dark:text-red-400'
})

const healthScoreBgColor = computed(() => {
  if (props.plantHealthScore >= 80) return 'text-green-500 dark:text-green-600'
  if (props.plantHealthScore >= 60) return 'text-yellow-500 dark:text-yellow-600'
  return 'text-red-500 dark:text-red-600'
})

const healthScoreSvgColor = computed(() => {
  if (props.plantHealthScore >= 80) return '#22c55e'
  if (props.plantHealthScore >= 60) return '#eab308'
  return '#ef4444'
})

// Detect window width for responsive design
const isDesktop = ref(window.innerWidth >= 1024) // lg breakpoint

const updateWindowWidth = () => {
  isDesktop.value = window.innerWidth >= 1024
}

// Add and remove event listener
onMounted(() => {
  window.addEventListener('resize', updateWindowWidth)
})

onUnmounted(() => {
  window.removeEventListener('resize', updateWindowWidth)
})
</script>

<template>
  <div
    class="plant-status-dashboard bg-white dark:bg-gray-900 rounded-xl shadow-md overflow-hidden border border-gray-100 dark:border-gray-700 transition-all duration-300 hover:shadow-lg w-full"
  >
    <!-- Mobile/Tablet Tab Navigation -->
    <div class="lg:hidden border-b border-gray-100 dark:border-gray-700">
      <div class="flex">
        <button
          @click="activeTab = 'status'"
          class="flex-1 py-3 px-4 text-center text-sm font-medium transition-colors duration-200 focus:outline-none"
          :class="{
            'text-primary-600 dark:text-primary-400 border-b-2 border-primary-500':
              activeTab === 'status',
            'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300':
              activeTab !== 'status',
          }"
        >
          <span class="mdi mdi-chart-line mr-1"></span>
          Status Overview
        </button>
        <button
          @click="activeTab = 'health'"
          class="flex-1 py-3 px-4 text-center text-sm font-medium transition-colors duration-200 focus:outline-none"
          :class="{
            'text-primary-600 dark:text-primary-400 border-b-2 border-primary-500':
              activeTab === 'health',
            'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300':
              activeTab !== 'health',
          }"
        >
          <span class="mdi mdi-sprout mr-1"></span>
          Plant Health
        </button>
      </div>
    </div>

    <!-- Desktop Layout: Side by Side -->
    <div v-if="isDesktop" class="grid grid-cols-2 divide-x divide-gray-100 dark:divide-gray-700">
      <!-- Status Overview Section -->
      <div class="status-overview">
        <!-- Status Overview Header -->
        <div class="p-3 sm:p-4 md:p-5 border-b border-gray-100 dark:border-gray-700">
          <div class="flex items-center">
            <div
              class="bg-primary-100 dark:bg-primary-900/30 p-1.5 sm:p-2 rounded-lg mr-2 sm:mr-3 flex-shrink-0"
            >
              <span
                class="mdi mdi-chart-line text-primary-600 dark:text-primary-400 text-lg sm:text-xl"
              ></span>
            </div>
            <h2
              class="text-base sm:text-lg md:text-xl font-semibold text-gray-800 dark:text-gray-200 truncate"
            >
              Status Overview
            </h2>
          </div>
        </div>

        <!-- Status Overview Content -->
        <div class="p-3 sm:p-4 md:p-5">
          <!-- Status Cards -->
          <div class="grid grid-cols-3 gap-2 sm:gap-3 md:gap-4 mb-4 sm:mb-6">
            <!-- Normal Status Card -->
            <div
              @mouseenter="isHoveredCard = 'normal'"
              @mouseleave="isHoveredCard = null"
              class="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-900/40 border border-green-200 dark:border-green-800 rounded-xl p-2 sm:p-3 flex items-center justify-between transform transition-all duration-300"
              :class="{ 'scale-105 shadow-md': isHoveredCard === 'normal' }"
            >
              <div>
                <h3
                  class="text-green-800 dark:text-green-300 font-medium text-2xs sm:text-xs md:text-sm mb-0.5 sm:mb-1"
                >
                  Normal
                </h3>
                <p
                  class="text-lg sm:text-xl md:text-2xl font-bold text-green-600 dark:text-green-400"
                >
                  {{ statusCounts.normal }}
                </p>
                <p class="text-2xs sm:text-xs text-green-700 dark:text-green-300 opacity-80">
                  Sensors
                </p>
              </div>
            </div>

            <!-- Warning Status Card -->
            <div
              @mouseenter="isHoveredCard = 'warning'"
              @mouseleave="isHoveredCard = null"
              class="bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-900/20 dark:to-yellow-900/40 border border-yellow-200 dark:border-yellow-800 rounded-xl p-2 sm:p-3 flex items-center justify-between transform transition-all duration-300"
              :class="{ 'scale-105 shadow-md': isHoveredCard === 'warning' }"
            >
              <div>
                <h3
                  class="text-yellow-800 dark:text-yellow-300 font-medium text-2xs sm:text-xs md:text-sm mb-0.5 sm:mb-1"
                >
                  Warning
                </h3>
                <p
                  class="text-lg sm:text-xl md:text-2xl font-bold text-yellow-600 dark:text-yellow-400"
                >
                  {{ statusCounts.warning }}
                </p>
                <p class="text-2xs sm:text-xs text-yellow-700 dark:text-yellow-300 opacity-80">
                  Sensors
                </p>
              </div>
            </div>

            <!-- Critical Status Card -->
            <div
              @mouseenter="isHoveredCard = 'critical'"
              @mouseleave="isHoveredCard = null"
              class="bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-900/40 border border-red-200 dark:border-red-800 rounded-xl p-2 sm:p-3 flex items-center justify-between transform transition-all duration-300"
              :class="{ 'scale-105 shadow-md': isHoveredCard === 'critical' }"
            >
              <div>
                <h3
                  class="text-red-800 dark:text-red-300 font-medium text-2xs sm:text-xs md:text-sm mb-0.5 sm:mb-1"
                >
                  Critical
                </h3>
                <p class="text-lg sm:text-xl md:text-2xl font-bold text-red-600 dark:text-red-400">
                  {{ statusCounts.critical }}
                </p>
                <p class="text-2xs sm:text-xs text-red-700 dark:text-red-300 opacity-80">Sensors</p>
              </div>
            </div>
          </div>

          <!-- Key Metrics Section -->
          <div class="mt-6">
            <h3 class="text-sm sm:text-base font-medium text-gray-800 dark:text-gray-200 mb-3">
              Key Metrics
            </h3>
            <div class="space-y-3">
              <!-- System Health Progress Bar -->
              <div>
                <div class="flex justify-between items-center mb-1">
                  <span class="text-2xs sm:text-xs text-gray-600 dark:text-gray-400"
                    >System Health</span
                  >
                  <span class="text-2xs sm:text-xs font-medium text-green-600 dark:text-green-400"
                    >63%</span
                  >
                </div>
                <div class="h-1.5 w-full bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div
                    class="h-full bg-green-500 dark:bg-green-600 rounded-full animate-progress"
                    style="width: 63%"
                  ></div>
                </div>
              </div>

              <!-- Key Metrics Grid -->
              <div class="grid grid-cols-3 gap-2 sm:gap-3">
                <div
                  v-for="metric in keyMetrics"
                  :key="metric.name"
                  class="bg-gray-50 dark:bg-gray-800 rounded-lg p-2 sm:p-3 border border-gray-100 dark:border-gray-700 transition-all duration-200 hover:shadow-sm"
                >
                  <p class="text-2xs sm:text-xs text-gray-600 dark:text-gray-400 truncate mb-1">
                    {{ metric.name }}
                  </p>
                  <p class="text-sm sm:text-base font-bold" :class="getStatusColor(metric.status)">
                    {{ metric.value }}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Plant Health Section -->
      <div class="plant-health">
        <!-- Plant Health Header -->
        <div class="p-3 sm:p-4 md:p-5 border-b border-gray-100 dark:border-gray-700">
          <div class="flex items-center">
            <div
              class="bg-primary-100 dark:bg-primary-900/30 p-1.5 sm:p-2 rounded-lg mr-2 sm:mr-3 flex-shrink-0"
            >
              <span
                class="mdi mdi-sprout text-primary-600 dark:text-primary-400 text-lg sm:text-xl"
              ></span>
            </div>
            <h2
              class="text-base sm:text-lg md:text-xl font-semibold text-gray-800 dark:text-gray-200 truncate"
            >
              Plant Health
            </h2>
          </div>
        </div>

        <!-- Plant Health Content -->
        <div class="p-3 sm:p-4 md:p-5">
          <!-- Health Score Display -->
          <div
            class="bg-gray-50 dark:bg-gray-800 rounded-lg p-2 sm:p-3 mb-3 flex items-center justify-between"
          >
            <div class="text-left">
              <p class="text-2xs sm:text-xs text-gray-500 dark:text-gray-400 mb-0.5">
                Overall Health Score
              </p>
              <div class="flex items-baseline">
                <span class="text-base sm:text-lg font-bold mr-1" :class="healthScoreColor">{{
                  plantHealthScore
                }}</span>
                <span class="text-2xs sm:text-xs text-gray-500 dark:text-gray-400">/ 100</span>
              </div>
            </div>

            <!-- Health Score Progress Circle -->
            <div class="relative w-12 h-12 sm:w-16 sm:h-16 flex-shrink-0">
              <svg class="w-full h-full" viewBox="0 0 100 100">
                <!-- Background circle -->
                <circle
                  class="stroke-current"
                  :class="healthScoreBgColor"
                  stroke-width="10"
                  cx="50"
                  cy="50"
                  r="40"
                  fill="transparent"
                ></circle>
                <!-- Progress circle -->
                <circle
                  stroke-width="10"
                  stroke-linecap="round"
                  stroke-dasharray="251.2"
                  :stroke-dashoffset="251.2 - (251.2 * plantHealthScore) / 100"
                  cx="50"
                  cy="50"
                  r="40"
                  fill="transparent"
                  transform="rotate(-90 50 50)"
                  class="transition-all duration-1000 ease-out"
                  :stroke="healthScoreSvgColor"
                ></circle>
                <!-- Text in center -->
                <text
                  x="50"
                  y="50"
                  class="text-sm sm:text-base font-bold"
                  :fill="healthScoreSvgColor"
                  dominant-baseline="middle"
                  text-anchor="middle"
                >
                  {{ plantHealthScore }}
                </text>
              </svg>
            </div>
          </div>

          <!-- Key Factors Section -->
          <div class="space-y-2 sm:space-y-3">
            <h3 class="text-sm sm:text-base font-medium text-gray-700 dark:text-gray-300 mb-2">
              Key Factors
            </h3>

            <!-- Factors Grid -->
            <div class="grid grid-cols-3 gap-2 sm:gap-3 mb-4">
              <!-- Soil Moisture -->
              <div
                v-if="soilMoisture"
                class="bg-gray-50 dark:bg-gray-800 rounded-lg p-2 sm:p-3 border border-gray-100 dark:border-gray-700 transition-all duration-200 hover:shadow-sm"
              >
                <div class="flex items-center mb-1.5">
                  <span
                    class="mdi mdi-water text-blue-500 dark:text-blue-400 mr-1.5 text-sm flex-shrink-0"
                  ></span>
                  <span
                    class="text-2xs sm:text-xs font-medium text-gray-700 dark:text-gray-300 truncate"
                    >Soil Moisture</span
                  >
                </div>
                <div class="flex items-center">
                  <span
                    class="text-sm sm:text-base font-bold mr-1"
                    :class="getStatusColor(soilMoisture.status)"
                  >
                    {{ soilMoisture.value }}{{ soilMoisture.unit }}
                  </span>
                  <span
                    class="mdi text-xs sm:text-sm flex-shrink-0"
                    :class="{
                      'mdi-check-circle text-green-500 dark:text-green-400':
                        soilMoisture.status === 'normal',
                      'mdi-alert text-yellow-500 dark:text-yellow-400':
                        soilMoisture.status === 'warning',
                      'mdi-alert-circle text-red-500 dark:text-red-400':
                        soilMoisture.status === 'critical',
                    }"
                  ></span>
                </div>
              </div>

              <!-- Soil pH -->
              <div
                v-if="soilPh"
                class="bg-gray-50 dark:bg-gray-800 rounded-lg p-2 sm:p-3 border border-gray-100 dark:border-gray-700 transition-all duration-200 hover:shadow-sm"
              >
                <div class="flex items-center mb-1.5">
                  <span
                    class="mdi mdi-test-tube text-purple-500 dark:text-purple-400 mr-1.5 text-sm flex-shrink-0"
                  ></span>
                  <span
                    class="text-2xs sm:text-xs font-medium text-gray-700 dark:text-gray-300 truncate"
                    >Soil pH</span
                  >
                </div>
                <div class="flex items-center">
                  <span
                    class="text-sm sm:text-base font-bold mr-1"
                    :class="getStatusColor(soilPh.status)"
                  >
                    {{ soilPh.value }}{{ soilPh.unit }}
                  </span>
                  <span
                    class="mdi text-xs sm:text-sm flex-shrink-0"
                    :class="{
                      'mdi-check-circle text-green-500 dark:text-green-400':
                        soilPh.status === 'normal',
                      'mdi-alert text-yellow-500 dark:text-yellow-400': soilPh.status === 'warning',
                      'mdi-alert-circle text-red-500 dark:text-red-400':
                        soilPh.status === 'critical',
                    }"
                  ></span>
                </div>
              </div>

              <!-- Air Temperature -->
              <div
                v-if="airTemperature"
                class="bg-gray-50 dark:bg-gray-800 rounded-lg p-2 sm:p-3 border border-gray-100 dark:border-gray-700 transition-all duration-200 hover:shadow-sm"
              >
                <div class="flex items-center mb-1.5">
                  <span
                    class="mdi mdi-thermometer text-red-500 dark:text-red-400 mr-1.5 text-sm flex-shrink-0"
                  ></span>
                  <span
                    class="text-2xs sm:text-xs font-medium text-gray-700 dark:text-gray-300 truncate"
                    >Air Temperature</span
                  >
                </div>
                <div class="flex items-center">
                  <span
                    class="text-sm sm:text-base font-bold mr-1"
                    :class="getStatusColor(airTemperature.status)"
                  >
                    {{ airTemperature.value }}{{ airTemperature.unit }}
                  </span>
                  <span
                    class="mdi text-xs sm:text-sm flex-shrink-0"
                    :class="{
                      'mdi-check-circle text-green-500 dark:text-green-400':
                        airTemperature.status === 'normal',
                      'mdi-alert text-yellow-500 dark:text-yellow-400':
                        airTemperature.status === 'warning',
                      'mdi-alert-circle text-red-500 dark:text-red-400':
                        airTemperature.status === 'critical',
                    }"
                  ></span>
                </div>
              </div>
            </div>

            <!-- Growth Prediction -->
            <div
              class="bg-gray-50 dark:bg-gray-800 rounded-lg p-3 sm:p-4 border border-gray-100 dark:border-gray-700"
            >
              <div class="flex justify-between items-center flex-wrap gap-1 sm:gap-2">
                <span class="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300"
                  >Growth Prediction</span
                >
                <span
                  class="px-2 sm:px-2.5 py-1 rounded-full text-xs font-medium whitespace-nowrap"
                  :class="{
                    'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300':
                      growthPrediction === 'Excellent',
                    'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300':
                      growthPrediction === 'Good',
                    'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300':
                      growthPrediction === 'Fair',
                    'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300':
                      growthPrediction === 'Poor',
                    'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300':
                      growthPrediction === 'Critical',
                  }"
                >
                  {{ growthPrediction }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Mobile/Tablet Layout: Tabbed Interface -->
    <div v-if="!isDesktop" class="p-0">
      <!-- Status Overview Tab Content -->
      <div v-if="activeTab === 'status'" class="animate-fade-in">
        <div class="p-3 sm:p-4 md:p-5">
          <!-- Status Cards -->
          <div class="grid grid-cols-3 gap-2 sm:gap-3 md:gap-4 mb-4 sm:mb-6">
            <!-- Normal Status Card -->
            <div
              @mouseenter="isHoveredCard = 'normal'"
              @mouseleave="isHoveredCard = null"
              class="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-900/40 border border-green-200 dark:border-green-800 rounded-xl p-2 sm:p-3 flex items-center justify-between transform transition-all duration-300"
              :class="{ 'scale-105 shadow-md': isHoveredCard === 'normal' }"
            >
              <div>
                <h3
                  class="text-green-800 dark:text-green-300 font-medium text-2xs sm:text-xs md:text-sm mb-0.5 sm:mb-1"
                >
                  Normal
                </h3>
                <p
                  class="text-lg sm:text-xl md:text-2xl font-bold text-green-600 dark:text-green-400"
                >
                  {{ statusCounts.normal }}
                </p>
                <p class="text-2xs sm:text-xs text-green-700 dark:text-green-300 opacity-80">
                  Sensors
                </p>
              </div>
            </div>

            <!-- Warning Status Card -->
            <div
              @mouseenter="isHoveredCard = 'warning'"
              @mouseleave="isHoveredCard = null"
              class="bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-900/20 dark:to-yellow-900/40 border border-yellow-200 dark:border-yellow-800 rounded-xl p-2 sm:p-3 flex items-center justify-between transform transition-all duration-300"
              :class="{ 'scale-105 shadow-md': isHoveredCard === 'warning' }"
            >
              <div>
                <h3
                  class="text-yellow-800 dark:text-yellow-300 font-medium text-2xs sm:text-xs md:text-sm mb-0.5 sm:mb-1"
                >
                  Warning
                </h3>
                <p
                  class="text-lg sm:text-xl md:text-2xl font-bold text-yellow-600 dark:text-yellow-400"
                >
                  {{ statusCounts.warning }}
                </p>
                <p class="text-2xs sm:text-xs text-yellow-700 dark:text-yellow-300 opacity-80">
                  Sensors
                </p>
              </div>
            </div>

            <!-- Critical Status Card -->
            <div
              @mouseenter="isHoveredCard = 'critical'"
              @mouseleave="isHoveredCard = null"
              class="bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-900/40 border border-red-200 dark:border-red-800 rounded-xl p-2 sm:p-3 flex items-center justify-between transform transition-all duration-300"
              :class="{ 'scale-105 shadow-md': isHoveredCard === 'critical' }"
            >
              <div>
                <h3
                  class="text-red-800 dark:text-red-300 font-medium text-2xs sm:text-xs md:text-sm mb-0.5 sm:mb-1"
                >
                  Critical
                </h3>
                <p class="text-lg sm:text-xl md:text-2xl font-bold text-red-600 dark:text-red-400">
                  {{ statusCounts.critical }}
                </p>
                <p class="text-2xs sm:text-xs text-red-700 dark:text-red-300 opacity-80">Sensors</p>
              </div>
            </div>
          </div>

          <!-- Key Metrics Section -->
          <div class="mt-6">
            <h3 class="text-sm sm:text-base font-medium text-gray-800 dark:text-gray-200 mb-3">
              Key Metrics
            </h3>
            <div class="mb-4">
              <!-- System Health Progress Bar -->
              <div>
                <div class="flex justify-between items-center mb-1">
                  <span class="text-2xs sm:text-xs text-gray-600 dark:text-gray-400"
                    >System Health</span
                  >
                  <span class="text-2xs sm:text-xs font-medium text-green-600 dark:text-green-400"
                    >63%</span
                  >
                </div>
                <div class="h-1.5 w-full bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div
                    class="h-full bg-green-500 dark:bg-green-600 rounded-full animate-progress"
                    style="width: 63%"
                  ></div>
                </div>
              </div>
            </div>

            <!-- Key Metrics Grid -->
            <div class="grid grid-cols-3 gap-2 sm:gap-3">
              <div
                v-for="metric in keyMetrics"
                :key="metric.name"
                class="bg-gray-50 dark:bg-gray-800 rounded-lg p-2 sm:p-3 border border-gray-100 dark:border-gray-700 transition-all duration-200 hover:shadow-sm"
              >
                <p class="text-2xs sm:text-xs text-gray-600 dark:text-gray-400 truncate mb-1">
                  {{ metric.name }}
                </p>
                <p class="text-sm sm:text-base font-bold" :class="getStatusColor(metric.status)">
                  {{ metric.value }}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Plant Health Tab Content -->
      <div v-if="activeTab === 'health'" class="animate-fade-in">
        <div class="p-3 sm:p-4 md:p-5">
          <!-- Health Score Display -->
          <div
            class="bg-gray-50 dark:bg-gray-800 rounded-lg p-2 sm:p-3 mb-3 flex items-center justify-between"
          >
            <div class="text-left">
              <p class="text-2xs sm:text-xs text-gray-500 dark:text-gray-400 mb-0.5">
                Overall Health Score
              </p>
              <div class="flex items-baseline">
                <span class="text-base sm:text-lg font-bold mr-1" :class="healthScoreColor">{{
                  plantHealthScore
                }}</span>
                <span class="text-2xs sm:text-xs text-gray-500 dark:text-gray-400">/ 100</span>
              </div>
            </div>

            <!-- Health Score Progress Circle -->
            <div class="relative w-12 h-12 sm:w-16 sm:h-16 flex-shrink-0">
              <svg class="w-full h-full" viewBox="0 0 100 100">
                <!-- Background circle -->
                <circle
                  class="stroke-current"
                  :class="healthScoreBgColor"
                  stroke-width="10"
                  cx="50"
                  cy="50"
                  r="40"
                  fill="transparent"
                ></circle>
                <!-- Progress circle -->
                <circle
                  stroke-width="10"
                  stroke-linecap="round"
                  stroke-dasharray="251.2"
                  :stroke-dashoffset="251.2 - (251.2 * plantHealthScore) / 100"
                  cx="50"
                  cy="50"
                  r="40"
                  fill="transparent"
                  transform="rotate(-90 50 50)"
                  class="transition-all duration-1000 ease-out"
                  :stroke="healthScoreSvgColor"
                ></circle>
                <!-- Text in center -->
                <text
                  x="50"
                  y="50"
                  class="text-sm sm:text-base font-bold"
                  :fill="healthScoreSvgColor"
                  dominant-baseline="middle"
                  text-anchor="middle"
                >
                  {{ plantHealthScore }}
                </text>
              </svg>
            </div>
          </div>

          <!-- Key Factors Section -->
          <div class="space-y-2 sm:space-y-3">
            <h3 class="text-sm sm:text-base font-medium text-gray-800 dark:text-gray-200 mb-2">
              Key Factors
            </h3>

            <!-- Factors Grid -->
            <div class="grid grid-cols-3 gap-2 sm:gap-3">
              <!-- Soil Moisture -->
              <div
                v-if="soilMoisture"
                class="bg-gray-50 dark:bg-gray-800 rounded-lg p-2 sm:p-3 border border-gray-100 dark:border-gray-700 transition-all duration-200 hover:shadow-sm"
              >
                <div class="flex items-center mb-1.5">
                  <span
                    class="mdi mdi-water text-blue-500 dark:text-blue-400 mr-1.5 text-sm flex-shrink-0"
                  ></span>
                  <span
                    class="text-2xs sm:text-xs font-medium text-gray-700 dark:text-gray-300 truncate"
                    >Soil Moisture</span
                  >
                </div>
                <div class="flex items-center">
                  <span
                    class="text-sm sm:text-base font-bold mr-1"
                    :class="getStatusColor(soilMoisture.status)"
                  >
                    {{ soilMoisture.value }}{{ soilMoisture.unit }}
                  </span>
                  <span
                    class="mdi text-xs sm:text-sm flex-shrink-0"
                    :class="{
                      'mdi-check-circle text-green-500 dark:text-green-400':
                        soilMoisture.status === 'normal',
                      'mdi-alert text-yellow-500 dark:text-yellow-400':
                        soilMoisture.status === 'warning',
                      'mdi-alert-circle text-red-500 dark:text-red-400':
                        soilMoisture.status === 'critical',
                    }"
                  ></span>
                </div>
              </div>

              <!-- Soil pH -->
              <div
                v-if="soilPh"
                class="bg-gray-50 dark:bg-gray-800 rounded-lg p-2 sm:p-3 border border-gray-100 dark:border-gray-700 transition-all duration-200 hover:shadow-sm"
              >
                <div class="flex items-center mb-1.5">
                  <span
                    class="mdi mdi-test-tube text-purple-500 dark:text-purple-400 mr-1.5 text-sm flex-shrink-0"
                  ></span>
                  <span
                    class="text-2xs sm:text-xs font-medium text-gray-700 dark:text-gray-300 truncate"
                    >Soil pH</span
                  >
                </div>
                <div class="flex items-center">
                  <span
                    class="text-sm sm:text-base font-bold mr-1"
                    :class="getStatusColor(soilPh.status)"
                  >
                    {{ soilPh.value }}{{ soilPh.unit }}
                  </span>
                  <span
                    class="mdi text-xs sm:text-sm flex-shrink-0"
                    :class="{
                      'mdi-check-circle text-green-500 dark:text-green-400':
                        soilPh.status === 'normal',
                      'mdi-alert text-yellow-500 dark:text-yellow-400': soilPh.status === 'warning',
                      'mdi-alert-circle text-red-500 dark:text-red-400':
                        soilPh.status === 'critical',
                    }"
                  ></span>
                </div>
              </div>

              <!-- Air Temperature -->
              <div
                v-if="airTemperature"
                class="bg-gray-50 dark:bg-gray-800 rounded-lg p-2 sm:p-3 border border-gray-100 dark:border-gray-700 transition-all duration-200 hover:shadow-sm"
              >
                <div class="flex items-center mb-1.5">
                  <span
                    class="mdi mdi-thermometer text-red-500 dark:text-red-400 mr-1.5 text-sm flex-shrink-0"
                  ></span>
                  <span
                    class="text-2xs sm:text-xs font-medium text-gray-700 dark:text-gray-300 truncate"
                    >Air Temperature</span
                  >
                </div>
                <div class="flex items-center">
                  <span
                    class="text-sm sm:text-base font-bold mr-1"
                    :class="getStatusColor(airTemperature.status)"
                  >
                    {{ airTemperature.value }}{{ airTemperature.unit }}
                  </span>
                  <span
                    class="mdi text-xs sm:text-sm flex-shrink-0"
                    :class="{
                      'mdi-check-circle text-green-500 dark:text-green-400':
                        airTemperature.status === 'normal',
                      'mdi-alert text-yellow-500 dark:text-yellow-400':
                        airTemperature.status === 'warning',
                      'mdi-alert-circle text-red-500 dark:text-red-400':
                        airTemperature.status === 'critical',
                    }"
                  ></span>
                </div>
              </div>
            </div>

            <!-- Growth Prediction -->
            <div
              class="bg-gray-50 dark:bg-gray-800 rounded-lg p-3 sm:p-4 border border-gray-100 dark:border-gray-700"
            >
              <div class="flex justify-between items-center flex-wrap gap-1 sm:gap-2">
                <span class="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300"
                  >Growth Prediction</span
                >
                <span
                  class="px-2 sm:px-2.5 py-1 rounded-full text-xs font-medium whitespace-nowrap"
                  :class="{
                    'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300':
                      growthPrediction === 'Excellent',
                    'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300':
                      growthPrediction === 'Good',
                    'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300':
                      growthPrediction === 'Fair',
                    'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300':
                      growthPrediction === 'Poor',
                    'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300':
                      growthPrediction === 'Critical',
                  }"
                >
                  {{ growthPrediction }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
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

.plant-status-dashboard {
  animation: fadeIn 0.5s ease-out;
}

/* Pulse animation */
@keyframes pulse {
  0% {
    box-shadow: 0 0 0 0 rgba(var(--pulse-color), 0.7);
  }
  70% {
    box-shadow: 0 0 0 10px rgba(var(--pulse-color), 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(var(--pulse-color), 0);
  }
}

@keyframes fillProgress {
  from {
    width: 0%;
  }
  to {
    width: 63%;
  }
}

.animate-progress {
  animation: fillProgress 1s ease-out forwards;
}
</style>
