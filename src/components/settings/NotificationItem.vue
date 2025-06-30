<template>
  <div class="group">
    <div class="flex items-start justify-between gap-4">
      <div class="flex items-start gap-3 min-w-0 flex-1">
        <div
          class="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 transition-all duration-200"
          :class="
            enabled
              ? 'bg-blue-50 dark:bg-blue-900/30 ring-1 ring-blue-200 dark:ring-blue-800/50'
              : 'bg-gray-50 dark:bg-gray-800'
          "
        >
          <span
            :class="[
              'mdi',
              icon,
              'transition-colors duration-200',
              enabled ? 'text-blue-600 dark:text-blue-400' : 'text-gray-400 dark:text-gray-500',
            ]"
          ></span>
        </div>

        <div class="min-w-0 flex-1">
          <div class="flex items-center gap-2">
            <h3 class="font-medium text-gray-900 dark:text-gray-100 text-sm truncate">
              {{ label }}
            </h3>
            <div
              v-if="enabled"
              class="w-2 h-2 mt-0.5 bg-green-400 rounded-full flex-shrink-0"
              aria-label="Active"
            ></div>
            <div
              v-if="!enabled"
              class="w-2 h-2 mt-0.5 bg-gray-400 rounded-full flex-shrink-0"
              aria-label="Active"
            ></div>
          </div>
          <p class="mt-0.5 text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
            {{ description }}
          </p>
        </div>
      </div>

      <div class="flex-shrink-0">
        <label class="relative inline-flex items-center cursor-pointer group/toggle">
          <span class="sr-only">Toggle {{ label }}</span>
          <input
            type="checkbox"
            class="sr-only peer"
            :checked="enabled"
            @change="$emit('update:enabled', $event.target.checked)"
          />
          <div
            class="w-10 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-500/20 rounded-full peer dark:bg-gray-700 peer-checked:bg-blue-600 dark:peer-checked:bg-blue-500 transition-all duration-200 group-hover/toggle:shadow-sm"
          ></div>
          <div
            class="absolute top-0.5 left-0.5 bg-white rounded-full h-4 w-4 peer-checked:translate-x-5 rtl:peer-checked:-translate-x-5 transition-transform duration-200 shadow-sm group-hover/toggle:shadow-md"
          ></div>
        </label>
      </div>
    </div>

    <div
      v-if="$slots.extra && enabled"
      class="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800 transition-all duration-300"
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
