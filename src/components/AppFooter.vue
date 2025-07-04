<script setup lang="ts">
import { ref } from 'vue'

const currentYear = ref(new Date().getFullYear())
</script>

<template>
  <footer
    class="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-t border-gray-200/60 dark:border-gray-800/60 py-4 w-full"
  >
    <div class="container-fluid flex flex-col sm:flex-row items-center justify-between gap-2">
      <div class="text-xs text-gray-500 dark:text-gray-400">
        &copy; {{ currentYear }} DeSaka Environmental Monitor. All rights reserved.
      </div>
      <div class="flex items-center gap-4">
        <a
          href="#"
          class="text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 transition-colors"
        >
          Privacy Policy
        </a>
        <a
          href="#"
          class="text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 transition-colors"
        >
          Terms of Service
        </a>
        <a
          href="#"
          class="text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 transition-colors"
        >
          Contact
        </a>
      </div>
    </div>
  </footer>
</template>
