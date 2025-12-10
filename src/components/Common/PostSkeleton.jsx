import React from 'react'

const PostSkeleton = () => {
  return (
    <div className="bg-white rounded-lg shadow-md mb-6 border border-gray-200 animate-pulse">
      {/* Header skeleton */}
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-full bg-gray-300"></div>
          <div>
            <div className="h-4 w-24 bg-gray-300 rounded mb-2"></div>
            <div className="h-3 w-16 bg-gray-200 rounded"></div>
          </div>
        </div>
        <div className="w-6 h-6 bg-gray-300 rounded"></div>
      </div>

      {/* Image skeleton */}
      <div className="w-full h-96 bg-gray-300"></div>

      {/* Actions skeleton */}
      <div className="p-4">
        <div className="flex justify-between items-center mb-4">
          <div className="flex space-x-4">
            <div className="w-6 h-6 bg-gray-300 rounded"></div>
            <div className="w-6 h-6 bg-gray-300 rounded"></div>
            <div className="w-6 h-6 bg-gray-300 rounded"></div>
          </div>
          <div className="w-6 h-6 bg-gray-300 rounded"></div>
        </div>

        {/* Caption skeleton */}
        <div className="space-y-2 mb-4">
          <div className="h-4 w-3/4 bg-gray-200 rounded"></div>
          <div className="h-4 w-1/2 bg-gray-200 rounded"></div>
        </div>

        {/* Comments skeleton */}
        <div className="space-y-2">
          <div className="h-3 w-32 bg-gray-200 rounded"></div>
          <div className="h-10 bg-gray-100 rounded"></div>
        </div>
      </div>
    </div>
  )
}

export default PostSkeleton