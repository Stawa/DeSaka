<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'

defineProps({
  sensorData: { type: Object, required: true },
  plantHealthScore: { type: Number, required: true },
  growthPrediction: { type: String, default: 'Normal' },
  systemStatus: { type: String, default: 'normal' },
})

const esp32Info: Record<string, string | number> = {
  chipModel: 'ESP32-WROOM-32',
  flashSize: '4MB',
  freeHeap: '180KB',
  wifiSignal: -45,
  uptime: '2d 14h 32m',
  cpuFreq: '240MHz',
  temperature: '52°C',
}

interface WifiSignal {
  label: string
  bars: number
  color: string
  icon: string
}

const wifiStrength = computed<WifiSignal>(() => {
  const signal = Number(esp32Info.wifiSignal ?? -100)
  if (signal >= -50)
    return { label: 'Excellent', bars: 4, color: 'emerald', icon: 'mdi-wifi-strength-4' }
  if (signal >= -60) return { label: 'Good', bars: 3, color: 'green', icon: 'mdi-wifi-strength-3' }
  if (signal >= -70) return { label: 'Fair', bars: 2, color: 'yellow', icon: 'mdi-wifi-strength-2' }
  return { label: 'Poor', bars: 1, color: 'red', icon: 'mdi-wifi-strength-1-alert' }
})

const infoCards = [
  {
    key: 'temperature',
    label: 'Temperature',
    subtitle: 'Chip Temp',
    icon: 'M13 10V3L4 14h7v7l9-11h-7z',
    iconColor: 'text-orange-400',
    bgColor: 'bg-orange-500/20',
    valueClass: 'text-2xl',
  },
  {
    key: 'freeHeap',
    label: 'Memory',
    subtitle: 'Free Heap',
    icon: 'M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
    iconColor: 'text-blue-400',
    bgColor: 'bg-blue-500/20',
    valueClass: 'text-2xl',
  },
  {
    key: 'chipModel',
    label: 'Chip Model',
    subtitle: 'WROOM-32',
    icon: 'M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z',
    iconColor: 'text-purple-400',
    bgColor: 'bg-purple-500/20',
    valueClass: 'text-lg',
  },
  {
    key: 'wifiSignal',
    label: 'WiFi Signal',
    subtitle: '',
    type: 'wifi',
    iconColor: 'text-green-400',
    bgColor: 'bg-green-500/20',
    valueClass: 'text-2xl',
  },
]

const esp32Sensors = [
  {
    id: 1,
    name: 'Soil Moisture',
    type: 'Analog',
    pin: 'A0',
    status: 'online',
    value: '45%',
    lastUpdate: '2s ago',
  },
  {
    id: 2,
    name: 'Air Temperature',
    type: 'DHT22',
    pin: 'D4',
    status: 'online',
    value: '24.5°C',
    lastUpdate: '1s ago',
  },
  {
    id: 3,
    name: 'Air Humidity',
    type: 'DHT22',
    pin: 'D4',
    status: 'online',
    value: '62%',
    lastUpdate: '1s ago',
  },
  {
    id: 4,
    name: 'Light Intensity',
    type: 'LDR',
    pin: 'A1',
    status: 'online',
    value: '780 lux',
    lastUpdate: '3s ago',
  },
  {
    id: 5,
    name: 'Soil pH',
    type: 'Analog',
    pin: 'A2',
    status: 'offline',
    value: '--',
    lastUpdate: '5m ago',
  },
  {
    id: 6,
    name: 'Soil Temperature',
    type: 'DS18B20',
    pin: 'D5',
    status: 'online',
    value: '22.1°C',
    lastUpdate: '2s ago',
  },
]

const screenWidth = ref(window.innerWidth)

const updateWidth = () => (screenWidth.value = window.innerWidth)

onMounted(() => window.addEventListener('resize', updateWidth))
onBeforeUnmount(() => window.removeEventListener('resize', updateWidth))

const columnCount = computed(() => {
  if (screenWidth.value < 640) return 1
  if (screenWidth.value < 768) return 2
  if (screenWidth.value < 1280) return 3
  return 4
})

const fullRows = computed(() => {
  const cols = columnCount.value
  return esp32Sensors.slice(0, Math.floor(esp32Sensors.length / cols) * cols)
})

const lastRow = computed(() => {
  const cols = columnCount.value
  return esp32Sensors.slice(Math.floor(esp32Sensors.length / cols) * cols)
})

const lastRowClass = computed(() => {
  const remaining = lastRow.value.length
  const cols = columnCount.value
  const offset = Math.floor((cols - remaining) / 2) + 1
  return `col-start-${offset}`
})

const currentTime = new Date().toLocaleString('en-US', {
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
  hour12: true,
})
</script>

<template>
  <div
    class="bg-white dark:bg-gray-900 text-black dark:text-white rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 transition-all duration-300 hover:shadow-md w-full max-w-full overflow-hidden"
  >
    <!-- Header -->
    <div class="border-b border-gray-100 dark:border-gray-700 px-6 py-4">
      <div class="flex items-center gap-4">
        <div class="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
          <span class="text-3xl text-white mdi mdi-cpu-32-bit"></span>
        </div>
        <div>
          <h1 class="text-xl font-semibold">ESP32 Monitor</h1>
          <p class="text-sm text-slate-400">Last 24 Hours • Updated {{ currentTime }}</p>
        </div>
      </div>
    </div>

    <!-- Main Content -->
    <div class="px-6 py-6 space-y-8">
      <!-- System Info -->
      <div>
        <h2 class="text-lg font-semibold text-white mb-4 border-b border-slate-700 pb-2">
          System Info
        </h2>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div
            v-for="card in infoCards"
            :key="card.key"
            class="bg-gray-100 dark:bg-gray-900 rounded-lg border border-gray-800 p-4 hover:border-slate-700 transition-all duration-200"
          >
            <div class="flex items-center gap-3 mb-3">
              <div
                :class="card.bgColor"
                class="w-8 h-8 rounded-lg flex items-center justify-center"
              >
                <svg
                  v-if="card.type !== 'wifi'"
                  class="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  :class="card.iconColor"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    :d="card.icon"
                  />
                </svg>
                <i
                  v-if="card.type === 'wifi'"
                  class="mdi text-xl"
                  :class="[wifiStrength.icon, card.iconColor]"
                ></i>
              </div>
              <span class="text-xs text-slate-400 uppercase tracking-wide">{{ card.label }}</span>
            </div>
            <div :class="['font-bold text-white mb-1', card.valueClass]">
              {{ card.type === 'wifi' ? esp32Info.wifiSignal + ' dBm' : esp32Info[card.key] }}
            </div>
            <div class="text-xs text-slate-500">
              {{ card.type === 'wifi' ? wifiStrength.label : card.subtitle }}
            </div>
          </div>
        </div>
      </div>

      <!-- Sensor Info -->
      <div>
        <h2 class="text-lg font-semibold text-white mb-4 border-b border-slate-700 pb-2">
          Sensor Info
        </h2>
        <div class="grid grid-cols-1 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          <!-- Full Rows -->
          <div
            v-for="sensor in fullRows"
            :key="sensor.id"
            class="bg-gray-100 dark:bg-gray-900 rounded-lg border border-gray-800 p-4 hover:border-slate-700 transition-all duration-200"
          >
            <div class="flex items-center justify-between mb-4">
              <div>
                <h3 class="font-medium text-white text-sm">{{ sensor.name }}</h3>
                <p class="text-xs text-slate-500">{{ sensor.type }} • {{ sensor.pin }}</p>
              </div>
              <span
                :class="
                  sensor.status === 'online'
                    ? 'text-green-400 bg-green-400/10'
                    : 'text-red-400 bg-red-400/10'
                "
                class="text-xs font-medium px-2 py-1 rounded-md"
              >
                {{ sensor.status.toUpperCase() }}
              </span>
            </div>
            <div class="space-y-3">
              <div>
                <div class="text-2xl font-bold text-white mb-1">{{ sensor.value }}</div>
                <div class="text-xs text-slate-500">Current Value</div>
              </div>
              <div class="flex items-center justify-between pt-2 border-t border-slate-800">
                <span class="text-xs text-slate-500">Last Update</span>
                <span class="text-xs text-slate-400">{{ sensor.lastUpdate }}</span>
              </div>
            </div>
          </div>

          <!-- Centered Last Row -->
          <div
            v-if="lastRow.length"
            class="col-span-full grid grid-cols-subgrid gap-4"
            :class="lastRowClass"
          >
            <div
              v-for="sensor in lastRow"
              :key="sensor.id"
              class="bg-gray-100 dark:bg-gray-900 rounded-lg border border-gray-800 p-4 hover:border-slate-700 transition-all duration-200"
            >
              <div class="flex items-center justify-between mb-4">
                <div>
                  <h3 class="font-medium text-white text-sm">{{ sensor.name }}</h3>
                  <p class="text-xs text-slate-500">{{ sensor.type }} • {{ sensor.pin }}</p>
                </div>
                <span
                  :class="
                    sensor.status === 'online'
                      ? 'text-green-400 bg-green-400/10'
                      : 'text-red-400 bg-red-400/10'
                  "
                  class="text-xs font-medium px-2 py-1 rounded-md"
                >
                  {{ sensor.status.toUpperCase() }}
                </span>
              </div>
              <div class="space-y-3">
                <div>
                  <div class="text-2xl font-bold text-white mb-1">{{ sensor.value }}</div>
                  <div class="text-xs text-slate-500">Current Value</div>
                </div>
                <div class="flex items-center justify-between pt-2 border-t border-slate-800">
                  <span class="text-xs text-slate-500">Last Update</span>
                  <span class="text-xs text-slate-400">{{ sensor.lastUpdate }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Basic transition */
* {
  transition-property: color, background-color, border-color, transform, opacity;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 200ms;
}
</style>
