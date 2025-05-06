import { Skeleton } from "@/components/ui/skeleton"
import DashboardLayout from "@/components/dashboard-layout"
import { Building2, FileText, MessageSquare, Bell, User, LogOut } from "lucide-react"

export default function Loading() {
  return (
    <DashboardLayout
      user={{
        name: "Loading...",
        role: "Insurance Company",
        avatar: "/placeholder.svg?height=40&width=40",
      }}
      navigation={[
        { name: "Dashboard", href: "/dashboard/insurer", icon: <Building2 className="h-5 w-5" /> },
        { name: "Claims", href: "/dashboard/insurer/claims", icon: <FileText className="h-5 w-5" /> },
        { name: "Messages", href: "/dashboard/insurer/messages", icon: <MessageSquare className="h-5 w-5" /> },
        { name: "Notifications", href: "/dashboard/insurer/notifications", icon: <Bell className="h-5 w-5" /> },
        { name: "Profile", href: "/dashboard/insurer/profile", icon: <User className="h-5 w-5" /> },
      ]}
      actions={[{ name: "Logout", href: "/logout", icon: <LogOut className="h-5 w-5" /> }]}
    >
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Skeleton className="h-10 w-10" />
            <Skeleton className="h-10 w-48" />
            <Skeleton className="h-6 w-24" />
          </div>
          <div className="flex space-x-2">
            <Skeleton className="h-10 w-24" />
            <Skeleton className="h-10 w-24" />
            <Skeleton className="h-10 w-32" />
          </div>
        </div>

        <Skeleton className="h-6 w-full max-w-xl" />

        <Skeleton className="h-10 w-full max-w-md" />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Skeleton className="h-[300px]" />
          <Skeleton className="h-[300px]" />
        </div>

        <Skeleton className="h-[200px]" />
      </div>
    </DashboardLayout>
  )
}
