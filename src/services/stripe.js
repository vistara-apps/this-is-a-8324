// Stripe service for payment processing and subscription management
import { loadStripe } from '@stripe/stripe-js'
import { apiRequest, logAPICall } from '../utils/api.js'
import { validateEnvVars } from '../utils/api.js'
import { ServiceUnavailableError, ValidationError } from '../utils/errors.js'
import { supabase } from '../lib/supabase.js'

// Validate required environment variables
validateEnvVars(['VITE_STRIPE_PUBLISHABLE_KEY'])

const STRIPE_PUBLISHABLE_KEY = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY
const APP_URL = import.meta.env.VITE_APP_URL || 'http://localhost:5173'

// Initialize Stripe
let stripePromise
const getStripe = () => {
  if (!stripePromise) {
    stripePromise = loadStripe(STRIPE_PUBLISHABLE_KEY)
  }
  return stripePromise
}

class StripeService {
  constructor() {
    this.plans = {
      starter: {
        id: 'starter',
        name: 'Starter',
        price: 1900, // $19.00 in cents
        priceId: 'price_starter_monthly',
        features: [
          '50 AI ad generations per month',
          '10 social media posts per month',
          'Instagram posting',
          'Basic analytics',
          'Email support'
        ],
        limits: {
          generations: 50,
          posts: 10
        }
      },
      pro: {
        id: 'pro',
        name: 'Pro',
        price: 4900, // $49.00 in cents
        priceId: 'price_pro_monthly',
        features: [
          'Unlimited AI ad generations',
          '50 social media posts per month',
          'Instagram posting',
          'Advanced analytics',
          'Priority support',
          'Custom prompts',
          'A/B testing insights'
        ],
        limits: {
          generations: null, // unlimited
          posts: 50
        }
      }
    }
  }

  // Create checkout session for subscription
  async createCheckoutSession(userId, planId, successUrl = null, cancelUrl = null) {
    const startTime = Date.now()
    
    try {
      const plan = this.plans[planId]
      if (!plan) {
        throw new ValidationError('Invalid subscription plan')
      }

      // Get or create Stripe customer
      const customer = await this.getOrCreateCustomer(userId)

      const checkoutData = {
        customer: customer.id,
        payment_method_types: ['card'],
        line_items: [
          {
            price: plan.priceId,
            quantity: 1
          }
        ],
        mode: 'subscription',
        success_url: successUrl || `${APP_URL}/app?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: cancelUrl || `${APP_URL}/pricing`,
        metadata: {
          user_id: userId,
          plan_id: planId
        },
        subscription_data: {
          metadata: {
            user_id: userId,
            plan_id: planId
          }
        }
      }

      // Create checkout session via your backend API
      // Note: This should be done server-side for security
      const response = await this.createCheckoutSessionServerSide(checkoutData)

      logAPICall('stripe', 'create-checkout-session', Date.now() - startTime, true)
      
      return {
        sessionId: response.id,
        url: response.url
      }
    } catch (error) {
      logAPICall('stripe', 'create-checkout-session', Date.now() - startTime, false, error)
      throw this.handleStripeError(error)
    }
  }

  // Redirect to Stripe Checkout
  async redirectToCheckout(sessionId) {
    try {
      const stripe = await getStripe()
      const { error } = await stripe.redirectToCheckout({ sessionId })
      
      if (error) {
        throw new Error(error.message)
      }
    } catch (error) {
      throw this.handleStripeError(error)
    }
  }

  // Create checkout session and redirect in one step
  async subscribeToplan(userId, planId) {
    try {
      const { sessionId } = await this.createCheckoutSession(userId, planId)
      await this.redirectToCheckout(sessionId)
    } catch (error) {
      throw this.handleStripeError(error)
    }
  }

  // Get or create Stripe customer
  async getOrCreateCustomer(userId) {
    try {
      // Check if user already has a Stripe customer ID
      const { data: user, error } = await supabase
        .from('users')
        .select('stripe_customer_id, email')
        .eq('user_id', userId)
        .single()

      if (error) throw error

      if (user.stripe_customer_id) {
        // Return existing customer
        return { id: user.stripe_customer_id }
      }

      // Create new customer via backend API
      const customerData = {
        email: user.email,
        metadata: {
          user_id: userId
        }
      }

      const customer = await this.createCustomerServerSide(customerData)

      // Update user record with Stripe customer ID
      await supabase
        .from('users')
        .update({ stripe_customer_id: customer.id })
        .eq('user_id', userId)

      return customer
    } catch (error) {
      throw this.handleStripeError(error)
    }
  }

  // Get current subscription status
  async getSubscriptionStatus(userId) {
    const startTime = Date.now()
    
    try {
      const { data: user, error } = await supabase
        .from('users')
        .select('stripe_customer_id, subscription_plan')
        .eq('user_id', userId)
        .single()

      if (error || !user.stripe_customer_id) {
        return {
          status: 'none',
          plan: 'starter',
          current_period_end: null,
          cancel_at_period_end: false
        }
      }

      // Get subscription details via backend API
      const subscription = await this.getSubscriptionServerSide(user.stripe_customer_id)

      logAPICall('stripe', 'get-subscription-status', Date.now() - startTime, true)
      
      return {
        status: subscription.status,
        plan: subscription.metadata?.plan_id || user.subscription_plan,
        current_period_end: subscription.current_period_end,
        cancel_at_period_end: subscription.cancel_at_period_end,
        subscription_id: subscription.id
      }
    } catch (error) {
      logAPICall('stripe', 'get-subscription-status', Date.now() - startTime, false, error)
      // Return default status on error
      return {
        status: 'none',
        plan: 'starter',
        current_period_end: null,
        cancel_at_period_end: false
      }
    }
  }

  // Cancel subscription
  async cancelSubscription(userId) {
    const startTime = Date.now()
    
    try {
      const subscriptionStatus = await this.getSubscriptionStatus(userId)
      
      if (!subscriptionStatus.subscription_id) {
        throw new ValidationError('No active subscription found')
      }

      // Cancel subscription via backend API
      await this.cancelSubscriptionServerSide(subscriptionStatus.subscription_id)

      logAPICall('stripe', 'cancel-subscription', Date.now() - startTime, true)
      
      return { success: true }
    } catch (error) {
      logAPICall('stripe', 'cancel-subscription', Date.now() - startTime, false, error)
      throw this.handleStripeError(error)
    }
  }

  // Create customer portal session
  async createPortalSession(userId, returnUrl = null) {
    const startTime = Date.now()
    
    try {
      const { data: user, error } = await supabase
        .from('users')
        .select('stripe_customer_id')
        .eq('user_id', userId)
        .single()

      if (error || !user.stripe_customer_id) {
        throw new ValidationError('No billing account found')
      }

      const portalData = {
        customer: user.stripe_customer_id,
        return_url: returnUrl || `${APP_URL}/app/settings`
      }

      // Create portal session via backend API
      const session = await this.createPortalSessionServerSide(portalData)

      logAPICall('stripe', 'create-portal-session', Date.now() - startTime, true)
      
      return {
        url: session.url
      }
    } catch (error) {
      logAPICall('stripe', 'create-portal-session', Date.now() - startTime, false, error)
      throw this.handleStripeError(error)
    }
  }

  // Get usage and billing information
  async getUsageInfo(userId) {
    try {
      const { data: user, error } = await supabase
        .from('users')
        .select('subscription_plan, usage_stats')
        .eq('user_id', userId)
        .single()

      if (error) throw error

      const plan = this.plans[user.subscription_plan] || this.plans.starter
      const usage = user.usage_stats || { generations_used: 0, posts_used: 0 }

      return {
        plan: {
          id: plan.id,
          name: plan.name,
          limits: plan.limits
        },
        usage: {
          generations: {
            used: usage.generations_used || 0,
            limit: plan.limits.generations,
            remaining: plan.limits.generations ? plan.limits.generations - (usage.generations_used || 0) : null
          },
          posts: {
            used: usage.posts_used || 0,
            limit: plan.limits.posts,
            remaining: plan.limits.posts - (usage.posts_used || 0)
          }
        }
      }
    } catch (error) {
      throw this.handleStripeError(error)
    }
  }

  // Check if user can perform action based on usage limits
  async canPerformAction(userId, actionType) {
    try {
      const usageInfo = await this.getUsageInfo(userId)
      
      if (actionType === 'generation') {
        return usageInfo.usage.generations.remaining === null || usageInfo.usage.generations.remaining > 0
      }
      
      if (actionType === 'post') {
        return usageInfo.usage.posts.remaining > 0
      }
      
      return true
    } catch (error) {
      console.warn('Failed to check usage limits:', error)
      return true // Allow action on error
    }
  }

  // Server-side API calls (these would typically be backend endpoints)
  async createCheckoutSessionServerSide(checkoutData) {
    // In a real implementation, this would call your backend API
    // For now, we'll simulate the response
    return {
      id: 'cs_' + Math.random().toString(36).substring(7),
      url: 'https://checkout.stripe.com/pay/cs_test_' + Math.random().toString(36).substring(7)
    }
  }

  async createCustomerServerSide(customerData) {
    // In a real implementation, this would call your backend API
    return {
      id: 'cus_' + Math.random().toString(36).substring(7)
    }
  }

  async getSubscriptionServerSide(customerId) {
    // In a real implementation, this would call your backend API
    return {
      id: 'sub_' + Math.random().toString(36).substring(7),
      status: 'active',
      current_period_end: Math.floor(Date.now() / 1000) + (30 * 24 * 60 * 60), // 30 days from now
      cancel_at_period_end: false,
      metadata: {
        plan_id: 'starter'
      }
    }
  }

  async cancelSubscriptionServerSide(subscriptionId) {
    // In a real implementation, this would call your backend API
    return { success: true }
  }

  async createPortalSessionServerSide(portalData) {
    // In a real implementation, this would call your backend API
    return {
      url: 'https://billing.stripe.com/session/' + Math.random().toString(36).substring(7)
    }
  }

  // Get plan information
  getPlan(planId) {
    return this.plans[planId] || null
  }

  getAllPlans() {
    return Object.values(this.plans)
  }

  // Format price for display
  formatPrice(priceInCents) {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(priceInCents / 100)
  }

  handleStripeError(error) {
    if (error.type === 'card_error') {
      return new ValidationError(`Payment failed: ${error.message}`)
    }
    
    if (error.type === 'invalid_request_error') {
      return new ValidationError(`Invalid request: ${error.message}`)
    }
    
    if (error.type === 'api_error') {
      return new ServiceUnavailableError('Stripe', 'Payment service temporarily unavailable')
    }
    
    if (error.type === 'authentication_error') {
      return new ServiceUnavailableError('Stripe', 'Payment service configuration error')
    }
    
    return error
  }
}

export default new StripeService()
