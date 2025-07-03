<template>
  <div
    class="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-xl border border-gray-200/50 dark:border-gray-700 shadow-lg shadow-gray-900/5 dark:shadow-gray-900/20 overflow-hidden mb-8"
  >
    <div class="px-4 py-4 sm:px-6 sm:py-6">
      <!-- Header layout -->
      <div class="flex items-start gap-4 min-w-0">
        <!-- Icon -->
        <div class="flex-shrink-0">
          <div
            class="w-12 h-12 bg-amber-100/50 dark:bg-amber-900/30 rounded-2xl flex items-center justify-center ring-1 ring-amber-200/50 dark:ring-amber-700/50"
          >
            <span class="mdi mdi-cog text-2xl text-amber-600 dark:text-amber-400"></span>
          </div>
        </div>

        <!-- Title and description -->
        <div class="min-w-0 flex-1">
          <h1
            class="text-xl sm:text-2xl font-semibold text-gray-900 dark:text-gray-100 tracking-tight"
          >
            System Settings
          </h1>
          <p class="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
            Configure preferences and thresholds
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.animate-spin {
  animation: spin 1s linear infinite;
}
</style>
