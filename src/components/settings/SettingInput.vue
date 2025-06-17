<template>
  <div>
    <label :for="id" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
      {{ label }}
    </label>
    <div class="relative">
      <input
        :id="id"
        :value="modelValue"
        @input="$emit('update:modelValue', $event.target.valueAsNumber)"
        type="number"
        :min="min"
        :max="max"
        class="block w-full px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:focus:ring-primary-500 dark:focus:border-primary-500 transition-colors"
      />
      <div
        class="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-gray-500 dark:text-gray-400"
      >
        {{ suffix }}
      </div>
    </div>
    <p class="mt-1 text-xs text-gray-500 dark:text-gray-400">{{ hint }}</p>
  </div>
</template>

<script setup>
defineProps({
  id: String,
  label: String,
  suffix: String,
  hint: String,
  min: Number,
  max: Number,
  modelValue: Number,
})

defineEmits(['update:modelValue'])
</script>
