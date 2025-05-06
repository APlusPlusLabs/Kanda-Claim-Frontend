import { Skeleton } from "@/components/ui/skeleton"
import DashboardLayout from "@/components/dashboard-layout"
import { Car, FileText } from "lucide-react"

export default function Loading() {
  return (
    <DashboardLayout
      user={{
        name: "Loading...",
        role: "Driver",
        avatar: "/placeholder.svg?height=40&width=40",
      }}
      navigation={[
        { name: "Dashboard", href: "/dashboard/driver", icon: <Car className="h-5 w-5" /> },
        { name: "My Claims", href: "/dashboard/driver/claims", icon: <FileText className="h-5 w-5" /> },
      ]}
    >
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Skeleton className="h-10 w-10" />
            <Skeleton className="h-10 w-48" />
            <Skeleton className="h-6 w-24" />
          </div>
          <div className="flex space-x-2">
            <Skeleton className="h-10 w-32" />
            <Skeleton className="h-10 w-32" />
          </div>
        </div>

        <Skeleton className="h-[600px] w-full" />
      </div>
    </DashboardLayout>
  )
}
