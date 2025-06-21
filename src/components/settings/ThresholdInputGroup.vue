<template>
  <div
    class="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6 hover:border-gray-300 dark:hover:border-gray-700 transition-colors"
  >
    <!-- Header -->
    <div class="flex items-center gap-3 mb-6">
      <div
        class="w-8 h-8 rounded-lg flex items-center justify-center"
        :style="{ backgroundColor: iconColor + '20' }"
      >
        <span :class="icon" :style="{ color: iconColor }" class="mdi text-lg"></span>
      </div>
      <h3 class="font-medium text-gray-900 dark:text-white">{{ title }}</h3>
    </div>

    <!-- Range Display -->
    <div class="text-center mb-6">
      <div
        class="inline-flex items-center gap-3 text-2xl font-semibold text-gray-900 dark:text-white"
      >
        <span>{{ modelValue.min }}</span>
        <div class="w-8 h-px bg-gray-300 dark:bg-gray-600"></div>
        <span>{{ modelValue.max }}</span>
        <span class="text-sm text-gray-500 dark:text-gray-400 font-normal">{{ unit }}</span>
      </div>
    </div>

    <!-- Inputs -->
    <div class="grid grid-cols-2 gap-4">
      <div>
        <label :for="`${id}-min`" class="block text-sm text-gray-600 dark:text-gray-400 mb-2">
          Min
        </label>
        <input
          :id="`${id}-min`"
          v-model.number="modelValue.min"
          type="number"
          :step="step"
          :min="min"
          :max="max"
          class="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border-0 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-shadow"
        />
      </div>
      <div>
        <label :for="`${id}-max`" class="block text-sm text-gray-600 dark:text-gray-400 mb-2">
          Max
        </label>
        <input
          :id="`${id}-max`"
          v-model.number="modelValue.max"
          type="number"
          :step="step"
          :min="min"
          :max="max"
          class="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border-0 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-shadow"
        />
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
