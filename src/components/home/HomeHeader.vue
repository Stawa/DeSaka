<template>
  <div class="relative overflow-hidden">
    <!-- Background decoration -->
    <div class="absolute inset-0 bg-gradient-to-br from-primary-50/50 via-white to-secondary-50/50 dark:from-primary-950/20 dark:via-gray-900 dark:to-secondary-950/20 rounded-3xl"></div>
    <div class="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-primary-100/30 to-transparent dark:from-primary-900/10 rounded-full blur-3xl"></div>
    
    <div class="relative card card-glass border-0 shadow-large">
      <div class="p-6 lg:p-8">
        <!-- Main header layout -->
        <div class="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <!-- Left: Icon and Title -->
          <div class="flex items-start gap-6">
            <div class="flex-shrink-0 relative">
              <div class="w-16 h-16 lg:w-20 lg:h-20 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center shadow-xl shadow-emerald-500/25 animate-float">
                <svg class="w-8 h-8 lg:w-10 lg:h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.5">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
                </svg>
              </div>
              <div class="absolute -inset-2 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl blur opacity-20 animate-pulse"></div>
            </div>

            <div class="min-w-0 flex-1">
              <h1 class="text-2xl lg:text-4xl font-bold text-gray-900 dark:text-gray-100 tracking-tight mb-2">
                Environmental Dashboard
              </h1>
              <p class="text-base lg:text-lg text-gray-600 dark:text-gray-400 text-balance">
                Real-time monitoring and analytics for your plant growth environment
              </p>
            </div>
          </div>

          <!-- Right: Action buttons -->
          <div class="flex items-center gap-3 flex-shrink-0">
            <!-- Refresh -->
            <button
              @click="refreshData"
              class="btn btn-secondary btn-sm group relative overflow-hidden"
              :class="{ 'opacity-50 cursor-not-allowed': isRefreshing }"
              :disabled="isRefreshing"
              :title="isRefreshing ? 'Refreshing...' : 'Refresh data'"
            >
              <div class="absolute inset-0 bg-gradient-to-r from-primary-500 to-secondary-500 opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
              <svg
                class="w-4 h-4 transition-transform duration-300 relative z-10"
                :class="{ 'animate-spin': isRefreshing }"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                stroke-width="2"
              >
                <path stroke-linecap="round" stroke-linejoin="round" d="M16.023 9.348h4.992M2.985 19.644v-4.992h4.992l-4.993 0 3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182" />
              </svg>
              <span class="relative z-10">{{ isRefreshing ? 'Refreshing...' : 'Refresh' }}</span>
            </button>

            <!-- Export -->
            <button
              @click="exportData"
              class="btn btn-primary btn-sm group relative overflow-hidden"
              title="Export data"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
              </svg>
              <span>Export</span>
            </button>
          </div>
        </div>

        <!-- Bottom section: Status and Stats -->
        <div class="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 pt-6 mt-6 border-t border-gray-200/50 dark:border-gray-700/50">
          <!-- Left: Status indicators -->
          <div class="flex items-center flex-wrap gap-6 text-sm">
            <div class="flex items-center gap-2.5">
              <div class="relative">
                <div class="w-3 h-3 bg-emerald-500 rounded-full animate-pulse"></div>
                <div class="absolute inset-0 w-3 h-3 bg-emerald-500 rounded-full animate-ping opacity-20"></div>
              </div>
              <span class="font-semibold text-emerald-600 dark:text-emerald-400">Live Monitoring</span>
            </div>
            <div class="flex items-center gap-2.5 text-gray-600 dark:text-gray-400">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>Updated {{ lastUpdate }}</span>
            </div>
          </div>

          <!-- Right: Stats -->
          <div class="flex items-center gap-8">
            <div class="flex items-center gap-2.5">
              <div class="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                <svg class="w-4 h-4 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <div class="text-center">
                <div class="text-lg font-bold text-gray-900 dark:text-gray-100">24</div>
                <div class="text-xs text-gray-500 dark:text-gray-400">Sensors</div>
              </div>
            </div>
            
            <div class="w-px h-8 bg-gray-200 dark:bg-gray-700"></div>
            
            <div class="flex items-center gap-2.5">
              <div class="w-8 h-8 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg flex items-center justify-center">
                <svg class="w-4 h-4 text-emerald-600 dark:text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div class="text-center">
                <div class="text-lg font-bold text-emerald-600 dark:text-emerald-400">98%</div>
                <div class="text-xs text-gray-500 dark:text-gray-400">Uptime</div>
              </div>
            </div>
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