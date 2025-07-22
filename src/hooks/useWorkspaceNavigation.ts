"use client"

import { useState, useEffect } from "react"
import { WORKSPACE_ITEMS } from "@/lib/constants"

export const useWorkspaceNavigation = () => {
  const [tabActive, setTabActive] = useState("overview")

  useEffect(() => {
    const handleHashChange = () => {
      const newHash = window.location.hash.replace("#", "")
      if (newHash && WORKSPACE_ITEMS.some((i) => i.value === newHash)) {
        setTabActive(newHash)
        window.scrollTo(0, 0)
      }
    }

    window.addEventListener("hashchange", handleHashChange)
    handleHashChange()

    return () => {
      window.removeEventListener("hashchange", handleHashChange)
    }
  }, [])

  const handleTabChange = (value: string) => {
    setTabActive(value)
    window.location.hash = value
  }

  return { tabActive, handleTabChange }
}
