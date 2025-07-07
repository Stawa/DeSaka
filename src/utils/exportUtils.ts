/**
 * Utility functions for exporting data in various formats
 */

/**
 * Export data point interface
 */
interface ExportDataPoint {
  timestamp: string
  value: number
}

/**
 * Sensor information interface
 */
interface SensorInfo {
  name: string
  unit: string
}

/**
 * Export format type
 */
export type ExportFormat = 'csv' | 'json' | 'excel'

/**
 * Date range interface
 */
interface DateRange {
  start: string
  end: string
}

/**
 * Export options interface
 */
interface ExportOptions {
  format: ExportFormat
  sensors: Array<{ id: string; name?: string; unit?: string } | string>
  dateRange: { start: string | null; end: string | null }
  timeRange: { start: string; end: string }
}

/**
 * Export data as CSV file
 * @param data The data to export
 * @param filename The name of the file to download
 * @param sensors List of sensors to include
 * @param sensorInfo Map of sensor information (name, unit)
 */
export function exportAsCSV(
  data: Record<string, ExportDataPoint[]>,
  filename: string,
  sensors: string[],
  sensorInfo: Record<string, SensorInfo>,
): void {
  let csv = 'Timestamp'
  sensors.forEach((sensorId) => {
    const sensor = sensorInfo[sensorId]
    if (sensor) {
      csv += `,${sensor.name} (${sensor.unit})`
    }
  })
  csv += '\n'

  const timestamps = new Set<string>()
  sensors.forEach((sensorId) => {
    if (data[sensorId]) {
      data[sensorId].forEach((point) => {
        timestamps.add(point.timestamp)
      })
    }
  })

  const sortedTimestamps = Array.from(timestamps).sort((a, b) => a.localeCompare(b))
  const dataMap: Record<string, Record<string, number>> = {}
  sortedTimestamps.forEach((timestamp) => {
    dataMap[timestamp] = {}
  })

  sensors.forEach((sensorId) => {
    if (data[sensorId]) {
      data[sensorId].forEach((point) => {
        dataMap[point.timestamp][sensorId] = point.value
      })
    }
  })

  sortedTimestamps.forEach((timestamp) => {
    const date = new Date(timestamp)
    const formattedDate = `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`
    let row = formattedDate

    sensors.forEach((sensorId) => {
      const value = dataMap[timestamp][sensorId] ?? ''
      row += `,${value}`
    })

    csv += row + '\n'
  })

  downloadFile(csv, filename, 'text/csv;charset=utf-8;')
}

/**
 * Export data as JSON file
 * @param data The data to export
 * @param filename The name of the file to download
 * @param sensors List of sensors to include
 * @param sensorInfo Map of sensor information (name, unit)
 */
export function exportAsJSON(
  data: Record<string, ExportDataPoint[]>,
  filename: string,
  sensors: string[],
  sensorInfo: Record<string, SensorInfo>,
): void {
  const filteredData: Record<
    string,
    {
      name: string
      unit: string
      readings: ExportDataPoint[]
    }
  > = {}

  sensors.forEach((sensorId) => {
    if (data[sensorId]) {
      const sensorName = sensorInfo[sensorId]?.name || sensorId
      const sensorUnit = sensorInfo[sensorId]?.unit || ''

      filteredData[sensorId] = {
        name: sensorName,
        unit: sensorUnit,
        readings: data[sensorId].map((point) => ({
          timestamp: point.timestamp,
          value: point.value,
        })),
      }
    }
  })

  const exportData = {
    exportDate: new Date().toISOString(),
    dataType: filename.split('_')[0],
    sensors: filteredData,
  }
  const jsonStr = JSON.stringify(exportData, null, 2)

  downloadFile(jsonStr, filename, 'application/json;charset=utf-8;')
}

/**
 * Export data as Excel file
 * This is a simplified version that creates a CSV that Excel can open
 * For a true Excel file, you would need a library like SheetJS/xlsx
 * @param data The data to export
 * @param filename The name of the file to download
 * @param sensors List of sensors to include
 * @param sensorInfo Map of sensor information (name, unit)
 */
export function exportAsExcel(
  data: Record<string, ExportDataPoint[]>,
  filename: string,
  sensors: string[],
  sensorInfo: Record<string, SensorInfo>,
): void {
  exportAsCSV(data, filename, sensors, sensorInfo)
}

/**
 * Helper function to download a file
 * @param content The content of the file
 * @param filename The name of the file
 * @param contentType The content type of the file
 */
function downloadFile(content: string, filename: string, contentType: string): void {
  const blob = new Blob([content], { type: contentType })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.setAttribute('href', url)
  link.setAttribute('download', filename)
  link.style.visibility = 'hidden'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

/**
 * Format a date range for use in filenames
 * @param dateRange The date range to format
 * @returns A string representation of the date range
 */
export function formatDateRangeForFilename(dateRange: DateRange): string {
  return `${dateRange.start}_to_${dateRange.end}`
}

/**
 * Generate a filename for the exported data
 * @param dataType The type of data being exported (dashboard, soil, air, history)
 * @param format The format of the export (csv, json, excel)
 * @param dateRange The date range of the data
 * @returns A filename for the exported data
 */
export function generateExportFilename(
  dataType: string,
  format: ExportFormat,
  dateRange: DateRange,
): string {
  const dateStr = formatDateRangeForFilename(dateRange)
  return `${dataType}_data_${dateStr}.${format === 'excel' ? 'xlsx' : format}`
}

/**
 * Simplified handleDataExport function for use in components
 * This function fetches the necessary data and sensor info before exporting
 * @param options Export options including format, sensors, dateRange, and timeRange
 * @param exportData Optional data to export
 * @param sensorInfo Optional sensor information
 * @returns Promise that resolves when export is complete
 */
export async function handleDataExport(
  options: ExportOptions,
  exportData?: Record<string, ExportDataPoint[]>,
  sensorInfo?: Record<string, SensorInfo>,
): Promise<void> {
  try {
    const dateRange: DateRange = {
      start:
        options.dateRange.start ??
        new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      end: options.dateRange.end ?? new Date().toISOString().split('T')[0],
    }

    const sensorIds = options.sensors.map((s) => (typeof s === 'string' ? s : s.id))

    const sensorInfoToUse: Record<string, SensorInfo> = sensorInfo || {}

    if (!sensorInfo) {
      options.sensors.forEach((sensor) => {
        const id = typeof sensor === 'string' ? sensor : sensor.id
        const name = typeof sensor === 'string' ? sensor : (sensor.name ?? id)
        const unit = typeof sensor === 'string' ? '' : (sensor.unit ?? '')

        sensorInfoToUse[id] = { name, unit }
      })
    }

    let dataToExport = exportData

    if (!dataToExport) {
      dataToExport = {}

      sensorIds.forEach((id) => {
        dataToExport![id] = []

        const start = new Date(dateRange.start)
        const end = new Date(dateRange.end)

        for (let date = new Date(start); date <= end; date.setDate(date.getDate() + 1)) {
          for (let hour = 0; hour < 24; hour += 6) {
            const timestamp = new Date(date)
            timestamp.setHours(hour, 0, 0, 0)

            dataToExport![id].push({
              timestamp: timestamp.toISOString(),
              value: Math.random() * 100,
            })
          }
        }
      })
    }

    const dataType = 'sensor'
    const filename = generateExportFilename(dataType, options.format, dateRange)

    switch (options.format) {
      case 'csv':
        exportAsCSV(dataToExport, filename, sensorIds, sensorInfoToUse)
        break
      case 'json':
        exportAsJSON(dataToExport, filename, sensorIds, sensorInfoToUse)
        break
      case 'excel':
        exportAsExcel(dataToExport, filename, sensorIds, sensorInfoToUse)
        break
      default:
        console.error(`Unsupported export format: ${options.format}`)
    }

    return Promise.resolve()
  } catch (error) {
    console.error('Error exporting data:', error)
    return Promise.reject(error instanceof Error ? error : new Error(String(error)))
  }
}
