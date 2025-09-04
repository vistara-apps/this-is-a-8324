import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../contexts/AppContext'
import { useAuth } from '../contexts/AuthContext'
import { 
  PlusCircle, 
  TrendingUp, 
  Users, 
  DollarSign,
  ArrowRight,
  Instagram,
  Play,
  BarChart3
} from 'lucide-react'

const Dashboard = () => {
  const navigate = useNavigate()
  const { adCreatives } = useApp()
  const { user } = useAuth()

  // Calculate stats
  const totalCreatives = adCreatives.length
  const totalVariations = adCreatives.reduce((sum, creative) => sum + creative.generatedVariations.length, 0)
  const totalPosts = adCreatives.reduce((sum, creative) => 
    sum + creative.generatedVariations.filter(variation => variation.posted).length, 0
  )
  const totalViews = adCreatives.reduce((sum, creative) => 
    sum + creative.generatedVariations.reduce((varSum, variation) => 
      varSum + (variation.performance?.views || 0), 0
    ), 0
  )

  const stats = [
    {
      title: 'Total Ad Creatives',
      value: totalCreatives,
      icon: PlusCircle,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
    {
      title: 'Generated Variations',
      value: totalVariations,
      icon: TrendingUp,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
    },
    {
      title: 'Posted Ads',
      value: totalPosts,
      icon: Users,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
    },
    {
      title: 'Total Views',
      value: totalViews.toLocaleString(),
      icon: BarChart3,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100',
    },
  ]

  const recentCreatives = adCreatives.slice(0, 3)

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl p-8 text-white">
        <div className="max-w-2xl">
          <h1 className="text-3xl font-bold mb-2">Welcome back!</h1>
          <p className="text-purple-100 mb-6">
            Ready to create more converting ad variations? Let's turn your products into viral campaigns.
          </p>
          <button
            onClick={() => navigate('/app/create')}
            className="bg-white text-purple-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors flex items-center space-x-2"
          >
            <PlusCircle className="w-5 h-5" />
            <span>Create New Ad Campaign</span>
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon
          return (
            <div key={index} className="bg-card rounded-xl p-6 border border-border shadow-card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-muted-foreground text-sm font-medium">{stat.title}</p>
                  <p className="text-2xl font-bold text-foreground mt-1">{stat.value}</p>
                </div>
                <div className={`w-12 h-12 ${stat.bgColor} rounded-lg flex items-center justify-center`}>
                  <Icon className={`w-6 h-6 ${stat.color}`} />
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Quick Actions */}
      <div className="grid md:grid-cols-3 gap-6">
        <div 
          onClick={() => navigate('/app/create')}
          className="bg-card rounded-xl p-6 border border-border shadow-card hover:shadow-lg transition-shadow cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <PlusCircle className="w-6 h-6 text-blue-600" />
            </div>
            <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-foreground transition-colors" />
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-2">Create Ad Campaign</h3>
          <p className="text-muted-foreground text-sm">Upload a product image and generate AI-powered ad variations</p>
        </div>

        <div 
          onClick={() => navigate('/app/analytics')}
          className="bg-card rounded-xl p-6 border border-border shadow-card hover:shadow-lg transition-shadow cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-green-600" />
            </div>
            <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-foreground transition-colors" />
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-2">View Analytics</h3>
          <p className="text-muted-foreground text-sm">Track performance and optimize your ad campaigns</p>
        </div>

        <div 
          onClick={() => navigate('/app/settings')}
          className="bg-card rounded-xl p-6 border border-border shadow-card hover:shadow-lg transition-shadow cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <Instagram className="w-6 h-6 text-purple-600" />
            </div>
            <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-foreground transition-colors" />
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-2">Connect Accounts</h3>
          <p className="text-muted-foreground text-sm">Link your social media accounts for direct posting</p>
        </div>
      </div>

      {/* Recent Creatives */}
      {recentCreatives.length > 0 && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-foreground">Recent Ad Campaigns</h2>
            <button
              onClick={() => navigate('/app/analytics')}
              className="text-accent hover:text-accent/80 transition-colors flex items-center space-x-1"
            >
              <span>View All</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {recentCreatives.map((creative) => (
              <div key={creative.creativeId} className="bg-card rounded-xl border border-border shadow-card overflow-hidden">
                <div className="aspect-video bg-muted relative">
                  <img 
                    src={creative.inputImage} 
                    alt="Ad creative"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-3 right-3 bg-black/70 text-white px-2 py-1 rounded text-xs">
                    {creative.generatedVariations.length} variations
                  </div>
                </div>
                <div className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-muted-foreground">
                      {new Date(creative.createdAt).toLocaleDateString()}
                    </span>
                    <span className="text-sm text-accent">
                      {creative.generatedVariations.filter(v => v.posted).length} posted
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {creative.generatedVariations[0]?.content.substring(0, 80)}...
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {adCreatives.length === 0 && (
        <div className="text-center py-12">
          <div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center mx-auto mb-6">
            <PlusCircle className="w-12 h-12 text-muted-foreground" />
          </div>
          <h3 className="text-xl font-semibold text-foreground mb-2">No ad campaigns yet</h3>
          <p className="text-muted-foreground mb-6 max-w-md mx-auto">
            Get started by creating your first AI-powered ad campaign. Upload a product image and watch the magic happen!
          </p>
          <button
            onClick={() => navigate('/app/create')}
            className="bg-accent text-accent-foreground px-6 py-3 rounded-lg font-semibold hover:bg-accent/90 transition-colors"
          >
            Create Your First Campaign
          </button>
        </div>
      )}
    </div>
  )
}

export default Dashboard