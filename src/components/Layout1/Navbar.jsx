import React, { useState, useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { signOut } from '../../redux/slices/authSlice'
import { supabase } from '../../services/supabase'
import { 
  Home, 
  Search, 
  PlusSquare, 
  Heart, 
  User, 
  LogOut,
  Instagram 
} from 'lucide-react'
import Avatar from '../Common/Avatar'

const Navbar = () => {
  const [showMenu, setShowMenu] = useState(false)
  const [userProfile, setUserProfile] = useState(null)
  const dispatch = useDispatch()
  const navigate = useNavigate()
  
  const { user } = useSelector((state) => state.auth)
  const cachedProfileRef = useRef(null)

  // Fetch user profile only when user changes, not on location change
  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!user) {
        setUserProfile(null)
        cachedProfileRef.current = null
        return
      }
      
      // Check cache first
      if (cachedProfileRef.current?.id === user.id) {
        setUserProfile(cachedProfileRef.current.data)
        return
      }
      
      try {
        // Always fetch fresh profile data from Supabase
        const { data, error } = await supabase
          .from('profiles1')
          .select('username, avatar_url')
          .eq('id', user.id)
          .single()
        
        if (error) {
          console.error('Error fetching user profile in navbar:', error)
          // Use fallback if profile doesn't exist
          const fallbackProfile = {
            username: user.user_metadata?.username || user.email?.split('@')[0] || 'user',
            avatar_url: user.user_metadata?.avatar_url || 'https://i.pravatar.cc/300'
          }
          setUserProfile(fallbackProfile)
          cachedProfileRef.current = { id: user.id, data: fallbackProfile }
        } else {
          setUserProfile(data)
          cachedProfileRef.current = { id: user.id, data }
        }
      } catch (error) {
        console.error('Error in fetchUserProfile:', error)
        // Fallback to basic user info
        const fallbackProfile = {
          username: user.user_metadata?.username || user.email?.split('@')[0] || 'user',
          avatar_url: user.user_metadata?.avatar_url || 'https://i.pravatar.cc/300'
        }
        setUserProfile(fallbackProfile)
        cachedProfileRef.current = { id: user.id, data: fallbackProfile }
      }
    }
    
    fetchUserProfile()
  }, [user]) // Only fetch when user changes

  const handleLogout = async () => {
    // Clear cache on logout
    cachedProfileRef.current = null
    await dispatch(signOut())
    navigate('/login')
  }

  const getProfileImage = () => {
    if (userProfile?.avatar_url && userProfile.avatar_url.trim() !== '') {
      return userProfile.avatar_url
    }
    if (user?.user_metadata?.avatar_url && user.user_metadata.avatar_url.trim() !== '') {
      return user.user_metadata.avatar_url
    }
    return 'https://i.pravatar.cc/300'
  }

  const getUsername = () => {
    if (userProfile?.username) {
      return userProfile.username
    }
    if (user?.user_metadata?.username) {
      return user.user_metadata.username
    }
    return user?.email?.split('@')[0] || 'profile'
  }

  // Don't show profile link if we're still loading and don't have username
  const showProfileLink = userProfile?.username || user?.email

  return (
    <nav className="bg-white shadow-sm border-b sticky top-0 z-40">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center">
            <Instagram className="h-8 w-8 text-pink-600" />
            <span className="ml-2 text-xl font-logo font-bold hidden md:inline">
              InstaClone
            </span>
          </Link>

          {/* Search Bar - Hidden on mobile */}
          <div className="hidden md:block flex-1 max-w-md mx-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Search"
                className="w-full px-4 py-2 bg-gray-100 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
                onClick={() => navigate('/explore')}
              />
              <Search className="absolute right-3 top-2.5 h-4 w-4 text-gray-400" />
            </div>
          </div>

          {/* Navigation Icons */}
          <div className="flex items-center space-x-4">
            <Link 
              to="/" 
              className="text-gray-700 hover:text-black transition-colors"
              title="Home"
            >
              <Home size={24} />
            </Link>
            
            {/* Mobile Search Icon */}
            <Link 
              to="/explore" 
              className="text-gray-700 hover:text-black transition-colors md:hidden"
              title="Search"
            >
              <Search size={24} />
            </Link>
            
            <button 
              className="text-gray-700 hover:text-black transition-colors"
              title="Create"
              onClick={() => navigate('/create')}
            >
              <PlusSquare size={24} />
            </button>
            
            <button 
              className="text-gray-700 hover:text-black transition-colors"
              title="Notifications"
            >
              <Heart size={24} />
            </button>
            
            {/* Profile Dropdown */}
            {user && (
              <div className="relative">
                <button
                  onClick={() => setShowMenu(!showMenu)}
                  className="flex items-center focus:outline-none transition-transform hover:scale-105"
                  title="Profile Menu"
                >
                  <Avatar
                    src={getProfileImage()}
                    alt="Profile"
                    size="sm"
                    className="border-2 border-transparent hover:border-blue-500"
                    fallbackSrc="https://i.pravatar.cc/300"
                  />
                </button>

                {showMenu && (
                  <>
                    <div
                      className="fixed inset-0 z-10"
                      onClick={() => setShowMenu(false)}
                    />
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-20 border">
                      {showProfileLink && (
                        <Link
                          to={`/profile/${getUsername()}`}
                          className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                          onClick={() => setShowMenu(false)}
                        >
                          <User size={16} className="mr-2" />
                          Profile
                        </Link>
                      )}
                      <button
                        onClick={handleLogout}
                        className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                      >
                        <LogOut size={16} className="mr-2" />
                        Logout
                      </button>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}

export default Navbar