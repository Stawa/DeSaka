<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const countdown = ref(5)
const timer = ref<number | null>(null)

const goHome = () => {
  if (timer.value) {
    clearInterval(timer.value)
    timer.value = null
  }
  router.push('/')
}

onMounted(() => {
  timer.value = window.setInterval(() => {
    countdown.value--
    if (countdown.value <= 0) {
      if (timer.value) {
        clearInterval(timer.value)
        timer.value = null
      }
      router.push('/')
    }
  }, 1000)
})
</script>

<template>
  <div
    class="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4 py-12 sm:px-6 lg:px-8"
  >
    <div class="max-w-md w-full space-y-8 text-center">
      <div>
        <div class="flex justify-center">
          <div class="relative">
            <h1 class="text-9xl font-extrabold text-gray-200 dark:text-gray-800">404</h1>
          </div>
        </div>
        <h2 class="mt-6 text-3xl font-bold text-gray-800 dark:text-gray-200">Page Not Found</h2>
        <p class="mt-2 text-base text-gray-600 dark:text-gray-400">
          The page you're looking for doesn't exist or has been moved.
        </p>
      </div>
      <div class="mt-8 space-y-4">
        <button
          @click="goHome"
          class="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 dark:focus:ring-offset-gray-900 transition-colors"
        >
          <span class="mdi mdi-home mr-2"></span>
          Return to Home Page
        </button>
        <p class="text-sm text-gray-500 dark:text-gray-400">
          Redirecting to home page in {{ countdown }} seconds...
        </p>
      </div>
      <div class="mt-6">
        <div class="relative">
          <div class="absolute inset-0 flex items-center">
            <div class="w-full border-t border-gray-300 dark:border-gray-700"></div>
          </div>
          <div class="relative flex justify-center text-sm">
            <span class="px-2 bg-gray-50 dark:bg-gray-900 text-gray-500 dark:text-gray-400">
              DeSaka Environmental Monitoring
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
