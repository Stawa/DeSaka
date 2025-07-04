<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  plantHealthScore?: number
  growthPrediction?: string
}

const props = withDefaults(defineProps<Props>(), {
  plantHealthScore: 85,
  growthPrediction: 'Excellent',
})

const healthScoreColor = computed(() => {
  if (props.plantHealthScore >= 80) return 'text-green-600 dark:text-green-400'
  if (props.plantHealthScore >= 60) return 'text-yellow-600 dark:text-yellow-400'
  return 'text-red-600 dark:text-red-400'
})

const healthScoreBg = computed(() => {
  if (props.plantHealthScore >= 80) return 'from-green-500/10 to-emerald-500/10'
  if (props.plantHealthScore >= 60) return 'from-yellow-500/10 to-amber-500/10'
  return 'from-red-500/10 to-rose-500/10'
})

const recommendations = [
  {
    id: 1,
    type: 'success',
    title: 'Optimal Watering Schedule',
    description:
      'Current soil moisture levels are ideal. Maintain your watering schedule for optimal plant health.',
    icon: 'M5 13l4 4L19 7',
    priority: 'low',
    bgColor: 'from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20',
    borderColor: 'border-green-200/60 dark:border-green-700/40',
    iconBg: 'bg-green-100 dark:bg-green-900/40',
    iconColor: 'text-green-600 dark:text-green-400',
  },
  {
    id: 2,
    type: 'warning',
    title: 'Nutrient Enhancement',
    description:
      'Consider adding nitrogen-rich fertilizer within the next 3-5 days to boost growth.',
    icon: 'M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z',
    priority: 'medium',
    bgColor: 'from-amber-50 to-yellow-50 dark:from-amber-900/20 dark:to-yellow-900/20',
    borderColor: 'border-amber-200/60 dark:border-amber-700/40',
    iconBg: 'bg-amber-100 dark:bg-amber-900/40',
    iconColor: 'text-amber-600 dark:text-amber-400',
  },
  {
    id: 3,
    type: 'info',
    title: 'Temperature Monitoring',
    description: 'Monitor air temperature during midday as it approaches the upper threshold.',
    icon: 'M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
    priority: 'high',
    bgColor: 'from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20',
    borderColor: 'border-blue-200/60 dark:border-blue-700/40',
    iconBg: 'bg-blue-100 dark:bg-blue-900/40',
    iconColor: 'text-blue-600 dark:text-blue-400',
  },
]

const growthMetrics = [
  {
    id: 1,
    label: 'Growth Rate',
    value: '+2.3',
    unit: 'cm/week',
    trend: 'up',
    color: 'emerald',
    icon: 'M7 11l5-5m0 0l5 5m-5-5v12',
  },
  {
    id: 2,
    label: 'Leaf Count',
    value: '12',
    unit: 'leaves',
    trend: 'stable',
    color: 'green',
    icon: 'M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z',
  },
  {
    id: 3,
    label: 'Est. Yield',
    value: 'High',
    unit: 'quality',
    trend: 'up',
    color: 'amber',
    icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1',
  },
  {
    id: 4,
    label: 'Harvest',
    value: '~18',
    unit: 'days',
    trend: 'down',
    color: 'blue',
    icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z',
  },
]
</script>

<template>
  <div
    class="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-2xl border border-gray-200/60 dark:border-gray-800/60 shadow-sm overflow-hidden"
  >
    <!-- Subtle accent bar -->
    <div class="h-1 bg-gradient-to-r from-emerald-500 to-teal-600"></div>

    <div class="p-6">
      <!-- Header -->
      <div class="flex items-center gap-4 mb-8">
        <div
          class="w-12 h-12 bg-gradient-to-br from-emerald-100 to-emerald-50 dark:from-emerald-900/30 dark:to-emerald-800/20 rounded-xl flex items-center justify-center ring-1 ring-emerald-200/50 dark:ring-emerald-700/30"
        >
          <svg
            class="w-6 h-6 text-emerald-600 dark:text-emerald-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
            />
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
        <div class="space-y-6">
          <div class="flex items-center gap-3 mb-6">
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
                  d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                />
              </svg>
            </div>
            <h3 class="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Smart Recommendations
            </h3>
          </div>

          <div class="space-y-4">
            <div
              class="p-5 bg-gradient-to-r from-emerald-50 to-emerald-25 dark:from-emerald-900/20 dark:to-emerald-800/10 rounded-xl border border-emerald-200/50 dark:border-emerald-700/30"
            >
              <div class="flex items-start gap-4">
                <div
                  class="w-8 h-8 bg-emerald-100 dark:bg-emerald-900/30 rounded-xl flex items-center justify-center flex-shrink-0"
                >
                  <svg
                    class="w-4 h-4 text-emerald-600 dark:text-emerald-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
                <div>
                  <h4 class="font-semibold text-gray-900 dark:text-gray-100 mb-2">
                    Optimal Watering Schedule
                  </h4>
                  <p class="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                    Current soil moisture levels are ideal. Maintain your watering schedule for
                    optimal plant health.
                  </p>
                </div>
              </div>
            </div>

            <div
              class="p-5 bg-gradient-to-r from-amber-50 to-amber-25 dark:from-amber-900/20 dark:to-amber-800/10 rounded-xl border border-amber-200/50 dark:border-amber-700/30"
            >
              <div class="flex items-start gap-4">
                <div
                  class="w-8 h-8 bg-amber-100 dark:bg-amber-900/30 rounded-xl flex items-center justify-center flex-shrink-0"
                >
                  <svg
                    class="w-4 h-4 text-amber-600 dark:text-amber-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <div>
                  <h4 class="font-semibold text-gray-900 dark:text-gray-100 mb-2">
                    Nutrient Enhancement
                  </h4>
                  <p class="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                    Consider adding nitrogen-rich fertilizer within the next 3-5 days to boost
                    growth.
                  </p>
                </div>
              </div>
            </div>

            <div
              class="p-5 bg-gradient-to-r from-blue-50 to-blue-25 dark:from-blue-900/20 dark:to-blue-800/10 rounded-xl border border-blue-200/50 dark:border-blue-700/30"
            >
              <div class="flex items-start gap-4">
                <div
                  class="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center flex-shrink-0"
                >
                  <svg
                    class="w-4 h-4 text-blue-600 dark:text-blue-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <div>
                  <h4 class="font-semibold text-gray-900 dark:text-gray-100 mb-2">
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
            <div
              class="w-10 h-10 bg-gradient-to-br from-purple-100 to-purple-50 dark:from-purple-900/30 dark:to-purple-800/20 rounded-xl flex items-center justify-center ring-1 ring-purple-200/50 dark:ring-purple-700/30"
            >
              <svg
                class="w-5 h-5 text-purple-600 dark:text-purple-400"
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
            <h3 class="text-lg font-semibold text-gray-900 dark:text-gray-100">Growth Metrics</h3>
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div
              class="p-5 bg-gradient-to-br from-emerald-50 to-emerald-25 dark:from-emerald-900/20 dark:to-emerald-800/10 rounded-xl border border-emerald-200/50 dark:border-emerald-700/30"
            >
              <div class="flex items-center justify-between mb-3">
                <div
                  class="w-10 h-10 bg-emerald-100 dark:bg-emerald-900/30 rounded-xl flex items-center justify-center"
                >
                  <svg
                    class="w-5 h-5 text-emerald-600 dark:text-emerald-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M7 11l5-5m0 0l5 5m-5-5v12"
                    />
                  </svg>
                </div>
              </div>
              <div
                class="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1"
              >
                Growth Rate
              </div>
              <div class="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mb-1">+2.3</div>
              <div class="text-xs text-gray-500 dark:text-gray-400">cm/week</div>
            </div>

            <div
              class="p-5 bg-gradient-to-br from-gray-50 to-gray-25 dark:from-gray-800/50 dark:to-gray-700/30 rounded-xl border border-gray-200/50 dark:border-gray-700/30"
            >
              <div class="flex items-center justify-between mb-3">
                <div
                  class="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center"
                >
                  <svg
                    class="w-5 h-5 text-green-600 dark:text-green-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
                    />
                  </svg>
                </div>
              </div>
              <div
                class="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1"
              >
                Leaf Count
              </div>
              <div class="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-1">12</div>
              <div class="text-xs text-gray-500 dark:text-gray-400">leaves</div>
            </div>

            <div
              class="p-5 bg-gradient-to-br from-amber-50 to-amber-25 dark:from-amber-900/20 dark:to-amber-800/10 rounded-xl border border-amber-200/50 dark:border-amber-700/30"
            >
              <div class="flex items-center justify-between mb-3">
                <div
                  class="w-10 h-10 bg-amber-100 dark:bg-amber-900/30 rounded-xl flex items-center justify-center"
                >
                  <svg
                    class="w-5 h-5 text-amber-600 dark:text-amber-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
                    />
                  </svg>
                </div>
              </div>
              <div
                class="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1"
              >
                Est. Yield
              </div>
              <div class="text-2xl font-bold text-amber-600 dark:text-amber-400 mb-1">High</div>
              <div class="text-xs text-gray-500 dark:text-gray-400">quality</div>
            </div>

            <div
              class="p-5 bg-gradient-to-br from-blue-50 to-blue-25 dark:from-blue-900/20 dark:to-blue-800/10 rounded-xl border border-blue-200/50 dark:border-blue-700/30"
            >
              <div class="flex items-center justify-between mb-3">
                <div
                  class="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center"
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
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
              </div>
              <div
                class="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1"
              >
                Harvest
              </div>
              <div class="text-2xl font-bold text-blue-600 dark:text-blue-400 mb-1">~18</div>
              <div class="text-xs text-gray-500 dark:text-gray-400">days</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.shadow-soft {
  box-shadow:
    0 2px 15px -3px rgba(0, 0, 0, 0.07),
    0 10px 20px -2px rgba(0, 0, 0, 0.04);
}

.shadow-medium {
  box-shadow:
    0 4px 25px -5px rgba(0, 0, 0, 0.1),
    0 10px 10px -5px rgba(0, 0, 0, 0.04);
}

/* Smooth transitions for all elements */
* {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

/* Enhanced hover effects */
.group:hover {
  transform: translateY(-2px);
}

/* Animation for metric cards */
@keyframes slideInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.grid > div {
  animation: slideInUp 0.6s ease-out;
  animation-fill-mode: both;
}

.grid > div:nth-child(1) {
  animation-delay: 0.1s;
}
.grid > div:nth-child(2) {
  animation-delay: 0.2s;
}
.grid > div:nth-child(3) {
  animation-delay: 0.3s;
}
.grid > div:nth-child(4) {
  animation-delay: 0.4s;
}
</style>
