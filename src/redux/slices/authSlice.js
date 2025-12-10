import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { supabase } from '../../services/supabase'

// Helper function to ensure profile exists
const ensureProfileExists = async (user) => {
  if (!user) return null
  
  try {
    // Check if profile exists
    const { data: profile, error: fetchError } = await supabase
      .from('profiles1')
      .select('*')
      .eq('id', user.id)
      .single()
    
    if (fetchError && fetchError.code === 'PGRST116') {
      // Profile doesn't exist, create one
      const username = user.user_metadata?.username || 
                      user.email?.split('@')[0] || 
                      'user' + Math.random().toString(36).substring(7);
      
      const fullName = user.user_metadata?.full_name || 
                      user.user_metadata?.username || 
                      user.email?.split('@')[0] || 
                      'User';
      
      const { data: newProfile, error: createError } = await supabase
        .from('profiles1')
        .insert({
          id: user.id,
          username: username,
          full_name: fullName,
          avatar_url: user.user_metadata?.avatar_url || 'https://i.pravatar.cc/300',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single()
      
      if (createError) {
        console.error('Error creating profile:', createError)
        return null
      }
      
      return newProfile
    }
    
    return profile
  } catch (error) {
    console.error('Error ensuring profile exists:', error)
    return null
  }
}

export const signUp = createAsyncThunk(
  'auth/signUp',
  async ({ email, password, username, fullName }, { rejectWithValue }) => {
    try {
      // Sign up the user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            username: username,
            full_name: fullName || username
          }
        }
      })
      
      if (authError) {
        console.error('Auth error:', authError)
        throw authError
      }
      
      // Create profile manually (in case trigger fails)
      if (authData.user) {
        await ensureProfileExists(authData.user)
      }
      
      return authData
    } catch (error) {
      console.error('Signup error:', error)
      return rejectWithValue(error.message || 'Failed to sign up')
    }
  }
)

export const signIn = createAsyncThunk(
  'auth/signIn',
  async ({ email, password }, { rejectWithValue }) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      })
      
      if (error) {
        console.error('Signin error:', error)
        throw error
      }
      
      // Ensure profile exists
      if (data.user) {
        await ensureProfileExists(data.user)
      }
      
      return data
    } catch (error) {
      console.error('Signin error:', error)
      return rejectWithValue(error.message || 'Failed to sign in')
    }
  }
)

export const signOut = createAsyncThunk(
  'auth/signOut',
  async (_, { rejectWithValue }) => {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: null,
    session: null,
    loading: false,
    error: null,
    profile: null
  },
  reducers: {
    setUser: (state, action) => {
      state.user = action.payload
    },
    setSession: (state, action) => {
      state.session = action.payload
    },
    setProfile: (state, action) => {
      state.profile = action.payload
    },
    clearError: (state) => {
      state.error = null
    },
    clearAuth: (state) => {
      state.user = null
      state.session = null
      state.profile = null
      state.error = null
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(signUp.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(signUp.fulfilled, (state, action) => {
        state.loading = false
        state.user = action.payload.user
        state.session = action.payload.session
      })
      .addCase(signUp.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      .addCase(signIn.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(signIn.fulfilled, (state, action) => {
        state.loading = false
        state.user = action.payload.user
        state.session = action.payload.session
      })
      .addCase(signIn.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      .addCase(signOut.fulfilled, (state) => {
        state.user = null
        state.session = null
        state.profile = null
      })
  }
})

export const { setUser, setSession, setProfile, clearError, clearAuth } = authSlice.actions
export default authSlice.reducer