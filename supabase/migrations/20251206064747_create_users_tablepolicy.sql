alter table profiles enable row level security;
alter table posts enable row level security;
alter table likes enable row level security;

create policy "Users can insert their own profile"
on profiles for insert
with check (auth.uid() = id);

create policy "Users can update their own profile"
on profiles for update
using (auth.uid() = id);

create policy "Anyone can read profiles"
on profiles for select
using (true);

create policy "Users can create posts"
on posts for insert
with check (auth.uid() = user_id);

create policy "Users can update their own posts"
on posts for update
using (auth.uid() = user_id);

create policy "Users can delete their own posts"
on posts for delete
using (auth.uid() = user_id);

create policy "Anyone can read posts"
on posts for select
using (true);

create policy "Users can like posts"
on likes for insert
with check (auth.uid() = user_id);

create policy "Users can unlike their like"
on likes for delete
using (auth.uid() = user_id);

create policy "Anyone can read likes"
on likes for select
using (true);
