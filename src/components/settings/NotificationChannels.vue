<template>
  <div
    class="bg-white dark:bg-gray-900 rounded-xl shadow-md p-6 border border-gray-100 dark:border-gray-700 transition-all duration-300"
  >
    <div class="flex items-center mb-6">
      <div class="bg-primary-100 dark:bg-primary-900/30 p-3 rounded-lg mr-4">
        <span class="mdi mdi-bell-outline text-2xl text-primary-600 dark:text-primary-400"></span>
      </div>
      <div>
        <h2 class="text-2xl font-semibold text-gray-800 dark:text-gray-200">Notification Channels</h2>
        <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">Configure how you want to receive alerts</p>
      </div>
    </div>

    <div class="space-y-6">
      <!-- Email -->
      <NotificationItem
        icon="mdi-email-outline"
        label="Email Notifications"
        description="Receive alerts via email when thresholds are exceeded"
        v-model:enabled="settings.notifications.emailEnabled"
      >
        <template #extra>
          <div>
            <label for="notification-email" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Add email recipients
            </label>
            <div class="relative">
              <span class="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-500 dark:text-gray-400">
                <span class="mdi mdi-email-outline"></span>
              </span>
              <input
                id="notification-email"
                v-model="newEmailTag"
                @keydown="handleTagKeydown($event, 'email')"
                type="email"
                placeholder="Enter email address"
                class="block w-full pl-10 pr-12 py-3 bg-white dark:bg-gray-800 border rounded-lg transition-all duration-200 focus:ring-4 text-gray-700 dark:text-gray-300"
                :class="emailInputClasses"
              />
              <button
                @click="addEmailTag"
                type="button"
                class="absolute right-2 top-1/2 transform -translate-y-1/2 bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 hover:bg-primary-200 dark:hover:bg-primary-800/50 p-2 rounded-lg transition-colors duration-200"
                :disabled="!newEmailTag || !validateEmail(newEmailTag)"
                :class="{'opacity-50 cursor-not-allowed': !newEmailTag || !validateEmail(newEmailTag)}"
              >
                <span class="mdi mdi-plus text-lg"></span>
              </button>
            </div>
            <p
              v-if="newEmailTag && !validateEmail(newEmailTag)"
              class="mt-2 text-sm text-red-600 dark:text-red-400 flex items-center animate-pulse"
            >
              <span class="mdi mdi-alert-circle mr-1"></span>
              Please enter a valid email address
            </p>
            
            <div class="mt-4">
              <transition-group 
                name="email-list" 
                tag="div" 
                class="flex flex-wrap gap-2"
              >
                <div
                  v-for="(email, index) in settings.notifications.emails"
                  :key="email"
                  class="group inline-flex items-center bg-primary-50 dark:bg-primary-900/20 text-primary-800 dark:text-primary-300 px-3 py-2 rounded-lg text-sm border border-primary-100 dark:border-primary-800 transition-all duration-200 hover:bg-primary-100 dark:hover:bg-primary-900/30"
                >
                  <span class="mdi mdi-email-outline mr-2"></span>
                  <span>{{ email }}</span>
                  <button
                    @click="removeEmailTag(email)"
                    type="button"
                    class="ml-2 text-primary-400 hover:text-red-500 dark:text-primary-500 dark:hover:text-red-400 focus:outline-none transition-colors duration-200"
                    aria-label="Remove email"
                  >
                    <span class="mdi mdi-close-circle"></span>
                  </button>
                </div>
                <div 
                  v-if="settings.notifications.emails.length === 0" 
                  class="text-sm text-gray-500 dark:text-gray-400 italic py-2"
                >
                  No email recipients added yet
                </div>
              </transition-group>
            </div>
          </div>
        </template>
      </NotificationItem>

      <!-- WhatsApp -->
      <NotificationItem
        icon="mdi-whatsapp"
        label="WhatsApp Notifications"
        description="Receive instant alerts via WhatsApp when thresholds are exceeded"
        v-model:enabled="settings.notifications.smsEnabled"
      />

      <!-- Push -->
      <NotificationItem
        icon="mdi-cellphone-message"
        label="Push Notifications"
        description="Receive alerts directly on your device through browser notifications"
        v-model:enabled="settings.notifications.pushEnabled"
      />
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
  if (!newEmailTag.value) return baseEmailClass.value
  if (showDuplicateError.value) return errorEmailClass.value
  return validateEmail(newEmailTag.value) ? baseEmailClass.value : errorEmailClass.value
})

const baseEmailClass = ref(
  'border-gray-300 dark:border-gray-600 focus:ring-primary-500 focus:border-primary-500 dark:focus:ring-primary-500 dark:focus:border-primary-500',
)

const errorEmailClass = ref(
  'border-red-300 dark:border-red-600 focus:ring-red-500 focus:border-red-500 dark:focus:ring-red-500 dark:focus:border-red-500',
)

// Reset duplicate error when email input changes
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
  
  // Check for duplicate
  if (settings.notifications.emails.includes(email)) {
    showDuplicateError.value = true
    return
  }
  
  isAdding.value = true
  
  // Add with slight delay for better UX
  setTimeout(() => {
    settings.notifications.emails.push(email)
    newEmailTag.value = ''
    isAdding.value = false
  }, 300)
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
  transition: all 0.3s ease;
}

.email-list-enter-from {
  opacity: 0;
  transform: translateY(20px);
}

.email-list-leave-to {
  opacity: 0;
  transform: translateX(20px);
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.7;
  }
}

.animate-pulse {
  animation: pulse 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}
</style>
