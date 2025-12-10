import React, { useState } from 'react';
import { supabase } from '../lib/supabase';

const TestStorage = () => {
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);

  const testStorage = async () => {
    setLoading(true);
    setStatus('Testing storage...');
    
    try {
      // Test 1: List buckets
      setStatus('Listing buckets...');
      const { data: buckets, error: bucketError } = await supabase.storage.listBuckets();
      
      if (bucketError) {
        throw new Error(`Bucket list error: ${bucketError.message}`);
      }
      
      setStatus(`Found ${buckets.length} bucket(s)`);
      console.log('Buckets:', buckets);
      
      // Check if images bucket exists
      const imagesBucket = buckets.find(b => b.name === 'images');
      if (!imagesBucket) {
        throw new Error('Images bucket not found');
      }
      
      setStatus('Images bucket exists');
      
      // Test 2: Try to list files (should work even if empty)
      const { data: files, error: listError } = await supabase.storage
        .from('images')
        .list();
      
      if (listError) {
        throw new Error(`List files error: ${listError.message}`);
      }
      
      setStatus(`Bucket contains ${files?.length || 0} file(s)`);
      
      // Test 3: Test upload with a small test image
      setStatus('Testing upload...');
      const testBlob = new Blob(['test'], { type: 'text/plain' });
      const testFile = new File([testBlob], 'test.txt');
      
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('images')
        .upload('test/test.txt', testFile);
      
      if (uploadError) {
        throw new Error(`Upload test error: ${uploadError.message}`);
      }
      
      setStatus('Upload test successful!');
      
      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('images')
        .getPublicUrl('test/test.txt');
      
      setStatus(`Public URL: ${publicUrl}`);
      
    } catch (error) {
      console.error('Storage test error:', error);
      setStatus(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 border rounded-lg">
      <h2 className="text-lg font-semibold mb-2">Storage Test</h2>
      <button
        onClick={testStorage}
        disabled={loading}
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
      >
        {loading ? 'Testing...' : 'Test Storage'}
      </button>
      {status && (
        <div className="mt-2 p-2 bg-gray-100 rounded">
          <p className="text-sm font-mono">{status}</p>
        </div>
      )}
    </div>
  );
};

export default TestStorage;