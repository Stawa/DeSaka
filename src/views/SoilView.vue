<script setup lang="ts">
import { ref, onMounted } from 'vue'
import SensorCard from '@/components/SensorCard.vue'
import SensorChart from '@/components/SensorChart.vue'

const soilData = ref({
  temperature: {
    value: 22.5,
    unit: '°C',
    status: 'normal',
    trend: 'stable',
    min: 15,
    max: 30,
    history: [] as { time: string; value: number }[],
  },
  moisture: {
    value: 65,
    unit: '%',
    status: 'normal',
    trend: 'increasing',
    min: 40,
    max: 80,
    history: [] as { time: string; value: number }[],
  },
  ph: {
    value: 6.8,
    unit: 'pH',
    status: 'normal',
    trend: 'stable',
    min: 5.5,
    max: 7.5,
    history: [] as { time: string; value: number }[],
  },
  nutrients: {
    nitrogen: {
      value: 42,
      unit: 'ppm',
      status: 'normal',
      trend: 'stable',
      min: 20,
      max: 80,
    },
    phosphorus: {
      value: 35,
      unit: 'ppm',
      status: 'normal',
      trend: 'decreasing',
      min: 20,
      max: 60,
    },
    potassium: {
      value: 180,
      unit: 'ppm',
      status: 'normal',
      trend: 'stable',
      min: 125,
      max: 250,
    },
  },
  conductivity: {
    value: 1.2,
    unit: 'mS/cm',
    status: 'normal',
    trend: 'stable',
    min: 0.8,
    max: 1.5,
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
  soilData.value.temperature.history = generateHistoricalData(18, 26)
  soilData.value.moisture.history = generateHistoricalData(45, 75)
  soilData.value.ph.history = generateHistoricalData(6.0, 7.2)
  soilData.value.conductivity.history = generateHistoricalData(0.9, 1.4)
})

function getStatus(value: number, min: number, max: number) {
  if (value < min) return 'critical'
  if (value > max) return 'critical'
  if (value < min + (max - min) * 0.2 || value > max - (max - min) * 0.2) return 'warning'
  return 'normal'
}

function updateSensorStatuses() {
  soilData.value.temperature.status = getStatus(
    soilData.value.temperature.value,
    soilData.value.temperature.min,
    soilData.value.temperature.max,
  )

  soilData.value.moisture.status = getStatus(
    soilData.value.moisture.value,
    soilData.value.moisture.min,
    soilData.value.moisture.max,
  )

  soilData.value.ph.status = getStatus(
    soilData.value.ph.value,
    soilData.value.ph.min,
    soilData.value.ph.max,
  )

  soilData.value.conductivity.status = getStatus(
    soilData.value.conductivity.value,
    soilData.value.conductivity.min,
    soilData.value.conductivity.max,
  )
}

updateSensorStatuses()
</script>

<template>
  <div class="container mx-auto px-4 py-6">
    <div class="mb-6">
      <h1 class="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-2">Soil Monitoring</h1>
      <p class="text-gray-600 dark:text-gray-300 mb-4">
        Comprehensive soil health monitoring and analysis
      </p>
      <p class="text-sm text-gray-500 dark:text-gray-400">Last updated: {{ lastUpdated }}</p>
    </div>

    <!-- Soil Sensor Cards -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-8">
      <SensorCard
        title="Soil Temperature"
        :value="soilData.temperature.value"
        :unit="soilData.temperature.unit"
        :status="soilData.temperature.status as 'normal' | 'warning' | 'critical'"
        :trend="soilData.temperature.trend"
        icon="thermometer"
      />

      <SensorCard
        title="Soil Moisture"
        :value="soilData.moisture.value"
        :unit="soilData.moisture.unit"
        :status="soilData.moisture.status as 'normal' | 'warning' | 'critical'"
        :trend="soilData.moisture.trend"
        icon="water"
      />

      <SensorCard
        title="Soil pH"
        :value="soilData.ph.value"
        :unit="soilData.ph.unit"
        :status="soilData.ph.status as 'normal' | 'warning' | 'critical'"
        :trend="soilData.ph.trend"
        icon="flask"
      />

      <SensorCard
        title="Soil Conductivity"
        :value="soilData.conductivity.value"
        :unit="soilData.conductivity.unit"
        :status="soilData.conductivity.status as 'normal' | 'warning' | 'critical'"
        :trend="soilData.conductivity.trend"
        icon="flash"
      />
    </div>

    <!-- Nutrient Levels Section -->
    <div class="mb-8">
      <h2 class="text-xl font-semibold text-gray-700 dark:text-gray-200 mb-4">Nutrient Levels</h2>
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
          <h3 class="font-medium text-gray-700 dark:text-gray-200 mb-2">Nitrogen (N)</h3>
          <div class="flex items-end">
            <span class="text-2xl font-bold text-primary dark:text-primary-300">
              {{ soilData.nutrients.nitrogen.value }}
            </span>
            <span class="ml-1 text-gray-500 dark:text-gray-400">{{
              soilData.nutrients.nitrogen.unit
            }}</span>
          </div>
          <div class="mt-2 w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
            <div
              class="bg-blue-500 h-2.5 rounded-full"
              :style="{
                width: `${(soilData.nutrients.nitrogen.value / soilData.nutrients.nitrogen.max) * 100}%`,
              }"
            ></div>
          </div>
          <div class="flex justify-between mt-1 text-xs text-gray-500 dark:text-gray-400">
            <span>{{ soilData.nutrients.nitrogen.min }}</span>
            <span>{{ soilData.nutrients.nitrogen.max }}</span>
          </div>
        </div>

        <div class="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
          <h3 class="font-medium text-gray-700 dark:text-gray-200 mb-2">Phosphorus (P)</h3>
          <div class="flex items-end">
            <span class="text-2xl font-bold text-primary dark:text-primary-300">
              {{ soilData.nutrients.phosphorus.value }}
            </span>
            <span class="ml-1 text-gray-500 dark:text-gray-400">{{
              soilData.nutrients.phosphorus.unit
            }}</span>
          </div>
          <div class="mt-2 w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
            <div
              class="bg-purple-500 h-2.5 rounded-full"
              :style="{
                width: `${(soilData.nutrients.phosphorus.value / soilData.nutrients.phosphorus.max) * 100}%`,
              }"
            ></div>
          </div>
          <div class="flex justify-between mt-1 text-xs text-gray-500 dark:text-gray-400">
            <span>{{ soilData.nutrients.phosphorus.min }}</span>
            <span>{{ soilData.nutrients.phosphorus.max }}</span>
          </div>
        </div>

        <div class="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
          <h3 class="font-medium text-gray-700 dark:text-gray-200 mb-2">Potassium (K)</h3>
          <div class="flex items-end">
            <span class="text-2xl font-bold text-primary dark:text-primary-300">
              {{ soilData.nutrients.potassium.value }}
            </span>
            <span class="ml-1 text-gray-500 dark:text-gray-400">{{
              soilData.nutrients.potassium.unit
            }}</span>
          </div>
          <div class="mt-2 w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
            <div
              class="bg-yellow-500 h-2.5 rounded-full"
              :style="{
                width: `${(soilData.nutrients.potassium.value / soilData.nutrients.potassium.max) * 100}%`,
              }"
            ></div>
          </div>
          <div class="flex justify-between mt-1 text-xs text-gray-500 dark:text-gray-400">
            <span>{{ soilData.nutrients.potassium.min }}</span>
            <span>{{ soilData.nutrients.potassium.max }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Soil Trends Section -->
    <div>
      <h2 class="text-xl font-semibold text-gray-700 dark:text-gray-200 mb-4">Soil Trends</h2>
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SensorChart
          title="Soil Temperature Trend"
          :data="soilData.temperature.history"
          valueLabel="Temperature"
          chartColor="#e05d44"
        />

        <SensorChart
          title="Soil Moisture Trend"
          :data="soilData.moisture.history"
          valueLabel="Moisture"
          chartColor="#3b82f6"
        />

        <SensorChart
          title="Soil pH Trend"
          :data="soilData.ph.history"
          valueLabel="pH Level"
          chartColor="#8b5cf6"
        />

        <SensorChart
          title="Soil Conductivity Trend"
          :data="soilData.conductivity.history"
          valueLabel="Conductivity"
          chartColor="#f59e0b"
        />
      </div>
    </div>
  </div>
</template>
