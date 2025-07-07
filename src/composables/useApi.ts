/**
 * API Composable
 *
 * A comprehensive composable for handling all API interactions with the DeSaka backend.
 * This composable provides a centralized interface for data fetching, error handling,
 * and loading state management across the application.
 *
 * Features:
 * - Centralized API configuration and base URL management
 * - Consistent error handling with proper error types
 * - Loading state management for UI feedback
 * - CORS-enabled requests with proper headers
 * - Type-safe interfaces for API responses
 * - Comprehensive logging for debugging
 *
 * @author DeSaka Development Team
 * @version 2.0.0
 */

import { ref, type Ref } from 'vue'

/**
 * API configuration constants
 */
const API_CONFIG = {
  BASE_URL: 'https://desaka-api.vercel.app',
  TIMEOUT: 10000, // 10 seconds
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000, // 1 second
} as const

/**
 * Type definitions for API responses
 */
interface ApiResponse<T = unknown> {
  data?: T
  error?: string
  message?: string
  status?: number
}

interface SensorHistoryData {
  time: string
  value: number
}

interface SensorApiResponse {
  unit?: string
  history?: SensorHistoryData[]
  [key: string]: unknown
}

interface FileMetadata {
  id: string
  name: string
  mimeType: string
  size: number
  modifiedTime: string
}

/**
 * Custom error class for API-related errors
 */
class ApiError extends Error {
  constructor(
    message: string,
    public status?: number,
    public response?: unknown,
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

/**
 * Main API composable function
 *
 * @returns Object containing API methods and reactive state
 */
export function useApi() {
  // Reactive state for loading and error management
  const isLoading: Ref<boolean> = ref(false)
  const error: Ref<Error | null> = ref(null)

  /**
   * Generic fetch function with enhanced error handling and CORS support
   *
   * @param url - The complete URL to fetch from
   * @param options - Fetch configuration options
   * @returns Promise resolving to parsed JSON response
   * @throws ApiError for HTTP errors or network issues
   */
  async function fetchWithCors<T = unknown>(url: string, options: RequestInit = {}): Promise<T> {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), API_CONFIG.TIMEOUT)

    try {
      const fetchOptions: RequestInit = {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          ...options.headers,
        },
        mode: 'cors',
        credentials: 'omit',
        signal: controller.signal,
      }

      console.log(`[API] Making ${options.method || 'GET'} request to: ${url}`)

      const response = await fetch(url, fetchOptions)

      clearTimeout(timeoutId)

      if (!response.ok) {
        const errorText = await response.text().catch(() => 'Unknown error')
        throw new ApiError(
          `API request failed: ${response.status} ${response.statusText}`,
          response.status,
          errorText,
        )
      }

      const data = await response.json()
      console.log(`[API] Successful response from: ${url}`, data)

      return data
    } catch (err) {
      clearTimeout(timeoutId)

      if (err instanceof ApiError) {
        throw err
      }

      if (err instanceof Error) {
        if (err.name === 'AbortError') {
          throw new ApiError('Request timeout', 408)
        }
        throw new ApiError(`Network error: ${err.message}`)
      }

      throw new ApiError('Unknown error occurred')
    }
  }

  /**
   * Fetch sensor data with mock fallback
   *
   * Note: The current API does not support the /sensors endpoint.
   * This method provides a mock implementation for development purposes.
   *
   * @param options - Filtering options for sensor data
   * @returns Promise resolving to sensor data object
   */
  async function fetchSensorData(
    options: {
      startDate?: string
      endDate?: string
      sensors?: string[]
    } = {},
  ): Promise<Record<string, SensorApiResponse>> {
    isLoading.value = true
    error.value = null

    try {
      console.warn(
        '[API] The /sensors endpoint is not supported by the current API implementation.',
        'Returning mock data for development purposes.',
        'Use fetchFileById() for actual data retrieval.',
      )

      // Generate mock response structure
      const mockResponse: Record<string, SensorApiResponse> = {}

      if (options.sensors && options.sensors.length > 0) {
        options.sensors.forEach((sensorId) => {
          mockResponse[sensorId] = {
            unit: getSensorUnit(sensorId),
            history: generateMockHistory(),
            status: 'unknown',
          }
        })
      }

      return mockResponse
    } catch (err) {
      const apiError = err instanceof ApiError ? err : new ApiError(String(err))
      error.value = apiError
      console.error('[API] Error fetching sensor data:', apiError)
      throw apiError
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Fetch list of available files from Google Drive
   *
   * @returns Promise resolving to array of file metadata
   */
  async function fetchFiles(): Promise<FileMetadata[]> {
    isLoading.value = true
    error.value = null

    try {
      const response = await fetchWithCors<FileMetadata[]>(`${API_CONFIG.BASE_URL}/drive/files`)
      return response
    } catch (err) {
      const apiError = err instanceof ApiError ? err : new ApiError(String(err))
      error.value = apiError
      console.error('[API] Error fetching files:', apiError)
      throw apiError
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Fetch file content by ID from Google Drive
   *
   * @param fileId - The unique identifier of the file to retrieve
   * @returns Promise resolving to parsed file content
   */
  async function fetchFileById<T = unknown>(fileId: string): Promise<T> {
    if (!fileId || typeof fileId !== 'string') {
      throw new ApiError('Invalid file ID provided')
    }

    isLoading.value = true
    error.value = null

    try {
      const response = await fetchWithCors<T>(`${API_CONFIG.BASE_URL}/drive/file/${fileId}`)
      return response
    } catch (err) {
      const apiError = err instanceof ApiError ? err : new ApiError(String(err))
      error.value = apiError
      console.error(`[API] Error fetching file ${fileId}:`, apiError)
      throw apiError
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Update or overwrite file content by ID
   *
   * @param fileId - The unique identifier of the file to update
   * @param content - The new content to write to the file
   * @param append - Whether to append to existing content or replace it
   * @returns Promise resolving to API response
   */
  async function updateFileById(
    fileId: string,
    content: unknown,
    append = false,
  ): Promise<ApiResponse> {
    if (!fileId || typeof fileId !== 'string') {
      throw new ApiError('Invalid file ID provided')
    }

    isLoading.value = true
    error.value = null

    try {
      const url = append
        ? `${API_CONFIG.BASE_URL}/drive/file/${fileId}`
        : `${API_CONFIG.BASE_URL}/drive/file/${fileId}/overwrite`

      const method = append ? 'POST' : 'PUT'

      const response = await fetchWithCors<ApiResponse>(url, {
        method,
        body: JSON.stringify(content),
      })

      return response
    } catch (err) {
      const apiError = err instanceof ApiError ? err : new ApiError(String(err))
      error.value = apiError
      console.error(
        `[API] Error ${append ? 'appending to' : 'replacing'} file ${fileId}:`,
        apiError,
      )
      throw apiError
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Append sensor data to a file
   *
   * @param fileId - The unique identifier of the file to update
   * @param sensorData - Object containing sensor data to append
   * @returns Promise resolving to API response
   */
  async function appendSensorData(
    fileId: string,
    sensorData: Record<string, { time: string; value: number }>,
  ): Promise<ApiResponse> {
    return updateFileById(fileId, sensorData, true)
  }

  /**
   * Send WhatsApp message via API
   *
   * @param payload - Object containing phone number and message
   * @returns Promise resolving to API response
   */
  async function sendWhatsAppMessage({
    phoneNumber,
    message,
  }: {
    phoneNumber: string
    message: string
  }): Promise<ApiResponse> {
    if (!phoneNumber || !message) {
      throw new ApiError('Phone number and message are required')
    }

    isLoading.value = true
    error.value = null

    try {
      const response = await fetchWithCors<ApiResponse>(`${API_CONFIG.BASE_URL}/whatsapp/send`, {
        method: 'POST',
        body: JSON.stringify({ phoneNumber, message }),
      })

      return response
    } catch (err) {
      const apiError = err instanceof ApiError ? err : new ApiError(String(err))
      error.value = apiError
      console.error('[API] Error sending WhatsApp message:', apiError)
      throw apiError
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Send email via Gmail API
   *
   * @param payload - Object containing email details
   * @returns Promise resolving to API response
   */
  async function sendGmailMessage({
    to,
    subject,
    text,
  }: {
    to: string
    subject: string
    text: string
  }): Promise<ApiResponse> {
    if (!to || !subject || !text) {
      throw new ApiError('Email recipient, subject, and text are required')
    }

    isLoading.value = true
    error.value = null

    try {
      const response = await fetchWithCors<ApiResponse>(`${API_CONFIG.BASE_URL}/gmail/send`, {
        method: 'POST',
        body: JSON.stringify({ to, subject, text }),
      })

      return response
    } catch (err) {
      const apiError = err instanceof ApiError ? err : new ApiError(String(err))
      error.value = apiError
      console.error('[API] Error sending Gmail message:', apiError)
      throw apiError
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Generic data refresh utility
   *
   * @param callback - Function to handle the fetched data
   * @param fetchFunction - Function to fetch the data
   * @param params - Parameters to pass to the fetch function
   * @returns Promise resolving to the fetched data
   */
  async function refreshData<T, P>(
    callback: (data: T) => void,
    fetchFunction: (params: P) => Promise<T>,
    params: P,
  ): Promise<T> {
    isLoading.value = true
    error.value = null

    try {
      const data = await fetchFunction(params)
      callback(data)
      return data
    } catch (err) {
      const apiError = err instanceof ApiError ? err : new ApiError(String(err))
      error.value = apiError
      console.error('[API] Error refreshing data:', apiError)
      throw apiError
    } finally {
      isLoading.value = false
    }
  }

  // Helper functions for mock data generation

  /**
   * Get default unit for a sensor type
   *
   * @param sensorId - The sensor identifier
   * @returns The appropriate unit string
   */
  function getSensorUnit(sensorId: string): string {
    const unitMap: Record<string, string> = {
      soilTemperature: '°C',
      soilMoisture: '%',
      soilPH: 'pH',
      airTemperature: '°C',
      airHumidity: '%',
      lightIntensity: 'lux',
    }

    return unitMap[sensorId] || ''
  }

  /**
   * Generate mock sensor history data
   *
   * @returns Array of mock sensor readings
   */
  function generateMockHistory(): SensorHistoryData[] {
    const history: SensorHistoryData[] = []
    const now = new Date()

    for (let i = 23; i >= 0; i--) {
      const time = new Date(now.getTime() - i * 60 * 60 * 1000)
      history.push({
        time: time.toISOString(),
        value: Math.random() * 100,
      })
    }

    return history
  }

  // Return the public API interface
  return {
    // Reactive state
    isLoading,
    error,

    // Core API methods
    fetchSensorData,
    fetchFiles,
    fetchFileById,
    updateFileById,
    appendSensorData,

    // Communication methods
    sendWhatsAppMessage,
    sendGmailMessage,

    // Utility methods
    refreshData,

    // Configuration
    API_CONFIG,
  }
}

/**
 * Export types for external use
 */
export type { ApiResponse, SensorApiResponse, FileMetadata, SensorHistoryData }
export { ApiError }
