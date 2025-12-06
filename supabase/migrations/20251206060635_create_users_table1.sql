-- profiles table (one-to-one with auth.users)
create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text unique,
  full_name text,
  avatar_url text,
  bio text,
  created_at timestamptz default now()
);

-- posts table
create table if not exists posts (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references profiles(id) on delete cascade,
  image_url text,
  description text,
  created_at timestamptz default now()
);

-- likes table
create table if not exists likes (
  id bigserial primary key,
  post_id uuid references posts(id) on delete cascade,
  user_id uuid references profiles(id) on delete cascade,
  created_at timestamptz default now(),
  unique (post_id, user_id)
);

-- convenient views / indexes
create index if not exists idx_posts_created_at on posts (created_at desc);
create index if not exists idx_likes_post on likes (post_id);
