import { useCallback, useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import axios from "axios"
import firebase from "lib/firebase"
import { useDispatch } from "react-redux"

import { login, logout } from "../redux/userSlice"

type hookProps =
  | {
      appId?: number
    }
  | undefined

export const useAuth = (appHookProps: hookProps) => {
  const appId = appHookProps?.appId
  const [loading, setLoading] = useState(true)
  const dispatch = useDispatch()
  const searchParams: any = useSearchParams()
  const [user, setUser] = useState<any>(null)
  const [supabaseUser, setSupabaseUser] = useState<any>(null)

  useEffect(() => {
    const unsubscribe = firebase.auth().onAuthStateChanged((user) => {
      if (user) {
        const setUserData = {
          id: user.uid,
          avatar: user.photoURL,
          email: user.email,
          name: user.displayName || user.email,
        }
        localStorage.setItem("email", user.email ?? "")
        localStorage.removeItem("unauthenticated_user")
        setUser(setUserData)
        dispatch(login(setUserData as any)) // if a user is found, set user in Redux store
      } else {
        setUser(null)
        localStorage.setItem("unauthenticated_user", "true")
        localStorage.removeItem("email")
        dispatch(logout())
      }
    })

    return () => unsubscribe()
  }, [dispatch])

  const getUser = useCallback(async () => {
    if (!localStorage.getItem("unauthenticated_user")) {
      const {
        data: { data: dbData },
      } = await axios.post("/api/supabase/select", {
        table: "users",
        match: {
          email: localStorage.getItem("email"),
        },
      })
      return dbData?.[0]
    } else {
      if (appId) {
        if (
          typeof localStorage.getItem("unauthenticated_user_db") === "string" &&
          localStorage.getItem("unauthenticated_user_db") !== "undefined"
        ) {
          return JSON.parse(
            localStorage.getItem("unauthenticated_user_db") as any
          )
        } else {
          const {
            data: { data, error },
          } = await axios.post(`api/supabase/insert`, {
            table: "users",
            body: {
              is_3rd_party: true,
              created_by_app: 29,
              email: searchParams.get("email"),
            },
          })
          if (error) {
            const {
              data: { data: data2, error },
            } = await axios.post(`api/supabase/select`, {
              table: "users",
              match: {
                email: searchParams.get("email"),
              },
            })
            localStorage.setItem(
              "unauthenticated_user_db",
              JSON.stringify(data2?.[0])
            )
            return data2?.[0]
          } else if (data?.[0]) {
            localStorage.setItem(
              "unauthenticated_user_db",
              JSON.stringify(data?.[0])
            )
          }

          return data?.[0] ?? localStorage.getItem("unauthenticated_user_db")
            ? JSON.parse(localStorage.getItem("unauthenticated_user_db") as any)
            : {}
        }
      }
    }
  }, [appId, searchParams])

  const fetchUser = useCallback(async () => {
    const {
      data: { data: dbData },
    } = await axios.post("/api/supabase/select", {
      table: "users",
      match: {
        email: localStorage.getItem("email") ?? user?.email,
      },
    })
    const {
      data: { data: dappData },
    } = await axios.post("/api/supabase/select", {
      table: "dapp_users",
      match: {
        user_id: dbData?.[0]?.id,
      },
    })
    setSupabaseUser({
      ...dbData?.[0],
      username: dappData?.[0]?.username,
      user_data: dappData?.[0]?.user_data,
    })
    setLoading(false)

  }, [user?.email])

  useEffect(() => {
    fetchUser()
  }, [fetchUser])

  return { loading, user, supabaseUser, getUser, fetchUser }
}

export default useAuth
