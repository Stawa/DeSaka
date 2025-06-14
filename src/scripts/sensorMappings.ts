/**
 * Sensor mapping utilities
 */

/**
 * Map of sensor IDs to their display icons
 */
export const sensorIconMap: Record<string, string> = {
  soilTemperature: 'mdi-thermometer',
  soilMoisture: 'mdi-water-percent',
  soilPH: 'mdi-flask',
  airTemperature: 'mdi-thermometer',
  airHumidity: 'mdi-water-percent',
  lightIntensity: 'mdi-white-balance-sunny',
  soil_temperature: 'mdi-thermometer',
  soil_moisture: 'mdi-water-percent',
  soil_ph: 'mdi-flask',
  soil_conductivity: 'mdi-flash',
  air_temperature: 'mdi-thermometer',
  air_humidity: 'mdi-water-percent',
  air_co2: 'mdi-molecule-co2',
  air_tvoc: 'mdi-air-filter',
  light_intensity: 'mdi-white-balance-sunny',
}

/**
 * Map of sensor IDs to their display labels
 */
export const sensorLabelMap: Record<string, string> = {
  soilTemperature: 'Soil Temperature',
  soilMoisture: 'Soil Moisture',
  soilPH: 'Soil pH',
  airTemperature: 'Air Temperature',
  airHumidity: 'Air Humidity',
  lightIntensity: 'Light Intensity',
  soil_temperature: 'Soil Temperature',
  soil_moisture: 'Soil Moisture',
  soil_ph: 'Soil pH',
  air_temperature: 'Air Temperature',
  air_humidity: 'Air Humidity',
  light_intensity: 'Light Intensity',
}

/**
 * Map of sensor IDs to their descriptions
 */
export const sensorDescriptionMap: Record<string, string> = {
  soilTemperature: 'Ground level',
  soilMoisture: 'Root level',
  soilPH: 'Acidity level',
  airTemperature: 'Ambient',
  airHumidity: 'Ambient',
  lightIntensity: 'Canopy level',
  soil_temperature: 'Ground level',
  soil_moisture: 'Root level',
  soil_ph: 'Acidity level',
  soil_conductivity: 'Electrical conductivity',
  air_temperature: 'Ambient',
  air_humidity: 'Ambient',
  air_co2: 'Carbon dioxide',
  air_tvoc: 'Volatile compounds',
  light_intensity: 'Canopy level',
}

/**
 * Map of sensor IDs to their display colors
 */
export const sensorColorMap: Record<string, string> = {
  soilTemperature: 'green',
  soilMoisture: 'blue',
  soilPH: 'purple',
  airTemperature: 'red',
  airHumidity: 'blue',
  lightIntensity: 'teal',
  soil_temperature: '#e05d44',
  soil_moisture: '#3b82f6',
  soil_ph: '#8b5cf6',
  soil_conductivity: '#f59e0b',
  air_temperature: '#ef4444',
  air_humidity: '#0ea5e9',
  air_co2: '#10b981',
  air_tvoc: '#6366f1',
  light_intensity: '#f59e0b',
}

/**
 * Get the icon for a sensor by ID
 * @param sensorId The sensor ID
 * @returns The icon class name
 */
export function getSensorIcon(sensorId: string): string {
  return sensorIconMap[sensorId] || 'mdi-gauge'
}

/**
 * Get the label for a sensor by ID
 * @param sensorId The sensor ID
 * @returns The display label
 */
export function getSensorLabel(sensorId: string): string {
  return sensorLabelMap[sensorId] || sensorId
}

/**
 * Get the description for a sensor by ID
 * @param sensorId The sensor ID
 * @returns The description
 */
export function getSensorDescription(sensorId: string): string {
  return sensorDescriptionMap[sensorId] || ''
}

/**
 * Get the color for a sensor by ID
 * @param sensorId The sensor ID
 * @returns The color value
 */
export function getSensorColor(sensorId: string): string {
  return sensorColorMap[sensorId] || 'gray'
}
