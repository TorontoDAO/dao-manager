import React, { useEffect } from "react"

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"

import { UserProfileForm } from "./userForm"

export const SetUserInfo = ({ open, onClose, fetchUser }: any) => {
  useEffect(() => {
    setTimeout(() => {
      // Select the SVG element using a query that matches its attributes
      // This is a basic example; you might need a more specific selector
      const svgCross: any = document.querySelector(
        'svg[fill="none"][stroke="currentColor"]'
      )

      if (svgCross) {
        // Remove the SVG element from its parent
        svgCross.parentNode.removeChild(svgCross)
      }
    }, 1000)
  }, [])
  return (
    <Sheet
      open={open}
      onOpenChange={(value) => {
        if (value === false) {
          onClose()
        }
      }}
    >
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Welcome to Toronto DAO</SheetTitle>
          <p>
            It looks like you are new here. To sign up we ask that you provide a
            username, a profile picture and an approximate location. This
            information will be made public to other members
          </p>
          <UserProfileForm fetchUser={fetchUser} />
        </SheetHeader>
      </SheetContent>
    </Sheet>
  )
}
