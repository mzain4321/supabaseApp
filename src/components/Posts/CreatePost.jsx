import React, { useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { supabase } from '../../services/supabase'
import { Image, X } from 'lucide-react'
import toast from 'react-hot-toast'

const CreatePost = () => {
  const [caption, setCaption] = useState('')
  const [image, setImage] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)
  const [uploading, setUploading] = useState(false)
  const { user } = useAuth()

  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setImage(file)
      setImagePreview(URL.createObjectURL(file))
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!image || !caption.trim()) {
      toast.error('Please add both image and caption')
      return
    }

    setUploading(true)

    try {
      // Upload image to storage
      const fileExt = image.name.split('.').pop()
      const fileName = `${user.id}-${Date.now()}.${fileExt}`
      const filePath = `${fileName}`

      const { error: uploadError } = await supabase.storage
        .from('posts')
        .upload(filePath, image)

      if (uploadError) throw uploadError

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('posts')
        .getPublicUrl(filePath)

      // Create post in database
      const { error: postError } = await supabase
        .from('posts')
        .insert([
          {
            user_id: user.id,
            image_url: publicUrl,
            caption: caption.trim(),
          }
        ])

      if (postError) throw postError

      toast.success('Post created successfully!')
      setCaption('')
      setImage(null)
      setImagePreview(null)
    } catch (error) {
      toast.error('Failed to create post: ' + error.message)
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="card mb-6">
      <div className="flex items-start space-x-4">
        <div className="flex-1">
          <textarea
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            placeholder="What's on your mind?"
            className="w-full border-none resize-none focus:outline-none focus:ring-0 text-lg"
            rows="3"
          />
          
          {imagePreview && (
            <div className="relative mt-4">
              <img
                src={imagePreview}
                alt="Preview"
                className="w-full h-64 object-cover rounded-lg"
              />
              <button
                onClick={() => {
                  setImage(null)
                  setImagePreview(null)
                }}
                className="absolute top-2 right-2 bg-black bg-opacity-50 text-white p-1 rounded-full hover:bg-opacity-70"
              >
                <X className="h-4 w-4" />
                select image
              </button>
            </div>
          )}

          <div className="flex items-center justify-between mt-4 pt-4 border-t">
            <div className="flex items-center space-x-4">
              <label className="cursor-pointer text-gray-600 hover:text-gray-800">
                <Image className="h-6 w-6" />
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </label>
            </div>

            <button
              onClick={handleSubmit}
              disabled={uploading || !image || !caption.trim()}
              className="btn-primary px-6"
            >
              {uploading ? 'Posting...' : 'Post'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CreatePost