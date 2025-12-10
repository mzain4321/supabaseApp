import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    )

    const { post_id, comment, post_owner_id } = await req.json()
    
    const { data: { user } } = await supabaseClient.auth.getUser()
    
    if (!user) {
      throw new Error('Not authenticated')
    }

    // Insert comment
    const { data: commentData, error } = await supabaseClient
      .from('comments1')
      .insert({
        post_id,
        user_id: user.id,
        content: comment
      })
      .select(`
        *,
        profiles1:user_id (username, avatar_url)
      `)
      .single()

    if (error) throw error

    // Get post owner details for notification
    const { data: postOwner } = await supabaseClient
      .from('profiles1')
      .select('email')
      .eq('id', post_owner_id)
      .single()

    // Here you could send email/push notification
    // For now, we'll just return success

    return new Response(
      JSON.stringify({ 
        success: true, 
        comment: commentData,
        notified: postOwner?.email 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})