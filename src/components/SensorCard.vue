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
      iconColor: 'text-emerald-600 dark:text-emerald-400',
      badge: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300',
      glow: 'shadow-emerald-100 dark:shadow-emerald-950/20',
    },
    warning: {
      accent: 'bg-amber-500',
      iconColor: 'text-amber-600 dark:text-amber-400',
      badge: 'bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300',
      glow: 'shadow-amber-100 dark:shadow-amber-950/20',
    },
    critical: {
      accent: 'bg-red-500',
      iconColor: 'text-red-600 dark:text-red-400',
      badge: 'bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-300',
      glow: 'shadow-red-100 dark:shadow-red-950/20',
    },
    inactive: {
      accent: 'bg-slate-400',
      iconColor: 'text-slate-500 dark:text-slate-400',
      badge: 'bg-slate-50 text-slate-700 dark:bg-slate-900 dark:text-slate-300',
      glow: 'shadow-slate-100 dark:shadow-slate-950/20',
    },
  }
  return configs[props.status as keyof typeof configs]
})

const trendInfo = computed(() => {
  const configs = {
    increasing: {
      icon: 'mdi-trending-up',
      text: 'Trending up',
      color: 'text-red-600 dark:text-red-400',
    },
    decreasing: {
      icon: 'mdi-trending-down',
      text: 'Trending down',
      color: 'text-blue-600 dark:text-blue-400',
    },
    stable: {
      icon: 'mdi-trending-neutral',
      text: 'Stable',
      color: 'text-slate-600 dark:text-slate-400',
    },
  }
  return configs[props.trend as keyof typeof configs] || configs.stable
})
</script>

<template>
  <div
    class="group relative bg-white/80 dark:bg-slate-900/50 backdrop-blur-sm rounded-2xl border border-slate-200/60 dark:border-slate-700/60 transition-all duration-300 hover:shadow-lg hover:shadow-slate-200/20 dark:hover:shadow-slate-950/20 hover:-translate-y-0.5 card-enter"
    :class="statusConfig.glow"
  >
    <!-- Subtle status accent -->
    <div
      class="absolute top-0 left-1/2 transform -translate-x-1/2 w-64 sm:w-24 h-0.5 rounded-full opacity-60"
      :class="statusConfig.accent"
    ></div>

    <div class="p-6">
      <!-- Header -->
      <div class="flex items-start justify-between mb-6">
        <div class="flex items-center space-x-3">
          <div
            class="w-10 h-10 rounded-xl flex items-center justify-center bg-slate-50 dark:bg-slate-800/50 transition-colors duration-200"
            :class="statusConfig.iconColor"
          >
            <span :class="[iconClass, 'text-lg']"></span>
          </div>
          <div>
            <h3 class="font-medium text-slate-900 dark:text-slate-100 text-sm leading-tight">
              {{ title }}
            </h3>
          </div>
        </div>

        <span
          class="px-2.5 py-1 text-xs font-medium rounded-full transition-colors duration-200"
          :class="statusConfig.badge"
        >
          {{ status.charAt(0).toUpperCase() + status.slice(1) }}
        </span>
      </div>

      <!-- Main Value -->
      <div class="mb-4">
        <div class="flex items-baseline space-x-1">
          <span class="text-3xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
            {{ value }}
          </span>
          <span v-if="unit" class="text-sm font-medium text-slate-500 dark:text-slate-400">
            {{ unit }}
          </span>
        </div>
      </div>

      <!-- Trend -->
      <div class="flex items-center space-x-1.5">
        <span :class="[`mdi ${trendInfo.icon}`, trendInfo.color, 'text-sm']"></span>
        <span class="text-xs font-medium" :class="trendInfo.color">
          {{ trendInfo.text }}
        </span>
      </div>
    </div>

    <!-- Hover effect overlay -->
    <div
      class="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
    ></div>
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
.card-enter:nth-child(1) {
  animation-delay: 0ms;
}
.card-enter:nth-child(2) {
  animation-delay: 100ms;
}
.card-enter:nth-child(3) {
  animation-delay: 200ms;
}
.card-enter:nth-child(4) {
  animation-delay: 300ms;
}
</style>
