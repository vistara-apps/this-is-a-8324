import React, { useState } from 'react'
import { useApp } from '../contexts/AppContext'
import { Loader2, CheckCircle } from 'lucide-react'

const SocialConnectButton = ({ platform, connected }) => {
  const { connectSocialAccount } = useApp()
  const [connecting, setConnecting] = useState(false)

  const handleConnect = async () => {
    setConnecting(true)
    try {
      await connectSocialAccount(platform)
    } catch (error) {
      console.error('Connection failed:', error)
    } finally {
      setConnecting(false)
    }
  }

  if (connected) {
    return (
      <button
        disabled
        className="flex items-center space-x-2 bg-green-100 text-green-700 px-4 py-2 rounded-lg font-medium"
      >
        <CheckCircle className="w-4 h-4" />
        <span>Connected</span>
      </button>
    )
  }

  return (
    <button
      onClick={handleConnect}
      disabled={connecting}
      className="flex items-center space-x-2 bg-accent text-accent-foreground px-4 py-2 rounded-lg font-medium hover:bg-accent/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
    >
      {connecting ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin" />
          <span>Connecting...</span>
        </>
      ) : (
        <span>Connect</span>
      )}
    </button>
  )
}

export default SocialConnectButton