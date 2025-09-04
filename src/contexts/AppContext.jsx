import React, { createContext, useContext, useState } from 'react'

const AppContext = createContext()

export const useApp = () => {
  const context = useContext(AppContext)
  if (!context) {
    throw new Error('useApp must be used within an AppProvider')
  }
  return context
}

export const AppProvider = ({ children }) => {
  const [adCreatives, setAdCreatives] = useState([])
  const [isGenerating, setIsGenerating] = useState(false)
  const [socialAccounts, setSocialAccounts] = useState({
    instagram: { connected: false, username: '' },
    tiktok: { connected: false, username: '' }
  })

  const generateAdVariations = async (imageFile, productDescription) => {
    setIsGenerating(true)
    try {
      // Mock AI generation - in real app, call OpenAI API
      await new Promise(resolve => setTimeout(resolve, 3000)) // Simulate API call
      
      const mockVariations = [
        {
          id: '1',
          type: 'text',
          content: `🔥 Transform your space with our premium ${productDescription}! Limited time offer - don't miss out! #ProductLaunch #Innovation`,
          image: URL.createObjectURL(imageFile),
          performance: { views: 0, clicks: 0, engagement: 0 }
        },
        {
          id: '2',
          type: 'text',
          content: `Discover the secret to [benefit] with our revolutionary ${productDescription}. Join thousands of satisfied customers! 💫`,
          image: URL.createObjectURL(imageFile),
          performance: { views: 0, clicks: 0, engagement: 0 }
        },
        {
          id: '3',
          type: 'text',
          content: `Why settle for ordinary? Upgrade to extraordinary with our ${productDescription}. Your future self will thank you! ✨`,
          image: URL.createObjectURL(imageFile),
          performance: { views: 0, clicks: 0, engagement: 0 }
        },
        {
          id: '4',
          type: 'text',
          content: `BREAKTHROUGH ALERT! 🚨 Our latest ${productDescription} is changing the game. Be among the first to experience the difference!`,
          image: URL.createObjectURL(imageFile),
          performance: { views: 0, clicks: 0, engagement: 0 }
        }
      ]

      const newCreative = {
        creativeId: Date.now().toString(),
        inputImage: URL.createObjectURL(imageFile),
        generatedVariations: mockVariations,
        createdAt: new Date().toISOString()
      }

      setAdCreatives(prev => [newCreative, ...prev])
      return newCreative
    } catch (error) {
      console.error('Generation failed:', error)
      throw error
    } finally {
      setIsGenerating(false)
    }
  }

  const postToSocial = async (variations, platforms) => {
    try {
      // Mock social posting - in real app, integrate with Meta API
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Update performance metrics
      const updatedCreatives = adCreatives.map(creative => ({
        ...creative,
        generatedVariations: creative.generatedVariations.map(variation => 
          variations.includes(variation.id) 
            ? { 
                ...variation, 
                posted: true,
                platforms: platforms,
                performance: { 
                  views: Math.floor(Math.random() * 1000),
                  clicks: Math.floor(Math.random() * 100),
                  engagement: Math.floor(Math.random() * 50)
                }
              }
            : variation
        )
      }))
      
      setAdCreatives(updatedCreatives)
      return { success: true }
    } catch (error) {
      console.error('Posting failed:', error)
      throw error
    }
  }

  const connectSocialAccount = async (platform) => {
    try {
      // Mock OAuth flow - in real app, integrate with platform APIs
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      setSocialAccounts(prev => ({
        ...prev,
        [platform]: {
          connected: true,
          username: `@user_${platform}`
        }
      }))
      
      return { success: true }
    } catch (error) {
      console.error('Connection failed:', error)
      throw error
    }
  }

  const value = {
    adCreatives,
    isGenerating,
    socialAccounts,
    generateAdVariations,
    postToSocial,
    connectSocialAccount
  }

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  )
}