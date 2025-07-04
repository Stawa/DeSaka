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
    iconColor: 'text-orange-500',
    bgColor: 'bg-orange-50 dark:bg-orange-900/20',
  },
  {
    key: 'freeHeap',
    label: 'Memory',
    subtitle: 'Free Heap',
    icon: 'M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
    iconColor: 'text-blue-500',
    bgColor: 'bg-blue-50 dark:bg-blue-900/20',
  },
  {
    key: 'chipModel',
    label: 'Chip Model',
    subtitle: 'WROOM-32',
    icon: 'M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z',
    iconColor: 'text-purple-500',
    bgColor: 'bg-purple-50 dark:bg-purple-900/20',
  },
  {
    key: 'wifiSignal',
    label: 'WiFi Signal',
    subtitle: '',
    type: 'wifi',
    iconColor: 'text-emerald-500',
    bgColor: 'bg-emerald-50 dark:bg-emerald-900/20',
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

const currentTime = new Date().toLocaleString('en-US', {
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
  hour12: true,
})
</script>

<template>
  <div
    class="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-2xl border border-gray-200/60 dark:border-gray-800/60 shadow-sm overflow-hidden"
  >
    <!-- Subtle accent bar -->
    <div class="h-1 bg-gradient-to-r from-blue-500 to-indigo-600"></div>

    <!-- Header -->
    <div class="px-6 py-5 border-b border-gray-100 dark:border-gray-800">
      <div class="flex items-center gap-4">
        <div
          class="w-12 h-12 bg-gradient-to-br from-blue-100 to-blue-50 dark:from-blue-900/30 dark:to-blue-800/20 rounded-xl flex items-center justify-center ring-1 ring-blue-200/50 dark:ring-blue-700/30"
        >
          <svg
            class="w-6 h-6 text-blue-600 dark:text-blue-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            stroke-width="2"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z"
            />
          </svg>
        </div>
        <div>
          <h1 class="text-xl font-semibold text-gray-900 dark:text-gray-100">
            ESP32 System Monitor
          </h1>
          <p class="text-sm text-gray-600 dark:text-gray-400">
            Hardware status • Updated {{ currentTime }}
          </p>
        </div>
      </div>
    </div>

    <!-- Main Content -->
    <div class="p-6 space-y-8">
      <!-- System Info -->
      <div>
        <div class="flex items-center gap-3 mb-6">
          <div
            class="w-10 h-10 bg-gradient-to-br from-blue-100 to-blue-50 dark:from-blue-900/30 dark:to-blue-800/20 rounded-xl flex items-center justify-center ring-1 ring-blue-200/50 dark:ring-blue-700/30"
          >
            <svg
              class="w-5 h-5 text-blue-600 dark:text-blue-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h2 class="text-lg font-semibold text-gray-900 dark:text-white">System Information</h2>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div
            v-for="card in infoCards"
            :key="card.key"
            class="p-5 bg-gray-50/50 dark:bg-gray-800/50 rounded-xl border border-gray-200/50 dark:border-gray-700/50 hover:bg-gray-100/50 dark:hover:bg-gray-700/50 transition-all duration-200"
          >
            <div class="flex items-center gap-3 mb-4">
              <div
                :class="[
                  card.bgColor,
                  'w-10 h-10 rounded-xl flex items-center justify-center ring-1 ring-gray-200/50 dark:ring-gray-700/30',
                ]"
              >
                <svg
                  v-if="card.type !== 'wifi'"
                  class="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  :class="card.iconColor"
                  stroke-width="2"
                >
                  <path stroke-linecap="round" stroke-linejoin="round" :d="card.icon" />
                </svg>
                <i
                  v-if="card.type === 'wifi'"
                  class="mdi text-lg"
                  :class="[wifiStrength.icon, card.iconColor]"
                ></i>
              </div>
              <div>
                <div
                  class="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide"
                >
                  {{ card.label }}
                </div>
                <div class="text-xs text-gray-500 dark:text-gray-400">
                  {{ card.type === 'wifi' ? wifiStrength.label : card.subtitle }}
                </div>
              </div>
            </div>
            <div class="text-xl font-bold text-gray-900 dark:text-gray-100">
              {{ card.type === 'wifi' ? esp32Info.wifiSignal + ' dBm' : esp32Info[card.key] }}
            </div>
          </div>
        </div>
      </div>

      <!-- Sensor Info -->
      <div>
        <div class="flex items-center gap-3 mb-6">
          <div
            class="w-10 h-10 bg-gradient-to-br from-emerald-100 to-emerald-50 dark:from-emerald-900/30 dark:to-emerald-800/20 rounded-xl flex items-center justify-center ring-1 ring-emerald-200/50 dark:ring-emerald-700/30"
          >
            <svg
              class="w-5 h-5 text-emerald-600 dark:text-emerald-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
              />
            </svg>
          </div>
          <h2 class="text-lg font-semibold text-gray-900 dark:text-white">Connected Sensors</h2>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
          <div
            v-for="sensor in esp32Sensors"
            :key="sensor.id"
            class="p-5 bg-gray-50/50 dark:bg-gray-800/50 rounded-xl border border-gray-200/50 dark:border-gray-700/50 hover:bg-gray-100/50 dark:hover:bg-gray-700/50 transition-all duration-200"
          >
            <div class="flex items-center justify-between mb-4">
              <div>
                <h5 class="font-medium text-gray-900 dark:text-gray-100">{{ sensor.name }}</h5>
                <p class="text-sm text-gray-600 dark:text-gray-400">
                  {{ sensor.type }} • {{ sensor.pin }}
                </p>
              </div>
              <div
                :class="[
                  'px-2.5 py-1 rounded-full text-xs font-medium',
                  sensor.status === 'online'
                    ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300'
                    : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
                ]"
              >
                {{ sensor.status.toUpperCase() }}
              </div>
            </div>

            <div class="space-y-4">
              <div>
                <div class="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-1">
                  {{ sensor.value }}
                </div>
                <div
                  class="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide"
                >
                  Current Value
                </div>
              </div>

              <div
                class="flex items-center justify-between pt-3 border-t border-gray-200/50 dark:border-gray-700/50"
              >
                <span class="text-xs text-gray-500 dark:text-gray-400">Last Update</span>
                <span class="text-xs font-medium text-gray-700 dark:text-gray-300">{{
                  sensor.lastUpdate
                }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Smooth animations for better UX */
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.space-y-8 > * {
  animation: fadeInUp 0.6s ease-out;
  animation-fill-mode: both;
}

.space-y-8 > *:nth-child(1) {
  animation-delay: 0.1s;
}
.space-y-8 > *:nth-child(2) {
  animation-delay: 0.2s;
}

/* Hover effects for cards */
.grid > div {
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.grid > div:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px -8px rgba(0, 0, 0, 0.1);
}
</style>
