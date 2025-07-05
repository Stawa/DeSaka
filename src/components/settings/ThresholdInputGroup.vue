<template>
  <div
    class="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-2xl border border-gray-200/50 dark:border-gray-700/50 p-6 hover:border-gray-300 dark:hover:border-gray-600 transition-all duration-200 shadow-lg hover:shadow-xl group"
  >
    <!-- Header with enhanced styling -->
    <div class="flex items-center gap-4 mb-6 min-w-0">
      <div
        class="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg group-hover:scale-105 transition-transform duration-200"
        :class="iconColor"
      >
        <span :class="icon" class="mdi text-xl"></span>
      </div>
      <div class="min-w-0 flex-1">
        <h3 class="font-semibold text-gray-900 dark:text-white text-lg truncate" :title="title">
          {{ title }}
        </h3>
        <p class="text-sm text-gray-500 dark:text-gray-400 truncate">
          Configure {{ label }} thresholds
        </p>
      </div>
    </div>

    <!-- Enhanced range display -->
    <div
      class="text-center mb-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700"
    >
      <div
        class="flex items-center justify-center gap-3 text-2xl font-bold text-gray-900 dark:text-white mb-2"
      >
        <span class="tabular-nums text-emerald-600 dark:text-emerald-400">{{
          modelValue.min
        }}</span>
        <div class="flex items-center gap-1">
          <div class="w-2 h-2 bg-gray-300 dark:bg-gray-600 rounded-full"></div>
          <div class="w-4 h-px bg-gray-300 dark:bg-gray-600"></div>
          <div class="w-2 h-2 bg-gray-300 dark:bg-gray-600 rounded-full"></div>
        </div>
        <span class="tabular-nums text-teal-600 dark:text-teal-400">{{ modelValue.max }}</span>
      </div>
      <span class="text-sm text-gray-500 dark:text-gray-400 font-medium">{{ unit }}</span>
    </div>

    <!-- Enhanced inputs -->
    <div class="grid grid-cols-2 gap-4">
      <div class="space-y-2">
        <label
          :for="`${id}-min`"
          class="block text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2"
        >
          <span class="w-3 h-3 bg-emerald-500 rounded-full"></span>
          Minimum
        </label>
        <div class="relative">
          <input
            :id="`${id}-min`"
            v-model.number="modelValue.min"
            type="number"
            :step="step"
            :min="min"
            :max="max"
            class="w-full px-4 py-3 bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-xl text-sm font-medium focus:ring-0 focus:border-emerald-500 dark:focus:border-emerald-400 transition-all duration-200 shadow-sm hover:shadow-md focus:shadow-lg"
            @input="updateMin"
          />
          <div class="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
            <span class="text-xs text-gray-400 font-medium">{{ unit }}</span>
          </div>
        </div>
      </div>

      <div class="space-y-2">
        <label
          :for="`${id}-max`"
          class="block text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2"
        >
          <span class="w-3 h-3 bg-teal-500 rounded-full"></span>
          Maximum
        </label>
        <div class="relative">
          <input
            :id="`${id}-max`"
            v-model.number="modelValue.max"
            type="number"
            :step="step"
            :min="min"
            :max="max"
            class="w-full px-4 py-3 bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-xl text-sm font-medium focus:ring-0 focus:border-teal-500 dark:focus:border-teal-400 transition-all duration-200 shadow-sm hover:shadow-md focus:shadow-lg"
            @input="updateMax"
          />
          <div class="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
            <span class="text-xs text-gray-400 font-medium">{{ unit }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Visual range indicator -->
    <div
      class="mt-6 p-3 bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 rounded-xl border border-emerald-200 dark:border-emerald-800"
    >
      <div
        class="flex items-center justify-between text-xs text-emerald-700 dark:text-emerald-300 font-medium mb-2"
      >
        <span>Safe Range</span>
        <span>{{ Math.abs(modelValue.max - modelValue.min).toFixed(1) }} {{ unit }}</span>
      </div>
      <div class="w-full bg-emerald-200 dark:bg-emerald-800 rounded-full h-2 overflow-hidden">
        <div
          class="bg-gradient-to-r from-emerald-500 to-teal-500 h-2 rounded-full w-full shadow-sm"
        ></div>
      </div>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  id: String,
  title: String,
  label: String,
  icon: String,
  iconColor: String,
  unit: String,
  min: Number,
  max: Number,
  step: {
    type: Number,
    default: 1,
  },
  ringClass: String,
  modelValue: {
    type: Object,
    required: true,
  },
})

const emit = defineEmits(['update:modelValue'])

const updateMin = (event) => {
  const target = event.target
  const newValue = parseFloat(target.value) || 0
  emit('update:modelValue', {
    ...props.modelValue,
    min: newValue,
  })
}

const updateMax = (event) => {
  const target = event.target
  const newValue = parseFloat(target.value) || 0
  emit('update:modelValue', {
    ...props.modelValue,
    max: newValue,
  })
}
</script>

<style scoped>
input[type='number']::-webkit-outer-spin-button,
input[type='number']::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}
</style>
