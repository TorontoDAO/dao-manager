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
  return (
    lat > minLat &&
    lat < maxLat &&
    lngToCompare > minLng &&
    lngToCompare < maxLng
  )
}
export const calculateScores = async ({ user_id, location }: any) => {
  const { data: allStampScores } = await supabase
    .from("stampscores_available")
    .select("*")
  const { data: userStamps } = await supabase.from("stamps").select("*").match({
    created_by_user_id: user_id,
    created_by_app: 29,
  })
  const allStampTypes = userStamps?.map((item) => item.stamptype)
  let stampScore = 0
  allStampTypes?.map((_) => {
    const scoreToAdd = allStampScores?.find(
      (item) => item.stamptype_id === _
    ).score
    stampScore = stampScore + scoreToAdd
  })
  const isInsideToronto = isInToronto(location.latitude, location.longitude)
  console.log({ location, isInsideToronto })

  if (isInsideToronto) {
    stampScore = stampScore + 10
  }
  return stampScore
}
