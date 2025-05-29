<script setup lang="ts">
import { ref, watch } from 'vue'

const emit = defineEmits(['toggle-sidebar', 'toggle-dark-mode'])

const props = defineProps<{
  isDarkMode?: boolean
}>()

const isAnimating = ref(false)

const toggleDarkMode = () => {
  isAnimating.value = true
  setTimeout(() => {
    isAnimating.value = false
  }, 600)
  emit('toggle-dark-mode')
}
</script>

<template>
  <header
    class="bg-gradient-to-r from-primary-600 to-primary-800 shadow-lg z-10 text-white sticky top-0"
  >
    <div class="container mx-auto px-4 py-4 flex items-center justify-between">
      <div class="flex items-center">
        <button
          @click="$emit('toggle-sidebar')"
          class="mr-4 text-white hover:text-primary-200 focus:outline-none md:hidden transition-colors duration-200"
          aria-label="Toggle sidebar"
        >
          <span class="mdi mdi-menu text-2xl"></span>
        </button>

        <div class="flex items-center">
          <div class="bg-white p-1.5 rounded-full shadow-md mr-3">
            <img src="/favicon.ico" alt="DeSaka Logo" class="h-7 w-7" />
          </div>
          <h1 class="text-2xl font-bold text-white">DeSaka</h1>
        </div>
      </div>

      <div class="flex items-center space-x-5">
        <!-- Action buttons with improved styling -->
        <div class="flex items-center space-x-2">
          <!-- Dark mode toggle with enhanced design, mode indicator and animation - only visible on medium and larger screens -->
          <button
            @click="toggleDarkMode"
            class="relative py-2 px-3 rounded-full bg-white/15 hover:bg-white/25 text-white transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-white/50 shadow-inner overflow-hidden group hidden md:flex"
            :title="isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'"
            aria-label="Toggle dark mode"
            :class="{
              'ring-1 ring-yellow-300/50': isDarkMode,
              'ring-1 ring-blue-300/50': !isDarkMode,
              'animate-mode-toggle': isAnimating,
            }"
          >
            <span
              class="absolute inset-0 bg-gradient-to-r opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              :class="
                isDarkMode
                  ? 'from-yellow-300/20 to-orange-500/20'
                  : 'from-blue-300/20 to-indigo-500/20'
              "
            ></span>
            <span
              class="mdi text-xl relative z-10 transform transition-transform duration-300 group-hover:scale-110"
              :class="{
                'mdi-weather-sunny text-yellow-300': isDarkMode,
                'mdi-weather-night text-blue-200': !isDarkMode,
                'animate-spin-once': isAnimating,
              }"
            ></span>
            <span class="sr-only">{{
              isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'
            }}</span>
          </button>
        </div>
      </div>
    </div>
  </header>
</template>

<style scoped>
@keyframes mode-toggle-pulse {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.1);
  }
  100% {
    transform: scale(1);
  }
}

@keyframes spin-once {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

.animate-mode-toggle {
  animation: mode-toggle-pulse 0.6s ease-in-out;
}

.animate-spin-once {
  animation: spin-once 0.6s ease-in-out;
}
</style>
