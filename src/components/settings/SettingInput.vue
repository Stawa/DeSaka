<template>
  <div class="w-full">
    <label :for="id" class="block text-sm font-semibold text-gray-800 dark:text-gray-200 mb-2 transition-colors">
      {{ label }}
      <span v-if="required" class="text-red-500 ml-1">*</span>
    </label>

    <div class="relative group">
      <!-- Input field -->
      <input :id="id" :value="modelValue" @input="handleInput" @focus="isFocused = true" @blur="isFocused = false"
        type="number" :min="min" :max="max" :step="step" :placeholder="placeholder" :disabled="disabled"
        :class="inputClasses" />

      <!-- Suffix -->
      <div v-if="suffix"
        class="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none text-sm font-medium"
        :class="suffixClasses">
        {{ suffix }}
      </div>

      <!-- Step buttons -->
      <div v-if="showStepButtons && !disabled" class="absolute inset-y-0 right-0 flex flex-col">
        <button type="button" @click="increment"
          class="flex-1 px-3 flex items-center justify-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors rounded-tr-xl"
          :class="{ 'cursor-not-allowed opacity-50': isAtMax }" :disabled="isAtMax">
          <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7" />
          </svg>
        </button>
        <button type="button" @click="decrement"
          class="flex-1 px-3 flex items-center justify-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors rounded-br-xl"
          :class="{ 'cursor-not-allowed opacity-50': isAtMin }" :disabled="isAtMin">
          <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </div>
    </div>

    <!-- Hint and error message -->
    <div class="mt-2 min-h-[1.25rem]">
      <p v-if="error" class="text-xs text-red-600 dark:text-red-400 animate-pulse">
        {{ error }}
      </p>
      <p v-else-if="hint" class="text-xs text-gray-600 dark:text-gray-400">
        {{ hint }}
      </p>
    </div>

    <!-- Progress indicator (for ranges) -->
    <div v-if="showProgress && min !== undefined && max !== undefined" class="mt-2">
      <div class="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
        <div
          class="bg-gradient-to-r from-blue-500 to-purple-600 h-1.5 rounded-full transition-all duration-300 ease-out"
          :style="{ width: progressPercentage + '%' }"></div>
      </div>
      <div class="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
        <span>{{ min }}</span>
        <span>{{ max }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'

const props = defineProps({
  id: String,
  label: String,
  suffix: String,
  hint: String,
  error: String,
  placeholder: String,
  min: Number,
  max: Number,
  step: {
    type: Number,
    default: 1
  },
  modelValue: Number,
  required: {
    type: Boolean,
    default: false
  },
  disabled: {
    type: Boolean,
    default: false
  },
  showStepButtons: {
    type: Boolean,
    default: false
  },
  showProgress: {
    type: Boolean,
    default: false
  },
  variant: {
    type: String,
    default: 'default',
    validator: (value) => ['default', 'success', 'warning', 'error'].includes(value)
  }
})

const emit = defineEmits(['update:modelValue'])

const isFocused = ref(false)

const inputClasses = computed(() => {
  const baseClasses = [
    'block w-full px-4 py-3 text-sm font-medium',
    'bg-white dark:bg-gray-900',
    'border-2 rounded-xl',
    'transition-all duration-200 ease-in-out',
    'placeholder-gray-400 dark:placeholder-gray-500',
    'focus:outline-none focus:ring-0'
  ]

  if (props.disabled) {
    baseClasses.push('opacity-60 cursor-not-allowed bg-gray-50 dark:bg-gray-800')
  }

  if (props.showStepButtons && !props.disabled) {
    baseClasses.push('pr-12')
  } else if (props.suffix) {
    baseClasses.push('pr-12')
  }

  // Border and focus states based on variant
  if (props.error || props.variant === 'error') {
    baseClasses.push(
      'border-red-300 dark:border-red-600',
      'focus:border-red-500 dark:focus:border-red-400',
      'focus:shadow-lg focus:shadow-red-500/20'
    )
  } else if (props.variant === 'success') {
    baseClasses.push(
      'border-green-300 dark:border-green-600',
      'focus:border-green-500 dark:focus:border-green-400',
      'focus:shadow-lg focus:shadow-green-500/20'
    )
  } else if (props.variant === 'warning') {
    baseClasses.push(
      'border-yellow-300 dark:border-yellow-600',
      'focus:border-yellow-500 dark:focus:border-yellow-400',
      'focus:shadow-lg focus:shadow-yellow-500/20'
    )
  } else {
    baseClasses.push(
      'border-gray-200 dark:border-gray-700',
      'hover:border-gray-300 dark:hover:border-gray-600',
      'focus:border-blue-500 dark:focus:border-blue-400',
      'focus:shadow-lg focus:shadow-blue-500/20'
    )
  }

  return baseClasses.join(' ')
})

const suffixClasses = computed(() => {
  if (props.error || props.variant === 'error') {
    return 'text-red-500 dark:text-red-400'
  } else if (props.variant === 'success') {
    return 'text-green-500 dark:text-green-400'
  } else if (props.variant === 'warning') {
    return 'text-yellow-500 dark:text-yellow-400'
  } else if (isFocused.value) {
    return 'text-blue-500 dark:text-blue-400'
  }
  return 'text-gray-500 dark:text-gray-400'
})

const isAtMin = computed(() => {
  return props.min !== undefined && props.modelValue <= props.min
})

const isAtMax = computed(() => {
  return props.max !== undefined && props.modelValue >= props.max
})

const progressPercentage = computed(() => {
  if (props.min === undefined || props.max === undefined || !props.modelValue) {
    return 0
  }
  return Math.max(0, Math.min(100, ((props.modelValue - props.min) / (props.max - props.min)) * 100))
})

const handleInput = (event) => {
  const value = event.target.valueAsNumber
  if (!isNaN(value)) {
    emit('update:modelValue', value)
  }
}

const increment = () => {
  if (!isAtMax.value) {
    const newValue = (props.modelValue || 0) + props.step
    const clampedValue = props.max !== undefined ? Math.min(newValue, props.max) : newValue
    emit('update:modelValue', clampedValue)
  }
}

const decrement = () => {
  if (!isAtMin.value) {
    const newValue = (props.modelValue || 0) - props.step
    const clampedValue = props.min !== undefined ? Math.max(newValue, props.min) : newValue
    emit('update:modelValue', clampedValue)
  }
}
</script>
