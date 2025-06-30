<template>
  <div
    class="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4 sm:p-6 hover:border-gray-300 dark:hover:border-gray-700 transition-colors"
  >
    <!-- Header -->
    <div class="flex items-center gap-3 mb-4 sm:mb-6 min-w-0">
      <div
        class="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
        :class="iconColor"
      >
        <span :class="icon" class="mdi text-lg"></span>
      </div>
      <h3
        class="font-medium text-gray-900 dark:text-white text-sm sm:text-base truncate min-w-0"
        :title="title"
      >
        {{ title }}
      </h3>
    </div>

    <!-- Range Display -->
    <div class="text-center mb-4 sm:mb-6">
      <div
        class="inline-flex items-center gap-2 sm:gap-3 text-xl sm:text-2xl font-semibold text-gray-900 dark:text-white flex-wrap justify-center"
      >
        <span class="tabular-nums">{{ modelValue.min }}</span>
        <div class="w-6 sm:w-8 h-px bg-gray-300 dark:bg-gray-600 flex-shrink-0"></div>
        <span class="tabular-nums">{{ modelValue.max }}</span>
        <span
          class="text-xs sm:text-sm text-gray-500 dark:text-gray-400 font-normal truncate max-w-[80px] sm:max-w-none"
          :title="unit"
        >
          {{ unit }}
        </span>
      </div>
    </div>

    <!-- Inputs -->
    <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
      <div class="min-w-0">
        <label
          :for="`${id}-min`"
          class="block text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-2 truncate"
          :title="'Minimum ' + label"
        >
          Min
        </label>
        <input
          :id="`${id}-min`"
          v-model.number="modelValue.min"
          type="number"
          :step="step"
          :min="min"
          :max="max"
          class="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border-0 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-shadow min-w-0"
          @input="updateMin"
        />
      </div>
      <div class="min-w-0">
        <label
          :for="`${id}-max`"
          class="block text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-2 truncate"
          :title="'Maximum ' + label"
        >
          Max
        </label>
        <input
          :id="`${id}-max`"
          v-model.number="modelValue.max"
          type="number"
          :step="step"
          :min="min"
          :max="max"
          class="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border-0 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-shadow min-w-0"
          @input="updateMax"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
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

const emit = defineEmits(['update:modelValue'])

const updateMin = (event: Event) => {
  const target = event.target as HTMLInputElement
  const newValue = parseFloat(target.value) || 0
  emit('update:modelValue', {
    ...props.modelValue,
    min: newValue,
  })
}

const updateMax = (event: Event) => {
  const target = event.target as HTMLInputElement
  const newValue = parseFloat(target.value) || 0
  emit('update:modelValue', {
    ...props.modelValue,
    max: newValue,
  })
}
</script>
