<template>
  <div>
    <div class="mb-8">
      <div class="d-flex align-center ga-2 mb-1">
        <v-icon size="28">mdi-hand-wave-outline</v-icon>
        <h1 class="text-h4 font-weight-bold">
           Good {{ timeOfDay }}, {{ authStore.user?.firstName }}
        </h1>
      </div>
      <p class="text-body-1 text-medium-emphasis">What service are you looking for today?</p>
    </div>

    <!-- Search Card -->
    <v-card class="mb-8" rounded="xl">
      <v-card-text class="pa-6">
        <p class="text-subtitle-1 font-weight-medium mb-3">Find a Provider</p>
        <div class="d-flex ga-3">
          <v-text-field
            v-model="searchQuery"
            placeholder="e.g. I need a Thai massage therapist available on weekends in Bangkok..."
            prepend-inner-icon="mdi-magnify"
            hide-details
            class="flex-grow-1"
            @keyup.enter="goToSearch"
          />
          <v-btn
            color="primary"
            size="large"
            icon="mdi-arrow-right"
            @click="goToSearch"
          />
        </div>
      </v-card-text>
    </v-card>

    <!-- Stats Row -->
    <v-row class="mb-8">
      <v-col cols="12" sm="6" md="3">
        <v-card rounded="xl" height="100%">
          <v-card-text class="pa-5">
            <div class="d-flex align-center justify-space-between mb-3">
              <span class="text-body-2 text-medium-emphasis">Wallet Balance</span>
              <v-icon color="primary" size="20">mdi-wallet-outline</v-icon>
            </div>
            <p class="text-h5 font-weight-bold mb-1">{{ wallet.available }} pts</p>
            <p class="text-caption text-medium-emphasis">{{ wallet.locked }} pts locked</p>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" sm="6" md="3">
        <v-card rounded="xl" height="100%">
          <v-card-text class="pa-5">
            <div class="d-flex align-center justify-space-between mb-3">
              <span class="text-body-2 text-medium-emphasis">Total Sessions</span>
              <v-icon color="primary" size="20">mdi-calendar-check-outline</v-icon>
            </div>
            <p class="text-h5 font-weight-bold mb-1">{{ stats.totalSessions }}</p>
            <p class="text-caption text-medium-emphasis">{{ stats.thisMonth }} this month</p>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" sm="6" md="3">
        <v-card rounded="xl" height="100%">
          <v-card-text class="pa-5">
            <div class="d-flex align-center justify-space-between mb-3">
              <span class="text-body-2 text-medium-emphasis">Active Booking</span>
              <v-icon color="primary" size="20">mdi-clock-outline</v-icon>
            </div>
            <p class="text-h5 font-weight-bold mb-1">{{ stats.activeBookings }}</p>
            <p class="text-caption text-medium-emphasis">pending provider response</p>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" sm="6" md="3">
        <v-card rounded="xl" height="100%">
          <v-card-text class="pa-5">
            <div class="d-flex align-center justify-space-between mb-3">
              <span class="text-body-2 text-medium-emphasis">Pending Reviews</span>
              <v-icon color="primary" size="20">mdi-star-outline</v-icon>
            </div>
            <p class="text-h5 font-weight-bold mb-1">{{ stats.pendingReviews }}</p>
            <p class="text-caption text-medium-emphasis">sessions to review</p>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <v-row>
      <v-col cols="12" md="7">
        <div class="d-flex align-center justify-space-between mb-4">
          <h2 class="text-h6 font-weight-bold">Recent Bookings</h2>
          <v-btn variant="text" size="small" to="/bookings">View all</v-btn>
        </div>

        <v-card rounded="xl">
          <v-list lines="two" class="pa-2">
            <template v-for="(booking, i) in recentBookings" :key="booking.id">
              <v-list-item
                :to="`/bookings/${booking.id}`"
                rounded="lg"
                class="mb-1"
              >
                <template #prepend>
                  <v-avatar size="44">
                    <v-icon>mdi-account</v-icon>
                  </v-avatar>
                </template>

                <template #title>
                  <span class="font-weight-medium">{{ booking.providerName }}</span>
                </template>

                <template #subtitle>
                  <span class="text-caption">{{ booking.service }} · {{ booking.date }}</span>
                </template>

                <template #append>
                  <v-chip
                    :color="statusColor(booking.status)"
                    size="small"
                    variant="tonal"
                    rounded="lg"
                  >
                    {{ booking.status }}
                  </v-chip>
                </template>
              </v-list-item>
              <v-divider v-if="i < recentBookings.length - 1" class="mx-4" />
            </template>
          </v-list>
        </v-card>
      </v-col>

      <v-col cols="12" md="5">
        <div class="d-flex align-center mb-4">
          <h2 class="text-h6 font-weight-bold">Quick Actions</h2>
        </div>

        <v-card rounded="xl" class="mb-4">
          <v-list class="pa-2">
            <v-list-item
              v-for="action in quickActions"
              :key="action.label"
              :prepend-icon="action.icon"
              :title="action.label"
              :subtitle="action.subtitle"
              :to="action.to"
              rounded="lg"
              class="mb-1"
            >
              <template #append>
                <v-icon size="16" class="text-medium-emphasis">mdi-chevron-right</v-icon>
              </template>
            </v-list-item>
          </v-list>
        </v-card>

        <div class="d-flex align-center justify-space-between mb-4">
          <h2 class="text-h6 font-weight-bold">Recent Notifications</h2>
          <v-btn variant="text" size="small" to="/notifications">View all</v-btn>
        </div>

        <v-card rounded="xl">
          <v-list class="pa-2">
            <v-list-item
              v-for="notif in recentNotifications"
              :key="notif.id"
              :title="notif.title"
              :subtitle="notif.time"
              rounded="lg"
              class="mb-1"
            >
              <template #prepend>
                <v-avatar :color="notif.color" size="36" variant="tonal">
                  <v-icon size="18">{{ notif.icon }}</v-icon>
                </v-avatar>
              </template>
            </v-list-item>
          </v-list>
        </v-card>
      </v-col>
    </v-row>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()
const searchQuery = ref('')

const timeOfDay = computed(() => {
  const hour = new Date().getHours()
  if (hour < 12) return 'morning'
  if (hour < 17) return 'afternoon'
  return 'evening'
})

const wallet = ref({ available: 1250, locked: 500 })
const stats = ref({ totalSessions: 12, thisMonth: 3, activeBookings: 1, pendingReviews: 2 })

const recentBookings = ref([
  { id: '1', providerName: 'Somchai T.', service: 'Thai Massage', date: 'Mar 15, 2026', status: 'completed' },
  { id: '2', providerName: 'Napat K.', service: 'Language Tutor', date: 'Mar 14, 2026', status: 'pending' },
  { id: '3', providerName: 'Malee S.', service: 'Personal Chef', date: 'Mar 10, 2026', status: 'completed' },
  { id: '4', providerName: 'Prasit W.', service: 'Tour Guide', date: 'Mar 8, 2026', status: 'cancelled' },
])

const quickActions = ref([
  { label: 'Find a Provider', subtitle: 'Search with AI matching', icon: 'mdi-magnify', to: '/search' },
  { label: 'My Bookings', subtitle: 'View all your bookings', icon: 'mdi-calendar-outline', to: '/bookings' },
  { label: 'Wallet', subtitle: 'Manage your balance', icon: 'mdi-wallet-outline', to: '/wallet' },
  { label: 'Become a Provider', subtitle: 'Offer your services', icon: 'mdi-briefcase-outline', to: '/profile/provider' },
])

const recentNotifications = ref([
  { id: '1', title: 'Booking accepted by Napat K.', time: '2 hours ago', icon: 'mdi-calendar-check', color: 'success' },
  { id: '2', title: 'Session ending in 5 minutes', time: '1 day ago', icon: 'mdi-clock-alert', color: 'warning' },
  { id: '3', title: 'Review your session with Malee S.', time: '3 days ago', icon: 'mdi-star', color: 'primary' },
])

function statusColor(status: string) {
  const map: Record<string, string> = {
    completed: 'success',
    pending: 'warning',
    cancelled: 'error',
    accepted: 'info',
  }
  return map[status] ?? 'default'
}

function goToSearch() {
  router.push({ name: 'search', query: searchQuery.value ? { q: searchQuery.value } : {} })
}
</script>