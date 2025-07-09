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

const SENSOR_FILE_IDS: Record<string, string> = {
  air: '1WljLGjVfMa5DWtS33GYGmsTNjbBxl0K_',
  soil: '13mBooyMXhDiBHtqJcwy3dcz1RsL6iXYG',
}

/**
 * API configuration constants
 */
const API_CONFIG = {
  BASE_URL: 'https://desaka-api.vercel.app',
  TIMEOUT: 10000,
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000,
} as const

/**
 * Type definitions for API responses
 */
interface ApiResponse<T = Record<string, number | boolean>> {
  data?: T
  error?: string
  message?: string
  status?: number
}

interface SensorHistoryData {
  time: string
  value: number
}

export interface SensorFieldData {
  unit: string
  history: SensorHistoryData[]
}

export interface SensorApiResponse {
  [key: string]: SensorFieldData
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
    public response?: string | Record<string, number | boolean>,
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
  /** Reactive state for loading and error management */
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
  async function fetchWithCors<T = Record<string, string | number | boolean>>(
    url: string,
    options: RequestInit = {},
  ): Promise<T> {
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
   * Fetch list of available files from Google Drive
   *
   * @returns Promise resolving to array of file metadata
   */
  async function fetchFiles(): Promise<FileMetadata[]> {
    isLoading.value = true
    error.value = null

    try {
      const response = await fetchWithCors<{ files: FileMetadata[] }>(
        `${API_CONFIG.BASE_URL}/drive/files`,
      )
      return response.files
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
  async function fetchFileById<T = Record<string, string | number | boolean>>(
    fileId: string,
  ): Promise<T> {
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
    content: Record<string, string | number | boolean | SensorHistoryData[]>,
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

  /** Return the public API interface */
  return {
    /** Reactive state */
    isLoading,
    error,

    /** Core API methods */
    fetchFiles,
    fetchFileById,
    updateFileById,

    /** Utility methods */
    refreshData,
  }
}

/**
 * Export types for external use
 */
export type { ApiResponse, FileMetadata, SensorHistoryData }
export { ApiError, SENSOR_FILE_IDS }
