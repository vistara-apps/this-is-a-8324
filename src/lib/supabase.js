import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
})

// Database helper functions
export const db = {
  // User operations
  async createUser(userData) {
    const { data, error } = await supabase
      .from('users')
      .insert([userData])
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  async getUserById(userId) {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('user_id', userId)
      .single()
    
    if (error) throw error
    return data
  },

  async updateUser(userId, updates) {
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
    const { data, error } = await supabase
      .from('ad_creatives')
      .insert([creativeData])
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  async getAdCreativesByUser(userId) {
    const { data, error } = await supabase
      .from('ad_creatives')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data
  },

  async updateAdCreative(creativeId, updates) {
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
    const { data, error } = await supabase
      .from('post_jobs')
      .insert([jobData])
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  async getPostJobsByCreative(creativeId) {
    const { data, error } = await supabase
      .from('post_jobs')
      .select('*')
      .eq('creative_id', creativeId)
      .order('posted_at', { ascending: false })
    
    if (error) throw error
    return data
  },

  async updatePostJobMetrics(jobId, metrics) {
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
