import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import {
  Home,
  Search,
  Compass,
  Heart,
  User,
  PlusSquare,
  LogOut,
  Menu,
  X,
} from "lucide-react";

const Navbar = () => {
  const { user, profile, signOut } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      {/* Top Navbar */}
      <nav className="bg-white shadow-md border-b fixed top-0 left-0 w-full z-50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">

            {/* Logo */}
            <Link to="/" className="flex items-center space-x-2">
              <div className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-pink-500">
                SocialApp
              </div>
            </Link>

            {/* Desktop Search */}
            <div className="hidden md:flex flex-1 max-w-xl mx-4">
              <div className="relative w-full">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="search"
                  placeholder="Search"
                  className="w-full pl-10 pr-4 py-2 bg-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
              </div>
            </div>

            {/* Desktop Icons */}
            <div className="hidden md:flex items-center space-x-6">
              <Link to="/" className="text-gray-700 hover:text-gray-900">
                <Home className="h-6 w-6" />
              </Link>

              <button className="text-gray-700 hover:text-gray-900">
                <Compass className="h-6 w-6" />
              </button>

              <button className="text-gray-700 hover:text-gray-900 relative">
                <Heart className="h-6 w-6" />
                <span className="absolute -top-1 -right-1 bg-pink-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                  3
                </span>
              </button>

              <Link to="/profile" className="text-gray-700 hover:text-gray-900">
                <User className="h-6 w-6" />
              </Link>

              {/* Profile */}
              {profile && (
                <Link to="/profile" className="flex items-center space-x-2">
                  <img
                    src={
                      profile.avatar_url ||
                      `https://ui-avatars.com/api/?name=${profile.full_name}&background=random`
                    }
                    alt={profile.username}
                    className="h-8 w-8 rounded-full object-cover border"
                  />
                  <span className="font-medium">{profile.username}</span>
                </Link>
              )}

              {/* Logout */}
              <button
                onClick={signOut}
                className="text-gray-700 hover:text-gray-900"
              >
                <LogOut className="h-6 w-6" />
              </button>
            </div>

            {/* Mobile Menu Button */}
            <button
              className="md:hidden text-gray-700"
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              {mobileOpen ? <X className="h-7 w-7" /> : <Menu className="h-7 w-7" />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Dropdown Menu */}
      {mobileOpen && (
        <div className="md:hidden bg-white shadow-lg border-b fixed top-16 w-full z-40 p-4 space-y-4">

          {/* Mobile Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="search"
              placeholder="Search..."
              className="w-full pl-10 pr-4 py-2 bg-gray-100 rounded-lg"
            />
          </div>

          <Link to="/profile" className="flex items-center space-x-3">
            <img
              src={
                profile?.avatar_url ||
                `https://ui-avatars.com/api/?name=${profile?.full_name}&background=random`
              }
              className="h-10 w-10 rounded-full border"
            />
            <span className="font-medium">{profile?.username}</span>
          </Link>

          <button
            onClick={signOut}
            className="w-full bg-red-500 text-white py-2 rounded-lg"
          >
            Logout
          </button>
        </div>
      )}

      {/* Mobile Bottom Navigation */}
      <div className="md:hidden fixed bottom-0 left-0 w-full bg-white border-t shadow-lg h-14 flex justify-around items-center z-50">
        <Link to="/" className="text-gray-700">
          <Home className="h-6 w-6" />
        </Link>

        <Compass className="text-gray-700 h-6 w-6" />

        <PlusSquare className="text-gray-700 h-6 w-6" />

        <Heart className="text-gray-700 h-6 w-6" />

        <Link to="/profile">
          <User className="text-gray-700 h-6 w-6" />
        </Link>
      </div>
    </>
  );
};

export default Navbar;
