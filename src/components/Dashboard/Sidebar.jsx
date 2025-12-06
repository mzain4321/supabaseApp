import React, { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import { supabase } from '../../services/supabase'
import { 
  Home, 
  Search, 
  Compass, 
  Video, 
  MessageCircle, 
  Heart, 
  PlusSquare, 
  User, 
  Settings,
  LogOut,
  Users,
  TrendingUp,
  Camera
} from 'lucide-react'
import { Link } from 'react-router-dom'

const Sidebar = () => {
  const { user, profile, signOut } = useAuth()
  const [suggestions, setSuggestions] = useState([])
  const [following, setFollowing] = useState([])

  useEffect(() => {
    fetchSuggestions()
    fetchFollowing()
  }, [user])

  const fetchSuggestions = async () => {
    if (!user) return

    try {
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .neq('id', user.id)
        .limit(5)

      setSuggestions(data || [])
    } catch (error) {
      console.error('Error fetching suggestions:', error)
    }
  }

  const fetchFollowing = async () => {
    if (!user) return

    try {
      const { data } = await supabase
        .from('follows')
        .select(`
          following:following_id (
            id,
            username,
            full_name,
            avatar_url
          )
        `)
        .eq('follower_id', user.id)
        .limit(5)

      setFollowing(data?.map(item => item.following) || [])
    } catch (error) {
      console.error('Error fetching following:', error)
    }
  }

  const handleFollow = async (userId) => {
    try {
      await supabase
        .from('follows')
        .insert([{ follower_id: user.id, following_id: userId }])
      
      fetchSuggestions()
      fetchFollowing()
    } catch (error) {
      console.error('Error following user:', error)
    }
  }

  const menuItems = [
    { icon: Home, label: 'Home', path: '/' },
    { icon: Search, label: 'Search', path: '/explore' },
    { icon: Compass, label: 'Explore', path: '/explore' },
    { icon: Video, label: 'Reels', path: '/reels' },
    { icon: MessageCircle, label: 'Messages', path: '/messages' },
    { icon: Heart, label: 'Notifications', path: '/notifications' },
    { icon: PlusSquare, label: 'Create', path: '/create' },
  ]

  return (
    <div className="sticky top-24 space-y-8">
      {/* Main Navigation */}
      <div className="card">
        <div className="space-y-2">
          {menuItems.map((item) => (
            <Link
              key={item.label}
              to={item.path}
              className="flex items-center space-x-4 p-3 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <item.icon className="h-6 w-6 text-gray-700" />
              <span className="font-medium">{item.label}</span>
            </Link>
          ))}
          
          <Link
            to={`/profile`}
            className="flex items-center space-x-4 p-3 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <User className="h-6 w-6 text-gray-700" />
            <span className="font-medium">Profile</span>
          </Link>
        </div>

        <div className="border-t mt-4 pt-4">
          <button
            onClick={signOut}
            className="flex items-center space-x-4 p-3 rounded-lg hover:bg-gray-50 transition-colors w-full text-left"
          >
            <LogOut className="h-6 w-6 text-gray-700" />
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </div>

      {/* User Profile Summary */}
      {profile && (
        <div className="card">
          <div className="flex items-center space-x-3 mb-4">
            <img
              src={profile.avatar_url || `https://ui-avatars.com/api/?name=${profile.full_name}&background=random`}
              alt={profile.username}
              className="h-12 w-12 rounded-full object-cover"
            />
            <div className="flex-1">
              <div className="font-semibold">{profile.username}</div>
              <div className="text-sm text-gray-500">{profile.full_name}</div>
            </div>
          </div>
          
          <div className="grid grid-cols-3 gap-2 text-center border-t pt-4">
            <div>
              <div className="font-bold text-lg">0</div>
              <div className="text-xs text-gray-500">Posts</div>
            </div>
            <div>
              <div className="font-bold text-lg">0</div>
              <div className="text-xs text-gray-500">Followers</div>
            </div>
            <div>
              <div className="font-bold text-lg">0</div>
              <div className="text-xs text-gray-500">Following</div>
            </div>
          </div>
        </div>
      )}

      {/* Who to Follow */}
      {suggestions.length > 0 && (
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">Suggestions For You</h3>
            <Users className="h-5 w-5 text-gray-400" />
          </div>
          
          <div className="space-y-4">
            {suggestions.map((user) => (
              <div key={user.id} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="h-8 w-8 rounded-full bg-gradient-to-r from-instagram-purple to-instagram-pink flex items-center justify-center text-white text-sm font-semibold">
                    {user.username?.charAt(0).toUpperCase() || 'U'}
                  </div>
                  <div className="max-w-[120px]">
                    <div className="font-medium text-sm truncate">{user.username}</div>
                    <div className="text-xs text-gray-500 truncate">Suggested for you</div>
                  </div>
                </div>
                <button
                  onClick={() => handleFollow(user.id)}
                  className="text-xs btn-primary px-2 py-1"
                >
                  Follow
                </button>
              </div>
            ))}
          </div>
          
          <button className="w-full mt-4 text-instagram-blue hover:underline text-sm font-medium">
            See All
          </button>
        </div>
      )}


      

      {/* Footer Links */}
      <div className="px-4">
        <div className="text-xs text-gray-500 space-y-1">
          <div className="flex flex-wrap gap-2">
            <a href="#" className="hover:underline">About</a> •
            <a href="#" className="hover:underline">Help</a> •
            <a href="#" className="hover:underline">Press</a> •
            <a href="#" className="hover:underline">API</a> •
            <a href="#" className="hover:underline">Jobs</a> •
            <a href="#" className="hover:underline">Privacy</a> •
            <a href="#" className="hover:underline">Terms</a>
          </div>
          <div>© {new Date().getFullYear()} SocialApp</div>
        </div>
      </div>
    </div>
  )
}

export default Sidebar