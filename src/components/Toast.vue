<script setup lang="ts">
import { useToast } from '@/composables/useToast'

const { toast } = useToast()
</script>

<template>
  <transition name="toast">
    <div
      v-if="toast.show"
      class="fixed top-4 right-4 z-50 max-w-md px-4 py-3 rounded-lg shadow-lg flex items-center"
      :class="{
        'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300':
          toast.type === 'success',
        'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300': toast.type === 'error',
        'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300': toast.type === 'info',
        'bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-300':
          toast.type === 'warning',
      }"
    >
      <span
        class="mdi text-lg mr-2"
        :class="{
          'mdi-check-circle': toast.type === 'success',
          'mdi-alert-circle': toast.type === 'error',
          'mdi-information': toast.type === 'info',
          'mdi-alert': toast.type === 'warning',
        }"
      ></span>
      <div>{{ toast.message }}</div>
      <button
        @click="toast.show = false"
        class="ml-auto p-1 rounded-full hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
      >
        <span class="mdi mdi-close"></span>
      </button>
    </div>
  </transition>
</template>

<style scoped>
.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s ease;
}

.toast-enter-from,
.toast-leave-to {
  opacity: 0;
  transform: translateY(-20px);
}
</style>
