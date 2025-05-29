<script setup lang="ts">
import { ref } from 'vue'

const activeTab = ref('general')

const systemSettings = ref({
  refreshInterval: 30,
  dataRetentionDays: 90,
  timezone: 'UTC',
  dateFormat: 'YYYY-MM-DD',
  timeFormat: '24h',

  emailNotifications: true,
  smsNotifications: false,
  pushNotifications: true,
  notificationEmail: 'admin@example.com',
  notificationPhone: '',

  alertThresholds: {
    soil_temperature: { min: 15, max: 30 },
    soil_moisture: { min: 40, max: 80 },
    soil_ph: { min: 5.5, max: 7.5 },
    air_temperature: { min: 18, max: 32 },
    air_humidity: { min: 30, max: 70 },
    co2_level: { min: 400, max: 1000 },
  },
})

const availableTimezones = [
  'UTC',
  'America/New_York',
  'America/Chicago',
  'America/Denver',
  'America/Los_Angeles',
  'Europe/London',
  'Europe/Berlin',
  'Europe/Moscow',
  'Asia/Tokyo',
  'Asia/Shanghai',
  'Asia/Singapore',
  'Australia/Sydney',
  'Pacific/Auckland',
]

const dateFormats = [
  { value: 'YYYY-MM-DD', label: '2023-01-31' },
  { value: 'MM/DD/YYYY', label: '01/31/2023' },
  { value: 'DD/MM/YYYY', label: '31/01/2023' },
  { value: 'DD.MM.YYYY', label: '31.01.2023' },
]

const timeFormats = [
  { value: '24h', label: '14:30' },
  { value: '12h', label: '2:30 PM' },
]

function saveSettings() {
  alert('Settings saved successfully!')
}

function resetToDefaults() {
  if (confirm('Are you sure you want to reset all settings to default values?')) {
    systemSettings.value = {
      refreshInterval: 30,
      dataRetentionDays: 90,
      timezone: 'UTC',
      dateFormat: 'YYYY-MM-DD',
      timeFormat: '24h',

      emailNotifications: true,
      smsNotifications: false,
      pushNotifications: true,
      notificationEmail: 'admin@example.com',
      notificationPhone: '',

      alertThresholds: {
        soil_temperature: { min: 15, max: 30 },
        soil_moisture: { min: 40, max: 80 },
        soil_ph: { min: 5.5, max: 7.5 },
        air_temperature: { min: 18, max: 32 },
        air_humidity: { min: 30, max: 70 },
        co2_level: { min: 400, max: 1000 },
      },
    }
  }
}

function setActiveTab(tab: string) {
  activeTab.value = tab
}
</script>

<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
    <div class="container px-4">
      <div class="mb-8">
        <h1 class="text-2xl font-bold text-gray-900 dark:text-white mb-2">Settings</h1>
        <p class="text-gray-600 dark:text-gray-400 max-w-2xl">
          Configure system settings and preferences for your environmental monitoring dashboard
        </p>
      </div>

      <!-- Tab Navigation -->
      <div class="mb-8 bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
        <nav class="flex">
          <button
            @click="setActiveTab('general')"
            :class="[
              'flex-1 py-4 px-4 text-center font-medium text-sm transition-all duration-200 flex items-center justify-center',
              activeTab === 'general'
                ? 'bg-primary-50 text-primary-600 dark:bg-gray-700 dark:text-primary-400 border-b-2 border-primary-500 dark:border-primary-400'
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50 dark:text-gray-400 dark:hover:text-gray-300 dark:hover:bg-gray-700 border-b-2 border-transparent',
            ]"
          >
            <span class="mdi mdi-cog text-lg mr-2"></span>
            General Settings
          </button>
          <button
            @click="setActiveTab('notifications')"
            :class="[
              'flex-1 py-4 px-4 text-center font-medium text-sm transition-all duration-200 flex items-center justify-center',
              activeTab === 'notifications'
                ? 'bg-primary-50 text-primary-600 dark:bg-gray-700 dark:text-primary-400 border-b-2 border-primary-500 dark:border-primary-400'
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50 dark:text-gray-400 dark:hover:text-gray-300 dark:hover:bg-gray-700 border-b-2 border-transparent',
            ]"
          >
            <span class="mdi mdi-bell text-lg mr-2"></span>
            Notifications
          </button>
          <button
            @click="setActiveTab('thresholds')"
            :class="[
              'flex-1 py-4 px-4 text-center font-medium text-sm transition-all duration-200 flex items-center justify-center',
              activeTab === 'thresholds'
                ? 'bg-primary-50 text-primary-600 dark:bg-gray-700 dark:text-primary-400 border-b-2 border-primary-500 dark:border-primary-400'
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50 dark:text-gray-400 dark:hover:text-gray-300 dark:hover:bg-gray-700 border-b-2 border-transparent',
            ]"
          >
            <span class="mdi mdi-alert text-lg mr-2"></span>
            Alert Thresholds
          </button>
        </nav>
      </div>

      <!-- Settings Content -->
      <div class="space-y-6">
        <!-- General Settings -->
        <div
          v-if="activeTab === 'general'"
          id="general"
          class="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden"
        >
          <div
            class="p-4 bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600"
          >
            <h2 class="font-medium text-gray-700 dark:text-gray-200">General Settings</h2>
          </div>
          <div class="p-6 space-y-4">
            <div>
              <label
                for="refresh-interval"
                class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
              >
                Data Refresh Interval (seconds)
              </label>
              <input
                type="number"
                id="refresh-interval"
                v-model="systemSettings.refreshInterval"
                min="5"
                max="3600"
                class="block w-full px-3 py-2 dark:text-white text-black border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600"
              />
            </div>

            <div>
              <label
                for="data-retention"
                class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
              >
                Data Retention Period (days)
              </label>
              <input
                type="number"
                id="data-retention"
                v-model="systemSettings.dataRetentionDays"
                min="1"
                max="365"
                class="block w-full px-3 py-2 dark:text-white text-black border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600"
              />
            </div>

            <div>
              <label
                for="timezone"
                class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
              >
                Timezone
              </label>
              <select
                id="timezone"
                v-model="systemSettings.timezone"
                class="block w-full px-3 py-2 dark:text-white text-black border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600"
              >
                <option v-for="tz in availableTimezones" :key="tz" :value="tz">{{ tz }}</option>
              </select>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label
                  for="date-format"
                  class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                >
                  Date Format
                </label>
                <select
                  id="date-format"
                  v-model="systemSettings.dateFormat"
                  class="block w-full px-3 py-2 dark:text-white text-black border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600"
                >
                  <option v-for="format in dateFormats" :key="format.value" :value="format.value">
                    {{ format.label }}
                  </option>
                </select>
              </div>

              <div>
                <label
                  for="time-format"
                  class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                >
                  Time Format
                </label>
                <select
                  id="time-format"
                  v-model="systemSettings.timeFormat"
                  class="block w-full px-3 py-2 dark:text-white text-black border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600"
                >
                  <option v-for="format in timeFormats" :key="format.value" :value="format.value">
                    {{ format.label }}
                  </option>
                </select>
              </div>
            </div>
          </div>
        </div>

        <!-- Notification Settings -->
        <div
          v-if="activeTab === 'notifications'"
          id="notifications"
          class="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden"
        >
          <div
            class="p-4 bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600"
          >
            <h2 class="font-medium text-gray-700 dark:text-gray-200">Notification Settings</h2>
          </div>
          <div class="p-6 space-y-4">
            <div class="flex items-center">
              <input
                type="checkbox"
                id="email-notifications"
                v-model="systemSettings.emailNotifications"
                class="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded dark:bg-gray-700 dark:border-gray-600"
              />
              <label
                for="email-notifications"
                class="ml-2 block text-sm text-gray-700 dark:text-gray-300"
              >
                Email Notifications
              </label>
            </div>

            <div class="flex items-center">
              <input
                type="checkbox"
                id="sms-notifications"
                v-model="systemSettings.smsNotifications"
                class="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded dark:bg-gray-700 dark:border-gray-600"
              />
              <label
                for="sms-notifications"
                class="ml-2 block text-sm text-gray-700 dark:text-gray-300"
              >
                SMS Notifications
              </label>
            </div>

            <div class="flex items-center">
              <input
                type="checkbox"
                id="push-notifications"
                v-model="systemSettings.pushNotifications"
                class="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded dark:bg-gray-700 dark:border-gray-600"
              />
              <label
                for="push-notifications"
                class="ml-2 block text-sm text-gray-700 dark:text-gray-300"
              >
                Push Notifications
              </label>
            </div>

            <div>
              <label
                for="notification-email"
                class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
              >
                Notification Email
              </label>
              <input
                type="email"
                id="notification-email"
                v-model="systemSettings.notificationEmail"
                class="block w-full px-3 py-2 dark:text-white text-black border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600"
              />
            </div>

            <div>
              <label
                for="notification-phone"
                class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
              >
                Notification Phone Number
              </label>
              <input
                type="tel"
                id="notification-phone"
                v-model="systemSettings.notificationPhone"
                placeholder="+1234567890"
                class="block w-full px-3 py-2 dark:text-white text-black border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600"
              />
            </div>
          </div>
        </div>

        <!-- Alert Thresholds -->
        <div
          v-if="activeTab === 'thresholds'"
          id="thresholds"
          class="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden"
        >
          <div
            class="p-4 bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600"
          >
            <h2 class="font-medium text-gray-700 dark:text-gray-200">Alert Thresholds</h2>
          </div>
          <div class="p-6 space-y-6">
            <div>
              <h3 class="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                Soil Temperature (°C)
              </h3>
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label
                    for="soil-temp-min"
                    class="block text-xs text-gray-500 dark:text-gray-400 mb-1"
                    >Minimum</label
                  >
                  <input
                    type="number"
                    id="soil-temp-min"
                    v-model="systemSettings.alertThresholds.soil_temperature.min"
                    class="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white text-black"
                  />
                </div>
                <div>
                  <label
                    for="soil-temp-max"
                    class="block text-xs text-gray-500 dark:text-gray-400 mb-1"
                    >Maximum</label
                  >
                  <input
                    type="number"
                    id="soil-temp-max"
                    v-model="systemSettings.alertThresholds.soil_temperature.max"
                    class="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white text-black"
                  />
                </div>
              </div>
            </div>

            <div>
              <h3 class="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                Soil Moisture (%)
              </h3>
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label
                    for="soil-moisture-min"
                    class="block text-xs text-gray-500 dark:text-gray-400 mb-1"
                    >Minimum</label
                  >
                  <input
                    type="number"
                    id="soil-moisture-min"
                    v-model="systemSettings.alertThresholds.soil_moisture.min"
                    class="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white text-black"
                  />
                </div>
                <div>
                  <label
                    for="soil-moisture-max"
                    class="block text-xs text-gray-500 dark:text-gray-400 mb-1"
                    >Maximum</label
                  >
                  <input
                    type="number"
                    id="soil-moisture-max"
                    v-model="systemSettings.alertThresholds.soil_moisture.max"
                    class="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white text-black"
                  />
                </div>
              </div>
            </div>

            <div>
              <h3 class="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Soil pH</h3>
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label
                    for="soil-ph-min"
                    class="block text-xs text-gray-500 dark:text-gray-400 mb-1"
                    >Minimum</label
                  >
                  <input
                    type="number"
                    id="soil-ph-min"
                    v-model="systemSettings.alertThresholds.soil_ph.min"
                    step="0.1"
                    class="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white text-black"
                  />
                </div>
                <div>
                  <label
                    for="soil-ph-max"
                    class="block text-xs text-gray-500 dark:text-gray-400 mb-1"
                    >Maximum</label
                  >
                  <input
                    type="number"
                    id="soil-ph-max"
                    v-model="systemSettings.alertThresholds.soil_ph.max"
                    step="0.1"
                    class="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white text-black"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- User Profile section removed as requested -->

        <!-- Action Buttons -->
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden p-6">
          <div class="flex justify-between items-center">
            <button
              @click="resetToDefaults"
              class="px-5 py-2.5 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-600 transition-colors duration-200 flex items-center"
            >
              <span class="mdi mdi-refresh mr-2"></span>
              Reset to Defaults
            </button>

            <button
              @click="saveSettings"
              class="px-5 py-2.5 bg-primary-500 text-white rounded-md hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:bg-primary-600 dark:hover:bg-primary-700 transition-colors duration-200 flex items-center"
            >
              <span class="mdi mdi-content-save mr-2"></span>
              Save Settings
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
