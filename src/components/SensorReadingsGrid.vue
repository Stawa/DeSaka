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
      color: 'text-cyan-700 dark:text-cyan-300',
      bg: 'bg-cyan-50 dark:bg-cyan-900/20',
      icon: 'mdi mdi-star-check',
      dot: 'bg-cyan-500',
    },
    normal: {
      color: 'text-emerald-600 dark:text-emerald-400',
      bg: 'bg-emerald-50 dark:bg-emerald-900/20',
      icon: 'mdi mdi-check-circle',
      dot: 'bg-emerald-500',
    },
    warning: {
      color: 'text-amber-600 dark:text-amber-400',
      bg: 'bg-amber-50 dark:bg-amber-900/20',
      icon: 'mdi mdi-alert',
      dot: 'bg-amber-500',
    },
    critical: {
      color: 'text-red-600 dark:text-red-400',
      bg: 'bg-red-50 dark:bg-red-900/20',
      icon: 'mdi mdi-alert-circle',
      dot: 'bg-red-500',
    },
  }

  return (status as keyof typeof statusMap) in statusMap
    ? statusMap[status as keyof typeof statusMap]
    : statusMap.normal
}
</script>

<template>
  <div
    class="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm w-full"
  >
    <!-- Header -->
    <div class="px-6 py-5 border-b border-gray-50 dark:border-gray-700">
      <div class="flex items-center justify-between">
        <div class="flex items-center space-x-3">
          <div
            class="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-sm"
          >
            <span class="text-white text-2xl mdi mdi-chart-line"></span>
          </div>
          <div>
            <h2 class="text-lg font-semibold text-gray-900 dark:text-gray-100">Sensor Readings</h2>
            <p class="text-sm text-gray-500 dark:text-gray-400">
              {{ sensorCount }} {{ sensorCount === 1 ? 'sensor' : 'sensors' }} monitored
            </p>
          </div>
        </div>
      </div>
    </div>

    <!-- Content -->
    <div class="p-6">
      <!-- Sensor Cards Grid -->
      <div
        v-if="sensorCount > 0"
        class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
      >
        <div
          v-for="(sensor, sensorId) in sensorData"
          :key="sensorId"
          class="group relative bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-5 transition-all duration-200 hover:shadow-md hover:border-gray-200 dark:hover:border-gray-600 hover:-translate-y-0.5 cursor-pointer"
          @click="onSensorClick(sensorId)"
        >
          <!-- Status indicator dot -->
          <div class="absolute top-4 right-4">
            <div :class="[getStatusInfo(sensor.status).dot, 'w-2 h-2 rounded-full']"></div>
          </div>

          <!-- Sensor icon and info -->
          <div class="flex items-start space-x-3 mb-4">
            <div
              :class="`w-12 h-12 bg-${getSensorColor(sensorId)}-50 dark:bg-${getSensorColor(sensorId)}-900/20 rounded-xl flex items-center justify-center flex-shrink-0`"
            >
              <span
                :class="`mdi ${getSensorIcon(sensorId)} text-${getSensorColor(sensorId)}-600 dark:text-${getSensorColor(sensorId)}-400 text-xl`"
              ></span>
            </div>
            <div class="min-w-0 flex-1">
              <h3 class="font-semibold text-gray-900 dark:text-gray-100 text-sm mb-1 truncate">
                {{ getSensorLabel(sensorId) }}
              </h3>
              <p class="text-xs text-gray-500 dark:text-gray-400 line-clamp-2">
                {{ getSensorDescription(sensorId) }}
              </p>
            </div>
          </div>

          <!-- Reading value -->
          <div class="mb-3">
            <div class="flex items-baseline space-x-1">
              <span class="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {{ sensor.value }}
              </span>
              <span class="text-sm text-gray-500 dark:text-gray-400 font-medium">
                {{ sensor.unit }}
              </span>
            </div>
          </div>

          <!-- Status badge -->
          <div class="flex items-center justify-between">
            <div
              :class="[
                getStatusInfo(sensor.status).bg,
                getStatusInfo(sensor.status).color,
                'inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium',
              ]"
            >
              <span
                class="w-3 h-3 mr-1.5"
                :class="`mdi ${getStatusInfo(sensor.status).icon} text-${getStatusInfo(sensor.status).color}`"
              ></span>
              {{ sensor.status.charAt(0).toUpperCase() + sensor.status.slice(1) }}
            </div>

            <!-- Chevron icon for interaction hint -->
            <svg
              class="w-4 h-4 text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300 transition-colors duration-200"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M9 5l7 7-7 7"
              />
            </svg>
          </div>
        </div>
      </div>

      <!-- Empty state -->
      <div v-else class="text-center py-12">
        <div
          class="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4"
        >
          <svg class="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
            />
          </svg>
        </div>
        <h3 class="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
          No sensors available
        </h3>
        <p class="text-gray-500 dark:text-gray-400 max-w-sm mx-auto">
          Connect your sensors to start monitoring readings and performance metrics.
        </p>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Line clamp utility for multiline text truncation */
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* Staggered animation for cards */
.grid > div {
  animation: slideUp 0.4s ease-out both;
}

.grid > div:nth-child(1) {
  animation-delay: 0.05s;
}
.grid > div:nth-child(2) {
  animation-delay: 0.1s;
}
.grid > div:nth-child(3) {
  animation-delay: 0.15s;
}
.grid > div:nth-child(4) {
  animation-delay: 0.2s;
}
.grid > div:nth-child(5) {
  animation-delay: 0.25s;
}
.grid > div:nth-child(6) {
  animation-delay: 0.3s;
}
.grid > div:nth-child(7) {
  animation-delay: 0.35s;
}
.grid > div:nth-child(8) {
  animation-delay: 0.4s;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Smooth transitions */
* {
  transition-property: color, background-color, border-color, box-shadow, transform;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 200ms;
}
</style>
