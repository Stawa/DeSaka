<template>
  <div
    class="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-2xl border border-gray-200/60 dark:border-gray-800/60 shadow-sm overflow-hidden"
  >
    <!-- Accent Bar -->
    <div class="h-1 bg-gradient-to-r from-rose-500 to-pink-600"></div>

    <div class="p-6">
      <!-- Header Section -->
      <div class="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
        <!-- Icon + Title -->
        <div class="flex items-start gap-4">
          <div class="flex-shrink-0 relative">
            <!-- Icon background glow -->
            <div
              class="w-14 h-14 bg-gradient-to-br from-rose-100 to-pink-50 dark:from-rose-900/30 dark:to-pink-800/20 rounded-2xl flex items-center justify-center ring-1 ring-rose-200/50 dark:ring-rose-700/30"
            >
              <span
                class="mdi mdi-chart-timeline-variant text-2xl text-rose-600 dark:text-rose-400"
              ></span>
            </div>
            <div class="absolute inset-0 bg-rose-500/20 rounded-2xl blur-xl opacity-30"></div>
          </div>

          <div>
            <h1 class="text-2xl lg:text-3xl font-semibold text-gray-900 dark:text-gray-100">
              Historical Data
            </h1>
            <p class="text-gray-600 dark:text-gray-400 mt-1 text-base">
              Analyze sensor trends and patterns over time with comprehensive historical data
              visualization
            </p>
            <div class="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mt-2">
              <span class="mdi mdi-calendar-range"></span>
              <span>
                {{ new Date(dateRange.start).toLocaleDateString() }} -
                {{ new Date(dateRange.end).toLocaleDateString() }}
              </span>
            </div>
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="flex items-center gap-3">
          <!-- Export -->
          <button
            @click="handleExport"
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
    </div>
  </div>
</template>

<script setup lang="ts">
const emit = defineEmits(['export'])

defineProps<{
  dateRange: {
    start: string | number | Date
    end: string | number | Date
  }
}>()

const handleExport = () => {
  emit('export')
}
</script>
