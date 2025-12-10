import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { fetchPosts, likePost, addComment, clearPosts } from '../redux/slices/postSlice'
import PostCard from '../components/Post1/PostCard'
import CreatePost from '../components/Post1/CreatePost'
import PostSkeleton from '../components/Common/PostSkeleton'
import { Plus, RefreshCw } from 'lucide-react'
import { useLocation } from 'react-router-dom'

const Feed = () => {
  const [showCreatePost, setShowCreatePost] = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  const [isInitialLoad, setIsInitialLoad] = useState(true)
  const dispatch = useDispatch()
  const location = useLocation()
  const hasFetchedRef = useRef(false)
  const timerRef = useRef(null)
  
  const { posts, loading, error } = useSelector((state) => state.posts)
  const { user } = useSelector((state) => state.auth)

  // Memoize posts to prevent unnecessary re-renders
  const memoizedPosts = useMemo(() => posts, [posts])

  // Reset posts when component mounts to force fresh load
  useEffect(() => {
    if (location.pathname === '/' && user) {
      // Clear posts to trigger fresh fetch
      dispatch(clearPosts())
      setIsInitialLoad(true)
      hasFetchedRef.current = false
    }
  }, [location.pathname, user, dispatch])

  // Load posts when component mounts or user changes
  useEffect(() => {
    if (user && !hasFetchedRef.current) {
      hasFetchedRef.current = true
      loadPosts().finally(() => {
        setIsInitialLoad(false)
      })
    }
    
    if (!user) {
      hasFetchedRef.current = false
      setIsInitialLoad(true)
    }
  }, [user])

  const loadPosts = useCallback(async () => {
    try {
      // Clear any existing timer
      if (timerRef.current) {
        console.timeEnd(timerRef.current)
      }
      
      // Create unique timer name
      timerRef.current = `loadPosts_${Date.now()}`
      console.time(timerRef.current)
      
      await dispatch(fetchPosts()).unwrap()
      console.timeEnd(timerRef.current)
    } catch (error) {
      console.error('Error loading posts:', error)
      // Ensure timer is ended even on error
      if (timerRef.current) {
        console.timeEnd(timerRef.current)
        timerRef.current = null
      }
    }
  }, [dispatch])

  const handleRefresh = useCallback(async () => {
    setRefreshing(true)
    await loadPosts()
    setRefreshing(false)
  }, [loadPosts])

  // Memoize event handlers to prevent unnecessary re-renders
  const handleLike = useCallback(async (postId) => {
    if (!user) return
    try {
      await dispatch(likePost(postId)).unwrap()
    } catch (error) {
      console.error('Error liking post:', error)
    }
  }, [dispatch, user])

  const handleAddComment = useCallback(async (postId, content) => {
    if (!user) return
    try {
      await dispatch(addComment({ postId, content })).unwrap()
    } catch (error) {
      console.error('Error adding comment:', error)
    }
  }, [dispatch, user])

  const handleShowCreatePost = useCallback(() => {
    setShowCreatePost(true)
  }, [])

  const handleCloseCreatePost = useCallback(() => {
    setShowCreatePost(false)
  }, [])

  const handleCreatePostSuccess = useCallback(() => {
    handleRefresh()
    handleCloseCreatePost()
  }, [handleRefresh, handleCloseCreatePost])

  // Clean up timers on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        console.timeEnd(timerRef.current)
        timerRef.current = null
      }
    }
  }, [])

  // Show skeleton loading on initial load
  if (isInitialLoad || (loading && !refreshing && posts.length === 0)) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="space-y-6">
          {[...Array(3)].map((_, i) => (
            <PostSkeleton key={i} />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Feed</h1>
          <div className="flex items-center space-x-2">
            <button
              onClick={handleRefresh}
              disabled={refreshing || loading}
              className="p-2 text-gray-600 hover:text-gray-900 disabled:opacity-50 transition-colors"
              title="Refresh"
              aria-label="Refresh posts"
            >
              <RefreshCw 
                size={20} 
                className={refreshing ? 'animate-spin' : ''} 
              />
            </button>
            {user && (
              <button
                onClick={handleShowCreatePost}
                className="flex items-center px-4 py-2 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors"
                disabled={loading}
                aria-label="Create new post"
              >
                <Plus size={20} className="mr-2" />
                Create Post
              </button>
            )}
          </div>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
            <p className="text-red-700">{error}</p>
            <button
              onClick={handleRefresh}
              className="mt-2 text-sm text-red-600 hover:text-red-800 transition-colors"
              disabled={loading}
            >
              Try again
            </button>
          </div>
        )}
      </div>

      {/* Posts Content */}
      {!user ? (
        <div className="text-center py-12">
          <div className="max-w-sm mx-auto">
            <div className="p-6 bg-gray-100 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-6">
              <Plus size={48} className="text-gray-400" />
            </div>
            <h3 className="text-2xl font-light mb-2">Welcome to InstaClone</h3>
            <p className="text-gray-600 mb-6">
              Please sign in to view and create posts
            </p>
          </div>
        </div>
      ) : memoizedPosts.length === 0 && !loading ? (
        <div className="text-center py-12">
          <div className="max-w-sm mx-auto">
            <div className="p-6 bg-gray-100 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-6">
              <Plus size={48} className="text-gray-400" />
            </div>
            <h3 className="text-2xl font-light mb-2">No posts yet</h3>
            <p className="text-gray-600 mb-6">
              Be the first to share something!
            </p>
            <button
              onClick={handleShowCreatePost}
              className="px-6 py-2 bg-blue-600 text-white font-medium rounded hover:bg-blue-700 transition-colors"
            >
              Create your first post
            </button>
          </div>
        </div>
      ) : (
        <>
          {/* Performance stats (only in development) */}
          {process.env.NODE_ENV === 'development' && (
            <div className="mb-4 p-3 bg-blue-50 rounded-md text-sm">
              <p className="font-semibold text-blue-700">Performance:</p>
              <p>Posts: {memoizedPosts.length}</p>
              <p>Images loaded: {memoizedPosts.filter(p => p.image_url).length}</p>
            </div>
          )}

          <div className="space-y-6">
            {memoizedPosts.map((post) => (
              <PostCard
                key={`${post.id}_${post.updated_at || Date.now()}`} // Add updated_at to force re-mount when data changes
                post={post}
                onLike={() => handleLike(post.id)}
                onAddComment={(content) => handleAddComment(post.id, content)}
              />
            ))}
          </div>

          {/* Load more button (if implementing pagination) */}
          {memoizedPosts.length >= 15 && (
            <div className="flex justify-center mt-8">
              <button
                onClick={handleRefresh}
                disabled={loading}
                className="px-6 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 disabled:opacity-50 transition-colors"
              >
                {loading ? 'Loading...' : 'Load More Posts'}
              </button>
            </div>
          )}
        </>
      )}

      {/* Create Post Modal */}
      {showCreatePost && (
        <CreatePost 
          onClose={handleCloseCreatePost} 
          onSuccess={handleCreatePostSuccess}
        />
      )}
    </div>
  )
}

export default Feed