<template>
  <div>
    <v-btn
      variant="text"
      prepend-icon="mdi-arrow-left"
      class="mb-4 px-0"
      @click="router.back()"
    >
      Back
    </v-btn>

    <div class="mb-6">
      <h1 class="text-h4 font-weight-bold mb-1">Become a Provider</h1>
      <p class="text-body-1 text-medium-emphasis">
        Set up your provider profile to start offering services
      </p>
    </div>

    <!-- Stepper -->
    <v-stepper
      v-model="currentStep"
      :items="steps"
      hide-actions
      flat
      rounded="xl"
      class="mb-6"
    >
      <template #item.1>
        <v-card flat>
          <v-card-text class="pa-6">
            <h2 class="text-h6 font-weight-bold mb-6">Basic Information</h2>
            <v-form ref="step1Ref">
              <v-text-field
                v-model="form.title"
                label="Professional Title"
                placeholder="e.g. Licensed Thai Massage Therapist"
                prepend-inner-icon="mdi-briefcase-outline"
                :rules="[rules.required]"
                class="mb-3"
              />
              <v-textarea
                v-model="form.description"
                label="About You"
                placeholder="Describe your services, experience, and what makes you unique..."
                prepend-inner-icon="mdi-text-account"
                rows="4"
                :rules="[rules.required, rules.minLength]"
                class="mb-3"
              />
              <v-row>
                <v-col cols="12" sm="6">
                  <v-text-field
                    v-model="form.hourlyRate"
                    label="Hourly Rate (pts)"
                    type="number"
                    prepend-inner-icon="mdi-wallet-outline"
                    :rules="[rules.required, rules.positiveNumber]"
                  />
                </v-col>
                <v-col cols="12" sm="6">
                  <v-text-field
                    v-model="form.location"
                    label="Location"
                    placeholder="e.g. Bangkok, Thailand"
                    prepend-inner-icon="mdi-map-marker-outline"
                    :rules="[rules.required]"
                  />
                </v-col>
                <v-col cols="12" sm="6">
                  <v-text-field
                    v-model="form.yearsExperience"
                    label="Years of Experience"
                    type="number"
                    prepend-inner-icon="mdi-clock-outline"
                    :rules="[rules.required]"
                  />
                </v-col>
                <v-col cols="12" sm="6">
                  <v-combobox
                    v-model="form.languages"
                    label="Languages Spoken"
                    prepend-inner-icon="mdi-translate"
                    multiple
                    chips
                    closable-chips
                    :items="languageOptions"
                    :rules="[rules.requiredArray]"
                  />
                </v-col>
              </v-row>
            </v-form>
          </v-card-text>
        </v-card>
      </template>

      <template #item.2>
        <v-card flat>
          <v-card-text class="pa-6">
            <h2 class="text-h6 font-weight-bold mb-2">Availability</h2>
            <p class="text-body-2 text-medium-emphasis mb-6">
              Set your weekly availability so customers know when to book you
            </p>

            <div class="d-flex flex-column ga-3">
              <div
                v-for="day in weekDays"
                :key="day.value"
                class="d-flex align-center ga-3"
              >
                <v-checkbox
                  v-model="form.availability[day.value].enabled"
                  :label="day.label"
                  hide-details
                  color="primary"
                  style="min-width: 130px"
                />
                <template v-if="form.availability[day.value].enabled">
                  <v-text-field
                    v-model="form.availability[day.value].startTime"
                    type="time"
                    hide-details
                    variant="outlined"
                    density="compact"
                    style="max-width: 130px"
                  />
                  <span class="text-body-2 text-medium-emphasis">to</span>
                  <v-text-field
                    v-model="form.availability[day.value].endTime"
                    type="time"
                    hide-details
                    variant="outlined"
                    density="compact"
                    style="max-width: 130px"
                  />
                </template>
                <span v-else class="text-caption text-medium-emphasis">Not available</span>
              </div>
            </div>
          </v-card-text>
        </v-card>
      </template>

      <template #item.3>
        <v-card flat>
          <v-card-text class="pa-6">
            <h2 class="text-h6 font-weight-bold mb-2">Review Your Profile</h2>
            <p class="text-body-2 text-medium-emphasis mb-6">
              Check your information before submitting
            </p>

            <v-row>
              <v-col cols="12" md="6">
                <v-card color="surface-variant" rounded="xl" class="pa-5 mb-4">
                  <p class="text-caption text-medium-emphasis mb-1">Professional Title</p>
                  <p class="font-weight-medium">{{ form.title || '—' }}</p>
                </v-card>
              </v-col>
              <v-col cols="12" md="6">
                <v-card color="surface-variant" rounded="xl" class="pa-5 mb-4">
                  <p class="text-caption text-medium-emphasis mb-1">Hourly Rate</p>
                  <p class="font-weight-medium">{{ form.hourlyRate || '—' }} pts/hr</p>
                </v-card>
              </v-col>
              <v-col cols="12" md="6">
                <v-card color="surface-variant" rounded="xl" class="pa-5 mb-4">
                  <p class="text-caption text-medium-emphasis mb-1">Location</p>
                  <p class="font-weight-medium">{{ form.location || '—' }}</p>
                </v-card>
              </v-col>
              <v-col cols="12" md="6">
                <v-card color="surface-variant" rounded="xl" class="pa-5 mb-4">
                  <p class="text-caption text-medium-emphasis mb-1">Experience</p>
                  <p class="font-weight-medium">{{ form.yearsExperience || '—' }} years</p>
                </v-card>
              </v-col>
              <v-col cols="12">
                <v-card color="surface-variant" rounded="xl" class="pa-5 mb-4">
                  <p class="text-caption text-medium-emphasis mb-1">About</p>
                  <p class="font-weight-medium">{{ form.description || '—' }}</p>
                </v-card>
              </v-col>
              <v-col cols="12" md="6">
                <v-card color="surface-variant" rounded="xl" class="pa-5 mb-4">
                  <p class="text-caption text-medium-emphasis mb-2">Languages</p>
                  <div class="d-flex flex-wrap ga-1">
                    <v-chip
                      v-for="lang in form.languages"
                      :key="lang"
                      size="small"
                      rounded="lg"
                    >
                      {{ lang }}
                    </v-chip>
                  </div>
                </v-card>
              </v-col>
              <v-col cols="12" md="6">
                <v-card color="surface-variant" rounded="xl" class="pa-5 mb-4">
                  <p class="text-caption text-medium-emphasis mb-2">Availability</p>
                  <div class="d-flex flex-column ga-1">
                    <div
                      v-for="day in weekDays.filter(d => form.availability[d.value].enabled)"
                      :key="day.value"
                      class="d-flex justify-space-between"
                    >
                      <span class="text-body-2">{{ day.label }}</span>
                      <span class="text-body-2 text-medium-emphasis">
                        {{ form.availability[day.value].startTime }} —
                        {{ form.availability[day.value].endTime }}
                      </span>
                    </div>
                    <p
                      v-if="!weekDays.some(d => form.availability[d.value].enabled)"
                      class="text-caption text-medium-emphasis"
                    >
                      No availability set
                    </p>
                  </div>
                </v-card>
              </v-col>
            </v-row>

            <v-alert
              type="info"
              variant="tonal"
              rounded="lg"
              icon="mdi-information-outline"
            >
              After submitting, our AI will analyze your profile and generate relevant tags.
              Your profile will go live once processing is complete.
            </v-alert>
          </v-card-text>
        </v-card>
      </template>
    </v-stepper>

    <!-- Navigation Buttons -->
    <div class="d-flex justify-space-between">
      <v-btn
        v-if="currentStep > 1"
        variant="outlined"
        prepend-icon="mdi-arrow-left"
        @click="currentStep--"
      >
        Previous
      </v-btn>
      <div v-else />

      <div class="d-flex ga-2">
        <v-btn
          v-if="currentStep < steps.length"
          color="primary"
          append-icon="mdi-arrow-right"
          @click="nextStep"
        >
          Next
        </v-btn>
        <v-btn
          v-else
          color="primary"
          prepend-icon="mdi-check"
          :loading="submitting"
          @click="submitProfile"
        >
          Submit Profile
        </v-btn>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { toast } from '@/composables/useToast'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()

const currentStep = ref(1)
const submitting = ref(false)
const step1Ref = ref()

const steps = [
  { title: 'Basic Info', value: 1 },
  { title: 'Availability', value: 2 },
  { title: 'Review', value: 3 },
]

const weekDays = [
  { label: 'Monday', value: 'monday' },
  { label: 'Tuesday', value: 'tuesday' },
  { label: 'Wednesday', value: 'wednesday' },
  { label: 'Thursday', value: 'thursday' },
  { label: 'Friday', value: 'friday' },
  { label: 'Saturday', value: 'saturday' },
  { label: 'Sunday', value: 'sunday' },
]

const languageOptions = ['Thai', 'English', 'Mandarin', 'Japanese', 'Korean', 'French', 'German', 'Spanish', 'Arabic']

const form = ref({
  title: '',
  description: '',
  hourlyRate: '',
  location: '',
  yearsExperience: '',
  languages: [] as string[],
  availability: Object.fromEntries(
    weekDays.map((d) => [
      d.value,
      { enabled: false, startTime: '09:00', endTime: '18:00' },
    ]),
  ),
})

const rules = {
  required: (v: string) => !!v || 'Required',
  minLength: (v: string) => v.length >= 50 || 'Minimum 50 characters',
  positiveNumber: (v: string) => Number(v) > 0 || 'Must be greater than 0',
  requiredArray: (v: string[]) => v.length > 0 || 'Select at least one',
}

async function nextStep() {
  if (currentStep.value === 1) {
    const { valid } = await step1Ref.value.validate()
    if (!valid) return
  }
  currentStep.value++
}

async function submitProfile() {
  submitting.value = true
  await new Promise((r) => setTimeout(r, 1500))
  submitting.value = false

  if (authStore.user) {
    authStore.user.role = 'provider'
    localStorage.setItem('user', JSON.stringify(authStore.user))
  }

  toast.success('Provider profile submitted — AI is processing your profile')
  router.push({ name: 'profile' })
}
</script>