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
      !supabaseUser?.dao_info &&
      supabaseUser?.email &&
      userLoading === false
    ) {
      push("/set-user-info")
    }
  }, [push, supabaseUser, userLoading])

  if (!wagmiConfig) {
    return <></>
  }

  if (supabaseUser?.dao_info && supabaseUser?.email && userLoading === false) {
    return (
      <WagmiConfig config={wagmiConfig as any}>
        <Authenticated>
          <Tabs
            value={tab}
            onValueChange={(val) => {
              setTab(val)
            }}
          >
            <TabsContent style={{ height: "100vh" }} value="profile">
              <div>
                <Profile />
              </div>
            </TabsContent>
            <TabsContent style={{ height: "100vh" }} value="members">
              <div>
                <Members />
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
              <TabsTrigger style={{ width: "50%" }} value="profile">
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
              <TabsTrigger style={{ width: "50%" }} value="members">
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
            </TabsList>
          </Tabs>
        </Authenticated>
      </WagmiConfig>
    )
  }
  return <></>
}
