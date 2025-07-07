import type { App } from 'vue'
import router from '../router'

/**
 * Error code constants
 */
export const ErrorCodes = {
  NOT_FOUND: '404',
  SERVER_ERROR: '500',
  UNAUTHORIZED: '401',
  FORBIDDEN: '403',
  BAD_REQUEST: '400',
  SERVICE_UNAVAILABLE: '503',
} as const

/**
 * Error code type
 */
export type ErrorCode = (typeof ErrorCodes)[keyof typeof ErrorCodes]

/**
 * Error messages mapping
 */
export const ErrorMessages: Record<ErrorCode, string> = {
  [ErrorCodes.NOT_FOUND]: 'Page Not Found',
  [ErrorCodes.SERVER_ERROR]: 'Internal Server Error',
  [ErrorCodes.UNAUTHORIZED]: 'Unauthorized Access',
  [ErrorCodes.FORBIDDEN]: 'Access Forbidden',
  [ErrorCodes.BAD_REQUEST]: 'Bad Request',
  [ErrorCodes.SERVICE_UNAVAILABLE]: 'Service Unavailable',
}

/**
 * Error descriptions mapping
 */
export const ErrorDescriptions: Record<ErrorCode, string> = {
  [ErrorCodes.NOT_FOUND]: "The page you're looking for doesn't exist or has been moved.",
  [ErrorCodes.SERVER_ERROR]: "Something went wrong on our servers. We're working to fix the issue.",
  [ErrorCodes.UNAUTHORIZED]: 'You need to be logged in to access this page.',
  [ErrorCodes.FORBIDDEN]: "You don't have permission to access this resource.",
  [ErrorCodes.BAD_REQUEST]: 'The request could not be processed due to invalid parameters.',
  [ErrorCodes.SERVICE_UNAVAILABLE]:
    'The service is temporarily unavailable. Please try again later.',
}

/**
 * API error response interface
 * Represents the structure of error responses from API calls
 */
interface ApiErrorResponse {
  /** HTTP status code of the response */
  status?: number
  /** Response data containing error details */
  data?: {
    /** Error message from the API */
    message?: string
    /** Detailed error description */
    description?: string
  }
}

/**
 * Enhanced error interface
 * Extends the standard Error with additional API response information
 */
interface EnhancedError extends Error {
  /** API response data attached to the error */
  response?: ApiErrorResponse
  /** Additional properties that might be present */
  [key: string]: unknown
}

/**
 * Navigate to error page with specified parameters
 * @param code Error code
 * @param message Optional custom error message
 * @param description Optional custom error description
 */
export const navigateToErrorPage = (code: string, message?: string, description?: string): void => {
  router.push({
    name: 'error',
    query: {
      code,
      message: message ?? ErrorMessages[code as ErrorCode] ?? 'Error',
      description: description ?? ErrorDescriptions[code as ErrorCode] ?? 'An error occurred.',
    },
  })
}

/**
 * Setup global error handlers for the Vue application
 * @param app Vue application instance
 */
export const setupGlobalErrorHandlers = (app: App): void => {
  app.config.errorHandler = (error, instance, info) => {
    console.error('Vue Error:', error)
    console.error('Error Info:', info)
    navigateToErrorPage(ErrorCodes.SERVER_ERROR)
  }

  window.addEventListener('unhandledrejection', (event) => {
    console.error('Unhandled Promise Rejection:', event.reason)
    navigateToErrorPage(
      ErrorCodes.SERVER_ERROR,
      'Promise Error',
      'An unhandled promise rejection occurred.',
    )
  })

  window.addEventListener('error', (event) => {
    console.error('JavaScript Error:', event.error)
    navigateToErrorPage(ErrorCodes.SERVER_ERROR, 'JavaScript Error', event.message)
  })
}

/**
 * Handle API errors and navigate to appropriate error page
 * @param error The error object to handle
 * @returns Promise that rejects with the original error
 */
export const handleApiError = (error: EnhancedError): Promise<Error> => {
  console.error('API Error:', error)

  const statusCode = error?.response?.status?.toString() ?? ErrorCodes.SERVER_ERROR
  const errorMessage =
    error?.response?.data?.message ?? error?.message ?? ErrorMessages[statusCode as ErrorCode]
  const errorDescription =
    error?.response?.data?.description ?? ErrorDescriptions[statusCode as ErrorCode]

  navigateToErrorPage(statusCode, errorMessage, errorDescription)

  return Promise.reject(error)
}
