import React, { useState, useEffect, useCallback, memo } from 'react'
import { useSelector } from 'react-redux'
import { supabase } from '../../services/supabase'
import { format } from 'date-fns'
import { Heart, MessageCircle } from 'lucide-react'
import ImageWithLoader from '../Common/ImageWithLoader'

const Comments = ({ postId }) => {
  const [comments, setComments] = useState([])
  const [loading, setLoading] = useState(false)
  const [newComment, setNewComment] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const { user } = useSelector((state) => state.auth)

  const fetchComments = useCallback(async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('comments1')
        .select(`
          *,
          profiles1:user_id (
            username,
            avatar_url,
            full_name
          )
        `)
        .eq('post_id', postId)
        .order('created_at', { ascending: false })

      if (error) throw error
      setComments(data || [])
    } catch (error) {
      console.error('Error fetching comments:', error)
    } finally {
      setLoading(false)
    }
  }, [postId])

  useEffect(() => {
    fetchComments()
  }, [fetchComments])

  const addComment = useCallback(async (content) => {
    if (!content.trim() || !user) return

    try {
      setSubmitting(true)
      const { data, error } = await supabase
        .from('comments1')
        .insert({
          post_id: postId,
          user_id: user.id,
          content
        })
        .select(`
          *,
          profiles1:user_id (
            username,
            avatar_url,
            full_name
          )
        `)
        .single()

      if (error) throw error
      
      // Add new comment to the top
      setComments(prev => [data, ...prev])
      setNewComment('')
    } catch (error) {
      console.error('Error adding comment:', error)
    } finally {
      setSubmitting(false)
    }
  }, [postId, user])

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault()
    await addComment(newComment)
  }, [newComment, addComment])

  const handleKeyPress = useCallback((e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e)
    }
  }, [handleSubmit])

  if (loading) {
    return (
      <div className="flex justify-center py-4">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {/* Comments List */}
      <div className="space-y-3 max-h-64 overflow-y-auto pr-2 scrollbar-thin">
        {comments.length === 0 ? (
          <div className="text-center py-4 text-gray-500">
            <MessageCircle className="mx-auto h-8 w-8 mb-2" />
            <p>No comments yet. Be the first to comment!</p>
          </div>
        ) : (
          comments.map((comment) => (
            <div key={comment.id} className="flex items-start space-x-3">
              <ImageWithLoader
                src={comment.profiles1?.avatar_url || 'https://i.pravatar.cc/300'}
                alt={comment.profiles1?.username}
                className="w-8 h-8 rounded-full flex-shrink-0"
                containerClassName="w-8 h-8 rounded-full flex-shrink-0"
              />
              <div className="flex-1 min-w-0">
                <div className="bg-gray-50 rounded-lg p-3">
                  <div className="flex items-baseline">
                    <span className="font-semibold text-sm text-gray-900">
                      {comment.profiles1?.username}
                    </span>
                    <span className="text-xs text-gray-500 ml-2">
                      {format(new Date(comment.created_at), 'MMM d, h:mm a')}
                    </span>
                  </div>
                  <p className="text-sm text-gray-800 mt-1 break-words">{comment.content}</p>
                </div>
                <div className="flex items-center mt-1 space-x-4">
                  <button className="text-xs text-gray-500 hover:text-gray-700 flex items-center">
                    <Heart size={12} className="mr-1" />
                    Like
                  </button>
                  <button className="text-xs text-gray-500 hover:text-gray-700">
                    Reply
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add Comment Form */}
      {user && (
        <div className="mt-4 flex items-center space-x-2">
          <ImageWithLoader
            src={user.user_metadata?.avatar_url || 'https://i.pravatar.cc/300'}
            alt="Your avatar"
            className="w-8 h-8 rounded-full"
            containerClassName="w-8 h-8 rounded-full flex-shrink-0"
          />
          <div className="flex-1 relative">
            <input
              type="text"
              placeholder="Add a comment..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              onKeyPress={handleKeyPress}
              className="w-full px-3 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              disabled={submitting}
            />
            {submitting && (
              <div className="absolute right-3 top-2.5">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default memo(Comments)