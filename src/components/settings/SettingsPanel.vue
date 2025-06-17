<script setup lang="ts">
import { computed } from 'vue'
import SettingInput from '@/components/settings/SettingInput.vue'
import SettingSelect from '@/components/settings/SettingSelect.vue'

const props = defineProps<{
  settings: {
    dataRefreshInterval: number
    dataRetentionPeriod: number
    timezone: string
    dateFormat: string
    timeFormat: string
  }
}>()

const emit = defineEmits(['update:settings'])

const model = computed({
  get: () => props.settings,
  set: (val) => emit('update:settings', val),
})

const timezoneOptions = [
  { value: 'Asia/Jakarta', label: 'Asia/Jakarta' },
  { value: 'Asia/Singapore', label: 'Asia/Singapore' },
  { value: 'Asia/Japan', label: 'Asia/Japan' },
]

const dateFormatOptions = [
  { value: 'DD-MM-YYYY', label: 'DD-MM-YYYY' },
  { value: 'MM-DD-YYYY', label: 'MM-DD-YYYY' },
  { value: 'YYYY-MM-DD', label: 'YYYY-MM-DD' },
]

const timeFormatOptions = [
  { value: '24h', label: '24-Hour' },
  { value: '12h', label: '12-Hour' },
]
</script>

<template>
  <div>
    <!-- Data Settings -->
    <section
      class="bg-white dark:bg-gray-900 rounded-lg shadow-sm p-5 mb-5 border border-gray-100 dark:border-gray-700"
    >
      <h2 class="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-200 flex items-center">
        <span class="mdi mdi-refresh mr-2 text-primary-600 dark:text-primary-400"></span>
        Data Settings
      </h2>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-5 mb-4">
        <!-- Data Refresh Interval -->
        <SettingInput
          id="data-refresh-interval"
          v-model="model.dataRefreshInterval"
          label="Data Refresh Interval"
          :min="1"
          :max="60"
          suffix="minutes"
          hint="How often to refresh sensor data (1-60 minutes)"
        />

        <!-- Data Retention Period -->
        <SettingInput
          id="data-retention-period"
          v-model="model.dataRetentionPeriod"
          label="Data Retention Period"
          :min="1"
          :max="365"
          suffix="days"
          hint="How long to keep historical data (1-365 days)"
        />
      </div>
    </section>

    <!-- Time & Format Settings -->
    <section
      class="bg-white dark:bg-gray-900 rounded-lg shadow-sm p-5 border border-gray-100 dark:border-gray-700"
    >
      <h2 class="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-200 flex items-center">
        <span class="mdi mdi-clock-outline mr-2 text-primary-600 dark:text-primary-400"></span>
        Time & Format Settings
      </h2>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
        <SettingSelect
          id="timezone-select"
          v-model="model.timezone"
          :options="timezoneOptions"
          label="Timezone"
          hint="Select your local timezone for accurate time display"
        />

        <SettingSelect
          id="date-format-select"
          v-model="model.dateFormat"
          :options="dateFormatOptions"
          label="Date Format"
          hint="Choose how dates are displayed throughout the application"
        />

        <SettingSelect
          id="time-format-select"
          v-model="model.timeFormat"
          :options="timeFormatOptions"
          label="Time Format"
          hint="Choose how time is displayed throughout the application"
        />
      </div>
    </section>
  </div>
</template>
