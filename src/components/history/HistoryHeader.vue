<template>
  <div
    class="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-xl border border-gray-200/50 dark:border-gray-700 shadow-lg shadow-gray-900/5 dark:shadow-gray-900/20 overflow-hidden mb-8"
  >
    <div class="px-4 py-4 sm:px-6 sm:py-6">
      <!-- Header layout -->
      <div class="flex items-start justify-between gap-4">
        <!-- Icon + Title -->
        <div class="flex items-start gap-4 min-w-0">
          <div class="flex-shrink-0">
            <div
              class="w-12 h-12 bg-rose-100/50 dark:bg-rose-900/30 rounded-2xl flex items-center justify-center ring-1 ring-rose-200/50 dark:ring-rose-700/50"
            >
              <span class="mdi mdi-chart-line text-2xl text-rose-600 dark:text-rose-400"></span>
            </div>
          </div>
          <div class="min-w-0 flex-1">
            <h1
              class="text-xl sm:text-2xl font-semibold text-gray-900 dark:text-gray-100 tracking-tight"
            >
              Historical Data
            </h1>
            <p class="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
              View and analyze historical sensor data
            </p>
          </div>
        </div>

        <!-- Export Button -->
        <div class="flex-shrink-0">
          <button
            @click="showExportModal = true"
            class="inline-flex items-center gap-1.5 px-3 h-9 rounded-xl text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200 text-sm font-medium"
          >
            <span class="mdi mdi-download text-lg"></span>
            <span>Export</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const showExportModal = ref(false)
</script>
