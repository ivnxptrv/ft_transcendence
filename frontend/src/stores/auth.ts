import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

interface User {
  id: string
  email: string
  firstName: string
  lastName: string
  role: 'user' | 'provider' | 'admin'
  avatarUrl?: string
}

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(JSON.parse(localStorage.getItem('user') ?? 'null'))

  const isLoggedIn = computed(() => !!user.value)
  const isProvider = computed(() => user.value?.role === 'provider')
  const fullName = computed(() =>
    user.value ? `${user.value.firstName} ${user.value.lastName}` : '',
  )

  function login(credentials: { email: string; password: string }) {
    // mock login
    const mockUser: User = {
      id: '1',
      email: credentials.email,
      firstName: 'John',
      lastName: 'Doe',
      role: 'user',
    }
    user.value = mockUser
    localStorage.setItem('user', JSON.stringify(mockUser))
  }

  function register(data: {
    email: string
    password: string
    firstName: string
    lastName: string
  }) {
    const mockUser: User = {
      id: '1',
      email: data.email,
      firstName: data.firstName,
      lastName: data.lastName,
      role: 'user',
    }
    user.value = mockUser
    localStorage.setItem('user', JSON.stringify(mockUser))
  }

  function logout() {
    user.value = null
    localStorage.removeItem('user')
  }

  return { user, isLoggedIn, isProvider, fullName, login, register, logout }
})