-- First, create the uuid-ossp extension with proper permissions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA public;

-- Grant usage on the extension
GRANT USAGE ON SCHEMA public TO postgres, anon, authenticated, service_role;

-- Alternatively, use gen_random_uuid() which is built into PostgreSQL
-- Create profiles1 table
CREATE TABLE profiles1 (
    id UUID REFERENCES auth.users(id) PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    full_name VARCHAR(100),
    avatar_url TEXT,
    bio TEXT,
    website TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create posts1 table - using gen_random_uuid() instead
CREATE TABLE posts1 (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES profiles1(id) ON DELETE CASCADE NOT NULL,
    image_url TEXT NOT NULL,
    caption TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create likes1 table
CREATE TABLE likes1 (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    post_id UUID REFERENCES posts1(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES profiles1(id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    UNIQUE(post_id, user_id)
);

-- Create comments1 table
CREATE TABLE comments1 (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    post_id UUID REFERENCES posts1(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES profiles1(id) ON DELETE CASCADE NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create followers1 table
CREATE TABLE followers1 (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    follower_id UUID REFERENCES profiles1(id) ON DELETE CASCADE NOT NULL,
    following_id UUID REFERENCES profiles1(id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    UNIQUE(follower_id, following_id)
);

-- Create storage bucket for images
INSERT INTO storage.buckets (id, name, public) 
VALUES ('images1', 'images1', true)
ON CONFLICT (id) DO NOTHING;

-- Set up storage policies
DROP POLICY IF EXISTS "Public images are viewable by everyone" ON storage.objects;
CREATE POLICY "Public images are viewable by everyone"
ON storage.objects FOR SELECT
USING (bucket_id = 'images1');

DROP POLICY IF EXISTS "Users can upload their own images" ON storage.objects;
CREATE POLICY "Users can upload their own images"
ON storage.objects FOR INSERT
WITH CHECK (
    bucket_id = 'images1' 
    AND auth.role() = 'authenticated'
);

DROP POLICY IF EXISTS "Users can update their own images" ON storage.objects;
CREATE POLICY "Users can update their own images"
ON storage.objects FOR UPDATE
USING (
    bucket_id = 'images1' 
    AND auth.uid() = owner
);

DROP POLICY IF EXISTS "Users can delete their own images" ON storage.objects;
CREATE POLICY "Users can delete their own images"
ON storage.objects FOR DELETE
USING (
    bucket_id = 'images1' 
    AND auth.uid() = owner
);

-- Enable Row Level Security
ALTER TABLE profiles1 ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts1 ENABLE ROW LEVEL SECURITY;
ALTER TABLE likes1 ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments1 ENABLE ROW LEVEL SECURITY;
ALTER TABLE followers1 ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON profiles1;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles1;
DROP POLICY IF EXISTS "Public posts are viewable by everyone" ON posts1;
DROP POLICY IF EXISTS "Users can create posts" ON posts1;
DROP POLICY IF EXISTS "Users can update own posts" ON posts1;
DROP POLICY IF EXISTS "Users can delete own posts" ON posts1;
DROP POLICY IF EXISTS "Likes are viewable by everyone" ON likes1;
DROP POLICY IF EXISTS "Users can like posts" ON likes1;
DROP POLICY IF EXISTS "Users can unlike posts" ON likes1;
DROP POLICY IF EXISTS "Comments are viewable by everyone" ON comments1;
DROP POLICY IF EXISTS "Users can comment on posts" ON comments1;
DROP POLICY IF EXISTS "Users can delete own comments" ON comments1;
DROP POLICY IF EXISTS "Followers are viewable by everyone" ON followers1;
DROP POLICY IF EXISTS "Users can follow others" ON followers1;
DROP POLICY IF EXISTS "Users can unfollow" ON followers1;

-- Create RLS Policies
-- Profiles: Readable by all, editable by owner
CREATE POLICY "Public profiles are viewable by everyone" 
ON profiles1 FOR SELECT USING (true);

CREATE POLICY "Users can update own profile" 
ON profiles1 FOR UPDATE USING (auth.uid() = id);

-- Posts: Readable by all, editable by owner
CREATE POLICY "Public posts are viewable by everyone" 
ON posts1 FOR SELECT USING (true);

CREATE POLICY "Users can create posts" 
ON posts1 FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own posts" 
ON posts1 FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own posts" 
ON posts1 FOR DELETE USING (auth.uid() = user_id);

-- Likes: Readable by all, editable by authenticated users
CREATE POLICY "Likes are viewable by everyone" 
ON likes1 FOR SELECT USING (true);

CREATE POLICY "Users can like posts" 
ON likes1 FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can unlike posts" 
ON likes1 FOR DELETE USING (auth.uid() = user_id);

-- Comments: Readable by all, editable by authenticated users
CREATE POLICY "Comments are viewable by everyone" 
ON comments1 FOR SELECT USING (true);

CREATE POLICY "Users can comment on posts" 
ON comments1 FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own comments" 
ON comments1 FOR DELETE USING (auth.uid() = user_id);

-- Followers: Readable by all, editable by authenticated users
CREATE POLICY "Followers are viewable by everyone" 
ON followers1 FOR SELECT USING (true);

CREATE POLICY "Users can follow others" 
ON followers1 FOR INSERT WITH CHECK (auth.uid() = follower_id);

CREATE POLICY "Users can unfollow" 
ON followers1 FOR DELETE USING (auth.uid() = follower_id);

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc'::text, NOW());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Drop triggers if they exist
DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles1;
DROP TRIGGER IF EXISTS update_posts_updated_at ON posts1;

CREATE TRIGGER update_profiles_updated_at 
    BEFORE UPDATE ON profiles1 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_posts_updated_at 
    BEFORE UPDATE ON posts1 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create function to handle new user signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO profiles1 (id, username, full_name, avatar_url)
    VALUES (
        new.id,
        COALESCE(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1)),
        COALESCE(new.raw_user_meta_data->>'full_name', new.email),
        COALESCE(new.raw_user_meta_data->>'avatar_url', 'https://i.pravatar.cc/300')
    )
    ON CONFLICT (id) DO NOTHING;
    RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop trigger if exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_posts_user_id ON posts1(user_id);
CREATE INDEX IF NOT EXISTS idx_posts_created_at ON posts1(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_likes_post_id ON likes1(post_id);
CREATE INDEX IF NOT EXISTS idx_likes_user_id ON likes1(user_id);
CREATE INDEX IF NOT EXISTS idx_comments_post_id ON comments1(post_id);
CREATE INDEX IF NOT EXISTS idx_followers_follower_id ON followers1(follower_id);
CREATE INDEX IF NOT EXISTS idx_followers_following_id ON followers1(following_id);