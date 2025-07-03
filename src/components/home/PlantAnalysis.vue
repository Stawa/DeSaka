<template>
  <div class="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
    <div class="p-6">
      <!-- Header -->
      <div class="flex items-center gap-3 mb-6">
        <div class="w-10 h-10 bg-emerald-100 dark:bg-emerald-900/30 rounded-xl flex items-center justify-center">
          <svg class="w-5 h-5 text-emerald-600 dark:text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
        </div>
        <div>
          <h2 class="text-xl font-semibold text-gray-900 dark:text-gray-100">
            Plant Growth Analysis
          </h2>
          <p class="text-gray-600 dark:text-gray-400">
            AI-powered insights and recommendations for optimal plant growth
          </p>
        </div>
      </div>

      <!-- Content Grid -->
      <div class="grid lg:grid-cols-2 gap-8">
        <!-- Recommendations Section -->
        <div class="space-y-4">
          <div class="flex items-center gap-2 mb-4">
            <div class="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
              <svg class="w-4 h-4 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <h3 class="font-semibold text-gray-900 dark:text-gray-100">
              Smart Recommendations
            </h3>
          </div>

          <div class="space-y-3">
            <div class="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
              <div class="flex items-start gap-3">
                <div class="w-6 h-6 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
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

            <div class="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
              <div class="flex items-start gap-3">
                <div class="w-6 h-6 bg-amber-100 dark:bg-amber-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
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

            <div class="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
              <div class="flex items-start gap-3">
                <div class="w-6 h-6 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
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
        <div class="space-y-4">
          <div class="flex items-center gap-2 mb-4">
            <div class="w-8 h-8 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
              <svg class="w-4 h-4 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h3 class="font-semibold text-gray-900 dark:text-gray-100">
              Growth Metrics
            </h3>
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div class="p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg border border-emerald-200 dark:border-emerald-800">
              <div class="flex items-center justify-between">
                <div>
                  <div class="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">
                    Growth Rate
                  </div>
                  <div class="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                    +2.3
                  </div>
                  <div class="text-xs text-gray-500 dark:text-gray-400">cm/week</div>
                </div>
                <div class="w-8 h-8 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg flex items-center justify-center">
                  <svg class="w-4 h-4 text-emerald-600 dark:text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 11l5-5m0 0l5 5m-5-5v12" />
                  </svg>
                </div>
              </div>
            </div>

            <div class="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
              <div class="flex items-center justify-between">
                <div>
                  <div class="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">
                    Leaf Count
                  </div>
                  <div class="text-2xl font-bold text-gray-900 dark:text-gray-100">
                    12
                  </div>
                  <div class="text-xs text-gray-500 dark:text-gray-400">leaves</div>
                </div>
                <div class="w-8 h-8 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                  <svg class="w-4 h-4 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                  </svg>
                </div>
              </div>
            </div>

            <div class="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
              <div class="flex items-center justify-between">
                <div>
                  <div class="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">
                    Est. Yield
                  </div>
                  <div class="text-2xl font-bold text-amber-600 dark:text-amber-400">
                    Med
                  </div>
                  <div class="text-xs text-gray-500 dark:text-gray-400">quality</div>
                </div>
                <div class="w-8 h-8 bg-amber-100 dark:bg-amber-900/30 rounded-lg flex items-center justify-center">
                  <svg class="w-4 h-4 text-amber-600 dark:text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                  </svg>
                </div>
              </div>
            </div>

            <div class="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
              <div class="flex items-center justify-between">
                <div>
                  <div class="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">
                    Harvest
                  </div>
                  <div class="text-2xl font-bold text-blue-600 dark:text-blue-400">
                    ~18
                  </div>
                  <div class="text-xs text-gray-500 dark:text-gray-400">days</div>
                </div>
                <div class="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                  <svg class="w-4 h-4 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>