<script setup lang="ts">
import { ref, computed } from 'vue'
import SensorChart from '@/components/SensorChart.vue'

const dateRange = ref('week')
const startDate = ref(new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0])
const endDate = ref(new Date().toISOString().split('T')[0])

const selectedSensors = ref([
  'soil_temperature',
  'soil_moisture',
  'air_temperature',
  'air_humidity',
])

const availableSensors = [
  { id: 'soil_temperature', name: 'Soil Temperature', color: '#e05d44', unit: '°C' },
  { id: 'soil_moisture', name: 'Soil Moisture', color: '#3b82f6', unit: '%' },
  { id: 'soil_ph', name: 'Soil pH', color: '#8b5cf6', unit: 'pH' },
  { id: 'soil_conductivity', name: 'Soil Conductivity', color: '#f59e0b', unit: 'mS/cm' },
  { id: 'air_temperature', name: 'Air Temperature', color: '#ef4444', unit: '°C' },
  { id: 'air_humidity', name: 'Air Humidity', color: '#0ea5e9', unit: '%' },
  { id: 'air_co2', name: 'CO₂ Level', color: '#10b981', unit: 'ppm' },
  { id: 'air_tvoc', name: 'TVOC', color: '#6366f1', unit: 'ppb' },
  { id: 'light_intensity', name: 'Light Intensity', color: '#f59e0b', unit: 'lux' },
]

// Define types for historical data
type HistoricalDataItem = {
  date: string
  time: string
  value: number
  unit: string
}

type HistoricalDataRecord = {
  [key: string]: HistoricalDataItem[]
}

const historicalData = ref<HistoricalDataRecord>({
  soil_temperature: generateMockData(18, 26, 30, '°C'),
  soil_moisture: generateMockData(45, 75, 30, '%'),
  soil_ph: generateMockData(6.0, 7.2, 30, 'pH'),
  soil_conductivity: generateMockData(0.9, 1.4, 30, 'mS/cm'),
  air_temperature: generateMockData(20, 28, 30, '°C'),
  air_humidity: generateMockData(40, 65, 30, '%'),
  air_co2: generateMockData(450, 850, 30, 'ppm'),
  air_tvoc: generateMockData(100, 350, 30, 'ppb'),
  light_intensity: generateMockData(200, 1800, 30, 'lux'),
})

function generateMockData(
  min: number,
  max: number,
  days: number,
  unit: string,
): HistoricalDataItem[] {
  const data: HistoricalDataItem[] = []
  const now = new Date()

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000)
    const value = min + Math.random() * (max - min)
    data.push({
      date: date.toISOString().split('T')[0],
      time: date.toLocaleDateString(),
      value: parseFloat(value.toFixed(1)),
      unit,
    })
  }

  return data
}

type FilteredDataItem = {
  time: string
  value: number
}

type FilteredDataRecord = {
  [key: string]: FilteredDataItem[]
}

const filteredData = computed<FilteredDataRecord>(() => {
  const result: FilteredDataRecord = {}

  for (const sensorId in historicalData.value) {
    result[sensorId] = historicalData.value[sensorId]
      .filter((item) => {
        return item.date >= startDate.value && item.date <= endDate.value
      })
      .map((item) => ({
        time: item.time,
        value: item.value,
      }))
  }

  return result
})

function setDateRange(range: string) {
  dateRange.value = range
  const now = new Date()
  endDate.value = now.toISOString().split('T')[0]

  switch (range) {
    case 'day':
      startDate.value = now.toISOString().split('T')[0]
      break
    case 'week':
      startDate.value = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split('T')[0]
      break
    case 'month':
      startDate.value = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate())
        .toISOString()
        .split('T')[0]
      break
    case 'year':
      startDate.value = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate())
        .toISOString()
        .split('T')[0]
      break
  }
}

function toggleSensor(sensorId: string) {
  if (selectedSensors.value.includes(sensorId)) {
    selectedSensors.value = selectedSensors.value.filter((id) => id !== sensorId)
  } else {
    selectedSensors.value.push(sensorId)
  }
}

function exportCSV() {
  let csvContent = 'Date,'

  selectedSensors.value.forEach((sensorId) => {
    const sensor = availableSensors.find((s) => s.id === sensorId)
    if (sensor) {
      csvContent += `${sensor.name} (${sensor.unit}),`
    }
  })
  csvContent = csvContent.slice(0, -1) + '\n'

  const allDates = new Set<string>()
  selectedSensors.value.forEach((sensorId) => {
    filteredData.value[sensorId].forEach((item) => {
      allDates.add(item.time)
    })
  })

  const sortedDates = Array.from(allDates).sort()

  sortedDates.forEach((date) => {
    csvContent += `${date},`

    selectedSensors.value.forEach((sensorId) => {
      const dataPoint = filteredData.value[sensorId].find((item) => item.time === date)
      csvContent += dataPoint ? `${dataPoint.value},` : ','
    })

    csvContent = csvContent.slice(0, -1) + '\n'
  })

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.setAttribute('href', url)
  link.setAttribute('download', `sensor_data_${startDate.value}_to_${endDate.value}.csv`)
  link.style.visibility = 'hidden'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}
</script>

<template>
  <div class="container mx-auto px-4 py-6">
    <div class="mb-6">
      <h1 class="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-2">Historical Data</h1>
      <p class="text-gray-600 dark:text-gray-300 mb-4">View and analyze historical sensor data</p>
    </div>

    <!-- Controls -->
    <div class="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 mb-6">
      <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div class="flex flex-col sm:flex-row gap-4">
          <div>
            <label
              for="date-range"
              class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
              >Date Range</label
            >
            <div class="flex space-x-2">
              <button
                v-for="range in ['day', 'week', 'month', 'year']"
                :key="range"
                @click="setDateRange(range)"
                :class="[
                  'px-3 py-1 text-sm rounded-md focus:outline-none',
                  dateRange === range
                    ? 'bg-primary-500 text-white dark:bg-primary-600'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600',
                ]"
              >
                {{ range.charAt(0).toUpperCase() + range.slice(1) }}
              </button>
            </div>
          </div>

          <div class="flex space-x-2">
            <div>
              <label
                for="start-date"
                class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                >Start Date</label
              >
              <input
                type="date"
                id="start-date"
                v-model="startDate"
                class="block w-full px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 text-black dark:text-white"
              />
            </div>

            <div>
              <label
                for="end-date"
                class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                >End Date</label
              >
              <input
                type="date"
                id="end-date"
                v-model="endDate"
                class="block w-full px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 text-black dark:text-white"
              />
            </div>
          </div>
        </div>

        <div>
          <button
            @click="exportCSV"
            class="px-4 py-2 bg-primary-500 text-white rounded-md hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-offset-gray-800"
          >
            <span class="mdi mdi-download mr-1"></span>
            Export CSV
          </button>
        </div>
      </div>
    </div>

    <!-- Sensor Selection -->
    <div class="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 mb-6">
      <h2 class="text-lg font-semibold text-gray-700 dark:text-gray-200 mb-3">Select Sensors</h2>
      <div class="flex flex-wrap gap-2">
        <button
          v-for="sensor in availableSensors"
          :key="sensor.id"
          @click="toggleSensor(sensor.id)"
          :class="[
            'px-3 py-1.5 text-sm rounded-md flex items-center',
            selectedSensors.includes(sensor.id)
              ? 'bg-primary-100 text-primary-700 border border-primary-300 dark:bg-primary-900 dark:text-primary-300 dark:border-primary-700'
              : 'bg-gray-100 text-gray-700 border border-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600',
          ]"
        >
          <span class="w-3 h-3 rounded-full mr-2" :style="{ backgroundColor: sensor.color }"></span>
          {{ sensor.name }}
        </button>
      </div>
    </div>

    <!-- Charts -->
    <div v-if="selectedSensors.length > 0">
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <SensorChart
          v-for="sensorId in selectedSensors"
          :key="sensorId"
          :title="availableSensors.find((s) => s.id === sensorId)?.name || ''"
          :data="filteredData[sensorId]"
          :valueLabel="availableSensors.find((s) => s.id === sensorId)?.name || ''"
          :chartColor="availableSensors.find((s) => s.id === sensorId)?.color"
        />
      </div>
    </div>

    <div v-else class="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 text-center">
      <p class="text-gray-500 dark:text-gray-400">
        Select at least one sensor to view historical data
      </p>
    </div>
  </div>
</template>
