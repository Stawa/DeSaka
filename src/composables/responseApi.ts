/**
 * Response API interfaces and utilities for sensor data handling
 * Provides type-safe interfaces for API responses and data transformation utilities
 */

interface SoilReading {
  time: string
  value: number
}

interface SoilSensor {
  unit: string
  history: SoilReading[]
}

interface Soil {
  temperature: SoilSensor
  moisture: SoilSensor
}

interface AirReading {
  time: string
  value: number
}

interface AirSensor {
  unit: string
  history: AirReading[]
}

interface Air {
  temperature: AirSensor
  humidity: AirSensor
  co2: AirSensor
}

interface SensorReading {
  time: string
  value: number
}

/**
 * Converts an array of sensor readings with ISO timestamp strings
 * into a more human-readable format using `toLocaleString()` for the time.
 *
 * Useful for preparing data for display in charts, tables, or logs.
 *
 * @param history - An array of sensor readings (temperature, humidity, etc.) with `time` and `value`.
 * @returns A new array of objects with the time converted to a locale-formatted string and the original value.
 *
 * @example
 * mapReadableHistory([
 *   { time: "2025-06-14T01:08:02", value: 33.6 }
 * ])
 * // => [ { time: "6/14/2025, 1:08:02 AM", value: 33.6 } ]
 */
function mapReadableHistory(history: SensorReading[]): { time: string; value: number }[] {
  return history.map((item) => ({
    time: new Date(item.time).toLocaleString(),
    value: item.value,
  }))
}

export type { Soil, SoilSensor, SoilReading, Air, AirSensor, AirReading, SensorReading }
export { mapReadableHistory }
