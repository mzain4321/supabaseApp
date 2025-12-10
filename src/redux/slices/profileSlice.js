import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { supabase } from '../../services/supabase'

export const fetchProfile = createAsyncThunk(
  'profile/fetchProfile',
  async (userId, { rejectWithValue }) => {
    try {
      if (!userId) {
        throw new Error('User ID is required')
      }
      
      const { data, error } = await supabase
        .from('profiles1')
        .select('*')
        .eq('id', userId)
        .single()

      if (error) {
        console.error('Error fetching profile:', error)
        throw error
      }
      
      if (!data) {
        throw new Error('Profile not found')
      }
      
      return data
    } catch (error) {
      console.error('Fetch profile error:', error)
      return rejectWithValue(error.message || 'Failed to fetch profile')
    }
  }
)

export const fetchProfileByUsername = createAsyncThunk(
  'profile/fetchProfileByUsername',
  async (username, { rejectWithValue }) => {
    try {
      if (!username || username === 'undefined') {
        throw new Error('Valid username is required')
      }
      
      const { data, error } = await supabase
        .from('profiles1')
        .select('*')
        .eq('username', username)
        .single()

      if (error) {
        console.error('Error fetching profile by username:', error)
        throw error
      }
      
      if (!data) {
        throw new Error('Profile not found')
      }
      
      return data
    } catch (error) {
      console.error('Fetch profile by username error:', error)
      return rejectWithValue(error.message || 'Failed to fetch profile')
    }
  }
)

export const updateProfile = createAsyncThunk(
  'profile/updateProfile',
  async (profileData, { rejectWithValue }) => {
    try {
      if (!profileData.id) {
        throw new Error('Profile ID is required')
      }
      
      const { data, error } = await supabase
        .from('profiles1')
        .update({
          username: profileData.username,
          full_name: profileData.full_name,
          avatar_url: profileData.avatar_url,
          bio: profileData.bio,
          website: profileData.website,
          updated_at: new Date().toISOString()
        })
        .eq('id', profileData.id)
        .select()
        .single()

      if (error) throw error
      return data
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

export const fetchUserPosts = createAsyncThunk(
  'profile/fetchUserPosts',
  async (userId, { rejectWithValue }) => {
    try {
      if (!userId) {
        throw new Error('User ID is required')
      }
      
      const { data, error } = await supabase
        .from('posts1')
        .select(`
          *,
          profiles1:user_id(*),
          likes1:likes1(count),
          comments1:comments1(count)
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

      if (error) throw error
      
      // Transform data to include counts
      const transformedData = data.map(post => ({
        ...post,
        likes_count: post.likes1?.[0]?.count || 0,
        comments_count: post.comments1?.[0]?.count || 0
      }))
      
      return transformedData
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

const profileSlice = createSlice({
  name: 'profile',
  initialState: {
    profile: null,
    userPosts: [],
    loading: false,
    error: null
  },
  reducers: {
    clearProfile: (state) => {
      state.profile = null
      state.userPosts = []
      state.error = null
    },
    setProfile: (state, action) => {
      state.profile = action.payload
    },
    clearError: (state) => {
      state.error = null
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProfile.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchProfile.fulfilled, (state, action) => {
        state.loading = false
        state.profile = action.payload
      })
      .addCase(fetchProfile.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      .addCase(fetchProfileByUsername.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchProfileByUsername.fulfilled, (state, action) => {
        state.loading = false
        state.profile = action.payload
      })
      .addCase(fetchProfileByUsername.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.profile = action.payload
      })
      .addCase(fetchUserPosts.fulfilled, (state, action) => {
        state.userPosts = action.payload
      })
      .addCase(fetchUserPosts.rejected, (state, action) => {
        state.error = action.payload
      })
  }
})

export const { clearProfile, setProfile, clearError } = profileSlice.actions
export default profileSlice.reducer