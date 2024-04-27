"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { logout } from "@/redux/userSlice"
import { createWeb3Modal, defaultWagmiConfig } from "@web3modal/wagmi/react"
import { About } from "components/about"
import { Authenticated } from "components/auth/authenticated"
import { MintHumanity } from "components/minthumanity"
import { Profile } from "components/profile"
import { useDispatch } from "react-redux"
import { WagmiConfig } from "wagmi"
import { arbitrum, mainnet } from "wagmi/chains"

import useAuth from "@/hooks/useAuth"
import { buttonVariants } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Members } from "@/components/member"
import { SetUserInfo } from "@/components/setUserInfo"

import { MintNft } from "./../../components/mint-nft"

export default function IndexPage() {
  const [wagmiConfig, setWagmiConfig] = useState(
    defaultWagmiConfig({
      chains: [mainnet, arbitrum],
      projectId: "046f59ead3e8ec7acd1db6ba73cd23b7",
      metadata: {
        name: "Web3Modal",
        description: "Web3Modal Example",
        url: "https://web3modal.com",
        icons: ["https://avatars.githubusercontent.com/u/37784886"],
      },
    })
  )
  const { supabaseUser, fetchUser, loading: userLoading } = useAuth({})
  const { push } = useRouter()
  useEffect(() => {
    // 1. Get projectId
    const projectId = "046f59ead3e8ec7acd1db6ba73cd23b7"

    // 2. Create wagmiConfig
    const metadata = {
      name: "Web3Modal",
      description: "Web3Modal Example",
      url: "https://web3modal.com",
      icons: ["https://avatars.githubusercontent.com/u/37784886"],
    }

    const chains = [mainnet, arbitrum]
    const wConfig = defaultWagmiConfig({ chains, projectId, metadata })
    setWagmiConfig(wConfig as any)
    createWeb3Modal({ wagmiConfig: wConfig, projectId, chains })
  }, [])

  useEffect(() => {
    fetchUser?.()
  }, [fetchUser])

  const dispatch = useDispatch()
  const [tab, setTab] = useState("profile")

  useEffect(() => {
    if (
      !supabaseUser?.user_data &&
      supabaseUser?.email &&
      userLoading === false
    ) {
      push("/set-user-info")
    }
  }, [push, supabaseUser, userLoading])

  if (!wagmiConfig) {
    return <></>
  }

  if (supabaseUser?.user_data && supabaseUser?.email && userLoading === false) {
    return (
      <WagmiConfig config={wagmiConfig as any}>
        <Authenticated>
          <Tabs
            value={tab}
            onValueChange={(val) => {
              setTab(val)
            }}
          >
            <TabsContent
              style={{ minHeight: "100vh", paddingBottom: "100px" }}
              value="profile"
            >
              <div>
                <Profile />
              </div>
            </TabsContent>
            <TabsContent
              style={{ minHeight: "100vh", paddingBottom: "100px" }}
              value="members"
            >
              <div>
                <Members />
              </div>
            </TabsContent>
            <TabsContent
              style={{ minHeight: "100vh", paddingBottom: "100px" }}
              value="mintnft"
            >
              <div>
                <MintNft />
              </div>
            </TabsContent>
            <TabsList
              style={{
                width: "95%",
                marginLeft: "2.5%",
                position: "fixed",
                bottom: 10,
                left: 0,
              }}
            >
              <TabsTrigger style={{ width: "33.33%" }} value="profile">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="size-6"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M17.982 18.725A7.488 7.488 0 0012 15.75a7.488 7.488 0 00-5.982 2.975m11.963 0a9 9 0 10-11.963 0m11.963 0A8.966 8.966 0 0112 21a8.966 8.966 0 01-5.982-2.275M15 9.75a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
              </TabsTrigger>
              <TabsTrigger style={{ width: "33.33%" }} value="members">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke-width="1.5"
                  stroke="currentColor"
                  className="size-6"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="M18 18.72a9.094 9.094 0 0 0 3.741-.479 3 3 0 0 0-4.682-2.72m.94 3.198.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0 1 12 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 0 1 6 18.719m12 0a5.971 5.971 0 0 0-.941-3.197m0 0A5.995 5.995 0 0 0 12 12.75a5.995 5.995 0 0 0-5.058 2.772m0 0a3 3 0 0 0-4.681 2.72 8.986 8.986 0 0 0 3.74.477m.94-3.197a5.971 5.971 0 0 0-.94 3.197M15 6.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm6 3a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Zm-13.5 0a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Z"
                  />
                </svg>
              </TabsTrigger>
              <TabsTrigger style={{ width: "33.33%" }} value="mintnft">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 30 30"
                  stroke-width="1.5"
                  stroke="currentColor"
                  className="size-6"
                >
                  <g xmlns="http://www.w3.org/2000/svg">
                    <path d="M20.178,8.886l-3.19,-0.855c-1.599,-0.429 -3.245,0.522 -3.674,2.121l-1.012,3.776l-3.302,0c-1.656,0 -3,1.344 -3,3c0,0 0,24 0,24c0,1.656 1.344,3 3,3l16,0c1.656,0 3,-1.344 3,-3l0,-0.582l0.949,-3.54l12.227,-20.29c0.003,-0.005 0.007,-0.011 0.01,-0.016c0.828,-1.434 0.335,-3.27 -1.098,-4.098c-0,-0 -13.857,-8 -13.857,-8c-1.434,-0.828 -3.27,-0.336 -4.098,1.098l-1.955,3.386Zm-2.664,13.257c-0.316,-0.191 -0.712,-0.191 -1.028,-0l-5,3c-0.302,0.18 -0.486,0.506 -0.486,0.857l-0,6c-0,0.351 0.184,0.677 0.486,0.857l5,3c0.316,0.191 0.712,0.191 1.028,0l5,-3c0.302,-0.18 0.486,-0.506 0.486,-0.857l-0,-6c0,-0.351 -0.184,-0.677 -0.486,-0.857l-5,-3Zm-0.514,2.023l4,2.4c-0,0 -0,4.868 -0,4.868c-0,-0 -4,2.4 -4,2.4c-0,-0 -4,-2.4 -4,-2.4c-0,-0 -0,-4.868 -0,-4.868l4,-2.4Zm3.387,-13.154l-3.916,-1.049c-0.533,-0.143 -1.082,0.174 -1.225,0.707l-0.873,3.258l10.627,0c1.656,0 3,1.344 3,3l-0,15.69l4.633,-17.289c0.143,-0.534 -0.174,-1.082 -0.707,-1.225l-11.507,-3.083c-0.01,-0.003 -0.021,-0.006 -0.032,-0.009Zm10.431,18.817c3.624,-6.014 8.641,-14.339 8.645,-14.345c0.263,-0.475 0.097,-1.077 -0.375,-1.35c-0,0 -13.857,-8 -13.857,-8c-0.478,-0.276 -1.09,-0.112 -1.366,0.366l-1.687,2.921l10.265,2.751c1.6,0.428 2.55,2.075 2.122,3.674l-3.747,13.983Z" />
                  </g>
                </svg>
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </Authenticated>
      </WagmiConfig>
    )
  }
  return (
    <>
      <p className="p-2 animate-pulse">Loading Your Profile</p>
    </>
  )
}
