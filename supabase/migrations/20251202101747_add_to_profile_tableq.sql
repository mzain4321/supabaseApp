create table profile1 (
  id bigint primary key generated always as identity,
  name text,
  email text UNIQUE,
  created_at timestamptz default now()
);