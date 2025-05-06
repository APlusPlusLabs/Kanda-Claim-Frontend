"use client"

import { createContext, useState, useEffect, type ReactNode } from "react"

interface User {
  id: string
  firstName: string
  lastName: string
  email: string
  role: "driver" | "garage" | "assessor" | "insurer"
}

interface AuthContextType {
  user: User | null
  login: (email: string, password: string, role: string) => Promise<void>
  register: (userData: any) => Promise<void>
  logout: () => void
  isLoading: boolean
}

export const AuthContext = createContext<AuthContextType>({
  user: null,
  login: async () => {},
  register: async () => {},
  logout: () => {},
  isLoading: true,
})

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    // Check if user is logged in from localStorage
    try {
      const storedUser = localStorage.getItem("user")
      if (storedUser) {
        setUser(JSON.parse(storedUser))
      }
    } catch (error) {
      console.error("Error loading user from localStorage:", error)
    }
    setIsLoading(false)
  }, [])

  const login = async (email: string, password: string, role: string) => {
    // In a real app, this would call an API endpoint
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // Mock user data
    const mockUser = {
      id: "user_" + Math.random().toString(36).substr(2, 9),
      firstName:
        role === "driver" ? "Mugisha" : role === "garage" ? "Kigali Auto" : role === "assessor" ? "Habimana" : "Sanlam",
      lastName: role === "driver" ? "Nkusi" : role === "garage" ? "Services" : role === "assessor" ? "Jean" : "Rwanda",
      email,
      role: role as "driver" | "garage" | "assessor" | "insurer",
    }

    setUser(mockUser)
    if (typeof window !== "undefined") {
      localStorage.setItem("user", JSON.stringify(mockUser))
    }
  }

  const register = async (userData: any) => {
    // In a real app, this would call an API endpoint
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // Mock user registration
    const mockUser = {
      id: "user_" + Math.random().toString(36).substr(2, 9),
      firstName: userData.firstName,
      lastName: userData.lastName,
      email: userData.email,
      role: userData.role as "driver" | "garage" | "assessor" | "insurer",
    }

    // In a real app, we would not automatically log in the user after registration
    // but for demo purposes, we'll do it here
    setUser(mockUser)
    if (typeof window !== "undefined") {
      localStorage.setItem("user", JSON.stringify(mockUser))
    }
  }

  const logout = () => {
    setUser(null)
    if (typeof window !== "undefined") {
      localStorage.removeItem("user")
    }
  }

  // Provide a stable value to prevent unnecessary re-renders
  const value = {
    user,
    login,
    register,
    logout,
    isLoading,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
