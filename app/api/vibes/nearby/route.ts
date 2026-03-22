import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const lat    = parseFloat(searchParams.get('lat') ?? '')
    const lng    = parseFloat(searchParams.get('lng') ?? '')
    const radius = parseInt(searchParams.get('radius') ?? '5000', 10)

    if (isNaN(lat) || isNaN(lng)) {
      return NextResponse.json({ error: 'lat and lng are required' }, { status: 400 })
    }

    const supabase = createClient()

    // Call the PostGIS stored function defined in migration
    const { data, error } = await supabase.rpc('get_vibes_near', {
      user_lat: lat,
      user_lng: lng,
      radius_meters: Math.min(radius, 25000),  // cap at 25km
    })

    if (error) throw error

    return NextResponse.json({ data })
  } catch (error) {
    console.error('[vibes/nearby]', error)
    return NextResponse.json({ error: 'Failed to fetch vibes' }, { status: 500 })
  }
}
