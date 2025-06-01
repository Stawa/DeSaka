<script setup lang="ts">
import { ref } from 'vue'

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
    class="relative backdrop-blur-lg shadow-md z-50 sticky top-0 transition-all duration-300"
    :class="
      isDarkMode
        ? 'bg-slate-800/95 border-b border-slate-700/50'
        : 'bg-indigo-600/95 border-b border-white/10'
    "
  >
    <div class="container mx-auto px-6 py-4 relative z-10">
      <div class="flex items-center justify-between">
        <!-- Left section -->
        <div class="flex items-center">
          <!-- Mobile menu button -->
          <button
            @click="$emit('toggle-sidebar')"
            class="mr-4 p-2 rounded-xl transition-all duration-300 md:hidden group hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2"
            :class="
              isDarkMode
                ? 'text-slate-300 hover:text-white hover:bg-slate-700/50 focus:ring-slate-400'
                : 'text-white/90 hover:text-white hover:bg-white/20 focus:ring-white/50'
            "
            aria-label="Toggle sidebar"
          >
            <span
              class="mdi mdi-menu text-2xl transform transition-transform duration-200 group-hover:rotate-180"
            ></span>
          </button>

          <!-- Logo section -->
          <div class="flex items-center cursor-pointer">
            <div
              class="relative p-2 rounded-lg mr-4 transition-all duration-300"
              :class="isDarkMode ? 'bg-slate-700' : 'bg-white/20'"
            >
              <img src="/Logo.webp" alt="DeSaka Logo" class="h-8 w-8 relative z-10" />
            </div>
            <div>
              <h1
                class="text-2xl font-bold tracking-tight"
                :class="isDarkMode ? 'text-white' : 'text-white'"
              >
                DeSaka
              </h1>
            </div>
          </div>
        </div>

        <!-- Right section -->
        <div class="flex items-center space-x-4">
          <!-- Dark mode toggle -->
          <button
            @click="toggleDarkMode"
            class="relative py-2 px-3 rounded-lg transition-all duration-300 focus:outline-none focus:ring-2 hidden md:flex"
            :class="
              isDarkMode
                ? 'bg-slate-700 text-yellow-300 focus:ring-yellow-300/50'
                : 'bg-white/20 text-white focus:ring-white/50'
            "
            :title="isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'"
            aria-label="Toggle dark mode"
          >
            <!-- Icon container -->
            <div class="flex items-center justify-center">
              <span
                class="mdi text-xl"
                :class="{
                  'mdi-weather-sunny': isDarkMode,
                  'mdi-weather-night': !isDarkMode,
                  'animate-spin-slow': isAnimating,
                }"
              ></span>
            </div>

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
@keyframes spin-slow {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

.animate-spin-slow {
  animation: spin-slow 0.6s ease-in-out;
}

/* Custom scrollbar for better integration */
::-webkit-scrollbar {
  width: 8px;
}

::-webkit-scrollbar-track {
  background: transparent;
}

::-webkit-scrollbar-thumb {
  background: rgba(156, 163, 175, 0.3);
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: rgba(156, 163, 175, 0.5);
}

/* Enhanced focus styles */
button:focus-visible {
  outline: none;
}

/* Smooth transitions for all interactive elements */
* {
  transition-property:
    color, background-color, border-color, text-decoration-color, fill, stroke, opacity, box-shadow,
    transform, filter, backdrop-filter;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
}
</style>
