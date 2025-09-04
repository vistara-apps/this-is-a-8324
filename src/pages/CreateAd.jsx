import React, { useState } from 'react'
import { useApp } from '../contexts/AppContext'
import ImageUploader from '../components/ImageUploader'
import CreativeVariantCard from '../components/CreativeVariantCard'
import PostButton from '../components/PostButton'
import { Sparkles, ArrowRight, Loader2 } from 'lucide-react'

const CreateAd = () => {
  const { generateAdVariations, isGenerating } = useApp()
  const [uploadedImage, setUploadedImage] = useState(null)
  const [productDescription, setProductDescription] = useState('')
  const [generatedCreative, setGeneratedCreative] = useState(null)
  const [selectedVariations, setSelectedVariations] = useState([])

  const handleImageUpload = (file) => {
    setUploadedImage(file)
    setGeneratedCreative(null)
    setSelectedVariations([])
  }

  const handleGenerate = async () => {
    if (!uploadedImage || !productDescription.trim()) return

    try {
      const creative = await generateAdVariations(uploadedImage, productDescription)
      setGeneratedCreative(creative)
      setSelectedVariations([])
    } catch (error) {
      console.error('Generation failed:', error)
    }
  }

  const handleVariationSelect = (variationId) => {
    setSelectedVariations(prev => 
      prev.includes(variationId)
        ? prev.filter(id => id !== variationId)
        : [...prev, variationId]
    )
  }

  const canGenerate = uploadedImage && productDescription.trim() && !isGenerating

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-3xl lg:text-4xl font-bold text-foreground">
          Create AI-Powered Ad Campaign
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Upload your product image and let AI generate multiple high-converting ad variations for testing
        </p>
      </div>

      {/* Step 1: Image Upload */}
      <div className="bg-card rounded-2xl p-8 border border-border shadow-card">
        <div className="flex items-center space-x-3 mb-6">
          <div className="w-8 h-8 bg-accent text-accent-foreground rounded-full flex items-center justify-center text-sm font-bold">
            1
          </div>
          <h2 className="text-xl font-semibold text-foreground">Upload Product Image</h2>
        </div>
        <ImageUploader onImageUpload={handleImageUpload} />
      </div>

      {/* Step 2: Product Description */}
      {uploadedImage && (
        <div className="bg-card rounded-2xl p-8 border border-border shadow-card">
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-8 h-8 bg-accent text-accent-foreground rounded-full flex items-center justify-center text-sm font-bold">
              2
            </div>
            <h2 className="text-xl font-semibold text-foreground">Describe Your Product</h2>
          </div>
          <div className="space-y-4">
            <textarea
              value={productDescription}
              onChange={(e) => setProductDescription(e.target.value)}
              placeholder="Describe your product, its key features, benefits, and target audience. The more details you provide, the better the AI can create targeted ad copy."
              className="w-full h-32 px-4 py-3 border border-border rounded-lg bg-background text-foreground placeholder-muted-foreground focus:ring-2 focus:ring-accent focus:border-transparent resize-none"
            />
            <div className="flex justify-between items-center">
              <p className="text-sm text-muted-foreground">
                {productDescription.length}/500 characters
              </p>
              <button
                onClick={handleGenerate}
                disabled={!canGenerate}
                className="bg-accent text-accent-foreground px-6 py-3 rounded-lg font-semibold hover:bg-accent/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Generating...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5" />
                    <span>Generate Ad Variations</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Step 3: Generated Variations */}
      {generatedCreative && (
        <div className="bg-card rounded-2xl p-8 border border-border shadow-card">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-accent text-accent-foreground rounded-full flex items-center justify-center text-sm font-bold">
                3
              </div>
              <h2 className="text-xl font-semibold text-foreground">Select Variations to Post</h2>
            </div>
            {selectedVariations.length > 0 && (
              <PostButton 
                variations={selectedVariations}
                creative={generatedCreative}
              />
            )}
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {generatedCreative.generatedVariations.map((variation) => (
              <CreativeVariantCard
                key={variation.id}
                variation={variation}
                selected={selectedVariations.includes(variation.id)}
                onSelect={() => handleVariationSelect(variation.id)}
              />
            ))}
          </div>

          {selectedVariations.length > 0 && (
            <div className="mt-6 p-4 bg-accent/10 rounded-lg border border-accent/20">
              <p className="text-sm text-accent">
                {selectedVariations.length} variation{selectedVariations.length !== 1 ? 's' : ''} selected for posting
              </p>
            </div>
          )}
        </div>
      )}

      {/* Loading State */}
      {isGenerating && (
        <div className="bg-card rounded-2xl p-8 border border-border shadow-card">
          <div className="text-center space-y-4">
            <Loader2 className="w-12 h-12 text-accent animate-spin mx-auto" />
            <h3 className="text-xl font-semibold text-foreground">AI is crafting your ad variations</h3>
            <p className="text-muted-foreground">
              Our AI is analyzing your product and creating compelling ad copy variations. This usually takes 10-30 seconds.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}

export default CreateAd