<template>
  <div
    class="p-6 bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 transition-colors duration-200"
    :class="{ 'border-blue-200 dark:border-blue-800': enabled }"
  >
    <div
      class="flex flex-col space-y-4 sm:flex-row sm:items-start sm:justify-between sm:space-y-0 sm:space-x-6"
    >
      <div class="flex items-start space-x-4">
        <div
          class="flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center transition-colors duration-200"
          :class="enabled ? 'bg-blue-50 dark:bg-blue-900/30' : 'bg-gray-50 dark:bg-gray-800'"
        >
          <span
            :class="[
              'mdi',
              icon,
              'text-lg transition-colors duration-200',
              enabled ? 'text-blue-600 dark:text-blue-400' : 'text-gray-500 dark:text-gray-400',
            ]"
          ></span>
        </div>

        <div class="flex-1 min-w-0">
          <h3 class="text-base font-medium text-gray-900 dark:text-gray-100 leading-tight">
            {{ label }}
          </h3>
          <p class="mt-1 text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
            {{ description }}
          </p>
        </div>
      </div>

      <div class="flex-shrink-0 self-start sm:self-center">
        <label class="relative inline-flex items-center cursor-pointer">
          <span class="sr-only">Toggle {{ label }}</span>
          <input
            type="checkbox"
            class="sr-only peer"
            :checked="enabled"
            @change="$emit('update:enabled', $event.target.checked)"
          />
          <div
            class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-500/20 rounded-full peer dark:bg-gray-700 peer-checked:bg-blue-600 dark:peer-checked:bg-blue-500 transition-colors duration-200"
          ></div>
          <div
            class="absolute top-0.5 left-0.5 bg-white rounded-full h-5 w-5 peer-checked:translate-x-5 rtl:peer-checked:-translate-x-5 transition-transform duration-200 shadow-sm"
          ></div>
        </label>
      </div>
    </div>

    <div
      v-if="$slots.extra && enabled"
      class="mt-6 pt-6 border-t border-gray-100 dark:border-gray-800"
    >
      <slot name="extra" />
    </div>
  </div>
</template>

<script setup>
defineProps({
  icon: String,
  label: String,
  description: String,
  enabled: Boolean,
})
defineEmits(['update:enabled'])
</script>
