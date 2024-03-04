import React, { useEffect } from "react"

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"

import { UserProfileForm } from "./userForm"

export const SetUserInfo = ({ open, onClose,fetchUser }: any) => {
  useEffect(() => {
    setTimeout(() => {
      // Select the SVG element using a query that matches its attributes
      // This is a basic example; you might need a more specific selector
      const svgCross:any = document.querySelector(
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
          <SheetTitle>Enter User Info</SheetTitle>
          <UserProfileForm fetchUser={fetchUser} />
        </SheetHeader>
      </SheetContent>
    </Sheet>
  )
}
