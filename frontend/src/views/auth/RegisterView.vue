<template>
  <v-app>
    <v-main>
      <v-container fluid class="fill-height">
        <v-row class="fill-height" no-gutters>
          <v-col cols="12" md="6" class="d-none d-md-flex">
            <div class="auth-banner fill-height w-100 d-flex flex-column justify-center align-center pa-12">
              <div class="text-center">
                <h1 class="text-h2 font-weight-bold mb-4">Vekko</h1>
                <p class="text-h6 text-medium-emphasis">
                  Connect with expert service providers through AI-powered matching
                </p>
              </div>
            </div>
          </v-col>

          <v-col cols="12" md="6" class="d-flex align-center justify-center pa-6">
            <v-card flat width="100%" max-width="440">
              <v-card-text class="pa-8">
                <div class="mb-8">
                  <h2 class="text-h4 font-weight-bold mb-1">{{ t('auth.registerTitle') }}</h2>
                  <p class="text-body-1 text-medium-emphasis">{{ t('auth.registerSubtitle') }}</p>
                </div>

                <v-form ref="formRef" @submit.prevent="handleRegister">
                  <v-row>
                    <v-col cols="6" class="pe-2">
                      <v-text-field
                        v-model="form.firstName"
                        :label="t('auth.firstName')"
                        prepend-inner-icon="mdi-account-outline"
                        :rules="[rules.required]"
                      />
                    </v-col>
                    <v-col cols="6" class="ps-2">
                      <v-text-field
                        v-model="form.lastName"
                        :label="t('auth.lastName')"
                        :rules="[rules.required]"
                      />
                    </v-col>
                  </v-row>

                  <v-text-field
                    v-model="form.email"
                    :label="t('auth.email')"
                    type="email"
                    prepend-inner-icon="mdi-email-outline"
                    :rules="[rules.required, rules.email]"
                    class="mb-2"
                  />

                  <v-text-field
                    v-model="form.password"
                    :label="t('auth.password')"
                    :type="showPassword ? 'text' : 'password'"
                    prepend-inner-icon="mdi-lock-outline"
                    :append-inner-icon="showPassword ? 'mdi-eye-off-outline' : 'mdi-eye-outline'"
                    :rules="[rules.required, rules.minLength]"
                    class="mb-2"
                    @click:append-inner="showPassword = !showPassword"
                  />

                  <v-text-field
                    v-model="form.confirmPassword"
                    :label="t('auth.confirmPassword', 'Confirm Password')"
                    :type="showPassword ? 'text' : 'password'"
                    prepend-inner-icon="mdi-lock-check-outline"
                    :rules="[rules.required, rules.match]"
                    class="mb-6"
                  />

                  <v-btn
                    type="submit"
                    color="primary"
                    size="large"
                    block
                    :loading="loading"
                    class="mb-4"
                  >
                    {{ t('auth.register') }}
                  </v-btn>

                  <v-divider class="mb-4">
                    <span class="text-medium-emphasis text-body-2">{{ t('auth.orDivider') }}</span>
                  </v-divider>

                  <v-btn
                    variant="outlined"
                    size="large"
                    block
                    prepend-icon="mdi-google"
                    class="mb-6"
                    @click="handleGoogle"
                  >
                    {{ t('auth.continueWithGoogle') }}
                  </v-btn>

                  <p class="text-center text-body-2 text-medium-emphasis">
                    {{ t('auth.hasAccount') }}
                    <v-btn
                      variant="text"
                      size="small"
                      color="primary"
                      class="px-1"
                      :to="{ name: 'login' }"
                    >
                      {{ t('auth.signIn') }}
                    </v-btn>
                  </p>
                </v-form>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>
      </v-container>
    </v-main>

    <div class="lang-toggle">
      <v-menu>
        <template #activator="{ props }">
          <v-btn variant="text" v-bind="props" prepend-icon="mdi-translate" size="small">
            {{ currentLocaleName }}
          </v-btn>
        </template>
        <v-list>
          <v-list-item
            v-for="lang in languages"
            :key="lang.value"
            :title="lang.label"
            @click="themeStore.setLocale(lang.value)"
          />
        </v-list>
      </v-menu>

      <v-btn
        :icon="themeStore.isDark ? 'mdi-weather-sunny' : 'mdi-weather-night'"
        variant="text"
        size="small"
        @click="themeStore.toggleTheme"
      />
    </div>
  </v-app>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useThemeStore } from '@/stores/theme'
import { toast } from '@/composables/useToast'

const { t } = useI18n()
const router = useRouter()
const authStore = useAuthStore()
const themeStore = useThemeStore()

const formRef = ref()
const loading = ref(false)
const showPassword = ref(false)

const form = ref({
  firstName: '',
  lastName: '',
  email: '',
  password: '',
  confirmPassword: '',
})

const rules = {
  required: (v: string) => !!v || 'Required',
  email: (v: string) => /.+@.+\..+/.test(v) || 'Invalid email',
  minLength: (v: string) => v.length >= 8 || 'Minimum 8 characters',
  match: (v: string) => v === form.value.password || 'Passwords do not match',
}

const languages = [
  { label: 'English', value: 'en' },
  { label: 'ภาษาไทย', value: 'th' },
  { label: '中文', value: 'zh' },
  { label: 'العربية', value: 'ar' },
]

const currentLocaleName = computed(
  () => languages.find((l) => l.value === themeStore.currentLocale)?.label ?? 'EN',
)

async function handleRegister() {
  const { valid } = await formRef.value.validate()
  if (!valid) return

  loading.value = true
  await new Promise((r) => setTimeout(r, 800))
  authStore.register(form.value)
  toast.success('Account created successfully!')
  loading.value = false
  router.push({ name: 'home' })
}

function handleGoogle() {
  authStore.login({ email: 'google@example.com', password: '' })
  router.push({ name: 'home' })
}
</script>

<style scoped>
.auth-banner {
  background: rgb(var(--v-theme-surface-variant));
  border-inline-end: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
}

.lang-toggle {
  position: fixed;
  top: 16px;
  inset-inline-end: 16px;
  display: flex;
  align-items: center;
  gap: 4px;
}
</style>