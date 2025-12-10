-- Drop existing RLS policies for likes1 table
DROP POLICY IF EXISTS "Likes are viewable by everyone" ON likes1;
DROP POLICY IF EXISTS "Users can like posts" ON likes1;
DROP POLICY IF EXISTS "Users can unlike posts" ON likes1;

-- Create new, simpler RLS policies for likes1
CREATE POLICY "Enable read access for all users on likes1"
ON likes1 FOR SELECT
USING (true);

CREATE POLICY "Enable insert for authenticated users on likes1"
ON likes1 FOR INSERT
WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Enable update for users based on user_id on likes1"
ON likes1 FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Enable delete for users based on user_id on likes1"
ON likes1 FOR DELETE
USING (auth.uid() = user_id);