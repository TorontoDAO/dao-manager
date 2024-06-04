import NextCors from "nextjs-cors"

import { calculateScores } from "./utils/fetchScores"
import { supabase } from "./utils/supabase"

const fetch_score = async (req: any, res: any) => {
  await NextCors(req, res, {
    // Options
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    origin: "*", // Allow all origins
    optionsSuccessStatus: 200, // Some legacy browsers choke on 204
  })
  const { user_id } = req.body
  const { error, data } = await supabase
    .from("dapp_users")
    .select("*")
    .neq("username", null)
  const score = await calculateScores({
    user_id: user_id,
    location: data?.[0].user_data?.location,
  })
  return score
}

export default fetch_score
