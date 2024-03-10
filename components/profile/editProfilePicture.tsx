// @ts-nocheck
import React, { useCallback, useState } from "react"
import axios from "axios"
import _ from "lodash"
import { toast } from "react-toastify"

import { supabase } from "@/lib/supabase"
import useAuth from "@/hooks/useAuth"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"

export const EditProfilePicture = ({ fetchUser,open,onClose }: any) => {
  const [profilePic, setProfilePic] = useState("")
  const { supabaseUser } = useAuth({})
  const [uploadingProfile, setUploadingProfile] = useState(false)
  return (
    <>
      <Sheet open={open} onOpenChange={onClose}>
        <SheetContent className="w-[400px] sm:w-[540px]">
          <SheetHeader>
            <SheetTitle>Update Profile Picture</SheetTitle>
          </SheetHeader>
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
              onChange={async (e: any) => {
                setUploadingProfile(true)
                const file = e.target.files[0]
                const fileToBlob = async (files: any) =>
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
                toast.success("Profile Picture successsfully updated")
                setTimeout(() => {
                  window.location.reload()
                }, 3000)
              }}
              className="mt-1 block w-full rounded-md border border-gray-600 px-3 py-2 shadow-sm dark:bg-black dark:text-white sm:text-sm"
            />
            {uploadingProfile && (
              <>
                <p className="animate-pulse">Uploading your profile pic</p>
              </>
            )}
          </div>
        </SheetContent>
      </Sheet>
    </>
  )
}
