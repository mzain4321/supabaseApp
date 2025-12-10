import React from 'react'
import { Link } from 'react-router-dom'
import { Instagram, Camera, Heart, Users } from 'lucide-react'

const Home1 = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-blue-50">
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <div className="flex justify-center items-center mb-6">
            <Instagram className="h-16 w-16 text-pink-600" />
            <h1 className="text-5xl font-bold text-gray-900 ml-4">SocialAPP</h1>
          </div>
          <p className="text-xl text-gray-600 mb-8">
            Share your moments with the world
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mb-12">
          <div className="bg-white rounded-xl shadow-lg p-6 text-center">
            <div className="flex justify-center mb-4">
              <div className="p-4 bg-blue-100 rounded-full">
                <Camera className="h-8 w-8 text-blue-600" />
              </div>
            </div>
            <h3 className="text-xl font-semibold mb-2">Share Photos</h3>
            <p className="text-gray-600">
              Upload and share your favorite moments with friends and family
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 text-center">
            <div className="flex justify-center mb-4">
              <div className="p-4 bg-pink-100 rounded-full">
                <Heart className="h-8 w-8 text-pink-600" />
              </div>
            </div>
            <h3 className="text-xl font-semibold mb-2">Connect & Engage</h3>
            <p className="text-gray-600">
              Like, comment, and interact with posts from people you follow
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 text-center">
            <div className="flex justify-center mb-4">
              <div className="p-4 bg-green-100 rounded-full">
                <Users className="h-8 w-8 text-green-600" />
              </div>
            </div>
            <h3 className="text-xl font-semibold mb-2">Build Community</h3>
            <p className="text-gray-600">
              Follow friends, discover new creators, and grow your network
            </p>
          </div>
        </div>

        <div className="text-center">
          <div className="mb-8">
            <h2 className="text-3xl font-bold mb-4">Join SocialAPP Today</h2>
            <p className="text-gray-600 mb-8">
              Sign up now and start sharing your world
            </p>
          </div>

          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link
              to="/signup"
              className="inline-flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-gradient-to-r from-pink-600 to-orange-500 hover:from-pink-700 hover:to-orange-600 md:py-4 md:text-lg md:px-10"
            >
              Get Started
            </Link>
            <Link
              to="/login"
              className="inline-flex items-center justify-center px-8 py-3 border-2 border-gray-300 text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 md:py-4 md:text-lg md:px-10"
            >
              Sign In
            </Link>
          </div>
        </div>

        <div className="mt-16 pt-8 border-t border-gray-200 items-center justify-center text-center">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 items-center justify-center text-center">
            <div>
              <h4 className="font-semibold mb-2">Company</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li><a href="#" className="hover:text-gray-900">About</a></li>
                <li><a href="#" className="hover:text-gray-900">Blog</a></li>
                <li><a href="#" className="hover:text-gray-900">Jobs</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Help</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li><a href="#" className="hover:text-gray-900">Help Center</a></li>
                <li><a href="#" className="hover:text-gray-900">Privacy</a></li>
                <li><a href="#" className="hover:text-gray-900">Terms</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-2">Connect</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li><a href="#" className="hover:text-gray-900">Twitter</a></li>
                <li><a href="#" className="hover:text-gray-900">Facebook</a></li>
                <li><a href="#" className="hover:text-gray-900">Instagram</a></li>
              </ul>
            </div>
          </div>
          <div className="mt-8 text-center text-sm text-gray-500">
            © 2025 SocialAPP. All rights reserved.
          </div>
        </div>
      </div>
    </div>
  )
}

export default Home1