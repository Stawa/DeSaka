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

const sensorCards = computed(() => [
  {
    id: 'soilTemperature',
    name: 'Soil Temperature',
    value: props.sensorData.soilTemperature?.value || 0,
    unit: props.sensorData.soilTemperature?.unit || '°C',
    status: props.sensorData.soilTemperature?.status || 'inactive',
    icon: 'mdi-thermometer',
    category: 'Soil',
    lastUpdate: '2 min ago',
    trend: 'stable',
  },
  {
    id: 'soilMoisture',
    name: 'Soil Moisture',
    value: props.sensorData.soilMoisture?.value || 0,
    unit: props.sensorData.soilMoisture?.unit || '%',
    status: props.sensorData.soilMoisture?.status || 'inactive',
    icon: 'mdi-water-percent',
    category: 'Soil',
    lastUpdate: '1 min ago',
    trend: 'stable',
  },
  {
    id: 'soilPH',
    name: 'Soil pH Level',
    value: props.sensorData.soilPH?.value || 0,
    unit: props.sensorData.soilPH?.unit || 'pH',
    status: props.sensorData.soilPH?.status || 'inactive',
    icon: 'mdi-flask',
    category: 'Soil',
    lastUpdate: '3 min ago',
    trend: 'stable',
  },
  {
    id: 'airTemperature',
    name: 'Air Temperature',
    value: props.sensorData.airTemperature?.value || 0,
    unit: props.sensorData.airTemperature?.unit || '°C',
    status: props.sensorData.airTemperature?.status || 'inactive',
    icon: 'mdi-weather-partly-cloudy',
    category: 'Air',
    lastUpdate: '1 min ago',
    trend: 'stable',
  },
  {
    id: 'airHumidity',
    name: 'Air Humidity',
    value: props.sensorData.airHumidity?.value || 0,
    unit: props.sensorData.airHumidity?.unit || '%',
    status: props.sensorData.airHumidity?.status || 'inactive',
    icon: 'mdi-water',
    category: 'Air',
    lastUpdate: '2 min ago',
    trend: 'stable',
  },
  {
    id: 'lightIntensity',
    name: 'Light Intensity',
    value: props.sensorData.lightIntensity?.value || 0,
    unit: props.sensorData.lightIntensity?.unit || 'lux',
    status: props.sensorData.lightIntensity?.status || 'inactive',
    icon: 'mdi-white-balance-sunny',
    category: 'Environment',
    lastUpdate: '1 min ago',
    trend: 'stable',
  },
])

const handleSensorClick = (sensorId: string) => {
  props.onSensorClick(sensorId)
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
      </div>
    </div>

    <!-- Sensor Cards Grid -->
    <div class="p-6">
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <div
          v-for="(sensor, index) in sensorCards"
          :key="sensor.id"
          @click="handleSensorClick(sensor.category)"
          class="cursor-pointer card-enter"
          :style="{ animationDelay: `${index * 100}ms` }"
        >
          <SensorCard
            :title="sensor.name"
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
