// src/pages/Home.jsx
import React from 'react';
import Feed from '../components/Feed';

export default function Home(){ 
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Explore</h1>
      <Feed />
    </div>
  );
}
