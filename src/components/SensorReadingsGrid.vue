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
    },
    normal: {
      color: 'text-emerald-600 dark:text-emerald-400',
      bg: 'bg-emerald-50 dark:bg-emerald-900/20',
      icon: 'mdi mdi-check-circle',
      dot: 'bg-emerald-500',
      border: 'border-emerald-200 dark:border-emerald-800',
    },
    warning: {
      color: 'text-amber-700 dark:text-amber-300',
      bg: 'bg-amber-50 dark:bg-amber-900/20',
      icon: 'mdi mdi-alert',
      dot: 'bg-amber-500',
      border: 'border-amber-200 dark:border-amber-800',
    },
    critical: {
      color: 'text-red-700 dark:text-red-300',
      bg: 'bg-red-50 dark:bg-red-900/20',
      icon: 'mdi mdi-alert-circle',
      dot: 'bg-red-500',
      border: 'border-red-200 dark:border-red-800',
    },
  }

  return (status as keyof typeof statusMap) in statusMap
    ? statusMap[status as keyof typeof statusMap]
    : statusMap.normal
}
</script>

<template>
  <div class="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
    <!-- Header -->
    <div class="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center">
            <svg class="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <div>
            <h2 class="text-lg font-semibold text-gray-900 dark:text-gray-100">Sensor Readings</h2>
            <p class="text-sm text-gray-600 dark:text-gray-400">
              {{ sensorCount }} {{ sensorCount === 1 ? 'sensor' : 'sensors' }} monitored
            </p>
          </div>
        </div>
        
        <div class="flex items-center gap-2">
          <div class="w-2 h-2 bg-emerald-500 rounded-full"></div>
          <span class="text-sm font-medium text-emerald-600 dark:text-emerald-400">Live</span>
        </div>
      </div>
    </div>

    <!-- Content -->
    <div class="p-6">
      <!-- Sensor Cards Grid -->
      <div v-if="sensorCount > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div
          v-for="(sensor, sensorId) in sensorData"
          :key="sensorId"
          class="group p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-750 transition-colors cursor-pointer"
          @click="onSensorClick(sensorId)"
        >
          <!-- Status indicator dot -->
          <div class="flex items-center justify-between mb-3">
            <div :class="[getStatusInfo(sensor.status).dot, 'w-2 h-2 rounded-full']"></div>
            <svg class="w-4 h-4 text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
            </svg>
          </div>

          <!-- Sensor icon and info -->
          <div class="flex items-start gap-3 mb-4">
            <div
              :class="`w-10 h-10 bg-${getSensorColor(sensorId)}-100 dark:bg-${getSensorColor(sensorId)}-900/30 rounded-lg flex items-center justify-center`"
            >
              <span
                :class="`mdi ${getSensorIcon(sensorId)} text-${getSensorColor(sensorId)}-600 dark:text-${getSensorColor(sensorId)}-400 text-lg`"
              ></span>
            </div>
            <div class="min-w-0 flex-1">
              <h3 class="font-medium text-gray-900 dark:text-gray-100 mb-1">
                {{ getSensorLabel(sensorId) }}
              </h3>
              <p class="text-sm text-gray-600 dark:text-gray-400">
                {{ getSensorDescription(sensorId) }}
              </p>
            </div>
          </div>

          <!-- Reading value -->
          <div class="mb-3">
            <div class="flex items-baseline gap-2">
              <span class="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {{ sensor.value }}
              </span>
              <span class="text-sm font-medium text-gray-500 dark:text-gray-400">
                {{ sensor.unit }}
              </span>
            </div>
          </div>

          <!-- Status -->
          <div
            :class="[
              getStatusInfo(sensor.status).bg,
              getStatusInfo(sensor.status).color,
              'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium border',
              getStatusInfo(sensor.status).border
            ]"
          >
            <span :class="`mdi ${getStatusInfo(sensor.status).icon} text-xs`"></span>
            {{ sensor.status.charAt(0).toUpperCase() + sensor.status.slice(1) }}
          </div>
        </div>
      </div>

      <!-- Empty state -->
      <div v-else class="text-center py-12">
        <div class="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-xl flex items-center justify-center mx-auto mb-4">
          <svg class="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
        </div>
        <h3 class="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
          No sensors available
        </h3>
        <p class="text-gray-600 dark:text-gray-400 max-w-md mx-auto">
          Connect your sensors to start monitoring readings and performance metrics.
        </p>
      </div>
    </div>
  </div>
</template>