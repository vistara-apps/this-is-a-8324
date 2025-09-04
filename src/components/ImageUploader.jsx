import React, { useState, useCallback } from 'react'
import { Upload, X, Image as ImageIcon } from 'lucide-react'

const ImageUploader = ({ onImageUpload }) => {
  const [dragActive, setDragActive] = useState(false)
  const [uploadedImage, setUploadedImage] = useState(null)

  const handleDrag = useCallback((e) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }, [])

  const handleDrop = useCallback((e) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0])
    }
  }, [])

  const handleChange = useCallback((e) => {
    e.preventDefault()
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0])
    }
  }, [])

  const handleFile = (file) => {
    if (file.type.startsWith('image/')) {
      const imageUrl = URL.createObjectURL(file)
      setUploadedImage(imageUrl)
      onImageUpload(file)
    }
  }

  const removeImage = () => {
    setUploadedImage(null)
    onImageUpload(null)
  }

  if (uploadedImage) {
    return (
      <div className="relative">
        <div className="relative bg-muted rounded-lg overflow-hidden">
          <img 
            src={uploadedImage} 
            alt="Uploaded product" 
            className="w-full h-64 object-cover"
          />
          <button
            onClick={removeImage}
            className="absolute top-3 right-3 bg-destructive text-destructive-foreground p-2 rounded-full hover:bg-destructive/90 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        <p className="text-sm text-muted-foreground mt-2 text-center">
          Image uploaded successfully. You can now describe your product below.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div
        className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
          dragActive 
            ? 'border-accent bg-accent/5' 
            : 'border-border hover:border-accent/50'
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          type="file"
          accept="image/*"
          onChange={handleChange}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />
        
        <div className="space-y-4">
          <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto">
            <Upload className="w-8 h-8 text-muted-foreground" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-foreground mb-2">
              Upload Product Image
            </h3>
            <p className="text-muted-foreground">
              Drag and drop your product image here, or click to browse
            </p>
          </div>
          <button
            type="button"
            className="bg-accent text-accent-foreground px-6 py-2 rounded-lg font-medium hover:bg-accent/90 transition-colors"
          >
            Choose File
          </button>
        </div>
      </div>
      
      <div className="text-sm text-muted-foreground space-y-1">
        <p>• Supported formats: JPG, PNG, GIF, WebP</p>
        <p>• Maximum file size: 10MB</p>
        <p>• Recommended: High-quality product photos with good lighting</p>
      </div>
    </div>
  )
}

export default ImageUploader