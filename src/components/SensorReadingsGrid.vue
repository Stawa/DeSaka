<script setup lang="ts">
import { computed } from 'vue'
import SensorCard from './SensorCard.vue'

const props = defineProps({
  sensorData: {
    type: Object,
    required: true,
  },
  onSensorClick: {
    type: Function,
    default: () => {},
  },
})

const emit = defineEmits(['refresh'])

const sensorCards = computed(() => [
  {
    id: 'soilTemperature',
    title: 'Soil Temperature',
    value: props.sensorData.soilTemperature?.value || 0,
    unit: props.sensorData.soilTemperature?.unit || '°C',
    status: props.sensorData.soilTemperature?.status || 'inactive',
    icon: 'thermometer',
    trend: 'stable',
  },
  {
    id: 'soilMoisture',
    title: 'Soil Moisture',
    value: props.sensorData.soilMoisture?.value || 0,
    unit: props.sensorData.soilMoisture?.unit || '%',
    status: props.sensorData.soilMoisture?.status || 'inactive',
    icon: 'water-percent',
    trend: 'increasing',
  },
  {
    id: 'soilPH',
    title: 'Soil pH Level',
    value: props.sensorData.soilPH?.value || 0,
    unit: props.sensorData.soilPH?.unit || 'pH',
    status: props.sensorData.soilPH?.status || 'inactive',
    icon: 'flask',
    trend: 'stable',
  },
  {
    id: 'airTemperature',
    title: 'Air Temperature',
    value: props.sensorData.airTemperature?.value || 0,
    unit: props.sensorData.airTemperature?.unit || '°C',
    status: props.sensorData.airTemperature?.status || 'inactive',
    icon: 'weather-partly-cloudy',
    trend: 'decreasing',
  },
  {
    id: 'airHumidity',
    title: 'Air Humidity',
    value: props.sensorData.airHumidity?.value || 0,
    unit: props.sensorData.airHumidity?.unit || '%',
    status: props.sensorData.airHumidity?.status || 'inactive',
    icon: 'water',
    trend: 'stable',
  },
  {
    id: 'lightIntensity',
    title: 'Light Intensity',
    value: props.sensorData.lightIntensity?.value || 0,
    unit: props.sensorData.lightIntensity?.unit || 'lux',
    status: props.sensorData.lightIntensity?.status || 'inactive',
    icon: 'white-balance-sunny',
    trend: 'increasing',
  },
])

const handleSensorClick = (sensorId: string) => {
  props.onSensorClick(sensorId)
}

const handleRefresh = () => {
  emit('refresh')
}
</script>

<template>
  <div
    class="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-2xl border border-gray-200/60 dark:border-gray-800/60 shadow-sm overflow-hidden"
  >
    <!-- Subtle accent bar -->
    <div class="h-1 bg-gradient-to-r from-emerald-500 to-teal-600"></div>

    <!-- Header -->
    <div class="px-6 py-5 border-b border-gray-100 dark:border-gray-800">
      <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <!-- Title Section -->
        <div class="flex items-center gap-4">
          <div
            class="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-100 to-emerald-50 dark:from-emerald-900/30 dark:to-emerald-800/20 flex items-center justify-center ring-1 ring-emerald-200/50 dark:ring-emerald-700/30"
          >
            <svg
              class="w-6 h-6 text-emerald-600 dark:text-emerald-400"
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
          <div>
            <h2 class="text-xl font-semibold text-gray-900 dark:text-gray-100">Sensor Readings</h2>
            <p class="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
              Real-time environmental monitoring
            </p>
          </div>
        </div>

        <!-- Refresh Button -->
        <button
          @click="handleRefresh"
          class="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-gray-400 dark:hover:border-gray-500 transition-all duration-200 shadow-sm hover:shadow-md"
        >
          <svg
            class="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            stroke-width="2"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M16.023 9.348h4.992M2.985 19.644v-4.992h4.992l-4.993 0 3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182"
            />
          </svg>
          Refresh
        </button>
      </div>
    </div>

    <!-- Sensor Cards Grid -->
    <div class="p-6">
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <div
          v-for="(sensor, index) in sensorCards"
          :key="sensor.id"
          @click="handleSensorClick(sensor.id)"
          class="cursor-pointer card-enter"
          :style="{ animationDelay: `${index * 100}ms` }"
        >
          <SensorCard
            :title="sensor.title"
            :value="sensor.value"
            :unit="sensor.unit"
            :status="sensor.status"
            :icon="sensor.icon"
            :trend="sensor.trend"
          />
        </div>
      </div>
    </div>
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
  opacity: 0;
}
</style>
