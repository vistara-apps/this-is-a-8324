import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { 
  Zap, 
  Sparkles, 
  Target, 
  TrendingUp, 
  Instagram, 
  Play,
  ArrowRight,
  Check,
  Star
} from 'lucide-react'
import AuthModal from '../components/AuthModal'

const LandingPage = () => {
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [authMode, setAuthMode] = useState('signin')
  const navigate = useNavigate()
  const { user } = useAuth()

  const features = [
    {
      icon: Sparkles,
      title: 'AI-Powered Ad Generation',
      description: 'Upload one product image and get 3-5 unique ad variations with compelling copy that converts.'
    },
    {
      icon: Target,
      title: 'Direct Social Posting',
      description: 'Connect your Instagram and TikTok accounts to post variations instantly for A/B testing.'
    },
    {
      icon: TrendingUp,
      title: 'Performance Tracking',
      description: 'Get real-time insights on engagement, clicks, and conversions to optimize your campaigns.'
    }
  ]

  const testimonials = [
    {
      name: 'Sarah Chen',
      role: 'E-commerce Founder',
      content: 'AdSpark cut my ad creation time by 80%. I can now test 10x more variations and my ROAS improved by 340%.',
      rating: 5
    },
    {
      name: 'Marcus Rodriguez',
      role: 'Digital Marketing Manager',
      content: 'The AI generates copy that actually converts. Our engagement rates increased 150% since we started using AdSpark.',
      rating: 5
    }
  ]

  const handleGetStarted = () => {
    if (user) {
      navigate('/app')
    } else {
      setAuthMode('signup')
      setShowAuthModal(true)
    }
  }

  const handleSignIn = () => {
    if (user) {
      navigate('/app')
    } else {
      setAuthMode('signin')
      setShowAuthModal(true)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="relative z-10 bg-card/80 backdrop-blur-sm border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg flex items-center justify-center">
                <Zap className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-foreground">AdSpark AI Remix</span>
            </div>
            <nav className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-muted-foreground hover:text-foreground transition-colors">
                Features
              </a>
              <a href="#pricing" className="text-muted-foreground hover:text-foreground transition-colors">
                Pricing
              </a>
              <button
                onClick={handleSignIn}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                Sign In
              </button>
              <button
                onClick={handleGetStarted}
                className="bg-accent text-accent-foreground px-4 py-2 rounded-md hover:bg-accent/90 transition-colors"
              >
                Get Started
              </button>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 gradient-bg opacity-10"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="space-y-4">
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground leading-tight">
                  Spin Ad Variations & 
                  <span className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                    {' '}Automate Social Posting
                  </span> with AI
                </h1>
                <p className="text-lg text-muted-foreground max-w-2xl">
                  Upload one product image and receive 3-5 AI-generated ad copy and visual variations. 
                  Post them directly to Instagram and TikTok for rapid A/B testing.
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={handleGetStarted}
                  className="bg-accent text-accent-foreground px-8 py-4 rounded-lg font-semibold hover:bg-accent/90 transition-colors flex items-center justify-center space-x-2"
                >
                  <span>Start Creating Ads</span>
                  <ArrowRight className="w-5 h-5" />
                </button>
                <button className="border border-border text-foreground px-8 py-4 rounded-lg font-semibold hover:bg-muted transition-colors flex items-center justify-center space-x-2">
                  <Play className="w-5 h-5" />
                  <span>Watch Demo</span>
                </button>
              </div>

              <div className="flex items-center space-x-8 pt-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-foreground">10x</div>
                  <div className="text-sm text-muted-foreground">Faster Testing</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-foreground">340%</div>
                  <div className="text-sm text-muted-foreground">ROAS Increase</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-foreground">80%</div>
                  <div className="text-sm text-muted-foreground">Time Saved</div>
                </div>
              </div>
            </div>

            {/* Hero Image */}
            <div className="relative">
              <div className="relative bg-card rounded-2xl shadow-card p-6 border border-border">
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                    <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  </div>
                  <div className="space-y-3">
                    <div className="bg-muted rounded-lg p-4">
                      <div className="flex items-center space-x-2 mb-2">
                        <Instagram className="w-4 h-4 text-pink-500" />
                        <span className="text-sm font-medium">Generated Ad #1</span>
                      </div>
                      <div className="h-32 bg-gradient-to-r from-purple-400 to-pink-400 rounded-md mb-2"></div>
                      <p className="text-xs text-muted-foreground">🔥 Transform your space with our premium product...</p>
                    </div>
                    <div className="bg-muted rounded-lg p-4">
                      <div className="flex items-center space-x-2 mb-2">
                        <Instagram className="w-4 h-4 text-pink-500" />
                        <span className="text-sm font-medium">Generated Ad #2</span>
                      </div>
                      <div className="h-32 bg-gradient-to-r from-blue-400 to-purple-400 rounded-md mb-2"></div>
                      <p className="text-xs text-muted-foreground">Discover the secret to success with...</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
              Everything you need to scale your ad campaigns
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              From AI generation to social posting and performance tracking - all in one platform
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon
              return (
                <div key={index} className="text-center space-y-4">
                  <div className="w-16 h-16 bg-accent/10 rounded-2xl flex items-center justify-center mx-auto">
                    <Icon className="w-8 h-8 text-accent" />
                  </div>
                  <h3 className="text-xl font-semibold text-foreground">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
              Trusted by creators and marketers
            </h2>
            <p className="text-lg text-muted-foreground">
              See how AdSpark is transforming ad campaigns
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-card rounded-2xl p-8 border border-border shadow-card">
                <div className="flex items-center space-x-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-foreground mb-6">"{testimonial.content}"</p>
                <div>
                  <div className="font-semibold text-foreground">{testimonial.name}</div>
                  <div className="text-sm text-muted-foreground">{testimonial.role}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 bg-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
              Simple, transparent pricing
            </h2>
            <p className="text-lg text-muted-foreground">
              Choose the plan that scales with your business
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Starter Plan */}
            <div className="bg-background rounded-2xl p-8 border border-border">
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-foreground mb-2">Starter</h3>
                <div className="text-4xl font-bold text-foreground mb-2">$19<span className="text-lg text-muted-foreground">/month</span></div>
                <p className="text-muted-foreground">Perfect for small businesses</p>
              </div>
              <ul className="space-y-4 mb-8">
                <li className="flex items-center space-x-3">
                  <Check className="w-5 h-5 text-green-500" />
                  <span className="text-foreground">50 AI ad generations</span>
                </li>
                <li className="flex items-center space-x-3">
                  <Check className="w-5 h-5 text-green-500" />
                  <span className="text-foreground">10 social media posts</span>
                </li>
                <li className="flex items-center space-x-3">
                  <Check className="w-5 h-5 text-green-500" />
                  <span className="text-foreground">Basic analytics</span>
                </li>
                <li className="flex items-center space-x-3">
                  <Check className="w-5 h-5 text-green-500" />
                  <span className="text-foreground">Instagram integration</span>
                </li>
              </ul>
              <button
                onClick={handleGetStarted}
                className="w-full border border-border text-foreground py-3 rounded-lg font-semibold hover:bg-muted transition-colors"
              >
                Get Started
              </button>
            </div>

            {/* Pro Plan */}
            <div className="bg-background rounded-2xl p-8 border-2 border-accent relative">
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <span className="bg-accent text-accent-foreground px-4 py-1 rounded-full text-sm font-medium">
                  Most Popular
                </span>
              </div>
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-foreground mb-2">Pro</h3>
                <div className="text-4xl font-bold text-foreground mb-2">$49<span className="text-lg text-muted-foreground">/month</span></div>
                <p className="text-muted-foreground">For growing businesses</p>
              </div>
              <ul className="space-y-4 mb-8">
                <li className="flex items-center space-x-3">
                  <Check className="w-5 h-5 text-green-500" />
                  <span className="text-foreground">Unlimited AI generations</span>
                </li>
                <li className="flex items-center space-x-3">
                  <Check className="w-5 h-5 text-green-500" />
                  <span className="text-foreground">50 social media posts</span>
                </li>
                <li className="flex items-center space-x-3">
                  <Check className="w-5 h-5 text-green-500" />
                  <span className="text-foreground">Advanced analytics</span>
                </li>
                <li className="flex items-center space-x-3">
                  <Check className="w-5 h-5 text-green-500" />
                  <span className="text-foreground">Instagram + TikTok integration</span>
                </li>
                <li className="flex items-center space-x-3">
                  <Check className="w-5 h-5 text-green-500" />
                  <span className="text-foreground">Priority support</span>
                </li>
              </ul>
              <button
                onClick={handleGetStarted}
                className="w-full bg-accent text-accent-foreground py-3 rounded-lg font-semibold hover:bg-accent/90 transition-colors"
              >
                Start Free Trial
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
            Ready to 10x your ad testing?
          </h2>
          <p className="text-lg text-muted-foreground mb-8">
            Join thousands of creators and marketers who are scaling their campaigns with AI
          </p>
          <button
            onClick={handleGetStarted}
            className="bg-accent text-accent-foreground px-8 py-4 rounded-lg font-semibold hover:bg-accent/90 transition-colors text-lg"
          >
            Start Your Free Trial
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-card border-t border-border py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg flex items-center justify-center">
                <Zap className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-foreground">AdSpark AI Remix</span>
            </div>
            <p className="text-muted-foreground">© 2024 AdSpark AI Remix. All rights reserved.</p>
          </div>
        </div>
      </footer>

      {/* Auth Modal */}
      {showAuthModal && (
        <AuthModal 
          mode={authMode}
          onClose={() => setShowAuthModal(false)}
          onSuccess={() => {
            setShowAuthModal(false)
            navigate('/app')
          }}
        />
      )}
    </div>
  )
}

export default LandingPage