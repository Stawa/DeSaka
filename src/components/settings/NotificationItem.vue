<template>
  <div 
    class="p-5 bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-md transition-all duration-300 transform hover:-translate-y-1"
    :class="{ 'ring-2 ring-primary-300 dark:ring-primary-700': enabled }"
  >
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div class="flex items-start sm:items-center gap-4">
        <div 
          class="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center" 
          :class="enabled ? 'bg-primary-100 dark:bg-primary-900/30' : 'bg-gray-100 dark:bg-gray-700'"
        >
          <span 
            :class="['mdi', icon, 'text-xl', enabled ? 'text-primary-600 dark:text-primary-400' : 'text-gray-500 dark:text-gray-400']"
          ></span>
        </div>
        <div>
          <h3 class="font-medium text-gray-800 dark:text-gray-200 text-lg">{{ label }}</h3>
          <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">{{ description }}</p>
        </div>
      </div>
      <label class="relative inline-flex items-center cursor-pointer self-start sm:self-center">
        <span class="sr-only">Toggle {{ label }}</span>
        <input
          type="checkbox"
          class="sr-only peer"
          :checked="enabled"
          @change="$emit('update:enabled', $event.target.checked)"
        />
        <div
          class="w-12 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 dark:peer-focus:ring-primary-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary-600"
        ></div>
      </label>
    </div>
    <div 
      v-if="$slots.extra && enabled" 
      class="mt-5 pt-5 border-t border-gray-100 dark:border-gray-700 transition-all duration-300 animate-fadeIn"
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

<style scoped>
.animate-fadeIn {
  animation: fadeIn 0.3s ease-in-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
