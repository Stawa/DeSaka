<template>
  <div class="w-full">
    <!-- Enhanced label -->
    <label
      :for="id"
      class="block text-sm font-bold text-gray-800 dark:text-gray-200 mb-3 transition-colors flex items-center gap-2"
    >
      <span class="mdi mdi-cog-outline text-blue-500"></span>
      {{ label }}
      <span v-if="required" class="text-red-500 ml-1">*</span>
    </label>

    <div class="relative group">
      <!-- Enhanced input field -->
      <input
        :id="id"
        :value="modelValue"
        @input="handleInput"
        @focus="isFocused = true"
        @blur="isFocused = false"
        type="number"
        :min="min"
        :max="max"
        :step="step"
        :placeholder="placeholder"
        :disabled="disabled"
        :class="inputClasses"
      />

      <!-- Suffix and Step buttons container -->
      <div class="absolute inset-y-0 right-0 flex items-center">
        <!-- Suffix -->
        <div
          v-if="suffix"
          class="px-3 text-sm font-bold pointer-events-none"
          :class="suffixClasses"
        >
          {{ suffix }}
        </div>

        <!-- Modern step buttons -->
        <div
          v-if="showStepButtons && !disabled"
          class="flex flex-col border-l border-gray-200 dark:border-gray-700 ml-2"
        >
          <button
            type="button"
            @click="increment"
            class="flex items-center justify-center w-8 h-6 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all duration-200 rounded-tr-xl group/btn"
            :class="{ 'cursor-not-allowed opacity-50': isAtMax }"
            :disabled="isAtMax"
          >
            <svg
              class="w-3 h-3 transform group-hover/btn:scale-125 transition-transform"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="3"
                d="M5 15l7-7 7 7"
              />
            </svg>
          </button>
          <button
            type="button"
            @click="decrement"
            class="flex items-center justify-center w-8 h-6 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all duration-200 rounded-br-xl group/btn"
            :class="{ 'cursor-not-allowed opacity-50': isAtMin }"
            :disabled="isAtMin"
          >
            <svg
              class="w-3 h-3 transform group-hover/btn:scale-125 transition-transform"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="3"
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </button>
        </div>
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

    <!-- Value indicator -->
    <div
      v-if="min !== undefined && max !== undefined"
      class="mt-3 flex items-center justify-between text-xs"
    >
      <span class="text-gray-500 dark:text-gray-400 font-medium">Min: {{ min }}</span>
      <span
        class="text-blue-600 dark:text-blue-400 font-bold bg-blue-50 dark:bg-blue-900/30 px-2 py-1 rounded-full"
      >
        Current: {{ modelValue || 0 }}
      </span>
      <span class="text-gray-500 dark:text-gray-400 font-medium">Max: {{ max }}</span>
    </div>
  </div>
</template>

<style scoped>
input[type='number']::-webkit-outer-spin-button,
input[type='number']::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}
</style>

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
    default: 1,
  },
  modelValue: Number,
  required: {
    type: Boolean,
    default: false,
  },
  disabled: {
    type: Boolean,
    default: false,
  },
  showStepButtons: {
    type: Boolean,
    default: true,
  },
  variant: {
    type: String,
    default: 'default',
    validator: (value) => ['default', 'success', 'warning', 'error'].includes(value),
  },
})

const emit = defineEmits(['update:modelValue'])

const isFocused = ref(false)

const inputClasses = computed(() => {
  const baseClasses = [
    'block w-full px-4 py-3.5 text-sm font-semibold',
    'bg-white dark:bg-gray-900',
    'border-2 rounded-xl',
    'transition-all duration-300 ease-in-out',
    'placeholder-gray-400 dark:placeholder-gray-500',
    'focus:outline-none focus:ring-0',
    'shadow-sm hover:shadow-md focus:shadow-lg',
  ]

  if (props.disabled) {
    baseClasses.push('opacity-60 cursor-not-allowed bg-gray-50 dark:bg-gray-800')
  }

  // Always add right padding for suffix and/or step buttons
  baseClasses.push('pr-20')

  if (props.error || props.variant === 'error') {
    baseClasses.push(
      'border-red-300 dark:border-red-600',
      'focus:border-red-500 dark:focus:border-red-400',
      'focus:shadow-red-500/20',
    )
  } else if (props.variant === 'success') {
    baseClasses.push(
      'border-green-300 dark:border-green-600',
      'focus:border-green-500 dark:focus:border-green-400',
      'focus:shadow-green-500/20',
    )
  } else if (props.variant === 'warning') {
    baseClasses.push(
      'border-yellow-300 dark:border-yellow-600',
      'focus:border-yellow-500 dark:focus:border-yellow-400',
      'focus:shadow-yellow-500/20',
    )
  } else {
    baseClasses.push(
      'border-blue-200 dark:border-blue-700',
      'hover:border-blue-300 dark:hover:border-blue-600',
      'focus:border-blue-500 dark:focus:border-blue-400',
      'focus:shadow-blue-500/20',
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

const handleInput = (event) => {
  let value = event.target.valueAsNumber
  if (!isNaN(value)) {
    // Apply max constraint
    if (props.max !== undefined && value > props.max) {
      value = props.max
      event.target.value = value
    }
    // Apply min constraint
    if (props.min !== undefined && value < props.min) {
      value = props.min
      event.target.value = value
    }
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
