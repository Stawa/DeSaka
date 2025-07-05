<template>
  <div class="space-y-6">
    <!-- Data Settings Card -->
    <div
      class="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-2xl border border-gray-200/50 dark:border-gray-700/50 shadow-lg overflow-hidden"
    >
      <!-- Gradient accent bar -->
      <div class="h-1 bg-gradient-to-br from-blue-500 to-cyan-500 text-white"></div>

      <div class="p-6">
        <!-- Section header -->
        <div class="flex items-center gap-3 mb-6">
          <div
            class="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center shadow-md"
          >
            <span
              class="mdi mdi-database text-white text-lg"
              style="text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5)"
            ></span>
          </div>
          <div>
            <h2 class="text-xl font-semibold text-gray-900 dark:text-white">Data Management</h2>
            <p class="text-gray-600 dark:text-gray-400 text-sm">
              Configure data refresh and retention settings
            </p>
          </div>
        </div>

        <!-- Settings grid -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <SettingInput
            id="data-refresh-interval"
            v-model="model.dataRefreshInterval"
            label="Refresh Interval"
            :min="1"
            :max="60"
            suffix="minutes"
            hint="How often to refresh sensor data"
            :show-step-buttons="true"
            :show-progress="true"
          />

          <SettingInput
            id="data-retention-period"
            v-model="model.dataRetentionPeriod"
            label="Retention Period"
            :min="1"
            :max="365"
            suffix="days"
            hint="How long to keep historical data"
            :show-step-buttons="true"
            :show-progress="true"
          />
        </div>
      </div>
    </div>

    <!-- Time & Format Settings Card -->
    <div
      class="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-2xl border border-gray-200/50 dark:border-gray-700/50 shadow-lg overflow-hidden"
    >
      <!-- Gradient accent bar -->
      <div class="h-1 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500"></div>

      <div class="p-6">
        <!-- Section header -->
        <div class="flex items-center gap-3 mb-6">
          <div
            class="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center shadow-lg"
          >
            <span
              class="mdi mdi-clock-outline text-white text-lg"
              style="text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5)"
            ></span>
          </div>
          <div>
            <h2 class="text-xl font-semibold text-gray-900 dark:text-white">Time & Format</h2>
            <p class="text-gray-600 dark:text-gray-400 text-sm">
              Customize time zone and display formats
            </p>
          </div>
        </div>

        <!-- Settings grid -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <SettingSelect
            id="timezone-select"
            v-model="model.timezone"
            :options="timezoneOptions"
            label="Timezone"
            hint="Select your local timezone"
            :show-selected-info="true"
          />

          <SettingSelect
            id="date-format-select"
            v-model="model.dateFormat"
            :options="dateFormatOptions"
            label="Date Format"
            hint="Choose date display format"
            :show-selected-info="true"
          />

          <SettingSelect
            id="time-format-select"
            v-model="model.timeFormat"
            :options="timeFormatOptions"
            label="Time Format"
            hint="Choose time display format"
            :show-selected-info="true"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import SettingInput from './SettingInput.vue'
import SettingSelect from './SettingSelect.vue'

const props = defineProps({
  settings: {
    type: Object,
    required: true,
  },
})

const emit = defineEmits(['update:settings'])

const model = computed({
  get: () => props.settings,
  set: (val) => emit('update:settings', val),
})

const timezoneOptions = [
  {
    value: 'Asia/Jakarta',
    label: 'Asia/Jakarta (WIB)',
    description: 'Western Indonesia Time',
  },
  {
    value: 'Asia/Singapore',
    label: 'Asia/Singapore (SGT)',
    description: 'Singapore Standard Time',
  },
  {
    value: 'Asia/Tokyo',
    label: 'Asia/Tokyo (JST)',
    description: 'Japan Standard Time',
  },
  {
    value: 'UTC',
    label: 'UTC',
    description: 'Coordinated Universal Time',
  },
]

const dateFormatOptions = [
  { value: 'DD-MM-YYYY', label: 'DD-MM-YYYY', description: '05-07-2025' },
  { value: 'MM-DD-YYYY', label: 'MM-DD-YYYY', description: '12-31-2024' },
  { value: 'YYYY-MM-DD', label: 'YYYY-MM-DD', description: '2024-12-31' },
  { value: 'DD/MM/YYYY', label: 'DD/MM/YYYY', description: '31/12/2024' },
]

const timeFormatOptions = [
  { value: '24h', label: '24-Hour (23:59)', description: '23:59' },
  { value: '12h', label: '12-Hour (11:59 PM)', description: '11:59 PM' },
]
</script>
