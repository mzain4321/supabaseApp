import React, { useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { useDispatch, useSelector } from 'react-redux'
import { supabase } from '../../services/supabase'
import { createPost } from '../../redux/slices/postSlice'
import { Camera, X, Upload } from 'lucide-react'

const CreatePost = ({ onClose, onSuccess }) => {
  const [caption, setCaption] = useState('')
  const [image, setImage] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [previewUrl, setPreviewUrl] = useState('')
  const dispatch = useDispatch()
  const { user } = useSelector((state) => state.auth)

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.webp']
    },
    onDrop: (acceptedFiles) => {
      const file = acceptedFiles[0]
      if (file) {
        setImage(file)
        setPreviewUrl(URL.createObjectURL(file))
      }
    },
    maxFiles: 1
  })

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!image || !caption.trim() || !user) {
      alert('Please add an image and caption')
      return
    }

    setUploading(true)
    try {
      console.log('🟡 CreatePost: Starting upload...')
      
      // Upload image to Supabase Storage
      const fileExt = image.name.split('.').pop()
      const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`
      const filePath = `${user.id}/${fileName}`

      console.log('📤 Uploading file:', { fileName, filePath })

      const { error: uploadError } = await supabase.storage
        .from('images1')
        .upload(filePath, image)

      if (uploadError) {
        console.error('❌ Upload error:', uploadError)
        throw new Error(`Upload failed: ${uploadError.message}`)
      }

      console.log('✅ Upload successful')

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('images1')
        .getPublicUrl(filePath)

      console.log('🔗 Public URL:', publicUrl)

      // Create post using Redux thunk
      console.log('🔄 Creating post in database...')
      const result = await dispatch(createPost({
        user_id: user.id,
        image_url: publicUrl,
        caption: caption.trim()
      }))

      if (result.error) {
        console.error('❌ Create post error:', result.error)
        throw new Error(result.error.message || 'Failed to create post')
      }

      console.log('✅ Post created successfully')

      // Reset form
      setCaption('')
      setImage(null)
      if (previewUrl.startsWith('blob:')) {
        URL.revokeObjectURL(previewUrl)
      }
      setPreviewUrl('')
      
      // Call onSuccess callback to refresh posts
      if (onSuccess) {
        console.log('🔄 Refreshing posts...')
        setTimeout(() => {
          onSuccess()
        }, 1000) // Wait a bit for database to sync
      }
      
      // Close modal
      if (onClose) {
        console.log('📪 Closing modal...')
        setTimeout(() => {
          onClose()
        }, 500)
      }
      
    } catch (error) {
      console.error('❌ Error creating post:', error)
      alert(`Error: ${error.message}`)
    } finally {
      setUploading(false)
    }
  }

  const removeImage = () => {
    setImage(null)
    if (previewUrl.startsWith('blob:')) {
      URL.revokeObjectURL(previewUrl)
    }
    setPreviewUrl('')
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg w-full max-w-md max-h-[90vh] overflow-hidden">
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-lg font-semibold">Create New Post</h2>
          <button 
            onClick={onClose} 
            className="text-gray-500 hover:text-gray-700"
            disabled={uploading}
          >
            <X size={24} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="overflow-y-auto max-h-[calc(90vh-80px)]">
          {!previewUrl ? (
            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-lg m-4 p-8 text-center cursor-pointer transition-colors ${
                isDragActive 
                  ? 'border-blue-500 bg-blue-50' 
                  : 'border-gray-300 hover:border-blue-400'
              }`}
            >
              <input {...getInputProps()} />
              <Camera className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <p className="text-sm text-gray-600 mb-2">
                Drag & drop an image here, or click to select
              </p>
              <p className="text-xs text-gray-500">
                Supports: JPG, PNG, GIF, WebP
              </p>
              <button
                type="button"
                className="mt-4 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700"
              >
                Select from computer
              </button>
            </div>
          ) : (
            <div className="p-4">
              <div className="relative">
                <img
                  src={previewUrl}
                  alt="Preview"
                  className="w-full h-64 object-cover rounded-lg"
                />
                <button
                  type="button"
                  onClick={removeImage}
                  className="absolute top-2 right-2 bg-black bg-opacity-50 text-white p-1 rounded-full hover:bg-opacity-70"
                  disabled={uploading}
                >
                  <X size={20} />
                </button>
              </div>
            </div>
          )}

          <div className="px-4 pb-4">
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Caption
              </label>
              <textarea
                placeholder="What's on your mind?..."
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows="3"
                disabled={uploading}
              />
              <p className="text-xs text-gray-500 mt-1">
                {caption.length}/2200 characters
              </p>
            </div>

            <div className="flex justify-end space-x-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 disabled:opacity-50"
                disabled={uploading}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!image || !caption.trim() || uploading}
                className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              >
                {uploading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Posting...
                  </>
                ) : (
                  <>
                    <Upload size={16} className="mr-2" />
                    Share Post
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}

export default CreatePost