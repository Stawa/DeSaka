<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import SensorChart from '@/components/SensorChart.vue'

// Date range selection
const dateRange = ref({
  start: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 7 days ago
  end: new Date().toISOString().split('T')[0], // today
})

// Selected sensors for display
const selectedSensors = ref([
  'soil_temperature',
  'soil_moisture',
  'air_temperature',
  'air_humidity',
])

// Available sensors
const availableSensors = [
  { id: 'soil_temperature', name: 'Soil Temperature', unit: '°C', color: '#e05d44' },
  { id: 'soil_moisture', name: 'Soil Moisture', unit: '%', color: '#3b82f6' },
  { id: 'soil_ph', name: 'Soil pH', unit: 'pH', color: '#8b5cf6' },
  { id: 'soil_conductivity', name: 'Soil Conductivity', unit: 'mS/cm', color: '#f59e0b' },
  { id: 'air_temperature', name: 'Air Temperature', unit: '°C', color: '#ef4444' },
  { id: 'air_humidity', name: 'Air Humidity', unit: '%', color: '#0ea5e9' },
  { id: 'air_co2', name: 'CO₂ Level', unit: 'ppm', color: '#10b981' },
  { id: 'air_tvoc', name: 'TVOC Level', unit: 'ppb', color: '#6366f1' },
  { id: 'light_intensity', name: 'Light Intensity', unit: 'lux', color: '#f59e0b' },
]

// Types for historical data
type DataPoint = {
  timestamp: string
  value: number
}

type SensorData = {
  [key: string]: DataPoint[]
}

// Historical data
const historicalData = ref<SensorData>({})

// Generate mock historical data
function generateMockData() {
  const data: SensorData = {}
  const now = new Date()
  const startDate = new Date(dateRange.value.start)

  // Calculate number of days in the range
  const daysDiff = Math.ceil((now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))

  // Generate data for each sensor
  availableSensors.forEach((sensor) => {
    data[sensor.id] = []

    // Generate data points for each day
    for (let i = 0; i <= daysDiff; i++) {
      const date = new Date(startDate.getTime() + i * 24 * 60 * 60 * 1000)
      const dateStr = date.toISOString().split('T')[0]

      // Generate 24 data points for each day (hourly)
      for (let hour = 0; hour < 24; hour++) {
        const timestamp = `${dateStr}T${hour.toString().padStart(2, '0')}:00:00`

        // Generate random value based on sensor type
        let value = 0
        switch (sensor.id) {
          case 'soil_temperature':
            value = 18 + Math.random() * 8 // 18-26°C
            break
          case 'soil_moisture':
            value = 45 + Math.random() * 30 // 45-75%
            break
          case 'soil_ph':
            value = 6 + Math.random() * 1.2 // 6.0-7.2 pH
            break
          case 'soil_conductivity':
            value = 0.9 + Math.random() * 0.5 // 0.9-1.4 mS/cm
            break
          case 'air_temperature':
            value = 20 + Math.random() * 6 // 20-26°C
            break
          case 'air_humidity':
            value = 35 + Math.random() * 20 // 35-55%
            break
          case 'air_co2':
            value = 500 + Math.random() * 450 // 500-950 ppm
            break
          case 'air_tvoc':
            value = 100 + Math.random() * 200 // 100-300 ppb
            break
          case 'light_intensity':
            value = 250 + Math.random() * 550 // 250-800 lux
            break
        }

        data[sensor.id].push({
          timestamp,
          value: parseFloat(value.toFixed(1)),
        })
      }
    }
  })

  historicalData.value = data
}

// Filter data based on date range
const filteredData = computed(() => {
  const result: SensorData = {}
  const startDate = new Date(dateRange.value.start).getTime()
  const endDate = new Date(dateRange.value.end).getTime() + 24 * 60 * 60 * 1000 - 1 // End of the selected day

  Object.keys(historicalData.value).forEach((sensorId) => {
    result[sensorId] = historicalData.value[sensorId].filter((point) => {
      const timestamp = new Date(point.timestamp).getTime()
      return timestamp >= startDate && timestamp <= endDate
    })
  })

  return result
})

// Format data for charts
const chartData = computed(() => {
  const result: { [key: string]: { time: string; value: number }[] } = {}

  selectedSensors.value.forEach((sensorId) => {
    if (filteredData.value[sensorId]) {
      result[sensorId] = filteredData.value[sensorId].map((point) => {
        const date = new Date(point.timestamp)
        return {
          time: `${date.getMonth() + 1}/${date.getDate()} ${date.getHours()}:00`,
          value: point.value,
        }
      })
    }
  })

  return result
})

// Get sensor details by ID
function getSensorById(id: string) {
  return availableSensors.find((sensor) => sensor.id === id)
}

// Set date range
function setDateRange(range: string) {
  const now = new Date()
  const end = now.toISOString().split('T')[0]
  let start = end

  switch (range) {
    case 'day':
      start = end
      break
    case 'week':
      start = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      break
    case 'month':
      start = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate())
        .toISOString()
        .split('T')[0]
      break
    case 'year':
      start = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate())
        .toISOString()
        .split('T')[0]
      break
  }

  dateRange.value = { start, end }
  generateMockData()
}

// Toggle sensor selection
function toggleSensor(sensorId: string) {
  const index = selectedSensors.value.indexOf(sensorId)
  if (index === -1) {
    selectedSensors.value.push(sensorId)
  } else {
    selectedSensors.value.splice(index, 1)
  }
}

// Export data as CSV
function exportCSV() {
  // Create CSV header
  let csv = 'Timestamp'
  selectedSensors.value.forEach((sensorId) => {
    const sensor = getSensorById(sensorId)
    if (sensor) {
      csv += `,${sensor.name} (${sensor.unit})`
    }
  })
  csv += '\n'

  // Get all timestamps from the filtered data
  const timestamps = new Set<string>()
  selectedSensors.value.forEach((sensorId) => {
    if (filteredData.value[sensorId]) {
      filteredData.value[sensorId].forEach((point) => {
        timestamps.add(point.timestamp)
      })
    }
  })

  // Sort timestamps
  const sortedTimestamps = Array.from(timestamps).sort()

  // Create a map of timestamp -> values for each sensor
  const dataMap: { [timestamp: string]: { [sensorId: string]: number } } = {}
  sortedTimestamps.forEach((timestamp) => {
    dataMap[timestamp] = {}
  })

  selectedSensors.value.forEach((sensorId) => {
    if (filteredData.value[sensorId]) {
      filteredData.value[sensorId].forEach((point) => {
        dataMap[point.timestamp][sensorId] = point.value
      })
    }
  })

  // Add data rows
  sortedTimestamps.forEach((timestamp) => {
    const date = new Date(timestamp)
    const formattedDate = `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`
    let row = formattedDate

    selectedSensors.value.forEach((sensorId) => {
      const value = dataMap[timestamp][sensorId] !== undefined ? dataMap[timestamp][sensorId] : ''
      row += `,${value}`
    })

    csv += row + '\n'
  })

  // Create and download the CSV file
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.setAttribute('href', url)
  link.setAttribute(
    'download',
    `sensor_data_${dateRange.value.start}_to_${dateRange.value.end}.csv`,
  )
  link.style.visibility = 'hidden'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

onMounted(() => {
  generateMockData()
})
</script>

<template>
  <div class="container mx-auto px-4 py-6">
    <div class="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
      <div>
        <h1 class="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-2">Historical Data</h1>
        <p class="text-gray-600 dark:text-gray-300 mb-1">View and analyze historical sensor data</p>
      </div>

      <div class="mt-4 md:mt-0 flex space-x-2">
        <button
          class="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors flex items-center shadow-sm"
          @click="exportCSV"
        >
          <span class="mdi mdi-download mr-2"></span>
          Export CSV
        </button>
      </div>
    </div>

    <!-- Controls Section -->
    <div
      class="bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 rounded-xl shadow-md overflow-hidden mb-8 border border-gray-100 dark:border-gray-700"
    >
      <div class="p-6">
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <!-- Date Range Selection -->
          <div>
            <h2
              class="text-lg font-semibold text-gray-700 dark:text-gray-200 mb-4 flex items-center"
            >
              <span class="mdi mdi-calendar-range text-primary-500 mr-2"></span>
              Date Range
            </h2>

            <div class="flex flex-wrap gap-3 mb-4">
              <button
                class="px-3 py-1.5 rounded-lg text-sm font-medium transition-colors"
                :class="{
                  'bg-primary-500 text-white': dateRange.start === dateRange.end,
                  'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600':
                    dateRange.start !== dateRange.end,
                }"
                @click="setDateRange('day')"
              >
                Today
              </button>

              <button
                class="px-3 py-1.5 rounded-lg text-sm font-medium transition-colors"
                :class="{
                  'bg-primary-500 text-white':
                    new Date(dateRange.end).getTime() - new Date(dateRange.start).getTime() ===
                    6 * 24 * 60 * 60 * 1000,
                  'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600':
                    new Date(dateRange.end).getTime() - new Date(dateRange.start).getTime() !==
                    6 * 24 * 60 * 60 * 1000,
                }"
                @click="setDateRange('week')"
              >
                Last 7 Days
              </button>

              <button
                class="px-3 py-1.5 rounded-lg text-sm font-medium transition-colors bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600"
                @click="setDateRange('month')"
              >
                Last 30 Days
              </button>

              <button
                class="px-3 py-1.5 rounded-lg text-sm font-medium transition-colors bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600"
                @click="setDateRange('year')"
              >
                Last Year
              </button>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label
                  for="start-date"
                  class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                  >Start Date</label
                >
                <input
                  id="start-date"
                  type="date"
                  v-model="dateRange.start"
                  class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  @change="generateMockData"
                />
              </div>

              <div>
                <label
                  for="end-date"
                  class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                  >End Date</label
                >
                <input
                  id="end-date"
                  type="date"
                  v-model="dateRange.end"
                  class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  @change="generateMockData"
                />
              </div>
            </div>
          </div>

          <!-- Sensor Selection -->
          <div>
            <h2
              class="text-lg font-semibold text-gray-700 dark:text-gray-200 mb-4 flex items-center"
            >
              <span class="mdi mdi-tune text-primary-500 mr-2"></span>
              Select Sensors
            </h2>

            <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
              <div
                v-for="sensor in availableSensors"
                :key="sensor.id"
                class="flex items-center space-x-2 p-2 rounded-lg transition-colors"
                :class="{
                  'bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-700':
                    selectedSensors.includes(sensor.id),
                  'hover:bg-gray-100 dark:hover:bg-gray-800': !selectedSensors.includes(sensor.id),
                }"
                @click="toggleSensor(sensor.id)"
              >
                <div class="flex-shrink-0">
                  <div
                    class="w-4 h-4 rounded-full"
                    :style="{ backgroundColor: sensor.color }"
                  ></div>
                </div>
                <div class="flex-grow">
                  <div class="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {{ sensor.name }}
                  </div>
                  <div class="text-xs text-gray-500 dark:text-gray-400">{{ sensor.unit }}</div>
                </div>
                <div class="flex-shrink-0">
                  <span
                    class="mdi text-lg"
                    :class="{
                      'mdi-checkbox-marked-circle text-primary-500': selectedSensors.includes(
                        sensor.id,
                      ),
                      'mdi-checkbox-blank-circle-outline text-gray-400 dark:text-gray-600':
                        !selectedSensors.includes(sensor.id),
                    }"
                  ></span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="bg-gray-50 dark:bg-gray-800/50 border-t border-gray-100 dark:border-gray-700 p-4">
        <div class="flex flex-wrap gap-4 justify-between">
          <div class="text-sm text-gray-600 dark:text-gray-300">
            <span class="font-medium">{{ selectedSensors.length }}</span> sensors selected
          </div>
          <div class="text-sm text-gray-600 dark:text-gray-300">
            <span class="font-medium">{{ new Date(dateRange.start).toLocaleDateString() }}</span> to
            <span class="font-medium">{{ new Date(dateRange.end).toLocaleDateString() }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Charts Section -->
    <div v-if="selectedSensors.length > 0">
      <div class="flex items-center mb-4">
        <div class="bg-primary-100 dark:bg-primary-900/30 p-1.5 rounded-lg mr-2">
          <span class="mdi mdi-chart-line text-primary-600 dark:text-primary-400"></span>
        </div>
        <h2 class="text-xl font-semibold text-gray-700 dark:text-gray-200">Sensor Data Charts</h2>
      </div>

      <div class="grid grid-cols-1 gap-6">
        <div
          v-for="sensorId in selectedSensors"
          :key="sensorId"
          class="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden border border-gray-100 dark:border-gray-700 transition-all duration-300 hover:shadow-lg"
        >
          <div
            class="h-1 w-full"
            :style="{ backgroundColor: getSensorById(sensorId)?.color }"
          ></div>
          <div class="p-4">
            <SensorChart
              :title="getSensorById(sensorId)?.name || ''"
              :data="chartData[sensorId] || []"
              :valueLabel="getSensorById(sensorId)?.name || ''"
              :chartColor="getSensorById(sensorId)?.color || '#000'"
              :showTimeRange="false"
            />
          </div>
        </div>
      </div>
    </div>

    <div
      v-else
      class="bg-white dark:bg-gray-800 rounded-xl shadow-md p-8 text-center border border-gray-100 dark:border-gray-700"
    >
      <span
        class="mdi mdi-chart-timeline-variant text-6xl text-gray-300 dark:text-gray-600 mb-4 block"
      ></span>
      <h3 class="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">
        No Sensors Selected
      </h3>
      <p class="text-gray-600 dark:text-gray-400 mb-4">
        Please select at least one sensor to view historical data
      </p>
      <button
        class="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors inline-flex items-center"
        @click="
          selectedSensors = ['soil_temperature', 'soil_moisture', 'air_temperature', 'air_humidity']
        "
      >
        <span class="mdi mdi-tune mr-2"></span>
        Select Default Sensors
      </button>
    </div>
  </div>
</template>
