<template>
  <div
    class="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-2xl border border-gray-200/60 dark:border-gray-800/60 shadow-sm hover:shadow-xl hover:shadow-gray-900/5 dark:hover:shadow-gray-950/20 transition-all duration-300 hover:-translate-y-1 overflow-hidden"
  >
    <!-- Subtle accent bar -->
    <div class="h-1 bg-gradient-to-r from-indigo-500 to-purple-600"></div>

    <div class="p-6">
      <slot />
    </div>
  </div>
</template>

<style scoped>
/* Smooth entrance animation */
@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(20px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

div {
  animation: slideIn 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}
</style>
