"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { useToast } from "@/components/ui/use-toast"
import { useAuth } from "@/lib/auth-provider"


export default function LogoutPage() {
  const router = useRouter()
  const { toast } = useToast()
  const { user, logout } = useAuth()
  if (user) {
    logout
    router.push('/')
  } else { router.push('login') }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">

    </div>
  )
}
