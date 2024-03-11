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

export const ShowUserInfo = ({ data, open, onClose }: any) => {
  return (
    <>
      <Sheet open={open} onOpenChange={onClose}>
        <SheetContent className="w-[400px] sm:w-[540px]">
          <SheetHeader>
            <SheetTitle>{data?.username}</SheetTitle>
          </SheetHeader>
          <div>
            <label
              htmlFor="username"
              className="text-md block font-medium dark:text-gray-100"
            >
              About Me
            </label>
            <div className="flex items-center">
              <p>{data?.introduce??`About me is Empty for ${data?.username} :)`}</p>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </>
  )
}
