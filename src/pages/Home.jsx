import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { setFeedPosts, setLoading } from '../store/slices/postSlice';
import { supabase } from '../lib/supabase';
import PostCard from '../components/PostCard';

const Home = () => {
  const { feedPosts, loading } = useSelector(state => state.posts);
  const { user } = useSelector(state => state.auth);
  const dispatch = useDispatch();

  useEffect(() => {
    fetchFeedPosts();
  }, [user]);

  const fetchFeedPosts = async () => {
    if (!user) return;
    
    dispatch(setLoading(true));
    try {
      const { data: posts, error } = await supabase
        .from('posts1')
        .select(`
          *,
          profiles1!user_id (*),
          like1 (user_id),
          comments1 (*, profiles1!user_id (*))
        `)
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;
      
      dispatch(setFeedPosts(posts || []));
    } catch (error) {
      console.error('Error fetching posts:', error);
    } finally {
      dispatch(setLoading(false));
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="space-y-8">
        {feedPosts.map(post => (
          <PostCard key={post.id} post={post} />
        ))}
      </div>
      
      {feedPosts.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">No posts yet. Follow some users or create your first post!</p>
        </div>
      )}
    </div>
  );
};

export default Home;