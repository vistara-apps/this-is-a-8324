import React from 'react'
import { Check, Instagram, Play, Eye, MousePointer, Heart } from 'lucide-react'

const CreativeVariantCard = ({ variation, selected, onSelect }) => {
  const { content, image, performance, posted } = variation

  return (
    <div 
      className={`bg-background rounded-xl border-2 transition-all cursor-pointer ${
        selected 
          ? 'border-accent shadow-lg' 
          : 'border-border hover:border-accent/50'
      }`}
      onClick={onSelect}
    >
      {/* Selection indicator */}
      <div className="relative">
        <div className={`absolute top-3 right-3 z-10 w-6 h-6 rounded-full border-2 transition-all ${
          selected 
            ? 'bg-accent border-accent' 
            : 'bg-card border-border'
        }`}>
          {selected && <Check className="w-4 h-4 text-accent-foreground m-0.5" />}
        </div>
        
        {/* Image */}
        <div className="aspect-square bg-muted rounded-t-lg overflow-hidden">
          <img 
            src={image} 
            alt="Ad variation"
            className="w-full h-full object-cover"
          />
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-4">
        {/* Ad Copy */}
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <Instagram className="w-4 h-4 text-pink-500" />
            <span className="text-sm font-medium text-foreground">Instagram Post</span>
            {posted && (
              <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                Posted
              </span>
            )}
          </div>
          <p className="text-sm text-foreground leading-relaxed">
            {content}
          </p>
        </div>

        {/* Performance Metrics */}
        {performance && (performance.views > 0 || posted) && (
          <div className="grid grid-cols-3 gap-3 pt-3 border-t border-border">
            <div className="text-center">
              <div className="flex items-center justify-center space-x-1 mb-1">
                <Eye className="w-3 h-3 text-muted-foreground" />
              </div>
              <div className="text-sm font-medium text-foreground">{performance.views || 0}</div>
              <div className="text-xs text-muted-foreground">Views</div>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center space-x-1 mb-1">
                <MousePointer className="w-3 h-3 text-muted-foreground" />
              </div>
              <div className="text-sm font-medium text-foreground">{performance.clicks || 0}</div>
              <div className="text-xs text-muted-foreground">Clicks</div>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center space-x-1 mb-1">
                <Heart className="w-3 h-3 text-muted-foreground" />
              </div>
              <div className="text-sm font-medium text-foreground">{performance.engagement || 0}</div>
              <div className="text-xs text-muted-foreground">Likes</div>
            </div>
          </div>
        )}

        {/* Selection hint */}
        {!posted && (
          <div className="text-xs text-muted-foreground text-center pt-2">
            Click to select for posting
          </div>
        )}
      </div>
    </div>
  )
}

export default CreativeVariantCard