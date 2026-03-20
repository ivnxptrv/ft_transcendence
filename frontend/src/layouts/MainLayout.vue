<template>
  <v-app>
    <!-- Mobile overlay drawer -->
    <v-navigation-drawer
      v-if="mobile"
      v-model="mobileDrawer"
      temporary
    >
      <v-list-item
        prepend-icon="mdi-account-circle"
        :title="authStore.fullName"
        :subtitle="authStore.user?.email"
		rounded="lg"
        nav
      />

      <v-divider />

      <v-list density="compact" nav>
        <v-list-item
          v-for="item in navItems"
          :key="item.name"
          :prepend-icon="item.icon"
          :title="item.label"
          :to="item.to"
          :exact="item.exact"
          rounded="lg"
        />
      </v-list>

      <template #append>
        <v-divider />
        <v-list density="compact" nav>
          <!-- <v-list-item
            prepend-icon="mdi-cog-outline"
            :title="t('nav.settings')"
            to="/profile"
            rounded="lg"
          /> -->
          <v-list-item
            prepend-icon="mdi-logout"
            :title="t('nav.logout')"
            rounded="lg"
            @click="handleLogout"
          />
        </v-list>
      </template>
    </v-navigation-drawer>

    <!-- Desktop permanent drawer -->
	<v-navigation-drawer
	  v-else
	  v-model="drawer"
	  :rail="rail"
	  permanent
	>
	  <v-list-item
		  :title="rail ? '' : authStore.fullName"
		  :subtitle="rail ? '' : authStore.user?.email"
		  nav
		>
		  <template #prepend>
		    <v-avatar size="42">
		      <v-icon size="20">mdi-account-circle</v-icon>
		    </v-avatar>
		  </template>
		</v-list-item>

	  <v-divider />

	  <v-list density="compact" nav>
	    <v-list-item
	      v-for="item in navItems"
	      :key="item.name"
	      :prepend-icon="item.icon"
	      :title="item.label"
	      :to="item.to"
	      :exact="item.exact"
	      rounded="lg"
	    />
	  </v-list>

	  <template #append>
	    <v-divider />
	    <v-list density="compact" nav>
	      <!-- <v-list-item
	        prepend-icon="mdi-cog-outline"
	        :title="t('nav.settings')"
	        to="/profile"
	        rounded="lg"
	      /> -->
	      <v-list-item
	        prepend-icon="mdi-logout"
	        :title="t('nav.logout')"
	        rounded="lg"
	        @click="handleLogout"
	      />
	      <v-list-item
	        :prepend-icon="rail ? 'mdi-chevron-right' : 'mdi-chevron-left'"
	        :title="rail ? 'Expand' : 'Collapse'"
	        rounded="lg"
	        @click="rail = !rail"
	      />
	    </v-list>
	  </template>
	</v-navigation-drawer>

    <v-app-bar flat border="b">
      <!-- Hamburger for mobile -->
      <v-btn
        v-if="mobile"
        icon="mdi-menu"
        variant="text"
        @click="mobileDrawer = !mobileDrawer"
      />

      <v-app-bar-title>
        <span class="font-weight-bold">Vekko</span>
      </v-app-bar-title>

      <template #append>
        <v-btn
          :icon="themeStore.isDark ? 'mdi-weather-sunny' : 'mdi-weather-night'"
          variant="text"
          @click="themeStore.toggleTheme"
        />

        <v-menu>
          <template #activator="{ props }">
            <v-btn variant="text" v-bind="props" prepend-icon="mdi-translate">
              {{ currentLocaleName }}
            </v-btn>
          </template>
          <v-list>
            <v-list-item
              v-for="lang in languages"
              :key="lang.value"
              :title="lang.label"
              @click="themeStore.setLocale(lang.value)"
            />
          </v-list>
        </v-menu>

        <v-btn icon variant="text" to="/notifications">
          <v-icon>mdi-bell-outline</v-icon>
          <v-badge color="error" content="3" floating />
        </v-btn>
      </template>
    </v-app-bar>

    <v-main>
      <div class="pa-6">
        <router-view />
      </div>
    </v-main>
  </v-app>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { useDisplay } from 'vuetify'
import { useAuthStore } from '@/stores/auth'
import { useThemeStore } from '@/stores/theme'

const { t } = useI18n()
const router = useRouter()
const authStore = useAuthStore()
const themeStore = useThemeStore()
const { mobile } = useDisplay()

const drawer = ref(true)
const rail = ref(false)
const mobileDrawer = ref(false)

const languages = [
  { label: 'English', value: 'en' },
  { label: 'ภาษาไทย', value: 'th' },
  { label: '中文', value: 'zh' },
  { label: 'العربية', value: 'ar' },
]

const currentLocaleName = computed(
  () => languages.find((l) => l.value === themeStore.currentLocale)?.label ?? 'EN',
)

const navItems = computed(() => [
  { name: 'home', label: t('nav.home'), icon: 'mdi-home-outline', to: '/', exact: true },
  { name: 'search', label: t('nav.search'), icon: 'mdi-magnify', to: '/search', exact: false },
  { name: 'bookings', label: t('nav.bookings'), icon: 'mdi-calendar-outline', to: '/bookings', exact: false },
  { name: 'wallet', label: t('nav.wallet'), icon: 'mdi-wallet-outline', to: '/wallet', exact: false },
  { name: 'profile', label: t('nav.profile'), icon: 'mdi-account-outline', to: '/profile', exact: false },
])

function handleLogout() {
  authStore.logout()
  router.push({ name: 'login' })
}
</script>