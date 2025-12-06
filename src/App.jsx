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
import React from 'react';

import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import Login from './components/Auth/Login'
import Signup from './components/Auth/Signup'
import Dashboard from './components/Dashboard/Dashboard'
import Profile from './components/Profile/Profile'
import ProtectedRoute from './components/Common/ProtectedRoute'
import { Toaster } from 'react-hot-toast'

function App() {
  return (
    <Router>
      <AuthProvider>
        <Toaster position="top-right" />
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/" element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } />
          <Route path="/profile" element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          } />
          <Route path="/profile/:username" element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          } />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </AuthProvider>
    </Router>
  )
}

export default App