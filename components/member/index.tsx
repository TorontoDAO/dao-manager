/* eslint-disable @next/next/no-img-element */
import React, { useEffect, useState } from "react"
import { GoogleMap, MarkerF, useJsApiLoader } from "@react-google-maps/api"
import axios from "axios"
import dayjs from "dayjs"

import { supabase } from "@/lib/supabase"

import { ShowUserInfo } from "./showUserInfo"

const DaoCard = ({ item }: any) => {
  const [profilepic, setProfilePic] = useState("")
  useEffect(() => {
    if (item?.user_data?.profile_pic) {
      const { data } = supabase.storage
        .from("supabase-pfp")
        .getPublicUrl(item?.user_data?.profile_pic)
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
      <p className="text-xs">Score : {item.score}</p>
      <p className="text-xs">
        User since {dayjs(item.created_at).format("DD MMMM YYYY")}
      </p>
    </div>
  )
}
export const Members = () => {
  const [accounts, setAccounts] = useState([])

  function extractLatLng(inputStr = "") {
    if ((inputStr as any)?.latitude) {
      return {
        lat: (inputStr as any)?.latitude,
        lng: (inputStr as any)?.longitude,
      }
    }
    // Use a regular expression to find matches for latitude and longitude in the input string
    const latLngRegex =
      /Latitude:\s*([-+]?[0-9]*\.?[0-9]+),\s*Longitude:\s*([-+]?[0-9]*\.?[0-9]+)/
    const match = inputStr.match(latLngRegex)

    if (match) {
      // Convert the matched latitude and longitude strings to numbers
      const latitude = parseFloat(match[1])
      const longitude = parseFloat(match[2])

      // Return an object with the latitude and longitude
      return { lat: latitude, lng: longitude }
    } else {
      // If the input string doesn't match the expected format, return null or an error
      return null
    }
  }

  useEffect(() => {
    ;(async () => {
      const {
        data: { data },
      } = await axios.post("/api/supabase/fetchDaoUser")
      setAccounts(data)
    })()
  }, [])

  const { isLoaded } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: "AIzaSyCH9P8gyasf9bIWxk6bXUnk833jqyQudwI",
  })
  const [map, setMap] = React.useState(null)

  const onLoad = React.useCallback(function callback(map: any) {
    // This is just an example of getting and using the map instance!!! don't just blindly copy!
    setMap(map)
  }, [])

  const onUnmount = React.useCallback(function callback(map: any) {
    setMap(null)
  }, [])

  const [userData, setUserData] = useState(null)

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
        {isLoaded && accounts?.length !== 0 && (
          <GoogleMap
            mapContainerStyle={{
              width: "100%",
              height: "400px",
              borderRadius: 10,
              marginTop: 10,
              marginBottom: 10,
            }}
            center={{ lat:43.6532  , lng: -79.3832 }}
            zoom={9}
            onLoad={onLoad}
            onUnmount={onUnmount}
          >
            {accounts.map((item: any) => {
              const isLocation =
                item?.user_data?.location?.latitude ||
                (typeof item?.user_data?.location === "string" &&
                  item?.user_data?.location.length !== 0)
              return (
                <>
                  {isLocation && (
                    <MarkerF
                      title={item?.username}
                      position={extractLatLng(item?.user_data?.location) as any}
                    />
                  )}
                </>
              )
            })}
          </GoogleMap>
        )}
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {accounts.map((item: any) => (
            <div
              className="cursor-pointer"
              onClick={() => {
                setUserData(item?.user_data)
              }}
            >
              <DaoCard key={item.id} item={item} />
            </div>
          ))}
        </div>
        <ShowUserInfo
          data={userData}
          open={Boolean(userData)}
          onClose={() => {
            setUserData(null)
          }}
        />
      </div>
    </>
  )
}
