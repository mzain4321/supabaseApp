// supabase/functions/profile-crud/index.ts

import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.44.2";

// Initialize Supabase Client for the Edge Function
// The URL and Key are automatically available in the Deno environment
const supabase = createClient(
  Deno.env.get("SUPABASE_URL") ?? "",
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "", // Use the Service Role Key for elevated permissions
  {
    auth: {
      persistSession: false,
    },
  }
);

serve(async (req) => {
  try {
    const url = new URL(req.url);
    const method = req.method;
    const path = url.pathname;
    // ⭐ CHANGE: Updated the table name from "profile1" to "users"
    const TABLE_NAME = "users"; 
    
    // Set up CORS headers
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    };

    // Handle OPTIONS request for CORS preflight
    if (method === 'OPTIONS') {
      return new Response('ok', { headers: corsHeaders });
    }


    switch (method) {

      case "GET": {
        const { data, error } = await supabase.from(TABLE_NAME).select("*");
        
        if (error) throw error;
        
        return new Response(JSON.stringify(data), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        });
      }


      case "POST": {
        const { name, email } = await req.json();

        if (!name || !email) {
          return new Response(JSON.stringify({ message: "Missing name or email" }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 400,
          });
        }
        

        const { data: existing, error: checkError } = await supabase
          .from(TABLE_NAME)
          .select("id")
          .eq("email", email)
          .single();
          
        if (existing) {
             return new Response(JSON.stringify({ message: "Email already exists" }), {
                headers: { ...corsHeaders, "Content-Type": "application/json" },
                status: 409, // Conflict
            });
        }
        if (checkError && checkError.code !== "PGRST116") { 
            throw checkError;
        }

        const { data, error } = await supabase
          .from(TABLE_NAME)
          .insert([{ name, email }])
          .select();

        if (error) throw error;

        return new Response(JSON.stringify(data), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 201, 
        });
      }

   
      case "PATCH": {
        const { id, name, email } = await req.json();

        if (!id || !name || !email) {
            return new Response(JSON.stringify({ message: "Missing id, name, or email" }), {
              headers: { ...corsHeaders, "Content-Type": "application/json" },
              status: 400,
            });
        }

        const { data, error } = await supabase
          .from(TABLE_NAME)
          .update({ name, email })
          .eq("id", id)
          .select();

        if (error) throw error;

        return new Response(JSON.stringify(data), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        });
      }

  
      case "DELETE": {
        const urlParams = new URLSearchParams(url.search);
        const id = urlParams.get("id"); 

        if (!id) {
            return new Response(JSON.stringify({ message: "Missing user ID" }), {
              headers: { ...corsHeaders, "Content-Type": "application/json" },
              status: 400,
            });
        }

        const { error } = await supabase
          .from(TABLE_NAME)
          .delete()
          .eq("id", id);

        if (error) throw error;

        return new Response(JSON.stringify({ message: `User with id ${id} deleted` }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        });
      }
      
 
      default:
        return new Response(JSON.stringify({ message: "Method Not Allowed" }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 405,
        });
    }
  } catch (error) {
    console.error("Function Error:", error);
   
    if (error.message.includes('duplicate key value violates unique constraint "profile1_email_key"')) {
      return new Response(JSON.stringify({ message: "This email is already in use by another user." }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 409,
      });
    }
    
    return new Response(JSON.stringify({ message: error.message || "Internal Server Error" }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});