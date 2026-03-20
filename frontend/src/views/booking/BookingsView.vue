<template>
  <div>
    <div class="d-flex align-center justify-space-between mb-6">
      <div>
        <h1 class="text-h4 font-weight-bold mb-1">Bookings</h1>
        <p class="text-body-1 text-medium-emphasis">Manage your service bookings</p>
      </div>
    </div>

    <!-- Tabs -->
    <v-tabs v-model="activeTab" class="mb-6" color="primary">
      <v-tab value="all">All</v-tab>
      <v-tab value="pending">Pending</v-tab>
      <v-tab value="accepted">Accepted</v-tab>
      <v-tab value="completed">Completed</v-tab>
      <v-tab value="cancelled">Cancelled</v-tab>
    </v-tabs>

    <!-- Booking List -->
    <div v-if="filteredBookings.length > 0" class="d-flex flex-column ga-3">
      <v-card
        v-for="booking in filteredBookings"
        :key="booking.id"
        rounded="xl"
        :to="`/bookings/${booking.id}`"
      >
        <v-card-text class="pa-5">
          <div class="d-flex align-start ga-4">
            <v-avatar size="48" class="flex-shrink-0">
              <v-icon>mdi-account</v-icon>
            </v-avatar>

            <div class="flex-grow-1" style="min-width: 0">
              <div class="d-flex align-start justify-space-between ga-2 mb-1">
                <div>
                  <p class="font-weight-bold">{{ booking.providerName }}</p>
                  <p class="text-caption text-medium-emphasis">{{ booking.service }}</p>
                </div>
                <v-chip
                  :color="statusColor(booking.status)"
                  variant="tonal"
                  size="small"
                  rounded="lg"
                  class="flex-shrink-0"
                >
                  {{ booking.status }}
                </v-chip>
              </div>

              <div class="d-flex align-center ga-4 mt-2">
                <div class="d-flex align-center ga-1">
                  <v-icon size="14" class="text-medium-emphasis">mdi-calendar-outline</v-icon>
                  <span class="text-caption text-medium-emphasis">{{ booking.date }}</span>
                </div>
                <div class="d-flex align-center ga-1">
                  <v-icon size="14" class="text-medium-emphasis">mdi-clock-outline</v-icon>
                  <span class="text-caption text-medium-emphasis">{{ booking.duration }} mins</span>
                </div>
                <div class="d-flex align-center ga-1">
                  <v-icon size="14" class="text-medium-emphasis">mdi-wallet-outline</v-icon>
                  <span class="text-caption text-medium-emphasis">{{ booking.cost }} pts</span>
                </div>
              </div>
            </div>

            <v-icon size="16" class="text-medium-emphasis flex-shrink-0 mt-1">
              mdi-chevron-right
            </v-icon>
          </div>
        </v-card-text>
      </v-card>
    </div>

    <!-- Empty State -->
    <div v-else class="text-center py-16">
      <v-icon size="64" class="mb-4 text-medium-emphasis">mdi-calendar-outline</v-icon>
      <h3 class="text-h6 font-weight-bold mb-2">No bookings found</h3>
      <p class="text-body-2 text-medium-emphasis mb-4">
        {{ activeTab === 'all' ? 'You have no bookings yet' : `No ${activeTab} bookings` }}
      </p>
      <v-btn color="primary" prepend-icon="mdi-magnify" to="/search">
        Find a Provider
      </v-btn>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

const activeTab = ref('all')

const bookings = ref([
  {
    id: '1',
    providerName: 'Somchai T.',
    service: 'Thai Massage',
    date: 'Mar 15, 2026',
    duration: 60,
    cost: 500,
    status: 'completed',
  },
  {
    id: '2',
    providerName: 'Napat K.',
    service: 'Language Tutor',
    date: 'Mar 18, 2026',
    duration: 60,
    cost: 400,
    status: 'pending',
  },
  {
    id: '3',
    providerName: 'Malee S.',
    service: 'Personal Chef',
    date: 'Mar 10, 2026',
    duration: 120,
    cost: 1600,
    status: 'completed',
  },
  {
    id: '4',
    providerName: 'Prasit W.',
    service: 'Tour Guide',
    date: 'Mar 8, 2026',
    duration: 60,
    cost: 600,
    status: 'cancelled',
  },
  {
    id: '5',
    providerName: 'Siriporn L.',
    service: 'Yoga Session',
    date: 'Mar 20, 2026',
    duration: 60,
    cost: 450,
    status: 'accepted',
  },
])

const filteredBookings = computed(() => {
  if (activeTab.value === 'all') return bookings.value
  return bookings.value.filter((b) => b.status === activeTab.value)
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
</script>