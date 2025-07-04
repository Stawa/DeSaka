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
  if (props.plantHealthScore >= 80) return 'text-emerald-600 dark:text-emerald-400'
  if (props.plantHealthScore >= 60) return 'text-amber-600 dark:text-amber-400'
  return 'text-red-600 dark:text-red-400'
})

const healthScoreBg = computed(() => {
  if (props.plantHealthScore >= 80) return 'from-emerald-500/10 to-emerald-600/5'
  if (props.plantHealthScore >= 60) return 'from-amber-500/10 to-amber-600/5'
  return 'from-red-500/10 to-red-600/5'
})

const healthScoreRing = computed(() => {
  if (props.plantHealthScore >= 80) return 'ring-emerald-200/50 dark:ring-emerald-700/30'
  if (props.plantHealthScore >= 60) return 'ring-amber-200/50 dark:ring-amber-700/30'
  return 'ring-red-200/50 dark:ring-red-700/30'
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
    bgColor: 'from-emerald-50/80 to-emerald-25/40 dark:from-emerald-900/20 dark:to-emerald-800/10',
    borderColor: 'border-emerald-200/60 dark:border-emerald-700/40',
    iconBg: 'bg-emerald-100/80 dark:bg-emerald-900/40',
    iconColor: 'text-emerald-600 dark:text-emerald-400',
  },
  {
    id: 2,
    type: 'warning',
    title: 'Nutrient Enhancement',
    description:
      'Consider adding nitrogen-rich fertilizer within the next 3-5 days to boost growth.',
    icon: 'M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z',
    priority: 'medium',
    bgColor: 'from-amber-50/80 to-amber-25/40 dark:from-amber-900/20 dark:to-amber-800/10',
    borderColor: 'border-amber-200/60 dark:border-amber-700/40',
    iconBg: 'bg-amber-100/80 dark:bg-amber-900/40',
    iconColor: 'text-amber-600 dark:text-amber-400',
  },
  {
    id: 3,
    type: 'info',
    title: 'Temperature Monitoring',
    description: 'Monitor air temperature during midday as it approaches the upper threshold.',
    icon: 'M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
    priority: 'high',
    bgColor: 'from-blue-50/80 to-blue-25/40 dark:from-blue-900/20 dark:to-blue-800/10',
    borderColor: 'border-blue-200/60 dark:border-blue-700/40',
    iconBg: 'bg-blue-100/80 dark:bg-blue-900/40',
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
    bgColor: 'from-emerald-50/80 to-emerald-25/40 dark:from-emerald-900/20 dark:to-emerald-800/10',
    borderColor: 'border-emerald-200/60 dark:border-emerald-700/40',
    iconBg: 'bg-emerald-100/80 dark:bg-emerald-900/40',
    iconColor: 'text-emerald-600 dark:text-emerald-400',
    valueColor: 'text-emerald-600 dark:text-emerald-400',
    icon: 'M7 11l5-5m0 0l5 5m-5-5v12',
  },
  {
    id: 2,
    label: 'Leaf Count',
    value: '12',
    unit: 'leaves',
    trend: 'stable',
    color: 'teal',
    bgColor: 'from-teal-50/80 to-teal-25/40 dark:from-teal-900/20 dark:to-teal-800/10',
    borderColor: 'border-teal-200/60 dark:border-teal-700/40',
    iconBg: 'bg-teal-100/80 dark:bg-teal-900/40',
    iconColor: 'text-teal-600 dark:text-teal-400',
    valueColor: 'text-teal-600 dark:text-teal-400',
    icon: 'M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z',
  },
  {
    id: 3,
    label: 'Est. Yield',
    value: 'High',
    unit: 'quality',
    trend: 'up',
    color: 'amber',
    bgColor: 'from-amber-50/80 to-amber-25/40 dark:from-amber-900/20 dark:to-amber-800/10',
    borderColor: 'border-amber-200/60 dark:border-amber-700/40',
    iconBg: 'bg-amber-100/80 dark:bg-amber-900/40',
    iconColor: 'text-amber-600 dark:text-amber-400',
    valueColor: 'text-amber-600 dark:text-amber-400',
    icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1',
  },
  {
    id: 4,
    label: 'Harvest',
    value: '~18',
    unit: 'days',
    trend: 'down',
    color: 'purple',
    bgColor: 'from-purple-50/80 to-purple-25/40 dark:from-purple-900/20 dark:to-purple-800/10',
    borderColor: 'border-purple-200/60 dark:border-purple-700/40',
    iconBg: 'bg-purple-100/80 dark:bg-purple-900/40',
    iconColor: 'text-purple-600 dark:text-purple-400',
    valueColor: 'text-purple-600 dark:text-purple-400',
    icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z',
  },
]
</script>

<template>
  <div
    class="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-2xl border border-gray-200/60 dark:border-gray-800/60 shadow-sm overflow-hidden"
  >
    <!-- Accent bar matching app design -->
    <div class="h-1 bg-gradient-to-r from-emerald-500 to-teal-600"></div>

    <div class="p-4 sm:p-6">
      <!-- Header Section -->
      <div class="flex items-center gap-3 sm:gap-4 mb-6 sm:mb-8">
        <div
          class="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-emerald-100/80 to-emerald-50/60 dark:from-emerald-900/30 dark:to-emerald-800/20 rounded-xl flex items-center justify-center ring-1 ring-emerald-200/50 dark:ring-emerald-700/30"
        >
          <svg
            class="w-5 h-5 sm:w-6 sm:h-6 text-emerald-600 dark:text-emerald-400"
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
        <div class="min-w-0 flex-1">
          <h2 class="text-lg sm:text-xl font-semibold text-gray-900 dark:text-gray-100 truncate">
            Plant Growth Analysis
          </h2>
          <p class="text-sm text-gray-600 dark:text-gray-400 mt-0.5">
            AI-powered insights and recommendations for optimal plant growth
          </p>
        </div>
      </div>

      <!-- Health Score Card -->
      <div
        class="rounded-xl p-4 sm:p-5 bg-gradient-to-br ring-1 mb-6 sm:mb-8"
        :class="healthScoreBg + healthScoreRing"
      >
        <div class="flex items-center justify-between mb-4">
          <div class="flex items-center gap-3">
            <div
              class="w-10 h-10 bg-white/80 dark:bg-gray-800/80 rounded-xl flex items-center justify-center ring-1"
              :class="healthScoreRing"
            >
              <svg
                class="w-5 h-5"
                :class="healthScoreColor"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                />
              </svg>
            </div>
            <div>
              <div
                class="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide"
              >
                Plant Health Score
              </div>
              <div class="text-2xl font-bold" :class="healthScoreColor">
                {{ plantHealthScore }}%
              </div>
            </div>
          </div>
          <div class="text-right">
            <div class="text-xs text-gray-500 dark:text-gray-400 mb-1">Status</div>
            <div class="text-sm font-semibold" :class="healthScoreColor">
              {{ growthPrediction }}
            </div>
          </div>
        </div>

        <!-- Progress Bar -->
        <div class="w-full bg-gray-200/60 dark:bg-gray-700/60 rounded-full h-2">
          <div
            class="h-2 rounded-full transition-all duration-700 ease-out"
            :class="healthScoreColor.replace('text-', 'bg-')"
            :style="{ width: `${plantHealthScore}%` }"
          ></div>
        </div>
      </div>

      <!-- Content Grid -->
      <div class="grid lg:grid-cols-2 gap-6 lg:gap-8">
        <!-- Health Score & Recommendations Section -->
        <div class="space-y-6">
          <!-- Recommendations Header -->
          <div class="flex items-center gap-3">
            <div
              class="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-blue-100/80 to-blue-50/60 dark:from-blue-900/30 dark:to-blue-800/20 rounded-xl flex items-center justify-center ring-1 ring-blue-200/50 dark:ring-blue-700/30"
            >
              <svg
                class="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 dark:text-blue-400"
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
            <h3 class="text-base sm:text-lg font-semibold text-gray-900 dark:text-gray-100">
              Smart Recommendations
            </h3>
          </div>

          <!-- Recommendations List -->
          <div class="space-y-3 sm:space-y-4">
            <div
              v-for="recommendation in recommendations"
              :key="recommendation.id"
              class="p-4 sm:p-5 bg-gradient-to-r rounded-xl border transition-all duration-200 hover:shadow-sm"
              :class="[recommendation.bgColor, recommendation.borderColor]"
            >
              <div class="flex items-start gap-3 sm:gap-4">
                <div
                  class="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
                  :class="recommendation.iconBg"
                >
                  <svg
                    class="w-4 h-4"
                    :class="recommendation.iconColor"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      :d="recommendation.icon"
                    />
                  </svg>
                </div>
                <div class="min-w-0 flex-1">
                  <h4
                    class="font-semibold text-gray-900 dark:text-gray-100 mb-1 sm:mb-2 text-sm sm:text-base"
                  >
                    {{ recommendation.title }}
                  </h4>
                  <p class="text-xs sm:text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                    {{ recommendation.description }}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Growth Metrics Section -->
        <div class="space-y-6">
          <!-- Metrics Header -->
          <div class="flex items-center gap-3">
            <div
              class="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-purple-100/80 to-purple-50/60 dark:from-purple-900/30 dark:to-purple-800/20 rounded-xl flex items-center justify-center ring-1 ring-purple-200/50 dark:ring-purple-700/30"
            >
              <svg
                class="w-4 h-4 sm:w-5 sm:h-5 text-purple-600 dark:text-purple-400"
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
            <h3 class="text-base sm:text-lg font-semibold text-gray-900 dark:text-gray-100">
              Growth Metrics
            </h3>
          </div>

          <!-- Metrics Grid -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div
              v-for="metric in growthMetrics"
              :key="metric.id"
              class="p-4 sm:p-5 bg-gradient-to-br rounded-xl border transition-all duration-200 hover:shadow-sm hover:-translate-y-0.5"
              :class="[metric.bgColor, metric.borderColor]"
            >
              <div class="flex items-center justify-between mb-3">
                <div
                  class="w-8 h-8 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center"
                  :class="metric.iconBg"
                >
                  <svg
                    class="w-4 h-4 sm:w-5 sm:h-5"
                    :class="metric.iconColor"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      :d="metric.icon"
                    />
                  </svg>
                </div>
                <div v-if="metric.trend === 'up'" class="w-5 h-5 text-emerald-500">
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M7 11l5-5m0 0l5 5m-5-5v12"
                    />
                  </svg>
                </div>
                <div v-else-if="metric.trend === 'down'" class="w-5 h-5 text-blue-500">
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M17 13l-5 5m0 0l-5-5m5 5V6"
                    />
                  </svg>
                </div>
                <div v-else class="w-5 h-5 text-gray-400">
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M20 12H4"
                    />
                  </svg>
                </div>
              </div>

              <div
                class="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1"
              >
                {{ metric.label }}
              </div>
              <div class="text-xl sm:text-2xl font-bold mb-1" :class="metric.valueColor">
                {{ metric.value }}
              </div>
              <div class="text-xs text-gray-500 dark:text-gray-400">
                {{ metric.unit }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Enhanced transitions for smooth interactions */
* {
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

/* Hover effects for interactive elements */
.hover\:shadow-sm:hover {
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
}

.hover\:-translate-y-0\.5:hover {
  transform: translateY(-2px);
}

/* Focus states for accessibility */
button:focus,
a:focus {
  outline: 2px solid theme('colors.blue.500');
  outline-offset: 2px;
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

/* Reduced motion for accessibility */
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}

/* Print styles */
@media print {
  .hover\:shadow-sm:hover,
  .hover\:-translate-y-0\.5:hover {
    transform: none;
    box-shadow: none;
  }
}
</style>
