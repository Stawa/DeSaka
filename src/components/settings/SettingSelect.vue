<template>
  <div class="w-full">
    <!-- Enhanced label -->
    <label
      :for="id"
      class="block text-sm font-bold text-gray-800 dark:text-gray-200 mb-3 transition-colors flex items-center gap-2"
    >
      <span class="mdi mdi-format-list-bulleted text-blue-500"></span>
      {{ label }}
      <span v-if="required" class="text-red-500 ml-1">*</span>
    </label>

    <div class="relative group">
      <!-- Enhanced select field -->
      <select
        :id="id"
        :value="modelValue"
        @change="handleChange"
        @focus="isFocused = true"
        @blur="isFocused = false"
        :disabled="disabled"
        :class="selectClasses"
      >
        <option value="" disabled>{{ placeholder || 'Select an option...' }}</option>
        <option v-for="option in options" :key="option.value" :value="option.value">
          {{ option.label }}
        </option>
      </select>

      <!-- Custom dropdown arrow -->
      <div class="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none">
        <svg
          class="w-5 h-5 transition-transform duration-200 group-hover:scale-110"
          :class="arrowClasses"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2.5"
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </div>
    </div>

    <!-- Enhanced hint and error message -->
    <div class="mt-3 min-h-[1.25rem]">
      <p
        v-if="error"
        class="text-xs text-red-600 dark:text-red-400 font-semibold flex items-center gap-2 bg-red-50 dark:bg-red-900/20 px-3 py-2 rounded-lg border border-red-200 dark:border-red-800"
      >
        <span class="mdi mdi-alert-circle"></span>
        {{ error }}
      </p>
      <p v-else-if="hint" class="text-xs text-blue-600 dark:text-blue-400 flex items-center gap-2">
        <span class="mdi mdi-information-outline"></span>
        {{ hint }}
      </p>
    </div>

    <!-- Selected option info -->
    <div
      v-if="showSelectedInfo && selectedOption"
      class="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-700"
    >
      <div class="flex items-center gap-2 text-xs">
        <span class="mdi mdi-check-circle text-blue-500"></span>
        <span class="font-semibold text-blue-700 dark:text-blue-300">Selected:</span>
        <span class="text-blue-600 dark:text-blue-400">{{ selectedOption.label }}</span>
      </div>
      <div
        v-if="selectedOption.description"
        class="mt-1 flex items-center gap-2 text-xs text-blue-600 dark:text-blue-400"
      >
        <span class="mdi mdi-text-box-outline text-blue-500"></span>
        <span class="font-semibold text-blue-700 dark:text-blue-300">Description:</span>
        <span class="text-blue-600 dark:text-blue-400"> {{ selectedOption.description }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'

const props = defineProps({
  id: String,
  label: String,
  hint: String,
  error: String,
  placeholder: String,
  options: {
    type: Array,
    required: true,
    default: () => [],
  },
  modelValue: [String, Number],
  required: {
    type: Boolean,
    default: false,
  },
  disabled: {
    type: Boolean,
    default: false,
  },
  showSelectedInfo: {
    type: Boolean,
    default: false,
  },
  variant: {
    type: String,
    default: 'default',
    validator: (value) => ['default', 'success', 'warning', 'error'].includes(value),
  },
})

const emit = defineEmits(['update:modelValue'])

const isFocused = ref(false)

const selectedOption = computed(() => {
  return props.options.find((option) => option.value === props.modelValue)
})

const selectClasses = computed(() => {
  const baseClasses = [
    'block w-full px-4 py-3.5 pr-12 text-sm font-semibold',
    'bg-white dark:bg-gray-900',
    'border-2 rounded-xl',
    'transition-all duration-300 ease-in-out',
    'focus:outline-none focus:ring-0',
    'shadow-sm hover:shadow-md focus:shadow-lg',
    'appearance-none cursor-pointer',
  ]

  if (props.disabled) {
    baseClasses.push('opacity-60 cursor-not-allowed bg-gray-50 dark:bg-gray-800')
  }

  if (props.error || props.variant === 'error') {
    baseClasses.push(
      'border-red-300 dark:border-red-600',
      'focus:border-red-500 dark:focus:border-red-400',
      'focus:shadow-red-500/20',
      'text-red-900 dark:text-red-100',
    )
  } else if (props.variant === 'success') {
    baseClasses.push(
      'border-green-300 dark:border-green-600',
      'focus:border-green-500 dark:focus:border-green-400',
      'focus:shadow-green-500/20',
      'text-green-900 dark:text-green-100',
    )
  } else if (props.variant === 'warning') {
    baseClasses.push(
      'border-yellow-300 dark:border-yellow-600',
      'focus:border-yellow-500 dark:focus:border-yellow-400',
      'focus:shadow-yellow-500/20',
      'text-yellow-900 dark:text-yellow-100',
    )
  } else {
    baseClasses.push(
      'border-blue-200 dark:border-blue-700',
      'hover:border-blue-300 dark:hover:border-blue-600',
      'focus:border-blue-500 dark:focus:border-blue-400',
      'focus:shadow-blue-500/20',
      'text-gray-900 dark:text-gray-100',
    )
  }

  return baseClasses.join(' ')
})

const arrowClasses = computed(() => {
  if (props.error || props.variant === 'error') {
    return 'text-red-500 dark:text-red-400'
  } else if (props.variant === 'success') {
    return 'text-green-500 dark:text-green-400'
  } else if (props.variant === 'warning') {
    return 'text-yellow-500 dark:text-yellow-400'
  } else if (isFocused.value) {
    return 'text-blue-500 dark:text-blue-400'
  }
  return 'text-gray-400 dark:text-gray-500'
})

const handleChange = (event) => {
  emit('update:modelValue', event.target.value)
}
</script>
