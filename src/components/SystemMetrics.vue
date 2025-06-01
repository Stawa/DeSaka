<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'

// ESP32 FT232 specific system metrics with more detailed data
const cpuUsage = ref(42)
const cpuFrequency = ref(240) // MHz
const cpuTemperature = ref(58) // °C

const memoryUsage = ref(68)
const memoryDetails = ref({
  total: 520, // KB
  free: 166, // KB
  used: 354, // KB,
})

const flashMemory = ref({
  used: 1.8,
  total: 4,
  unit: 'MB',
})

const uptime = ref({
  days: 15,
  hours: 7,
  minutes: 23,
  seconds: 45,
})

// System status with more detailed states
const systemStatus = ref('online') // 'online', 'offline', 'warning', 'error', 'sleep', 'updating'
const lastUpdated = ref(new Date())

// WiFi metrics specific to ESP32
const wifiDetails = ref({
  rssi: -67, // dBm
  channel: 6,
  ip: '192.168.1.105',
  ssid: 'IoT_Network',
  txPower: 20, // dBm
  connected: true,
  signalStrength: 65, // percentage
  rxBytes: 1024 * 1024 * 2.5, // 2.5 MB
  txBytes: 1024 * 1024 * 1.8, // 1.8 MB
})

// Sensor readings
const sensorReadings = ref({
  temperature: 24.5, // °C
  humidity: 65, // %
  pressure: 1013, // hPa
  light: 850, // lux
  voltage: 3.3, // V
})

// I/O pins for the updated UI
const ioPins = ref({
  digital: [
    { pin: 0, value: 1 },
    { pin: 1, value: 1 },
    { pin: 2, value: 0 },
    { pin: 3, value: 0 },
    { pin: 4, value: 1 },
    { pin: 5, value: 0 },
  ],
  analog: [
    { pin: 0, value: 1.65 },
    { pin: 1, value: 2.47 },
    { pin: 2, value: 3.12 },
  ],
})

// Serial interface for the updated UI
const serialInterface = ref({
  baudRate: 115200,
  rxBytes: 1024,
  txBytes: 768,
})

// Calculate flash memory usage percentage
const flashUsagePercent = computed(() => {
  return Math.round((flashMemory.value.used / flashMemory.value.total) * 100)
})

// Format uptime string with more precision
const uptimeFormatted = computed(() => {
  const { days, hours, minutes, seconds } = uptime.value
  if (days > 0) return `${days}d ${hours}h ${minutes}m`
  if (hours > 0) return `${hours}h ${minutes}m ${seconds}s`
  return `${minutes}m ${seconds}s`
})

// Format last updated time
const lastUpdatedFormatted = computed(() => {
  return lastUpdated.value.toLocaleString()
})

// WiFi signal strength indicator
const wifiSignalIcon = computed(() => {
  const rssi = wifiDetails.value.rssi
  if (rssi >= -50) return 'wifi-strength-4'
  if (rssi >= -60) return 'wifi-strength-3'
  if (rssi >= -70) return 'wifi-strength-2'
  if (rssi >= -80) return 'wifi-strength-1'
  return 'wifi-strength-outline'
})

// WiFi signal quality
const wifiSignalQuality = computed(() => {
  const rssi = wifiDetails.value.rssi
  if (rssi >= -50) return 'excellent'
  if (rssi >= -60) return 'good'
  if (rssi >= -70) return 'fair'
  if (rssi >= -80) return 'poor'
  return 'very poor'
})

// CPU temperature status
const cpuTempStatus = computed(() => {
  if (cpuTemperature.value > 80) return { status: 'critical', color: 'text-red-500' }
  if (cpuTemperature.value > 70) return { status: 'warning', color: 'text-amber-500' }
  return { status: 'normal', color: 'text-green-500' }
})

// Mock function to refresh data with ESP32 specific patterns
function refreshData() {
  // Simulate data refresh with realistic ESP32 values
  cpuUsage.value = Math.floor(Math.random() * 80) + 10 // ESP32 typically runs 10-90%
  cpuFrequency.value = Math.random() > 0.7 ? 240 : 160 // ESP32 frequency scaling
  cpuTemperature.value = 45 + Math.floor(Math.random() * 25) // ESP32 temp range

  // Memory fluctuations
  const freeMemory = Math.floor(Math.random() * 200) + 100 // 100-300KB free
  memoryDetails.value.free = freeMemory
  memoryDetails.value.used = memoryDetails.value.total - freeMemory
  memoryUsage.value = Math.round((memoryDetails.value.used / memoryDetails.value.total) * 100)

  // WiFi metrics fluctuation
  wifiDetails.value.rssi = -50 - Math.floor(Math.random() * 40) // -50 to -90 dBm
  wifiDetails.value.txPower = 18 + Math.floor(Math.random() * 5) // 18-22 dBm
  wifiDetails.value.signalStrength = Math.max(
    0,
    Math.min(100, Math.round((wifiDetails.value.rssi + 100) * 1.5)),
  )

  // Sensor readings fluctuation
  sensorReadings.value.temperature = 22 + Math.random() * 8
  sensorReadings.value.humidity = 60 + Math.random() * 20
  sensorReadings.value.pressure = 1010 + Math.random() * 10
  sensorReadings.value.light = 500 + Math.random() * 1000
  sensorReadings.value.voltage = 3.1 + Math.random() * 0.4

  // Update I/O pins
  ioPins.value.digital.forEach((pin, index) => {
    if (Math.random() > 0.7) {
      pin.value = pin.value === 1 ? 0 : 1
    }
  })

  ioPins.value.analog.forEach((pin) => {
    pin.value = Math.round((2.5 + Math.random() * 1.2) * 100) / 100
  })

  // Update serial interface
  serialInterface.value.rxBytes += Math.floor(Math.random() * 100)
  serialInterface.value.txBytes += Math.floor(Math.random() * 80)

  // Update uptime
  uptime.value.seconds += 30
  if (uptime.value.seconds >= 60) {
    uptime.value.seconds = 0
    uptime.value.minutes += 1
    if (uptime.value.minutes >= 60) {
      uptime.value.minutes = 0
      uptime.value.hours += 1
      if (uptime.value.hours >= 24) {
        uptime.value.hours = 0
        uptime.value.days += 1
      }
    }
  }

  // Update status randomly (mostly online)
  const statuses = ['online', 'online', 'online', 'online', 'warning', 'sleep']
  systemStatus.value = statuses[Math.floor(Math.random() * statuses.length)]

  // Update last updated time
  lastUpdated.value = new Date()
}

// Auto-refresh data every 10 seconds
onMounted(() => {
  refreshData() // Initial data
  setInterval(refreshData, 10000)
})
</script>

<template>
  <div
    class="system-metrics-container bg-white dark:bg-gray-900 rounded-xl shadow-md border border-gray-200 dark:border-gray-800 overflow-hidden max-w-full"
  >
    <!-- Header with ESP32 title and last updated time -->
    <div
      class="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-800/80 p-3 sm:p-4 border-b border-gray-200 dark:border-gray-700 flex flex-wrap justify-between items-center gap-2 sm:gap-4"
    >
      <div class="flex items-center min-w-0">
        <div
          class="bg-primary-100 dark:bg-primary-900/30 p-1.5 sm:p-2 rounded-lg mr-2 sm:mr-3 flex-shrink-0"
        >
          <span
            class="mdi mdi-chip text-primary-600 dark:text-primary-400 text-lg sm:text-xl"
          ></span>
        </div>
        <h2 class="text-base sm:text-lg font-medium text-gray-800 dark:text-gray-200 truncate">
          ESP32 FT232 Metrics
        </h2>
      </div>
      <div
        class="text-2xs sm:text-xs text-gray-500 dark:text-gray-400 flex-shrink-0 bg-white/80 dark:bg-gray-700/80 px-2 py-1 rounded-full shadow-sm backdrop-blur-sm border border-gray-200/50 dark:border-gray-600/50 flex items-center"
      >
        <span class="mdi mdi-clock-outline mr-1 text-gray-400 dark:text-gray-500"></span>
        <span class="truncate">{{ lastUpdatedFormatted }}</span>
      </div>
    </div>

    <!-- Main metrics grid -->
    <div class="p-3 sm:p-4">
      <div
        class="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-4"
      >
        <!-- CPU Usage -->
        <div
          class="bg-white dark:bg-gray-800 rounded-xl p-3 sm:p-4 border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-all duration-300 transform hover:-translate-y-1"
        >
          <div class="flex flex-wrap items-center justify-between mb-2 gap-2">
            <div class="flex items-center min-w-0">
              <div class="bg-blue-50 dark:bg-blue-900/20 p-1 rounded-md mr-2 flex-shrink-0">
                <span
                  class="mdi mdi-cpu-64-bit text-blue-600 dark:text-blue-400 text-base sm:text-lg"
                ></span>
              </div>
              <h3 class="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 truncate">
                CPU
              </h3>
            </div>
            <span
              class="text-2xs sm:text-xs text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-700/80 px-2 py-0.5 rounded-full flex-shrink-0 border border-gray-100 dark:border-gray-600/50"
            >
              {{ cpuFrequency }} MHz
            </span>
          </div>

          <div class="flex flex-wrap items-end justify-between gap-2 mb-1">
            <div class="text-lg sm:text-xl font-bold text-gray-800 dark:text-white">
              {{ cpuUsage }}%
            </div>
            <div class="flex items-center">
              <span
                class="text-2xs sm:text-xs font-medium px-2 py-0.5 rounded-full whitespace-nowrap flex-shrink-0"
                :class="{
                  'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300': cpuUsage > 80,
                  'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300':
                    cpuUsage > 50 && cpuUsage <= 80,
                  'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300':
                    cpuUsage <= 50,
                }"
              >
                {{ cpuUsage > 80 ? 'High' : cpuUsage > 50 ? 'Medium' : 'Low' }}
              </span>
            </div>
          </div>

          <!-- CPU Temperature indicator -->
          <div class="flex items-center mt-1 mb-2">
            <span
              class="mdi mdi-thermometer text-sm mr-1 flex-shrink-0"
              :class="cpuTempStatus.color"
            ></span>
            <span class="text-2xs sm:text-xs" :class="cpuTempStatus.color"
              >{{ cpuTemperature }}°C</span
            >
          </div>

          <!-- Progress bar -->
          <div class="h-2 w-full bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <div
              class="h-full rounded-full transition-all duration-500"
              :class="{
                'bg-red-500': cpuUsage > 80,
                'bg-amber-500': cpuUsage > 50 && cpuUsage <= 80,
                'bg-green-500': cpuUsage <= 50,
              }"
              :style="{ width: `${cpuUsage}%` }"
            ></div>
          </div>
        </div>

        <!-- Memory Usage -->
        <div
          class="bg-white dark:bg-gray-800 rounded-xl p-3 sm:p-4 border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-all duration-300 transform hover:-translate-y-1"
        >
          <div class="flex flex-wrap items-center justify-between mb-2 gap-2">
            <div class="flex items-center min-w-0">
              <div class="bg-purple-50 dark:bg-purple-900/20 p-1 rounded-md mr-2 flex-shrink-0">
                <span
                  class="mdi mdi-memory text-purple-600 dark:text-purple-400 text-base sm:text-lg"
                ></span>
              </div>
              <h3 class="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 truncate">
                Memory
              </h3>
            </div>
            <span
              class="text-2xs sm:text-xs text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-700/80 px-2 py-0.5 rounded-full flex-shrink-0 border border-gray-100 dark:border-gray-600/50"
            >
              {{ memoryDetails.total }} KB
            </span>
          </div>

          <div class="flex flex-wrap items-end justify-between gap-2 mb-1">
            <div class="text-lg sm:text-xl font-bold text-gray-800 dark:text-white">
              {{ memoryUsage }}%
            </div>
            <div class="flex items-center">
              <span
                class="text-2xs sm:text-xs font-medium px-2 py-0.5 rounded-full whitespace-nowrap flex-shrink-0"
                :class="{
                  'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300': memoryUsage > 80,
                  'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300':
                    memoryUsage > 50 && memoryUsage <= 80,
                  'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300':
                    memoryUsage <= 50,
                }"
              >
                {{ memoryUsage > 80 ? 'High' : memoryUsage > 50 ? 'Medium' : 'Low' }}
              </span>
            </div>
          </div>

          <!-- Memory details -->
          <div
            class="flex flex-wrap justify-between text-2xs sm:text-xs text-gray-500 dark:text-gray-400 mt-1 mb-2 gap-x-4 gap-y-1"
          >
            <span class="whitespace-nowrap flex-shrink-0">Used: {{ memoryDetails.used }} KB</span>
            <span class="whitespace-nowrap flex-shrink-0">Free: {{ memoryDetails.free }} KB</span>
          </div>

          <!-- Progress bar -->
          <div class="h-2 w-full bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <div
              class="h-full rounded-full transition-all duration-500"
              :class="{
                'bg-red-500': memoryUsage > 80,
                'bg-amber-500': memoryUsage > 50 && memoryUsage <= 80,
                'bg-green-500': memoryUsage <= 50,
              }"
              :style="{ width: `${memoryUsage}%` }"
            ></div>
          </div>
        </div>

        <!-- Flash Memory -->
        <div
          class="bg-white dark:bg-gray-800 rounded-xl p-3 sm:p-4 border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-all duration-300 transform hover:-translate-y-1"
        >
          <div class="flex flex-wrap items-center justify-between mb-2 gap-2">
            <div class="flex items-center min-w-0">
              <div class="bg-amber-50 dark:bg-amber-900/20 p-1 rounded-md mr-2 flex-shrink-0">
                <span
                  class="mdi mdi-flash text-amber-600 dark:text-amber-400 text-base sm:text-lg"
                ></span>
              </div>
              <h3 class="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 truncate">
                Flash Memory
              </h3>
            </div>
            <span
              class="text-2xs sm:text-xs text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-700/80 px-2 py-0.5 rounded-full flex-shrink-0 border border-gray-100 dark:border-gray-600/50"
            >
              {{ flashMemory.total }} MB
            </span>
          </div>

          <div class="flex flex-wrap items-end justify-between gap-2 mb-1">
            <div class="text-lg sm:text-xl font-bold text-gray-800 dark:text-white">
              {{ flashUsagePercent }}%
            </div>
            <div class="flex items-center">
              <span
                class="text-2xs sm:text-xs font-medium px-2 py-0.5 rounded-full whitespace-nowrap flex-shrink-0"
                :class="{
                  'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300':
                    flashUsagePercent > 80,
                  'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300':
                    flashUsagePercent > 50 && flashUsagePercent <= 80,
                  'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300':
                    flashUsagePercent <= 50,
                }"
              >
                {{ flashUsagePercent > 80 ? 'High' : flashUsagePercent > 50 ? 'Medium' : 'Low' }}
              </span>
            </div>
          </div>

          <!-- Flash details -->
          <div
            class="flex flex-wrap justify-between text-2xs sm:text-xs text-gray-500 dark:text-gray-400 mt-1 mb-2 gap-x-4 gap-y-1"
          >
            <span class="whitespace-nowrap flex-shrink-0">Used: {{ flashMemory.used }} MB</span>
            <span class="whitespace-nowrap flex-shrink-0">Free: {{ flashMemory.free }} MB</span>
          </div>

          <!-- Progress bar -->
          <div class="h-2 w-full bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <div
              class="h-full rounded-full transition-all duration-500"
              :class="{
                'bg-red-500': flashUsagePercent > 80,
                'bg-amber-500': flashUsagePercent > 50 && flashUsagePercent <= 80,
                'bg-green-500': flashUsagePercent <= 50,
              }"
              :style="{ width: `${flashUsagePercent}%` }"
            ></div>
          </div>
        </div>

        <!-- System Uptime -->
        <div
          class="bg-white dark:bg-gray-800 rounded-xl p-3 sm:p-4 border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-all duration-300 transform hover:-translate-y-1"
        >
          <div class="flex flex-wrap items-center justify-between mb-2 gap-2">
            <div class="flex items-center min-w-0">
              <div class="bg-blue-50 dark:bg-blue-900/20 p-1 rounded-md mr-2 flex-shrink-0">
                <span
                  class="mdi mdi-clock-outline text-blue-600 dark:text-blue-400 text-base sm:text-lg"
                ></span>
              </div>
              <h3 class="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 truncate">
                System Uptime
              </h3>
            </div>
          </div>

          <div class="flex flex-wrap items-end justify-between gap-2 mb-1">
            <div class="text-lg sm:text-xl font-bold text-gray-800 dark:text-white">
              {{ formattedUptime }}
            </div>
          </div>

          <!-- Uptime details -->
          <div
            class="flex flex-wrap justify-between text-2xs sm:text-xs text-gray-500 dark:text-gray-400 mt-1 mb-2 gap-x-4 gap-y-1"
          >
            <span class="whitespace-nowrap flex-shrink-0">Days: {{ uptime.days }}</span>
            <span class="whitespace-nowrap flex-shrink-0">Hours: {{ uptime.hours }}</span>
          </div>

          <!-- Progress bar -->
          <div class="h-2 w-full bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <div
              class="h-full rounded-full transition-all duration-500 bg-blue-500"
              :style="{ width: `${Math.min(100, (uptime.days / 30) * 100)}%` }"
            ></div>
          </div>
        </div>

        <!-- System Uptime -->
        <div
          class="bg-white dark:bg-gray-800 rounded-xl p-3 sm:p-4 border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-all duration-300 transform hover:-translate-y-1"
        >
          <div class="flex flex-wrap items-center justify-between mb-2 gap-2">
            <div class="flex items-center min-w-0">
              <div class="bg-blue-50 dark:bg-blue-900/20 p-1 rounded-md mr-2 flex-shrink-0">
                <span
                  class="mdi mdi-clock-outline text-blue-600 dark:text-blue-400 text-base sm:text-lg"
                ></span>
              </div>
              <h3 class="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 truncate">
                System Uptime
              </h3>
            </div>
          </div>

          <div class="flex flex-wrap items-end justify-between gap-2 mb-1">
            <div class="text-lg sm:text-xl font-bold text-gray-800 dark:text-white">
              {{ flashUsagePercent }}%
            </div>
            <div class="flex items-center">
              <span
                class="text-2xs sm:text-xs font-medium px-2 py-0.5 rounded-full whitespace-nowrap flex-shrink-0"
                :class="{
                  'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300':
                    flashUsagePercent > 80,
                  'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300':
                    flashUsagePercent > 50 && flashUsagePercent <= 80,
                  'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300':
                    flashUsagePercent <= 50,
                }"
              >
                {{ flashUsagePercent > 80 ? 'High' : flashUsagePercent > 50 ? 'Medium' : 'Low' }}
              </span>
            </div>
          </div>

          <!-- Flash details -->
          <div
            class="flex flex-wrap justify-between text-2xs sm:text-xs text-gray-500 dark:text-gray-400 mt-1 mb-2 gap-x-4 gap-y-1"
          >
            <span class="whitespace-nowrap flex-shrink-0">Used: {{ flashMemory.used }} MB</span>
            <span class="whitespace-nowrap flex-shrink-0">Free: {{ flashMemory.free }} MB</span>
          </div>

          <!-- Progress bar -->
          <div class="h-2 w-full bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <div
              class="h-full rounded-full transition-all duration-500"
              :class="{
                'bg-red-500': flashUsagePercent > 80,
                'bg-amber-500': flashUsagePercent > 50 && flashUsagePercent <= 80,
                'bg-green-500': flashUsagePercent <= 50,
              }"
              :style="{ width: `${flashUsagePercent}%` }"
            ></div>
          </div>
        </div>

        <!-- System Uptime -->
        <div
          class="bg-white dark:bg-gray-800 rounded-xl p-3 sm:p-4 border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-all duration-300 transform hover:-translate-y-1"
        >
          <div class="flex flex-wrap items-center justify-between mb-2 gap-2">
            <div class="flex items-center min-w-0">
              <div class="bg-blue-50 dark:bg-blue-900/20 p-1 rounded-md mr-2 flex-shrink-0">
                <span
                  class="mdi mdi-clock-outline text-blue-600 dark:text-blue-400 text-base sm:text-lg"
                ></span>
              </div>
              <h3 class="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 truncate">
                System Uptime
              </h3>
            </div>
          </div>

          <div class="flex flex-wrap items-end justify-between gap-2 mb-1">
            <div class="text-lg sm:text-xl font-bold text-gray-800 dark:text-white">
              {{ formattedUptime }}
            </div>
          </div>
        </div>
      </div>

      <!-- Secondary metrics grid -->
      <div
        class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 mt-3 sm:mt-4 xs:grid-cols-1"
      >
        <!-- WiFi Status -->
        <div
          class="bg-white dark:bg-gray-800 rounded-xl p-3 sm:p-4 border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-all duration-300 transform hover:-translate-y-1"
        >
          <div class="flex flex-wrap items-center justify-between mb-2 gap-2">
            <div class="flex items-center min-w-0">
              <div class="bg-green-50 dark:bg-green-900/20 p-1 rounded-md mr-2 flex-shrink-0">
                <span
                  :class="{
                    'mdi mdi-wifi text-green-600 dark:text-green-400': wifiStatus.connected,
                    'mdi mdi-wifi-off text-red-600 dark:text-red-400': !wifiStatus.connected,
                  }"
                  class="text-base sm:text-lg"
                ></span>
              </div>
              <h3 class="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 truncate">
                WiFi Status
              </h3>
            </div>
            <span
              class="text-2xs sm:text-xs font-medium px-2 py-0.5 rounded-full whitespace-nowrap flex-shrink-0"
              :class="{
                'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300':
                  wifiStatus.connected,
                'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300':
                  !wifiStatus.connected,
              }"
            >
              {{ wifiStatus.connected ? 'Connected' : 'Disconnected' }}
            </span>
          </div>

          <div class="space-y-3">
            <!-- WiFi Network -->
            <div class="flex items-center">
              <div
                class="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mr-3 flex-shrink-0"
              >
                <span class="mdi mdi-wifi text-blue-600 dark:text-blue-400"></span>
              </div>
              <div class="min-w-0 flex-1">
                <div class="flex items-center justify-between flex-wrap gap-2">
                  <p class="text-sm font-medium text-gray-700 dark:text-gray-300 truncate">
                    {{ wifiDetails.ssid || 'Not Connected' }}
                  </p>
                  <p
                    class="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap flex-shrink-0"
                    v-if="wifiDetails.connected"
                  >
                    {{ wifiDetails.signalStrength }}%
                  </p>
                </div>
                <div
                  class="h-2 w-full bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden mt-1"
                >
                  <div
                    class="h-full rounded-full"
                    :class="{
                      'bg-green-500':
                        wifiSignalQuality === 'excellent' || wifiSignalQuality === 'good',
                      'bg-amber-500': wifiSignalQuality === 'fair',
                      'bg-red-500':
                        wifiSignalQuality === 'poor' || wifiSignalQuality === 'very poor',
                    }"
                    :style="{ width: `${wifiDetails.signalStrength}%` }"
                  ></div>
                </div>
              </div>
            </div>

            <!-- Data Transfer -->
            <div
              class="flex flex-wrap justify-between text-xs text-gray-500 dark:text-gray-400 gap-x-4 gap-y-1"
            >
              <div class="whitespace-nowrap flex-shrink-0">
                <span>Received</span>
                <span class="text-gray-700 dark:text-gray-300 ml-2 whitespace-nowrap"
                  >{{ (wifiDetails.rxBytes / (1024 * 1024)).toFixed(2) }} MB</span
                >
              </div>
              <div class="whitespace-nowrap flex-shrink-0">
                <span>Transmitted</span>
                <span class="text-gray-700 dark:text-gray-300 ml-2 whitespace-nowrap"
                  >{{ (wifiDetails.txBytes / (1024 * 1024)).toFixed(2) }} MB</span
                >
              </div>
            </div>
          </div>
        </div>

        <!-- Environmental Sensors -->
        <div
          class="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700"
        >
          <div class="flex flex-wrap items-center mb-3 gap-2">
            <span
              class="mdi mdi-thermometer text-gray-700 dark:text-gray-300 text-lg mr-2 flex-shrink-0"
            ></span>
            <h3 class="text-sm font-medium text-gray-700 dark:text-gray-300 truncate">
              Environmental
            </h3>
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div class="overflow-hidden">
              <div class="text-xs text-gray-500 dark:text-gray-400 truncate">Temperature</div>
              <div
                class="text-base font-medium text-gray-800 dark:text-gray-200 truncate flex-shrink-0"
              >
                {{ sensorReadings.temperature.toFixed(1) }}°C
              </div>
            </div>
            <div class="overflow-hidden">
              <div class="text-xs text-gray-500 dark:text-gray-400 truncate">Humidity</div>
              <div
                class="text-base font-medium text-gray-800 dark:text-gray-200 truncate flex-shrink-0"
              >
                {{ sensorReadings.humidity.toFixed(0) }}%
              </div>
            </div>
            <div class="overflow-hidden">
              <div class="text-xs text-gray-500 dark:text-gray-400 truncate">Pressure</div>
              <div
                class="text-base font-medium text-gray-800 dark:text-gray-200 truncate flex-shrink-0"
              >
                {{ sensorReadings.pressure.toFixed(0) }} hPa
              </div>
            </div>
            <div class="overflow-hidden">
              <div class="text-xs text-gray-500 dark:text-gray-400 truncate">Light</div>
              <div
                class="text-base font-medium text-gray-800 dark:text-gray-200 truncate flex-shrink-0"
              >
                {{ sensorReadings.light.toFixed(0) }} lux
              </div>
            </div>
          </div>
        </div>

        <!-- I/O Pins -->
        <div
          class="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700"
        >
          <div class="flex flex-wrap items-center mb-3 gap-2">
            <span
              class="mdi mdi-chip text-gray-700 dark:text-gray-300 text-lg mr-2 flex-shrink-0"
            ></span>
            <h3 class="text-sm font-medium text-gray-700 dark:text-gray-300 truncate">I/O Pins</h3>
          </div>

          <div class="mb-3">
            <div class="text-xs text-gray-500 dark:text-gray-400 mb-1 truncate">Digital</div>
            <div class="flex flex-wrap gap-2">
              <div
                v-for="(pin, index) in ioPins.digital"
                :key="'digital-' + index"
                class="px-2 py-1 rounded text-xs font-medium whitespace-nowrap flex-shrink-0"
                :class="{
                  'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200':
                    pin.value === 1,
                  'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300': pin.value === 0,
                }"
              >
                D{{ pin.pin }}: {{ pin.value }}
              </div>
            </div>
          </div>

          <div>
            <div class="text-xs text-gray-500 dark:text-gray-400 mb-1 truncate">Analog</div>
            <div class="flex flex-wrap gap-2">
              <div
                v-for="(pin, index) in ioPins.analog"
                :key="'analog-' + index"
                class="px-2 py-1 bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 rounded text-xs font-medium whitespace-nowrap flex-shrink-0"
              >
                A{{ pin.pin }}: {{ pin.value.toFixed(2) }}V
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Serial Interface - Full width -->
      <div
        class="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700"
      >
        <div class="flex flex-wrap items-center justify-between mb-2 gap-2">
          <div class="flex items-center min-w-0">
            <span
              class="mdi mdi-serial-port text-gray-700 dark:text-gray-300 text-lg mr-2 flex-shrink-0"
            ></span>
            <h3 class="text-sm font-medium text-gray-700 dark:text-gray-300 truncate">
              FT232 Serial Interface
            </h3>
          </div>
          <span
            class="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded-full flex-shrink-0 whitespace-nowrap"
          >
            {{ serialInterface.baudRate }} baud
          </span>
        </div>

        <div class="flex flex-wrap gap-4 text-xs mb-2">
          <div class="flex items-center flex-shrink-0">
            <span class="text-gray-500 dark:text-gray-400 whitespace-nowrap">Baud rate:</span>
            <span class="text-gray-700 dark:text-gray-300 ml-2 whitespace-nowrap">
              {{ serialInterface.baudRate }}
            </span>
          </div>
          <div class="flex items-center flex-shrink-0">
            <span class="text-gray-500 dark:text-gray-400 whitespace-nowrap">Format:</span>
            <span class="text-gray-700 dark:text-gray-300 ml-2 whitespace-nowrap">8-N-1</span>
          </div>
          <div class="flex items-center flex-shrink-0">
            <span class="text-gray-500 dark:text-gray-400 whitespace-nowrap">RX:</span>
            <span class="text-gray-700 dark:text-gray-300 ml-2 whitespace-nowrap">
              {{ serialInterface.rxBytes }} bytes
            </span>
          </div>
          <div class="flex items-center flex-shrink-0">
            <span class="text-gray-500 dark:text-gray-400 whitespace-nowrap">TX:</span>
            <span class="text-gray-700 dark:text-gray-300 ml-2 whitespace-nowrap">
              {{ serialInterface.txBytes }} bytes
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- Footer with actions -->
    <div
      class="p-4 bg-gray-50 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 flex flex-wrap justify-between items-center gap-y-2"
    >
      <div class="flex flex-wrap gap-2">
        <button
          @click="refreshData"
          class="px-3 py-1.5 text-xs font-medium rounded-lg bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600 flex items-center"
        >
          <span class="mdi mdi-refresh mr-1 flex-shrink-0"></span>
          <span class="truncate flex-shrink-0">Refresh</span>
        </button>
        <button
          class="px-3 py-1.5 text-xs font-medium rounded-lg bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600 flex items-center"
        >
          <span class="mdi mdi-history mr-1 flex-shrink-0"></span>
          <span class="truncate flex-shrink-0">History</span>
        </button>
      </div>
      <button
        class="px-3 py-1.5 text-xs font-medium rounded-lg bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600 flex items-center"
      >
        <span class="mdi mdi-console mr-1 flex-shrink-0"></span>
        <span class="truncate flex-shrink-0">Console</span>
      </button>
    </div>
  </div>
</template>

<style scoped>
/* Add any additional styling here */

/* Custom media query for tablet sizes */
@media (min-width: 768px) and (max-width: 900px) {
  .system-metrics-container {
    max-width: 100%;
    margin: 0 auto;
  }

  /* Ensure text doesn't overflow in metric cards */
  .text-2xl {
    font-size: 1.25rem;
    line-height: 1.75rem;
  }

  .p-4 {
    padding: 0.75rem;
  }
}

/* Custom media query for mobile sizes */
@media (max-width: 767px) {
  .system-metrics-container {
    max-width: 100%;
    margin: 0 auto;
  }

  /* Ensure text doesn't overflow in metric cards */
  .text-2xl {
    font-size: 1.125rem;
    line-height: 1.5rem;
  }

  .text-base {
    font-size: 0.875rem;
    line-height: 1.25rem;
  }

  .text-sm {
    font-size: 0.75rem;
    line-height: 1rem;
  }

  .text-xs {
    font-size: 0.7rem;
    line-height: 0.9rem;
  }

  .p-4 {
    padding: 0.625rem;
  }

  /* Adjust grid layout for better mobile display */
  .grid-cols-2 {
    grid-template-columns: 1fr;
  }

  /* Increase spacing between flex items */
  .gap-2 {
    gap: 0.375rem;
  }
}
</style>

          <div class="flex flex-col gap-2 mb-2">
            <div v-if="wifiStatus.connected" class="flex items-center gap-2">
              <span class="text-2xs sm:text-xs text-gray-500 dark:text-gray-400">SSID:</span>
              <span class="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 truncate">
                {{ wifiStatus.ssid }}
              </span>
            </div>

            <div v-if="wifiStatus.connected" class="flex items-center gap-2">
              <span class="text-2xs sm:text-xs text-gray-500 dark:text-gray-400">Signal:</span>
              <div class="flex items-center gap-1">
                <span
                  class="text-xs sm:text-sm font-medium"
                  :class="{
                    'text-green-600 dark:text-green-400': wifiStatus.signalStrength > 70,
                    'text-amber-600 dark:text-amber-400':
                      wifiStatus.signalStrength > 30 && wifiStatus.signalStrength <= 70,
                    'text-red-600 dark:text-red-400': wifiStatus.signalStrength <= 30,
                  }"
                >
                  {{ wifiStatus.signalStrength }}%
                </span>
                <span
                  class="mdi text-base"
                  :class="{
                    'mdi-wifi-strength-4 text-green-600 dark:text-green-400': wifiStatus.signalStrength > 70,
                    'mdi-wifi-strength-2 text-amber-600 dark:text-amber-400':
                      wifiStatus.signalStrength > 30 && wifiStatus.signalStrength <= 70,
                    'mdi-wifi-strength-1 text-red-600 dark:text-red-400': wifiStatus.signalStrength <= 30,
                  }"
                ></span>
              </div>
            </div>
          </div>

          <!-- Signal strength bar -->
          <div v-if="wifiStatus.connected" class="h-2 w-full bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <div
              class="h-full rounded-full transition-all duration-500"
              :class="{
                'bg-green-500': wifiStatus.signalStrength > 70,
                'bg-amber-500': wifiStatus.signalStrength > 30 && wifiStatus.signalStrength <= 70,
                'bg-red-500': wifiStatus.signalStrength <= 30,
              }"
              :style="{ width: `${wifiStatus.signalStrength}%` }"
            ></div>
          </div>

          <!-- Data transfer -->
          <div v-if="wifiStatus.connected" class="flex flex-wrap justify-between mt-2 gap-x-4 gap-y-1">
            <span class="text-2xs sm:text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap flex-shrink-0">
              RX: {{ wifiStatus.bytesReceived }} KB
            </span>
            <span class="text-2xs sm:text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap flex-shrink-0">
              TX: {{ wifiStatus.bytesSent }} KB
            </span>
          </div>
          </div>
        </div>

        <!-- System Uptime -->
        <div
          class="bg-white dark:bg-gray-800 rounded-xl p-3 sm:p-4 border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-all duration-300 transform hover:-translate-y-1"
        >
          <div class="flex flex-wrap items-center justify-between mb-2 gap-2">
            <div class="flex items-center min-w-0">
              <div class="bg-blue-50 dark:bg-blue-900/20 p-1 rounded-md mr-2 flex-shrink-0">
                <span
                  class="mdi mdi-clock-outline text-blue-600 dark:text-blue-400 text-base sm:text-lg"
                ></span>
              </div>
              <h3 class="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 truncate">
                System Uptime
              </h3>
            </div>
          </div>

          <div class="flex flex-wrap items-end justify-between gap-2 mb-1">
            <div class="text-lg sm:text-xl font-bold text-gray-800 dark:text-white">
              {{ formattedUptime }}
            </div>
          </div>

          <!-- Uptime details -->
          <div
            class="flex flex-wrap justify-between text-2xs sm:text-xs text-gray-500 dark:text-gray-400 mt-1 mb-2 gap-x-4 gap-y-1"
          >
            <span class="whitespace-nowrap flex-shrink-0">Days: {{ uptime.days }}</span>
            <span class="whitespace-nowrap flex-shrink-0">Hours: {{ uptime.hours }}</span>
          </div>

          <!-- Progress bar -->
          <div class="h-2 w-full bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <div
              class="h-full rounded-full transition-all duration-500 bg-blue-500"
              :style="{ width: `${Math.min(100, (uptime.days / 30) * 100)}%` }"
            ></div>
          </div>
        </div>

        <!-- System Uptime -->
        <div
          class="bg-white dark:bg-gray-800 rounded-xl p-3 sm:p-4 border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-all duration-300 transform hover:-translate-y-1"
        >
          <div class="flex flex-wrap items-center justify-between mb-2 gap-2">
            <div class="flex items-center min-w-0">
              <div class="bg-blue-50 dark:bg-blue-900/20 p-1 rounded-md mr-2 flex-shrink-0">
                <span
                  class="mdi mdi-clock-outline text-blue-600 dark:text-blue-400 text-base sm:text-lg"
                ></span>
              </div>
              <h3 class="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 truncate">
                System Uptime
              </h3>
            </div>
          </div>

          <div class="flex flex-wrap items-end justify-between gap-2 mb-1">
            <div class="text-lg sm:text-xl font-bold text-gray-800 dark:text-white">
              {{ flashUsagePercent }}%
            </div>
            <div class="flex items-center">
              <span
                class="text-2xs sm:text-xs font-medium px-2 py-0.5 rounded-full whitespace-nowrap flex-shrink-0"
                :class="{
                  'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300':
                    flashUsagePercent > 80,
                  'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300':
                    flashUsagePercent > 50 && flashUsagePercent <= 80,
                  'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300':
                    flashUsagePercent <= 50,
                }"
              >
                {{ flashUsagePercent > 80 ? 'High' : flashUsagePercent > 50 ? 'Medium' : 'Low' }}
              </span>
            </div>
          </div>

          <!-- Flash details -->
          <div
            class="flex flex-wrap justify-between text-2xs sm:text-xs text-gray-500 dark:text-gray-400 mt-1 mb-2 gap-x-4 gap-y-1"
          >
            <span class="whitespace-nowrap flex-shrink-0">Used: {{ flashMemory.used }} MB</span>
            <span class="whitespace-nowrap flex-shrink-0">Free: {{ flashMemory.free }} MB</span>
          </div>

          <!-- Progress bar -->
          <div class="h-2 w-full bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <div
              class="h-full rounded-full transition-all duration-500"
              :class="{
                'bg-red-500': flashUsagePercent > 80,
                'bg-amber-500': flashUsagePercent > 50 && flashUsagePercent <= 80,
                'bg-green-500': flashUsagePercent <= 50,
              }"
              :style="{ width: `${flashUsagePercent}%` }"
            ></div>
          </div>
        </div>

        <!-- System Uptime -->
        <div
          class="bg-white dark:bg-gray-800 rounded-xl p-3 sm:p-4 border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-all duration-300 transform hover:-translate-y-1"
        >
          <div class="flex flex-wrap items-center justify-between mb-2 gap-2">
            <div class="flex items-center min-w-0">
              <div class="bg-blue-50 dark:bg-blue-900/20 p-1 rounded-md mr-2 flex-shrink-0">
                <span
                  class="mdi mdi-clock-outline text-blue-600 dark:text-blue-400 text-base sm:text-lg"
                ></span>
              </div>
              <h3 class="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 truncate">
                System Uptime
              </h3>
            </div>
          </div>

          <div class="flex flex-wrap items-end justify-between gap-2 mb-1">
            <div class="text-lg sm:text-xl font-bold text-gray-800 dark:text-white">
              {{ formattedUptime }}
            </div>
          </div>
        </div>
      </div>

      <!-- Secondary metrics grid -->
      <div
        class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 mt-3 sm:mt-4 xs:grid-cols-1"
      >
        <!-- WiFi Status -->
        <div
          class="bg-white dark:bg-gray-800 rounded-xl p-3 sm:p-4 border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-all duration-300 transform hover:-translate-y-1"
        >
          <div class="flex flex-wrap items-center justify-between mb-2 gap-2">
            <div class="flex items-center min-w-0">
              <div class="bg-green-50 dark:bg-green-900/20 p-1 rounded-md mr-2 flex-shrink-0">
                <span
                  :class="{
                    'mdi mdi-wifi text-green-600 dark:text-green-400': wifiStatus.connected,
                    'mdi mdi-wifi-off text-red-600 dark:text-red-400': !wifiStatus.connected,
                  }"
                  class="text-base sm:text-lg"
                ></span>
              </div>
              <h3 class="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 truncate">
                WiFi Status
              </h3>
            </div>
            <span
              class="text-2xs sm:text-xs font-medium px-2 py-0.5 rounded-full whitespace-nowrap flex-shrink-0"
              :class="{
                'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300':
                  wifiStatus.connected,
                'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300':
                  !wifiStatus.connected,
              }"
            >
              {{ wifiStatus.connected ? 'Connected' : 'Disconnected' }}
            </span>
          </div>

          <div class="space-y-3">
            <!-- WiFi Network -->
            <div class="flex items-center">
              <div
                class="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mr-3 flex-shrink-0"
              >
                <span class="mdi mdi-wifi text-blue-600 dark:text-blue-400"></span>
              </div>
              <div class="min-w-0 flex-1">
                <div class="flex items-center justify-between flex-wrap gap-2">
                  <p class="text-sm font-medium text-gray-700 dark:text-gray-300 truncate">
                    {{ wifiDetails.ssid || 'Not Connected' }}
                  </p>
                  <p
                    class="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap flex-shrink-0"
                    v-if="wifiDetails.connected"
                  >
                    {{ wifiDetails.signalStrength }}%
                  </p>
                </div>
                <div
                  class="h-2 w-full bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden mt-1"
                >
                  <div
                    class="h-full rounded-full"
                    :class="{
                      'bg-green-500':
                        wifiSignalQuality === 'excellent' || wifiSignalQuality === 'good',
                      'bg-amber-500': wifiSignalQuality === 'fair',
                      'bg-red-500':
                        wifiSignalQuality === 'poor' || wifiSignalQuality === 'very poor',
                    }"
                    :style="{ width: `${wifiDetails.signalStrength}%` }"
                  ></div>
                </div>
              </div>
            </div>

            <!-- Data Transfer -->
            <div
              class="flex flex-wrap justify-between text-xs text-gray-500 dark:text-gray-400 gap-x-4 gap-y-1"
            >
              <div class="whitespace-nowrap flex-shrink-0">
                <span>Received</span>
                <span class="text-gray-700 dark:text-gray-300 ml-2 whitespace-nowrap"
                  >{{ (wifiDetails.rxBytes / (1024 * 1024)).toFixed(2) }} MB</span
                >
              </div>
              <div class="whitespace-nowrap flex-shrink-0">
                <span>Transmitted</span>
                <span class="text-gray-700 dark:text-gray-300 ml-2 whitespace-nowrap"
                  >{{ (wifiDetails.txBytes / (1024 * 1024)).toFixed(2) }} MB</span
                >
              </div>
            </div>
          </div>
        </div>

        <!-- Environmental Sensors -->
        <div
          class="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700"
        >
          <div class="flex flex-wrap items-center mb-3 gap-2">
            <span
              class="mdi mdi-thermometer text-gray-700 dark:text-gray-300 text-lg mr-2 flex-shrink-0"
            ></span>
            <h3 class="text-sm font-medium text-gray-700 dark:text-gray-300 truncate">
              Environmental
            </h3>
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div class="overflow-hidden">
              <div class="text-xs text-gray-500 dark:text-gray-400 truncate">Temperature</div>
              <div
                class="text-base font-medium text-gray-800 dark:text-gray-200 truncate flex-shrink-0"
              >
                {{ sensorReadings.temperature.toFixed(1) }}°C
              </div>
            </div>
            <div class="overflow-hidden">
              <div class="text-xs text-gray-500 dark:text-gray-400 truncate">Humidity</div>
              <div
                class="text-base font-medium text-gray-800 dark:text-gray-200 truncate flex-shrink-0"
              >
                {{ sensorReadings.humidity.toFixed(0) }}%
              </div>
            </div>
            <div class="overflow-hidden">
              <div class="text-xs text-gray-500 dark:text-gray-400 truncate">Pressure</div>
              <div
                class="text-base font-medium text-gray-800 dark:text-gray-200 truncate flex-shrink-0"
              >
                {{ sensorReadings.pressure.toFixed(0) }} hPa
              </div>
            </div>
            <div class="overflow-hidden">
              <div class="text-xs text-gray-500 dark:text-gray-400 truncate">Light</div>
              <div
                class="text-base font-medium text-gray-800 dark:text-gray-200 truncate flex-shrink-0"
              >
                {{ sensorReadings.light.toFixed(0) }} lux
              </div>
            </div>
          </div>
        </div>

        <!-- I/O Pins -->
        <div
          class="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700"
        >
          <div class="flex flex-wrap items-center mb-3 gap-2">
            <span
              class="mdi mdi-chip text-gray-700 dark:text-gray-300 text-lg mr-2 flex-shrink-0"
            ></span>
            <h3 class="text-sm font-medium text-gray-700 dark:text-gray-300 truncate">I/O Pins</h3>
          </div>

          <div class="mb-3">
            <div class="text-xs text-gray-500 dark:text-gray-400 mb-1 truncate">Digital</div>
            <div class="flex flex-wrap gap-2">
              <div
                v-for="(pin, index) in ioPins.digital"
                :key="'digital-' + index"
                class="px-2 py-1 rounded text-xs font-medium whitespace-nowrap flex-shrink-0"
                :class="{
                  'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200':
                    pin.value === 1,
                  'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300': pin.value === 0,
                }"
              >
                D{{ pin.pin }}: {{ pin.value }}
              </div>
            </div>
          </div>

          <div>
            <div class="text-xs text-gray-500 dark:text-gray-400 mb-1 truncate">Analog</div>
            <div class="flex flex-wrap gap-2">
              <div
                v-for="(pin, index) in ioPins.analog"
                :key="'analog-' + index"
                class="px-2 py-1 bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 rounded text-xs font-medium whitespace-nowrap flex-shrink-0"
              >
                A{{ pin.pin }}: {{ pin.value.toFixed(2) }}V
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Serial Interface - Full width -->
      <div
        class="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700"
      >
        <div class="flex flex-wrap items-center justify-between mb-2 gap-2">
          <div class="flex items-center min-w-0">
            <span
              class="mdi mdi-serial-port text-gray-700 dark:text-gray-300 text-lg mr-2 flex-shrink-0"
            ></span>
            <h3 class="text-sm font-medium text-gray-700 dark:text-gray-300 truncate">
              FT232 Serial Interface
            </h3>
          </div>
          <span
            class="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded-full flex-shrink-0 whitespace-nowrap"
          >
            {{ serialInterface.baudRate }} baud
          </span>
        </div>

        <div class="flex flex-wrap gap-4 text-xs mb-2">
          <div class="flex items-center flex-shrink-0">
            <span class="text-gray-500 dark:text-gray-400 whitespace-nowrap">Baud rate:</span>
            <span class="text-gray-700 dark:text-gray-300 ml-2 whitespace-nowrap">
              {{ serialInterface.baudRate }}
            </span>
          </div>
          <div class="flex items-center flex-shrink-0">
            <span class="text-gray-500 dark:text-gray-400 whitespace-nowrap">Format:</span>
            <span class="text-gray-700 dark:text-gray-300 ml-2 whitespace-nowrap">8-N-1</span>
          </div>
          <div class="flex items-center flex-shrink-0">
            <span class="text-gray-500 dark:text-gray-400 whitespace-nowrap">RX:</span>
            <span class="text-gray-700 dark:text-gray-300 ml-2 whitespace-nowrap">
              {{ serialInterface.rxBytes }} bytes
            </span>
          </div>
          <div class="flex items-center flex-shrink-0">
            <span class="text-gray-500 dark:text-gray-400 whitespace-nowrap">TX:</span>
            <span class="text-gray-700 dark:text-gray-300 ml-2 whitespace-nowrap">
              {{ serialInterface.txBytes }} bytes
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- Footer with actions -->
    <div
      class="p-4 bg-gray-50 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 flex flex-wrap justify-between items-center gap-y-2"
    >
      <div class="flex flex-wrap gap-2">
        <button
          @click="refreshData"
          class="px-3 py-1.5 text-xs font-medium rounded-lg bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600 flex items-center"
        >
          <span class="mdi mdi-refresh mr-1 flex-shrink-0"></span>
          <span class="truncate flex-shrink-0">Refresh</span>
        </button>
        <button
          class="px-3 py-1.5 text-xs font-medium rounded-lg bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600 flex items-center"
        >
          <span class="mdi mdi-history mr-1 flex-shrink-0"></span>
          <span class="truncate flex-shrink-0">History</span>
        </button>
      </div>
      <button
        class="px-3 py-1.5 text-xs font-medium rounded-lg bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600 flex items-center"
      >
        <span class="mdi mdi-console mr-1 flex-shrink-0"></span>
        <span class="truncate flex-shrink-0">Console</span>
      </button>
    </div>
  </div>
</template>

<style scoped>
/* Add any additional styling here */

/* Custom media query for tablet sizes */
@media (min-width: 768px) and (max-width: 900px) {
  .system-metrics-container {
    max-width: 100%;
    margin: 0 auto;
  }

  /* Ensure text doesn't overflow in metric cards */
  .text-2xl {
    font-size: 1.25rem;
    line-height: 1.75rem;
  }

  .p-4 {
    padding: 0.75rem;
  }
}

/* Custom media query for mobile sizes */
@media (max-width: 767px) {
  .system-metrics-container {
    max-width: 100%;
    margin: 0 auto;
  }

  /* Ensure text doesn't overflow in metric cards */
  .text-2xl {
    font-size: 1.125rem;
    line-height: 1.5rem;
  }

  .text-base {
    font-size: 0.875rem;
    line-height: 1.25rem;
  }

  .text-sm {
    font-size: 0.75rem;
    line-height: 1rem;
  }

  .text-xs {
    font-size: 0.7rem;
    line-height: 0.9rem;
  }

  .p-4 {
    padding: 0.625rem;
  }

  /* Adjust grid layout for better mobile display */
  .grid-cols-2 {
    grid-template-columns: 1fr;
  }

  /* Increase spacing between flex items */
  .gap-2 {
    gap: 0.375rem;
  }
}
</style>

          <div class="flex flex-col gap-2 mb-2">
            <div v-if="wifiStatus.connected" class="flex items-center gap-2">
              <span class="text-2xs sm:text-xs text-gray-500 dark:text-gray-400">SSID:</span>
              <span class="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 truncate">
                {{ wifiStatus.ssid }}
              </span>
            </div>

            <div v-if="wifiStatus.connected" class="flex items-center gap-2">
              <span class="text-2xs sm:text-xs text-gray-500 dark:text-gray-400">Signal:</span>
              <div class="flex items-center gap-1">
                <span
                  class="text-xs sm:text-sm font-medium"
                  :class="{
                    'text-green-600 dark
