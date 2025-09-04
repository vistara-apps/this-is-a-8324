import React from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useApp } from '../contexts/AppContext'
import SocialConnectButton from '../components/SocialConnectButton'
import { User, CreditCard, Bell, Shield, Instagram, Play } from 'lucide-react'

const Settings = () => {
  const { user } = useAuth()
  const { socialAccounts } = useApp()

  const settingsSections = [
    {
      title: 'Account Information',
      icon: User,
      items: [
        { label: 'Email', value: user?.email },
        { label: 'Plan', value: user?.subscriptionPlan },
        { label: 'Member since', value: 'December 2024' }
      ]
    },
    {
      title: 'Billing & Subscription',
      icon: CreditCard,
      items: [
        { label: 'Current Plan', value: user?.subscriptionPlan },
        { label: 'Billing Cycle', value: 'Monthly' },
        { label: 'Next Billing Date', value: 'January 15, 2025' }
      ]
    }
  ]

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">Settings</h1>
        <p className="text-muted-foreground">
          Manage your account, billing, and connected social media accounts
        </p>
      </div>

      {/* Social Media Connections */}
      <div className="bg-card rounded-xl p-6 border border-border shadow-card">
        <h2 className="text-xl font-semibold text-foreground mb-6">Connected Social Accounts</h2>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-background rounded-lg">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-pink-100 rounded-lg flex items-center justify-center">
                <Instagram className="w-5 h-5 text-pink-600" />
              </div>
              <div>
                <h3 className="font-medium text-foreground">Instagram</h3>
                <p className="text-sm text-muted-foreground">
                  {socialAccounts.instagram.connected 
                    ? `Connected as ${socialAccounts.instagram.username}`
                    : 'Connect your Instagram business account'
                  }
                </p>
              </div>
            </div>
            <SocialConnectButton 
              platform="instagram"
              connected={socialAccounts.instagram.connected}
            />
          </div>

          <div className="flex items-center justify-between p-4 bg-background rounded-lg">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-black rounded-lg flex items-center justify-center">
                <Play className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-medium text-foreground">TikTok</h3>
                <p className="text-sm text-muted-foreground">
                  {socialAccounts.tiktok.connected 
                    ? `Connected as ${socialAccounts.tiktok.username}`
                    : 'TikTok integration coming soon'
                  }
                </p>
              </div>
            </div>
            <button
              disabled
              className="px-4 py-2 text-sm text-muted-foreground bg-muted rounded-lg cursor-not-allowed"
            >
              Coming Soon
            </button>
          </div>
        </div>
      </div>

      {/* Account & Billing Information */}
      {settingsSections.map((section, index) => {
        const Icon = section.icon
        return (
          <div key={index} className="bg-card rounded-xl p-6 border border-border shadow-card">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-10 h-10 bg-accent/10 rounded-lg flex items-center justify-center">
                <Icon className="w-5 h-5 text-accent" />
              </div>
              <h2 className="text-xl font-semibold text-foreground">{section.title}</h2>
            </div>
            
            <div className="space-y-4">
              {section.items.map((item, itemIndex) => (
                <div key={itemIndex} className="flex justify-between items-center py-3 border-b border-border last:border-b-0">
                  <span className="text-muted-foreground">{item.label}</span>
                  <span className="font-medium text-foreground capitalize">{item.value}</span>
                </div>
              ))}
            </div>

            {section.title === 'Billing & Subscription' && (
              <div className="mt-6 pt-6 border-t border-border">
                <button className="bg-accent text-accent-foreground px-4 py-2 rounded-lg font-medium hover:bg-accent/90 transition-colors mr-3">
                  Upgrade Plan
                </button>
                <button className="text-muted-foreground hover:text-foreground transition-colors">
                  Manage Billing
                </button>
              </div>
            )}
          </div>
        )
      })}

      {/* Preferences */}
      <div className="bg-card rounded-xl p-6 border border-border shadow-card">
        <div className="flex items-center space-x-3 mb-6">
          <div className="w-10 h-10 bg-accent/10 rounded-lg flex items-center justify-center">
            <Bell className="w-5 h-5 text-accent" />
          </div>
          <h2 className="text-xl font-semibold text-foreground">Notifications</h2>
        </div>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium text-foreground">Email Notifications</h3>
              <p className="text-sm text-muted-foreground">Receive updates about your campaigns</p>
            </div>
            <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-accent">
              <span className="inline-block h-4 w-4 transform rounded-full bg-white transition translate-x-6" />
            </button>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium text-foreground">Performance Alerts</h3>
              <p className="text-sm text-muted-foreground">Get notified when ads perform well</p>
            </div>
            <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-accent">
              <span className="inline-block h-4 w-4 transform rounded-full bg-white transition translate-x-6" />
            </button>
          </div>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="bg-card rounded-xl p-6 border border-destructive/20 shadow-card">
        <div className="flex items-center space-x-3 mb-6">
          <div className="w-10 h-10 bg-destructive/10 rounded-lg flex items-center justify-center">
            <Shield className="w-5 h-5 text-destructive" />
          </div>
          <h2 className="text-xl font-semibold text-foreground">Danger Zone</h2>
        </div>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium text-foreground">Delete Account</h3>
              <p className="text-sm text-muted-foreground">Permanently delete your account and all data</p>
            </div>
            <button className="bg-destructive text-destructive-foreground px-4 py-2 rounded-lg font-medium hover:bg-destructive/90 transition-colors">
              Delete Account
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Settings