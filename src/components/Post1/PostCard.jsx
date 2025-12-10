import React, { useState, memo, useCallback, useEffect } from 'react'
import { Heart, MessageCircle, Share2, Bookmark, MoreHorizontal } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { useSelector } from 'react-redux'
import Comments from './Comments'
import Avatar from '../Common/Avatar'

const PostCard = ({ post, onLike, onAddComment }) => {
  const [showComments, setShowComments] = useState(false)
  const [commentInput, setCommentInput] = useState('')
  const [isLiked, setIsLiked] = useState(post.is_liked || false)
  const [likeCount, setLikeCount] = useState(post.likes_count || 0)

  // FIX: Start with null instead of empty string
  const [imageUrl, setImageUrl] = useState(null)
  const [imageError, setImageError] = useState(false)

  const { user } = useSelector((state) => state.auth)

  // Prepare image URL with cache-busting
  useEffect(() => {
    if (post.image_url) {
      try {
        const url = new URL(post.image_url, window.location.origin)
        url.searchParams.set('t', Date.now())
        setImageUrl(url.toString())
      } catch (error) {
        console.warn('Invalid image URL:', post.image_url, error)
        setImageUrl('https://via.placeholder.com/600x400/cccccc/666666?text=Image+Not+Found')
      }
    } else {
      setImageUrl('https://via.placeholder.com/600x400/cccccc/666666?text=No+Image')
    }
  }, [post.image_url, post.id])

  // Safe post fallbacks
  const safePost = {
    ...post,
    profiles1: post.profiles1 || {
      id: post.user_id,
      username: 'user_' + (post.user_id || '').substring(0, 8),
      full_name: 'User',
      avatar_url: 'https://i.pravatar.cc/300'
    },
    likes_count: post.likes_count || 0,
    comments_count: post.comments_count || 0,
    is_liked: post.is_liked || false,
    caption: post.caption || '',
    created_at: post.created_at || new Date().toISOString()
  }

  const handleLike = useCallback(() => {
    if (!user) return
    setIsLiked(prev => !prev)
    setLikeCount(prev => isLiked ? Math.max(0, prev - 1) : prev + 1)
    onLike()
  }, [user, isLiked, onLike])

  const handleCommentSubmit = useCallback(async (e) => {
    e.preventDefault()
    if (!commentInput.trim() || !user) return

    try {
      await onAddComment(commentInput)
      setCommentInput('')
    } catch (error) {
      console.error('Error submitting comment:', error)
    }
  }, [commentInput, user, onAddComment])

  const handleShare = useCallback(async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: 'Check out this post!',
          text: safePost.caption || 'Instagram post',
          url: window.location.href
        })
      } else {
        await navigator.clipboard.writeText(window.location.href)
        alert('Link copied to clipboard!')
      }
    } catch (error) {
      console.error('Error sharing:', error)
    }
  }, [safePost.caption])

  const toggleComments = useCallback(() => {
    setShowComments(prev => !prev)
  }, [])

  const handleCommentInputChange = useCallback((e) => {
    setCommentInput(e.target.value)
  }, [])

  const getFormattedTime = useCallback(() => {
    try {
      return formatDistanceToNow(new Date(safePost.created_at), { addSuffix: true })
    } catch (error) {
      return 'Recently'
    }
  }, [safePost.created_at])

  const handleImageError = () => {
    setImageError(true)
    setImageUrl('https://via.placeholder.com/600x400/cccccc/666666?text=Image+Not+Found')
  }

  return (
    <div className="bg-white rounded-lg shadow-md mb-6 border border-gray-200 overflow-hidden">
      
      {/* Header */}
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center space-x-3">
          <Avatar
            src={safePost.profiles1.avatar_url}
            alt={`${safePost.profiles1.username}'s profile picture`}
            size="md"
            fallbackSrc="https://i.pravatar.cc/300"
          />
          <div>
            <p className="font-semibold text-gray-900 cursor-pointer">
              {safePost.profiles1.username}
            </p>
            <p className="text-xs text-gray-500">{getFormattedTime()}</p>
          </div>
        </div>
        <button className="text-gray-500 hover:text-gray-700">
          <MoreHorizontal size={24} />
        </button>
      </div>

      {/* Post Image */}
      <div className="relative bg-gray-100 min-h-[400px] max-h-[600px] flex items-center justify-center">
        
        {/* Loader */}
        {!imageUrl && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}

        {/* Image (fixed: only render if imageUrl exists!) */}
        {imageUrl && (
          <img
            src={imageUrl}
            alt={safePost.caption || 'Post image'}
            className="w-full h-auto object-contain max-h-[600px] bg-white relative z-10"
            loading="lazy"
            onLoad={(e) => (e.target.style.opacity = '1')}
            onError={handleImageError}
            style={{ opacity: 0, transition: 'opacity 0.3s' }}
          />
        )}
      </div>

      {/* Actions */}
      <div className="p-4">
        <div className="flex justify-between items-center mb-3">
          <div className="flex space-x-4">
            <button
              onClick={handleLike}
              className={`${isLiked ? 'text-red-500' : 'text-gray-700'} hover:text-red-500`}
              disabled={!user}
            >
              <Heart size={24} fill={isLiked ? 'currentColor' : 'none'} />
            </button>

            <button
              onClick={toggleComments}
              className="text-gray-700 hover:text-blue-500"
              disabled={!user}
            >
              <MessageCircle size={24} />
            </button>

            <button
              onClick={handleShare}
              className="text-gray-700 hover:text-green-500"
            >
              <Share2 size={24} />
            </button>
          </div>

          <button className="text-gray-700 hover:text-yellow-500" disabled={!user}>
            <Bookmark size={24} />
          </button>
        </div>

        {/* Likes */}
        {likeCount > 0 && (
          <p className="font-semibold mb-2 text-sm text-gray-900">
            {likeCount.toLocaleString()} {likeCount === 1 ? 'like' : 'likes'}
          </p>
        )}

        {/* Caption */}
        <div className="mb-3">
          <span className="font-semibold mr-2 text-sm text-gray-900">
            {safePost.profiles1.username}
          </span>
          <span className="text-sm text-gray-800">{safePost.caption}</span>
        </div>

        {/* Recent Comments */}
        {safePost.recent_comments?.length > 0 && (
          <div className="mb-3 space-y-2">
            {safePost.recent_comments.map((comment) => (
              <div key={comment.id} className="flex items-start">
                <span className="font-semibold mr-2 text-sm text-gray-900">
                  {comment.profiles1?.username || 'User'}
                </span>
                <span className="text-sm text-gray-800 flex-1">
                  {comment.content}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* View all comments */}
        {safePost.comments_count > 0 && !showComments && (
          <button
            onClick={toggleComments}
            className="text-gray-500 text-sm mb-3 hover:text-gray-700"
          >
            View all {safePost.comments_count}{' '}
            {safePost.comments_count === 1 ? 'comment' : 'comments'}
          </button>
        )}

        {/* Add comment */}
        {user && (
          <form onSubmit={handleCommentSubmit} className="mt-2 border-t pt-3">
            <div className="flex items-center">
              <input
                type="text"
                placeholder="Add a comment..."
                value={commentInput}
                onChange={handleCommentInputChange}
                className="flex-1 border-0 focus:outline-none text-sm py-2"
              />
              {commentInput.trim() && (
                <button
                  type="submit"
                  className="text-blue-600 font-medium text-sm px-2 py-1 hover:text-blue-800"
                >
                  Post
                </button>
              )}
            </div>
          </form>
        )}

        {/* Full comments */}
        {showComments && (
          <div className="mt-4 border-t pt-4">
            <Comments postId={safePost.id} />
          </div>
        )}
      </div>
    </div>
  )
}

// Optimization
const areEqual = (prevProps, nextProps) => {
  return (
    prevProps.post.id === nextProps.post.id &&
    prevProps.post.likes_count === nextProps.post.likes_count &&
    prevProps.post.is_liked === nextProps.post.is_liked &&
    prevProps.post.comments_count === nextProps.post.comments_count &&
    prevProps.post.image_url === nextProps.post.image_url &&
    prevProps.onLike === nextProps.onLike &&
    prevProps.onAddComment === nextProps.onAddComment
  )
}

export default memo(PostCard, areEqual)
