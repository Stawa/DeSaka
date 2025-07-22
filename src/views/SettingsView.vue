<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { toast } from 'vue3-toastify'
import { useApi } from '@/composables/useApi'
import SettingsPanel from '@/components/settings/SettingsPanel.vue'
import ThresholdInputGroup from '@/components/settings/ThresholdInputGroup.vue'
import NotificationChannels from '@/components/settings/NotificationChannels.vue'
import 'vue3-toastify/dist/index.css'
import type { Settings } from '@/composables/responseApi'

const activeTab = ref('general')
const setActiveTab = (tab: string) => {
  activeTab.value = tab
}

const settingsModified = ref(false)
const isLoadingSettings = ref(false)
const isSavingSettings = ref(false)
const isResettingSettings = ref(false)

const { fetchSettings, updateSettings } = useApi()

const newEmailTag = ref('')

const originalSettings: Settings = {
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
    phones: [],
  },
  thresholds: {
    soilTemperature: { min: 10, max: 30 },
    soilMoisture: { min: 20, max: 80 },
    soilPH: { min: 5.5, max: 7.5 },
    airTemperature: { min: 18, max: 30 },
    airHumidity: { min: 30, max: 70 },
  },
}

const settings = ref<Settings>(structuredClone(originalSettings))

const tabs = [
  {
    id: 'general',
    name: 'General',
    icon: 'mdi-tune',
    description: 'System preferences and data settings',
  },
  {
    id: 'notifications',
    name: 'Notifications',
    icon: 'mdi-bell-outline',
    description: 'Alert channels and preferences',
  },
  {
    id: 'thresholds',
    name: 'Thresholds',
    icon: 'mdi-alert-circle-outline',
    description: 'Sensor alert thresholds',
  },
]

function deepMerge<T>(target: T, source: Partial<T>): T {
  for (const key of Object.keys(source) as (keyof T)[]) {
    const sourceValue = source[key]
    const targetValue = target[key]
    if (
      sourceValue &&
      typeof sourceValue === 'object' &&
      !Array.isArray(sourceValue) &&
      targetValue &&
      typeof targetValue === 'object' &&
      !Array.isArray(targetValue)
    ) {
      deepMerge(targetValue, sourceValue)
    } else if (sourceValue !== undefined) {
      target[key] = sourceValue as T[keyof T]
    }
  }
  return target
}

onMounted(async () => {
  await loadSettings()
})

async function loadSettings() {
  try {
    isLoadingSettings.value = true
    const response: Partial<Settings> = await fetchSettings()

    if (response && Object.keys(response).length > 0) {
      const mergedSettings: Settings = JSON.parse(JSON.stringify(originalSettings))
      deepMerge(mergedSettings, response)

      settings.value = JSON.parse(JSON.stringify(mergedSettings))
      Object.assign(originalSettings, JSON.parse(JSON.stringify(mergedSettings)))

      toast.success('Settings loaded successfully', {
        position: toast.POSITION.TOP_RIGHT,
        autoClose: 3000,
      })
    } else {
      toast.info('Using default settings', {
        position: toast.POSITION.TOP_RIGHT,
        autoClose: 3000,
      })
    }
  } catch (err) {
    console.error('Error loading settings:', err)
    toast.error('Failed to load settings', {
      position: toast.POSITION.TOP_RIGHT,
      autoClose: 3000,
    })
  } finally {
    isLoadingSettings.value = false
  }
}

async function saveSettings() {
  if (!formValid.value) {
    toast.error('Please correct the validation errors before saving', {
      position: toast.POSITION.TOP_RIGHT,
      autoClose: 3000,
    })
    return false
  }

  try {
    isSavingSettings.value = true
    await updateSettings(JSON.parse(JSON.stringify(settings.value)))

    Object.assign(originalSettings, JSON.parse(JSON.stringify(settings.value)))
    settingsModified.value = false

    toast.success('Settings saved successfully', {
      position: toast.POSITION.TOP_RIGHT,
      autoClose: 3000,
    })
    return true
  } catch (err) {
    console.error('Error saving settings:', err)
    toast.error('Failed to save settings', {
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
  const email = newEmailTag.value.trim()
  if (!email) return

  if (validateEmail(email) && !settings.value.notifications.emails.includes(email)) {
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

const handleTagKeydown = (event: KeyboardEvent) => {
  if (event.key === 'Enter' || event.key === ' ') {
    event.preventDefault()
    addEmailTag()
  }
}

const validateEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)

const emailsValid = computed(() => settings.value.notifications.emails.every(validateEmail))
const formValid = computed(() => emailsValid.value)

const handleSaveSettings = async () => {
  if (!formValid.value) {
    toast.error('Please correct the validation errors before saving', {
      position: toast.POSITION.TOP_RIGHT,
      autoClose: 3000,
    })
    return
  }

  if (await saveSettings()) {
    // Settings are already updated in the saveSettings function
    settingsModified.value = false
  }
}

const resetSettings = async () => {
  if (confirm('Are you sure you want to reset all settings to default values?')) {
    try {
      isResettingSettings.value = true
      settings.value = structuredClone(originalSettings)
      await saveSettings()

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
  if (settingsModified.value && confirm('Discard unsaved changes?')) {
    settings.value = structuredClone(originalSettings)
    settingsModified.value = false
    toast.info('Changes discarded', {
      position: toast.POSITION.TOP_RIGHT,
      autoClose: 3000,
    })
  }
}
</script>

<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-950">
    <div class="mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8">
      <!-- Loading Overlay -->
      <div
        v-if="isLoadingSettings"
        class="fixed inset-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm flex items-center justify-center z-50"
      >
        <div
          class="bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl rounded-2xl border border-gray-200/60 dark:border-gray-800/60 shadow-xl p-8 text-center"
        >
          <div
            class="w-12 h-12 border-4 border-gray-200 dark:border-gray-700 border-t-emerald-500 rounded-full animate-spin mx-auto mb-4"
          ></div>
          <h3 class="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
            Loading Settings
          </h3>
          <p class="text-sm text-gray-600 dark:text-gray-400">
            Fetching your configuration from the cloud...
          </p>
        </div>
      </div>

      <!-- Header Section -->
      <div
        class="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-2xl border border-gray-200/60 dark:border-gray-800/60 shadow-sm overflow-hidden"
      >
        <!-- Accent bar -->
        <div class="h-1 bg-gradient-to-r from-emerald-500 to-teal-600"></div>

        <div class="p-6">
          <div class="flex items-center gap-4">
            <div class="relative">
              <div
                class="w-14 h-14 bg-gradient-to-br from-emerald-100 to-emerald-50 dark:from-emerald-900/30 dark:to-emerald-800/20 rounded-2xl flex items-center justify-center ring-1 ring-emerald-200/50 dark:ring-emerald-700/30"
              >
                <svg
                  class="w-7 h-7 text-emerald-600 dark:text-emerald-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  stroke-width="1.5"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z"
                  />
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
              </div>
              <!-- Subtle glow effect -->
              <div class="absolute inset-0 bg-emerald-500/20 rounded-2xl blur-xl opacity-30"></div>
            </div>

            <div>
              <h1
                class="text-2xl lg:text-3xl font-semibold text-gray-900 dark:text-gray-100 tracking-tight"
              >
                System Settings
              </h1>
              <p class="text-gray-600 dark:text-gray-400 mt-1 text-base">
                Configure your environmental monitoring preferences and thresholds
              </p>
            </div>
          </div>

          <!-- Status indicators -->
          <div
            class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pt-6 mt-6 border-t border-gray-200 dark:border-gray-700"
          >
            <div class="flex items-center gap-6 text-sm">
              <div class="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                <div
                  class="w-2 h-2 rounded-full"
                  :class="settingsModified ? 'bg-amber-500 animate-pulse' : 'bg-emerald-500'"
                ></div>
                <span>{{ settingsModified ? 'Unsaved changes' : 'All changes saved' }}</span>
              </div>
            </div>

            <div class="flex items-center gap-3">
              <div class="text-xs text-gray-500 dark:text-gray-400">
                Last updated: {{ new Date().toLocaleTimeString() }}
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Tab Navigation -->
      <div
        class="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-2xl border border-gray-200/60 dark:border-gray-800/60 shadow-sm overflow-hidden"
      >
        <div class="p-2">
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <button
              v-for="tab in tabs"
              :key="tab.id"
              @click="setActiveTab(tab.id)"
              class="group relative p-4 rounded-xl transition-all duration-200 text-left"
              :class="[
                activeTab === tab.id
                  ? 'bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 text-emerald-700 dark:text-emerald-300 shadow-sm border border-emerald-200/50 dark:border-emerald-700/50'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800/50 hover:text-gray-900 dark:hover:text-gray-100',
              ]"
            >
              <div class="flex items-start gap-3">
                <div
                  class="w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-200"
                  :class="[
                    activeTab === tab.id
                      ? 'bg-emerald-100/80 dark:bg-emerald-900/40 ring-1 ring-emerald-200/50 dark:ring-emerald-700/30'
                      : 'bg-gray-100 dark:bg-gray-800 group-hover:bg-gray-200 dark:group-hover:bg-gray-700',
                  ]"
                >
                  <span
                    :class="[
                      'mdi text-lg transition-colors duration-200',
                      tab.icon,
                      activeTab === tab.id
                        ? 'text-emerald-600 dark:text-emerald-400'
                        : 'text-gray-500 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-300',
                    ]"
                  ></span>
                </div>
                <div class="min-w-0 flex-1">
                  <h3 class="font-semibold text-sm mb-1">{{ tab.name }}</h3>
                  <p class="text-xs opacity-75 leading-relaxed">
                    {{ tab.description }}
                  </p>
                </div>
              </div>

              <!-- Active indicator -->
              <div
                v-if="activeTab === tab.id"
                class="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-gradient-to-b from-emerald-500 to-teal-600 rounded-r-full"
              ></div>
            </button>
          </div>
        </div>
      </div>

      <!-- Tab Content -->
      <div class="space-y-6">
        <!-- General Settings Tab -->
        <div v-if="activeTab === 'general'" class="animate-fade-in">
          <SettingsPanel v-model:settings="settings.general" />
        </div>

        <!-- Notification Settings Tab -->
        <div v-if="activeTab === 'notifications'" class="animate-fade-in">
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
        <div v-if="activeTab === 'thresholds'" class="animate-fade-in">
          <div
            class="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-2xl border border-gray-200/60 dark:border-gray-800/60 shadow-sm overflow-hidden"
          >
            <!-- Accent bar -->
            <div class="h-1 bg-gradient-to-r from-emerald-500 to-teal-600"></div>

            <div class="p-6">
              <div class="flex items-center gap-3 mb-6">
                <div
                  class="w-12 h-12 bg-gradient-to-br from-amber-100 to-amber-50 dark:from-amber-900/30 dark:to-amber-800/20 rounded-xl flex items-center justify-center ring-1 ring-amber-200/50 dark:ring-amber-700/30"
                >
                  <svg
                    class="w-6 h-6 text-amber-600 dark:text-amber-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                    />
                  </svg>
                </div>
                <div>
                  <h2 class="text-xl font-semibold text-gray-900 dark:text-gray-100">
                    Alert Thresholds
                  </h2>
                  <p class="text-sm text-gray-600 dark:text-gray-400 mt-0.5">
                    Configure sensor alert ranges for optimal plant health monitoring
                  </p>
                </div>
              </div>

              <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <ThresholdInputGroup
                  id="soil-temp"
                  title="Soil Temperature"
                  label="temperature"
                  icon="mdi-thermometer"
                  iconColor="bg-amber-100/80 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400"
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
                  iconColor="bg-blue-100/80 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400"
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
                  iconColor="bg-green-100/80 dark:bg-green-900/40 text-green-600 dark:text-green-400"
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
                  iconColor="bg-red-100/80 dark:bg-red-900/40 text-red-600 dark:text-red-400"
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
                  iconColor="bg-blue-100/80 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400"
                  unit="%"
                  :min="0"
                  :max="100"
                  :step="1"
                  ringClass="focus:ring-blue-500 focus:border-blue-500 dark:focus:ring-blue-500 dark:focus:border-blue-500"
                  v-model:modelValue="settings.thresholds.airHumidity"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Actions Section -->
      <div
        class="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-2xl border border-gray-200/60 dark:border-gray-800/60 shadow-sm overflow-hidden"
      >
        <div class="p-6">
          <div class="flex flex-col sm:flex-row justify-between items-center gap-4">
            <!-- Left Actions -->
            <div class="flex items-center gap-3 w-full sm:w-auto order-2 sm:order-1">
              <!-- Reset Button -->
              <button
                @click="resetSettings"
                :disabled="isResettingSettings"
                class="flex-1 sm:flex-none inline-flex items-center justify-center px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-gray-400 dark:hover:border-gray-500 transition-all duration-200 shadow-sm hover:shadow-md"
                :class="{ 'opacity-50 cursor-not-allowed': isResettingSettings }"
              >
                <svg
                  v-if="isResettingSettings"
                  class="w-4 h-4 mr-2 animate-spin"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    class="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    stroke-width="4"
                  ></circle>
                  <path
                    class="opacity-75"
                    fill="currentColor"
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  ></path>
                </svg>
                <svg
                  v-else
                  class="w-4 h-4 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  />
                </svg>
                {{ isResettingSettings ? 'Resetting...' : 'Reset to Defaults' }}
              </button>

              <!-- Cancel Button (only shown when modified) -->
              <button
                v-if="settingsModified"
                @click="cancelChanges"
                class="flex-1 sm:flex-none inline-flex items-center justify-center px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-gray-400 dark:hover:border-gray-500 transition-all duration-200 shadow-sm hover:shadow-md"
              >
                <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
                Discard Changes
              </button>
            </div>

            <!-- Right Actions -->
            <div class="flex items-center gap-4 w-full sm:w-auto order-1 sm:order-2">
              <!-- Unsaved Changes Indicator -->
              <div
                v-if="settingsModified"
                class="hidden sm:flex items-center text-sm text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/30 px-3 py-2 rounded-lg border border-amber-200 dark:border-amber-700/50"
              >
                <div class="w-2 h-2 bg-amber-500 rounded-full mr-2 animate-pulse"></div>
                Unsaved changes
              </div>

              <!-- Save Button -->
              <button
                @click="handleSaveSettings"
                :disabled="!formValid || isSavingSettings"
                class="flex-1 sm:flex-none inline-flex items-center justify-center px-6 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-emerald-600 to-teal-600 rounded-xl shadow-lg shadow-emerald-500/25 hover:from-emerald-700 hover:to-teal-700 hover:shadow-xl hover:shadow-emerald-500/30 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-gray-900 transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98]"
                :class="{
                  'opacity-60 cursor-not-allowed transform-none hover:scale-100':
                    !formValid || isSavingSettings,
                }"
              >
                <svg
                  v-if="isSavingSettings"
                  class="w-4 h-4 mr-2 animate-spin"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    class="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    stroke-width="4"
                  ></circle>
                  <path
                    class="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                <svg
                  v-else
                  class="w-4 h-4 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                {{ isSavingSettings ? 'Saving...' : 'Save Settings' }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Modern animations and transitions */
.animate-fade-in {
  animation: fadeIn 0.6s ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Smooth transitions for all interactive elements */
* {
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

/* Focus states for accessibility */
button:focus,
a:focus {
  outline: 2px solid theme('colors.emerald.500');
  outline-offset: 2px;
}

/* Custom scrollbar styling */
::-webkit-scrollbar {
  width: 8px;
}

::-webkit-scrollbar-track {
  background: theme('colors.gray.100');
}

::-webkit-scrollbar-thumb {
  background: theme('colors.gray.400');
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: theme('colors.gray.500');
}

/* Dark mode scrollbar */
.dark ::-webkit-scrollbar-track {
  background: theme('colors.gray.800');
}

.dark ::-webkit-scrollbar-thumb {
  background: theme('colors.gray.600');
}

.dark ::-webkit-scrollbar-thumb:hover {
  background: theme('colors.gray.500');
}

/* Reduced motion for accessibility */
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}

/* High contrast mode support */
@media (prefers-contrast: high) {
  .border {
    border-width: 2px;
  }
}

/* Print styles */
@media print {
  .no-print {
    display: none !important;
  }

  * {
    background: white !important;
    color: black !important;
    box-shadow: none !important;
  }
}
</style>
