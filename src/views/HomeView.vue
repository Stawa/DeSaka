<script setup lang="ts">
import { ref, onMounted, type Ref, computed } from 'vue'
import SensorCard from '../components/SensorCard.vue'
import SensorChart from '../components/SensorChart.vue'
import StatusOverview from '../components/StatusOverview.vue'
import SystemMetrics from '../components/SystemMetrics.vue'

// Define types with index signatures
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

// Computed properties for dashboard insights
const plantHealthScore = computed(() => {
  // Calculate a health score based on sensor values
  const soilTempScore = getParameterScore(sensorData.value.soilTemperature.value, 22, 26, 15, 32)
  const soilMoistureScore = getParameterScore(sensorData.value.soilMoisture.value, 60, 70, 30, 85)
  const soilPHScore = getParameterScore(sensorData.value.soilPH.value, 6.5, 7.0, 5.0, 8.0)
  const airTempScore = getParameterScore(sensorData.value.airTemperature.value, 24, 28, 15, 35)
  const airHumidityScore = getParameterScore(sensorData.value.airHumidity.value, 65, 75, 30, 90)

  // Calculate average score (weighted)
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
  // Perfect score if in optimal range
  if (value >= optimalMin && value <= optimalMax) return 100

  // Calculate score based on distance from optimal range
  if (value < optimalMin) {
    return Math.round(((value - absMin) / (optimalMin - absMin)) * 80)
  } else {
    return Math.round(((absMax - value) / (absMax - optimalMax)) * 80)
  }
}

// Growth prediction based on current conditions
const growthPrediction = computed(() => {
  if (plantHealthScore.value >= 90) return 'Excellent'
  if (plantHealthScore.value >= 75) return 'Good'
  if (plantHealthScore.value >= 60) return 'Fair'
  if (plantHealthScore.value >= 40) return 'Poor'
  return 'Critical'
})

// Growth prediction color
const growthPredictionColor = computed(() => {
  if (plantHealthScore.value >= 90) return 'text-green-600 dark:text-green-400'
  if (plantHealthScore.value >= 75) return 'text-green-500 dark:text-green-500'
  if (plantHealthScore.value >= 60) return 'text-amber-500 dark:text-amber-400'
  if (plantHealthScore.value >= 40) return 'text-amber-600 dark:text-amber-500'
  return 'text-red-600 dark:text-red-400'
})

onMounted(() => {
  setInterval(updateData, 5000)
})
</script>

<template>
  <div class="container mx-auto px-4 py-6">
    <div class="mb-6">
      <h1 class="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-2">Dashboard</h1>
      <p class="text-gray-600 dark:text-gray-300 mb-4">
        Real-time monitoring dashboard for plant growth optimization
      </p>
      <p class="text-sm text-gray-500 dark:text-gray-400">Last updated: {{ lastUpdate }}</p>
    </div>
    <!-- Dashboard Header with System Status and Plant Health Overview -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
      <!-- System Status Overview -->
      <StatusOverview
        :sensor-data="sensorData"
        class="transform hover:-translate-y-1 transition-all duration-300"
      />

      <!-- Plant Health Score Card -->
      <div
        class="bg-white dark:bg-gray-900 rounded-2xl shadow-lg p-4 sm:p-6 border border-gray-100 dark:border-gray-700 transition-all duration-300 hover:shadow-xl backdrop-blur-sm transform hover:-translate-y-1"
      >
        <div class="flex items-center mb-3 sm:mb-4">
          <div class="bg-green-100 dark:bg-green-900/30 p-2 rounded-lg mr-3 flex-shrink-0">
            <span class="mdi mdi-sprout text-green-600 dark:text-green-400 text-xl"></span>
          </div>
          <h2 class="text-lg sm:text-xl font-semibold text-gray-800 dark:text-gray-200 truncate">
            Plant Health Score
          </h2>
        </div>

        <div class="flex flex-wrap items-center justify-between mb-3 sm:mb-4 gap-2">
          <div class="flex items-baseline">
            <span class="text-3xl sm:text-4xl font-bold" :class="growthPredictionColor">{{
              plantHealthScore
            }}</span>
            <span class="text-lg sm:text-xl ml-1 text-gray-500 dark:text-gray-400">/100</span>
          </div>
          <div
            class="px-2 sm:px-3 py-1 sm:py-1.5 rounded-full text-xs sm:text-sm font-medium whitespace-nowrap flex-shrink-0"
            :class="{
              'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300':
                plantHealthScore >= 75,
              'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300':
                plantHealthScore >= 40 && plantHealthScore < 75,
              'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300': plantHealthScore < 40,
            }"
          >
            {{ growthPrediction }} Growth
          </div>
        </div>

        <!-- Health Score Progress Bar -->
        <div class="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 mb-4 overflow-hidden">
          <div
            class="h-full rounded-full transition-all duration-500"
            :style="{ width: `${plantHealthScore}%` }"
            :class="{
              'bg-gradient-to-r from-green-400 to-green-500': plantHealthScore >= 75,
              'bg-gradient-to-r from-amber-400 to-amber-500':
                plantHealthScore >= 40 && plantHealthScore < 75,
              'bg-gradient-to-r from-red-400 to-red-500': plantHealthScore < 40,
            }"
          ></div>
        </div>

        <!-- Key Factors -->
        <div class="grid grid-cols-1 xs:grid-cols-3 gap-2 sm:gap-3 mb-4">
          <div class="bg-gray-50 dark:bg-gray-800 rounded-lg p-2 text-center">
            <div class="text-xs text-gray-500 dark:text-gray-400 truncate">Soil Moisture</div>
            <div
              class="font-semibold text-sm sm:text-base truncate"
              :class="{
                'text-green-600 dark:text-green-400': sensorData.soilMoisture.status === 'normal',
                'text-amber-500 dark:text-amber-400': sensorData.soilMoisture.status === 'warning',
                'text-red-500 dark:text-red-400': sensorData.soilMoisture.status === 'critical',
              }"
            >
              {{ sensorData.soilMoisture.value }}{{ sensorData.soilMoisture.unit }}
            </div>
          </div>
          <div class="bg-gray-50 dark:bg-gray-800 rounded-lg p-2 text-center">
            <div class="text-xs text-gray-500 dark:text-gray-400 truncate">Soil pH</div>
            <div
              class="font-semibold text-sm sm:text-base truncate"
              :class="{
                'text-green-600 dark:text-green-400': sensorData.soilPH.status === 'normal',
                'text-amber-500 dark:text-amber-400': sensorData.soilPH.status === 'warning',
                'text-red-500 dark:text-red-400': sensorData.soilPH.status === 'critical',
              }"
            >
              {{ sensorData.soilPH.value }}{{ sensorData.soilPH.unit }}
            </div>
          </div>
          <div class="bg-gray-50 dark:bg-gray-800 rounded-lg p-2 text-center">
            <div class="text-xs text-gray-500 dark:text-gray-400 truncate">Air Temp</div>
            <div
              class="font-semibold text-sm sm:text-base truncate"
              :class="{
                'text-green-600 dark:text-green-400': sensorData.airTemperature.status === 'normal',
                'text-amber-500 dark:text-amber-400':
                  sensorData.airTemperature.status === 'warning',
                'text-red-500 dark:text-red-400': sensorData.airTemperature.status === 'critical',
              }"
            >
              {{ sensorData.airTemperature.value }}{{ sensorData.airTemperature.unit }}
            </div>
          </div>
        </div>

        <!-- Quick Actions -->
        <div
          class="pt-4 border-t border-gray-200 dark:border-gray-700 flex flex-wrap gap-2 sm:gap-3 justify-center sm:justify-start"
        >
          <button class="btn btn-primary">
            <span class="mdi mdi-refresh mr-1 sm:mr-2 flex-shrink-0"></span>
            <span class="truncate">Update Analysis</span>
          </button>
          <button class="btn btn-secondary">
            <span class="mdi mdi-chart-timeline-variant mr-1 sm:mr-2 flex-shrink-0"></span>
            <span class="truncate">Growth Forecast</span>
          </button>
        </div>
      </div>
    </div>

    <!-- System Metrics Component -->
    <div class="mb-10 overflow-hidden">
      <SystemMetrics class="transform hover:-translate-y-1 transition-all duration-300" />
    </div>

    <!-- Plant Growth Analysis with Insights -->
    <div class="mb-10">
      <div
        class="bg-white dark:bg-gray-900 rounded-2xl shadow-lg p-6 border border-gray-100 dark:border-gray-700 transition-all duration-300 hover:shadow-xl backdrop-blur-sm"
      >
        <div class="flex items-center mb-4">
          <div class="bg-green-100 dark:bg-green-900/30 p-2 rounded-lg mr-3 flex-shrink-0">
            <span class="mdi mdi-sprout text-green-600 dark:text-green-400 text-xl"></span>
          </div>
          <h2 class="text-xl font-semibold text-gray-800 dark:text-gray-200">
            Plant Growth Analysis
          </h2>
        </div>

        <!-- Analysis Content with Improved Layout -->
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-4">
          <!-- Main Analysis Text -->
          <div class="lg:col-span-2">
            <p class="text-gray-700 dark:text-gray-300 mb-4">
              Based on the data and graph, we can conclude that the plants are thriving in the
              current environmental conditions. The soil moisture levels ({{
                sensorData.soilMoisture.value
              }}{{ sensorData.soilMoisture.unit }}) and pH ({{ sensorData.soilPH.value
              }}{{ sensorData.soilPH.unit }}) are within optimal ranges, while the temperature
              readings show consistent patterns favorable for growth. The balanced nutrient profile
              and adequate light exposure are supporting healthy development of the root system and
              foliage.
            </p>

            <!-- Recommendations Section -->
            <div class="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl mb-4">
              <h3 class="font-semibold text-blue-800 dark:text-blue-300 flex items-center mb-2">
                <span class="mdi mdi-lightbulb-on mr-2"></span>
                Recommendations
              </h3>
              <ul class="text-blue-700 dark:text-blue-200 text-sm space-y-2">
                <li class="flex items-start">
                  <span class="mdi mdi-check-circle text-green-500 mr-2 mt-0.5"></span>
                  <span>Maintain current watering schedule to keep soil moisture optimal</span>
                </li>
                <li class="flex items-start">
                  <span class="mdi mdi-check-circle text-green-500 mr-2 mt-0.5"></span>
                  <span>Monitor air temperature as it's trending toward the upper threshold</span>
                </li>
                <li class="flex items-start">
                  <span class="mdi mdi-check-circle text-green-500 mr-2 mt-0.5"></span>
                  <span
                    >Consider supplemental nutrients in 7-10 days to support continued growth</span
                  >
                </li>
              </ul>
            </div>
          </div>

          <!-- Growth Metrics Card -->
          <div
            class="bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 rounded-xl shadow-md p-4 border border-gray-100 dark:border-gray-700"
          >
            <h3 class="font-semibold text-gray-800 dark:text-gray-200 mb-3 flex items-center">
              <span class="mdi mdi-chart-timeline-variant mr-2 text-primary-500"></span>
              Growth Metrics
            </h3>

            <!-- Growth Rate -->
            <div class="mb-4">
              <div class="flex justify-between items-center mb-1">
                <span class="text-sm text-gray-600 dark:text-gray-400">Growth Rate</span>
                <span class="text-sm font-medium text-green-600 dark:text-green-400"
                  >Excellent</span
                >
              </div>
              <div class="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                <div class="bg-green-500 h-1.5 rounded-full" style="width: 85%"></div>
              </div>
            </div>

            <!-- Nutrient Uptake -->
            <div class="mb-4">
              <div class="flex justify-between items-center mb-1">
                <span class="text-sm text-gray-600 dark:text-gray-400">Nutrient Uptake</span>
                <span class="text-sm font-medium text-green-600 dark:text-green-400">Good</span>
              </div>
              <div class="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                <div class="bg-green-500 h-1.5 rounded-full" style="width: 75%"></div>
              </div>
            </div>

            <!-- Stress Indicators -->
            <div class="mb-4">
              <div class="flex justify-between items-center mb-1">
                <span class="text-sm text-gray-600 dark:text-gray-400">Stress Indicators</span>
                <span class="text-sm font-medium text-amber-500 dark:text-amber-400">Low</span>
              </div>
              <div class="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                <div class="bg-amber-500 h-1.5 rounded-full" style="width: 20%"></div>
              </div>
            </div>

            <!-- Estimated Harvest -->
            <div class="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
              <div class="flex items-center justify-between">
                <span class="text-sm font-medium text-gray-700 dark:text-gray-300"
                  >Estimated Harvest</span
                >
                <span class="text-sm font-bold text-primary-600 dark:text-primary-400"
                  >21 days</span
                >
              </div>
            </div>
          </div>
        </div>

        <!-- Tags Section -->
        <div class="flex flex-wrap gap-3 mt-2">
          <div
            class="bg-green-50 dark:bg-green-900/20 px-3 py-1.5 rounded-full text-sm font-medium text-green-700 dark:text-green-300 flex items-center"
          >
            <span class="mdi mdi-check-circle-outline mr-1"></span>
            Optimal Growth Conditions
          </div>
          <div
            class="bg-blue-50 dark:bg-blue-900/20 px-3 py-1.5 rounded-full text-sm font-medium text-blue-700 dark:text-blue-300 flex items-center"
          >
            <span class="mdi mdi-water-outline mr-1"></span>
            Balanced Hydration
          </div>
          <div
            class="bg-amber-50 dark:bg-amber-900/20 px-3 py-1.5 rounded-full text-sm font-medium text-amber-700 dark:text-amber-300 flex items-center"
          >
            <span class="mdi mdi-sun-wireless-outline mr-1"></span>
            Adequate Light Exposure
          </div>
        </div>
      </div>
    </div>

    <!-- Sensor Cards Grid with improved spacing and animations -->
    <div class="mb-10">
      <div
        class="transform hover:-translate-y-1 transition-all duration-300 hover:shadow-xl backdrop-blur-sm bg-white dark:bg-gray-900 rounded-2xl shadow-lg p-5 mb-4 border border-gray-100 dark:border-gray-700"
      >
        <h2 class="text-xl font-semibold mb-4 flex flex-wrap items-center">
          <span class="mdi mdi-gauge mr-2 text-primary-600 dark:text-primary-400"></span>
          <span>Sensor Readings</span>
        </h2>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          <SensorCard
            title="Soil Temperature"
            :value="sensorData.soilTemperature.value"
            :unit="sensorData.soilTemperature.unit"
            :status="sensorData.soilTemperature.status as 'normal' | 'warning' | 'critical'"
            icon="thermometer"
          />

          <SensorCard
            title="Soil Moisture"
            :value="sensorData.soilMoisture.value"
            :unit="sensorData.soilMoisture.unit"
            :status="sensorData.soilMoisture.status as 'normal' | 'warning' | 'critical'"
            icon="water-percent"
          />

          <SensorCard
            title="Soil pH"
            :value="sensorData.soilPH.value"
            :unit="sensorData.soilPH.unit"
            :status="sensorData.soilPH.status as 'normal' | 'warning' | 'critical'"
            icon="test-tube"
          />

          <SensorCard
            title="Air Temperature"
            :value="sensorData.airTemperature.value"
            :unit="sensorData.airTemperature.unit"
            :status="sensorData.airTemperature.status as 'normal' | 'warning' | 'critical'"
            icon="thermometer-lines"
          />

          <SensorCard
            title="Air Humidity"
            :value="sensorData.airHumidity.value"
            :unit="sensorData.airHumidity.unit"
            :status="sensorData.airHumidity.status as 'normal' | 'warning' | 'critical'"
            icon="water-outline"
          />

          <SensorCard
            title="Light Intensity"
            :value="sensorData.lightIntensity.value"
            :unit="sensorData.lightIntensity.unit"
            :status="sensorData.lightIntensity.status as 'normal' | 'warning' | 'critical'"
            icon="white-balance-sunny"
          />
        </div>
      </div>
    </div>

    <!-- Charts Section with improved styling -->
    <div
      class="transform hover:-translate-y-1 transition-all duration-300 hover:shadow-xl backdrop-blur-sm bg-white dark:bg-gray-900 rounded-2xl shadow-lg p-5 mb-4 border border-gray-100 dark:border-gray-700"
    >
      <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
        <h2 class="text-xl font-bold flex items-center">
          <span class="mdi mdi-chart-line mr-2 text-primary-600 dark:text-primary-400"></span>
          Sensor Trends
        </h2>

        <div
          class="flex items-center space-x-2 mt-2 sm:mt-0 bg-white dark:bg-gray-700 rounded-full p-1 shadow-sm"
        >
          <button class="px-3 py-1 rounded-full text-xs font-medium bg-primary-500 text-white">
            24h
          </button>
          <button
            class="px-3 py-1 rounded-full text-xs font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
          >
            7d
          </button>
          <button
            class="px-3 py-1 rounded-full text-xs font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
          >
            30d
          </button>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-8">
        <SensorChart
          title="Soil Temperature"
          :data="historicalData.soilTemperature"
          value-label="Temperature (°C)"
          chart-color="#3B7D4A"
        />

        <SensorChart
          title="Soil Moisture"
          :data="historicalData.soilMoisture"
          value-label="Moisture (%)"
          chart-color="#4A3B7D"
        />

        <SensorChart
          title="Soil pH"
          :data="historicalData.soilPH"
          value-label="pH Level"
          chart-color="#7D3B4A"
        />

        <SensorChart
          title="Air Conditions"
          :data="historicalData.airTemperature"
          :secondary-data="historicalData.airHumidity"
          value-label="Temperature (°C)"
          secondary-label="Humidity (%)"
          chart-color="#3B4A7D"
          secondary-color="#7D6A3B"
        />
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Background grid pattern for visual interest */
.bg-grid-pattern {
  background-image:
    linear-gradient(to right, rgba(0, 0, 0, 0.05) 1px, transparent 1px),
    linear-gradient(to bottom, rgba(0, 0, 0, 0.05) 1px, transparent 1px);
  background-size: 20px 20px;
}

/* Dark mode version of the grid pattern */
@media (prefers-color-scheme: dark) {
  .dark .bg-grid-pattern {
    background-image:
      linear-gradient(to right, rgba(255, 255, 255, 0.05) 1px, transparent 1px),
      linear-gradient(to bottom, rgba(255, 255, 255, 0.05) 1px, transparent 1px);
  }
}

/* Custom scrollbar for better UX */
::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

::-webkit-scrollbar-track {
  background: rgba(0, 0, 0, 0.05);
  border-radius: 10px;
}

::-webkit-scrollbar-thumb {
  background: rgba(0, 0, 0, 0.2);
  border-radius: 10px;
}

::-webkit-scrollbar-thumb:hover {
  background: rgba(0, 0, 0, 0.3);
}

@media (prefers-color-scheme: dark) {
  ::-webkit-scrollbar-track {
    background: rgba(255, 255, 255, 0.05);
  }

  ::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.2);
  }

  ::-webkit-scrollbar-thumb:hover {
    background: rgba(255, 255, 255, 0.3);
  }
}

/* Button styles */
.btn {
  @apply px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-medium transition-all duration-200 flex items-center shadow-sm transform hover:-translate-y-0.5;
}

.btn-primary {
  @apply bg-gradient-to-r from-primary-500 to-primary-600 text-white hover:from-primary-600 hover:to-primary-700 active:from-primary-700 active:to-primary-800 focus:ring-2 focus:ring-primary-500 focus:ring-opacity-50;
}

.btn-secondary {
  @apply bg-white text-gray-700 hover:bg-gray-50 active:bg-gray-100 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600 dark:active:bg-gray-500 focus:ring-2 focus:ring-gray-400 focus:ring-opacity-50 dark:focus:ring-gray-500 border border-gray-200 dark:border-gray-600;
}

/* Custom breakpoint for extra small screens */
@media (max-width: 475px) {
  .xs\:grid-cols-3 {
    grid-template-columns: repeat(1, minmax(0, 1fr));
  }

  /* Adjust spacing for mobile */
  .p-6 {
    padding: 1rem;
  }

  .gap-6 {
    gap: 1rem;
  }

  .mb-8 {
    margin-bottom: 1.5rem;
  }

  .mb-10 {
    margin-bottom: 1.5rem;
  }
}

@media (min-width: 476px) and (max-width: 639px) {
  .xs\:grid-cols-3 {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}

/* Improve card transitions */
.hover\:shadow-xl {
  transition:
    box-shadow 0.3s ease,
    transform 0.3s ease;
}

.transform.hover\:-translate-y-1 {
  transition: transform 0.3s ease;
}
</style>
