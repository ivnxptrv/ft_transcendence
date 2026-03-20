import 'vuetify/styles'
import '@mdi/font/css/materialdesignicons.css'
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'

export default createVuetify({
  components,
  directives,
  theme: {
    defaultTheme: 'light',
    themes: {
      light: {
        colors: {
          primary: '#1A1A1A',
          secondary: '#4A4A4A',
          background: '#F5F5F0',
          surface: '#FFFFFF',
          'surface-variant': '#EFEFEA',
          error: '#C0392B',
          success: '#27AE60',
          warning: '#E67E22',
          info: '#2980B9',
          'on-primary': '#FFFFFF',
          'on-background': '#1A1A1A',
          'on-surface': '#1A1A1A',
        },
      },
      dark: {
        colors: {
          primary: '#E8E8E3',
          secondary: '#A0A09B',
          background: '#141414',
          surface: '#1E1E1E',
          'surface-variant': '#2A2A2A',
          error: '#E74C3C',
          success: '#2ECC71',
          warning: '#F39C12',
          info: '#3498DB',
          'on-primary': '#141414',
          'on-background': '#E8E8E3',
          'on-surface': '#E8E8E3',
        },
      },
    },
  },
  locale: {
    locale: 'en',
    rtl: {
      ar: true,
    },
  },
  defaults: {
    VBtn: { rounded: 'lg' },
    VTextField: { variant: 'outlined', density: 'comfortable' },
    VCard: { rounded: 'lg' },
  },
})