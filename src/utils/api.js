// API utility functions for handling requests, responses, and errors

export class APIError extends Error {
  constructor(message, status, code) {
    super(message)
    this.name = 'APIError'
    this.status = status
    this.code = code
  }
}

export class RateLimitError extends APIError {
  constructor(message, retryAfter) {
    super(message, 429, 'RATE_LIMIT_EXCEEDED')
    this.retryAfter = retryAfter
  }
}

export class ValidationError extends APIError {
  constructor(message, errors) {
    super(message, 400, 'VALIDATION_ERROR')
    this.errors = errors
  }
}

// Rate limiting configuration
const RATE_LIMITS = {
  openai: {
    requestsPerMinute: parseInt(import.meta.env.VITE_RATE_LIMIT_REQUESTS_PER_MINUTE) || 60,
    requestsPerHour: parseInt(import.meta.env.VITE_RATE_LIMIT_REQUESTS_PER_HOUR) || 1000
  },
  meta: {
    requestsPerMinute: 200,
    requestsPerHour: 4800
  }
}

// Simple in-memory rate limiter (in production, use Redis)
class RateLimiter {
  constructor() {
    this.requests = new Map()
  }

  isAllowed(key, limit, windowMs) {
    const now = Date.now()
    const windowStart = now - windowMs
    
    if (!this.requests.has(key)) {
      this.requests.set(key, [])
    }
    
    const requests = this.requests.get(key)
    
    // Remove old requests outside the window
    const validRequests = requests.filter(time => time > windowStart)
    this.requests.set(key, validRequests)
    
    if (validRequests.length >= limit) {
      return false
    }
    
    // Add current request
    validRequests.push(now)
    return true
  }

  checkLimit(service, identifier = 'default') {
    const limits = RATE_LIMITS[service]
    if (!limits) return true

    const key = `${service}:${identifier}`
    
    // Check per-minute limit
    if (!this.isAllowed(`${key}:minute`, limits.requestsPerMinute, 60 * 1000)) {
      throw new RateLimitError(`Rate limit exceeded for ${service}. Try again in a minute.`, 60)
    }
    
    // Check per-hour limit
    if (!this.isAllowed(`${key}:hour`, limits.requestsPerHour, 60 * 60 * 1000)) {
      throw new RateLimitError(`Hourly rate limit exceeded for ${service}. Try again later.`, 3600)
    }
    
    return true
  }
}

export const rateLimiter = new RateLimiter()

// Retry logic with exponential backoff
export async function withRetry(fn, maxRetries = 3, baseDelay = 1000) {
  let lastError
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn()
    } catch (error) {
      lastError = error
      
      // Don't retry on certain errors
      if (error instanceof ValidationError || error.status === 401 || error.status === 403) {
        throw error
      }
      
      // Don't retry on last attempt
      if (attempt === maxRetries) {
        break
      }
      
      // Calculate delay with exponential backoff and jitter
      const delay = baseDelay * Math.pow(2, attempt) + Math.random() * 1000
      await new Promise(resolve => setTimeout(resolve, delay))
    }
  }
  
  throw lastError
}

// Generic API request handler
export async function apiRequest(url, options = {}) {
  const {
    method = 'GET',
    headers = {},
    body,
    timeout = 30000,
    ...fetchOptions
  } = options

  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), timeout)

  try {
    const response = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...headers
      },
      body: body ? JSON.stringify(body) : undefined,
      signal: controller.signal,
      ...fetchOptions
    })

    clearTimeout(timeoutId)

    if (!response.ok) {
      let errorMessage = `HTTP ${response.status}: ${response.statusText}`
      let errorData = null

      try {
        errorData = await response.json()
        errorMessage = errorData.message || errorData.error || errorMessage
      } catch {
        // Response is not JSON, use status text
      }

      throw new APIError(errorMessage, response.status, errorData?.code)
    }

    // Handle empty responses
    const contentType = response.headers.get('content-type')
    if (contentType && contentType.includes('application/json')) {
      return await response.json()
    }
    
    return await response.text()
  } catch (error) {
    clearTimeout(timeoutId)
    
    if (error.name === 'AbortError') {
      throw new APIError('Request timeout', 408, 'TIMEOUT')
    }
    
    if (error instanceof APIError) {
      throw error
    }
    
    throw new APIError(`Network error: ${error.message}`, 0, 'NETWORK_ERROR')
  }
}

// Validate required environment variables
export function validateEnvVars(requiredVars) {
  const missing = requiredVars.filter(varName => !import.meta.env[varName])
  
  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`)
  }
}

// Image processing utilities
export function validateImageFile(file) {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp']
  const maxSize = 10 * 1024 * 1024 // 10MB

  if (!allowedTypes.includes(file.type)) {
    throw new ValidationError('Invalid file type. Please upload a JPEG, PNG, or WebP image.')
  }

  if (file.size > maxSize) {
    throw new ValidationError('File too large. Please upload an image smaller than 10MB.')
  }

  return true
}

export async function convertImageToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

export function resizeImage(file, maxWidth = 1024, maxHeight = 1024, quality = 0.8) {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    const img = new Image()

    img.onload = () => {
      // Calculate new dimensions
      let { width, height } = img
      
      if (width > height) {
        if (width > maxWidth) {
          height = (height * maxWidth) / width
          width = maxWidth
        }
      } else {
        if (height > maxHeight) {
          width = (width * maxHeight) / height
          height = maxHeight
        }
      }

      canvas.width = width
      canvas.height = height

      // Draw and compress
      ctx.drawImage(img, 0, 0, width, height)
      canvas.toBlob(resolve, 'image/jpeg', quality)
    }

    img.src = URL.createObjectURL(file)
  })
}

// Text processing utilities
export function sanitizeText(text) {
  return text
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<[^>]*>/g, '')
    .trim()
}

export function truncateText(text, maxLength = 280) {
  if (text.length <= maxLength) return text
  return text.substring(0, maxLength - 3) + '...'
}

// Logging utility
export function logAPICall(service, endpoint, duration, success, error = null) {
  const logData = {
    service,
    endpoint,
    duration,
    success,
    timestamp: new Date().toISOString()
  }

  if (error) {
    logData.error = {
      message: error.message,
      status: error.status,
      code: error.code
    }
  }

  // In production, send to logging service
  if (import.meta.env.NODE_ENV === 'development') {
    console.log('API Call:', logData)
  }
}
