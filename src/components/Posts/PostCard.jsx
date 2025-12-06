import React, { useState, useEffect } from 'react'
import { Heart, MessageCircle, Share2, Bookmark, MoreVertical } from 'lucide-react'
import { supabase } from '../../services/supabase'
import { useAuth } from '../../context/AuthContext'
import toast from 'react-hot-toast'
import moment from 'moment'

const PostCard = ({ post }) => {
  const [userProfile, setUserProfile] = useState(null)
  const [likes, setLikes] = useState([])
  const [liked, setLiked] = useState(false)
  const [likeCount, setLikeCount] = useState(0)
  const { user } = useAuth()

  useEffect(() => {
    fetchUserProfile()
    fetchLikes()
  }, [post])

  const fetchUserProfile = async () => {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', post.user_id)
      .single()
    setUserProfile(data)
  }

  const fetchLikes = async () => {
    const { data: likesData } = await supabase
      .from('likes')
      .select('*')
      .eq('post_id', post.id)
    
    setLikes(likesData || [])
    setLikeCount(likesData?.length || 0)
    setLiked(likesData?.some(like => like.user_id === user?.id) || false)
  }

  const handleLike = async () => {
    if (!user) {
      toast.error('Please login to like posts')
      return
    }

    if (liked) {
      // Unlike
      const { error } = await supabase
        .from('likes')
        .delete()
        .eq('post_id', post.id)
        .eq('user_id', user.id)

      if (!error) {
        setLiked(false)
        setLikeCount(prev => prev - 1)
      }
    } else {
      // Like
      const { error } = await supabase
        .from('likes')
        .insert([
          {
            post_id: post.id,
            user_id: user.id,
          }
        ])

      if (!error) {
        setLiked(true)
        setLikeCount(prev => prev + 1)
      }
    }
  }

  if (!userProfile) return null

  return (
    <div className="card mb-6">
      {/* Post Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <img
            src={userProfile.avatar_url || `https://ui-avatars.com/api/?name=${userProfile.full_name}&background=random`}
            alt={userProfile.username}
            className="h-10 w-10 rounded-full object-cover"
          />
          <div>
            <div className="font-semibold">{userProfile.username}</div>
            <div className="text-sm text-gray-500">
              {moment(post.created_at).fromNow()}
            </div>
          </div>
        </div>
        <button className="text-gray-500 hover:text-gray-700">
          <MoreVertical className="h-5 w-5" />
        </button>
      </div>

      {/* Post Image */}
      <img
        src={post.image_url}
        alt={post.caption}
        className="w-full h-96 object-cover rounded-lg mb-4"
      />

      {/* Post Actions */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-4">
          <button
            onClick={handleLike}
            className={`${liked ? 'text-instagram-pink' : 'text-gray-700'} hover:opacity-80`}
          >
            <Heart className={`h-6 w-6 ${liked ? 'fill-current' : ''}`} />
          </button>
          <button className="text-gray-700 hover:text-gray-900">
            <MessageCircle className="h-6 w-6" />
          </button>
          <button className="text-gray-700 hover:text-gray-900">
            <Share2 className="h-6 w-6" />
          </button>
        </div>
        <button className="text-gray-700 hover:text-gray-900">
          <Bookmark className="h-6 w-6" />
        </button>
      </div>

      {/* Likes Count */}
      <div className="mb-2">
        <span className="font-semibold">{likeCount} likes</span>
      </div>

      {/* Caption */}
      <div className="mb-4">
        <span className="font-semibold mr-2">{userProfile.username}</span>
        <span>{post.caption}</span>
      </div>

      {/* Location */}
      {post.location && (
        <div className="text-sm text-gray-500 mb-4">
          📍 {post.location}
        </div>
      )}
    </div>
  )
}

export default PostCard