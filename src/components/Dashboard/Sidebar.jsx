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
      

      {/* Who to Follow */}
     


      

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