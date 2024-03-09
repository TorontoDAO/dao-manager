"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { logout } from "@/redux/userSlice"
import { createWeb3Modal, defaultWagmiConfig } from "@web3modal/wagmi/react"
import { About } from "components/about"
import { Authenticated } from "components/auth/authenticated"
import { MintHumanity } from "components/minthumanity"
import { Profile } from "components/profile"
import { Stamps } from "components/stamps"
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

  const dispatch = useDispatch()
  const [tab, setTab] = useState("stamps")

  if (!wagmiConfig) {
    return <></>
  }

  return (
    <SetUserInfo
      open={true}
      fetchUser={() => {
        fetchUser()
        push("/app");
      }}
    />
  )
}
