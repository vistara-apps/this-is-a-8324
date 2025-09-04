import React from 'react'
import { useApp } from '../contexts/AppContext'
import { TrendingUp, Eye, MousePointer, Heart, BarChart3, Users } from 'lucide-react'

const Analytics = () => {
  const { adCreatives } = useApp()

  // Calculate overall metrics
  const totalViews = adCreatives.reduce((sum, creative) => 
    sum + creative.generatedVariations.reduce((varSum, variation) => 
      varSum + (variation.performance?.views || 0), 0
    ), 0
  )

  const totalClicks = adCreatives.reduce((sum, creative) => 
    sum + creative.generatedVariations.reduce((varSum, variation) => 
      varSum + (variation.performance?.clicks || 0), 0
    ), 0
  )

  const totalEngagement = adCreatives.reduce((sum, creative) => 
    sum + creative.generatedVariations.reduce((varSum, variation) => 
      varSum + (variation.performance?.engagement || 0), 0
    ), 0
  )

  const totalPosts = adCreatives.reduce((sum, creative) => 
    sum + creative.generatedVariations.filter(variation => variation.posted).length, 0
  )

  const ctr = totalViews > 0 ? ((totalClicks / totalViews) * 100).toFixed(2) : 0
  const engagementRate = totalViews > 0 ? ((totalEngagement / totalViews) * 100).toFixed(2) : 0

  const metrics = [
    {
      title: 'Total Views',
      value: totalViews.toLocaleString(),
      icon: Eye,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
      change: '+12.3%'
    },
    {
      title: 'Total Clicks',
      value: totalClicks.toLocaleString(),
      icon: MousePointer,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
      change: '+8.7%'
    },
    {
      title: 'Engagement',
      value: totalEngagement.toLocaleString(),
      icon: Heart,
      color: 'text-pink-600',
      bgColor: 'bg-pink-100',
      change: '+15.2%'
    },
    {
      title: 'CTR',
      value: `${ctr}%`,
      icon: TrendingUp,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
      change: '+2.1%'
    }
  ]

  // Get posted ads with performance data
  const postedAds = adCreatives.flatMap(creative => 
    creative.generatedVariations
      .filter(variation => variation.posted)
      .map(variation => ({
        ...variation,
        creativeId: creative.creativeId,
        createdAt: creative.createdAt
      }))
  ).sort((a, b) => (b.performance?.views || 0) - (a.performance?.views || 0))

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">Analytics Dashboard</h1>
        <p className="text-muted-foreground">
          Track the performance of your AI-generated ad campaigns across social platforms
        </p>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {metrics.map((metric, index) => {
          const Icon = metric.icon
          return (
            <div key={index} className="bg-card rounded-xl p-6 border border-border shadow-card">
              <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 ${metric.bgColor} rounded-lg flex items-center justify-center`}>
                  <Icon className={`w-6 h-6 ${metric.color}`} />
                </div>
                <span className="text-sm font-medium text-green-600">{metric.change}</span>
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{metric.value}</p>
                <p className="text-sm text-muted-foreground">{metric.title}</p>
              </div>
            </div>
          )
        })}
      </div>

      {/* Performance Overview */}
      <div className="bg-card rounded-xl p-6 border border-border shadow-card">
        <h2 className="text-xl font-semibold text-foreground mb-6">Performance Overview</h2>
        
        {totalPosts === 0 ? (
          <div className="text-center py-12">
            <BarChart3 className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">No data available</h3>
            <p className="text-muted-foreground">
              Start posting your ad variations to see performance analytics here
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Summary Cards */}
            <div className="grid md:grid-cols-3 gap-4">
              <div className="bg-background rounded-lg p-4">
                <div className="text-2xl font-bold text-foreground">{totalPosts}</div>
                <div className="text-sm text-muted-foreground">Total Posts</div>
              </div>
              <div className="bg-background rounded-lg p-4">
                <div className="text-2xl font-bold text-foreground">{engagementRate}%</div>
                <div className="text-sm text-muted-foreground">Engagement Rate</div>
              </div>
              <div className="bg-background rounded-lg p-4">
                <div className="text-2xl font-bold text-foreground">{ctr}%</div>
                <div className="text-sm text-muted-foreground">Click-Through Rate</div>
              </div>
            </div>

            {/* Mock Chart */}
            <div className="h-64 bg-muted rounded-lg flex items-center justify-center">
              <div className="text-center">
                <BarChart3 className="w-12 h-12 text-muted-foreground mx-auto mb-2" />
                <p className="text-muted-foreground">Performance chart visualization would go here</p>
                <p className="text-sm text-muted-foreground">Integration with charting library needed</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Top Performing Ads */}
      {postedAds.length > 0 && (
        <div className="bg-card rounded-xl p-6 border border-border shadow-card">
          <h2 className="text-xl font-semibold text-foreground mb-6">Top Performing Ads</h2>
          
          <div className="space-y-4">
            {postedAds.slice(0, 5).map((ad, index) => (
              <div key={ad.id} className="flex items-center space-x-4 p-4 bg-background rounded-lg">
                <div className="flex-shrink-0">
                  <img 
                    src={ad.image} 
                    alt="Ad"
                    className="w-16 h-16 object-cover rounded-lg"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">
                    {ad.content.substring(0, 60)}...
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Posted {new Date(ad.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex space-x-6 text-sm">
                  <div className="text-center">
                    <div className="font-medium text-foreground">{ad.performance?.views || 0}</div>
                    <div className="text-xs text-muted-foreground">Views</div>
                  </div>
                  <div className="text-center">
                    <div className="font-medium text-foreground">{ad.performance?.clicks || 0}</div>
                    <div className="text-xs text-muted-foreground">Clicks</div>
                  </div>
                  <div className="text-center">
                    <div className="font-medium text-foreground">{ad.performance?.engagement || 0}</div>
                    <div className="text-xs text-muted-foreground">Likes</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default Analytics