<template>
  <div
    class="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-2xl border border-gray-200/60 dark:border-gray-800/60 shadow-sm overflow-hidden"
  >
    <!-- Subtle accent bar -->
    <div class="h-1 bg-gradient-to-r from-emerald-500 to-teal-600"></div>

    <div class="p-6">
      <!-- Main header layout -->
      <div class="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
        <!-- Left: Icon and Title -->
        <div class="flex items-start gap-4">
          <div class="flex-shrink-0 relative">
            <div
              class="w-14 h-14 bg-gradient-to-br from-emerald-100 to-emerald-50 dark:from-emerald-900/30 dark:to-emerald-800/20 rounded-2xl flex items-center justify-center ring-1 ring-emerald-200/50 dark:ring-emerald-700/30"
            >
              <svg
                class="w-7 h-7 text-emerald-600 dark:text-emerald-400"
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
            <!-- Subtle glow effect -->
            <div class="absolute inset-0 bg-emerald-500/20 rounded-2xl blur-xl opacity-30"></div>
          </div>

          <div>
            <h1
              class="text-2xl lg:text-3xl font-semibold text-gray-900 dark:text-gray-100 tracking-tight"
            >
              Environmental Dashboard
            </h1>
            <p class="text-gray-600 dark:text-gray-400 mt-1 text-base">
              Real-time monitoring and analytics for optimal plant growth
            </p>
          </div>
        </div>

        <!-- Right: Action buttons -->
        <div class="flex items-center gap-3">
          <!-- Refresh -->
          <button
            @click="refreshData"
            class="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-gray-400 dark:hover:border-gray-500 transition-all duration-200 shadow-sm hover:shadow-md"
            :class="{ 'opacity-50 cursor-not-allowed': isRefreshing }"
            :disabled="isRefreshing"
          >
            <svg
              class="w-4 h-4"
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
            {{ isRefreshing ? 'Refreshing...' : 'Refresh' }}
          </button>

          <!-- Export -->
          <button
            @click="exportData"
            class="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-gray-400 dark:hover:border-gray-500 transition-all duration-200 shadow-sm hover:shadow-md"
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
            Export
          </button>
        </div>
      </div>

      <!-- Bottom section: Status and Stats -->
      <div
        class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pt-6 mt-6 border-t border-gray-200 dark:border-gray-700"
      >
        <!-- Left: status -->
        <div class="flex items-center gap-6 text-sm">
          <div class="flex items-center gap-2 text-gray-600 dark:text-gray-400">
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
                d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span>Updated {{ lastUpdate }}</span>
          </div>
        </div>

        <!-- Right: Stats -->
        <div class="flex items-center gap-6">
          <div class="flex items-center gap-3">
            <div
              class="w-10 h-10 bg-gradient-to-br from-blue-100 to-blue-50 dark:from-blue-900/30 dark:to-blue-800/20 rounded-xl flex items-center justify-center ring-1 ring-blue-200/50 dark:ring-blue-700/30"
            >
              <svg
                class="w-5 h-5 text-blue-600 dark:text-blue-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                />
              </svg>
            </div>
            <div>
              <div class="text-lg font-semibold text-gray-900 dark:text-gray-100">
                {{ totalSensor }}
              </div>
              <div class="text-xs text-gray-500 dark:text-gray-400 font-medium">Active Sensors</div>
            </div>
          </div>

          <div class="w-px h-10 bg-gray-200 dark:bg-gray-700"></div>

          <div class="flex items-center gap-3">
            <div
              :class="[
                'w-10 h-10 rounded-xl flex items-center justify-center ring-1',
                isUp
                  ? 'bg-gradient-to-br from-emerald-100 to-emerald-50 dark:from-emerald-900/30 dark:to-emerald-800/20 ring-emerald-200/50 dark:ring-emerald-700/30'
                  : 'bg-gradient-to-br from-red-100 to-red-50 dark:from-red-900/30 dark:to-red-800/20 ring-red-200/50 dark:ring-red-700/30',
              ]"
            >
              <!-- Green check when up -->
              <svg
                v-if="isUp"
                class="w-5 h-5 text-emerald-600 dark:text-emerald-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>

              <!-- Red power symbol when down -->
              <svg
                v-else
                class="w-5 h-5 text-red-600 dark:text-red-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M12 2v10M5.64 5.64a9 9 0 1012.72 0"
                />
              </svg>
            </div>
            <div>
              <div class="text-lg font-semibold text-emerald-600 dark:text-emerald-400">
                {{ uptime }}%
              </div>
              <div class="text-xs text-gray-500 dark:text-gray-400 font-medium">System Health</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  lastUpdate: {
    type: String,
    default: '2 minutes ago',
  },
  uptime: {
    type: Number,
    default: 0,
  },
  isUp: {
    type: Boolean,
    default: true,
  },
  totalSensor: {
    type: Number,
    default: 0,
  },
  isRefreshing: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['export', 'refresh'])

const refreshData = async () => {
  if (!props.isRefreshing) {
    emit('refresh')
  }
}

const exportData = () => {
  emit('export')
}
</script>
