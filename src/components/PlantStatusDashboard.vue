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
    bgColor: 'bg-orange-100 dark:bg-orange-900/30',
  },
  {
    key: 'freeHeap',
    label: 'Memory',
    subtitle: 'Free Heap',
    icon: 'M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
    iconColor: 'text-blue-500',
    bgColor: 'bg-blue-100 dark:bg-blue-900/30',
  },
  {
    key: 'chipModel',
    label: 'Chip Model',
    subtitle: 'WROOM-32',
    icon: 'M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z',
    iconColor: 'text-purple-500',
    bgColor: 'bg-purple-100 dark:bg-purple-900/30',
  },
  {
    key: 'wifiSignal',
    label: 'WiFi Signal',
    subtitle: '',
    type: 'wifi',
    iconColor: 'text-emerald-500',
    bgColor: 'bg-emerald-100 dark:bg-emerald-900/30',
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
  <div class="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden relative">
    <!-- Animated gradient accent bar -->
    <div class="h-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-blue-600 animate-gradient-x"></div>

    <!-- Enhanced header -->
    <div class="border-b border-gray-200 dark:border-gray-700 px-6 py-5 lg:px-8 lg:py-6">
      <div class="flex items-center gap-4">
        <div class="relative group">
          <div class="w-12 h-12 bg-gradient-to-br from-blue-100 via-blue-50 to-indigo-50 dark:from-blue-900/40 dark:via-blue-800/30 dark:to-indigo-800/20 rounded-2xl flex items-center justify-center ring-1 ring-blue-200/50 dark:ring-blue-700/30 backdrop-blur-sm transition-all duration-300 group-hover:scale-105 group-hover:shadow-lg group-hover:shadow-blue-500/20">
            <svg class="w-6 h-6 text-blue-600 dark:text-blue-400 transition-transform duration-300 group-hover:rotate-12" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
            </svg>
          </div>
          <div class="absolute inset-0 bg-blue-500/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10"></div>
        </div>
        <div>
          <h1 class="text-xl font-bold text-gray-900 dark:text-white bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 dark:from-white dark:via-gray-100 dark:to-white bg-clip-text">ESP32 System Monitor</h1>
          <p class="text-sm text-gray-600 dark:text-gray-400 font-medium">Hardware status • Updated {{ currentTime }}</p>
        </div>
      </div>
    </div>

    <!-- Enhanced main content -->
    <div class="px-6 py-6 lg:px-8 lg:py-8 space-y-8">
      <!-- Enhanced system info -->
      <div>
        <div class="flex items-center gap-3 mb-6">
          <div class="w-10 h-10 bg-gradient-to-br from-blue-100 to-blue-50 dark:from-blue-900/40 dark:to-blue-800/30 rounded-xl flex items-center justify-center ring-1 ring-blue-200/50 dark:ring-blue-700/30">
            <svg class="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 class="font-bold text-gray-900 dark:text-white text-lg">
            System Information
          </h2>
        </div>
        
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div
            v-for="card in infoCards"
            :key="card.key"
            class="group p-5 bg-gradient-to-br from-gray-50 via-gray-25 to-slate-50 dark:from-gray-800/50 dark:via-gray-700/40 dark:to-slate-700/30 rounded-2xl border border-gray-200/50 dark:border-gray-700/30 hover:border-gray-300 dark:hover:border-gray-600 transition-all duration-300 hover:shadow-lg hover:shadow-gray-500/10 hover:scale-[1.02]"
          >
            <div class="flex items-center gap-4 mb-4">
              <div :class="[card.bgColor, 'w-12 h-12 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300']">
                <svg
                  v-if="card.type !== 'wifi'"
                  class="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  :class="card.iconColor"
                  stroke-width="2"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    :d="card.icon"
                  />
                </svg>
                <i
                  v-if="card.type === 'wifi'"
                  class="mdi text-xl"
                  :class="[wifiStrength.icon, card.iconColor]"
                ></i>
              </div>
              <div>
                <div class="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{{ card.label }}</div>
                <div class="text-xs text-gray-500 dark:text-gray-400 font-medium">{{ card.type === 'wifi' ? wifiStrength.label : card.subtitle }}</div>
              </div>
            </div>
            <div class="text-2xl font-black text-gray-900 dark:text-white">
              {{ card.type === 'wifi' ? esp32Info.wifiSignal + ' dBm' : esp32Info[card.key] }}
            </div>
          </div>
        </div>
      </div>

      <!-- Enhanced sensor info -->
      <div>
        <div class="flex items-center gap-3 mb-6">
          <div class="w-10 h-10 bg-gradient-to-br from-emerald-100 to-emerald-50 dark:from-emerald-900/40 dark:to-emerald-800/30 rounded-xl flex items-center justify-center ring-1 ring-emerald-200/50 dark:ring-emerald-700/30">
            <svg class="w-5 h-5 text-emerald-600 dark:text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <h2 class="font-bold text-gray-900 dark:text-white text-lg">
            Connected Sensors
          </h2>
        </div>
        
        <div class="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
          <div
            v-for="sensor in esp32Sensors"
            :key="sensor.id"
            class="group p-5 bg-gradient-to-br from-gray-50 via-gray-25 to-slate-50 dark:from-gray-800/50 dark:via-gray-700/40 dark:to-slate-700/30 rounded-2xl border border-gray-200/50 dark:border-gray-700/30 hover:border-gray-300 dark:hover:border-gray-600 transition-all duration-300 hover:shadow-lg hover:shadow-gray-500/10 hover:scale-[1.02]"
          >
            <div class="flex items-center justify-between mb-4">
              <div>
                <h3 class="font-bold text-gray-900 dark:text-white text-base">{{ sensor.name }}</h3>
                <p class="text-sm text-gray-600 dark:text-gray-400 font-medium">{{ sensor.type }} • {{ sensor.pin }}</p>
              </div>
              <div
                :class="[
                  'px-3 py-1.5 rounded-xl text-xs font-bold',
                  sensor.status === 'online'
                    ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300'
                    : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'
                ]"
              >
                {{ sensor.status.toUpperCase() }}
              </div>
            </div>
            
            <div class="space-y-4">
              <div>
                <div class="text-3xl font-black text-gray-900 dark:text-white mb-2">
                  {{ sensor.value }}
                </div>
                <div class="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Current Value</div>
              </div>
              
              <div class="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
                <span class="text-xs text-gray-500 dark:text-gray-400 font-medium">Last Update</span>
                <span class="text-xs font-bold text-gray-700 dark:text-gray-300">{{ sensor.lastUpdate }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Subtle background pattern -->
    <div class="absolute inset-0 opacity-[0.02] dark:opacity-[0.05] pointer-events-none">
      <div class="absolute inset-0" style="background-image: radial-gradient(circle at 1px 1px, rgba(0,0,0,0.15) 1px, transparent 0); background-size: 20px 20px;"></div>
    </div>
  </div>
</template>

<style scoped>
@keyframes gradient-x {
  0%, 100% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
}

.animate-gradient-x {
  background-size: 200% 200%;
  animation: gradient-x 3s ease infinite;
}

/* Enhanced hover effects */
.group:hover .group-hover\:rotate-12 {
  transform: rotate(12deg);
}

.group:hover .group-hover\:scale-110 {
  transform: scale(1.1);
}

/* Smooth transitions for all elements */
* {
  transition-property: all;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 300ms;
}

/* Custom scrollbar for consistency */
::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}

::-webkit-scrollbar-track {
  background: transparent;
}

::-webkit-scrollbar-thumb {
  background: rgba(156, 163, 175, 0.5);
  border-radius: 3px;
}

::-webkit-scrollbar-thumb:hover {
  background: rgba(107, 114, 128, 0.7);
}

.dark ::-webkit-scrollbar-thumb {
  background: rgba(75, 85, 99, 0.5);
}

.dark ::-webkit-scrollbar-thumb:hover {
  background: rgba(107, 114, 128, 0.7);
}
</style>