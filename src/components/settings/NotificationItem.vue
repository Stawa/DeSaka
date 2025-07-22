<template>
  <div class="group">
    <div class="flex items-start justify-between gap-6">
      <div class="flex items-start gap-4 min-w-0 flex-1">
        <div
          class="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 transition-all duration-200 shadow-lg group-hover:scale-105"
          :class="
            modelValue
              ? 'bg-gradient-to-br from-emerald-500 to-teal-600 ring-2 ring-emerald-200 dark:ring-emerald-800'
              : 'bg-gray-100 dark:bg-gray-800 ring-2 ring-gray-200 dark:ring-gray-700'
          "
        >
          <span
            :class="[
              'mdi',
              icon,
              'text-xl transition-colors duration-200',
              modelValue ? 'text-white' : 'text-gray-400 dark:text-gray-500',
            ]"
          ></span>
        </div>

        <div class="min-w-0 flex-1">
          <div class="flex items-center gap-3 mb-2">
            <h3 class="font-semibold text-gray-900 dark:text-gray-100 text-base">
              {{ label }}
            </h3>
            <div class="flex items-center gap-1">
              <div
                :class="[
                  'w-2 h-2 rounded-full transition-colors duration-200',
                  modelValue ? 'bg-emerald-500 animate-pulse' : 'bg-gray-400',
                ]"
              ></div>
              <span
                :class="[
                  'text-xs font-medium',
                  modelValue
                    ? 'text-emerald-600 dark:text-emerald-400'
                    : 'text-gray-500 dark:text-gray-400',
                ]"
              >
                {{ modelValue ? 'Active' : 'Inactive' }}
              </span>
            </div>
          </div>
          <p class="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
            {{ description }}
          </p>
        </div>
      </div>

      <div class="flex-shrink-0">
        <label class="relative inline-flex items-center cursor-pointer group/toggle">
          <span class="sr-only">Toggle {{ label }}</span>
          <!-- ✅ Bind to modelValue only -->
          <input type="checkbox" class="sr-only peer" v-model="modelValue" />
          <div
            class="w-12 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-emerald-500/20 rounded-full peer dark:bg-gray-700 peer-checked:bg-gradient-to-r peer-checked:from-emerald-500 peer-checked:to-teal-600 transition-all duration-300 group-hover/toggle:shadow-lg"
          ></div>
          <div
            class="absolute top-0.5 left-0.5 bg-white rounded-full h-5 w-5 peer-checked:translate-x-6 rtl:peer-checked:-translate-x-6 transition-transform duration-300 shadow-md group-hover/toggle:shadow-lg flex items-center justify-center"
          >
            <span
              :class="[
                'mdi text-xs transition-all duration-200',
                modelValue ? 'mdi-check text-emerald-600' : 'mdi-close text-gray-400',
              ]"
            ></span>
          </div>
        </label>
      </div>
    </div>

    <div
      v-if="$slots.extra && modelValue"
      class="mt-6 pt-6 border-t border-gray-100 dark:border-gray-800 transition-all duration-300"
    >
      <slot name="extra" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  icon: string
  label: string
  description: string
  enabled: boolean
}>()

const emit = defineEmits<{
  (e: 'update:enabled', value: boolean): void
}>()

const modelValue = computed({
  get: () => props.enabled,
  set: (val) => emit('update:enabled', val),
})
</script>
