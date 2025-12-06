import React, { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../services/supabase'

const AuthContext = createContext({})

export const useAuth = () => useContext(AuthContext)

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [profile, setProfile] = useState(null)

  useEffect(() => {
    // Check active sessions and sets the user
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      if (session?.user) {
        fetchProfile(session.user.id)
      }
      setLoading(false)
    })

    // Listen for changes on auth state
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      setUser(session?.user ?? null)
      if (session?.user) {
        await fetchProfile(session.user.id)
      } else {
        setProfile(null)
      }
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  const fetchProfile = async (userId) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()

      if (error) throw error
      setProfile(data)
    } catch (error) {
      console.error('Error fetching profile:', error)
    }
  }

  const signUp = async (email, password, username, fullName) => {
  try {
    console.log('Starting signup process...')
    
    // 1. Validate username uniqueness
    const { data: existingUser, error: usernameError } = await supabase
      .from('profiles')
      .select('username')
      .eq('username', username)
      .single()

    if (existingUser) {
      return { error: 'Username already taken. Please choose another.' }
    }

    // 2. Sign up with Supabase Auth
    console.log('Creating auth user...')
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          username: username,
          full_name: fullName
        }
      }
    })

    if (authError) {
      console.error('Auth error:', authError)
      return { error: authError.message }
    }

    if (!authData.user) {
      return { error: 'User creation failed. Please try again.' }
    }

    console.log('Auth user created:', authData.user.id)

    // 3. Create profile in database with retry logic
    let profileCreated = false
    let retries = 3
    
    while (!profileCreated && retries > 0) {
      try {
        const { error: profileError } = await supabase
          .from('profiles')
          .insert([
            {
              id: authData.user.id,
              username: username.toLowerCase().trim(),
              full_name: fullName.trim(),
              avatar_url: null,
              bio: null,
              website: null,
            }
          ])
          .select()

        if (profileError) {
          console.error(`Profile creation error (attempt ${4-retries}):`, profileError)
          
          // If it's a duplicate error, try with different username
          if (profileError.code === '23505' && retries > 1) {
            const newUsername = `${username}${Math.floor(Math.random() * 1000)}`
            username = newUsername
            retries--
            continue
          }
          
          throw profileError
        }

        profileCreated = true
        console.log('Profile created successfully')
        
      } catch (profileError) {
        if (retries === 1) {
          // If profile creation fails, delete the auth user
          await supabase.auth.admin.deleteUser(authData.user.id)
          return { 
            error: profileError.message || 'Failed to create profile. Please try again.' 
          }
        }
        retries--
        await new Promise(resolve => setTimeout(resolve, 1000)) // Wait 1 second
      }
    }

    // 4. Send verification email (optional)
    await supabase.auth.resend({
      type: 'signup',
      email: email
    })

    // 5. Sign in the user automatically
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (signInError) {
      console.error('Auto signin error:', signInError)
      // Don't return error here, just log it
    }

    return { error: null }

  } catch (error) {
    console.error('Signup error:', error)
    return { 
      error: error.message || 'An unexpected error occurred. Please try again.' 
    }
  }
}

  const signIn = async (email, password) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    return { error }
  }

  const signOut = async () => {
    await supabase.auth.signOut()
  }

  const updateProfile = async (updates) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id)

      if (error) throw error
      await fetchProfile(user.id)
      return { error: null }
    } catch (error) {
      return { error: error.message }
    }
  }

  const value = {
    user,
    profile,
    loading,
    signUp,
    signIn,
    signOut,
    updateProfile,
    refreshProfile: () => fetchProfile(user?.id),
  }

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  )
}