<template>
  <div>
    <!-- Back Button -->
    <v-btn
      variant="text"
      prepend-icon="mdi-arrow-left"
      class="mb-4 px-0"
      @click="router.back()"
    >
      Back
    </v-btn>

    <v-row>
      <!-- Left Column -->
      <v-col cols="12" md="4">
        <!-- Profile Card -->
        <v-card rounded="xl" class="mb-4">
          <v-card-text class="pa-6 text-center">
            <v-avatar size="96" class="mb-4">
              <v-icon size="48">mdi-account</v-icon>
            </v-avatar>

            <h1 class="text-h5 font-weight-bold mb-1">{{ provider.name }}</h1>
            <p class="text-body-2 text-medium-emphasis mb-3">{{ provider.title }}</p>

            <div class="d-flex align-center justify-center ga-2 mb-4">
              <v-icon size="16" color="warning">mdi-star</v-icon>
              <span class="font-weight-bold">{{ provider.rating }}</span>
              <span class="text-caption text-medium-emphasis">({{ provider.totalReviews }} reviews)</span>
            </div>

            <v-chip
              :color="provider.isAvailable ? 'success' : 'error'"
              variant="tonal"
              size="small"
              rounded="lg"
              class="mb-4"
            >
              <v-icon start size="12">
                {{ provider.isAvailable ? 'mdi-circle' : 'mdi-circle-outline' }}
              </v-icon>
              {{ provider.isAvailable ? 'Available' : 'Unavailable' }}
            </v-chip>

            <v-btn
              color="primary"
              block
              size="large"
              prepend-icon="mdi-calendar-plus"
              :disabled="!provider.isAvailable"
              @click="bookingDialog = true"
            >
              Book Session
            </v-btn>
          </v-card-text>
        </v-card>

        <!-- Info Card -->
        <v-card rounded="xl" class="mb-4">
          <v-card-text class="pa-5">
            <p class="text-subtitle-2 font-weight-bold mb-3">Details</p>

            <div class="d-flex flex-column ga-3">
              <div class="d-flex align-center ga-3">
                <v-icon size="18" class="text-medium-emphasis">mdi-wallet-outline</v-icon>
                <div>
                  <p class="text-caption text-medium-emphasis">Hourly Rate</p>
                  <p class="text-body-2 font-weight-medium">{{ provider.hourlyRate }} pts/hr</p>
                </div>
              </div>

              <div class="d-flex align-center ga-3">
                <v-icon size="18" class="text-medium-emphasis">mdi-map-marker-outline</v-icon>
                <div>
                  <p class="text-caption text-medium-emphasis">Location</p>
                  <p class="text-body-2 font-weight-medium">{{ provider.location }}</p>
                </div>
              </div>

              <div class="d-flex align-center ga-3">
                <v-icon size="18" class="text-medium-emphasis">mdi-briefcase-outline</v-icon>
                <div>
                  <p class="text-caption text-medium-emphasis">Experience</p>
                  <p class="text-body-2 font-weight-medium">{{ provider.yearsExperience }} years</p>
                </div>
              </div>

              <div class="d-flex align-center ga-3">
                <v-icon size="18" class="text-medium-emphasis">mdi-translate</v-icon>
                <div>
                  <p class="text-caption text-medium-emphasis">Languages</p>
                  <p class="text-body-2 font-weight-medium">{{ provider.languages.join(', ') }}</p>
                </div>
              </div>
            </div>
          </v-card-text>
        </v-card>

        <!-- Tags Card -->
        <v-card rounded="xl">
          <v-card-text class="pa-5">
            <p class="text-subtitle-2 font-weight-bold mb-3">Skills & Tags</p>
            <div class="d-flex flex-wrap ga-2">
              <v-chip
                v-for="tag in provider.tags"
                :key="tag"
                size="small"
                variant="tonal"
                rounded="lg"
              >
                {{ tag }}
              </v-chip>
            </div>
          </v-card-text>
        </v-card>
      </v-col>

      <!-- Right Column -->
      <v-col cols="12" md="8">
        <!-- About -->
        <v-card rounded="xl" class="mb-4">
          <v-card-text class="pa-5">
            <p class="text-subtitle-2 font-weight-bold mb-3">About</p>
            <p class="text-body-2 text-medium-emphasis" style="line-height: 1.7">
              {{ provider.description }}
            </p>
          </v-card-text>
        </v-card>

        <!-- Availability -->
        <v-card rounded="xl" class="mb-4">
          <v-card-text class="pa-5">
            <p class="text-subtitle-2 font-weight-bold mb-4">Weekly Availability</p>
            <div class="d-flex flex-wrap ga-2">
              <v-chip
                v-for="slot in provider.timeSlots"
                :key="slot.day"
                size="small"
                variant="tonal"
                color="primary"
                rounded="lg"
              >
                <span class="text-capitalize">{{ slot.day }}</span>
                <span class="ms-1 text-caption">{{ slot.startTime }} - {{ slot.endTime }}</span>
              </v-chip>
            </div>
          </v-card-text>
        </v-card>

        <!-- Rating Summary -->
        <v-card rounded="xl" class="mb-4">
          <v-card-text class="pa-5">
            <p class="text-subtitle-2 font-weight-bold mb-4">Rating Summary</p>
            <div class="d-flex ga-6 align-center">
              <div class="text-center">
                <p class="text-h3 font-weight-bold">{{ provider.rating }}</p>
                <div class="d-flex ga-1 justify-center mb-1">
                  <v-icon
                    v-for="i in 5"
                    :key="i"
                    size="16"
                    :color="i <= Math.round(provider.rating) ? 'warning' : 'surface-variant'"
                  >
                    mdi-star
                  </v-icon>
                </div>
                <p class="text-caption text-medium-emphasis">{{ provider.totalReviews }} reviews</p>
              </div>

              <div class="flex-grow-1">
                <div
                  v-for="star in [5, 4, 3, 2, 1]"
                  :key="star"
                  class="d-flex align-center ga-2 mb-1"
                >
                  <span class="text-caption" style="width: 8px">{{ star }}</span>
                  <v-icon size="12" color="warning">mdi-star</v-icon>
                  <v-progress-linear
                    :model-value="starPercent(star)"
                    color="warning"
                    bg-color="surface-variant"
                    rounded
                    height="6"
                    class="flex-grow-1"
                  />
                  <span class="text-caption text-medium-emphasis" style="width: 28px">
                    {{ starPercent(star) }}%
                  </span>
                </div>
              </div>
            </div>
          </v-card-text>
        </v-card>

        <!-- Reviews -->
        <v-card rounded="xl">
          <v-card-text class="pa-5">
            <p class="text-subtitle-2 font-weight-bold mb-4">Reviews</p>

            <div class="d-flex flex-column ga-4">
              <div
                v-for="review in provider.reviews"
                :key="review.id"
              >
                <div class="d-flex align-start ga-3">
                  <v-avatar size="36">
                    <v-icon size="18">mdi-account</v-icon>
                  </v-avatar>
                  <div class="flex-grow-1">
                    <div class="d-flex align-center justify-space-between mb-1">
                      <p class="text-body-2 font-weight-medium">{{ review.reviewerName }}</p>
                      <span class="text-caption text-medium-emphasis">{{ review.date }}</span>
                    </div>
                    <div class="d-flex ga-1 mb-2">
                      <v-icon
                        v-for="i in 5"
                        :key="i"
                        size="12"
                        :color="i <= review.rating ? 'warning' : 'surface-variant'"
                      >
                        mdi-star
                      </v-icon>
                    </div>
                    <p class="text-body-2 text-medium-emphasis">{{ review.comment }}</p>
                  </div>
                </div>
                <v-divider class="mt-4" />
              </div>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Booking Dialog -->
    <v-dialog v-model="bookingDialog" max-width="500">
      <v-card rounded="xl">
        <v-card-title class="pa-6 pb-2">
          <span class="text-h6 font-weight-bold">Book Session</span>
        </v-card-title>

        <v-card-text class="pa-6 pt-2">
          <div class="d-flex align-center ga-3 mb-6">
            <v-avatar size="48" color="surface-variant">
              <v-icon>mdi-account</v-icon>
            </v-avatar>
            <div>
              <p class="font-weight-medium">{{ provider.name }}</p>
              <p class="text-caption text-medium-emphasis">{{ provider.title }}</p>
            </div>
          </div>

          <v-row class="mb-4">
            <v-col cols="6">
              <p class="text-caption text-medium-emphasis mb-1">Hourly Rate</p>
              <p class="font-weight-bold text-h6">{{ provider.hourlyRate }} pts/hr</p>
            </v-col>
            <v-col cols="6">
              <p class="text-caption text-medium-emphasis mb-1">Your Balance</p>
              <p class="font-weight-bold text-h6">1,250 pts</p>
            </v-col>
          </v-row>

          <p class="text-body-2 text-medium-emphasis mb-2">Session Duration</p>
          <v-btn-toggle
            v-model="selectedDuration"
            mandatory
            divided
            rounded="lg"
            class="mb-4 w-100"
          >
            <v-btn :value="30" class="flex-grow-1">30 min</v-btn>
            <v-btn :value="60" class="flex-grow-1">1 hour</v-btn>
            <v-btn :value="90" class="flex-grow-1">1.5 hrs</v-btn>
            <v-btn :value="120" class="flex-grow-1">2 hrs</v-btn>
          </v-btn-toggle>

          <v-card color="surface-variant" rounded="lg" class="pa-4">
            <div class="d-flex justify-space-between mb-2">
              <span class="text-body-2">Session cost</span>
              <span class="font-weight-medium">{{ sessionCost }} pts</span>
            </div>
            <div class="d-flex justify-space-between">
              <span class="text-body-2">Balance after</span>
              <span
                class="font-weight-medium"
                :class="{ 'text-error': 1250 - sessionCost < 0 }"
              >
                {{ 1250 - sessionCost }} pts
              </span>
            </div>
          </v-card>
        </v-card-text>

        <v-card-actions class="pa-6 pt-0 ga-2">
          <v-btn variant="outlined" class="flex-grow-1" @click="bookingDialog = false">
            Cancel
          </v-btn>
          <v-btn
            color="primary"
            class="flex-grow-1"
            :disabled="sessionCost > 1250"
            @click="confirmBooking"
          >
            Confirm Booking
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

const router = useRouter()

const bookingDialog = ref(false)
const selectedDuration = ref(60)

const provider = ref({
  id: '1',
  name: 'Somchai T.',
  title: 'Licensed Thai Massage Therapist',
  description: 'I am a fully licensed Thai massage therapist with over 9 years of experience in traditional Thai massage, deep tissue, and sports massage. I have worked with clients from all over the world and specialize in therapeutic massage for stress relief, muscle recovery, and overall wellness. My sessions are tailored to each individual client based on their needs and preferences.',
  hourlyRate: 500,
  rating: 4.9,
  totalReviews: 87,
  location: 'Bangkok, Thailand',
  yearsExperience: 9,
  languages: ['Thai', 'English'],
  isAvailable: true,
  tags: ['Thai Massage', 'Deep Tissue', 'Sports Massage', 'Weekend Available', 'Licensed'],
  timeSlots: [
    { day: 'monday', startTime: '09:00', endTime: '18:00' },
    { day: 'tuesday', startTime: '09:00', endTime: '18:00' },
    { day: 'wednesday', startTime: '09:00', endTime: '18:00' },
    { day: 'saturday', startTime: '10:00', endTime: '16:00' },
    { day: 'sunday', startTime: '10:00', endTime: '16:00' },
  ],
  starDistribution: { 5: 70, 4: 12, 3: 3, 2: 1, 1: 1 },
  reviews: [
    {
      id: '1',
      reviewerName: 'James K.',
      rating: 5,
      comment: 'Absolutely amazing session. Somchai is very professional and skilled. My back pain is completely gone after just one session.',
      date: 'Mar 10, 2026',
    },
    {
      id: '2',
      reviewerName: 'Sarah M.',
      rating: 5,
      comment: 'Best Thai massage I have ever had. Very knowledgeable and attentive to my needs. Will definitely book again.',
      date: 'Mar 5, 2026',
    },
    {
      id: '3',
      reviewerName: 'David L.',
      rating: 4,
      comment: 'Great experience overall. Very professional and punctual. The session was very relaxing and therapeutic.',
      date: 'Feb 28, 2026',
    },
  ],
})

const sessionCost = computed(() => {
  return Math.round((provider.value.hourlyRate / 60) * selectedDuration.value)
})

function starPercent(star: number) {
  const dist = provider.value.starDistribution as Record<number, number>
  const total = Object.values(dist).reduce((a, b) => a + b, 0)
  return Math.round(((dist[star] ?? 0) / total) * 100)
}

function confirmBooking() {
  bookingDialog.value = false
  toast.success(`Booking request sent to ${provider.value.name}`)
  router.push({ name: 'bookings' })
}
</script>