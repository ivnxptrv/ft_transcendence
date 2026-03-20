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
      <h1 class="text-h4 font-weight-bold mb-1">Edit Provider Profile</h1>
      <p class="text-body-1 text-medium-emphasis">Update your provider information</p>
    </div>

    <v-row>
      <v-col cols="12" md="8">
        <!-- Basic Info -->
        <v-card rounded="xl" class="mb-4">
          <v-card-text class="pa-6">
            <p class="text-subtitle-2 font-weight-bold mb-4">Basic Information</p>
            <v-form ref="formRef" @submit.prevent="saveProfile">
              <v-text-field
                v-model="form.title"
                label="Professional Title"
                prepend-inner-icon="mdi-briefcase-outline"
                :rules="[rules.required]"
                class="mb-3"
              />
              <v-textarea
                v-model="form.description"
                label="About You"
                prepend-inner-icon="mdi-text-account"
                rows="4"
                :rules="[rules.required]"
                class="mb-3"
              />
              <v-row>
                <v-col cols="12" sm="6">
                  <v-text-field
                    v-model="form.hourlyRate"
                    label="Hourly Rate (pts)"
                    type="number"
                    prepend-inner-icon="mdi-wallet-outline"
                    :rules="[rules.required]"
                  />
                </v-col>
                <v-col cols="12" sm="6">
                  <v-text-field
                    v-model="form.location"
                    label="Location"
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
                  />
                </v-col>
              </v-row>
            </v-form>
          </v-card-text>
        </v-card>

        <!-- Availability -->
        <v-card rounded="xl" class="mb-4">
          <v-card-text class="pa-6">
            <p class="text-subtitle-2 font-weight-bold mb-4">Availability</p>
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

        <!-- Availability Toggle -->
        <v-card rounded="xl" class="mb-6">
          <v-card-text class="pa-5">
            <div class="d-flex align-center justify-space-between">
              <div>
                <p class="text-body-2 font-weight-medium">Available for Bookings</p>
                <p class="text-caption text-medium-emphasis">
                  Toggle off to pause incoming booking requests
                </p>
              </div>
              <v-switch
                v-model="form.isAvailable"
                hide-details
                color="primary"
                density="compact"
              />
            </div>
          </v-card-text>
        </v-card>

        <div class="d-flex ga-2 justify-end">
          <v-btn variant="outlined" @click="router.back()">Cancel</v-btn>
          <v-btn color="primary" :loading="saving" @click="saveProfile">
            Save Changes
          </v-btn>
        </div>
      </v-col>

      <!-- Right Column — Tags Preview -->
      <v-col cols="12" md="4">
        <v-card rounded="xl" class="mb-4">
          <v-card-text class="pa-5">
            <p class="text-subtitle-2 font-weight-bold mb-2">AI Generated Tags</p>
            <p class="text-caption text-medium-emphasis mb-4">
              Tags are automatically generated based on your profile. They update when you save changes.
            </p>
            <div class="d-flex flex-wrap ga-2">
              <v-chip
                v-for="tag in currentTags"
                :key="tag"
                size="small"
                variant="tonal"
                color="primary"
                rounded="lg"
              >
                {{ tag }}
              </v-chip>
            </div>
          </v-card-text>
        </v-card>

        <v-card rounded="xl">
          <v-card-text class="pa-5">
            <p class="text-subtitle-2 font-weight-bold mb-2">Profile Status</p>
            <div class="d-flex flex-column ga-3">
              <div class="d-flex align-center justify-space-between">
                <span class="text-body-2 text-medium-emphasis">Status</span>
                <v-chip color="success" size="x-small" variant="tonal" rounded="lg">
                  Active
                </v-chip>
              </div>
              <div class="d-flex align-center justify-space-between">
                <span class="text-body-2 text-medium-emphasis">Accepting Bookings</span>
                <v-chip
                  :color="form.isAvailable ? 'success' : 'error'"
                  size="x-small"
                  variant="tonal"
                  rounded="lg"
                >
                  {{ form.isAvailable ? 'Yes' : 'No' }}
                </v-chip>
              </div>
              <div class="d-flex align-center justify-space-between">
                <span class="text-body-2 text-medium-emphasis">Total Reviews</span>
                <span class="text-body-2 font-weight-medium">87</span>
              </div>
              <div class="d-flex align-center justify-space-between">
                <span class="text-body-2 text-medium-emphasis">Average Rating</span>
                <div class="d-flex align-center ga-1">
                  <v-icon size="14" color="warning">mdi-star</v-icon>
                  <span class="text-body-2 font-weight-medium">4.9</span>
                </div>
              </div>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { toast } from '@/composables/useToast'

const router = useRouter()
const formRef = ref()
const saving = ref(false)

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

const currentTags = ref([
  'Thai Massage',
  'Deep Tissue',
  'Sports Massage',
  'Weekend Available',
  'Licensed',
  'Bangkok',
])

const form = ref({
  title: 'Licensed Thai Massage Therapist',
  description: 'I am a fully licensed Thai massage therapist with over 9 years of experience in traditional Thai massage, deep tissue, and sports massage.',
  hourlyRate: '500',
  location: 'Bangkok, Thailand',
  yearsExperience: '9',
  languages: ['Thai', 'English'],
  isAvailable: true,
  availability: {
    monday: { enabled: true, startTime: '09:00', endTime: '18:00' },
    tuesday: { enabled: true, startTime: '09:00', endTime: '18:00' },
    wednesday: { enabled: true, startTime: '09:00', endTime: '18:00' },
    thursday: { enabled: false, startTime: '09:00', endTime: '18:00' },
    friday: { enabled: false, startTime: '09:00', endTime: '18:00' },
    saturday: { enabled: true, startTime: '10:00', endTime: '16:00' },
    sunday: { enabled: true, startTime: '10:00', endTime: '16:00' },
  },
})

const rules = {
  required: (v: string) => !!v || 'Required',
}

async function saveProfile() {
  const { valid } = await formRef.value.validate()
  if (!valid) return

  saving.value = true
  await new Promise((r) => setTimeout(r, 1000))
  saving.value = false
  toast.success('Provider profile updated — AI is regenerating your tags')
  router.push({ name: 'profile' })
}
</script>