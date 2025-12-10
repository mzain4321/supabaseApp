// supabase/functions/auth-signup/index.ts

import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.44.2";

// Use the Service Role Key for elevated permissions (username checking and signup)
const supabase = createClient(
  Deno.env.get("SUPABASE_URL") ?? "",
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "", 
  {
    auth: {
      persistSession: false,
    },
  }
);

serve(async (req) => {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  };
  
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }
  
  try {
    if (req.method !== 'POST') {
      return new Response(JSON.stringify({ message: "Method Not Allowed" }), { 
        headers: { ...corsHeaders, "Content-Type": "application/json" }, 
        status: 405 
      });
    }

    const { email, password, username, fullName } = await req.json();

    if (!email || !password || !username || !fullName) {
      return new Response(JSON.stringify({ error: "Missing required fields." }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      });
    }
    
    const lowerUsername = username.toLowerCase().trim();

    // 1. Validate username uniqueness 
    const { data: existingProfile, error: profileCheckError } = await supabase
      .from('profiles')
      .select('username')
      .eq('username', lowerUsername)
      .maybeSingle();

    if (existingProfile) {
      return new Response(JSON.stringify({ 
        error: 'Username already taken. Please choose another.' 
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 409, // Conflict
      });
    }
    if (profileCheckError && profileCheckError.code !== 'PGRST116') {
      throw profileCheckError;
    }

    // 2. Sign up with Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          username: lowerUsername,
          full_name: fullName.trim(),
        }
      }
    });

    if (authError) {
      return new Response(JSON.stringify({ error: authError.message }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 401,
      });
    }

    return new Response(JSON.stringify({ 
      message: "Sign up successful. Check email for verification link.", 
      user: authData.user 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 201,
    });

  } catch (error) {
    console.error("Edge Function Error:", error);
    return new Response(JSON.stringify({ error: error.message || "Internal Server Error" }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
