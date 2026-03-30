import { ref } from 'vue'

interface Toast {
  id: number
  message: string
  type: 'success' | 'error' | 'info' | 'warning'
  visible: boolean
}

const toasts = ref<Toast[]>([])
let counter = 0

function addToast(message: string, type: Toast['type']) {
  const id = counter++
  toasts.value.push({ id, message, type, visible: true })
  setTimeout(() => removeToast(id), 3500)
}

function removeToast(id: number) {
  const toast = toasts.value.find((t) => t.id === id)
  if (toast) toast.visible = false
  setTimeout(() => {
    toasts.value = toasts.value.filter((t) => t.id !== id)
  }, 300)
}

export const toast = {
  success: (message: string) => addToast(message, 'success'),
  error: (message: string) => addToast(message, 'error'),
  info: (message: string) => addToast(message, 'info'),
  warning: (message: string) => addToast(message, 'warning'),
}

export function useToast() {
  return { toasts, removeToast }
}