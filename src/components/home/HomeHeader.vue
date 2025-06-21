<template>
  <div
    class="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-xl border border-gray-200/50 dark:border-gray-700 shadow-lg shadow-gray-900/5 dark:shadow-gray-900/20 overflow-hidden"
  >
    <div class="px-4 py-4 sm:px-6 sm:py-6">
      <!-- Main header layout -->
      <div class="flex items-start justify-between gap-4 mb-4">
        <!-- Left: Icon and Title -->
        <div class="flex items-start gap-4 min-w-0 flex-1">
          <div class="flex-shrink-0">
            <div
              class="w-12 h-12 bg-slate-100/50 dark:bg-slate-800/50 rounded-2xl flex items-center justify-center ring-1 ring-gray-200/50 dark:ring-gray-700/50"
            >
              <svg
                class="w-6 h-6 text-emerald-600 dark:text-emerald-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                stroke-width="1.5"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z"
                />
              </svg>
            </div>
          </div>

          <div class="min-w-0 flex-1">
            <h1
              class="text-xl sm:text-2xl font-semibold text-gray-900 dark:text-gray-100 tracking-tight"
            >
              Dashboard
            </h1>
            <p class="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
              Plant growth monitoring system
            </p>
          </div>
        </div>

        <!-- Right: Action buttons -->
        <div class="flex items-center gap-2 flex-shrink-0">
          <!-- Refresh -->
          <button
            @click="refreshData"
            class="w-9 h-9 inline-flex items-center justify-center rounded-xl text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200"
            :class="{ 'opacity-50 cursor-not-allowed': isRefreshing }"
            :disabled="isRefreshing"
            :title="isRefreshing ? 'Refreshing...' : 'Refresh data'"
          >
            <svg
              class="w-4 h-4 transition-transform duration-200"
              :class="{ 'animate-spin': isRefreshing }"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              stroke-width="2"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M16.023 9.348h4.992M2.985 19.644v-4.992h4.992l-4.993 0 3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182"
              />
            </svg>
          </button>

          <!-- Export -->
          <button
            @click="exportData"
            class="w-9 h-9 inline-flex items-center justify-center rounded-xl text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200"
            title="Export data"
          >
            <svg
              class="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              stroke-width="2"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3"
              />
            </svg>
          </button>
        </div>
      </div>

      <!-- Bottom section: Status and Stats -->
      <div
        class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pt-4 border-t border-gray-200/50 dark:border-gray-700/50"
      >
        <!-- Left: Status indicators -->
        <div class="flex items-center flex-wrap gap-4 text-xs text-gray-500 dark:text-gray-400">
          <div class="flex items-center gap-1.5">
            <div class="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></div>
            <span class="text-emerald-600 dark:text-emerald-400 font-medium">Live</span>
          </div>
          <div class="flex items-center gap-1.5">
            <svg
              class="w-3 h-3"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              stroke-width="2"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span>Updated {{ lastUpdate }}</span>
          </div>
        </div>

        <!-- Right: Stats -->
        <div class="flex items-center gap-6 text-center text-xs">
          <div class="flex items-center gap-1.5">
            <div class="w-2 h-2 bg-blue-500 rounded-full"></div>
            <span class="text-gray-600 dark:text-gray-300">
              <span class="font-semibold text-gray-900 dark:text-gray-100">24</span>
              <span class="ml-1">Sensors</span>
            </span>
          </div>
          <div class="w-px h-4 bg-gray-200 dark:bg-gray-700"></div>
          <div class="flex items-center gap-1.5">
            <div class="w-2 h-2 bg-emerald-500 rounded-full"></div>
            <span class="text-gray-600 dark:text-gray-300">
              <span class="font-semibold text-emerald-600 dark:text-emerald-400">98%</span>
              <span class="ml-1">Uptime</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const props = defineProps({
  lastUpdate: {
    type: String,
    default: '2 minutes ago',
  },
})

const isRefreshing = ref(false)

const refreshData = async () => {
  if (isRefreshing.value) return
  isRefreshing.value = true
  try {
    await new Promise((resolve) => setTimeout(resolve, 2000))
    console.log('Data refreshed.')
  } catch (error) {
    console.error('Failed to refresh data:', error)
  } finally {
    isRefreshing.value = false
  }
}

const exportData = () => {
  console.log('Exporting data...')
}
</script>

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
