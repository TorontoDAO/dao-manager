import React, { useCallback, useEffect, useState } from "react"
import { useWeb3Modal } from "@web3modal/wagmi/react"
import axios from "axios"
import { useAccount } from "wagmi"
import Web3 from "web3"

import { encode_data } from "@/lib/encode_data"
import useAuth from "@/hooks/useAuth"

export const MintNft = () => {
  const [stepVal, setStepVal] = useState(0)
  const [eligibleToMint, setEligibleToMint] = useState(false)
  const [accounts, setAccounts] = useState<any>([])
  const { supabaseUser, getUser } = useAuth({})
  const [loading, setLoading] = useState(true)
  const { address: web3Address } = useAccount()
  const { open } = useWeb3Modal()
  const [selectedAccToMint, setSelectedAccToMint] = useState<string | null>(
    null
  )
  const [selectedAccHasNft, setSelectedAccHasNft] = useState<boolean | null>(
    null
  )
  const [selectedAccLoading, setSelectedAccLoading] = useState<boolean | null>(
    true
  )
  const [isMinting, setIsMinting] = useState<boolean | null>(false)

  const fetchCurrentNft = async () => {
    setSelectedAccLoading(true)
    const { data }: any = await axios.post("/api/fetchnft", {
      address: selectedAccToMint,
    })
    setSelectedAccHasNft(data?.hasNft)
    setSelectedAccLoading(false)
  }

  useEffect(() => {
    ;(async () => {
      setSelectedAccLoading(true)
      const { data }: any = await axios.post("/api/fetchnft", {
        address: selectedAccToMint,
      })
      setSelectedAccHasNft(data?.hasNft)
      setSelectedAccLoading(false)
    })()
  }, [selectedAccToMint])

  useEffect(() => {
    ;(async () => {
      if (supabaseUser?.id) {
        setLoading(true)
        const {
          data: { inToronto },
        } = await axios.post("/api/is_in_toronto", {
          user_id: supabaseUser?.id,
        })
        setEligibleToMint(inToronto)
        setLoading(false)
      }
    })()
  }, [supabaseUser])

  const connectToWeb3Node = useCallback(
    async (address: string) => {
      const {
        data: { data: web3Data },
      } = await axios.post("/api/supabase/select", {
        table: "stamps",
        match: {
          uniquevalue: address,
        },
      })
      if (address && !web3Data?.[0]) {
        const dbUser = await getUser()
        const database = {
          uniquehash: await encode_data(address),
          stamptype: 14,
          created_by_user_id: dbUser?.id,
          unencrypted_unique_data: address,
          type_and_hash: `14 ${await encode_data(address)}`,
        }
        const dataToSet = {
          created_by_user_id: dbUser?.id,
          created_by_app: 29,
          stamptype: 14,
          uniquevalue: address,
          user_id_and_uniqueval: `${dbUser?.id} 14 ${address}`,
          unique_hash: await encode_data(address),
          stamp_json: { address },
          type_and_uniquehash: `14 ${await encode_data(address)}`,
        }
        await axios.post("/api/supabase/insert", {
          table: "uniquestamps",
          body: database,
        })
        const {
          data: { error, data },
        } = await axios.post("/api/supabase/insert", {
          table: "stamps",
          body: dataToSet,
        })
        if (data?.[0]?.id) {
          await axios.post("/api/supabase/insert", {
            table: "authorized_dapps",
            body: {
              dapp_id: 22,
              dapp_and_stamp_id: `22 ${data?.[0]?.id}`,
              stamp_id: data?.[0]?.id,
              can_read: true,
              can_update: true,
              can_delete: true,
            },
          })
        }
      }
    },
    [getUser]
  )

  const createAccount = async () => {
    try {
      var web3 = new Web3("http://localhost:8545") // your geth
      const newAccount = web3.eth.accounts.create()
      connectToWeb3Node(newAccount.address)
      const dbUser = await getUser()
      const { data } = await axios.post("/api/supabase/insert", {
        table: "evm_accounts",
        body: {
          private_key: newAccount.privateKey,
          address: newAccount.address,
          user_id: dbUser.id,
        },
      })
      setAccounts((d: any) => {
        const allAddress: any = {}
        d.map((item: any) => {
          allAddress[item] = true
        })
        allAddress[newAccount.address] = true
        return Object.keys(allAddress)
      })
      console.log("Private Key:", newAccount.privateKey)
    } catch (error) {
      console.error("Error creating account:", error)
    }
  }

  useEffect(() => {
    if (web3Address) {
      setAccounts((d: any) => {
        const allAddress: any = {}
        d.map((item: any) => {
          allAddress[item] = true
        })
        allAddress[web3Address] = true
        return Object.keys(allAddress)
      })
      connectToWeb3Node(web3Address)
    }
  }, [web3Address, connectToWeb3Node])

  useEffect(() => {
    ;(async () => {
      const dbUser = await getUser()
      const {
        data: { data },
      } = await axios.post("/api/supabase/select", {
        table: "stamps",
        match: { created_by_user_id: dbUser?.id, stamptype: 14 },
      })
      const {
        data: { data: addressList },
      } = await axios.post("/api/supabase/select", {
        table: "evm_accounts",
        match: {
          user_id: dbUser.id,
        },
      })
      const addresses = data.map((item: any) => item.uniquevalue)
      setAccounts((d: any) => {
        const allAddress: any = {}
        d.map((item: any) => {
          allAddress[item] = true
        })
        addresses.map((item: any) => {
          allAddress[item] = true
        })
        addressList.map((item: any) => {
          allAddress[item.address] = true
        })
        console.log({ allAddress })
        return Object.keys(allAddress)
      })
    })()
  }, [getUser])

  if (loading) {
    return (
      <div role="status">
        <svg
          aria-hidden="true"
          className="size-8 animate-spin fill-blue-600 text-gray-200"
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
    )
  }

  const mintToSelectAccounts = async (address: string) => {
    setIsMinting(true)
    await axios.post("/api/mintNft", {
      address,
    })
    setIsMinting(false)
  }

  const mintUI = () => {
    return (
      <div className="space-y-2 px-5">
        <div className="ml-auto w-[fit-content]">
          <button
            onClick={() => {
              if (!web3Address) {
                open()
              }
            }}
            className="rounded-lg bg-blue-700 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
          >
            {web3Address ? web3Address : " Connect Wallet"}
          </button>
        </div>
        <p className="text-xl">Proof of Membership NFT</p>
        <p>
          You can now mint your proof of your TDAO membership onto the Celo
          blockchain. Use it to vote on our snapshot proposals or just add it to
          your NFT collection.
        </p>
        {eligibleToMint ? (
          <div className="space-y-3">
            <p>Choose an Account to mint to:</p>
            <div className="w-[500px] rounded border p-3">
              <ul className="space-y-1 divide-y">
                {accounts.map((item: any, idx: number) => (
                  <li
                    onClick={() => {
                      setSelectedAccToMint(item)
                    }}
                    className={`p-2 text-xs ${
                      selectedAccToMint === item ? "font-bold" : ""
                    }`}
                    key={idx}
                  >
                    Account {idx + 1}. {item}
                  </li>
                ))}
                {accounts.length === 0 && (
                  <p className="text-red-500">**No Account**</p>
                )}
              </ul>
            </div>
            {selectedAccToMint && (
              <>
                {" "}
                {selectedAccHasNft ? (
                  <>
                    <p className="font-bold text-green-500">
                      Select account has a valid NFT
                    </p>
                  </>
                ) : (
                  <>
                    {isMinting ? (
                      <>
                        <div role="status">
                          <svg
                            aria-hidden="true"
                            className="w-8 h-8 text-gray-200 animate-spin dark:text-gray-600 fill-blue-600"
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
                    ) : (
                      <button
                        disabled={
                          accounts.length === 0 ||
                          selectedAccToMint === "" ||
                          selectedAccLoading === true
                        }
                        className={`rounded-lg ${
                          accounts.length !== 0 &&
                          selectedAccToMint !== "" &&
                          selectedAccLoading === false
                            ? "bg-blue-700"
                            : "bg-gray-400"
                        } px-5 py-2.5 text-sm font-medium text-white focus:outline-none focus:ring-4 focus:ring-blue-300 dark:focus:ring-blue-800`}
                        onClick={() => {
                          console.log("clicked")
                          mintToSelectAccounts(selectedAccToMint).then(() => {
                            fetchCurrentNft()
                          })
                        }}
                      >
                        {selectedAccLoading
                          ? "Loading"
                          : "Mint To Selected Account"}
                      </button>
                    )}
                  </>
                )}
              </>
            )}

            <div className="space-y-2">
              <p>Need to Add a Different Account?</p>
              <p>Connect a wallet (top right), or</p>
              <button
                onClick={() => {
                  createAccount()
                }}
                className="rounded-lg bg-blue-700 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
              >
                Create New Account
              </button>
              <p>
                We can create an account for you and mint directly to it in one
                go. You can export the account to a wallet later whenever you
                want to.
              </p>
            </div>
          </div>
        ) : (
          <>
            <p>
              Status : <span className="text-red-500">Not Eligible (yet)</span>
            </p>
            <p className="text-md">
              You need at least a score of 10 before you can become a member
            </p>
            <button
              type="button"
              className="mb-2 me-2 rounded-lg bg-blue-700 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
            >
              Increase my score
            </button>
          </>
        )}
      </div>
    )
  }

  const mintedUI = () => {
    return <></>
  }

  if (stepVal === 0) {
    return mintUI()
  }

  return (
    <>
      <div>{mintedUI()}</div>
    </>
  )
}
