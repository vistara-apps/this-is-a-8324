// Supabase service wrapper with enhanced functionality
import { supabase, db } from '../lib/supabase.js'
import { logAPICall } from '../utils/api.js'
import { AuthenticationError, ValidationError } from '../utils/errors.js'

class SupabaseService {
  constructor() {
    this.supabase = supabase
    this.db = db
  }

  // Authentication methods
  async signUp(email, password, userData = {}) {
    const startTime = Date.now()
    
    try {
      const { data, error } = await this.supabase.auth.signUp({
        email,
        password,
        options: {
          data: userData
        }
      })

      if (error) throw error

      logAPICall('supabase', 'sign-up', Date.now() - startTime, true)
      
      return {
        user: data.user,
        session: data.session,
        needsConfirmation: !data.session
      }
    } catch (error) {
      logAPICall('supabase', 'sign-up', Date.now() - startTime, false, error)
      throw this.handleSupabaseError(error)
    }
  }

  async signIn(email, password) {
    const startTime = Date.now()
    
    try {
      const { data, error } = await this.supabase.auth.signInWithPassword({
        email,
        password
      })

      if (error) throw error

      logAPICall('supabase', 'sign-in', Date.now() - startTime, true)
      
      return {
        user: data.user,
        session: data.session
      }
    } catch (error) {
      logAPICall('supabase', 'sign-in', Date.now() - startTime, false, error)
      throw this.handleSupabaseError(error)
    }
  }

  async signOut() {
    const startTime = Date.now()
    
    try {
      const { error } = await this.supabase.auth.signOut()
      if (error) throw error

      logAPICall('supabase', 'sign-out', Date.now() - startTime, true)
      
      return { success: true }
    } catch (error) {
      logAPICall('supabase', 'sign-out', Date.now() - startTime, false, error)
      throw this.handleSupabaseError(error)
    }
  }

  async resetPassword(email) {
    const startTime = Date.now()
    
    try {
      const { error } = await this.supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`
      })

      if (error) throw error

      logAPICall('supabase', 'reset-password', Date.now() - startTime, true)
      
      return { success: true }
    } catch (error) {
      logAPICall('supabase', 'reset-password', Date.now() - startTime, false, error)
      throw this.handleSupabaseError(error)
    }
  }

  async updatePassword(newPassword) {
    const startTime = Date.now()
    
    try {
      const { error } = await this.supabase.auth.updateUser({
        password: newPassword
      })

      if (error) throw error

      logAPICall('supabase', 'update-password', Date.now() - startTime, true)
      
      return { success: true }
    } catch (error) {
      logAPICall('supabase', 'update-password', Date.now() - startTime, false, error)
      throw this.handleSupabaseError(error)
    }
  }

  // Get current user
  getCurrentUser() {
    return this.supabase.auth.getUser()
  }

  // Get current session
  getCurrentSession() {
    return this.supabase.auth.getSession()
  }

  // Listen to auth changes
  onAuthStateChange(callback) {
    return this.supabase.auth.onAuthStateChange(callback)
  }

  // User profile methods
  async getUserProfile(userId) {
    const startTime = Date.now()
    
    try {
      const user = await this.db.getUserById(userId)
      
      logAPICall('supabase', 'get-user-profile', Date.now() - startTime, true)
      
      return user
    } catch (error) {
      logAPICall('supabase', 'get-user-profile', Date.now() - startTime, false, error)
      throw this.handleSupabaseError(error)
    }
  }

  async updateUserProfile(userId, updates) {
    const startTime = Date.now()
    
    try {
      const user = await this.db.updateUser(userId, {
        ...updates,
        updated_at: new Date().toISOString()
      })
      
      logAPICall('supabase', 'update-user-profile', Date.now() - startTime, true)
      
      return user
    } catch (error) {
      logAPICall('supabase', 'update-user-profile', Date.now() - startTime, false, error)
      throw this.handleSupabaseError(error)
    }
  }

  // Ad Creative methods
  async createAdCreative(userId, creativeData) {
    const startTime = Date.now()
    
    try {
      const creative = await this.db.createAdCreative({
        user_id: userId,
        ...creativeData,
        created_at: new Date().toISOString()
      })
      
      // Track usage
      await this.trackUsage(userId, 'generation')
      
      logAPICall('supabase', 'create-ad-creative', Date.now() - startTime, true)
      
      return creative
    } catch (error) {
      logAPICall('supabase', 'create-ad-creative', Date.now() - startTime, false, error)
      throw this.handleSupabaseError(error)
    }
  }

  async getUserAdCreatives(userId, limit = 20, offset = 0) {
    const startTime = Date.now()
    
    try {
      const { data, error } = await this.supabase
        .from('ad_creatives')
        .select('*')
        .eq('user_id', userId)
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1)

      if (error) throw error
      
      logAPICall('supabase', 'get-user-ad-creatives', Date.now() - startTime, true)
      
      return data
    } catch (error) {
      logAPICall('supabase', 'get-user-ad-creatives', Date.now() - startTime, false, error)
      throw this.handleSupabaseError(error)
    }
  }

  async updateAdCreative(creativeId, updates) {
    const startTime = Date.now()
    
    try {
      const creative = await this.db.updateAdCreative(creativeId, {
        ...updates,
        updated_at: new Date().toISOString()
      })
      
      logAPICall('supabase', 'update-ad-creative', Date.now() - startTime, true)
      
      return creative
    } catch (error) {
      logAPICall('supabase', 'update-ad-creative', Date.now() - startTime, false, error)
      throw this.handleSupabaseError(error)
    }
  }

  async deleteAdCreative(creativeId) {
    const startTime = Date.now()
    
    try {
      const creative = await this.db.updateAdCreative(creativeId, {
        status: 'deleted',
        updated_at: new Date().toISOString()
      })
      
      logAPICall('supabase', 'delete-ad-creative', Date.now() - startTime, true)
      
      return creative
    } catch (error) {
      logAPICall('supabase', 'delete-ad-creative', Date.now() - startTime, false, error)
      throw this.handleSupabaseError(error)
    }
  }

  // Post Job methods
  async createPostJob(userId, jobData) {
    const startTime = Date.now()
    
    try {
      const job = await this.db.createPostJob({
        ...jobData,
        created_at: new Date().toISOString()
      })
      
      // Track usage
      await this.trackUsage(userId, 'post')
      
      logAPICall('supabase', 'create-post-job', Date.now() - startTime, true)
      
      return job
    } catch (error) {
      logAPICall('supabase', 'create-post-job', Date.now() - startTime, false, error)
      throw this.handleSupabaseError(error)
    }
  }

  async getPostJobsByCreative(creativeId) {
    const startTime = Date.now()
    
    try {
      const jobs = await this.db.getPostJobsByCreative(creativeId)
      
      logAPICall('supabase', 'get-post-jobs-by-creative', Date.now() - startTime, true)
      
      return jobs
    } catch (error) {
      logAPICall('supabase', 'get-post-jobs-by-creative', Date.now() - startTime, false, error)
      throw this.handleSupabaseError(error)
    }
  }

  async updatePostJobMetrics(jobId, metrics) {
    const startTime = Date.now()
    
    try {
      const job = await this.db.updatePostJobMetrics(jobId, metrics)
      
      logAPICall('supabase', 'update-post-job-metrics', Date.now() - startTime, true)
      
      return job
    } catch (error) {
      logAPICall('supabase', 'update-post-job-metrics', Date.now() - startTime, false, error)
      throw this.handleSupabaseError(error)
    }
  }

  // Usage tracking
  async trackUsage(userId, actionType, resourceConsumed = 1, metadata = {}) {
    const startTime = Date.now()
    
    try {
      const { data, error } = await this.supabase
        .from('usage_tracking')
        .insert({
          user_id: userId,
          action_type: actionType,
          resource_consumed: resourceConsumed,
          metadata: metadata,
          created_at: new Date().toISOString()
        })
        .select()
        .single()

      if (error) throw error

      // Update user usage stats
      await this.updateUserUsageStats(userId, actionType, resourceConsumed)
      
      logAPICall('supabase', 'track-usage', Date.now() - startTime, true)
      
      return data
    } catch (error) {
      logAPICall('supabase', 'track-usage', Date.now() - startTime, false, error)
      // Don't throw error for usage tracking - just log it
      console.warn('Failed to track usage:', error)
    }
  }

  async updateUserUsageStats(userId, actionType, resourceConsumed) {
    try {
      const { data: user, error } = await this.supabase
        .from('users')
        .select('usage_stats')
        .eq('user_id', userId)
        .single()

      if (error) throw error

      const currentStats = user.usage_stats || { generations_used: 0, posts_used: 0 }
      const now = new Date()
      const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
      
      // Reset monthly usage if it's a new month
      if (currentStats.monthly_reset !== currentMonth) {
        currentStats.generations_used = 0
        currentStats.posts_used = 0
        currentStats.monthly_reset = currentMonth
      }

      // Update usage based on action type
      if (actionType === 'generation') {
        currentStats.generations_used += resourceConsumed
      } else if (actionType === 'post') {
        currentStats.posts_used += resourceConsumed
      }

      await this.supabase
        .from('users')
        .update({ usage_stats: currentStats })
        .eq('user_id', userId)

    } catch (error) {
      console.warn('Failed to update user usage stats:', error)
    }
  }

  async getUserUsageStats(userId) {
    const startTime = Date.now()
    
    try {
      const { data, error } = await this.supabase
        .from('users')
        .select('usage_stats, subscription_plan')
        .eq('user_id', userId)
        .single()

      if (error) throw error
      
      logAPICall('supabase', 'get-user-usage-stats', Date.now() - startTime, true)
      
      return {
        usage: data.usage_stats || { generations_used: 0, posts_used: 0 },
        plan: data.subscription_plan
      }
    } catch (error) {
      logAPICall('supabase', 'get-user-usage-stats', Date.now() - startTime, false, error)
      throw this.handleSupabaseError(error)
    }
  }

  // File upload methods
  async uploadFile(bucket, path, file, options = {}) {
    const startTime = Date.now()
    
    try {
      const { data, error } = await this.supabase.storage
        .from(bucket)
        .upload(path, file, {
          cacheControl: '3600',
          upsert: false,
          ...options
        })

      if (error) throw error
      
      logAPICall('supabase', 'upload-file', Date.now() - startTime, true)
      
      return data
    } catch (error) {
      logAPICall('supabase', 'upload-file', Date.now() - startTime, false, error)
      throw this.handleSupabaseError(error)
    }
  }

  async getPublicUrl(bucket, path) {
    const { data } = this.supabase.storage
      .from(bucket)
      .getPublicUrl(path)
    
    return data.publicUrl
  }

  async deleteFile(bucket, path) {
    const startTime = Date.now()
    
    try {
      const { error } = await this.supabase.storage
        .from(bucket)
        .remove([path])

      if (error) throw error
      
      logAPICall('supabase', 'delete-file', Date.now() - startTime, true)
      
      return { success: true }
    } catch (error) {
      logAPICall('supabase', 'delete-file', Date.now() - startTime, false, error)
      throw this.handleSupabaseError(error)
    }
  }

  // Analytics methods
  async getAnalytics(userId, dateRange = '30d') {
    const startTime = Date.now()
    
    try {
      const endDate = new Date()
      const startDate = new Date()
      
      // Calculate start date based on range
      switch (dateRange) {
        case '7d':
          startDate.setDate(endDate.getDate() - 7)
          break
        case '30d':
          startDate.setDate(endDate.getDate() - 30)
          break
        case '90d':
          startDate.setDate(endDate.getDate() - 90)
          break
        default:
          startDate.setDate(endDate.getDate() - 30)
      }

      // Get ad creatives count
      const { data: creativesData, error: creativesError } = await this.supabase
        .from('ad_creatives')
        .select('creative_id')
        .eq('user_id', userId)
        .gte('created_at', startDate.toISOString())
        .lte('created_at', endDate.toISOString())

      if (creativesError) throw creativesError

      // Get post jobs with metrics
      const { data: postsData, error: postsError } = await this.supabase
        .from('post_jobs')
        .select('performance_metrics, social_platform, posted_at')
        .in('creative_id', creativesData.map(c => c.creative_id))
        .eq('status', 'posted')

      if (postsError) throw postsError

      // Calculate aggregated metrics
      const analytics = {
        totalCreatives: creativesData.length,
        totalPosts: postsData.length,
        totalViews: 0,
        totalClicks: 0,
        totalEngagement: 0,
        platformBreakdown: {},
        performanceOverTime: []
      }

      postsData.forEach(post => {
        const metrics = post.performance_metrics || {}
        analytics.totalViews += metrics.views || 0
        analytics.totalClicks += metrics.clicks || 0
        analytics.totalEngagement += metrics.engagement || 0

        // Platform breakdown
        if (!analytics.platformBreakdown[post.social_platform]) {
          analytics.platformBreakdown[post.social_platform] = {
            posts: 0,
            views: 0,
            clicks: 0,
            engagement: 0
          }
        }
        
        const platform = analytics.platformBreakdown[post.social_platform]
        platform.posts += 1
        platform.views += metrics.views || 0
        platform.clicks += metrics.clicks || 0
        platform.engagement += metrics.engagement || 0
      })

      logAPICall('supabase', 'get-analytics', Date.now() - startTime, true)
      
      return analytics
    } catch (error) {
      logAPICall('supabase', 'get-analytics', Date.now() - startTime, false, error)
      throw this.handleSupabaseError(error)
    }
  }

  handleSupabaseError(error) {
    // Handle authentication errors
    if (error.message?.includes('Invalid login credentials')) {
      return new AuthenticationError('Invalid email or password')
    }
    
    if (error.message?.includes('Email not confirmed')) {
      return new AuthenticationError('Please check your email and click the confirmation link')
    }
    
    if (error.message?.includes('User already registered')) {
      return new ValidationError('An account with this email already exists')
    }
    
    if (error.message?.includes('Password should be at least')) {
      return new ValidationError('Password must be at least 6 characters long')
    }
    
    // Handle database errors
    if (error.code === '23505') { // Unique constraint violation
      return new ValidationError('This record already exists')
    }
    
    if (error.code === '23503') { // Foreign key constraint violation
      return new ValidationError('Referenced record does not exist')
    }
    
    if (error.code === '42501') { // Insufficient privilege
      return new AuthenticationError('Insufficient permissions')
    }
    
    // Handle RLS policy violations
    if (error.message?.includes('row-level security')) {
      return new AuthenticationError('Access denied')
    }
    
    return error
  }
}

export default new SupabaseService()
