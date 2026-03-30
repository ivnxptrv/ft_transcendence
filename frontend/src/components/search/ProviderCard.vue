<template>
  <v-card rounded="xl">
    <v-card-text class="pa-5">
      <div class="d-flex ga-4">
        <!-- Avatar -->
        <v-avatar size="56" class="flex-shrink-0">
          <v-icon size="28">mdi-account</v-icon>
        </v-avatar>

        <!-- Main Content -->
        <div class="flex-grow-1" style="min-width: 0">
          <!-- Name Row -->
          <div class="d-flex align-start justify-space-between ga-2 mb-1">
            <div style="min-width: 0">
              <p class="font-weight-bold text-body-1">{{ provider.name }}</p>
              <p class="text-caption text-medium-emphasis">{{ provider.title }}</p>
            </div>
            <v-chip color="primary" variant="tonal" size="small" rounded="lg" class="flex-shrink-0">
              {{ provider.hourlyRate }} pts/hr
            </v-chip>
          </div>

          <!-- Rating & Location -->
          <div class="d-flex align-center ga-3 mb-3">
            <div class="d-flex align-center ga-1">
              <v-icon size="14" color="warning">mdi-star</v-icon>
              <span class="text-caption font-weight-medium">{{ provider.rating }}</span>
              <span class="text-caption text-medium-emphasis">({{ provider.totalReviews }})</span>
            </div>
            <div class="d-flex align-center ga-1">
              <v-icon size="14" class="text-medium-emphasis">mdi-map-marker-outline</v-icon>
              <span class="text-caption text-medium-emphasis">{{ provider.location }}</span>
            </div>
          </div>

          <!-- Response Message -->
          <v-card color="surface-variant" rounded="lg" class="pa-3 mb-3">
            <div class="d-flex ga-2 align-center">
              <v-icon size="16" class="text-medium-emphasis flex-shrink-0">mdi-message-outline</v-icon>
              <p class="text-body-2 text-medium-emphasis">{{ provider.responseMessage }}</p>
            </div>
          </v-card>

          <!-- Tags & Actions Row -->
          <div class="d-flex align-center justify-space-between ga-2">
            <div class="d-flex flex-wrap ga-1">
              <v-chip
                v-for="tag in provider.tags"
                :key="tag"
                size="x-small"
                variant="outlined"
                rounded="lg"
              >
                {{ tag }}
              </v-chip>
            </div>

            <div class="d-flex ga-2 flex-shrink-0">
              <v-btn
                variant="outlined"
                size="small"
                prepend-icon="mdi-account-outline"
                @click="$emit('view')"
              >
                Profile
              </v-btn>
              <v-btn
                color="primary"
                size="small"
                prepend-icon="mdi-calendar-plus"
                @click="$emit('book')"
              >
                Book
              </v-btn>
            </div>
          </div>
        </div>
      </div>
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
defineProps<{
  provider: {
    id: string
    name: string
    title: string
    hourlyRate: number
    rating: number
    totalReviews: number
    location: string
    tags: string[]
    responseMessage: string
  }
}>()

defineEmits<{
  book: []
  view: []
}>()
</script>