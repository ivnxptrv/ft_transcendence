<template>
  <div>
    <!-- Header -->
    <div class="mb-6">
      <h1 class="text-h4 font-weight-bold mb-1">{{ t('nav.search') }}</h1>
      <p class="text-body-1 text-medium-emphasis">Describe the service you need in your own words</p>
    </div>

    <!-- Search Input -->
    <v-card rounded="xl" class="mb-6">
      <v-card-text class="pa-5">
        <v-textarea
          v-model="query"
          placeholder="e.g. I need a licensed Thai massage therapist available on weekends in Bangkok with at least 5 years experience..."
          prepend-inner-icon="mdi-text-search"
          rows="3"
          auto-grow
          hide-details
          :disabled="isSearching"
          class="mb-4"
        />
        <div class="d-flex align-center justify-space-between">
          <span class="text-caption text-medium-emphasis">
            <v-icon size="14" class="me-1">mdi-information-outline</v-icon>
            Be as specific as possible for better matches
          </span>
          <div class="d-flex ga-2">
            <v-btn
              v-if="hasResults"
              variant="outlined"
              @click="resetSearch"
            >
              New Search
            </v-btn>
            <v-btn
              color="primary"
              prepend-icon="mdi-magnify"
              :loading="isSearching"
              :disabled="!query.trim()"
              @click="startSearch"
            >
              Search
            </v-btn>
          </div>
        </div>
      </v-card-text>
    </v-card>

    <!-- Searching State -->
    <div v-if="isSearching" class="mb-6">
      <v-card rounded="xl" class="pa-6">
        <div class="d-flex align-center ga-4 mb-4">
          <v-progress-circular indeterminate color="primary" size="24" width="2" />
          <div>
            <p class="text-body-1 font-weight-medium">Finding providers for you...</p>
            <p class="text-caption text-medium-emphasis">
              Notified {{ notifiedCount }} providers — waiting for responses
            </p>
          </div>
        </div>
        <v-progress-linear
          :model-value="windowProgress"
          color="primary"
          rounded
          height="4"
          bg-color="surface-variant"
        />
        <div class="d-flex justify-space-between mt-1">
          <span class="text-caption text-medium-emphasis">Window closes in {{ timeLeft }}s</span>
          <span class="text-caption text-medium-emphasis">{{ results.length }} responses so far</span>
        </div>
      </v-card>
    </div>

    <!-- Results -->
    <div v-if="hasResults">
      <div class="d-flex align-center justify-space-between mb-4">
        <div>
          <h2 class="text-h6 font-weight-bold">
            {{ results.length }} Provider{{ results.length !== 1 ? 's' : '' }} Responded
          </h2>
          <p class="text-caption text-medium-emphasis">Sorted by match score</p>
        </div>
        <v-chip
          v-if="!isSearching"
          color="success"
          variant="tonal"
          prepend-icon="mdi-check-circle-outline"
          size="small"
        >
          Search complete
        </v-chip>
      </div>

      <v-row>
		  <v-col
		    v-for="provider in results"
		    :key="provider.id"
		    cols="12"
		  >
		    <ProviderCard
		      :provider="provider"
		      @book="openBookingDialog(provider)"
		      @view="router.push(`/providers/${provider.id}`)"
		    />
		  </v-col>
		</v-row>

      <!-- Load More -->
      <div v-if="!isSearching && hasMore" class="d-flex justify-center mt-6">
        <v-btn
          variant="outlined"
          prepend-icon="mdi-refresh"
          :loading="isLoadingMore"
          @click="loadMore"
        >
          Load More Providers
        </v-btn>
      </div>

      <!-- No more -->
      <div v-if="!isSearching && !hasMore && results.length > 0" class="text-center mt-6">
        <p class="text-caption text-medium-emphasis">No more providers available for this search</p>
      </div>
    </div>

    <!-- Empty State -->
    <div v-if="!isSearching && !hasResults && hasSearched" class="text-center py-16">
      <v-icon size="64" class="mb-4 text-medium-emphasis">mdi-account-search-outline</v-icon>
      <h3 class="text-h6 font-weight-bold mb-2">No providers responded</h3>
      <p class="text-body-2 text-medium-emphasis mb-4">
        Try rephrasing your request or searching at a different time
      </p>
      <v-btn color="primary" @click="resetSearch">Try Again</v-btn>
    </div>

    <!-- Initial State -->
    <div v-if="!isSearching && !hasSearched" class="text-center py-16">
      <v-icon size="64" class="mb-4 text-medium-emphasis">mdi-text-search</v-icon>
      <h3 class="text-h6 font-weight-bold mb-2">Describe what you need</h3>
      <p class="text-body-2 text-medium-emphasis">
        Our AI will match you with the best providers for your request
      </p>
    </div>

    <!-- Booking Dialog -->
    <v-dialog v-model="bookingDialog" max-width="500">
      <v-card rounded="xl">
        <v-card-title class="pa-6 pb-2">
          <span class="text-h6 font-weight-bold">Book Session</span>
        </v-card-title>
        <v-card-text class="pa-6 pt-2" v-if="selectedProvider">
          <div class="d-flex align-center ga-3 mb-6">
            <v-avatar size="48" color="surface-variant">
              <v-icon>mdi-account</v-icon>
            </v-avatar>
            <div>
              <p class="font-weight-medium">{{ selectedProvider.name }}</p>
              <p class="text-caption text-medium-emphasis">{{ selectedProvider.title }}</p>
            </div>
          </div>

          <v-row class="mb-4">
            <v-col cols="6">
              <p class="text-caption text-medium-emphasis mb-1">Hourly Rate</p>
              <p class="font-weight-bold text-h6">{{ selectedProvider.hourlyRate }} pts/hr</p>
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
          <v-btn variant="outlined" @click="bookingDialog = false" class="flex-grow-1">
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
import { ref, computed, onUnmounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { toast } from '@/composables/useToast'
import ProviderCard from '@/components/search/ProviderCard.vue'

const { t } = useI18n()
const router = useRouter()

const query = ref('')
const isSearching = ref(false)
const isLoadingMore = ref(false)
const hasSearched = ref(false)
const hasMore = ref(true)
const notifiedCount = ref(0)
const timeLeft = ref(30)
const windowProgress = ref(100)

const results = ref<any[]>([])
const bookingDialog = ref(false)
const selectedProvider = ref<any>(null)
const selectedDuration = ref(60)

let searchTimer: ReturnType<typeof setInterval> | null = null
let countdownTimer: ReturnType<typeof setInterval> | null = null

const hasResults = computed(() => results.value.length > 0)

const sessionCost = computed(() => {
  if (!selectedProvider.value) return 0
  return Math.round((selectedProvider.value.hourlyRate / 60) * selectedDuration.value)
})

const mockProviders = [
  { id: '1', name: 'Somchai T.', title: 'Licensed Thai Massage Therapist', hourlyRate: 500, rating: 4.9, totalReviews: 87, location: 'Bangkok', tags: ['Thai Massage', 'Deep Tissue', 'Weekend Available'], responseMessage: 'I am available this weekend and have 9 years of experience in traditional Thai massage.' },
  { id: '2', name: 'Napat K.', title: 'Professional Thai & English Tutor', hourlyRate: 400, rating: 4.7, totalReviews: 52, location: 'Bangkok', tags: ['Language Tutor', 'Thai', 'English'], responseMessage: 'I can help you with Thai language learning. I have taught over 200 students.' },
  { id: '3', name: 'Malee S.', title: 'Personal Chef — Thai Cuisine', hourlyRate: 800, rating: 4.8, totalReviews: 34, location: 'Bangkok', tags: ['Thai Cuisine', 'Personal Chef', 'Catering'], responseMessage: 'I specialize in authentic Thai cuisine and can cook for any occasion.' },
  { id: '4', name: 'Prasit W.', title: 'Licensed Bangkok Tour Guide', hourlyRate: 600, rating: 4.6, totalReviews: 120, location: 'Bangkok', tags: ['Tour Guide', 'Bangkok', 'Licensed'], responseMessage: 'I know Bangkok like the back of my hand. Available any day of the week.' },
  { id: '5', name: 'Siriporn L.', title: 'Yoga & Wellness Instructor', hourlyRate: 450, rating: 4.8, totalReviews: 61, location: 'Bangkok', tags: ['Yoga', 'Wellness', 'Meditation'], responseMessage: 'I offer personalized yoga sessions for all levels, including beginners.' },
  { id: '6', name: 'Thanawat R.', title: 'Professional Photographer', hourlyRate: 1200, rating: 4.9, totalReviews: 43, location: 'Bangkok', tags: ['Photography', 'Portrait', 'Events'], responseMessage: 'I can capture any moment beautifully. Portfolio available on request.' },
]

function startSearch() {
  if (!query.value.trim()) return

  isSearching.value = true
  hasSearched.value = true
  results.value = []
  notifiedCount.value = 10
  timeLeft.value = 30
  windowProgress.value = 100

  let providerIndex = 0

  searchTimer = setInterval(() => {
    if (providerIndex < mockProviders.length && results.value.length < 4) {
      results.value.push(mockProviders[providerIndex])
      providerIndex++
    }
  }, 1500)

  countdownTimer = setInterval(() => {
    timeLeft.value--
    windowProgress.value = (timeLeft.value / 30) * 100

    if (timeLeft.value <= 0) {
      stopSearch()
    }
  }, 1000)
}

function stopSearch() {
  isSearching.value = false
  if (searchTimer) clearInterval(searchTimer)
  if (countdownTimer) clearInterval(countdownTimer)
}

function resetSearch() {
  stopSearch()
  query.value = ''
  results.value = []
  hasSearched.value = false
  hasMore.value = true
  notifiedCount.value = 0
  timeLeft.value = 30
  windowProgress.value = 100
}

async function loadMore() {
  isLoadingMore.value = true
  await new Promise((r) => setTimeout(r, 1500))

  const remaining = mockProviders.slice(results.value.length)
  if (remaining.length > 0) {
    results.value.push(...remaining.slice(0, 2))
  }

  if (results.value.length >= mockProviders.length) {
    hasMore.value = false
  }

  isLoadingMore.value = false
}

function openBookingDialog(provider: any) {
  selectedProvider.value = provider
  bookingDialog.value = true
}

function confirmBooking() {
  bookingDialog.value = false
  toast.success(`Booking request sent to ${selectedProvider.value.name}`)
  router.push({ name: 'bookings' })
}

onUnmounted(() => {
  stopSearch()
})
</script>