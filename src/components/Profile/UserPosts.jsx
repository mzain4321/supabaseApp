import React, { useState, useEffect } from 'react'
import { supabase } from '../../services/supabase'
import { Grid, List, Image, Calendar, Heart, MessageCircle } from 'lucide-react'

const UserPosts = ({ userId }) => {
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState('grid') // 'grid' or 'list'
  const [activeTab, setActiveTab] = useState('posts') // 'posts', 'saved', 'tagged'

  useEffect(() => {
    fetchPosts()
  }, [userId, activeTab])
  const fetchPosts = async () => {
    try {
      setLoading(true)

      let query = supabase
        .from('posts')
        .select(`
          *,
          likes!left(count),
          profiles:user_id (
            username,
            avatar_url
          )
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

      const { data, error } = await query

      if (error) throw error
      setPosts(data || [])
    } catch (error) {
      console.error('Error fetching user posts:', error)
    } finally {
      setLoading(false)
    }
  }

  const getPostStats = (post) => {
    return {
      likes: post.likes?.[0]?.count || 0,
      comments: 0 // You can add comments functionality later
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-instagram-pink"></div>
      </div>
    )
  }

  return (
    <div>
      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <div className="flex space-x-8">
          <button
            onClick={() => setActiveTab('posts')}
            className={`py-4 px-2 font-medium border-b-2 transition-colors ${activeTab === 'posts' ? 'border-instagram-pink text-instagram-pink' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
          >
            <div className="flex items-center space-x-2">
              <Grid className="h-5 w-5" />
              <span>POSTS</span>
            </div>
          </button>
          
          <button
            onClick={() => setActiveTab('saved')}
            className={`py-4 px-2 font-medium border-b-2 transition-colors ${activeTab === 'saved' ? 'border-instagram-pink text-instagram-pink' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
          >
            <div className="flex items-center space-x-2">
              <Calendar className="h-5 w-5" />
              <span>SAVED</span>
            </div>
          </button>
          
          <button
            onClick={() => setActiveTab('tagged')}
            className={`py-4 px-2 font-medium border-b-2 transition-colors ${activeTab === 'tagged' ? 'border-instagram-pink text-instagram-pink' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
          >
            <div className="flex items-center space-x-2">
              <Image className="h-5 w-5" />
              <span>TAGGED</span>
            </div>
          </button>
        </div>
      </div>

      {/* View Mode Toggle */}
      <div className="flex justify-end mb-6">
        <div className="flex items-center space-x-2 bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => setViewMode('grid')}
            className={`p-2 rounded ${viewMode === 'grid' ? 'bg-white shadow' : 'hover:bg-gray-200'}`}
          >
            <Grid className="h-5 w-5" />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`p-2 rounded ${viewMode === 'list' ? 'bg-white shadow' : 'hover:bg-gray-200'}`}
          >
            <List className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Posts Display */}
      {posts.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">
            {activeTab === 'posts' ? '📷' : activeTab === 'saved' ? '📁' : '🏷️'}
          </div>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">
            {activeTab === 'posts' ? 'No Posts Yet' : 
             activeTab === 'saved' ? 'No Saved Posts' : 'No Tagged Posts'}
          </h3>
          <p className="text-gray-600">
            {activeTab === 'posts' ? 'When you share posts, they will appear here.' :
             activeTab === 'saved' ? 'Save posts to see them here.' :
             'Photos and videos you\'re tagged in will appear here.'}
          </p>
        </div>
      ) : viewMode === 'grid' ? (
        // Grid View
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {posts.map((post) => {
            const stats = getPostStats(post)
            return (
              <div key={post.id} className="relative group cursor-pointer">
                <div className="aspect-square rounded-lg overflow-hidden bg-gray-200">
                  <img
                    src={post.image_url}
                    alt={post.caption}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
                  <div className="flex items-center space-x-6 text-white">
                    <div className="flex items-center space-x-1">
                      <Heart className="h-6 w-6" />
                      <span className="font-semibold">{stats.likes}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <MessageCircle className="h-6 w-6" />
                      <span className="font-semibold">{stats.comments}</span>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        // List View
        <div className="space-y-4">
          {posts.map((post) => {
            const stats = getPostStats(post)
            return (
              <div key={post.id} className="card hover:shadow-lg transition-shadow">
                <div className="flex items-start space-x-4">
                  <div className="w-24 h-24 rounded-lg overflow-hidden flex-shrink-0">
                    <img
                      src={post.image_url}
                      alt={post.caption}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  
                  <div className="flex-1">
                    <p className="text-gray-700 mb-2 line-clamp-2">{post.caption}</p>
                    
                    <div className="flex items-center space-x-6 text-gray-500 text-sm">
                      <div className="flex items-center space-x-1">
                        <Calendar className="h-4 w-4" />
                        <span>{new Date(post.created_at).toLocaleDateString()}</span>
                      </div>
                      
                      <div className="flex items-center space-x-1">
                        <Heart className="h-4 w-4" />
                        <span>{stats.likes} likes</span>
                      </div>
                      
                      <div className="flex items-center space-x-1">
                        <MessageCircle className="h-4 w-4" />
                        <span>{stats.comments} comments</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default UserPosts