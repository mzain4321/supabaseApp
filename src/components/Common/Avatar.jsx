import React, { useState, useEffect, useMemo } from 'react'

const Avatar = ({ 
  src, 
  alt, 
  size = 'md', 
  className = '',
  fallbackSrc = 'https://i.pravatar.cc/300'
}) => {
  const [imageUrl, setImageUrl] = useState(fallbackSrc)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-16 h-16',
    xl: 'w-32 h-32'
  }

  // Memoize the processed URL to prevent unnecessary recalculations
  const processedSrc = useMemo(() => {
    // Check if src is valid
    if (!src || src.trim() === '' || src === 'undefined' || src === 'null') {
      return fallbackSrc
    }
    
    try {
      // Check if it's already a valid URL
      if (src.startsWith('blob:') || src.startsWith('data:')) {
        return src
      }
      
      // Create URL object to safely manipulate
      const url = new URL(src, window.location.origin)
      // Add cache-busting timestamp only for external URLs
      if (!url.hostname.includes('pravatar.cc') && !url.hostname.includes('via.placeholder.com')) {
        url.searchParams.set('t', Date.now())
      }
      return url.toString()
    } catch (error) {
      console.warn('Invalid avatar URL:', src, error)
      return fallbackSrc
    }
  }, [src, fallbackSrc])

  useEffect(() => {
    // Only update if the processed src is different from current imageUrl
    if (processedSrc !== imageUrl) {
      setImageUrl(processedSrc)
      setLoading(true)
      setError(false)
    }
  }, [processedSrc, imageUrl])

  const handleLoad = () => {
    setLoading(false)
  }

  const handleError = () => {
    console.warn('Failed to load avatar:', imageUrl)
    setLoading(false)
    setError(true)
    setImageUrl(fallbackSrc)
  }

  return (
    <div className={`relative ${sizeClasses[size]} ${className} flex-shrink-0`}>
      {loading && !error && (
        <div className="absolute inset-0 flex items-center justify-center z-10">
          <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}
      <img
        src={imageUrl}
        alt={alt}
        className={`${sizeClasses[size]} rounded-full object-cover border-2 border-white shadow-sm ${
          loading && !error ? 'opacity-0' : 'opacity-100'
        } transition-opacity duration-300`}
        onLoad={handleLoad}
        onError={handleError}
      />
    </div>
  )
}

export default Avatar