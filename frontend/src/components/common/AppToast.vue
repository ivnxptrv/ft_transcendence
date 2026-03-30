<template>
  <div class="toast-container">
    <v-snackbar
      v-for="toast in toasts"
      :key="toast.id"
      v-model="toast.visible"
      :color="toastColor(toast.type)"
      location="bottom right"
      :timeout="-1"
      rounded="lg"
      elevation="4"
    >
      <div class="d-flex align-center ga-2">
        <v-icon size="18">{{ toastIcon(toast.type) }}</v-icon>
        <span class="text-body-2 font-weight-medium">{{ toast.message }}</span>
      </div>

      <template #actions>
        <v-btn
          icon="mdi-close"
          size="x-small"
          variant="text"
          @click="removeToast(toast.id)"
        />
      </template>
    </v-snackbar>
  </div>
</template>

<script setup lang="ts">
import { useToast } from '@/composables/useToast'

const { toasts, removeToast } = useToast()

function toastColor(type: string) {
  const map: Record<string, string> = {
    success: 'success',
    error: 'error',
    info: 'primary',
    warning: 'warning',
  }
  return map[type] ?? 'primary'
}

function toastIcon(type: string) {
  const map: Record<string, string> = {
    success: 'mdi-check-circle-outline',
    error: 'mdi-alert-circle-outline',
    info: 'mdi-information-outline',
    warning: 'mdi-alert-outline',
  }
  return map[type] ?? 'mdi-information-outline'
}
</script>