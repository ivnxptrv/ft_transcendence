<template>
  <div>
    <div class="d-flex align-center justify-space-between mb-6">
      <div>
        <h1 class="text-h4 font-weight-bold mb-1">Notifications</h1>
        <p class="text-body-1 text-medium-emphasis">Stay up to date with your activity</p>
      </div>
      <v-btn
        v-if="unreadCount > 0"
        variant="outlined"
        size="small"
        prepend-icon="mdi-check-all"
        @click="markAllRead"
      >
        Mark all read
      </v-btn>
    </div>

    <v-tabs v-model="activeTab" class="mb-6" color="primary">
      <v-tab value="all">
        All
        <v-badge
          v-if="unreadCount > 0"
          :content="unreadCount"
          color="error"
          inline
          class="ms-2"
        />
      </v-tab>
      <v-tab value="unread">Unread</v-tab>
      <v-tab value="info">Info</v-tab>
      <v-tab value="warning">Warning</v-tab>
    </v-tabs>

    <v-card rounded="xl">
      <v-list class="pa-2">
        <template v-if="filteredNotifications.length > 0">
          <template v-for="(notif, i) in filteredNotifications" :key="notif.id">
            <v-list-item
              :class="{ 'bg-surface-variant': !notif.isRead }"
              rounded="lg"
              class="mb-1 py-3"
              @click="openDetail(notif)"
            >
              <template #prepend>
                <v-avatar :color="severityColor(notif.severity)" variant="tonal" size="40">
                  <v-icon size="20">{{ notif.icon }}</v-icon>
                </v-avatar>
              </template>

              <template #title>
                <div class="d-flex align-center ga-2">
                  <span class="text-body-2 font-weight-medium text-secondary">{{ notif.title }}</span>
                  <v-badge v-if="!notif.isRead" dot color="primary" inline />
                </div>
              </template>

              <template #subtitle>
                <p class="text-caption text-medium-emphasis mt-1 text-truncate">{{ notif.body }}</p>
                <p class="text-caption text-medium-emphasis mt-1">{{ notif.time }}</p>
              </template>

              <template #append>
                <div class="d-flex flex-column align-end ga-1">
                  <v-chip
                    :color="severityColor(notif.severity)"
                    size="x-small"
                    variant="tonal"
                    rounded="lg"
                  >
                    {{ notif.severity }}
                  </v-chip>
                  <v-btn
                    icon="mdi-close"
                    size="x-small"
                    variant="text"
                    @click.stop="dismiss(notif)"
                  />
                </div>
              </template>
            </v-list-item>

            <v-divider v-if="i < filteredNotifications.length - 1" class="mx-2" />
          </template>
        </template>

        <div v-else class="text-center py-16">
          <v-icon size="64" class="mb-4 text-medium-emphasis">mdi-bell-outline</v-icon>
          <h3 class="text-h6 font-weight-bold mb-2">No notifications</h3>
          <p class="text-body-2 text-medium-emphasis">
            {{ activeTab === 'unread' ? 'You are all caught up' : 'Nothing here yet' }}
          </p>
        </div>
      </v-list>
    </v-card>

    <!-- Detail Dialog -->
    <v-dialog v-model="detailDialog" max-width="480">
      <v-card v-if="selectedNotif" rounded="xl">
        <v-card-text class="pa-6">
          <div class="d-flex align-start ga-4 mb-4">
            <v-avatar :color="severityColor(selectedNotif.severity)" variant="tonal" size="48">
              <v-icon size="24">{{ selectedNotif.icon }}</v-icon>
            </v-avatar>
            <div class="flex-grow-1" style="min-width: 0">
              <div class="d-flex align-center justify-space-between ga-2 mb-1">
                <p class="text-body-1 font-weight-bold">{{ selectedNotif.title }}</p>
                <v-chip
                  :color="severityColor(selectedNotif.severity)"
                  size="x-small"
                  variant="tonal"
                  rounded="lg"
                  class="flex-shrink-0"
                >
                  {{ selectedNotif.severity }}
                </v-chip>
              </div>
              <p class="text-caption text-medium-emphasis">{{ selectedNotif.time }}</p>
            </div>
          </div>

          <v-divider class="mb-4" />

          <p class="text-body-2" style="line-height: 1.7">{{ selectedNotif.body }}</p>
        </v-card-text>

        <v-card-actions class="pa-6 pt-0 ga-2">
          <v-btn
            variant="outlined"
            prepend-icon="mdi-delete-outline"
            color="error"
            class="flex-grow-1"
            @click="dismissSelected"
          >
            Dismiss
          </v-btn>
          <v-btn
            color="primary"
            class="flex-grow-1"
            @click="detailDialog = false"
          >
            Close
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { toast } from '@/composables/useToast'

const activeTab = ref('all')
const detailDialog = ref(false)
const selectedNotif = ref<any>(null)

const notifications = ref([
  {
    id: '1',
    type: 'booking_accepted',
    title: 'Booking Accepted',
    body: 'Napat K. has accepted your booking for Language Tutor session. Your session is scheduled for Mar 18, 2026 at 7:00 PM. Please make sure you are ready before the session starts.',
    time: '2 hours ago',
    icon: 'mdi-calendar-check',
    severity: 'info',
    isRead: false,
  },
  {
    id: '2',
    type: 'session_warning',
    title: 'Session Ending Soon',
    body: 'Your session with Somchai T. ends in 5 minutes. You can extend the session from the chat screen if you need more time.',
    time: '1 day ago',
    icon: 'mdi-clock-alert',
    severity: 'warning',
    isRead: false,
  },
  {
    id: '3',
    type: 'review_prompt',
    title: 'Leave a Review',
    body: 'How was your session with Malee S.? Your review helps other users make better decisions. It only takes a minute to share your experience.',
    time: '3 days ago',
    icon: 'mdi-star-outline',
    severity: 'info',
    isRead: false,
  },
  {
    id: '4',
    type: 'wallet_credited',
    title: 'Points Added',
    body: 'Admin granted you 1,000 points. Your new balance is 1,750 pts. You can use these points to book sessions with service providers.',
    time: '5 days ago',
    icon: 'mdi-wallet-plus-outline',
    severity: 'info',
    isRead: true,
  },
  {
    id: '5',
    type: 'booking_cancelled',
    title: 'Booking Cancelled',
    body: 'Your booking with Prasit W. has been cancelled. Your locked funds of 600 pts have been returned to your available balance.',
    time: '1 week ago',
    icon: 'mdi-calendar-remove',
    severity: 'warning',
    isRead: true,
  },
  {
    id: '6',
    type: 'report_validated',
    title: 'Report Resolved',
    body: 'Your report has been reviewed and validated by our moderation team. A refund of 500 pts has been issued to your wallet.',
    time: '2 weeks ago',
    icon: 'mdi-shield-check-outline',
    severity: 'info',
    isRead: true,
  },
  {
    id: '7',
    type: 'welcome',
    title: 'Welcome to Vekko',
    body: 'Your account has been created successfully. You have received 500 welcome points to get started. Use them to book your first session with a service provider.',
    time: 'Mar 1, 2026',
    icon: 'mdi-hand-wave-outline',
    severity: 'info',
    isRead: true,
  },
])

const unreadCount = computed(() => notifications.value.filter((n) => !n.isRead).length)

const filteredNotifications = computed(() => {
  switch (activeTab.value) {
    case 'unread':
      return notifications.value.filter((n) => !n.isRead)
    case 'info':
      return notifications.value.filter((n) => n.severity === 'info')
    case 'warning':
      return notifications.value.filter((n) => n.severity === 'warning')
    default:
      return notifications.value
  }
})

function severityColor(severity: string) {
  const map: Record<string, string> = {
    info: 'primary',
    warning: 'warning',
    critical: 'error',
  }
  return map[severity] ?? 'primary'
}

function openDetail(notif: any) {
  selectedNotif.value = notif
  notif.isRead = true
  detailDialog.value = true
}

function markAllRead() {
  notifications.value.forEach((n) => (n.isRead = true))
  toast.success('All notifications marked as read')
}

function dismiss(notif: any) {
  notifications.value = notifications.value.filter((n) => n.id !== notif.id)
}

function dismissSelected() {
  if (selectedNotif.value) {
    dismiss(selectedNotif.value)
  }
  detailDialog.value = false
}
</script>