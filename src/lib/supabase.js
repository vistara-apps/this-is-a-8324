import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Only validate environment variables in production or when actually using Supabase
const validateSupabaseConfig = () => {
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Missing Supabase environment variables')
  }
}

// Create Supabase client with fallback for missing environment variables
export const supabase = supabaseUrl && supabaseAnonKey 
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true
      }
    })
  : null

// Helper function to ensure Supabase is initialized
const ensureSupabaseInitialized = () => {
  if (!supabase) {
    throw new Error('Supabase client not initialized. Please check your environment variables.')
  }
}

// Database helper functions
export const db = {
  // User operations
  async createUser(userData) {
    ensureSupabaseInitialized()
    const { data, error } = await supabase
      .from('users')
      .insert([userData])
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  async getUserById(userId) {
    ensureSupabaseInitialized()
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('user_id', userId)
      .single()
    
    if (error) throw error
    return data
  },

  async updateUser(userId, updates) {
    ensureSupabaseInitialized()
    const { data, error } = await supabase
      .from('users')
      .update(updates)
      .eq('user_id', userId)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  // Ad Creative operations
  async createAdCreative(creativeData) {
    ensureSupabaseInitialized()
    const { data, error } = await supabase
      .from('ad_creatives')
      .insert([creativeData])
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  async getAdCreativesByUser(userId) {
    ensureSupabaseInitialized()
    const { data, error } = await supabase
      .from('ad_creatives')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data
  },

  async updateAdCreative(creativeId, updates) {
    ensureSupabaseInitialized()
    const { data, error } = await supabase
      .from('ad_creatives')
      .update(updates)
      .eq('creative_id', creativeId)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  // Post Job operations
  async createPostJob(jobData) {
    ensureSupabaseInitialized()
    const { data, error } = await supabase
      .from('post_jobs')
      .insert([jobData])
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  async getPostJobsByCreative(creativeId) {
    ensureSupabaseInitialized()
    const { data, error } = await supabase
      .from('post_jobs')
      .select('*')
      .eq('creative_id', creativeId)
      .order('posted_at', { ascending: false })
    
    if (error) throw error
    return data
  },

  async updatePostJobMetrics(jobId, metrics) {
    ensureSupabaseInitialized()
    const { data, error } = await supabase
      .from('post_jobs')
      .update({ performance_metrics: metrics })
      .eq('job_id', jobId)
      .select()
      .single()
    
    if (error) throw error
    return data
  }
}

export default supabase
