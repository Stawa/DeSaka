<script setup lang="ts">
defineProps<{
  activeTab: string
  dateRange: { start: string; end: string }
  selectedSensors: string[]
  availableSensors: Array<{ id: string; name: string; unit: string; color: string }>
  fetchHistoricalData: () => Promise<void>
}>()

const emit = defineEmits<{
  (e: 'update-tab', tab: string): void
  (e: 'update-date-range', range: string): void
  (e: 'toggle-sensor', id: string): void
}>()

const setActiveTab = (tab: string) => emit('update-tab', tab)
const setDateRange = (range: string) => {
  emit('update-date-range', range)
}
const toggleSensor = (id: string) => emit('toggle-sensor', id)
</script>

<template>
  <!-- Tab Navigation -->
  <div class="border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
    <div class="flex">
      <button
        @click="setActiveTab('date-range')"
        class="flex-1 py-4 px-6 text-center text-sm font-medium transition-all duration-200 focus:outline-none relative group"
        :class="{
          'text-blue-600 dark:text-blue-400': activeTab === 'date-range',
          'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300':
            activeTab !== 'date-range',
        }"
      >
        <div class="flex items-center justify-center">
          <span class="mdi mdi-calendar-range mr-2 text-lg"></span>
          <span>Date Range</span>
        </div>
        <div
          v-if="activeTab === 'date-range'"
          class="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 dark:bg-blue-400 transform transition-all duration-200"
        ></div>
      </button>
      <button
        @click="setActiveTab('sensors')"
        class="flex-1 py-4 px-6 text-center text-sm font-medium transition-all duration-200 focus:outline-none relative group"
        :class="{
          'text-blue-600 dark:text-blue-400': activeTab === 'sensors',
          'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300':
            activeTab !== 'sensors',
        }"
      >
        <div class="flex items-center justify-center">
          <span class="mdi mdi-tune mr-2 text-lg"></span>
          <span>Sensors</span>
        </div>
        <div
          v-if="activeTab === 'sensors'"
          class="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 dark:bg-blue-400 transform transition-all duration-200"
        ></div>
      </button>
    </div>

    <!-- Tab Content -->
    <div class="bg-white dark:bg-gray-900">
      <!-- Date Range Tab Content -->
      <div v-if="activeTab === 'date-range'" class="animate-fade-in">
        <div
          class="px-6 py-4 border-b border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/30"
        >
          <div class="flex items-center">
            <span class="mdi mdi-calendar-range text-blue-500 mr-3 text-xl"></span>
            <h2 class="text-lg font-semibold text-gray-800 dark:text-gray-200">
              Select Date Range
            </h2>
          </div>
        </div>

        <!-- Date Range Controls -->
        <div class="p-6">
          <div class="flex flex-wrap gap-3 mb-6">
            <button
              class="px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 shadow-sm"
              :class="{
                'bg-blue-500 hover:bg-blue-600 text-white shadow-md':
                  dateRange.start === dateRange.end,
                'bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-gray-400 dark:hover:border-gray-500':
                  dateRange.start !== dateRange.end,
              }"
              @click="setDateRange('day')"
            >
              Today
            </button>

            <button
              class="px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 shadow-sm"
              :class="{
                'bg-blue-500 hover:bg-blue-600 text-white shadow-md':
                  new Date(dateRange.end).getTime() - new Date(dateRange.start).getTime() ===
                  6 * 24 * 60 * 60 * 1000,
                'bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-gray-400 dark:hover:border-gray-500':
                  new Date(dateRange.end).getTime() - new Date(dateRange.start).getTime() !==
                  6 * 24 * 60 * 60 * 1000,
              }"
              @click="setDateRange('week')"
            >
              Last 7 Days
            </button>

            <button
              class="px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-gray-400 dark:hover:border-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 shadow-sm"
              @click="setDateRange('month')"
            >
              Last 30 Days
            </button>

            <button
              class="px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-gray-400 dark:hover:border-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 shadow-sm"
              @click="setDateRange('year')"
            >
              Last Year
            </button>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label
                for="start-date"
                class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                >Start Date</label
              >
              <input
                id="start-date"
                type="date"
                :value="dateRange.start"
                @input="$emit('update-date-range', 'custom')"
                class="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 transition-colors shadow-sm"
                @change="fetchHistoricalData"
              />
            </div>

            <div>
              <label
                for="end-date"
                class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                >End Date</label
              >
              <input
                id="end-date"
                type="date"
                v-model="dateRange.end"
                class="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 transition-colors shadow-sm"
                @change="fetchHistoricalData"
              />
            </div>
          </div>
        </div>

        <div
          class="bg-gray-50 dark:bg-gray-800/50 border-t border-gray-200 dark:border-gray-700 px-6 py-4"
        >
          <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div class="flex items-center text-sm text-gray-600 dark:text-gray-400">
              <span class="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
              <span class="font-medium text-gray-800 dark:text-gray-200">{{
                selectedSensors.length
              }}</span>
              <span class="ml-1">sensors selected</span>
            </div>
            <div class="flex items-center text-sm text-gray-600 dark:text-gray-400">
              <span class="mdi mdi-calendar mr-2"></span>
              <span class="font-medium text-gray-800 dark:text-gray-200">{{
                new Date(dateRange.start).toLocaleDateString()
              }}</span>
              <span class="mx-2">to</span>
              <span class="font-medium text-gray-800 dark:text-gray-200">{{
                new Date(dateRange.end).toLocaleDateString()
              }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Sensors Tab Content -->
      <div v-if="activeTab === 'sensors'" class="animate-fade-in">
        <div
          class="px-6 py-4 border-b border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/30"
        >
          <div class="flex items-center">
            <span class="mdi mdi-tune text-blue-500 mr-3 text-xl"></span>
            <h2 class="text-lg font-semibold text-gray-800 dark:text-gray-200">Select Sensors</h2>
          </div>
        </div>

        <!-- Sensor Selection Controls -->
        <div class="p-6">
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            <div
              v-for="sensor in availableSensors"
              :key="sensor.id"
              class="flex items-center space-x-3 p-4 rounded-lg transition-all duration-200 cursor-pointer border border-transparent hover:border-gray-200 dark:hover:border-gray-700"
              :class="{
                'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 shadow-sm':
                  selectedSensors.includes(sensor.id),
                'hover:bg-gray-50 dark:hover:bg-gray-800/50': !selectedSensors.includes(sensor.id),
              }"
              @click="toggleSensor(sensor.id)"
            >
              <div class="flex-shrink-0">
                <div
                  class="w-4 h-4 rounded-full shadow-sm ring-2 ring-white dark:ring-gray-900"
                  :style="{ backgroundColor: sensor.color }"
                ></div>
              </div>
              <div class="flex-grow min-w-0">
                <div class="text-sm font-medium text-gray-800 dark:text-gray-200 truncate">
                  {{ sensor.name }}
                </div>
                <div class="text-xs text-gray-500 dark:text-gray-400">{{ sensor.unit }}</div>
              </div>
              <div class="flex-shrink-0">
                <div class="relative">
                  <input
                    type="checkbox"
                    :checked="selectedSensors.includes(sensor.id)"
                    class="sr-only"
                  />
                  <div
                    class="w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all duration-200"
                    :class="{
                      'bg-blue-500 border-blue-500': selectedSensors.includes(sensor.id),
                      'border-gray-300 dark:border-gray-600': !selectedSensors.includes(sensor.id),
                    }"
                  >
                    <span
                      v-if="selectedSensors.includes(sensor.id)"
                      class="mdi mdi-check text-white text-sm"
                    ></span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div
          class="bg-gray-50 dark:bg-gray-800/50 border-t border-gray-200 dark:border-gray-700 px-6 py-4"
        >
          <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div class="flex items-center text-sm text-gray-600 dark:text-gray-400">
              <span class="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
              <span class="font-medium text-gray-800 dark:text-gray-200">{{
                selectedSensors.length
              }}</span>
              <span class="ml-1">sensors selected</span>
            </div>
            <div class="flex items-center text-sm text-gray-600 dark:text-gray-400">
              <span class="mdi mdi-calendar mr-2"></span>
              <span class="font-medium text-gray-800 dark:text-gray-200">{{
                new Date(dateRange.start).toLocaleDateString()
              }}</span>
              <span class="mx-2">to</span>
              <span class="font-medium text-gray-800 dark:text-gray-200">{{
                new Date(dateRange.end).toLocaleDateString()
              }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.animate-fade-in {
  animation: fadeIn 0.3s ease-in-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

input[type='date']::-webkit-calendar-picker-indicator {
  filter: invert(0.5);
  transition: filter 0.2s ease;
}

input[type='date']:hover::-webkit-calendar-picker-indicator {
  filter: invert(0.3);
}

.dark input[type='date']::-webkit-calendar-picker-indicator {
  filter: invert(0.7);
}

.dark input[type='date']:hover::-webkit-calendar-picker-indicator {
  filter: invert(0.9);
}
</style>
