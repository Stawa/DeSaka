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
    class="sticky top-0 z-50 backdrop-blur-xl border-b transition-all duration-300"
    :class="[
      isDarkMode ? 'bg-gray-950/90 border-gray-800/50' : 'bg-white/90 border-gray-200/50',
      isScrolled ? 'shadow-lg shadow-gray-900/5 dark:shadow-gray-950/20' : 'shadow-sm',
    ]"
  >
    <div class="container-lg">
      <div class="flex justify-between items-center h-16 lg:h-18">
        <!-- Left section -->
        <div class="flex items-center gap-4">
          <!-- Mobile menu button -->
          <button
            @click="$emit('toggle-sidebar')"
            class="lg:hidden btn btn-ghost btn-sm p-2"
            aria-label="Open main menu"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          <!-- Logo/Brand -->
          <div class="flex items-center gap-3">
            <div class="relative">
              <div class="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/25">
                <svg class="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2L13.09 8.26L22 9L13.09 9.74L12 16L10.91 9.74L2 9L10.91 8.26L12 2Z"/>
                </svg>
              </div>
              <div class="absolute -inset-1 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl blur opacity-30 animate-float"></div>
            </div>
            <div class="hidden sm:block">
              <h1 class="text-xl lg:text-2xl font-bold text-gradient">
                DeSaka
              </h1>
              <p class="text-xs text-gray-500 dark:text-gray-400 -mt-1">
                Environmental Monitor
              </p>
            </div>
          </div>
        </div>

        <!-- Right section -->
        <div class="flex items-center gap-2">
          <!-- Status indicator -->
          <div class="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800">
            <div class="status-dot status-online animate-pulse"></div>
            <span class="text-xs font-medium text-emerald-700 dark:text-emerald-300">Live</span>
          </div>

          <!-- Dark mode toggle -->
          <button
            @click="toggleDarkMode"
            class="btn btn-ghost btn-sm p-2.5 relative overflow-hidden group"
            :title="isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'"
            aria-label="Toggle dark mode"
          >
            <div class="absolute inset-0 bg-gradient-to-r from-amber-400 to-orange-500 opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
            <svg
              class="w-5 h-5 transition-all duration-300 relative z-10"
              :class="{
                'text-amber-500 rotate-180': isDarkMode,
                'text-gray-600 dark:text-gray-400': !isDarkMode,
                'animate-spin': isAnimating,
              }"
              fill="currentColor" 
              viewBox="0 0 24 24"
            >
              <path v-if="isDarkMode" d="M12 2.25a.75.75 0 01.75.75v2.25a.75.75 0 01-1.5 0V3a.75.75 0 01.75-.75zM7.5 12a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM18.894 6.166a.75.75 0 00-1.06-1.06l-1.591 1.59a.75.75 0 101.06 1.061l1.591-1.59zM21.75 12a.75.75 0 01-.75.75h-2.25a.75.75 0 010-1.5H21a.75.75 0 01.75.75zM17.834 18.894a.75.75 0 001.06-1.06l-1.59-1.591a.75.75 0 10-1.061 1.06l1.59 1.591zM12 18a.75.75 0 01.75.75V21a.75.75 0 01-1.5 0v-2.25A.75.75 0 0112 18zM7.758 17.303a.75.75 0 00-1.061-1.06l-1.591 1.59a.75.75 0 001.06 1.061l1.591-1.59zM6 12a.75.75 0 01-.75.75H3a.75.75 0 010-1.5h2.25A.75.75 0 016 12zM6.697 7.757a.75.75 0 001.06-1.06l-1.59-1.591a.75.75 0 00-1.061 1.06l1.59 1.591z"/>
              <path v-else d="M9.528 1.718a.75.75 0 01.162.819A8.97 8.97 0 009 6a9 9 0 009 9 8.97 8.97 0 003.463-.69.75.75 0 01.981.98 10.503 10.503 0 01-9.694 6.46c-5.799 0-10.5-4.701-10.5-10.5 0-4.368 2.667-8.112 6.46-9.694a.75.75 0 01.818.162z"/>
            </svg>
          </button>
        </div>
      </div>
    </div>
  </nav>
</template>

<style scoped>
@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.animate-spin {
  animation: spin 0.6s ease-in-out;
}
</style>