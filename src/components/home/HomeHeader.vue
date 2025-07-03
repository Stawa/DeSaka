<template>
  <div class="card">
    <div class="p-6 lg:p-8">
      <!-- Main header layout -->
      <div class="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
        <!-- Left: Icon and Title -->
        <div class="flex items-start gap-4">
          <div class="flex-shrink-0">
            <div class="w-14 h-14 lg:w-16 lg:h-16 bg-primary-500 rounded-xl flex items-center justify-center">
              <svg class="w-7 h-7 lg:w-8 lg:h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
              </svg>
            </div>
          </div>

          <div class="min-w-0 flex-1">
            <h1 class="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
              Environmental Dashboard
            </h1>
            <p class="text-base text-gray-600 dark:text-gray-400">
              Real-time monitoring and analytics for your plant growth environment
            </p>
          </div>
        </div>

        <!-- Right: Action buttons -->
        <div class="flex items-center gap-3 flex-shrink-0">
          <!-- Refresh -->
          <button
            @click="refreshData"
            class="btn btn-secondary"
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
              <path stroke-linecap="round" stroke-linejoin="round" d="M16.023 9.348h4.992M2.985 19.644v-4.992h4.992l-4.993 0 3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182" />
            </svg>
            {{ isRefreshing ? 'Refreshing...' : 'Refresh' }}
          </button>

          <!-- Export -->
          <button
            @click="exportData"
            class="btn btn-primary"
            title="Export data"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
            </svg>
            Export
          </button>
        </div>
      </div>

      <!-- Bottom section: Status and Stats -->
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pt-6 mt-6 border-t border-gray-200 dark:border-gray-700">
        <!-- Left: Status indicators -->
        <div class="flex items-center flex-wrap gap-6 text-sm">
          <div class="flex items-center gap-2">
            <div class="w-2 h-2 bg-emerald-500 rounded-full"></div>
            <span class="font-medium text-emerald-600 dark:text-emerald-400">Live Monitoring</span>
          </div>
          <div class="flex items-center gap-2 text-gray-600 dark:text-gray-400">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>Updated {{ lastUpdate }}</span>
          </div>
        </div>

        <!-- Right: Stats -->
        <div class="flex items-center gap-6">
          <div class="text-center">
            <div class="text-lg font-bold text-gray-900 dark:text-gray-100">24</div>
            <div class="text-xs text-gray-500 dark:text-gray-400">Sensors</div>
          </div>
          
          <div class="w-px h-6 bg-gray-300 dark:bg-gray-600"></div>
          
          <div class="text-center">
            <div class="text-lg font-bold text-emerald-600 dark:text-emerald-400">98%</div>
            <div class="text-xs text-gray-500 dark:text-gray-400">Uptime</div>
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