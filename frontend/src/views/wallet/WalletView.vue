<template>
  <div>
    <div class="mb-6">
      <h1 class="text-h4 font-weight-bold mb-1">Wallet</h1>
      <p class="text-body-1 text-medium-emphasis">Manage your balance and transactions</p>
    </div>

    <v-row>
      <!-- Left Column -->
      <v-col cols="12" md="4">
        <!-- Balance Card -->
        <v-card rounded="xl" class="mb-4" color="primary">
          <v-card-text class="pa-6">
            <div class="d-flex align-center justify-space-between mb-4">
              <p class="text-body-2" style="opacity: 0.8">Total Balance</p>
              <v-icon>mdi-wallet-outline</v-icon>
            </div>
            <p class="text-h3 font-weight-bold mb-1">{{ wallet.available + wallet.locked }}</p>
            <p class="text-body-2" style="opacity: 0.8">points</p>

            <v-divider class="my-4" style="opacity: 0.2" />

            <div class="d-flex justify-space-between">
              <div>
                <p class="text-caption" style="opacity: 0.7">Available</p>
                <p class="text-h6 font-weight-bold">{{ wallet.available }}</p>
              </div>
              <div class="text-end">
                <p class="text-caption" style="opacity: 0.7">Locked</p>
                <p class="text-h6 font-weight-bold">{{ wallet.locked }}</p>
              </div>
            </div>
          </v-card-text>
        </v-card>

        <!-- Redeem Code -->
        <v-card rounded="xl" class="mb-4">
          <v-card-text class="pa-5">
            <p class="text-subtitle-2 font-weight-bold mb-3">Redeem Code</p>
            <v-text-field
              v-model="redeemCode"
              placeholder="Enter code"
              prepend-inner-icon="mdi-ticket-outline"
              hide-details
              class="mb-3"
            />
            <v-btn
              color="primary"
              block
              :loading="redeemLoading"
              :disabled="!redeemCode.trim()"
              @click="handleRedeem"
            >
              Redeem
            </v-btn>
          </v-card-text>
        </v-card>

        <!-- Stats -->
        <v-card rounded="xl">
          <v-card-text class="pa-5">
            <p class="text-subtitle-2 font-weight-bold mb-4">Summary</p>
            <div class="d-flex flex-column ga-3">
              <div class="d-flex justify-space-between align-center">
                <div class="d-flex align-center ga-2">
                  <v-icon size="16" color="success">mdi-arrow-down-circle-outline</v-icon>
                  <span class="text-body-2 text-medium-emphasis">Total Earned</span>
                </div>
                <span class="text-body-2 font-weight-medium">{{ stats.totalEarned }} pts</span>
              </div>
              <div class="d-flex justify-space-between align-center">
                <div class="d-flex align-center ga-2">
                  <v-icon size="16" color="error">mdi-arrow-up-circle-outline</v-icon>
                  <span class="text-body-2 text-medium-emphasis">Total Spent</span>
                </div>
                <span class="text-body-2 font-weight-medium">{{ stats.totalSpent }} pts</span>
              </div>
              <div class="d-flex justify-space-between align-center">
                <div class="d-flex align-center ga-2">
                  <v-icon size="16" color="warning">mdi-lock-outline</v-icon>
                  <span class="text-body-2 text-medium-emphasis">Currently Locked</span>
                </div>
                <span class="text-body-2 font-weight-medium">{{ wallet.locked }} pts</span>
              </div>
            </div>
          </v-card-text>
        </v-card>
      </v-col>

      <!-- Right Column — Transactions -->
      <v-col cols="12" md="8">
        <v-card rounded="xl">
          <v-card-text class="pa-5">
            <div class="d-flex align-center justify-space-between mb-4">
              <p class="text-subtitle-2 font-weight-bold">Transaction History</p>
              <v-select
                v-model="filter"
                :items="filterOptions"
                hide-details
                variant="outlined"
                density="compact"
                style="max-width: 160px"
              />
            </div>

            <div class="d-flex flex-column ga-2">
              <div
                v-for="(tx, i) in filteredTransactions"
                :key="tx.id"
              >
                <div class="d-flex align-center ga-3 py-2">
                  <v-avatar size="40" :color="txColor(tx.type)" variant="tonal">
                    <v-icon size="18">{{ txIcon(tx.type) }}</v-icon>
                  </v-avatar>

                  <div class="flex-grow-1" style="min-width: 0">
                    <p class="text-body-2 font-weight-medium">{{ tx.description }}</p>
                    <p class="text-caption text-medium-emphasis">{{ tx.date }}</p>
                  </div>

                  <div class="text-end flex-shrink-0">
                    <p
                      class="text-body-2 font-weight-bold"
                      :class="tx.amount > 0 ? 'text-success' : 'text-error'"
                    >
                      {{ tx.amount > 0 ? '+' : '' }}{{ tx.amount }} pts
                    </p>
                    <p class="text-caption text-medium-emphasis">{{ tx.balanceAfter }} pts</p>
                  </div>
                </div>
                <v-divider v-if="i < filteredTransactions.length - 1" />
              </div>

              <!-- Empty State -->
              <div v-if="filteredTransactions.length === 0" class="text-center py-8">
                <v-icon size="48" class="mb-3 text-medium-emphasis">mdi-receipt-text-outline</v-icon>
                <p class="text-body-2 text-medium-emphasis">No transactions found</p>
              </div>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { toast } from '@/composables/useToast'

const redeemCode = ref('')
const redeemLoading = ref(false)
const filter = ref('all')

const filterOptions = [
  { title: 'All', value: 'all' },
  { title: 'Credits', value: 'credit' },
  { title: 'Debits', value: 'debit' },
  { title: 'Locked', value: 'locked' },
]

const wallet = ref({
  available: 1250,
  locked: 500,
})

const stats = ref({
  totalEarned: 2000,
  totalSpent: 3100,
})

const transactions = ref([
  {
    id: '1',
    type: 'registration_bonus',
    description: 'Registration bonus',
    amount: 500,
    balanceAfter: 500,
    date: 'Mar 1, 2026',
  },
  {
    id: '2',
    type: 'session_lock',
    description: 'Locked for session — Somchai T.',
    amount: -500,
    balanceAfter: 0,
    date: 'Mar 5, 2026',
  },
  {
    id: '3',
    type: 'code_redemption',
    description: 'Redeem code — WELCOME2025',
    amount: 1000,
    balanceAfter: 1000,
    date: 'Mar 6, 2026',
  },
  {
    id: '4',
    type: 'session_transfer',
    description: 'Payment for session — Somchai T.',
    amount: -500,
    balanceAfter: 500,
    date: 'Mar 8, 2026',
  },
  {
    id: '5',
    type: 'admin_grant',
    description: 'Admin bonus grant',
    amount: 1000,
    balanceAfter: 1500,
    date: 'Mar 10, 2026',
  },
  {
    id: '6',
    type: 'session_lock',
    description: 'Locked for session — Napat K.',
    amount: -400,
    balanceAfter: 1100,
    date: 'Mar 17, 2026',
  },
  {
    id: '7',
    type: 'session_refund',
    description: 'Refund — cancelled session',
    amount: 250,
    balanceAfter: 1350,
    date: 'Mar 18, 2026',
  },
])

const filteredTransactions = computed(() => {
  if (filter.value === 'all') return transactions.value
  if (filter.value === 'credit') return transactions.value.filter((t) => t.amount > 0)
  if (filter.value === 'debit') return transactions.value.filter((t) => t.amount < 0)
  if (filter.value === 'locked') return transactions.value.filter((t) => t.type === 'session_lock')
  return transactions.value
})

function txIcon(type: string) {
  const map: Record<string, string> = {
    registration_bonus: 'mdi-gift-outline',
    session_lock: 'mdi-lock-outline',
    session_transfer: 'mdi-arrow-up-circle-outline',
    session_refund: 'mdi-arrow-down-circle-outline',
    code_redemption: 'mdi-ticket-outline',
    admin_grant: 'mdi-shield-star-outline',
    admin_deduction: 'mdi-shield-minus-outline',
    earning: 'mdi-arrow-down-circle-outline',
  }
  return map[type] ?? 'mdi-swap-horizontal'
}

function txColor(type: string) {
  const map: Record<string, string> = {
    registration_bonus: 'success',
    session_lock: 'warning',
    session_transfer: 'error',
    session_refund: 'success',
    code_redemption: 'primary',
    admin_grant: 'success',
    admin_deduction: 'error',
    earning: 'success',
  }
  return map[type] ?? 'secondary'
}

async function handleRedeem() {
  redeemLoading.value = true
  await new Promise((r) => setTimeout(r, 1000))
  redeemLoading.value = false

  if (redeemCode.value.toUpperCase() === 'WELCOME2025') {
    wallet.value.available += 500
    toast.success('Code redeemed successfully — 500 pts added')
    redeemCode.value = ''
  } else {
    toast.error('Invalid or expired code')
  }
}
</script>