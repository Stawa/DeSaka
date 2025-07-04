<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps({
  title: { type: String, required: true },
  value: { type: [Number, String], required: true },
  unit: { type: String, required: true },
  status: { type: String, default: 'normal' },
  icon: { type: String, required: true },
  trend: { type: String, default: 'stable' },
})

const statusConfig = computed(() => {
  const configs = {
    optimal: {
      badge: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300',
      dot: 'bg-emerald-500',
      iconBg: 'bg-emerald-50 dark:bg-emerald-900/20',
      iconColor: 'text-emerald-600 dark:text-emerald-400',
      ring: 'ring-emerald-200/50 dark:ring-emerald-700/30',
    },
    normal: {
      badge: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300',
      dot: 'bg-emerald-500',
      iconBg: 'bg-emerald-50 dark:bg-emerald-900/20',
      iconColor: 'text-emerald-600 dark:text-emerald-400',
      ring: 'ring-emerald-200/50 dark:ring-emerald-700/30',
    },
    warning: {
      badge: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
      dot: 'bg-amber-500',
      iconBg: 'bg-amber-50 dark:bg-amber-900/20',
      iconColor: 'text-amber-600 dark:text-amber-400',
      ring: 'ring-amber-200/50 dark:ring-amber-700/30',
    },
    critical: {
      badge: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
      dot: 'bg-red-500',
      iconBg: 'bg-red-50 dark:bg-red-900/20',
      iconColor: 'text-red-600 dark:text-red-400',
      ring: 'ring-red-200/50 dark:ring-red-700/30',
    },
    inactive: {
      badge: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
      dot: 'bg-gray-400',
      iconBg: 'bg-gray-50 dark:bg-gray-800/30',
      iconColor: 'text-gray-500 dark:text-gray-400',
      ring: 'ring-gray-200/50 dark:ring-gray-700/30',
    },
  }
  return configs[props.status as keyof typeof configs] || configs.normal
})

const trendConfig = computed(() => {
  const configs = {
    increasing: {
      icon: 'mdi-trending-up',
      color: 'text-emerald-500',
      bg: 'bg-emerald-50 dark:bg-emerald-900/20',
    },
    decreasing: {
      icon: 'mdi-trending-down',
      color: 'text-red-500',
      bg: 'bg-red-50 dark:bg-red-900/20',
    },
    stable: {
      icon: 'mdi-trending-neutral',
      color: 'text-gray-500',
      bg: 'bg-gray-50 dark:bg-gray-800/30',
    },
  }
  return configs[props.trend as keyof typeof configs] || configs.stable
})

const sensorIcon = computed(() => {
  const iconMap: Record<string, string> = {
    thermometer: 'mdi-thermometer',
    'water-percent': 'mdi-water-percent',
    flask: 'mdi-flask',
    'weather-partly-cloudy': 'mdi-weather-partly-cloudy',
    water: 'mdi-water',
    'white-balance-sunny': 'mdi-white-balance-sunny',
  }
  return iconMap[props.icon] || 'mdi-circle'
})
</script>

<template>
  <div
    class="group relative bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-2xl border border-gray-200/60 dark:border-gray-800/60 shadow-sm hover:shadow-xl hover:shadow-gray-900/5 dark:hover:shadow-gray-950/20 transition-all duration-300 hover:-translate-y-1 overflow-hidden"
  >
    <div class="p-6">
      <!-- Header -->
      <div class="flex items-start gap-4 mb-6">
        <div
          :class="[
            statusConfig.iconBg,
            statusConfig.ring,
            'w-12 h-12 rounded-xl flex items-center justify-center ring-1',
          ]"
        >
          <i :class="[sensorIcon, statusConfig.iconColor, 'mdi text-xl']"></i>
        </div>
        <div class="flex-1 min-w-0">
          <h3 class="font-semibold text-gray-900 dark:text-gray-100 mb-1 truncate">
            {{ title }}
          </h3>
          <div
            :class="[
              statusConfig.badge,
              'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium',
            ]"
          >
            <div :class="[statusConfig.dot, 'w-1.5 h-1.5 rounded-full']"></div>
            {{ status.charAt(0).toUpperCase() + status.slice(1) }}
          </div>
        </div>
      </div>

      <!-- Value Display -->
      <div class="space-y-2">
        <div class="flex items-baseline gap-2">
          <span class="text-3xl font-bold text-gray-900 dark:text-gray-100">
            {{ typeof value === 'number' ? value.toFixed(1) : value }}
          </span>
          <span class="text-lg font-medium text-gray-500 dark:text-gray-400">
            {{ unit }}
          </span>
        </div>

        <!-- Trend indicator -->
        <div class="flex items-center gap-2 text-sm">
          <i :class="[trendConfig.icon, trendConfig.color, 'mdi text-sm']"></i>
          <span :class="[trendConfig.color, 'font-medium']">
            {{ trend.charAt(0).toUpperCase() + trend.slice(1) }} trend
          </span>
        </div>
      </div>
    </div>

    <!-- Hover effect overlay -->
    <div
      class="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-gray-50/20 dark:to-gray-800/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
    ></div>
  </div>
</template>

<style scoped>
/* Ensure Material Design Icons are loaded */
@import url('https://cdn.jsdelivr.net/npm/@mdi/font@7.4.47/css/materialdesignicons.min.css');

/* Smooth entrance animation */
@keyframes slideInUp {
  from {
    opacity: 0;
    transform: translateY(20px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.group {
  animation: slideInUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}

/* Enhanced hover effects */
.group:hover {
  transform: translateY(-4px) scale(1.02);
}

/* Focus states for accessibility */
.group:focus-within {
  outline: 2px solid theme('colors.emerald.500');
  outline-offset: 2px;
}
</style>
