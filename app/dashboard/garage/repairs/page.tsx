import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import DashboardLayout from "@/components/dashboard-layout"
import { ClientWrapper } from "./client-wrapper"
import { FileText, MessageSquare, Bell, User, Home, Settings, PenToolIcon as Tool, Clipboard } from "lucide-react"

export default function GarageRepairsPage() {
  // Mock user data
  const user = {
    name: "Garage Admin",
    role: "Garage Manager",
    avatar: "/placeholder.svg?height=32&width=32",
  }

  // Navigation items for the garage dashboard
  const navigation = [
    {
      name: "Dashboard",
      href: "/dashboard/garage",
      icon: <Home className="h-4 w-4" />,
      translationKey: "dashboard",
    },
    {
      name: "Repairs",
      href: "/dashboard/garage/repairs",
      icon: <Tool className="h-4 w-4" />,
      translationKey: "repairs",
    },
    {
      name: "Bids",
      href: "/dashboard/garage/bids",
      icon: <Clipboard className="h-4 w-4" />,
      translationKey: "bids",
    },
    {
      name: "Schedule",
      href: "/dashboard/garage/schedule",
      icon: <FileText className="h-4 w-4" />,
      translationKey: "schedule",
    },
    {
      name: "Messages",
      href: "/dashboard/garage/messages",
      icon: <MessageSquare className="h-4 w-4" />,
      translationKey: "messages",
    },
    {
      name: "Notifications",
      href: "/dashboard/garage/notifications",
      icon: <Bell className="h-4 w-4" />,
      translationKey: "notifications",
    },
    {
      name: "Profile",
      href: "/dashboard/garage/profile",
      icon: <User className="h-4 w-4" />,
      translationKey: "profile",
    },
    {
      name: "Settings",
      href: "/dashboard/garage/settings",
      icon: <Settings className="h-4 w-4" />,
      translationKey: "settings",
    },
  ]

  return (
    <DashboardLayout user={user} navigation={navigation}>
      <div className="flex justify-between items-center mb-4">
        <Card>
          <CardHeader>
            <CardTitle>Garage Repairs</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Welcome to the Garage Repairs dashboard.</p>
            <p>Here's a list of repairs in your garage.</p>
          </CardContent>
        </Card>
        {/* <Button asChild>
          <Link href="/dashboard/garage/repairs/create">Create Repair</Link>
        </Button> */}
      </div>

      {/* The client component will be rendered here */}
      <ClientWrapper />
    </DashboardLayout>
  )
}
