<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { toast } from 'vue3-toastify'
import { useApi } from '@/composables/useApi'
import SettingsPanel from '@/components/settings/SettingsPanel.vue'
import ThresholdInputGroup from '@/components/settings/ThresholdInputGroup.vue'
import NotificationChannels from '@/components/settings/NotificationChannels.vue'
import 'vue3-toastify/dist/index.css'

const activeTab = ref('general')
const setActiveTab = (tab: string) => {
  activeTab.value = tab
}

const { fetchFileById, updateFileById } = useApi()
const settingsModified = ref(false)
const isLoadingSettings = ref(false)
const isSavingSettings = ref(false)
const isResettingSettings = ref(false)

const SETTINGS_FILE_ID = '14c-pco5g6oHQMsAmVtIj4l3OejqNX0hu'

const newEmailTag = ref('')

const originalSettings = {
  general: {
    dataRefreshInterval: 5,
    dataRetentionPeriod: 30,
    timezone: 'Asia/Singapore',
    dateFormat: 'DD-MM-YYYY',
    timeFormat: '12h',
  },
  notifications: {
    emailEnabled: false,
    smsEnabled: false,
    pushEnabled: true,
    emails: [],
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
    airTemperature: {
      min: 18,
      max: 30,
    },
    airHumidity: {
      min: 30,
      max: 70,
    },
    lightIntensity: {
      min: 1000,
      max: 10000,
    },
  },
}

const settings = ref(JSON.parse(JSON.stringify(originalSettings)))

onMounted(async () => {
  await loadSettingsFromDrive()
})

async function loadSettingsFromDrive() {
  try {
    isLoadingSettings.value = true
    console.log('[loadSettingsFromDrive] Fetching settings from Google Drive')

    const response = await fetchFileById(SETTINGS_FILE_ID)
    console.log('[loadSettingsFromDrive] Response:', response)

    if (response && Object.keys(response).length > 0) {
      const mergedSettings = JSON.parse(JSON.stringify(originalSettings))

      const deepMerge = (target: any, source: any) => {
        for (const key in source) {
          if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
            if (!target[key] || typeof target[key] !== 'object') {
              target[key] = {}
            }
            deepMerge(target[key], source[key])
          } else {
            target[key] = source[key]
          }
        }
        return target
      }

      for (const key in response) {
        if (key in mergedSettings) {
          if (typeof response[key] === 'object' && !Array.isArray(response[key])) {
            deepMerge(mergedSettings[key as keyof typeof mergedSettings], response[key])
          } else {
            mergedSettings[key as keyof typeof mergedSettings] = response[key]
          }
        }
      }

      settings.value = JSON.parse(JSON.stringify(mergedSettings))
      Object.assign(originalSettings, JSON.parse(JSON.stringify(mergedSettings)))
      console.log('[loadSettingsFromDrive] Settings loaded and merged with defaults')
      toast.success('Settings loaded from Google Drive', {
        position: toast.POSITION.TOP_RIGHT,
        autoClose: 3000,
      })
    } else {
      console.log('[loadSettingsFromDrive] No settings found, using defaults')
      toast.info('No saved settings found, using defaults', {
        position: toast.POSITION.TOP_RIGHT,
        autoClose: 3000,
      })
    }
  } catch (err) {
    console.error('Error loading settings from Google Drive:', err)
    toast.error('Failed to load settings from Google Drive', {
      position: toast.POSITION.TOP_RIGHT,
      autoClose: 3000,
    })
  } finally {
    isLoadingSettings.value = false
  }
}

async function saveSettingsToDrive() {
  try {
    isSavingSettings.value = true
    const plainSettings = JSON.parse(JSON.stringify(settings.value))
    console.log('[saveSettingsToDrive] Sending settings:', plainSettings)

    await updateFileById(SETTINGS_FILE_ID, plainSettings, false)
    toast.success('Settings saved to Google Drive', {
      position: toast.POSITION.TOP_RIGHT,
      autoClose: 3000,
    })
    return true
  } catch (err) {
    console.error('Error saving settings to Google Drive:', err)
    toast.error('Failed to save settings to Google Drive', {
      position: toast.POSITION.TOP_RIGHT,
      autoClose: 3000,
    })
    return false
  } finally {
    isSavingSettings.value = false
  }
}

watch(
  settings,
  () => {
    settingsModified.value = JSON.stringify(settings.value) !== JSON.stringify(originalSettings)
  },
  { deep: true },
)

const addEmailTag = () => {
  if (!newEmailTag.value) return

  const email = newEmailTag.value.trim()
  if (email && !settings.value.notifications.emails.includes(email) && validateEmail(email)) {
    settings.value.notifications.emails.push(email)
    newEmailTag.value = ''
  } else if (!validateEmail(email)) {
    toast.error('Please enter a valid email address', {
      position: toast.POSITION.TOP_RIGHT,
      autoClose: 3000,
    })
  }
}

const removeEmailTag = (email: string) => {
  const index = settings.value.notifications.emails.indexOf(email)
  if (index !== -1) {
    settings.value.notifications.emails.splice(index, 1)
  }
}

const handleTagKeydown = (event: KeyboardEvent, type: 'email') => {
  if (event.key === 'Enter' || event.key === ' ') {
    event.preventDefault()
    if (type === 'email') {
      addEmailTag()
    }
  }
}

const validateEmail = (email: string) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

const emailsValid = computed(() => {
  return settings.value.notifications.emails.every((email: string) => validateEmail(email))
})

const formValid = computed(() => {
  return emailsValid.value
})

const saveSettings = async () => {
  if (!formValid.value) {
    toast.error('Please correct the validation errors before saving', {
      position: toast.POSITION.TOP_RIGHT,
      autoClose: 3000,
    })
    return
  }

  console.log('[saveSettings] Current settings:', settings.value)

  const savedToDrive = await saveSettingsToDrive()

  if (savedToDrive) {
    Object.assign(originalSettings, JSON.parse(JSON.stringify(settings.value)))
    settingsModified.value = false
  }
}

const resetSettings = async () => {
  if (confirm('Are you sure you want to reset all settings to default values?')) {
    try {
      isResettingSettings.value = true
      settings.value = JSON.parse(JSON.stringify(originalSettings))

      await saveSettingsToDrive()

      toast.info('Settings reset to defaults', {
        position: toast.POSITION.TOP_RIGHT,
        autoClose: 3000,
      })
    } catch (err) {
      console.error('Error resetting settings:', err)
      toast.error('Failed to reset settings', {
        position: toast.POSITION.TOP_RIGHT,
        autoClose: 3000,
      })
    } finally {
      isResettingSettings.value = false
    }
  }
}

const cancelChanges = () => {
  if (settingsModified.value) {
    if (confirm('Discard unsaved changes?')) {
      settings.value = JSON.parse(JSON.stringify(originalSettings))
      settingsModified.value = false
      toast.info('Changes discarded', {
        position: toast.POSITION.TOP_RIGHT,
        autoClose: 3000,
      })
    }
  }
}
</script>

<template>
  <div class="container mx-auto px-4 py-8 relative">
    <div
      v-if="isLoadingSettings"
      class="absolute inset-0 bg-white/70 dark:bg-gray-900/70 flex items-center justify-center z-10"
    >
      <div class="text-center">
        <div
          class="mdi mdi-loading mdi-spin text-4xl text-primary-600 dark:text-primary-500 mb-2"
        ></div>
        <p class="text-gray-700 dark:text-gray-300">Loading settings...</p>
      </div>
    </div>

    <!-- Page Header -->
    <div
      class="mb-8 bg-white dark:bg-gray-900 rounded-xl shadow-md overflow-hidden border border-gray-100 dark:border-gray-700"
    >
      <div class="h-1.5 w-full bg-gradient-to-r from-amber-400 to-amber-600"></div>
      <div class="p-4 sm:p-6">
        <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
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
        <SettingsPanel v-model:settings="settings.general" />
      </div>

      <!-- Notification Settings Tab -->
      <div v-if="activeTab === 'notifications'" class="fade-in">
        <NotificationChannels
          :settings="settings"
          :newEmailTag="newEmailTag"
          :addEmailTag="addEmailTag"
          :removeEmailTag="removeEmailTag"
          :handleTagKeydown="handleTagKeydown"
          :validateEmail="validateEmail"
        />
      </div>

      <!-- Alert Thresholds Tab -->
      <div v-if="activeTab === 'thresholds'" class="fade-in">
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          <ThresholdInputGroup
            id="soil-temp"
            title="Soil Temperature"
            label="temperature"
            icon="mdi-thermometer"
            iconColor="text-amber-600 dark:text-amber-400"
            unit="°C"
            :min="-10"
            :max="100"
            :step="0.1"
            ringClass="focus:ring-amber-500 focus:border-amber-500 dark:focus:ring-amber-500 dark:focus:border-amber-500"
            v-model:modelValue="settings.thresholds.soilTemperature"
          />

          <ThresholdInputGroup
            id="soil-moisture"
            title="Soil Moisture"
            label="moisture level"
            icon="mdi-water"
            iconColor="text-blue-600 dark:text-blue-400"
            unit="%"
            :min="0"
            :max="100"
            :step="1"
            ringClass="focus:ring-blue-500 focus:border-blue-500 dark:focus:ring-blue-500 dark:focus:border-blue-500"
            v-model:modelValue="settings.thresholds.soilMoisture"
          />

          <ThresholdInputGroup
            id="soil-ph"
            title="Soil pH"
            label="pH level"
            icon="mdi-flask"
            iconColor="text-green-600 dark:text-green-400"
            unit="pH"
            :min="0"
            :max="14"
            :step="0.1"
            ringClass="focus:ring-green-500 focus:border-green-500 dark:focus:ring-green-500 dark:focus:border-green-500"
            v-model:modelValue="settings.thresholds.soilPH"
          />

          <ThresholdInputGroup
            id="air-temp"
            title="Air Temperature"
            label="temperature"
            icon="mdi-thermometer-lines"
            iconColor="text-red-600 dark:text-red-400"
            unit="°C"
            :min="-10"
            :max="50"
            :step="0.1"
            ringClass="focus:ring-red-500 focus:border-red-500 dark:focus:ring-red-500 dark:focus:border-red-500"
            v-model:modelValue="settings.thresholds.airTemperature"
          />

          <ThresholdInputGroup
            id="air-humidity"
            title="Air Humidity"
            label="humidity level"
            icon="mdi-water-percent"
            iconColor="text-blue-600 dark:text-blue-400"
            unit="%"
            :min="0"
            :max="100"
            :step="1"
            ringClass="focus:ring-blue-500 focus:border-blue-500 dark:focus:ring-blue-500 dark:focus:border-blue-500"
            v-model:modelValue="settings.thresholds.airHumidity"
          />

          <ThresholdInputGroup
            id="light-intensity"
            title="Light Intensity"
            label="light level"
            icon="mdi-white-balance-sunny"
            iconColor="text-yellow-600 dark:text-yellow-400"
            unit="lux"
            :min="0"
            :max="100000"
            :step="100"
            ringClass="focus:ring-yellow-500 focus:border-yellow-500 dark:focus:ring-yellow-500 dark:focus:border-yellow-500"
            v-model:modelValue="settings.thresholds.lightIntensity"
          />
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
          :disabled="isResettingSettings"
          class="w-full sm:w-auto px-4 py-2 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg transition-colors flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-gray-400 dark:focus:ring-gray-500"
          :class="{ 'opacity-50 cursor-not-allowed': isResettingSettings }"
        >
          <span v-if="isResettingSettings" class="mdi mdi-loading mdi-spin mr-2"></span>
          <span v-else class="mdi mdi-refresh mr-2"></span>
          {{ isResettingSettings ? 'Resetting...' : 'Reset' }}
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
          :disabled="!formValid || isSavingSettings"
          class="w-full sm:w-auto px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900"
          :class="{ 'opacity-50 cursor-not-allowed': !formValid || isSavingSettings }"
        >
          <span v-if="isSavingSettings" class="mdi mdi-loading mdi-spin mr-2"></span>
          <span v-else class="mdi mdi-content-save mr-2"></span>
          {{ isSavingSettings ? 'Saving...' : 'Save Settings' }}
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
