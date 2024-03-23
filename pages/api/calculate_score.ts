// @ts-nocheck

import { NextApiRequest, NextApiResponse } from "next"

import { supabase } from "@/lib/supabase"

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
  return lat > minLat && lat < maxLat && lngToCompare > minLng && lngToCompare < maxLng;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { user_id } = req.body
  if (!user_id) {
    res.status(200).json({
      stampScore: 0,
    })
  }
  const { data: allStampScores } = await supabase
    .from("stampscores_available")
    .select("*")
  const { data: userStamps } = await supabase.from("stamps").select("*").match({
    created_by_user_id: user_id,
    created_by_app: 29,
  })
  const { data: dappUserData } = await supabase
    .from("dapp_users")
    .select("*")
    .match({
      user_id: user_id,
    })
  const allStampTypes = userStamps?.map((item) => item.stamptype)
  let stampScore = 0
  allStampTypes?.map((_) => {
    const scoreToAdd = allStampScores?.find(
      (item) => item.stamptype_id === _
    ).score
    stampScore = stampScore + scoreToAdd
  })
  const isInsideToronto = isInToronto(
    dappUserData[0].user_data.location.latitude,
    dappUserData[0].user_data.location.longitude
  )
  if (isInsideToronto) {
    stampScore = stampScore + 10
  }

  res.status(200).json({
    stampScore,
  })
}
