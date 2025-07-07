<script setup lang="ts">
import { ref } from 'vue'

/**
 * Footer component for the application
 * Displays branding, copyright information, and links
 */

/**
 * Current year for copyright notice
 * @constant {number}
 */
const currentYear = ref(new Date().getFullYear())
</script>

<template>
  <footer
    class="bg-gray-50 dark:bg-gray-950 backdrop-blur-xl border-t border-gray-200/60 dark:border-gray-800/60 py-8 w-full transition-all duration-300"
  >
    <div class="mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
      <div class="flex flex-col lg:flex-row justify-between gap-8">
        <!-- Left Side: Brand + Description -->
        <div class="flex flex-col gap-4 w-full lg:max-w-2xl">
          <!-- Brand -->
          <div class="flex items-center gap-4">
            <div class="relative w-10 h-10 shrink-0">
              <!-- Glow -->
              <div
                class="absolute inset-0 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl blur opacity-30 animate-float z-0"
              ></div>
              <!-- Icon -->
              <div
                class="relative z-10 w-full h-full bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/25"
              >
                <span class="mdi mdi-leaf text-white text-xl"></span>
              </div>
            </div>
            <!-- Text -->
            <div>
              <h3 class="text-xl font-bold text-gradient">DeSaka</h3>
              <p class="text-sm text-gray-600 dark:text-gray-400 -mt-1">Environmental Monitor</p>
            </div>
          </div>

          <!-- Description -->
          <p class="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
            Advanced environmental monitoring system for sustainable agriculture and air quality
            management. Built for educational purposes with real-time data visualization.
          </p>
        </div>

        <!-- Right Side: GitHub, Version, Copyright -->
        <div
          class="flex flex-col items-start lg:items-end gap-3 text-sm text-gray-500 dark:text-gray-400"
        >
          <!-- GitHub Link -->
          <a
            href="https://github.com/Stawa/DeSaka"
            target="_blank"
            rel="noopener"
            class="flex items-center gap-2 hover:text-emerald-500 transition-colors"
          >
            <span class="mdi mdi-github text-lg"></span>
            <span class="text-sm">GitHub</span>
          </a>

          <!-- Version + Copyright in one row -->
          <div class="flex flex-wrap items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
            <span class="font-medium">v2.1.0</span>
            <span>•</span>
            <span>&copy; {{ currentYear }} DeSaka</span>
          </div>
        </div>
      </div>

      <!-- Bottom Info Bar -->
      <div class="mt-8 pt-6 border-t border-gray-200/60 dark:border-gray-800/60">
        <div
          class="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-500 dark:text-gray-400 text-center sm:text-left"
        >
          <div class="flex flex-wrap items-center gap-4 justify-center sm:justify-start">
            <span>Real-time Monitoring</span>
            <span>•</span>
            <span>Data Analytics</span>
            <span>•</span>
            <span>Environmental Intelligence</span>
          </div>
          <div class="text-center sm:text-right">Powered by Vue.js & Tailwind CSS</div>
        </div>
      </div>
    </div>
  </footer>
</template>

<style scoped>
@keyframes float {
  0%,
  100% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-2px);
  }
}

.animate-float {
  animation: float 3s ease-in-out infinite;
}

.text-gradient {
  background: linear-gradient(135deg, #10b981, #059669);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

@keyframes pulse {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

.animate-pulse {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}
</style>
