import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Get yesterday's date in Chinese format
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)
    const yesterdayStr = yesterday.toLocaleDateString('zh-CN', { 
      year: 'numeric', month: 'long', day: 'numeric' 
    })

    console.log(`Checking records for: ${yesterdayStr}`)

    // === Bump records auto safe check-in ===
    const { data: bumpRecords, error: bumpError } = await supabase
      .from('bump_records')
      .select('id')
      .eq('date', yesterdayStr)
      .limit(1)

    if (bumpError) {
      console.error('Error fetching bump records:', bumpError)
    } else if (!bumpRecords || bumpRecords.length === 0) {
      console.log(`No bump records for ${yesterdayStr}, adding auto safe record`)
      await supabase.from('bump_records').insert({
        date: yesterdayStr, time: '23:59', type: 'safe',
      })
    }

    // === Milktea records auto no_milktea check-in ===
    const { data: milkteaRecords, error: milkteaError } = await supabase
      .from('milktea_records')
      .select('id')
      .eq('date', yesterdayStr)
      .limit(1)

    if (milkteaError) {
      console.error('Error fetching milktea records:', milkteaError)
    } else if (!milkteaRecords || milkteaRecords.length === 0) {
      console.log(`No milktea records for ${yesterdayStr}, adding auto no_milktea record`)
      await supabase.from('milktea_records').insert({
        date: yesterdayStr, time: '23:59', type: 'no_milktea',
      })
    }

    return new Response(
      JSON.stringify({ success: true, message: `Auto check-in completed for ${yesterdayStr}` }),
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
