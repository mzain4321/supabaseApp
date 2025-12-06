// src/pages/Dashboard.jsx
import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import NewPost from '../components/NewPost';
import { supabase } from '../supabaseClient';
import PostCard from '../components/PostCard';
import { Link } from 'react-router-dom';

export default function Dashboard(){
  const { user, profile } = useAuth();
  const [myPosts, setMyPosts] = useState([]);

  const fetchMyPosts = async () => {
    if(!user) return;
    const { data } = await supabase
      .from('posts')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });
    setMyPosts(data || []);
  };

  useEffect(()=> { fetchMyPosts(); }, [user]);

  return (
    <div className="space-y-6">
      <div className="bg-white p-4 rounded shadow flex items-center gap-4">
        <img src={profile?.avatar_url || '/default-avatar.png'} className="w-16 h-16 rounded-full object-cover" />
        <div>
          <Link to={`/profile/${user?.id}`} className="font-semibold hover:underline">{profile?.username || 'You'}</Link>
          <div className="text-sm text-gray-600">{profile?.full_name}</div>
        </div>
      </div>

      <NewPost onCreated={fetchMyPosts} />

      <div>
        <h3 className="text-lg font-semibold mb-2">Your posts</h3>
        <div className="space-y-4">
          {myPosts.map(p => <PostCard key={p.id} post={p} onRefresh={fetchMyPosts} />)}
        </div>
      </div>
    </div>
  );
}
