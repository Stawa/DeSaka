<script setup lang="ts">
import { ref, computed, onMounted, type Ref } from 'vue'

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
    class="system-metrics-container bg-white dark:bg-gray-900 rounded-xl shadow-md border border-gray-200 dark:border-gray-800 overflow-hidden max-w-full">
    <!-- Header with ESP32 title and last updated time -->
    <div
      class="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-800/80 p-3 sm:p-4 border-b border-gray-200 dark:border-gray-700 flex flex-wrap justify-between items-center gap-2 sm:gap-4">
      <div class="flex items-center min-w-0">
        <div class="bg-primary-100 dark:bg-primary-900/30 p-1.5 sm:p-2 rounded-lg mr-2 sm:mr-3 flex-shrink-0">
          <span class="mdi mdi-chip text-primary-600 dark:text-primary-400 text-lg sm:text-xl"></span>
        </div>
        <h2 class="text-base sm:text-lg font-medium text-gray-800 dark:text-gray-200 truncate">
          ESP32 FT232 Metrics
        </h2>
      </div>
      <div
        class="text-2xs sm:text-xs text-gray-500 dark:text-gray-400 flex-shrink-0 bg-white/80 dark:bg-gray-700/80 px-2 py-1 rounded-full shadow-sm backdrop-blur-sm border border-gray-200/50 dark:border-gray-600/50 flex items-center">
        <span class="mdi mdi-clock-outline mr-1 text-gray-400 dark:text-gray-500"></span>
        <span class="truncate">{{ lastUpdatedFormatted }}</span>
      </div>
    </div>

    <!-- Main metrics grid -->
    <div class="p-3 sm:p-4">
      <div class="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-4">
        <!-- CPU Usage -->
        <div
          class="bg-white dark:bg-gray-800 rounded-xl p-3 sm:p-4 border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-all duration-300 transform hover:-translate-y-1">
          <div class="flex flex-wrap items-center justify-between mb-2 gap-2">
            <div class="flex items-center min-w-0">
              <div class="bg-blue-50 dark:bg-blue-900/20 p-1 rounded-md mr-2 flex-shrink-0">
                <span class="mdi mdi-cpu-64-bit text-blue-600 dark:text-blue-400 text-base sm:text-lg"></span>
              </div>
              <h3 class="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 truncate">
                CPU
              </h3>
            </div>
            <span
              class="text-2xs sm:text-xs text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-700/80 px-2 py-0.5 rounded-full flex-shrink-0 border border-gray-100 dark:border-gray-600/50">
              {{ cpuFrequency }} MHz
            </span>
          </div>

          <div class="flex flex-wrap items-end justify-between gap-2 mb-1">
            <div class="text-lg sm:text-xl font-bold text-gray-800 dark:text-white">
              {{ cpuUsage }}%
            </div>
            <div class="flex items-center">
              <span class="text-2xs sm:text-xs font-medium px-2 py-0.5 rounded-full whitespace-nowrap flex-shrink-0"
                :class="{
                  'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300': cpuUsage > 80,
                  'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300':
                    cpuUsage > 50 && cpuUsage <= 80,
                  'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300':
                    cpuUsage <= 50,
                }">
                {{ cpuUsage > 80 ? 'High' : cpuUsage > 50 ? 'Medium' : 'Low' }}
              </span>
            </div>
          </div>

          <!-- CPU Temperature indicator -->
          <div class="grid grid-cols-2 gap-x-4 gap-y-1 text-2xs sm:text-xs mb-2 mt-1">
            <div class="text-gray-600 dark:text-gray-400 col-span-2 flex items-center">
              <span class="mdi mdi-thermometer mr-1" :class="cpuTempStatus.color"></span>Temperature:
              <span class="font-medium text-gray-800 dark:text-gray-200 ml-1" :class="cpuTempStatus.color">{{ cpuTemperature }}°C</span>
            </div>
          </div>

          <!-- Progress bar -->
          <div class="h-2 w-full bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <div class="h-full rounded-full transition-all duration-500" :class="{
              'bg-red-500': cpuUsage > 80,
              'bg-amber-500': cpuUsage > 50 && cpuUsage <= 80,
              'bg-green-500': cpuUsage <= 50,
            }" :style="{ width: `${cpuUsage}%` }"></div>
          </div>
        </div>

        <!-- Memory Usage -->
        <div
          class="bg-white dark:bg-gray-800 rounded-xl p-3 sm:p-4 border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-all duration-300 transform hover:-translate-y-1">
          <div class="flex flex-wrap items-center justify-between mb-2 gap-2">
            <div class="flex items-center min-w-0">
              <div class="bg-purple-50 dark:bg-purple-900/20 p-1 rounded-md mr-2 flex-shrink-0">
                <span class="mdi mdi-memory text-purple-600 dark:text-purple-400 text-base sm:text-lg"></span>
              </div>
              <h3 class="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 truncate">
                Memory
              </h3>
            </div>
            <span
              class="text-2xs sm:text-xs text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-700/80 px-2 py-0.5 rounded-full flex-shrink-0 border border-gray-100 dark:border-gray-600/50">
              {{ memoryDetails.total }} KB
            </span>
          </div>

          <div class="flex flex-wrap items-end justify-between gap-2 mb-1">
            <div class="text-lg sm:text-xl font-bold text-gray-800 dark:text-white">
              {{ memoryUsage }}%
            </div>
            <div class="flex items-center">
              <span class="text-2xs sm:text-xs font-medium px-2 py-0.5 rounded-full whitespace-nowrap flex-shrink-0"
                :class="{
                  'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300': memoryUsage > 80,
                  'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300':
                    memoryUsage > 50 && memoryUsage <= 80,
                  'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300':
                    memoryUsage <= 50,
                }">
                {{ memoryUsage > 80 ? 'High' : memoryUsage > 50 ? 'Medium' : 'Low' }}
              </span>
            </div>
          </div>

          <!-- Memory details -->
          <div class="grid grid-cols-2 gap-x-4 gap-y-1 text-2xs sm:text-xs mb-2 mt-1">
            <div class="text-gray-600 dark:text-gray-400 flex items-center">
              <span class="mdi mdi-arrow-down-box-outline mr-1"></span>Used:
              <span class="font-medium text-gray-800 dark:text-gray-200 ml-1">{{ memoryDetails.used }} KB</span>
            </div>
            <div class="text-gray-600 dark:text-gray-400 flex items-center">
              <span class="mdi mdi-arrow-up-box-outline mr-1"></span>Free:
              <span class="font-medium text-gray-800 dark:text-gray-200 ml-1">{{ memoryDetails.free }} KB</span>
            </div>
          </div>

          <!-- Progress bar -->
          <div class="h-2 w-full bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <div class="h-full rounded-full transition-all duration-500" :class="{
              'bg-red-500': memoryUsage > 80,
              'bg-amber-500': memoryUsage > 50 && memoryUsage <= 80,
              'bg-green-500': memoryUsage <= 50,
            }" :style="{ width: `${memoryUsage}%` }"></div>
          </div>
        </div>

        <!-- System Uptime -->
        <div
          class="bg-white dark:bg-gray-800 rounded-xl p-3 sm:p-4 border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-all duration-300 transform hover:-translate-y-1">
          <div class="flex flex-wrap items-center justify-between mb-2 gap-2">
            <div class="flex items-center min-w-0">
              <div class="bg-blue-50 dark:bg-blue-900/20 p-1 rounded-md mr-2 flex-shrink-0">
                <span class="mdi mdi-clock-outline text-blue-600 dark:text-blue-400 text-base sm:text-lg"></span>
              </div>
              <h3 class="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 truncate">
                System Uptime
              </h3>
            </div>
          </div>

          <div class="flex flex-wrap items-end justify-between gap-2 mb-1">
            <div class="text-lg sm:text-xl font-bold text-gray-800 dark:text-white">
              {{ uptimeFormatted }}
            </div>
          </div>

          <!-- Uptime details -->
          <div class="grid grid-cols-2 gap-x-4 gap-y-1 text-2xs sm:text-xs mb-2 mt-1">
            <div class="text-gray-600 dark:text-gray-400 flex items-center">
              <span class="mdi mdi-calendar-blank-outline mr-1"></span>Days:
              <span class="font-medium text-gray-800 dark:text-gray-200 ml-1">{{ uptime.days }}</span>
            </div>
            <div class="text-gray-600 dark:text-gray-400 flex items-center">
              <span class="mdi mdi-clock-start mr-1"></span>Hours:
              <span class="font-medium text-gray-800 dark:text-gray-200 ml-1">{{ uptime.hours }}</span>
            </div>
            <div class="text-gray-600 dark:text-gray-400 flex items-center">
              <span class="mdi mdi-clock-time-five-outline mr-1"></span>Minutes:
              <span class="font-medium text-gray-800 dark:text-gray-200 ml-1">{{ uptime.minutes }}</span>
            </div>
            <div class="text-gray-600 dark:text-gray-400 flex items-center">
              <span class="mdi mdi-timer-sand-empty mr-1"></span>Seconds:
              <span class="font-medium text-gray-800 dark:text-gray-200 ml-1">{{ uptime.seconds }}</span>
            </div>
          </div>

          <!-- Progress bar -->
          <div class="h-2 w-full bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <div class="h-full rounded-full transition-all duration-500 bg-blue-500"
              :style="{ width: `${Math.min(100, (uptime.days / 30) * 100)}%` }"></div>
          </div>
        </div>

        <!-- WiFi Details -->
        <div
          class="bg-white dark:bg-gray-800 rounded-xl p-3 sm:p-4 border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-all duration-300 transform hover:-translate-y-1">
          <div class="flex flex-wrap items-center justify-between mb-2 gap-2">
            <div class="flex items-center min-w-0">
              <div class="bg-teal-50 dark:bg-teal-900/20 p-1 rounded-md mr-2 flex-shrink-0">
                <span class="mdi mdi-wifi text-teal-600 dark:text-teal-400 text-base sm:text-lg"></span>
              </div>
              <h3 class="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 truncate">
                WiFi Details
              </h3>
            </div>
            <span
              class="text-2xs sm:text-xs text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-700/80 px-2 py-0.5 rounded-full flex-shrink-0 border border-gray-100 dark:border-gray-600/50">
              {{ wifiDetails.status }}
            </span>
          </div>

          <div class="flex flex-wrap items-end justify-between gap-2 mb-1">
            <div class="text-lg sm:text-xl font-bold text-gray-800 dark:text-white">
              {{ wifiDetails.ssid || 'N/A' }}
            </div>
            <div class="flex items-center">
              <span class="mdi mdi-signal text-base sm:text-lg mr-1"
                :class="getSignalStrengthColor(wifiDetails.rssi)"></span>
              <span class="text-2xs sm:text-xs font-medium text-gray-700 dark:text-gray-300">{{ wifiDetails.rssi }} dBm</span>
            </div>
          </div>

          <!-- WiFi details grid -->
          <div class="grid grid-cols-2 gap-x-4 gap-y-1 text-2xs sm:text-xs mb-2 mt-1">
            <div class="text-gray-600 dark:text-gray-400 flex items-center">
              <span class="mdi mdi-ip-network-outline mr-1"></span>IP Address:
              <span class="font-medium text-gray-800 dark:text-gray-200 ml-1">{{ wifiDetails.ip }}</span>
            </div>
            <div class="text-gray-600 dark:text-gray-400 flex items-center">
              <span class="mdi mdi-key-variant mr-1"></span>Auth Mode:
              <span class="font-medium text-gray-800 dark:text-gray-200 ml-1">{{ wifiDetails.authmode }}</span>
            </div>
            <div class="text-gray-600 dark:text-gray-400 flex items-center col-span-2">
              <span class="mdi mdi-access-point-network mr-1"></span>MAC Address:
              <span class="font-medium text-gray-800 dark:text-gray-200 ml-1">{{ wifiDetails.mac }}</span>
            </div>
            <div class="text-gray-600 dark:text-gray-400 flex items-center col-span-2">
              <span class="mdi mdi-information-outline mr-1"></span>Channel:
              <span class="font-medium text-gray-800 dark:text-gray-200 ml-1">{{ wifiDetails.channel }}</span>
            </div>
          </div>
        </div>

        <!-- Flash Memory -->
        <div
          class="bg-white dark:bg-gray-800 rounded-xl p-3 sm:p-4 border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-all duration-300 transform hover:-translate-y-1">
          <div class="flex flex-wrap items-center justify-between mb-2 gap-2">
            <div class="flex items-center min-w-0">
              <div class="bg-orange-50 dark:bg-orange-900/20 p-1 rounded-md mr-2 flex-shrink-0">
                <span class="mdi mdi-chip text-orange-600 dark:text-orange-400 text-base sm:text-lg"></span>
              </div>
              <h3 class="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 truncate">
                Flash Memory
              </h3>
            </div>
            <span
              class="text-2xs sm:text-xs text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-700/80 px-2 py-0.5 rounded-full flex-shrink-0 border border-gray-100 dark:border-gray-600/50">
              {{ flashMemory.size }} KB
            </span>
          </div>

          <div class="flex flex-wrap items-end justify-between gap-2 mb-1">
            <div class="text-lg sm:text-xl font-bold text-gray-800 dark:text-white">
              {{ flashMemory.usagePercentage.toFixed(1) }}%
            </div>
            <div class="flex items-center">
              <span class="text-2xs sm:text-xs font-medium px-2 py-0.5 rounded-full whitespace-nowrap flex-shrink-0"
                :class="{
                  'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300': flashMemory.usagePercentage > 80,
                  'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300':
                    flashMemory.usagePercentage > 50 && flashMemory.usagePercentage <= 80,
                  'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300':
                    flashMemory.usagePercentage <= 50,
                }">
                {{ flashMemory.usagePercentage > 80 ? 'High' : flashMemory.usagePercentage > 50 ? 'Medium' : 'Low' }}
              </span>
            </div>
          </div>

          <!-- Flash memory details -->
          <div class="grid grid-cols-2 gap-x-4 gap-y-1 text-2xs sm:text-xs mb-2 mt-1">
            <div class="text-gray-600 dark:text-gray-400 flex items-center">
              <span class="mdi mdi-arrow-down-box-outline mr-1"></span>Used:
              <span class="font-medium text-gray-800 dark:text-gray-200 ml-1">{{ flashMemory.used }} KB</span>
            </div>
            <div class="text-gray-600 dark:text-gray-400 flex items-center">
              <span class="mdi mdi-arrow-up-box-outline mr-1"></span>Free:
              <span class="font-medium text-gray-800 dark:text-gray-200 ml-1">{{ flashMemory.free }} KB</span>
            </div>
          </div>

          <!-- Progress bar -->
          <div class="h-2 w-full bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <div class="h-full bg-orange-500 rounded-full transition-all duration-500"
              :style="{ width: `${flashMemory.usagePercentage}%` }"></div>
          </div>
        </div>

        <!-- Environmental Sensors -->
        <div v-if="hasEnvironmentalSensors"
          class="bg-white dark:bg-gray-800 rounded-xl p-3 sm:p-4 border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-all duration-300 transform hover:-translate-y-1">
          <div class="flex flex-wrap items-center justify-between mb-3 gap-2">
            <div class="flex items-center min-w-0">
              <div class="bg-lime-50 dark:bg-lime-900/20 p-1 rounded-md mr-2 flex-shrink-0">
                <span class="mdi mdi-thermometer-lines text-lime-600 dark:text-lime-400 text-base sm:text-lg"></span>
              </div>
              <h3 class="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 truncate">
                Environmental Sensors
              </h3>
            </div>
            <span
              class="text-2xs sm:text-xs text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-700/80 px-2 py-0.5 rounded-full flex-shrink-0 border border-gray-100 dark:border-gray-600/50">
              {{ availableSensorsCount }} Sensor{{ availableSensorsCount !== 1 ? 's' : '' }} Active
            </span>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3 text-2xs sm:text-xs">
            <template v-for="(sensor, key) in sensorReadings" :key="key">
              <div v-if="sensor.value !== null && sensor.value !== undefined && sensor.value !== ''"
                class="bg-gray-50 dark:bg-gray-700/50 p-2 rounded-lg border border-gray-200 dark:border-gray-600/30">
                <div class="flex items-center justify-between">
                  <div class="flex items-center min-w-0">
                    <span class="mdi text-gray-500 dark:text-gray-400 mr-1.5 text-sm"
                      :class="sensor.icon"></span>
                    <span class="text-gray-600 dark:text-gray-300 truncate">{{ sensor.name }}:</span>
                  </div>
                  <span class="font-medium text-gray-800 dark:text-gray-200 ml-1 whitespace-nowrap">
                    {{ formatSensorValue(sensor.value, sensor.unit) }}
                  </span>
                </div>
              </div>
            </template>
          </div>
        </div>

        <!-- I/O Pins -->
        <div v-if="hasIoPins"
          class="bg-white dark:bg-gray-800 rounded-xl p-3 sm:p-4 border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-all duration-300 transform hover:-translate-y-1">
          <div class="flex flex-wrap items-center justify-between mb-3 gap-2">
            <div class="flex items-center min-w-0">
              <div class="bg-sky-50 dark:bg-sky-900/20 p-1 rounded-md mr-2 flex-shrink-0">
                <span class="mdi mdi-gesture-tap-button text-sky-600 dark:text-sky-400 text-base sm:text-lg"></span>
              </div>
              <h3 class="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 truncate">
                I/O Pins
              </h3>
            </div>
            <span
              class="text-2xs sm:text-xs text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-700/80 px-2 py-0.5 rounded-full flex-shrink-0 border border-gray-100 dark:border-gray-600/50">
              {{ Object.keys(ioPins).length }} Pin{{ Object.keys(ioPins).length !== 1 ? 's' : '' }} Available
            </span>
          </div>
          <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 sm:gap-3">
            <div v-for="(pin, name) in ioPins" :key="name"
              class="bg-gray-50 dark:bg-gray-700/50 p-2 rounded-lg border border-gray-200 dark:border-gray-600/30 flex flex-col items-center justify-center aspect-square">
              <span class="text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">{{ name }}</span>
              <span class="text-lg font-bold"
                :class="pin.state ? 'text-green-500 dark:text-green-400' : 'text-red-500 dark:text-red-400'">
                {{ pin.state ? 'ON' : 'OFF' }}
              </span>
              <span class="text-2xs text-gray-500 dark:text-gray-400 mt-0.5">({{ pin.mode }})</span>
            </div>
          </div>
              <span class=
              <span class="mdi mdi-clock-time-five-outline mr-1"></span>Minutes:
          </div>
        </div>

        <!-- Serial Interface -->
        <div v-if="hasSerialPorts"
          class="bg-white dark:bg-gray-800 rounded-xl p-3 sm:p-4 border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-all duration-300 transform hover:-translate-y-1">
          <div class="flex flex-wrap items-center justify-between mb-3 gap-2">
            <div class="flex items-center min-w-0">
              <div class="bg-indigo-50 dark:bg-indigo-900/20 p-1 rounded-md mr-2 flex-shrink-0">
                <span class="mdi mdi-serial-port text-indigo-600 dark:text-indigo-400 text-base sm:text-lg"></span>
              </div>
              <h3 class="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 truncate">
                Serial Interface
              </h3>
            </div>
            <span
              class="text-2xs sm:text-xs text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-700/80 px-2 py-0.5 rounded-full flex-shrink-0 border border-gray-100 dark:border-gray-600/50">
              {{ serialPorts.length }} Port{{ serialPorts.length !== 1 ? 's' : '' }} Available
            </span>
          </div>
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3 text-2xs sm:text-xs">
            <div v-for="(port, index) in serialPorts" :key="index"
              class="bg-gray-50 dark:bg-gray-700/50 p-2 rounded-lg border border-gray-200 dark:border-gray-600/30">
              <div class="flex items-center justify-between mb-1">
                <span class="font-medium text-gray-700 dark:text-gray-300">{{ port.name }}</span>
                <span class="text-gray-500 dark:text-gray-400">{{ port.baud_rate }} bps</span>
              </div>
              <div class="flex items-center text-gray-600 dark:text-gray-400">
                <span class="mdi mdi-arrow-down-bold-box-outline mr-1"></span>Rx: {{ port.rx_pin }}
                <span class="mdi mdi-arrow-up-bold-box-outline mr-1 ml-2"></span>Tx: {{ port.tx_pin }}
              </div>
            </div>
          </div>
        </div>

      </div> <!-- End of main grid -->
    </div> <!-- End of main container -->
  </div> <!-- End of SystemMetrics component -->
</template>

<style scoped>
/* Ensure consistent card height and prevent content overflow issues */
.grid>div {
  display: flex;
  flex-direction: column;
}

/* Custom scrollbar for WebKit browsers */
.overflow-y-auto::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}

.overflow-y-auto::-webkit-scrollbar-track {
  background: transparent;
}

.overflow-y-auto::-webkit-scrollbar-thumb {
  background-color: rgba(156, 163, 175, 0.5); /* gray-400 with 50% opacity */
  border-radius: 3px;
}

.overflow-y-auto::-webkit-scrollbar-thumb:hover {
  background-color: rgba(107, 114, 128, 0.7); /* gray-500 with 70% opacity */
}

/* For Firefox */
.overflow-y-auto {
  scrollbar-width: thin;
  scrollbar-color: rgba(156, 163, 175, 0.5) transparent;
}
</style>"text-gray-600 dark:text-gray-400 flex items-center">
              <span class=
              <span class="mdi mdi-clock-time-five-outline mr-1"></span>Minutes:
          </div>
        </div>

        <!-- Serial Interface -->
        <div v-if="hasSerialPorts"
          class="bg-white dark:bg-gray-800 rounded-xl p-3 sm:p-4 border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-all duration-300 transform hover:-translate-y-1">
          <div class="flex flex-wrap items-center justify-between mb-3 gap-2">
            <div class="flex items-center min-w-0">
              <div class="bg-indigo-50 dark:bg-indigo-900/20 p-1 rounded-md mr-2 flex-shrink-0">
                <span class="mdi mdi-serial-port text-indigo-600 dark:text-indigo-400 text-base sm:text-lg"></span>
              </div>
              <h3 class="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 truncate">
                Serial Interface
              </h3>
            </div>
            <span
              class="text-2xs sm:text-xs text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-700/80 px-2 py-0.5 rounded-full flex-shrink-0 border border-gray-100 dark:border-gray-600/50">
              {{ serialPorts.length }} Port{{ serialPorts.length !== 1 ? 's' : '' }} Available
            </span>
          </div>
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3 text-2xs sm:text-xs">
            <div v-for="(port, index) in serialPorts" :key="index"
              class="bg-gray-50 dark:bg-gray-700/50 p-2 rounded-lg border border-gray-200 dark:border-gray-600/30">
              <div class="flex items-center justify-between mb-1">
                <span class="font-medium text-gray-700 dark:text-gray-300">{{ port.name }}</span>
                <span class="text-gray-500 dark:text-gray-400">{{ port.baud_rate }} bps</span>
              </div>
              <div class="flex items-center text-gray-600 dark:text-gray-400">
                <span class="mdi mdi-arrow-down-bold-box-outline mr-1"></span>Rx: {{ port.rx_pin }}
                <span class="mdi mdi-arrow-up-bold-box-outline mr-1 ml-2"></span>Tx: {{ port.tx_pin }}
              </div>
            </div>
          </div>
        </div>

      </div> <!-- End of main grid -->
    </div> <!-- End of main container -->
  </div> <!-- End of SystemMetrics component -->
</template>

<style scoped>
/* Ensure consistent card height and prevent content overflow issues */
.grid>div {
  display: flex;
  flex-direction: column;
}

/* Custom scrollbar for WebKit browsers */
.overflow-y-auto::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}

.overflow-y-auto::-webkit-scrollbar-track {
  background: transparent;
}

.overflow-y-auto::-webkit-scrollbar-thumb {
  background-color: rgba(156, 163, 175, 0.5); /* gray-400 with 50% opacity */
  border-radius: 3px;
}

.overflow-y-auto::-webkit-scrollbar-thumb:hover {
  background-color: rgba(107, 114, 128, 0.7); /* gray-500 with 70% opacity */
}

/* For Firefox */
.overflow-y-auto {
  scrollbar-width: thin;
  scrollbar-color: rgba(156, 163, 175, 0.5) transparent;
}
</style>"text-gray-600 dark:text-gray-400 flex items-center">
              <span class=
              <span class="mdi mdi-clock-time-five-outline mr-1"></span>Minutes:
          </div>
        </div>

        <!-- Serial Interface -->
        <div v-if="hasSerialPorts"
          class="bg-white dark:bg-gray-800 rounded-xl p-3 sm:p-4 border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-all duration-300 transform hover:-translate-y-1">
          <div class="flex flex-wrap items-center justify-between mb-3 gap-2">
            <div class="flex items-center min-w-0">
              <div class="bg-indigo-50 dark:bg-indigo-900/20 p-1 rounded-md mr-2 flex-shrink-0">
                <span class="mdi mdi-serial-port text-indigo-600 dark:text-indigo-400 text-base sm:text-lg"></span>
              </div>
              <h3 class="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 truncate">
                Serial Interface
              </h3>
            </div>
            <span
              class="text-2xs sm:text-xs text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-700/80 px-2 py-0.5 rounded-full flex-shrink-0 border border-gray-100 dark:border-gray-600/50">
              {{ serialPorts.length }} Port{{ serialPorts.length !== 1 ? 's' : '' }} Available
            </span>
          </div>
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3 text-2xs sm:text-xs">
            <div v-for="(port, index) in serialPorts" :key="index"
              class="bg-gray-50 dark:bg-gray-700/50 p-2 rounded-lg border border-gray-200 dark:border-gray-600/30">
              <div class="flex items-center justify-between mb-1">
                <span class="font-medium text-gray-700 dark:text-gray-300">{{ port.name }}</span>
                <span class="text-gray-500 dark:text-gray-400">{{ port.baud_rate }} bps</span>
              </div>
              <div class="flex items-center text-gray-600 dark:text-gray-400">
                <span class="mdi mdi-arrow-down-bold-box-outline mr-1"></span>Rx: {{ port.rx_pin }}
                <span class="mdi mdi-arrow-up-bold-box-outline mr-1 ml-2"></span>Tx: {{ port.tx_pin }}
              </div>
            </div>
          </div>
        </div>

      </div> <!-- End of main grid -->
    </div> <!-- End of main container -->
  </div> <!-- End of SystemMetrics component -->
</template>

<style scoped>
/* Ensure consistent card height and prevent content overflow issues */
.grid>div {
  display: flex;
  flex-direction: column;
}

/* Custom scrollbar for WebKit browsers */
.overflow-y-auto::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}

.overflow-y-auto::-webkit-scrollbar-track {
  background: transparent;
}

.overflow-y-auto::-webkit-scrollbar-thumb {
  background-color: rgba(156, 163, 175, 0.5); /* gray-400 with 50% opacity */
  border-radius: 3px;
}

.overflow-y-auto::-webkit-scrollbar-thumb:hover {
  background-color: rgba(107, 114, 128, 0.7); /* gray-500 with 70% opacity */
}

/* For Firefox */
.overflow-y-auto {
  scrollbar-width: thin;
  scrollbar-color: rgba(156, 163, 175, 0.5) transparent;
}
</style>"text-gray-600 dark:text-gray-400 flex items-center">
              <span class=
              <span class="mdi mdi-clock-time-five-outline mr-1"></span>Minutes:
          </div>
        </div>

        <!-- Serial Interface -->
        <div v-if="hasSerialPorts"
          class="bg-white dark:bg-gray-800 rounded-xl p-3 sm:p-4 border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-all duration-300 transform hover:-translate-y-1">
          <div class="flex flex-wrap items-center justify-between mb-3 gap-2">
            <div class="flex items-center min-w-0">
              <div class="bg-indigo-50 dark:bg-indigo-900/20 p-1 rounded-md mr-2 flex-shrink-0">
                <span class="mdi mdi-serial-port text-indigo-600 dark:text-indigo-400 text-base sm:text-lg"></span>
              </div>
              <h3 class="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 truncate">
                Serial Interface
              </h3>
            </div>
            <span
              class="text-2xs sm:text-xs text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-700/80 px-2 py-0.5 rounded-full flex-shrink-0 border border-gray-100 dark:border-gray-600/50">
              {{ serialPorts.length }} Port{{ serialPorts.length !== 1 ? 's' : '' }} Available
            </span>
          </div>
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3 text-2xs sm:text-xs">
            <div v-for="(port, index) in serialPorts" :key="index"
              class="bg-gray-50 dark:bg-gray-700/50 p-2 rounded-lg border border-gray-200 dark:border-gray-600/30">
              <div class="flex items-center justify-between mb-1">
                <span class="font-medium text-gray-700 dark:text-gray-300">{{ port.name }}</span>
                <span class="text-gray-500 dark:text-gray-400">{{ port.baud_rate }} bps</span>
              </div>
              <div class="flex items-center text-gray-600 dark:text-gray-400">
                <span class="mdi mdi-arrow-down-bold-box-outline mr-1"></span>Rx: {{ port.rx_pin }}
                <span class="mdi mdi-arrow-up-bold-box-outline mr-1 ml-2"></span>Tx: {{ port.tx_pin }}
              </div>
            </div>
          </div>
        </div>

      </div> <!-- End of main grid -->
    </div> <!-- End of main container -->
  </div> <!-- End of SystemMetrics component -->
</template>

<style scoped>
/* Ensure consistent card height and prevent content overflow issues */
.grid>div {
  display: flex;
  flex-direction: column;
}

/* Custom scrollbar for WebKit browsers */
.overflow-y-auto::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}

.overflow-y-auto::-webkit-scrollbar-track {
  background: transparent;
}

.overflow-y-auto::-webkit-scrollbar-thumb {
  background-color: rgba(156, 163, 175, 0.5); /* gray-400 with 50% opacity */
  border-radius: 3px;
}

.overflow-y-auto::-webkit-scrollbar-thumb:hover {
  background-color: rgba(107, 114, 128, 0.7); /* gray-500 with 70% opacity */
}

/* For Firefox */
.overflow-y-auto {
  scrollbar-width: thin;
  scrollbar-color: rgba(156, 163, 175, 0.5) transparent;
}
</style>"text-gray-600 dark:text-gray-400 flex items-center">
              <span class=
              <span class="mdi mdi-clock-time-five-outline mr-1"></span>Minutes:
          </div>
        </div>

        <!-- Serial Interface -->
        <div v-if="hasSerialPorts"
          class="bg-white dark:bg-gray-800 rounded-xl p-3 sm:p-4 border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-all duration-300 transform hover:-translate-y-1">
          <div class="flex flex-wrap items-center justify-between mb-3 gap-2">
            <div class="flex items-center min-w-0">
              <div class="bg-indigo-50 dark:bg-indigo-900/20 p-1 rounded-md mr-2 flex-shrink-0">
                <span class="mdi mdi-serial-port text-indigo-600 dark:text-indigo-400 text-base sm:text-lg"></span>
              </div>
              <h3 class="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 truncate">
                Serial Interface
              </h3>
            </div>
            <span
              class="text-2xs sm:text-xs text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-700/80 px-2 py-0.5 rounded-full flex-shrink-0 border border-gray-100 dark:border-gray-600/50">
              {{ serialPorts.length }} Port{{ serialPorts.length !== 1 ? 's' : '' }} Available
            </span>
          </div>
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3 text-2xs sm:text-xs">
            <div v-for="(port, index) in serialPorts" :key="index"
              class="bg-gray-50 dark:bg-gray-700/50 p-2 rounded-lg border border-gray-200 dark:border-gray-600/30">
              <div class="flex items-center justify-between mb-1">
                <span class="font-medium text-gray-700 dark:text-gray-300">{{ port.name }}</span>
                <span class="text-gray-500 dark:text-gray-400">{{ port.baud_rate }} bps</span>
              </div>
              <div class="flex items-center text-gray-600 dark:text-gray-400">
                <span class="mdi mdi-arrow-down-bold-box-outline mr-1"></span>Rx: {{ port.rx_pin }}
                <span class="mdi mdi-arrow-up-bold-box-outline mr-1 ml-2"></span>Tx: {{ port.tx_pin }}
              </div>
            </div>
          </div>
        </div>

      </div> <!-- End of main grid -->
    </div> <!-- End of main container -->
  </div> <!-- End of SystemMetrics component -->
</template>

<style scoped>
/* Ensure consistent card height and prevent content overflow issues */
.grid>div {
  display: flex;
  flex-direction: column;
}

/* Custom scrollbar for WebKit browsers */
.overflow-y-auto::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}

.overflow-y-auto::-webkit-scrollbar-track {
  background: transparent;
}

.overflow-y-auto::-webkit-scrollbar-thumb {
  background-color: rgba(156, 163, 175, 0.5); /* gray-400 with 50% opacity */
  border-radius: 3px;
}

.overflow-y-auto::-webkit-scrollbar-thumb:hover {
  background-color: rgba(107, 114, 128, 0.7); /* gray-500 with 70% opacity */
}

/* For Firefox */
.overflow-y-auto {
  scrollbar-width: thin;
  scrollbar-color: rgba(156, 163, 175, 0.5) transparent;
}
</style>"text-gray-600 dark:text-gray-400 flex items-center">
              <span class=
              <span class="mdi mdi-clock-time-five-outline mr-1"></span>Minutes:
              <span class="font-medium text-gray-800 dark:text-gray-200 ml-1">{{ uptime.minutes }}</span>
            </div>
            <div class="text-gray-600 dark:text-gray-400 flex items-center">
              <span class=
              <span class="mdi mdi-clock-time-five-outline mr-1"></span>Minutes:
              <span class="font-medium text-gray-800 dark:text-gray-200 ml-1">{{ uptime.minutes }}</span>
            </div>
            <div class="text-gray-600 dark:text-gray-400 flex items-center">
              <span class=
              <span class="mdi mdi-clock-time-five-outline mr-1"></span>Minutes:
              <span class="font-medium text-gray-800 dark:text-gray-200 ml-1">{{ uptime.minutes }}</span>
            </div>
            <div class="text-gray-600 dark:text-gray-400 flex items-center">
              <span class=
              <span class="mdi mdi-clock-time-five-outline mr-1"></span>Minutes:
              <span class="font-medium text-gray-800 dark:text-gray-200 ml-1">{{ uptime.minutes }}</span>
            </div>
            <div class="text-gray-600 dark:text-gray-400 flex items-center">
              <span class=
              <span class="mdi mdi-clock-time-five-outline mr-1"></span>Minutes:
              <span class="font-medium text-gray-800 dark:text-gray-200 ml-1">{{ uptime.minutes }}</span>
            </div>
            <div class="text-gray-600 dark:text-gray-400 flex items-center">
              <span class=
              <span class="mdi mdi-clock-time-five-outline mr-1"></span>Minutes:
              <span class="font-medium text-gray-800 dark:text-gray-200 ml-1">{{ uptime.minutes }}</span>
            </div>
            <div class="text-gray-600 dark:text-gray-400 flex items-center">
              <span class=
              <span class="mdi mdi-clock-time-five-outline mr-1"></span>Minutes:
              <span class="font-medium text-gray-800 dark:text-gray-200 ml-1">{{ uptime.minutes }}</span>
            </div>
            <div class="text-gray-600 dark:text-gray-400 flex items-center">
              <span class=
              <span class="mdi mdi-clock-time-five-outline mr-1"></span>Minutes:
              <span class="font-medium text-gray-800 dark:text-gray-200 ml-1">{{ uptime.minutes }}</span>
            </div>
            <div class="text-gray-600 dark:text-gray-400 flex items-center">
              <span class=
              <span class="mdi mdi-clock-time-five-outline mr-1"></span>Minutes:
              <span class="font-medium text-gray-800 dark:text-gray-200 ml-1">{{ uptime.minutes }}</span>
            </div>
            <div class="text-gray-600 dark:text-gray-400 flex items-center">
              <span class=
              <span class="mdi mdi-clock-time-five-outline mr-1"></span>Minutes:
              <span class="font-medium text-gray-800 dark:text-gray-200 ml-1">{{ uptime.minutes }}</span>
            </div>
            <div class="text-gray-600 dark:text-gray-400 flex items-center">
              <span class=
              <span class="mdi mdi-clock-time-five-outline mr-1"></span>Minutes:
              <span class="font-medium text-gray-800 dark:text-gray-200 ml-1">{{ uptime.minutes }}</span>
            </div>
            <div class="text-gray-600 dark:text-gray-400 flex items-center">
              <span class=
              <span class="mdi mdi-clock-time-five-outline mr-1"></span>Minutes:
              <span class="font-medium text-gray-800 dark:text-gray-200 ml-1">{{ uptime.minutes }}</span>
            </div>
            <div class="text-gray-600 dark:text-gray-400 flex items-center">
              <span class=
              <span class="mdi mdi-clock-time-five-outline mr-1"></span>Minutes:
              <span class="font-medium text-gray-800 dark:text-gray-200 ml-1"