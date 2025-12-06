// src/components/Feed.jsx
import React, { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import PostCard from './PostCard';

export default function Feed(){
  const [posts, setPosts] = useState([]);

  const fetchPosts = async () => {
    const { data } = await supabase
      .from('posts')
      .select('*')
      .order('created_at', { ascending: false });
    setPosts(data || []);
  };

  useEffect(()=> { fetchPosts(); }, []);

  return (
    <div className="space-y-4">
      {posts.map(p => <PostCard key={p.id} post={p} onRefresh={fetchPosts} />)}
    </div>
  );
}
