-- Enable necessary extensions
create extension if not exists "pgcrypto";

-- Create profiles table
create table profiles1 (
    id uuid references auth.users on delete cascade primary key,
    username text unique not null,
    full_name text,
    avatar_url text,
    bio text,
    website text,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create posts table
create table posts1 (
    id uuid default gen_random_uuid() primary key,
    user_id uuid references profiles1(id) on delete cascade not null,
    image_url text not null,
    caption text,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create likes table
create table like1 (
    id uuid default gen_random_uuid() primary key,
    user_id uuid references profiles1(id) on delete cascade not null,
    post_id uuid references posts1(id) on delete cascade not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    unique(user_id, post_id)
);

-- Create comments table
create table comments1 (
    id uuid default gen_random_uuid() primary key,
    user_id uuid references profiles1(id) on delete cascade not null,
    post_id uuid references posts1(id) on delete cascade not null,
    content text not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create followers table
create table followers1 (
    id uuid default gen_random_uuid() primary key,
    follower_id uuid references profiles1(id) on delete cascade not null,
    following_id uuid references profiles1(id) on delete cascade not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    unique(follower_id, following_id)
);

-- Enable Row Level Security
alter table profiles1 enable row level security;
alter table posts1 enable row level security;
alter table like1 enable row level security;
alter table comments1 enable row level security;
alter table followers1 enable row level security;

-- Create policies

-- Profiles policies
create policy "Public profiles are viewable by everyone"
    on profiles1 for select
    using (true);

create policy "Users can update own profile"
    on profiles1 for update
    using (auth.uid() = id);

-- Posts policies
create policy "Posts are viewable by everyone"
    on posts1 for select
    using (true);

create policy "Users can create posts"
    on posts1 for insert
    with check (auth.uid() = user_id);

create policy "Users can update own posts"
    on posts1 for update
    using (auth.uid() = user_id);

create policy "Users can delete own posts"
    on posts1 for delete
    using (auth.uid() = user_id);

-- Likes policies
create policy "Likes are viewable by everyone"
    on like1 for select
    using (true);

create policy "Users can like posts"
    on like1 for insert
    with check (auth.uid() = user_id);

create policy "Users can unlike posts"
    on like1 for delete
    using (auth.uid() = user_id);

-- Comments policies
create policy "Comments are viewable by everyone"
    on comments1 for select
    using (true);

create policy "Users can create comments"
    on comments1 for insert
    with check (auth.uid() = user_id);

create policy "Users can update own comments"
    on comments1 for update
    using (auth.uid() = user_id);

create policy "Users can delete own comments"
    on comments1 for delete
    using (auth.uid() = user_id);

-- Followers policies
create policy "Followers are viewable by everyone"
    on followers1 for select
    using (true);

create policy "Users can follow others"
    on followers1 for insert
    with check (auth.uid() = follower_id);

create policy "Users can unfollow others"
    on followers1 for delete
    using (auth.uid() = follower_id);

-- Create trigger for updated_at
create or replace function handle_updated_at()
returns trigger as $$
begin
    new.updated_at = now();
    return new;
end;
$$ language plpgsql;

create trigger handle_profiles_updated_at
    before update on profiles1
    for each row
    execute procedure handle_updated_at();

create trigger handle_posts_updated_at
    before update on posts1
    for each row
    execute procedure handle_updated_at();

create trigger handle_comments_updated_at
    before update on comments1
    for each row
    execute procedure handle_updated_at();
