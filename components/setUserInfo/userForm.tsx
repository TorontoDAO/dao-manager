/* eslint-disable tailwindcss/migration-from-tailwind-2 */
// @ts-nocheck
import React, { useCallback, useState } from "react"
import { GoogleMap, MarkerF, useJsApiLoader } from "@react-google-maps/api"
import axios from "axios"
import _ from "lodash"
import { useForm } from "react-hook-form"

import useAuth from "@/hooks/useAuth"

import { supabase } from "../../lib/supabase"
import { SetLocation } from "./setLocation"

function extractLatLong({ latitude, longitude }) {
  function roundToOneDecimal(floatNumber) {
    return Math.round(floatNumber * 10) / 10
  }

  return {
    latitude: roundToOneDecimal(latitude),
    longitude: roundToOneDecimal(longitude),
  }
}

export function UserProfileForm({ fetchUser }: any) {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm()
  const { isLoaded } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: "AIzaSyCH9P8gyasf9bIWxk6bXUnk833jqyQudwI",
  })
  const location = watch("location")
  const formValues = watch()
  const [locationError, setLocationError] = useState("")
  const [userNameLoading, setUserNameLoading] = useState(false)
  const [isUsernameAvailable, setIsUsernameAvailable] = useState<any>(null)
  const [profilePic, setProfilePic] = useState("")
  const [uploadingProfile, setUploadingProfile] = useState(false)
  const [showLocationSearch, setShowLocationSearch] = useState(false)
  const { supabaseUser } = useAuth({})
  const [showWelcomeMessage, setShowWelcomeMessage] = useState(false)
  const [steps, setStep] = useState(0)

  const [locationSelectionType, setLocationSelectionType] = useState("gps")

  const [pincodeSearchVal, setPincodeSearchVal] = useState("")

  const onSubmit = async (data: any) => {
    await axios.post("/api/supabase/update", {
      table: "users",
      body: {
        user_info: {
          name: `${formValues.firstName} ${formValues.lastName}`,
        },
        dao_info: {
          profile_pic: profilePic,
          username: formValues?.username,
          location: formValues?.location,
          introduce: formValues?.introduce,
          howdidyouhear: formValues?.howdidyouhear,
        },
        username: formValues?.username,
      },
      match: {
        id: supabaseUser?.id,
      },
    })
    setShowWelcomeMessage(true)
    setTimeout(() => {
      fetchUser()
    }, 10000)
  }

  const getLocation = () => {
    if (!navigator.geolocation) {
      setLocationSelectionType("google")
      setLocationError("Geolocation is not supported by your browser")
      return
    }

    function success(position: any) {
      const latitude = position.coords.latitude
      const longitude = position.coords.longitude
      if (!Boolean(latitude)) {
        setLocationSelectionType("google")
      } else {
        setValue("location", { latitude, longitude })
      }
    }

    function error() {
      setLocationSelectionType("google")
      setLocationError("Unable to retrieve your location")
    }
    if (!navigator?.geolocation?.getCurrentPosition) {
      setLocationSelectionType("google")
    }
    navigator.geolocation.getCurrentPosition(success, error)
  }

  const search = async (username: string) => {
    const {
      data: { data, error },
    } = await axios.post("/api/supabase/search-username", {
      username,
    })
    if (data.length === 0) {
      setIsUsernameAvailable(true)
    } else {
      setIsUsernameAvailable(false)
    }
    setUserNameLoading(false)
    console.log(data, error)
  }

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const searchUserName = useCallback(_.debounce(search, 500), [])

  const [searchLocation, setSearchLocation] = useState("")
  const [results, setResults] = useState([])
  const [locationSelected, setLocation] = useState(null)

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

  const [pincodeResults, setPincodeResults] = useState([])

  const fetchPincode = useCallback(async (searchQuery) => {
    if (!searchQuery) {
      setPincodeResults([])
      return
    }

    try {
      const response = await axios.post(`/api/supabase/select`, {
        table: "postal_zip_codes",
        match: {
          postal_or_zip_code: searchQuery,
          country: "canada",
        },
      })

      if (response.data.data) {
        setPincodeResults(response.data.data ?? [])
      }
    } catch (error) {
      console.error("Error fetching data: ", error)
      setPincodeResults([])
    }
  }, [])

  const debounceFetchPincode = useCallback(_.debounce(fetchPincode, 300), [])

  const handlePostalCodeSearch = (text: string) => {
    setPincodeSearchVal(text)
    setLocation(null)
    debounceFetchPincode(text)
  }

  if (showWelcomeMessage) {
    return (
      <div className="mt-2">
        <hr className="my-1" />
        <p className="my-2 font-bold">
          On the next page you can opt in to provide more information about
          yourself in the form of “stamps” which will increase your score. This
          information will not be shown to anyone else (unless you explicitly
          allow it later.) The primary purpose of the stamps is to provide
          calculate an experimental “humanity score.” This score is the only
          thing other members will see
        </p>
        <p className="animate-pulse text-xs">
          Redirecting you to the dashboard in 10 seconds
        </p>
      </div>
    )
  }

  if (steps === 1) {
    return (
      <>
        <p>
          Thanks. Now choose a a username, a profile picture and your
          approximate location. This information will be public to all members.
        </p>
        <p className="text-sm italic">
          We don’t store your exact location. We round it to the nearest decimal
          place of both longitude and latitude, which is approx +\- 1km.{" "}
        </p>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label
              htmlFor="username"
              className="text-md block font-medium dark:text-gray-100"
            >
              Username
            </label>
            <div className="flex items-center">
              <input
                id="username"
                type="text"
                {...register("username", { required: true })}
                onChange={(e) => {
                  setIsUsernameAvailable(null)
                  if (e.target.value.length > 2) {
                    setUserNameLoading(true)
                    setValue("username", e.target.value.toLowerCase())
                    searchUserName(e.target.value.toLowerCase())
                  } else {
                    setUserNameLoading(false)
                    setValue("username", e.target.value.toLowerCase())
                  }
                }}
                className="mt-1 block w-full rounded-md border border-gray-600 px-3 py-2 shadow-sm dark:bg-black dark:text-white sm:text-sm"
              />
              {isUsernameAvailable && (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke-width="1.5"
                  stroke="currentColor"
                  className="size-6 text-green-500"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="m4.5 12.75 6 6 9-13.5"
                  />
                </svg>
              )}
              {isUsernameAvailable === false && (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke-width="1.5"
                  stroke="currentColor"
                  className="size-6 text-red-500"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="M6 18 18 6M6 6l12 12"
                  />
                </svg>
              )}
              {userNameLoading && (
                <>
                  <div className="mx-1" role="status">
                    <svg
                      aria-hidden="true"
                      className="size-6 animate-spin fill-blue-600 text-gray-200 dark:text-gray-600"
                      viewBox="0 0 100 101"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
                        fill="currentColor"
                      />
                      <path
                        d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
                        fill="currentFill"
                      />
                    </svg>
                    <span className="sr-only">Loading...</span>
                  </div>
                </>
              )}
            </div>
            {!formValues.username && errors.username && (
              <p className="mt-2 text-sm text-red-600">Username is required</p>
            )}
            {isUsernameAvailable === false && (
              <p className="mt-2 text-sm text-red-600">Username unavailable</p>
            )}
            {isUsernameAvailable && (
              <p className="mt-2 text-sm text-green-500">Username available</p>
            )}
          </div>

          <div>
            <label
              htmlFor="profilePhoto"
              className="text-md block font-medium dark:text-gray-100"
            >
              Profile Photo
            </label>
            <input
              id="profilePhoto"
              type="file"
              accept="image/*"
              {...register("profilePhoto", { required: true })}
              onChange={async (e: any) => {
                setUploadingProfile(true)
                const file = e.target.files[0]
                const fileToBlob = async (files) =>
                  new Blob([new Uint8Array(await files.arrayBuffer())], {
                    type: files.type,
                  })

                const { data, error } = await supabase.storage
                  .from("supabase-pfp")
                  .upload(
                    `images/${supabaseUser?.email}.png`,
                    await fileToBlob(file),
                    {
                      cacheControl: "3600",
                      upsert: true,
                    }
                  )
                setProfilePic(data?.path ?? "")
                setUploadingProfile(false)
              }}
              className="mt-1 block w-full rounded-md border border-gray-600 px-3 py-2 shadow-sm dark:bg-black dark:text-white sm:text-sm"
            />
            {uploadingProfile && (
              <>
                <p className="animate-pulse">Uploading your profile pic</p>
              </>
            )}
            {!Boolean(profilePic) && errors.profilePhoto && (
              <p className="mt-2 text-sm text-red-600">
                Profile photo is required
              </p>
            )}
          </div>

          <div>
            <label
              for="location"
              className="mb-2 block text-sm font-medium text-gray-900 dark:text-white"
            >
              Location Selection
            </label>
            <select
              id="location"
              value={locationSelectionType}
              onChange={(e) => {
                setLocationSelectionType(e.target.value)
              }}
              className="mb-4 block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500"
            >
              <option value="gps">Auto Detect via GPS</option>
              <option value="google">Search Your Location via Google</option>
              <option value="manual">Enter Your Postcode Manually</option>
            </select>
            {locationSelectionType === "gps" && (
              <>
                <label
                  htmlFor="location"
                  d
                  className="text-md block font-medium dark:text-gray-100"
                >
                  Approx. location is required
                </label>
                <button
                  type="button"
                  onClick={getLocation}
                  className="mt-1 w-full rounded-md bg-blue-500 px-3 py-2 text-xs text-white"
                >
                  {location
                    ? `Latitude : ${
                        extractLatLong(location)?.latitude
                      } , Longitude : ${extractLatLong(location)?.longitude}`
                    : "Use current location"}
                </button>
              </>
            )}
            {locationSelectionType === "google" && (
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
                  {locationSelected?.place_id ? (
                    <>
                      {results.map((item: any) =>
                        locationSelected?.place_id === item.place_id ? (
                          <div
                            onClick={() => {
                              console.log(item)
                              setLocation(item)
                              setValue(
                                "location",
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
                        ) : (
                          <></>
                        )
                      )}
                    </>
                  ) : (
                    results.map((item: any) => (
                      <div
                        onClick={() => {
                          console.log(item)
                          setLocation(item)
                          setValue(
                            "location",
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
                    ))
                  )}
                </div>
              </>
            )}
            {locationSelectionType === "manual" && (
              <>
                <label
                  htmlFor="pincode"
                  className="text-md block font-medium dark:text-gray-100"
                >
                  Postal Code{" "}
                  <span className="text-xs">
                    (enter a 3 letter postal code)
                  </span>
                </label>
                <input
                  id="location"
                  type="text"
                  value={pincodeSearchVal}
                  onChange={(e) => {
                    handlePostalCodeSearch(e.target.value.toLocaleUpperCase())
                  }}
                  className="mt-1 block w-full rounded-md border border-gray-600 px-3 py-2 shadow-sm dark:bg-black dark:text-white sm:text-sm"
                />
                <div className="mt-2 grid grid-cols-1 md:grid-cols-3">
                  {pincodeSearchVal.length === 3 &&
                    pincodeResults.length === 0 && (
                      <p>Not a valid postal code</p>
                    )}
                  {pincodeResults.length !== 0 && (
                    <p>Please select a location</p>
                  )}
                  {pincodeResults.map((item) => {
                    console.log(item)
                    return (
                      <div
                        onClick={() => {
                          setLocation(item)
                          setValue(
                            "location",
                            extractLatLong({
                              latitude: item.lat,
                              longitude: item.lng,
                            })
                          )
                        }}
                        className={`w-full text-xs ${
                          item.id === locationSelected?.id
                            ? "border-blue-500"
                            : "bg-opacity-90"
                        } rounded-md border-2 p-2`}
                        key={item.id}
                      >
                        {isLoaded && (
                          <GoogleMap
                            mapContainerStyle={{
                              width: "100%",
                              height: "200px",
                              borderRadius: 5,
                            }}
                            center={{ lat: item.lat ?? 0, lng: item.lng ?? 0 }}
                            zoom={10}
                          >
                            <MarkerF
                              position={{
                                lat: item.lat ?? 0,
                                lng: item.lng ?? 0,
                              }}
                            />
                          </GoogleMap>
                        )}
                      </div>
                    )
                  })}
                </div>
              </>
            )}
            <input
              id="location"
              type="text"
              {...register("location", { required: true })}
              className="mt-1 hidden w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
              readOnly
            />
            {locationError && (
              <p className="mt-2 text-sm text-red-600">{locationError}</p>
            )}
            {!formValues.location && errors.location && (
              <p className="mt-2 text-sm text-red-600">Location is required</p>
            )}
          </div>
          <div>
            <label className="text-md block font-medium dark:text-gray-100">
              Introduce yourself to the community. What are you hoping to
              provide to the community and what would you like to get out of
              your membership?
            </label>
            <div className="flex items-center">
              <textarea
                type="text"
                {...register("introduce")}
                className="mt-1 block w-full rounded-md border border-gray-600 px-3 py-2 shadow-sm dark:bg-black dark:text-white sm:text-sm"
              />
            </div>
          </div>
          <button
            type="submit"
            disabled={!isUsernameAvailable || uploadingProfile}
            className={`w-full rounded-md bg-blue-500 px-4 py-2 text-white ${
              isUsernameAvailable === true ? `opacity-1` : `opacity-70`
            }`}
          >
            Submit
          </button>
        </form>
      </>
    )
  }
  return (
    <>
      <p>
        It looks like you are new here. To sign up, please first let our admins
        know who you are and how you heard about us.
      </p>
      <form
        onSubmit={handleSubmit((data) => {
          setStep(1)
        })}
        className="space-y-4"
      >
        <div>
          <label
            htmlFor="firstName"
            className="text-md block font-medium dark:text-gray-100"
          >
            First Name
          </label>
          <input
            id="firstName"
            type="text"
            {...register("firstName", { required: true })}
            className="mt-1 block w-full rounded-md border border-gray-600 px-3 py-2 shadow-sm dark:bg-black dark:text-white sm:text-sm"
          />
          {errors.firstName && (
            <p className="mt-2 text-sm text-red-600">First Name is required</p>
          )}
        </div>

        <div>
          <label
            htmlFor="lastName"
            className="text-md block font-medium dark:text-gray-100"
          >
            Last Name
          </label>
          <input
            id="lastName"
            type="text"
            {...register("lastName", { required: true })}
            className="mt-1 block w-full rounded-md border border-gray-600 px-3 py-2 shadow-sm dark:bg-black dark:text-white sm:text-sm"
          />
          {errors.lastName && (
            <p className="mt-2 text-sm text-red-600">Last Name is required</p>
          )}
        </div>
        <div>
          <label className="text-md block font-medium dark:text-gray-100">
            How did you hear about us ?
          </label>
          <div className="flex items-center">
            <textarea
              type="text"
              {...register("howdidyouhear")}
              className="mt-1 block w-full rounded-md border border-gray-600 px-3 py-2 shadow-sm dark:bg-black dark:text-white sm:text-sm"
            />
          </div>
        </div>
        <button
          type="submit"
          className="w-full rounded-md bg-blue-500 px-4 py-2 text-white"
        >
          Next
        </button>
      </form>
    </>
  )
}
