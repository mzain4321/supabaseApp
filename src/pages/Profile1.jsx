import React, { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { fetchProfile, fetchUserPosts, clearProfile } from '../redux/slices/profileSlice'
import { supabase } from '../services/supabase'
import { Grid, Bookmark, Settings, Users, UserPlus, UserMinus, Camera } from 'lucide-react'
import EditProfile from '../components/Profile1/EditProfile'
import LoadingSpinner from '../components/Common/LoadingSpinner'

const Profile1 = () => {
  const { username } = useParams()
  const [showEditProfile, setShowEditProfile] = useState(false)
  const [stats, setStats] = useState({ posts: 0, followers: 0, following: 0 })
  const [isFollowing, setIsFollowing] = useState(false)
  const [isOwnProfile, setIsOwnProfile] = useState(false)
  const [loading, setLoading] = useState(true)
  const [profileError, setProfileError] = useState(null)
  
  const dispatch = useDispatch()
  const navigate = useNavigate()
  
  const { user } = useSelector((state) => state.auth)
  const { profile, userPosts } = useSelector((state) => state.profile)

  // Fetch profile data
  const fetchProfileData = useCallback(async () => {
    try {
      setLoading(true)
      setProfileError(null)
      
      let targetUserId = null
      let targetProfile = null
      
      if (username) {
        // Fetch profile by username
        const { data, error } = await supabase
          .from('profiles1')
          .select('*')
          .eq('username', username)
          .single()
        
        if (error) {
          if (error.code === 'PGRST116') {
            setProfileError('Profile not found')
          } else {
            console.error('Error fetching profile:', error)
            setProfileError('Error loading profile')
          }
          return
        }
        
        targetProfile = data
        targetUserId = data.id
      } else if (user) {
        // Fetch current user's profile
        const { data, error } = await supabase
          .from('profiles1')
          .select('*')
          .eq('id', user.id)
          .single()
        
        if (error) {
          console.error('Error fetching current user profile:', error)
          // Try to create profile if it doesn't exist
          targetProfile = await createProfileForUser(user)
          if (targetProfile) {
            targetUserId = user.id
          } else {
            setProfileError('Failed to load or create profile')
            return
          }
        } else {
          targetProfile = data
          targetUserId = user.id
        }
      } else {
        // No user and no username - should redirect or show error
        setProfileError('Please sign in to view profiles')
        return
      }
      
      if (targetProfile) {
        dispatch(fetchProfile(targetUserId))
        dispatch(fetchUserPosts(targetUserId))
        await checkFollowing(targetUserId)
        setIsOwnProfile(user?.id === targetUserId)
        await fetchStats(targetUserId)
      }
    } catch (error) {
      console.error('Error loading profile data:', error)
      setProfileError('Failed to load profile')
    } finally {
      setLoading(false)
    }
  }, [username, user, dispatch])

  useEffect(() => {
    fetchProfileData()

    return () => {
      dispatch(clearProfile())
    }
  }, [fetchProfileData, dispatch])

  const createProfileForUser = async (userData) => {
    try {
      const username = userData.user_metadata?.username || 
                      userData.email?.split('@')[0]?.replace(/[^a-zA-Z0-9_]/g, '_') || 
                      'user' + Math.random().toString(36).substring(2, 8)
      
      const fullName = userData.user_metadata?.full_name || 
                      userData.user_metadata?.username || 
                      userData.email?.split('@')[0] || 
                      'User'
      
      const { data, error } = await supabase
        .from('profiles1')
        .insert({
          id: userData.id,
          username: username,
          full_name: fullName,
          avatar_url: 'https://i.pravatar.cc/300',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single()
      
      if (error) {
        console.error('Error creating profile:', error)
        return null
      }
      
      return data
    } catch (error) {
      console.error('Error in createProfileForUser:', error)
      return null
    }
  }

  const fetchStats = async (userId) => {
    try {
      // Get post count
      const { count: postCount } = await supabase
        .from('posts1')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)

      // Get follower count - fix the query structure
      const { count: followerCount } = await supabase
        .from('followers1')
        .select('*', { count: 'exact', head: true })
        .eq('following_id', userId)

      // Get following count
      const { count: followingCount } = await supabase
        .from('followers1')
        .select('*', { count: 'exact', head: true })
        .eq('follower_id', userId)

      setStats({
        posts: postCount || 0,
        followers: followerCount || 0,
        following: followingCount || 0
      })
    } catch (error) {
      console.error('Error fetching stats:', error)
    }
  }

  const checkFollowing = async (userId) => {
    if (!user || user.id === userId) {
      setIsFollowing(false)
      return
    }

    try {
      const { data, error } = await supabase
        .from('followers1')
        .select('id')
        .eq('follower_id', user.id)
        .eq('following_id', userId)
        .maybeSingle() // Use maybeSingle to handle empty results

      if (error) {
        console.error('Error checking follow status:', error)
        return
      }

      setIsFollowing(!!data)
    } catch (error) {
      console.error('Error checking follow status:', error)
    }
  }

  const handleFollow = async () => {
    if (!user) {
      navigate('/login')
      return
    }

    if (!profile || isOwnProfile) return

    try {
      if (isFollowing) {
        // Unlike
        const { error } = await supabase
          .from('followers1')
          .delete()
          .eq('follower_id', user.id)
          .eq('following_id', profile.id)

        if (error) throw error
        
        setIsFollowing(false)
      } else {
        // Like
        const { error } = await supabase
          .from('followers1')
          .insert({
            follower_id: user.id,
            following_id: profile.id
          })

        if (error) throw error
        
        setIsFollowing(true)
      }
      
      // Update stats
      fetchStats(profile.id)
    } catch (error) {
      console.error('Error following/unfollowing:', error)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner size="large" />
      </div>
    )
  }

  if (profileError) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="text-center py-16">
          <div className="max-w-sm mx-auto">
            <div className="p-6 bg-gray-100 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-6">
              <Users size={48} className="text-gray-400" />
            </div>
            <h3 className="text-2xl font-light mb-2">Profile Not Found</h3>
            <p className="text-gray-600 mb-6">
              {profileError === 'Profile not found' 
                ? `The user "${username}" doesn't exist.` 
                : profileError}
            </p>
            <button
              onClick={() => navigate('/')}
              className="px-6 py-2 bg-blue-600 text-white font-medium rounded hover:bg-blue-700"
            >
              Go Back Home
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="text-center py-16">
          <div className="max-w-sm mx-auto">
            <div className="p-6 bg-gray-100 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-6">
              <Users size={48} className="text-gray-400" />
            </div>
            <h3 className="text-2xl font-light mb-2">No Profile</h3>
            <p className="text-gray-600 mb-6">
              {user ? 'Your profile is being created...' : 'Please sign in to view profiles.'}
            </p>
            {user && (
              <button
                onClick={fetchProfileData}
                className="px-6 py-2 bg-blue-600 text-white font-medium rounded hover:bg-blue-700"
              >
                Refresh Page
              </button>
            )}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Profile Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center space-y-6 md:space-y-0 md:space-x-8 mb-8">
        {/* Profile Picture */}
        <div className="flex-shrink-0">
          <img
            src={profile.avatar_url || 'https://i.pravatar.cc/300'}
            alt={profile.username}
            className="w-32 h-32 rounded-full border-4 border-white shadow-lg object-cover"
          />
        </div>

        {/* Profile Info */}
        <div className="flex-1">
          <div className="flex flex-col md:flex-row md:items-center mb-4">
            <h1 className="text-2xl font-light mr-4">{profile.username}</h1>
            
            <div className="flex space-x-2 mt-2 md:mt-0">
              {isOwnProfile ? (
                <>
                  <button
                    onClick={() => setShowEditProfile(true)}
                    className="px-4 py-1.5 bg-gray-100 hover:bg-gray-200 text-sm font-medium rounded transition-colors"
                  >
                    Edit Profile
                  </button>
                  <button 
                    onClick={() => navigate('/settings')}
                    className="px-4 py-1.5 bg-gray-100 hover:bg-gray-200 text-sm font-medium rounded transition-colors"
                    title="Settings"
                  >
                    <Settings size={18} />
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={handleFollow}
                    className={`px-4 py-1.5 text-sm font-medium rounded transition-colors flex items-center ${
                      isFollowing 
                        ? 'bg-gray-100 hover:bg-gray-200' 
                        : 'bg-blue-600 hover:bg-blue-700 text-white'
                    }`}
                    disabled={!user}
                  >
                    {isFollowing ? (
                      <>
                        <UserMinus size={18} className="mr-1" />
                        Unfollow
                      </>
                    ) : (
                      <>
                        <UserPlus size={18} className="mr-1" />
                        Follow
                      </>
                    )}
                  </button>
                  {user && (
                    <button className="px-4 py-1.5 bg-gray-100 hover:bg-gray-200 text-sm font-medium rounded transition-colors">
                      Message
                    </button>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Stats */}
          <div className="flex space-x-6 mb-4">
            <div>
              <span className="font-semibold">{stats.posts}</span> posts
            </div>
            <div>
              <span className="font-semibold">{stats.followers}</span> followers
            </div>
            <div>
              <span className="font-semibold">{stats.following}</span> following
            </div>
          </div>

          {/* Bio */}
          <div className="space-y-1">
            <p className="font-semibold">{profile.full_name}</p>
            {profile.bio && <p className="text-gray-800">{profile.bio}</p>}
            {profile.website && (
              <a
                href={profile.website}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                {profile.website}
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Profile Tabs */}
      <div className="border-t border-gray-300">
        <div className="flex justify-center space-x-12">
          <button className="flex items-center py-4 px-2 border-t-2 border-black -mt-px text-sm font-medium text-gray-900">
            <Grid size={18} className="mr-1" />
            POSTS
          </button>
          <button className="flex items-center py-4 px-2 text-sm font-medium text-gray-500 hover:text-gray-900">
            <Bookmark size={18} className="mr-1" />
            SAVED
          </button>
          <button className="flex items-center py-4 px-2 text-sm font-medium text-gray-500 hover:text-gray-900">
            <Users size={18} className="mr-1" />
            TAGGED
          </button>
        </div>
      </div>

      {/* Posts Grid */}
      {userPosts && userPosts.length > 0 ? (
        <div className="grid grid-cols-3 gap-1 mt-4">
          {userPosts.map((post) => (
            <div
              key={post.id}
              className="relative aspect-square cursor-pointer group"
              onClick={() => navigate(`/post/${post.id}`)}
            >
              <img
                src={post.image_url}
                alt={post.caption || 'Post image'}
                className="w-full h-full object-cover"
                loading="lazy"
                onError={(e) => {
                  e.target.src = 'https://via.placeholder.com/400x400?text=Image+Not+Found'
                }}
              />
              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all duration-200 flex items-center justify-center opacity-0 group-hover:opacity-100">
                <div className="flex items-center space-x-4 text-white">
                  <span className="font-semibold flex items-center">
                    <UserPlus size={20} className="mr-1" />
                    {post.likes_count || 0}
                  </span>
                  <span className="font-semibold flex items-center">
                    <Users size={20} className="mr-1" />
                    {post.comments_count || 0}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <div className="max-w-sm mx-auto">
            <div className="p-6 bg-gray-100 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-6">
              <Camera size={48} className="text-gray-400" />
            </div>
            <h3 className="text-2xl font-light mb-2">
              {isOwnProfile ? 'Share Photos' : 'No Posts Yet'}
            </h3>
            <p className="text-gray-600 mb-6">
              {isOwnProfile 
                ? 'When you share photos, they will appear on your profile.'
                : 'This user hasn\'t shared any posts yet.'}
            </p>
            {isOwnProfile && (
              <button
                onClick={() => navigate('/')}
                className="px-6 py-2 bg-blue-600 text-white font-medium rounded hover:bg-blue-700"
              >
                Share your first photo
              </button>
            )}
          </div>
        </div>
      )}

      {/* Edit Profile Modal */}
      {showEditProfile && (
        <EditProfile onClose={() => setShowEditProfile(false)} />
      )}
    </div>
  )
}

export default Profile1