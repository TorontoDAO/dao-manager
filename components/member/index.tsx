/* eslint-disable @next/next/no-img-element */
import React, { useEffect, useState } from "react"
import axios from "axios"
import dayjs from "dayjs"

import { supabase } from "@/lib/supabase"

const DaoCard = ({ item }: any) => {
  const [profilepic, setProfilePic] = useState("")
  useEffect(() => {
    if (item?.dao_info?.profile_pic) {
      const { data } = supabase.storage
        .from("supabase-pfp")
        .getPublicUrl(item?.dao_info?.profile_pic)
      setProfilePic(data?.publicUrl)
    }
  }, [item])
  function roundToOneDecimal(floatNumber: any) {
    return Math.round(floatNumber * 10) / 10
  }
  return (
    <div className="rounded-lg border border-gray-200 p-4 dark:border-gray-800">
      <img
        src={`${profilepic}?string=${Math.random()}`}
        alt="profile"
        className="mb-2 size-14 rounded-full border border-gray-600 object-cover"
      />
      <p className="font-bold">{item?.username} </p>
      <p className="text-xs">Score : 87%</p>
      <p className="text-xs">User since {dayjs(item.created_at).format("DD MMMM YYYY")}</p>
    </div>
  )
}
export const Members = () => {
  const [accounts, setAccounts] = useState([])

  useEffect(() => {
    ;(async () => {
      const {
        data: { data },
      } = await axios.post("/api/supabase/fetchDaoUser")
      setAccounts(data)
    })()
  }, [])

  return (
    <>
      <div className="p-3 pb-16">
        <div className="mb-3">
          <h1 className=" text-3xl font-semibold">Members</h1>
          <p>
            Toronto DAO is an experimental decentralized, autonomous
            organization trying to create an economic and governance model that
            aligns with local community values.
            <br />
            At Toronto DAO, we believe in the power of community and
            collaboration to create positive change.
            <br />
            Our vision is to make Toronto a thriving city where all its citizens
            can flourish and prosper. We propose to create a unique model that
            allows donors to contribute to causes they care about while being
            recognized and rewarded for their generosity.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {accounts.map((item: any) => (
            <DaoCard key={item.id} item={item} />
          ))}
        </div>
      </div>
    </>
  )
}
