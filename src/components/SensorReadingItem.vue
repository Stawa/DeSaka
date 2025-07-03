<script setup lang="ts">
import { computed } from 'vue'
import { getSensorIcon, getSensorLabel, getSensorDescription, getSensorColor } from '@/scripts'

const props = defineProps({
  sensorId: {
    type: String,
    required: true,
  },
  sensorData: {
    type: Object,
    required: true,
  },
  onClick: {
    type: Function,
    default: () => {},
  },
})

const sensorIcon = computed(() => getSensorIcon(props.sensorId))
const sensorLabel = computed(() => getSensorLabel(props.sensorId))
const sensorDescription = computed(() => getSensorDescription(props.sensorId))
const sensorColor = computed(() => getSensorColor(props.sensorId))

const getStatusInfo = (status: string) => {
  const statusMap = {
    optimal: {
      color: 'text-emerald-700 dark:text-emerald-300',
      bg: 'bg-emerald-50 dark:bg-emerald-900/20',
      icon: 'mdi-check-circle',
      dot: 'bg-emerald-500',
      border: 'border-emerald-200 dark:border-emerald-800',
    },
    normal: {
      color: 'text-emerald-700 dark:text-emerald-300',
      bg: 'bg-emerald-50 dark:bg-emerald-900/20',
      icon: 'mdi-check-circle',
      dot: 'bg-emerald-500',
      border: 'border-emerald-200 dark:border-emerald-800',
    },
    warning: {
      color: 'text-amber-700 dark:text-amber-300',
      bg: 'bg-amber-50 dark:bg-amber-900/20',
      icon: 'mdi-alert',
      dot: 'bg-amber-500',
      border: 'border-amber-200 dark:border-amber-800',
    },
    critical: {
      color: 'text-red-700 dark:text-red-300',
      bg: 'bg-red-50 dark:bg-red-900/20',
      icon: 'mdi-alert-circle',
      dot: 'bg-red-500',
      border: 'border-red-200 dark:border-red-800',
    },
  }
  return statusMap[status as keyof typeof statusMap] || statusMap.normal
}

const statusInfo = computed(() => getStatusInfo(props.sensorData.status))
</script>

<template>
  <tr
    class="hover:bg-gray-50/80 dark:hover:bg-gray-800/50 transition-all duration-200 cursor-pointer group"
    @click="onClick(sensorId)"
  >
    <td class="px-6 py-4 whitespace-nowrap">
      <div class="flex items-center gap-4">
        <div
          class="flex-shrink-0 w-12 h-12 flex items-center justify-center rounded-xl transition-transform duration-200 group-hover:scale-110"
          :class="`bg-${sensorColor}-100 dark:bg-${sensorColor}-900/30`"
        >
          <span
            class="mdi text-xl"
            :class="[sensorIcon, `text-${sensorColor}-600 dark:text-${sensorColor}-400`]"
          ></span>
        </div>
        <div>
          <div class="text-base font-semibold text-gray-900 dark:text-gray-100">
            {{ sensorLabel }}
          </div>
          <div class="text-sm text-gray-600 dark:text-gray-400">{{ sensorDescription }}</div>
        </div>
      </div>
    </td>
    
    <td class="px-6 py-4 whitespace-nowrap">
      <div
        class="inline-flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-semibold border"
        :class="[statusInfo.bg, statusInfo.color, statusInfo.border]"
      >
        <div class="w-2 h-2 rounded-full" :class="statusInfo.dot"></div>
        {{ sensorData.status.charAt(0).toUpperCase() + sensorData.status.slice(1) }}
      </div>
    </td>
    
    <td class="px-6 py-4 whitespace-nowrap">
      <div class="flex items-baseline gap-2">
        <span class="text-2xl font-bold text-gray-900 dark:text-gray-100">{{
          sensorData.value
        }}</span>
        <span class="text-sm font-medium text-gray-500 dark:text-gray-400">{{
          sensorData.unit
        }}</span>
      </div>
    </td>
    
    <td class="px-6 py-4 whitespace-nowrap">
      <div class="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span>2 min ago</span>
      </div>
    </td>
    
    <td class="px-6 py-4 whitespace-nowrap">
      <div class="w-8 h-8 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center group-hover:bg-primary-100 dark:group-hover:bg-primary-900/30 transition-colors duration-200">
        <svg class="w-4 h-4 text-gray-400 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
        </svg>
      </div>
    </td>
  </tr>
</template>

<style scoped>
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(5px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

tr {
  animation: fadeIn 0.3s ease-out;
  animation-fill-mode: both;
}
</style>