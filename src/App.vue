<script setup lang="ts">
import { RouterView } from 'vue-router'
import AppHeader from './components/AppHeader.vue'
import AppSidebar from './components/AppSidebar.vue'
import Toast from './components/Toast.vue'
import { ref, watch, onMounted } from 'vue'
import { usePreferredDark } from '@vueuse/core'

const isSidebarOpen = ref(false)
const isSidebarCollapsed = ref(false)
const isDarkMode = ref(false)

const prefersDark = usePreferredDark()

onMounted(() => {
  // Load theme preference
  const savedTheme = localStorage.getItem('theme')
  if (savedTheme) {
    isDarkMode.value = savedTheme === 'dark'
  } else {
    isDarkMode.value = prefersDark.value
  }
  applyTheme()

  // Load sidebar collapse state
  const savedSidebarState = localStorage.getItem('sidebarCollapsed')
  if (savedSidebarState) {
    isSidebarCollapsed.value = savedSidebarState === 'true'
  }
})

const toggleSidebar = () => {
  isSidebarOpen.value = !isSidebarOpen.value
}

const toggleSidebarCollapse = (collapsed: boolean) => {
  isSidebarCollapsed.value = collapsed
  localStorage.setItem('sidebarCollapsed', collapsed.toString())
}

const toggleDarkMode = () => {
  isDarkMode.value = !isDarkMode.value
  localStorage.setItem('theme', isDarkMode.value ? 'dark' : 'light')
  applyTheme()
}

const applyTheme = () => {
  if (isDarkMode.value) {
    document.documentElement.classList.add('dark')
  } else {
    document.documentElement.classList.remove('dark')
  }
}

watch(prefersDark, (newValue) => {
  if (localStorage.getItem('theme') === null) {
    isDarkMode.value = newValue
    applyTheme()
  }
})
</script>

<template>
  <div class="min-h-screen w-full bg-gray-50 dark:bg-gray-900 flex flex-col">
    <AppHeader
      @toggle-sidebar="toggleSidebar"
      @toggle-dark-mode="toggleDarkMode"
      :is-dark-mode="isDarkMode"
    />

    <div class="flex flex-1 overflow-hidden">
      <AppSidebar
        :is-open="isSidebarOpen"
        :is-dark-mode="isDarkMode"
        @close="isSidebarOpen = false"
        @toggle-dark-mode="toggleDarkMode"
        @toggle-collapse="toggleSidebarCollapse"
      />

      <main
        class="flex-1 overflow-y-auto p-4 md:p-6 text-black dark:text-white transition-all duration-300"
        :class="{ 'md:ml-0': isSidebarCollapsed }"
      >
        <RouterView />
      </main>
    </div>

    <!-- Toast component for notifications -->
    <Toast />
  </div>
</template>

<style>
@import '@mdi/font/css/materialdesignicons.css';

html,
body {
  height: 100%;
  margin: 0;
  font-family: 'Inter', sans-serif;
}

#app {
  height: 100%;
  width: 100%;
  display: flex;
  flex-direction: column;
}
</style>
