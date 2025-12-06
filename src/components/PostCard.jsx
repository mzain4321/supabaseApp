// src/components/PostCard.jsx
import React, { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';

export default function PostCard({ post, onRefresh }) {
  const { user } = useAuth();
  const [owner, setOwner] = useState(null);
  const [likesCount, setLikesCount] = useState(0);
  const [liked, setLiked] = useState(false);

  useEffect(() => {
    const load = async () => {
      // load owner profile
      const { data: p } = await supabase.from('profiles').select('*').eq('id', post.user_id).single();
      setOwner(p);

      // load likes count and whether current user liked
      const { count } = await supabase.from('likes').select('*', { count: 'exact', head: true }).eq('post_id', post.id);
      setLikesCount(count || 0);

      if (user) {
        const { data: ld } = await supabase.from('likes').select('*').eq('post_id', post.id).eq('user_id', user.id).single();
        setLiked(!!ld);
      }
    };
    load();
  }, [post, user, onRefresh]);

  const toggleLike = async () => {
    if (!user) return alert('Login to like');
    if (liked) {
      await supabase.from('likes').delete().eq('post_id', post.id).eq('user_id', user.id);
      setLiked(false);
      setLikesCount(c => c - 1);
    } else {
      await supabase.from('likes').insert({ post_id: post.id, user_id: user.id });
      setLiked(true);
      setLikesCount(c => c + 1);
    }
    onRefresh && onRefresh();
  };

  return (
    <div className="bg-white rounded shadow overflow-hidden">
      <div className="p-3 flex items-center gap-3">
        <img src={owner?.avatar_url || '/default-avatar.png'} className="w-10 h-10 rounded-full object-cover" />
        <div>
          <Link to={`/profile/${owner?.id}`} className="font-semibold hover:underline">{owner?.username || 'Unknown'}</Link>
          <div className="text-xs text-gray-500">{new Date(post.created_at).toLocaleString()}</div>
        </div>
      </div>

      {post.image_url && <img src={post.image_url} className="w-full object-cover max-h-[520px]" />}

      <div className="p-3">
        <div className="flex items-center gap-3">
          <button onClick={toggleLike} className="px-2 py-1 rounded bg-gray-100">
            {liked ? '❤️' : '🤍'} {likesCount}
          </button>
        </div>

        <div className="mt-2 text-sm">
          <span className="font-semibold mr-2">{owner?.username}</span>
          {post.description}
        </div>
      </div>
    </div>
  );
}
