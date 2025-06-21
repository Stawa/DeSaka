<template>
  <div class="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
    <!-- Header -->
    <div class="px-6 py-5 border-b border-gray-100 dark:border-gray-800">
      <div class="flex items-center space-x-3">
        <div
          class="flex-shrink-0 w-10 h-10 bg-blue-50 dark:bg-blue-900/30 rounded-lg flex items-center justify-center"
        >
          <span class="mdi mdi-bell-outline text-lg text-blue-600 dark:text-blue-400"></span>
        </div>
        <div>
          <h2 class="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Notification Channels
          </h2>
          <p class="text-sm text-gray-600 dark:text-gray-400">
            Configure how you want to receive alerts
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
          description="Receive alerts via email when thresholds are exceeded"
          v-model:enabled="settings.notifications.emailEnabled"
        >
          <template #extra>
            <div class="space-y-4">
              <!-- Email Input -->
              <div>
                <label
                  for="notification-email"
                  class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                >
                  Email recipients
                </label>
                <div class="flex space-x-2">
                  <div class="flex-1 relative">
                    <div
                      class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"
                    >
                      <span class="mdi mdi-email-outline text-gray-400"></span>
                    </div>
                    <input
                      id="notification-email"
                      v-model="newEmailTag"
                      @keydown="handleTagKeydown($event, 'email')"
                      type="email"
                      placeholder="Enter email address"
                      class="block w-full pl-10 pr-3 py-2.5 text-sm bg-white dark:bg-gray-800 border rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 dark:focus:border-blue-400 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 transition-colors duration-200"
                      :class="emailInputClasses"
                    />
                  </div>
                  <button
                    @click="addEmailTag"
                    type="button"
                    class="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white text-sm font-medium rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    :disabled="!newEmailTag || !validateEmail(newEmailTag)"
                  >
                    Add
                  </button>
                </div>

                <!-- Error Message -->
                <div
                  v-if="newEmailTag && !validateEmail(newEmailTag)"
                  class="mt-2 flex items-center text-sm text-red-600 dark:text-red-400"
                >
                  <span class="mdi mdi-alert-circle-outline mr-1.5"></span>
                  Please enter a valid email address
                </div>

                <div
                  v-if="showDuplicateError"
                  class="mt-2 flex items-center text-sm text-amber-600 dark:text-amber-400"
                >
                  <span class="mdi mdi-alert-outline mr-1.5"></span>
                  This email is already added
                </div>
              </div>

              <!-- Email List -->
              <div>
                <div v-if="settings.notifications.emails.length > 0" class="space-y-2">
                  <transition-group name="email-list" tag="div" class="space-y-2">
                    <div
                      v-for="(email, index) in settings.notifications.emails"
                      :key="email"
                      class="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700"
                    >
                      <div class="flex items-center space-x-3">
                        <span class="mdi mdi-email-outline text-gray-500 dark:text-gray-400"></span>
                        <span class="text-sm text-gray-900 dark:text-gray-100">{{ email }}</span>
                      </div>
                      <button
                        @click="removeEmailTag(email)"
                        type="button"
                        class="p-1 text-gray-400 hover:text-red-500 dark:hover:text-red-400 rounded transition-colors duration-200"
                        aria-label="Remove email"
                      >
                        <span class="mdi mdi-close text-lg"></span>
                      </button>
                    </div>
                  </transition-group>
                </div>

                <div
                  v-else
                  class="p-4 text-center text-sm text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 rounded-lg border-2 border-dashed border-gray-200 dark:border-gray-700"
                >
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
          description="Receive instant alerts via WhatsApp when thresholds are exceeded"
          v-model:enabled="settings.notifications.smsEnabled"
        />
      </div>

      <!-- Push -->
      <div class="p-6">
        <NotificationItem
          icon="mdi-cellphone-message"
          label="Push Notifications"
          description="Enable push notifications to receive alerts"
          v-model:enabled="settings.notifications.pushEnabled"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import NotificationItem from './NotificationItem.vue'

defineProps({ settings: Object })
defineEmits(['update:settings'])

const newEmailTag = ref('')
const isAdding = ref(false)
const showDuplicateError = ref(false)

const emailInputClasses = computed(() => {
  if (!newEmailTag.value) return 'border-gray-300 dark:border-gray-600'
  if (showDuplicateError.value) return 'border-amber-300 dark:border-amber-600'
  return validateEmail(newEmailTag.value)
    ? 'border-gray-300 dark:border-gray-600'
    : 'border-red-300 dark:border-red-600'
})

watch(newEmailTag, () => {
  if (showDuplicateError.value) {
    showDuplicateError.value = false
  }
})

function validateEmail(email) {
  if (!email) return false
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())
}

function addEmailTag() {
  const email = newEmailTag.value.trim()

  if (!email || !validateEmail(email)) return

  if (settings.notifications.emails.includes(email)) {
    showDuplicateError.value = true
    return
  }

  settings.notifications.emails.push(email)
  newEmailTag.value = ''
}

function removeEmailTag(email) {
  settings.notifications.emails = settings.notifications.emails.filter((e) => e !== email)
}

function handleTagKeydown(e, type) {
  if (e.key === 'Enter' && type === 'email') {
    e.preventDefault()
    addEmailTag()
  } else if (e.key === 'Escape') {
    e.preventDefault()
    newEmailTag.value = ''
  }
}
</script>

<style scoped>
.email-list-enter-active,
.email-list-leave-active {
  transition: all 0.2s ease;
}

.email-list-enter-from {
  opacity: 0;
  transform: translateY(-10px);
}

.email-list-leave-to {
  opacity: 0;
  transform: translateX(10px);
}
</style>
