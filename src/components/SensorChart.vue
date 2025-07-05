<script setup lang="ts">
import { ref, computed, onMounted, watch, nextTick } from 'vue'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js'
import type { ChartDataset } from 'chart.js'
import { Line, Bar } from 'vue-chartjs'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler,
)

const props = defineProps<{
  title: string
  data: Array<{ time: string; value: number }>
  valueLabel: string
  chartColor?: string
  valueUnit?: string
  icon?: string
}>()

const chartType = ref<'line' | 'bar'>('line')
const chartRef = ref<InstanceType<typeof Line | typeof Bar> | null>(null)
const isLoading = ref(false)
const windowWidth = ref(typeof window !== 'undefined' ? window.innerWidth : 1024)
const devicePixelRatio = ref(typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1)

const isMobile = computed(() => windowWidth.value < 640)
const isTablet = computed(() => windowWidth.value >= 640 && windowWidth.value < 1024)
const isHighDPI = computed(() => devicePixelRatio.value > 1)

const getFontSizes = () => {
  const baseSize = isMobile.value ? 11 : isTablet.value ? 12 : 13
  const scaleFactor = isHighDPI.value ? 1.1 : 1

  return {
    tick: Math.round(baseSize * 0.85 * scaleFactor),
    tooltip: {
      title: Math.round(baseSize * 0.95 * scaleFactor),
      body: Math.round(baseSize * 0.85 * scaleFactor),
    },
    cardTitle: isMobile.value ? 16 : 18,
    cardSubtitle: isMobile.value ? 13 : 14,
    statLabel: 11,
    statValue: isMobile.value ? 13 : 14,
  }
}

const getThemeColor = (color: string) => {
  const colors = {
    '#10B981': {
      primary: '#10B981',
      light: '#34D399',
      bg: 'rgba(16, 185, 129, 0.1)',
      gradient: ['rgba(16, 185, 129, 0.2)', 'rgba(16, 185, 129, 0.05)', 'rgba(16, 185, 129, 0.01)'],
    },
    '#0D9488': {
      primary: '#0D9488',
      light: '#14B8A6',
      bg: 'rgba(13, 148, 136, 0.1)',
      gradient: ['rgba(13, 148, 136, 0.2)', 'rgba(13, 148, 136, 0.05)', 'rgba(13, 148, 136, 0.01)'],
    },
    '#7C3AED': {
      primary: '#7C3AED',
      light: '#8B5CF6',
      bg: 'rgba(124, 58, 237, 0.1)',
      gradient: ['rgba(124, 58, 237, 0.2)', 'rgba(124, 58, 237, 0.05)', 'rgba(124, 58, 237, 0.01)'],
    },
    '#F59E0B': {
      primary: '#F59E0B',
      light: '#FBBF24',
      bg: 'rgba(245, 158, 11, 0.1)',
      gradient: ['rgba(245, 158, 11, 0.2)', 'rgba(245, 158, 11, 0.05)', 'rgba(245, 158, 11, 0.01)'],
    },
  }
  return colors[color as keyof typeof colors] || colors['#10B981']
}

const createGradient = (theme: any): CanvasGradient | string => {
  const canvas = chartRef.value?.$el?.querySelector('canvas')
  if (!canvas) return theme.bg

  const ctx = canvas.getContext('2d')
  if (!ctx) return theme.bg

  const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height)
  gradient.addColorStop(0, theme.gradient[0])
  gradient.addColorStop(0.6, theme.gradient[1])
  gradient.addColorStop(1, theme.gradient[2])
  return gradient
}

const chartData = computed(() => {
  const theme = getThemeColor(props.chartColor || '#10B981')
  const currentType = chartType.value

  const datasets: ChartDataset<'line' | 'bar', number[]>[] = [
    {
      type: currentType,
      label: props.valueLabel,
      data: props.data.map((item) => item.value),
      borderColor: theme.primary,
      backgroundColor: currentType === 'bar' ? theme.bg : createGradient(theme),
      borderWidth: currentType === 'line' ? 2.5 : 0,
      tension: 0.3,
      fill: currentType === 'line',
      pointRadius: currentType === 'line' ? (isMobile.value || isTablet.value ? 3 : 0) : 0,
      pointHoverRadius: currentType === 'line' ? 6 : 0,
      pointBackgroundColor: theme.primary,
      pointBorderColor: '#ffffff',
      pointBorderWidth: 2,
      pointHitRadius: 20,
      cubicInterpolationMode: 'monotone',
      borderCapStyle: 'round',
      borderJoinStyle: 'round',
    },
  ]

  return {
    labels: props.data.map((item) => item.time),
    datasets,
  }
})

const chartOptions = computed(() => {
  const isDarkMode =
    typeof document !== 'undefined' && document.documentElement.classList.contains('dark')
  const gridColor = isDarkMode ? 'rgba(71, 85, 105, 0.1)' : 'rgba(148, 163, 184, 0.1)'
  const tickColor = isDarkMode ? 'rgba(148, 163, 184, 0.9)' : 'rgba(100, 116, 139, 0.9)'
  const tooltipBg = isDarkMode ? 'rgba(15, 23, 42, 0.98)' : 'rgba(255, 255, 255, 0.98)'
  const fontSizes = getFontSizes()

  return {
    responsive: true,
    maintainAspectRatio: false,
    devicePixelRatio: Math.max(devicePixelRatio.value, 2),
    animation: {
      duration: 600,
      easing: 'easeOutQuart' as const,
    },
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        enabled: true,
        backgroundColor: tooltipBg,
        titleColor: isDarkMode ? '#f8fafc' : '#0f172a',
        bodyColor: isDarkMode ? '#e2e8f0' : '#334155',
        borderWidth: 1,
        borderColor: isDarkMode ? 'rgba(71, 85, 105, 0.3)' : 'rgba(148, 163, 184, 0.3)',
        padding: 12,
        cornerRadius: 8,
        titleFont: {
          size: fontSizes.tooltip.title,
          weight: '600' as const,
          family:
            '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
        },
        bodyFont: {
          size: fontSizes.tooltip.body,
          weight: '500' as const,
          family:
            '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
        },
        displayColors: false,
        caretPadding: 6,
        usePointStyle: false,
        callbacks: {
          title: (tooltipItems: Array<{ label: string }>) => tooltipItems[0].label,
          label: (context: { parsed: { y: number }; dataset: { label?: string } }) => {
            const value = context.parsed.y?.toFixed(1) || '0'
            return `${value}${props.valueUnit ? ` ${props.valueUnit}` : ''}`
          },
        },
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
        border: {
          display: false,
        },
        ticks: {
          maxRotation: 0,
          autoSkip: true,
          maxTicksLimit: isMobile.value || isTablet.value ? 4 : 6,
          color: tickColor,
          font: {
            size: fontSizes.tick,
            weight: '500' as const,
            family:
              '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
            lineHeight: 1.2,
          },
          padding: 8,
          align: 'center' as const,
        },
      },
      y: {
        beginAtZero: true,
        border: {
          display: false,
        },
        grid: {
          color: gridColor,
          drawBorder: false,
          lineWidth: 1,
        },
        ticks: {
          font: {
            size: fontSizes.tick,
            weight: '500' as const,
            family:
              '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
            lineHeight: 1.2,
          },
          color: tickColor,
          padding: 8,
          maxTicksLimit: isMobile.value || isTablet.value ? 4 : 5,
          align: 'end' as const,
          callback: (value: number) => {
            const formatted = value.toFixed(value % 1 === 0 ? 0 : 1)
            return `${formatted}${props.valueUnit ? ` ${props.valueUnit}` : ''}`
          },
        },
      },
    },
    interaction: {
      mode: 'index' as const,
      intersect: false,
    },
    elements: {
      point: {
        hoverBorderWidth: 2,
      },
    },
    layout: {
      padding: {
        top: 12,
        right: 12,
        bottom: 12,
        left: 12,
      },
    },
  }
})

const toggleChartType = () => {
  chartType.value = chartType.value === 'line' ? 'bar' : 'line'
}

const getStats = () => {
  const values = props.data.map((item) => item.value)
  if (!values.length) return { min: 0, max: 0, avg: 0, current: 0 }

  const min = Math.min(...values)
  const max = Math.max(...values)
  const avg = values.reduce((sum, val) => sum + val, 0) / values.length
  const current = values[values.length - 1]

  return {
    min: Number(min.toFixed(1)),
    max: Number(max.toFixed(1)),
    avg: Number(avg.toFixed(1)),
    current: Number(current.toFixed(1)),
  }
}

const handleResize = () => {
  windowWidth.value = window.innerWidth
  devicePixelRatio.value = window.devicePixelRatio || 1
}

watch(
  () => props.data,
  () => {
    if (props.data.length) {
      isLoading.value = true
      setTimeout(() => {
        isLoading.value = false
      }, 300)
    }
  },
  { deep: true },
)

onMounted(() => {
  if (typeof window !== 'undefined') {
    window.addEventListener('resize', handleResize)
    handleResize()
  }

  if (props.data.length) {
    isLoading.value = true
    setTimeout(() => {
      isLoading.value = false
    }, 300)
  }

  return () => {
    if (typeof window !== 'undefined') {
      window.removeEventListener('resize', handleResize)
    }
  }
})
</script>

<template>
  <!-- Card with optimized text rendering -->
  <div
    class="bg-white/80 dark:bg-gray-900/80 rounded-2xl border border-gray-200/60 dark:border-gray-800/60 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden group text-rendering-optimized"
  >
    <!-- Header with crisp text -->
    <div class="px-6 py-4 border-b border-gray-100 dark:border-gray-800">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-3">
          <!-- Icon container -->
          <div
            class="w-10 h-10 rounded-xl flex items-center justify-center shadow-sm"
            :style="{ backgroundColor: chartColor || '#10B981' }"
          >
            <span class="mdi text-white text-2xl font-medium antialiased" :class="icon"></span>
          </div>

          <div class="min-w-0 flex-1">
            <!-- Optimized title text -->
            <h3
              class="font-semibold text-gray-900 dark:text-gray-100 antialiased leading-tight tracking-tight"
              :class="isMobile ? 'text-base' : 'text-lg'"
            >
              {{ title }}
            </h3>
            <!-- Optimized subtitle text -->
            <p
              class="text-gray-500 dark:text-gray-400 mt-0.5 antialiased leading-tight font-medium"
              :class="isMobile ? 'text-sm' : 'text-sm'"
            >
              Current:
              <span class="font-semibold tabular-nums">{{ getStats().current }}</span>
              <span class="font-normal">{{ valueUnit }}</span>
            </p>
          </div>
        </div>

        <!-- Toggle button with optimized icon -->
        <button
          @click="toggleChartType"
          class="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200 group focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
          :disabled="isLoading"
          :aria-label="`Switch to ${chartType === 'line' ? 'bar' : 'line'} chart`"
        >
          <svg
            v-if="chartType === 'line'"
            class="w-4 h-4 text-gray-500 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-300 transition-colors"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            stroke-width="2"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
            />
          </svg>
          <svg
            v-else
            class="w-4 h-4 text-gray-500 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-300 transition-colors"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            stroke-width="2"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z"
            />
          </svg>
        </button>
      </div>
    </div>

    <!-- Chart Container with enhanced rendering -->
    <div class="relative h-56 p-6">
      <!-- Loading overlay with crisp text -->
      <div
        v-if="isLoading"
        class="absolute inset-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm flex items-center justify-center z-10 rounded-lg"
      >
        <div class="flex items-center gap-2">
          <div
            class="w-4 h-4 border-2 border-gray-300 dark:border-gray-600 border-t-emerald-500 rounded-full animate-spin"
          ></div>
          <span class="text-sm text-gray-600 dark:text-gray-400 font-medium antialiased"
            >Loading...</span
          >
        </div>
      </div>

      <!-- Empty state with crisp text -->
      <div
        v-else-if="!chartData.datasets[0].data.length"
        class="absolute inset-0 flex items-center justify-center"
      >
        <div class="text-center">
          <div
            class="w-12 h-12 bg-gray-100 dark:bg-gray-800 rounded-xl flex items-center justify-center mx-auto mb-3"
          >
            <svg
              class="w-6 h-6 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              stroke-width="2"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
              />
            </svg>
          </div>
          <p class="text-sm font-medium text-gray-500 dark:text-gray-400 antialiased">
            No data available
          </p>
        </div>
      </div>

      <!-- Chart component with enhanced canvas rendering -->
      <div v-else class="h-full chart-container">
        <component
          :is="chartType === 'line' ? Line : Bar"
          :data="chartData as any"
          :options="chartOptions as any"
          ref="chartRef"
        />
      </div>
    </div>

    <!-- Stats Footer with optimized text rendering -->
    <div
      class="px-6 py-4 bg-gray-50/50 dark:bg-gray-800/50 border-t border-gray-100 dark:border-gray-800"
    >
      <div class="grid grid-cols-3 gap-4">
        <div class="text-center">
          <div class="flex items-center justify-center gap-1 mb-1">
            <div class="w-2 h-2 bg-red-500 rounded-full"></div>
            <p
              class="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide antialiased"
            >
              Min
            </p>
          </div>
          <p
            class="font-semibold text-gray-900 dark:text-gray-100 antialiased tabular-nums"
            :class="isMobile ? 'text-sm' : 'text-sm'"
          >
            {{ getStats().min }}
            <span class="text-xs text-gray-500 dark:text-gray-400 ml-1 font-normal">{{
              valueUnit
            }}</span>
          </p>
        </div>

        <div class="text-center">
          <div class="flex items-center justify-center gap-1 mb-1">
            <div class="w-2 h-2 bg-blue-500 rounded-full"></div>
            <p
              class="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide antialiased"
            >
              Avg
            </p>
          </div>
          <p
            class="font-semibold text-gray-900 dark:text-gray-100 antialiased tabular-nums"
            :class="isMobile ? 'text-sm' : 'text-sm'"
          >
            {{ getStats().avg }}
            <span class="text-xs text-gray-500 dark:text-gray-400 ml-1 font-normal">{{
              valueUnit
            }}</span>
          </p>
        </div>

        <div class="text-center">
          <div class="flex items-center justify-center gap-1 mb-1">
            <div class="w-2 h-2 bg-green-500 rounded-full"></div>
            <p
              class="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide antialiased"
            >
              Max
            </p>
          </div>
          <p
            class="font-semibold text-gray-900 dark:text-gray-100 antialiased tabular-nums"
            :class="isMobile ? 'text-sm' : 'text-sm'"
          >
            {{ getStats().max }}
            <span class="text-xs text-gray-500 dark:text-gray-400 ml-1 font-normal">{{
              valueUnit
            }}</span>
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Critical: Text rendering optimization */
.text-rendering-optimized {
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-rendering: optimizeLegibility;
  font-feature-settings:
    'kern' 1,
    'liga' 1,
    'calt' 1;
}

/* Enhanced chart container for crisp rendering */
.chart-container {
  /* Force hardware acceleration for smoother rendering */
  transform: translateZ(0);
  will-change: transform;
}

.chart-container canvas {
  /* Critical: Ensure crisp pixel rendering */
  image-rendering: -webkit-optimize-contrast;
  image-rendering: crisp-edges;
  image-rendering: pixelated;

  /* Prevent canvas scaling blur */
  width: 100% !important;
  height: 100% !important;
}

/* Tabular numbers for consistent digit spacing */
.tabular-nums {
  font-variant-numeric: tabular-nums;
  font-feature-settings: 'tnum' 1;
}

/* Enhanced antialiasing for all text elements */
h3,
p,
span,
button {
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

/* Smooth transitions matching app's design */
* {
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

/* Focus states matching app's design */
button:focus {
  outline: 2px solid theme('colors.emerald.500');
  outline-offset: 2px;
}

/* High DPI display optimizations */
@media (-webkit-min-device-pixel-ratio: 2), (min-resolution: 192dpi) {
  .text-rendering-optimized {
    -webkit-font-smoothing: subpixel-antialiased;
  }
}

/* Reduced motion support */
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}

/* High contrast mode support */
@media (prefers-contrast: high) {
  .text-rendering-optimized {
    -webkit-font-smoothing: auto;
    -moz-osx-font-smoothing: auto;
  }
}
</style>
