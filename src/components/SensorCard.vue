<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps({
  title: {
    type: String,
    required: true,
  },
  value: {
    type: [String, Number],
    required: true,
  },
  unit: {
    type: String,
    default: '',
  },
  status: {
    type: String,
    default: 'optimal',
    validator: (value: string) => ['optimal', 'warning', 'critical', 'inactive'].includes(value),
  },
  icon: {
    type: String,
    default: 'thermometer',
  },
  trend: {
    type: String,
    default: 'stable',
  },
})

const iconClass = computed(() => {
  return `mdi mdi-${props.icon}`
})

const statusConfig = computed(() => {
  const configs = {
    optimal: {
      accent: 'bg-emerald-500',
      iconBg: 'bg-emerald-100 dark:bg-emerald-900/30',
      iconColor: 'text-emerald-600 dark:text-emerald-400',
      badge: 'badge badge-success',
      glow: 'shadow-emerald-500/20',
      border: 'border-emerald-200/50 dark:border-emerald-800/50',
    },
    warning: {
      accent: 'bg-amber-500',
      iconBg: 'bg-amber-100 dark:bg-amber-900/30',
      iconColor: 'text-amber-600 dark:text-amber-400',
      badge: 'badge badge-warning',
      glow: 'shadow-amber-500/20',
      border: 'border-amber-200/50 dark:border-amber-800/50',
    },
    critical: {
      accent: 'bg-red-500',
      iconBg: 'bg-red-100 dark:bg-red-900/30',
      iconColor: 'text-red-600 dark:text-red-400',
      badge: 'badge badge-error',
      glow: 'shadow-red-500/20',
      border: 'border-red-200/50 dark:border-red-800/50',
    },
    inactive: {
      accent: 'bg-gray-400',
      iconBg: 'bg-gray-100 dark:bg-gray-800/30',
      iconColor: 'text-gray-500 dark:text-gray-400',
      badge: 'badge bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
      glow: 'shadow-gray-500/10',
      border: 'border-gray-200/50 dark:border-gray-700/50',
    },
  }
  return configs[props.status as keyof typeof configs]
})

const trendInfo = computed(() => {
  const configs = {
    increasing: {
      icon: 'mdi-trending-up',
      text: 'Trending up',
      color: 'text-emerald-600 dark:text-emerald-400',
    },
    decreasing: {
      icon: 'mdi-trending-down',
      text: 'Trending down',
      color: 'text-red-600 dark:text-red-400',
    },
    stable: {
      icon: 'mdi-trending-neutral',
      text: 'Stable',
      color: 'text-gray-600 dark:text-gray-400',
    },
  }
  return configs[props.trend as keyof typeof configs] || configs.stable
})
</script>

<template>
  <div
    class="group relative card card-hover overflow-hidden"
    :class="[statusConfig.glow, statusConfig.border]"
  >
    <!-- Status accent bar -->
    <div
      class="absolute top-0 left-0 right-0 h-1 transition-all duration-300"
      :class="statusConfig.accent"
    ></div>

    <div class="p-6">
      <!-- Header -->
      <div class="flex items-start justify-between mb-6">
        <div class="flex items-center gap-4">
          <div
            class="w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300 group-hover:scale-110"
            :class="[statusConfig.iconBg, statusConfig.iconColor]"
          >
            <span :class="[iconClass, 'text-xl']"></span>
          </div>
          <div>
            <h3 class="font-semibold text-gray-900 dark:text-gray-100 text-base">
              {{ title }}
            </h3>
            <p class="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
              Current reading
            </p>
          </div>
        </div>

        <div :class="statusConfig.badge">
          <div class="w-1.5 h-1.5 rounded-full" :class="statusConfig.accent"></div>
          {{ status.charAt(0).toUpperCase() + status.slice(1) }}
        </div>
      </div>

      <!-- Main Value -->
      <div class="mb-4">
        <div class="flex items-baseline gap-2">
          <span class="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-gray-100 tracking-tight transition-all duration-300 group-hover:scale-105">
            {{ value }}
          </span>
          <span v-if="unit" class="text-lg font-medium text-gray-500 dark:text-gray-400">
            {{ unit }}
          </span>
        </div>
      </div>

      <!-- Trend -->
      <div class="flex items-center gap-2">
        <div class="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-gray-50 dark:bg-gray-800/50">
          <span :class="[`mdi ${trendInfo.icon}`, trendInfo.color, 'text-sm']"></span>
          <span class="text-xs font-medium" :class="trendInfo.color">
            {{ trendInfo.text }}
          </span>
        </div>
      </div>
    </div>

    <!-- Hover effect overlay -->
    <div class="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none rounded-2xl"></div>
  </div>
</template>

<style scoped>
@keyframes cardEnter {
  from {
    opacity: 0;
    transform: translateY(20px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.card-enter {
  animation: cardEnter 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}

/* Stagger animation delay for multiple cards */
.card-enter:nth-child(1) { animation-delay: 0ms; }
.card-enter:nth-child(2) { animation-delay: 100ms; }
.card-enter:nth-child(3) { animation-delay: 200ms; }
.card-enter:nth-child(4) { animation-delay: 300ms; }
</style>