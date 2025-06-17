<template>
  <div
    class="bg-white dark:bg-gray-900 rounded-lg shadow-sm p-5 border border-gray-200 dark:border-gray-700"
  >
    <h3 class="text-lg font-semibold mb-4 text-gray-800 dark:text-gray-200 flex items-center">
      <span :class="`mdi ${icon} mr-2 ${iconColor}`"></span>
      {{ title }}
    </h3>

    <div class="space-y-4">
      <!-- Min Threshold -->
      <div>
        <label
          :for="`${id}-min`"
          class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
        >
          Minimum Threshold
        </label>
        <div class="relative">
          <input
            :id="`${id}-min`"
            v-model.number="modelValue.min"
            type="number"
            :step="step"
            :min="min"
            :max="max"
            class="block w-full px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 transition-colors"
            :class="ringClass"
          />
          <div
            class="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-gray-500 dark:text-gray-400"
          >
            {{ unit }}
          </div>
        </div>
        <p class="mt-1 text-xs text-gray-600 dark:text-gray-400">
          Alert when below this {{ label }}
        </p>
      </div>

      <!-- Max Threshold -->
      <div>
        <label
          :for="`${id}-max`"
          class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
        >
          Maximum Threshold
        </label>
        <div class="relative">
          <input
            :id="`${id}-max`"
            v-model.number="modelValue.max"
            type="number"
            :step="step"
            :min="min"
            :max="max"
            class="block w-full px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 transition-colors"
            :class="ringClass"
          />
          <div
            class="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-gray-500 dark:text-gray-400"
          >
            {{ unit }}
          </div>
        </div>
        <p class="mt-1 text-xs text-gray-600 dark:text-gray-400">
          Alert when above this {{ label }}
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  id: string
  title: string
  label: string
  icon: string
  iconColor: string
  unit: string
  min: number
  max: number
  step?: number
  ringClass: string
  modelValue: {
    min: number
    max: number
  }
}>()

defineEmits(['update:modelValue'])
</script>
