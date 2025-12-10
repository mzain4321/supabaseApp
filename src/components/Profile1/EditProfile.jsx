import React, { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { updateProfile } from '../../redux/slices/profileSlice'
import { supabase } from '../../services/supabase'
import { X, Upload as UploadIcon, Loader } from 'lucide-react'

const EditProfile = ({ onClose }) => {
  const dispatch = useDispatch()
  const { profile } = useSelector((state) => state.profile)
  const { user } = useSelector((state) => state.auth)
  
  const [formData, setFormData] = useState({
    username: '',
    full_name: '',
    bio: '',
    website: '',
    avatar: null
  })
  
  const [previewUrl, setPreviewUrl] = useState('')
  const [uploading, setUploading] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // Initialize form with profile data
  useEffect(() => {
    if (profile) {
      setFormData({
        username: profile.username || '',
        full_name: profile.full_name || '',
        bio: profile.bio || '',
        website: profile.website || '',
        avatar: null
      })
      setPreviewUrl(profile.avatar_url || 'https://i.pravatar.cc/300')
      setLoading(false)
    } else {
      setError('Profile not found. Please try again.')
      setLoading(false)
    }
  }, [profile])

  const handleAvatarChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setError('Please select an image file (JPEG, PNG, etc.)')
        return
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError('Image size should be less than 5MB')
        return
      }
      
      setFormData(prev => ({ ...prev, avatar: file }))
      setPreviewUrl(URL.createObjectURL(file))
      setError('')
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    
    // Validate username
    if (name === 'username') {
      if (value.length < 3) {
        setError('Username must be at least 3 characters')
      } else if (!/^[a-zA-Z0-9_.]+$/.test(value)) {
        setError('Username can only contain letters, numbers, underscores, and dots')
      } else {
        setError('')
      }
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    // Validate form
    if (!formData.username.trim()) {
      setError('Username is required')
      return
    }
    
    if (formData.username.length < 3) {
      setError('Username must be at least 3 characters')
      return
    }
    
    setUploading(true)
    setError('')

    try {
      let avatarUrl = profile?.avatar_url || 'https://i.pravatar.cc/300'
      
      // Upload new avatar if selected
      if (formData.avatar && user) {
        // Generate unique filename
        const fileExt = formData.avatar.name.split('.').pop()
        const fileName = `avatar_${Date.now()}_${Math.random().toString(36).substring(2, 9)}.${fileExt}`
        const filePath = `${user.id}/${fileName}`

        console.log('Uploading avatar to:', filePath)

        // First, try to get current session to ensure auth is valid
        const { data: { session } } = await supabase.auth.getSession()
        if (!session) {
          throw new Error('You need to be logged in to upload images')
        }

        // Upload the file
        const { error: uploadError } = await supabase.storage
          .from('images1')
          .upload(filePath, formData.avatar, {
            cacheControl: '3600',
            upsert: true
          })

        if (uploadError) {
          console.error('Upload error details:', uploadError)
          
          // If upload fails, try without user folder structure
          const publicFilePath = `public_avatars/${fileName}`
          const { error: publicUploadError } = await supabase.storage
            .from('images1')
            .upload(publicFilePath, formData.avatar, {
              cacheControl: '3600',
              upsert: true
            })
            
          if (publicUploadError) {
            throw new Error(`Upload failed: ${publicUploadError.message}. Please try a different image.`)
          }
          
          // Get public URL for public upload
          const { data: { publicUrl: publicUploadUrl } } = supabase.storage
            .from('images1')
            .getPublicUrl(publicFilePath)
          
          avatarUrl = publicUploadUrl
        } else {
          // Get public URL for user folder upload
          const { data: { publicUrl } } = supabase.storage
            .from('images1')
            .getPublicUrl(filePath)
          
          avatarUrl = publicUrl
        }
        
        console.log('Avatar uploaded successfully:', avatarUrl)
      }

      // Update profile
      const updateData = {
        id: profile.id,
        username: formData.username.trim(),
        full_name: formData.full_name.trim(),
        avatar_url: avatarUrl,
        bio: formData.bio.trim(),
        website: formData.website.trim()
      }

      console.log('Updating profile with:', updateData)

      const result = await dispatch(updateProfile(updateData))
      
      if (result.error) {
        throw new Error(result.error.message || 'Failed to update profile')
      }

      console.log('Profile updated successfully')
      
      // Clean up preview URL
      if (previewUrl && previewUrl.startsWith('blob:')) {
        URL.revokeObjectURL(previewUrl)
      }
      
      // Close modal
      onClose()
      
    } catch (error) {
      console.error('Error updating profile:', error)
      setError(error.message || 'Failed to update profile. Please try again.')
    } finally {
      setUploading(false)
    }
  }

  const handleCancel = () => {
    // Clean up preview URL
    if (previewUrl && previewUrl.startsWith('blob:')) {
      URL.revokeObjectURL(previewUrl)
    }
    onClose()
  }

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-lg w-full max-w-md p-8 text-center">
          <Loader className="h-8 w-8 animate-spin mx-auto text-blue-600" />
          <p className="mt-4 text-gray-600">Loading profile...</p>
        </div>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-lg w-full max-w-md p-6">
          <div className="text-red-600 mb-4">
            <p>Profile data not available</p>
          </div>
          <button
            onClick={onClose}
            className="w-full px-4 py-2 bg-blue-600 text-white font-medium rounded hover:bg-blue-700"
          >
            Close
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg w-full max-w-md max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b">
          <div className="flex items-center">
            <button
              onClick={handleCancel}
              className="mr-3 text-gray-500 hover:text-gray-700"
              disabled={uploading}
            >
              <X size={24} />
            </button>
            <h2 className="text-lg font-semibold">Edit Profile</h2>
          </div>
          <button
            onClick={handleSubmit}
            disabled={uploading || !!error}
            className="px-4 py-1 bg-blue-600 text-white text-sm font-medium rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {uploading ? 'Saving...' : 'Save'}
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="overflow-y-auto max-h-[calc(90vh-80px)] p-4">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          {/* Avatar Upload */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Profile Picture
            </label>
            <div className="flex flex-col items-center">
              <div className="relative mb-4">
                <img
                  src={previewUrl}
                  alt="Profile preview"
                  className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-lg"
                  onError={(e) => {
                    e.target.src = 'https://i.pravatar.cc/300'
                  }}
                />
                <label
                  htmlFor="avatar-upload"
                  className="absolute bottom-0 right-0 bg-blue-600 text-white p-2 rounded-full cursor-pointer hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <UploadIcon size={18} />
                </label>
                <input
                  id="avatar-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  className="hidden"
                  disabled={uploading}
                />
              </div>
              <p className="text-xs text-gray-500 text-center">
                Click the camera icon to change your profile picture
                <br />
                Maximum file size: 5MB (JPEG, PNG, WebP)
              </p>
            </div>
          </div>

          {/* Username */}
          <div className="mb-4">
            <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
              Username *
            </label>
            <input
              id="username"
              name="username"
              type="text"
              value={formData.username}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
              placeholder="Enter username"
              disabled={uploading}
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              This will be your public username. 3-30 characters.
            </p>
          </div>

          {/* Full Name */}
          <div className="mb-4">
            <label htmlFor="full_name" className="block text-sm font-medium text-gray-700 mb-1">
              Full Name
            </label>
            <input
              id="full_name"
              name="full_name"
              type="text"
              value={formData.full_name}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
              placeholder="Enter your full name"
              disabled={uploading}
            />
          </div>

          {/* Bio */}
          <div className="mb-4">
            <label htmlFor="bio" className="block text-sm font-medium text-gray-700 mb-1">
              Bio
            </label>
            <textarea
              id="bio"
              name="bio"
              value={formData.bio}
              onChange={handleInputChange}
              rows="3"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none disabled:opacity-50"
              placeholder="Tell us about yourself..."
              disabled={uploading}
              maxLength="150"
            />
            <p className="text-xs text-gray-500 mt-1 text-right">
              {formData.bio.length}/150 characters
            </p>
          </div>

          {/* Website */}
          <div className="mb-6">
            <label htmlFor="website" className="block text-sm font-medium text-gray-700 mb-1">
              Website
            </label>
            <input
              id="website"
              name="website"
              type="url"
              value={formData.website}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
              placeholder="https://example.com"
              disabled={uploading}
            />
            <p className="text-xs text-gray-500 mt-1">
              Add a link to your website or blog
            </p>
          </div>

          {/* Uploading indicator */}
          {uploading && (
            <div className="mb-4 p-3 bg-blue-50 rounded-md flex items-center justify-center">
              <Loader className="h-5 w-5 animate-spin text-blue-600 mr-2" />
              <span className="text-blue-700">Updating profile...</span>
            </div>
          )}

          {/* Cancel button at bottom for mobile */}
          <div className="md:hidden mt-4">
            <button
              type="button"
              onClick={handleCancel}
              className="w-full px-4 py-2 border border-gray-300 text-gray-700 font-medium rounded hover:bg-gray-50 disabled:opacity-50"
              disabled={uploading}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default EditProfile