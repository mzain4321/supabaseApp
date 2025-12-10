import React from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../store/slices/authSlice';
import { supabase } from '../lib/supabase';
import { Home, PlusSquare, User, LogOut } from 'lucide-react';

const Layout = () => {
  const { user, isAuthenticated } = useSelector(state => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    dispatch(logout());
    navigate('/login');
  };

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex justify-between items-center h-16">
            <Link to="/" className="text-2xl font-bold text-pink-600">
              SocialAPP
            </Link>
            
            <div className="flex items-center space-x-4">
              <Link to="/" className="p-2 hover:bg-gray-100 rounded">
                <Home className="w-6 h-6" />
              </Link>
              <Link to="/create" className="p-2 hover:bg-gray-100 rounded">
                <PlusSquare className="w-6 h-6" />
              </Link>
              <Link to={`/profile/${user?.id}`} className="p-2 hover:bg-gray-100 rounded">
                <User className="w-6 h-6" />
              </Link>
              <button 
                onClick={handleLogout}
                className="p-2 hover:bg-gray-100 rounded"
              >
                <LogOut className="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>
      </nav>
      
      <main className="max-w-6xl mx-auto px-4 py-8">
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;