<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import SensorChart from '@/components/SensorChart.vue'

defineProps<{
  selectedSensors: string[]
  chartData: Record<string, Array<{ time: string; value: number }>>
  getSensorById: (id: string) => { name: string; color: string; unit: string } | undefined
  toggleSensor: (id: string) => void
}>()

const chartLayout = ref<'grid' | 'list'>('list')
const screenWidth = ref(window.innerWidth)

const isDesktop = computed(() => screenWidth.value >= 1024)

const updateScreenWidth = () => {
  screenWidth.value = window.innerWidth
}

onMounted(() => {
  window.addEventListener('resize', updateScreenWidth)
})

onUnmounted(() => {
  window.removeEventListener('resize', updateScreenWidth)
})
</script>

<template>
  <!-- Header -->
  <div class="mb-8">
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-medium text-gray-900 dark:text-white">Sensors</h1>
        <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">
          {{ selectedSensors.length }} of {{ selectedSensors.length }} selected
        </p>
      </div>

      <!-- Layout toggle - only show on desktop -->
      <div v-if="isDesktop" class="flex border border-gray-200 dark:border-gray-700 rounded-lg">
        <button
          @click="chartLayout = 'grid'"
          class="px-3 py-2 text-sm border-r border-gray-200 dark:border-gray-700 rounded-l-lg transition-colors"
          :class="
            chartLayout === 'grid'
              ? 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white'
              : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
          "
        >
          <span class="mdi mdi-view-grid"></span>
        </button>
        <button
          @click="chartLayout = 'list'"
          class="px-3 py-2 text-sm rounded-r-lg transition-colors"
          :class="
            chartLayout === 'list'
              ? 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white'
              : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
          "
        >
          <span class="mdi mdi-view-list"></span>
        </button>
      </div>
    </div>
  </div>

  <!-- Charts -->
  <div v-if="selectedSensors.length > 0">
    <div
      class="grid gap-6"
      :class="{
        'grid-cols-1': !isDesktop || chartLayout === 'list',
        'grid-cols-1 lg:grid-cols-2': isDesktop && chartLayout === 'grid',
      }"
    >
      <div
        v-for="sensorId in selectedSensors"
        :key="sensorId"
        class="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg"
      >
        <!-- Header -->
        <div
          class="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700"
        >
          <div class="flex items-center gap-3">
            <div
              class="w-3 h-3 rounded-full"
              :style="{ backgroundColor: getSensorById(sensorId)?.color || '#6B7280' }"
            ></div>
            <div>
              <h3 class="font-medium text-gray-900 dark:text-white">
                {{ getSensorById(sensorId)?.name || 'Unknown Sensor' }}
              </h3>
              <p class="text-sm text-gray-500 dark:text-gray-400">
                {{ getSensorById(sensorId)?.unit || 'No unit' }}
              </p>
            </div>
          </div>

          <button
            @click="toggleSensor(sensorId)"
            class="p-1 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 transition-colors"
            title="Remove sensor"
          >
            <span class="mdi mdi-close text-lg"></span>
          </button>
        </div>

        <!-- Chart -->
        <div class="p-4">
          <SensorChart
            :title="getSensorById(sensorId)?.name || ''"
            :data="chartData[sensorId] || []"
            :valueLabel="getSensorById(sensorId)?.name || ''"
            :chartColor="getSensorById(sensorId)?.color || '#6B7280'"
            :showTimeRange="false"
          />
        </div>
      </div>
    </div>
  </div>

  <!-- Empty state -->
  <div v-else class="text-center py-12">
    <div
      class="w-12 h-12 mx-auto mb-4 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center"
    >
      <span class="mdi mdi-chart-line text-gray-400 dark:text-gray-500 text-xl"></span>
    </div>
    <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-2">No sensors selected</h3>
    <p class="text-gray-500 dark:text-gray-400">Select sensors to view their data</p>
  </div>
</template>
