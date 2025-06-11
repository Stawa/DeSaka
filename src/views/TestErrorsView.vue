<script setup lang="ts">
import { useRouter } from 'vue-router'
import { navigateToErrorPage, ErrorCodes } from '../utils/errorHandler'

const router = useRouter()

const triggerJsError = () => {
  const obj = null
  // @ts-expect-error
  obj.nonExistentMethod()
}

const triggerComponentError = () => {
  throw new Error('This is a simulated component error')
}

const goTo404 = () => {
  router.push('/non-existent-page')
}

const goToErrorPage = (code: string) => {
  navigateToErrorPage(code, undefined, undefined)
}

const triggerAsyncError = async () => {
  try {
    await new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Async operation failed')), 500)
    })
  } catch (error) {
    if (error instanceof Error) {
      navigateToErrorPage('500', 'Async Error', error.message)
    } else {
      navigateToErrorPage('500', 'Async Error', 'Unknown error occurred')
    }
  }
}
</script>

<template>
  <div class="container mx-auto px-4 py-8">
    <h1 class="text-3xl font-bold mb-6 text-gray-800 dark:text-gray-200">Error Testing Page</h1>

    <div class="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-8">
      <h2 class="text-xl font-semibold mb-4 text-gray-700 dark:text-gray-300">
        Test Error Handling
      </h2>
      <p class="mb-4 text-gray-600 dark:text-gray-400">
        This page allows you to test the error handling functionality of the application. Click the
        buttons below to trigger different types of errors and see how they are handled.
      </p>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
        <button
          @click="triggerJsError"
          class="bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded transition-colors"
        >
          Trigger JavaScript Error
        </button>

        <button
          @click="triggerComponentError"
          class="bg-orange-600 hover:bg-orange-700 text-white font-medium py-2 px-4 rounded transition-colors"
        >
          Trigger Component Error
        </button>

        <button
          @click="goTo404"
          class="bg-yellow-600 hover:bg-yellow-700 text-white font-medium py-2 px-4 rounded transition-colors"
        >
          Go to Non-existent Page (404)
        </button>

        <button
          @click="triggerAsyncError"
          class="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded transition-colors"
        >
          Trigger Async Error
        </button>

        <button
          @click="goToErrorPage(ErrorCodes.UNAUTHORIZED)"
          class="bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded transition-colors"
        >
          Show 401 Unauthorized
        </button>

        <button
          @click="goToErrorPage(ErrorCodes.FORBIDDEN)"
          class="bg-purple-600 hover:bg-purple-700 text-white font-medium py-2 px-4 rounded transition-colors"
        >
          Show 403 Forbidden
        </button>
      </div>
    </div>

    <div class="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
      <h2 class="text-xl font-semibold mb-4 text-gray-700 dark:text-gray-300">
        Error Handling Information
      </h2>
      <p class="mb-2 text-gray-600 dark:text-gray-400">
        The application includes the following error handling features:
      </p>
      <ul class="list-disc pl-5 mb-4 text-gray-600 dark:text-gray-400">
        <li>Global error handler for uncaught exceptions</li>
        <li>Vue error boundary in the root component</li>
        <li>Router error handler for navigation errors</li>
        <li>Custom error pages for different error types</li>
        <li>Automatic redirection to home page after timeout</li>
      </ul>
    </div>
  </div>
</template>
