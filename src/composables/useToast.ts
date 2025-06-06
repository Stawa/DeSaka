import { ref } from 'vue'

export function useToast() {
  const toast = ref({
    show: false,
    message: '',
    type: 'success', // success, error, info, warning
    timeout: 3000,
  })

  const showToast = (message: string, type = 'success', timeout = 3000) => {
    toast.value = {
      show: true,
      message,
      type,
      timeout,
    }

    setTimeout(() => {
      toast.value.show = false
    }, timeout)
  }

  return {
    toast,
    showToast,
  }
}
