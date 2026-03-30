<template>
  <div>
    <div class="mb-6">
      <h1 class="text-h4 font-weight-bold mb-1">Profile</h1>
      <p class="text-body-1 text-medium-emphasis">Manage your account and preferences</p>
    </div>

    <v-row>
      <!-- Left Column -->
      <v-col cols="12" md="4">
        <!-- Avatar Card -->
        <v-card rounded="xl" class="mb-4">
          <v-card-text class="pa-6 text-center">
            <div class="position-relative d-inline-block mb-4">
              <v-avatar size="96">
                <v-icon size="48">mdi-account</v-icon>
              </v-avatar>
              <v-btn
                icon="mdi-camera"
                size="x-small"
                color="primary"
                class="position-absolute"
                style="bottom: 0; right: 0"
              />
            </div>

            <h2 class="text-h6 font-weight-bold mb-1">{{ authStore.fullName }}</h2>
            <p class="text-body-2 text-medium-emphasis mb-3">{{ authStore.user?.email }}</p>

            <v-chip
              :color="authStore.isProvider ? 'primary' : 'default'"
              variant="tonal"
              size="small"
              rounded="lg"
              :prepend-icon="authStore.isProvider ? 'mdi-briefcase-outline' : 'mdi-account-outline'"
            >
              {{ authStore.isProvider ? 'Provider' : 'User' }}
            </v-chip>
          </v-card-text>
        </v-card>

        <!-- Account Stats -->
        <v-card rounded="xl" class="mb-4">
          <v-card-text class="pa-5">
            <p class="text-subtitle-2 font-weight-bold mb-4">Account Stats</p>
            <div class="d-flex flex-column ga-3">
              <div class="d-flex justify-space-between align-center">
                <div class="d-flex align-center ga-2">
                  <v-icon size="16" class="text-medium-emphasis">mdi-calendar-check-outline</v-icon>
                  <span class="text-body-2 text-medium-emphasis">Total Sessions</span>
                </div>
                <span class="text-body-2 font-weight-medium">12</span>
              </div>
              <div class="d-flex justify-space-between align-center">
                <div class="d-flex align-center ga-2">
                  <v-icon size="16" class="text-medium-emphasis">mdi-star-outline</v-icon>
                  <span class="text-body-2 text-medium-emphasis">Reviews Given</span>
                </div>
                <span class="text-body-2 font-weight-medium">8</span>
              </div>
              <div class="d-flex justify-space-between align-center">
                <div class="d-flex align-center ga-2">
                  <v-icon size="16" class="text-medium-emphasis">mdi-wallet-outline</v-icon>
                  <span class="text-body-2 text-medium-emphasis">Total Spent</span>
                </div>
                <span class="text-body-2 font-weight-medium">3,100 pts</span>
              </div>
              <div class="d-flex justify-space-between align-center">
                <div class="d-flex align-center ga-2">
                  <v-icon size="16" class="text-medium-emphasis">mdi-clock-outline</v-icon>
                  <span class="text-body-2 text-medium-emphasis">Member Since</span>
                </div>
                <span class="text-body-2 font-weight-medium">Mar 2026</span>
              </div>
            </div>
          </v-card-text>
        </v-card>

        <!-- Become Provider -->
        <v-card v-if="!authStore.isProvider" rounded="xl" color="primary" variant="tonal">
		  <v-card-text class="pa-5">
		    <div class="d-flex align-center ga-2 mb-2">
		      <v-icon>mdi-briefcase-outline</v-icon>
		      <p class="text-subtitle-2 font-weight-bold">Become a Provider</p>
		    </div>
		    <p class="text-body-2 text-medium-emphasis mb-4">
		      Offer your services and earn points by helping others
		    </p>
		    <v-btn color="primary" block to="/profile/provider">
		      Get Started
		    </v-btn>
		  </v-card-text>
		</v-card>

		<v-card v-else rounded="xl">
		  <v-card-text class="pa-5">
		    <div class="d-flex align-center justify-space-between mb-3">
		      <div class="d-flex align-center ga-2">
		        <v-icon>mdi-briefcase-outline</v-icon>
		        <p class="text-subtitle-2 font-weight-bold">Provider Profile</p>
		      </div>
		      <v-chip color="success" size="x-small" variant="tonal" rounded="lg">
		        Active
		      </v-chip>
		    </div>
		    <div class="d-flex flex-column ga-2 mb-4">
		      <div class="d-flex justify-space-between">
		        <span class="text-caption text-medium-emphasis">Title</span>
		        <span class="text-caption font-weight-medium">Licensed Thai Massage Therapist</span>
		      </div>
		      <div class="d-flex justify-space-between">
		        <span class="text-caption text-medium-emphasis">Hourly Rate</span>
		        <span class="text-caption font-weight-medium">500 pts/hr</span>
		      </div>
		      <div class="d-flex justify-space-between">
		        <span class="text-caption text-medium-emphasis">Location</span>
		        <span class="text-caption font-weight-medium">Bangkok, Thailand</span>
		      </div>
		    </div>
		    <v-btn block variant="outlined" prepend-icon="mdi-pencil-outline" to="/profile/provider/edit">
		      Edit Provider Profile
		    </v-btn>
		  </v-card-text>
		</v-card>
      </v-col>

      <!-- Right Column -->
      <v-col cols="12" md="8">
        <!-- Edit Profile -->
        <v-card rounded="xl" class="mb-4">
          <v-card-text class="pa-5">
            <div class="d-flex align-center justify-space-between mb-4">
              <p class="text-subtitle-2 font-weight-bold">Personal Information</p>
              <v-btn
                v-if="!editMode"
                variant="text"
                size="small"
                prepend-icon="mdi-pencil-outline"
                @click="editMode = true"
              >
                Edit
              </v-btn>
            </div>

            <v-form ref="formRef" @submit.prevent="saveProfile">
              <v-row>
                <v-col cols="12" sm="6">
                  <v-text-field
                    v-model="form.firstName"
                    label="First Name"
                    prepend-inner-icon="mdi-account-outline"
                    :readonly="!editMode"
                    :variant="editMode ? 'outlined' : 'plain'"
                    :rules="editMode ? [rules.required] : []"
                    density="comfortable"
                  />
                </v-col>
                <v-col cols="12" sm="6">
                  <v-text-field
                    v-model="form.lastName"
                    label="Last Name"
                    :readonly="!editMode"
                    :variant="editMode ? 'outlined' : 'plain'"
                    :rules="editMode ? [rules.required] : []"
                    density="comfortable"
                  />
                </v-col>
                <v-col cols="12">
                  <v-text-field
                    v-model="form.email"
                    label="Email"
                    prepend-inner-icon="mdi-email-outline"
                    readonly
                    variant="plain"
                    density="comfortable"
                  />
                </v-col>
                <v-col cols="12" sm="6">
                  <v-text-field
                    v-model="form.phone"
                    label="Phone"
                    prepend-inner-icon="mdi-phone-outline"
                    :readonly="!editMode"
                    :variant="editMode ? 'outlined' : 'plain'"
                    density="comfortable"
                  />
                </v-col>
                <v-col cols="12" sm="6">
                  <v-text-field
                    v-model="form.city"
                    label="City"
                    prepend-inner-icon="mdi-city-outline"
                    :readonly="!editMode"
                    :variant="editMode ? 'outlined' : 'plain'"
                    density="comfortable"
                  />
                </v-col>
                <v-col cols="12">
                  <v-textarea
                    v-model="form.bio"
                    label="Bio"
                    prepend-inner-icon="mdi-text-account"
                    :readonly="!editMode"
                    :variant="editMode ? 'outlined' : 'plain'"
                    rows="3"
                    density="comfortable"
                  />
                </v-col>
              </v-row>

              <div v-if="editMode" class="d-flex ga-2 justify-end">
                <v-btn variant="outlined" @click="cancelEdit">Cancel</v-btn>
                <v-btn color="primary" type="submit" :loading="saving">Save Changes</v-btn>
              </div>
            </v-form>
          </v-card-text>
        </v-card>

        <!-- Security -->
        <v-card rounded="xl" class="mb-4">
          <v-card-text class="pa-5">
            <p class="text-subtitle-2 font-weight-bold mb-4">Security</p>
            <div class="d-flex flex-column ga-2">
              <div class="d-flex align-center justify-space-between py-2">
                <div class="d-flex align-center ga-3">
                  <v-icon size="20" class="text-medium-emphasis">mdi-lock-outline</v-icon>
                  <div>
                    <p class="text-body-2 font-weight-medium">Password</p>
                    <p class="text-caption text-medium-emphasis">Last changed 30 days ago</p>
                  </div>
                </div>
                <v-btn variant="outlined" size="small" @click="changePasswordDialog = true">
                  Change
                </v-btn>
              </div>

              <v-divider />

              <div class="d-flex align-center justify-space-between py-2">
                <div class="d-flex align-center ga-3">
                  <v-icon size="20" class="text-medium-emphasis">mdi-shield-check-outline</v-icon>
                  <div>
                    <p class="text-body-2 font-weight-medium">Two-Factor Authentication</p>
                    <p class="text-caption text-medium-emphasis">
                      {{ twoFaEnabled ? 'Enabled' : 'Not enabled' }}
                    </p>
                  </div>
                </div>
                <v-switch
                  v-model="twoFaEnabled"
                  hide-details
                  color="primary"
                  density="compact"
                  @change="toggleTwoFa"
                />
              </div>

              <v-divider />

              <div class="d-flex align-center justify-space-between py-2">
                <div class="d-flex align-center ga-3">
                  <v-icon size="20" class="text-medium-emphasis">mdi-google</v-icon>
                  <div>
                    <p class="text-body-2 font-weight-medium">Google Account</p>
                    <p class="text-caption text-medium-emphasis">Not linked</p>
                  </div>
                </div>
                <v-btn variant="outlined" size="small">Link</v-btn>
              </div>
            </div>
          </v-card-text>
        </v-card>

        <!-- Preferences -->
        <v-card rounded="xl" class="mb-4">
          <v-card-text class="pa-5">
            <p class="text-subtitle-2 font-weight-bold mb-4">Preferences</p>
            <div class="d-flex flex-column ga-3">
              <div class="d-flex align-center justify-space-between">
                <div class="d-flex align-center ga-3">
                  <v-icon size="20" class="text-medium-emphasis">
                    {{ themeStore.isDark ? 'mdi-weather-night' : 'mdi-weather-sunny' }}
                  </v-icon>
                  <div>
                    <p class="text-body-2 font-weight-medium">Dark Mode</p>
                    <p class="text-caption text-medium-emphasis">
                      {{ themeStore.isDark ? 'On' : 'Off' }}
                    </p>
                  </div>
                </div>
                <v-switch
                  :model-value="themeStore.isDark"
                  hide-details
                  color="primary"
                  density="compact"
                  @change="themeStore.toggleTheme"
                />
              </div>

              <v-divider />

              <div class="d-flex align-center justify-space-between">
                <div class="d-flex align-center ga-3">
                  <v-icon size="20" class="text-medium-emphasis">mdi-translate</v-icon>
                  <div>
                    <p class="text-body-2 font-weight-medium">Language</p>
                    <p class="text-caption text-medium-emphasis">{{ currentLanguageLabel }}</p>
                  </div>
                </div>
                <v-select
                  :model-value="themeStore.currentLocale"
                  :items="languages"
                  hide-details
                  variant="outlined"
                  density="compact"
                  style="max-width: 140px"
                  @update:model-value="themeStore.setLocale"
                />
              </div>
            </div>
          </v-card-text>
        </v-card>

        <!-- Danger Zone -->
        <v-card rounded="xl" border="error">
          <v-card-text class="pa-5">
            <p class="text-subtitle-2 font-weight-bold text-error mb-4">Danger Zone</p>
            <div class="d-flex align-center justify-space-between">
              <div>
                <p class="text-body-2 font-weight-medium">Delete Account</p>
                <p class="text-caption text-medium-emphasis">
                  Permanently delete your account and all data
                </p>
              </div>
              <v-btn color="error" variant="outlined" size="small" @click="deleteDialog = true">
                Delete
              </v-btn>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Change Password Dialog -->
    <v-dialog v-model="changePasswordDialog" max-width="440">
      <v-card rounded="xl">
        <v-card-title class="pa-6 pb-2">
          <span class="text-h6 font-weight-bold">Change Password</span>
        </v-card-title>
        <v-card-text class="pa-6 pt-2">
          <v-text-field
            v-model="passwordForm.current"
            label="Current Password"
            type="password"
            prepend-inner-icon="mdi-lock-outline"
            class="mb-3"
          />
          <v-text-field
            v-model="passwordForm.new"
            label="New Password"
            type="password"
            prepend-inner-icon="mdi-lock-reset"
            class="mb-3"
          />
          <v-text-field
            v-model="passwordForm.confirm"
            label="Confirm New Password"
            type="password"
            prepend-inner-icon="mdi-lock-check-outline"
          />
        </v-card-text>
        <v-card-actions class="pa-6 pt-0 ga-2">
          <v-btn variant="outlined" class="flex-grow-1" @click="changePasswordDialog = false">
            Cancel
          </v-btn>
          <v-btn color="primary" class="flex-grow-1" @click="changePassword">
            Update Password
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Delete Account Dialog -->
    <v-dialog v-model="deleteDialog" max-width="420">
      <v-card rounded="xl">
        <v-card-text class="pa-6 text-center">
          <v-icon size="48" color="error" class="mb-3">mdi-alert-circle-outline</v-icon>
          <h3 class="text-h6 font-weight-bold mb-2">Delete Account</h3>
          <p class="text-body-2 text-medium-emphasis mb-4">
            This action is permanent and cannot be undone. All your data will be deleted.
          </p>
          <v-text-field
            v-model="deleteConfirmText"
            label="Type DELETE to confirm"
            variant="outlined"
            density="comfortable"
          />
        </v-card-text>
        <v-card-actions class="pa-6 pt-0 ga-2">
          <v-btn variant="outlined" class="flex-grow-1" @click="deleteDialog = false">
            Cancel
          </v-btn>
          <v-btn
            color="error"
            class="flex-grow-1"
            :disabled="deleteConfirmText !== 'DELETE'"
            @click="deleteAccount"
          >
            Delete Account
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { toast } from '@/composables/useToast'
import { useAuthStore } from '@/stores/auth'
import { useThemeStore } from '@/stores/theme'

const router = useRouter()
const authStore = useAuthStore()
const themeStore = useThemeStore()

const editMode = ref(false)
const saving = ref(false)
const twoFaEnabled = ref(false)
const changePasswordDialog = ref(false)
const deleteDialog = ref(false)
const deleteConfirmText = ref('')
const formRef = ref()

const form = ref({
  firstName: authStore.user?.firstName ?? '',
  lastName: authStore.user?.lastName ?? '',
  email: authStore.user?.email ?? '',
  phone: '',
  city: 'Bangkok',
  bio: '',
})

const passwordForm = ref({
  current: '',
  new: '',
  confirm: '',
})

const rules = {
  required: (v: string) => !!v || 'Required',
}

const languages = [
  { title: 'English', value: 'en' },
  { title: 'ภาษาไทย', value: 'th' },
  { title: '中文', value: 'zh' },
  { title: 'العربية', value: 'ar' },
]

const currentLanguageLabel = computed(
  () => languages.find((l) => l.value === themeStore.currentLocale)?.title ?? 'English',
)

function cancelEdit() {
  editMode.value = false
  form.value.firstName = authStore.user?.firstName ?? ''
  form.value.lastName = authStore.user?.lastName ?? ''
}

async function saveProfile() {
  const { valid } = await formRef.value.validate()
  if (!valid) return

  saving.value = true
  await new Promise((r) => setTimeout(r, 800))
  saving.value = false
  editMode.value = false
  toast.success('Profile updated successfully')
}

function toggleTwoFa() {
  toast.success(twoFaEnabled.value ? '2FA enabled' : '2FA disabled')
}

async function changePassword() {
  if (passwordForm.value.new !== passwordForm.value.confirm) {
    toast.error('Passwords do not match')
    return
  }
  changePasswordDialog.value = false
  toast.success('Password updated successfully')
}

function deleteAccount() {
  deleteDialog.value = false
  authStore.logout()
  toast.success('Account deleted')
  router.push({ name: 'login' })
}
</script>