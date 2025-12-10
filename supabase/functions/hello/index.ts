import { serve } from "https://deno.land/std/http/server.ts";

serve(() => {
  return new Response("Hello from Edge Functions!");
});
