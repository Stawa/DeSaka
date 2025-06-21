<script setup lang="ts">
interface Props {
  lastUpdated?: string
  isRefreshing?: boolean
}

interface Emits {
  refreshData: []
  export: []
}

const props = withDefaults(defineProps<Props>(), {
  lastUpdated: () => new Date().toLocaleString(),
  isRefreshing: false,
})

const emit = defineEmits<Emits>()

const refreshData = () => {
  if (!props.isRefreshing) {
    emit('refreshData')
  }
}

const exportData = () => {
  emit('export')
}
</script>

<template>
  <div
    class="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-6 sm:p-8 mb-8"
  >
    <div class="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
      <!-- Left Side -->
      <div class="flex-1">
        <div class="flex items-center gap-4 mb-4">
          <!-- Simple Icon -->
          <div
            class="w-12 h-12 flex items-center justify-center bg-gray-100 dark:bg-gray-800 rounded-xl text-emerald-600 dark:text-emerald-400"
          >
            <span class="mdi mdi-shovel text-2xl"></span>
          </div>

          <!-- Title and Subtitle -->
          <div>
            <h1 class="text-xl sm:text-2xl font-semibold text-gray-900 dark:text-white">
              Soil Analysis
            </h1>
            <p class="text-gray-600 dark:text-gray-400 text-sm">
              Real-time Environmental Monitoring
            </p>
          </div>
        </div>

        <!-- Status Info -->
        <div class="flex flex-wrap items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
          <div class="flex items-center gap-2">
            <span class="mdi mdi-clock-outline text-base"></span>
            <span>Updated {{ lastUpdated }}</span>
          </div>
        </div>
      </div>

      <!-- Right Side Buttons -->
      <div class="flex flex-col sm:flex-row gap-3">
        <!-- Refresh -->
        <button
          @click="refreshData"
          :disabled="isRefreshing"
          class="flex items-center justify-center gap-2 px-4 py-1.5 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition"
        >
          <span :class="isRefreshing ? 'mdi mdi-loading animate-spin' : 'mdi mdi-refresh'"></span>
          <span>{{ isRefreshing ? 'Syncing...' : 'Refresh' }}</span>
        </button>

        <!-- Export -->
        <button
          @click="exportData"
          class="flex items-center justify-center gap-2 px-4 py-1.5 bg-emerald-600 text-white rounded-md hover:bg-emerald-700 transition"
        >
          <span class="mdi mdi-download text-lg"></span>
          <span>Export</span>
        </button>
      </div>
    </div>
  </div>
</template>
