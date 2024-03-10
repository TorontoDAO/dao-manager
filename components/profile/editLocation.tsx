// @ts-nocheck
import React, { useCallback, useState } from "react"
import axios from "axios"
import _ from "lodash"

import useAuth from "@/hooks/useAuth"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"

function extractLatLong({ latitude, longitude }: any) {
  function roundToOneDecimal(floatNumber: number) {
    return Math.round(floatNumber * 10) / 10
  }

  return {
    latitude: roundToOneDecimal(latitude),
    longitude: roundToOneDecimal(longitude),
  }
}

export const EditLocation = ({ fetchUser,open,onClose }: any) => {
  const [showLocationSearch, setShowLocationSearch] = useState(false)
  const [locationVal, setLocationVal] = useState<any>(null)

  const [searchLocation, setSearchLocation] = useState("")
  const [results, setResults] = useState([])
  const [locationSelected, setLocation] = useState<any>(null)
  const [locationError, setLocationError] = useState("")

  const fetchPlaces = async (searchQuery: string) => {
    if (!searchQuery) {
      setResults([])
      return
    }

    try {
      const response = await axios.post(`/api/location-search`, {
        searchQuery,
      })
      console.log(response.data.data.results)
      if (response.data.data && response.data.data.results) {
        setResults(response.data.data.results)
      }
    } catch (error) {
      console.error("Error fetching data: ", error)
      setResults([])
    }
  }

  // Debounce the fetchPlaces function
  const debouncedFetchPlaces = useCallback(_.debounce(fetchPlaces, 300), [])

  const handleSearch = (text: string) => {
    setSearchLocation(text)
    setLocation(null)
    debouncedFetchPlaces(text)
  }

  const { supabaseUser } = useAuth({})

  const enableUpdate = Boolean(locationVal)

  const getLocation = () => {
    if (!navigator.geolocation) {
      setShowLocationSearch(true)
      setLocationError("Geolocation is not supported by your browser")
      return
    }

    function success(position: any) {
      const latitude = position.coords.latitude
      const longitude = position.coords.longitude
      if (!Boolean(latitude)) {
        setShowLocationSearch(true)
      } else {
        setLocationVal({ latitude, longitude })
      }
    }

    function error() {
      setShowLocationSearch(true)
      setLocationError("Unable to retrieve your location")
    }
    if (!navigator?.geolocation?.getCurrentPosition) {
      setShowLocationSearch(true)
    }
    navigator.geolocation.getCurrentPosition(success, error)
  }

  return (
    <>
      <Sheet open={open} onOpenChange={onClose}>
        <SheetContent className="w-[400px] sm:w-[540px]">
          <SheetHeader>
            <SheetTitle>Update Location</SheetTitle>
          </SheetHeader>
          <div>
            {!showLocationSearch && (
              <>
                <label
                  htmlFor="location"
                  className="text-md block font-medium dark:text-gray-100"
                >
                  Approx. location is required
                </label>
                <button
                  type="button"
                  onClick={getLocation}
                  className="mt-1 w-full rounded-md bg-blue-500 px-3 py-2 text-xs text-white"
                >
                  {locationVal
                    ? `Latitude : ${
                        extractLatLong(locationVal)?.latitude
                      } , Longitude : ${extractLatLong(locationVal)?.longitude}`
                    : "Use current location"}
                </button>
              </>
            )}
            {showLocationSearch && (
              <>
                <label
                  htmlFor="location"
                  className="text-md block font-medium dark:text-gray-100"
                >
                  Search Location
                </label>
                <input
                  id="location"
                  type="text"
                  value={searchLocation}
                  onChange={(e) => {
                    handleSearch(e.target.value)
                  }}
                  className="mt-1 block w-full rounded-md border border-gray-600 px-3 py-2 shadow-sm dark:bg-black dark:text-white sm:text-sm"
                />
                <div className="mt-3 space-y-1">
                  {results.map((item: any) => (
                    <div
                      onClick={() => {
                        console.log(item)
                        setLocation(item)
                        setLocationVal(
                          extractLatLong({
                            latitude: item.geometry.location.lat,
                            longitude: item.geometry.location.lng,
                          })
                        )
                      }}
                      className={`w-full p-2 text-xs ${
                        item.place_id === locationSelected?.place_id
                          ? ""
                          : "bg-opacity-90"
                      } rounded-md border-2`}
                      key={item.place_id}
                    >
                      <p
                        className={` ${
                          item.place_id === locationSelected?.place_id
                            ? "font-bold"
                            : "font-light"
                        }`}
                      >
                        {item.formatted_address}
                      </p>
                    </div>
                  ))}
                </div>
              </>
            )}
            {locationError && (
              <p className="mt-2 text-sm text-red-600">{locationError}</p>
            )}
            <button
              className={`mt-3 w-full rounded-md bg-blue-500 px-4 py-2 text-white ${
                enableUpdate === true ? `opacity-1` : `opacity-70`
              }`}
              disabled={!enableUpdate}
              onClick={async () => {
                const {
                  data: { data },
                } = await axios.post("/api/supabase/select", {
                  table: "users",
                  match: { id: supabaseUser?.id },
                })
                await axios.post("/api/supabase/update", {
                  table: "users",
                  match: { id: supabaseUser?.id },
                  body: {
                    dao_info: {
                      ...data?.[0]?.dao_info,
                      location: locationVal,
                    },
                  },
                })
                fetchUser?.()
              }}
            >
              Update
            </button>
          </div>
        </SheetContent>
      </Sheet>
    </>
  )
}
