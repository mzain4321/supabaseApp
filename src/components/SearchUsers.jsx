import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { searchUsers, clearSearch } from '../store/slices/profileSlice';
import { Link } from 'react-router-dom';
import { Search, User } from 'lucide-react';

const SearchUsers = () => {
  const [query, setQuery] = useState('');
  const [showResults, setShowResults] = useState(false);
  const { searchedUsers, loading } = useSelector(state => state.profile);
  const dispatch = useDispatch();

  useEffect(() => {
    if (query.trim()) {
      const timer = setTimeout(() => {
        dispatch(searchUsers(query));
      }, 300);

      return () => clearTimeout(timer);
    } else {
      dispatch(clearSearch());
    }
  }, [query, dispatch]);

  const handleInputFocus = () => {
    setShowResults(true);
  };

  const handleResultClick = () => {
    setQuery('');
    setShowResults(false);
    dispatch(clearSearch());
  };

  return (
    <div className="relative">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={handleInputFocus}
          placeholder="Search users..."
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
        />
      </div>

      {showResults && query.trim() && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-lg shadow-lg border z-50 max-h-96 overflow-y-auto">
          {loading ? (
            <div className="p-4 text-center">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-pink-600 mx-auto"></div>
            </div>
          ) : searchedUsers.length === 0 ? (
            <div className="p-4 text-center text-gray-500">
              No users found
            </div>
          ) : (
            <div className="py-2">
              {searchedUsers.map(user => (
                <Link
                  key={user.id}
                  to={`/profile/${user.id}`}
                  onClick={handleResultClick}
                  className="flex items-center p-3 hover:bg-gray-50 transition-colors"
                >
                  <img
                    src={user.avatar_url || '/default-avatar.png'}
                    alt={user.username}
                    className="w-10 h-10 rounded-full object-cover mr-3"
                  />
                  <div>
                    <div className="font-medium">{user.username}</div>
                    {user.full_name && (
                      <div className="text-sm text-gray-500">{user.full_name}</div>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      )}

      {showResults && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowResults(false)}
        />
      )}
    </div>
  );
};

export default SearchUsers;