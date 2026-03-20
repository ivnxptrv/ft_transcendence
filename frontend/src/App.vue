<template>
  <router-view />
  <AppToast />
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import AppToast from '@/components/common/AppToast.vue'
import { useThemeStore } from '@/stores/theme'

const themeStore = useThemeStore()

onMounted(() => {
  themeStore.initTheme()
})
</script>