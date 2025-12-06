// src/components/NewPost.jsx
import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

export default function NewPost({ onCreated }) {
  const { user, supabase } = useAuth();
  const [file, setFile] = useState(null);
  const [desc, setDesc] = useState('');
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState('');

  const submit = async (e) => {
    e.preventDefault();
    console.log("Auth UID:", user?.id);

    if (!file) { setErr('Please choose an image'); return; }
    setErr('');
    setLoading(true);
    try {
      const ext = file.name.split('.').pop();
      const filePath = `posts/${user.id}/${Date.now()}.${ext}`;

      // upload file
      const { error: uploadError } = await supabase.storage.from('posts').upload(filePath, file, { upsert: true });
      if (uploadError) throw uploadError;

      // get public url
      const { data } = supabase.storage.from('posts').getPublicUrl(filePath);
      const image_url = data.publicUrl;

      // insert post
      const { error: insertError } = await supabase.from('posts').insert({
        user_id: user.id,
        image_url,
        description: desc,
      });
      if (insertError) throw insertError;

      setFile(null); setDesc('');
      onCreated && onCreated();
    } catch (e) {
      setErr(e.message || 'Upload failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={submit} className="bg-white p-4 rounded shadow space-y-2">
      {err && <div className="text-red-600">{err}</div>}
      <input type="file" accept="image/*" onChange={e => setFile(e.target.files?.[0] ?? null)} />
      <textarea value={desc} onChange={e=>setDesc(e.target.value)} placeholder="Write a description..." className="w-full p-2 border rounded" />
      <div className="flex gap-2">
        <button type="submit" disabled={loading} className="py-2 px-4 bg-blue-600 text-white rounded">
          {loading ? 'Posting...' : 'Post'}
        </button>
      </div>
    </form>
  );
}
