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
  return isCollapsed.value ? 'lg:w-20' : 'lg:w-72'
})

const toggleCollapse = () => {
  isCollapsed.value = !isCollapsed.value
  emit('toggle-collapse', isCollapsed.value)
}

const navItems = [
  { name: 'Dashboard', icon: 'view-dashboard', route: '/', description: 'Overview & analytics' },
  { name: 'Soil Data', icon: 'sprout', route: '/soil', description: 'Soil monitoring' },
  { name: 'Air Quality', icon: 'weather-windy', route: '/air', description: 'Air monitoring' },
  { name: 'History', icon: 'chart-line', route: '/history', description: 'Historical data' },
  { name: 'Settings', icon: 'cog', route: '/settings', description: 'System settings' },
]
</script>

<template>
  <!-- Mobile backdrop -->
  <div
    v-if="isOpen"
    @click="$emit('close')"
    class="fixed inset-0 bg-gray-900/60 backdrop-blur-sm z-40 lg:hidden animate-fade-in"
  ></div>

  <!-- Collapse toggle (desktop) -->
  <div class="hidden lg:block fixed left-0 top-1/2 -translate-y-1/2 z-50">
    <button
      @click="toggleCollapse"
      class="flex items-center justify-center w-10 h-10 bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border border-gray-200/60 dark:border-gray-700/60 rounded-r-xl shadow-lg hover:shadow-xl text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100 transition-all duration-300 hover:scale-105 group"
      :class="isCollapsed ? 'ml-20' : 'ml-72'"
      aria-label="Toggle sidebar"
    >
      <svg
        class="w-4 h-4 transition-transform duration-300"
        :class="isCollapsed ? 'rotate-180' : ''"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
      </svg>
    </button>
  </div>

  <!-- Sidebar -->
  <aside
    class="fixed inset-y-0 left-0 z-40 backdrop-blur-xl border-r transition-all duration-300 ease-out lg:relative lg:translate-x-0"
    :class="[
      sidebarClass,
      sidebarWidthClass,
      isDarkMode ? 'bg-gray-950/95 border-gray-800/60' : 'bg-white/95 border-gray-200/60',
    ]"
  >
    <div class="h-full flex flex-col">
      <!-- Header -->
      <div
        class="flex items-center h-16 lg:h-18 px-6 border-b border-gray-200/30 dark:border-gray-800/30"
      >
        <div class="flex items-center" :class="isCollapsed ? 'lg:justify-center lg:w-full' : ''">
          <div class="relative">
            <div
              class="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/25"
            >
              <svg class="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2L13.09 8.26L22 9L13.09 9.74L12 16L10.91 9.74L2 9L10.91 8.26L12 2Z" />
              </svg>
            </div>
            <div
              class="absolute -inset-1 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl blur opacity-20 animate-float"
            ></div>
          </div>

          <div
            class="ml-4 transition-all duration-300 overflow-hidden"
            :class="isCollapsed ? 'lg:w-0 lg:ml-0 lg:opacity-0' : 'w-auto opacity-100'"
          >
            <h1 class="text-lg font-bold text-gray-900 dark:text-white">DeSaka</h1>
            <p class="text-xs text-gray-500 dark:text-gray-400 -mt-0.5">Environmental Monitor</p>
          </div>
        </div>

        <!-- Mobile close button -->
        <button @click="$emit('close')" class="ml-auto btn btn-ghost btn-sm p-2 lg:hidden">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>

      <!-- Navigation -->
      <nav class="flex-1 py-6 px-4 space-y-2 overflow-y-auto scrollbar-thin">
        <RouterLink
          v-for="item in navItems"
          :key="item.name"
          :to="item.route"
          class="group flex items-center px-4 py-3.5 text-sm font-medium rounded-xl transition-all duration-200 relative overflow-hidden"
          :class="[
            isCollapsed ? 'lg:justify-center lg:px-2' : '',
            'text-gray-700 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white',
            'hover:bg-gray-100/80 dark:hover:bg-gray-800/60',
          ]"
          active-class="bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 text-emerald-700 dark:text-emerald-300 shadow-sm border border-emerald-200/50 dark:border-emerald-700/50"
          @click="!isCollapsed && $emit('close')"
          :title="isCollapsed ? item.name : ''"
        >
          <!-- Active indicator -->
          <div
            class="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-gradient-to-b from-emerald-500 to-teal-600 rounded-r-full opacity-0 router-link-active:opacity-100 transition-opacity duration-300"
          ></div>

          <!-- Icon -->
          <div class="flex-shrink-0 relative">
            <span
              class="mdi text-xl transition-all duration-200 group-hover:scale-110"
              :class="[`mdi-${item.icon}`, isCollapsed ? 'lg:text-2xl' : '']"
            ></span>
          </div>

          <!-- Text content -->
          <div
            class="ml-4 transition-all duration-300 overflow-hidden"
            :class="isCollapsed ? 'lg:w-0 lg:ml-0 lg:opacity-0' : 'opacity-100'"
          >
            <div class="font-medium">{{ item.name }}</div>
            <div class="text-xs text-gray-500 dark:text-gray-400 -mt-0.5">
              {{ item.description }}
            </div>
          </div>

          <!-- Hover arrow -->
          <svg
            class="ml-auto w-4 h-4 opacity-0 group-hover:opacity-100 transition-all duration-200 translate-x-1 group-hover:translate-x-0"
            :class="isCollapsed ? 'lg:hidden' : ''"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M9 5l7 7-7 7"
            />
          </svg>
        </RouterLink>
      </nav>

      <!-- Mobile theme toggle -->
      <div class="px-4 py-4 border-t border-gray-200/30 dark:border-gray-800/30 lg:hidden">
        <button @click="$emit('toggle-dark-mode')" class="w-full btn btn-secondary justify-start">
          <svg
            class="w-5 h-5"
            :class="isDarkMode ? 'text-amber-500' : 'text-indigo-500'"
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              v-if="isDarkMode"
              d="M12 2.25a.75.75 0 01.75.75v2.25a.75.75 0 01-1.5 0V3a.75.75 0 01.75-.75zM7.5 12a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM18.894 6.166a.75.75 0 00-1.06-1.06l-1.591 1.59a.75.75 0 101.06 1.061l1.591-1.59zM21.75 12a.75.75 0 01-.75.75h-2.25a.75.75 0 010-1.5H21a.75.75 0 01.75.75zM17.834 18.894a.75.75 0 001.06-1.06l-1.59-1.591a.75.75 0 10-1.061 1.06l1.59 1.591zM12 18a.75.75 0 01.75.75V21a.75.75 0 01-1.5 0v-2.25A.75.75 0 0112 18zM7.758 17.303a.75.75 0 00-1.061-1.06l-1.591 1.59a.75.75 0 001.06 1.061l1.591-1.59zM6 12a.75.75 0 01-.75.75H3a.75.75 0 010-1.5h2.25A.75.75 0 016 12zM6.697 7.757a.75.75 0 001.06-1.06l-1.59-1.591a.75.75 0 00-1.061 1.06l1.59 1.591z"
            />
            <path
              v-else
              d="M9.528 1.718a.75.75 0 01.162.819A8.97 8.97 0 009 6a9 9 0 009 9 8.97 8.97 0 003.463-.69.75.75 0 01.981.98 10.503 10.503 0 01-9.694 6.46c-5.799 0-10.5-4.701-10.5-10.5 0-4.368 2.667-8.112 6.46-9.694a.75.75 0 01.818.162z"
            />
          </svg>
          <span class="ml-2">{{ isDarkMode ? 'Light Mode' : 'Dark Mode' }}</span>
        </button>
      </div>

      <!-- Footer -->
      <div
        class="px-4 py-4 border-t border-gray-200/30 dark:border-gray-800/30 transition-all duration-300"
        :class="isCollapsed ? 'lg:px-2' : ''"
      >
        <div
          class="flex items-center transition-all duration-300"
          :class="isCollapsed ? 'lg:justify-center' : 'justify-between'"
        >
          <div
            class="transition-all duration-300 overflow-hidden"
            :class="isCollapsed ? 'lg:w-0 lg:opacity-0' : 'opacity-100'"
          >
            <div class="flex items-center gap-2">
              <div class="w-2 h-2 bg-emerald-500 rounded-full"></div>
              <div>
                <p class="text-xs font-medium text-gray-800 dark:text-gray-200">System Online</p>
                <p class="text-xs text-gray-500 dark:text-gray-400">v2.1.0</p>
              </div>
            </div>
          </div>

          <!-- Collapsed state indicator -->
          <div class="flex items-center" :class="isCollapsed ? 'lg:justify-center' : ''">
            <div
              class="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center"
              :class="isCollapsed ? 'lg:w-6 lg:h-6' : ''"
            >
              <div class="w-2 h-2 bg-emerald-500 rounded-full"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </aside>
</template>

<style scoped>
.router-link-active {
  animation: subtle-bounce 0.3s ease-out;
}

@keyframes subtle-bounce {
  0% {
    transform: scale(0.98);
  }
  50% {
    transform: scale(1.02);
  }
  100% {
    transform: scale(1);
  }
}
</style>
