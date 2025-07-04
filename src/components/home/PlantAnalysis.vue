<template>
  <div class="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden relative">
    <!-- Animated gradient accent bar -->
    <div class="h-1 bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 animate-gradient-x"></div>
    
    <div class="p-6 lg:p-8">
      <!-- Enhanced header with modern styling -->
      <div class="flex items-center gap-5 mb-8">
        <div class="relative group">
          <div class="w-14 h-14 bg-gradient-to-br from-emerald-100 via-emerald-50 to-teal-50 dark:from-emerald-900/40 dark:via-emerald-800/30 dark:to-teal-800/20 rounded-2xl flex items-center justify-center ring-1 ring-emerald-200/50 dark:ring-emerald-700/30 backdrop-blur-sm transition-all duration-300 group-hover:scale-105 group-hover:shadow-lg group-hover:shadow-emerald-500/20">
            <svg class="w-7 h-7 text-emerald-600 dark:text-emerald-400 transition-transform duration-300 group-hover:rotate-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
          </div>
          <div class="absolute inset-0 bg-emerald-500/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10"></div>
        </div>
        <div>
          <h2 class="text-2xl font-bold text-gray-900 dark:text-white bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 dark:from-white dark:via-gray-100 dark:to-white bg-clip-text">
            Plant Growth Analysis
          </h2>
          <p class="text-gray-600 dark:text-gray-400 mt-1 font-medium">
            AI-powered insights and recommendations for optimal plant growth
          </p>
        </div>
      </div>

      <!-- Enhanced content grid with modern cards -->
      <div class="grid lg:grid-cols-2 gap-8">
        <!-- Recommendations Section with enhanced styling -->
        <div class="space-y-6">
          <div class="flex items-center gap-4 mb-6">
            <div class="w-12 h-12 bg-gradient-to-br from-blue-100 to-blue-50 dark:from-blue-900/40 dark:to-blue-800/30 rounded-xl flex items-center justify-center ring-1 ring-blue-200/50 dark:ring-blue-700/30">
              <svg class="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <h3 class="text-xl font-bold text-gray-900 dark:text-white">
              Smart Recommendations
            </h3>
          </div>

          <div class="space-y-4">
            <!-- Enhanced recommendation cards -->
            <div class="group p-6 bg-gradient-to-br from-emerald-50 via-emerald-25 to-teal-50 dark:from-emerald-900/20 dark:via-emerald-800/15 dark:to-teal-800/10 rounded-2xl border border-emerald-200/50 dark:border-emerald-700/30 hover:shadow-lg hover:shadow-emerald-500/10 transition-all duration-300 hover:scale-[1.02]">
              <div class="flex items-start gap-4">
                <div class="w-10 h-10 bg-emerald-100 dark:bg-emerald-900/40 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300">
                  <svg class="w-5 h-5 text-emerald-600 dark:text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div>
                  <h4 class="font-bold text-gray-900 dark:text-white mb-2 text-base">
                    Optimal Watering Schedule
                  </h4>
                  <p class="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                    Current soil moisture levels are ideal. Maintain your watering schedule for optimal plant health.
                  </p>
                </div>
              </div>
            </div>

            <div class="group p-6 bg-gradient-to-br from-amber-50 via-amber-25 to-orange-50 dark:from-amber-900/20 dark:via-amber-800/15 dark:to-orange-800/10 rounded-2xl border border-amber-200/50 dark:border-amber-700/30 hover:shadow-lg hover:shadow-amber-500/10 transition-all duration-300 hover:scale-[1.02]">
              <div class="flex items-start gap-4">
                <div class="w-10 h-10 bg-amber-100 dark:bg-amber-900/40 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300">
                  <svg class="w-5 h-5 text-amber-600 dark:text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <h4 class="font-bold text-gray-900 dark:text-white mb-2 text-base">
                    Nutrient Enhancement
                  </h4>
                  <p class="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                    Consider adding nitrogen-rich fertilizer within the next 3-5 days to boost growth.
                  </p>
                </div>
              </div>
            </div>

            <div class="group p-6 bg-gradient-to-br from-blue-50 via-blue-25 to-indigo-50 dark:from-blue-900/20 dark:via-blue-800/15 dark:to-indigo-800/10 rounded-2xl border border-blue-200/50 dark:border-blue-700/30 hover:shadow-lg hover:shadow-blue-500/10 transition-all duration-300 hover:scale-[1.02]">
              <div class="flex items-start gap-4">
                <div class="w-10 h-10 bg-blue-100 dark:bg-blue-900/40 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300">
                  <svg class="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <h4 class="font-bold text-gray-900 dark:text-white mb-2 text-base">
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

        <!-- Enhanced metrics section -->
        <div class="space-y-6">
          <div class="flex items-center gap-4 mb-6">
            <div class="w-12 h-12 bg-gradient-to-br from-purple-100 to-purple-50 dark:from-purple-900/40 dark:to-purple-800/30 rounded-xl flex items-center justify-center ring-1 ring-purple-200/50 dark:ring-purple-700/30">
              <svg class="w-6 h-6 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h3 class="text-xl font-bold text-gray-900 dark:text-white">
              Growth Metrics
            </h3>
          </div>

          <div class="grid grid-cols-2 gap-4">
            <!-- Enhanced metric cards -->
            <div class="group p-6 bg-gradient-to-br from-emerald-50 via-emerald-25 to-teal-50 dark:from-emerald-900/20 dark:via-emerald-800/15 dark:to-teal-800/10 rounded-2xl border border-emerald-200/50 dark:border-emerald-700/30 hover:shadow-lg hover:shadow-emerald-500/10 transition-all duration-300 hover:scale-[1.02]">
              <div class="flex items-center justify-between mb-4">
                <div class="w-12 h-12 bg-emerald-100 dark:bg-emerald-900/40 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <svg class="w-6 h-6 text-emerald-600 dark:text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 11l5-5m0 0l5 5m-5-5v12" />
                  </svg>
                </div>
              </div>
              <div class="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                Growth Rate
              </div>
              <div class="text-3xl font-black text-emerald-600 dark:text-emerald-400 mb-1">
                +2.3
              </div>
              <div class="text-xs text-gray-500 dark:text-gray-400 font-medium">cm/week</div>
            </div>

            <div class="group p-6 bg-gradient-to-br from-gray-50 via-gray-25 to-slate-50 dark:from-gray-800/50 dark:via-gray-700/40 dark:to-slate-700/30 rounded-2xl border border-gray-200/50 dark:border-gray-700/30 hover:shadow-lg hover:shadow-gray-500/10 transition-all duration-300 hover:scale-[1.02]">
              <div class="flex items-center justify-between mb-4">
                <div class="w-12 h-12 bg-green-100 dark:bg-green-900/40 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <svg class="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                  </svg>
                </div>
              </div>
              <div class="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                Leaf Count
              </div>
              <div class="text-3xl font-black text-gray-900 dark:text-white mb-1">
                12
              </div>
              <div class="text-xs text-gray-500 dark:text-gray-400 font-medium">leaves</div>
            </div>

            <div class="group p-6 bg-gradient-to-br from-amber-50 via-amber-25 to-orange-50 dark:from-amber-900/20 dark:via-amber-800/15 dark:to-orange-800/10 rounded-2xl border border-amber-200/50 dark:border-amber-700/30 hover:shadow-lg hover:shadow-amber-500/10 transition-all duration-300 hover:scale-[1.02]">
              <div class="flex items-center justify-between mb-4">
                <div class="w-12 h-12 bg-amber-100 dark:bg-amber-900/40 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <svg class="w-6 h-6 text-amber-600 dark:text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                  </svg>
                </div>
              </div>
              <div class="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                Est. Yield
              </div>
              <div class="text-3xl font-black text-amber-600 dark:text-amber-400 mb-1">
                High
              </div>
              <div class="text-xs text-gray-500 dark:text-gray-400 font-medium">quality</div>
            </div>

            <div class="group p-6 bg-gradient-to-br from-blue-50 via-blue-25 to-indigo-50 dark:from-blue-900/20 dark:via-blue-800/15 dark:to-indigo-800/10 rounded-2xl border border-blue-200/50 dark:border-blue-700/30 hover:shadow-lg hover:shadow-blue-500/10 transition-all duration-300 hover:scale-[1.02]">
              <div class="flex items-center justify-between mb-4">
                <div class="w-12 h-12 bg-blue-100 dark:bg-blue-900/40 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <svg class="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
              <div class="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                Harvest
              </div>
              <div class="text-3xl font-black text-blue-600 dark:text-blue-400 mb-1">
                ~18
              </div>
              <div class="text-xs text-gray-500 dark:text-gray-400 font-medium">days</div>
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

.group:hover .group-hover\:scale-110 {
  transform: scale(1.1);
}

/* Smooth transitions for all elements */
* {
  transition-property: all;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 300ms;
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