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
    class="bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 rounded-xl shadow-md overflow-hidden transition-all duration-300 hover:shadow-xl dark:text-white border border-gray-100 dark:border-gray-700 transform hover:-translate-y-1"
  >
    <!-- Card Status Indicator Bar -->
    <div
      class="h-1 w-full"
      :class="{
        'bg-gradient-to-r from-green-400 to-green-500': status === 'normal',
        'bg-gradient-to-r from-amber-400 to-amber-500': status === 'warning',
        'bg-gradient-to-r from-red-400 to-red-500': status === 'critical',
      }"
    ></div>

    <div class="p-5">
      <div class="flex justify-between items-start mb-4">
        <h3
          class="font-bold text-gray-800 dark:text-gray-200 flex items-center truncate max-w-[70%]"
        >
          <span
            v-if="icon"
            class="mdi text-lg mr-2 flex-shrink-0"
            :class="[`mdi-${icon}`, statusColor(status)]"
          ></span>
          <span class="truncate">{{ title }}</span>
        </h3>
        <div
          class="rounded-full py-1 px-2 flex-shrink-0"
          :class="{
            'bg-green-100 dark:bg-green-900/30': status === 'normal',
            'bg-amber-100 dark:bg-amber-900/30': status === 'warning',
            'bg-red-100 dark:bg-red-900/30': status === 'critical',
          }"
        >
          <span class="mdi text-lg" :class="[statusIcon(status), statusColor(status)]"></span>
        </div>
      </div>

      <div class="flex items-center">
        <div class="w-full">
          <div class="flex items-baseline flex-wrap">
            <span class="text-4xl font-bold truncate max-w-full" :class="statusColor(status)">{{
              value
            }}</span>
            <span class="ml-1 text-gray-500 dark:text-gray-400 font-medium truncate">{{
              unit
            }}</span>
          </div>

          <div class="flex flex-wrap justify-between items-center mt-3 gap-2">
            <div
              class="text-xs font-medium px-2 py-1 rounded-full whitespace-nowrap"
              :class="{
                'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300':
                  status === 'normal',
                'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300':
                  status === 'warning',
                'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300':
                  status === 'critical',
              }"
            >
              {{ status.charAt(0).toUpperCase() + status.slice(1) }}
            </div>
            <span class="text-xs text-gray-500 dark:text-gray-400 truncate">Updated just now</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Card footer with quick actions -->
    <div
      class="bg-gray-50 px-4 py-3 border-t flex justify-between items-center dark:bg-gray-800/50 dark:border-gray-700"
    >
      <button
        class="text-xs text-gray-600 hover:text-primary-600 focus:outline-none dark:text-gray-300 dark:hover:text-primary-400 flex items-center transition-colors"
        title="View Details"
      >
        <span class="mdi mdi-information-outline mr-1"></span>
        Details
      </button>

      <div class="flex space-x-3">
        <button
          class="text-gray-500 hover:text-primary-600 focus:outline-none dark:text-gray-400 dark:hover:text-primary-400 transition-colors"
          title="View Chart"
        >
          <span class="mdi mdi-chart-line"></span>
        </button>

        <button
          class="text-gray-500 hover:text-primary-600 focus:outline-none dark:text-gray-400 dark:hover:text-primary-400 transition-colors"
          title="View History"
        >
          <span class="mdi mdi-history"></span>
        </button>

        <button
          class="text-gray-500 hover:text-primary-600 focus:outline-none dark:text-gray-400 dark:hover:text-primary-400 transition-colors"
          title="More Options"
        >
          <span class="mdi mdi-dots-vertical"></span>
        </button>
      </div>
    </div>
  </div>
</template>
