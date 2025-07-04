<script setup lang="ts">
import { computed } from 'vue'

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

const tableData = computed(() => [
  {
    id: 'soilTemperature',
    name: 'Soil Temperature',
    value: props.sensorData.soilTemperature?.value || 0,
    unit: props.sensorData.soilTemperature?.unit || '°C',
    status: props.sensorData.soilTemperature?.status || 'inactive',
    icon: 'mdi-thermometer',
    category: 'Soil',
    lastUpdate: '2 min ago',
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
  },
])

const getStatusConfig = (status: string) => {
  const configs = {
    optimal: {
      badge: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300',
      dot: 'bg-emerald-500',
      iconBg: 'bg-emerald-50 dark:bg-emerald-900/20',
      iconColor: 'text-emerald-600 dark:text-emerald-400',
    },
    warning: {
      badge: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
      dot: 'bg-amber-500',
      iconBg: 'bg-amber-50 dark:bg-amber-900/20',
      iconColor: 'text-amber-600 dark:text-amber-400',
    },
    critical: {
      badge: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
      dot: 'bg-red-500',
      iconBg: 'bg-red-50 dark:bg-red-900/20',
      iconColor: 'text-red-600 dark:text-red-400',
    },
    inactive: {
      badge: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
      dot: 'bg-gray-400',
      iconBg: 'bg-gray-50 dark:bg-gray-800/30',
      iconColor: 'text-gray-500 dark:text-gray-400',
    },
  }
  return configs[status as keyof typeof configs] || configs.inactive
}

const getCategoryColor = (category: string) => {
  const colors = {
    Soil: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300',
    Air: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
    Environment: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
  }
  return colors[category as keyof typeof colors] || colors.Environment
}

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
                d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
              />
            </svg>
          </div>
          <div>
            <h2 class="text-xl font-semibold text-gray-900 dark:text-gray-100">Sensor Readings</h2>
            <p class="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
              Detailed environmental monitoring data
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

    <!-- Table -->
    <div class="overflow-x-auto">
      <table class="w-full">
        <thead class="bg-gray-50/50 dark:bg-gray-800/50">
          <tr>
            <th
              class="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider"
            >
              Sensor
            </th>
            <th
              class="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider"
            >
              Category
            </th>
            <th
              class="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider"
            >
              Current Value
            </th>
            <th
              class="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider"
            >
              Status
            </th>
            <th
              class="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider"
            >
              Last Update
            </th>
            <th
              class="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider"
            >
              Actions
            </th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-200 dark:divide-gray-700">
          <tr
            v-for="sensor in tableData"
            :key="sensor.id"
            class="hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition-colors duration-200 cursor-pointer"
            @click="handleSensorClick(sensor.id)"
          >
            <!-- Sensor Name -->
            <td class="px-6 py-4 whitespace-nowrap">
              <div class="flex items-center gap-3">
                <div
                  class="w-10 h-10 rounded-xl flex items-center justify-center ring-1 ring-gray-200/50 dark:ring-gray-700/30"
                  :class="getStatusConfig(sensor.status).iconBg"
                >
                  <span
                    :class="[sensor.icon, 'mdi text-lg', getStatusConfig(sensor.status).iconColor]"
                  ></span>
                </div>
                <div>
                  <div class="font-medium text-gray-900 dark:text-gray-100">
                    {{ sensor.name }}
                  </div>
                  <div class="text-sm text-gray-500 dark:text-gray-400">ID: {{ sensor.id }}</div>
                </div>
              </div>
            </td>

            <!-- Category -->
            <td class="px-6 py-4 whitespace-nowrap">
              <span
                class="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium"
                :class="getCategoryColor(sensor.category)"
              >
                {{ sensor.category }}
              </span>
            </td>

            <!-- Current Value -->
            <td class="px-6 py-4 whitespace-nowrap">
              <div class="flex items-baseline gap-1">
                <span class="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  {{ sensor.value }}
                </span>
                <span class="text-sm text-gray-500 dark:text-gray-400">
                  {{ sensor.unit }}
                </span>
              </div>
            </td>

            <!-- Status -->
            <td class="px-6 py-4 whitespace-nowrap">
              <div
                class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium"
                :class="getStatusConfig(sensor.status).badge"
              >
                <div
                  class="w-1.5 h-1.5 rounded-full"
                  :class="getStatusConfig(sensor.status).dot"
                ></div>
                {{ sensor.status.charAt(0).toUpperCase() + sensor.status.slice(1) }}
              </div>
            </td>

            <!-- Last Update -->
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
              {{ sensor.lastUpdate }}
            </td>

            <!-- Actions -->
            <td class="px-6 py-4 whitespace-nowrap">
              <button
                @click.stop="handleSensorClick(sensor.id)"
                class="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors duration-200"
              >
                <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                  />
                </svg>
                View
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<style scoped>
/* Smooth transitions for table interactions */
tbody tr {
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

/* Hover effects for better UX */
tbody tr:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px -2px rgba(0, 0, 0, 0.05);
}

/* Focus states for accessibility */
tbody tr:focus-within {
  outline: 2px solid theme('colors.emerald.500');
  outline-offset: -2px;
}
</style>
