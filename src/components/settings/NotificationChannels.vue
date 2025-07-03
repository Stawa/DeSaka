<template>
  <div
    class="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm"
  >
    <!-- Header -->
    <div class="px-4 sm:px-6 py-4 sm:py-5 border-b border-gray-100 dark:border-gray-800">
      <div class="flex items-center gap-3">
        <div
          class="w-8 h-8 bg-blue-50 dark:bg-blue-900/30 rounded-lg flex items-center justify-center flex-shrink-0"
        >
          <span class="mdi mdi-bell-outline text-blue-600 dark:text-blue-400"></span>
        </div>
        <div class="min-w-0">
          <h2 class="text-lg font-semibold text-gray-900 dark:text-gray-100 truncate">
            Notifications
          </h2>
          <p class="text-sm text-gray-500 dark:text-gray-400 truncate">
            Configure your alert preferences
          </p>
        </div>
      </div>
    </div>

    <!-- Notification Items -->
    <div class="divide-y divide-gray-100 dark:divide-gray-800">
      <!-- Email -->
      <div class="p-4 sm:p-6">
        <NotificationItem
          icon="mdi-email-outline"
          label="Email"
          description="Get alerts via email"
          v-model:enabled="settings.notifications.emailEnabled"
        >
          <template #extra>
            <div class="mt-4 space-y-4">
              <!-- Email Input -->
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Recipients
                </label>
                <div class="flex flex-col sm:flex-row gap-2">
                  <div class="flex-1 relative">
                    <input
                      v-model="newEmailTag"
                      @keydown="handleTagKeydown($event, 'email')"
                      type="email"
                      placeholder="Enter email address"
                      class="w-full px-3 py-2 text-sm bg-white dark:bg-gray-800 border rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 dark:focus:border-blue-400 text-gray-900 dark:text-gray-100 placeholder-gray-400 transition-all duration-200"
                      :class="emailInputClasses"
                    />
                    <div
                      v-if="newEmailTag && !validateEmail(newEmailTag)"
                      class="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none"
                    >
                      <span class="mdi mdi-alert-circle text-red-400"></span>
                    </div>
                  </div>
                  <button
                    @click="addEmailTag"
                    type="button"
                    class="px-4 py-2 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white text-sm font-medium rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                    :disabled="!newEmailTag || !validateEmail(newEmailTag)"
                  >
                    Add
                  </button>
                </div>

                <!-- Error Messages -->
                <div
                  v-if="newEmailTag && !validateEmail(newEmailTag)"
                  class="mt-2 text-xs text-red-600 dark:text-red-400"
                >
                  Please enter a valid email address
                </div>
                <div
                  v-if="showDuplicateError"
                  class="mt-2 text-xs text-amber-600 dark:text-amber-400"
                >
                  Email already added
                </div>
              </div>

              <!-- Email List -->
              <div>
                <div v-if="settings.notifications.emails.length > 0" class="space-y-2">
                  <transition-group name="email-list" tag="div" class="space-y-2">
                    <div
                      v-for="email in settings.notifications.emails"
                      :key="email"
                      class="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-100 dark:border-gray-700 group"
                    >
                      <div class="flex items-center gap-2 min-w-0">
                        <span class="mdi mdi-email-outline text-gray-400 flex-shrink-0"></span>
                        <span class="text-sm text-gray-900 dark:text-gray-100 truncate">{{
                          email
                        }}</span>
                      </div>
                      <button
                        @click="removeEmailTag(email)"
                        type="button"
                        class="p-1 text-gray-400 hover:text-red-500 dark:hover:text-red-400 rounded transition-colors duration-200 opacity-0 group-hover:opacity-100 focus:opacity-100 flex-shrink-0"
                        aria-label="Remove email"
                      >
                        <span class="mdi mdi-close"></span>
                      </button>
                    </div>
                  </transition-group>
                </div>

                <div
                  v-else
                  class="p-4 text-center text-sm text-gray-400 bg-gray-50 dark:bg-gray-800 rounded-lg border-2 border-dashed border-gray-200 dark:border-gray-700"
                >
                  No recipients added
                </div>
              </div>
            </div>
          </template>
        </NotificationItem>
      </div>

      <!-- WhatsApp -->
      <div class="p-4 sm:p-6">
        <NotificationItem
          icon="mdi-whatsapp"
          label="WhatsApp"
          description="Instant alerts via WhatsApp"
          v-model:enabled="settings.notifications.smsEnabled"
        />
      </div>

      <!-- Push -->
      <div class="p-4 sm:p-6">
        <NotificationItem
          icon="mdi-cellphone-message"
          label="Push Notifications"
          description="Browser push alerts"
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
const showDuplicateError = ref(false)

const emailInputClasses = computed(() => {
  if (!newEmailTag.value) return 'border-gray-300 dark:border-gray-600'
  if (showDuplicateError.value) return 'border-amber-300 dark:border-amber-500'
  return validateEmail(newEmailTag.value)
    ? 'border-gray-300 dark:border-gray-600'
    : 'border-red-300 dark:border-red-500'
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
  transition: all 0.25s ease;
}

.email-list-enter-from {
  opacity: 0;
  transform: translateY(-8px);
}

.email-list-leave-to {
  opacity: 0;
  transform: translateX(16px);
}

.email-list-move {
  transition: transform 0.25s ease;
}
</style>
