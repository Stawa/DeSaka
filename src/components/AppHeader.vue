<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

const emit = defineEmits(['toggle-sidebar', 'toggle-dark-mode'])

defineProps<{
  isDarkMode?: boolean
}>()

const isAnimating = ref(false)
const isScrolled = ref(false)

const toggleDarkMode = () => {
  isAnimating.value = true
  setTimeout(() => {
    isAnimating.value = false
  }, 600)
  emit('toggle-dark-mode')
}

const handleScroll = () => {
  isScrolled.value = window.scrollY > 10
}

onMounted(() => {
  window.addEventListener('scroll', handleScroll)
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
})
</script>

<template>
  <header
    class="relative z-50 sticky top-0 transition-all duration-300"
    :class="[
      isDarkMode
        ? 'bg-gray-800 border-b border-gray-700'
        : 'bg-primary-500 border-b border-primary-600',
      isScrolled ? 'shadow-lg' : 'shadow-md',
    ]"
  >
    <div class="container mx-auto px-6 py-3 relative z-10">
      <div class="flex items-center justify-between">
        <!-- Left section -->
        <div class="flex items-center">
          <!-- Mobile menu button -->
          <button
            @click="$emit('toggle-sidebar')"
            class="mr-4 p-2 rounded-lg transition-all duration-300 md:hidden focus:outline-none focus:ring-2 focus:ring-offset-2"
            :class="
              isDarkMode
                ? 'text-gray-300 hover:text-white hover:bg-gray-700 focus:ring-gray-400'
                : 'text-white hover:bg-primary-600 focus:ring-white/50'
            "
            aria-label="Toggle sidebar"
          >
            <span class="mdi mdi-menu text-2xl transition-transform duration-200"></span>
          </button>

          <!-- Logo section -->
          <div class="flex items-center cursor-pointer">
            <div
              class="relative p-2 rounded-lg mr-4 transition-all duration-300"
              :class="isDarkMode ? 'bg-gray-700' : 'bg-primary-600'"
            >
              <img src="/Logo.webp" alt="DeSaka Logo" class="h-8 w-8 relative z-10" />
            </div>
            <div>
              <h1 class="text-2xl font-bold tracking-tight text-white">DeSaka</h1>
            </div>
          </div>
        </div>

        <!-- Right section -->
        <div class="flex items-center space-x-4">
          <!-- Dark mode toggle -->
          <button
            @click="toggleDarkMode"
            class="relative py-2 px-3 rounded-lg transition-all duration-300 focus:outline-none focus:ring-2 hidden md:flex items-center"
            :class="
              isDarkMode
                ? 'bg-gray-700 text-yellow-300 focus:ring-yellow-300/50'
                : 'bg-primary-600 text-white focus:ring-white/50'
            "
            :title="isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'"
            aria-label="Toggle dark mode"
          >
            <!-- Icon container -->
            <span
              class="mdi text-xl"
              :class="{
                'mdi-weather-sunny': isDarkMode,
                'mdi-weather-night': !isDarkMode,
                'animate-spin-slow': isAnimating,
              }"
            ></span>

            <span class="ml-2 text-sm font-medium">{{
              isDarkMode ? 'Light Mode' : 'Dark Mode'
            }}</span>
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
    transform, filter;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
}

/* Header shadow effects */
header {
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  transition:
    box-shadow 0.3s ease,
    transform 0.3s ease;
}

.dark header {
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
}

header.shadow-lg {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.dark header.shadow-lg {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4);
}

/* Enhance the logo area */
header .logo-container {
  position: relative;
  overflow: hidden;
}

/* Improve button interactions */
button {
  transform: translateY(0);
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease;
}

button:active {
  transform: translateY(1px);
}
</style>
