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
const chartHeight = ref(240)
const isLoading = ref(false)

const createGradient = (color: string): CanvasGradient | string => {
  const canvas = chartRef.value?.$el?.querySelector('canvas')
  if (!canvas) return color + '20'
  const ctx = canvas.getContext('2d')
  if (!ctx) return color + '20'

  const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height)
  gradient.addColorStop(0, color + '30')
  gradient.addColorStop(0.5, color + '15')
  gradient.addColorStop(1, color + '05')
  return gradient
}

const chartData = computed(() => {
  const primaryColor = props.chartColor || '#3B7D4A'
  const secondaryColor = props.secondaryColor || '#4A3B7D'
  const currentType = chartType.value

  const datasets: ChartDataset<'line' | 'bar', number[]>[] = [
    {
      type: currentType,
      label: props.valueLabel,
      data: props.data.map((item) => item.value),
      borderColor: primaryColor,
      backgroundColor: currentType === 'bar' ? primaryColor + '80' : createGradient(primaryColor),
      borderWidth: 2,
      tension: 0.4,
      fill: currentType === 'line',
      pointRadius: currentType === 'line' ? 3 : 0,
      pointHoverRadius: currentType === 'line' ? 6 : 0,
      pointBackgroundColor: '#fff',
      pointBorderColor: primaryColor,
      pointBorderWidth: 2,
      pointHitRadius: 30,
      cubicInterpolationMode: 'monotone',
    },
  ]

  if (props.secondaryData && props.secondaryLabel) {
    datasets.push({
      type: currentType,
      label: props.secondaryLabel,
      data: props.secondaryData.map((item) => item.value),
      borderColor: secondaryColor,
      backgroundColor: currentType === 'bar' ? secondaryColor + '60' : 'transparent',
      borderWidth: 2,
      borderDash: currentType === 'line' ? [5, 5] : undefined,
      tension: 0.4,
      fill: false,
      pointRadius: currentType === 'line' ? 3 : 0,
      pointHoverRadius: currentType === 'line' ? 6 : 0,
      pointBackgroundColor: '#fff',
      pointBorderColor: secondaryColor,
      pointBorderWidth: 2,
      pointHitRadius: 30,
    })
  }

  return {
    labels: props.data.map((item) => item.time),
    datasets,
  }
})

const chartOptions = computed(() => {
  const isDarkMode = document.documentElement.classList.contains('dark')
  const gridColor = isDarkMode ? 'rgba(75, 85, 99, 0.2)' : 'rgba(229, 231, 235, 0.8)'
  const tickColor = isDarkMode ? 'rgba(209, 213, 219, 0.8)' : 'rgba(107, 114, 128, 0.8)'
  const tooltipBgColor = isDarkMode ? 'rgba(31, 41, 55, 0.95)' : 'rgba(255, 255, 255, 0.95)'
  const tooltipTitleColor = isDarkMode ? '#e5e7eb' : '#333'
  const tooltipBodyColor = isDarkMode ? '#d1d5db' : '#666'
  const tooltipBorderColor = isDarkMode ? '#4b5563' : '#ddd'

  return {
    responsive: true,
    maintainAspectRatio: false,
    animation: {
      duration: 800,
      easing: chartType.value === 'line' ? ('easeOutQuart' as const) : ('easeOutQuad' as const),
    },
    plugins: {
      legend: {
        position: 'top' as const,
        align: 'start' as const,
        labels: {
          boxWidth: 12,
          boxHeight: 12,
          padding: 15,
          color: isDarkMode ? '#e5e7eb' : '#333',
          font: {
            size: 12,
            weight: 'normal' as const,
            family: '"Inter", sans-serif',
          },
        },
      },
      tooltip: {
        backgroundColor: tooltipBgColor,
        titleColor: tooltipTitleColor,
        bodyColor: tooltipBodyColor,
        borderColor: tooltipBorderColor,
        borderWidth: 1,
        padding: 12,
        cornerRadius: 8,
        titleFont: {
          size: 14,
          weight: 'bold' as const,
          family: '"Inter", sans-serif',
        },
        bodyFont: {
          size: 13,
          weight: 'normal' as const,
          family: '"Inter", sans-serif',
        },
        displayColors: true,
        boxWidth: 8,
        boxHeight: 8,
        boxPadding: 4,
        usePointStyle: true,
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
              label += context.parsed.y
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
          maxTicksLimit: 8,
          color: tickColor,
          font: {
            size: 11,
          },
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
          lineWidth: 0.5,
        },
        ticks: {
          font: {
            size: 11,
          },
          color: tickColor,
          callback: (value: number) => {
            return value + (props.valueUnit ? ` ${props.valueUnit}` : '')
          },
        },
      },
    },
    interaction: {
      mode: 'index' as const,
      intersect: false,
    },
    elements: {
      line: {
        borderWidth: 2,
      },
      point: {
        hoverBorderWidth: 4,
      },
    },
  }
})

const toggleChartType = () => {
  chartType.value = chartType.value === 'line' ? 'bar' : 'line'
  nextTick(() => {
    if (chartRef.value) {
      const chart = chartRef.value as unknown as { update: () => void }
      chart.update()
    }
  })
}

const getUnitFromLabel = () => {
  if (props.valueLabel.includes('(')) {
    return props.valueLabel.match(/\(([^)]+)\)/)?.at(1) || ''
  }
  return ''
}

const getAverageValue = () => {
  const data = chartData.value.datasets[0].data as number[]
  if (!data.length) return '0.0'
  const sum = data.reduce((acc, val) => acc + val, 0)
  return (sum / data.length).toFixed(1)
}

const getTimeRangeText = () => {
  if (!props.data || !props.data.length) return 'No data'

  try {
    const firstTimeStr = props.data[0]?.time
    const lastTimeStr = props.data[props.data.length - 1]?.time

    if (!firstTimeStr || !lastTimeStr) {
      return new Date().toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
    }

    const first = new Date(firstTimeStr)
    const last = new Date(lastTimeStr)

    if (isNaN(first.getTime()) || isNaN(last.getTime())) {
      return new Date().toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
    }

    const options: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' }

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
  }, 500)
}

watch(
  () => props.data,
  () => {
    if (props.data.length) {
      isLoading.value = true
      setTimeout(() => {
        isLoading.value = false
      }, 500)
    }
  },
  { deep: true },
)

onMounted(() => {
  const handleResize = () => {
    chartHeight.value = window.innerWidth < 768 ? 200 : 240
  }
  window.addEventListener('resize', handleResize)
  handleResize()

  if (props.data.length) {
    isLoading.value = true
    setTimeout(() => {
      isLoading.value = false
    }, 500)
  }

  return () => window.removeEventListener('resize', handleResize)
})
</script>

<template>
  <div class="w-full transition-all">
    <!-- Chart -->
    <div
      class="bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-3 shadow-inner overflow-hidden relative"
      :style="{ height: `${chartHeight}px` }"
    >
      <!-- Loading overlay -->
      <div
        v-if="isLoading"
        class="absolute inset-0 bg-gray-50/80 dark:bg-gray-800/80 flex items-center justify-center z-10"
      >
        <div class="animate-pulse flex flex-col items-center">
          <span class="mdi mdi-loading mdi-spin text-primary-500 text-2xl mb-2"></span>
          <span class="text-sm text-gray-500 dark:text-gray-400">Loading data...</span>
        </div>
      </div>

      <!-- Empty state -->
      <div
        v-else-if="!chartData.datasets[0].data.length"
        class="absolute inset-0 flex items-center justify-center"
      >
        <div class="text-center">
          <span
            class="mdi mdi-chart-timeline-variant text-gray-300 dark:text-gray-600 text-3xl block mb-2"
          ></span>
          <span class="text-sm text-gray-500 dark:text-gray-400">No data available</span>
        </div>
      </div>

      <!-- Chart component -->
      <div v-else class="relative h-full">
        <component
          :is="chartType === 'line' ? Line : Bar"
          :data="chartData as any"
          :options="chartOptions as any"
          ref="chartRef"
        />

        <!-- Time period indicator -->
        <div
          class="absolute top-2 right-2 bg-white/70 dark:bg-gray-800/70 text-xs text-gray-500 dark:text-gray-400 py-1 px-2 rounded-md backdrop-blur-sm"
        >
          {{ getTimeRangeText() }}
        </div>
      </div>
    </div>

    <!-- Footer Stats -->
    <div class="mt-4 flex flex-wrap items-center justify-between gap-y-3 text-sm">
      <div class="flex items-center gap-4 text-gray-700 dark:text-gray-300 flex-wrap">
        <div
          class="flex items-center gap-1.5 bg-green-50 dark:bg-green-900/20 px-2 py-1 rounded-md"
        >
          <span class="mdi mdi-arrow-up-bold text-green-500"></span>
          <span class="font-medium">
            {{
              chartData.datasets[0].data.length
                ? Math.max(...chartData.datasets[0].data).toFixed(1)
                : '0.0'
            }}
            <span class="text-xs text-gray-500 dark:text-gray-400 ml-0.5">{{
              getUnitFromLabel()
            }}</span>
          </span>
        </div>
        <div class="flex items-center gap-1.5 bg-red-50 dark:bg-red-900/20 px-2 py-1 rounded-md">
          <span class="mdi mdi-arrow-down-bold text-red-500"></span>
          <span class="font-medium">
            {{
              chartData.datasets[0].data.length
                ? Math.min(...chartData.datasets[0].data).toFixed(1)
                : '0.0'
            }}
            <span class="text-xs text-gray-500 dark:text-gray-400 ml-0.5">{{
              getUnitFromLabel()
            }}</span>
          </span>
        </div>
        <div class="flex items-center gap-1.5 bg-blue-50 dark:bg-blue-900/20 px-2 py-1 rounded-md">
          <span class="mdi mdi-calculator-variant text-blue-500"></span>
          <span class="font-medium">
            {{ getAverageValue() }}
            <span class="text-xs text-gray-500 dark:text-gray-400 ml-0.5">{{
              getUnitFromLabel()
            }}</span>
          </span>
        </div>
      </div>

      <div class="flex gap-2">
        <button
          class="text-xs px-2 py-1 rounded bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors flex items-center"
          @click="toggleChartType"
        >
          <span
            class="mdi"
            :class="chartType === 'line' ? 'mdi-chart-bar' : 'mdi-chart-line'"
          ></span>
          <span class="ml-1">{{ chartType === 'line' ? 'Bar' : 'Line' }}</span>
        </button>
        <button
          class="text-xs px-2 py-1 rounded bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors flex items-center"
          @click="zoomToData"
        >
          <span class="mdi mdi-magnify"></span>
          <span class="ml-1">Auto Scale</span>
        </button>
      </div>
    </div>
  </div>
</template>
