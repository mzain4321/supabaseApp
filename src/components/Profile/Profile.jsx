import React, { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { supabase } from '../../services/supabase'
import ProfileHeader from './ProfileHeader'
import EditProfile from './EditProfile'
import UserPosts from './UserPosts'
import Navbar from '../Dashboard/Navbar'
import { Settings } from 'lucide-react'

const Profile = () => {
  const { username } = useParams()
  const { user, profile: currentProfile } = useAuth()
  const [profile, setProfile] = useState(null)
  const [isEditing, setIsEditing] = useState(false)
  const [isOwnProfile, setIsOwnProfile] = useState(false)

  useEffect(() => {
    fetchProfile()
  }, [username, currentProfile])

  const fetchProfile = async () => {
    if (username) {
      // Viewing another user's profile
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('username', username)
        .single()
      setProfile(data)
      setIsOwnProfile(data?.id === user?.id)
    } else {
      // Viewing own profile
      setProfile(currentProfile)
      setIsOwnProfile(true)
    }
  }

  if (!profile) return null

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="container mx-auto px-4 py-34">
        {/* Profile Header */}
        <div className="card mb-8">
          <div className="flex justify-between items-start">
            <ProfileHeader profile={profile} />
            {isOwnProfile && (
              <button
                onClick={() => setIsEditing(true)}
                className="btn-secondary flex items-center space-x-2"
              >
                <Settings className="h-4 w-4" />
                <span>Edit Profile</span>
              </button>
            )}
          </div>
        </div>

        {/* Edit Profile Modal */}
        {isEditing && (
          <EditProfile
            profile={profile}
            onClose={() => setIsEditing(false)}
            onUpdate={fetchProfile}
          />
        )}

        {/* User Posts */}
        <UserPosts userId={profile.id} />
      </div>
    </div>
  )
}

export default Profile