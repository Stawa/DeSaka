<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { Line } from 'vue-chartjs'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js'
import type { ChartDataset } from 'chart.js'

type CustomLineDataset = ChartDataset<'line', number[]> & {
  borderDash?: number[]
}

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
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
}>()

const chartData = computed(() => {
  // Create gradient for the chart
  const createGradient = (ctx: any, color: string) => {
    if (!ctx) return color + '20'

    const gradient = ctx.createLinearGradient(0, 0, 0, ctx.canvas.height)
    const colorWithOpacity = (opacity: string) => color + opacity

    gradient.addColorStop(0, colorWithOpacity('30'))
    gradient.addColorStop(0.5, colorWithOpacity('15'))
    gradient.addColorStop(1, colorWithOpacity('05'))

    return gradient
  }

  // Get the chart context if available
  const chartElement = document.querySelector('canvas')?.getContext('2d')

  const primaryColor = props.chartColor || '#3B7D4A'
  const secondaryColor = props.secondaryColor || '#4A3B7D'

  const datasets: CustomLineDataset[] = [
    {
      label: props.valueLabel,
      data: props.data.map((item) => item.value),
      borderColor: primaryColor,
      backgroundColor: createGradient(chartElement, primaryColor),
      borderWidth: 2,
      tension: 0.4,
      fill: true,
      pointRadius: 3,
      pointHoverRadius: 6,
      pointBackgroundColor: '#fff',
      pointBorderColor: primaryColor,
      pointBorderWidth: 2,
      pointHitRadius: 30,
      cubicInterpolationMode: 'monotone',
    },
  ]

  if (props.secondaryData && props.secondaryLabel) {
    datasets.push({
      label: props.secondaryLabel,
      data: props.secondaryData.map((item) => item.value),
      borderColor: secondaryColor,
      backgroundColor: 'transparent',
      borderWidth: 2,
      borderDash: [5, 5],
      tension: 0.4,
      fill: false,
      pointRadius: 3,
      pointHoverRadius: 6,
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

const chartOptions = computed(() => ({
  responsive: true,
  maintainAspectRatio: false,
  animation: {
    duration: 1000,
    easing: 'easeOutQuart' as const,
  },
  plugins: {
    legend: {
      position: 'top' as const,
      align: 'end' as 'start' | 'end' | 'center' | undefined,
      labels: {
        boxWidth: 12,
        usePointStyle: true,
        pointStyle: 'circle',
        color: document.documentElement.classList.contains('dark') ? '#e5e7eb' : '#333',
        font: {
          size: 11,
          family: '"Inter", sans-serif',
        },
        padding: 15,
      },
    },
    tooltip: {
      mode: 'index' as 'index' | 'nearest' | 'x' | 'dataset' | 'point' | 'y',
      intersect: false,
      backgroundColor: document.documentElement.classList.contains('dark')
        ? 'rgba(31, 41, 55, 0.95)'
        : 'rgba(255, 255, 255, 0.95)',
      titleColor: document.documentElement.classList.contains('dark') ? '#e5e7eb' : '#333',
      bodyColor: document.documentElement.classList.contains('dark') ? '#d1d5db' : '#666',
      borderColor: document.documentElement.classList.contains('dark') ? '#4b5563' : '#ddd',
      borderWidth: 1,
      padding: 12,
      boxPadding: 6,
      cornerRadius: 8,
      displayColors: true,
      titleFont: {
        size: 12,
        weight: 'bold',
        family: '"Inter", sans-serif',
      },
      bodyFont: {
        size: 11,
        family: '"Inter", sans-serif',
      },
      callbacks: {
        label: function (context: any) {
          let label = context.dataset.label || ''
          if (label) {
            label += ': '
          }
          if (context.parsed.y !== null) {
            label += context.parsed.y.toFixed(1)
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
        color: document.documentElement.classList.contains('dark') ? '#9ca3af' : '#666',
        font: {
          size: 10,
          family: '"Inter", sans-serif',
        },
        padding: 8,
      },
    },
    y: {
      beginAtZero: false,
      border: {
        display: false,
      },
      grid: {
        color: document.documentElement.classList.contains('dark')
          ? 'rgba(255, 255, 255, 0.05)'
          : 'rgba(0, 0, 0, 0.05)',
        drawBorder: false,
        lineWidth: 0.5,
      },
      ticks: {
        precision: 1,
        color: document.documentElement.classList.contains('dark') ? '#9ca3af' : '#666',
        font: {
          size: 10,
          family: '"Inter", sans-serif',
        },
        padding: 8,
        callback: function (this: any, value: string | number) {
          return typeof value === 'number' ? value.toFixed(1) : value
        },
      },
    },
  },
  interaction: {
    mode: 'nearest' as const,
    axis: 'x' as const,
    intersect: false,
  },
  elements: {
    line: {
      tension: 0.4,
      borderWidth: 2,
    },
    point: {
      radius: 2,
      hoverRadius: 5,
      hitRadius: 30,
      borderWidth: 2,
    },
  },
}))

const chartHeight = ref(240)

onMounted(() => {
  const handleResize = () => {
    chartHeight.value = window.innerWidth < 768 ? 200 : 240
  }

  window.addEventListener('resize', handleResize)
  handleResize()

  return () => {
    window.removeEventListener('resize', handleResize)
  }
})
</script>

<template>
  <div
    class="bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 rounded-xl shadow-md p-5 transition-all duration-300 hover:shadow-lg border border-gray-100 dark:border-gray-700 transform hover:-translate-y-1"
  >
    <div class="flex justify-between items-center mb-4">
      <div class="flex items-center">
        <div class="bg-primary-100 dark:bg-primary-900/30 p-1.5 rounded-lg mr-2">
          <span class="mdi mdi-chart-line text-primary-600 dark:text-primary-400"></span>
        </div>
        <h3 class="font-bold text-gray-800 dark:text-gray-200">{{ title }}</h3>
      </div>

      <div class="flex space-x-2">
        <button
          class="text-gray-500 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 focus:outline-none transition-colors p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"
          title="Download Data"
        >
          <span class="mdi mdi-download"></span>
        </button>

        <button
          class="text-gray-500 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 focus:outline-none transition-colors p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"
          title="Expand Chart"
        >
          <span class="mdi mdi-arrow-expand"></span>
        </button>

        <button
          class="text-gray-500 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 focus:outline-none transition-colors p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"
          title="More Options"
        >
          <span class="mdi mdi-dots-vertical"></span>
        </button>
      </div>
    </div>

    <!-- Chart Container with Subtle Border -->
    <div
      class="bg-white dark:bg-gray-800 rounded-lg p-3 border border-gray-100 dark:border-gray-700 shadow-sm mb-3"
      :style="{ height: `${chartHeight}px` }"
    >
      <!--@vue-ignore-->
      <Line :data="chartData" :options="chartOptions" />
    </div>

    <!-- Chart Footer with Stats -->
    <div
      class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mt-3 text-xs"
    >
      <div class="flex flex-wrap items-center gap-3 w-full sm:w-auto">
        <div class="flex items-center text-gray-600 dark:text-gray-300 whitespace-nowrap">
          <span class="mdi mdi-arrow-up-bold text-green-500 mr-1"></span>
          <span class="truncate">
            High: {{ Math.max(...chartData.datasets[0].data).toFixed(1)
            }}{{
              props.valueLabel.includes('(')
                ? props.valueLabel.match(/\(([^)]+)\)/)?.at(1) || ''
                : ''
            }}
          </span>
        </div>

        <div class="flex items-center text-gray-600 dark:text-gray-300 whitespace-nowrap">
          <span class="mdi mdi-arrow-down-bold text-red-500 mr-1"></span>
          <span class="truncate">
            Low: {{ Math.min(...chartData.datasets[0].data).toFixed(1)
            }}{{
              props.valueLabel.includes('(')
                ? props.valueLabel.match(/\(([^)]+)\)/)?.at(1) || ''
                : ''
            }}
          </span>
        </div>
      </div>

      <div
        class="flex items-center space-x-1 bg-gray-100 dark:bg-gray-700 rounded-full p-1 mt-2 sm:mt-0"
      >
        <button
          class="px-2 sm:px-3 py-1 rounded-full text-xs font-medium bg-primary-500 text-white"
        >
          24h
        </button>
        <button
          class="px-2 sm:px-3 py-1 rounded-full text-xs font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
        >
          7d
        </button>
        <button
          class="px-2 sm:px-3 py-1 rounded-full text-xs font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
        >
          30d
        </button>
      </div>
    </div>
  </div>
</template>
