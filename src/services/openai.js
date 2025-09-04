// OpenAI API service for ad generation
import { apiRequest, rateLimiter, withRetry, logAPICall } from '../utils/api.js'
import { validateEnvVars, convertImageToBase64 } from '../utils/api.js'
import { ServiceUnavailableError, ValidationError, QuotaExceededError } from '../utils/errors.js'

// Validate required environment variables
validateEnvVars(['VITE_OPENAI_API_KEY'])

const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY
const OPENAI_BASE_URL = 'https://api.openai.com/v1'

class OpenAIService {
  constructor() {
    this.baseHeaders = {
      'Authorization': `Bearer ${OPENAI_API_KEY}`,
      'Content-Type': 'application/json'
    }
  }

  async generateAdVariations(imageFile, productDescription, options = {}) {
    const startTime = Date.now()
    
    try {
      // Check rate limits
      rateLimiter.checkLimit('openai')

      // Validate inputs
      if (!imageFile) {
        throw new ValidationError('Image file is required')
      }
      
      if (!productDescription || productDescription.trim().length < 10) {
        throw new ValidationError('Product description must be at least 10 characters long')
      }

      // Convert image to base64
      const imageBase64 = await convertImageToBase64(imageFile)

      // Generate ad variations using GPT-4 Vision
      const variations = await this.generateTextVariations(imageBase64, productDescription, options)

      logAPICall('openai', 'generate-ad-variations', Date.now() - startTime, true)
      
      return {
        variations,
        inputImage: URL.createObjectURL(imageFile),
        metadata: {
          model: 'gpt-4-vision-preview',
          timestamp: new Date().toISOString(),
          productDescription
        }
      }
    } catch (error) {
      logAPICall('openai', 'generate-ad-variations', Date.now() - startTime, false, error)
      throw this.handleOpenAIError(error)
    }
  }

  async generateTextVariations(imageBase64, productDescription, options = {}) {
    const {
      variationCount = 4,
      tone = 'engaging',
      platform = 'instagram',
      targetAudience = 'general'
    } = options

    const prompt = this.buildPrompt(productDescription, {
      variationCount,
      tone,
      platform,
      targetAudience
    })

    const response = await withRetry(async () => {
      return await apiRequest(`${OPENAI_BASE_URL}/chat/completions`, {
        method: 'POST',
        headers: this.baseHeaders,
        body: {
          model: 'gpt-4-vision-preview',
          messages: [
            {
              role: 'user',
              content: [
                {
                  type: 'text',
                  text: prompt
                },
                {
                  type: 'image_url',
                  image_url: {
                    url: imageBase64,
                    detail: 'high'
                  }
                }
              ]
            }
          ],
          max_tokens: 1500,
          temperature: 0.8,
          top_p: 0.9
        }
      })
    })

    return this.parseVariationsResponse(response, imageBase64)
  }

  buildPrompt(productDescription, options) {
    const { variationCount, tone, platform, targetAudience } = options

    return `You are an expert social media marketer and copywriter. Analyze the provided product image and create ${variationCount} compelling ad variations for ${platform}.

Product Description: ${productDescription}
Target Audience: ${targetAudience}
Tone: ${tone}

Requirements:
1. Each variation should be unique and test different marketing angles
2. Include relevant emojis and hashtags appropriate for ${platform}
3. Keep text under 280 characters for optimal engagement
4. Focus on benefits, not just features
5. Create urgency or emotional connection where appropriate
6. Ensure variations test different psychological triggers (FOMO, social proof, curiosity, etc.)

Analyze the image to identify:
- Key visual elements and product features
- Potential use cases or benefits
- Target demographic based on styling/presentation
- Unique selling points visible in the image

Return ONLY a JSON array with this exact structure:
[
  {
    "id": "1",
    "type": "text",
    "content": "Ad copy here with emojis and hashtags",
    "angle": "benefit-focused",
    "hook": "curiosity"
  },
  {
    "id": "2", 
    "type": "text",
    "content": "Different ad copy here",
    "angle": "social-proof",
    "hook": "fomo"
  }
]

Make each variation distinctly different in approach and messaging.`
  }

  parseVariationsResponse(response, imageBase64) {
    try {
      const content = response.choices[0]?.message?.content
      if (!content) {
        throw new Error('No content in OpenAI response')
      }

      // Extract JSON from response (handle potential markdown formatting)
      const jsonMatch = content.match(/\[[\s\S]*\]/)
      if (!jsonMatch) {
        throw new Error('No valid JSON array found in response')
      }

      const variations = JSON.parse(jsonMatch[0])
      
      // Validate and enhance variations
      return variations.map((variation, index) => ({
        id: variation.id || (index + 1).toString(),
        type: 'text',
        content: variation.content || '',
        angle: variation.angle || 'general',
        hook: variation.hook || 'benefit',
        image: imageBase64,
        performance: { views: 0, clicks: 0, engagement: 0 },
        createdAt: new Date().toISOString()
      }))
    } catch (error) {
      console.error('Failed to parse OpenAI response:', error)
      
      // Fallback: create basic variations
      return this.createFallbackVariations(imageBase64)
    }
  }

  createFallbackVariations(imageBase64) {
    return [
      {
        id: '1',
        type: 'text',
        content: '🔥 Transform your life with this amazing product! Limited time offer - don\'t miss out! #Innovation #LifeChanger',
        angle: 'urgency',
        hook: 'fomo',
        image: imageBase64,
        performance: { views: 0, clicks: 0, engagement: 0 },
        createdAt: new Date().toISOString()
      },
      {
        id: '2',
        type: 'text',
        content: '✨ Discover what thousands of customers already know - this product delivers results! Join the community today.',
        angle: 'social-proof',
        hook: 'community',
        image: imageBase64,
        performance: { views: 0, clicks: 0, engagement: 0 },
        createdAt: new Date().toISOString()
      },
      {
        id: '3',
        type: 'text',
        content: '💫 Ready to upgrade your experience? This game-changing product is exactly what you\'ve been looking for!',
        angle: 'benefit-focused',
        hook: 'curiosity',
        image: imageBase64,
        performance: { views: 0, clicks: 0, engagement: 0 },
        createdAt: new Date().toISOString()
      },
      {
        id: '4',
        type: 'text',
        content: '🚀 BREAKTHROUGH ALERT! The product everyone\'s talking about is here. Be among the first to experience the difference!',
        angle: 'innovation',
        hook: 'exclusivity',
        image: imageBase64,
        performance: { views: 0, clicks: 0, engagement: 0 },
        createdAt: new Date().toISOString()
      }
    ]
  }

  async generateCustomPrompt(userPrompt, imageFile) {
    const startTime = Date.now()
    
    try {
      rateLimiter.checkLimit('openai')
      
      const imageBase64 = await convertImageToBase64(imageFile)
      
      const response = await withRetry(async () => {
        return await apiRequest(`${OPENAI_BASE_URL}/chat/completions`, {
          method: 'POST',
          headers: this.baseHeaders,
          body: {
            model: 'gpt-4-vision-preview',
            messages: [
              {
                role: 'user',
                content: [
                  {
                    type: 'text',
                    text: userPrompt
                  },
                  {
                    type: 'image_url',
                    image_url: {
                      url: imageBase64,
                      detail: 'high'
                    }
                  }
                ]
              }
            ],
            max_tokens: 1000,
            temperature: 0.7
          }
        })
      })

      logAPICall('openai', 'custom-prompt', Date.now() - startTime, true)
      
      return response.choices[0]?.message?.content || 'No response generated'
    } catch (error) {
      logAPICall('openai', 'custom-prompt', Date.now() - startTime, false, error)
      throw this.handleOpenAIError(error)
    }
  }

  handleOpenAIError(error) {
    if (error.status === 401) {
      return new ServiceUnavailableError('OpenAI', 'Invalid API key')
    }
    
    if (error.status === 429) {
      return new QuotaExceededError('OpenAI API calls', 'rate limit')
    }
    
    if (error.status === 402) {
      return new QuotaExceededError('OpenAI credits', 'billing limit')
    }
    
    if (error.status >= 500) {
      return new ServiceUnavailableError('OpenAI', 'Service temporarily unavailable')
    }
    
    return error
  }

  // Get usage statistics
  async getUsageStats() {
    try {
      const response = await apiRequest(`${OPENAI_BASE_URL}/usage`, {
        headers: this.baseHeaders
      })
      
      return response
    } catch (error) {
      console.warn('Failed to fetch OpenAI usage stats:', error)
      return null
    }
  }
}

export default new OpenAIService()
