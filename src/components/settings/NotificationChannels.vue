<template>
  <div
    class="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-2xl border border-gray-200/50 dark:border-gray-700/50 shadow-lg overflow-hidden"
  >
    <!-- Gradient accent bar -->
    <div class="h-1 bg-gradient-to-r from-sky-400 via-cyan-400 to-sky-500"></div>

    <!-- Header -->
    <div class="px-6 py-6 border-b border-gray-100 dark:border-gray-800">
      <div class="flex items-center gap-4">
        <div
          class="w-12 h-12 bg-gradient-to-br from-sky-400 via-cyan-400 to-sky-500 rounded-2xl flex items-center justify-center shadow-lg"
        >
          <span
            class="mdi mdi-bell-ring text-white text-xl"
            style="text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5)"
          ></span>
        </div>
        <div class="min-w-0 flex-1">
          <h2 class="text-xl font-semibold text-gray-900 dark:text-gray-100">
            Notification Channels
          </h2>
          <p class="text-sm text-gray-600 dark:text-gray-400">
            Configure your alert preferences and delivery methods
          </p>
        </div>
      </div>
    </div>

    <!-- Notification Items -->
    <div class="divide-y divide-gray-100 dark:divide-gray-800">
      <!-- Email -->
      <div class="p-6">
        <NotificationItem
          icon="mdi-email-outline"
          label="Email Notifications"
          description="Receive alerts and updates via email"
          v-model:enabled="emailEnabled"
        >
          <template #extra>
            <div class="mt-6 space-y-6">
              <!-- Email Input -->
              <div>
                <label
                  for="email-recipients"
                  class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3"
                >
                  Email Recipients
                </label>
                <div class="flex flex-col sm:flex-row gap-3">
                  <div class="flex-1 relative">
                    <input
                      id="email-recipients"
                      :value="props.newEmailTag"
                      @input="
                        ($event) =>
                          emit('update:newEmailTag', ($event.target as HTMLInputElement).value)
                      "
                      @keydown="props.handleTagKeydown($event)"
                      type="email"
                      placeholder="Enter email address"
                      class="w-full px-4 py-3 text-sm bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-xl focus:ring-0 focus:border-emerald-500 dark:focus:border-emerald-400 text-gray-900 dark:text-gray-100 placeholder-gray-400 transition-all duration-200 shadow-sm hover:shadow-md focus:shadow-lg"
                      :class="emailInputClasses"
                    />
                    <div
                      v-if="props.newEmailTag && !props.validateEmail(props.newEmailTag)"
                      class="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none"
                    >
                      <span class="mdi mdi-alert-circle text-red-400"></span>
                    </div>
                  </div>
                  <button
                    @click="() => props.addEmailTag()"
                    type="button"
                    class="px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white text-sm font-semibold rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95"
                    :disabled="!props.newEmailTag || !props.validateEmail(props.newEmailTag)"
                  >
                    <span class="flex items-center gap-2">
                      <span class="mdi mdi-plus"></span>
                      Add Email
                    </span>
                  </button>
                </div>

                <!-- Error Messages -->
                <div class="mt-3 min-h-[1.25rem]">
                  <div
                    v-if="props.newEmailTag && !props.validateEmail(props.newEmailTag)"
                    class="text-xs text-red-600 dark:text-red-400 flex items-center gap-1"
                  >
                    <span class="mdi mdi-alert-circle"></span>
                    Please enter a valid email address
                  </div>
                  <div
                    v-if="showDuplicateError"
                    class="text-xs text-amber-600 dark:text-amber-400 flex items-center gap-1"
                  >
                    <span class="mdi mdi-alert"></span>
                    Email already added
                  </div>
                </div>
              </div>

              <!-- Email List -->
              <div>
                <div v-if="emails.length > 0" class="space-y-3">
                  <div class="flex items-center justify-between mb-3">
                    <span class="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Recipients ({{ emails.length }})
                    </span>
                  </div>
                  <transition-group name="email-list" tag="div" class="space-y-3">
                    <div
                      v-for="email in emails"
                      :key="email"
                      class="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 rounded-xl border border-gray-200 dark:border-gray-600 group hover:shadow-md transition-all duration-200"
                    >
                      <div class="flex items-center gap-3 min-w-0 flex-1">
                        <div
                          class="w-8 h-8 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg flex items-center justify-center flex-shrink-0"
                        >
                          <span
                            class="mdi mdi-email-outline text-emerald-600 dark:text-emerald-400"
                          ></span>
                        </div>
                        <span
                          class="text-sm font-medium text-gray-900 dark:text-gray-100 truncate"
                          >{{ email }}</span
                        >
                      </div>
                      <button
                        @click="props.removeEmailTag(email)"
                        type="button"
                        class="p-2 text-gray-400 hover:text-red-500 dark:hover:text-red-400 rounded-lg transition-colors duration-200 opacity-0 group-hover:opacity-100 focus:opacity-100 flex-shrink-0 hover:bg-red-50 dark:hover:bg-red-900/20"
                        aria-label="Remove email"
                      >
                        <span class="mdi mdi-close text-lg"></span>
                      </button>
                    </div>
                  </transition-group>
                </div>

                <div
                  v-else
                  class="p-6 text-center text-sm text-gray-400 bg-gray-50 dark:bg-gray-800 rounded-xl border-2 border-dashed border-gray-200 dark:border-gray-700"
                >
                  <span class="mdi mdi-email-plus-outline text-2xl mb-2 block"></span>
                  No email recipients added yet
                </div>
              </div>
            </div>
          </template>
        </NotificationItem>
      </div>

      <!-- WhatsApp -->
      <div class="p-6">
        <NotificationItem
          icon="mdi-whatsapp"
          label="WhatsApp Notifications"
          description="Instant alerts via WhatsApp messaging"
          v-model:enabled="smsEnabled"
        />
      </div>

      <!-- Push -->
      <div class="p-6">
        <NotificationItem
          icon="mdi-cellphone-message"
          label="Push Notifications"
          description="Real-time browser notifications"
          v-model:enabled="pushEnabled"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import NotificationItem from './NotificationItem.vue'

const props = defineProps({
  settings: {
    type: Object as () => {
      notifications: {
        emailEnabled: boolean
        smsEnabled: boolean
        pushEnabled: boolean
        emails: string[]
      }
    },
    required: true,
  },
  newEmailTag: {
    type: String,
    default: '',
  },
  validateEmail: {
    type: Function,
    required: true,
  },
  addEmailTag: {
    type: Function,
    required: true,
  },
  removeEmailTag: {
    type: Function,
    required: true,
  },
  handleTagKeydown: {
    type: Function,
    required: true,
  },
})

const emit = defineEmits(['update:settings', 'update:newEmailTag'])

const showDuplicateError = ref(false)

const emailInputClasses = computed(() => {
  if (!props.newEmailTag) return ''
  if (showDuplicateError.value)
    return 'border-amber-300 dark:border-amber-500 focus:border-amber-500 dark:focus:border-amber-400'
  return props.validateEmail(props.newEmailTag)
    ? 'border-emerald-300 dark:border-emerald-600 focus:border-emerald-500 dark:focus:border-emerald-400'
    : 'border-red-300 dark:border-red-500 focus:border-red-500 dark:focus:border-red-400'
})

watch(
  () => props.newEmailTag,
  () => {
    if (showDuplicateError.value) {
      showDuplicateError.value = false
    }
  },
)

const emailEnabled = computed({
  get: () => props.settings.notifications.emailEnabled,
  set: (val: boolean) => {
    emit('update:settings', {
      ...props.settings,
      notifications: {
        ...props.settings.notifications,
        emailEnabled: val,
      },
    })
  },
})

const smsEnabled = computed({
  get: () => props.settings.notifications.smsEnabled,
  set: (val: boolean) => {
    emit('update:settings', {
      ...props.settings,
      notifications: {
        ...props.settings.notifications,
        smsEnabled: val,
      },
    })
  },
})

const pushEnabled = computed({
  get: () => props.settings.notifications.pushEnabled,
  set: (val: boolean) => {
    emit('update:settings', {
      ...props.settings,
      notifications: {
        ...props.settings.notifications,
        pushEnabled: val,
      },
    })
  },
})

const emails = computed(() => props.settings.notifications.emails)
</script>

<style scoped>
.email-list-enter-active,
.email-list-leave-active {
  transition: all 0.3s ease;
}
.email-list-enter-from {
  opacity: 0;
  transform: translateY(-10px) scale(0.95);
}
.email-list-leave-to {
  opacity: 0;
  transform: translateX(20px) scale(0.95);
}
.email-list-move {
  transition: transform 0.3s ease;
}
</style>
