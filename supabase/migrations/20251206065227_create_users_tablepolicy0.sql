drop policy if exists "Users can create posts" on posts;
drop policy if exists "Users insert posts" on posts;
drop policy if exists "insert posts" on posts;

create policy "Users can create posts"
on posts
for insert
to authenticated
with check ( user_id = auth.uid() );

create policy "Users can view posts"
on posts
for select
to authenticated
using ( true );
