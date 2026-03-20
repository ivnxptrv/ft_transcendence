import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    // Auth
    {
      path: '/login',
      name: 'login',
      component: () => import('@/views/auth/LoginView.vue'),
      meta: { guest: true },
    },
    {
      path: '/register',
      name: 'register',
      component: () => import('@/views/auth/RegisterView.vue'),
      meta: { guest: true },
    },

    // Main app
    {
      path: '/',
      component: () => import('@/layouts/MainLayout.vue'),
      meta: { requiresAuth: true },
      children: [
        {
          path: '',
          name: 'home',
          component: () => import('@/views/HomeView.vue'),
        },
        {
          path: 'search',
          name: 'search',
          component: () => import('@/views/search/SearchView.vue'),
        },
        {
          path: 'providers/:id',
          name: 'provider-profile',
          component: () => import('@/views/provider/ProviderProfileView.vue'),
        },
        {
          path: 'bookings',
          name: 'bookings',
          component: () => import('@/views/booking/BookingsView.vue'),
        },
        {
          path: 'bookings/:id',
          name: 'booking-detail',
          component: () => import('@/views/booking/BookingDetailView.vue'),
        },
        {
          path: 'chat/:sessionId',
          name: 'chat',
          component: () => import('@/views/chat/ChatView.vue'),
        },
        {
          path: 'wallet',
          name: 'wallet',
          component: () => import('@/views/wallet/WalletView.vue'),
        },
        {
          path: 'notifications',
          name: 'notifications',
          component: () => import('@/views/NotificationsView.vue'),
        },
        {
          path: 'profile',
          name: 'profile',
          component: () => import('@/views/profile/ProfileView.vue'),
        },
        {
          path: 'profile/provider',
          name: 'provider-setup',
          component: () => import('@/views/profile/ProviderSetupView.vue'),
        },
		{
		  path: 'profile/provider/edit',
		  name: 'provider-edit',
		  component: () => import('@/views/profile/ProviderEditView.vue'),
		},
      ],
    },
  ],
})

// Navigation guards
router.beforeEach((to) => {
  const isLoggedIn = !!localStorage.getItem('user')

  if (to.meta.requiresAuth && !isLoggedIn) {
    return { name: 'login' }
  }

  if (to.meta.guest && isLoggedIn) {
    return { name: 'home' }
  }
})

export default router