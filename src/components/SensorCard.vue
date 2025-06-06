<script setup>
import { computed } from 'vue'

const props = defineProps({
  title: {
    type: String,
    required: true,
  },
  value: {
    type: [Number, String],
    required: true,
  },
  unit: {
    type: String,
    default: '',
  },
  status: {
    type: String,
    default: 'normal',
    validator: (value) => ['normal', 'warning', 'critical'].includes(value),
  },
  icon: {
    type: String,
    default: '',
  },
})

// Determine status color based on status prop
const statusColor = computed(() => {
  switch (props.status) {
    case 'normal':
      return 'bg-green-500 dark:bg-green-600'
    case 'warning':
      return 'bg-yellow-500 dark:bg-yellow-600'
    case 'critical':
      return 'bg-red-500 dark:bg-red-600'
    default:
      return 'bg-gray-500 dark:bg-gray-600'
  }
})

// Determine status icon based on status prop
const statusIcon = computed(() => {
  switch (props.status) {
    case 'normal':
      return 'mdi-check-circle'
    case 'warning':
      return 'mdi-alert'
    case 'critical':
      return 'mdi-alert-circle'
    default:
      return 'mdi-information'
  }
})

// Emit events
const emit = defineEmits(['view-details', 'view-chart', 'view-history', 'more-options'])
</script>

<template>
  <div
    class="sensor-card relative bg-white dark:bg-gray-800 rounded-xl border overflow-hidden transition-all duration-300 hover:shadow-lg group w-full max-w-full"
    :class="{
      'border-green-200 dark:border-green-700': status === 'normal',
      'border-yellow-200 dark:border-yellow-700': status === 'warning',
      'border-red-200 dark:border-red-700': status === 'critical',
    }"
  >
    <!-- Status indicator bar at top -->
    <div class="h-1 sm:h-1.5 w-full" :class="statusColor"></div>

    <div class="p-2 sm:p-3 md:p-4 lg:p-5">
      <!-- Card header with title and status -->
      <div class="flex justify-between items-start mb-2 sm:mb-3 md:mb-4">
        <div class="flex items-center">
          <span
            v-if="icon"
            class="mdi text-base sm:text-lg md:text-xl mr-1.5 sm:mr-2 bg-primary-50 dark:bg-primary-900/30 p-1 sm:p-1.5 md:p-2 rounded-lg text-primary-500 dark:text-primary-400 flex-shrink-0"
            :class="icon"
          ></span>
          <h3
            class="font-medium text-xs sm:text-sm md:text-base text-gray-800 dark:text-gray-200 truncate max-w-[100px] sm:max-w-[120px] md:max-w-[150px] lg:max-w-full"
          >
            {{ title }}
          </h3>
        </div>
        <span
          class="mdi text-sm sm:text-base md:text-lg flex-shrink-0"
          :class="{
            [statusIcon]: true,
            'text-green-500 dark:text-green-400': status === 'normal',
            'text-yellow-500 dark:text-yellow-400': status === 'warning',
            'text-red-500 dark:text-red-400': status === 'critical',
          }"
        ></span>
      </div>

      <!-- Value display -->
      <div class="flex items-baseline mb-2 sm:mb-3">
        <span
          class="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-gray-900 dark:text-gray-100 mr-1.5 sm:mr-2 transition-all duration-300 group-hover:text-primary-600 dark:group-hover:text-primary-400"
        >
          {{ value }}
        </span>
        <span class="text-2xs sm:text-xs md:text-sm text-gray-500 dark:text-gray-400">{{
          unit
        }}</span>
      </div>

      <!-- Status badge -->
      <div
        class="inline-block px-1.5 sm:px-2 md:px-3 py-0.5 rounded-full text-2xs sm:text-xs font-medium"
        :class="{
          'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300':
            status === 'normal',
          'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300':
            status === 'warning',
          'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300': status === 'critical',
        }"
      >
        {{ status.charAt(0).toUpperCase() + status.slice(1) }}
      </div>
    </div>

    <!-- Card footer with quick actions -->
    <div
      class="px-2 sm:px-3 md:px-4 lg:px-5 py-1.5 sm:py-2 md:py-3 bg-gray-50 dark:bg-gray-700/30 border-t border-gray-100 dark:border-gray-700 flex justify-between items-center overflow-x-auto"
    >
      <div class="flex space-x-0.5 sm:space-x-1 md:space-x-2">
        <button
          @click="emit('view-details')"
          class="p-0.5 sm:p-1 md:p-1.5 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors duration-200"
          title="View Details"
        >
          <span class="mdi mdi-information-outline text-sm sm:text-base md:text-lg"></span>
        </button>
        <button
          @click="emit('view-chart')"
          class="p-0.5 sm:p-1 md:p-1.5 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors duration-200"
          title="View Chart"
        >
          <span class="mdi mdi-chart-line text-sm sm:text-base md:text-lg"></span>
        </button>
        <button
          @click="emit('view-history')"
          class="p-0.5 sm:p-1 md:p-1.5 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors duration-200"
          title="View History"
        >
          <span class="mdi mdi-history text-sm sm:text-base md:text-lg"></span>
        </button>
      </div>
      <button
        @click="emit('more-options')"
        class="p-0.5 sm:p-1 md:p-1.5 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors duration-200"
        title="More Options"
      >
        <span class="mdi mdi-dots-vertical text-sm sm:text-base md:text-lg"></span>
      </button>
    </div>

    <!-- Hover effect overlay -->
    <div
      class="absolute inset-0 bg-primary-500/0 pointer-events-none transition-colors duration-300 group-hover:bg-primary-500/5 dark:group-hover:bg-primary-500/10"
    ></div>
  </div>
</template>

<style scoped>
.sensor-card {
  animation: fadeIn 0.5s ease-out;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  transition:
    transform 0.3s ease,
    box-shadow 0.3s ease;
}

.sensor-card:hover {
  transform: translateY(-2px);
}

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
</style>
