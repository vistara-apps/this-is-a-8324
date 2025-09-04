-- AdSpark AI Remix Database Schema
-- This file contains the database schema for the AdSpark AI Remix application
-- Run this in your Supabase SQL editor to set up the database

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (extends Supabase auth.users)
CREATE TABLE users (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  subscription_plan TEXT NOT NULL DEFAULT 'starter' CHECK (subscription_plan IN ('starter', 'pro')),
  linked_social_accounts JSONB DEFAULT '{"instagram": false, "tiktok": false}',
  usage_stats JSONB DEFAULT '{"generations_used": 0, "posts_used": 0, "monthly_reset": null}',
  stripe_customer_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Ad Creatives table
CREATE TABLE ad_creatives (
  creative_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  input_image TEXT NOT NULL, -- URL or base64 of uploaded image
  product_description TEXT NOT NULL,
  generated_variations JSONB NOT NULL DEFAULT '[]', -- Array of variation objects
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'archived', 'deleted')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Post Jobs table
CREATE TABLE post_jobs (
  job_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  creative_id UUID NOT NULL REFERENCES ad_creatives(creative_id) ON DELETE CASCADE,
  variation_id TEXT NOT NULL, -- ID of the specific variation that was posted
  social_platform TEXT NOT NULL CHECK (social_platform IN ('instagram', 'tiktok')),
  platform_post_id TEXT, -- ID returned by the social platform
  post_content JSONB NOT NULL, -- The actual content that was posted
  performance_metrics JSONB DEFAULT '{"views": 0, "clicks": 0, "engagement": 0, "reach": 0}',
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'posted', 'failed', 'deleted')),
  posted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Social Account Connections table
CREATE TABLE social_connections (
  connection_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  platform TEXT NOT NULL CHECK (platform IN ('instagram', 'tiktok')),
  platform_user_id TEXT NOT NULL,
  username TEXT NOT NULL,
  access_token TEXT NOT NULL, -- Encrypted in production
  refresh_token TEXT, -- For platforms that support it
  token_expires_at TIMESTAMP WITH TIME ZONE,
  account_type TEXT DEFAULT 'business', -- business, creator, personal
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, platform)
);

-- Usage Tracking table (for rate limiting and billing)
CREATE TABLE usage_tracking (
  tracking_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  action_type TEXT NOT NULL CHECK (action_type IN ('generation', 'post', 'api_call')),
  resource_consumed INTEGER DEFAULT 1,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Subscription Plans table (for reference)
CREATE TABLE subscription_plans (
  plan_id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  price_monthly INTEGER NOT NULL, -- in cents
  generations_limit INTEGER, -- null for unlimited
  posts_limit INTEGER, -- null for unlimited
  features JSONB DEFAULT '[]',
  stripe_price_id TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default subscription plans
INSERT INTO subscription_plans (plan_id, name, price_monthly, generations_limit, posts_limit, features, stripe_price_id) VALUES
('starter', 'Starter', 1900, 50, 10, '["ai_generation", "instagram_posting", "basic_analytics"]', 'price_starter_monthly'),
('pro', 'Pro', 4900, null, 50, '["ai_generation", "instagram_posting", "advanced_analytics", "priority_support", "custom_prompts"]', 'price_pro_monthly');

-- Create indexes for better performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_subscription ON users(subscription_plan);
CREATE INDEX idx_ad_creatives_user_id ON ad_creatives(user_id);
CREATE INDEX idx_ad_creatives_created_at ON ad_creatives(created_at);
CREATE INDEX idx_post_jobs_creative_id ON post_jobs(creative_id);
CREATE INDEX idx_post_jobs_platform ON post_jobs(social_platform);
CREATE INDEX idx_post_jobs_status ON post_jobs(status);
CREATE INDEX idx_social_connections_user_platform ON social_connections(user_id, platform);
CREATE INDEX idx_usage_tracking_user_date ON usage_tracking(user_id, created_at);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply updated_at triggers to all tables
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_ad_creatives_updated_at BEFORE UPDATE ON ad_creatives FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_post_jobs_updated_at BEFORE UPDATE ON post_jobs FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_social_connections_updated_at BEFORE UPDATE ON social_connections FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS) Policies
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE ad_creatives ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE social_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE usage_tracking ENABLE ROW LEVEL SECURITY;

-- Users can only access their own data
CREATE POLICY "Users can view own profile" ON users FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own profile" ON users FOR UPDATE USING (auth.uid() = user_id);

-- Ad creatives policies
CREATE POLICY "Users can view own ad creatives" ON ad_creatives FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own ad creatives" ON ad_creatives FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own ad creatives" ON ad_creatives FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own ad creatives" ON ad_creatives FOR DELETE USING (auth.uid() = user_id);

-- Post jobs policies
CREATE POLICY "Users can view own post jobs" ON post_jobs FOR SELECT USING (
  auth.uid() = (SELECT user_id FROM ad_creatives WHERE creative_id = post_jobs.creative_id)
);
CREATE POLICY "Users can create own post jobs" ON post_jobs FOR INSERT WITH CHECK (
  auth.uid() = (SELECT user_id FROM ad_creatives WHERE creative_id = post_jobs.creative_id)
);
CREATE POLICY "Users can update own post jobs" ON post_jobs FOR UPDATE USING (
  auth.uid() = (SELECT user_id FROM ad_creatives WHERE creative_id = post_jobs.creative_id)
);

-- Social connections policies
CREATE POLICY "Users can view own social connections" ON social_connections FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own social connections" ON social_connections FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own social connections" ON social_connections FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own social connections" ON social_connections FOR DELETE USING (auth.uid() = user_id);

-- Usage tracking policies
CREATE POLICY "Users can view own usage" ON usage_tracking FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "System can insert usage tracking" ON usage_tracking FOR INSERT WITH CHECK (true);

-- Subscription plans are publicly readable
ALTER TABLE subscription_plans ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Subscription plans are publicly readable" ON subscription_plans FOR SELECT USING (true);

-- Function to create user profile after signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (user_id, email)
  VALUES (NEW.id, NEW.email);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to automatically create user profile
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to check usage limits
CREATE OR REPLACE FUNCTION check_usage_limit(
  p_user_id UUID,
  p_action_type TEXT,
  p_limit INTEGER
)
RETURNS BOOLEAN AS $$
DECLARE
  current_usage INTEGER;
  reset_date DATE;
BEGIN
  -- Get the first day of current month for reset
  reset_date := DATE_TRUNC('month', CURRENT_DATE);
  
  -- Count usage for current month
  SELECT COUNT(*)
  INTO current_usage
  FROM usage_tracking
  WHERE user_id = p_user_id
    AND action_type = p_action_type
    AND created_at >= reset_date;
  
  -- Return true if under limit (null limit means unlimited)
  RETURN (p_limit IS NULL OR current_usage < p_limit);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
