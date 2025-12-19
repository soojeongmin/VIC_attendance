import { create } from 'zustand'
import { authService } from '../services'
import type { Database } from '../types/database.types'

type Profile = Database['public']['Tables']['profiles']['Row']

interface AuthState {
  user: Profile | null
  isLoading: boolean
  isAuthenticated: boolean
  error: string | null

  // Actions
  signIn: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
  loadUser: () => Promise<void>
  clearError: () => void
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoading: true,
  isAuthenticated: false,
  error: null,

  signIn: async (email, password) => {
    set({ isLoading: true, error: null })
    try {
      await authService.signIn(email, password)
      const profile = await authService.getCurrentProfile()
      set({
        user: profile,
        isAuthenticated: true,
        isLoading: false,
      })
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Login failed',
        isLoading: false,
      })
      throw error
    }
  },

  signOut: async () => {
    set({ isLoading: true })
    try {
      await authService.signOut()
      set({
        user: null,
        isAuthenticated: false,
        isLoading: false,
      })
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Logout failed',
        isLoading: false,
      })
    }
  },

  loadUser: async () => {
    set({ isLoading: true })
    try {
      const profile = await authService.getCurrentProfile()
      set({
        user: profile,
        isAuthenticated: !!profile,
        isLoading: false,
      })
    } catch {
      set({
        user: null,
        isAuthenticated: false,
        isLoading: false,
      })
    }
  },

  clearError: () => set({ error: null }),
}))

// Selectors
export const selectIsAdmin = (state: AuthState) => state.user?.role === 'admin'
