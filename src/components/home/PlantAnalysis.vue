<template>
  <div
    class="bg-white dark:bg-gray-900 rounded-2xl shadow-sm overflow-hidden border border-gray-100 dark:border-gray-700 transition-all duration-500 w-full group"
  >
    <!-- Accent bar with gradient animation -->
    <div
      class="h-1 w-full bg-gradient-to-r from-emerald-400 via-green-500 to-teal-500 accent-bar"
    ></div>

    <div class="p-6 md:p-8">
      <!-- Header -->
      <div class="mb-8">
        <div class="flex items-start">
          <div class="icon-container">
            <span class="mdi mdi-sprout text-emerald-500 text-2xl"></span>
          </div>
          <div class="ml-4">
            <h2
              class="text-xl md:text-2xl font-semibold text-gray-900 dark:text-gray-100 tracking-tight"
            >
              Plant Growth Analysis
            </h2>
            <p class="text-sm text-gray-600 dark:text-gray-400">Lorem ipsum.</p>
          </div>
        </div>
        <p class="mt-2 text-sm text-gray-600 dark:text-gray-400">
          Analyze and optimize the growth of your plants with our comprehensive dashboard.
        </p>
      </div>

      <!-- Recommendations Section -->
      <div class="mb-8">
        <h3 class="text-base font-medium text-gray-700 dark:text-gray-300 mb-4 tracking-wide">
          Growth Recommendations
        </h3>
        <div class="recommendation-card">
          <p class="text-sm text-gray-600 dark:text-gray-400 mb-4 leading-relaxed">
            Based on current sensor readings and historical data, we recommend these actions to
            optimize plant growth:
          </p>
          <div class="space-y-3">
            <div class="recommendation-item success">
              <span class="mdi mdi-check-circle text-emerald-500"></span>
              <span>Maintain current watering schedule for optimal soil moisture levels</span>
            </div>
            <div class="recommendation-item success">
              <span class="mdi mdi-check-circle text-emerald-500"></span>
              <span>Consider adding nitrogen-rich fertilizer within the next 3-5 days</span>
            </div>
            <div class="recommendation-item warning">
              <span class="mdi mdi-alert-circle text-amber-500"></span>
              <span>Monitor air temperature during midday as it approaches upper threshold</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Metrics Grid -->
      <div>
        <h3 class="text-base font-medium text-gray-700 dark:text-gray-300 mb-4 tracking-wide">
          Growth Metrics
        </h3>
        <div class="metrics-grid">
          <div class="metric-card metric-primary">
            <span class="metric-label">Growth Rate</span>
            <span class="metric-value text-emerald-600 dark:text-emerald-400">+2.3 cm/week</span>
          </div>
          <div class="metric-card">
            <span class="metric-label">Leaf Count</span>
            <span class="metric-value text-gray-800 dark:text-gray-200">12 leaves</span>
          </div>
          <div class="metric-card">
            <span class="metric-label">Est. Yield</span>
            <span class="metric-value text-amber-600 dark:text-amber-400">Medium</span>
          </div>
          <div class="metric-card">
            <span class="metric-label">Time to Harvest</span>
            <span class="metric-value text-blue-600 dark:text-blue-400">~18 days</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Accent bar animation */
.accent-bar {
  background-size: 200% 100%;
}

@keyframes shimmer {
  0%,
  100% {
    background-position: 200% 0;
  }
  50% {
    background-position: -200% 0;
  }
}

/* Icon container with subtle hover effect */
.icon-container {
  @apply bg-emerald-50 dark:bg-emerald-900/20 p-3 px-4 rounded-xl transition-all duration-300;
}

/* Recommendation card with glass morphism effect */
.recommendation-card {
  @apply bg-gray-50/50 dark:bg-gray-800/30 rounded-2xl p-5;
  @apply backdrop-blur-sm border border-gray-100/50 dark:border-gray-700/50;
  @apply transition-all duration-300 hover:bg-gray-50 dark:hover:bg-gray-800/50;
}

/* Recommendation items with improved alignment */
.recommendation-item {
  @apply flex items-start text-sm text-gray-600 dark:text-gray-400;
  @apply transition-all duration-200 hover:text-gray-800 dark:hover:text-gray-200;
}

.recommendation-item span:first-child {
  @apply mr-3 mt-0.5 flex-shrink-0 transition-transform duration-200;
}

.recommendation-item:hover span:first-child {
  @apply scale-110;
}

.recommendation-item.success:hover span:first-child {
  @apply text-emerald-600;
}

.recommendation-item.warning:hover span:first-child {
  @apply text-amber-600;
}

/* Metrics grid with improved spacing */
.metrics-grid {
  @apply grid grid-cols-2 lg:grid-cols-4 gap-4;
}

/* Metric cards with subtle hover effects */
.metric-card {
  @apply bg-gray-50/50 dark:bg-gray-800/30 rounded-xl p-4;
  @apply flex flex-col items-center justify-center text-center;
  @apply transition-all duration-300 hover:bg-gray-50 dark:hover:bg-gray-800/50;
  @apply hover:shadow-md hover:-translate-y-0.5;
  @apply border border-gray-100/50 dark:border-gray-700/50;
  @apply backdrop-blur-sm;
}

.metric-card.metric-primary {
  @apply bg-emerald-50/50 dark:bg-emerald-900/10;
  @apply hover:bg-emerald-50 dark:hover:bg-emerald-900/20;
  @apply border-emerald-100/50 dark:border-emerald-800/50;
}

/* Metric text styling */
.metric-label {
  @apply text-xs text-gray-500 dark:text-gray-400 mb-2 font-medium tracking-wide uppercase;
}

.metric-value {
  @apply text-lg md:text-xl font-semibold tracking-tight;
  @apply transition-all duration-200;
}

.metric-card:hover .metric-value {
  @apply scale-105;
}

/* Responsive improvements */
@media (max-width: 640px) {
  .metrics-grid {
    @apply grid-cols-2 gap-3;
  }

  .metric-card {
    @apply p-3;
  }

  .metric-value {
    @apply text-base;
  }
}

/* Dark mode enhancements */
@media (prefers-color-scheme: dark) {
  .accent-bar {
    opacity: 0.8;
  }
}

/* Smooth transitions for all interactive elements */
* {
  @apply transition-colors duration-200;
}
</style>
