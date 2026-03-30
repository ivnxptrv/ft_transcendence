import { defineStore } from 'pinia'
import { ref } from 'vue'
import { useTheme, useLocale } from 'vuetify'
import { useI18n } from 'vue-i18n'

export const useThemeStore = defineStore('theme', () => {
  const isDark = ref(localStorage.getItem('theme') === 'dark')
  const currentLocale = ref(localStorage.getItem('locale') ?? 'en')

  const theme = useTheme()
  const { isRtl } = useLocale()
  const { locale: i18nLocale } = useI18n()

  function toggleTheme() {
    isDark.value = !isDark.value
    theme.global.name.value = isDark.value ? 'dark' : 'light'
    localStorage.setItem('theme', isDark.value ? 'dark' : 'light')
  }

  function setLocale(locale: string) {
    currentLocale.value = locale
    i18nLocale.value = locale
    isRtl.value = locale === 'ar'
    localStorage.setItem('locale', locale)
  }

  function initTheme() {
    theme.global.name.value = isDark.value ? 'dark' : 'light'
    isRtl.value = currentLocale.value === 'ar'
    i18nLocale.value = currentLocale.value
  }

  return { isDark, currentLocale, toggleTheme, setLocale, initTheme }
})