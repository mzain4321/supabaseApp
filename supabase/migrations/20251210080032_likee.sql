-- Fix RLS policies for all tables

-- profiles1 table
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON profiles1;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles1;

CREATE POLICY "Enable read access for all users on profiles1"
ON profiles1 FOR SELECT
USING (true);

CREATE POLICY "Enable insert for authenticated users on profiles1"
ON profiles1 FOR INSERT
WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Enable update for users based on id on profiles1"
ON profiles1 FOR UPDATE
USING (auth.uid() = id);

-- posts1 table
DROP POLICY IF EXISTS "Public posts are viewable by everyone" ON posts1;
DROP POLICY IF EXISTS "Users can create posts" ON posts1;
DROP POLICY IF EXISTS "Users can update own posts" ON posts1;
DROP POLICY IF EXISTS "Users can delete own posts" ON posts1;

CREATE POLICY "Enable read access for all users on posts1"
ON posts1 FOR SELECT
USING (true);

CREATE POLICY "Enable insert for authenticated users on posts1"
ON posts1 FOR INSERT
WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Enable update for users based on user_id on posts1"
ON posts1 FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Enable delete for users based on user_id on posts1"
ON posts1 FOR DELETE
USING (auth.uid() = user_id);

-- likes1 table
DROP POLICY IF EXISTS "Likes are viewable by everyone" ON likes1;
DROP POLICY IF EXISTS "Users can like posts" ON likes1;
DROP POLICY IF EXISTS "Users can unlike posts" ON likes1;


-- Add indexes for faster queries

-- Performance indexes
CREATE INDEX IF NOT EXISTS idx_posts_created_at ON posts1(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_posts_user_id ON posts1(user_id);
CREATE INDEX IF NOT EXISTS idx_likes_post_id_user_id ON likes1(post_id, user_id);
CREATE INDEX IF NOT EXISTS idx_comments_post_id_created_at ON comments1(post_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_profiles_username ON profiles1(username);

-- Drop old single column indexes if they exist
DROP INDEX IF EXISTS idx_likes_post_id;
DROP INDEX IF EXISTS idx_likes_user_id;
DROP INDEX IF EXISTS idx_comments_post_id;

-- comments1 table
DROP POLICY IF EXISTS "Comments are viewable by everyone" ON comments1;
DROP POLICY IF EXISTS "Users can comment on posts" ON comments1;
DROP POLICY IF EXISTS "Users can delete own comments" ON comments1;

CREATE POLICY "Enable read access for all users on comments1"
ON comments1 FOR SELECT
USING (true);

CREATE POLICY "Enable insert for authenticated users on comments1"
ON comments1 FOR INSERT
WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Enable delete for users based on user_id on comments1"
ON comments1 FOR DELETE
USING (auth.uid() = user_id);

-- followers1 table
DROP POLICY IF EXISTS "Followers are viewable by everyone" ON followers1;
DROP POLICY IF EXISTS "Users can follow others" ON followers1;
DROP POLICY IF EXISTS "Users can unfollow" ON followers1;

CREATE POLICY "Enable read access for all users on followers1"
ON followers1 FOR SELECT
USING (true);

CREATE POLICY "Enable insert for authenticated users on followers1"
ON followers1 FOR INSERT
WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Enable delete for users based on follower_id on followers1"
ON followers1 FOR DELETE
USING (auth.uid() = follower_id);