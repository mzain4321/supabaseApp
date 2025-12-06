import React, { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import LoadingSpinner, { PageLoader } from '../Common/LoadingSpinner'
import toast from 'react-hot-toast'

const AuthWrapper = ({ children, requireAuth = true, redirectTo = '/login' }) => {
  const { user, loading, profile } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (!loading) {
      if (requireAuth && !user) {
        toast.error('Please login to continue')
        navigate(redirectTo)
      } else if (!requireAuth && user) {
        // If user is logged in and this is an auth page (login/signup), redirect to home
        navigate('/')
      }
    }
  }, [user, loading, requireAuth, navigate, redirectTo])

  if (loading) {
    return <PageLoader />
  }

  // Check if profile is loaded (for authenticated routes)
  if (requireAuth && user && !profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="xl" />
          <p className="mt-4 text-gray-600 font-medium">Loading your profile...</p>
        </div>
      </div>
    )
  }

  // If requireAuth is true and no user, don't render children (redirect will happen)
  if (requireAuth && !user) {
    return null
  }

  // If requireAuth is false and user exists, don't render children (redirect will happen)
  if (!requireAuth && user) {
    return null
  }

  return children
}

// Specific wrapper components for different use cases
export const ProtectedRoute = ({ children }) => (
  <AuthWrapper requireAuth={true}>
    {children}
  </AuthWrapper>
)

export const PublicRoute = ({ children }) => (
  <AuthWrapper requireAuth={false}>
    {children}
  </AuthWrapper>
)

// Role-based wrapper
export const RoleWrapper = ({ children, requiredRole }) => {
  const { user } = useAuth()
  
  // You can implement role checking here
  // For now, it just checks if user exists
  if (!user) {
    return null
  }

  // Add role checking logic here based on your user profile
  // Example: if (user.role !== requiredRole) return null;

  return children
}

// Wrapper for pages that require complete profile
export const CompleteProfileWrapper = ({ children }) => {
  const { profile } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (profile && (!profile.username || !profile.full_name)) {
      toast('Please complete your profile to continue', {
        icon: '📝',
        duration: 4000
      })
      navigate('/profile/edit')
    }
  }, [profile, navigate])

  if (!profile || !profile.username || !profile.full_name) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-8 card">
          <div className="text-6xl mb-4">📝</div>
          <h2 className="text-2xl font-bold mb-4">Complete Your Profile</h2>
          <p className="text-gray-600 mb-6">
            Please complete your profile information to access all features.
          </p>
          <button
            onClick={() => navigate('/profile/edit')}
            className="btn-primary w-full"
          >
            Go to Profile
          </button>
        </div>
      </div>
    )
  }

  return children
}

export default AuthWrapper