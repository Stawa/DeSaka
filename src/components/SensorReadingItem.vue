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
</script>

<template>
  <tr
    class="hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition-colors duration-150 cursor-pointer"
    @click="onClick(sensorId)"
  >
    <td class="px-2 py-2 sm:px-3 sm:py-3 md:px-4 md:py-4 whitespace-nowrap">
      <div class="flex items-center">
        <div
          class="flex-shrink-0 h-7 w-7 xs:h-8 xs:w-8 sm:h-10 sm:w-10 flex items-center justify-center rounded-full"
          :class="`bg-${sensorColor}-50 dark:bg-${sensorColor}-900/30`"
        >
          <span
            class="mdi text-lg sm:text-xl"
            :class="[sensorIcon, `text-${sensorColor}-600 dark:text-${sensorColor}-400`]"
          ></span>
        </div>
        <div class="ml-3 sm:ml-4">
          <div class="text-sm sm:text-base font-medium text-gray-900 dark:text-gray-100">
            {{ sensorLabel }}
          </div>
          <div class="text-xs text-gray-500 dark:text-gray-400">{{ sensorDescription }}</div>
        </div>
      </div>
    </td>
    <td class="px-2 py-2 sm:px-3 sm:py-3 md:px-4 md:py-4 whitespace-nowrap">
      <span
        class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
        :class="{
          'bg-cyan-100 dark:bg-cyan-900/30 text-cyan-800 dark:text-cyan-300':
            sensorData.status === 'optimal',
          'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300':
            sensorData.status === 'normal',
          'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300':
            sensorData.status === 'warning',
          'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300':
            sensorData.status === 'critical',
        }"
      >
        <span
          class="mdi mr-1 text-xs"
          :class="{
            'mdi-star-check': sensorData.status === 'optimal',
            'mdi-check-circle': sensorData.status === 'normal',
            'mdi-alert': sensorData.status === 'warning',
            'mdi-alert-circle': sensorData.status === 'critical',
          }"
        ></span>
        {{ sensorData.status.charAt(0).toUpperCase() + sensorData.status.slice(1) }}
      </span>
    </td>
    <td class="px-2 py-2 sm:px-3 sm:py-3 md:px-4 md:py-4 whitespace-nowrap">
      <div class="flex items-baseline">
        <span class="text-lg sm:text-xl font-bold text-gray-900 dark:text-gray-100">{{
          sensorData.value
        }}</span>
        <span class="ml-1 text-xs sm:text-sm text-gray-500 dark:text-gray-400">{{
          sensorData.unit
        }}</span>
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
