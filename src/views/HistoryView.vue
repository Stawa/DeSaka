<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import SensorChart from '@/components/SensorChart.vue'
import DataExportModal from '@/components/DataExportModal.vue'
import { formatSensorDataForExport } from '@/scripts'
import { handleDataExport } from '@/utils/exportUtils'
import { useApi } from '@/composables/useApi'

const { fetchFiles, fetchFileById } = useApi()

const activeTab = ref('date-range')
const screenWidth = ref(0)
const chartLayout = ref(window.innerWidth >= 768 ? 'grid' : 'list')
const showExportModal = ref(false)

const dateRange = ref({
  start: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  end: new Date().toISOString().split('T')[0],
})

const selectedSensors = ref([
  'soil_temperature',
  'soil_moisture',
  'air_temperature',
  'air_humidity',
])

const availableSensors = [
  { id: 'soil_temperature', name: 'Soil Temperature', unit: '°C', color: '#e05d44' },
  { id: 'soil_moisture', name: 'Soil Moisture', unit: '%', color: '#3b82f6' },
  { id: 'soil_ph', name: 'Soil pH', unit: 'pH', color: '#8b5cf6' },
  { id: 'air_temperature', name: 'Air Temperature', unit: '°C', color: '#ef4444' },
  { id: 'air_humidity', name: 'Air Humidity', unit: '%', color: '#0ea5e9' },
  { id: 'light_intensity', name: 'Light Intensity', unit: 'lux', color: '#f59e0b' },
]

type DataPoint = {
  timestamp: string
  value: number
}

type SensorData = {
  [key: string]: DataPoint[]
}

const historicalData = ref<SensorData>({})
const isLoading = ref(false)
const apiError = ref<string | null>(null)
const availableFiles = ref<Array<{ id: string; name: string; modifiedTime: string }>>([])

const sensorMapping: Record<string, string> = {
  ph: 'soil_ph',
  conductivity: 'soil_conductivity',
  air_temperature: 'air_temperature',
  co2: 'air_co2',
  tvoc: 'air_tvoc',
  light: 'light_intensity',
  soil_temperature: 'soil_temperature',
}

const mockValueRanges = {
  soil_temperature: { base: 18, range: 8 },
  soil_moisture: { base: 45, range: 30 },
  soil_ph: { base: 6, range: 1.2 },
  soil_conductivity: { base: 0.9, range: 0.5 },
  air_temperature: { base: 20, range: 6 },
  air_humidity: { base: 35, range: 20 },
  air_co2: { base: 500, range: 450 },
  air_tvoc: { base: 100, range: 200 },
  light_intensity: { base: 250, range: 550 },
}

const setActiveTab = (tab: string) => {
  activeTab.value = tab
}

const updateScreenWidth = () => {
  screenWidth.value = window.innerWidth
}

const standardizeTimestamp = (timestamp: string, sensorId: string): string => {
  if (sensorId === 'soil_temperature' || sensorId === 'soil_moisture') {
    return handleSoilSensorTimestamp(timestamp)
  }
  return handleRegularTimestamp(timestamp)
}

const handleSoilSensorTimestamp = (timestamp: string): string => {
  if (!isNaN(Number(timestamp))) {
    const date = new Date(Number(timestamp))
    return !isNaN(date.getTime()) ? date.toISOString() : timestamp
  }

  if (typeof timestamp === 'string') {
    const date = new Date(timestamp)
    if (!isNaN(date.getTime())) return date.toISOString()

    if (timestamp.match(/^\d{4}-\d{2}-\d{2}$/)) {
      const date = new Date(timestamp + 'T12:00:00Z')
      return !isNaN(date.getTime()) ? date.toISOString() : timestamp
    }

    if (timestamp.match(/^\d{1,2}\/\d{1,2}\/\d{4}$/)) {
      const parts = timestamp.split('/')
      const date = new Date(
        parseInt(parts[2]),
        parseInt(parts[0]) - 1,
        parseInt(parts[1]),
        12,
        0,
        0,
      )
      return !isNaN(date.getTime()) ? date.toISOString() : timestamp
    }
  }

  return timestamp
}

const handleRegularTimestamp = (timestamp: string): string => {
  try {
    if (!timestamp.includes('T') || !timestamp.includes('Z')) {
      const date = new Date(timestamp)
      return !isNaN(date.getTime()) ? date.toISOString() : timestamp
    }
    return timestamp
  } catch (error) {
    console.error('Error standardizing timestamp:', timestamp, error)
    return timestamp
  }
}

const determineFileType = (fileData: any, fileName: string): string => {
  const hasHumidity = Object.keys(fileData).includes('humidity')
  const hasMoisture = Object.keys(fileData).includes('moisture')
  const hasTemperature = Object.keys(fileData).includes('temperature')

  if (hasHumidity) return 'air'
  if (hasMoisture) return 'soil'

  if (hasTemperature) {
    if (fileName.toLowerCase().includes('soil')) return 'soil'
    if (fileName.toLowerCase().includes('air')) return 'air'
  }

  if (fileName.toLowerCase().includes('soil')) return 'soil'
  if (fileName.toLowerCase().includes('air')) return 'air'

  return hasTemperature ? 'soil' : 'unknown'
}

const mapSensorId = (apiSensorKey: string, fileType: string): string => {
  if (apiSensorKey === 'temperature') {
    return fileType === 'air' ? 'air_temperature' : 'soil_temperature'
  }
  if (apiSensorKey === 'moisture') return 'soil_moisture'
  if (apiSensorKey === 'humidity') return 'air_humidity'

  return sensorMapping[apiSensorKey] || apiSensorKey
}

const processSensorData = (fileData: any, apiSensorKey: string, sensorId: string): DataPoint[] => {
  if (!fileData[apiSensorKey]?.history || !Array.isArray(fileData[apiSensorKey].history)) {
    return []
  }

  return fileData[apiSensorKey].history.map((point: { time: string; value: number }) => ({
    timestamp: standardizeTimestamp(point.time, sensorId),
    value: typeof point.value === 'number' ? point.value : parseFloat(point.value),
  }))
}

const mergeAndSortSensorData = (existingData: DataPoint[], newData: DataPoint[]): DataPoint[] => {
  const merged = [...existingData, ...newData]
  return merged.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
}

const processFileData = async (filesResponse: any): Promise<SensorData> => {
  const sortedFiles = [...filesResponse.files].sort(
    (a, b) => new Date(b.modifiedTime).getTime() - new Date(a.modifiedTime).getTime(),
  )

  const data: SensorData = {}
  selectedSensors.value.forEach((sensorId) => {
    data[sensorId] = []
  })

  const fetchPromises = sortedFiles.map((file) => fetchFileById(file.id))
  const fileDataArray = await Promise.all(fetchPromises)

  fileDataArray.forEach((fileData, index) => {
    const fileName = sortedFiles[index]?.name || 'unknown'
    const fileType = determineFileType(fileData, fileName)

    Object.keys(fileData).forEach((apiSensorKey) => {
      const sensorId = mapSensorId(apiSensorKey, fileType)

      if (selectedSensors.value.includes(sensorId)) {
        const sensorData = processSensorData(fileData, apiSensorKey, sensorId)

        if (sensorData.length > 0) {
          data[sensorId] = data[sensorId]
            ? mergeAndSortSensorData(data[sensorId], sensorData)
            : sensorData
        }
      }
    })
  })

  return data
}

const generateMockDataPoint = (sensorId: string, timestamp: string): DataPoint => {
  const config = mockValueRanges[sensorId as keyof typeof mockValueRanges] || {
    base: 0,
    range: 100,
  }
  const value = config.base + Math.random() * config.range

  return {
    timestamp,
    value: parseFloat(value.toFixed(1)),
  }
}

const generateMockData = () => {
  console.warn('Using mock data as fallback')
  const data: SensorData = {}
  const now = new Date()
  const startDate = new Date(dateRange.value.start)
  const daysDiff = Math.ceil((now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))

  availableSensors.forEach((sensor) => {
    data[sensor.id] = []

    for (let i = 0; i <= daysDiff; i++) {
      const date = new Date(startDate.getTime() + i * 24 * 60 * 60 * 1000)
      const dateStr = date.toISOString().split('T')[0]

      for (let hour = 0; hour < 24; hour++) {
        const timestamp = `${dateStr}T${hour.toString().padStart(2, '0')}:00:00`
        data[sensor.id].push(generateMockDataPoint(sensor.id, timestamp))
      }
    }
  })

  historicalData.value = data
}

const fetchHistoricalData = async () => {
  isLoading.value = true
  apiError.value = null

  try {
    const filesResponse = await fetchFiles()
    if (filesResponse?.files) {
      availableFiles.value = filesResponse.files

      if (availableFiles.value.length > 0) {
        const data = await processFileData(filesResponse)
        historicalData.value = data
      }
    }
  } catch (error) {
    console.error('Error fetching historical data:', error)
    apiError.value = error instanceof Error ? error.message : 'Failed to fetch data'
    generateMockData()
  } finally {
    isLoading.value = false
  }
}

const getDateRange = () => {
  try {
    const startDateObj = new Date(dateRange.value.start)
    startDateObj.setHours(0, 0, 0, 0)
    const startDate = startDateObj.getTime()

    const endDateObj = new Date(dateRange.value.end)
    endDateObj.setHours(23, 59, 59, 999)
    const endDate = endDateObj.getTime()

    if (isNaN(startDate) || isNaN(endDate)) {
      throw new Error('Invalid date range')
    }

    return { startDate, endDate }
  } catch (error) {
    console.error('Error parsing date range:', error)
    const now = new Date()
    const endDate = now.getTime()
    const startDate = now.getTime() - 30 * 24 * 60 * 60 * 1000
    return { startDate, endDate }
  }
}

const parseTimestamp = (timestamp: string): number => {
  let parsedDate = new Date(timestamp)
  let timestampMs = parsedDate.getTime()

  if (isNaN(timestampMs)) {
    if (typeof timestamp === 'string') {
      if (timestamp.match(/^\d{4}-\d{2}-\d{2}$/)) {
        parsedDate = new Date(timestamp + 'T12:00:00Z')
        timestampMs = parsedDate.getTime()
      } else if (timestamp.match(/^\d{1,2}\/\d{1,2}\/\d{4}$/)) {
        const parts = timestamp.split('/')
        parsedDate = new Date(
          parseInt(parts[2]),
          parseInt(parts[0]) - 1,
          parseInt(parts[1]),
          12,
          0,
          0,
        )
        timestampMs = parsedDate.getTime()
      } else if (timestamp.match(/^\d{1,2}\/\d{1,2} \d{1,2}:\d{2}$/)) {
        const currentYear = new Date().getFullYear()
        const [datePart, timePart] = timestamp.split(' ')
        const [month, day] = datePart.split('/')
        const [hour, minute] = timePart.split(':')

        parsedDate = new Date(
          currentYear,
          parseInt(month) - 1,
          parseInt(day),
          parseInt(hour),
          parseInt(minute),
          0,
        )
        timestampMs = parsedDate.getTime()
      }
    }
  }

  return timestampMs
}

const isPointInDateRange = (
  point: DataPoint,
  startDate: number,
  endDate: number,
  sensorId: string,
): boolean => {
  try {
    const timestamp = parseTimestamp(point.timestamp)
    return !isNaN(timestamp) && timestamp >= startDate && timestamp <= endDate
  } catch (error) {
    console.error(`Error filtering point for ${sensorId}:`, point, error)
    return false
  }
}

const filteredData = computed(() => {
  const result: SensorData = {}
  const { startDate, endDate } = getDateRange()

  Object.keys(historicalData.value).forEach((sensorId) => {
    result[sensorId] = []

    if (historicalData.value[sensorId]?.length > 0) {
      if (sensorId === 'soil_temperature' || sensorId === 'soil_moisture') {
        result[sensorId] = [...historicalData.value[sensorId]]
      } else {
        result[sensorId] = historicalData.value[sensorId].filter((point) =>
          isPointInDateRange(point, startDate, endDate, sensorId),
        )
      }
    } else {
      console.warn(`No historical data for ${sensorId} to filter`)
    }
  })

  return result
})

const formatChartTime = (timestamp: string): string => {
  try {
    const date = new Date(timestamp)
    if (isNaN(date.getTime())) {
      console.error('Invalid date:', timestamp)
      return 'Invalid date'
    }
    return `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()} ${date.getHours()}:00`
  } catch (error) {
    console.error('Error processing chart point:', error)
    return 'Error'
  }
}

const processChartPoint = (point: DataPoint) => {
  const time = formatChartTime(point.timestamp)
  const value = typeof point.value === 'number' ? point.value : parseFloat(point.value) || 0

  return { time, value }
}

const getChartDataForSensor = (sensorId: string) => {
  const dataSource =
    filteredData.value[sensorId]?.length > 0
      ? filteredData.value[sensorId]
      : (sensorId === 'soil_temperature' || sensorId === 'soil_moisture') &&
          historicalData.value[sensorId]?.length > 0
        ? historicalData.value[sensorId]
        : []

  if (dataSource.length === 0) {
    if (historicalData.value[sensorId]?.length > 0) {
      console.warn(
        `Sensor ${sensorId} has ${historicalData.value[sensorId].length} points in historicalData but none in filteredData`,
      )
    }
    return []
  }

  return dataSource
    .map((point) => processChartPoint(point))
    .filter((point) => point.time !== 'Invalid date' && point.time !== 'Error')
}

const chartData = computed(() => {
  const result: { [key: string]: { time: string; value: number }[] } = {}

  if (
    Object.keys(filteredData.value).length === 0 &&
    Object.keys(historicalData.value).length > 0
  ) {
    console.warn('filteredData is empty but historicalData has data. Check date range filtering.')
  }

  selectedSensors.value.forEach((sensorId) => {
    result[sensorId] = getChartDataForSensor(sensorId)
  })

  return result
})

const getSensorById = (id: string) => {
  return availableSensors.find((sensor) => sensor.id === id)
}

const getDateRangeForPeriod = (range: string) => {
  const now = new Date()
  let start = new Date()

  const dateRanges = {
    day: () => new Date(now.getFullYear(), now.getMonth(), now.getDate()),
    week: () => {
      const date = new Date(now)
      date.setDate(now.getDate() - 6)
      return date
    },
    month: () => {
      const date = new Date(now)
      date.setDate(now.getDate() - 29)
      return date
    },
    year: () => {
      const date = new Date(now)
      date.setFullYear(now.getFullYear() - 1)
      return date
    },
  }

  start = dateRanges[range as keyof typeof dateRanges]?.() || new Date()

  return {
    start: start.toISOString().split('T')[0],
    end: now.toISOString().split('T')[0],
  }
}

const setDateRange = (range: string) => {
  dateRange.value = getDateRangeForPeriod(range)
  fetchHistoricalData()
}

const toggleSensor = (sensorId: string) => {
  const index = selectedSensors.value.indexOf(sensorId)
  if (index === -1) {
    selectedSensors.value.push(sensorId)
  } else {
    selectedSensors.value.splice(index, 1)
  }
}

const prepareExportData = () => {
  const exportData: Record<string, Array<{ timestamp: string; value: number }>> = {}
  const sensorInfo: Record<string, { name: string; unit: string }> = {}

  Object.keys(filteredData.value).forEach((sensorId) => {
    const sensor = getSensorById(sensorId)
    if (!sensor) return

    const sensorData = {
      history: filteredData.value[sensorId].map((point) => ({
        time: point.timestamp,
        value: point.value,
      })),
      unit: sensor.unit,
      value:
        filteredData.value[sensorId].length > 0
          ? filteredData.value[sensorId][filteredData.value[sensorId].length - 1].value
          : 0,
    }

    const { exportData: sensorExportData, sensorInfo: sensorInfoData } = formatSensorDataForExport(
      sensorData,
      sensor.name,
    )

    exportData[sensorId] = sensorExportData
    sensorInfo[sensorId] = sensorInfoData
  })

  return { exportData, sensorInfo }
}

const handleExport = (exportOptions: any) => {
  const { exportData, sensorInfo } = prepareExportData()
  handleDataExport(exportOptions, exportData, sensorInfo)
}

onMounted(() => {
  updateScreenWidth()
  window.addEventListener('resize', updateScreenWidth)
  fetchHistoricalData()
})
</script>

<template>
  <div class="container mx-auto px-4 py-6">
    <!-- Title Banner -->
    <div
      class="mb-8 bg-white dark:bg-gray-900 rounded-xl shadow-md overflow-hidden border border-gray-100 dark:border-gray-700"
    >
      <div class="h-1.5 w-full bg-gradient-to-r from-rose-400 to-rose-600"></div>
      <div class="p-4 sm:p-6">
        <!-- Header Content -->
        <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <!-- Title and Description -->
          <div class="flex items-start sm:items-center w-full md:w-auto">
            <div
              class="bg-rose-100 dark:bg-rose-900/30 p-2 px-3 sm:px-4 sm:py-3 rounded-lg mr-3 sm:mr-4 flex-shrink-0"
            >
              <span
                class="mdi mdi-chart-line text-rose-600 dark:text-rose-400 text-xl sm:text-2xl"
              ></span>
            </div>
            <div class="flex-grow">
              <h1 class="text-xl sm:text-2xl font-bold text-gray-800 dark:text-gray-100">
                Historical Data
              </h1>
              <p
                class="text-sm sm:text-base text-gray-600 dark:text-gray-400 mt-0.5 sm:mt-1 line-clamp-2 sm:line-clamp-none"
              >
                View and analyze historical sensor data
              </p>
            </div>
          </div>

          <!-- Action Buttons -->
          <div class="flex flex-wrap gap-2 sm:gap-3 w-full md:w-auto justify-end mt-3 md:mt-0">
            <button
              @click="showExportModal = true"
              class="flex items-center px-3 sm:px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 dark:focus:ring-offset-gray-900 transition-colors shadow-sm"
            >
              <span class="mdi mdi-download mr-1.5"></span>
              <span class="whitespace-nowrap">Export Data</span>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Loading Indicator -->
    <div
      v-if="isLoading"
      class="flex justify-center items-center p-8 bg-white dark:bg-gray-900 rounded-xl shadow-lg mb-6 border border-gray-100 dark:border-gray-700"
    >
      <div class="flex flex-col items-center">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mb-4"></div>
        <p class="text-gray-600 dark:text-gray-400">Loading sensor data...</p>
      </div>
    </div>

    <!-- Error Message -->
    <div
      v-else-if="apiError"
      class="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 mb-6"
    >
      <div class="flex items-start">
        <div class="flex-shrink-0">
          <span class="mdi mdi-alert-circle text-red-500 dark:text-red-400 text-xl"></span>
        </div>
        <div class="ml-3">
          <h3 class="text-sm font-medium text-red-800 dark:text-red-300">Error loading data</h3>
          <div class="mt-2 text-sm text-red-700 dark:text-red-200">
            <p>{{ apiError }}</p>
            <p class="mt-2">Using mock data as fallback.</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Unified History Data Card with Tabs -->
    <div
      v-else
      class="bg-white dark:bg-gray-900 rounded-xl shadow-lg overflow-hidden border border-gray-100 dark:border-gray-700 dashboard-section mb-6"
    >
      <!-- Tab Navigation (All Screen Sizes) -->
      <div class="border-b border-gray-100 dark:border-gray-700">
        <div class="flex">
          <button
            @click="setActiveTab('date-range')"
            class="flex-1 py-3 px-4 text-center text-sm font-medium transition-colors duration-200 focus:outline-none"
            :class="{
              'text-primary-600 dark:text-primary-400 border-b-2 border-primary-500':
                activeTab === 'date-range',
              'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300':
                activeTab !== 'date-range',
            }"
          >
            <span class="mdi mdi-calendar-range mr-1"></span>
            Date Range
          </button>
          <button
            @click="setActiveTab('sensors')"
            class="flex-1 py-3 px-4 text-center text-sm font-medium transition-colors duration-200 focus:outline-none"
            :class="{
              'text-primary-600 dark:text-primary-400 border-b-2 border-primary-500':
                activeTab === 'sensors',
              'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300':
                activeTab !== 'sensors',
            }"
          >
            <span class="mdi mdi-tune mr-1"></span>
            Sensors
          </button>
        </div>

        <!-- Tab Content -->
        <div class="p-0">
          <!-- Date Range Tab Content -->
          <div v-if="activeTab === 'date-range'" class="animate-fade-in">
            <div class="p-4 border-b border-gray-100 dark:border-gray-700 flex items-center">
              <span class="mdi mdi-calendar-range text-primary-500 mr-2 text-xl"></span>
              <h2 class="text-lg font-semibold text-gray-700 dark:text-gray-200">Date Range</h2>
            </div>

            <!-- Date Range Controls -->
            <div class="p-4">
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
                    @change="fetchHistoricalData"
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
                    @change="fetchHistoricalData"
                  />
                </div>
              </div>
            </div>

            <div
              class="bg-gray-50 dark:bg-gray-800/50 border-t border-gray-100 dark:border-gray-700 p-4"
            >
              <div class="flex flex-wrap gap-4 justify-between">
                <div class="text-sm text-gray-600 dark:text-gray-300">
                  <span class="font-medium">{{ selectedSensors.length }}</span> sensors selected
                </div>
                <div class="text-sm text-gray-600 dark:text-gray-300">
                  <span class="font-medium">{{
                    new Date(dateRange.start).toLocaleDateString()
                  }}</span>
                  to
                  <span class="font-medium">{{
                    new Date(dateRange.end).toLocaleDateString()
                  }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Sensors Tab Content -->
        <div v-if="activeTab === 'sensors'" class="animate-fade-in">
          <div class="p-4 border-b border-gray-100 dark:border-gray-700 flex items-center">
            <span class="mdi mdi-tune text-primary-500 mr-2 text-xl"></span>
            <h2 class="text-lg font-semibold text-gray-700 dark:text-gray-200">Select Sensors</h2>
          </div>

          <!-- Sensor Selection Controls -->
          <div class="p-4">
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
              <div
                v-for="sensor in availableSensors"
                :key="sensor.id"
                class="flex items-center space-x-2 p-2 rounded-lg transition-colors cursor-pointer"
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

          <div
            class="bg-gray-50 dark:bg-gray-800/50 border-t border-gray-100 dark:border-gray-700 p-4"
          >
            <div class="flex flex-wrap gap-4 justify-between">
              <div class="text-sm text-gray-600 dark:text-gray-300">
                <span class="font-medium">{{ selectedSensors.length }}</span> sensors selected
              </div>
              <div class="text-sm text-gray-600 dark:text-gray-300">
                <span class="font-medium">{{
                  new Date(dateRange.start).toLocaleDateString()
                }}</span>
                to
                <span class="font-medium">{{ new Date(dateRange.end).toLocaleDateString() }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Charts Section - Now Below Tab Navigation -->
    <div v-if="selectedSensors.length > 0" class="animate-fade-in">
      <div class="flex items-center justify-between mb-6">
        <div class="flex items-center">
          <div class="bg-primary-100 dark:bg-primary-900/30 px-3 py-2 rounded-lg mr-3">
            <span class="mdi mdi-chart-line text-primary-600 dark:text-primary-400 text-xl"></span>
          </div>
          <h2 class="text-xl font-semibold text-gray-700 dark:text-gray-200">Sensor Data Charts</h2>
        </div>
        <div class="flex items-center gap-2">
          <button
            class="text-sm px-3 py-1.5 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors flex items-center"
            :class="{
              'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400':
                chartLayout === 'grid',
            }"
            @click="chartLayout = 'grid'"
          >
            <span
              class="mdi mdi-view-grid mr-1.5"
              :class="{ 'text-primary-500': chartLayout === 'grid' }"
            ></span>
            <span class="hidden sm:inline">Grid</span>
          </button>
          <button
            class="text-sm px-3 py-1.5 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors flex items-center"
            :class="{
              'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400':
                chartLayout === 'list',
            }"
            @click="chartLayout = 'list'"
          >
            <span
              class="mdi mdi-view-sequential mr-1.5"
              :class="{ 'text-primary-500': chartLayout === 'list' }"
            ></span>
            <span class="hidden sm:inline">List</span>
          </button>
        </div>
      </div>

      <div
        :class="{
          'grid gap-6': true,
          'grid-cols-1 md:grid-cols-2': chartLayout === 'grid' && selectedSensors.length > 1,
          'grid-cols-1': chartLayout === 'list' || selectedSensors.length === 1,
        }"
      >
        <div
          v-for="sensorId in selectedSensors"
          :key="sensorId"
          class="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden border border-gray-100 dark:border-gray-700 transition-all duration-300 hover:shadow-lg"
        >
          <div class="flex items-center p-3 border-b border-gray-100 dark:border-gray-700">
            <div
              class="w-3 h-3 rounded-full mr-2.5"
              :style="{ backgroundColor: getSensorById(sensorId)?.color }"
            ></div>
            <h3 class="text-base font-medium text-gray-800 dark:text-gray-200">
              {{ getSensorById(sensorId)?.name || '' }}
            </h3>
            <span class="text-xs text-gray-500 dark:text-gray-400 ml-2">
              {{ getSensorById(sensorId)?.unit }}
            </span>
            <div class="ml-auto flex">
              <button
                class="p-1 px-2 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                title="Remove from view"
                @click="toggleSensor(sensorId)"
              >
                <span class="mdi mdi-close text-sm"></span>
              </button>
            </div>
          </div>
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

  <!-- Export Data Modal -->
  <DataExportModal
    :show="showExportModal"
    title="Export Sensor History Data"
    description="Select the sensors, date range, and format for your data export."
    data-type="history"
    :available-sensors="availableSensors"
    :dateRange="dateRange"
    @close="showExportModal = false"
    @export="handleExport"
  />
</template>

<style scoped>
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
  animation: fadeIn 0.3s ease-out;
}

input[type='date']::-webkit-calendar-picker-indicator {
  filter: invert(0);
}

.dark input[type='date']::-webkit-calendar-picker-indicator {
  filter: invert(1);
}

.hide-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}

.hide-scrollbar::-webkit-scrollbar {
  display: none;
}

.dark .bg-white,
.dark .bg-gray-50,
.dark .bg-gray-100,
.dark .bg-gray-200,
.dark .text-gray-700,
.dark .text-gray-800,
.dark .text-gray-900 {
  transition:
    background-color 0.3s ease,
    color 0.3s ease;
}
</style>
