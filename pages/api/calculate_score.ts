import NextCors from "nextjs-cors"

import { calculateScores } from "./utils/fetchScores"
import { supabase } from "./utils/supabase"

const fetch_score = async (req: any, res: any) => {
  const { user_id } = req.body
  const { error, data } = await supabase
    .from("dapp_users")
    .select("*")
    .neq("username", null)
  console.log(data)
  const score = await calculateScores({
    user_id: user_id,
    location: data?.[0].user_data?.location,
  })
  res.send(score);
}

export default fetch_score
