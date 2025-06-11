<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps({
  title: {
    type: String,
    required: true,
  },
  value: {
    type: [String, Number],
    required: true,
  },
  unit: {
    type: String,
    default: '',
  },
  status: {
    type: String,
    default: 'optimal',
    validator: (value: string) => ['optimal', 'warning', 'critical', 'inactive'].includes(value),
  },
  icon: {
    type: String,
    default: 'thermometer',
  },
  trend: {
    type: String,
    default: 'stable',
  },
})

const iconClass = computed(() => {
  return `mdi mdi-${props.icon}`
})

const trendInfo = computed(() => {
  const info = {
    icon: 'mdi-minus',
    text: 'No Change',
    color: 'text-gray-500 dark:text-gray-400',
  }

  if (props.trend === 'increasing') {
    info.icon = 'mdi-arrow-up'
    info.text = 'Increasing'
    info.color = 'text-red-500 dark:text-red-400'
  } else if (props.trend === 'decreasing') {
    info.icon = 'mdi-arrow-down'
    info.text = 'Decreasing'
    info.color = 'text-blue-500 dark:text-blue-400'
  } else if (props.trend === 'stable') {
    info.icon = 'mdi-arrow-right'
    info.text = 'Stable'
    info.color = 'text-green-500 dark:text-green-400'
  }

  return info
})
</script>

<template>
  <div
    class="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden border border-gray-200 dark:border-gray-700 fadeIn"
  >
    <!-- Status indicator bar at top -->
    <div
      class="h-1.5"
      :class="{
        'bg-green-500': status === 'optimal',
        'bg-yellow-500': status === 'warning',
        'bg-red-500': status === 'critical',
        'bg-gray-400': status === 'inactive',
      }"
    ></div>

    <div class="p-4">
      <!-- Header: Title, Icon, and Status Badge -->
      <div class="flex items-center justify-between mb-3">
        <div class="flex items-center">
          <span
            :class="[
              iconClass,
              {
                'text-green-500': status === 'optimal',
                'text-yellow-500': status === 'warning',
                'text-red-500': status === 'critical',
                'text-gray-400': status === 'inactive',
              },
              'text-xl mr-2',
            ]"
          ></span>
          <h3 class="font-medium text-gray-800 dark:text-gray-200">{{ title }}</h3>
        </div>
        <span
          class="px-2 py-0.5 text-xs rounded-full"
          :class="{
            'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200':
              status === 'optimal',
            'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200':
              status === 'warning',
            'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200': status === 'critical',
            'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200': status === 'inactive',
          }"
        >
          {{ status.charAt(0).toUpperCase() + status.slice(1) }}
        </span>
      </div>

      <!-- Value and Unit -->
      <div class="flex items-baseline mb-2">
        <span class="text-2xl font-bold text-gray-800 dark:text-gray-200">{{ value }}</span>
        <span class="ml-1 text-sm text-gray-500 dark:text-gray-400">{{ unit }}</span>
      </div>

      <!-- Trend Indicator -->
      <div class="flex items-center text-xs">
        <span :class="[`mdi ${trendInfo.icon}`, trendInfo.color, 'mr-1']"></span>
        <span :class="trendInfo.color">{{ trendInfo.text }}</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.fadeIn {
  animation: fadeIn 0.5s ease-out forwards;
}
</style>
