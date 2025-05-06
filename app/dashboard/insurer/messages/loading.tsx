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
      <div className="h-[calc(100vh-120px)] flex flex-col">
        <Skeleton className="h-10 w-48 mb-6" />

        <div className="flex-1 flex overflow-hidden border rounded-lg">
          <div className="w-1/3 border-r flex flex-col">
            <div className="p-4 border-b">
              <Skeleton className="h-10 w-full" />
            </div>

            <div className="p-4">
              <Skeleton className="h-10 w-full mb-4" />
              <div className="space-y-4">
                {Array(5)
                  .fill(0)
                  .map((_, i) => (
                    <div key={i} className="flex items-start space-x-3">
                      <Skeleton className="h-10 w-10 rounded-full" />
                      <div className="flex-1">
                        <Skeleton className="h-4 w-3/4 mb-2" />
                        <Skeleton className="h-3 w-full" />
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>

          <div className="w-2/3 flex items-center justify-center">
            <div className="text-center">
              <Skeleton className="h-12 w-12 rounded-full mx-auto mb-4" />
              <Skeleton className="h-6 w-48 mx-auto mb-2" />
              <Skeleton className="h-4 w-64 mx-auto" />
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
