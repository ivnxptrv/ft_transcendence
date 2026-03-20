<template>
  <div class="chat-wrapper">
    <v-row class="fill-height" no-gutters>
      <!-- Chat Area -->
      <v-col cols="12" md="8" class="d-flex flex-column chat-col">
        <!-- Chat Header -->
        <v-card rounded="0" border="b" flat class="flex-shrink-0">
          <v-card-text class="pa-4">
            <div class="d-flex align-center justify-space-between">
              <div class="d-flex align-center ga-3">
                <v-btn
                  icon="mdi-arrow-left"
                  variant="text"
                  size="small"
                  @click="router.back()"
                />
                <v-avatar size="40">
                  <v-icon>mdi-account</v-icon>
                </v-avatar>
                <div>
                  <p class="font-weight-bold text-body-1">{{ session.providerName }}</p>
                  <div class="d-flex align-center ga-1">
                    <v-icon size="10" :color="session.status === 'active' ? 'success' : 'warning'">
                      mdi-circle
                    </v-icon>
                    <span class="text-caption text-medium-emphasis text-capitalize">
                      {{ session.status }}
                    </span>
                  </div>
                </div>
              </div>

              <!-- Timer -->
              <div class="text-center">
                <v-chip
                  :color="timeRemaining < 300 ? 'error' : 'primary'"
                  variant="tonal"
                  rounded="lg"
                  size="default"
                >
                  <v-icon start size="14">mdi-clock-outline</v-icon>
                  {{ formattedTime }}
                </v-chip>
                <p class="text-caption text-medium-emphasis mt-1">remaining</p>
              </div>

              <!-- Actions Menu -->
              <v-menu>
                <template #activator="{ props }">
                  <v-btn icon="mdi-dots-vertical" variant="text" v-bind="props" />
                </template>
                <v-list>
                  <v-list-item
                    prepend-icon="mdi-timer-plus-outline"
                    title="Extend Session"
                    @click="extendDialog = true"
                  />
                  <v-list-item
                    prepend-icon="mdi-check-circle-outline"
                    title="End Session — Satisfied"
                    @click="satisfyDialog = true"
                  />
                  <v-list-item
                    prepend-icon="mdi-pause-circle-outline"
                    title="Pause Session"
                    @click="pauseSession"
                  />
                  <v-divider />
                  <v-list-item
                    prepend-icon="mdi-flag-outline"
                    title="Report Issue"
                    class="text-error"
                    @click="reportDialog = true"
                  />
                </v-list>
              </v-menu>
            </div>
          </v-card-text>
        </v-card>

        <!-- Messages -->
        <div ref="messagesContainer" class="messages-area flex-grow-1 pa-4">
          <div
            v-for="message in messages"
            :key="message.id"
            class="mb-4"
          >
            <!-- System Message -->
            <div v-if="message.senderRole === 'system'" class="text-center my-2">
              <v-chip size="x-small" variant="tonal" rounded="lg">
                {{ message.content }}
              </v-chip>
            </div>

            <!-- Chat Message -->
            <div
              v-else
              class="d-flex ga-2"
              :class="message.senderRole === 'customer' ? 'flex-row-reverse' : 'flex-row'"
            >
              <v-avatar
                v-if="message.senderRole === 'provider'"
                size="32"
                class="flex-shrink-0 mt-1"
              >
                <v-icon size="16">mdi-account</v-icon>
              </v-avatar>

              <div
                class="message-bubble pa-3"
                :class="[
                  message.senderRole === 'customer' ? 'bubble-customer' : 'bubble-provider',
                ]"
              >
                <p class="text-body-2 mb-1">{{ message.content }}</p>
                <p class="text-caption" style="opacity: 0.6">{{ message.time }}</p>
              </div>
            </div>
          </div>

          <!-- Typing Indicator -->
          <div v-if="isTyping" class="d-flex ga-2 mb-4">
            <v-avatar size="32"  class="flex-shrink-0">
              <v-icon size="16">mdi-account</v-icon>
            </v-avatar>
            <div class="message-bubble bubble-provider pa-3">
              <div class="d-flex ga-1 align-center">
                <span class="typing-dot" />
                <span class="typing-dot" />
                <span class="typing-dot" />
              </div>
            </div>
          </div>
        </div>

        <!-- Message Input -->
        <v-card rounded="0" border="t" flat class="flex-shrink-0">
          <v-card-text class="pa-3">
            <div class="d-flex align-end ga-2">
              <v-btn icon="mdi-paperclip" variant="text" size="small" />
              <v-textarea
                v-model="newMessage"
                placeholder="Type a message..."
                rows="1"
                auto-grow
                max-rows="4"
                hide-details
                variant="outlined"
                density="comfortable"
                class="flex-grow-1"
                @keydown.enter.prevent="sendMessage"
              />
              <v-btn
                icon="mdi-send"
                color="primary"
                :disabled="!newMessage.trim()"
                @click="sendMessage"
              />
            </div>
          </v-card-text>
        </v-card>
      </v-col>

      <!-- Session Info Panel -->
      <v-col cols="12" md="4" class="d-none d-md-flex flex-column">
        <v-card rounded="0" height="100%" flat border="s">
          <v-card-text class="pa-5">
            <p class="text-subtitle-2 font-weight-bold mb-4">Session Info</p>

            <div class="d-flex flex-column ga-3 mb-6">
              <div class="d-flex justify-space-between">
                <span class="text-body-2 text-medium-emphasis">Status</span>
                <v-chip
                  :color="session.status === 'active' ? 'success' : 'warning'"
                  size="x-small"
                  variant="tonal"
                  rounded="lg"
                >
                  {{ session.status }}
                </v-chip>
              </div>

              <div class="d-flex justify-space-between">
                <span class="text-body-2 text-medium-emphasis">Duration</span>
                <span class="text-body-2 font-weight-medium">{{ session.totalMinutes }} mins</span>
              </div>

              <div class="d-flex justify-space-between">
                <span class="text-body-2 text-medium-emphasis">Rate</span>
                <span class="text-body-2 font-weight-medium">{{ session.hourlyRate }} pts/hr</span>
              </div>

              <div class="d-flex justify-space-between">
                <span class="text-body-2 text-medium-emphasis">Cost so far</span>
                <span class="text-body-2 font-weight-medium">{{ costSoFar }} pts</span>
              </div>

              <div class="d-flex justify-space-between">
                <span class="text-body-2 text-medium-emphasis">Your balance</span>
                <span class="text-body-2 font-weight-medium">1,250 pts</span>
              </div>
            </div>

            <v-divider class="mb-4" />

            <p class="text-subtitle-2 font-weight-bold mb-3">Session Actions</p>

            <div class="d-flex flex-column ga-2">
              <v-btn
                block
                variant="outlined"
                prepend-icon="mdi-timer-plus-outline"
                @click="extendDialog = true"
              >
                Extend Session
              </v-btn>

              <v-btn
                block
                color="success"
                variant="outlined"
                prepend-icon="mdi-check-circle-outline"
                @click="satisfyDialog = true"
              >
                End — Satisfied
              </v-btn>

              <v-btn
                block
                color="error"
                variant="outlined"
                prepend-icon="mdi-flag-outline"
                @click="reportDialog = true"
              >
                Report Issue
              </v-btn>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Extend Dialog -->
    <v-dialog v-model="extendDialog" max-width="420">
      <v-card rounded="xl">
        <v-card-title class="pa-6 pb-2">
          <span class="text-h6 font-weight-bold">Extend Session</span>
        </v-card-title>
        <v-card-text class="pa-6 pt-2">
          <p class="text-body-2 text-medium-emphasis mb-4">
            Select additional time to purchase
          </p>
          <v-btn-toggle
            v-model="extendMinutes"
            mandatory
            divided
            rounded="lg"
            class="mb-4 w-100"
          >
            <v-btn :value="15" class="flex-grow-1">15 min</v-btn>
            <v-btn :value="30" class="flex-grow-1">30 min</v-btn>
            <v-btn :value="60" class="flex-grow-1">1 hr</v-btn>
          </v-btn-toggle>

          <v-card color="surface-variant" rounded="lg" class="pa-4">
            <div class="d-flex justify-space-between mb-2">
              <span class="text-body-2">Additional cost</span>
              <span class="font-weight-medium">{{ extendCost }} pts</span>
            </div>
            <div class="d-flex justify-space-between">
              <span class="text-body-2">Balance after</span>
              <span class="font-weight-medium">{{ 1250 - extendCost }} pts</span>
            </div>
          </v-card>
        </v-card-text>
        <v-card-actions class="pa-6 pt-0 ga-2">
          <v-btn variant="outlined" class="flex-grow-1" @click="extendDialog = false">
            Cancel
          </v-btn>
          <v-btn color="primary" class="flex-grow-1" @click="confirmExtend">
            Confirm Extension
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Satisfy Dialog -->
    <v-dialog v-model="satisfyDialog" max-width="420">
      <v-card rounded="xl">
        <v-card-text class="pa-6 text-center">
          <v-icon size="48" color="success" class="mb-3">mdi-check-circle-outline</v-icon>
          <h3 class="text-h6 font-weight-bold mb-2">End Session</h3>
          <p class="text-body-2 text-medium-emphasis mb-4">
            Are you satisfied with the service? The session will end and payment will be processed.
          </p>
        </v-card-text>
        <v-card-actions class="pa-6 pt-0 ga-2">
          <v-btn variant="outlined" class="flex-grow-1" @click="satisfyDialog = false">
            Continue Session
          </v-btn>
          <v-btn color="success" class="flex-grow-1" @click="confirmSatisfy">
            Yes, End Session
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
            placeholder="Describe the issue..."
          />
        </v-card-text>
        <v-card-actions class="pa-6 pt-0 ga-2">
          <v-btn variant="outlined" class="flex-grow-1" @click="reportDialog = false">
            Cancel
          </v-btn>
          <v-btn color="error" class="flex-grow-1" @click="submitReport">
            Submit Report
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { toast } from '@/composables/useToast'

const router = useRouter()

const newMessage = ref('')
const isTyping = ref(false)
const messagesContainer = ref<HTMLElement | null>(null)
const extendDialog = ref(false)
const satisfyDialog = ref(false)
const reportDialog = ref(false)
const extendMinutes = ref(30)
const reportReason = ref('')
const reportDescription = ref('')

const reportReasons = [
  'Provider went offline',
  'Inappropriate behaviour',
  'Not delivering service',
  'Other',
]

const session = ref({
  id: 'session-123',
  providerName: 'Napat K.',
  status: 'active',
  hourlyRate: 400,
  totalMinutes: 60,
  startedAt: Date.now() - 15 * 60 * 1000,
})

const timeRemaining = ref(45 * 60)
const messages = ref([
  {
    id: '1',
    senderRole: 'system',
    content: 'Session started — 60 minutes purchased',
    time: '7:00 PM',
  },
  {
    id: '2',
    senderRole: 'provider',
    content: 'Hello! I am ready to start our Thai lesson. What would you like to focus on today?',
    time: '7:01 PM',
  },
  {
    id: '3',
    senderRole: 'customer',
    content: 'Hi! I would like to practice basic conversation phrases for ordering food at a restaurant.',
    time: '7:02 PM',
  },
  {
    id: '4',
    senderRole: 'provider',
    content: 'Great choice! Let us start with some common phrases. The first one is "ขอเมนูหน่อยครับ" which means "Can I have the menu please?"',
    time: '7:03 PM',
  },
])

const costSoFar = computed(() => {
  const minutesUsed = session.value.totalMinutes - Math.floor(timeRemaining.value / 60)
  return Math.round((session.value.hourlyRate / 60) * minutesUsed)
})

const extendCost = computed(() => {
  return Math.round((session.value.hourlyRate / 60) * extendMinutes.value)
})

const formattedTime = computed(() => {
  const mins = Math.floor(timeRemaining.value / 60)
  const secs = timeRemaining.value % 60
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
})

let timer: ReturnType<typeof setInterval> | null = null

onMounted(() => {
  timer = setInterval(() => {
    if (timeRemaining.value > 0) {
      timeRemaining.value--
    } else {
      clearInterval(timer!)
      toast.warning('Session time has ended')
    }
  }, 1000)
  scrollToBottom()
})

onUnmounted(() => {
  if (timer) clearInterval(timer)
})

async function sendMessage() {
  if (!newMessage.value.trim()) return

  messages.value.push({
    id: Date.now().toString(),
    senderRole: 'customer',
    content: newMessage.value,
    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
  })

  newMessage.value = ''
  await scrollToBottom()

  isTyping.value = true
  await new Promise((r) => setTimeout(r, 1500))
  isTyping.value = false

  messages.value.push({
    id: (Date.now() + 1).toString(),
    senderRole: 'provider',
    content: 'That is a great question! Let me explain that in more detail.',
    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
  })

  await scrollToBottom()
}

async function scrollToBottom() {
  await nextTick()
  if (messagesContainer.value) {
    messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
  }
}

function pauseSession() {
  session.value.status = 'paused'
  if (timer) clearInterval(timer)
  toast.info('Session paused')
}

function confirmExtend() {
  timeRemaining.value += extendMinutes.value * 60
  session.value.totalMinutes += extendMinutes.value
  extendDialog.value = false
  toast.success(`Session extended by ${extendMinutes.value} minutes`)

  messages.value.push({
    id: Date.now().toString(),
    senderRole: 'system',
    content: `Session extended by ${extendMinutes.value} minutes`,
    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
  })
}

function confirmSatisfy() {
  satisfyDialog.value = false
  if (timer) clearInterval(timer)
  toast.success('Session ended — payment processed')
  router.push({ name: 'bookings' })
}

function submitReport() {
  reportDialog.value = false
  toast.success('Report submitted successfully')
}
</script>

<style scoped>
.chat-wrapper {
  height: calc(100vh - 64px);
  overflow: hidden;
}

.chat-col {
  height: 100%;
  overflow: hidden;
}

.messages-area {
  overflow-y: auto;
  scroll-behavior: smooth;
}

.message-bubble {
  max-width: 70%;
  border-radius: 16px;
}

.bubble-customer {
  background: rgb(var(--v-theme-primary));
  color: rgb(var(--v-theme-on-primary));
  border-bottom-right-radius: 4px;
}

.bubble-provider {
  background: rgb(var(--v-theme-surface-variant));
  border-bottom-left-radius: 4px;
}

.typing-dot {
  display: inline-block;
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: currentColor;
  opacity: 0.6;
  animation: typing 1.2s infinite;
}

.typing-dot:nth-child(2) { animation-delay: 0.2s; }
.typing-dot:nth-child(3) { animation-delay: 0.4s; }

@keyframes typing {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-4px); }
}
</style>