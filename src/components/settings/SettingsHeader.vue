<template>
  <div class="relative overflow-hidden mb-8">
    <!-- Background gradient -->
    <div
      class="absolute inset-0 bg-gradient-to-r from-emerald-500/10 to-teal-500/10 rounded-2xl"
    ></div>

    <!-- Main header card -->
    <div
      class="relative bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-2xl border border-gray-200/50 dark:border-gray-700/50 shadow-xl"
    >
      <!-- Gradient accent bar -->
      <div class="h-1 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500"></div>

      <div class="p-6 sm:p-8">
        <div class="flex items-start gap-6">
          <!-- Enhanced icon with glow effect -->
          <div class="relative flex-shrink-0">
            <div class="absolute inset-0 bg-emerald-500/20 rounded-2xl blur-xl"></div>
            <div
              class="relative w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center shadow-lg transform hover:scale-105 transition-transform duration-200"
            >
              <span class="mdi mdi-cog text-2xl text-white"></span>
            </div>
          </div>

          <!-- Title and description -->
          <div class="flex-1 min-w-0">
            <div class="flex items-center gap-3 mb-2">
              <h1 class="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
                System Settings
              </h1>
              <!-- Status indicator -->
              <div class="flex items-center gap-2">
                <div class="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                <span class="text-sm text-emerald-600 dark:text-emerald-400 font-medium">
                  Active
                </span>
              </div>
            </div>

            <p class="text-gray-600 dark:text-gray-400 text-lg mb-4 leading-relaxed">
              Configure your system preferences, sensor thresholds, and notification settings to
              optimize your monitoring experience
            </p>

            <!-- Additional info -->
            <div class="flex flex-wrap items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
              <div class="flex items-center gap-2">
                <span class="mdi mdi-clock-outline"></span>
                <span>Last updated: {{ formatDate(new Date()) }}</span>
              </div>
              <div class="flex items-center gap-2">
                <span class="mdi mdi-shield-check-outline"></span>
                <span>All systems operational</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
const formatDate = (date) => {
  return date.toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}
</script>

<style scoped>
/* Smooth animations */
.transform {
  transition: transform 0.2s ease-in-out;
}

/* Enhanced glow effect */
.relative::before {
  content: '';
  position: absolute;
  inset: -2px;
  background: linear-gradient(45deg, transparent, rgba(16, 185, 129, 0.1), transparent);
  border-radius: inherit;
  z-index: -1;
}
</style>
