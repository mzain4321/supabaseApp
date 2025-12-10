import { serve } from "https://deno.land/x/sift@0.5.0/mod.ts";
import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
);

const headers = {
  "Access-Control-Allow-Origin": "*", // or your frontend URL
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

serve({
  "/signup": async (req) => {
    if (req.method === "OPTIONS") {
      return new Response(null, { status: 204, headers });
    }

    try {
      const { email, password, username, fullName } = await req.json();

      // Check if username exists
      const { data: existingUser } = await supabase
        .from("profiles")
        .select("username")
        .eq("username", username)
        .single();

      if (existingUser) {
        return new Response(JSON.stringify({ error: "Username already taken" }), {
          status: 400,
          headers,
        });
      }

      // Create user
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email,
        password,
        user_metadata: { username, full_name: fullName },
        email_confirm: true,
      });

      if (authError || !authData.user) {
        return new Response(JSON.stringify({ error: authError?.message || "Auth failed" }), {
          status: 400,
          headers,
        });
      }

      // Insert profile
      const { error: profileError } = await supabase
        .from("profiles")
        .insert({
          id: authData.user.id,
          username: username.toLowerCase().trim(),
          full_name: fullName.trim(),
        });

      if (profileError) {
        await supabase.auth.admin.deleteUser(authData.user.id);
        return new Response(JSON.stringify({ error: profileError.message }), {
          status: 500,
          headers,
        });
      }

      return new Response(JSON.stringify({ userId: authData.user.id }), {
        status: 200,
        headers,
      });
    } catch (err) {
      return new Response(JSON.stringify({ error: err.message }), {
        status: 500,
        headers,
      });
    }
  },
});
