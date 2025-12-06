-- Enable UUID extension if not enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (
    id,
    username,
    full_name,
    avatar_url,
    bio,
    website
  ) VALUES (
    NEW.id,
    COALESCE(
      NEW.raw_user_meta_data->>'username',
      'user_' || REPLACE(CAST(NEW.id AS TEXT), '-', '')::VARCHAR(12)
    ),
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', NULL),
    NULL,
    NULL
  );
  RETURN NEW;
EXCEPTION
  WHEN unique_violation THEN
    -- If username exists, add random number
    INSERT INTO public.profiles (
      id,
      username,
      full_name,
      avatar_url,
      bio,
      website
    ) VALUES (
      NEW.id,
      'user_' || REPLACE(CAST(NEW.id AS TEXT), '-', '')::VARCHAR(12),
      COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
      COALESCE(NEW.raw_user_meta_data->>'avatar_url', NULL),
      NULL,
      NULL
    );
    RETURN NEW;
  WHEN OTHERS THEN
    RAISE EXCEPTION 'Error creating profile: %', SQLERRM;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user creation
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to generate unique username
CREATE OR REPLACE FUNCTION generate_unique_username(base_username TEXT)
RETURNS TEXT AS $$
DECLARE
  unique_username TEXT;
  counter INTEGER := 0;
BEGIN
  unique_username := base_username;
  
  WHILE EXISTS (SELECT 1 FROM public.profiles WHERE username = unique_username) LOOP
    counter := counter + 1;
    unique_username := base_username || counter::TEXT;
    
    IF counter > 100 THEN
      RAISE EXCEPTION 'Could not generate unique username after 100 attempts';
    END IF;
  END LOOP;
  
  RETURN unique_username;
END;
$$ LANGUAGE plpgsql;

-- Update profiles table to ensure proper constraints
ALTER TABLE public.profiles 
  ALTER COLUMN username SET NOT NULL,
  ALTER COLUMN username SET DEFAULT 'user_' || REPLACE(CAST(gen_random_uuid() AS TEXT), '-', '')::VARCHAR(12);

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_profiles_username_lower ON public.profiles(LOWER(username));

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO postgres, anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO postgres, authenticated;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO anon;