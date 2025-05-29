<script setup lang="ts">
import { ref, onMounted } from 'vue'
import SensorCard from '@/components/SensorCard.vue'
import SensorChart from '@/components/SensorChart.vue'

const airData = ref({
  temperature: {
    value: 24.3,
    unit: '°C',
    status: 'normal',
    trend: 'increasing',
    min: 18,
    max: 32,
    history: [] as { time: string; value: number }[],
  },
  humidity: {
    value: 58,
    unit: '%',
    status: 'normal',
    trend: 'stable',
    min: 30,
    max: 70,
    history: [] as { time: string; value: number }[],
  },
  co2: {
    value: 650,
    unit: 'ppm',
    status: 'normal',
    trend: 'increasing',
    min: 400,
    max: 1000,
    history: [] as { time: string; value: number }[],
  },
  tvoc: {
    value: 220,
    unit: 'ppb',
    status: 'normal',
    trend: 'stable',
    min: 0,
    max: 500,
    history: [] as { time: string; value: number }[],
  },
  pressure: {
    value: 1013.2,
    unit: 'hPa',
    status: 'normal',
    trend: 'stable',
    min: 990,
    max: 1030,
    history: [] as { time: string; value: number }[],
  },
  light: {
    value: 850,
    unit: 'lux',
    status: 'normal',
    trend: 'decreasing',
    min: 0,
    max: 2000,
    history: [] as { time: string; value: number }[],
  },
})

const lastUpdated = ref(new Date().toLocaleString())

function generateHistoricalData(min: number, max: number, count: number = 24) {
  const data = []
  const now = new Date()

  for (let i = count - 1; i >= 0; i--) {
    const time = new Date(now.getTime() - i * 60 * 60 * 1000)
    const value = min + Math.random() * (max - min)
    data.push({
      time: time.getHours() + ':00',
      value: parseFloat(value.toFixed(1)),
    })
  }

  return data
}

onMounted(() => {
  airData.value.temperature.history = generateHistoricalData(20, 28)
  airData.value.humidity.history = generateHistoricalData(40, 65)
  airData.value.co2.history = generateHistoricalData(450, 850)
  airData.value.tvoc.history = generateHistoricalData(100, 350)
  airData.value.pressure.history = generateHistoricalData(1000, 1025)
  airData.value.light.history = generateHistoricalData(200, 1800)
})

function getStatus(value: number, min: number, max: number) {
  if (value < min) return 'critical'
  if (value > max) return 'critical'
  if (value < min + (max - min) * 0.2 || value > max - (max - min) * 0.2) return 'warning'
  return 'normal'
}

function updateSensorStatuses() {
  for (const key in airData.value) {
    if (Object.hasOwn(airData.value, key) && key !== 'lastUpdated') {
      const sensor = airData.value[key as keyof typeof airData.value]
      if ('value' in sensor && 'min' in sensor && 'max' in sensor) {
        sensor.status = getStatus(sensor.value, sensor.min, sensor.max)
      }
    }
  }
}

updateSensorStatuses()
</script>

<template>
  <div class="container mx-auto px-4 py-6">
    <div class="mb-6">
      <h1 class="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-2">
        Air Quality Monitoring
      </h1>
      <p class="text-gray-600 dark:text-gray-300 mb-4">
        Real-time air quality and environmental conditions
      </p>
      <p class="text-sm text-gray-500 dark:text-gray-400">Last updated: {{ lastUpdated }}</p>
    </div>

    <!-- Air Sensor Cards -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-4 mb-8">
      <SensorCard
        title="Air Temperature"
        :value="airData.temperature.value"
        :unit="airData.temperature.unit"
        :status="airData.temperature.status as 'normal' | 'warning' | 'critical'"
        :trend="airData.temperature.trend"
        icon="thermometer"
      />

      <SensorCard
        title="Humidity"
        :value="airData.humidity.value"
        :unit="airData.humidity.unit"
        :status="airData.humidity.status as 'normal' | 'warning' | 'critical'"
        :trend="airData.humidity.trend"
        icon="water-percent"
      />

      <SensorCard
        title="CO₂ Level"
        :value="airData.co2.value"
        :unit="airData.co2.unit"
        :status="airData.co2.status as 'normal' | 'warning' | 'critical'"
        :trend="airData.co2.trend"
        icon="molecule-co2"
      />

      <SensorCard
        title="TVOC"
        :value="airData.tvoc.value"
        :unit="airData.tvoc.unit"
        :status="airData.tvoc.status as 'normal' | 'warning' | 'critical'"
        :trend="airData.tvoc.trend"
        icon="air-filter"
      />

      <SensorCard
        title="Barometric Pressure"
        :value="airData.pressure.value"
        :unit="airData.pressure.unit"
        :status="airData.pressure.status as 'normal' | 'warning' | 'critical'"
        :trend="airData.pressure.trend"
        icon="gauge"
      />

      <SensorCard
        title="Light Intensity"
        :value="airData.light.value"
        :unit="airData.light.unit"
        :status="airData.light.status as 'normal' | 'warning' | 'critical'"
        :trend="airData.light.trend"
        icon="white-balance-sunny"
      />
    </div>

    <!-- Air Quality Index -->
    <div class="mb-8">
      <h2 class="text-xl font-semibold text-gray-700 dark:text-gray-200 mb-4">Air Quality Index</h2>
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <div class="flex flex-col md:flex-row md:items-center md:justify-between">
          <div class="mb-4 md:mb-0">
            <div class="text-4xl font-bold text-green-500 mb-2">Good</div>
            <div class="text-gray-600 dark:text-gray-300">Air quality is satisfactory</div>
          </div>

          <div class="w-full md:w-2/3 lg:w-1/2">
            <div class="relative pt-1">
              <div class="flex mb-2 items-center justify-between">
                <div>
                  <span
                    class="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-green-600 bg-green-200 dark:bg-green-900 dark:text-green-200"
                  >
                    AQI: 42
                  </span>
                </div>
                <div class="text-right">
                  <span
                    class="text-xs font-semibold inline-block text-green-600 dark:text-green-400"
                  >
                    0-50: Good
                  </span>
                </div>
              </div>
              <div
                class="overflow-hidden h-2 mb-4 text-xs flex rounded bg-gray-200 dark:bg-gray-700"
              >
                <div
                  style="width: 42%"
                  class="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-green-500"
                ></div>
              </div>
              <div class="flex justify-between text-xs text-gray-500 dark:text-gray-400">
                <span>0</span>
                <span>50</span>
                <span>100</span>
                <span>150</span>
                <span>200</span>
                <span>300+</span>
              </div>
              <div class="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
                <span>Good</span>
                <span>Moderate</span>
                <span>Unhealthy</span>
                <span>Very Unhealthy</span>
                <span>Hazardous</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Air Trends Section -->
    <div>
      <h2 class="text-xl font-semibold text-gray-700 dark:text-gray-200 mb-4">
        Environmental Trends
      </h2>
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SensorChart
          title="Temperature & Humidity"
          :data="airData.temperature.history"
          :secondaryData="airData.humidity.history"
          valueLabel="Temperature (°C)"
          secondaryLabel="Humidity (%)"
          chartColor="#e05d44"
          secondaryColor="#3b82f6"
        />

        <SensorChart
          title="CO₂ Levels"
          :data="airData.co2.history"
          valueLabel="CO₂ (ppm)"
          chartColor="#10b981"
        />

        <SensorChart
          title="TVOC Levels"
          :data="airData.tvoc.history"
          valueLabel="TVOC (ppb)"
          chartColor="#8b5cf6"
        />

        <SensorChart
          title="Light Intensity"
          :data="airData.light.history"
          valueLabel="Light (lux)"
          chartColor="#f59e0b"
        />
      </div>
    </div>
  </div>
</template>
