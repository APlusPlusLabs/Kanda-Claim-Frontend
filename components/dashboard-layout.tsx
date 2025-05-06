"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Menu, X } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { LanguageSelector } from "./language-selector"
import { useLanguage } from "@/lib/language-context"

interface NavigationItem {
  name: string
  href: string
  icon: React.ReactNode | null
  translationKey?: string
}

interface User {
  name: string
  role: string
  avatar: string
}

interface DashboardLayoutProps {
  children: React.ReactNode
  user: User
  navigation: NavigationItem[]
}

export default function DashboardLayout({ children, user, navigation }: DashboardLayoutProps) {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()
  const { t } = useLanguage()

  // Helper function to safely get translation strings
  const getTranslation = (key?: string, fallback?: string): string => {
    if (!key) return fallback || ""

    try {
      const translation = t(key)
      // Check if translation is an object or a string
      if (typeof translation === "object") {
        console.warn(`Translation for key "${key}" returned an object instead of a string`)
        return fallback || key
      }
      return translation || fallback || key
    } catch (error) {
      console.warn(`Error translating key "${key}":`, error)
      return fallback || key
    }
  }

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-40 border-b bg-background">
        <div className="container flex h-16 items-center justify-between py-4">
          <div className="flex items-center gap-4 md:gap-8">
            <Sheet open={open} onOpenChange={setOpen}>
              <SheetTrigger asChild>
                <Button variant="outline" size="icon" className="md:hidden">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Toggle Menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-72">
                <div className="flex flex-col gap-4">
                  <div className="flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-2 font-semibold">
                      Kanda Claim
                    </Link>
                    <Button variant="ghost" size="icon" onClick={() => setOpen(false)}>
                      <X className="h-5 w-5" />
                      <span className="sr-only">Close Menu</span>
                    </Button>
                  </div>
                  <nav className="flex flex-col gap-2">
                    {navigation.map((item) => (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={cn(
                          "flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium",
                          pathname === item.href
                            ? "bg-primary text-primary-foreground"
                            : "hover:bg-muted hover:text-foreground",
                        )}
                        onClick={() => setOpen(false)}
                      >
                        {item.icon}
                        {item.translationKey ? getTranslation(item.translationKey, item.name) : item.name}
                      </Link>
                    ))}
                  </nav>
                  <div className="flex items-center gap-2">
                    <LanguageSelector />
                  </div>
                </div>
              </SheetContent>
            </Sheet>
            <Link href="/" className="flex items-center gap-2 font-semibold">
              Kanda Claim
            </Link>
          </div>
          <div className="flex items-center gap-4">
            <LanguageSelector />
            <div className="flex items-center gap-2">
              <Avatar className="h-8 w-8">
                <AvatarImage src={user.avatar || "/placeholder.svg"} alt={user.name} />
                <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <div className="hidden md:block">
                <div className="text-sm font-medium">{user.name}</div>
                <div className="text-xs text-muted-foreground">{user.role}</div>
              </div>
            </div>
          </div>
        </div>
      </header>
      <div className="flex flex-1">
        <aside className="hidden w-64 border-r md:block">
          <div className="flex h-full flex-col gap-4 p-4">
            <nav className="flex flex-col gap-2">
              {navigation.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium",
                    pathname === item.href
                      ? "bg-primary text-primary-foreground"
                      : "hover:bg-muted hover:text-foreground",
                  )}
                >
                  {item.icon}
                  {item.translationKey ? getTranslation(item.translationKey, item.name) : item.name}
                </Link>
              ))}
            </nav>
          </div>
        </aside>
        <main className="flex-1 p-4 md:p-6">{children}</main>
      </div>
    </div>
  )
}
