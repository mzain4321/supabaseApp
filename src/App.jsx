// import {
//   BrowserRouter as Router,
//   Routes,
//   Route,
//   Navigate,
// } from "react-router-dom";
// import './App.css'
// import Login from "./components/Auth/Login.jsx";

// import Signup from "./components/Auth/Signup.jsx";
// import { Userdashboard } from "./pages/dashboard/Userdashboard.jsx";
// import Profile from "./components/Profile/Profile.jsx";
// import { Home } from "./pages/Home/Home.jsx";
// import { AuthProvider } from './context/AuthContext.jsx';
// // import { CRUD } from './pages/crud.jsx'
// // import { AuthPage } from './pages/auth/AuthPage';
// // import { Userdashboard } from "./pages/dashboard/Userdashboard.jsx";
// // import { Profile } from "./pages/profile/Profile.jsx";
// // import { SignUp } from "./pages/auth/Signup.jsx";
// // import { Login } from "./pages/auth/Login.jsx";
//  import Navbar from "./components/Layout/Navbar.jsx";
// import PrivateRoute from './components/Common/PrivateRoute';
// import DebugInfo from "./components/Debud/debuginfo.jsx";
// function AppContent() {
//   return (
//     <Router>
//        <DebugInfo />
//       < Navbar/>
//       <Routes>
//         <Route path="/" element={<Home />} />
//         <Route path="/login" element={< Login/>} />
//         <Route path="/signup" element={<Signup />} />
//         <Route 
//           path="/dashboard" 
//           element={
//             <PrivateRoute>
//               <Userdashboard />
//             </PrivateRoute>
//           } 
//         />
//         <Route 
//           path="/profile/:userId" 
//           element={
//             <PrivateRoute>
//               <Profile />
//             </PrivateRoute>
//           } 
//         />
//         <Route path="*" element={<Navigate to="/" />} />
//       </Routes>
//     </Router>
//   );
// }

// function App() {

//   return (
//     // <>
//     // <Router>
//     //   <Routes>
//     //    <Route path="/" element={<Login />} />
//     //    <Route path="/dashboard" element={<Userdashboard />} />
//     //     <Route path="/crud" element={<CRUD />} />
//     //       <Route path="/profile" element={<Profile />} />
//     //       <Route path="/signup" element={<SignUp />} />
//     //  </Routes>
//     //  </Router>
//     //   {/* <CRUD /> */}
//     // </>
//      <AuthProvider>
//       <AppContent />
//     </AuthProvider>
//   )
// }

// export default App
// src/App.jsx
// import React from 'react'
// import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
// import { AuthProvider } from './context/AuthContext'
// import Login from './components/Auth/Login'
// import Signup from './components/Auth/Signup'
// import Dashboard from './components/Dashboard/Dashboard'
// import Profile from './components/Profile/Profile'
// import ProtectedRoute from './components/Common/ProtectedRoute'
// import { Toaster } from 'react-hot-toast'
// import { CRUD } from './pages/crud'

// function App() {
//   return (
//     <AuthProvider>
//       <Router>
//         <Toaster position="top-right" />
//         <Routes>
//           <Route path="/login" element={<Login />} />
//           <Route path="/signup" element={<Signup />} />

//           <Route
//             path="/"
//             element={
//               <ProtectedRoute>
//                 <Dashboard />
//               </ProtectedRoute>
//             }
//           />

//           <Route
//             path="/profile"
//             element={
//               <ProtectedRoute>
//                 <Profile />
//               </ProtectedRoute>
//             }
//           />

//           <Route
//             path="/profile/:username"
//             element={
//               <ProtectedRoute>
//                 <Profile />
//               </ProtectedRoute>
//             }
//           />

//           <Route path="*" element={<Navigate to="/" />} />
//           <Route path="/crud" element={<CRUD />} />
//         </Routes>
//       </Router>
//     </AuthProvider>
//   )
// }

// export default App
import React, { useEffect, useState } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { supabase } from './services/supabase'
import { setUser, setSession, setProfile } from './redux/slices/authSlice'
import { fetchProfile } from './redux/slices/profileSlice'
import Navbar from './components/Layout1/Navbar'
import Home from './pages/Home1'
import Feed from './pages/Feed'
import Profile from './pages/Profile1'
import Signup from './components/Auth1/Signup'
import Login from './components/Auth1/Login'
import LoadingSpinner from './components/Common/LoadingSpinner'

function App() {
  const dispatch = useDispatch()
  const { user } = useSelector((state) => state.auth)
  const [loading, setLoading] = useState(true)

  // -------------------------------
  // CREATE PROFILE IF NOT EXISTS
  // -------------------------------
  const createProfileForUser = async (userData) => {
    try {
      const username =
        userData.user_metadata?.username ||
        userData.email?.split('@')[0] ||
        'user' + Math.random().toString(36).substring(2, 8)

      const fullName =
        userData.user_metadata?.full_name ||
        userData.user_metadata?.username ||
        userData.email?.split('@')[0] ||
        'User'

      const { data, error } = await supabase
        .from('profiles1')
        .insert({
          id: userData.id,
          username: username,
          full_name: fullName,
          avatar_url: 'https://i.pravatar.cc/300',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select()
        .single()

      if (error) {
        console.error('Error creating profile:', error)
        return null
      }

      return data
    } catch (error) {
      console.error('Error in createProfileForUser:', error)
      return null
    }
  }

  // -------------------------------
  // SESSION CHECK (RUNS ONCE)
  // -------------------------------
  useEffect(() => {
    const checkSession = async () => {
      try {
        const { data: { session: currentSession } } = await supabase.auth.getSession()

        if (currentSession?.user) {
          // Set session + user
          dispatch(setSession(currentSession))
          dispatch(setUser(currentSession.user))

          // Always refresh profile when app mounts
          let profileResult = await dispatch(fetchProfile(currentSession.user.id))

          if (!profileResult.payload) {
            // Create profile if missing
            await createProfileForUser(currentSession.user)
            profileResult = await dispatch(fetchProfile(currentSession.user.id))
          }

          if (profileResult.payload) {
            dispatch(setProfile(profileResult.payload))
          }
        }
      } catch (err) {
        console.error('Session restore error:', err)
      } finally {
        setLoading(false)
      }
    }

    checkSession()

    // -------------------------------
    // AUTH STATE CHANGE LISTENER
    // -------------------------------
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth changed:', event)

        if (session?.user) {
          dispatch(setSession(session))
          dispatch(setUser(session.user))

          // Try fetching profile
          let profileResult = await dispatch(fetchProfile(session.user.id))
          if (!profileResult.payload) {
            await createProfileForUser(session.user)
            profileResult = await dispatch(fetchProfile(session.user.id))
          }

          if (profileResult.payload) {
            dispatch(setProfile(profileResult.payload))
          }
        } else {
          dispatch(setSession(null))
          dispatch(setUser(null))
          dispatch(setProfile(null))
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [dispatch])

  // -------------------------------
  // REFRESH PROFILE ON TAB FOCUS
  // -------------------------------
  useEffect(() => {
    const handleFocus = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (session?.user) {
        const result = await dispatch(fetchProfile(session.user.id))
        if (result.payload) {
          dispatch(setProfile(result.payload))
        }
      }
    }

    window.addEventListener('focus', handleFocus)
    return () => window.removeEventListener('focus', handleFocus)
  }, [dispatch])

  // -------------------------------
  // LOADING SCREEN
  // -------------------------------
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="large" />
      </div>
    )
  }

  // -------------------------------
  // ROUTES
  // -------------------------------
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        {user && <Navbar />}
        <Routes>
          <Route path="/" element={user ? <Feed /> : <Home />} />
          <Route path="/login" element={!user ? <Login /> : <Navigate to="/" />} />
          <Route path="/signup" element={!user ? <Signup /> : <Navigate to="/" />} />
          <Route path="/profile/:username?" element={<ProfileWrapper />} />
          <Route path="/explore" element={user ? <div>Explore</div> : <Navigate to="/login" />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </div>
    </Router>
  )
}

const ProfileWrapper = () => {
  const { user } = useSelector((state) => state.auth)
  if (!user) return <Navigate to="/login" />
  return <Profile />
}

export default App
