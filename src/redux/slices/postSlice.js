import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { supabase } from '../../services/supabase'

// Async thunks
export const fetchPosts = createAsyncThunk(
  'posts/fetchPosts',
  async (_, { rejectWithValue }) => {
    let timerName = `fetchPosts_${Date.now()}`
    
    try {
      console.time(timerName)
      console.log('🔵 fetchPosts: Starting optimized fetch...')
      
      // Get current user
      const { data: { user } } = await supabase.auth.getUser()
      const userId = user?.id
      
      // SINGLE QUERY: Get posts with all related data
      const { data: posts, error: postsError } = await supabase
        .from('posts1')
        .select(`
          *,
          profiles1:user_id (
            id,
            username,
            full_name,
            avatar_url
          ),
          likes1 (
            id,
            user_id
          ),
          comments1 (
            id,
            user_id,
            content,
            created_at,
            profiles1:user_id (
              username,
              avatar_url
            )
          )
        `)
        .order('created_at', { ascending: false })
        .limit(15)

      if (postsError) {
        console.error('❌ fetchPosts: Error:', postsError)
        throw postsError
      }

      console.log('🔵 fetchPosts: Found', posts?.length || 0, 'posts')

      if (!posts || posts.length === 0) {
        console.timeEnd(timerName)
        return []
      }

      // Process all posts efficiently
      const postsWithDetails = posts.map((post) => {
        // Calculate counts from the already fetched data
        const likesCount = post.likes1?.length || 0
        const commentsCount = post.comments1?.length || 0
        
        // Check if current user liked this post
        const isLiked = userId ? post.likes1?.some(like => like.user_id === userId) : false
        
        // Get recent comments (latest 2)
        const recentComments = post.comments1
          ?.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
          .slice(0, 2) || []

        // Ensure profile data
        const profileData = post.profiles1 || {
          id: post.user_id,
          username: 'user_' + post.user_id.substring(0, 8),
          full_name: 'User',
          avatar_url: 'https://i.pravatar.cc/300'
        }

        return {
          id: post.id,
          user_id: post.user_id,
          image_url: post.image_url,
          caption: post.caption,
          created_at: post.created_at,
          updated_at: post.updated_at,
          profiles1: profileData,
          likes_count: likesCount,
          comments_count: commentsCount,
          is_liked: isLiked,
          recent_comments: recentComments
        }
      })

      console.timeEnd(timerName)
      console.log('✅ fetchPosts: Processed', postsWithDetails.length, 'posts in single query')
      return postsWithDetails
    } catch (error) {
      console.timeEnd(timerName)
      console.error('❌ fetchPosts: Error:', error)
      return rejectWithValue(error.message)
    }
  }
)

export const createPost = createAsyncThunk(
  'posts/createPost',
  async (postData, { rejectWithValue }) => {
    try {
      console.log('🔵 createPost: Creating new post...', postData)
      
      const { data, error } = await supabase
        .from('posts1')
        .insert([{
          user_id: postData.user_id,
          image_url: postData.image_url,
          caption: postData.caption
        }])
        .select(`
          *,
          profiles1:user_id (
            id,
            username,
            full_name,
            avatar_url
          )
        `)
        .single()

      if (error) {
        console.error('❌ createPost: Error:', error)
        throw error
      }

      console.log('✅ createPost: Post created successfully:', data)
      
      // Add default counts for new post
      const newPost = {
        ...data,
        profiles1: data.profiles1 || {
          id: data.user_id,
          username: 'user_' + data.user_id.substring(0, 8),
          full_name: 'User',
          avatar_url: 'https://i.pravatar.cc/300'
        },
        likes_count: 0,
        comments_count: 0,
        is_liked: false,
        recent_comments: []
      }
      
      return newPost
    } catch (error) {
      console.error('❌ createPost: Error:', error)
      return rejectWithValue(error.message)
    }
  }
)

export const likePost = createAsyncThunk(
  'posts/likePost',
  async (postId, { rejectWithValue }) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('User not authenticated')

      console.log('🔵 likePost: Toggling like for post', postId, 'by user', user.id)

      // Check if already liked
      const { data: existingLike } = await supabase
        .from('likes1')
        .select('*')
        .eq('post_id', postId)
        .eq('user_id', user.id)
        .single()

      if (existingLike) {
        // Unlike
        await supabase
          .from('likes1')
          .delete()
          .eq('post_id', postId)
          .eq('user_id', user.id)
        
        console.log('✅ likePost: Unliked post', postId)
        return { postId, action: 'unliked' }
      } else {
        // Like
        await supabase
          .from('likes1')
          .insert({ post_id: postId, user_id: user.id })
        
        console.log('✅ likePost: Liked post', postId)
        return { postId, action: 'liked' }
      }
    } catch (error) {
      console.error('❌ likePost: Error:', error)
      return rejectWithValue(error.message)
    }
  }
)

export const addComment = createAsyncThunk(
  'posts/addComment',
  async ({ postId, content }, { rejectWithValue }) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('User not authenticated')

      console.log('🔵 addComment: Adding comment to post', postId)

      const { data, error } = await supabase
        .from('comments1')
        .insert({
          post_id: postId,
          user_id: user.id,
          content
        })
        .select(`
          *,
          profiles1:user_id (
            username,
            avatar_url
          )
        `)
        .single()

      if (error) throw error
      
      console.log('✅ addComment: Comment added successfully')
      return { postId, comment: data }
    } catch (error) {
      console.error('❌ addComment: Error:', error)
      return rejectWithValue(error.message)
    }
  }
)

export const deletePost = createAsyncThunk(
  'posts/deletePost',
  async (postId, { rejectWithValue }) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('User not authenticated')

      console.log('🔵 deletePost: Deleting post', postId)

      // First, delete related data (likes and comments)
      await supabase
        .from('likes1')
        .delete()
        .eq('post_id', postId)

      await supabase
        .from('comments1')
        .delete()
        .eq('post_id', postId)

      // Then delete the post
      const { error } = await supabase
        .from('posts1')
        .delete()
        .eq('id', postId)

      if (error) throw error

      console.log('✅ deletePost: Post deleted successfully')
      return postId
    } catch (error) {
      console.error('❌ deletePost: Error:', error)
      return rejectWithValue(error.message)
    }
  }
)

const postSlice = createSlice({
  name: 'posts',
  initialState: {
    posts: [],
    loading: false,
    error: null,
    lastUpdated: null
  },
  reducers: {
    clearPosts: (state) => {
      state.posts = []
    state.loading = false
    state.error = null
    },
    setError: (state, action) => {
      state.error = action.payload
    },
    addNewPost: (state, action) => {
      state.posts.unshift(action.payload)
    },
    updatePostLikes: (state, action) => {
      const { postId, likes, isLiked } = action.payload
      const postIndex = state.posts.findIndex(post => post.id === postId)
      if (postIndex !== -1) {
        state.posts[postIndex].likes_count = likes
        state.posts[postIndex].is_liked = isLiked
      }
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch Posts
      .addCase(fetchPosts.pending, (state) => {
        console.log('🟡 postSlice: fetchPosts pending')
        state.loading = true
        state.error = null
      })
      .addCase(fetchPosts.fulfilled, (state, action) => {
        console.log('🟢 postSlice: fetchPosts fulfilled with', action.payload?.length || 0, 'posts')
        state.loading = false
        state.posts = action.payload || []
        state.lastUpdated = new Date().toISOString()
      })
      .addCase(fetchPosts.rejected, (state, action) => {
        console.log('🔴 postSlice: fetchPosts rejected:', action.payload)
        state.loading = false
        state.error = action.payload
      })
      
      // Create Post
      .addCase(createPost.pending, (state) => {
        console.log('🟡 postSlice: createPost pending')
        state.loading = true
      })
      .addCase(createPost.fulfilled, (state, action) => {
        console.log('🟢 postSlice: createPost fulfilled')
        state.loading = false
        state.posts.unshift(action.payload)
      })
      .addCase(createPost.rejected, (state, action) => {
        console.log('🔴 postSlice: createPost rejected:', action.payload)
        state.loading = false
        state.error = action.payload
      })
      
      // Like Post
      .addCase(likePost.fulfilled, (state, action) => {
        const { postId, action: likeAction } = action.payload
        const postIndex = state.posts.findIndex(post => post.id === postId)
        
        if (postIndex !== -1) {
          const post = state.posts[postIndex]
          post.is_liked = likeAction === 'liked'
          post.likes_count = likeAction === 'liked' 
            ? (post.likes_count || 0) + 1 
            : Math.max(0, (post.likes_count || 1) - 1)
        }
      })
      
      // Add Comment
      .addCase(addComment.fulfilled, (state, action) => {
        const { postId, comment } = action.payload
        const postIndex = state.posts.findIndex(post => post.id === postId)
        
        if (postIndex !== -1) {
          const post = state.posts[postIndex]
          if (!post.recent_comments) post.recent_comments = []
          post.recent_comments.unshift(comment)
          post.comments_count = (post.comments_count || 0) + 1
        }
      })
      
      // Delete Post
      .addCase(deletePost.fulfilled, (state, action) => {
        const postId = action.payload
        state.posts = state.posts.filter(post => post.id !== postId)
      })
  }
})

// Export actions
export const { clearPosts, setError, addNewPost, updatePostLikes } = postSlice.actions

// Export reducer
export default postSlice.reducer