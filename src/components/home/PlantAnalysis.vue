<template>
  <div class="card">
    <!-- Header -->
    <div class="px-6 py-5 border-b border-gray-200 dark:border-gray-700">
      <div class="flex items-center gap-4">
        <div class="w-10 h-10 bg-primary-500 rounded-lg flex items-center justify-center">
          <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636a9 9 0 1012.728 0z" />
          </svg>
        </div>
        <div>
          <h2 class="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Plant Growth Analysis
          </h2>
          <p class="text-sm text-gray-600 dark:text-gray-400">
            AI-powered insights and recommendations for optimal plant growth
          </p>
        </div>
      </div>
    </div>

    <div class="p-6">
      <!-- Content Grid -->
      <div class="grid lg:grid-cols-2 gap-8">
        <!-- Recommendations Section -->
        <div class="space-y-6">
          <h3 class="text-base font-semibold text-gray-900 dark:text-gray-100 mb-4">
            Smart Recommendations
          </h3>

          <div class="space-y-4">
            <div class="p-4 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-lg">
              <div class="flex items-start gap-3">
                <div class="w-6 h-6 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                  <svg class="w-3 h-3 text-emerald-600 dark:text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div>
                  <h4 class="font-medium text-gray-900 dark:text-gray-100 mb-1">
                    Optimal Watering Schedule
                  </h4>
                  <p class="text-sm text-gray-600 dark:text-gray-400">
                    Current soil moisture levels are ideal. Maintain your watering schedule for optimal plant health.
                  </p>
                </div>
              </div>
            </div>

            <div class="p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
              <div class="flex items-start gap-3">
                <div class="w-6 h-6 bg-amber-100 dark:bg-amber-900/30 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                  <svg class="w-3 h-3 text-amber-600 dark:text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <h4 class="font-medium text-gray-900 dark:text-gray-100 mb-1">
                    Nutrient Enhancement
                  </h4>
                  <p class="text-sm text-gray-600 dark:text-gray-400">
                    Consider adding nitrogen-rich fertilizer within the next 3-5 days to boost growth.
                  </p>
                </div>
              </div>
            </div>

            <div class="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
              <div class="flex items-start gap-3">
                <div class="w-6 h-6 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                  <svg class="w-3 h-3 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <h4 class="font-medium text-gray-900 dark:text-gray-100 mb-1">
                    Temperature Monitoring
                  </h4>
                  <p class="text-sm text-gray-600 dark:text-gray-400">
                    Monitor air temperature during midday as it approaches the upper threshold.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Metrics Section -->
        <div class="space-y-6">
          <h3 class="text-base font-semibold text-gray-900 dark:text-gray-100 mb-4">
            Growth Metrics
          </h3>

          <div class="grid grid-cols-2 gap-4">
            <div class="p-4 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-lg">
              <div class="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">
                Growth Rate
              </div>
              <div class="text-xl font-bold text-emerald-600 dark:text-emerald-400">
                +2.3
              </div>
              <div class="text-xs text-gray-500 dark:text-gray-400">cm/week</div>
            </div>

            <div class="p-4 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-lg">
              <div class="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">
                Leaf Count
              </div>
              <div class="text-xl font-bold text-gray-800 dark:text-gray-200">
                12
              </div>
              <div class="text-xs text-gray-500 dark:text-gray-400">leaves</div>
            </div>

            <div class="p-4 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-lg">
              <div class="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">
                Est. Yield
              </div>
              <div class="text-xl font-bold text-amber-600 dark:text-amber-400">
                Medium
              </div>
              <div class="text-xs text-gray-500 dark:text-gray-400">quality</div>
            </div>

            <div class="p-4 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-lg">
              <div class="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">
                Harvest
              </div>
              <div class="text-xl font-bold text-blue-600 dark:text-blue-400">
                ~18
              </div>
              <div class="text-xs text-gray-500 dark:text-gray-400">days</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>