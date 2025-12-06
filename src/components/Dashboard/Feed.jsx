import React from 'react'
import PostFeed from '../Posts/PostFeed'
import { Users, TrendingUp, Zap } from 'lucide-react'

const Feed = () => {
  const suggestions = [
    { id: 1, username: 'johndoe', name: 'John Doe', isFollowed: false },
    { id: 2, username: 'janesmith', name: 'Jane Smith', isFollowed: true },
    { id: 3, username: 'mikejohnson', name: 'Mike Johnson', isFollowed: false },
    { id: 4, username: 'sarahwilson', name: 'Sarah Wilson', isFollowed: true },
    { id: 5, username: 'alexbrown', name: 'Alex Brown', isFollowed: false },
  ]

  const trends = [
    { id: 1, tag: '#instagood', posts: '2.5M' },
    { id: 2, tag: '#photography', posts: '1.8M' },
    { id: 3, tag: '#nature', posts: '1.2M' },
    { id: 4, tag: '#travel', posts: '950K' },
    { id: 5, tag: '#food', posts: '3.1M' },
  ]

  return (
    <div className="flex gap-8">
      {/* Main Feed */}
      <div className="flex-1 max-w-2xl mx-auto">
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-2">Home Feed</h2>
          <p className="text-gray-600">Discover posts from people you follow</p>
        </div>
        <PostFeed />
      </div>

      {/* Sidebar Suggestions - Only show on larger screens */}
      <div className="hidden xl:block w-80">
        <div className="sticky top-24 space-y-6">
          {/* Who to Follow */}
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-lg">Suggestions For You</h3>
              <Users className="h-5 w-5 text-gray-400" />
            </div>
            
            <div className="space-y-4">
              {suggestions.map((user) => (
                <div key={user.id} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="h-10 w-10 rounded-full bg-gradient-to-r from-instagram-purple to-instagram-pink flex items-center justify-center text-white font-semibold">
                      {user.username.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="font-medium">{user.username}</div>
                      <div className="text-sm text-gray-500">{user.name}</div>
                    </div>
                  </div>
                  <button className={`text-xs px-3 py-1 rounded-full ${user.isFollowed ? 'bg-gray-100 text-gray-700' : 'btn-primary'}`}>
                    {user.isFollowed ? 'Following' : 'Follow'}
                  </button>
                </div>
              ))}
            </div>
            
            <button className="w-full mt-4 text-instagram-blue hover:underline text-sm font-medium">
              See All
            </button>
          </div>

          {/* Trending Now */}
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-lg">Trending Now</h3>
              <TrendingUp className="h-5 w-5 text-gray-400" />
            </div>
            
            <div className="space-y-3">
              {trends.map((trend) => (
                <div key={trend.id} className="flex items-center justify-between hover:bg-gray-50 p-2 rounded-lg cursor-pointer">
                  <div>
                    <div className="font-medium">{trend.tag}</div>
                    <div className="text-sm text-gray-500">{trend.posts} posts</div>
                  </div>
                  <Zap className="h-4 w-4 text-yellow-500" />
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}

export default Feed