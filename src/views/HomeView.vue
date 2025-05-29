<script setup lang="ts">
import { ref, onMounted } from 'vue'
import SensorCard from '../components/SensorCard.vue'
import SensorChart from '../components/SensorChart.vue'
import StatusOverview from '../components/StatusOverview.vue'

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

const lastUpdate = ref(new Date().toLocaleString())

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

  lastUpdate.value = new Date().toLocaleString()

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

onMounted(() => {
  setInterval(updateData, 5000)
})
</script>

<template>
  <div class="container mx-auto px-4 py-6">
    <!-- Status Overview with improved styling -->
    <StatusOverview :sensor-data="sensorData" class="mb-8" />

    <!-- Sensor Cards Grid with improved spacing and animations -->
    <div class="mb-10">
      <h2 class="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-4 flex items-center">
        <span class="mdi mdi-gauge mr-2 text-primary-600 dark:text-primary-400"></span>
        Sensor Readings
      </h2>
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
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

    <!-- Charts Section with improved styling -->
    <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 mb-8">
      <h2 class="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-6 flex items-center">
        <span class="mdi mdi-chart-line mr-2 text-primary-600 dark:text-primary-400"></span>
        Sensor Trends (Last 24 Hours)
      </h2>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
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
</style>
