import React, { useState } from 'react'
import { useApp } from '../contexts/AppContext'
import { Instagram, Send, Loader2, CheckCircle } from 'lucide-react'

const PostButton = ({ variations, creative }) => {
  const { postToSocial, socialAccounts } = useApp()
  const [posting, setPosting] = useState(false)
  const [posted, setPosted] = useState(false)

  const handlePost = async () => {
    setPosting(true)
    try {
      await postToSocial(variations, ['instagram'])
      setPosted(true)
      setTimeout(() => setPosted(false), 3000)
    } catch (error) {
      console.error('Posting failed:', error)
    } finally {
      setPosting(false)
    }
  }

  if (posted) {
    return (
      <button
        disabled
        className="bg-green-500 text-white px-6 py-3 rounded-lg font-semibold flex items-center space-x-2"
      >
        <CheckCircle className="w-5 h-5" />
        <span>Posted Successfully!</span>
      </button>
    )
  }

  return (
    <button
      onClick={handlePost}
      disabled={posting || variations.length === 0}
      className="bg-accent text-accent-foreground px-6 py-3 rounded-lg font-semibold hover:bg-accent/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
    >
      {posting ? (
        <>
          <Loader2 className="w-5 h-5 animate-spin" />
          <span>Posting...</span>
        </>
      ) : (
        <>
          <Instagram className="w-5 h-5" />
          <span>Post to Instagram ({variations.length})</span>
        </>
      )}
    </button>
  )
}

export default PostButton