<script setup lang="ts">
import { RouterLink } from 'vue-router'
import { computed } from 'vue'

const props = defineProps<{
  isOpen: boolean
  isDarkMode?: boolean
}>()

defineEmits(['close', 'toggle-dark-mode'])

const sidebarClass = computed(() => {
  return props.isOpen ? 'translate-x-0' : '-translate-x-full'
})

const navItems = [
  { name: 'Dashboard', icon: 'view-dashboard', route: '/' },
  { name: 'Soil Data', icon: 'sprout', route: '/soil' },
  { name: 'Air Data', icon: 'weather-windy', route: '/air' },
  { name: 'History', icon: 'chart-line', route: '/history' },
  { name: 'Settings', icon: 'cog', route: '/settings' },
]
</script>

<template>
  <!-- Mobile sidebar backdrop -->
  <div
    v-if="isOpen"
    @click="$emit('close')"
    class="fixed inset-0 bg-black bg-opacity-50 z-20 md:hidden"
  ></div>

  <!-- Sidebar -->
  <aside
    class="w-[280px] max-w-full bg-white shadow-xl fixed inset-y-0 left-0 z-30 md:relative md:translate-x-0 transform transition-transform duration-300 ease-in-out dark:bg-gray-800 dark:text-white border-r border-gray-100 dark:border-gray-700"
    :class="sidebarClass"
  >
    <div class="h-full flex flex-col">
      <!-- Sidebar header with close button (mobile only) -->
      <div class="p-5 border-b flex justify-between items-center md:hidden dark:border-gray-700">
        <div class="flex items-center">
          <span class="mdi mdi-leaf text-primary-500 text-2xl mr-2 dark:text-primary-400"></span>
          <h2 class="font-bold text-lg text-primary-600 dark:text-primary-300">DeSaka</h2>
        </div>
        <button
          @click="$emit('close')"
          class="text-gray-500 hover:text-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-500 rounded-full p-1 dark:text-gray-300"
          aria-label="Close sidebar"
        >
          <span class="mdi mdi-close text-xl"></span>
        </button>
      </div>

      <!-- Navigation links -->
      <nav class="flex-1 overflow-y-auto py-4 sm:py-6">
        <h2
          class="px-4 sm:px-6 mb-3 sm:mb-4 text-xs font-semibold text-gray-500 uppercase tracking-wider dark:text-gray-400"
        >
          Navigation
        </h2>

        <ul class="space-y-1 sm:space-y-2">
          <li v-for="item in navItems" :key="item.name">
            <RouterLink
              :to="item.route"
              class="group flex items-center px-4 sm:px-6 py-2 sm:py-3 mx-1 sm:mx-2 rounded-lg text-gray-700 hover:bg-primary-50 hover:text-primary-600 transition-all duration-200 dark:text-gray-200 dark:hover:bg-gray-700 dark:hover:text-primary-300"
              active-class="bg-primary-100 text-primary-600 font-medium shadow-sm dark:bg-gray-700 dark:text-primary-300"
              @click="$emit('close')"
            >
              <span
                class="mdi text-lg sm:text-xl group-hover:scale-110 transition-transform duration-200"
                :class="`mdi-${item.icon}`"
              ></span>
              <span class="ml-2 sm:ml-3 text-sm sm:text-base font-medium">{{ item.name }}</span>
              <span
                class="ml-auto opacity-0 group-hover:opacity-100 transition-opacity duration-200 mdi mdi-chevron-right text-primary-400 dark:text-primary-300 hidden sm:inline"
              ></span>
            </RouterLink>
          </li>
        </ul>
      </nav>

      <!-- Action Buttons (visible on small screens below navigation) -->
      <div class="px-4 py-3 border-t border-gray-100 dark:border-gray-700 sm:hidden">
        <!-- Theme toggle button for mobile - only visible on small screens -->
        <button
          @click="$emit('toggle-dark-mode')"
          class="w-full btn btn-sm btn-secondary flex items-center justify-center"
          aria-label="Toggle dark mode"
        >
          <span
            class="mdi mr-1"
            :class="{
              'mdi-weather-sunny text-yellow-500': $props.isDarkMode,
              'mdi-weather-night text-blue-500': !$props.isDarkMode,
            }"
          ></span>
          <span>{{ $props.isDarkMode ? 'Light Mode' : 'Dark Mode' }}</span>
        </button>
      </div>

      <!-- Desktop Header (visible only on desktop) -->
      <div class="hidden md:flex items-center p-5 border-b dark:border-gray-700">
        <span class="mdi mdi-leaf text-primary-500 text-2xl mr-2 dark:text-primary-400"></span>
        <h2 class="font-bold text-lg text-primary-600 dark:text-primary-300">DeSaka</h2>
      </div>

      <!-- Footer -->
      <div class="p-5 border-t dark:border-gray-700">
        <div class="flex items-center justify-between mb-3">
          <span class="text-sm font-medium text-gray-700 dark:text-gray-300">DeSaka v1.0.0</span>
          <span
            class="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full dark:bg-green-900 dark:text-green-300"
            >Online</span
          >
        </div>
        <p class="text-xs text-gray-500 dark:text-gray-400">
          © 2025 - {{ new Date().getFullYear() }} All Rights Reserved
        </p>
      </div>
    </div>
  </aside>
</template>

<style scoped>
.btn {
  @apply rounded-lg font-medium transition-all duration-200 flex items-center justify-center;
}

.btn-sm {
  @apply text-xs py-2 px-3;
}

.btn-primary {
  @apply bg-primary-500 text-white hover:bg-primary-600 focus:ring-2 focus:ring-primary-500 focus:ring-opacity-50;
}

.btn-secondary {
  @apply bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600 focus:ring-2 focus:ring-gray-300 dark:focus:ring-gray-600 focus:ring-opacity-50;
}
</style>
