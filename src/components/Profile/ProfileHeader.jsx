import React, { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import { supabase } from '../../services/supabase'
import { MapPin, Link as LinkIcon, Calendar, Users, Edit } from 'lucide-react'
import moment from 'moment'

const ProfileHeader = ({ profile }) => {
  const { user } = useAuth()
  const [stats, setStats] = useState({
    posts: 0,
    followers: 0,
    following: 0
  })
  const [isFollowing, setIsFollowing] = useState(false)

  useEffect(() => {
    fetchStats()
    checkIfFollowing()
  }, [profile])

  const fetchStats = async () => {
    try {
      // Get post count
      const { count: postsCount } = await supabase
        .from('posts')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', profile.id)

      // Get follower count
      const { count: followersCount } = await supabase
        .from('follows')
        .select('*', { count: 'exact', head: true })
        .eq('following_id', profile.id)

      // Get following count
      const { count: followingCount } = await supabase
        .from('follows')
        .select('*', { count: 'exact', head: true })
        .eq('follower_id', profile.id)

      setStats({
        posts: postsCount || 0,
        followers: followersCount || 0,
        following: followingCount || 0
      })
    } catch (error) {
      console.error('Error fetching stats:', error)
    }
  }

  const checkIfFollowing = async () => {
    if (!user || user.id === profile.id) return

    const { data } = await supabase
      .from('follows')
      .select('*')
      .eq('follower_id', user.id)
      .eq('following_id', profile.id)
      .single()

    setIsFollowing(!!data)
  }

  const handleFollow = async () => {
    if (!user) return

    try {
      if (isFollowing) {
        // Unfollow
        await supabase
          .from('follows')
          .delete()
          .eq('follower_id', user.id)
          .eq('following_id', profile.id)
      } else {
        // Follow
        await supabase
          .from('follows')
          .insert([
            {
              follower_id: user.id,
              following_id: profile.id
            }
          ])
      }

      setIsFollowing(!isFollowing)
      fetchStats() // Refresh stats
    } catch (error) {
      console.error('Error following/unfollowing:', error)
    }
  }

  const formatNumber = (num) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M'
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K'
    }
    return num
  }

  return (
    <div className="flex flex-col md:flex-row items-start md:items-center space-y-6 md:space-y-0 md:space-x-12">
      {/* Profile Picture */}
      <div className="relative">
        <div className="h-32 w-32 md:h-40 md:w-40 rounded-full border-4 border-white shadow-lg overflow-hidden">
          <img
            src={profile.avatar_url || `https://ui-avatars.com/api/?name=${profile.full_name}&background=random&color=fff&size=256`}
            alt={profile.username}
            className="h-full w-full object-cover"
          />
        </div>
      </div>

      {/* Profile Info */}
      <div className="flex-1">
        <div className="flex flex-col md:flex-row md:items-center space-y-4 md:space-y-0 md:space-x-6 mb-6">
          <h1 className="text-2xl md:text-3xl font-bold">{profile.username}</h1>
          
          <div className="flex items-center space-x-4">
            {user?.id === profile.id ? (
              <button className="btn-secondary px-6 flex items-center space-x-2">
                <Edit className="h-4 w-4" />
                <span>Edit Profile</span>
              </button>
            ) : (
              <>
                <button
                  onClick={handleFollow}
                  className={`${isFollowing ? 'btn-secondary' : 'btn-primary'} px-6`}
                >
                  {isFollowing ? 'Following' : 'Follow'}
                </button>
                <button className="btn-secondary px-6">Message</button>
              </>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="flex space-x-8 mb-6">
          <div className="text-center">
            <div className="text-xl font-bold">{formatNumber(stats.posts)}</div>
            <div className="text-gray-600 text-sm">Posts</div>
          </div>
          <div className="text-center">
            <div className="text-xl font-bold">{formatNumber(stats.followers)}</div>
            <div className="text-gray-600 text-sm">Followers</div>
          </div>
          <div className="text-center">
            <div className="text-xl font-bold">{formatNumber(stats.following)}</div>
            <div className="text-gray-600 text-sm">Following</div>
          </div>
        </div>

        {/* Bio and Info */}
        <div className="space-y-3">
          {profile.full_name && (
            <h2 className="font-semibold text-lg">{profile.full_name}</h2>
          )}
          
          {profile.bio && (
            <p className="text-gray-700 whitespace-pre-line">{profile.bio}</p>
          )}

          <div className="flex flex-wrap gap-4 text-gray-600">
            {profile.website && (
              <a
                href={profile.website.startsWith('http') ? profile.website : `https://${profile.website}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-1 hover:text-instagram-blue"
              >
                <LinkIcon className="h-4 w-4" />
                <span>{profile.website.replace(/^https?:\/\//, '')}</span>
              </a>
            )}

            <div className="flex items-center space-x-1">
              <Calendar className="h-4 w-4" />
              <span>Joined {moment(profile.created_at).format('MMMM YYYY')}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProfileHeader