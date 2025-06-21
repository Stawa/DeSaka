<script setup lang="ts">
import { RouterLink } from 'vue-router'
import { computed, ref } from 'vue'

const props = defineProps<{
  isOpen: boolean
  isDarkMode?: boolean
}>()

const emit = defineEmits(['close', 'toggle-dark-mode', 'toggle-collapse'])

const isCollapsed = ref(false)

const sidebarClass = computed(() => {
  return props.isOpen ? 'translate-x-0' : '-translate-x-full'
})

const sidebarWidthClass = computed(() => {
  return isCollapsed.value ? 'md:w-16' : 'md:w-64'
})

const toggleCollapse = () => {
  isCollapsed.value = !isCollapsed.value
  emit('toggle-collapse', isCollapsed.value)
}

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
    class="fixed inset-0 bg-black/60 backdrop-blur-sm z-20 md:hidden transition-all duration-300"
  ></div>

  <!-- Collapse Button (desktop only) -->
  <div class="hidden md:block fixed left-0 top-1/2 transform -translate-y-1/2 z-30">
    <button
      @click="toggleCollapse"
      class="flex items-center justify-center w-8 h-8 bg-white/90 dark:bg-gray-900/90 backdrop-blur-md border border-gray-200/50 dark:border-gray-700/50 rounded-r-lg shadow-lg hover:shadow-xl text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100 transition-all duration-300 hover:scale-105"
      :class="isCollapsed ? 'ml-16' : 'ml-64'"
      aria-label="Toggle sidebar"
    >
      <span
        class="mdi text-sm transition-transform duration-300"
        :class="isCollapsed ? 'mdi-chevron-right' : 'mdi-chevron-left'"
      ></span>
    </button>
  </div>

  <!-- Sidebar -->
  <aside
    class="fixed inset-y-0 left-0 z-20 bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border-r border-gray-200/50 dark:border-gray-700/50 transform transition-all duration-300 ease-out md:relative md:translate-x-0"
    :class="[sidebarClass, sidebarWidthClass]"
  >
    <div class="h-full flex flex-col">
      <!-- Header -->
      <div
        class="mt-2 flex items-center h-16 px-4 border-b border-gray-200/30 dark:border-gray-700/30"
      >
        <div class="flex items-center" :class="isCollapsed ? 'md:justify-center md:w-full' : ''">
          <div
            class="w-8 h-8 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg flex items-center justify-center shadow-lg"
          >
            <span class="mdi mdi-leaf text-white text-lg"></span>
          </div>

          <div
            class="ml-3 transition-all duration-300 overflow-hidden"
            :class="isCollapsed ? 'md:w-0 md:ml-0 md:opacity-0' : 'w-auto opacity-100'"
          >
            <h1 class="text-lg font-semibold text-gray-900 dark:text-white tracking-tight">
              Dashboard
            </h1>
            <p class="text-xs text-gray-500 dark:text-gray-400 -mt-0.5">
              Lorem ipsum dolor sit amet.
            </p>
          </div>
        </div>

        <!-- Mobile close button -->
        <button
          @click="$emit('close')"
          class="ml-auto p-1.5 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:bg-gray-800 transition-colors md:hidden"
        >
          <span class="mdi mdi-close text-xl"></span>
        </button>
      </div>

      <!-- Navigation -->
      <nav class="flex-1 py-6 px-3 space-y-1 overflow-y-auto">
        <RouterLink
          v-for="item in navItems"
          :key="item.name"
          :to="item.route"
          class="group flex items-center px-3 py-2.5 text-sm font-medium rounded-xl text-gray-700 hover:text-gray-900 hover:bg-gray-100/80 dark:text-gray-300 dark:hover:text-white dark:hover:bg-gray-800/80 transition-all duration-200 relative overflow-hidden"
          :class="isCollapsed ? 'md:justify-center' : ''"
          active-class="bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 text-emerald-700 dark:text-emerald-400 shadow-sm border border-emerald-200/50 dark:border-emerald-700/50"
          @click="!isCollapsed && $emit('close')"
          :title="isCollapsed ? item.name : ''"
        >
          <!-- Active indicator -->
          <div
            class="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-gradient-to-b from-emerald-500 to-teal-600 rounded-r-full opacity-0 router-link-active:opacity-100 transition-opacity duration-300"
          ></div>

          <span
            class="mdi flex-shrink-0 text-lg transition-all duration-200 group-hover:scale-110"
            :class="[`mdi-${item.icon}`, isCollapsed ? 'text-xl' : '']"
          ></span>

          <span
            class="ml-3 transition-all duration-300 truncate"
            :class="isCollapsed ? 'md:w-0 md:ml-0 md:opacity-0' : 'opacity-100'"
          >
            {{ item.name }}
          </span>

          <!-- Hover arrow -->
          <span
            class="ml-auto opacity-0 group-hover:opacity-100 transition-all duration-200 mdi mdi-arrow-right text-xs"
            :class="isCollapsed ? 'md:hidden' : ''"
          ></span>
        </RouterLink>
      </nav>

      <!-- Mobile theme toggle -->
      <div class="px-3 py-4 border-t border-gray-200/30 dark:border-gray-700/30 md:hidden">
        <button
          @click="$emit('toggle-dark-mode')"
          class="w-full flex items-center justify-center px-4 py-2.5 text-sm font-medium bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
        >
          <span
            class="mdi mr-2"
            :class="
              isDarkMode
                ? 'mdi-white-balance-sunny text-amber-500'
                : 'mdi-moon-waning-crescent text-indigo-500'
            "
          ></span>
          {{ isDarkMode ? 'Light Mode' : 'Dark Mode' }}
        </button>
      </div>

      <!-- Footer -->
      <div
        class="px-4 py-3 border-t border-gray-200/30 dark:border-gray-700/30 transition-all duration-300"
        :class="isCollapsed ? 'md:px-2' : ''"
      >
        <div
          class="flex items-center transition-all duration-300"
          :class="isCollapsed ? 'md:justify-center' : 'justify-between'"
        >
          <div
            class="transition-all duration-300 overflow-hidden"
            :class="isCollapsed ? 'md:w-0 md:opacity-0' : 'opacity-100'"
          >
            <p class="text-xs font-medium text-gray-600 dark:text-gray-400">v1.5.0</p>
            <p class="text-xs text-gray-500 dark:text-gray-500 -mt-0.5">© 2025 DeSaka</p>
          </div>

          <!-- Status indicator -->
          <div class="flex items-center" :class="isCollapsed ? 'md:justify-center' : ''">
            <div class="w-2 h-2 bg-emerald-500 rounded-full animate-pulse shadow-sm"></div>
            <span
              class="ml-2 text-xs text-gray-500 dark:text-gray-400 transition-all duration-300"
              :class="isCollapsed ? 'md:w-0 md:ml-0 md:opacity-0' : 'opacity-100'"
            >
              Online
            </span>
          </div>
        </div>
      </div>
    </div>
  </aside>
</template>

<style scoped>
/* Smooth scrollbar for navigation */
nav::-webkit-scrollbar {
  width: 4px;
}

nav::-webkit-scrollbar-track {
  @apply bg-transparent;
}

nav::-webkit-scrollbar-thumb {
  @apply bg-gray-300 dark:bg-gray-600 rounded-full;
}

nav::-webkit-scrollbar-thumb:hover {
  @apply bg-gray-400 dark:bg-gray-500;
}

/* Subtle animations */
.router-link-active {
  @apply transform;
  animation: subtle-bounce 0.3s ease-out;
}

@keyframes subtle-bounce {
  0% {
    transform: scale(0.95);
  }
  50% {
    transform: scale(1.02);
  }
  100% {
    transform: scale(1);
  }
}

/* Backdrop blur fallback */
@supports not (backdrop-filter: blur(12px)) {
  aside {
    @apply bg-white dark:bg-gray-900;
  }
}
</style>
