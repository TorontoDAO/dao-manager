import { NextApiRequest, NextApiResponse } from "next"

import { supabase } from "../utils/supabase"

const searchUsername = async (req: NextApiRequest, res: NextApiResponse) => {
  const { username } = req.body

  const { error, data } = await supabase
    .from("users")
    .select("*")
    .textSearch("username", username)
  res.send({ error, data })
}

export default searchUsername
