import { NextApiRequest, NextApiResponse } from "next"
import axios from "axios"

const BASE_URL = `https://maps.googleapis.com/maps/api/place/textsearch/json`
const GOOGLE_API_KEY = "AIzaSyCW7A2LY_XIQtmNym9t0hs17nPYO7O7A0A"
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { searchQuery } = req.body
  const apiUrl = `${BASE_URL}?query=${searchQuery.trim()}&key=${GOOGLE_API_KEY}`
  const response = await axios.request({
    method: "post",
    url: apiUrl,
  })
  res.status(200).json({ data: response.data })
}
