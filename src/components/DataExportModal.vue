<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import { onClickOutside } from '@vueuse/core'
import type { HistoricalDataType } from '@/composables/responseApi'

const props = defineProps<{
  show: boolean
  title?: string
  description?: string
  dataType?: 'dashboard' | 'soil' | 'air' | 'history'
  availableSensors?: Array<{ id: string; name: string; unit: string }>
  dateRange?: { start: string; end: string }
  sensorData?: HistoricalDataType
}>()

const emit = defineEmits(['close', 'export'])

const modalRef = ref<HTMLElement | null>(null)
const isOpen = ref(false)
const exportFormat = ref('csv')
const selectedSensors = ref<string[]>([])
const customDateRange = ref({
  start:
    props.dateRange?.start ||
    new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  end: props.dateRange?.end || new Date().toISOString().split('T')[0],
})
const timeRange = ref('7d')
const isExporting = ref(false)
const searchQuery = ref('')

onClickOutside(modalRef, () => {
  if (isOpen.value && !isExporting.value) {
    closeModal()
  }
})

const filteredSensors = computed(() => {
  if (!props.availableSensors) return []
  if (!searchQuery.value.trim()) return props.availableSensors

  const query = searchQuery.value.toLowerCase()
  return props.availableSensors.filter(
    (sensor) =>
      sensor.name.toLowerCase().includes(query) || sensor.unit.toLowerCase().includes(query),
  )
})

const selectedSensorsCount = computed(() => selectedSensors.value.length)
const totalSensorsCount = computed(() => props.availableSensors?.length || 0)
const hasSelectedAllSensors = computed(
  () => selectedSensorsCount.value === totalSensorsCount.value && totalSensorsCount.value > 0,
)

const estimatedRecords = computed(() => {
  if (props.sensorData && selectedSensors.value.length > 0) {
    return selectedSensors.value.reduce((total, sensorId) => {
      const history = props.sensorData?.[sensorId] || []
      return total + history.length
    }, 0)
  }

  const msInDay = 1000 * 60 * 60 * 24
  const daysDiff =
    Math.ceil(
      (new Date(customDateRange.value.end).getTime() -
        new Date(customDateRange.value.start).getTime()) /
        msInDay,
    ) + 1

  const recordsPerDay = (24 * 60) / 5
  return Math.round(daysDiff * selectedSensorsCount.value * recordsPerDay)
})

watch(
  () => props.show,
  (newVal) => {
    isOpen.value = newVal
    if (newVal && props.availableSensors) {
      selectedSensors.value = props.availableSensors.map((sensor) => sensor.id)
      searchQuery.value = ''
    }
  },
)

watch(
  () => props.dateRange,
  (newVal) => {
    if (newVal) {
      customDateRange.value = { ...newVal }
    }
  },
)

const setTimeRange = (range: string) => {
  timeRange.value = range
  const now = new Date()
  const end = now.toISOString().split('T')[0]
  let start = end

  switch (range) {
    case '1d':
      start = end
      break
    case '7d':
      start = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      break
    case '30d':
      start = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate())
        .toISOString()
        .split('T')[0]
      break
    case '90d':
      start = new Date(now.getFullYear(), now.getMonth() - 3, now.getDate())
        .toISOString()
        .split('T')[0]
      break
    case '1y':
      start = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate())
        .toISOString()
        .split('T')[0]
      break
  }

  customDateRange.value = { start, end }
}

const toggleSensor = (sensorId: string) => {
  const index = selectedSensors.value.indexOf(sensorId)
  if (index === -1) {
    selectedSensors.value.push(sensorId)
  } else {
    selectedSensors.value.splice(index, 1)
  }
}

const selectAllSensors = () => {
  if (props.availableSensors) {
    selectedSensors.value = props.availableSensors.map((sensor) => sensor.id)
  }
}

const deselectAllSensors = () => {
  selectedSensors.value = []
}

const handleExport = async () => {
  isExporting.value = true

  try {
    const exportData: Record<string, { timestamp: string; value: number }[]> = {}

    if (props.sensorData) {
      const startDate = new Date(customDateRange.value.start + 'T00:00:00').getTime()
      const endDate = new Date(customDateRange.value.end + 'T23:59:59').getTime()

      selectedSensors.value.forEach((sensorId) => {
        const history = props.sensorData?.[sensorId] || []
        exportData[sensorId] = history
          .filter((point) => {
            const ts = Date.parse(point.time)
            return ts >= startDate && ts <= endDate
          })
          .sort((a, b) => Date.parse(a.time) - Date.parse(b.time))
          .map((point) => ({
            timestamp: point.time,
            value: point.value,
          }))
      })
    }

    console.log('Export Data:', exportData)

    const sensorInfo: Record<string, { name: string; unit: string }> = {}
    props.availableSensors?.forEach((s) => {
      sensorInfo[s.id] = { name: s.name, unit: s.unit }
    })

    emit('export', {
      format: exportFormat.value,
      dateRange: customDateRange.value,
      sensors: selectedSensors.value,
      dataType: props.dataType,
      exportData,
      sensorInfo,
    })

    emit('close')
  } catch (error) {
    console.error('Export failed:', error)
  } finally {
    isExporting.value = false
  }
}

const closeModal = () => {
  if (!isExporting.value) {
    emit('close')
  }
}

const getFormatIcon = (format: string) => {
  switch (format) {
    case 'csv':
      return 'mdi-file-delimited'
    case 'json':
      return 'mdi-code-json'
    case 'excel':
      return 'mdi-microsoft-excel'
    default:
      return 'mdi-file-export'
  }
}

const getFormatDescription = (format: string) => {
  switch (format) {
    case 'csv':
      return 'Comma-separated values'
    case 'json':
      return 'JavaScript Object Notation'
    case 'excel':
      return 'Microsoft Excel format'
    default:
      return ''
  }
}
</script>

<template>
  <Transition
    enter-active-class="transition duration-300 ease-out"
    enter-from-class="opacity-0 scale-95"
    enter-to-class="opacity-100 scale-100"
    leave-active-class="transition duration-200 ease-in"
    leave-from-class="opacity-100 scale-100"
    leave-to-class="opacity-0 scale-95"
  >
    <div v-if="isOpen" class="fixed inset-0 z-50 overflow-y-auto">
      <!-- Backdrop with blur effect -->
      <Transition
        enter-active-class="transition-opacity duration-300"
        enter-from-class="opacity-0"
        enter-to-class="opacity-100"
        leave-active-class="transition-opacity duration-200"
        leave-from-class="opacity-100"
        leave-to-class="opacity-0"
      >
        <!-- eslint-disable-next-line vue/require-toggle-inside-transition -->
        <div class="fixed inset-0 bg-black/50 backdrop-blur-sm" @click="closeModal"></div>
      </Transition>

      <!-- Modal Dialog -->
      <div class="flex items-center justify-center min-h-screen p-4">
        <div
          ref="modalRef"
          class="relative bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full mx-auto overflow-hidden border border-gray-200 dark:border-gray-700 max-w-screen-lg md:max-w-3xl sm:max-w-xl"
        >
          <!-- Colored Header Bar -->
          <div class="h-1.5 w-full bg-gradient-to-r from-primary-400 to-primary-600"></div>

          <!-- Header -->
          <div class="p-5 sm:p-6 border-b border-gray-200 dark:border-gray-700">
            <div class="flex items-start">
              <div
                class="flex-shrink-0 bg-primary-100 dark:bg-primary-900/30 px-3.5 py-2.5 rounded-lg mr-4"
              >
                <span
                  class="mdi mdi-download text-primary-600 dark:text-primary-400 text-2xl"
                ></span>
              </div>
              <div class="flex-1">
                <h2 class="text-xl font-bold text-gray-800 dark:text-gray-100">
                  {{ title || 'Export Data' }}
                </h2>
                <p class="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  {{ description || 'Select options to export your data' }}
                </p>
              </div>
              <button
                @click="closeModal"
                class="text-gray-400 hover:text-gray-500 dark:text-gray-500 dark:hover:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 rounded-full p-1"
                :disabled="isExporting"
              >
                <span class="mdi mdi-close text-xl"></span>
              </button>
            </div>
          </div>

          <!-- Content -->
          <div class="p-5 sm:p-6 max-h-[calc(100vh-200px)] overflow-y-auto">
            <!-- Two-column layout for larger screens, single column for mobile -->
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <!-- Left column -->
              <div>
                <!-- Date Range Selection -->
                <div class="mb-6">
                  <h3
                    class="text-base font-medium text-gray-800 dark:text-gray-200 mb-3 flex items-center"
                  >
                    <span class="mdi mdi-calendar-range mr-2 text-primary-500"></span>
                    Date Range
                  </h3>

                  <!-- Quick Date Range Buttons -->
                  <div class="flex flex-wrap gap-2 mb-4 overflow-x-auto pb-1">
                    <button
                      v-for="(label, range) in {
                        '1d': 'Today',
                        '7d': 'Last 7 Days',
                        '30d': 'Last 30 Days',
                        '90d': 'Last 90 Days',
                        '1y': 'Last Year',
                      }"
                      :key="range"
                      @click="setTimeRange(range)"
                      class="px-3 py-1.5 rounded-lg text-sm font-medium transition-colors flex-shrink-0"
                      :class="{
                        'bg-primary-500 text-white shadow-sm': timeRange === range,
                        'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600':
                          timeRange !== range,
                      }"
                    >
                      {{ label }}
                    </button>
                  </div>

                  <!-- Custom Date Range Inputs -->
                  <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label
                        for="export-start-date"
                        class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                        >Start Date</label
                      >
                      <div class="relative">
                        <span
                          class="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-500 dark:text-gray-400"
                        >
                          <span class="mdi mdi-calendar text-lg"></span>
                        </span>
                        <input
                          id="export-start-date"
                          type="date"
                          v-model="customDateRange.start"
                          class="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                        />
                      </div>
                    </div>
                    <div>
                      <label
                        for="export-end-date"
                        class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                        >End Date</label
                      >
                      <div class="relative">
                        <span
                          class="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-500 dark:text-gray-400"
                        >
                          <span class="mdi mdi-calendar text-lg"></span>
                        </span>
                        <input
                          id="export-end-date"
                          type="date"
                          v-model="customDateRange.end"
                          class="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Export Format Selection -->
                <div class="mb-6">
                  <h3
                    class="text-base font-medium text-gray-800 dark:text-gray-200 mb-3 flex items-center"
                  >
                    <span class="mdi mdi-file-export mr-2 text-primary-500"></span>
                    Export Format
                  </h3>

                  <div class="flex flex-wrap gap-3">
                    <label
                      v-for="format in ['csv', 'json', 'excel']"
                      :key="format"
                      class="flex items-center space-x-2 p-3 rounded-lg border cursor-pointer transition-colors flex-grow sm:flex-grow-0"
                      :class="{
                        'bg-primary-50 dark:bg-primary-900/20 border-primary-200 dark:border-primary-700 shadow-sm':
                          exportFormat === format,
                        'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800':
                          exportFormat !== format,
                      }"
                    >
                      <input
                        type="radio"
                        name="exportFormat"
                        :value="format"
                        v-model="exportFormat"
                        class="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300"
                      />
                      <div>
                        <div
                          class="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center"
                        >
                          <span :class="`mdi ${getFormatIcon(format)} text-lg mr-1.5`"></span>
                          {{ format.toUpperCase() }}
                        </div>
                        <div class="text-xs text-gray-500 dark:text-gray-400">
                          {{ getFormatDescription(format) }}
                        </div>
                      </div>
                    </label>
                  </div>
                </div>
              </div>

              <!-- Right column -->
              <div>
                <!-- Sensor Selection -->
                <div v-if="availableSensors && availableSensors.length > 0" class="mb-6">
                  <div class="flex justify-between items-center mb-3">
                    <h3
                      class="text-base font-medium text-gray-800 dark:text-gray-200 flex items-center"
                    >
                      <span class="mdi mdi-tune mr-2 text-primary-500"></span>
                      Select Sensors
                    </h3>
                    <div class="flex gap-2">
                      <button
                        @click="selectAllSensors"
                        class="text-xs px-2 py-1 text-primary-600 dark:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded transition-colors"
                        :class="{ 'opacity-50 cursor-not-allowed': hasSelectedAllSensors }"
                        :disabled="hasSelectedAllSensors"
                      >
                        Select All
                      </button>
                      <button
                        @click="deselectAllSensors"
                        class="text-xs px-2 py-1 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
                        :class="{ 'opacity-50 cursor-not-allowed': selectedSensorsCount === 0 }"
                        :disabled="selectedSensorsCount === 0"
                      >
                        Deselect All
                      </button>
                    </div>
                  </div>

                  <!-- Search input -->
                  <div class="relative mb-3">
                    <span
                      class="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-500 dark:text-gray-400"
                    >
                      <span class="mdi mdi-magnify text-lg"></span>
                    </span>
                    <input
                      type="text"
                      v-model="searchQuery"
                      placeholder="Search sensors..."
                      class="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    />
                  </div>

                  <!-- Selected count indicator -->
                  <div class="text-xs text-gray-600 dark:text-gray-400 mb-2">
                    {{ selectedSensorsCount }} of {{ totalSensorsCount }} sensors selected
                  </div>

                  <div
                    class="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-[300px] lg:max-h-[400px] overflow-y-auto p-1 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50"
                  >
                    <div
                      v-for="sensor in filteredSensors"
                      :key="sensor.id"
                      class="flex items-center space-x-2 p-2 rounded-lg transition-colors cursor-pointer"
                      :class="{
                        'bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-700 shadow-sm':
                          selectedSensors.includes(sensor.id),
                        'hover:bg-gray-100 dark:hover:bg-gray-800 border border-transparent':
                          !selectedSensors.includes(sensor.id),
                      }"
                      @click="toggleSensor(sensor.id)"
                    >
                      <div class="flex-shrink-0">
                        <div
                          class="w-4 h-4 rounded border flex items-center justify-center"
                          :class="{
                            'bg-primary-500 border-primary-500': selectedSensors.includes(
                              sensor.id,
                            ),
                            'border-gray-300 dark:border-gray-600': !selectedSensors.includes(
                              sensor.id,
                            ),
                          }"
                        >
                          <span
                            v-if="selectedSensors.includes(sensor.id)"
                            class="mdi mdi-check text-white text-xs"
                          ></span>
                        </div>
                      </div>
                      <div class="flex-grow">
                        <div class="text-sm font-medium text-gray-700 dark:text-gray-300">
                          {{ sensor.name }}
                        </div>
                        <div class="text-xs text-gray-500 dark:text-gray-400">
                          {{ sensor.unit }}
                        </div>
                      </div>
                    </div>

                    <div
                      v-if="filteredSensors.length === 0"
                      class="col-span-full p-4 text-center text-gray-500 dark:text-gray-400 text-sm"
                    >
                      No sensors match your search
                    </div>
                  </div>
                </div>

                <!-- Export Preview (Desktop Only) -->
                <div
                  class="hidden lg:block mb-6 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700"
                >
                  <h3
                    class="text-base font-medium text-gray-800 dark:text-gray-200 mb-2 flex items-center"
                  >
                    <span class="mdi mdi-information-outline mr-2 text-primary-500"></span>
                    Export Summary
                  </h3>
                  <ul class="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                    <li class="flex items-center">
                      <span
                        class="mdi mdi-calendar-check mr-2 text-gray-500 dark:text-gray-400"
                      ></span>
                      <span
                        >Date range: {{ customDateRange.start }} to {{ customDateRange.end }}</span
                      >
                    </li>
                    <li class="flex items-center">
                      <span class="mdi mdi-tune mr-2 text-gray-500 dark:text-gray-400"></span>
                      <span>{{ selectedSensorsCount }} sensors selected</span>
                    </li>
                    <li class="flex items-center">
                      <span class="mdi mdi-database mr-2 text-gray-500 dark:text-gray-400"></span>
                      <span>Approximately {{ estimatedRecords.toLocaleString() }} data points</span>
                    </li>
                    <li class="flex items-center">
                      <span
                        :class="`mdi ${getFormatIcon(exportFormat)} mr-2 text-gray-500 dark:text-gray-400`"
                      ></span>
                      <span>{{ exportFormat.toUpperCase() }} format</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            <!-- Export Preview (Mobile & Tablet Only) - Moved to bottom -->
            <div
              class="lg:hidden mt-2 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700"
            >
              <h3
                class="text-base font-medium text-gray-800 dark:text-gray-200 mb-2 flex items-center"
              >
                <span class="mdi mdi-information-outline mr-2 text-primary-500"></span>
                Export Summary
              </h3>
              <ul class="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                <li class="flex items-center">
                  <span class="mdi mdi-calendar-check mr-2 text-gray-500 dark:text-gray-400"></span>
                  <span>Date range: {{ customDateRange.start }} to {{ customDateRange.end }}</span>
                </li>
                <li class="flex items-center">
                  <span class="mdi mdi-tune mr-2 text-gray-500 dark:text-gray-400"></span>
                  <span>{{ selectedSensorsCount }} sensors selected</span>
                </li>
                <li class="flex items-center">
                  <span class="mdi mdi-database mr-2 text-gray-500 dark:text-gray-400"></span>
                  <span>Approximately {{ estimatedRecords.toLocaleString() }} data points</span>
                </li>
                <li class="flex items-center">
                  <span
                    :class="`mdi ${getFormatIcon(exportFormat)} mr-2 text-gray-500 dark:text-gray-400`"
                  ></span>
                  <span>{{ exportFormat.toUpperCase() }} format</span>
                </li>
              </ul>
            </div>
          </div>

          <!-- Footer -->
          <div
            class="bg-gray-50 dark:bg-gray-800/50 px-5 py-4 sm:px-6 flex flex-wrap justify-end gap-3 border-t border-gray-200 dark:border-gray-700"
          >
            <button
              @click="closeModal"
              class="px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 dark:focus:ring-offset-gray-900 transition-colors"
              :disabled="isExporting"
            >
              Cancel
            </button>
            <button
              @click="handleExport"
              class="px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 dark:focus:ring-offset-gray-900 transition-colors flex items-center min-w-[120px] justify-center"
              :disabled="selectedSensors.length === 0 || isExporting"
              :class="{ 'opacity-75 cursor-wait': isExporting }"
            >
              <template v-if="isExporting">
                <svg
                  class="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                  xmlns="http://www.w3.org/2000/svg"
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
                Exporting...
              </template>
              <template v-else>
                <span class="mdi mdi-download mr-1.5"></span>
                Export Data
              </template>
            </button>
          </div>
        </div>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
/* Dark mode calendar icon inversion */
.dark input[type='date']::-webkit-calendar-picker-indicator {
  filter: invert(1);
}

/* Custom scrollbar for sensor list */
.overflow-y-auto {
  scrollbar-width: thin;
  scrollbar-color: rgba(156, 163, 175, 0.5) transparent;
}

.overflow-y-auto::-webkit-scrollbar {
  width: 6px;
}

.overflow-y-auto::-webkit-scrollbar-track {
  background: transparent;
}

.overflow-y-auto::-webkit-scrollbar-thumb {
  background-color: rgba(156, 163, 175, 0.5);
  border-radius: 20px;
}

.dark .overflow-y-auto::-webkit-scrollbar-thumb {
  background-color: rgba(75, 85, 99, 0.5);
}

.transition-colors {
  transition-property: background-color, border-color, color, fill, stroke;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 150ms;
}

@media (max-width: 640px) {
  .flex-wrap {
    justify-content: center;
  }

  .justify-end {
    justify-content: center;
  }
}
</style>
