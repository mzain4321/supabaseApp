CREATE INDEX IF NOT EXISTS idx_posts_created_at ON posts1(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_posts_user_id ON posts1(user_id);
CREATE INDEX IF NOT EXISTS idx_likes_post_id_user_id ON likes1(post_id, user_id);
CREATE INDEX IF NOT EXISTS idx_comments_post_id_created_at ON comments1(post_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_profiles_username ON profiles1(username);

-- Drop old single column indexes if they exist
DROP INDEX IF EXISTS idx_likes_post_id;
DROP INDEX IF EXISTS idx_likes_user_id;
DROP INDEX IF EXISTS idx_comments_post_id;
-- Enable RLS
ALTER TABLE followers1 ENABLE ROW LEVEL SECURITY;

-- Allow users to read any follower data
CREATE POLICY "Allow public read access" ON followers1
FOR SELECT USING (true);

-- Allow users to insert their own follow data
CREATE POLICY "Allow users to follow others" ON followers1
FOR INSERT WITH CHECK (auth.uid() = follower_id);

-- Allow users to unfollow (delete their own follow data)
CREATE POLICY "Allow users to unfollow" ON followers1
FOR DELETE USING (auth.uid() = follower_id);