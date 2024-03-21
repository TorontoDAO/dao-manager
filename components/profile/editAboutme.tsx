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

export const EditAboutMe = ({ fetchUser, open, onClose }: any) => {
  const [editAboutMe, setEdtAboutMe] = useState("")

  const { supabaseUser } = useAuth({});

  return (
    <>
      <Sheet open={open} onOpenChange={onClose}>
        <SheetContent className="w-[400px] sm:w-[540px]">
          <SheetHeader>
            <SheetTitle>Update About Me</SheetTitle>
          </SheetHeader>
          <div>
            <label
              htmlFor="username"
              className="text-md block font-medium dark:text-gray-100"
            >
              About Me
            </label>
            <div className="flex items-center">
              <textarea
                id="username"
                type="text"
                value={editAboutMe}
                onChange={(e) => {
                  setEdtAboutMe(e.target.value)
                }}
                className="mt-1 block w-full rounded-md border border-gray-600 px-3 py-2 shadow-sm dark:bg-black dark:text-white sm:text-sm"
              />
            </div>
            <button
              className={`mt-3 w-full rounded-md bg-blue-500 px-4 py-2 text-white`}
              onClick={async () => {
                const {
                  data: { data },
                } = await axios.post("/api/supabase/select", {
                  table: "dapp_users",
                  match: { user_id: supabaseUser?.id },
                })
                await axios.post("/api/supabase/update", {
                  table: "dapp_users",
                  match: { user_id: supabaseUser?.id },
                  body: {
                    user_data: {
                      ...data?.[0]?.user_data,
                      introduce: editAboutMe,
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
