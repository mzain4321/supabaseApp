import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Enhanced upload function with better debugging
export const uploadImage = async (file, userId, folder = 'posts') => {
  try {
    console.log('=== UPLOAD START ===');
    console.log('File:', file.name, file.type, file.size);
    console.log('User ID:', userId);
    console.log('Folder:', folder);
    
    // Generate unique filename
    const fileExt = file.name.split('.').pop();
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 15);
    const fileName = `${folder}/${userId}/${timestamp}_${randomString}.${fileExt}`;
    
    console.log('Generated filename:', fileName);

    // Check if storage bucket exists
    const { data: buckets, error: bucketError } = await supabase.storage.listBuckets();
    console.log('Available buckets:', buckets);
    
    if (bucketError) {
      console.error('Bucket list error:', bucketError);
    }

    // Upload to storage
    console.log('Uploading to storage...');
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('images')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (uploadError) {
      console.error('Upload error:', uploadError);
      throw new Error(`Upload failed: ${uploadError.message}`);
    }

    console.log('Upload successful:', uploadData);

    // Get public URL
    console.log('Getting public URL...');
    const { data: { publicUrl } } = supabase.storage
      .from('images')
      .getPublicUrl(fileName);
    
    console.log('Public URL:', publicUrl);
    console.log('=== UPLOAD END ===');
    
    // Verify URL is not null/undefined
    if (!publicUrl) {
      throw new Error('Failed to generate public URL');
    }

    return publicUrl;
  } catch (error) {
    console.error('=== UPLOAD ERROR ===');
    console.error('Error details:', error);
    throw error;
  }
};

// Generate avatar
export const generateAvatar = async (username) => {
  return `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`;
};

// Initialize storage bucket
export const initializeStorage = async () => {
  try {
    console.log('Initializing storage...');
    
    const { data: buckets, error: listError } = await supabase.storage.listBuckets();
    
    if (listError) {
      console.error('List buckets error:', listError);
      return false;
    }

    console.log('Existing buckets:', buckets);

    const imagesBucket = buckets.find(bucket => bucket.name === 'images');
    
    if (!imagesBucket) {
      console.log('Creating images bucket...');
      const { error: createError } = await supabase.storage.createBucket('images', {
        public: true,
        allowedMimeTypes: ['image/*'],
        fileSizeLimit: 5242880, // 5MB
      });
      
      if (createError) {
        console.error('Create bucket error:', createError);
        return false;
      }
      console.log('Images bucket created');
    } else {
      console.log('Images bucket already exists');
    }
    
    return true;
  } catch (error) {
    console.error('Storage initialization error:', error);
    return false;
  }
};