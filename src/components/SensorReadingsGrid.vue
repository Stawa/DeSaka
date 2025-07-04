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
  <div class="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden relative">
    <!-- Animated gradient accent bar -->
    <div class="h-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-blue-600 animate-gradient-x"></div>

    <!-- Enhanced header -->
    <div class="px-6 py-5 lg:px-8 lg:py-6 border-b border-gray-200 dark:border-gray-700">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-4">
          <div class="relative group">
            <div class="w-12 h-12 bg-gradient-to-br from-blue-100 via-blue-50 to-indigo-50 dark:from-blue-900/40 dark:via-blue-800/30 dark:to-indigo-800/20 rounded-2xl flex items-center justify-center ring-1 ring-blue-200/50 dark:ring-blue-700/30 backdrop-blur-sm transition-all duration-300 group-hover:scale-105 group-hover:shadow-lg group-hover:shadow-blue-500/20">
              <svg class="w-6 h-6 text-blue-600 dark:text-blue-400 transition-transform duration-300 group-hover:rotate-12" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <div class="absolute inset-0 bg-blue-500/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10"></div>
          </div>
          <div>
            <h2 class="text-xl font-bold text-gray-900 dark:text-white bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 dark:from-white dark:via-gray-100 dark:to-white bg-clip-text">Sensor Readings</h2>
            <p class="text-sm text-gray-600 dark:text-gray-400 font-medium">
              {{ sensorCount }} {{ sensorCount === 1 ? 'sensor' : 'sensors' }} monitored
            </p>
          </div>
        </div>
        
        <div class="flex items-center gap-3">
          <div class="relative">
            <div class="w-3 h-3 bg-emerald-500 rounded-full shadow-sm"></div>
            <div class="absolute inset-0 w-3 h-3 bg-emerald-500 rounded-full animate-ping opacity-75"></div>
          </div>
          <span class="text-sm font-bold text-emerald-600 dark:text-emerald-400">Live</span>
        </div>
      </div>
    </div>

    <!-- Enhanced content -->
    <div class="p-6 lg:p-8">
      <!-- Enhanced sensor cards grid -->
      <div v-if="sensorCount > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div
          v-for="(sensor, sensorId) in sensorData"
          :key="sensorId"
          class="group p-6 bg-gradient-to-br from-gray-50 via-gray-25 to-slate-50 dark:from-gray-800/50 dark:via-gray-700/40 dark:to-slate-700/30 rounded-2xl border border-gray-200/50 dark:border-gray-700/30 hover:border-gray-300 dark:hover:border-gray-600 transition-all duration-300 cursor-pointer hover:shadow-lg hover:shadow-gray-500/10 hover:scale-[1.02]"
          @click="onSensorClick(sensorId)"
        >
          <!-- Enhanced status indicator -->
          <div class="flex items-center justify-between mb-5">
            <div :class="[getStatusInfo(sensor.status).dot, 'w-3 h-3 rounded-full shadow-sm']"></div>
            <svg class="w-5 h-5 text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300 transition-all duration-300 group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
            </svg>
          </div>

          <!-- Enhanced sensor icon and info -->
          <div class="flex items-start gap-4 mb-6">
            <div
              :class="`w-12 h-12 bg-${getSensorColor(sensorId)}-100 dark:bg-${getSensorColor(sensorId)}-900/30 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300`"
            >
              <span
                :class="`mdi ${getSensorIcon(sensorId)} text-${getSensorColor(sensorId)}-600 dark:text-${getSensorColor(sensorId)}-400 text-xl`"
              ></span>
            </div>
            <div class="min-w-0 flex-1">
              <h3 class="font-bold text-gray-900 dark:text-white mb-1 text-base">
                {{ getSensorLabel(sensorId) }}
              </h3>
              <p class="text-sm text-gray-600 dark:text-gray-400 font-medium">
                {{ getSensorDescription(sensorId) }}
              </p>
            </div>
          </div>

          <!-- Enhanced reading value -->
          <div class="mb-5">
            <div class="flex items-baseline gap-2">
              <span class="text-3xl font-black text-gray-900 dark:text-white">
                {{ sensor.value }}
              </span>
              <span class="text-base font-bold text-gray-500 dark:text-gray-400">
                {{ sensor.unit }}
              </span>
            </div>
          </div>

          <!-- Enhanced status badge -->
          <div
            :class="[
              getStatusInfo(sensor.status).bg,
              getStatusInfo(sensor.status).color,
              'inline-flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold border',
              getStatusInfo(sensor.status).border
            ]"
          >
            <span :class="`mdi ${getStatusInfo(sensor.status).icon} text-sm`"></span>
            {{ sensor.status.charAt(0).toUpperCase() + sensor.status.slice(1) }}
          </div>
        </div>
      </div>

      <!-- Enhanced empty state -->
      <div v-else class="text-center py-16">
        <div class="w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-50 dark:from-gray-800 dark:to-gray-700 rounded-2xl flex items-center justify-center mx-auto mb-6 ring-1 ring-gray-200 dark:ring-gray-700">
          <svg class="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
        </div>
        <h3 class="text-xl font-bold text-gray-900 dark:text-white mb-3">
          No sensors available
        </h3>
        <p class="text-gray-600 dark:text-gray-400 max-w-md mx-auto font-medium">
          Connect your sensors to start monitoring readings and performance metrics.
        </p>
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

.group:hover .group-hover\:translate-x-1 {
  transform: translateX(4px);
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