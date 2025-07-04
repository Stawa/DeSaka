<template>
  <div class="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden relative">
    <!-- Animated gradient accent bar -->
    <div class="h-1 bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 animate-gradient-x"></div>
    
    <div class="p-6 lg:p-8">
      <!-- Main header layout -->
      <div class="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
        <!-- Left: Icon and Title with enhanced styling -->
        <div class="flex items-start gap-5">
          <div class="flex-shrink-0 relative group">
            <!-- Main icon container with glassmorphism effect -->
            <div class="w-16 h-16 bg-gradient-to-br from-emerald-100 via-emerald-50 to-teal-50 dark:from-emerald-900/40 dark:via-emerald-800/30 dark:to-teal-800/20 rounded-2xl flex items-center justify-center ring-1 ring-emerald-200/50 dark:ring-emerald-700/30 backdrop-blur-sm transition-all duration-300 group-hover:scale-105 group-hover:shadow-lg group-hover:shadow-emerald-500/20">
              <svg class="w-8 h-8 text-emerald-600 dark:text-emerald-400 transition-transform duration-300 group-hover:rotate-12" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
              </svg>
            </div>
            <!-- Floating glow effect -->
            <div class="absolute inset-0 bg-emerald-500/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10"></div>
          </div>

          <div>
            <h1 class="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white tracking-tight bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 dark:from-white dark:via-gray-100 dark:to-white bg-clip-text">
              Environmental Dashboard
            </h1>
            <p class="text-gray-600 dark:text-gray-400 mt-1.5 text-base font-medium">
              Real-time monitoring and analytics for optimal plant growth
            </p>
          </div>
        </div>

        <!-- Right: Enhanced action buttons -->
        <div class="flex items-center gap-3">
          <!-- Refresh button with modern styling -->
          <button
            @click="refreshData"
            class="group inline-flex items-center gap-2.5 px-5 py-3 text-sm font-semibold text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-gray-400 dark:hover:border-gray-500 transition-all duration-200 shadow-sm hover:shadow-md transform hover:scale-[1.02] active:scale-[0.98] focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
            :class="{ 'opacity-50 cursor-not-allowed pointer-events-none': isRefreshing }"
            :disabled="isRefreshing"
          >
            <svg
              class="w-4 h-4 transition-transform duration-200"
              :class="{ 'animate-spin': isRefreshing, 'group-hover:rotate-180': !isRefreshing }"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              stroke-width="2"
            >
              <path stroke-linecap="round" stroke-linejoin="round" d="M16.023 9.348h4.992M2.985 19.644v-4.992h4.992l-4.993 0 3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182" />
            </svg>
            <span>{{ isRefreshing ? 'Refreshing...' : 'Refresh' }}</span>
          </button>

          <!-- Export button with gradient styling -->
          <button
            @click="exportData"
            class="group inline-flex items-center gap-2.5 px-5 py-3 text-sm font-semibold text-white bg-gradient-to-r from-emerald-600 via-emerald-600 to-teal-600 hover:from-emerald-700 hover:via-emerald-700 hover:to-teal-700 rounded-xl transition-all duration-200 shadow-sm hover:shadow-lg hover:shadow-emerald-500/25 transform hover:scale-[1.02] active:scale-[0.98] focus:ring-2 focus:ring-emerald-500/50 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-gray-900"
          >
            <svg class="w-4 h-4 transition-transform duration-200 group-hover:translate-y-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
            </svg>
            <span>Export</span>
          </button>
        </div>
      </div>

      <!-- Enhanced bottom section with modern metrics -->
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 pt-8 mt-8 border-t border-gray-200 dark:border-gray-700">
        <!-- Left: Enhanced status indicators -->
        <div class="flex items-center gap-6 text-sm">
          <div class="flex items-center gap-3">
            <div class="relative">
              <div class="w-3 h-3 bg-emerald-500 rounded-full shadow-sm"></div>
              <div class="absolute inset-0 w-3 h-3 bg-emerald-500 rounded-full animate-ping opacity-75"></div>
            </div>
            <span class="font-semibold text-emerald-600 dark:text-emerald-400">Live Monitoring</span>
          </div>
          <div class="flex items-center gap-2.5 text-gray-600 dark:text-gray-400">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span class="font-medium">Updated {{ lastUpdate }}</span>
          </div>
        </div>

        <!-- Right: Enhanced stats with modern cards -->
        <div class="flex items-center gap-6">
          <!-- Active Sensors Card -->
          <div class="flex items-center gap-4 px-4 py-3 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl border border-blue-200/50 dark:border-blue-700/30">
            <div class="w-10 h-10 bg-gradient-to-br from-blue-100 to-blue-50 dark:from-blue-900/40 dark:to-blue-800/30 rounded-xl flex items-center justify-center ring-1 ring-blue-200/50 dark:ring-blue-700/30">
              <svg class="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <div>
              <div class="text-xl font-bold text-gray-900 dark:text-white">6</div>
              <div class="text-xs text-gray-500 dark:text-gray-400 font-semibold uppercase tracking-wide">Active Sensors</div>
            </div>
          </div>
          
          <!-- System Health Card -->
          <div class="flex items-center gap-4 px-4 py-3 bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 rounded-xl border border-emerald-200/50 dark:border-emerald-700/30">
            <div class="w-10 h-10 bg-gradient-to-br from-emerald-100 to-emerald-50 dark:from-emerald-900/40 dark:to-emerald-800/30 rounded-xl flex items-center justify-center ring-1 ring-emerald-200/50 dark:ring-emerald-700/30">
              <svg class="w-5 h-5 text-emerald-600 dark:text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <div class="text-xl font-bold text-emerald-600 dark:text-emerald-400">98%</div>
              <div class="text-xs text-gray-500 dark:text-gray-400 font-semibold uppercase tracking-wide">System Health</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Subtle background pattern -->
    <div class="absolute inset-0 opacity-[0.02] dark:opacity-[0.05] pointer-events-none">
      <div class="absolute inset-0" style="background-image: radial-gradient(circle at 1px 1px, rgba(0,0,0,0.15) 1px, transparent 0); background-size: 20px 20px;"></div>
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
@keyframes gradient-x {
  0%, 100% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
}

.animate-gradient-x {
  background-size: 200% 200%;
  animation: gradient-x 3s ease infinite;
}

/* Enhanced hover effects */
.group:hover .group-hover\:rotate-12 {
  transform: rotate(12deg);
}

.group:hover .group-hover\:rotate-180 {
  transform: rotate(180deg);
}

.group:hover .group-hover\:translate-y-0\.5 {
  transform: translateY(2px);
}

/* Smooth transitions for all elements */
* {
  transition-property: all;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 200ms;
}

/* Focus states for accessibility */
button:focus {
  outline: none;
}

/* Custom scrollbar for consistency */
::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}

::-webkit-scrollbar-track {
  background: transparent;
}

::-webkit-scrollbar-thumb {
  background: rgba(156, 163, 175, 0.5);
  border-radius: 3px;
}

::-webkit-scrollbar-thumb:hover {
  background: rgba(107, 114, 128, 0.7);
}

.dark ::-webkit-scrollbar-thumb {
  background: rgba(75, 85, 99, 0.5);
}

.dark ::-webkit-scrollbar-thumb:hover {
  background: rgba(107, 114, 128, 0.7);
}
</style>
</script>