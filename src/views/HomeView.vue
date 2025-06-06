<script setup lang="ts">
import { ref, onMounted, type Ref, computed, onUnmounted } from 'vue'
import SensorCard from '../components/SensorCard.vue'
import SensorChart from '../components/SensorChart.vue'
import PlantStatusDashboard from '@/components/PlantStatusDashboard.vue'

const windowWidth = ref(window.innerWidth)

function updateWindowWidth() {
  windowWidth.value = window.innerWidth
}

onMounted(() => {
  window.addEventListener('resize', updateWindowWidth)
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
  soilTemperature: generateMockData(24, 20, 30),
  soilMoisture: generateMockData(24, 50, 80),
  soilPH: generateMockData(24, 6, 7.5),
  airTemperature: generateMockData(24, 25, 35),
  airHumidity: generateMockData(24, 60, 90),
})

function generateMockData(points: number, min: number, max: number) {
  const data = []
  const now = new Date()

  for (let i = points; i > 0; i--) {
    const time = new Date(now.getTime() - i * 60 * 60 * 1000)
    data.push({
      time: time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      value: parseFloat((Math.random() * (max - min) + min).toFixed(1)),
    })
  }

  return data
}

const lastUpdate: Ref = ref(
  `Today, ${new Date().toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
  })}`,
)

const viewMode = ref('grid')

const quickActions = [
  { name: 'Refresh Data', icon: 'refresh', action: updateData },
  { name: 'Toggle View', icon: 'view-grid-outline', action: toggleViewMode },
  {
    name: 'Export Data',
    icon: 'download-outline',
    action: () => alert('Export functionality would be implemented here'),
  },
  {
    name: 'System Check',
    icon: 'check-circle-outline',
    action: () => alert('System check would be implemented here'),
  },
]

function toggleViewMode() {
  viewMode.value = viewMode.value === 'grid' ? 'compact' : 'grid'
}

function updateData() {
  sensorData.value.soilTemperature.value = parseFloat(
    (sensorData.value.soilTemperature.value + (Math.random() * 0.6 - 0.3)).toFixed(1),
  )
  sensorData.value.soilMoisture.value = parseFloat(
    (sensorData.value.soilMoisture.value + (Math.random() * 2 - 1)).toFixed(1),
  )
  sensorData.value.soilPH.value = parseFloat(
    (sensorData.value.soilPH.value + (Math.random() * 0.2 - 0.1)).toFixed(1),
  )
  sensorData.value.airTemperature.value = parseFloat(
    (sensorData.value.airTemperature.value + (Math.random() * 0.8 - 0.4)).toFixed(1),
  )
  sensorData.value.airHumidity.value = parseFloat(
    (sensorData.value.airHumidity.value + (Math.random() * 3 - 1.5)).toFixed(1),
  )
  sensorData.value.lightIntensity.value = parseFloat(
    (sensorData.value.lightIntensity.value + (Math.random() * 50 - 25)).toFixed(0),
  )

  sensorData.value.soilTemperature.status = getSensorStatus(
    sensorData.value.soilTemperature.value,
    15,
    20,
    28,
    32,
  )
  sensorData.value.soilMoisture.status = getSensorStatus(
    sensorData.value.soilMoisture.value,
    30,
    40,
    75,
    85,
  )
  sensorData.value.soilPH.status = getSensorStatus(sensorData.value.soilPH.value, 5, 5.5, 7.5, 8)
  sensorData.value.airTemperature.status = getSensorStatus(
    sensorData.value.airTemperature.value,
    15,
    20,
    30,
    35,
  )
  sensorData.value.airHumidity.status = getSensorStatus(
    sensorData.value.airHumidity.value,
    30,
    40,
    80,
    90,
  )

  lastUpdate.value = ref(
    `Today, ${new Date().toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true,
    })}`,
  )

  Object.keys(historicalData.value).forEach((key) => {
    const data = historicalData.value[key]
    data.shift()
    const now = new Date()
    data.push({
      time: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      value: sensorData.value[key].value,
    })
  })
}

function getSensorStatus(
  value: number,
  criticalLow: number,
  warningLow: number,
  warningHigh: number,
  criticalHigh: number,
) {
  if (value <= criticalLow || value >= criticalHigh) return 'critical'
  if (value <= warningLow || value >= warningHigh) return 'warning'
  return 'normal'
}

const plantHealthScore = computed(() => {
  const soilTempScore = getParameterScore(sensorData.value.soilTemperature.value, 22, 26, 15, 32)
  const soilMoistureScore = getParameterScore(sensorData.value.soilMoisture.value, 60, 70, 30, 85)
  const soilPHScore = getParameterScore(sensorData.value.soilPH.value, 6.5, 7.0, 5.0, 8.0)
  const airTempScore = getParameterScore(sensorData.value.airTemperature.value, 24, 28, 15, 35)
  const airHumidityScore = getParameterScore(sensorData.value.airHumidity.value, 65, 75, 30, 90)

  const totalScore =
    soilTempScore * 0.2 +
    soilMoistureScore * 0.3 +
    soilPHScore * 0.2 +
    airTempScore * 0.15 +
    airHumidityScore * 0.15

  return Math.round(totalScore)
})

function getParameterScore(
  value: number,
  optimalMin: number,
  optimalMax: number,
  absMin: number,
  absMax: number,
) {
  if (value >= optimalMin && value <= optimalMax) return 100

  if (value < optimalMin) {
    return Math.round(((value - absMin) / (optimalMin - absMin)) * 80)
  } else {
    return Math.round(((absMax - value) / (absMax - optimalMax)) * 80)
  }
}

const growthPrediction = computed(() => {
  if (plantHealthScore.value >= 90) return 'Excellent'
  if (plantHealthScore.value >= 75) return 'Good'
  if (plantHealthScore.value >= 60) return 'Fair'
  if (plantHealthScore.value >= 40) return 'Poor'
  return 'Critical'
})

const growthPredictionColor = computed(() => {
  if (plantHealthScore.value >= 90) return 'text-green-600 dark:text-green-400'
  if (plantHealthScore.value >= 75) return 'text-green-500 dark:text-green-500'
  if (plantHealthScore.value >= 60) return 'text-amber-500 dark:text-amber-400'
  if (plantHealthScore.value >= 40) return 'text-amber-600 dark:text-amber-500'
  return 'text-red-600 dark:text-red-400'
})

const systemStatus = computed(() => {
  const statuses = Object.values(sensorData.value).map((item) => item.status)
  if (statuses.includes('critical')) return 'critical'
  if (statuses.includes('warning')) return 'warning'
  return 'normal'
})

const sensorDataArray = computed(() => {
  return [
    { type: 'soil_moisture', ...sensorData.value.soilMoisture },
    { type: 'soil_ph', ...sensorData.value.soilPH },
    { type: 'air_temperature', ...sensorData.value.airTemperature },
    { type: 'soil_temperature', ...sensorData.value.soilTemperature },
    { type: 'air_humidity', ...sensorData.value.airHumidity },
    { type: 'light_intensity', ...sensorData.value.lightIntensity },
  ]
})

const systemStatusText = computed(() => {
  switch (systemStatus.value) {
    case 'critical':
      return 'Critical Issues'
    case 'warning':
      return 'Needs Attention'
    default:
      return 'All Systems Normal'
  }
})

onMounted(() => {
  setInterval(updateData, 5000)
})
</script>

<template>
  <div class="container mx-auto px-4 py-6">
    <!-- Enhanced Dashboard Header with improved responsive text sizes -->
    <div class="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
      <div>
        <h1 class="text-xl sm:text-2xl font-bold text-gray-800 dark:text-gray-100 mb-2">
          Dashboard
        </h1>
        <p class="text-sm sm:text-base text-gray-600 dark:text-gray-300 mb-1">
          Real-time monitoring dashboard for plant growth optimization
        </p>
        <div class="flex items-center mt-2">
          <span
            class="inline-flex items-center px-2 sm:px-2.5 py-0.5 rounded-full text-xs font-medium"
            :class="{
              'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300':
                systemStatus === 'normal',
              'bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-300':
                systemStatus === 'warning',
              'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300':
                systemStatus === 'critical',
            }"
          >
            <span
              class="mdi mr-1"
              :class="{
                'mdi-check-circle': systemStatus === 'normal',
                'mdi-alert-circle': systemStatus === 'warning',
                'mdi-alert-octagon': systemStatus === 'critical',
              }"
            ></span>
            {{ systemStatusText }}
          </span>
          <span class="text-xs text-gray-500 dark:text-gray-400 ml-3"
            >Last updated: {{ lastUpdate }}</span
          >
        </div>
      </div>

      <!-- Quick Actions Bar with improved responsive spacing -->
      <div class="mt-4 md:mt-0 flex flex-wrap gap-1 sm:gap-2">
        <button
          v-for="action in quickActions"
          :key="action.name"
          @click="action.action"
          class="inline-flex items-center px-2 sm:px-3 py-1.5 sm:py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 dark:focus:ring-offset-gray-900 transition-colors shadow-sm"
        >
          <span class="mdi" :class="`mdi-${action.icon}`"></span>
          <span class="ml-1 sm:ml-1.5 hidden sm:inline">{{ action.name }}</span>
        </button>
      </div>
    </div>

    <!-- Dashboard Header with System Status and Plant Health Overview -->
    <div class="mb-10">
      <PlantStatusDashboard
        :sensor-data="sensorData"
        :plant-health-score="plantHealthScore"
        :growth-prediction="growthPrediction"
        :system-status="systemStatus"
      />
    </div>

    <!-- Plant Growth Analysis with Insights -->
    <div class="mb-6 sm:mb-8">
      <div
        class="bg-white dark:bg-gray-900 rounded-xl shadow-md overflow-hidden border border-gray-100 dark:border-gray-700 transition-all duration-300 hover:shadow-lg w-full"
      >
        <div class="h-1 sm:h-1.5 w-full bg-gradient-to-r from-primary-400 to-primary-500"></div>
        <div class="p-3 sm:p-4 md:p-6">
          <div class="flex items-center mb-3 sm:mb-4">
            <div
              class="bg-green-100 dark:bg-green-900/30 p-1.5 sm:p-2 rounded-lg mr-2 sm:mr-3 flex-shrink-0"
            >
              <span
                class="mdi mdi-sprout text-green-600 dark:text-green-400 text-lg sm:text-xl"
              ></span>
            </div>
            <h2 class="text-lg sm:text-xl font-semibold text-gray-800 dark:text-gray-200 truncate">
              Plant Growth Analysis
            </h2>
          </div>

          <div class="mb-4 sm:mb-5">
            <h3 class="text-sm sm:text-base font-medium text-gray-700 dark:text-gray-300 mb-2">
              Growth Recommendations
            </h3>
            <div class="bg-gray-50 dark:bg-gray-800 rounded-lg p-3 sm:p-4">
              <p class="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-2 sm:mb-3">
                Based on current sensor readings and historical data, we recommend the following
                actions to optimize plant growth:
              </p>
              <ul
                class="space-y-1 sm:space-y-2 text-xs sm:text-sm text-gray-600 dark:text-gray-400"
              >
                <li class="flex items-start">
                  <span
                    class="mdi mdi-check-circle text-green-500 mr-1.5 mt-0.5 flex-shrink-0"
                  ></span>
                  <span>Maintain current watering schedule for optimal soil moisture levels</span>
                </li>
                <li class="flex items-start">
                  <span
                    class="mdi mdi-check-circle text-green-500 mr-1.5 mt-0.5 flex-shrink-0"
                  ></span>
                  <span>Consider adding nitrogen-rich fertilizer within the next 3-5 days</span>
                </li>
                <li class="flex items-start">
                  <span
                    class="mdi mdi-alert-circle text-amber-500 mr-1.5 mt-0.5 flex-shrink-0"
                  ></span>
                  <span
                    >Monitor air temperature during midday as it approaches upper threshold</span
                  >
                </li>
              </ul>
            </div>
          </div>

          <div>
            <h3 class="text-sm sm:text-base font-medium text-gray-700 dark:text-gray-300 mb-2">
              Growth Metrics
            </h3>
            <div class="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4">
              <div
                class="bg-gray-50 dark:bg-gray-800 rounded-lg p-2 sm:p-3 flex flex-col items-center justify-center text-center"
              >
                <span class="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mb-1"
                  >Growth Rate</span
                >
                <span
                  class="text-base sm:text-lg md:text-xl font-bold text-green-600 dark:text-green-400"
                  >+2.3 cm/week</span
                >
              </div>
              <div
                class="bg-gray-50 dark:bg-gray-800 rounded-lg p-2 sm:p-3 flex flex-col items-center justify-center text-center"
              >
                <span class="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mb-1"
                  >Leaf Count</span
                >
                <span
                  class="text-base sm:text-lg md:text-xl font-bold text-gray-800 dark:text-gray-200"
                  >12 leaves</span
                >
              </div>
              <div
                class="bg-gray-50 dark:bg-gray-800 rounded-lg p-2 sm:p-3 flex flex-col items-center justify-center text-center"
              >
                <span class="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mb-1"
                  >Est. Yield</span
                >
                <span
                  class="text-base sm:text-lg md:text-xl font-bold text-amber-600 dark:text-amber-400"
                  >Medium</span
                >
              </div>
              <div
                class="bg-gray-50 dark:bg-gray-800 rounded-lg p-2 sm:p-3 flex flex-col items-center justify-center text-center"
              >
                <span class="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mb-1"
                  >Time to Harvest</span
                >
                <span
                  class="text-base sm:text-lg md:text-xl font-bold text-blue-600 dark:text-blue-400"
                  >~18 days</span
                >
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Sensor Cards Grid with improved spacing and animations -->
    <div class="mb-6 sm:mb-8">
      <div
        class="bg-white dark:bg-gray-900 rounded-xl shadow-md overflow-hidden border border-gray-100 dark:border-gray-700 transition-all duration-300 hover:shadow-lg w-full"
      >
        <div class="h-1 sm:h-1.5 w-full bg-gradient-to-r from-primary-400 to-primary-500"></div>
        <div class="p-3 sm:p-4 md:p-6">
          <div
            class="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 sm:mb-6 gap-3 sm:gap-4"
          >
            <div class="flex items-center min-w-0">
              <div
                class="bg-primary-100 dark:bg-primary-900/30 p-1.5 sm:p-2 rounded-lg mr-2 sm:mr-3 flex-shrink-0"
              >
                <span
                  class="mdi mdi-gauge text-primary-600 dark:text-primary-400 text-base sm:text-lg md:text-xl"
                ></span>
              </div>
              <h2
                class="text-base sm:text-lg md:text-xl font-semibold text-gray-800 dark:text-gray-200 truncate"
              >
                Sensor Readings
              </h2>
            </div>

            <div
              class="flex items-center space-x-1.5 sm:space-x-2 md:space-x-3 self-end sm:self-auto flex-shrink-0"
            >
              <button
                @click="toggleViewMode"
                class="flex items-center px-2 sm:px-3 md:px-4 py-1 sm:py-1.5 md:py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200 text-xs sm:text-sm"
              >
                <span
                  class="mdi mr-1 sm:mr-2 text-gray-600 dark:text-gray-300"
                  :class="{
                    'mdi-view-grid-outline': viewMode === 'grid',
                    'mdi-view-sequential-outline': viewMode === 'compact',
                  }"
                ></span>
                <span class="font-medium text-gray-700 dark:text-gray-300 whitespace-nowrap">
                  {{ viewMode === 'grid' ? 'Grid View' : 'Compact View' }}
                </span>
              </button>

              <button
                @click="updateData"
                class="flex items-center px-2 sm:px-3 md:px-4 py-1 sm:py-1.5 md:py-2 bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-800 rounded-lg text-primary-700 dark:text-primary-300 hover:bg-primary-100 dark:hover:bg-primary-900/30 transition-colors duration-200 text-xs sm:text-sm"
              >
                <span class="mdi mdi-refresh mr-1 sm:mr-2 flex-shrink-0"></span>
                <span class="font-medium whitespace-nowrap">Refresh</span>
              </button>
            </div>
          </div>

          <!-- Grid View with improved responsive design -->
          <div
            v-if="viewMode === 'grid'"
            class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-5 lg:gap-6 animate-fade-in"
          >
            <SensorCard
              title="Soil Temperature"
              :value="sensorData.soilTemperature.value"
              :unit="sensorData.soilTemperature.unit"
              :status="sensorData.soilTemperature.status as 'normal' | 'warning' | 'critical'"
              icon="mdi-thermometer"
            />

            <SensorCard
              title="Soil Moisture"
              :value="sensorData.soilMoisture.value"
              :unit="sensorData.soilMoisture.unit"
              :status="sensorData.soilMoisture.status as 'normal' | 'warning' | 'critical'"
              icon="mdi-water-percent"
            />

            <SensorCard
              title="Soil pH"
              :value="sensorData.soilPH.value"
              :unit="sensorData.soilPH.unit"
              :status="sensorData.soilPH.status as 'normal' | 'warning' | 'critical'"
              icon="mdi-test-tube"
            />

            <SensorCard
              title="Air Temperature"
              :value="sensorData.airTemperature.value"
              :unit="sensorData.airTemperature.unit"
              :status="sensorData.airTemperature.status as 'normal' | 'warning' | 'critical'"
              icon="mdi-thermometer-lines"
            />

            <SensorCard
              title="Air Humidity"
              :value="sensorData.airHumidity.value"
              :unit="sensorData.airHumidity.unit"
              :status="sensorData.airHumidity.status as 'normal' | 'warning' | 'critical'"
              icon="mdi-water-outline"
            />

            <SensorCard
              title="Light Intensity"
              :value="sensorData.lightIntensity.value"
              :unit="sensorData.lightIntensity.unit"
              :status="sensorData.lightIntensity.status as 'normal' | 'warning' | 'critical'"
              icon="mdi-white-balance-sunny"
            />
          </div>

          <!-- Compact View with improved list design -->
          <div v-else class="space-y-3 sm:space-y-4 animate-fade-in">
            <div
              v-for="(sensor, key) in sensorData"
              :key="key"
              class="bg-white dark:bg-gray-800 rounded-xl border overflow-hidden transition-all duration-300 hover:shadow-md flex flex-col sm:flex-row w-full max-w-full"
              :class="{
                'border-green-200 dark:border-green-700': sensor.status === 'normal',
                'border-yellow-200 dark:border-yellow-700': sensor.status === 'warning',
                'border-red-200 dark:border-red-700': sensor.status === 'critical',
              }"
            >
              <!-- Status indicator bar at left for larger screens -->
              <div
                class="hidden sm:block w-1.5 sm:w-2 flex-shrink-0"
                :class="{
                  'bg-green-500 dark:bg-green-600': sensor.status === 'normal',
                  'bg-yellow-500 dark:bg-yellow-600': sensor.status === 'warning',
                  'bg-red-500 dark:bg-red-600': sensor.status === 'critical',
                }"
              ></div>

              <!-- Status indicator bar at top for mobile -->
              <div
                class="h-1 sm:h-1.5 sm:hidden w-full"
                :class="{
                  'bg-green-500 dark:bg-green-600': sensor.status === 'normal',
                  'bg-yellow-500 dark:bg-yellow-600': sensor.status === 'warning',
                  'bg-red-500 dark:bg-red-600': sensor.status === 'critical',
                }"
              ></div>

              <div
                class="p-3 sm:p-4 md:p-5 flex-grow flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 min-w-0"
              >
                <!-- Sensor info -->
                <div class="flex items-center min-w-0">
                  <span
                    class="mdi text-lg sm:text-xl mr-2 sm:mr-3 bg-primary-50 dark:bg-primary-900/30 p-1.5 sm:p-2 rounded-lg text-primary-500 dark:text-primary-400 flex-shrink-0"
                    :class="{
                      'mdi-thermometer': key === 'soilTemperature' || key === 'airTemperature',
                      'mdi-water-percent': key === 'soilMoisture',
                      'mdi-test-tube': key === 'soilPH',
                      'mdi-water-outline': key === 'airHumidity',
                      'mdi-white-balance-sunny': key === 'lightIntensity',
                    }"
                  ></span>
                  <div class="min-w-0">
                    <h3
                      class="font-medium text-gray-800 dark:text-gray-200 mb-0.5 sm:mb-1 text-sm sm:text-base truncate"
                    >
                      {{
                        key === 'soilTemperature'
                          ? 'Soil Temperature'
                          : key === 'soilMoisture'
                            ? 'Soil Moisture'
                            : key === 'soilPH'
                              ? 'Soil pH'
                              : key === 'airTemperature'
                                ? 'Air Temperature'
                                : key === 'airHumidity'
                                  ? 'Air Humidity'
                                  : key === 'lightIntensity'
                                    ? 'Light Intensity'
                                    : key
                      }}
                    </h3>
                    <div class="flex items-center">
                      <span
                        class="mdi text-xs sm:text-sm mr-1 flex-shrink-0"
                        :class="{
                          'mdi-check-circle text-green-500 dark:text-green-400':
                            sensor.status === 'normal',
                          'mdi-alert text-yellow-500 dark:text-yellow-400':
                            sensor.status === 'warning',
                          'mdi-alert-circle text-red-500 dark:text-red-400':
                            sensor.status === 'critical',
                        }"
                      ></span>
                      <span
                        class="text-xs font-medium truncate"
                        :class="{
                          'text-green-700 dark:text-green-300': sensor.status === 'normal',
                          'text-yellow-700 dark:text-yellow-300': sensor.status === 'warning',
                          'text-red-700 dark:text-red-300': sensor.status === 'critical',
                        }"
                      >
                        {{ sensor.status.charAt(0).toUpperCase() + sensor.status.slice(1) }}
                      </span>
                    </div>
                  </div>
                </div>

                <!-- Value display -->
                <div class="flex items-baseline flex-shrink-0">
                  <span
                    class="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100 mr-1 sm:mr-2 whitespace-nowrap"
                  >
                    {{ sensor.value }}
                  </span>
                  <span
                    class="text-xs sm:text-sm text-gray-500 dark:text-gray-400 whitespace-nowrap"
                    >{{ sensor.unit }}</span
                  >
                </div>

                <!-- Quick actions -->
                <div class="flex space-x-1 sm:space-x-2 md:space-x-3 flex-shrink-0">
                  <button
                    class="p-1 sm:p-1.5 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors duration-200"
                    title="View Details"
                  >
                    <span class="mdi mdi-information-outline text-base sm:text-lg"></span>
                  </button>
                  <button
                    class="p-1 sm:p-1.5 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors duration-200"
                    title="View Chart"
                  >
                    <span class="mdi mdi-chart-line text-base sm:text-lg"></span>
                  </button>
                  <button
                    class="p-1 sm:p-1.5 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors duration-200"
                    title="View History"
                  >
                    <span class="mdi mdi-history text-base sm:text-lg"></span>
                  </button>
                  <button
                    class="p-1 sm:p-1.5 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors duration-200"
                    title="More Options"
                  >
                    <span class="mdi mdi-dots-vertical text-base sm:text-lg"></span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Sensor Trends Section with improved styling -->
    <div class="mb-6 sm:mb-8">
      <div
        class="bg-white dark:bg-gray-900 rounded-xl shadow-md overflow-hidden border border-gray-100 dark:border-gray-700 transition-all duration-300 hover:shadow-lg w-full max-w-full"
      >
        <div class="h-1 sm:h-1.5 w-full bg-gradient-to-r from-indigo-400 to-indigo-500"></div>
        <div class="p-3 sm:p-4 md:p-6">
          <div
            class="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 sm:mb-6 gap-3 sm:gap-4"
          >
            <div class="flex items-center min-w-0">
              <div
                class="bg-indigo-100 dark:bg-indigo-900/30 p-1.5 sm:p-2 rounded-lg mr-2 sm:mr-3 flex-shrink-0"
              >
                <span
                  class="mdi mdi-chart-line-variant text-indigo-600 dark:text-indigo-400 text-lg sm:text-xl"
                ></span>
              </div>
              <h2
                class="text-lg sm:text-xl font-semibold text-gray-800 dark:text-gray-200 truncate"
              >
                Sensor Trends
              </h2>
            </div>

            <div
              class="flex items-center space-x-1 sm:space-x-2 self-end sm:self-auto flex-shrink-0"
            >
              <button
                class="px-2 sm:px-3 py-0.5 sm:py-1 rounded-lg text-xs sm:text-sm font-medium transition-colors duration-200"
                :class="{
                  'bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300': true,
                  'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700': false,
                }"
              >
                24h
              </button>
              <button
                class="px-2 sm:px-3 py-0.5 sm:py-1 rounded-lg text-xs sm:text-sm font-medium transition-colors duration-200 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                7d
              </button>
              <button
                class="px-2 sm:px-3 py-0.5 sm:py-1 rounded-lg text-xs sm:text-sm font-medium transition-colors duration-200 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                30d
              </button>
            </div>
          </div>

          <!-- Charts with improved responsive grid -->
          <div
            class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-3 sm:gap-4 md:gap-6 animate-fade-in"
          >
            <!-- Soil Temperature Chart -->
            <div class="p-0 sm:p-2 md:p-4">
              <SensorChart
                :data="historicalData.soilTemperature"
                color="#6366f1"
                :height="windowWidth < 640 ? 180 : 200"
                title="Soil Temperature"
                valueLabel="Temperature (°C)"
              />
            </div>

            <!-- Soil Moisture Chart -->
            <div class="p-0 sm:p-2 md:p-4">
              <SensorChart
                :data="historicalData.soilMoisture"
                color="#3b82f6"
                :height="windowWidth < 640 ? 180 : 200"
                title="Soil Moisture"
                valueLabel="Moisture (%)"
              />
            </div>

            <!-- Soil pH Chart -->
            <div class="p-0 sm:p-2 md:p-4">
              <SensorChart
                :data="historicalData.soilPH"
                color="#8b5cf6"
                :height="windowWidth < 640 ? 180 : 200"
                title="Soil pH"
                valueLabel="pH Level"
              />
            </div>

            <!-- Air Conditions Chart -->
            <div class="p-0 sm:p-2 md:p-4">
              <SensorChart
                :data="historicalData.airTemperature"
                color="#06b6d4"
                :height="windowWidth < 640 ? 180 : 200"
                title="Air Temperature"
                valueLabel="Temperature (°C)"
              />
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

.animate-fade-in {
  animation: fadeIn 0.5s ease-out forwards;
}

/* Hover effects for cards */
.card-hover {
  transition: all 0.3s ease;
}

.card-hover:hover {
  transform: translateY(-4px);
  box-shadow:
    0 10px 25px -5px rgba(0, 0, 0, 0.1),
    0 10px 10px -5px rgba(0, 0, 0, 0.04);
}

/* Pulse animation for status indicators */
@keyframes pulse {
  0% {
    opacity: 0.6;
  }
  50% {
    opacity: 1;
  }
  100% {
    opacity: 0.6;
  }
}

.animate-pulse {
  animation: pulse 2s infinite ease-in-out;
}

/* Responsive adjustments */
@media (max-width: 640px) {
  .dashboard-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .dashboard-header > div {
    margin-top: 1rem;
    width: 100%;
  }
}

/* Progress bar animation */
@keyframes fillProgress {
  from {
    width: 0;
  }
  to {
    width: var(--progress-width, 0%);
  }
}

.animate-progress {
  animation: fillProgress 1s ease-out forwards;
}

/* Transition for dark mode */
.dark-mode-transition {
  transition:
    background-color 0.3s ease,
    color 0.3s ease,
    border-color 0.3s ease;
}
</style>
