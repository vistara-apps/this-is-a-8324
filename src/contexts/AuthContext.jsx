import React, { createContext, useContext, useState, useEffect } from 'react'

const AuthContext = createContext()

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  // Mock authentication - in real app, integrate with Supabase
  useEffect(() => {
    // Simulate checking for existing session
    const checkAuth = async () => {
      try {
        // Mock user data
        const mockUser = {
          id: '1',
          email: 'demo@adspark.ai',
          subscriptionPlan: 'pro',
          linkedSocialAccounts: {
            instagram: true,
            tiktok: false
          }
        }
        setUser(mockUser)
      } catch (error) {
        console.error('Auth check failed:', error)
      } finally {
        setLoading(false)
      }
    }

    checkAuth()
  }, [])

  const signIn = async (email, password) => {
    try {
      // Mock sign in
      const mockUser = {
        id: '1',
        email: email,
        subscriptionPlan: 'starter',
        linkedSocialAccounts: {
          instagram: false,
          tiktok: false
        }
      }
      setUser(mockUser)
      return { success: true }
    } catch (error) {
      return { success: false, error: error.message }
    }
  }

  const signUp = async (email, password) => {
    try {
      // Mock sign up
      const mockUser = {
        id: '1',
        email: email,
        subscriptionPlan: 'starter',
        linkedSocialAccounts: {
          instagram: false,
          tiktok: false
        }
      }
      setUser(mockUser)
      return { success: true }
    } catch (error) {
      return { success: false, error: error.message }
    }
  }

  const signOut = async () => {
    setUser(null)
  }

  const value = {
    user,
    loading,
    signIn,
    signUp,
    signOut
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}