import { NextApiRequest, NextApiResponse } from "next"

import { calculateScores } from "../utils/fetchScores"
import { supabase } from "../utils/supabase"

const searchUsername = async (req: NextApiRequest, res: NextApiResponse) => {
  const { username } = req.body

  const { error, data } = await supabase
    .from("dapp_users")
    .select("*")
    .neq("username", null)
  const allDataToMap = (data ?? []).map(async (item) => {
    const score = await calculateScores({
      user_id: item.user_id,
      location: item.user_data?.location,
    })
    return { ...item, score }
  })
  const allData = await Promise.all(allDataToMap)
  res.send({ error, data: allData })
}

export default searchUsername
