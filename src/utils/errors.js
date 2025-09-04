// Error handling utilities and custom error classes

export class AppError extends Error {
  constructor(message, code, statusCode = 500, isOperational = true) {
    super(message)
    this.name = this.constructor.name
    this.code = code
    this.statusCode = statusCode
    this.isOperational = isOperational
    
    Error.captureStackTrace(this, this.constructor)
  }
}

export class AuthenticationError extends AppError {
  constructor(message = 'Authentication required') {
    super(message, 'AUTH_REQUIRED', 401)
  }
}

export class AuthorizationError extends AppError {
  constructor(message = 'Insufficient permissions') {
    super(message, 'INSUFFICIENT_PERMISSIONS', 403)
  }
}

export class ValidationError extends AppError {
  constructor(message, errors = []) {
    super(message, 'VALIDATION_ERROR', 400)
    this.errors = errors
  }
}

export class RateLimitError extends AppError {
  constructor(message = 'Rate limit exceeded', retryAfter = 60) {
    super(message, 'RATE_LIMIT_EXCEEDED', 429)
    this.retryAfter = retryAfter
  }
}

export class ServiceUnavailableError extends AppError {
  constructor(service, message = 'Service temporarily unavailable') {
    super(`${service}: ${message}`, 'SERVICE_UNAVAILABLE', 503)
    this.service = service
  }
}

export class QuotaExceededError extends AppError {
  constructor(resource, limit) {
    super(`${resource} quota exceeded. Limit: ${limit}`, 'QUOTA_EXCEEDED', 402)
    this.resource = resource
    this.limit = limit
  }
}

export class NetworkError extends AppError {
  constructor(message = 'Network connection failed') {
    super(message, 'NETWORK_ERROR', 0)
  }
}

// Error handler for API responses
export function handleAPIError(error) {
  // Log error for debugging
  console.error('API Error:', error)

  // Return user-friendly error messages
  switch (error.code) {
    case 'AUTH_REQUIRED':
      return {
        title: 'Authentication Required',
        message: 'Please sign in to continue.',
        action: 'sign_in'
      }

    case 'INSUFFICIENT_PERMISSIONS':
      return {
        title: 'Access Denied',
        message: 'You don\'t have permission to perform this action.',
        action: 'upgrade_plan'
      }

    case 'VALIDATION_ERROR':
      return {
        title: 'Invalid Input',
        message: error.message,
        errors: error.errors
      }

    case 'RATE_LIMIT_EXCEEDED':
      return {
        title: 'Rate Limit Exceeded',
        message: `Too many requests. Please try again in ${error.retryAfter} seconds.`,
        retryAfter: error.retryAfter
      }

    case 'QUOTA_EXCEEDED':
      return {
        title: 'Quota Exceeded',
        message: `You've reached your ${error.resource} limit. Upgrade your plan for more.`,
        action: 'upgrade_plan'
      }

    case 'SERVICE_UNAVAILABLE':
      return {
        title: 'Service Unavailable',
        message: `${error.service} is temporarily unavailable. Please try again later.`,
        action: 'retry'
      }

    case 'NETWORK_ERROR':
      return {
        title: 'Connection Error',
        message: 'Unable to connect to our servers. Please check your internet connection.',
        action: 'retry'
      }

    case 'TIMEOUT':
      return {
        title: 'Request Timeout',
        message: 'The request took too long to complete. Please try again.',
        action: 'retry'
      }

    default:
      return {
        title: 'Something went wrong',
        message: error.message || 'An unexpected error occurred. Please try again.',
        action: 'retry'
      }
  }
}

// Error boundary helper
export function getErrorBoundaryFallback(error, errorInfo) {
  return {
    title: 'Application Error',
    message: 'Something went wrong. Please refresh the page and try again.',
    details: import.meta.env.NODE_ENV === 'development' ? {
      error: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack
    } : null
  }
}

// Validation helpers
export function validateRequired(value, fieldName) {
  if (!value || (typeof value === 'string' && !value.trim())) {
    throw new ValidationError(`${fieldName} is required`)
  }
}

export function validateEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email)) {
    throw new ValidationError('Please enter a valid email address')
  }
}

export function validatePassword(password) {
  if (password.length < 8) {
    throw new ValidationError('Password must be at least 8 characters long')
  }
  
  if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) {
    throw new ValidationError('Password must contain at least one uppercase letter, one lowercase letter, and one number')
  }
}

export function validateImageFile(file) {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
  const maxSize = 10 * 1024 * 1024 // 10MB

  if (!file) {
    throw new ValidationError('Please select an image file')
  }

  if (!allowedTypes.includes(file.type)) {
    throw new ValidationError('Please upload a valid image file (JPEG, PNG, WebP, or GIF)')
  }

  if (file.size > maxSize) {
    throw new ValidationError('Image file must be smaller than 10MB')
  }
}

export function validateTextLength(text, minLength = 0, maxLength = 1000, fieldName = 'Text') {
  if (text.length < minLength) {
    throw new ValidationError(`${fieldName} must be at least ${minLength} characters long`)
  }
  
  if (text.length > maxLength) {
    throw new ValidationError(`${fieldName} must be no more than ${maxLength} characters long`)
  }
}

// Error reporting (for production monitoring)
export function reportError(error, context = {}) {
  // In production, send to error monitoring service (e.g., Sentry)
  if (import.meta.env.NODE_ENV === 'production') {
    // Example: Sentry.captureException(error, { extra: context })
    console.error('Error reported:', error, context)
  } else {
    console.error('Development Error:', error, context)
  }
}

// Retry helpers
export async function withRetry(fn, maxRetries = 3, baseDelay = 1000) {
  let lastError
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn()
    } catch (error) {
      lastError = error
      
      // Don't retry on certain errors
      if (
        error instanceof AuthenticationError ||
        error instanceof AuthorizationError ||
        error instanceof ValidationError ||
        error.statusCode === 400 ||
        error.statusCode === 401 ||
        error.statusCode === 403 ||
        error.statusCode === 404
      ) {
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

// Circuit breaker pattern for external services
export class CircuitBreaker {
  constructor(threshold = 5, timeout = 60000, monitoringPeriod = 120000) {
    this.threshold = threshold
    this.timeout = timeout
    this.monitoringPeriod = monitoringPeriod
    this.failureCount = 0
    this.lastFailureTime = null
    this.state = 'CLOSED' // CLOSED, OPEN, HALF_OPEN
  }

  async execute(fn) {
    if (this.state === 'OPEN') {
      if (Date.now() - this.lastFailureTime > this.timeout) {
        this.state = 'HALF_OPEN'
      } else {
        throw new ServiceUnavailableError('Circuit breaker is OPEN')
      }
    }

    try {
      const result = await fn()
      this.onSuccess()
      return result
    } catch (error) {
      this.onFailure()
      throw error
    }
  }

  onSuccess() {
    this.failureCount = 0
    this.state = 'CLOSED'
  }

  onFailure() {
    this.failureCount++
    this.lastFailureTime = Date.now()
    
    if (this.failureCount >= this.threshold) {
      this.state = 'OPEN'
    }
  }
}
