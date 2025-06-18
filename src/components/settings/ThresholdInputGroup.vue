<template>
  <div
    class="bg-white dark:bg-gray-900 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-6 transition-all duration-300 hover:shadow-xl"
    :class="{ 'ring-2 ring-offset-2': isActive }" :style="{ '--ring-color': themeColor }">
    <!-- Header -->
    <div class="flex items-center justify-between mb-6">
      <div class="flex items-center">
        <div class="w-10 h-10 rounded-xl flex items-center justify-center mr-3 transition-all duration-200"
          :style="{ backgroundColor: `${themeColor}20`, color: themeColor }">
          <component :is="iconComponent" class="w-5 h-5" />
        </div>
        <div>
          <h3 class="text-lg font-semibold text-gray-800 dark:text-gray-200">
            {{ title }}
          </h3>
          <p class="text-sm text-gray-500 dark:text-gray-400">
            Configure {{ label }} thresholds
          </p>
        </div>
      </div>

      <!-- Status indicator -->
      <div class="flex items-center space-x-2">
        <div class="w-3 h-3 rounded-full transition-all duration-200" :class="statusClasses"></div>
        <span class="text-xs font-medium" :class="statusTextClasses">
          {{ statusText }}
        </span>
      </div>
    </div>

    <!-- Visual Range Display -->
    <div class="mb-6">
      <div class="relative">
        <!-- Range bar -->
        <div class="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
          <div class="h-full bg-gradient-to-r transition-all duration-300" :style="rangeGradient"></div>
        </div>

        <!-- Range markers -->
        <div class="flex justify-between items-center mt-2 text-xs text-gray-500 dark:text-gray-400">
          <span>{{ min }}</span>
          <div class="flex space-x-4">
            <span class="px-2 py-1 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-md">
              {{ modelValue.min }}{{ unit }}
            </span>
            <span class="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-md">
              {{ modelValue.max }}{{ unit }}
            </span>
          </div>
          <span>{{ max }}</span>
        </div>
      </div>
    </div>

    <!-- Threshold Controls -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <!-- Min Threshold -->
      <div class="space-y-3">
        <div class="flex items-center justify-between">
          <label :for="`${id}-min`" class="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center">
            <div class="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
            Minimum Threshold
          </label>
          <button @click="resetMin"
            class="text-xs text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors">
            Reset
          </button>
        </div>

        <div class="relative group">
          <input :id="`${id}-min`" :value="modelValue.min" @input="updateMin" @focus="setActive(true)"
            @blur="setActive(false)" type="number" :step="stepValue" :min="min" :max="modelValue.max - stepValue"
            class="block w-full px-4 py-3 text-sm font-medium bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-0 transition-all duration-200 hover:border-gray-300 dark:hover:border-gray-600"
            :class="minInputClasses" />
          <div class="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none">
            <span class="text-sm font-medium text-gray-500 dark:text-gray-400">{{ unit }}</span>
          </div>
        </div>

        <div class="flex items-center justify-between text-xs">
          <span class="text-red-600 dark:text-red-400">Alert when below</span>
          <span class="text-gray-500 dark:text-gray-400">
            Range: {{ min }} - {{ modelValue.max - stepValue }}
          </span>
        </div>
      </div>

      <!-- Max Threshold -->
      <div class="space-y-3">
        <div class="flex items-center justify-between">
          <label :for="`${id}-max`" class="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center">
            <div class="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
            Maximum Threshold
          </label>
          <button @click="resetMax"
            class="text-xs text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors">
            Reset
          </button>
        </div>

        <div class="relative group">
          <input :id="`${id}-max`" :value="modelValue.max" @input="updateMax" @focus="setActive(true)"
            @blur="setActive(false)" type="number" :step="stepValue" :min="modelValue.min + stepValue" :max="max"
            class="block w-full px-4 py-3 text-sm font-medium bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-0 transition-all duration-200 hover:border-gray-300 dark:hover:border-gray-600"
            :class="maxInputClasses" />
          <div class="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none">
            <span class="text-sm font-medium text-gray-500 dark:text-gray-400">{{ unit }}</span>
          </div>
        </div>

        <div class="flex items-center justify-between text-xs">
          <span class="text-green-600 dark:text-green-400">Alert when above</span>
          <span class="text-gray-500 dark:text-gray-400">
            Range: {{ modelValue.min + stepValue }} - {{ max }}
          </span>
        </div>
      </div>
    </div>

    <!-- Quick Presets -->
    <div v-if="presets.length > 0" class="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
      <h4 class="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Quick Presets</h4>
      <div class="flex flex-wrap gap-2">
        <button v-for="preset in presets" :key="preset.name" @click="applyPreset(preset)"
          class="px-3 py-2 text-xs font-medium rounded-lg border transition-all duration-200 hover:scale-105"
          :class="presetClasses">
          {{ preset.name }}
          <span class="ml-1 text-gray-500">({{ preset.min }}-{{ preset.max }})</span>
        </button>
      </div>
    </div>

    <!-- Validation Messages -->
    <div v-if="validationMessage"
      class="mt-4 p-3 rounded-lg bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700">
      <div class="flex items-center">
        <svg class="w-4 h-4 text-yellow-600 dark:text-yellow-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd"
            d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
            clip-rule="evenodd" />
        </svg>
        <span class="text-sm text-yellow-800 dark:text-yellow-200">{{ validationMessage }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'

interface Preset {
  name: string
  min: number
  max: number
}

const props = withDefaults(defineProps<{
  id: string
  title: string
  label: string
  icon?: string
  iconColor?: string
  unit: string
  min: number
  max: number
  step?: number
  themeColor?: string
  presets?: Preset[]
  defaultMin?: number
  defaultMax?: number
  modelValue: {
    min: number
    max: number
  }
}>(), {
  step: 1,
  themeColor: '#3B82F6',
  presets: () => []
})

const emit = defineEmits<{
  'update:modelValue': [value: { min: number; max: number }]
}>()

const isActive = ref(false)

// Computed properties
const stepValue = computed(() => props.step || 1)
const themeColor = computed(() => props.themeColor || '#3B82F6')
const presets = computed(() => props.presets || [])

const iconComponent = computed(() => {
  // Simple icon mapping - in real app you'd use a proper icon library
  const iconMap: Record<string, string> = {
    'thermometer': '🌡️',
    'speedometer': '⚡',
    'gauge': '📊',
    'chart': '📈'
  }
  return iconMap[props.icon || 'gauge'] || '📊'
})

const statusClasses = computed(() => {
  const range = props.max - props.min
  const currentRange = props.modelValue.max - props.modelValue.min
  const efficiency = currentRange / range

  if (efficiency > 0.7) return 'bg-green-500 animate-pulse'
  if (efficiency > 0.4) return 'bg-yellow-500'
  return 'bg-red-500'
})

const statusTextClasses = computed(() => {
  const range = props.max - props.min
  const currentRange = props.modelValue.max - props.modelValue.min
  const efficiency = currentRange / range

  if (efficiency > 0.7) return 'text-green-600 dark:text-green-400'
  if (efficiency > 0.4) return 'text-yellow-600 dark:text-yellow-400'
  return 'text-red-600 dark:text-red-400'
})

const statusText = computed(() => {
  const range = props.max - props.min
  const currentRange = props.modelValue.max - props.modelValue.min
  const efficiency = currentRange / range

  if (efficiency > 0.7) return 'Optimal'
  if (efficiency > 0.4) return 'Moderate'
  return 'Narrow'
})

const rangeGradient = computed(() => {
  const minPercent = ((props.modelValue.min - props.min) / (props.max - props.min)) * 100
  const maxPercent = ((props.modelValue.max - props.min) / (props.max - props.min)) * 100

  return {
    background: `linear-gradient(to right, 
      transparent 0%, 
      transparent ${minPercent}%, 
      #ef4444 ${minPercent}%, 
      #22c55e ${maxPercent}%, 
      transparent ${maxPercent}%, 
      transparent 100%)`
  }
})

const minInputClasses = computed(() => [
  'focus:border-red-500 dark:focus:border-red-400',
  'focus:shadow-lg focus:shadow-red-500/20'
])

const maxInputClasses = computed(() => [
  'focus:border-green-500 dark:focus:border-green-400',
  'focus:shadow-lg focus:shadow-green-500/20'
])

const presetClasses = computed(() => [
  'bg-gray-50 dark:bg-gray-800',
  'border-gray-200 dark:border-gray-700',
  'text-gray-700 dark:text-gray-300',
  'hover:bg-gray-100 dark:hover:bg-gray-700',
  'hover:border-gray-300 dark:hover:border-gray-600'
])

const validationMessage = computed(() => {
  if (props.modelValue.min >= props.modelValue.max) {
    return 'Minimum threshold must be less than maximum threshold'
  }
  if (props.modelValue.min < props.min || props.modelValue.max > props.max) {
    return `Values must be between ${props.min} and ${props.max}`
  }
  const gap = props.modelValue.max - props.modelValue.min
  if (gap < stepValue.value) {
    return 'Thresholds are too close together'
  }
  return null
})

// Methods
const setActive = (active: boolean) => {
  isActive.value = active
}

const updateMin = (event: Event) => {
  const target = event.target as HTMLInputElement
  const value = parseFloat(target.value)
  if (!isNaN(value)) {
    emit('update:modelValue', {
      min: Math.max(props.min, Math.min(value, props.modelValue.max - stepValue.value)),
      max: props.modelValue.max
    })
  }
}

const updateMax = (event: Event) => {
  const target = event.target as HTMLInputElement
  const value = parseFloat(target.value)
  if (!isNaN(value)) {
    emit('update:modelValue', {
      min: props.modelValue.min,
      max: Math.max(props.modelValue.min + stepValue.value, Math.min(value, props.max))
    })
  }
}

const resetMin = () => {
  emit('update:modelValue', {
    min: props.defaultMin || props.min,
    max: props.modelValue.max
  })
}

const resetMax = () => {
  emit('update:modelValue', {
    min: props.modelValue.min,
    max: props.defaultMax || props.max
  })
}

const applyPreset = (preset: Preset) => {
  emit('update:modelValue', {
    min: preset.min,
    max: preset.max
  })
}
</script>

<style scoped>
.ring-2 {
  --tw-ring-color: var(--ring-color);
}
</style>
