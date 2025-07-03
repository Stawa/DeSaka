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
  if (!props.isRefreshing) emit('refreshData')
}

const exportData = () => {
  emit('export')
}
</script>

<template>
  <div
    class="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-xl border border-gray-200/50 dark:border-gray-700 shadow-lg shadow-gray-900/5 dark:shadow-gray-900/20 overflow-hidden mb-8"
  >
    <div class="px-4 py-4 sm:px-6 sm:py-6">
      <!-- Header layout -->
      <div class="flex items-start justify-between gap-4 mb-4">
        <!-- Icon and title -->
        <div class="flex items-start gap-4 min-w-0 flex-1">
          <div class="flex-shrink-0">
            <div
              class="w-12 h-12 bg-emerald-100/50 dark:bg-emerald-900/30 rounded-2xl flex items-center justify-center ring-1 ring-emerald-200/50 dark:ring-emerald-700/50"
            >
              <span class="mdi mdi-shovel text-2xl text-emerald-600 dark:text-emerald-400"></span>
            </div>
          </div>

          <div class="min-w-0 flex-1">
            <h1
              class="text-xl sm:text-2xl font-semibold text-gray-900 dark:text-gray-100 tracking-tight"
            >
              Soil Analysis
            </h1>
            <p class="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
              Real-time Environmental Monitoring
            </p>
          </div>
        </div>

        <!-- Buttons -->
        <div class="flex items-center gap-2 flex-shrink-0">
          <!-- Refresh -->
          <button
            @click="refreshData"
            class="inline-flex items-center gap-1.5 px-3 h-9 rounded-xl text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200 text-sm font-medium"
            :class="{ 'opacity-50 cursor-not-allowed': isRefreshing }"
            :disabled="isRefreshing"
            :title="isRefreshing ? 'Syncing...' : 'Refresh data'"
          >
            <span
              :class="[
                'w-4 h-4',
                isRefreshing ? 'mdi mdi-loading animate-spin' : 'mdi mdi-refresh',
              ]"
            ></span>
            <span>{{ isRefreshing ? 'Refreshing...' : 'Refresh' }}</span>
          </button>

          <!-- Export -->
          <button
            @click="exportData"
            class="inline-flex items-center gap-1.5 px-3 h-9 rounded-xl text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200 text-sm font-medium"
            title="Export data"
          >
            <span class="mdi mdi-download text-lg"></span>
            <span>Export</span>
          </button>
        </div>
      </div>

      <!-- Footer section -->
      <div
        class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pt-4 border-t border-gray-200/50 dark:border-gray-700/50"
      >
        <!-- Left: status -->
        <div class="flex items-center flex-wrap gap-4 text-xs text-gray-500 dark:text-gray-400">
          <div class="flex items-center gap-1.5">
            <span class="mdi mdi-clock-outline text-sm"></span>
            <span>Updated {{ lastUpdated }}</span>
          </div>
        </div>

        <!-- Right: sample stats -->
        <div class="flex items-center gap-6 text-center text-xs">
          <div class="flex items-center gap-1.5">
            <div class="w-2 h-2 bg-orange-500 rounded-full"></div>
            <span class="text-gray-600 dark:text-gray-300">
              <span class="font-semibold text-gray-900 dark:text-gray-100">8</span>
              <span class="ml-1">Active Sensors</span>
            </span>
          </div>
          <div class="w-px h-4 bg-gray-200 dark:bg-gray-700"></div>
          <div class="flex items-center gap-1.5">
            <div class="w-2 h-2 bg-emerald-500 rounded-full"></div>
            <span class="text-gray-600 dark:text-gray-300">
              <span class="font-semibold text-emerald-600 dark:text-emerald-400">92%</span>
              <span class="ml-1">Moisture OK</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
@keyframes pulse {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

.animate-pulse {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.animate-spin {
  animation: spin 1s linear infinite;
}
</style>
