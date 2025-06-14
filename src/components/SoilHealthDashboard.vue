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
  soilData: {
    type: Object,
    required: true,
  },
  healthScore: {
    type: Number,
    required: true,
  },
})

const healthStatus = computed(() => {
  if (props.healthScore >= 90) {
    return { color: 'text-green-500 dark:text-green-400' }
  } else if (props.healthScore >= 75) {
    return { color: 'text-green-600 dark:text-green-500' }
  } else if (props.healthScore >= 60) {
    return { color: 'text-yellow-500 dark:text-yellow-400' }
  } else if (props.healthScore >= 40) {
    return { color: 'text-orange-500 dark:text-orange-400' }
  } else {
    return { color: 'text-red-500 dark:text-red-400' }
  }
})
</script>

<template>
  <div class="grid grid-cols-1 gap-6 mb-8">
    <!-- Unified Soil Health Card with Tabs -->
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
            Health Score
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
        <!-- Health Score Tab Content -->
        <div v-if="activeTab === 'score'" class="animate-fade-in">
          <div class="p-4 sm:p-6">
            <p class="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-4">
              Overall soil health based on key parameters
            </p>

            <!-- Health Score Ring -->
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
                      healthScore >= 90
                        ? 'url(#greenGradient)'
                        : healthScore >= 75
                          ? 'url(#lightGreenGradient)'
                          : healthScore >= 60
                            ? 'url(#yellowGradient)'
                            : healthScore >= 40
                              ? 'url(#orangeGradient)'
                              : 'url(#redGradient)'
                    "
                    stroke-width="12"
                    stroke-linecap="round"
                    :stroke-dasharray="`${healthScore * 3.39}, 339.292`"
                    stroke-dashoffset="0"
                    transform="rotate(-90, 60, 60)"
                    class="transition-all duration-1000 ease-out"
                  />

                  <!-- Gradient Definitions -->
                  <defs>
                    <linearGradient id="greenGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stop-color="#34d399" />
                      <stop offset="100%" stop-color="#10b981" />
                    </linearGradient>
                    <linearGradient id="lightGreenGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stop-color="#6ee7b7" />
                      <stop offset="100%" stop-color="#34d399" />
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
                  <div class="text-3xl sm:text-4xl font-bold" :class="healthStatus.color">
                    {{ healthScore }}
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
                        'text-green-500': soilData.temperature.status === 'optimal',
                        'text-yellow-500': soilData.temperature.status === 'warning',
                        'text-red-500': soilData.temperature.status === 'critical',
                      }"
                      >{{ soilData.temperature.value }}{{ soilData.temperature.unit }}</span
                    >
                  </div>
                  <div class="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                    <div
                      class="h-1.5 rounded-full"
                      :class="{
                        'bg-green-500': soilData.temperature.status === 'optimal',
                        'bg-yellow-500': soilData.temperature.status === 'warning',
                        'bg-red-500': soilData.temperature.status === 'critical',
                      }"
                      :style="{
                        width: `${((soilData.temperature.value - soilData.temperature.min) / (soilData.temperature.max - soilData.temperature.min)) * 100}%`,
                        maxWidth: '100%',
                      }"
                    ></div>
                  </div>
                </div>

                <div class="flex flex-col space-y-1 sm:space-y-2">
                  <div class="flex items-center justify-between">
                    <span class="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-300"
                      >Moisture</span
                    >
                    <span
                      class="text-xs sm:text-sm font-medium"
                      :class="{
                        'text-green-500': soilData.moisture.status === 'optimal',
                        'text-yellow-500': soilData.moisture.status === 'warning',
                        'text-red-500': soilData.moisture.status === 'critical',
                      }"
                      >{{ soilData.moisture.value }}{{ soilData.moisture.unit }}</span
                    >
                  </div>
                  <div class="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                    <div
                      class="h-1.5 rounded-full"
                      :class="{
                        'bg-green-500': soilData.moisture.status === 'optimal',
                        'bg-yellow-500': soilData.moisture.status === 'warning',
                        'bg-red-500': soilData.moisture.status === 'critical',
                      }"
                      :style="{
                        width: `${((soilData.moisture.value - soilData.moisture.min) / (soilData.moisture.max - soilData.moisture.min)) * 100}%`,
                        maxWidth: `100%`,
                      }"
                    ></div>
                  </div>
                </div>

                <div class="flex flex-col space-y-1 sm:space-y-2">
                  <div class="flex items-center justify-between">
                    <span class="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-300"
                      >pH Level</span
                    >
                    <span
                      class="text-xs sm:text-sm font-medium"
                      :class="{
                        'text-green-500': soilData.ph.status === 'optimal',
                        'text-yellow-500': soilData.ph.status === 'warning',
                        'text-red-500': soilData.ph.status === 'critical',
                      }"
                      >{{ soilData.ph.value }}{{ soilData.ph.unit }}</span
                    >
                  </div>
                  <div class="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                    <div
                      class="h-1.5 rounded-full"
                      :class="{
                        'bg-green-500': soilData.ph.status === 'optimal',
                        'bg-yellow-500': soilData.ph.status === 'warning',
                        'bg-red-500': soilData.ph.status === 'critical',
                      }"
                      :style="{
                        width: `${((soilData.ph.value - soilData.ph.min) / (soilData.ph.max - soilData.ph.min)) * 100}%`,
                        maxWidth: `100%`,
                      }"
                    ></div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Footer Buttons (for Health Score tab) -->
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
              Current soil sensor readings and status
            </p>

            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 gap-4">
              <SensorCard
                title="Soil Temperature"
                :value="soilData.temperature.value"
                :unit="soilData.temperature.unit"
                :status="soilData.temperature.status"
                :trend="soilData.temperature.trend"
                icon="thermometer"
              />

              <SensorCard
                title="Soil Moisture"
                :value="soilData.moisture.value"
                :unit="soilData.moisture.unit"
                :status="soilData.moisture.status"
                :trend="soilData.moisture.trend"
                icon="water"
              />

              <SensorCard
                title="Soil pH"
                :value="soilData.ph.value"
                :unit="soilData.ph.unit"
                :status="soilData.ph.status"
                :trend="soilData.ph.trend"
                icon="flask"
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
