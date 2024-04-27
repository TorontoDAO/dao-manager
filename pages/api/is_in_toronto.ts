import { NextApiRequest, NextApiResponse } from "next"
import axios from "axios"

import { supabase } from "./utils/supabase"

function isInToronto(lat: number, lng: number) {
  // Define the approximate bounding box of Toronto
  const minLat = 43.5 // Minimum latitude observed
  const maxLat = 43.8 // Maximum latitude observed
  const minLng = 79.2 // Minimum longitude observed
  const maxLng = 79.5 // Maximum longitude observed

  if (lng > 0) {
    return false
  }

  const lngToCompare = lng * -1

  // Check if the given coordinates are within the bounding box
  return (
    lat > minLat &&
    lat < maxLat &&
    lngToCompare > minLng &&
    lngToCompare < maxLng
  )
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { user_id } = req.body
  const { error, data } = await supabase.from("dapp_users").select("*").match({
    user_id,
  })
  const location = data?.[0].user_data?.location
  const inToronto = isInToronto(location?.latitude, location?.longitude)
  res.send({ inToronto })
}
