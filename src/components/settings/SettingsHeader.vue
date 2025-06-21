<template>
  <div
    class="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6 mb-8"
  >
    <div class="flex items-center gap-4">
      <div
        class="w-10 h-10 bg-amber-50 dark:bg-amber-900/20 rounded-lg flex items-center justify-center"
      >
        <span class="mdi mdi-cog text-amber-600 dark:text-amber-400 text-xl"></span>
      </div>
      <div>
        <h1 class="text-xl font-semibold text-gray-900 dark:text-white">System Settings</h1>
        <p class="text-sm text-gray-600 dark:text-gray-400 mt-1">
          Configure preferences and thresholds
        </p>
      </div>
    </div>
  </div>
</template>
<style scoped>
/* Main container with glass morphism */
.header-container {
  @apply mb-8 bg-white/80 dark:bg-gray-900/80 rounded-2xl shadow-sm overflow-hidden;
  @apply border border-gray-100 dark:border-gray-700;
  @apply backdrop-blur-md transition-all duration-500;
}

/* Animated accent bar */
.accent-bar {
  @apply h-1 w-full bg-gradient-to-r from-amber-400 via-orange-500 to-amber-600;
  background-size: 200% 100%;
}

@keyframes flow {
  0%,
  100% {
    background-position: 200% 0;
    opacity: 0.8;
  }
  50% {
    background-position: -200% 0;
    opacity: 1;
  }
}

/* Icon container with subtle animations */
.icon-container {
  @apply bg-amber-50/50 dark:bg-amber-900/20 py-3 px-4 rounded-2xl mr-5;
  @apply transition-all duration-300 ease-out;
  @apply border border-amber-100/30 dark:border-amber-800/30;
  @apply backdrop-blur-sm;
}

/* Icon rotation on hover */
.icon {
  @apply transition-transform duration-500 ease-out;
  transform-origin: center;
}

.group:hover .icon {
  @apply rotate-90;
}

/* Content section styling */
.content-section {
  @apply flex-grow min-w-0;
}

/* Header title with improved typography */
.header-title {
  @apply text-2xl md:text-3xl font-semibold text-gray-900 dark:text-gray-100;
  @apply tracking-tight leading-tight mb-2;
  @apply transition-colors duration-200;
}

/* Header description with better readability */
.header-description {
  @apply text-sm md:text-base text-gray-600 dark:text-gray-400;
  @apply leading-relaxed max-w-2xl;
  @apply transition-colors duration-200;
}

/* Action area for future buttons */
.action-area {
  @apply flex items-center gap-3 flex-shrink-0;
}

/* Responsive improvements */
@media (max-width: 768px) {
  .header-container {
    @apply mb-6;
  }

  .icon-container {
    @apply py-2 px-3 mr-4 rounded-xl;
  }

  .header-title {
    @apply text-xl mb-1;
  }

  .header-description {
    @apply text-sm;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
}

/* Dark mode enhancements */
@media (prefers-color-scheme: dark) {
  .accent-bar {
    opacity: 0.9;
  }

  .header-container {
    @apply bg-gray-900/90;
  }
}

/* Reduced motion preferences */
@media (prefers-reduced-motion: reduce) {
  .accent-bar {
    animation: none;
  }

  .icon-container,
  .icon {
    @apply transition-none;
  }

  .group:hover .icon-container {
    @apply scale-100 rotate-0;
  }

  .group:hover .icon {
    @apply rotate-0;
  }
}

/* Focus states for accessibility */
.header-container:focus-within {
  @apply ring-2 ring-amber-500/20 ring-offset-2 ring-offset-white dark:ring-offset-gray-900;
}

/* Subtle entrance animation */
.header-container {
  animation: slideInUp 0.6s ease-out;
}

@keyframes slideInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
