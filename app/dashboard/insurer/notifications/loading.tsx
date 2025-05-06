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
          <Skeleton className="h-10 w-48" />
          <Skeleton className="h-10 w-32" />
        </div>

        <Skeleton className="h-10 w-full max-w-md" />

        <div className="space-y-4">
          {Array(5)
            .fill(0)
            .map((_, i) => (
              <Skeleton key={i} className="h-24 w-full" />
            ))}
        </div>
      </div>
    </DashboardLayout>
  )
}
