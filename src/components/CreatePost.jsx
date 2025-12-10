import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { addPost, setLoading } from '../store/slices/postSlice';
import { supabase, uploadImage } from '../lib/supabase';
import { Upload, AlertCircle, Loader2 } from 'lucide-react';

const CreatePost = () => {
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState('');
  const [caption, setCaption] = useState('');
  const [uploadError, setUploadError] = useState('');
  const [uploadProgress, setUploadProgress] = useState(0);
  const { user } = useSelector(state => state.auth);
  const { loading } = useSelector(state => state.posts);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setUploadError('Please select an image file (PNG, JPG, GIF)');
        return;
      }
      
      // Validate file size (5MB)
      if (file.size > 5 * 1024 * 1024) {
        setUploadError('Image size should be less than 5MB');
        return;
      }

      setImage(file);
      setPreview(URL.createObjectURL(file));
      setUploadError('');
      setUploadProgress(0);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!image) {
      setUploadError('Please select an image to upload');
      return;
    }
    
    if (!user) {
      setUploadError('You must be logged in to create a post');
      navigate('/login');
      return;
    }

    setUploadError('');
    setUploadProgress(10);
    dispatch(setLoading(true));

    try {
      console.log('Starting post creation process...');
      
      // Step 1: Upload image
      console.log('Uploading image...');
      setUploadProgress(30);
      const imageUrl = await uploadImage(image, user.id, 'posts');
      
      if (!imageUrl) {
        throw new Error('Image upload did not return a URL');
      }
      
      console.log('Image uploaded successfully. URL:', imageUrl);
      setUploadProgress(70);

      // Step 2: Create post in database
      console.log('Creating post in database...');
      const postData = {
        user_id: user.id,
        image_url: imageUrl,
        caption: caption.trim() || null
      };
      
      console.log('Post data:', postData);

      const { data: post, error: dbError } = await supabase
        .from('posts1')
        .insert([postData])
        .select(`
          *,
          profiles1!user_id (*),
          like1 (user_id),
          comments1 (*, profiles1!user_id (*))
        `)
        .single();

      if (dbError) {
        console.error('Database error details:', dbError);
        
        // Check if it's a foreign key constraint error
        if (dbError.code === '23503') {
          throw new Error('User profile not found. Please complete your profile first.');
        }
        
        throw dbError;
      }

      console.log('Post created successfully:', post);
      setUploadProgress(100);

      // Step 3: Update Redux store
      dispatch(addPost(post));
      
      // Step 4: Navigate to home
      setTimeout(() => {
        navigate('/');
      }, 500);
      
    } catch (error) {
      console.error('Error creating post:', error);
      
      let errorMessage = 'Failed to create post. ';
      
      if (error.message.includes('storage')) {
        errorMessage += 'Image upload failed. ';
      }
      
      if (error.code === '23502') {
        errorMessage += 'Database error: Missing required data.';
      } else if (error.code === '23503') {
        errorMessage += 'Please complete your profile first.';
      } else {
        errorMessage += error.message || 'Please try again.';
      }
      
      setUploadError(errorMessage);
    } finally {
      dispatch(setLoading(false));
      setUploadProgress(0);
    }
  };

  const removeImage = () => {
    if (preview.startsWith('blob:')) {
      URL.revokeObjectURL(preview);
    }
    setImage(null);
    setPreview('');
    setUploadError('');
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Create New Post</h1>
      
      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6">
        {uploadError && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
            <div className="flex items-start">
              <AlertCircle className="w-5 h-5 text-red-500 mr-2 mt-0.5 flex-shrink-0" />
              <div>
                <span className="text-red-700 text-sm font-medium">Error</span>
                <p className="text-red-600 text-sm mt-1">{uploadError}</p>
              </div>
            </div>
          </div>
        )}

        {uploadProgress > 0 && uploadProgress < 100 && (
          <div className="mb-4">
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm text-gray-600">Uploading...</span>
              <span className="text-sm font-medium">{uploadProgress}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-pink-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              ></div>
            </div>
          </div>
        )}

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Upload Image *
          </label>
          <div className={`mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-dashed rounded-lg transition-colors ${
            preview ? 'border-gray-300' : 'border-gray-300 hover:border-pink-500'
          }`}>
            {preview ? (
              <div className="space-y-4 w-full">
                <div className="relative">
                  <img
                    src={preview}
                    alt="Preview"
                    className="mx-auto max-h-64 object-contain rounded"
                  />
                  <button
                    type="button"
                    onClick={removeImage}
                    className="absolute top-2 right-2 bg-red-500 text-white p-1.5 rounded-full hover:bg-red-600 transition-colors"
                    title="Remove image"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-600">{image?.name}</p>
                  <p className="text-xs text-gray-500">
                    {(image?.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-2 text-center">
                <Upload className="mx-auto h-12 w-12 text-gray-400" />
                <div className="flex flex-col items-center text-sm text-gray-600">
                  <label className="relative cursor-pointer bg-white rounded-md font-medium text-pink-600 hover:text-pink-500">
                    <span>Click to upload</span>
                    <input
                      type="file"
                      className="sr-only"
                      accept="image/*"
                      onChange={handleImageChange}
                      required
                    />
                  </label>
                  <p className="text-xs text-gray-500 mt-1">
                    PNG, JPG, GIF up to 5MB
                  </p>
                </div>
              </div>
            )}
          </div>
          {!preview && (
            <p className="mt-1 text-xs text-gray-500">
              Required field
            </p>
          )}
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Caption (optional)
          </label>
          <textarea
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            rows="4"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-pink-500 focus:border-pink-500"
            placeholder="Write a caption..."
            maxLength={2200}
          />
          <div className="text-right text-sm text-gray-500 mt-1">
            {caption.length}/2200
          </div>
        </div>

        <div className="flex space-x-4">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="flex-1 py-2.5 px-4 border border-gray-300 text-gray-700 font-medium rounded-md hover:bg-gray-50 transition-colors disabled:opacity-50"
            disabled={loading}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={!image || loading}
            className="flex-1 py-2.5 px-4 bg-pink-600 text-white font-medium rounded-md hover:bg-pink-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Creating...
              </>
            ) : (
              'Share Post'
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreatePost;