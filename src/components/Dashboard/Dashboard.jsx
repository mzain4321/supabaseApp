import React from 'react'
import Navbar from './Navbar'
import Sidebar from './Sidebar'
import Feed from './Feed'
import CreatePost from '../Posts/CreatePost'

const Dashboard = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="container mx-auto px-4 py-34">
        <div className="flex gap-8">
          {/* Main Content */}
          <div className="flex-1">
            <CreatePost />
            <Feed />
          </div>
          
          {/* Sidebar */}
          <div className="w-80 hidden lg:block">
            <Sidebar />
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard