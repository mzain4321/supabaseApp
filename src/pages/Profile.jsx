// src/pages/Profile.jsx
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import PostCard from '../components/PostCard';
import { useAuth } from '../context/AuthContext';

export default function Profile(){
  const { id } = useParams();
  const [profile, setProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const { user, updateProfile, uploadAvatar } = useAuth();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ username: '', full_name: '', bio: '' });
  const [err, setErr] = useState('');

  useEffect(()=>{
    const load = async () => {
      const { data: p } = await supabase.from('profiles').select('*').eq('id', id).single();
      setProfile(p);
      setForm({ username: p?.username || '', full_name: p?.full_name || '', bio: p?.bio || '' });

      const { data: postsData } = await supabase.from('posts').select('*').eq('user_id', id).order('created_at', { ascending: false });
      setPosts(postsData || []);
    };
    if (id) load();
  }, [id]);

  const submit = async (e) => {
    e.preventDefault();
    try {
      await updateProfile(form);
      setEditing(false);
      // refresh local
      const { data: p } = await supabase.from('profiles').select('*').eq('id', id).single();
      setProfile(p);
    } catch (e) {
      setErr(e.message);
    }
  };

  const handleAvatar = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      await uploadAvatar(file);
      const { data: p } = await supabase.from('profiles').select('*').eq('id', id).single();
      setProfile(p);
    } catch (e) {
      setErr(e.message);
    }
  };

  if (!profile) return <div>Loading profile...</div>;

  return (
    <div>
      <div className="bg-white p-4 rounded shadow flex items-center gap-4">
        <img src={profile.avatar_url || '/default-avatar.png'} className="w-20 h-20 rounded-full object-cover" />
        <div>
          <div className="font-semibold text-xl">{profile.username}</div>
          <div className="text-sm text-gray-600">{profile.full_name}</div>
          <div className="mt-2 text-sm">{profile.bio}</div>
        </div>
        {user?.id === profile.id && (
          <div className="ml-auto">
            <button onClick={() => setEditing(!editing)} className="px-3 py-1 bg-blue-600 text-white rounded">{editing ? 'Cancel' : 'Edit'}</button>
          </div>
        )}
      </div>

      {user?.id === profile.id && editing && (
        <form onSubmit={submit} className="mt-4 bg-white p-4 rounded shadow space-y-2">
          {err && <div className="text-red-600">{err}</div>}
          <input className="w-full p-2 border rounded" value={form.username} onChange={e=>setForm({...form, username:e.target.value})} />
          <input className="w-full p-2 border rounded" value={form.full_name} onChange={e=>setForm({...form, full_name:e.target.value})} />
          <textarea className="w-full p-2 border rounded" value={form.bio} onChange={e=>setForm({...form, bio:e.target.value})} />
          <div className="flex items-center gap-2">
            <input type="file" accept="image/*" onChange={handleAvatar} />
            <button className="px-3 py-1 bg-green-600 text-white rounded">Save</button>
          </div>
        </form>
      )}

      <div className="mt-6 space-y-4">
        {posts.map(p => <PostCard key={p.id} post={p} />)}
      </div>
    </div>
  );
}
