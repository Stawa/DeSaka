<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useToast } from '@/composables/useToast'

const activeTab = ref('general')
const setActiveTab = (tab: string) => {
  activeTab.value = tab
}

const { showToast } = useToast()
const settingsModified = ref(false)

const originalSettings = {
  general: {
    dataRefreshInterval: 5,
    dataRetentionPeriod: 30,
    timezone: 'UTC',
    dateFormat: 'MM/DD/YYYY',
    timeFormat: '12h',
  },
  notifications: {
    emailEnabled: false,
    smsEnabled: false,
    pushEnabled: true,
    email: '',
    phone: '',
  },
  thresholds: {
    soilTemperature: {
      min: 10,
      max: 30,
    },
    soilMoisture: {
      min: 20,
      max: 80,
    },
    soilPH: {
      min: 5.5,
      max: 7.5,
    },
  },
}

const settings = ref(JSON.parse(JSON.stringify(originalSettings)))

watch(
  settings,
  () => {
    settingsModified.value = JSON.stringify(settings.value) !== JSON.stringify(originalSettings)
  },
  { deep: true },
)

const timezoneOptions = [
  { value: 'UTC', label: 'UTC (Coordinated Universal Time)' },
  { value: 'EST', label: 'EST (Eastern Standard Time)' },
  { value: 'CST', label: 'CST (Central Standard Time)' },
  { value: 'MST', label: 'MST (Mountain Standard Time)' },
  { value: 'PST', label: 'PST (Pacific Standard Time)' },
  { value: 'IST', label: 'IST (Indian Standard Time)' },
]

const dateFormatOptions = [
  { value: 'MM/DD/YYYY', label: 'MM/DD/YYYY' },
  { value: 'DD/MM/YYYY', label: 'DD/MM/YYYY' },
  { value: 'YYYY-MM-DD', label: 'YYYY-MM-DD' },
]

const timeFormatOptions = [
  { value: '12h', label: '12-hour (AM/PM)' },
  { value: '24h', label: '24-hour' },
]

const emailValid = computed(() => {
  if (!settings.value.notifications.email) return true
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(settings.value.notifications.email)
})

const phoneValid = computed(() => {
  if (!settings.value.notifications.phone) return true
  const phoneRegex = /^\+?\d{10,15}$/
  return phoneRegex.test(settings.value.notifications.phone)
})

const formValid = computed(() => {
  return emailValid.value && phoneValid.value
})

const saveSettings = () => {
  if (!formValid.value) {
    showToast('Please correct the validation errors before saving', 'error')
    return
  }

  console.log('Saving settings:', settings.value)
  Object.assign(originalSettings, JSON.parse(JSON.stringify(settings.value)))
  settingsModified.value = false

  showToast('Settings saved successfully', 'success')
}

const resetSettings = () => {
  if (confirm('Are you sure you want to reset all settings to default values?')) {
    settings.value = JSON.parse(JSON.stringify(originalSettings))
    showToast('Settings reset to defaults', 'info')
  }
}

const cancelChanges = () => {
  if (settingsModified.value) {
    if (confirm('Discard unsaved changes?')) {
      settings.value = JSON.parse(JSON.stringify(originalSettings))
      settingsModified.value = false
      showToast('Changes discarded', 'info')
    }
  }
}
</script>

<template>
  <div class="container mx-auto px-4 py-6">
    <!-- Page Header -->
    <div
      class="mb-8 bg-white dark:bg-gray-900 rounded-xl shadow-md overflow-hidden border border-gray-100 dark:border-gray-700"
    >
      <div class="h-1.5 w-full bg-gradient-to-r from-amber-400 to-amber-600"></div>
      <div class="p-4 sm:p-6">
        <!-- Header Content -->
        <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <!-- Title and Description -->
          <div class="flex items-start sm:items-center w-full md:w-auto">
            <div
              class="bg-amber-100 dark:bg-amber-900/30 p-2 sm:p-3 rounded-lg mr-3 sm:mr-4 flex-shrink-0"
            >
              <span
                class="mdi mdi-cog text-amber-600 dark:text-amber-400 text-xl sm:text-2xl"
              ></span>
            </div>
            <div class="flex-grow">
              <h1 class="text-xl sm:text-2xl font-bold text-gray-800 dark:text-gray-100">
                System Settings
              </h1>
              <p
                class="text-sm sm:text-base text-gray-600 dark:text-gray-400 mt-0.5 sm:mt-1 line-clamp-2 sm:line-clamp-none"
              >
                Configure your system preferences and alert thresholds
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Tab Navigation -->
    <div
      class="flex border-b border-gray-200 dark:border-gray-700 mb-6 overflow-x-auto hide-scrollbar"
    >
      <div class="flex w-full sm:w-auto justify-between sm:justify-start">
        <button
          @click="setActiveTab('general')"
          class="flex items-center px-4 py-3 font-medium text-sm transition-colors whitespace-nowrap flex-1 sm:flex-initial justify-center sm:justify-start"
          :class="{
            'text-primary-600 border-b-2 border-primary-600 dark:text-primary-400 dark:border-primary-400':
              activeTab === 'general',
            'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300':
              activeTab !== 'general',
          }"
        >
          <span class="mdi mdi-tune mr-2 text-lg"></span>
          <span>General</span>
        </button>
        <button
          @click="setActiveTab('notifications')"
          class="flex items-center px-4 py-3 font-medium text-sm transition-colors whitespace-nowrap flex-1 sm:flex-initial justify-center sm:justify-start"
          :class="{
            'text-primary-600 border-b-2 border-primary-600 dark:text-primary-400 dark:border-primary-400':
              activeTab === 'notifications',
            'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300':
              activeTab !== 'notifications',
          }"
        >
          <span class="mdi mdi-bell-outline mr-2 text-lg"></span>
          <span>Notifications</span>
        </button>
        <button
          @click="setActiveTab('thresholds')"
          class="flex items-center px-4 py-3 font-medium text-sm transition-colors whitespace-nowrap flex-1 sm:flex-initial justify-center sm:justify-start"
          :class="{
            'text-primary-600 border-b-2 border-primary-600 dark:text-primary-400 dark:border-primary-400':
              activeTab === 'thresholds',
            'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300':
              activeTab !== 'thresholds',
          }"
        >
          <span class="mdi mdi-alert-circle-outline mr-2 text-lg"></span>
          <span>Thresholds</span>
        </button>
      </div>
    </div>

    <!-- Tab Content -->
    <div class="tab-content">
      <!-- General Settings Tab -->
      <div v-if="activeTab === 'general'" class="fade-in">
        <div
          class="bg-white dark:bg-gray-900 rounded-lg shadow-sm p-5 mb-5 border border-gray-100 dark:border-gray-700"
        >
          <h2 class="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-200 flex items-center">
            <span class="mdi mdi-refresh mr-2 text-primary-600 dark:text-primary-400"></span>
            Data Settings
          </h2>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-5 mb-4">
            <!-- Data Refresh Interval -->
            <div>
              <label
                for="data-refresh-interval"
                class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
              >
                Data Refresh Interval
              </label>
              <div class="relative">
                <input
                  id="data-refresh-interval"
                  v-model="settings.general.dataRefreshInterval"
                  type="number"
                  min="1"
                  max="60"
                  class="block w-full px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:focus:ring-primary-500 dark:focus:border-primary-500 transition-colors"
                />
                <div
                  class="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-gray-500 dark:text-gray-400"
                >
                  minutes
                </div>
              </div>
              <p class="mt-1 text-xs text-gray-500 dark:text-gray-400">
                How often to refresh sensor data (1-60 minutes)
              </p>
            </div>

            <!-- Data Retention Period -->
            <div>
              <label
                for="data-retention-period"
                class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
              >
                Data Retention Period
              </label>
              <div class="relative">
                <input
                  id="data-retention-period"
                  v-model="settings.general.dataRetentionPeriod"
                  type="number"
                  min="1"
                  max="365"
                  class="block w-full px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:focus:ring-primary-500 dark:focus:border-primary-500 transition-colors"
                />
                <div
                  class="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-gray-500 dark:text-gray-400"
                >
                  days
                </div>
              </div>
              <p class="mt-1 text-xs text-gray-500 dark:text-gray-400">
                How long to keep historical data (1-365 days)
              </p>
            </div>
          </div>
        </div>

        <div
          class="bg-white dark:bg-gray-900 rounded-lg shadow-sm p-5 border border-gray-100 dark:border-gray-700"
        >
          <h2 class="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-200 flex items-center">
            <span class="mdi mdi-clock-outline mr-2 text-primary-600 dark:text-primary-400"></span>
            Time & Format Settings
          </h2>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
            <!-- Timezone -->
            <div>
              <label
                for="timezone-select"
                class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
              >
                Timezone
              </label>
              <select
                id="timezone-select"
                v-model="settings.general.timezone"
                class="block w-full px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:focus:ring-primary-500 dark:focus:border-primary-500 transition-colors"
              >
                <option v-for="option in timezoneOptions" :key="option.value" :value="option.value">
                  {{ option.label }}
                </option>
              </select>
              <p class="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Select your local timezone for accurate time display
              </p>
            </div>

            <!-- Date Format -->
            <div>
              <label
                for="date-format-select"
                class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
              >
                Date Format
              </label>
              <select
                id="date-format-select"
                v-model="settings.general.dateFormat"
                class="block w-full px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:focus:ring-primary-500 dark:focus:border-primary-500 transition-colors"
              >
                <option
                  v-for="option in dateFormatOptions"
                  :key="option.value"
                  :value="option.value"
                >
                  {{ option.label }}
                </option>
              </select>
              <p class="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Choose how dates are displayed throughout the application
              </p>
            </div>

            <!-- Time Format -->
            <div>
              <label
                for="time-format-select"
                class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
              >
                Time Format
              </label>
              <select
                id="time-format-select"
                v-model="settings.general.timeFormat"
                class="block w-full px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:focus:ring-primary-500 dark:focus:border-primary-500 transition-colors"
              >
                <option
                  v-for="option in timeFormatOptions"
                  :key="option.value"
                  :value="option.value"
                >
                  {{ option.label }}
                </option>
              </select>
              <p class="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Choose how time is displayed throughout the application
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- Notification Settings Tab -->
      <div v-if="activeTab === 'notifications'" class="fade-in">
        <div
          class="bg-white dark:bg-gray-900 rounded-lg shadow-sm p-5 border border-gray-100 dark:border-gray-700"
        >
          <h2 class="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-200 flex items-center">
            <span class="mdi mdi-bell-outline mr-2 text-primary-600 dark:text-primary-400"></span>
            Notification Channels
          </h2>

          <div class="space-y-4">
            <!-- Email Notifications -->
            <div class="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div class="flex items-center justify-between">
                <div class="flex items-center">
                  <span
                    class="mdi mdi-email-outline text-xl mr-3 text-primary-600 dark:text-primary-400"
                  ></span>
                  <div>
                    <h3 class="font-medium text-gray-800 dark:text-gray-200">
                      Email Notifications
                    </h3>
                    <p class="text-sm text-gray-500 dark:text-gray-400">Receive alerts via email</p>
                  </div>
                </div>
                <label
                  for="email-notifications-toggle"
                  class="relative inline-flex items-center cursor-pointer"
                >
                  <span class="sr-only">Enable email notifications</span>
                  <input
                    id="email-notifications-toggle"
                    type="checkbox"
                    v-model="settings.notifications.emailEnabled"
                    class="sr-only peer"
                  />
                  <div
                    class="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary-500 dark:peer-focus:ring-primary-500 rounded-full peer dark:bg-gray-600 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary-600"
                  ></div>
                </label>
              </div>

              <!-- Email Address Input (conditionally displayed) -->
              <div v-if="settings.notifications.emailEnabled" class="mt-4">
                <label
                  for="notification-email"
                  class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                >
                  Notification Email Address
                </label>
                <input
                  id="notification-email"
                  v-model="settings.notifications.email"
                  type="email"
                  placeholder="your.email@example.com"
                  class="block w-full px-4 py-2 bg-white dark:bg-gray-700 border rounded-lg transition-colors"
                  :class="{
                    'border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:focus:ring-primary-500 dark:focus:border-primary-500':
                      emailValid,
                    'border-red-300 dark:border-red-600 focus:ring-2 focus:ring-red-500 focus:border-red-500 dark:focus:ring-red-500 dark:focus:border-red-500':
                      !emailValid,
                  }"
                />
                <p
                  v-if="!emailValid"
                  class="mt-1 text-sm text-red-600 dark:text-red-400 flex items-center"
                >
                  <span class="mdi mdi-alert-circle mr-1"></span>
                  Please enter a valid email address
                </p>
              </div>
            </div>

            <!-- SMS Notifications -->
            <div class="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div class="flex items-center justify-between">
                <div class="flex items-center">
                  <span
                    class="mdi mdi-message-text-outline text-xl mr-3 text-primary-600 dark:text-primary-400"
                  ></span>
                  <div>
                    <h3 class="font-medium text-gray-800 dark:text-gray-200">SMS Notifications</h3>
                    <p class="text-sm text-gray-500 dark:text-gray-400">
                      Receive alerts via text message
                    </p>
                  </div>
                </div>
                <label
                  for="sms-notifications-toggle"
                  class="relative inline-flex items-center cursor-pointer"
                >
                  <span class="sr-only">Enable SMS notifications</span>
                  <input
                    id="sms-notifications-toggle"
                    type="checkbox"
                    v-model="settings.notifications.smsEnabled"
                    class="sr-only peer"
                  />
                  <div
                    class="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary-500 dark:peer-focus:ring-primary-500 rounded-full peer dark:bg-gray-600 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary-600"
                  ></div>
                </label>
              </div>

              <!-- Phone Number Input (conditionally displayed) -->
              <div v-if="settings.notifications.smsEnabled" class="mt-4">
                <label
                  for="phone-number-input"
                  class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                >
                  Phone Number
                </label>
                <input
                  id="phone-number-input"
                  v-model="settings.notifications.phone"
                  type="tel"
                  placeholder="+1234567890"
                  class="block w-full px-4 py-2 bg-white dark:bg-gray-700 border rounded-lg transition-colors"
                  :class="{
                    'border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:focus:ring-primary-500 dark:focus:border-primary-500':
                      phoneValid,
                    'border-red-300 dark:border-red-600 focus:ring-2 focus:ring-red-500 focus:border-red-500 dark:focus:ring-red-500 dark:focus:border-red-500':
                      !phoneValid,
                  }"
                />
                <p
                  v-if="!phoneValid"
                  class="mt-1 text-sm text-red-600 dark:text-red-400 flex items-center"
                >
                  <span class="mdi mdi-alert-circle mr-1"></span>
                  Please enter a valid phone number (10-15 digits, can start with +)
                </p>
              </div>
            </div>

            <!-- Push Notifications -->
            <div class="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div class="flex items-center justify-between">
                <div class="flex items-center">
                  <span
                    class="mdi mdi-cellphone-message text-xl mr-3 text-primary-600 dark:text-primary-400"
                  ></span>
                  <div>
                    <h3 class="font-medium text-gray-800 dark:text-gray-200">Push Notifications</h3>
                    <p class="text-sm text-gray-500 dark:text-gray-400">
                      Receive alerts on your device
                    </p>
                  </div>
                </div>
                <label
                  for="push-notifications-toggle"
                  class="relative inline-flex items-center cursor-pointer"
                >
                  <span class="sr-only">Enable push notifications</span>
                  <input
                    id="push-notifications-toggle"
                    type="checkbox"
                    v-model="settings.notifications.pushEnabled"
                    class="sr-only peer"
                  />
                  <div
                    class="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary-500 dark:peer-focus:ring-primary-500 rounded-full peer dark:bg-gray-600 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary-600"
                  ></div>
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Alert Thresholds Tab -->
      <div v-if="activeTab === 'thresholds'" class="fade-in">
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          <!-- Soil Temperature Thresholds -->
          <div
            class="bg-white dark:bg-gray-900 rounded-lg shadow-sm p-5 border border-gray-200 dark:border-gray-700"
          >
            <h3
              class="text-lg font-semibold mb-4 text-gray-800 dark:text-gray-200 flex items-center"
            >
              <span class="mdi mdi-thermometer mr-2 text-amber-600 dark:text-amber-400"></span>
              Soil Temperature
            </h3>

            <div class="space-y-4">
              <!-- Minimum Threshold -->
              <div>
                <label
                  for="soil-temp-min"
                  class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                >
                  Minimum Threshold
                </label>
                <div class="relative">
                  <input
                    id="soil-temp-min"
                    v-model="settings.thresholds.soilTemperature.min"
                    type="number"
                    step="0.1"
                    class="block w-full px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 dark:focus:ring-amber-500 dark:focus:border-amber-500 transition-colors"
                  />
                  <div
                    class="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-gray-500 dark:text-gray-400"
                  >
                    °C
                  </div>
                </div>
                <p class="mt-1 text-xs text-gray-600 dark:text-gray-400">
                  Alert when below this temperature
                </p>
              </div>

              <!-- Maximum Threshold -->
              <div>
                <label
                  for="soil-temp-max"
                  class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                >
                  Maximum Threshold
                </label>
                <div class="relative">
                  <input
                    id="soil-temp-max"
                    v-model="settings.thresholds.soilTemperature.max"
                    type="number"
                    step="0.1"
                    class="block w-full px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 dark:focus:ring-amber-500 dark:focus:border-amber-500 transition-colors"
                  />
                  <div
                    class="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-gray-500 dark:text-gray-400"
                  >
                    °C
                  </div>
                </div>
                <p class="mt-1 text-xs text-gray-600 dark:text-gray-400">
                  Alert when above this temperature
                </p>
              </div>
            </div>
          </div>

          <!-- Soil Moisture Thresholds -->
          <div
            class="bg-white dark:bg-gray-900 rounded-lg shadow-sm p-5 border border-gray-200 dark:border-gray-700"
          >
            <h3
              class="text-lg font-semibold mb-4 text-gray-800 dark:text-gray-200 flex items-center"
            >
              <span class="mdi mdi-water mr-2 text-blue-600 dark:text-blue-400"></span>
              Soil Moisture
            </h3>

            <div class="space-y-4">
              <!-- Minimum Threshold -->
              <div>
                <label
                  for="soil-moisture-min"
                  class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                >
                  Minimum Threshold
                </label>
                <div class="relative">
                  <input
                    id="soil-moisture-min"
                    v-model="settings.thresholds.soilMoisture.min"
                    type="number"
                    min="0"
                    max="100"
                    class="block w-full px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:focus:ring-blue-500 dark:focus:border-blue-500 transition-colors"
                  />
                  <div
                    class="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-gray-500 dark:text-gray-400"
                  >
                    %
                  </div>
                </div>
                <p class="mt-1 text-xs text-gray-600 dark:text-gray-400">
                  Alert when below this moisture level
                </p>
              </div>

              <!-- Maximum Threshold -->
              <div>
                <label
                  for="soil-moisture-max"
                  class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                >
                  Maximum Threshold
                </label>
                <div class="relative">
                  <input
                    id="soil-moisture-max"
                    v-model="settings.thresholds.soilMoisture.max"
                    type="number"
                    min="0"
                    max="100"
                    class="block w-full px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:focus:ring-blue-500 dark:focus:border-blue-500 transition-colors"
                  />
                  <div
                    class="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-gray-500 dark:text-gray-400"
                  >
                    %
                  </div>
                </div>
                <p class="mt-1 text-xs text-gray-600 dark:text-gray-400">
                  Alert when above this moisture level
                </p>
              </div>
            </div>
          </div>

          <!-- Soil pH Thresholds -->
          <div
            class="bg-white dark:bg-gray-900 rounded-lg shadow-sm p-5 border border-gray-200 dark:border-gray-700"
          >
            <h3
              class="text-lg font-semibold mb-4 text-gray-800 dark:text-gray-200 flex items-center"
            >
              <span class="mdi mdi-flask mr-2 text-green-600 dark:text-green-400"></span>
              Soil pH
            </h3>

            <div class="space-y-4">
              <!-- Minimum Threshold -->
              <div>
                <label
                  for="soil-ph-min"
                  class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                >
                  Minimum Threshold
                </label>
                <div class="relative">
                  <input
                    id="soil-ph-min"
                    v-model="settings.thresholds.soilPH.min"
                    type="number"
                    step="0.1"
                    min="0"
                    max="14"
                    class="block w-full px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 dark:focus:ring-green-500 dark:focus:border-green-500 transition-colors"
                  />
                  <div
                    class="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-gray-500 dark:text-gray-400"
                  >
                    pH
                  </div>
                </div>
                <p class="mt-1 text-xs text-gray-600 dark:text-gray-400">
                  Alert when below this pH level
                </p>
              </div>

              <!-- Maximum Threshold -->
              <div>
                <label
                  for="soil-ph-max"
                  class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                >
                  Maximum Threshold
                </label>
                <div class="relative">
                  <input
                    id="soil-ph-max"
                    v-model="settings.thresholds.soilPH.max"
                    type="number"
                    step="0.1"
                    min="0"
                    max="14"
                    class="block w-full px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 dark:focus:ring-green-500 dark:focus:border-green-500 transition-colors"
                  />
                  <div
                    class="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-gray-500 dark:text-gray-400"
                  >
                    pH
                  </div>
                </div>
                <p class="mt-1 text-xs text-gray-600 dark:text-gray-400">
                  Alert when above this pH level
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Actions Section -->
    <div
      class="mt-6 flex flex-col sm:flex-row justify-between items-center bg-gray-50 dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700 gap-4"
    >
      <div class="flex items-center space-x-3 w-full sm:w-auto">
        <button
          @click="resetSettings"
          class="w-full sm:w-auto px-4 py-2 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg transition-colors flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-gray-400 dark:focus:ring-gray-500"
        >
          <span class="mdi mdi-refresh mr-2"></span>
          Reset
        </button>
        <button
          v-if="settingsModified"
          @click="cancelChanges"
          class="w-full sm:w-auto px-4 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg transition-colors flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-gray-400 dark:focus:ring-gray-500 border border-gray-300 dark:border-gray-600"
        >
          <span class="mdi mdi-close mr-2"></span>
          Cancel
        </button>
      </div>

      <div class="flex items-center w-full sm:w-auto">
        <div
          v-if="settingsModified"
          class="mr-3 text-sm text-amber-600 dark:text-amber-400 flex items-center"
        >
          <span class="mdi mdi-alert-circle mr-1"></span>
          Unsaved changes
        </div>
        <button
          @click="saveSettings"
          :disabled="!formValid"
          class="w-full sm:w-auto px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900"
          :class="{ 'opacity-50 cursor-not-allowed': !formValid }"
        >
          <span class="mdi mdi-content-save mr-2"></span>
          Save Settings
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.fade-in {
  animation: fadeIn 0.3s ease-in-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.tab-content {
  min-height: 300px;
}

/* Custom scrollbar */
.hide-scrollbar {
  -ms-overflow-style: none; /* IE and Edge */
  scrollbar-width: none; /* Firefox */
}

.hide-scrollbar::-webkit-scrollbar {
  display: none; /* Chrome, Safari, Opera */
}
</style>
