<template>
  <div class="relative overflow-hidden">
    <!-- Background decoration -->
    <div class="absolute inset-0 bg-gradient-to-br from-emerald-50/50 via-white to-teal-50/50 dark:from-emerald-950/20 dark:via-gray-900 dark:to-teal-950/20 rounded-3xl"></div>
    <div class="absolute top-0 left-0 w-96 h-96 bg-gradient-to-br from-emerald-100/30 to-transparent dark:from-emerald-900/10 rounded-full blur-3xl"></div>
    
    <div class="relative card card-glass border-0 shadow-large">
      <!-- Accent bar -->
      <div class="h-1.5 w-full bg-gradient-to-r from-emerald-400 via-green-500 to-teal-500 rounded-t-2xl"></div>

      <div class="p-6 lg:p-8">
        <!-- Header -->
        <div class="mb-8">
          <div class="flex items-start gap-6">
            <div class="flex-shrink-0 relative">
              <div class="w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center shadow-xl shadow-emerald-500/25 animate-float">
                <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.5">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636a9 9 0 1012.728 0z" />
                </svg>
              </div>
              <div class="absolute -inset-2 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl blur opacity-20 animate-pulse"></div>
            </div>
            <div>
              <h2 class="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-gray-100 tracking-tight mb-2">
                Plant Growth Analysis
              </h2>
              <p class="text-base lg:text-lg text-gray-600 dark:text-gray-400 text-balance">
                AI-powered insights and recommendations for optimal plant growth
              </p>
            </div>
          </div>
        </div>

        <!-- Content Grid -->
        <div class="grid lg:grid-cols-2 gap-8 lg:gap-12">
          <!-- Recommendations Section -->
          <div class="space-y-6">
            <div class="flex items-center gap-3 mb-6">
              <div class="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center">
                <svg class="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <h3 class="text-xl font-bold text-gray-900 dark:text-gray-100">
                Smart Recommendations
              </h3>
            </div>

            <div class="space-y-4">
              <div class="recommendation-card group">
                <div class="flex items-start gap-4">
                  <div class="w-8 h-8 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-200">
                    <svg class="w-4 h-4 text-emerald-600 dark:text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div class="flex-1">
                    <h4 class="font-semibold text-gray-900 dark:text-gray-100 mb-1">
                      Optimal Watering Schedule
                    </h4>
                    <p class="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                      Current soil moisture levels are ideal. Maintain your watering schedule for optimal plant health.
                    </p>
                  </div>
                </div>
              </div>

              <div class="recommendation-card group">
                <div class="flex items-start gap-4">
                  <div class="w-8 h-8 bg-amber-100 dark:bg-amber-900/30 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-200">
                    <svg class="w-4 h-4 text-amber-600 dark:text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div class="flex-1">
                    <h4 class="font-semibold text-gray-900 dark:text-gray-100 mb-1">
                      Nutrient Enhancement
                    </h4>
                    <p class="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                      Consider adding nitrogen-rich fertilizer within the next 3-5 days to boost growth.
                    </p>
                  </div>
                </div>
              </div>

              <div class="recommendation-card group">
                <div class="flex items-start gap-4">
                  <div class="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-200">
                    <svg class="w-4 h-4 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div class="flex-1">
                    <h4 class="font-semibold text-gray-900 dark:text-gray-100 mb-1">
                      Temperature Monitoring
                    </h4>
                    <p class="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                      Monitor air temperature during midday as it approaches the upper threshold.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Metrics Section -->
          <div class="space-y-6">
            <div class="flex items-center gap-3 mb-6">
              <div class="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-xl flex items-center justify-center">
                <svg class="w-5 h-5 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 class="text-xl font-bold text-gray-900 dark:text-gray-100">
                Growth Metrics
              </h3>
            </div>

            <div class="grid grid-cols-2 gap-4">
              <div class="metric-card metric-primary group">
                <div class="flex items-center justify-between">
                  <div>
                    <div class="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-2">
                      Growth Rate
                    </div>
                    <div class="text-2xl font-black text-emerald-600 dark:text-emerald-400 group-hover:scale-105 transition-transform duration-200">
                      +2.3
                    </div>
                    <div class="text-xs text-gray-500 dark:text-gray-400">cm/week</div>
                  </div>
                  <div class="w-10 h-10 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg flex items-center justify-center">
                    <svg class="w-5 h-5 text-emerald-600 dark:text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 11l5-5m0 0l5 5m-5-5v12" />
                    </svg>
                  </div>
                </div>
              </div>

              <div class="metric-card group">
                <div class="flex items-center justify-between">
                  <div>
                    <div class="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-2">
                      Leaf Count
                    </div>
                    <div class="text-2xl font-black text-gray-800 dark:text-gray-200 group-hover:scale-105 transition-transform duration-200">
                      12
                    </div>
                    <div class="text-xs text-gray-500 dark:text-gray-400">leaves</div>
                  </div>
                  <div class="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                    <svg class="w-5 h-5 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                    </svg>
                  </div>
                </div>
              </div>

              <div class="metric-card group">
                <div class="flex items-center justify-between">
                  <div>
                    <div class="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-2">
                      Est. Yield
                    </div>
                    <div class="text-2xl font-black text-amber-600 dark:text-amber-400 group-hover:scale-105 transition-transform duration-200">
                      Med
                    </div>
                    <div class="text-xs text-gray-500 dark:text-gray-400">quality</div>
                  </div>
                  <div class="w-10 h-10 bg-amber-100 dark:bg-amber-900/30 rounded-lg flex items-center justify-center">
                    <svg class="w-5 h-5 text-amber-600 dark:text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                    </svg>
                  </div>
                </div>
              </div>

              <div class="metric-card group">
                <div class="flex items-center justify-between">
                  <div>
                    <div class="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-2">
                      Harvest
                    </div>
                    <div class="text-2xl font-black text-blue-600 dark:text-blue-400 group-hover:scale-105 transition-transform duration-200">
                      ~18
                    </div>
                    <div class="text-xs text-gray-500 dark:text-gray-400">days</div>
                  </div>
                  <div class="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                    <svg class="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
  </div>
</template>

<style scoped>
/* Recommendation cards with enhanced styling */
.recommendation-card {
  @apply p-5 bg-white/60 dark:bg-gray-800/40 backdrop-blur-sm border border-gray-200/60 dark:border-gray-700/60 rounded-2xl transition-all duration-300 hover:bg-white/80 dark:hover:bg-gray-800/60 hover:shadow-lg hover:shadow-gray-900/5 dark:hover:shadow-gray-950/20 hover:-translate-y-0.5;
}

/* Metric cards with improved design */
.metric-card {
  @apply p-5 bg-white/60 dark:bg-gray-800/40 backdrop-blur-sm border border-gray-200/60 dark:border-gray-700/60 rounded-2xl transition-all duration-300 hover:bg-white/80 dark:hover:bg-gray-800/60 hover:shadow-lg hover:shadow-gray-900/5 dark:hover:shadow-gray-950/20 hover:-translate-y-0.5;
}

.metric-card.metric-primary {
  @apply bg-emerald-50/60 dark:bg-emerald-900/20 border-emerald-200/60 dark:border-emerald-800/60 hover:bg-emerald-50/80 dark:hover:bg-emerald-900/30;
}

/* Enhanced animations */
@keyframes float {
  0%, 100% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-6px);
  }
}

.animate-float {
  animation: float 3s ease-in-out infinite;
}
</style>