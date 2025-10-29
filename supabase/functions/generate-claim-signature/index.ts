import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { userAddress, blessings } = await req.json();
    
    if (!userAddress || typeof blessings !== 'number') {
      return new Response(
        JSON.stringify({ error: 'Invalid parameters' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const nonce = Math.floor(Math.random() * 1000000);
    
    // Mock signature for testing
    const mockSignature = '0x' + Array.from(new Uint8Array(65), () => 
      Math.floor(Math.random() * 256).toString(16).padStart(2, '0')
    ).join('');

    return new Response(
      JSON.stringify({
        signature: mockSignature,
        nonce: nonce
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});