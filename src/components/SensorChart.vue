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
  const datasets: CustomLineDataset[] = [
    {
      label: props.valueLabel,
      data: props.data.map((item) => item.value),
      borderColor: props.chartColor || '#3B7D4A',
      backgroundColor: (props.chartColor || '#3B7D4A') + '20',
      borderWidth: 2,
      tension: 0.4,
      fill: true,
      pointRadius: 2,
      pointHoverRadius: 4,
    },
  ]

  if (props.secondaryData && props.secondaryLabel) {
    datasets.push({
      label: props.secondaryLabel,
      data: props.secondaryData.map((item) => item.value),
      borderColor: props.secondaryColor || '#4A3B7D',
      backgroundColor: 'transparent',
      borderWidth: 2,
      borderDash: [5, 5],
      tension: 0.4,
      fill: false,
      pointRadius: 2,
      pointHoverRadius: 4,
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
  plugins: {
    legend: {
      position: 'top' as const,
      align: 'end' as 'start' | 'end' | 'center' | undefined,
      labels: {
        boxWidth: 12,
        usePointStyle: true,
        pointStyle: 'circle',
        color: document.documentElement.classList.contains('dark') ? '#e5e7eb' : '#333',
      },
    },
    tooltip: {
      mode: 'index' as 'index' | 'nearest' | 'x' | 'dataset' | 'point' | 'y',
      intersect: false,
      backgroundColor: document.documentElement.classList.contains('dark')
        ? 'rgba(31, 41, 55, 0.9)'
        : 'rgba(255, 255, 255, 0.9)',
      titleColor: document.documentElement.classList.contains('dark') ? '#e5e7eb' : '#333',
      bodyColor: document.documentElement.classList.contains('dark') ? '#d1d5db' : '#666',
      borderColor: document.documentElement.classList.contains('dark') ? '#4b5563' : '#ddd',
      borderWidth: 1,
      padding: 10,
      boxPadding: 5,
      cornerRadius: 4,
      displayColors: true,
    },
  },
  scales: {
    x: {
      grid: {
        display: false,
      },
      ticks: {
        maxRotation: 0,
        autoSkip: true,
        maxTicksLimit: 8,
        color: document.documentElement.classList.contains('dark') ? '#9ca3af' : '#666',
      },
    },
    y: {
      beginAtZero: false,
      grid: {
        color: document.documentElement.classList.contains('dark')
          ? 'rgba(255, 255, 255, 0.05)'
          : 'rgba(0, 0, 0, 0.05)',
      },
      ticks: {
        precision: 1,
        color: document.documentElement.classList.contains('dark') ? '#9ca3af' : '#666',
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
    class="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 transition-all duration-300 hover:shadow-lg"
  >
    <div class="flex justify-between items-center mb-4">
      <h3 class="font-semibold text-gray-700 dark:text-gray-200">{{ title }}</h3>

      <div class="flex space-x-2">
        <button
          class="text-gray-500 dark:text-gray-400 hover:text-primary dark:hover:text-primary-300 focus:outline-none"
          title="Download Data"
        >
          <span class="mdi mdi-download text-sm"></span>
        </button>

        <button
          class="text-gray-500 dark:text-gray-400 hover:text-primary dark:hover:text-primary-300 focus:outline-none"
          title="Expand Chart"
        >
          <span class="mdi mdi-arrow-expand text-sm"></span>
        </button>
      </div>
    </div>

    <div :style="{ height: `${chartHeight}px` }">
      <Line :data="chartData" :options="chartOptions" />
    </div>

    <div class="mt-3 text-xs text-gray-500 dark:text-gray-400 flex justify-between items-center">
      <span>24-hour trend</span>

      <div class="flex space-x-4">
        <button
          class="text-gray-600 dark:text-gray-300 hover:text-primary dark:hover:text-primary-300 focus:outline-none"
        >
          24h
        </button>
        <button
          class="text-gray-400 dark:text-gray-500 hover:text-primary dark:hover:text-primary-300 focus:outline-none"
        >
          7d
        </button>
        <button
          class="text-gray-400 dark:text-gray-500 hover:text-primary dark:hover:text-primary-300 focus:outline-none"
        >
          30d
        </button>
      </div>
    </div>
  </div>
</template>
