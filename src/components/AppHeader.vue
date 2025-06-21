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
  <nav
    class="sticky top-0 z-40 backdrop-blur-xl border-b transition-all duration-300"
    :class="[
      isDarkMode ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200',
      isScrolled ? 'shadow-lg' : 'shadow-sm',
    ]"
  >
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex justify-between items-center h-16">
        <!-- Left section -->
        <div class="flex items-center space-x-4">
          <!-- Mobile menu button -->
          <button
            @click="$emit('toggle-sidebar')"
            class="md:hidden inline-flex items-center justify-center p-2 rounded-md transition-colors duration-200"
            :class="
              isDarkMode
                ? 'text-gray-400 hover:text-white hover:bg-gray-700'
                : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'
            "
            aria-label="Open main menu"
          >
            <span class="mdi mdi-menu text-xl"></span>
          </button>

          <!-- Logo/Brand -->
          <div class="flex items-center space-x-3">
            <div class="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center">
              <span class="mdi mdi-leaf text-white text-lg"></span>
            </div>
            <h1
              class="text-xl font-bold tracking-tight"
              :class="isDarkMode ? 'text-white' : 'text-gray-900'"
            >
              DeSaka
            </h1>
          </div>
        </div>

        <!-- Right section -->
        <div class="flex items-center space-x-2 sm:space-x-4">
          <!-- Dark mode toggle -->
          <button
            @click="toggleDarkMode"
            class="hidden sm:flex p-2 px-3 rounded-lg transition-colors duration-200"
            :class="
              isDarkMode
                ? 'text-gray-400 hover:text-white hover:bg-gray-700'
                : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'
            "
            :title="isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'"
            aria-label="Toggle dark mode"
          >
            <span
              class="mdi text-xl transition-transform duration-300"
              :class="{
                'mdi-white-balance-sunny text-yellow-500': isDarkMode,
                'mdi-moon-waning-crescent': !isDarkMode,
                'animate-spin': isAnimating,
              }"
            ></span>
          </button>
        </div>
      </div>
    </div>
  </nav>
</template>

<style scoped>
@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

.animate-spin {
  animation: spin 0.6s ease-in-out;
}

/* Focus styles for better accessibility */
button:focus-visible,
input:focus-visible {
  outline: 2px solid #10b981;
  outline-offset: 2px;
}

/* Smooth transitions */
* {
  transition-property: color, background-color, border-color, box-shadow;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 200ms;
}
</style>
