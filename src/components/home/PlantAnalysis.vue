<script setup lang="ts">
import type { LogSystem } from '@/composables/responseApi'
import { ref, computed } from 'vue'

type SensorDataItem = { value: number; unit: string; status: string; time: string }
type sensorType = {
  [key: string]: SensorDataItem
  soilTemperature: SensorDataItem
  soilMoisture: SensorDataItem
  soilPH: SensorDataItem
  airTemperature: SensorDataItem
  airHumidity: SensorDataItem
}

interface Props {
  plantHealthScore?: number
  growthPrediction?: string
  logs?: LogSystem[]
  sensorData: sensorType
}

const showAll = ref(false)

const visibleLogs = computed(() => {
  if (!props.logs) return []
  const logsArray = [...props.logs].reverse()
  return showAll.value ? logsArray : logsArray.slice(0, 10)
})

function toggleLogs() {
  showAll.value = !showAll.value
}

const props = withDefaults(defineProps<Props>(), {
  plantHealthScore: 0,
  growthPrediction: 'Critical',
})

const healthScoreBar = computed(() => {
  if (props.plantHealthScore >= 80) return 'bg-emerald-600 dark:bg-emerald-400'
  if (props.plantHealthScore >= 60) return 'bg-amber-600 dark:bg-amber-400'
  return 'bg-red-600 dark:bg-red-400'
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

const recommendationsText = ref(
  'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
)

const recommendations = computed(() => {
  const result = []

  if (props.sensorData.soilMoisture.value < 25) {
    result.push({
      id: 1,
      type: 'error',
      title: 'Watering Needed',
      description: 'Soil moisture is very low. Water your plants immediately.',
      priority: 'high',
      icon: 'M5 13l4 4L19 7',
      bgColor: 'from-red-50/80 to-red-25/40 dark:from-red-900/20 dark:to-red-800/10',
      borderColor: 'border-red-200/60 dark:border-red-700/40',
      iconBg: 'bg-red-100/80 dark:bg-red-900/40',
      iconColor: 'text-red-600 dark:text-red-400',
    })
  } else if (props.sensorData.soilMoisture.value < 40) {
    result.push({
      id: 1,
      type: 'warning',
      title: 'Moderate Moisture',
      description: 'Soil moisture is moderate. Consider watering soon.',
      priority: 'medium',
      icon: 'M5 13l4 4L19 7',
      bgColor: 'from-amber-50/80 to-amber-25/40 dark:from-amber-900/20 dark:to-amber-800/10',
      borderColor: 'border-amber-200/60 dark:border-amber-700/40',
      iconBg: 'bg-amber-100/80 dark:bg-amber-900/40',
      iconColor: 'text-amber-600 dark:text-amber-400',
    })
  } else {
    result.push({
      id: 1,
      type: 'success',
      title: 'Optimal Watering Schedule',
      description:
        'Current soil moisture levels are ideal. Maintain your watering schedule for optimal plant health.',
      priority: 'low',
      icon: 'M5 13l4 4L19 7',
      bgColor: 'from-emerald-50/80 to-emerald-25/40 dark:from-emerald-900/20 dark:to-emerald-800/10',
      borderColor: 'border-emerald-200/60 dark:border-emerald-700/40',
      iconBg: 'bg-emerald-100/80 dark:bg-emerald-900/40',
      iconColor: 'text-emerald-600 dark:text-emerald-400',
    })
  }

  if (props.sensorData.soilPH.value < 5.5 || props.sensorData.soilPH.value > 7.5) {
    result.push({
      id: 2,
      type: 'error',
      title: 'Soil pH Imbalance',
      description:
        'Soil pH is outside optimal range. Consider amending with lime or sulfur accordingly.',
      priority: 'high',
      icon: 'M12 9v3m0 0v3m0-3h3m-3 0H9',
      bgColor: 'from-red-50/80 to-red-25/40 dark:from-red-900/20 dark:to-red-800/10',
      borderColor: 'border-red-200/60 dark:border-red-700/40',
      iconBg: 'bg-red-100/80 dark:bg-red-900/40',
      iconColor: 'text-red-600 dark:text-red-400',
    })
  } else {
    result.push({
      id: 2,
      type: 'warning',
      title: 'Nutrient Enhancement',
      description:
        'Consider adding nitrogen-rich fertilizer within the next 3-5 days to boost growth.',
      priority: 'medium',
      icon: 'M12 9v3m0 0v3m0-3h3m-3 0H9',
      bgColor: 'from-amber-50/80 to-amber-25/40 dark:from-amber-900/20 dark:to-amber-800/10',
      borderColor: 'border-amber-200/60 dark:border-amber-700/40',
      iconBg: 'bg-amber-100/80 dark:bg-amber-900/40',
      iconColor: 'text-amber-600 dark:text-amber-400',
    })
  }

  if (props.sensorData.airTemperature.value > 35) {
    result.push({
      id: 3,
      type: 'error',
      title: 'High Temperature Warning',
      description:
        'Air temperature is very high. Use shade or misting to protect sensitive plants.',
      priority: 'high',
      icon: 'M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
      bgColor: 'from-red-50/80 to-red-25/40 dark:from-red-900/20 dark:to-red-800/10',
      borderColor: 'border-red-200/60 dark:border-red-700/40',
      iconBg: 'bg-red-100/80 dark:bg-red-900/40',
      iconColor: 'text-red-600 dark:text-red-400',
    })
  } else if (props.sensorData.airTemperature.value > 30) {
    result.push({
      id: 3,
      type: 'info',
      title: 'Temperature Monitoring',
      description:
        'Monitor air temperature during midday as it approaches the upper threshold.',
      priority: 'medium',
      icon: 'M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
      bgColor: 'from-blue-50/80 to-blue-25/40 dark:from-blue-900/20 dark:to-blue-800/10',
      borderColor: 'border-blue-200/60 dark:border-blue-700/40',
      iconBg: 'bg-blue-100/80 dark:bg-blue-900/40',
      iconColor: 'text-blue-600 dark:text-blue-400',
    })
  }

  if (props.sensorData.airHumidity.value < 30) {
    result.push({
      id: 4,
      type: 'error',
      title: 'Low Humidity Warning',
      description: 'Air is very dry. Increase watering or misting to prevent dehydration.',
      priority: 'high',
      icon: 'M5 13l4 4L19 7',
      bgColor: 'from-red-50/80 to-red-25/40 dark:from-red-900/20 dark:to-red-800/10',
      borderColor: 'border-red-200/60 dark:border-red-700/40',
      iconBg: 'bg-red-100/80 dark:bg-red-900/40',
      iconColor: 'text-red-600 dark:text-red-400',
    })
  } else if (props.sensorData.airHumidity.value > 85) {
    result.push({
      id: 4,
      type: 'warning',
      title: 'High Humidity Risk',
      description:
        'High humidity levels may lead to fungal diseases. Ensure good ventilation or spacing.',
      priority: 'medium',
      icon: 'M12 9v3m0 0v3m0-3h3m-3 0H9',
      bgColor: 'from-amber-50/80 to-amber-25/40 dark:from-amber-900/20 dark:to-amber-800/10',
      borderColor: 'border-amber-200/60 dark:border-amber-700/40',
      iconBg: 'bg-amber-100/80 dark:bg-amber-900/40',
      iconColor: 'text-amber-600 dark:text-amber-400',
    })
  }

  return result
})
</script>

<template>
  <div
    class="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-xl sm:rounded-2xl border border-gray-200/60 dark:border-gray-800/60 shadow-sm overflow-hidden">
    <!-- Accent bar matching app design -->
    <div class="h-1 bg-gradient-to-r from-emerald-500 to-teal-600"></div>

    <div class="p-3 xs:p-4 sm:p-6">
      <!-- Header Section -->
      <div class="flex items-start xs:items-center gap-2.5 xs:gap-3 sm:gap-4 mb-4 xs:mb-6 sm:mb-8">
        <div
          class="w-9 h-9 xs:w-10 xs:h-10 sm:w-12 sm:h-12 flex-shrink-0 bg-gradient-to-br from-emerald-100/80 to-emerald-50/60 dark:from-emerald-900/30 dark:to-emerald-800/20 rounded-lg xs:rounded-xl flex items-center justify-center ring-1 ring-emerald-200/50 dark:ring-emerald-700/30">
          <svg class="w-4 h-4 xs:w-5 xs:h-5 sm:w-6 sm:h-6 text-emerald-600 dark:text-emerald-400" fill="none"
            stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
        </div>
        <div class="min-w-0 flex-1">
          <h2 class="text-base xs:text-lg sm:text-xl font-semibold text-gray-900 dark:text-gray-100 truncate">
            Plant Growth Analysis
          </h2>
          <p class="text-xs xs:text-sm text-gray-600 dark:text-gray-400 mt-0.5 line-clamp-2 xs:line-clamp-none">
            AI-powered insights and recommendations
          </p>
        </div>
      </div>

      <!-- Health Score Card -->
      <!-- Health Score and Recommendations Text -->
      <div class="grid md:grid-cols-2 gap-4 xs:gap-5 sm:gap-6 mb-4 xs:mb-6 sm:mb-8">
        <!-- Health Score Card -->
        <div class="rounded-lg xs:rounded-xl p-3 xs:p-4 sm:p-5 bg-gradient-to-br ring-1"
          :class="healthScoreBg + ' ' + healthScoreRing">
          <div class="flex items-center justify-between mb-3 xs:mb-4">
            <div class="flex items-center gap-2 xs:gap-3">
              <div
                class="w-9 h-9 xs:w-10 xs:h-10 flex-shrink-0 bg-white/80 dark:bg-gray-800/80 rounded-lg xs:rounded-xl flex items-center justify-center ring-1"
                :class="healthScoreRing">
                <svg class="w-4 h-4 xs:w-5 xs:h-5" :class="healthScoreColor" fill="none" stroke="currentColor"
                  viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </div>
              <div>
                <div class="text-2xs xs:text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                  Plant Health Score
                </div>
                <div class="text-xl xs:text-2xl font-bold" :class="healthScoreColor">
                  {{ plantHealthScore }}%
                </div>
              </div>
            </div>
            <div class="text-right">
              <div class="text-2xs xs:text-xs text-gray-500 dark:text-gray-400 mb-1">Status</div>
              <div class="text-xs xs:text-sm font-semibold" :class="healthScoreColor">
                {{ growthPrediction }}
              </div>
            </div>
          </div>

          <!-- Progress Bar -->
          <div class="w-full bg-gray-200/60 dark:bg-gray-700/60 rounded-full h-1.5 xs:h-2">
            <div class="h-1.5 xs:h-2 rounded-full transition-all duration-700 ease-out" :class="healthScoreBar"
              :style="{ width: `${plantHealthScore}%` }"></div>
          </div>
        </div>

        <!-- Recommendations Text Card -->
        <div
          class="rounded-lg xs:rounded-xl p-3 xs:p-4 sm:p-5 bg-gradient-to-br from-blue-50/80 to-blue-25/40 dark:from-blue-900/20 dark:to-blue-800/10 ring-1 ring-blue-200/50 dark:ring-blue-700/30">
          <div class="flex items-center gap-2 mb-2 xs:mb-3">
            <div
              class="w-8 h-8 xs:w-9 xs:h-9 flex-shrink-0 bg-blue-100/80 dark:bg-blue-900/40 rounded-lg flex items-center justify-center">
              <svg class="w-4 h-4 xs:w-4.5 xs:h-4.5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor"
                viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 class="text-sm xs:text-base font-semibold text-gray-900 dark:text-gray-100">
              Overview
            </h3>
          </div>
          <p class="text-xs xs:text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
            {{ recommendationsText }}
          </p>
        </div>
      </div>

      <!-- Content Grid -->
      <div class="grid lg:grid-cols-2 gap-4 xs:gap-5 sm:gap-6 lg:gap-8 items-stretch">
        <!-- Health Score & Recommendations Section -->
        <div class="space-y-4 xs:space-y-5 sm:space-y-6">
          <!-- Recommendations Header -->
          <div class="flex items-center gap-2 xs:gap-2.5 sm:gap-3">
            <div
              class="w-8 h-8 xs:w-9 xs:h-9 sm:w-10 sm:h-10 flex-shrink-0 bg-gradient-to-br from-blue-100/80 to-blue-50/60 dark:from-blue-900/30 dark:to-blue-800/20 rounded-lg xs:rounded-xl flex items-center justify-center ring-1 ring-blue-200/50 dark:ring-blue-700/30">
              <svg class="w-3.5 h-3.5 xs:w-4 xs:h-4 sm:w-5 sm:h-5 text-blue-600 dark:text-blue-400" fill="none"
                stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <h3 class="text-sm xs:text-base sm:text-lg font-semibold text-gray-900 dark:text-gray-100">
              Smart Recommendations
            </h3>
          </div>

          <!-- Smart Recommendations -->
          <div class="space-y-3 xs:space-y-3.5 sm:space-y-4">
            <div v-for="rec in recommendations" :key="rec.id"
              class="relative flex items-start gap-2.5 xs:gap-3 sm:gap-4 rounded-lg xs:rounded-xl border p-3 xs:p-4 sm:p-5 bg-gradient-to-br shadow-sm hover:shadow-md transition-all"
              :class="[rec.bgColor, rec.borderColor]">
              <!-- Accent bar -->
              <div class="absolute top-0 left-0 w-1 h-full rounded-l-lg xs:rounded-l-xl" :class="rec.iconColor"></div>

              <!-- Icon -->
              <div
                class="flex-shrink-0 w-8 h-8 xs:w-9 xs:h-9 sm:w-10 sm:h-10 flex items-center justify-center rounded-full"
                :class="rec.iconBg">
                <svg class="w-4 h-4 xs:w-4.5 xs:h-4.5 sm:w-5 sm:h-5" fill="none" stroke="currentColor"
                  viewBox="0 0 24 24" :class="rec.iconColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" :d="rec.icon" />
                </svg>
              </div>

              <!-- Content -->
              <div class="flex-1 min-w-0">
                <div class="flex flex-wrap items-center gap-1.5 xs:gap-2 mb-1">
                  <h4 class="font-semibold text-sm xs:text-base text-gray-900 dark:text-gray-100">
                    {{ rec.title }}
                  </h4>
                  <span class="px-1.5 xs:px-2 py-0.5 text-2xs xs:text-xs rounded-full font-medium capitalize" :class="{
                    'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300':
                      rec.priority === 'low',
                    'bg-amber-200 text-amber-800 dark:bg-amber-900 dark:text-amber-300':
                      rec.priority === 'medium',
                    'bg-red-200 text-red-800 dark:bg-red-900 dark:text-red-300':
                      rec.priority === 'high',
                  }">
                    {{ rec.priority }}
                  </span>
                </div>
                <p class="text-xs xs:text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                  {{ rec.description }}
                </p>
              </div>
            </div>
          </div>
        </div>

        <!-- API Logs Section -->
        <div class="space-y-4 xs:space-y-5 sm:space-y-6">
          <!-- Logs Header -->
          <div class="flex items-center gap-2 xs:gap-2.5 sm:gap-3">
            <div
              class="w-8 h-8 xs:w-9 xs:h-9 sm:w-10 sm:h-10 flex-shrink-0 bg-gradient-to-br from-blue-100/80 to-blue-50/60 dark:from-blue-900/30 dark:to-blue-800/20 rounded-lg xs:rounded-xl flex items-center justify-center ring-1 ring-blue-200/50 dark:ring-blue-700/30">
              <svg class="w-3.5 h-3.5 xs:w-4 xs:h-4 sm:w-5 sm:h-5 text-blue-600 dark:text-blue-400" fill="none"
                stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V7m-2 0V5a2 2 0 00-2-2H7a2 2 0 00-2 2v2m12 0H7" />
              </svg>
            </div>
            <h3 class="text-sm xs:text-base sm:text-lg font-semibold text-gray-900 dark:text-gray-100">
              API Logs
            </h3>
          </div>

          <!-- Logs Container -->
          <div
            class="bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 flex-1 min-h-[16rem] xs:min-h-[18rem] sm:min-h-[21rem] max-h-[16rem] xs:max-h-[18rem] sm:max-h-[21rem] overflow-y-auto font-mono text-2xs xs:text-xs sm:text-sm flex flex-col">
            <!-- Empty State -->
            <div v-if="!props.logs || props.logs.length === 0"
              class="flex-1 flex items-center justify-center text-gray-400 dark:text-gray-500 italic text-xs xs:text-sm p-4">
              No logs available
            </div>

            <!-- Logs -->
            <div v-else>
              <div v-for="(log, idx) in visibleLogs" :key="idx"
                class="px-2 xs:px-2.5 sm:px-3 py-1.5 xs:py-2 sm:py-1.5 border-b border-gray-100 dark:border-gray-800 last:border-none">
                <!-- Mobile Layout (stacked) -->
                <div class="flex flex-col gap-1 sm:hidden">
                  <div class="flex items-center justify-between gap-2">
                    <span class="text-gray-400 dark:text-gray-500 text-2xs">
                      {{
                        new Date(log.timestamp).toLocaleString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })
                      }}
                    </span>
                    <span class="font-semibold capitalize text-2xs" :class="{
                      'text-red-500': log.level === 'critical',
                      'text-yellow-500': log.level === 'warning',
                      'text-green-500': log.level === 'ok',
                    }">
                      {{ log.level }}
                    </span>
                  </div>
                  <span class="text-gray-800 dark:text-gray-200 text-2xs leading-relaxed">
                    {{ log.message }}
                  </span>
                  <span class="text-gray-400 dark:text-gray-500 italic text-2xs">
                    ({{ log.eventKey }})
                  </span>
                </div>

                <!-- Desktop Layout (horizontal) -->
                <div class="hidden sm:flex items-start gap-3">
                  <span class="shrink-0 text-gray-400 dark:text-gray-500 w-40">
                    {{ new Date(log.timestamp).toLocaleString() }}
                  </span>
                  <span class="font-semibold capitalize w-20" :class="{
                    'text-red-500': log.level === 'critical',
                    'text-yellow-500': log.level === 'warning',
                    'text-green-500': log.level === 'ok',
                  }">
                    {{ log.level }}
                  </span>
                  <span class="flex-1 text-gray-800 dark:text-gray-200">
                    {{ log.message }}
                  </span>
                </div>
              </div>

              <!-- Toggle Button -->
              <div v-if="props.logs && props.logs.length > 10"
                class="p-2.5 xs:p-3 text-center border-t border-gray-200 dark:border-gray-700">
                <button @click="toggleLogs"
                  class="text-blue-600 dark:text-blue-400 hover:underline text-xs xs:text-sm font-medium">
                  {{ showAll ? 'Show Less' : 'Show More' }}
                </button>
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

.grid>div {
  animation: slideInUp 0.6s ease-out;
  animation-fill-mode: both;
}

.grid>div:nth-child(1) {
  animation-delay: 0.1s;
}

.grid>div:nth-child(2) {
  animation-delay: 0.2s;
}

.grid>div:nth-child(3) {
  animation-delay: 0.3s;
}

.grid>div:nth-child(4) {
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

/* Custom scrollbar for logs */
.overflow-y-auto::-webkit-scrollbar {
  width: 6px;
}

.overflow-y-auto::-webkit-scrollbar-track {
  background: transparent;
}

.overflow-y-auto::-webkit-scrollbar-thumb {
  background: rgba(156, 163, 175, 0.3);
  border-radius: 3px;
}

.overflow-y-auto::-webkit-scrollbar-thumb:hover {
  background: rgba(156, 163, 175, 0.5);
}

/* Dark mode scrollbar */
.dark .overflow-y-auto::-webkit-scrollbar-thumb {
  background: rgba(75, 85, 99, 0.5);
}

.dark .overflow-y-auto::-webkit-scrollbar-thumb:hover {
  background: rgba(75, 85, 99, 0.7);
}
</style>
