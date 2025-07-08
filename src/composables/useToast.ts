/**
 * Toast Notification Composable
 *
 * A reactive composable for managing toast notifications throughout the application.
 * Provides a simple interface for displaying temporary messages with different types
 * and automatic dismissal functionality.
 *
 * Features:
 * - Multiple toast types (success, error, warning, info)
 * - Automatic dismissal with configurable timeout
 * - Manual dismissal capability
 * - Queue management for multiple toasts
 * - Accessibility support with ARIA attributes
 *
 * @author DeSaka Development Team
 * @version 2.0.0
 */

import { ref, type Ref } from 'vue'

/**
 * Toast type definitions
 */
export type ToastType = 'success' | 'error' | 'warning' | 'info'

/**
 * Toast configuration interface
 */
interface ToastConfig {
  /** Whether the toast is currently visible */
  show: boolean
  /** The message content to display */
  message: string
  /** The type of toast (affects styling and icon) */
  type: ToastType
  /** Auto-dismiss timeout in milliseconds */
  timeout: number
  /** Unique identifier for the toast */
  id?: string
  /** Whether the toast can be manually dismissed */
  dismissible?: boolean
}

/**
 * Toast type styling configuration interface
 */
interface ToastTypeConfig {
  icon: string
  bgColor: string
  borderColor: string
  textColor: string
  iconColor: string
}

/**
 * Default toast configuration
 */
const DEFAULT_TOAST_CONFIG: ToastConfig = {
  show: false,
  message: '',
  type: 'success',
  timeout: 3000,
  dismissible: true,
}

/**
 * Toast type configuration for styling and icons
 */
const TOAST_TYPE_CONFIG: Record<ToastType, ToastTypeConfig> = {
  success: {
    icon: 'mdi-check-circle',
    bgColor: 'bg-emerald-50 dark:bg-emerald-900/20',
    borderColor: 'border-emerald-200 dark:border-emerald-800',
    textColor: 'text-emerald-800 dark:text-emerald-200',
    iconColor: 'text-emerald-500',
  },
  error: {
    icon: 'mdi-alert-circle',
    bgColor: 'bg-red-50 dark:bg-red-900/20',
    borderColor: 'border-red-200 dark:border-red-800',
    textColor: 'text-red-800 dark:text-red-200',
    iconColor: 'text-red-500',
  },
  warning: {
    icon: 'mdi-alert',
    bgColor: 'bg-amber-50 dark:bg-amber-900/20',
    borderColor: 'border-amber-200 dark:border-amber-800',
    textColor: 'text-amber-800 dark:text-amber-200',
    iconColor: 'text-amber-500',
  },
  info: {
    icon: 'mdi-information',
    bgColor: 'bg-blue-50 dark:bg-blue-900/20',
    borderColor: 'border-blue-200 dark:border-blue-800',
    textColor: 'text-blue-800 dark:text-blue-200',
    iconColor: 'text-blue-500',
  },
} as const

/**
 * Main toast composable function
 *
 * @returns Object containing toast state and methods
 */
export function useToast() {
  /** Reactive toast state */
  const toast: Ref<ToastConfig> = ref({ ...DEFAULT_TOAST_CONFIG })

  /** Toast queue for managing multiple toasts */
  const toastQueue: Ref<ToastConfig[]> = ref([])

  /** Active timeout reference for cleanup */
  let activeTimeout: NodeJS.Timeout | null = null

  /**
   * Display a toast notification
   *
   * @param message - The message to display
   * @param type - The type of toast (success, error, warning, info)
   * @param timeout - Auto-dismiss timeout in milliseconds (0 = no auto-dismiss)
   * @param options - Additional configuration options
   */
  const showToast = (
    message: string,
    type: ToastType = 'success',
    timeout = 3000,
    options: Partial<ToastConfig> = {},
  ): void => {
    /** Validate input parameters */
    if (!message || typeof message !== 'string') {
      console.warn('[Toast] Invalid message provided:', message)
      return
    }

    if (!isValidToastType(type)) {
      console.warn('[Toast] Invalid toast type provided:', type)
      type = 'info'
    }

    /** Clear any existing timeout */
    if (activeTimeout) {
      clearTimeout(activeTimeout)
      activeTimeout = null
    }

    /** Generate unique ID for the toast */
    const toastId = generateToastId()

    /** Create new toast configuration */
    const newToast: ToastConfig = {
      show: true,
      message,
      type,
      timeout,
      id: toastId,
      dismissible: true,
      ...options,
    }

    /** Update reactive toast state */
    toast.value = newToast

    /** Add to queue for potential future use */
    toastQueue.value.push(newToast)

    /** Set up auto-dismiss if timeout is specified */
    if (timeout > 0) {
      activeTimeout = setTimeout(() => {
        hideToast()
      }, timeout)
    }

    /** Log toast display for debugging */
    console.log(`[Toast] Displaying ${type} toast:`, message)
  }

  /**
   * Hide the current toast notification
   */
  const hideToast = (): void => {
    toast.value.show = false

    /** Clear timeout if active */
    if (activeTimeout) {
      clearTimeout(activeTimeout)
      activeTimeout = null
    }

    /** Remove from queue after animation completes */
    setTimeout(() => {
      toast.value = { ...DEFAULT_TOAST_CONFIG }
      toastQueue.value = toastQueue.value.filter((t) => t.id !== toast.value.id)
    }, 300)
  }

  /**
   * Show success toast with predefined styling
   *
   * @param message - Success message to display
   * @param timeout - Auto-dismiss timeout (default: 3000ms)
   */
  const showSuccess = (message: string, timeout = 3000): void => {
    showToast(message, 'success', timeout)
  }

  /**
   * Show error toast with predefined styling
   *
   * @param message - Error message to display
   * @param timeout - Auto-dismiss timeout (default: 5000ms for errors)
   */
  const showError = (message: string, timeout = 5000): void => {
    showToast(message, 'error', timeout)
  }

  /**
   * Show warning toast with predefined styling
   *
   * @param message - Warning message to display
   * @param timeout - Auto-dismiss timeout (default: 4000ms)
   */
  const showWarning = (message: string, timeout = 4000): void => {
    showToast(message, 'warning', timeout)
  }

  /**
   * Show info toast with predefined styling
   *
   * @param message - Info message to display
   * @param timeout - Auto-dismiss timeout (default: 3000ms)
   */
  const showInfo = (message: string, timeout = 3000): void => {
    showToast(message, 'info', timeout)
  }

  /**
   * Clear all toasts and reset state
   */
  const clearAllToasts = (): void => {
    if (activeTimeout) {
      clearTimeout(activeTimeout)
      activeTimeout = null
    }

    toast.value = { ...DEFAULT_TOAST_CONFIG }
    toastQueue.value = []
  }

  /**
   * Get styling configuration for a toast type
   *
   * @param type - The toast type
   * @returns Styling configuration object
   */
  const getToastTypeConfig = (type: ToastType): ToastTypeConfig => {
    return TOAST_TYPE_CONFIG[type] || TOAST_TYPE_CONFIG.info
  }

  /**
   * Validate if a string is a valid toast type
   *
   * @param type - The type to validate
   * @returns Boolean indicating if the type is valid
   */
  function isValidToastType(type: string): type is ToastType {
    return ['success', 'error', 'warning', 'info'].includes(type)
  }

  /**
   * Generate a unique ID for toast identification
   *
   * @returns Unique string identifier
   */
  function generateToastId(): string {
    return `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  }

  /** Return the public API */
  return {
    /** Reactive state */
    toast,
    toastQueue,

    /** Core methods */
    showToast,
    hideToast,
    clearAllToasts,

    /** Convenience methods */
    showSuccess,
    showError,
    showWarning,
    showInfo,

    /** Utility methods */
    getToastTypeConfig,

    /** Configuration */
    TOAST_TYPE_CONFIG,
  }
}

/**
 * Export types for external use
 */
export type { ToastConfig, ToastTypeConfig }
