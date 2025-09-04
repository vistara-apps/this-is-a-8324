// Meta API service for Instagram posting
import { apiRequest, rateLimiter, withRetry, logAPICall } from '../utils/api.js'
import { validateEnvVars } from '../utils/api.js'
import { ServiceUnavailableError, ValidationError, AuthenticationError } from '../utils/errors.js'
import { supabase } from '../lib/supabase.js'

// Validate required environment variables
validateEnvVars(['VITE_META_APP_ID', 'VITE_META_REDIRECT_URI'])

const META_APP_ID = import.meta.env.VITE_META_APP_ID
const META_REDIRECT_URI = import.meta.env.VITE_META_REDIRECT_URI
const GRAPH_API_BASE_URL = 'https://graph.facebook.com/v18.0'

class MetaService {
  constructor() {
    this.requiredScopes = [
      'instagram_basic',
      'instagram_content_publish',
      'pages_show_list',
      'pages_read_engagement'
    ]
  }

  // OAuth flow initiation
  getAuthUrl(state = null) {
    const params = new URLSearchParams({
      client_id: META_APP_ID,
      redirect_uri: META_REDIRECT_URI,
      scope: this.requiredScopes.join(','),
      response_type: 'code',
      state: state || Math.random().toString(36).substring(7)
    })

    return `https://www.facebook.com/v18.0/dialog/oauth?${params.toString()}`
  }

  // Exchange authorization code for access token
  async exchangeCodeForToken(code) {
    const startTime = Date.now()
    
    try {
      const response = await apiRequest(`${GRAPH_API_BASE_URL}/oauth/access_token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          client_id: META_APP_ID,
          client_secret: import.meta.env.VITE_META_APP_SECRET,
          redirect_uri: META_REDIRECT_URI,
          code: code
        })
      })

      logAPICall('meta', 'exchange-token', Date.now() - startTime, true)
      return response.access_token
    } catch (error) {
      logAPICall('meta', 'exchange-token', Date.now() - startTime, false, error)
      throw this.handleMetaError(error)
    }
  }

  // Get user's Instagram business accounts
  async getInstagramAccounts(accessToken) {
    const startTime = Date.now()
    
    try {
      rateLimiter.checkLimit('meta')

      // First, get user's Facebook pages
      const pagesResponse = await apiRequest(
        `${GRAPH_API_BASE_URL}/me/accounts?fields=id,name,access_token&access_token=${accessToken}`
      )

      const instagramAccounts = []

      // For each page, check if it has an Instagram business account
      for (const page of pagesResponse.data) {
        try {
          const igResponse = await apiRequest(
            `${GRAPH_API_BASE_URL}/${page.id}?fields=instagram_business_account&access_token=${page.access_token}`
          )

          if (igResponse.instagram_business_account) {
            const igAccountId = igResponse.instagram_business_account.id
            
            // Get Instagram account details
            const igDetailsResponse = await apiRequest(
              `${GRAPH_API_BASE_URL}/${igAccountId}?fields=id,username,account_type,media_count&access_token=${page.access_token}`
            )

            instagramAccounts.push({
              id: igAccountId,
              username: igDetailsResponse.username,
              accountType: igDetailsResponse.account_type,
              mediaCount: igDetailsResponse.media_count,
              pageId: page.id,
              pageName: page.name,
              accessToken: page.access_token
            })
          }
        } catch (error) {
          console.warn(`Failed to get Instagram account for page ${page.id}:`, error)
        }
      }

      logAPICall('meta', 'get-instagram-accounts', Date.now() - startTime, true)
      return instagramAccounts
    } catch (error) {
      logAPICall('meta', 'get-instagram-accounts', Date.now() - startTime, false, error)
      throw this.handleMetaError(error)
    }
  }

  // Connect Instagram account for a user
  async connectInstagramAccount(userId, code) {
    try {
      // Exchange code for access token
      const accessToken = await this.exchangeCodeForToken(code)
      
      // Get Instagram accounts
      const instagramAccounts = await this.getInstagramAccounts(accessToken)
      
      if (instagramAccounts.length === 0) {
        throw new ValidationError('No Instagram business accounts found. Please ensure your Instagram account is connected to a Facebook page and is set to business or creator account.')
      }

      // For simplicity, use the first Instagram account found
      // In a full implementation, you might let the user choose
      const igAccount = instagramAccounts[0]

      // Store connection in database
      const { data, error } = await supabase
        .from('social_connections')
        .upsert({
          user_id: userId,
          platform: 'instagram',
          platform_user_id: igAccount.id,
          username: igAccount.username,
          access_token: igAccount.accessToken, // In production, encrypt this
          account_type: igAccount.accountType,
          is_active: true
        })
        .select()
        .single()

      if (error) throw error

      return {
        success: true,
        account: {
          id: igAccount.id,
          username: igAccount.username,
          accountType: igAccount.accountType
        }
      }
    } catch (error) {
      throw this.handleMetaError(error)
    }
  }

  // Post content to Instagram
  async postToInstagram(userId, content) {
    const startTime = Date.now()
    
    try {
      rateLimiter.checkLimit('meta')

      // Get user's Instagram connection
      const { data: connection, error } = await supabase
        .from('social_connections')
        .select('*')
        .eq('user_id', userId)
        .eq('platform', 'instagram')
        .eq('is_active', true)
        .single()

      if (error || !connection) {
        throw new AuthenticationError('Instagram account not connected')
      }

      // Validate content
      this.validatePostContent(content)

      let mediaId
      
      // Create media container
      if (content.imageUrl) {
        mediaId = await this.createImageMedia(connection, content)
      } else {
        throw new ValidationError('Image is required for Instagram posts')
      }

      // Publish the media
      const publishResponse = await this.publishMedia(connection, mediaId)

      logAPICall('meta', 'post-to-instagram', Date.now() - startTime, true)
      
      return {
        success: true,
        postId: publishResponse.id,
        platform: 'instagram',
        url: `https://www.instagram.com/p/${publishResponse.id}/`
      }
    } catch (error) {
      logAPICall('meta', 'post-to-instagram', Date.now() - startTime, false, error)
      throw this.handleMetaError(error)
    }
  }

  async createImageMedia(connection, content) {
    const params = {
      image_url: content.imageUrl,
      caption: content.caption,
      access_token: connection.access_token
    }

    const response = await withRetry(async () => {
      return await apiRequest(`${GRAPH_API_BASE_URL}/${connection.platform_user_id}/media`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams(params)
      })
    })

    return response.id
  }

  async publishMedia(connection, mediaId) {
    const params = {
      creation_id: mediaId,
      access_token: connection.access_token
    }

    const response = await withRetry(async () => {
      return await apiRequest(`${GRAPH_API_BASE_URL}/${connection.platform_user_id}/media_publish`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams(params)
      })
    })

    return response
  }

  // Get post performance metrics
  async getPostMetrics(userId, postId) {
    const startTime = Date.now()
    
    try {
      rateLimiter.checkLimit('meta')

      const { data: connection, error } = await supabase
        .from('social_connections')
        .select('*')
        .eq('user_id', userId)
        .eq('platform', 'instagram')
        .eq('is_active', true)
        .single()

      if (error || !connection) {
        throw new AuthenticationError('Instagram account not connected')
      }

      const metrics = [
        'engagement',
        'impressions',
        'reach',
        'likes',
        'comments',
        'shares',
        'saves'
      ]

      const response = await apiRequest(
        `${GRAPH_API_BASE_URL}/${postId}/insights?metric=${metrics.join(',')}&access_token=${connection.access_token}`
      )

      logAPICall('meta', 'get-post-metrics', Date.now() - startTime, true)
      
      // Transform metrics into a more usable format
      const metricsData = {}
      response.data.forEach(metric => {
        metricsData[metric.name] = metric.values[0]?.value || 0
      })

      return {
        views: metricsData.impressions || 0,
        clicks: metricsData.engagement || 0,
        engagement: metricsData.likes + metricsData.comments + metricsData.shares + metricsData.saves || 0,
        reach: metricsData.reach || 0,
        likes: metricsData.likes || 0,
        comments: metricsData.comments || 0,
        shares: metricsData.shares || 0,
        saves: metricsData.saves || 0
      }
    } catch (error) {
      logAPICall('meta', 'get-post-metrics', Date.now() - startTime, false, error)
      // Don't throw error for metrics - return zeros instead
      console.warn('Failed to fetch post metrics:', error)
      return {
        views: 0,
        clicks: 0,
        engagement: 0,
        reach: 0,
        likes: 0,
        comments: 0,
        shares: 0,
        saves: 0
      }
    }
  }

  // Disconnect Instagram account
  async disconnectInstagramAccount(userId) {
    try {
      const { error } = await supabase
        .from('social_connections')
        .update({ is_active: false })
        .eq('user_id', userId)
        .eq('platform', 'instagram')

      if (error) throw error

      return { success: true }
    } catch (error) {
      throw this.handleMetaError(error)
    }
  }

  // Validate post content
  validatePostContent(content) {
    if (!content.caption || content.caption.trim().length === 0) {
      throw new ValidationError('Caption is required')
    }

    if (content.caption.length > 2200) {
      throw new ValidationError('Caption must be 2200 characters or less')
    }

    if (!content.imageUrl) {
      throw new ValidationError('Image URL is required')
    }

    // Validate image URL format
    const urlPattern = /^https?:\/\/.+\.(jpg|jpeg|png|webp)$/i
    if (!urlPattern.test(content.imageUrl)) {
      throw new ValidationError('Invalid image URL format')
    }
  }

  // Check if user has Instagram connected
  async isInstagramConnected(userId) {
    try {
      const { data, error } = await supabase
        .from('social_connections')
        .select('id')
        .eq('user_id', userId)
        .eq('platform', 'instagram')
        .eq('is_active', true)
        .single()

      return !error && !!data
    } catch (error) {
      return false
    }
  }

  // Get connected Instagram account info
  async getConnectedAccount(userId) {
    try {
      const { data, error } = await supabase
        .from('social_connections')
        .select('platform_user_id, username, account_type')
        .eq('user_id', userId)
        .eq('platform', 'instagram')
        .eq('is_active', true)
        .single()

      if (error) return null

      return {
        id: data.platform_user_id,
        username: data.username,
        accountType: data.account_type
      }
    } catch (error) {
      return null
    }
  }

  handleMetaError(error) {
    if (error.status === 401) {
      return new AuthenticationError('Instagram authentication expired. Please reconnect your account.')
    }
    
    if (error.status === 403) {
      return new AuthenticationError('Insufficient permissions. Please ensure your Instagram account is a business or creator account.')
    }
    
    if (error.status === 429) {
      return new ServiceUnavailableError('Instagram', 'Rate limit exceeded. Please try again later.')
    }
    
    if (error.status >= 500) {
      return new ServiceUnavailableError('Instagram', 'Service temporarily unavailable')
    }

    // Handle specific Meta API errors
    if (error.message && error.message.includes('Invalid parameter')) {
      return new ValidationError('Invalid post content or format')
    }

    if (error.message && error.message.includes('duplicate')) {
      return new ValidationError('This content has already been posted recently')
    }
    
    return error
  }
}

export default new MetaService()
