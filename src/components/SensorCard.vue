<script setup lang="ts">
defineProps<{
  title: string
  value: number
  unit: string
  status: 'normal' | 'warning' | 'critical'
  icon?: string
}>()

const statusColor = (status: 'normal' | 'warning' | 'critical') => {
  switch (status) {
    case 'critical':
      return 'text-red-600'
    case 'warning':
      return 'text-amber-500'
    case 'normal':
      return 'text-green-600'
    default:
      return 'text-gray-600'
  }
}

const statusIcon = (status: 'normal' | 'warning' | 'critical') => {
  switch (status) {
    case 'critical':
      return 'mdi-alert-circle'
    case 'warning':
      return 'mdi-alert'
    case 'normal':
      return 'mdi-check-circle'
    default:
      return 'mdi-information'
  }
}
</script>

<template>
  <div
    class="bg-white rounded-lg shadow-md overflow-hidden transition-all duration-300 hover:shadow-lg dark:bg-gray-800 dark:text-white"
  >
    <div class="p-4">
      <div class="flex justify-between items-start mb-3">
        <h3 class="font-semibold text-gray-700 dark:text-gray-200">{{ title }}</h3>
        <span class="mdi text-lg" :class="[statusIcon(status), statusColor(status)]"></span>
      </div>

      <div class="flex items-center">
        <span
          v-if="icon"
          class="mdi text-3xl mr-3 text-gray-500 dark:text-gray-400"
          :class="`mdi-${icon}`"
        ></span>

        <div>
          <div class="flex items-baseline">
            <span class="text-3xl font-bold" :class="statusColor(status)">{{ value }}</span>
            <span class="ml-1 text-gray-500 dark:text-gray-400">{{ unit }}</span>
          </div>

          <div class="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Status:
            <span :class="statusColor(status)">{{
              status.charAt(0).toUpperCase() + status.slice(1)
            }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Card footer with quick actions -->
    <div
      class="bg-gray-50 px-4 py-2 border-t flex justify-between items-center dark:bg-gray-700 dark:border-gray-600"
    >
      <span class="text-xs text-gray-500 dark:text-gray-400">Updated just now</span>

      <div class="flex space-x-2">
        <button
          class="text-gray-500 hover:text-primary focus:outline-none dark:text-gray-400 dark:hover:text-primary-300"
          title="View Details"
        >
          <span class="mdi mdi-chart-line text-sm"></span>
        </button>

        <button
          class="text-gray-500 hover:text-primary focus:outline-none dark:text-gray-400 dark:hover:text-primary-300"
          title="View History"
        >
          <span class="mdi mdi-history text-sm"></span>
        </button>
      </div>
    </div>
  </div>
</template>
