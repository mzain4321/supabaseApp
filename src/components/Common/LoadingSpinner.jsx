import React from 'react'

const LoadingSpinner = ({ size = 'md', color = 'instagram-pink', fullScreen = false }) => {
  const sizeClasses = {
    sm: 'h-4 w-4 border-2',
    md: 'h-8 w-8 border-2',
    lg: 'h-12 w-12 border-3',
    xl: 'h-16 w-16 border-4'
  }

  const colorClasses = {
    'instagram-pink': 'border-instagram-pink',
    'instagram-purple': 'border-instagram-purple',
    'instagram-blue': 'border-instagram-blue',
    'gray': 'border-gray-400',
    'white': 'border-white'
  }

  const spinner = (
    <div className={`animate-spin rounded-full ${sizeClasses[size]} ${colorClasses[color]} border-t-transparent`} />
  )

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-white bg-opacity-80 flex items-center justify-center z-50">
        <div className="text-center">
          {spinner}
          <p className="mt-4 text-gray-600 font-medium">Loading...</p>
        </div>
      </div>
    )
  }

  return spinner
}

// Variants for different use cases
export const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="text-center">
      <LoadingSpinner size="xl" />
      <p className="mt-4 text-gray-600 font-medium">Loading your feed...</p>
    </div>
  </div>
)

export const ButtonLoader = () => (
  <div className="flex items-center justify-center space-x-2">
    <LoadingSpinner size="sm" color="white" />
    <span>Processing...</span>
  </div>
)

export const CardLoader = () => (
  <div className="card animate-pulse">
    <div className="flex items-center space-x-4">
      <div className="h-12 w-12 rounded-full bg-gray-300"></div>
      <div className="space-y-2 flex-1">
        <div className="h-4 bg-gray-300 rounded w-1/4"></div>
        <div className="h-3 bg-gray-200 rounded w-1/3"></div>
      </div>
    </div>
    <div className="mt-4 space-y-2">
      <div className="h-48 bg-gray-300 rounded-lg"></div>
      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
      <div className="h-3 bg-gray-200 rounded w-1/2"></div>
    </div>
  </div>
)

export const FeedLoader = ({ count = 3 }) => (
  <div className="space-y-6">
    {Array.from({ length: count }).map((_, i) => (
      <CardLoader key={i} />
    ))}
  </div>
)

export default LoadingSpinner