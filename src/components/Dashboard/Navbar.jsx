import React from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { Home, Search, Compass, Heart, User, PlusSquare, LogOut } from 'lucide-react'

const Navbar = () => {
  const { user, profile, signOut } = useAuth()

  return (
    <nav className="bg-white shadow-md border-b">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="text-2xl font-bold bg-gradient-to-r from-instagram-purple to-instagram-pink bg-clip-text text-blue-600">
              SociaApp
            </div>
          </Link>

          {/* Search Bar */}
          <div className="flex-1 max-w-xl mx-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="search"
                placeholder="Search"
                className="w-full pl-10 pr-4 py-2 bg-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-instagram-blue"
              />
            </div>
          </div>

          {/* Icons */}
          <div className="flex items-center space-x-6">
            <Link to="/" className="text-gray-700 hover:text-gray-900">
              <Home className="h-6 w-6" />
            </Link>
            
            <button className="text-gray-700 hover:text-gray-900">
              <Compass className="h-6 w-6" />
            </button>
            
            <button className="text-gray-700 hover:text-gray-900 relative">
              <Heart className="h-6 w-6" />
              <span className="absolute -top-1 -right-1 bg-instagram-pink text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                3
              </span>
            </button>
            
            <Link to="/profile" className="text-gray-700 hover:text-gray-900">
              <User className="h-6 w-6" />
            </Link>
            
            <button
              onClick={signOut}
              className="text-gray-700 hover:text-gray-900"
              title="Sign Out"
            >
              <LogOut className="h-6 w-6" />
            </button>

            {/* Profile Picture */}
            {profile && (
              <Link to="/profile" className="flex items-center space-x-2">
                <img
                  src={profile.avatar_url || `https://ui-avatars.com/api/?name=${profile.full_name}&background=random`}
                  alt={profile.username}
                  className="h-8 w-8 rounded-full object-cover border"
                />
                <span className="hidden md:inline font-medium">{profile.username}</span>
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}

export default Navbar