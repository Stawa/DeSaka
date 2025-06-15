import { ref } from 'vue'

const API_BASE_URL = 'https://desaka-api.vercel.app'

interface SOIL {
  temperature: {
    unit: string
    history: [{ time: string; value: number }]
  }
  moisture: {
    unit: string
    history: [{ time: string; value: number }]
  }
}

interface AIR {
  temperature: {
    unit: string
    history: [{ time: string; value: number }]
  }
  humidity: {
    unit: string
    history: [{ time: string; value: number }]
  }
}

/**
 * Composable for interacting with the backend API
 */
export function useApi() {
  const isLoading = ref(false)
  const error = ref<Error | null>(null)

  /**
   * Common fetch function with CORS handling
   * @param url - The URL to fetch
   * @param options - Fetch options
   * @returns Promise with response data
   */
  async function fetchWithCors(url: string, options: RequestInit = {}) {
    const fetchOptions: RequestInit = {
      ...options,
      headers: {
        ...options.headers,
        'Content-Type': 'application/json',
      },
      mode: 'cors',
    }

    const response = await fetch(url, fetchOptions)

    if (!response.ok) {
      throw new Error(`API error: ${response.status} ${response.statusText}`)
    }

    return await response.json()
  }

  /**
   * Fetch sensor data from the API (mocked fallback)
   * @param options - Options to filter sensor data (startDate, endDate, sensors)
   * @returns Promise with mocked sensor data
   */
  async function fetchSensorData(
    options: {
      startDate?: string
      endDate?: string
      sensors?: string[]
    } = {},
  ) {
    isLoading.value = true
    error.value = null

    try {
      console.warn(
        'The /sensors endpoint is not supported by the API. Use fetchFileById instead.\n' +
          'This is a mock implementation that returns empty data.',
      )

      const mockResponse: Record<string, any> = {}

      if (options.sensors && options.sensors.length > 0) {
        options.sensors.forEach((sensor) => {
          mockResponse[sensor] = {
            unit: sensor.includes('temperature')
              ? '°C'
              : sensor.includes('moisture') || sensor.includes('humidity')
                ? '%'
                : sensor.includes('ph')
                  ? 'pH'
                  : '',
            history: [],
            status: 'unknown',
          }
        })
      }

      return mockResponse
    } catch (err) {
      error.value = err instanceof Error ? err : new Error(String(err))
      console.error('Error fetching sensor data:', err)
      throw err
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Fetch list of available files from the backend
   * @returns Promise with file metadata
   */
  async function fetchFiles() {
    isLoading.value = true
    error.value = null

    try {
      return await fetchWithCors(`${API_BASE_URL}/drive/files`)
    } catch (err) {
      error.value = err instanceof Error ? err : new Error(String(err))
      console.error('Error fetching files:', err)
      throw err
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Fetch the content of a file by its ID
   * @param fileId - The ID of the file to retrieve
   * @returns Promise with file content (parsed JSON)
   */
  async function fetchFileById(fileId: string) {
    isLoading.value = true
    error.value = null

    try {
      return await fetchWithCors(`${API_BASE_URL}/drive/file/${fileId}`)
    } catch (err) {
      error.value = err instanceof Error ? err : new Error(String(err))
      console.error(`Error fetching file ${fileId}:`, err)
      throw err
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Generic function to refresh data by calling a fetch function and applying its result
   * @param callback - A callback function to receive and handle the new data
   * @param fetchFunction - The function used to fetch the data
   * @param params - Parameters to pass to the fetch function
   * @returns Promise with the fetched data
   */
  async function refreshData<T, P>(
    callback: (data: T) => void,
    fetchFunction: (params: P) => Promise<T>,
    params: P,
  ) {
    isLoading.value = true
    error.value = null

    try {
      const data = await fetchFunction(params)
      callback(data)
      return data
    } catch (err) {
      error.value = err instanceof Error ? err : new Error(String(err))
      console.error('Error refreshing data:', err)
      throw err
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Send a WhatsApp message via the backend API
   * @param payload - Object containing phoneNumber and message
   * @returns Promise with API response
   */
  async function sendWhatsAppMessage({
    phoneNumber,
    message,
  }: {
    phoneNumber: string
    message: string
  }) {
    isLoading.value = true
    error.value = null

    try {
      return await fetchWithCors(`${API_BASE_URL}/whatsapp/send`, {
        method: 'POST',
        body: JSON.stringify({ phoneNumber, message }),
      })
    } catch (err) {
      error.value = err instanceof Error ? err : new Error(String(err))
      console.error('Error sending WhatsApp message:', err)
      throw err
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Send an email via the Gmail API backend
   * @param payload - Object containing `to`, `subject`, and `text`
   * @returns Promise with API response
   */
  async function sendGmailMessage({
    to,
    subject,
    text,
  }: {
    to: string
    subject: string
    text: string
  }) {
    isLoading.value = true
    error.value = null

    try {
      return await fetchWithCors(`${API_BASE_URL}/gmail/send`, {
        method: 'POST',
        body: JSON.stringify({ to, subject, text }),
      })
    } catch (err) {
      error.value = err instanceof Error ? err : new Error(String(err))
      console.error('Error sending Gmail message:', err)
      throw err
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Update or append content to a file by its ID
   * @param fileId - The ID of the file to update
   * @param content - The content to write (will be stringified)
   * @param append - Whether to append to existing data or fully replace it
   * @returns Promise with API response
   */
  async function updateFileById(fileId: string, content: any, append = false) {
    isLoading.value = true
    error.value = null

    try {
      const url = append
        ? `${API_BASE_URL}/drive/file/${fileId}`
        : `${API_BASE_URL}/drive/file/${fileId}/overwrite`

      const method = append ? 'POST' : 'PUT'

      return await fetchWithCors(url, {
        method,
        body: JSON.stringify(content),
      })
    } catch (err) {
      error.value = err instanceof Error ? err : new Error(String(err))
      console.error(`Error ${append ? 'appending to' : 'replacing'} file ${fileId}:`, err)
      throw err
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Append new time-value entries to specific sensor histories in a file
   * @param fileId - The ID of the file to update
   * @param sensorData - Object with sensor keys and {time, value} entries to append
   * @returns Promise with API response
   */
  async function appendSensorData(
    fileId: string,
    sensorData: Record<string, { time: string; value: number }>,
  ) {
    return updateFileById(fileId, sensorData, true)
  }

  return {
    isLoading,
    error,
    fetchSensorData,
    fetchFiles,
    fetchFileById,
    updateFileById,
    appendSensorData,
    refreshData,
    sendWhatsAppMessage,
    sendGmailMessage,
  }
}
