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
  secondaryData?: Array<{ time: string; value: number }>
  valueLabel: string
  secondaryLabel?: string
  chartColor?: string
  secondaryColor?: string
  valueUnit?: string
}>()

const chartType = ref<'line' | 'bar'>('line')
const chartRef = ref<InstanceType<typeof Line | typeof Bar> | null>(null)
const chartHeight = ref(280)
const isLoading = ref(false)

const createGradient = (color: string): CanvasGradient | string => {
  const canvas = chartRef.value?.$el?.querySelector('canvas')
  if (!canvas) return color + '10'
  const ctx = canvas.getContext('2d')
  if (!ctx) return color + '10'

  const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height)
  gradient.addColorStop(0, color + '15')
  gradient.addColorStop(0.8, color + '08')
  gradient.addColorStop(1, color + '02')
  return gradient
}

const chartData = computed(() => {
  const primaryColor = props.chartColor || '#6366f1'
  const secondaryColor = props.secondaryColor || '#f59e0b'
  const currentType = chartType.value

  const datasets: ChartDataset<'line' | 'bar', number[]>[] = [
    {
      type: currentType,
      label: props.valueLabel,
      data: props.data.map((item) => item.value),
      borderColor: primaryColor,
      backgroundColor: currentType === 'bar' ? primaryColor + '12' : createGradient(primaryColor),
      borderWidth: currentType === 'line' ? 2.5 : 0,
      tension: 0.3,
      fill: currentType === 'line',
      pointRadius: currentType === 'line' ? 0 : 0,
      pointHoverRadius: currentType === 'line' ? 5 : 0,
      pointBackgroundColor: primaryColor,
      pointBorderColor: '#ffffff',
      pointBorderWidth: 2,
      pointHitRadius: 15,
      cubicInterpolationMode: 'monotone',
      borderCapStyle: 'round',
      borderJoinStyle: 'round',
    },
  ]

  if (props.secondaryData && props.secondaryLabel) {
    datasets.push({
      type: currentType,
      label: props.secondaryLabel,
      data: props.secondaryData.map((item) => item.value),
      borderColor: secondaryColor,
      backgroundColor: currentType === 'bar' ? secondaryColor + '12' : 'transparent',
      borderWidth: currentType === 'line' ? 2.5 : 0,
      borderDash: currentType === 'line' ? [6, 4] : undefined,
      tension: 0.3,
      fill: false,
      pointRadius: currentType === 'line' ? 0 : 0,
      pointHoverRadius: currentType === 'line' ? 5 : 0,
      pointBackgroundColor: secondaryColor,
      pointBorderColor: '#ffffff',
      pointBorderWidth: 2,
      pointHitRadius: 15,
      borderCapStyle: 'round',
      borderJoinStyle: 'round',
    })
  }

  return {
    labels: props.data.map((item) => item.time),
    datasets,
  }
})

const chartOptions = computed(() => {
  const isDarkMode = document.documentElement.classList.contains('dark')
  const gridColor = isDarkMode ? 'rgba(71, 85, 105, 0.15)' : 'rgba(148, 163, 184, 0.15)'
  const tickColor = isDarkMode ? 'rgba(148, 163, 184, 0.7)' : 'rgba(100, 116, 139, 0.7)'
  const tooltipBgColor = isDarkMode ? 'rgba(15, 23, 42, 0.95)' : 'rgba(255, 255, 255, 0.95)'
  const tooltipTitleColor = isDarkMode ? '#f1f5f9' : '#1e293b'
  const tooltipBodyColor = isDarkMode ? '#cbd5e1' : '#475569'

  return {
    responsive: true,
    maintainAspectRatio: false,
    animation: {
      duration: 600,
      easing: 'easeOutQuart' as const,
    },
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: tooltipBgColor,
        titleColor: tooltipTitleColor,
        bodyColor: tooltipBodyColor,
        borderWidth: 0,
        padding: 16,
        cornerRadius: 12,
        titleFont: {
          size: 13,
          weight: '600' as const,
          family: 'system-ui, -apple-system, sans-serif',
        },
        bodyFont: {
          size: 12,
          weight: '500' as const,
          family: 'system-ui, -apple-system, sans-serif',
        },
        displayColors: false,
        caretPadding: 8,
        callbacks: {
          title: (tooltipItems: Array<{ label: string }>) => {
            return tooltipItems[0].label
          },
          label: (context: { parsed: { y: number }; dataset: { label?: string } }) => {
            let label = context.dataset.label || ''
            if (label) {
              label += ': '
            }
            if (context.parsed.y !== null) {
              label += context.parsed.y.toLocaleString()
              if (props.valueUnit) {
                label += ` ${props.valueUnit}`
              }
            }
            return label
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
          maxTicksLimit: 6,
          color: tickColor,
          font: {
            size: 11,
            weight: '500' as const,
            family: 'system-ui, -apple-system, sans-serif',
          },
          padding: 8,
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
            size: 11,
            weight: '500' as const,
            family: 'system-ui, -apple-system, sans-serif',
          },
          color: tickColor,
          padding: 12,
          callback: (value: number) => {
            return value.toLocaleString() + (props.valueUnit ? ` ${props.valueUnit}` : '')
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
        hoverBorderWidth: 3,
      },
    },
  }
})

const toggleChartType = () => {
  chartType.value = chartType.value === 'line' ? 'bar' : 'line'
  nextTick(() => {
    if (chartRef.value) {
      const chart = chartRef.value.chart
      if (chart) {
        ;(chart as unknown as { update: () => void }).update()
      }
    }
  })
}

const getUnitFromLabel = () => {
  if (props.valueLabel.includes('(')) {
    return props.valueLabel.match(/\(([^)]+)\)/)?.at(1) || ''
  }
  return props.valueUnit || ''
}

const getAverageValue = () => {
  const data = chartData.value.datasets[0].data as number[]
  if (!data.length) return '0'
  const sum = data.reduce((acc, val) => acc + val, 0)
  return Math.round(sum / data.length).toLocaleString()
}

const getMaxValue = () => {
  const data = chartData.value.datasets[0].data as number[]
  return data.length ? Math.max(...data).toLocaleString() : '0'
}

const getMinValue = () => {
  const data = chartData.value.datasets[0].data as number[]
  return data.length ? Math.min(...data).toLocaleString() : '0'
}

const getTimeRangeText = () => {
  if (!props.data || !props.data.length) return 'No data'

  try {
    const firstTimeStr = props.data[0]?.time
    const lastTimeStr = props.data[props.data.length - 1]?.time

    if (!firstTimeStr || !lastTimeStr) {
      return new Date().toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      })
    }

    const first = new Date(firstTimeStr)
    const last = new Date(lastTimeStr)

    if (isNaN(first.getTime()) || isNaN(last.getTime())) {
      return new Date().toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      })
    }

    const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'short', day: 'numeric' }

    if (first.toDateString() === last.toDateString()) {
      return first.toLocaleDateString(undefined, options)
    }

    return `${first.toLocaleDateString(undefined, options)} - ${last.toLocaleDateString(undefined, options)}`
  } catch (error) {
    console.error('Error formatting date range', error)
    return new Date().toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
  }
}

const zoomToData = () => {
  if (!chartData.value.datasets[0].data.length) return
  isLoading.value = true
  setTimeout(() => {
    isLoading.value = false
  }, 400)
}

watch(
  () => props.data,
  () => {
    if (props.data.length) {
      isLoading.value = true
      setTimeout(() => {
        isLoading.value = false
      }, 400)
    }
  },
  { deep: true },
)

onMounted(() => {
  const handleResize = () => {
    chartHeight.value = window.innerWidth < 768 ? 240 : 280
  }
  window.addEventListener('resize', handleResize)
  handleResize()

  if (props.data.length) {
    isLoading.value = true
    setTimeout(() => {
      isLoading.value = false
    }, 400)
  }

  return () => window.removeEventListener('resize', handleResize)
})
</script>

<template>
  <div class="w-full space-y-6">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div class="space-y-1">
        <h3 class="text-lg font-semibold text-gray-900 dark:text-gray-100">{{ title }}</h3>
        <p class="text-sm text-gray-500 dark:text-gray-400">{{ getTimeRangeText() }}</p>
      </div>

      <div class="flex items-center gap-2">
        <button
          class="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors"
          @click="toggleChartType"
        >
          <svg
            v-if="chartType === 'line'"
            class="w-3.5 h-3.5"
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
          <svg v-else class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z"
            />
          </svg>
          {{ chartType === 'line' ? 'Bar' : 'Line' }}
        </button>

        <button
          class="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors"
          @click="zoomToData"
        >
          <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          Fit
        </button>
      </div>
    </div>

    <!-- Chart -->
    <div
      class="relative bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden"
      :style="{ height: `${chartHeight}px` }"
    >
      <!-- Loading overlay -->
      <div
        v-if="isLoading"
        class="absolute inset-0 bg-white/80 dark:bg-gray-900/80 flex items-center justify-center z-10 backdrop-blur-sm"
      >
        <div class="flex flex-col items-center space-y-3">
          <div
            class="w-8 h-8 border-2 border-gray-300 dark:border-gray-600 border-t-indigo-500 rounded-full animate-spin"
          ></div>
          <span class="text-sm font-medium text-gray-600 dark:text-gray-400">Loading...</span>
        </div>
      </div>

      <!-- Empty state -->
      <div
        v-else-if="!chartData.datasets[0].data.length"
        class="absolute inset-0 flex items-center justify-center"
      >
        <div class="text-center space-y-3">
          <div
            class="w-12 h-12 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto"
          >
            <svg
              class="w-6 h-6 text-gray-400"
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
          <p class="text-sm font-medium text-gray-500 dark:text-gray-400">No data available</p>
        </div>
      </div>

      <!-- Chart component -->
      <div v-else class="h-full p-6">
        <component
          :is="chartType === 'line' ? Line : Bar"
          :data="chartData as any"
          :options="chartOptions as any"
          ref="chartRef"
        />
      </div>
    </div>

    <!-- Stats -->
    <div class="grid grid-cols-3 gap-4">
      <div
        class="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-4"
      >
        <div class="flex items-center justify-between">
          <div>
            <p class="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
              Peak
            </p>
            <p class="text-lg font-semibold text-gray-900 dark:text-gray-100 mt-1">
              {{ getMaxValue() }}
              <span class="text-xs text-gray-500 dark:text-gray-400 ml-1">{{
                getUnitFromLabel()
              }}</span>
            </p>
          </div>
          <div
            class="w-8 h-8 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg flex items-center justify-center"
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
                d="M7 11l5-5m0 0l5 5m-5-5v12"
              />
            </svg>
          </div>
        </div>
      </div>

      <div
        class="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-4"
      >
        <div class="flex items-center justify-between">
          <div>
            <p class="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
              Average
            </p>
            <p class="text-lg font-semibold text-gray-900 dark:text-gray-100 mt-1">
              {{ getAverageValue() }}
              <span class="text-xs text-gray-500 dark:text-gray-400 ml-1">{{
                getUnitFromLabel()
              }}</span>
            </p>
          </div>
          <div
            class="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center"
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
                d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"
              />
            </svg>
          </div>
        </div>
      </div>

      <div
        class="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-4"
      >
        <div class="flex items-center justify-between">
          <div>
            <p class="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
              Low
            </p>
            <p class="text-lg font-semibold text-gray-900 dark:text-gray-100 mt-1">
              {{ getMinValue() }}
              <span class="text-xs text-gray-500 dark:text-gray-400 ml-1">{{
                getUnitFromLabel()
              }}</span>
            </p>
          </div>
          <div
            class="w-8 h-8 bg-red-100 dark:bg-red-900/30 rounded-lg flex items-center justify-center"
          >
            <svg
              class="w-4 h-4 text-red-600 dark:text-red-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M17 13l-5 5m0 0l-5-5m5 5V6"
              />
            </svg>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
