<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import SensorChart from '@/components/SensorChart.vue'
import DataExportModal from '@/components/DataExportModal.vue'
import { formatSensorDataForExport } from '@/scripts'
import { handleDataExport } from '@/utils/exportUtils'
import { useApi } from '@/composables/useApi'

const { fetchFiles, fetchFileById } = useApi()

const activeTab = ref('date-range')
const setActiveTab = (tab: string) => {
  activeTab.value = tab
}

const screenWidth = ref(0)
const updateScreenWidth = () => {
  screenWidth.value = window.innerWidth
}

const chartLayout = ref(window.innerWidth >= 768 ? 'grid' : 'list')

onMounted(() => {
  updateScreenWidth()
  window.addEventListener('resize', updateScreenWidth)
  fetchHistoricalData()
})

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
  { id: 'soil_conductivity', name: 'Soil Conductivity', unit: 'mS/cm', color: '#f59e0b' },
  { id: 'air_temperature', name: 'Air Temperature', unit: '°C', color: '#ef4444' },
  { id: 'air_humidity', name: 'Air Humidity', unit: '%', color: '#0ea5e9' },
  { id: 'air_co2', name: 'CO₂ Level', unit: 'ppm', color: '#10b981' },
  { id: 'air_tvoc', name: 'TVOC Level', unit: 'ppb', color: '#6366f1' },
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

async function fetchHistoricalData() {
  isLoading.value = true
  apiError.value = null

  try {
    const filesResponse = await fetchFiles()
    if (filesResponse && filesResponse.files) {
      availableFiles.value = filesResponse.files

      if (availableFiles.value.length > 0) {
        const sortedFiles = [...availableFiles.value].sort(
          (a, b) => new Date(b.modifiedTime).getTime() - new Date(a.modifiedTime).getTime(),
        )
        const data: SensorData = {}
        const sensorMapping: Record<string, string> = {
          // These will be determined dynamically based on file context
          // temperature: handled dynamically based on file type
          // moisture: handled dynamically based on file type
          // humidity: handled dynamically based on file type
          ph: 'soil_ph',
          conductivity: 'soil_conductivity',
          air_temperature: 'air_temperature',
          co2: 'air_co2',
          tvoc: 'air_tvoc',
          light: 'light_intensity',
          soil_temperature: 'soil_temperature',
        }
        const fetchPromises = sortedFiles.map((file) => fetchFileById(file.id))
        const fileDataArray = await Promise.all(fetchPromises)

        // Debug the entire fileDataArray to understand its structure
        console.log('All file data:', fileDataArray.map((data, i) => ({
          fileName: sortedFiles[i]?.name,
          keys: Object.keys(data)
        })));
        
        // Initialize historicalData with empty arrays for each sensor
        selectedSensors.value.forEach(sensorId => {
          if (!data[sensorId]) {
            data[sensorId] = [];
          }
        });
        
        fileDataArray.forEach((fileData, index) => {
          // Get the file name for better debugging
          const fileName = sortedFiles[index]?.name || 'unknown';
          
          // Determine file type based on content and file name
          // Check for specific keys that identify each file type
          const hasHumidity = Object.keys(fileData).includes('humidity');
          const hasMoisture = Object.keys(fileData).includes('moisture');
          const hasTemperature = Object.keys(fileData).includes('temperature');
          
          // If it has humidity, it's an air file; if it has moisture, it's a soil file
          // If neither is present, try to determine based on other factors
          let fileType = 'unknown';
          
          if (hasHumidity) {
            fileType = 'air';
          } else if (hasMoisture) {
            fileType = 'soil';
          } else if (hasTemperature) {
            // If it only has temperature, determine by file name
            if (fileName.toLowerCase().includes('soil')) {
              fileType = 'soil';
            } else if (fileName.toLowerCase().includes('air')) {
              fileType = 'air';
            } else {
              // If we can't determine from the file name, check the structure
              // of the temperature data to make a best guess
              fileType = 'unknown';
            }
          }
          
          // If we still don't know, make a final guess based on file name
          if (fileType === 'unknown') {
            if (fileName.toLowerCase().includes('soil')) {
              fileType = 'soil';
            } else if (fileName.toLowerCase().includes('air')) {
              fileType = 'air';
            } else {
              // Default to a type based on what data we have
              fileType = hasTemperature ? 'soil' : 'unknown';
            }
          }
          
          console.log('File type determined:', fileType, 'for file:', fileName, 'with keys:', Object.keys(fileData));
          
          Object.keys(fileData).forEach((apiSensorKey) => {
            // Dynamically determine the correct sensor ID based on file type and API key
            let sensorId;
            
            // Handle temperature and moisture/humidity based on file type
            if (apiSensorKey === 'temperature') {
              // Explicitly set the sensor ID based on file type
              if (fileType === 'air') {
                sensorId = 'air_temperature';
              } else if (fileType === 'soil') {
                sensorId = 'soil_temperature';
              } else {
                // If file type is unknown, use a default mapping
                sensorId = 'soil_temperature';
              }
            } else if (apiSensorKey === 'moisture') {
              sensorId = 'soil_moisture';
            } else if (apiSensorKey === 'humidity') {
              sensorId = 'air_humidity';
            } else {
              // For other keys, use the mapping or the key itself
              sensorId = sensorMapping[apiSensorKey] || apiSensorKey;
            }
            
            // Debug logging to help diagnose issues
            console.log('Processing sensor data:', {
              apiSensorKey,
              sensorId,
              fileType,
              fileName: sortedFiles[index]?.name,
              hasHistory: fileData[apiSensorKey]?.history ? 'yes' : 'no',
              historyLength: fileData[apiSensorKey]?.history?.length || 0
            })

            // Only process if the sensor ID is in our selected sensors
            if (selectedSensors.value.includes(sensorId) && 
              fileData[apiSensorKey] &&
              fileData[apiSensorKey].history &&
              Array.isArray(fileData[apiSensorKey].history)
            ) {
              // Convert the history data to our expected format
              const sensorData = fileData[apiSensorKey].history.map(
                (point: { time: string; value: number }) => {
                  // Ensure timestamp is in a consistent format
                  let timestamp = point.time;
                  
                  // Debug the timestamp format
                  console.log(`Original timestamp for ${sensorId}:`, timestamp);
                  
                  // Try to standardize the timestamp format if needed
                  try {
                    // If it's not already an ISO string, try to convert it
                    if (!timestamp.includes('T') || !timestamp.includes('Z')) {
                      const date = new Date(timestamp);
                      if (!isNaN(date.getTime())) {
                        timestamp = date.toISOString();
                        console.log(`Converted timestamp to ISO:`, timestamp);
                      }
                    }
                  } catch (error) {
                    console.error(`Error standardizing timestamp for ${sensorId}:`, timestamp, error);
                  }
                  
                  return {
                    timestamp: timestamp,
                    value: typeof point.value === 'number' ? point.value : parseFloat(point.value),
                  };
                }
              )

              // Add the data to our historicalData object
              if (data[sensorId]) {
                data[sensorId] = [...data[sensorId], ...sensorData]
                // Sort by timestamp
                data[sensorId].sort(
                  (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime(),
                )
              } else {
                data[sensorId] = sensorData
              }
              
              // Debug the data we've added
              console.log(`Added ${sensorData.length} data points to ${sensorId}, total now: ${data[sensorId].length}`)
            }
          })
        })

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

function generateMockData() {
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

        let value = 0
        switch (sensor.id) {
          case 'soil_temperature':
            value = 18 + Math.random() * 8
            break
          case 'soil_moisture':
            value = 45 + Math.random() * 30
            break
          case 'soil_ph':
            value = 6 + Math.random() * 1.2
            break
          case 'soil_conductivity':
            value = 0.9 + Math.random() * 0.5
            break
          case 'air_temperature':
            value = 20 + Math.random() * 6
            break
          case 'air_humidity':
            value = 35 + Math.random() * 20
            break
          case 'air_co2':
            value = 500 + Math.random() * 450
            break
          case 'air_tvoc':
            value = 100 + Math.random() * 200
            break
          case 'light_intensity':
            value = 250 + Math.random() * 550
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

const filteredData = computed(() => {
  const result: SensorData = {}
  
  // Parse dates and ensure they're valid
  let startDate: number, endDate: number
  try {
    // Ensure we have a valid date format by using YYYY-MM-DD
    const startDateStr = dateRange.value.start;
    const endDateStr = dateRange.value.end;
    
    // Create date objects at the start of the day for start date
    const startDateObj = new Date(startDateStr);
    startDateObj.setHours(0, 0, 0, 0);
    startDate = startDateObj.getTime();
    
    // Create date object at the end of the day for end date
    const endDateObj = new Date(endDateStr);
    endDateObj.setHours(23, 59, 59, 999);
    endDate = endDateObj.getTime();
    
    // Debug date range
    console.log('Date range filtering:', {
      startStr: startDateStr,
      endStr: endDateStr,
      startObj: startDateObj.toISOString(),
      endObj: endDateObj.toISOString(),
      startTime: startDate,
      endTime: endDate
    });
    
    // Validate dates
    if (isNaN(startDate) || isNaN(endDate)) {
      console.error('Invalid date range:', dateRange.value);
      // Use a very wide date range as fallback
      const now = new Date();
      endDate = now.getTime();
      startDate = now.getTime() - 30 * 24 * 60 * 60 * 1000; // 30 days ago
    }
  } catch (error) {
    console.error('Error parsing date range:', error);
    // Use a very wide date range as fallback
    const now = new Date();
    endDate = now.getTime();
    startDate = now.getTime() - 30 * 24 * 60 * 60 * 1000; // 30 days ago
  }

  // Filter data based on date range
  Object.keys(historicalData.value).forEach((sensorId) => {
    // Initialize with empty array even if no data passes the filter
    result[sensorId] = []
    
    if (historicalData.value[sensorId] && historicalData.value[sensorId].length > 0) {
      // Log a sample of the data points to debug timestamp format
      if (historicalData.value[sensorId].length > 0) {
        const samplePoint = historicalData.value[sensorId][0];
        console.log(`Sample point for ${sensorId}:`, {
          rawTimestamp: samplePoint.timestamp,
          parsedDate: new Date(samplePoint.timestamp).toISOString(),
          parsedTime: new Date(samplePoint.timestamp).getTime(),
          startDate: new Date(startDate).toISOString(),
          endDate: new Date(endDate).toISOString()
        });
      }
      
      result[sensorId] = historicalData.value[sensorId].filter((point) => {
        try {
          const timestamp = new Date(point.timestamp).getTime();
          const isInRange = !isNaN(timestamp) && timestamp >= startDate && timestamp <= endDate;
          
          // Debug why points are being filtered out
          if (!isInRange && sensorId === 'soil_temperature') {
            console.log(`Point filtered out for ${sensorId}:`, {
              rawTimestamp: point.timestamp,
              parsedTime: timestamp,
              isNaN: isNaN(timestamp),
              beforeStart: timestamp < startDate,
              afterEnd: timestamp > endDate,
              value: point.value
            });
          }
          
          return isInRange;
        } catch (error) {
          console.error(`Error filtering point for ${sensorId}:`, point, error);
          return false;
        }
      })
      
      // Debug filtering results
      console.log(`Filtered ${sensorId}: ${historicalData.value[sensorId].length} → ${result[sensorId].length} points`)
    } else {
      console.warn(`No historical data for ${sensorId} to filter`)
    }
  })

  return result
})

const chartData = computed(() => {
  const result: { [key: string]: { time: string; value: number }[] } = {}

  // Debug: Log available sensors in filteredData and historicalData
  console.log('Available sensors in filteredData:', Object.keys(filteredData.value))
  console.log('Available sensors in historicalData:', Object.keys(historicalData.value))
  console.log('Selected sensors:', selectedSensors.value)
  
  // Check if filteredData is empty but historicalData has data
  if (Object.keys(filteredData.value).length === 0 && Object.keys(historicalData.value).length > 0) {
    console.warn('filteredData is empty but historicalData has data. Check date range filtering.')
  }
  
  selectedSensors.value.forEach((sensorId) => {
    if (filteredData.value[sensorId] && filteredData.value[sensorId].length > 0) {
      // Debug: Log data points count for this sensor
      console.log(`Sensor ${sensorId} has ${filteredData.value[sensorId].length} data points`)
      
      result[sensorId] = filteredData.value[sensorId].map((point) => {
        const date = new Date(point.timestamp)
        return {
          time: `${date.getMonth() + 1}/${date.getDate()} ${date.getHours()}:00`,
          value: typeof point.value === 'number' ? point.value : parseFloat(point.value),
        }
      })
    } else {
      // Debug: Log missing sensor data
      console.warn(`No data found for sensor: ${sensorId}`)
      
      // Check if this sensor exists in historicalData but not in filteredData
      if (historicalData.value[sensorId] && historicalData.value[sensorId].length > 0) {
        console.warn(`Sensor ${sensorId} has ${historicalData.value[sensorId].length} points in historicalData but none in filteredData`)
      }
    }
  })

  return result
})

function getSensorById(id: string) {
  return availableSensors.find((sensor) => sensor.id === id)
}

function setDateRange(range: string) {
  const now = new Date()
  let start = new Date()
  let timeframe = '24h'

  switch (range) {
    case 'day':
      start = new Date(now.getFullYear(), now.getMonth(), now.getDate())
      timeframe = '24h'
      break
    case 'week':
      start = new Date(now)
      start.setDate(now.getDate() - 6)
      timeframe = '7d'
      break
    case 'month':
      start = new Date(now)
      start.setDate(now.getDate() - 29)
      timeframe = '30d'
      break
    case 'year':
      start = new Date(now)
      start.setFullYear(now.getFullYear() - 1)
      timeframe = '30d'
      break
  }
  dateRange.value = {
    start: start.toISOString().split('T')[0],
    end: now.toISOString().split('T')[0],
  }
  fetchHistoricalData()
}

function toggleSensor(sensorId: string) {
  const index = selectedSensors.value.indexOf(sensorId)
  if (index === -1) {
    selectedSensors.value.push(sensorId)
  } else {
    selectedSensors.value.splice(index, 1)
  }
}

const showExportModal = ref(false)

function handleExport(exportOptions: any) {
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

  handleDataExport(exportOptions, exportData, sensorInfo)
}
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
            <div class="ml-auto flex gap-1">
              <button
                class="p-1 px-2 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                title="Download CSV"
              >
                <span class="mdi mdi-download text-sm"></span>
              </button>
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

/* Default (light mode): no inversion */
input[type='date']::-webkit-calendar-picker-indicator {
  filter: invert(0);
}

/* Dark mode: invert icon color to white */
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
