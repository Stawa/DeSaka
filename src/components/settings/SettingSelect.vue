<template>
  <div class="w-full">
    <!-- Label -->
    <label
      :for="id"
      class="block text-sm font-semibold text-gray-800 dark:text-gray-200 mb-2 transition-colors"
    >
      {{ label }}
      <span v-if="required" class="text-red-500 ml-1">*</span>
    </label>

    <!-- Select Container -->
    <div class="relative group">
      <select
        :id="id"
        :value="modelValue"
        @change="handleChange"
        @focus="handleFocus"
        @blur="handleBlur"
        :disabled="disabled"
        :class="selectClasses"
      >
        <!-- Placeholder option -->
        <option v-if="placeholder" value="" disabled hidden>
          {{ placeholder }}
        </option>

        <!-- Option groups -->
        <template v-for="item in processedOptions" :key="item.key">
          <optgroup v-if="item.type === 'group'" :label="item.label">
            <option
              v-for="option in item.options"
              :key="option.value"
              :value="option.value"
              :disabled="option.disabled"
            >
              {{ option.label }}
            </option>
          </optgroup>
          <option v-else :value="item.value" :disabled="item.disabled">
            {{ item.label }}
          </option>
        </template>
      </select>

      <!-- Custom dropdown arrow -->
      <div class="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none">
        <svg
          class="w-5 h-5 transition-transform duration-200"
          :class="[isFocused ? 'rotate-180' : '', arrowClasses]"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </div>
    </div>

    <!-- Hint, error, or selected info -->
    <div class="mt-2 min-h-[1.25rem]">
      <p v-if="error" class="text-xs text-red-600 dark:text-red-400 animate-pulse">
        {{ error }}
      </p>
      <p
        v-else-if="showSelectedInfo && selectedOption"
        class="text-xs text-blue-600 dark:text-blue-400"
      >
        Selected: {{ selectedOption.label }}
        <span v-if="selectedOption.description" class="text-gray-500 dark:text-gray-400">
          - {{ selectedOption.description }}
        </span>
      </p>
      <p v-else-if="hint" class="text-xs text-gray-600 dark:text-gray-400">
        {{ hint }}
      </p>
    </div>

    <!-- Search functionality for large option sets -->
    <div v-if="searchable && options.length > searchThreshold" class="mt-2">
      <div class="relative">
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Search options..."
          class="w-full px-3 py-2 text-xs bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
        />
        <div class="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
          <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, nextTick } from 'vue'

const props = defineProps({
  id: String,
  label: String,
  options: {
    type: Array,
    default: () => [],
  },
  hint: String,
  error: String,
  placeholder: String,
  modelValue: [String, Number],
  required: {
    type: Boolean,
    default: false,
  },
  disabled: {
    type: Boolean,
    default: false,
  },
  variant: {
    type: String,
    default: 'default',
    validator: (value) => ['default', 'success', 'warning', 'error'].includes(value),
  },
  size: {
    type: String,
    default: 'medium',
    validator: (value) => ['small', 'medium', 'large'].includes(value),
  },
  searchable: {
    type: Boolean,
    default: false,
  },
  searchThreshold: {
    type: Number,
    default: 10,
  },
  showSelectedInfo: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['update:modelValue', 'change'])

const isFocused = ref(false)
const searchQuery = ref('')

const sizeClasses = computed(() => {
  switch (props.size) {
    case 'small':
      return 'px-3 py-2 text-sm'
    case 'large':
      return 'px-5 py-4 text-base'
    default:
      return 'px-4 py-3 text-sm'
  }
})

const selectClasses = computed(() => {
  const baseClasses = [
    'block w-full font-medium appearance-none cursor-pointer',
    'bg-white dark:bg-gray-900',
    'border-2 rounded-xl',
    'transition-all duration-200 ease-in-out',
    'focus:outline-none focus:ring-0',
    'pr-12',
    sizeClasses.value,
  ]

  if (props.disabled) {
    baseClasses.push('opacity-60 cursor-not-allowed bg-gray-50 dark:bg-gray-800')
  }

  if (props.error || props.variant === 'error') {
    baseClasses.push(
      'border-red-300 dark:border-red-600',
      'focus:border-red-500 dark:focus:border-red-400',
      'focus:shadow-lg focus:shadow-red-500/20',
    )
  } else if (props.variant === 'success') {
    baseClasses.push(
      'border-green-300 dark:border-green-600',
      'focus:border-green-500 dark:focus:border-green-400',
      'focus:shadow-lg focus:shadow-green-500/20',
    )
  } else if (props.variant === 'warning') {
    baseClasses.push(
      'border-yellow-300 dark:border-yellow-600',
      'focus:border-yellow-500 dark:focus:border-yellow-400',
      'focus:shadow-lg focus:shadow-yellow-500/20',
    )
  } else {
    baseClasses.push(
      'border-gray-200 dark:border-gray-700',
      'hover:border-gray-300 dark:hover:border-gray-600',
      'focus:border-blue-500 dark:focus:border-blue-400',
      'focus:shadow-lg focus:shadow-blue-500/20',
    )
  }

  return baseClasses.join(' ')
})

const arrowClasses = computed(() => {
  if (props.disabled) {
    return 'text-gray-400 dark:text-gray-500'
  } else if (props.error || props.variant === 'error') {
    return 'text-red-500 dark:text-red-400'
  } else if (props.variant === 'success') {
    return 'text-green-500 dark:text-green-400'
  } else if (props.variant === 'warning') {
    return 'text-yellow-500 dark:text-yellow-400'
  }
  return 'text-gray-500 dark:text-gray-400'
})

const processedOptions = computed(() => {
  let options = props.options

  if (props.searchable && searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    options = options.filter((option) => {
      if (option.options) {
        const filteredGroupOptions = option.options.filter((subOption) =>
          subOption.label.toLowerCase().includes(query),
        )
        return filteredGroupOptions.length > 0
      }
      return option.label.toLowerCase().includes(query)
    })
  }

  return options.map((option, index) => ({
    ...option,
    key: option.value || `option-${index}`,
    type: option.options ? 'group' : 'option',
  }))
})

const selectedOption = computed(() => {
  const findOption = (options, value) => {
    for (const option of options) {
      if (option.options) {
        const found = findOption(option.options, value)
        if (found) return found
      } else if (option.value === value) {
        return option
      }
    }
    return null
  }

  return findOption(props.options, props.modelValue)
})

const handleFocus = () => {
  isFocused.value = true
}

const handleBlur = () => {
  isFocused.value = false
}

const handleChange = (event) => {
  const value = event.target.value

  emit('update:modelValue', value)
  emit('change', value)

  nextTick(() => {
    isFocused.value = false
  })
}
</script>

<style scoped>
select option {
  @apply bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 py-2;
}

select option:checked {
  @apply bg-blue-100 dark:bg-blue-900;
}

select optgroup {
  @apply font-semibold text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-800;
}
</style>
