<script setup lang="ts">
import { computed } from 'vue'
import { getSensorIcon, getSensorLabel, getSensorDescription, getSensorColor } from '@/scripts'

const props = defineProps({
  sensorData: {
    type: Object,
    required: true,
  },
  onSensorClick: {
    type: Function,
    default: () => {},
  },
})

defineEmits(['refresh', 'download'])

const sensorCount = computed(() => Object.keys(props.sensorData).length)

const getStatusInfo = (status: string | number) => {
  const statusMap = {
    optimal: {
      color: 'text-emerald-700 dark:text-emerald-300',
      bg: 'bg-emerald-50 dark:bg-emerald-900/20',
      icon: 'mdi mdi-check-circle',
      dot: 'bg-emerald-500',
      border: 'border-emerald-200 dark:border-emerald-800',
      glow: 'shadow-emerald-500/10',
    },
    normal: {
      color: 'text-emerald-600 dark:text-emerald-400',
      bg: 'bg-emerald-50 dark:bg-emerald-900/20',
      icon: 'mdi mdi-check-circle',
      dot: 'bg-emerald-500',
      border: 'border-emerald-200 dark:border-emerald-800',
      glow: 'shadow-emerald-500/10',
    },
    warning: {
      color: 'text-amber-700 dark:text-amber-300',
      bg: 'bg-amber-50 dark:bg-amber-900/20',
      icon: 'mdi mdi-alert',
      dot: 'bg-amber-500',
      border: 'border-amber-200 dark:border-amber-800',
      glow: 'shadow-amber-500/10',
    },
    critical: {
      color: 'text-red-700 dark:text-red-300',
      bg: 'bg-red-50 dark:bg-red-900/20',
      icon: 'mdi mdi-alert-circle',
      dot: 'bg-red-500',
      border: 'border-red-200 dark:border-red-800',
      glow: 'shadow-red-500/10',
    },
  }

  return (status as keyof typeof statusMap) in statusMap
    ? statusMap[status as keyof typeof statusMap]
    : statusMap.normal
}
</script>

<template>
  <div class="card card-hover overflow-hidden">
    <!-- Header -->
    <div class="px-6 py-5 border-b border-gray-100 dark:border-gray-800 bg-gradient-to-r from-gray-50/50 to-white dark:from-gray-800/50 dark:to-gray-900">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-4">
          <div class="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/25">
            <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <div>
            <h2 class="text-xl font-bold text-gray-900 dark:text-gray-100">Sensor Readings</h2>
            <p class="text-sm text-gray-600 dark:text-gray-400">
              {{ sensorCount }} {{ sensorCount === 1 ? 'sensor' : 'sensors' }} monitored
            </p>
          </div>
        </div>
        
        <div class="flex items-center gap-2">
          <div class="status-dot status-online"></div>
          <span class="text-sm font-medium text-emerald-600 dark:text-emerald-400">Live</span>
        </div>
      </div>
    </div>

    <!-- Content -->
    <div class="p-6">
      <!-- Sensor Cards Grid -->
      <div v-if="sensorCount > 0" class="grid-cards">
        <div
          v-for="(sensor, sensorId) in sensorData"
          :key="sensorId"
          class="group relative card-interactive border-0 bg-gradient-to-br from-white to-gray-50/50 dark:from-gray-800 dark:to-gray-900/50 hover:shadow-xl transition-all duration-300"
          :class="[getStatusInfo(sensor.status).glow, getStatusInfo(sensor.status).border]"
          @click="onSensorClick(sensorId)"
        >
          <!-- Status accent -->
          <div class="absolute top-0 left-0 right-0 h-1 rounded-t-2xl" :class="getStatusInfo(sensor.status).dot"></div>
          
          <!-- Status indicator dot -->
          <div class="absolute top-4 right-4">
            <div :class="[getStatusInfo(sensor.status).dot, 'w-3 h-3 rounded-full shadow-sm']"></div>
          </div>

          <div class="p-6">
            <!-- Sensor icon and info -->
            <div class="flex items-start gap-4 mb-6">
              <div
                :class="`w-14 h-14 bg-${getSensorColor(sensorId)}-100 dark:bg-${getSensorColor(sensorId)}-900/30 rounded-xl flex items-center justify-center flex-shrink-0 transition-transform duration-300 group-hover:scale-110`"
              >
                <span
                  :class="`mdi ${getSensorIcon(sensorId)} text-${getSensorColor(sensorId)}-600 dark:text-${getSensorColor(sensorId)}-400 text-2xl`"
                ></span>
              </div>
              <div class="min-w-0 flex-1">
                <h3 class="font-bold text-gray-900 dark:text-gray-100 text-lg mb-1">
                  {{ getSensorLabel(sensorId) }}
                </h3>
                <p class="text-sm text-gray-600 dark:text-gray-400">
                  {{ getSensorDescription(sensorId) }}
                </p>
              </div>
            </div>

            <!-- Reading value -->
            <div class="mb-4">
              <div class="flex items-baseline gap-2">
                <span class="text-3xl font-black text-gray-900 dark:text-gray-100 tracking-tight">
                  {{ sensor.value }}
                </span>
                <span class="text-lg font-semibold text-gray-500 dark:text-gray-400">
                  {{ sensor.unit }}
                </span>
              </div>
            </div>

            <!-- Status and action -->
            <div class="flex items-center justify-between">
              <div
                :class="[
                  getStatusInfo(sensor.status).bg,
                  getStatusInfo(sensor.status).color,
                  'inline-flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-semibold border',
                  getStatusInfo(sensor.status).border
                ]"
              >
                <span :class="`mdi ${getStatusInfo(sensor.status).icon} text-sm`"></span>
                {{ sensor.status.charAt(0).toUpperCase() + sensor.status.slice(1) }}
              </div>

              <!-- Action arrow -->
              <div class="w-8 h-8 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center group-hover:bg-primary-100 dark:group-hover:bg-primary-900/30 transition-colors duration-300">
                <svg class="w-4 h-4 text-gray-400 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          </div>

          <!-- Hover overlay -->
          <div class="absolute inset-0 bg-gradient-to-br from-primary-500/5 to-secondary-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl pointer-events-none"></div>
        </div>
      </div>

      <!-- Empty state -->
      <div v-else class="text-center py-16">
        <div class="w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <svg class="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
        </div>
        <h3 class="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">
          No sensors available
        </h3>
        <p class="text-gray-600 dark:text-gray-400 max-w-md mx-auto">
          Connect your sensors to start monitoring readings and performance metrics.
        </p>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Staggered animation for cards */
.grid-cards > div {
  animation: slideUp 0.5s ease-out both;
}

.grid-cards > div:nth-child(1) { animation-delay: 0.05s; }
.grid-cards > div:nth-child(2) { animation-delay: 0.1s; }
.grid-cards > div:nth-child(3) { animation-delay: 0.15s; }
.grid-cards > div:nth-child(4) { animation-delay: 0.2s; }
.grid-cards > div:nth-child(5) { animation-delay: 0.25s; }
.grid-cards > div:nth-child(6) { animation-delay: 0.3s; }
</style>