import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Get yesterday's date in Chinese format (same format used in the app)
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)
    const yesterdayStr = yesterday.toLocaleDateString('zh-CN', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    })

    console.log(`Checking records for: ${yesterdayStr}`)

    // Check if there are any records for yesterday
    const { data: existingRecords, error: fetchError } = await supabase
      .from('bump_records')
      .select('id')
      .eq('date', yesterdayStr)
      .limit(1)

    if (fetchError) {
      console.error('Error fetching records:', fetchError)
      return new Response(
        JSON.stringify({ error: 'Failed to fetch records', details: fetchError }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // If no records exist for yesterday, add a safe record
    if (!existingRecords || existingRecords.length === 0) {
      console.log(`No records found for ${yesterdayStr}, adding auto safe record`)
      
      const { error: insertError } = await supabase
        .from('bump_records')
        .insert({
          date: yesterdayStr,
          time: '23:59',
          type: 'safe',
        })

      if (insertError) {
        console.error('Error inserting safe record:', insertError)
        return new Response(
          JSON.stringify({ error: 'Failed to insert safe record', details: insertError }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      console.log(`Auto safe record added for ${yesterdayStr}`)
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: `Auto safe record added for ${yesterdayStr}` 
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log(`Records already exist for ${yesterdayStr}, skipping`)
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Records already exist for ${yesterdayStr}, no action needed` 
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Unexpected error:', error)
    return new Response(
      JSON.stringify({ error: 'Unexpected error', details: String(error) }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
