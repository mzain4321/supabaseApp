// src/pages/Signup.jsx
import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

export default function Signup(){
  const { signUp } = useAuth();
  const nav = useNavigate();
  const [form, setForm] = useState({ email:'', password:'', username:'', full_name:''});
  const [err, setErr] = useState('');

  const submit = async (e) => {
    e.preventDefault();
    setErr('');
    try {
      await signUp(form);
      nav('/dashboard');
    } catch (e) {
      setErr(e.message || 'Signup failed');
    }
  };

  return (
    <form onSubmit={submit} className="max-w-md mx-auto bg-white p-6 rounded shadow space-y-3">
      <h2 className="text-xl font-semibold mb-4">Sign up</h2>
      {err && <div className="text-red-600">{err}</div>}

      <input className="w-full p-2 border rounded" placeholder="Username"
        value={form.username} onChange={e=>setForm({...form, username:e.target.value})} />
      <input className="w-full p-2 border rounded" placeholder="Full name"
        value={form.full_name} onChange={e=>setForm({...form, full_name:e.target.value})} />
      <input className="w-full p-2 border rounded" placeholder="Email"
        value={form.email} onChange={e=>setForm({...form, email:e.target.value})} />
      <input type="password" className="w-full p-2 border rounded" placeholder="Password"
        value={form.password} onChange={e=>setForm({...form, password:e.target.value})} />

      <button className="w-full py-2 bg-blue-600 text-white rounded">Create account</button>

      <div className="text-center text-sm text-gray-700">
        Already have an account? <Link to="/login" className="text-blue-600">Login</Link>
      </div>
    </form>
  );
}
