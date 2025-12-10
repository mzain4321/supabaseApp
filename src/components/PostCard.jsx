import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Heart, MessageCircle, Send, Bookmark } from 'lucide-react';
import { format } from 'date-fns';

const PostCard = ({ post }) => {
  const { user } = useSelector(state => state.auth);
  const [isLiked, setIsLiked] = useState(
    post.like1?.some(like => like.user_id === user?.id)
  );
  const [likesCount, setLikesCount] = useState(post.like1?.length || 0);
  const [comment, setComment] = useState('');
  const [comments, setComments] = useState(post.comments1 || []);

  const handleLike = async () => {
    if (!user) return;

    try {
      if (isLiked) {
        await supabase
          .from('like1')
          .delete()
          .eq('user_id', user.id)
          .eq('post_id', post.id);
        setLikesCount(prev => prev - 1);
      } else {
        await supabase
          .from('like1')
          .insert([{ user_id: user.id, post_id: post.id }]);
        setLikesCount(prev => prev + 1);
      }
      setIsLiked(!isLiked);
    } catch (error) {
      console.error('Error toggling like:', error);
    }
  };

  const handleComment = async (e) => {
    e.preventDefault();
    if (!comment.trim() || !user) return;

    try {
      const { data, error } = await supabase
        .from('comments1')
        .insert([{
          user_id: user.id,
          post_id: post.id,
          content: comment.trim()
        }])
        .select(`
          *,
          profiles1!user_id (*)
        `)
        .single();

      if (error) throw error;
      
      setComments([...comments, data]);
      setComment('');
    } catch (error) {
      console.error('Error adding comment:', error);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md border">
      {/* Post Header */}
      <div className="flex items-center p-4">
        <img
          src={post.profiles1?.avatar_url || '/default-avatar.png'}
          alt={post.profiles1?.username}
          className="w-10 h-10 rounded-full object-cover"
        />
        <div className="ml-3">
          <Link 
            to={`/profile/${post.user_id}`}
            className="font-semibold hover:underline"
          >
            {post.profiles1?.username}
          </Link>
          <p className="text-sm text-gray-500">
            {format(new Date(post.created_at), 'MMM d, yyyy')}
          </p>
        </div>
      </div>

      {/* Post Image */}
      <img
        src={post.image_url}
        alt={post.caption}
        className="w-full h-auto max-h-[600px] object-cover"
      />

      {/* Post Actions */}
      <div className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-4">
            <button
              onClick={handleLike}
              className={`p-1 ${isLiked ? 'text-red-500' : 'text-gray-700'}`}
            >
              <Heart className={`w-7 h-7 ${isLiked ? 'fill-current' : ''}`} />
            </button>
            <button className="p-1 text-gray-700">
              <MessageCircle className="w-7 h-7" />
            </button>
            <button className="p-1 text-gray-700">
              <Send className="w-7 h-7" />
            </button>
          </div>
          <button className="p-1 text-gray-700">
            <Bookmark className="w-7 h-7" />
          </button>
        </div>

        {/* Likes Count */}
        <p className="font-semibold mb-2">{likesCount} likes</p>

        {/* Caption */}
        <div className="mb-3">
          <span className="font-semibold mr-2">{post.profiles1?.username}</span>
          <span>{post.caption}</span>
        </div>

        {/* Comments */}
        <div className="space-y-2 mb-3">
          {comments.slice(0, 3).map(comment => (
            <div key={comment.id} className="flex items-start">
              <span className="font-semibold mr-2">{comment.profiles1?.username}</span>
              <span>{comment.content}</span>
            </div>
          ))}
          {comments.length > 3 && (
            <Link 
              to={`/post/${post.id}`}
              className="text-gray-500 text-sm"
            >
              View all {comments.length} comments
            </Link>
          )}
        </div>

        {/* Add Comment */}
        <form onSubmit={handleComment} className="border-t pt-3">
          <div className="flex items-center">
            <input
              type="text"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Add a comment..."
              className="flex-1 border-none focus:ring-0 focus:outline-none"
            />
            <button
              type="submit"
              disabled={!comment.trim()}
              className={`font-semibold ${comment.trim() ? 'text-blue-500' : 'text-blue-300'}`}
            >
              Post
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PostCard;