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
  return isCollapsed.value ? 'md:w-[70px]' : 'md:w-[280px]'
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
    class="fixed inset-0 bg-black bg-opacity-50 z-20 md:hidden"
  ></div>

  <!-- Collapse Button (desktop only) -->
  <div class="hidden md:block fixed left-0 top-1/2 transform -translate-y-1/2 z-20">
    <button
      @click="toggleCollapse"
      class="text-gray-500 hover:text-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-500 rounded-r-lg p-2 dark:text-gray-300 transition-all duration-300 bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 shadow-md"
      :class="{
        'ml-[70px]': isCollapsed,
        'ml-[280px]': !isCollapsed,
      }"
      aria-label="Toggle sidebar collapse"
    >
      <span
        class="mdi mdi-chevron-left text-xl transition-transform duration-300"
        :class="{ 'mdi-chevron-right': isCollapsed }"
      ></span>
    </button>
  </div>

  <!-- Sidebar -->
  <aside
    class="max-w-full bg-white shadow-xl fixed inset-y-0 left-0 z-30 md:relative md:translate-x-0 transform transition-all duration-300 ease-in-out dark:bg-gray-800 dark:text-white border-r border-gray-100 dark:border-gray-700 overflow-x-hidden"
    :class="[sidebarClass, sidebarWidthClass]"
  >
    <div class="h-full flex flex-col">
      <!-- Desktop Header (visible only on desktop) -->
      <div class="hidden md:flex items-center p-5 border-b dark:border-gray-700 overflow-hidden">
        <div
          class="flex items-center min-w-0 w-full transition-all duration-300"
          :class="isCollapsed ? 'justify-center' : 'justify-start'"
        >
          <span
            class="mdi mdi-leaf text-primary-500 text-2xl flex-shrink-0 transition-all duration-300 dark:text-primary-400"
            :class="{ 'text-3xl': isCollapsed }"
          ></span>

          <h2
            class="font-bold text-lg text-primary-600 dark:text-primary-300 transition-all duration-300 overflow-hidden"
            :class="{
              'w-0 ml-0 opacity-0': isCollapsed,
              'w-auto ml-2 opacity-100': !isCollapsed,
            }"
          >
            DeSaka
          </h2>
        </div>
      </div>

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
      <nav class="flex-1 overflow-y-auto overflow-x-hidden py-4 sm:py-6">
        <h2
          class="px-4 sm:px-6 mb-3 sm:mb-4 text-xs font-semibold text-gray-500 uppercase tracking-wider dark:text-gray-400 transition-all duration-300"
          :class="{ 'md:opacity-0 md:h-0 md:mb-0': isCollapsed, 'md:opacity-100': !isCollapsed }"
        >
          Navigation
        </h2>

        <ul class="space-y-1 sm:space-y-2 w-full">
          <li v-for="item in navItems" :key="item.name" class="w-full">
            <RouterLink
              :to="item.route"
              class="group flex items-center py-2 sm:py-3 mx-1 sm:mx-2 rounded-lg text-gray-700 hover:bg-primary-50 hover:text-primary-600 transition-all duration-200 dark:text-gray-200 dark:hover:bg-gray-700 dark:hover:text-primary-300 w-auto z-40"
              :class="
                isCollapsed ? 'md:justify-center md:items-center md:px-0 px-2' : 'px-4 sm:px-6'
              "
              active-class="bg-primary-100 text-primary-600 font-medium shadow-sm dark:bg-gray-700 dark:text-primary-300"
              @click="
                ($event: MouseEvent) => {
                  const target = $event.currentTarget as HTMLElement
                  if (!target.closest('.md\\:block')) {
                    $emit('close')
                  }
                }
              "
              :title="isCollapsed ? item.name : ''"
            >
              <div class="flex items-center justify-center" :class="isCollapsed ? 'w-full' : ''">
                <span
                  class="mdi text-lg sm:text-xl group-hover:scale-110 transition-transform duration-200 flex-shrink-0"
                  :class="[`mdi-${item.icon}`, isCollapsed && 'md:text-2xl']"
                ></span>
              </div>
              <span
                class="ml-2 sm:ml-3 text-sm sm:text-base font-medium transition-all duration-300 whitespace-nowrap overflow-hidden flex-grow"
                :class="{
                  'md:w-0 md:ml-0 md:opacity-0': isCollapsed,
                  'md:w-auto md:opacity-100': !isCollapsed,
                }"
                >{{ item.name }}</span
              >
              <span
                class="ml-auto opacity-0 group-hover:opacity-100 transition-opacity duration-200 mdi mdi-chevron-right text-primary-400 dark:text-primary-300 hidden sm:inline flex-shrink-0"
                :class="{ 'md:hidden': isCollapsed }"
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

      <!-- Footer -->
      <div class="p-5 border-t dark:border-gray-700 overflow-hidden">
        <div class="flex items-center justify-between mb-3">
          <span
            class="text-sm font-medium text-gray-700 dark:text-gray-300 transition-opacity duration-300 whitespace-nowrap overflow-hidden"
            :class="{ 'md:opacity-0 md:w-0': isCollapsed, 'md:opacity-100': !isCollapsed }"
            >DeSaka v1.2.5</span
          >
        </div>
        <p
          class="text-xs text-gray-500 dark:text-gray-400 transition-opacity duration-300"
          :class="{ 'md:opacity-0': isCollapsed, 'md:opacity-100': !isCollapsed }"
        >
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
