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

    <v-row>
      <v-col cols="12" md="7">
        <!-- Booking Status Card -->
        <v-card rounded="xl" class="mb-4">
          <v-card-text class="pa-6">
            <div class="d-flex align-center justify-space-between mb-6">
              <div>
                <p class="text-caption text-medium-emphasis mb-1">Booking ID</p>
                <p class="text-body-2 font-weight-medium">#{{ booking.id }}</p>
              </div>
              <v-chip
                :color="statusColor(booking.status)"
                variant="tonal"
                size="default"
                rounded="lg"
              >
                {{ booking.status }}
              </v-chip>
            </div>

            <!-- Provider Info -->
            <div class="d-flex align-center ga-3 mb-6">
              <v-avatar size="56">
                <v-icon size="28">mdi-account</v-icon>
              </v-avatar>
              <div>
                <p class="font-weight-bold text-body-1">{{ booking.providerName }}</p>
                <p class="text-caption text-medium-emphasis">{{ booking.service }}</p>
              </div>
            </div>

            <!-- Booking Details -->
            <v-divider class="mb-4" />

            <div class="d-flex flex-column ga-3">
              <div class="d-flex justify-space-between">
                <div class="d-flex align-center ga-2">
                  <v-icon size="16" class="text-medium-emphasis">mdi-calendar-outline</v-icon>
                  <span class="text-body-2 text-medium-emphasis">Date</span>
                </div>
                <span class="text-body-2 font-weight-medium">{{ booking.date }}</span>
              </div>

              <div class="d-flex justify-space-between">
                <div class="d-flex align-center ga-2">
                  <v-icon size="16" class="text-medium-emphasis">mdi-clock-outline</v-icon>
                  <span class="text-body-2 text-medium-emphasis">Duration</span>
                </div>
                <span class="text-body-2 font-weight-medium">{{ booking.duration }} minutes</span>
              </div>

              <div class="d-flex justify-space-between">
                <div class="d-flex align-center ga-2">
                  <v-icon size="16" class="text-medium-emphasis">mdi-wallet-outline</v-icon>
                  <span class="text-body-2 text-medium-emphasis">Cost</span>
                </div>
                <span class="text-body-2 font-weight-medium">{{ booking.cost }} pts</span>
              </div>

              <div class="d-flex justify-space-between">
                <div class="d-flex align-center ga-2">
                  <v-icon size="16" class="text-medium-emphasis">mdi-cash-multiple</v-icon>
                  <span class="text-body-2 text-medium-emphasis">Rate</span>
                </div>
                <span class="text-body-2 font-weight-medium">{{ booking.hourlyRate }} pts/hr</span>
              </div>
            </div>
          </v-card-text>
        </v-card>

        <!-- Search Query Card -->
        <v-card rounded="xl" class="mb-4">
          <v-card-text class="pa-5">
            <p class="text-subtitle-2 font-weight-bold mb-3">Your Original Request</p>
            <v-card color="surface-variant" rounded="lg" class="pa-4">
              <div class="d-flex ga-2 align-center">
                <v-icon size="16" class="text-medium-emphasis flex-shrink-0">
                  mdi-text-search
                </v-icon>
                <p class="text-body-2 text-medium-emphasis">{{ booking.query }}</p>
              </div>
            </v-card>
          </v-card-text>
        </v-card>

        <!-- Provider Response -->
        <v-card rounded="xl">
          <v-card-text class="pa-5">
            <p class="text-subtitle-2 font-weight-bold mb-3">Provider Response</p>
            <v-card color="surface-variant" rounded="lg" class="pa-4">
              <div class="d-flex ga-2 align-center">
                <v-icon size="16" class="text-medium-emphasis flex-shrink-0">
                  mdi-message-outline
                </v-icon>
                <p class="text-body-2 text-medium-emphasis">{{ booking.providerResponse }}</p>
              </div>
            </v-card>
          </v-card-text>
        </v-card>
      </v-col>

      <!-- Right Column — Actions -->
      <v-col cols="12" md="5">
        <v-card rounded="xl" class="mb-4">
          <v-card-text class="pa-5">
            <p class="text-subtitle-2 font-weight-bold mb-4">Actions</p>

            <div class="d-flex flex-column ga-3">
              <!-- Go to Session -->
              <v-btn
                v-if="booking.status === 'accepted'"
                color="primary"
                block
                prepend-icon="mdi-chat-outline"
                :to="`/chat/${booking.sessionId}`"
              >
                Go to Session
              </v-btn>

              <!-- Cancel -->
              <v-btn
                v-if="['pending', 'accepted'].includes(booking.status)"
                variant="outlined"
                color="error"
                block
                prepend-icon="mdi-close-circle-outline"
                @click="cancelDialog = true"
              >
                Cancel Booking
              </v-btn>

              <!-- Report -->
              <v-btn
                v-if="booking.status === 'completed'"
                variant="outlined"
                block
                prepend-icon="mdi-flag-outline"
                @click="reportDialog = true"
              >
                Report Issue
              </v-btn>

              <!-- View Provider -->
              <v-btn
                variant="outlined"
                block
                prepend-icon="mdi-account-outline"
                :to="`/providers/${booking.providerId}`"
              >
                View Provider Profile
              </v-btn>
            </div>
          </v-card-text>
        </v-card>

        <!-- Timeline -->
        <v-card rounded="xl">
          <v-card-text class="pa-5">
            <p class="text-subtitle-2 font-weight-bold mb-4">Timeline</p>
            <v-timeline density="compact" side="end" truncate-line="both">
              <v-timeline-item
                v-for="event in booking.timeline"
                :key="event.id"
                :dot-color="event.color"
                size="x-small"
              >
                <div>
                  <p class="text-body-2 font-weight-medium">{{ event.title }}</p>
                  <p class="text-caption text-medium-emphasis">{{ event.time }}</p>
                </div>
              </v-timeline-item>
            </v-timeline>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Cancel Dialog -->
    <v-dialog v-model="cancelDialog" max-width="400">
      <v-card rounded="xl">
        <v-card-text class="pa-6">
          <div class="text-center mb-4">
            <v-icon size="48" color="error" class="mb-3">mdi-alert-circle-outline</v-icon>
            <h3 class="text-h6 font-weight-bold mb-2">Cancel Booking</h3>
            <p class="text-body-2 text-medium-emphasis">
              Are you sure you want to cancel this booking? Your locked funds will be returned.
            </p>
          </div>
        </v-card-text>
        <v-card-actions class="pa-6 pt-0 ga-2">
          <v-btn variant="outlined" class="flex-grow-1" @click="cancelDialog = false">
            Keep Booking
          </v-btn>
          <v-btn color="error" class="flex-grow-1" @click="confirmCancel">
            Cancel Booking
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Report Dialog -->
    <v-dialog v-model="reportDialog" max-width="500">
      <v-card rounded="xl">
        <v-card-title class="pa-6 pb-2">
          <span class="text-h6 font-weight-bold">Report Issue</span>
        </v-card-title>
        <v-card-text class="pa-6 pt-2">
          <v-select
            v-model="reportReason"
            :items="reportReasons"
            label="Reason"
            variant="outlined"
            density="comfortable"
            class="mb-3"
          />
          <v-textarea
            v-model="reportDescription"
            label="Description"
            variant="outlined"
            rows="3"
            placeholder="Describe the issue in detail..."
          />
        </v-card-text>
        <v-card-actions class="pa-6 pt-0 ga-2">
          <v-btn variant="outlined" class="flex-grow-1" @click="reportDialog = false">
            Cancel
          </v-btn>
          <v-btn color="primary" class="flex-grow-1" @click="submitReport">
            Submit Report
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { toast } from '@/composables/useToast'

const router = useRouter()

const cancelDialog = ref(false)
const reportDialog = ref(false)
const reportReason = ref('')
const reportDescription = ref('')

const reportReasons = [
  'Provider did not deliver service',
  'Inappropriate behaviour',
  'Fraud or scam',
  'Misleading information',
  'Other',
]

const booking = ref({
  id: 'BK-20260318-001',
  providerId: '1',
  providerName: 'Napat K.',
  service: 'Language Tutor',
  date: 'Mar 18, 2026',
  duration: 60,
  cost: 400,
  hourlyRate: 400,
  status: 'accepted',
  sessionId: 'session-123',
  query: 'I need a Thai language tutor available on weekday evenings in Bangkok for beginner lessons.',
  providerResponse: 'I have been teaching Thai to foreigners for 6 years. I am available Monday to Friday evenings from 6pm onwards. I specialize in teaching beginners with a structured curriculum.',
  timeline: [
    { id: '1', title: 'Booking created', time: 'Mar 17, 2026 at 2:30 PM', color: 'primary' },
    { id: '2', title: 'Provider accepted', time: 'Mar 17, 2026 at 4:15 PM', color: 'success' },
    { id: '3', title: 'Session scheduled', time: 'Mar 18, 2026 at 7:00 PM', color: 'info' },
  ],
})

function statusColor(status: string) {
  const map: Record<string, string> = {
    completed: 'success',
    pending: 'warning',
    cancelled: 'error',
    accepted: 'info',
    refunded: 'secondary',
  }
  return map[status] ?? 'default'
}

function confirmCancel() {
  cancelDialog.value = false
  booking.value.status = 'cancelled'
  toast.success('Booking cancelled successfully')
}

function submitReport() {
  reportDialog.value = false
  toast.success('Report submitted successfully')
}
</script>