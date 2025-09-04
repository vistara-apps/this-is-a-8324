import React from 'react'
import { useNavigate } from 'react-router-dom'
import { Check, ArrowLeft, Zap } from 'lucide-react'

const PricingPage = () => {
  const navigate = useNavigate()

  const plans = [
    {
      name: 'Starter',
      price: 19,
      description: 'Perfect for small businesses and individual creators',
      features: [
        '50 AI ad generations per month',
        '10 social media posts per month',
        'Instagram integration',
        'Basic analytics dashboard',
        'Email support',
        'Standard AI models'
      ],
      buttonText: 'Start Free Trial',
      popular: false
    },
    {
      name: 'Pro',
      price: 49,
      description: 'For growing businesses and marketing teams',
      features: [
        'Unlimited AI ad generations',
        '50 social media posts per month',
        'Instagram + TikTok integration',
        'Advanced analytics & insights',
        'Priority support',
        'Premium AI models',
        'A/B testing tools',
        'Performance optimization'
      ],
      buttonText: 'Start Free Trial',
      popular: true
    }
  ]

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            <button
              onClick={() => navigate('/')}
              className="flex items-center space-x-2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Back to Home</span>
            </button>
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg flex items-center justify-center">
                <Zap className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-foreground">AdSpark AI Remix</span>
            </div>
          </div>
        </div>
      </header>

      {/* Pricing Section */}
      <section className="py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h1 className="text-4xl lg:text-5xl font-bold text-foreground mb-4">
              Choose Your Plan
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Start with a 7-day free trial. No credit card required. Scale your ad campaigns with AI.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {plans.map((plan, index) => (
              <div 
                key={index} 
                className={`relative bg-card rounded-2xl p-8 border shadow-card ${
                  plan.popular ? 'border-accent shadow-xl' : 'border-border'
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <span className="bg-accent text-accent-foreground px-4 py-2 rounded-full text-sm font-medium">
                      Most Popular
                    </span>
                  </div>
                )}

                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold text-foreground mb-2">{plan.name}</h3>
                  <div className="text-4xl font-bold text-foreground mb-2">
                    ${plan.price}<span className="text-lg text-muted-foreground">/month</span>
                  </div>
                  <p className="text-muted-foreground">{plan.description}</p>
                </div>

                <ul className="space-y-4 mb-8">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-start space-x-3">
                      <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span className="text-foreground">{feature}</span>
                    </li>
                  ))}
                </ul>

                <button
                  onClick={() => navigate('/app')}
                  className={`w-full py-3 rounded-lg font-semibold transition-colors ${
                    plan.popular
                      ? 'bg-accent text-accent-foreground hover:bg-accent/90'
                      : 'border border-border text-foreground hover:bg-muted'
                  }`}
                >
                  {plan.buttonText}
                </button>
              </div>
            ))}
          </div>

          {/* FAQ */}
          <div className="mt-20">
            <h2 className="text-2xl font-bold text-foreground text-center mb-12">
              Frequently Asked Questions
            </h2>
            
            <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              <div className="space-y-6">
                <div>
                  <h3 className="font-semibold text-foreground mb-2">How does the free trial work?</h3>
                  <p className="text-muted-foreground text-sm">
                    Start with a 7-day free trial that includes full access to all features. No credit card required to start.
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold text-foreground mb-2">Can I change plans anytime?</h3>
                  <p className="text-muted-foreground text-sm">
                    Yes, you can upgrade or downgrade your plan at any time. Changes take effect on your next billing cycle.
                  </p>
                </div>
              </div>
              
              <div className="space-y-6">
                <div>
                  <h3 className="font-semibold text-foreground mb-2">What social platforms are supported?</h3>
                  <p className="text-muted-foreground text-sm">
                    Currently Instagram with TikTok integration coming soon. More platforms will be added based on user feedback.
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold text-foreground mb-2">Is there a refund policy?</h3>
                  <p className="text-muted-foreground text-sm">
                    Yes, we offer a 30-day money-back guarantee. If you're not satisfied, we'll refund your subscription.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

export default PricingPage