// src/pages/Signup.jsx
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import { AlertCircle, CheckCircle, Eye, EyeOff } from 'lucide-react';

const Signup = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    username: '',
    fullName: '',
    agreeTerms: false,
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { signUp } = useAuth();
  const navigate = useNavigate();

  // Client-side validation
  const validateForm = () => {
    const newErrors = {};

    // Email
    if (!formData.email) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email))
      newErrors.email = 'Please enter a valid email address';

    // Username
    if (!formData.username) newErrors.username = 'Username is required';
    else if (formData.username.length < 3)
      newErrors.username = 'Username must be at least 3 characters';
    else if (!/^[a-zA-Z0-9_]+$/.test(formData.username))
      newErrors.username = 'Username can only contain letters, numbers, and underscores';

    // Full Name
    if (!formData.fullName.trim()) newErrors.fullName = 'Full name is required';

    // Password
    if (!formData.password) newErrors.password = 'Password is required';
    else if (formData.password.length < 6)
      newErrors.password = 'Password must be at least 6 characters';

    // Confirm Password
    if (formData.password !== formData.confirmPassword)
      newErrors.confirmPassword = 'Passwords do not match';

    // Terms agreement
    if (!formData.agreeTerms)
      newErrors.agreeTerms = 'You must agree to the Terms of Service';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      toast.error('Please fix the errors in the form');
      return;
    }

    setLoading(true);
    setErrors({});

    try {
      const { error } = await signUp(
        formData.email.trim(),
        formData.password,
        formData.username.trim().toLowerCase(),
        formData.fullName.trim()
      );

      if (error) {
        let errorMessage = error;

        if (error === 'email_registered')
          errorMessage = 'This email is already registered. Please login.';
        else if (error === 'username_taken')
          errorMessage = 'Username is already taken. Please choose another.';
        else if (error === 'weak_password')
          errorMessage = 'Password is too weak. Please choose a stronger password.';

        // Map error to specific fields
        if (error === 'email_registered') setErrors({ email: errorMessage });
        else if (error === 'username_taken') setErrors({ username: errorMessage });
        else if (error === 'weak_password') setErrors({ password: errorMessage });

        toast.error(errorMessage);
      } else {
        toast.success('Account created successfully! Welcome 🎉', { duration: 5000 });
        setTimeout(() => navigate('/login'), 1500);
      }
    } catch (err) {
      console.error('Unexpected error:', err);
      toast.error('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Password requirements helper
  const PasswordRequirements = () => (
    <div className="mt-2 text-sm space-y-1">
      <p className="font-medium text-gray-700">Password must:</p>
      <ul className="text-gray-600 space-y-1">
        <li className={`flex items-center ${formData.password.length >= 6 ? 'text-green-600' : ''}`}>
          {formData.password.length >= 6 ? <CheckCircle className="h-4 w-4 mr-2" /> : <AlertCircle className="h-4 w-4 mr-2" />}
          Be at least 6 characters
        </li>
      </ul>
    </div>
  );

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-instagram-blue to-instagram-purple p-4">
      <div className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-instagram-blue to-instagram-purple rounded-full mb-4">
            <span className="text-2xl font-bold text-white">📸</span>
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-instagram-blue to-instagram-purple bg-clip-text text-transparent">
            Create Account
          </h1>
          <p className="text-gray-600 mt-2">Join our community of creators</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Full Name */}
          <div>
            <label className="block text-gray-700 mb-2 font-medium">Full Name</label>
            <input
              type="text"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              className={`input-field ${errors.fullName ? 'border-red-500 focus:ring-red-500' : ''}`}
              placeholder="John Doe"
              disabled={loading}
            />
            {errors.fullName && (
              <p className="mt-1 text-sm text-red-600 flex items-center">
                <AlertCircle className="h-4 w-4 mr-1" /> {errors.fullName}
              </p>
            )}
          </div>

          {/* Username */}
          <div>
            <label className="block text-gray-700 mb-2 font-medium">Username</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">@</span>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                className={`input-field pl-8 ${errors.username ? 'border-red-500 focus:ring-red-500' : ''}`}
                placeholder="johndoe"
                disabled={loading}
              />
            </div>
            {errors.username && (
              <p className="mt-1 text-sm text-red-600 flex items-center">
                <AlertCircle className="h-4 w-4 mr-1" /> {errors.username}
              </p>
            )}
          </div>

          {/* Email */}
          <div>
            <label className="block text-gray-700 mb-2 font-medium">Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className={`input-field ${errors.email ? 'border-red-500 focus:ring-red-500' : ''}`}
              placeholder="you@example.com"
              disabled={loading}
            />
            {errors.email && (
              <p className="mt-1 text-sm text-red-600 flex items-center">
                <AlertCircle className="h-4 w-4 mr-1" /> {errors.email}
              </p>
            )}
          </div>

          {/* Password */}
          <div>
            <label className="block text-gray-700 mb-2 font-medium">Password</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleChange}
                className={`input-field pr-10 ${errors.password ? 'border-red-500 focus:ring-red-500' : ''}`}
                placeholder="••••••••"
                disabled={loading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
            {errors.password && (
              <p className="mt-1 text-sm text-red-600 flex items-center">
                <AlertCircle className="h-4 w-4 mr-1" /> {errors.password}
              </p>
            )}
            <PasswordRequirements />
          </div>

          {/* Confirm Password */}
          <div>
            <label className="block text-gray-700 mb-2 font-medium">Confirm Password</label>
            <div className="relative">
              <input
                type={showConfirmPassword ? "text" : "password"}
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                className={`input-field pr-10 ${errors.confirmPassword ? 'border-red-500 focus:ring-red-500' : ''}`}
                placeholder="••••••••"
                disabled={loading}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
            {errors.confirmPassword && (
              <p className="mt-1 text-sm text-red-600 flex items-center">
                <AlertCircle className="h-4 w-4 mr-1" /> {errors.confirmPassword}
              </p>
            )}
          </div>

          {/* Terms */}
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              name="agreeTerms"
              checked={formData.agreeTerms}
              onChange={handleChange}
              className="h-4 w-4 text-instagram-blue rounded focus:ring-instagram-blue"
              disabled={loading}
            />
            <label className="text-sm text-gray-600">
              I agree to the{' '}
              <a href="#" className="text-instagram-blue hover:underline">Terms of Service</a>{' '}
              and{' '}
              <a href="#" className="text-instagram-blue hover:underline">Privacy Policy</a>
            </label>
          </div>
          {errors.agreeTerms && (
            <p className="text-sm text-red-600 flex items-center">
              <AlertCircle className="h-4 w-4 mr-1" /> {errors.agreeTerms}
            </p>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full py-3 mt-4 flex items-center justify-center space-x-2"
          >
            {loading ? (
              <>
                <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Creating Account...</span>
              </>
            ) : (
              <span>Create Account</span>
            )}
          </button>
        </form>

        {/* Login Link */}
        <div className="mt-6 text-center">
          <p className="text-gray-600">
            Already have an account?{' '}
            <Link to="/login" className="text-instagram-blue hover:underline font-medium">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Signup;
