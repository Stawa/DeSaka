import { type App } from 'vue'
import router from '../router'

export const ErrorCodes = {
  NOT_FOUND: '404',
  SERVER_ERROR: '500',
  UNAUTHORIZED: '401',
  FORBIDDEN: '403',
  BAD_REQUEST: '400',
  SERVICE_UNAVAILABLE: '503',
}

export const ErrorMessages = {
  [ErrorCodes.NOT_FOUND]: 'Page Not Found',
  [ErrorCodes.SERVER_ERROR]: 'Internal Server Error',
  [ErrorCodes.UNAUTHORIZED]: 'Unauthorized Access',
  [ErrorCodes.FORBIDDEN]: 'Access Forbidden',
  [ErrorCodes.BAD_REQUEST]: 'Bad Request',
  [ErrorCodes.SERVICE_UNAVAILABLE]: 'Service Unavailable',
}

export const ErrorDescriptions = {
  [ErrorCodes.NOT_FOUND]: "The page you're looking for doesn't exist or has been moved.",
  [ErrorCodes.SERVER_ERROR]: "Something went wrong on our servers. We're working to fix the issue.",
  [ErrorCodes.UNAUTHORIZED]: 'You need to be logged in to access this page.',
  [ErrorCodes.FORBIDDEN]: "You don't have permission to access this resource.",
  [ErrorCodes.BAD_REQUEST]: 'The request could not be processed due to invalid parameters.',
  [ErrorCodes.SERVICE_UNAVAILABLE]:
    'The service is temporarily unavailable. Please try again later.',
}

export const navigateToErrorPage = (code: string, message?: string, description?: string) => {
  router.push({
    name: 'error',
    query: {
      code,
      message: message ?? ErrorMessages[code as keyof typeof ErrorMessages] ?? 'Error',
      description:
        description ??
        ErrorDescriptions[code as keyof typeof ErrorDescriptions] ??
        'An error occurred.',
    },
  })
}

export const setupGlobalErrorHandlers = (app: App) => {
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
 */
export const handleApiError = (error: Error & { response?: { status?: number; data?: { message?: string; description?: string } } }) => {
  console.error('API Error:', error)

  const statusCode = error?.response?.status?.toString() ?? ErrorCodes.SERVER_ERROR
  const errorMessage =
    error?.response?.data?.message ??
    error?.message ??
    ErrorMessages[statusCode as keyof typeof ErrorMessages]
  const errorDescription =
    error?.response?.data?.description ??
    ErrorDescriptions[statusCode as keyof typeof ErrorDescriptions]

  navigateToErrorPage(statusCode, errorMessage, errorDescription)
  
  return Promise.reject(error)
}
