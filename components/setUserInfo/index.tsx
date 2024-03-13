import React, { useEffect } from "react"

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"

import { UserProfileForm } from "./userForm"

export const SetUserInfo = ({ open, onClose, fetchUser }: any) => {
  // useEffect(() => {
  //   if (open) {
  //     setTimeout(() => {
  //       // Select the SVG element using a query that matches its attributes
  //       // This is a basic example; you might need a more specific selector
  //       const svgCross: any = document.querySelector(
  //         'svg[fill="none"][stroke="currentColor"]'
  //       )

  //       if (svgCross) {
  //         // Remove the SVG element from its parent
  //         svgCross.parentNode.removeChild(svgCross)
  //       }
  //     }, 3000)
  //   }
  // }, [open])
  return (
    <div className="p-3">
      <p className="text-xl font-bold">Welcome to Toronto DAO</p>
      <UserProfileForm fetchUser={fetchUser} />
    </div>
  )
}
