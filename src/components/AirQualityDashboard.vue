<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import SensorCard from './SensorCard.vue'

const activeTab = ref('score')
const screenWidth = ref(0)

const updateScreenWidth = () => {
  if (typeof window !== 'undefined') {
    screenWidth.value = window.innerWidth
  }
}

onMounted(() => {
  updateScreenWidth()
  window.addEventListener('resize', updateScreenWidth)
})

const props = defineProps({
  airData: {
    type: Object,
    required: true,
  },
  qualityIndex: {
    type: Number,
    required: true,
  },
})

const qualityStatus = computed(() => {
  if (props.qualityIndex >= 90) {
    return { color: 'text-green-500 dark:text-green-400' }
  } else if (props.qualityIndex >= 75) {
    return { color: 'text-green-600 dark:text-green-500' }
  } else if (props.qualityIndex >= 60) {
    return { color: 'text-yellow-500 dark:text-yellow-400' }
  } else if (props.qualityIndex >= 40) {
    return { color: 'text-orange-500 dark:text-orange-400' }
  } else {
    return { color: 'text-red-500 dark:text-red-400' }
  }
})
</script>

<template>
  <div class="grid grid-cols-1 gap-6 mb-8">
    <!-- Unified Air Quality Card with Tabs -->
    <div
      class="bg-white dark:bg-gray-900 rounded-xl shadow-lg overflow-hidden border border-gray-100 dark:border-gray-700 dashboard-section"
    >
      <!-- Tab Navigation (All Screen Sizes) -->
      <div class="border-b border-gray-100 dark:border-gray-700">
        <div class="flex">
          <button
            @click="activeTab = 'score'"
            class="flex-1 py-3 px-4 text-center text-sm font-medium transition-colors duration-200 focus:outline-none"
            :class="{
              'text-primary-600 dark:text-primary-400 border-b-2 border-primary-500':
                activeTab === 'score',
              'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300':
                activeTab !== 'score',
            }"
          >
            <span class="mdi mdi-chart-donut mr-1"></span>
            Air Quality Score
          </button>
          <button
            @click="activeTab = 'readings'"
            class="flex-1 py-3 px-4 text-center text-sm font-medium transition-colors duration-200 focus:outline-none"
            :class="{
              'text-primary-600 dark:text-primary-400 border-b-2 border-primary-500':
                activeTab === 'readings',
              'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300':
                activeTab !== 'readings',
            }"
          >
            <span class="mdi mdi-gauge mr-1"></span>
            Sensor Readings
          </button>
        </div>
      </div>

      <!-- Tab Content -->
      <div class="p-0">
        <!-- Air Quality Score Tab Content -->
        <div v-if="activeTab === 'score'" class="animate-fade-in">
          <div class="p-4 sm:p-6">
            <p class="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-4">
              Overall air quality based on key parameters
            </p>

            <!-- Air Quality Score Ring -->
            <div class="flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
              <div
                class="relative w-[100px] h-[100px] sm:w-[120px] sm:h-[120px] flex-shrink-0 mx-auto sm:mx-0"
              >
                <!-- Background Circle -->
                <svg class="w-full h-full" viewBox="0 0 120 120">
                  <circle
                    cx="60"
                    cy="60"
                    r="54"
                    fill="none"
                    stroke="#e5e7eb"
                    stroke-width="12"
                    class="dark:stroke-gray-700"
                  />
                  <!-- Progress Circle -->
                  <circle
                    cx="60"
                    cy="60"
                    r="54"
                    fill="none"
                    :stroke="
                      qualityIndex >= 90
                        ? 'url(#blueGradient)'
                        : qualityIndex >= 75
                          ? 'url(#lightBlueGradient)'
                          : qualityIndex >= 60
                            ? 'url(#yellowGradient)'
                            : qualityIndex >= 40
                              ? 'url(#orangeGradient)'
                              : 'url(#redGradient)'
                    "
                    stroke-width="12"
                    stroke-linecap="round"
                    :stroke-dasharray="`${qualityIndex * 3.39}, 339.292`"
                    stroke-dashoffset="0"
                    transform="rotate(-90, 60, 60)"
                    class="transition-all duration-1000 ease-out"
                  />

                  <!-- Gradient Definitions -->
                  <defs>
                    <linearGradient id="blueGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stop-color="#3b82f6" />
                      <stop offset="100%" stop-color="#2563eb" />
                    </linearGradient>
                    <linearGradient id="lightBlueGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stop-color="#60a5fa" />
                      <stop offset="100%" stop-color="#3b82f6" />
                    </linearGradient>
                    <linearGradient id="yellowGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stop-color="#fcd34d" />
                      <stop offset="100%" stop-color="#f59e0b" />
                    </linearGradient>
                    <linearGradient id="orangeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stop-color="#fb923c" />
                      <stop offset="100%" stop-color="#ea580c" />
                    </linearGradient>
                    <linearGradient id="redGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stop-color="#f87171" />
                      <stop offset="100%" stop-color="#dc2626" />
                    </linearGradient>
                  </defs>
                </svg>

                <!-- Score Text in Center -->
                <div class="absolute inset-0 flex flex-col items-center justify-center text-center">
                  <div class="text-3xl sm:text-4xl font-bold" :class="qualityStatus.color">
                    {{ qualityIndex }}
                  </div>
                </div>
              </div>

              <!-- Score Information -->
              <div class="flex-1 space-y-3 sm:space-y-4 w-full">
                <div class="flex flex-col space-y-1 sm:space-y-2">
                  <div class="flex items-center justify-between">
                    <span class="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-300"
                      >Temperature</span
                    >
                    <span
                      class="text-xs sm:text-sm font-medium"
                      :class="{
                        'text-green-500': airData.temperature.status === 'optimal',
                        'text-yellow-500': airData.temperature.status === 'warning',
                        'text-red-500': airData.temperature.status === 'critical',
                      }"
                      >{{ airData.temperature.value }}{{ airData.temperature.unit }}</span
                    >
                  </div>
                  <div class="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                    <div
                      class="h-1.5 rounded-full"
                      :class="{
                        'bg-green-500': airData.temperature.status === 'optimal',
                        'bg-yellow-500': airData.temperature.status === 'warning',
                        'bg-red-500': airData.temperature.status === 'critical',
                      }"
                      :style="{
                        width: `${((airData.temperature.value - airData.temperature.min) / (airData.temperature.max - airData.temperature.min)) * 100}%`,
                        maxWidth: `100%`,
                      }"
                    ></div>
                  </div>
                </div>

                <div class="flex flex-col space-y-1 sm:space-y-2">
                  <div class="flex items-center justify-between">
                    <span class="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-300"
                      >Humidity</span
                    >
                    <span
                      class="text-xs sm:text-sm font-medium"
                      :class="{
                        'text-green-500': airData.humidity.status === 'optimal',
                        'text-yellow-500': airData.humidity.status === 'warning',
                        'text-red-500': airData.humidity.status === 'critical',
                      }"
                      >{{ airData.humidity.value }}{{ airData.humidity.unit }}</span
                    >
                  </div>
                  <div class="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                    <div
                      class="h-1.5 rounded-full"
                      :class="{
                        'bg-green-500': airData.humidity.status === 'optimal',
                        'bg-yellow-500': airData.humidity.status === 'warning',
                        'bg-red-500': airData.humidity.status === 'critical',
                      }"
                      :style="{
                        width: `${((airData.humidity.value - airData.humidity.min) / (airData.humidity.max - airData.humidity.min)) * 100}%`,
                        maxWidth: `100%`,
                      }"
                    ></div>
                  </div>
                </div>

                <div class="flex flex-col space-y-1 sm:space-y-2">
                  <div class="flex items-center justify-between">
                    <span class="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-300"
                      >CO₂ Level</span
                    >
                    <span
                      class="text-xs sm:text-sm font-medium"
                      :class="{
                        'text-green-500': airData.co2.status === 'optimal',
                        'text-yellow-500': airData.co2.status === 'warning',
                        'text-red-500': airData.co2.status === 'critical',
                      }"
                      >{{ airData.co2.value }}{{ airData.co2.unit }}</span
                    >
                  </div>
                  <div class="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                    <div
                      class="h-1.5 rounded-full"
                      :class="{
                        'bg-green-500': airData.co2.status === 'optimal',
                        'bg-yellow-500': airData.co2.status === 'warning',
                        'bg-red-500': airData.co2.status === 'critical',
                      }"
                      :style="{
                        width: `${((airData.co2.value - airData.co2.min) / (airData.co2.max - airData.co2.min)) * 100}%`,
                        maxWidth: `100%`,
                      }"
                    ></div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Footer Buttons (for Air Quality Score tab) -->
            <div class="mt-6 pt-4 border-t border-gray-100 dark:border-gray-700">
              <div class="flex flex-wrap gap-2 sm:gap-3 justify-between">
                <button
                  class="flex items-center text-xs sm:text-sm text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors px-2 sm:px-3 py-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  <span class="mdi mdi-information-outline mr-1"></span>
                  Why this score?
                </button>

                <button
                  class="flex items-center text-xs sm:text-sm text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors px-2 sm:px-3 py-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  <span class="mdi mdi-chart-bar mr-1"></span>
                  View Detailed Report
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Sensor Readings Tab Content -->
        <div v-if="activeTab === 'readings'" class="animate-fade-in">
          <div class="p-4 sm:p-6">
            <p class="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-4">
              Current air quality sensor readings and status
            </p>

            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 gap-4">
              <SensorCard
                title="Air Temperature"
                :value="airData.temperature.value"
                :unit="airData.temperature.unit"
                :status="airData.temperature.status"
                :trend="airData.temperature.trend"
                icon="thermometer"
              />

              <SensorCard
                title="Humidity"
                :value="airData.humidity.value"
                :unit="airData.humidity.unit"
                :status="airData.humidity.status"
                :trend="airData.humidity.trend"
                icon="water-percent"
              />

              <SensorCard
                title="CO₂ Level"
                :value="airData.co2.value"
                :unit="airData.co2.unit"
                :status="airData.co2.status"
                :trend="airData.co2.trend"
                icon="molecule-co2"
              />

              <SensorCard
                title="TVOC Level"
                :value="airData.tvoc.value"
                :unit="airData.tvoc.unit"
                :status="airData.tvoc.status"
                :trend="airData.tvoc.trend"
                icon="molecule"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-fade-in {
  animation: fadeIn 0.3s ease-out;
}
</style>
