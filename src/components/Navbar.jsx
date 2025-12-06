// src/components/Navbar.jsx
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar(){
  const { user, profile, signOut } = useAuth();
  const nav = useNavigate();

  return (
    <nav className="bg-white shadow-sm">
      <div className="max-w-4xl mx-auto flex items-center justify-between p-4">
        <Link to="/" className="font-bold text-xl">InstaLite</Link>

        <div className="flex items-center gap-4">
          <Link to="/">Home</Link>

          {user ? (
            <>
              <Link to="/dashboard">Dashboard</Link>

              <Link to={`/profile/${user.id}`}>
                <img
                  src={profile?.avatar_url || '/default-avatar.png'}
                  className="w-8 h-8 rounded-full object-cover border"
                />
              </Link>

              <button
                onClick={() => { signOut(); nav('/'); }}
                className="px-3 py-1 rounded bg-gray-100"
              >
                Sign out
              </button>
            </>
          ) : (
            <Link to="/login" className="px-3 py-1 rounded bg-blue-500 text-white">Login</Link>
          )}
        </div>
      </div>
    </nav>
  );
}
