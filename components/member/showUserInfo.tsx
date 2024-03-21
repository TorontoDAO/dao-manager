// @ts-nocheck
import React, { useCallback, useState } from "react"
import { GoogleMap, MarkerF, useJsApiLoader } from "@react-google-maps/api"
import axios from "axios"
import _ from "lodash"

import useAuth from "@/hooks/useAuth"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"

function extractLatLng(inputStr = "") {
  if (inputStr?.latitude) {
    return {
      lat: inputStr?.latitude,
      lng: inputStr?.longitude,
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

export const ShowUserInfo = ({ data, open, onClose }: any) => {
  const { isLoaded } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: "AIzaSyCH9P8gyasf9bIWxk6bXUnk833jqyQudwI",
  })
  const [map, setMap] = React.useState(null)

  const onLoad = React.useCallback(function callback(map) {
    // This is just an example of getting and using the map instance!!! don't just blindly copy!
    setMap(map)
  }, [])

  const onUnmount = React.useCallback(function callback(map) {
    setMap(null)
  }, [])
  console.log(data?.location, data, extractLatLng(data?.location))
  const isLocation =
    data?.location?.latitude ||
    (typeof data?.location === "string" && data?.location.length !== 0)
  return (
    <>
      <Sheet open={open} onOpenChange={onClose}>
        <SheetContent className="w-[400px] overflow-y-scroll sm:w-[540px]">
          <SheetHeader>
            <SheetTitle>{data?.username}</SheetTitle>
          </SheetHeader>
          <div>
            <label
              htmlFor="username"
              className="text-md block font-medium dark:text-gray-100"
            >
              About Me
            </label>
            <div className="flex items-center">
              <p>
                {data?.introduce ??
                  `About me is Empty for ${data?.username} :)`}
              </p>
            </div>
            {isLoaded && isLocation && (
              <GoogleMap
                mapContainerStyle={{
                  width: "100%",
                  height: "300px",
                  borderRadius: 10,
                  marginTop: 10,
                }}
                center={extractLatLng(data?.location)}
                zoom={10}
                onLoad={onLoad}
                onUnmount={onUnmount}
              >
                <MarkerF position={extractLatLng(data?.location)} />
              </GoogleMap>
            )}
          </div>
        </SheetContent>
      </Sheet>
    </>
  )
}
