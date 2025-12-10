import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import {
  fetchProfile,
  fetchUserPosts,
  fetchFollowStats,
  checkIfFollowing,
  followUser,
  clearProfile,
  clearError
} from '../store/slices/profileSlice';
import { Settings, Grid, Bookmark, Heart, MessageCircle } from 'lucide-react';
import Avatar from '../components/Common/Avatar'; // Import Avatar component

const Profile = () => {
  const { userId: paramUserId } = useParams();
  const { user: currentUser } = useSelector(state => state.auth);
  const {
    currentProfile,
    userPosts,
    followStats,
    isFollowing,
    loading: profileLoading,
    error
  } = useSelector(state => state.profile);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  const [isLoading, setIsLoading] = useState(true);
  const [postsLoading, setPostsLoading] = useState(true);

  const userId = paramUserId || currentUser?.id;

  useEffect(() => {
    if (userId) {
      loadProfileData();
    }

    return () => {
      dispatch(clearProfile());
    };
  }, [userId]);

  useEffect(() => {
    // Update loading state based on Redux loading
    if (profileLoading) {
      setIsLoading(true);
    } else {
      // Small delay to prevent flickering
      const timer = setTimeout(() => setIsLoading(false), 100);
      return () => clearTimeout(timer);
    }
  }, [profileLoading]);

  useEffect(() => {
    if (error) {
      console.error('Profile error:', error);
      dispatch(clearError());
    }
  }, [error]);

  const loadProfileData = async () => {
    if (!userId) return;

    try {
      setIsLoading(true);
      setPostsLoading(true);
      
      await Promise.all([
        dispatch(fetchProfile(userId)),
        dispatch(fetchUserPosts(userId)),
        dispatch(fetchFollowStats(userId)),
      ]);

      if (currentUser && currentUser.id !== userId) {
        await dispatch(checkIfFollowing(userId));
      }
      
    } catch (error) {
      console.error('Error loading profile data:', error);
    } finally {
      setPostsLoading(false);
    }
  };

  const handleFollow = async () => {
    if (!currentUser) {
      navigate('/login');
      return;
    }

    try {
      await dispatch(followUser({
        userId,
        follow: !isFollowing
      })).unwrap();
    } catch (error) {
      console.error('Error toggling follow:', error);
    }
  };

  const handleRefresh = () => {
    loadProfileData();
  };

  // Show full page loading skeleton
  if (isLoading && !currentProfile) {
    return (
      <div className="max-w-4xl mx-auto p-4">
        {/* Profile Header Skeleton */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8 animate-pulse">
          <div className="flex items-center space-x-8">
            <div className="relative">
              <div className="w-32 h-32 rounded-full bg-gray-300"></div>
            </div>
            
            <div className="flex-1 space-y-4">
              <div className="flex items-center space-x-4">
                <div className="h-8 w-48 bg-gray-300 rounded"></div>
                <div className="h-8 w-24 bg-gray-300 rounded"></div>
                <div className="h-8 w-24 bg-gray-300 rounded"></div>
              </div>
              
              <div className="flex space-x-8 mb-4">
                <div className="text-center">
                  <div className="h-6 w-12 bg-gray-300 rounded mx-auto mb-1"></div>
                  <div className="h-4 w-16 bg-gray-200 rounded mx-auto"></div>
                </div>
                <div className="text-center">
                  <div className="h-6 w-12 bg-gray-300 rounded mx-auto mb-1"></div>
                  <div className="h-4 w-16 bg-gray-200 rounded mx-auto"></div>
                </div>
                <div className="text-center">
                  <div className="h-6 w-12 bg-gray-300 rounded mx-auto mb-1"></div>
                  <div className="h-4 w-16 bg-gray-200 rounded mx-auto"></div>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="h-5 w-32 bg-gray-300 rounded"></div>
                <div className="h-4 w-full bg-gray-200 rounded"></div>
                <div className="h-4 w-3/4 bg-gray-200 rounded"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Posts Grid Skeleton */}
        <div className="border-t pt-6">
          <div className="flex justify-center space-x-12 border-b mb-6">
            <div className="w-16 h-10 bg-gray-300 rounded"></div>
            <div className="w-16 h-10 bg-gray-300 rounded"></div>
          </div>
          
          <div className="grid grid-cols-3 gap-1">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="aspect-square bg-gray-300 animate-pulse"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!currentProfile && !isLoading) {
    return (
      <div className="max-w-4xl mx-auto p-4">
        <div className="text-center py-12">
          <div className="inline-block p-6 bg-gray-100 rounded-full mb-6">
            <Settings className="w-12 h-12 text-gray-400" />
          </div>
          <h2 className="text-2xl font-light mb-2">Profile Not Found</h2>
          <p className="text-gray-600 mb-6">
            The profile you're looking for doesn't exist or has been removed.
          </p>
          <button
            onClick={handleRefresh}
            className="px-6 py-2 bg-pink-600 text-white rounded hover:bg-pink-700 transition-colors"
          >
            Refresh
          </button>
          <button
            onClick={() => navigate('/')}
            className="ml-4 px-6 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition-colors"
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  const isOwnProfile = currentUser?.id === userId;

  return (
    <div className="max-w-4xl mx-auto p-4">
      {/* Profile Header */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <div className="flex flex-col md:flex-row md:items-center space-y-6 md:space-y-0 md:space-x-8">
          <div className="relative flex-shrink-0">
            <Avatar
              src={currentProfile?.avatar_url}
              alt={currentProfile?.username || 'Profile'}
              size="xl"
              className="border-4 border-white shadow-lg"
              fallbackSrc="https://i.pravatar.cc/300"
            />
            {profileLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-full">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
              </div>
            )}
          </div>
          
          <div className="flex-1">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
              <div className="mb-4 md:mb-0">
                <h1 className="text-2xl font-light mb-2">{currentProfile?.username}</h1>
                {currentProfile?.full_name && (
                  <h2 className="font-semibold text-gray-800">{currentProfile.full_name}</h2>
                )}
              </div>
              
              <div className="flex items-center space-x-2">
                {isOwnProfile ? (
                  <>
                    <Link
                      to="/edit-profile"
                      className="px-4 py-1.5 text-sm font-medium bg-gray-100 rounded hover:bg-gray-200 transition-colors"
                    >
                      Edit Profile
                    </Link>
                    <Link
                      to="/create"
                      className="px-4 py-1.5 text-sm font-medium bg-pink-600 text-white rounded hover:bg-pink-700 transition-colors"
                    >
                      New Post
                    </Link>
                  </>
                ) : (
                  <div className="flex space-x-2">
                    <button
                      onClick={handleFollow}
                      disabled={profileLoading}
                      className={`px-4 py-1.5 text-sm font-medium rounded transition-colors disabled:opacity-50 ${
                        isFollowing
                          ? 'bg-gray-100 text-black hover:bg-gray-200'
                          : 'bg-pink-600 text-white hover:bg-pink-700'
                      }`}
                    >
                      {profileLoading ? '...' : isFollowing ? 'Following' : 'Follow'}
                    </button>
                    <button className="px-4 py-1.5 text-sm font-medium bg-gray-100 rounded hover:bg-gray-200 transition-colors">
                      Message
                    </button>
                  </div>
                )}
                <button className="p-1.5 hover:bg-gray-100 rounded transition-colors">
                  <Settings className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="flex space-x-8 mb-4">
              <div className="text-center">
                <div className="font-semibold text-lg">{userPosts.length}</div>
                <div className="text-sm text-gray-500">Posts</div>
              </div>
              <Link
                to={`/profile/${userId}/followers`}
                className="text-center hover:opacity-80 transition-opacity"
              >
                <div className="font-semibold text-lg">{followStats.followers || 0}</div>
                <div className="text-sm text-gray-500">Followers</div>
              </Link>
              <Link
                to={`/profile/${userId}/following`}
                className="text-center hover:opacity-80 transition-opacity"
              >
                <div className="font-semibold text-lg">{followStats.following || 0}</div>
                <div className="text-sm text-gray-500">Following</div>
              </Link>
            </div>

            <div>
              {currentProfile?.bio && (
                <p className="mt-1 whitespace-pre-line text-gray-800 mb-2">{currentProfile.bio}</p>
              )}
              {currentProfile?.website && (
                <a
                  href={currentProfile.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline inline-block"
                >
                  {currentProfile.website}
                </a>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Posts Grid */}
      <div className="border-t pt-6">
        <div className="flex justify-center space-x-12 border-b mb-6">
          <button className="flex items-center space-x-2 py-2 border-b-2 border-black">
            <Grid className="w-4 h-4" />
            <span className="text-sm font-medium">POSTS</span>
          </button>
          <button className="flex items-center space-x-2 py-2 text-gray-500 hover:text-black transition-colors">
            <Bookmark className="w-4 h-4" />
            <span className="text-sm font-medium">SAVED</span>
          </button>
        </div>

        {postsLoading ? (
          <div className="grid grid-cols-3 gap-1">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="aspect-square bg-gray-200 animate-pulse"></div>
            ))}
          </div>
        ) : userPosts.length === 0 ? (
          <div className="text-center py-12">
            <div className="inline-block p-6 bg-gray-100 rounded-full mb-6">
              <Grid className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-xl font-light mb-2">
              {isOwnProfile ? 'No Posts Yet' : 'No Posts'}
            </h3>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              {isOwnProfile 
                ? 'When you share photos or videos, they will appear on your profile.'
                : 'This user hasn\'t shared any posts yet.'}
            </p>
            {isOwnProfile && (
              <Link
                to="/create"
                className="inline-block px-6 py-2 bg-pink-600 text-white rounded hover:bg-pink-700 transition-colors"
              >
                Create your first post
              </Link>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-1">
            {userPosts.map(post => (
              <Link key={post.id} to={`/post/${post.id}`} className="block">
                <div className="aspect-square relative group cursor-pointer overflow-hidden">
                  <img
                    src={post.image_url}
                    alt={post.caption}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    loading="lazy"
                    onError={(e) => {
                      e.target.src = 'https://via.placeholder.com/400x400?text=Image+Not+Found';
                    }}
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all duration-300 flex items-center justify-center">
                    <div className="text-white opacity-0 group-hover:opacity-100 flex items-center space-x-4 transition-opacity duration-300">
                      <div className="flex items-center space-x-1">
                        <Heart className="w-5 h-5" />
                        <span className="font-semibold">{post.like1?.length || 0}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <MessageCircle className="w-5 h-5" />
                        <span className="font-semibold">{post.comments1?.length || 0}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;