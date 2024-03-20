/* eslint-disable @next/next/no-img-element */
import React, { useCallback, useEffect, useState } from "react"
import axios from "axios"
import { Stamps } from "components/stamps"
import { useDispatch, useSelector } from "react-redux"
import { toast } from "react-toastify"

import { supabase } from "@/lib/supabase"
import useAuth from "@/hooks/useAuth"
import { Button, buttonVariants } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"

import { logout } from "../../redux/userSlice"
import { EditAboutMe } from "./editAboutme"
import { EditLocation } from "./editLocation"
import { EditProfilePicture } from "./editProfilePicture"
import { EditUsername } from "./editUsername"

export const Profile = () => {
  const { email = "" } = useSelector((state: any) => state?.user) ?? {}
  const dispatch = useDispatch()
  const [userState, setUserState] = useState<any>({})
  const [walletState, setWalletState] = useState<any>({})
  const [exportPrivateKey, setExportPrivateKey] = useState(undefined)
  const [profilePic, setProfilePic] = useState("")

  const [usernameModalOpen, setUsernameModalOpen] = useState(false)
  const [profilePictureModalOpen, setProfilePictureModalOpen] = useState(false)
  const [locationModalOpen, setLocationModalOpen] = useState(false)
  const [introduceModalOpen, setIntroduceModalOpen] = useState(false)

  const fetchStamps = useCallback(async () => {
    if (email) {
      const {
        data: { data: userData },
      } = await axios.post("/api/supabase/select", {
        match: { email },
        table: "users",
      })
      setUserState(userData?.[0])
    }
  }, [email])

  const fetchWalletDetails = useCallback(async (email: string) => {
    const {
      data: { data: wallet_details },
    } = await axios.post(`/api/supabase/select`, {
      match: {
        email,
      },
      table: "wallet_details",
    })
    if (wallet_details?.[0]) {
      setWalletState(wallet_details?.[0])
    } else {
      setWalletState(null)
    }
  }, [])

  useEffect(() => {
    if (email) {
      fetchStamps()
      fetchWalletDetails(email)
    }
  }, [fetchStamps, fetchWalletDetails, email])

  const [nearAcc, setNearAcc] = useState([])
  const [allNearData, setAllNearData] = useState([])
  const [allEvmData, setAllEvmData] = useState([])
  const { supabaseUser, fetchUser } = useAuth({})

  useEffect(() => {
    if (supabaseUser?.dao_info?.profile_pic) {
      const { data } = supabase.storage
        .from("supabase-pfp")
        .getPublicUrl(supabaseUser?.dao_info?.profile_pic)
      setProfilePic(data?.publicUrl)
    }
  }, [supabaseUser])

  const fetchWallets = useCallback(async () => {
    if (supabaseUser?.id) {
      const {
        data: { data },
      } = await axios.post("/api/supabase/select", {
        match: {
          created_by_user_id: supabaseUser.id,
          stamptype: 15,
        },
        table: "stamps",
      })
      const {
        data: { data: evmData },
      } = await axios.post("/api/supabase/select", {
        match: {
          created_by_user_id: supabaseUser.id,
          stamptype: 14,
        },
        table: "stamps",
      })
      const allNearAcc = data.map((item: any) => item.uniquevalue)
      setAllEvmData((evmData ?? []).map((item: any) => item.uniquevalue))
      setNearAcc(allNearAcc)
      setAllNearData(data)
    }
  }, [supabaseUser])

  const fetchPrivateKeyWithAddress = (nearKey: any) => {
    const stampData = (
      allNearData.find((item: any) => item.uniquevalue === nearKey) as any
    )?.stamp_json?.transaction?.signature
    setExportPrivateKey(stampData)
  }

  useEffect(() => {
    fetchWallets()
  }, [fetchWallets])

  function roundToOneDecimal(floatNumber: any) {
    return Math.round(floatNumber * 10) / 10
  }

  const editButton = ({ onClick }: any) => {
    return (
      <button onClick={onClick} className="text-black dark:text-white">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke-width="1.5"
          stroke="currentColor"
          className="size-3"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L6.832 19.82a4.5 4.5 0 0 1-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 0 1 1.13-1.897L16.863 4.487Zm0 0L19.5 7.125"
          />
        </svg>
      </button>
    )
  }

  const [stampPanelOpen, setStampPanelOpen] = useState(false)

  return (
    <div className="p-3">
      <h1 className="mb-2 text-3xl font-semibold">Profile</h1>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>User Profile</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            {Boolean(supabaseUser?.dao_info?.username) && (
              <>
                <div>
                  <div className="flex items-center space-x-2">
                    <img
                      src={`${profilePic}?string=${Math.random()}`}
                      alt="profile"
                      className="mb-2 size-14 rounded-full border border-gray-600"
                    />
                    {editButton({
                      onClick: () => {
                        setProfilePictureModalOpen(true)
                      },
                    })}
                  </div>
                  <div className="flex items-center space-x-2">
                    <p>Username : {supabaseUser?.dao_info?.username} </p>
                    {editButton({
                      onClick: () => {
                        setUsernameModalOpen(true)
                      },
                    })}
                  </div>
                  <div className="flex items-center space-x-2">
                    <p>
                      Location : Latitude :{" "}
                      {roundToOneDecimal(
                        supabaseUser?.dao_info?.location.latitude
                      )}{" "}
                      Longitude :{" "}
                      {roundToOneDecimal(
                        supabaseUser?.dao_info?.location.longitude
                      )}
                    </p>
                    {editButton({
                      onClick: () => {
                        setLocationModalOpen(true)
                      },
                    })}
                  </div>
                  <p>About Me</p>
                  <div className="flex items-center space-x-2">
                    <p>{supabaseUser?.dao_info?.introduce}</p>
                    {editButton({
                      onClick: () => {
                        setIntroduceModalOpen(true)
                      },
                    })}
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>
        <Card style={{ height: "auto" }}>
          <CardHeader>
            <CardTitle>My Torontonian Score</CardTitle>
            <CardDescription>
              We aggregate all the data points you've provided to score "how
              Torontonian" you are.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="translate-y-[-10px]">
              Your score can be used in the future to determine your membership
              tier among other things. We also use it to make sure our members
              are real humans and not bots. You can increase your score by
              adding more "stamps" here.
            </p>
            <div className="flex items-center justify-between">
              <p className="text-2xl">87%</p>
              <Button
                onClick={() => {
                  setStampPanelOpen(true)
                }}
              >
                Add
              </Button>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>My Wallets</CardTitle>
            <CardDescription>
              List of wallets you have connected to cubid
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {Boolean((userState as any)?.iah) && (
                <Button className="block" variant="outline">
                  NEAR : {(userState as any)?.iah}
                </Button>
              )}
              {Boolean(walletState?.["wallet-address"]) && (
                <Button className="block" variant="outline">
                  G$ : {walletState?.["wallet-address"]}
                </Button>
              )}
              {allEvmData.map((item) => (
                <Button className="block" key={item} variant="outline">
                  {item}
                </Button>
              ))}
              {/* {nearAcc.map((item) => (
                <div className="flex items-center justify-between">
                  <Button className="block" key={item} variant="outline">
                    {item}
                  </Button>
                  {Boolean(
                    (
                      allNearData.find(
                        (_: any) => _.uniquevalue === item
                      ) as any
                    )?.stamp_json?.transaction?.signature
                  ) && (
                    <button
                      onClick={() => {
                        fetchPrivateKeyWithAddress(item)
                      }}
                      className="rounded-md bg-blue-600 p-2 py-1 text-xs text-white"
                    >
                      Export Private Key
                    </button>
                  )}
                </div>
              ))} */}
            </div>
          </CardContent>
        </Card>
        <Card style={{ height: "auto" }}>
          <CardHeader>
            <CardTitle>Language Preferences</CardTitle>
          </CardHeader>
          <CardContent>
            <Select>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Language" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="en">English</SelectItem>
                <SelectItem value="fr">French</SelectItem>
                <SelectItem value="gm">German</SelectItem>
                <SelectItem value="sp">Spanish</SelectItem>
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Login & Security</CardTitle>
          </CardHeader>
          <CardContent>
            <div>
              <p>Email : {email} </p>
              <div className="my-2 flex items-center gap-2">
                <img
                  alt="image"
                  className="size-20 rounded"
                  src="https://media.licdn.com/dms/image/C4D0BAQF0BbRWBLibVQ/company-logo_200_200/0/1622628086077?e=2147483647&v=beta&t=z_LYy9iZWArzniYy0I2aWqRgyK6kMTLcRsSuW7dZfq0"
                />
                <p>Enabled Login</p>
              </div>
              <Button
                onClick={() => {
                  dispatch(logout())
                  window.location.href = window.location.origin
                }}
                className="mt-2"
              >
                Logout
              </Button>
            </div>
          </CardContent>
        </Card>
        <Sheet
          open={stampPanelOpen}
          onOpenChange={(value) => {
            if (value === false) {
              setStampPanelOpen(false)
            }
          }}
        >
          <SheetContent className="!w-[100vw] !min-w-[100vw] !max-w-[100vw] overflow-y-scroll">
            <SheetHeader>
              <SheetTitle>Add Stamps</SheetTitle>
            </SheetHeader>
            <Stamps />
          </SheetContent>
        </Sheet>
        <EditUsername
          fetchUser={() => {
            setUsernameModalOpen(false)
            fetchUser?.()
          }}
          open={usernameModalOpen}
          onClose={() => {
            setUsernameModalOpen(false)
          }}
        />
        <EditLocation
          fetchUser={() => {
            setLocationModalOpen(false)
            fetchUser?.()
          }}
          open={locationModalOpen}
          onClose={() => {
            setLocationModalOpen(false)
          }}
        />
        <EditProfilePicture
          fetchUser={() => {
            setProfilePictureModalOpen(false)
            fetchUser?.()
          }}
          open={profilePictureModalOpen}
          onClose={() => {
            setProfilePictureModalOpen(false)
          }}
        />
        <EditAboutMe
          fetchUser={() => {
            setIntroduceModalOpen(false)
            fetchUser?.()
          }}
          open={introduceModalOpen}
          onClose={() => {
            setIntroduceModalOpen(false)
          }}
        />
      </div>
    </div>
  )
}
