<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import HistoryLists from '@/components/history/HistoryLists.vue'
import DataExportModal from '@/components/DataExportModal.vue'
import HistoryHeader from '@/components/history/HistoryHeader.vue'
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
const selectedRange = ref<'day' | 'week' | 'month' | 'year'>('day')
const activeButtonClass =
  'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 shadow-sm'

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

const setDateRange = (range: 'day' | 'week' | 'month' | 'year') => {
  dateRange.value = getDateRangeForPeriod(range)
  selectedRange.value = range
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
  <div class="min-h-screen bg-gray-50 dark:bg-gray-950">
    <div class="mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8">
      <HistoryHeader :dateRange="dateRange" @export="showExportModal = true" />

      <!-- Loading State -->
      <div
        v-if="isLoading"
        class="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-2xl border border-gray-200/60 dark:border-gray-800/60 shadow-lg p-12 text-center animate-fade-in"
      >
        <div class="flex flex-col items-center">
          <div class="relative mb-6">
            <div
              class="w-16 h-16 border-4 border-gray-200 dark:border-gray-700 rounded-full animate-spin"
            ></div>
            <div
              class="absolute top-0 left-0 w-16 h-16 border-4 border-transparent border-t-emerald-500 rounded-full animate-spin"
            ></div>
          </div>
          <h3 class="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
            Loading Historical Data
          </h3>
          <p class="text-gray-600 dark:text-gray-400">Fetching sensor data from the server...</p>
        </div>
      </div>

      <!-- Error State -->
      <div
        v-else-if="apiError"
        class="bg-red-50/80 dark:bg-red-900/20 backdrop-blur-xl border border-red-200/60 dark:border-red-800/60 rounded-2xl p-6 animate-fade-in"
      >
        <div class="flex items-start gap-4">
          <div class="flex-shrink-0">
            <div
              class="w-10 h-10 bg-red-100 dark:bg-red-900/30 rounded-xl flex items-center justify-center"
            >
              <span class="mdi mdi-alert-circle text-red-600 dark:text-red-400 text-xl"></span>
            </div>
          </div>
          <div class="flex-1">
            <h3 class="text-lg font-semibold text-red-800 dark:text-red-300 mb-2">
              Error Loading Data
            </h3>
            <p class="text-red-700 dark:text-red-200 mb-3">{{ apiError }}</p>
            <p class="text-red-600 dark:text-red-300 text-sm">
              Don't worry - we're using mock data as a fallback so you can still explore the
              interface.
            </p>
          </div>
        </div>
      </div>

      <!-- Main Content -->
      <div v-else class="space-y-6 animate-fade-in">
        <!-- Control Panel -->
        <div
          class="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-2xl border border-gray-200/60 dark:border-gray-800/60 shadow-lg overflow-hidden"
        >
          <!-- Tab Navigation -->
          <div class="border-b border-gray-200/60 dark:border-gray-700/60">
            <div class="flex">
              <button
                @click="setActiveTab('date-range')"
                class="flex-1 py-4 px-6 text-center font-medium transition-all duration-300 relative group"
                :class="{
                  'text-emerald-600 dark:text-emerald-400 bg-emerald-50/50 dark:bg-emerald-900/20':
                    activeTab === 'date-range',
                  'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-50/50 dark:hover:bg-gray-800/30':
                    activeTab !== 'date-range',
                }"
              >
                <div class="flex items-center justify-center gap-2">
                  <span class="mdi mdi-calendar-range text-lg"></span>
                  <span>Date Range</span>
                </div>
                <div
                  v-if="activeTab === 'date-range'"
                  class="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-emerald-500 to-teal-500"
                ></div>
              </button>
              <button
                @click="setActiveTab('sensors')"
                class="flex-1 py-4 px-6 text-center font-medium transition-all duration-300 relative group"
                :class="{
                  'text-emerald-600 dark:text-emerald-400 bg-emerald-50/50 dark:bg-emerald-900/20':
                    activeTab === 'sensors',
                  'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-50/50 dark:hover:bg-gray-800/30':
                    activeTab !== 'sensors',
                }"
              >
                <div class="flex items-center justify-center gap-2">
                  <span class="mdi mdi-tune text-lg"></span>
                  <span>Sensors</span>
                </div>
                <div
                  v-if="activeTab === 'sensors'"
                  class="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-emerald-500 to-teal-500"
                ></div>
              </button>
            </div>
          </div>

          <!-- Tab Content -->
          <div class="p-6">
            <!-- Date Range Tab -->
            <div v-if="activeTab === 'date-range'" class="space-y-6 animate-fade-in">
              <div class="flex items-center gap-3 mb-6">
                <div
                  class="w-10 h-10 bg-emerald-100 dark:bg-emerald-900/30 rounded-xl flex items-center justify-center"
                >
                  <span
                    class="mdi mdi-calendar-range text-emerald-600 dark:text-emerald-400"
                  ></span>
                </div>
                <div>
                  <h3 class="text-lg font-semibold text-gray-900 dark:text-gray-100">
                    Select Time Period
                  </h3>
                  <p class="text-sm text-gray-600 dark:text-gray-400">
                    Choose the date range for historical data analysis
                  </p>
                </div>
              </div>

              <!-- Quick Date Buttons -->
              <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
                <button
                  @click="setDateRange('day')"
                  class="btn btn-ghost justify-center py-3 text-sm font-medium transition-all duration-200 hover:scale-105"
                  :class="[selectedRange === 'day' ? activeButtonClass : '']"
                >
                  <span class="mdi mdi-calendar-today mr-2"></span>
                  Today
                </button>
                <button
                  @click="setDateRange('week')"
                  class="btn btn-ghost justify-center py-3 text-sm font-medium transition-all duration-200 hover:scale-105"
                  :class="[selectedRange === 'week' ? activeButtonClass : '']"
                >
                  <span class="mdi mdi-calendar-week mr-2"></span>
                  7 Days
                </button>
                <button
                  @click="setDateRange('month')"
                  class="btn btn-ghost justify-center py-3 text-sm font-medium transition-all duration-200 hover:scale-105"
                  :class="[selectedRange === 'month' ? activeButtonClass : '']"
                  Z
                >
                  <span class="mdi mdi-calendar-month mr-2"></span>
                  30 Days
                </button>
                <button
                  @click="setDateRange('year')"
                  class="btn btn-ghost justify-center py-3 text-sm font-medium transition-all duration-200 hover:scale-105"
                  :class="[selectedRange === 'year' ? activeButtonClass : '']"
                >
                  <span class="mdi mdi-calendar mr-2"></span>
                  1 Year
                </button>
              </div>

              <!-- Custom Date Range -->
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div class="space-y-2">
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Start Date
                  </label>
                  <input
                    type="date"
                    v-model="dateRange.start"
                    @change="fetchHistoricalData"
                    class="input w-full"
                  />
                </div>
                <div class="space-y-2">
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    End Date
                  </label>
                  <input
                    type="date"
                    v-model="dateRange.end"
                    @change="fetchHistoricalData"
                    class="input w-full"
                  />
                </div>
              </div>
            </div>

            <!-- Sensors Tab -->
            <div v-if="activeTab === 'sensors'" class="space-y-6 animate-fade-in">
              <div class="flex items-center gap-3 mb-6">
                <div
                  class="w-10 h-10 bg-emerald-100 dark:bg-emerald-900/30 rounded-xl flex items-center justify-center"
                >
                  <span class="mdi mdi-tune text-emerald-600 dark:text-emerald-400"></span>
                </div>
                <div>
                  <h3 class="text-lg font-semibold text-gray-900 dark:text-gray-100">
                    Choose Sensors
                  </h3>
                  <p class="text-sm text-gray-500 dark:text-gray-400">
                    Select which sensors to include in your analysis
                  </p>
                </div>
              </div>

              <!-- Sensor Grid -->
              <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div
                  v-for="sensor in availableSensors"
                  :key="sensor.id"
                  @click="toggleSensor(sensor.id)"
                  class="group cursor-pointer p-4 rounded-xl border-2 transition-all duration-300 hover:scale-105"
                  :class="{
                    'border-emerald-200 dark:border-emerald-700 bg-emerald-50/50 dark:bg-emerald-900/20 shadow-lg shadow-emerald-500/10':
                      selectedSensors.includes(sensor.id),
                    'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 bg-white/50 dark:bg-gray-800/50':
                      !selectedSensors.includes(sensor.id),
                  }"
                >
                  <div class="flex items-center gap-3">
                    <div class="relative">
                      <div
                        class="w-4 h-4 rounded-full shadow-sm"
                        :style="{ backgroundColor: sensor.color }"
                      ></div>
                      <div
                        v-if="selectedSensors.includes(sensor.id)"
                        class="absolute -top-1 -right-1 w-3 h-3 bg-emerald-500 rounded-full flex items-center justify-center"
                      >
                        <span class="mdi mdi-check text-white text-xs"></span>
                      </div>
                    </div>
                    <div class="flex-1 min-w-0">
                      <h4 class="font-medium text-gray-900 dark:text-gray-100 truncate">
                        {{ sensor.name }}
                      </h4>
                      <p class="text-sm text-gray-500 dark:text-gray-400">{{ sensor.unit }}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Charts Section -->
        <div v-if="selectedSensors.length > 0">
          <HistoryLists
            :selected-sensors="selectedSensors"
            :chart-data="chartData"
            :get-sensor-by-id="getSensorById"
            :toggle-sensor="toggleSensor"
          />
        </div>

        <!-- Empty State -->
        <div
          v-else
          class="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-2xl border border-gray-200/60 dark:border-gray-800/60 shadow-lg p-12 text-center"
        >
          <div class="max-w-md mx-auto">
            <div class="relative mb-6">
              <div
                class="w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-2xl flex items-center justify-center mx-auto"
              >
                <span class="mdi mdi-chart-timeline-variant text-gray-400 text-3xl"></span>
              </div>
            </div>
            <h3 class="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-3">
              No Sensors Selected
            </h3>
            <p class="text-gray-600 dark:text-gray-400 mb-6 leading-relaxed">
              Choose sensors from the configuration panel above to start analyzing historical data
              and trends.
            </p>
            <button
              @click="
                selectedSensors = [
                  'soil_temperature',
                  'soil_moisture',
                  'air_temperature',
                  'air_humidity',
                ]
              "
              class="btn btn-primary group"
            >
              <span class="mdi mdi-auto-fix mr-2"></span>
              Select Default Sensors
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Export Modal -->
    <DataExportModal
      :show="showExportModal"
      title="Export Historical Data"
      description="Configure your data export settings and download historical sensor data."
      data-type="history"
      :available-sensors="availableSensors"
      :dateRange="dateRange"
      @close="showExportModal = false"
      @export="handleExport"
    />
  </div>
</template>

<style scoped>
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes float {
  0%,
  100% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-6px);
  }
}

.animate-fade-in {
  animation: fadeIn 0.6s ease-out;
}

.animate-float {
  animation: float 3s ease-in-out infinite;
}

/* Custom date input styling */
input[type='date']::-webkit-calendar-picker-indicator {
  filter: invert(0.5);
  transition: filter 0.2s ease;
}

input[type='date']:hover::-webkit-calendar-picker-indicator {
  filter: invert(0.3);
}

.dark input[type='date']::-webkit-calendar-picker-indicator {
  filter: invert(0.7);
}

.dark input[type='date']:hover::-webkit-calendar-picker-indicator {
  filter: invert(0.9);
}

/* Smooth transitions for theme changes */
* {
  transition:
    background-color 0.3s ease,
    border-color 0.3s ease,
    color 0.3s ease;
}
</style>
